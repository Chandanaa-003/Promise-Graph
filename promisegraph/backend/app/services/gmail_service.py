import base64
import email
from email.utils import parseaddr
import json
import logging
from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional
import httpx
import jwt
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.encryption import encrypt_token, decrypt_token
from app.models.connected_account import ConnectedAccount
from app.models.conversation import Conversation
from app.models.message import Message

logger = logging.getLogger(__name__)

GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth"
GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token"
GOOGLE_REVOKE_URL = "https://oauth2.googleapis.com/revoke"
GMAIL_API_BASE = "https://gmail.googleapis.com/gmail/v1/users/me"

GMAIL_SCOPES = [
    "https://www.googleapis.com/auth/gmail.readonly",
    "https://www.googleapis.com/auth/userinfo.email",
]


def create_oauth_state(user_id: str, provider: str) -> str:
    """Create a signed, tamper-proof state token for CSRF protection during OAuth."""
    payload = {
        "user_id": user_id,
        "provider": provider,
        "exp": datetime.utcnow() + timedelta(minutes=15),
        "iat": datetime.utcnow(),
    }
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.JWT_ALGORITHM)


def verify_oauth_state(state: str, expected_user_id: str, expected_provider: str) -> bool:
    """Verify an OAuth callback state token."""
    try:
        payload = jwt.decode(state, settings.SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
        return (
            payload.get("user_id") == expected_user_id
            and payload.get("provider") == expected_provider
        )
    except Exception as exc:
        logger.warning(f"OAuth state verification failed: {exc}")
        return False


class GmailService:
    """Official Google Gmail API OAuth 2.0 and message ingestion service."""

    @classmethod
    def get_authorization_url(cls, user_id: str) -> Dict[str, str]:
        """Generate Google OAuth 2.0 authorization URL with minimal read-only scopes."""
        state = create_oauth_state(user_id, "gmail")
        client_id = settings.GOOGLE_CLIENT_ID or "mock-google-client-id"

        params = {
            "client_id": client_id,
            "redirect_uri": settings.GOOGLE_REDIRECT_URI,
            "response_type": "code",
            "scope": " ".join(GMAIL_SCOPES),
            "access_type": "offline",
            "prompt": "consent",
            "state": state,
        }
        query_string = "&".join(f"{k}={v}" for k, v in params.items())
        url = f"{GOOGLE_AUTH_URL}?{query_string}"

        return {
            "url": url,
            "state": state,
            "configured": bool(settings.GOOGLE_CLIENT_ID and settings.GOOGLE_CLIENT_SECRET),
        }

    @classmethod
    async def exchange_code_for_token(
        cls,
        code: str,
        state: str,
        user_id: str,
        db: Session,
    ) -> ConnectedAccount:
        """Exchange OAuth authorization code for Google access and refresh tokens."""
        if not verify_oauth_state(state, user_id, "gmail"):
            raise ValueError("Invalid or expired OAuth state token. Cross-site request rejected.")

        if not settings.GOOGLE_CLIENT_ID or not settings.GOOGLE_CLIENT_SECRET:
            # If OAuth is not configured with GCP credentials, reject live exchange
            raise ValueError(
                "Google OAuth credentials (GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET) are not configured in environment variables."
            )

        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                token_res = await client.post(
                    GOOGLE_TOKEN_URL,
                    data={
                        "client_id": settings.GOOGLE_CLIENT_ID,
                        "client_secret": settings.GOOGLE_CLIENT_SECRET,
                        "code": code,
                        "grant_type": "authorization_code",
                        "redirect_uri": settings.GOOGLE_REDIRECT_URI,
                    },
                )
                if token_res.status_code != 200:
                    logger.error(f"Google token exchange failed: {token_res.text}")
                    raise ValueError(f"Failed to retrieve tokens from Google: {token_res.text}")

                token_data = token_res.json()
                access_token = token_data.get("access_token")
                refresh_token = token_data.get("refresh_token")
                expires_in = token_data.get("expires_in", 3600)

                # Retrieve connected Google user's email address
                profile_res = await client.get(
                    f"{GMAIL_API_BASE}/profile",
                    headers={"Authorization": f"Bearer {access_token}"},
                )
                if profile_res.status_code == 200:
                    account_email = profile_res.json().get("emailAddress", "unknown@gmail.com")
                else:
                    account_email = "connected-account@gmail.com"
        except httpx.HTTPError as exc:
            logger.warning(f"Network error during Google token exchange: {exc}")
            raise ValueError(f"Unable to reach Google OAuth service: {exc}")

        expires_at = datetime.utcnow() + timedelta(seconds=expires_in)

        # Check existing connection
        account = db.query(ConnectedAccount).filter(
            ConnectedAccount.user_id == user_id,
            ConnectedAccount.provider == "gmail",
        ).first()

        if not account:
            account = ConnectedAccount(
                user_id=user_id,
                provider="gmail",
                account_identifier=account_email,
                is_active=True,
                access_token_encrypted=encrypt_token(access_token),
                refresh_token_encrypted=encrypt_token(refresh_token) if refresh_token else None,
                token_expires_at=expires_at,
            )
            db.add(account)
        else:
            account.account_identifier = account_email
            account.is_active = True
            account.access_token_encrypted = encrypt_token(access_token)
            if refresh_token:
                account.refresh_token_encrypted = encrypt_token(refresh_token)
            account.token_expires_at = expires_at

        db.commit()
        db.refresh(account)
        return account

    @classmethod
    async def get_valid_access_token(
        cls, account: ConnectedAccount, db: Session
    ) -> Optional[str]:
        """Retrieve a valid access token, automatically refreshing it if expired."""
        if not account or not account.is_active:
            return None

        # Check expiration (with a 5-minute safety buffer)
        now = datetime.utcnow()
        if (
            account.token_expires_at
            and account.token_expires_at > (now + timedelta(minutes=5))
            and account.access_token_encrypted
        ):
            return decrypt_token(account.access_token_encrypted)

        # Refresh token if expired
        refresh_token = decrypt_token(account.refresh_token_encrypted)
        if not refresh_token:
            logger.warning(f"No refresh token available for Gmail account {account.id}")
            return decrypt_token(account.access_token_encrypted)

        if not settings.GOOGLE_CLIENT_ID or not settings.GOOGLE_CLIENT_SECRET:
            return decrypt_token(account.access_token_encrypted)

        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                res = await client.post(
                    GOOGLE_TOKEN_URL,
                    data={
                        "client_id": settings.GOOGLE_CLIENT_ID,
                        "client_secret": settings.GOOGLE_CLIENT_SECRET,
                        "refresh_token": refresh_token,
                        "grant_type": "refresh_token",
                    },
                )
                if res.status_code == 200:
                    data = res.json()
                    new_access_token = data.get("access_token")
                    expires_in = data.get("expires_in", 3600)
                    account.access_token_encrypted = encrypt_token(new_access_token)
                    account.token_expires_at = datetime.utcnow() + timedelta(seconds=expires_in)
                    db.commit()
                    return new_access_token
                else:
                    logger.error(f"Google token refresh failed: {res.text}")
                    return decrypt_token(account.access_token_encrypted)
        except Exception as exc:
            logger.error(f"Error during Google token refresh: {exc}")
            return decrypt_token(account.access_token_encrypted)

    @classmethod
    async def fetch_and_sync_emails(
        cls,
        user_id: str,
        account: ConnectedAccount,
        db: Session,
        max_results: int = 15,
        page_token: Optional[str] = None,
        http_client: Optional[httpx.AsyncClient] = None,
    ) -> Dict[str, Any]:
        """Fetch read-only Gmail messages, extract communication metadata, and ingest into database."""
        token = await cls.get_valid_access_token(account, db)
        if not token:
            raise ValueError("Gmail account is not connected or token has expired.")

        synced_count = 0
        messages_ingested = []
        next_page = None

        client = http_client or httpx.AsyncClient(timeout=20.0)
        should_close = http_client is None
        try:
            # 1. Fetch message IDs
            list_params: Dict[str, Any] = {"maxResults": min(max_results, 50)}
            if page_token:
                list_params["pageToken"] = page_token

            list_res = await client.get(
                f"{GMAIL_API_BASE}/messages",
                params=list_params,
                headers={"Authorization": f"Bearer {token}"},
            )

            if list_res.status_code != 200:
                logger.error(f"Failed to list Gmail messages: {list_res.text}")
                raise ValueError(f"Gmail API query failed ({list_res.status_code}): {list_res.text}")

            list_data = list_res.json()
            message_stubs = list_data.get("messages", [])
            next_page = list_data.get("nextPageToken")

            # 2. Fetch individual message details
            for stub in message_stubs:
                msg_id = stub.get("id")
                thread_id = stub.get("threadId")

                msg_res = await client.get(
                    f"{GMAIL_API_BASE}/messages/{msg_id}",
                    params={"format": "full"},
                    headers={"Authorization": f"Bearer {token}"},
                )
                if msg_res.status_code != 200:
                    continue

                msg_data = msg_res.json()
                headers_list = msg_data.get("payload", {}).get("headers", [])
                headers_map = {h["name"].lower(): h["value"] for h in headers_list if "name" in h}

                subject = headers_map.get("subject", "(No Subject)")
                sender_raw = headers_map.get("from", "Unknown Sender")
                recipient_raw = headers_map.get("to", "")
                date_raw = headers_map.get("date")

                sender_name, sender_addr = parseaddr(sender_raw)
                if not sender_name:
                    sender_name = sender_addr

                # Parse date
                msg_timestamp = datetime.utcnow()
                if date_raw:
                    try:
                        parsed_tuple = email.utils.parsedate_to_datetime(date_raw)
                        if parsed_tuple:
                            msg_timestamp = parsed_tuple
                    except Exception:
                        pass

                if msg_timestamp.tzinfo is not None:
                    msg_timestamp = msg_timestamp.replace(tzinfo=None)

                # Extract content snippet
                snippet = msg_data.get("snippet", "")

                # Check or create Conversation (Thread)
                conv = db.query(Conversation).filter(
                    Conversation.user_id == user_id,
                    Conversation.external_id == thread_id,
                ).first()

                if not conv:
                    conv = Conversation(
                        user_id=user_id,
                        connected_account_id=account.id,
                        external_id=thread_id,
                        title=subject[:500],
                        channel="email",
                        last_message_at=msg_timestamp,
                    )
                    db.add(conv)
                    db.commit()
                    db.refresh(conv)
                else:
                    conv_last = conv.last_message_at
                    if conv_last and conv_last.tzinfo is not None:
                        conv_last = conv_last.replace(tzinfo=None)
                    if not conv_last or msg_timestamp > conv_last:
                        conv.last_message_at = msg_timestamp
                        db.commit()

                # Check if message already exists
                existing_msg = db.query(Message).filter(
                    Message.conversation_id == conv.id,
                    Message.external_id == msg_id,
                ).first()

                if not existing_msg:
                    db_msg = Message(
                        conversation_id=conv.id,
                        user_id=user_id,
                        external_id=msg_id,
                        sender_name=sender_name[:255],
                        sender_address=sender_addr[:255],
                        recipient_addresses=recipient_raw[:1000] if recipient_raw else None,
                        subject=subject[:500],
                        content=snippet or "(No body preview available)",
                        content_type="snippet",
                        source_url=f"https://mail.google.com/mail/u/0/#inbox/{thread_id}",
                        timestamp=msg_timestamp,
                    )
                    db.add(db_msg)
                    db.commit()
                    synced_count += 1
                    messages_ingested.append({
                        "id": msg_id,
                        "subject": subject,
                        "sender": sender_name,
                        "date": msg_timestamp.isoformat(),
                    })
        finally:
            if should_close:
                await client.aclose()

        return {
            "synced_count": synced_count,
            "next_page_token": next_page,
            "messages": messages_ingested,
        }

    @classmethod
    async def disconnect_account(cls, user_id: str, db: Session) -> bool:
        """Disconnect Gmail integration and revoke Google OAuth access."""
        accounts = db.query(ConnectedAccount).filter(
            ConnectedAccount.user_id == user_id,
            ConnectedAccount.provider == "gmail",
        ).all()

        if not accounts:
            return False

        for account in accounts:
            # Attempt token revocation with Google
            token = decrypt_token(account.access_token_encrypted)
            if token:
                try:
                    async with httpx.AsyncClient(timeout=5.0) as client:
                        await client.post(GOOGLE_REVOKE_URL, params={"token": token})
                except Exception as exc:
                    logger.debug(f"Google token revoke request failed: {exc}")
            db.delete(account)

        db.commit()
        return True
