"""게시판 API 엔드포인트."""
from typing import Optional, List
from uuid import UUID

from fastapi import APIRouter, Query

from app.api.deps import CurrentUser, CurrentUserOptional, CurrentAdmin, DbSession
from app.core.board_constants import BoardErrorCode, DEFAULT_PAGE_SIZE
from app.core.board_exceptions import BoardException
from app.schemas.board import (
    BoardResponse,
    BoardCreate,
    BoardUpdate,
    BoardCategoryResponse,
    BoardCategoryCreate,
    PostResponse,
    PostCreate,
    PostUpdate,
    PostListItem,
    PaginatedResponse,
    CommentResponse,
    CommentCreate,
)
from app.services.board import (
    BoardService,
    CategoryService,
    PostService,
    CommentService,
)

router = APIRouter()


# ==================== Board 엔드포인트 ====================
@router.get("/boards", response_model=List[BoardResponse])
async def list_boards(
    db: DbSession,
    is_active: Optional[bool] = Query(None, description="활성화 상태 필터"),
) -> List[BoardResponse]:
    """게시판 목록 조회.

    누구나 접근 가능합니다.
    """
    boards = await BoardService.list_boards(db, is_active=is_active)
    return [BoardResponse.model_validate(board) for board in boards]


@router.post("/boards", response_model=BoardResponse)
async def create_board(
    board_data: BoardCreate,
    current_user: CurrentAdmin,
    db: DbSession,
) -> BoardResponse:
    """게시판 생성.

    관리자만 접근 가능합니다.
    """
    board = await BoardService.create_board(db, board_data, current_user.id)
    return BoardResponse.model_validate(board)


@router.get("/boards/{code}", response_model=BoardResponse)
async def get_board(
    code: str,
    db: DbSession,
) -> BoardResponse:
    """게시판 상세 조회.

    누구나 접근 가능합니다.
    """
    board = await BoardService.get_board_by_code(db, code)
    if not board:
        raise BoardException(
            BoardErrorCode.BOARD_NOT_FOUND,
            "게시판을 찾을 수 없습니다.",
            404,
        )
    return BoardResponse.model_validate(board)


@router.patch("/boards/{code}", response_model=BoardResponse)
async def update_board(
    code: str,
    board_data: BoardUpdate,
    current_user: CurrentAdmin,
    db: DbSession,
) -> BoardResponse:
    """게시판 수정.

    관리자만 접근 가능합니다.
    """
    board = await BoardService.get_board_by_code(db, code)
    if not board:
        raise BoardException(
            BoardErrorCode.BOARD_NOT_FOUND,
            "게시판을 찾을 수 없습니다.",
            404,
        )

    board = await BoardService.update_board(db, board, board_data, current_user.id)
    return BoardResponse.model_validate(board)


@router.delete("/boards/{code}")
async def delete_board(
    code: str,
    current_user: CurrentAdmin,
    db: DbSession,
) -> dict:
    """게시판 삭제 (소프트 삭제).

    관리자만 접근 가능합니다.
    """
    board = await BoardService.get_board_by_code(db, code)
    if not board:
        raise BoardException(
            BoardErrorCode.BOARD_NOT_FOUND,
            "게시판을 찾을 수 없습니다.",
            404,
        )

    await BoardService.delete_board(db, board, current_user.id)
    return {"success": True, "message": "게시판이 삭제되었습니다."}


# ==================== Category 엔드포인트 ====================
@router.get("/boards/{code}/categories", response_model=List[BoardCategoryResponse])
async def list_categories(
    code: str,
    db: DbSession,
) -> List[BoardCategoryResponse]:
    """게시판 분류 목록 조회.

    누구나 접근 가능합니다.
    """
    board = await BoardService.get_board_by_code(db, code)
    if not board:
        raise BoardException(
            BoardErrorCode.BOARD_NOT_FOUND,
            "게시판을 찾을 수 없습니다.",
            404,
        )

    categories = await CategoryService.list_categories(db, board.id)
    return [BoardCategoryResponse.model_validate(cat) for cat in categories]


@router.post("/boards/{code}/categories", response_model=BoardCategoryResponse)
async def create_category(
    code: str,
    category_data: BoardCategoryCreate,
    current_user: CurrentAdmin,
    db: DbSession,
) -> BoardCategoryResponse:
    """게시판 분류 생성.

    관리자만 접근 가능합니다.
    """
    board = await BoardService.get_board_by_code(db, code)
    if not board:
        raise BoardException(
            BoardErrorCode.BOARD_NOT_FOUND,
            "게시판을 찾을 수 없습니다.",
            404,
        )

    category = await CategoryService.create_category(
        db, board.id, category_data, current_user.id
    )
    return BoardCategoryResponse.model_validate(category)


