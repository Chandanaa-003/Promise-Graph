import re
import logging
from datetime import datetime
from typing import List, Dict, Any, Optional, Tuple
from sqlalchemy.orm import Session

from app.models.conversation import Conversation
from app.models.message import Message

logger = logging.getLogger(__name__)

# Regular expressions for Android and iOS WhatsApp exports
# 1. Android pattern: e.g. "12/28/23, 10:15 AM - Alice: Hey!" or "28/12/2023, 14:15 - Bob: Hi"
ANDROID_REGEX = re.compile(
    r"^(\d{1,4}[/\-.]\d{1,2}[/\-.]\d{1,4}),?\s+(\d{1,2}:\d{2}(?::\d{2})?(?:\s*[AaPp][Mm])?)\s+-\s+([^:]+?):\s+(.*)$"
)

# 2. iOS pattern: e.g. "[12/28/23, 10:15:30 AM] Alice: Hey!" or "[28/12/2023, 14:15:30] Bob: Hi"
IOS_REGEX = re.compile(
    r"^\[(\d{1,4}[/\-.]\d{1,2}[/\-.]\d{1,4}),?\s+(\d{1,2}:\d{2}(?::\d{2})?(?:\s*[AaPp][Mm])?)\]\s+([^:]+?):\s+(.*)$"
)

# System lines pattern (e.g. encryption notice, security code changes, media omitted)
SYSTEM_NOTIFICATION_PATTERNS = [
    re.compile(r"messages and calls are end-to-end encrypted", re.IGNORECASE),
    re.compile(r"created group", re.IGNORECASE),
    re.compile(r"added you", re.IGNORECASE),
    re.compile(r"changed the group", re.IGNORECASE),
    re.compile(r"changed this group's icon", re.IGNORECASE),
    re.compile(r"security code changed", re.IGNORECASE),
]


def parse_whatsapp_timestamp(date_str: str, time_str: str) -> datetime:
    """Attempt parsing various common WhatsApp date and time formats."""
    # Clean strings
    date_str = date_str.strip().replace(".", "/").replace("-", "/")
    time_str = time_str.strip().upper()

    # Normalize single space before AM/PM
    time_str = re.sub(r"\s+", " ", time_str)

    dt_str = f"{date_str} {time_str}"

    date_time_formats = [
        # 12-hour formats
        "%m/%d/%y %I:%M %p",
        "%m/%d/%Y %I:%M %p",
        "%d/%m/%y %I:%M %p",
        "%d/%m/%Y %I:%M %p",
        "%m/%d/%y %I:%M:%S %p",
        "%m/%d/%Y %I:%M:%S %p",
        "%d/%m/%y %I:%M:%S %p",
        "%d/%m/%Y %I:%M:%S %p",
        # 24-hour formats
        "%d/%m/%Y %H:%M",
        "%d/%m/%y %H:%M",
        "%m/%d/%Y %H:%M",
        "%m/%d/%y %H:%M",
        "%Y/%m/%d %H:%M",
        "%d/%m/%Y %H:%M:%S",
        "%d/%m/%y %H:%M:%S",
        "%Y/%m/%d %H:%M:%S",
    ]

    for fmt in date_time_formats:
        try:
            return datetime.strptime(dt_str, fmt)
        except ValueError:
            continue

    # Fallback to current datetime if parsing fails
    logger.debug(f"Could not parse WhatsApp timestamp: '{dt_str}'. Using current time.")
    return datetime.utcnow()


def sanitize_text(text: str) -> str:
    """Sanitize message content by removing null bytes and invisible formatting marks."""
    # Remove null bytes and left-to-right invisible marks (\u200e, \u200f)
    cleaned = text.replace("\x00", "").replace("\u200e", "").replace("\u200f", "").replace("\u202a", "").replace("\u202c", "")
    return cleaned.strip()


