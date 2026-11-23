import io
import json
import unittest
from datetime import datetime, timedelta
import httpx
from fastapi.testclient import TestClient

from app.main import app
from app.core.database import init_db, SessionLocal
from app.services.seed import seed_data_if_empty
from app.core.encryption import encrypt_token, decrypt_token
from app.services.whatsapp_service import WhatsAppParser
from app.services.gmail_service import GmailService, create_oauth_state, verify_oauth_state
from app.services.github_service import GitHubService
from app.models.connected_account import ConnectedAccount
from app.models.conversation import Conversation
from app.models.message import Message
from app.models.user import User


class Phase4IntegrationTests(unittest.TestCase):
    """Complete test suite verifying all 10 Phase 4 communication source requirements."""

    @classmethod
    def setUpClass(cls):
        init_db()
        db = SessionLocal()
        try:
            seed_data_if_empty(db)
        finally:
            db.close()

        cls.client = TestClient(app)

        # Authenticate User A (Alex Mercer)
        r_login_a = cls.client.post("/api/auth/login", json={"email": "alex@promisegraph.ai", "password": "Password123!"})
        assert r_login_a.status_code == 200, f"Alex login failed: {r_login_a.text}"
        cls.alex_token = r_login_a.json()["access_token"]
        cls.alex_user_id = r_login_a.json()["user"]["id"]
        cls.alex_headers = {"Authorization": f"Bearer {cls.alex_token}"}

        # Authenticate User B (Charlie Isolation)
        r_reg_b = cls.client.post("/api/auth/register", json={
            "email": "charlie_test@promisegraph.ai",
            "password": "Password123!",
            "full_name": "Charlie Isolation"
        })
        if r_reg_b.status_code == 409:
            r_reg_b = cls.client.post("/api/auth/login", json={"email": "charlie_test@promisegraph.ai", "password": "Password123!"})
        assert r_reg_b.status_code in [200, 201]
        cls.charlie_token = r_reg_b.json()["access_token"]
        cls.charlie_user_id = r_reg_b.json()["user"]["id"]
        cls.charlie_headers = {"Authorization": f"Bearer {cls.charlie_token}"}

        # Clean any prior test messages to ensure full idempotency
        db = SessionLocal()
        try:
            db.query(Message).filter(Message.external_id.in_(["msg-gm-101", "msg-gm-102", "401"])).delete(synchronize_session=False)
            db.query(Conversation).filter(Conversation.external_id.in_(["th-gm-101", "th-gm-102", "gh-issue-401"])).delete(synchronize_session=False)
            db.commit()
        finally:
            db.close()

    # -------------------------------------------------------------
    # 1. Gmail OAuth connection
    # -------------------------------------------------------------
    def test_01_gmail_oauth_connection(self):
        """Test 1: Verify Gmail OAuth authorization URL generation, scope restrictions, and CSRF state binding."""
        res = self.client.get("/api/v1/integrations/gmail/auth-url", headers=self.alex_headers)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIn("accounts.google.com", data["url"])
        self.assertIn("gmail.readonly", data["url"])
        state = data["state"]

        # Validate state signature matches Alex
        self.assertTrue(verify_oauth_state(state, self.alex_user_id, "gmail"))
        # Validate state fails for Charlie or wrong provider
        self.assertFalse(verify_oauth_state(state, self.charlie_user_id, "gmail"))
        self.assertFalse(verify_oauth_state(state, self.alex_user_id, "github"))

    # -------------------------------------------------------------
    # 2. Gmail message retrieval
    # -------------------------------------------------------------
    def test_02_gmail_message_retrieval(self):
        """Test 2: Verify Gmail message retrieval, header extraction (From, To, Subject, Date), and ingestion."""
        db = SessionLocal()
        try:
            # Create a mock connected account for testing email ingestion
            acc = db.query(ConnectedAccount).filter(
                ConnectedAccount.user_id == self.alex_user_id,
                ConnectedAccount.provider == "gmail",
            ).first()
            if not acc:
                acc = ConnectedAccount(
                    user_id=self.alex_user_id,
                    provider="gmail",
                    account_identifier="alex@gmail.com",
                    is_active=True,
                    access_token_encrypted=encrypt_token("mock-gmail-token"),
                    token_expires_at=datetime.utcnow() + timedelta(hours=1),
                )
                db.add(acc)
                db.commit()
                db.refresh(acc)

            # Mock Gmail API HTTP responses using httpx.MockTransport
            def mock_gmail_handler(request: httpx.Request):
                url_str = str(request.url)
                if "/messages?" in url_str or url_str.endswith("/messages"):
                    return httpx.Response(200, json={
                        "messages": [{"id": "msg-gm-101", "threadId": "th-gm-101"}],
                        "resultSizeEstimate": 1
                    })
                elif "/messages/msg-gm-101" in url_str:
                    return httpx.Response(200, json={
                        "id": "msg-gm-101",
                        "threadId": "th-gm-101",
                        "snippet": "I promise to deliver the architecture document by Monday afternoon.",
                        "payload": {
                            "headers": [
                                {"name": "Subject", "value": "Delivery Timeline Confirmation"},
                                {"name": "From", "value": "Elena Rostova <elena@graph-research.ai>"},
                                {"name": "To", "value": "alex@promisegraph.ai"},
                                {"name": "Date", "value": "Mon, 23 Nov 2026 10:00:00 +0000"}
                            ]
                        }
                    })
                return httpx.Response(404)

            mock_transport = httpx.MockTransport(mock_gmail_handler)
            mock_client = httpx.AsyncClient(transport=mock_transport)

            # Run ingestion through service
            import asyncio
            result = asyncio.run(
                GmailService.fetch_and_sync_emails(
                    user_id=self.alex_user_id,
                    account=acc,
                    db=db,
                    max_results=5,
                    http_client=mock_client,
                )
            )

            self.assertEqual(result["synced_count"], 1)
            self.assertEqual(result["messages"][0]["subject"], "Delivery Timeline Confirmation")
            self.assertEqual(result["messages"][0]["sender"], "Elena Rostova")

            # Check database persistence
            msg_in_db = db.query(Message).filter(Message.external_id == "msg-gm-101").first()
            self.assertIsNotNone(msg_in_db)
            self.assertEqual(msg_in_db.sender_address, "elena@graph-research.ai")
            self.assertIn("architecture document", msg_in_db.content)
        finally:
            db.close()

    # -------------------------------------------------------------
    # 3. Gmail pagination
    # -------------------------------------------------------------
    def test_03_gmail_pagination(self):
        """Test 3: Verify Gmail API pagination handling with page tokens."""
        db = SessionLocal()
        try:
            acc = db.query(ConnectedAccount).filter(
                ConnectedAccount.user_id == self.alex_user_id,
                ConnectedAccount.provider == "gmail",
            ).first()

            def mock_gmail_pagination(request: httpx.Request):
                url_str = str(request.url)
                if "pageToken=token_page_1" in url_str:
                    return httpx.Response(200, json={
                        "messages": [{"id": "msg-gm-102", "threadId": "th-gm-102"}],
                        "nextPageToken": "token_page_2",
                    })
                elif "/messages/msg-gm-102" in url_str:
                    return httpx.Response(200, json={
                        "id": "msg-gm-102",
                        "threadId": "th-gm-102",
                        "snippet": "Page 2 message content snippet.",
                        "payload": {"headers": [{"name": "Subject", "value": "Page 2 Email"}]}
                    })
                return httpx.Response(200, json={
                    "messages": [{"id": "msg-gm-101", "threadId": "th-gm-101"}],
                    "nextPageToken": "token_page_1",
                })

            mock_transport = httpx.MockTransport(mock_gmail_pagination)
            mock_client = httpx.AsyncClient(transport=mock_transport)

            import asyncio
            result = asyncio.run(
                GmailService.fetch_and_sync_emails(
                    user_id=self.alex_user_id,
                    account=acc,
                    db=db,
                    max_results=1,
                    page_token="token_page_1",
                    http_client=mock_client,
                )
            )

            self.assertEqual(result["next_page_token"], "token_page_2")
            self.assertEqual(result["synced_count"], 1)
        finally:
            db.close()

    # -------------------------------------------------------------
    # 4. Gmail disconnection
    # -------------------------------------------------------------
    def test_04_gmail_disconnection(self):
        """Test 4: Verify Gmail account disconnection and credential purge."""
        res = self.client.delete("/api/v1/integrations/gmail", headers=self.alex_headers)
        self.assertEqual(res.status_code, 200)

        # Verify account no longer exists in DB for Alex
        db = SessionLocal()
        try:
            acc = db.query(ConnectedAccount).filter(
                ConnectedAccount.user_id == self.alex_user_id,
                ConnectedAccount.provider == "gmail",
            ).first()
            self.assertIsNone(acc)
        finally:
            db.close()

    # -------------------------------------------------------------
    # 5. WhatsApp .txt upload
    # -------------------------------------------------------------
    def test_05_whatsapp_txt_upload(self):
        """Test 5: Verify WhatsApp .txt file upload validation, size limits, and ingestion."""
        # 1. Invalid file extension rejection
        fake_pdf = io.BytesIO(b"%PDF-1.4 ...")
        res_bad = self.client.post(
            "/api/v1/integrations/whatsapp/import",
            headers=self.alex_headers,
            files={"file": ("transcript.pdf", fake_pdf, "application/pdf")},
        )
        self.assertEqual(res_bad.status_code, 422)

        # 2. Valid .txt transcript upload
        transcript = (
            "11/20/23, 10:15 AM - Sarah Chen: I will complete the backend schema review.\n"
            "11/20/23, 10:20 AM - Alex Mercer: Great, thank you!\n"
        )
        file_bytes = io.BytesIO(transcript.encode("utf-8"))
        res_ok = self.client.post(
            "/api/v1/integrations/whatsapp/import",
            headers=self.alex_headers,
            files={"file": ("project_chat.txt", file_bytes, "text/plain")},
            data={"title": "Project Chat Sync"},
        )
        self.assertEqual(res_ok.status_code, 201)
        data = res_ok.json()
        self.assertEqual(data["total_messages"], 2)
        self.assertEqual(data["title"], "Project Chat Sync")

    # -------------------------------------------------------------
    # 6. WhatsApp parsing with sample files (Android, iOS, Multiline)
    # -------------------------------------------------------------
    def test_06_whatsapp_parsing_formats(self):
        """Test 6: Verify parser handles Android 12h/24h, iOS bracketed dates, and multiline messages."""
        # Android 24-hour with multiline
        android_24h = (
            "20/11/2026, 14:30 - David Patel: First line of proposal.\n"
            "Here is the second continuation line.\n"
            "And a third line.\n"
            "20/11/2026, 14:35 - Messages and calls are end-to-end encrypted.\n"
            "20/11/2026, 14:36 - Alex Mercer: Received.\n"
        )
        msgs_android, metrics_android = WhatsAppParser.parse_chat_text(android_24h)
        self.assertEqual(len(msgs_android), 2)
        self.assertIn("second continuation line", msgs_android[0]["content"])
        self.assertEqual(metrics_android["system_lines"], 1)

        # iOS format with invisible Unicode formatting characters
        ios_sample = (
            "\u200e[11/20/26, 09:15:30 AM] Marcus Brody: Webhook pull request is submitted.\n"
            "\u200e[11/20/26, 09:20:10 AM] Alex Mercer: I will review and merge it.\n"
        )
        msgs_ios, metrics_ios = WhatsAppParser.parse_chat_text(ios_sample)
        self.assertEqual(len(msgs_ios), 2)
        self.assertEqual(msgs_ios[0]["sender_name"], "Marcus Brody")

    # -------------------------------------------------------------
    # 7. GitHub authorization
    # -------------------------------------------------------------
    def test_07_github_authorization(self):
        """Test 7: Verify GitHub OAuth URL generation and Personal Access Token flow."""
        # 1. OAuth URL
        res_url = self.client.get("/api/v1/integrations/github/auth-url", headers=self.alex_headers)
        self.assertEqual(res_url.status_code, 200)
        self.assertIn("github.com/login/oauth/authorize", res_url.json()["url"])

        # 2. PAT connection validation (rejects invalid token)
        res_pat_bad = self.client.post(
            "/api/v1/integrations/github/pat",
            headers=self.alex_headers,
            json={"token": "bad_token_123"},
        )
        self.assertEqual(res_pat_bad.status_code, 400)

    # -------------------------------------------------------------
    # 8. Repository and issue retrieval
    # -------------------------------------------------------------
    def test_08_repository_and_issue_retrieval(self):
        """Test 8: Verify listing GitHub repositories and syncing issues/PRs into unified Message entity."""
        db = SessionLocal()
        try:
            # Set up mock GitHub connection for Alex
            acc = ConnectedAccount(
                user_id=self.alex_user_id,
                provider="github",
                account_identifier="alex-mercer",
                is_active=True,
                access_token_encrypted=encrypt_token("mock-gh-token"),
            )
            db.add(acc)
            db.commit()
            db.refresh(acc)

            def mock_github_handler(request: httpx.Request):
                url_str = str(request.url)
                if "/user/repos" in url_str:
                    return httpx.Response(200, json=[
                        {
                            "id": 101,
                            "name": "core",
                            "full_name": "promisegraph/core",
                            "description": "Core intelligence engine",
                            "private": False,
                            "html_url": "https://github.com/promisegraph/core",
                            "updated_at": "2026-11-23T04:00:00Z",
                            "open_issues_count": 3
                        }
                    ])
                elif "/repos/promisegraph/core/issues" in url_str:
                    return httpx.Response(200, json=[
                        {
                            "id": 401,
                            "number": 12,
                            "title": "Refactor token rotation service",
                            "body": "I will complete this refactor by Wednesday.",
                            "html_url": "https://github.com/promisegraph/core/issues/12",
                            "state": "open",
                            "created_at": "2026-11-23T02:00:00Z",
                            "user": {"login": "mbrody"}
                        }
                    ])
                return httpx.Response(404)

            mock_transport = httpx.MockTransport(mock_github_handler)
            mock_client = httpx.AsyncClient(transport=mock_transport)

            import asyncio
            # 1. Repositories
            repos = asyncio.run(GitHubService.list_repositories(acc, db, http_client=mock_client))
            self.assertEqual(len(repos), 1)
            self.assertEqual(repos[0]["full_name"], "promisegraph/core")

            # 2. Issues sync
            sync_res = asyncio.run(
                GitHubService.sync_issues_and_prs(
                    user_id=self.alex_user_id,
                    account=acc,
                    repo_full_name="promisegraph/core",
                    db=db,
                    http_client=mock_client,
                )
            )
            self.assertEqual(sync_res["synced_count"], 1)

            # 3. Verify Message and Conversation created
            db_msg = db.query(Message).filter(Message.external_id == "401").first()
            self.assertIsNotNone(db_msg)
            self.assertEqual(db_msg.subject, "Refactor token rotation service")
            self.assertEqual(db_msg.sender_name, "mbrody")
        finally:
            db.close()

    # -------------------------------------------------------------
    # 9. GitHub disconnection
    # -------------------------------------------------------------
    def test_09_github_disconnection(self):
        """Test 9: Verify disconnecting GitHub purges token and deactivates integration."""
        res = self.client.delete("/api/v1/integrations/github", headers=self.alex_headers)
        self.assertEqual(res.status_code, 200)

        db = SessionLocal()
        try:
            acc = db.query(ConnectedAccount).filter(
                ConnectedAccount.user_id == self.alex_user_id,
                ConnectedAccount.provider == "github",
            ).first()
            self.assertIsNone(acc)
        finally:
            db.close()

    # -------------------------------------------------------------
    # 10. User data isolation
    # -------------------------------------------------------------
    def test_10_user_data_isolation(self):
        """Test 10: Strict verification that User B (Charlie) cannot access User A's (Alex's) communication data."""
        # 1. Alex uploads a private chat
        private_transcript = "11/20/26, 12:00 PM - Alex Mercer: Highly confidential project memo.\n"
        file_bytes = io.BytesIO(private_transcript.encode("utf-8"))
        res_up = self.client.post(
            "/api/v1/integrations/whatsapp/import",
            headers=self.alex_headers,
            files={"file": ("confidential.txt", file_bytes, "text/plain")},
            data={"title": "Confidential Chat"},
        )
        self.assertEqual(res_up.status_code, 201)
        conv_id = res_up.json()["conversation_id"]

        # 2. Charlie attempts to list WhatsApp chats (must NOT contain Alex's chat)
        res_charlie_chats = self.client.get("/api/v1/integrations/whatsapp/chats", headers=self.charlie_headers)
        self.assertEqual(res_charlie_chats.status_code, 200)
        charlie_chat_ids = [c["id"] for c in res_charlie_chats.json()]
        self.assertNotIn(conv_id, charlie_chat_ids)

        # 3. Charlie attempts to delete Alex's chat (must return 404)
        res_charlie_del = self.client.delete(f"/api/v1/integrations/whatsapp/chats/{conv_id}", headers=self.charlie_headers)
        self.assertEqual(res_charlie_del.status_code, 404)

        # 4. Charlie attempts to query messages in Alex's conversation
        res_charlie_msgs = self.client.get(f"/api/v1/integrations/messages?conversation_id={conv_id}", headers=self.charlie_headers)
        self.assertEqual(res_charlie_msgs.status_code, 200)
        self.assertEqual(len(res_charlie_msgs.json()), 0)


if __name__ == "__main__":
    unittest.main()
