"""게시판 예외 클래스."""
from fastapi import Request
from fastapi.responses import JSONResponse

from app.core.board_constants import BoardErrorCode


class BoardException(Exception):
    """게시판 관련 예외."""

    def __init__(
        self,
        error_code: BoardErrorCode | str,
        message: str,
        status_code: int = 400,
    ):
        self.error_code = (
            error_code.value if isinstance(error_code, BoardErrorCode) else error_code
        )
        self.message = message
        self.status_code = status_code
        super().__init__(message)


async def board_exception_handler(
    request: Request, exc: BoardException
) -> JSONResponse:
    """게시판 예외 핸들러.

    프로덕션에서는 항상 HTTP 200을 반환하고,
    success 필드와 error_code로 에러를 구분합니다.
    """
    return JSONResponse(
        status_code=200,  # 프로덕션: 항상 200
        content={
            "success": False,
            "error_code": exc.error_code,
            "message": exc.message,
        },
    )
