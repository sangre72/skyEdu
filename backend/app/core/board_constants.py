"""게시판 공유 상수."""
from enum import Enum


class Permission(str, Enum):
    """권한 타입."""

    PUBLIC = "public"
    MEMBER = "member"
    ADMIN = "admin"
    DISABLED = "disabled"


class BoardErrorCode(str, Enum):
    """게시판 에러 코드."""

    BOARD_NOT_FOUND = "BOARD_NOT_FOUND"
    BOARD_CODE_DUPLICATE = "BOARD_CODE_DUPLICATE"
    POST_NOT_FOUND = "POST_NOT_FOUND"
    COMMENT_NOT_FOUND = "COMMENT_NOT_FOUND"
    ACCESS_DENIED = "ACCESS_DENIED"
    AUTH_REQUIRED = "AUTH_REQUIRED"
    SECRET_POST_ACCESS_DENIED = "SECRET_POST_ACCESS_DENIED"
    FILE_UPLOAD_FAILED = "FILE_UPLOAD_FAILED"
    FILE_SIZE_EXCEEDED = "FILE_SIZE_EXCEEDED"
    FILE_TYPE_NOT_ALLOWED = "FILE_TYPE_NOT_ALLOWED"
    INVALID_FILENAME = "INVALID_FILENAME"
    COMMENT_DISABLED = "COMMENT_DISABLED"


# 파일 업로드 설정
ALLOWED_EXTENSIONS = {
    ".jpg",
    ".jpeg",
    ".png",
    ".gif",
    ".pdf",
    ".doc",
    ".docx",
    ".xls",
    ".xlsx",
}
ALLOWED_MIME_TYPES = {
    "image/jpeg",
    "image/png",
    "image/gif",
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB

# 페이지네이션 기본값
DEFAULT_PAGE_SIZE = 20
MAX_PAGE_SIZE = 100
