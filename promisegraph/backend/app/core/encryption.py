import base64
import hashlib
import logging
from typing import Optional
from cryptography.fernet import Fernet
from app.core.config import settings

logger = logging.getLogger(__name__)


def _get_fernet_key() -> bytes:
    """Derive a URL-safe 32-byte base64-encoded key from settings.SECRET_KEY."""
    # Hash SECRET_KEY with SHA256 to ensure exactly 32 bytes
    digest = hashlib.sha256(settings.SECRET_KEY.encode("utf-8")).digest()
    return base64.urlsafe_b64encode(digest)


_fernet_instance: Optional[Fernet] = None


def get_fernet() -> Fernet:
    global _fernet_instance
    if _fernet_instance is None:
        _fernet_instance = Fernet(_get_fernet_key())
    return _fernet_instance


def encrypt_token(plain_token: Optional[str]) -> Optional[str]:
    """Encrypt a sensitive OAuth token for storage at rest."""
    if not plain_token:
        return None
    try:
        f = get_fernet()
        encrypted = f.encrypt(plain_token.encode("utf-8"))
        return encrypted.decode("utf-8")
    except Exception as exc:
        logger.error(f"Failed to encrypt token: {exc}")
        raise ValueError("Token encryption failed") from exc


def decrypt_token(encrypted_token: Optional[str]) -> Optional[str]:
    """Decrypt a stored OAuth token."""
    if not encrypted_token:
        return None
    try:
        f = get_fernet()
        decrypted = f.decrypt(encrypted_token.encode("utf-8"))
        return decrypted.decode("utf-8")
    except Exception as exc:
        logger.error(f"Failed to decrypt token: {exc}")
        return None
