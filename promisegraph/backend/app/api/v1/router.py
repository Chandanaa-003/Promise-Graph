from fastapi import APIRouter
from app.api.v1.endpoints import (
    health,
    users,
    commitments,
    people,
    conversations,
)

api_v1_router = APIRouter()

api_v1_router.include_router(health.router)
api_v1_router.include_router(users.router)
api_v1_router.include_router(commitments.router)
api_v1_router.include_router(people.router)
api_v1_router.include_router(conversations.router)
