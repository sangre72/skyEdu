"""게시판 관련 모델."""
import uuid
from typing import TYPE_CHECKING, Optional

from sqlalchemy import Boolean, ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin

if TYPE_CHECKING:
    from app.models.user import User


class Board(Base, TimestampMixin):
    """게시판 모델."""

    __tablename__ = "boards"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    code: Mapped[str] = mapped_column(
        String(50),
        unique=True,
        nullable=False,
        index=True,
    )
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # 권한 설정: public, member, admin, disabled
    read_permission: Mapped[str] = mapped_column(String(20), default="public", nullable=False)
    write_permission: Mapped[str] = mapped_column(String(20), default="member", nullable=False)
    comment_permission: Mapped[str] = mapped_column(
        String(20), default="member", nullable=False
    )

    # 기능 설정
    use_category: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    use_notice: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    use_secret: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    use_attachment: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    use_like: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    sort_order: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    # Relationships
    categories: Mapped[list["BoardCategory"]] = relationship(
        "BoardCategory",
        back_populates="board",
        cascade="all, delete-orphan",
    )
    posts: Mapped[list["Post"]] = relationship(
        "Post",
        back_populates="board",
        cascade="all, delete-orphan",
    )


class BoardCategory(Base, TimestampMixin):
    """게시판 분류 모델."""

    __tablename__ = "board_categories"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    board_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("boards.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    name: Mapped[str] = mapped_column(String(50), nullable=False)
    sort_order: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    # Relationships
    board: Mapped["Board"] = relationship("Board", back_populates="categories")
    posts: Mapped[list["Post"]] = relationship("Post", back_populates="category")


class Post(Base, TimestampMixin):
    """게시글 모델."""

    __tablename__ = "posts"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    board_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("boards.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    category_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("board_categories.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    author_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    title: Mapped[str] = mapped_column(String(200), nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)

    is_notice: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False, index=True)
    is_secret: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    secret_password: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)

    view_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    like_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    comment_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    is_answered: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    # Relationships
    board: Mapped["Board"] = relationship("Board", back_populates="posts")
    category: Mapped[Optional["BoardCategory"]] = relationship(
        "BoardCategory",
        back_populates="posts",
    )
    author: Mapped["User"] = relationship("User")
    comments: Mapped[list["Comment"]] = relationship(
        "Comment",
        back_populates="post",
        cascade="all, delete-orphan",
    )
    attachments: Mapped[list["Attachment"]] = relationship(
        "Attachment",
        back_populates="post",
        cascade="all, delete-orphan",
    )


class Comment(Base, TimestampMixin):
    """댓글 모델."""

    __tablename__ = "comments"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    post_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("posts.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    parent_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("comments.id", ondelete="CASCADE"),
        nullable=True,
        index=True,
    )
    author_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    content: Mapped[str] = mapped_column(Text, nullable=False)
    is_secret: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    like_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    # Relationships
    post: Mapped["Post"] = relationship("Post", back_populates="comments")
    author: Mapped["User"] = relationship("User")
    parent: Mapped[Optional["Comment"]] = relationship(
        "Comment",
        remote_side=[id],
        back_populates="replies",
    )
    replies: Mapped[list["Comment"]] = relationship(
        "Comment",
        back_populates="parent",
        cascade="all, delete-orphan",
    )


class Attachment(Base, TimestampMixin):
    """첨부파일 모델."""

    __tablename__ = "attachments"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    post_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("posts.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    original_name: Mapped[str] = mapped_column(String(255), nullable=False)
    stored_name: Mapped[str] = mapped_column(String(255), nullable=False)
    file_path: Mapped[str] = mapped_column(String(500), nullable=False)
    file_size: Mapped[int] = mapped_column(Integer, nullable=False)
    mime_type: Mapped[str] = mapped_column(String(100), nullable=False)
    download_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    # Relationships
    post: Mapped["Post"] = relationship("Post", back_populates="attachments")
