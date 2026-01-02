"""게시판 서비스 레이어."""
from typing import Optional, List
from uuid import UUID

from passlib.hash import bcrypt
from sqlalchemy import select, func, or_, and_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.board_constants import (
    BoardErrorCode,
    Permission,
    DEFAULT_PAGE_SIZE,
    MAX_PAGE_SIZE,
)
from app.core.board_exceptions import BoardException
from app.models.board import Board, BoardCategory, Post, Comment
from app.models.user import User
from app.schemas.board import (
    BoardCreate,
    BoardUpdate,
    BoardCategoryCreate,
    PostCreate,
    PostUpdate,
    CommentCreate,
)


class BoardService:
    """게시판 서비스."""

    @staticmethod
    async def get_board_by_code(
        db: AsyncSession,
        code: str,
    ) -> Optional[Board]:
        """게시판 코드로 조회."""
        result = await db.execute(
            select(Board)
            .where(Board.code == code)
            .where(Board.is_deleted == False)  # noqa: E712
        )
        return result.scalar_one_or_none()

    @staticmethod
    async def get_board_by_id(
        db: AsyncSession,
        board_id: UUID,
    ) -> Optional[Board]:
        """게시판 ID로 조회."""
        result = await db.execute(
            select(Board)
            .where(Board.id == board_id)
            .where(Board.is_deleted == False)  # noqa: E712
        )
        return result.scalar_one_or_none()

    @staticmethod
    async def list_boards(
        db: AsyncSession,
        is_active: Optional[bool] = None,
    ) -> List[Board]:
        """게시판 목록 조회."""
        query = select(Board).where(Board.is_deleted == False)  # noqa: E712

        if is_active is not None:
            query = query.where(Board.is_active == is_active)

        query = query.order_by(Board.sort_order, Board.created_at.desc())
        result = await db.execute(query)
        return list(result.scalars().all())

    @staticmethod
    async def create_board(
        db: AsyncSession,
        board_data: BoardCreate,
        creator_id: UUID,
    ) -> Board:
        """게시판 생성 (관리자만)."""
        # 코드 중복 검사
        existing = await BoardService.get_board_by_code(db, board_data.code)
        if existing:
            raise BoardException(
                BoardErrorCode.BOARD_CODE_DUPLICATE,
                f"게시판 코드 '{board_data.code}'가 이미 존재합니다.",
            )

        board = Board(
            **board_data.model_dump(),
            created_by=creator_id,
            updated_by=creator_id,
        )
        db.add(board)
        await db.commit()
        await db.refresh(board)
        return board

    @staticmethod
    async def update_board(
        db: AsyncSession,
        board: Board,
        board_data: BoardUpdate,
        updater_id: UUID,
    ) -> Board:
        """게시판 수정 (관리자만)."""
        update_dict = board_data.model_dump(exclude_unset=True)
        for key, value in update_dict.items():
            setattr(board, key, value)

        board.updated_by = updater_id
        await db.commit()
        await db.refresh(board)
        return board

    @staticmethod
    async def delete_board(
        db: AsyncSession,
        board: Board,
        deleter_id: UUID,
    ) -> None:
        """게시판 삭제 (소프트 삭제, 관리자만)."""
        board.is_deleted = True
        board.is_active = False
        board.updated_by = deleter_id
        await db.commit()

    @staticmethod
    async def check_board_permission(
        board: Board,
        permission_type: str,  # "read", "write", "comment"
        current_user: Optional[User] = None,
    ) -> None:
        """게시판 권한 검증.

        Args:
            board: 게시판 객체
            permission_type: "read", "write", "comment"
            current_user: 현재 사용자 (없으면 비회원)

        Raises:
            BoardException: 권한 없음
        """
        permission = getattr(board, f"{permission_type}_permission")

        if permission == Permission.DISABLED.value:
            raise BoardException(
                BoardErrorCode.ACCESS_DENIED,
                "이 기능은 비활성화되어 있습니다.",
            )

        if permission == Permission.ADMIN.value:
            if not current_user or current_user.role != "admin":
                raise BoardException(
                    BoardErrorCode.ACCESS_DENIED,
                    "관리자만 접근할 수 있습니다.",
                )

        if permission == Permission.MEMBER.value:
            if not current_user:
                raise BoardException(
                    BoardErrorCode.AUTH_REQUIRED,
                    "로그인이 필요합니다.",
                    401,
                )

        # Permission.PUBLIC: 누구나 접근 가능


