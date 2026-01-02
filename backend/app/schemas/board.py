"""게시판 관련 스키마."""
import html
from datetime import datetime
from typing import Optional, List
from uuid import UUID

from pydantic import BaseModel, Field, field_validator


# ==================== Board 스키마 ====================
class BoardBase(BaseModel):
    """게시판 기본 스키마."""

    code: str = Field(..., min_length=1, max_length=50)
    name: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = None
    read_permission: str = Field(default="public", pattern="^(public|member|admin|disabled)$")
    write_permission: str = Field(default="member", pattern="^(public|member|admin|disabled)$")
    comment_permission: str = Field(default="member", pattern="^(public|member|admin|disabled)$")
    use_category: bool = False
    use_notice: bool = True
    use_secret: bool = False
    use_attachment: bool = True
    use_like: bool = False
    sort_order: int = 0


class BoardCreate(BoardBase):
    """게시판 생성 스키마."""

    pass


class BoardUpdate(BaseModel):
    """게시판 수정 스키마."""

    name: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = None
    read_permission: Optional[str] = Field(None, pattern="^(public|member|admin|disabled)$")
    write_permission: Optional[str] = Field(None, pattern="^(public|member|admin|disabled)$")
    comment_permission: Optional[str] = Field(None, pattern="^(public|member|admin|disabled)$")
    use_category: Optional[bool] = None
    use_notice: Optional[bool] = None
    use_secret: Optional[bool] = None
    use_attachment: Optional[bool] = None
    use_like: Optional[bool] = None
    sort_order: Optional[int] = None
    is_active: Optional[bool] = None


class BoardResponse(BoardBase):
    """게시판 응답 스키마."""

    id: UUID
    created_at: datetime
    updated_at: datetime
    is_active: bool

    class Config:
        from_attributes = True


# ==================== BoardCategory 스키마 ====================
class BoardCategoryBase(BaseModel):
    """게시판 분류 기본 스키마."""

    name: str = Field(..., min_length=1, max_length=50)
    sort_order: int = 0


class BoardCategoryCreate(BoardCategoryBase):
    """게시판 분류 생성 스키마."""

    pass


class BoardCategoryUpdate(BaseModel):
    """게시판 분류 수정 스키마."""

    name: Optional[str] = Field(None, min_length=1, max_length=50)
    sort_order: Optional[int] = None
    is_active: Optional[bool] = None


class BoardCategoryResponse(BoardCategoryBase):
    """게시판 분류 응답 스키마."""

    id: UUID
    board_id: UUID
    created_at: datetime
    is_active: bool

    class Config:
        from_attributes = True


# ==================== Post 스키마 ====================
class PostBase(BaseModel):
    """게시글 기본 스키마."""

    title: str = Field(..., min_length=1, max_length=200)
    content: str = Field(..., min_length=1, max_length=50000)
    category_id: Optional[UUID] = None
    is_notice: bool = False
    is_secret: bool = False
    secret_password: Optional[str] = None

    @field_validator("title", "content")
    @classmethod
    def sanitize_input(cls, v: str) -> str:
        """XSS 방지: HTML 이스케이프."""
        return html.escape(v.strip())


class PostCreate(PostBase):
    """게시글 생성 스키마."""

    pass


class PostUpdate(BaseModel):
    """게시글 수정 스키마."""

    title: Optional[str] = Field(None, min_length=1, max_length=200)
    content: Optional[str] = Field(None, min_length=1, max_length=50000)
    category_id: Optional[UUID] = None
    is_notice: Optional[bool] = None
    is_secret: Optional[bool] = None
    secret_password: Optional[str] = None

    @field_validator("title", "content")
    @classmethod
    def sanitize_input(cls, v: Optional[str]) -> Optional[str]:
        """XSS 방지: HTML 이스케이프."""
        return html.escape(v.strip()) if v else None


class AuthorInfo(BaseModel):
    """작성자 정보 스키마."""

    id: UUID
    name: str
    role: str

    class Config:
        from_attributes = True


class PostResponse(BaseModel):
    """게시글 응답 스키마."""

    id: UUID
    board_id: UUID
    category_id: Optional[UUID]
    author_id: UUID
    author: AuthorInfo
    title: str
    content: str
    is_notice: bool
    is_secret: bool
    view_count: int
    like_count: int
    comment_count: int
    is_answered: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class PostListItem(BaseModel):
    """게시글 목록 항목 스키마 (간략)."""

    id: UUID
    board_id: UUID
    category_id: Optional[UUID]
    author_id: UUID
    author_name: str
    title: str
    is_notice: bool
    is_secret: bool
    view_count: int
    like_count: int
    comment_count: int
    is_answered: bool
    created_at: datetime

    class Config:
        from_attributes = True


# ==================== Comment 스키마 ====================
class CommentBase(BaseModel):
    """댓글 기본 스키마."""

    content: str = Field(..., min_length=1, max_length=5000)
    parent_id: Optional[UUID] = None
    is_secret: bool = False

    @field_validator("content")
    @classmethod
    def sanitize_content(cls, v: str) -> str:
        """XSS 방지: HTML 이스케이프."""
        return html.escape(v.strip())


class CommentCreate(CommentBase):
    """댓글 생성 스키마."""

    pass


class CommentUpdate(BaseModel):
    """댓글 수정 스키마."""

    content: Optional[str] = Field(None, min_length=1, max_length=5000)
    is_secret: Optional[bool] = None

    @field_validator("content")
    @classmethod
    def sanitize_content(cls, v: Optional[str]) -> Optional[str]:
        """XSS 방지: HTML 이스케이프."""
        return html.escape(v.strip()) if v else None


class CommentResponse(BaseModel):
    """댓글 응답 스키마."""

    id: UUID
    post_id: UUID
    parent_id: Optional[UUID]
    author_id: UUID
    author: AuthorInfo
    content: str
    is_secret: bool
    like_count: int
    created_at: datetime
    updated_at: datetime
    replies: List["CommentResponse"] = []

    class Config:
        from_attributes = True


# ==================== Attachment 스키마 ====================
class AttachmentResponse(BaseModel):
    """첨부파일 응답 스키마."""

    id: UUID
    post_id: UUID
    original_name: str
    file_size: int
    mime_type: str
    download_count: int
    created_at: datetime

    class Config:
        from_attributes = True


# ==================== Pagination 스키마 ====================
class PaginatedResponse(BaseModel):
    """페이지네이션 응답 스키마."""

    items: List[PostListItem]
    total: int
    page: int
    page_size: int
    total_pages: int


# ==================== Error 스키마 ====================
class ErrorResponse(BaseModel):
    """에러 응답 스키마."""

    success: bool = False
    error_code: str
    message: str
