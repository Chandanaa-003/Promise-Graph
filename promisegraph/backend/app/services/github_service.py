import logging
from datetime import datetime
from typing import Dict, Any, List, Optional
import httpx
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.encryption import encrypt_token, decrypt_token
from app.models.connected_account import ConnectedAccount
from app.models.conversation import Conversation
from app.models.message import Message
from app.services.gmail_service import create_oauth_state, verify_oauth_state

logger = logging.getLogger(__name__)

GITHUB_AUTH_URL = "https://github.com/login/oauth/authorize"
GITHUB_TOKEN_URL = "https://github.com/login/oauth/access_token"
GITHUB_API_BASE = "https://api.github.com"


class GitHubService:
    """Official GitHub API integration service for repositories, issues, and discussions."""

    @classmethod
    def get_authorization_url(cls, user_id: str) -> Dict[str, str]:
        """Generate GitHub OAuth authorization URL."""
        state = create_oauth_state(user_id, "github")
        client_id = settings.GITHUB_CLIENT_ID or "mock-github-client-id"

        params = {
            "client_id": client_id,
            "redirect_uri": settings.GITHUB_REDIRECT_URI,
            "scope": "read:user,repo",
            "state": state,
        }
        query_string = "&".join(f"{k}={v}" for k, v in params.items())
        url = f"{GITHUB_AUTH_URL}?{query_string}"

        return {
            "url": url,
            "state": state,
            "configured": bool(settings.GITHUB_CLIENT_ID and settings.GITHUB_CLIENT_SECRET),
        }

    @classmethod
    async def exchange_code_for_token(
        cls,
        code: str,
        state: str,
        user_id: str,
        db: Session,
    ) -> ConnectedAccount:
        """Exchange GitHub OAuth authorization code for an access token."""
        if not verify_oauth_state(state, user_id, "github"):
            raise ValueError("Invalid or expired OAuth state token. Cross-site request rejected.")

        if not settings.GITHUB_CLIENT_ID or not settings.GITHUB_CLIENT_SECRET:
            raise ValueError(
                "GitHub OAuth credentials (GITHUB_CLIENT_ID / GITHUB_CLIENT_SECRET) are not configured."
            )

        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                token_res = await client.post(
                    GITHUB_TOKEN_URL,
                    headers={"Accept": "application/json"},
                    data={
                        "client_id": settings.GITHUB_CLIENT_ID,
                        "client_secret": settings.GITHUB_CLIENT_SECRET,
                        "code": code,
                        "redirect_uri": settings.GITHUB_REDIRECT_URI,
                    },
                )
                if token_res.status_code != 200:
                    raise ValueError(f"GitHub token exchange failed: {token_res.text}")

                token_data = token_res.json()
                access_token = token_data.get("access_token")
                if not access_token:
                    error_msg = token_data.get("error_description", token_data.get("error", "No access token returned"))
                    raise ValueError(f"GitHub authorization failed: {error_msg}")

                # Fetch authenticated GitHub user details
                user_res = await client.get(
                    f"{GITHUB_API_BASE}/user",
                    headers={
                        "Authorization": f"Bearer {access_token}",
                        "Accept": "application/vnd.github.v3+json",
                        "User-Agent": "PromiseGraph-App",
                    },
                )
                if user_res.status_code != 200:
                    raise ValueError("Could not retrieve GitHub user profile.")

                user_data = user_res.json()
                account_identifier = user_data.get("login") or f"gh-user-{user_data.get('id')}"
        except httpx.HTTPError as exc:
            logger.warning(f"Network error during GitHub OAuth exchange: {exc}")
            raise ValueError(f"Unable to reach GitHub API: {exc}")

        account = cls._save_or_update_account(
            db=db,
            user_id=user_id,
            account_identifier=account_identifier,
            access_token=access_token,
            metadata=user_data,
        )
        return account

    @classmethod
    async def connect_with_pat(
        cls,
        token: str,
        user_id: str,
        db: Session,
    ) -> ConnectedAccount:
        """Connect GitHub using a personal access token (PAT) for direct developer testing."""
        clean_token = token.strip()
        if not clean_token:
            raise ValueError("GitHub personal access token cannot be empty.")

        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                res = await client.get(
                    f"{GITHUB_API_BASE}/user",
                    headers={
                        "Authorization": f"Bearer {clean_token}",
                        "Accept": "application/vnd.github.v3+json",
                        "User-Agent": "PromiseGraph-App",
                    },
                )
                if res.status_code != 200:
                    raise ValueError(
                        f"GitHub rejected the token ({res.status_code}). Please verify your token permissions."
                    )
                user_data = res.json()
                account_identifier = user_data.get("login") or f"gh-user-{user_data.get('id')}"
        except httpx.HTTPError as exc:
            logger.warning(f"Network error connecting to GitHub: {exc}")
            raise ValueError(f"Unable to reach GitHub API ({exc}). Please check your connection.")

        account = cls._save_or_update_account(
            db=db,
            user_id=user_id,
            account_identifier=account_identifier,
            access_token=clean_token,
            metadata=user_data,
        )
        return account

    @classmethod
    def _save_or_update_account(
        cls,
        db: Session,
        user_id: str,
        account_identifier: str,
        access_token: str,
        metadata: Optional[Dict[str, Any]] = None,
    ) -> ConnectedAccount:
        """Save or update ConnectedAccount record with encrypted token."""
        account = db.query(ConnectedAccount).filter(
            ConnectedAccount.user_id == user_id,
            ConnectedAccount.provider == "github",
        ).first()

        metadata_str = None
        if metadata:
            safe_meta = {
                "login": metadata.get("login"),
                "name": metadata.get("name"),
                "avatar_url": metadata.get("avatar_url"),
                "html_url": metadata.get("html_url"),
                "public_repos": metadata.get("public_repos"),
            }
            import json
            metadata_str = json.dumps(safe_meta)

        if not account:
            account = ConnectedAccount(
                user_id=user_id,
                provider="github",
                account_identifier=account_identifier,
                is_active=True,
                access_token_encrypted=encrypt_token(access_token),
                metadata_json=metadata_str,
            )
            db.add(account)
        else:
            account.account_identifier = account_identifier
            account.is_active = True
            account.access_token_encrypted = encrypt_token(access_token)
            if metadata_str:
                account.metadata_json = metadata_str

        db.commit()
        db.refresh(account)
        return account

    @classmethod
    async def list_repositories(
        cls,
        account: ConnectedAccount,
        db: Session,
        http_client: Optional[httpx.AsyncClient] = None,
    ) -> List[Dict[str, Any]]:
        """List accessible repositories for the connected GitHub account."""
        token = decrypt_token(account.access_token_encrypted)
        if not token:
            raise ValueError("GitHub access token is missing or invalid.")

        client = http_client or httpx.AsyncClient(timeout=15.0)
        should_close = http_client is None
        try:
            res = await client.get(
                f"{GITHUB_API_BASE}/user/repos",
                params={"sort": "updated", "per_page": 50},
                headers={
                    "Authorization": f"Bearer {token}",
                    "Accept": "application/vnd.github.v3+json",
                    "User-Agent": "PromiseGraph-App",
                },
            )
            if res.status_code != 200:
                raise ValueError(f"GitHub API error ({res.status_code}): {res.text}")

            repos = res.json()
            return [
                {
                    "id": r.get("id"),
                    "name": r.get("name"),
                    "full_name": r.get("full_name"),
                    "description": r.get("description"),
                    "private": r.get("private"),
                    "html_url": r.get("html_url"),
                    "updated_at": r.get("updated_at"),
                    "open_issues_count": r.get("open_issues_count", 0),
                }
                for r in repos
            ]
        finally:
            if should_close:
                await client.aclose()

    @classmethod
    async def sync_issues_and_prs(
        cls,
        user_id: str,
        account: ConnectedAccount,
        repo_full_name: str,
        db: Session,
        page: int = 1,
        per_page: int = 20,
        http_client: Optional[httpx.AsyncClient] = None,
    ) -> Dict[str, Any]:
        """Fetch read-only issues and pull requests from a selected repository and ingest them."""
        token = decrypt_token(account.access_token_encrypted)
        if not token:
            raise ValueError("GitHub access token is missing or invalid.")

        client = http_client or httpx.AsyncClient(timeout=20.0)
        should_close = http_client is None
        try:
            res = await client.get(
                f"{GITHUB_API_BASE}/repos/{repo_full_name}/issues",
                params={"state": "all", "page": page, "per_page": min(per_page, 50)},
                headers={
                    "Authorization": f"Bearer {token}",
                    "Accept": "application/vnd.github.v3+json",
                    "User-Agent": "PromiseGraph-App",
                },
            )
            if res.status_code != 200:
                raise ValueError(f"GitHub API error fetching issues: {res.text}")

            issues_data = res.json()
        finally:
            if should_close:
                await client.aclose()

        synced_count = 0
        ingested = []

        for item in issues_data:
            issue_id = str(item.get("id"))
            number = item.get("number")
            title = item.get("title", "(Untitled Issue)")
            body = item.get("body") or "(No description provided)"
            html_url = item.get("html_url")
            state = item.get("state")
            user_obj = item.get("user") or {}
            author = user_obj.get("login", "unknown-author")

            created_at_str = item.get("created_at")
            ts = datetime.utcnow()
            if created_at_str:
                try:
                    ts = datetime.fromisoformat(created_at_str.replace("Z", "+00:00"))
                except Exception:
                    pass
            if ts.tzinfo is not None:
                ts = ts.replace(tzinfo=None)

            is_pr = "pull_request" in item
            kind = "Pull Request" if is_pr else "Issue"

            # Create or find Conversation for this issue
            external_conv_id = f"gh-issue-{issue_id}"
            conv = db.query(Conversation).filter(
                Conversation.user_id == user_id,
                Conversation.external_id == external_conv_id,
            ).first()

            conv_title = f"[{repo_full_name}] #{number} {title}"
            if not conv:
                conv = Conversation(
                    user_id=user_id,
                    connected_account_id=account.id,
                    external_id=external_conv_id,
                    title=conv_title[:500],
                    channel="github",
                    last_message_at=ts,
                    raw_metadata=f"GitHub {kind} state: {state}. URL: {html_url}",
                )
                db.add(conv)
                db.commit()
                db.refresh(conv)

            # Check if message exists
            existing_msg = db.query(Message).filter(
                Message.conversation_id == conv.id,
                Message.external_id == issue_id,
            ).first()

            if not existing_msg:
                msg = Message(
                    conversation_id=conv.id,
                    user_id=user_id,
                    external_id=issue_id,
                    sender_name=author,
                    sender_address=author,
                    subject=title[:500],
                    content=body[:20000],
                    content_type="markdown",
                    source_url=html_url,
                    timestamp=ts,
                )
                db.add(msg)
                db.commit()
                synced_count += 1
                ingested.append({
                    "id": issue_id,
                    "number": number,
                    "title": title,
                    "author": author,
                    "kind": kind,
                    "state": state,
                })

        return {
            "repository": repo_full_name,
            "synced_count": synced_count,
            "page": page,
            "items": ingested,
        }

    @classmethod
    def disconnect_account(cls, user_id: str, db: Session) -> bool:
        """Disconnect GitHub integration and delete credentials."""
        accounts = db.query(ConnectedAccount).filter(
            ConnectedAccount.user_id == user_id,
            ConnectedAccount.provider == "github",
        ).all()

        if not accounts:
            return False

        for account in accounts:
            db.delete(account)
        db.commit()
        return True