class CategoryService:
    """게시판 분류 서비스."""

    @staticmethod
    async def list_categories(
        db: AsyncSession,
        board_id: UUID,
    ) -> List[BoardCategory]:
        """분류 목록 조회."""
        result = await db.execute(
            select(BoardCategory)
            .where(BoardCategory.board_id == board_id)
            .where(BoardCategory.is_deleted == False)  # noqa: E712
            .where(BoardCategory.is_active == True)  # noqa: E712
            .order_by(BoardCategory.sort_order, BoardCategory.created_at)
        )
        return list(result.scalars().all())

    @staticmethod
    async def create_category(
        db: AsyncSession,
        board_id: UUID,
        category_data: BoardCategoryCreate,
        creator_id: UUID,
    ) -> BoardCategory:
        """분류 생성 (관리자만)."""
        category = BoardCategory(
            board_id=board_id,
            **category_data.model_dump(),
            created_by=creator_id,
            updated_by=creator_id,
        )
        db.add(category)
        await db.commit()
        await db.refresh(category)
        return category


class PostService:
    """게시글 서비스."""

    @staticmethod
    async def get_post_by_id(
        db: AsyncSession,
        post_id: UUID,
    ) -> Optional[Post]:
        """게시글 ID로 조회."""
        result = await db.execute(
            select(Post)
            .options(selectinload(Post.author))
            .where(Post.id == post_id)
            .where(Post.is_deleted == False)  # noqa: E712
        )
        return result.scalar_one_or_none()

    @staticmethod
    async def list_posts(
        db: AsyncSession,
        board_id: UUID,
        category_id: Optional[UUID] = None,
        search_keyword: Optional[str] = None,
        is_notice: Optional[bool] = None,
        page: int = 1,
        page_size: int = DEFAULT_PAGE_SIZE,
    ) -> tuple[List[Post], int]:
        """게시글 목록 조회.

        Returns:
            (게시글 목록, 전체 개수)
        """
        # 페이지 크기 제한
        page_size = min(page_size, MAX_PAGE_SIZE)
        offset = (page - 1) * page_size

        # 기본 쿼리
        query = (
            select(Post)
            .options(selectinload(Post.author))
            .where(Post.board_id == board_id)
            .where(Post.is_deleted == False)  # noqa: E712
        )

        # 필터 적용
        if category_id:
            query = query.where(Post.category_id == category_id)

        if is_notice is not None:
            query = query.where(Post.is_notice == is_notice)

        if search_keyword:
            query = query.where(
                or_(
                    Post.title.ilike(f"%{search_keyword}%"),
                    Post.content.ilike(f"%{search_keyword}%"),
                )
            )

        # 전체 개수 조회
        count_query = select(func.count()).select_from(query.subquery())
        total_result = await db.execute(count_query)
        total = total_result.scalar_one()

        # 정렬 및 페이지네이션
        # 공지사항은 상단 고정, 나머지는 최신순
        query = query.order_by(
            Post.is_notice.desc(),
            Post.created_at.desc(),
        ).limit(page_size).offset(offset)

        result = await db.execute(query)
        posts = list(result.scalars().all())

        return posts, total

    @staticmethod
    async def create_post(
        db: AsyncSession,
        board: Board,
        post_data: PostCreate,
        author_id: UUID,
    ) -> Post:
        """게시글 작성."""
        # 공지사항은 관리자만
        if post_data.is_notice:
            raise BoardException(
                BoardErrorCode.ACCESS_DENIED,
                "공지사항은 관리자만 작성할 수 있습니다.",
            )

        # 비밀글 비밀번호 해싱
        secret_password = None
        if post_data.is_secret and post_data.secret_password:
            secret_password = bcrypt.hash(post_data.secret_password)

        post = Post(
            board_id=board.id,
            author_id=author_id,
            title=post_data.title,
            content=post_data.content,
            category_id=post_data.category_id,
            is_notice=post_data.is_notice,
            is_secret=post_data.is_secret,
            secret_password=secret_password,
            created_by=author_id,
            updated_by=author_id,
        )
        db.add(post)
        await db.commit()
        await db.refresh(post)
        return post

    @staticmethod
    async def update_post(
        db: AsyncSession,
        post: Post,
        post_data: PostUpdate,
        updater_id: UUID,
    ) -> Post:
        """게시글 수정."""
        update_dict = post_data.model_dump(exclude_unset=True)

        # 비밀글 비밀번호 해싱
        if "secret_password" in update_dict and update_dict["secret_password"]:
            update_dict["secret_password"] = bcrypt.hash(update_dict["secret_password"])

        for key, value in update_dict.items():
            setattr(post, key, value)

        post.updated_by = updater_id
        await db.commit()
        await db.refresh(post)
        return post

    @staticmethod
    async def delete_post(
        db: AsyncSession,
        post: Post,
        deleter_id: UUID,
    ) -> None:
        """게시글 삭제 (소프트 삭제)."""
        post.is_deleted = True
        post.updated_by = deleter_id
        await db.commit()

    @staticmethod
    async def increment_view_count(
        db: AsyncSession,
        post: Post,
    ) -> None:
        """조회수 증가."""
        post.view_count += 1
        await db.commit()

    @staticmethod
    async def check_secret_post_access(
        post: Post,
        current_user: Optional[User],
        password: Optional[str] = None,
    ) -> bool:
        """비밀글 접근 권한 확인.

        Returns:
            True: 접근 가능
            False: 접근 불가

        Raises:
            BoardException: 비밀글 접근 불가
        """
        if not post.is_secret:
            return True

        # 관리자는 항상 접근 가능
        if current_user and current_user.role == "admin":
            return True

        # 작성자는 항상 접근 가능
        if current_user and post.author_id == current_user.id:
            return True

        # 비밀번호 확인
        if post.secret_password and password:
            if bcrypt.verify(password, post.secret_password):
                return True

        raise BoardException(
            BoardErrorCode.SECRET_POST_ACCESS_DENIED,
            "비밀글은 작성자와 관리자만 볼 수 있습니다.",
        )

    @staticmethod
    def check_post_edit_permission(
        post: Post,
        current_user: User,
    ) -> None:
        """게시글 수정/삭제 권한 확인.

        Raises:
            BoardException: 권한 없음
        """
        # 관리자는 모든 글 수정/삭제 가능
        if current_user.role == "admin":
            return

        # 작성자만 수정/삭제 가능
        if post.author_id != current_user.id:
            raise BoardException(
                BoardErrorCode.ACCESS_DENIED,
                "본인이 작성한 글만 수정/삭제할 수 있습니다.",
            )