class WhatsAppParser:
    """Parser for exported WhatsApp .txt chat transcripts."""

    @classmethod
    def parse_chat_text(cls, raw_text: str) -> Tuple[List[Dict[str, Any]], Dict[str, Any]]:
        """Parse raw WhatsApp transcript text into structured message records and summary metrics."""
        lines = raw_text.splitlines()
        messages: List[Dict[str, Any]] = []
        participants = set()
        system_lines = 0

        current_message: Optional[Dict[str, Any]] = None

        for raw_line in lines:
            line = raw_line.strip()
            if not line:
                continue

            # Remove zero-width Unicode characters often placed at start of lines on iOS exports
            cleaned_line = line.replace("\u200e", "").replace("\u200f", "")

            # Check for iOS format first
            ios_match = IOS_REGEX.match(cleaned_line)
            android_match = ANDROID_REGEX.match(cleaned_line) if not ios_match else None
            match = ios_match or android_match

            if match:
                # Save previous message
                if current_message:
                    messages.append(current_message)
                    current_message = None

                date_part, time_part, sender_part, content_part = match.groups()
                sender = sanitize_text(sender_part)
                content = sanitize_text(content_part)

                # Check if it is a system announcement
                is_system = any(pat.search(content) for pat in SYSTEM_NOTIFICATION_PATTERNS)
                if is_system:
                    system_lines += 1
                    continue

                ts = parse_whatsapp_timestamp(date_part, time_part)
                participants.add(sender)

                current_message = {
                    "timestamp": ts,
                    "sender_name": sender,
                    "content": content,
                }
            else:
                # Multiline continuation
                if current_message:
                    current_message["content"] += "\n" + sanitize_text(cleaned_line)
                else:
                    system_lines += 1

        if current_message:
            messages.append(current_message)

        metrics = {
            "total_lines": len(lines),
            "parsed_messages": len(messages),
            "participants": sorted(list(participants)),
            "system_lines": system_lines,
            "start_time": messages[0]["timestamp"] if messages else None,
            "end_time": messages[-1]["timestamp"] if messages else None,
        }

        return messages, metrics

    @classmethod
    def ingest_chat(
        cls,
        db: Session,
        user_id: str,
        raw_text: str,
        title: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Parse and ingest a WhatsApp chat transcript into the database."""
        messages_data, metrics = cls.parse_chat_text(raw_text)

        if not messages_data:
            raise ValueError(
                "No valid WhatsApp messages found in the provided file. "
                "Ensure you uploaded an exported WhatsApp .txt transcript."
            )

        # Generate sensible title if not provided
        if not title or not title.strip():
            participants = metrics["participants"]
            if len(participants) <= 2:
                title = f"WhatsApp: {', '.join(participants)}"
            else:
                title = f"WhatsApp Group: {participants[0]} and {len(participants) - 1} others"

        # Create Conversation record
        conversation = Conversation(
            user_id=user_id,
            title=title.strip()[:500],
            channel="whatsapp",
            last_message_at=metrics["end_time"] or datetime.utcnow(),
            raw_metadata=f"Parsed {len(messages_data)} messages from WhatsApp export. Participants: {', '.join(metrics['participants'])}",
        )
        db.add(conversation)
        db.commit()
        db.refresh(conversation)

        # Bulk create Messages
        db_messages = []
        for idx, msg in enumerate(messages_data):
            db_msg = Message(
                conversation_id=conversation.id,
                user_id=user_id,
                external_id=f"wa-{conversation.id[:8]}-{idx+1}",
                sender_name=msg["sender_name"],
                sender_address=msg["sender_name"],
                content=msg["content"][:20000],  # protect against overflowing text limits
                content_type="text",
                timestamp=msg["timestamp"],
            )
            db_messages.append(db_msg)

        db.bulk_save_objects(db_messages)
        db.commit()

        logger.info(
            f"Successfully ingested WhatsApp conversation '{conversation.title}' with {len(db_messages)} messages for user {user_id}."
        )

        return {
            "conversation_id": conversation.id,
            "title": conversation.title,
            "channel": "whatsapp",
            "total_messages": len(db_messages),
            "participants": metrics["participants"],
            "start_time": metrics["start_time"].isoformat() if metrics["start_time"] else None,
            "end_time": metrics["end_time"].isoformat() if metrics["end_time"] else None,
            "system_lines_skipped": metrics["system_lines"],
        }
