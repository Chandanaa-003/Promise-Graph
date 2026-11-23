from fastapi import APIRouter
from app.api.v1.endpoints import (
    health,
    auth,
    users,
    commitments,
    people,
    conversations,
    evidence,
    seed,
    integrations,
    ai,
)

api_v1_router = APIRouter()

api_v1_router.include_router(auth.router, prefix="/auth")
api_v1_router.include_router(health.router)
api_v1_router.include_router(users.router)
api_v1_router.include_router(commitments.router)
api_v1_router.include_router(people.router)
api_v1_router.include_router(conversations.router)
api_v1_router.include_router(evidence.router)
api_v1_router.include_router(seed.router)
api_v1_router.include_router(integrations.router)
api_v1_router.include_router(ai.router)