# ==================== Post 엔드포인트 ====================
@router.get("/boards/{code}/posts", response_model=PaginatedResponse)
async def list_posts(
    code: str,
    db: DbSession,
    current_user: CurrentUserOptional,
    category_id: Optional[UUID] = Query(None, description="분류 ID 필터"),
    search_keyword: Optional[str] = Query(None, description="검색 키워드 (제목, 내용)"),
    page: int = Query(1, ge=1, description="페이지 번호"),
    page_size: int = Query(DEFAULT_PAGE_SIZE, ge=1, le=100, description="페이지 크기"),
) -> PaginatedResponse:
    """게시글 목록 조회.

    게시판 읽기 권한에 따라 접근 가능합니다.
    """
    board = await BoardService.get_board_by_code(db, code)
    if not board:
        raise BoardException(
            BoardErrorCode.BOARD_NOT_FOUND,
            "게시판을 찾을 수 없습니다.",
            404,
        )

    # 읽기 권한 확인
    await BoardService.check_board_permission(board, "read", current_user)

    # 게시글 목록 조회 (공지사항 제외)
    posts, total = await PostService.list_posts(
        db,
        board.id,
        category_id=category_id,
        search_keyword=search_keyword,
        is_notice=False,
        page=page,
        page_size=page_size,
    )

    # PostListItem으로 변환
    items = [
        PostListItem(
            id=post.id,
            board_id=post.board_id,
            category_id=post.category_id,
            author_id=post.author_id,
            author_name=post.author.name,
            title=post.title,
            is_notice=post.is_notice,
            is_secret=post.is_secret,
            view_count=post.view_count,
            like_count=post.like_count,
            comment_count=post.comment_count,
            is_answered=post.is_answered,
            created_at=post.created_at,
        )
        for post in posts
    ]

    total_pages = (total + page_size - 1) // page_size

    return PaginatedResponse(
        items=items,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
    )


@router.post("/boards/{code}/posts", response_model=PostResponse)
async def create_post(
    code: str,
    post_data: PostCreate,
    current_user: CurrentUser,
    db: DbSession,
) -> PostResponse:
    """게시글 작성.

    게시판 쓰기 권한에 따라 접근 가능합니다.
    """
    board = await BoardService.get_board_by_code(db, code)
    if not board:
        raise BoardException(
            BoardErrorCode.BOARD_NOT_FOUND,
            "게시판을 찾을 수 없습니다.",
            404,
        )

    # 쓰기 권한 확인
    await BoardService.check_board_permission(board, "write", current_user)

    # 공지사항은 관리자만
    if post_data.is_notice and current_user.role != "admin":
        raise BoardException(
            BoardErrorCode.ACCESS_DENIED,
            "공지사항은 관리자만 작성할 수 있습니다.",
        )

    post = await PostService.create_post(db, board, post_data, current_user.id)
    return PostResponse.model_validate(post)


@router.get("/boards/{code}/posts/{post_id}", response_model=PostResponse)
async def get_post(
    code: str,
    post_id: UUID,
    db: DbSession,
    current_user: CurrentUserOptional,
    password: Optional[str] = Query(None, description="비밀글 비밀번호"),
) -> PostResponse:
    """게시글 상세 조회.

    비밀글은 작성자, 관리자, 또는 비밀번호를 아는 사람만 볼 수 있습니다.
    """
    board = await BoardService.get_board_by_code(db, code)
    if not board:
        raise BoardException(
            BoardErrorCode.BOARD_NOT_FOUND,
            "게시판을 찾을 수 없습니다.",
            404,
        )

    # 읽기 권한 확인
    await BoardService.check_board_permission(board, "read", current_user)

    post = await PostService.get_post_by_id(db, post_id)
    if not post or post.board_id != board.id:
        raise BoardException(
            BoardErrorCode.POST_NOT_FOUND,
            "게시글을 찾을 수 없습니다.",
            404,
        )

    # 비밀글 접근 권한 확인
    await PostService.check_secret_post_access(post, current_user, password)

    # 조회수 증가 (본인 글 제외)
    if not current_user or post.author_id != current_user.id:
        await PostService.increment_view_count(db, post)

    return PostResponse.model_validate(post)