class CommentService:
    """댓글 서비스."""

    @staticmethod
    async def get_comment_by_id(
        db: AsyncSession,
        comment_id: UUID,
    ) -> Optional[Comment]:
        """댓글 ID로 조회."""
        result = await db.execute(
            select(Comment)
            .options(selectinload(Comment.author))
            .where(Comment.id == comment_id)
            .where(Comment.is_deleted == False)  # noqa: E712
        )
        return result.scalar_one_or_none()

    @staticmethod
    async def list_comments(
        db: AsyncSession,
        post_id: UUID,
    ) -> List[Comment]:
        """댓글 목록 조회 (대댓글 포함)."""
        result = await db.execute(
            select(Comment)
            .options(
                selectinload(Comment.author),
                selectinload(Comment.replies).selectinload(Comment.author),
            )
            .where(Comment.post_id == post_id)
            .where(Comment.is_deleted == False)  # noqa: E712
            .where(Comment.parent_id == None)  # noqa: E711 (최상위 댓글만)
            .order_by(Comment.created_at.asc())
        )
        return list(result.scalars().all())

    @staticmethod
    async def create_comment(
        db: AsyncSession,
        post: Post,
        comment_data: CommentCreate,
        author_id: UUID,
    ) -> Comment:
        """댓글 작성."""
        comment = Comment(
            post_id=post.id,
            parent_id=comment_data.parent_id,
            author_id=author_id,
            content=comment_data.content,
            is_secret=comment_data.is_secret,
            created_by=author_id,
            updated_by=author_id,
        )
        db.add(comment)

        # 게시글 댓글 수 증가
        post.comment_count += 1

        await db.commit()
        await db.refresh(comment)
        return comment

    @staticmethod
    async def delete_comment(
        db: AsyncSession,
        comment: Comment,
        post: Post,
        deleter_id: UUID,
    ) -> None:
        """댓글 삭제 (소프트 삭제)."""
        comment.is_deleted = True
        comment.updated_by = deleter_id

        # 게시글 댓글 수 감소
        if post.comment_count > 0:
            post.comment_count -= 1

        await db.commit()

    @staticmethod
    def check_comment_edit_permission(
        comment: Comment,
        current_user: User,
    ) -> None:
        """댓글 수정/삭제 권한 확인.

        Raises:
            BoardException: 권한 없음
        """
        # 관리자는 모든 댓글 삭제 가능
        if current_user.role == "admin":
            return

        # 작성자만 수정/삭제 가능
        if comment.author_id != current_user.id:
            raise BoardException(
                BoardErrorCode.ACCESS_DENIED,
                "본인이 작성한 댓글만 삭제할 수 있습니다.",
            )
