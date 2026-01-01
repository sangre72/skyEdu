"""API v1 라우터."""
from fastapi import APIRouter

from app.api.v1.endpoints import auth, health, managers, payments, reservations, reviews, users

api_router = APIRouter()

api_router.include_router(health.router, prefix="/health", tags=["헬스체크"])
api_router.include_router(auth.router, prefix="/auth", tags=["인증"])
api_router.include_router(users.router, prefix="/users", tags=["사용자"])
api_router.include_router(reservations.router, prefix="/reservations", tags=["예약"])
api_router.include_router(managers.router, prefix="/managers", tags=["매니저"])
api_router.include_router(payments.router, prefix="/payments", tags=["결제"])
api_router.include_router(reviews.router, prefix="/reviews", tags=["리뷰"])