@router.patch("/boards/{code}/posts/{post_id}", response_model=PostResponse)
async def update_post(
    code: str,
    post_id: UUID,
    post_data: PostUpdate,
    current_user: CurrentUser,
    db: DbSession,
) -> PostResponse:
    """게시글 수정.

    작성자 또는 관리자만 수정 가능합니다.
    """
    board = await BoardService.get_board_by_code(db, code)
    if not board:
        raise BoardException(
            BoardErrorCode.BOARD_NOT_FOUND,
            "게시판을 찾을 수 없습니다.",
            404,
        )

    post = await PostService.get_post_by_id(db, post_id)
    if not post or post.board_id != board.id:
        raise BoardException(
            BoardErrorCode.POST_NOT_FOUND,
            "게시글을 찾을 수 없습니다.",
            404,
        )

    # 수정 권한 확인
    PostService.check_post_edit_permission(post, current_user)

    post = await PostService.update_post(db, post, post_data, current_user.id)
    return PostResponse.model_validate(post)


@router.delete("/boards/{code}/posts/{post_id}")
async def delete_post(
    code: str,
    post_id: UUID,
    current_user: CurrentUser,
    db: DbSession,
) -> dict:
    """게시글 삭제 (소프트 삭제).

    작성자 또는 관리자만 삭제 가능합니다.
    """
    board = await BoardService.get_board_by_code(db, code)
    if not board:
        raise BoardException(
            BoardErrorCode.BOARD_NOT_FOUND,
            "게시판을 찾을 수 없습니다.",
            404,
        )

    post = await PostService.get_post_by_id(db, post_id)
    if not post or post.board_id != board.id:
        raise BoardException(
            BoardErrorCode.POST_NOT_FOUND,
            "게시글을 찾을 수 없습니다.",
            404,
        )

    # 삭제 권한 확인
    PostService.check_post_edit_permission(post, current_user)

    await PostService.delete_post(db, post, current_user.id)
    return {"success": True, "message": "게시글이 삭제되었습니다."}


# ==================== Comment 엔드포인트 ====================
@router.get("/boards/{code}/posts/{post_id}/comments", response_model=List[CommentResponse])
async def list_comments(
    code: str,
    post_id: UUID,
    db: DbSession,
    current_user: CurrentUserOptional,
) -> List[CommentResponse]:
    """댓글 목록 조회.

    게시판 읽기 권한에 따라 접근 가능합니다.
    """
    board = await BoardService.get_board_by_code(db, code)
    if not board:
        raise BoardException(
            BoardErrorCode.BOARD_NOT_FOUND,
            "게시판을 찾을 수 없습니다.",
            404,
        )

    # 읽기 권한 확인
    await BoardService.check_board_permission(board, "read", current_user)

    post = await PostService.get_post_by_id(db, post_id)
    if not post or post.board_id != board.id:
        raise BoardException(
            BoardErrorCode.POST_NOT_FOUND,
            "게시글을 찾을 수 없습니다.",
            404,
        )

    comments = await CommentService.list_comments(db, post_id)
    return [CommentResponse.model_validate(comment) for comment in comments]


@router.post("/boards/{code}/posts/{post_id}/comments", response_model=CommentResponse)
async def create_comment(
    code: str,
    post_id: UUID,
    comment_data: CommentCreate,
    current_user: CurrentUser,
    db: DbSession,
) -> CommentResponse:
    """댓글 작성.

    게시판 댓글 권한에 따라 접근 가능합니다.
    """
    board = await BoardService.get_board_by_code(db, code)
    if not board:
        raise BoardException(
            BoardErrorCode.BOARD_NOT_FOUND,
            "게시판을 찾을 수 없습니다.",
            404,
        )

    # 댓글 권한 확인
    await BoardService.check_board_permission(board, "comment", current_user)

    post = await PostService.get_post_by_id(db, post_id)
    if not post or post.board_id != board.id:
        raise BoardException(
            BoardErrorCode.POST_NOT_FOUND,
            "게시글을 찾을 수 없습니다.",
            404,
        )

    comment = await CommentService.create_comment(db, post, comment_data, current_user.id)
    return CommentResponse.model_validate(comment)


@router.delete("/boards/comments/{comment_id}")
async def delete_comment(
    comment_id: UUID,
    current_user: CurrentUser,
    db: DbSession,
) -> dict:
    """댓글 삭제 (소프트 삭제).

    작성자 또는 관리자만 삭제 가능합니다.
    """
    comment = await CommentService.get_comment_by_id(db, comment_id)
    if not comment:
        raise BoardException(
            BoardErrorCode.COMMENT_NOT_FOUND,
            "댓글을 찾을 수 없습니다.",
            404,
        )

    # 삭제 권한 확인
    CommentService.check_comment_edit_permission(comment, current_user)

    # 게시글 조회 (댓글 수 감소를 위해)
    post = await PostService.get_post_by_id(db, comment.post_id)
    if not post:
        raise BoardException(
            BoardErrorCode.POST_NOT_FOUND,
            "게시글을 찾을 수 없습니다.",
            404,
        )

    await CommentService.delete_comment(db, comment, post, current_user.id)
    return {"success": True, "message": "댓글이 삭제되었습니다."}
