"""API v1 라우터."""
from fastapi import APIRouter

from app.api.v1.endpoints import admin, auth, boards, health, managers, menus, payments, promotions, reservations, reviews, user_groups, users

api_router = APIRouter()

api_router.include_router(health.router, prefix="/health", tags=["헬스체크"])
api_router.include_router(auth.router, prefix="/auth", tags=["인증"])
api_router.include_router(user_groups.router, prefix="/user-groups", tags=["사용자 그룹"])
api_router.include_router(users.router, prefix="/users", tags=["사용자"])
api_router.include_router(reservations.router, prefix="/reservations", tags=["예약"])
api_router.include_router(managers.router, prefix="/managers", tags=["매니저"])
api_router.include_router(promotions.router, prefix="/promotions", tags=["프로모션"])
api_router.include_router(payments.router, prefix="/payments", tags=["결제"])
api_router.include_router(reviews.router, prefix="/reviews", tags=["리뷰"])
api_router.include_router(boards.router, tags=["게시판"])
api_router.include_router(menus.router, prefix="/menus", tags=["메뉴"])
api_router.include_router(admin.router, prefix="/admin", tags=["관리자"])
