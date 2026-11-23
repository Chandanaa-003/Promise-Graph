import logging
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.models.user import User
from app.models.person import Person
from app.models.connected_account import ConnectedAccount
from app.models.conversation import Conversation
from app.models.commitment import Commitment
from app.models.evidence import Evidence
from app.models.message import Message
from app.core.security import get_password_hash

logger = logging.getLogger(__name__)


def seed_data_if_empty(db: Session, force: bool = False):
    """Seed initial realistic data if the database is empty or force is True."""
    try:
        user_count = db.query(User).count()
        people_count = db.query(Person).count()
        commitments_count = db.query(Commitment).count()

        # Always ensure primary user has a password set even if database was already seeded
        alex = db.query(User).filter(User.email == "alex@promisegraph.ai").first()
        if alex and not alex.hashed_password:
            alex.hashed_password = get_password_hash("Password123!")
            db.commit()
            logger.info("Updated alex@promisegraph.ai with default password hash.")

        # Ensure sample messages are seeded for Phase 4 communication model if none exist
        if alex and db.query(Message).count() == 0:
            convs = db.query(Conversation).filter(Conversation.user_id == alex.id).all()
            conv_map = {c.channel: c for c in convs}
            now_m = datetime.utcnow()
            for ch, sender, addr, subj, body, c_type, url, hrs in [
                ("email", "Sarah Chen", "sarah.chen@techcorp.io", "Phase 1 & 2 Delivery Specifications", "Hi Alex,\n\nI reviewed the architecture specs. I will complete Phase 1 by Monday noon with full schema and health checks.\n\nBest,\nSarah", "text", None, 48),
                ("whatsapp", "David Patel", "David Patel", None, "Hey Alex, got the partner ops approval. Will share the sandbox credentials with you before Thursday end of day.", "text", None, 8),
                ("github", "mbrody", "mbrody", "PR #42 Webhook Dispatcher Review", "CI pipeline passes with 100% test coverage. I will merge the webhook PR tomorrow once team sign-off is complete.", "markdown", "https://github.com/promisegraph/core/pull/42", 4),
            ]:
                target_conv = conv_map.get(ch)
                if target_conv:
                    db.add(Message(
                        conversation_id=target_conv.id,
                        user_id=alex.id,
                        external_id=f"msg-{ch}-001",
                        sender_name=sender,
                        sender_address=addr,
                        subject=subj,
                        content=body,
                        content_type=c_type,
                        source_url=url,
                        timestamp=now_m - timedelta(hours=hrs),
                    ))
            db.commit()
            logger.info("Seeded initial sample messages for unified communication model.")

        if not force and people_count > 0 and commitments_count > 0:
            logger.info("Database already contains data; skipping initial seed.")
            return

        logger.info("Seeding initial database records for Phase 2...")

        # 1. Primary User
        user = db.query(User).filter(User.email == "alex@promisegraph.ai").first()
        if not user:
            user = User(
                email="alex@promisegraph.ai",
                full_name="Alex Mercer",
                hashed_password=get_password_hash("Password123!"),
                is_active=True,
            )
            db.add(user)
            db.commit()
            db.refresh(user)
        elif not user.hashed_password:
            user.hashed_password = get_password_hash("Password123!")
            db.commit()
            db.refresh(user)

        # 2. People
        existing_people = {p.email: p for p in db.query(Person).filter(Person.user_id == user.id).all()}
        
        people_defs = [
            {
                "display_name": "Sarah Chen",
                "email": "sarah.chen@techcorp.io",
                "organization": "TechCorp Architecture",
                "relationship_score": 0.94,
                "notes": "Lead Systems Architect. Direct collaborator on core schemas.",
            },
            {
                "display_name": "David Patel",
                "email": "david.patel@integrations.dev",
                "organization": "WhatsApp Partner Ops",
                "relationship_score": 0.88,
                "notes": "Partner engineering contact for WhatsApp Cloud API onboarding.",
            },
            {
                "display_name": "Marcus Brody",
                "email": "mbrody@github-team.org",
                "organization": "OpenSource Labs",
                "relationship_score": 0.82,
                "notes": "GitHub maintainer and webhook review partner.",
            },
            {
                "display_name": "Elena Rostova",
                "email": "elena@graph-research.ai",
                "organization": "AI Knowledge Graph Institute",
                "relationship_score": 0.91,
                "notes": "Collaborator on knowledge graph ontology and edge algorithms.",
            },
        ]

        created_people = {}
        for p_def in people_defs:
            if p_def["email"] in existing_people:
                created_people[p_def["display_name"]] = existing_people[p_def["email"]]
            else:
                p = Person(
                    user_id=user.id,
                    display_name=p_def["display_name"],
                    email=p_def["email"],
                    organization=p_def["organization"],
                    relationship_score=p_def["relationship_score"],
                    notes=p_def["notes"],
                )
                db.add(p)
                db.commit()
                db.refresh(p)
                created_people[p_def["display_name"]] = p

        # 3. Connected Accounts (Placeholders for roadmap)
        channel_providers = ["gmail", "whatsapp", "github"]
        for provider in channel_providers:
            existing = db.query(ConnectedAccount).filter(
                ConnectedAccount.user_id == user.id,
                ConnectedAccount.provider == provider,
            ).first()
            if not existing:
                ca = ConnectedAccount(
                    user_id=user.id,
                    provider=provider,
                    account_identifier=f"{user.email.split('@')[0]}@{provider}.com" if provider != "github" else "alex-mercer",
                    is_active=False,
                )
                db.add(ca)
        db.commit()

        # 4. Conversations
        conv_defs = [
            {"title": "Phase 1 & 2 Delivery Specifications", "channel": "email", "external_id": "thread-em-001"},
            {"title": "WhatsApp Cloud API Integration Sync", "channel": "whatsapp", "external_id": "chat-wa-002"},
            {"title": "PR #42 Webhook Dispatcher Review", "channel": "github", "external_id": "issue-gh-003"},
        ]
        created_convs = {}
        for c_def in conv_defs:
            existing_c = db.query(Conversation).filter(
                Conversation.user_id == user.id,
                Conversation.external_id == c_def["external_id"],
            ).first()
            if not existing_c:
                c = Conversation(
                    user_id=user.id,
                    title=c_def["title"],
                    channel=c_def["channel"],
                    external_id=c_def["external_id"],
                    last_message_at=datetime.utcnow() - timedelta(hours=3),
                )
                db.add(c)
                db.commit()
                db.refresh(c)
                created_convs[c_def["channel"]] = c
            else:
                created_convs[c_def["channel"]] = existing_c

        # 5. Commitments
        if db.query(Commitment).count() <= 1:
            now = datetime.utcnow()
            commitment_defs = [
                {
                    "title": "Deliver Phase 1 Architecture & PostgreSQL Models",
                    "description": "Establish foundational schema, FastAPI health endpoints, and React frontend shell.",
                    "status": "fulfilled",
                    "commitment_type": "promise_made",
                    "person": "Sarah Chen",
                    "channel": "email",
                    "due_date": now - timedelta(days=1),
                    "confidence": 0.98,
                    "evidence": "I will complete Phase 1 by Monday noon with full schema and health checks.",
                },
                {
                    "title": "Review Gmail OAuth Scopes and Webhook specifications",
                    "description": "Prepare Gmail channel integration roadmap for Phase 2.",
                    "status": "pending",
                    "commitment_type": "promise_made",
                    "person": "Sarah Chen",
                    "channel": "email",
                    "due_date": now + timedelta(days=2),
                    "confidence": 0.94,
                    "evidence": "I promise to send over the OAuth scope requirements by Wednesday 5 PM.",
                },
                {
                    "title": "Provide WhatsApp Business API sandbox credentials",
                    "description": "Awaiting official sandbox tokens from partner team for testing.",
                    "status": "pending",
                    "commitment_type": "promise_received",
                    "person": "David Patel",
                    "channel": "whatsapp",
                    "due_date": now + timedelta(days=3),
                    "confidence": 0.91,
                    "evidence": "Will share the sandbox credentials with you before Thursday end of day.",
                },
                {
                    "title": "Merge GitHub Webhook Dispatcher PR",
                    "description": "Verify commit signatures and webhook dispatch payload schema.",
                    "status": "in_progress",
                    "commitment_type": "promise_made",
                    "person": "Marcus Brody",
                    "channel": "github",
                    "due_date": now + timedelta(hours=18),
                    "confidence": 0.95,
                    "evidence": "I will merge the webhook PR tomorrow once CI tests pass.",
                },
                {
                    "title": "Send relationship graph ontology design doc",
                    "description": "Detailed RDF / edge graph specification for people interactions.",
                    "status": "overdue",
                    "commitment_type": "promise_received",
                    "person": "Elena Rostova",
                    "channel": "email",
                    "due_date": now - timedelta(days=2),
                    "confidence": 0.88,
                    "evidence": "Expect the ontology document in your inbox by Friday evening.",
                },
                {
                    "title": "Draft AI communication intelligence safety principles",
                    "description": "Specify prompt guardrails and human approval thresholds.",
                    "status": "in_progress",
                    "commitment_type": "promise_made",
                    "person": "Elena Rostova",
                    "channel": "email",
                    "due_date": now + timedelta(days=5),
                    "confidence": 0.92,
                    "evidence": "I will draft the safety principles document for next week's review.",
                },
            ]

            for c_info in commitment_defs:
                person = created_people.get(c_info["person"])
                conv = created_convs.get(c_info["channel"])
                comm = Commitment(
                    user_id=user.id,
                    person_id=person.id if person else None,
                    conversation_id=conv.id if conv else None,
                    title=c_info["title"],
                    description=c_info["description"],
                    status=c_info["status"],
                    commitment_type=c_info["commitment_type"],
                    due_date=c_info["due_date"],
                    confidence_score=c_info["confidence"],
                )
                db.add(comm)
                db.commit()
                db.refresh(comm)

                # Attach Evidence
                if c_info["evidence"]:
                    ev = Evidence(
                        commitment_id=comm.id,
                        conversation_id=conv.id if conv else None,
                        snippet_text=c_info["evidence"],
                        context_before="Sender: Let's confirm deliverables for next milestone.",
                        context_after="Recipient: Received and noted. Tracking in PromiseGraph.",
                        timestamp=now - timedelta(hours=12),
                        source_message_id=f"msg-{comm.id[:8]}",
                    )
                    db.add(ev)
            db.commit()
            
            # 6. Seed Sample Unified Messages for Initial Conversations
            if db.query(Message).count() == 0:
                now_msg = datetime.utcnow()
                sample_msgs = [
                    {
                        "conv": created_convs.get("email"),
                        "external_id": "msg-em-001",
                        "sender_name": "Sarah Chen",
                        "sender_address": "sarah.chen@techcorp.io",
                        "subject": "Phase 1 & 2 Delivery Specifications",
                        "content": "Hi Alex,\n\nI reviewed the architecture specs. I will complete Phase 1 by Monday noon with full schema and health checks.\n\nBest,\nSarah",
                        "content_type": "text",
                        "timestamp": now_msg - timedelta(days=2),
                    },
                    {
                        "conv": created_convs.get("whatsapp"),
                        "external_id": "msg-wa-002",
                        "sender_name": "David Patel",
                        "sender_address": "David Patel",
                        "subject": None,
                        "content": "Hey Alex, got the partner ops approval. Will share the sandbox credentials with you before Thursday end of day.",
                        "content_type": "text",
                        "timestamp": now_msg - timedelta(hours=8),
                    },
                    {
                        "conv": created_convs.get("github"),
                        "external_id": "msg-gh-003",
                        "sender_name": "mbrody",
                        "sender_address": "mbrody",
                        "subject": "PR #42 Webhook Dispatcher Review",
                        "content": "CI pipeline passes with 100% test coverage. I will merge the webhook PR tomorrow once team sign-off is complete.",
                        "content_type": "markdown",
                        "source_url": "https://github.com/promisegraph/core/pull/42",
                        "timestamp": now_msg - timedelta(hours=4),
                    },
                ]
                for m_data in sample_msgs:
                    if m_data["conv"]:
                        msg_obj = Message(
                            conversation_id=m_data["conv"].id,
                            user_id=user.id,
                            external_id=m_data["external_id"],
                            sender_name=m_data["sender_name"],
                            sender_address=m_data["sender_address"],
                            subject=m_data.get("subject"),
                            content=m_data["content"],
                            content_type=m_data["content_type"],
                            source_url=m_data.get("source_url"),
                            timestamp=m_data["timestamp"],
                        )
                        db.add(msg_obj)
                db.commit()

            logger.info("Initial seeding completed successfully!")
    except Exception as e:
        logger.error(f"Error seeding database: {e}")
        db.rollback()
