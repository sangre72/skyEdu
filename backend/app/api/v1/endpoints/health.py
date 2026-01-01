from fastapi import APIRouter

router = APIRouter()


@router.get("")
async def health_check() -> dict[str, str]:
    """API 헬스체크."""
    return {"status": "healthy", "version": "0.1.0"}
