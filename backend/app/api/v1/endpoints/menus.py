"""메뉴 관리 API 엔드포인트."""
from typing import Any, Optional
from uuid import UUID

from fastapi import APIRouter, HTTPException, Query, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.api.deps import CurrentAdminOptional, DbSession
from app.models import Menu, User
from app.schemas import MenuCreate, MenuListResponse, MenuMove, MenuReorder, MenuResponse, MenuTreeNode, MenuUpdate

router = APIRouter()


def get_user_id(user: User | None) -> UUID | None:
    """개발 모드에서는 None 반환, 프로덕션에서는 user.id 반환."""
    return user.id if user else None


async def build_menu_path(db: AsyncSession, menu: Menu) -> str:
    """메뉴의 경로를 생성 (예: /1/2/3)."""
    if not menu.parent_id:
        return f"/{menu.id}"

    # 부모 메뉴 조회
    result = await db.execute(select(Menu).where(Menu.id == menu.parent_id))
    parent = result.scalar_one_or_none()

    if parent:
        return f"{parent.path}/{menu.id}"
    return f"/{menu.id}"


async def calculate_depth(db: AsyncSession, parent_id: Optional[UUID]) -> int:
    """부모 메뉴로부터 depth 계산."""
    if not parent_id:
        return 0

    result = await db.execute(select(Menu).where(Menu.id == parent_id))
    parent = result.scalar_one_or_none()

    if parent:
        return parent.depth + 1
    return 0


async def build_menu_tree(menus: list[Menu], parent_id: Optional[UUID] = None) -> list[MenuTreeNode]:
    """메뉴 목록을 트리 구조로 변환."""
    tree = []
    for menu in menus:
        if menu.parent_id == parent_id:
            children = await build_menu_tree(menus, menu.id)
            node = MenuTreeNode(
                id=menu.id,
                menu_name=menu.menu_name,
                menu_code=menu.menu_code,
                menu_type=menu.menu_type,
                parent_id=menu.parent_id,
                depth=menu.depth,
                sort_order=menu.sort_order,
                icon=menu.icon,
                link_url=menu.link_url,
                is_visible=menu.is_visible,
                is_active=menu.is_active,
                children=children,
            )
            tree.append(node)
    return sorted(tree, key=lambda x: x.sort_order)


@router.get("", response_model=MenuListResponse)
async def get_menus(
    *,
    db: DbSession,
    current_user: CurrentAdminOptional,
    menu_type: Optional[str] = Query(None, description="메뉴 타입 필터 (site/user/admin 등)"),
    parent_id: Optional[UUID] = Query(None, description="부모 메뉴 ID 필터"),
    include_deleted: bool = Query(False, description="삭제된 항목 포함 여부"),
) -> Any:
    """메뉴 목록 조회.

    Args:
        db: DB 세션
        current_user: 관리자 사용자
        menu_type: 메뉴 타입 필터 (선택)
        parent_id: 부모 메뉴 ID 필터 (선택)
        include_deleted: 삭제된 항목 포함 여부

    Returns:
        메뉴 목록
    """
    query = select(Menu).options(selectinload(Menu.parent))

    if not include_deleted:
        query = query.where(Menu.is_deleted == False)  # noqa: E712

    if menu_type:
        query = query.where(Menu.menu_type == menu_type)

    if parent_id is not None:
        query = query.where(Menu.parent_id == parent_id)

    query = query.order_by(Menu.menu_type, Menu.parent_id, Menu.sort_order)

    result = await db.execute(query)
    menus = result.scalars().all()

    # parent_name 추가
    menu_responses = []
    for menu in menus:
        menu_dict = {
            "id": menu.id,
            "menu_type": menu.menu_type,
            "parent_id": menu.parent_id,
            "depth": menu.depth,
            "sort_order": menu.sort_order,
            "path": menu.path,
            "menu_name": menu.menu_name,
            "menu_code": menu.menu_code,
            "description": menu.description,
            "icon": menu.icon,
            "link_type": menu.link_type,
            "link_url": menu.link_url,
            "external_url": menu.external_url,
            "permission_type": menu.permission_type,
            "feature_key": menu.feature_key,
            "is_visible": menu.is_visible,
            "is_expandable": menu.is_expandable,
            "default_expanded": menu.default_expanded,
            "created_at": menu.created_at,
            "created_by": menu.created_by,
            "updated_at": menu.updated_at,
            "updated_by": menu.updated_by,
            "is_active": menu.is_active,
            "is_deleted": menu.is_deleted,
            "parent_name": menu.parent.menu_name if menu.parent else None,
        }
        menu_responses.append(MenuResponse(**menu_dict))

    return MenuListResponse(items=menu_responses, total=len(menu_responses))


@router.get("/tree", response_model=list[MenuTreeNode])
async def get_menus_tree(
    *,
    db: DbSession,
    current_user: CurrentAdminOptional,
    menu_type: Optional[str] = Query(None, description="메뉴 타입 필터"),
) -> Any:
    """메뉴 트리 구조 조회.

    Args:
        db: DB 세션
        current_user: 관리자 사용자
        menu_type: 메뉴 타입 필터 (선택)

    Returns:
        트리 구조의 메뉴 목록
    """
    query = select(Menu).where(Menu.is_deleted == False)  # noqa: E712

    if menu_type:
        query = query.where(Menu.menu_type == menu_type)

    query = query.order_by(Menu.sort_order)

    result = await db.execute(query)
    menus = result.scalars().all()

    return await build_menu_tree(list(menus))


@router.get("/{menu_id}", response_model=MenuResponse)
async def get_menu(
    *,
    db: DbSession,
    current_user: CurrentAdminOptional,
    menu_id: UUID,
) -> Any:
    """메뉴 상세 조회.

    Args:
        db: DB 세션
        current_user: 관리자 사용자
        menu_id: 메뉴 ID

    Returns:
        메뉴 상세 정보

    Raises:
        HTTPException: 메뉴를 찾을 수 없는 경우 404
    """
    result = await db.execute(
        select(Menu)
        .options(selectinload(Menu.parent))
        .where(Menu.id == menu_id)
    )
    menu = result.scalar_one_or_none()

    if not menu:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Menu with id '{menu_id}' not found",
        )

    menu_dict = {
        "id": menu.id,
        "menu_type": menu.menu_type,
        "parent_id": menu.parent_id,
        "depth": menu.depth,
        "sort_order": menu.sort_order,
        "path": menu.path,
        "menu_name": menu.menu_name,
        "menu_code": menu.menu_code,
        "description": menu.description,
        "icon": menu.icon,
        "link_type": menu.link_type,
        "link_url": menu.link_url,
        "external_url": menu.external_url,
        "permission_type": menu.permission_type,
            "feature_key": menu.feature_key,
        "is_visible": menu.is_visible,
        "is_expandable": menu.is_expandable,
        "default_expanded": menu.default_expanded,
        "created_at": menu.created_at,
        "created_by": menu.created_by,
        "updated_at": menu.updated_at,
        "updated_by": menu.updated_by,
        "is_active": menu.is_active,
        "is_deleted": menu.is_deleted,
        "parent_name": menu.parent.menu_name if menu.parent else None,
    }

    return MenuResponse(**menu_dict)


@router.post("", response_model=MenuResponse, status_code=status.HTTP_201_CREATED)
async def create_menu(
    *,
    db: DbSession,
    current_user: CurrentAdminOptional,
    menu_in: MenuCreate,
) -> Any:
    """메뉴 생성.

    Args:
        db: DB 세션
        current_user: 관리자 사용자
        menu_in: 메뉴 생성 데이터

    Returns:
        생성된 메뉴

    Raises:
        HTTPException: 중복된 메뉴 코드인 경우 400
    """
    # 중복 코드 체크
    result = await db.execute(select(Menu).where(Menu.menu_code == menu_in.menu_code))
    existing = result.scalar_one_or_none()

    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Menu with code '{menu_in.menu_code}' already exists",
        )

    # 부모 메뉴 존재 여부 확인
    if menu_in.parent_id:
        result = await db.execute(select(Menu).where(Menu.id == menu_in.parent_id))
        parent = result.scalar_one_or_none()
        if not parent:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Parent menu with id '{menu_in.parent_id}' not found",
            )

    # depth 계산
    depth = await calculate_depth(db, menu_in.parent_id)

    # 같은 부모의 메뉴 중 가장 큰 sort_order 찾기
    query = select(func.max(Menu.sort_order)).where(Menu.parent_id == menu_in.parent_id)
    result = await db.execute(query)
    max_order = result.scalar_one_or_none() or -1
    next_order = max_order + 1

    # 메뉴 생성
    user_id = get_user_id(current_user)
    menu = Menu(
        **menu_in.model_dump(),
        depth=depth,
        sort_order=next_order,
        created_by=user_id,
        updated_by=user_id,
    )

    db.add(menu)
    await db.flush()

    # 경로 생성
    menu.path = await build_menu_path(db, menu)

    await db.commit()
    await db.refresh(menu)

    # 부모 메뉴 정보 로드
    if menu.parent_id:
        await db.refresh(menu, ["parent"])

    menu_dict = {
        "id": menu.id,
        "menu_type": menu.menu_type,
        "parent_id": menu.parent_id,
        "depth": menu.depth,
        "sort_order": menu.sort_order,
        "path": menu.path,
        "menu_name": menu.menu_name,
        "menu_code": menu.menu_code,
        "description": menu.description,
        "icon": menu.icon,
        "link_type": menu.link_type,
        "link_url": menu.link_url,
        "external_url": menu.external_url,
        "permission_type": menu.permission_type,
            "feature_key": menu.feature_key,
        "is_visible": menu.is_visible,
        "is_expandable": menu.is_expandable,
        "default_expanded": menu.default_expanded,
        "created_at": menu.created_at,
        "created_by": menu.created_by,
        "updated_at": menu.updated_at,
        "updated_by": menu.updated_by,
        "is_active": menu.is_active,
        "is_deleted": menu.is_deleted,
        "parent_name": menu.parent.menu_name if menu.parent_id and menu.parent else None,
    }

    return MenuResponse(**menu_dict)


@router.patch("/{menu_id}", response_model=MenuResponse)
async def update_menu(
    *,
    db: DbSession,
    current_user: CurrentAdminOptional,
    menu_id: UUID,
    menu_in: MenuUpdate,
) -> Any:
    """메뉴 수정.

    Args:
        db: DB 세션
        current_user: 관리자 사용자
        menu_id: 메뉴 ID
        menu_in: 메뉴 수정 데이터

    Returns:
        수정된 메뉴

    Raises:
        HTTPException: 메뉴를 찾을 수 없는 경우 404
    """
    result = await db.execute(select(Menu).where(Menu.id == menu_id))
    menu = result.scalar_one_or_none()

    if not menu:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Menu with id '{menu_id}' not found",
        )

    # 메뉴 수정
    update_data = menu_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(menu, field, value)

    menu.updated_by = get_user_id(current_user)

    await db.commit()
    await db.refresh(menu)

    # 부모 메뉴 정보 로드
    if menu.parent_id:
        await db.refresh(menu, ["parent"])

    menu_dict = {
        "id": menu.id,
        "menu_type": menu.menu_type,
        "parent_id": menu.parent_id,
        "depth": menu.depth,
        "sort_order": menu.sort_order,
        "path": menu.path,
        "menu_name": menu.menu_name,
        "menu_code": menu.menu_code,
        "description": menu.description,
        "icon": menu.icon,
        "link_type": menu.link_type,
        "link_url": menu.link_url,
        "external_url": menu.external_url,
        "permission_type": menu.permission_type,
            "feature_key": menu.feature_key,
        "is_visible": menu.is_visible,
        "is_expandable": menu.is_expandable,
        "default_expanded": menu.default_expanded,
        "created_at": menu.created_at,
        "created_by": menu.created_by,
        "updated_at": menu.updated_at,
        "updated_by": menu.updated_by,
        "is_active": menu.is_active,
        "is_deleted": menu.is_deleted,
        "parent_name": menu.parent.menu_name if menu.parent_id and menu.parent else None,
    }

    return MenuResponse(**menu_dict)


@router.delete("/{menu_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_menu(
    *,
    db: DbSession,
    current_user: CurrentAdminOptional,
    menu_id: UUID,
    hard_delete: bool = Query(False, description="영구 삭제 여부 (기본: Soft Delete)"),
) -> None:
    """메뉴 삭제 (Soft Delete).

    Args:
        db: DB 세션
        current_user: 관리자 사용자
        menu_id: 메뉴 ID
        hard_delete: 영구 삭제 여부

    Raises:
        HTTPException: 메뉴를 찾을 수 없는 경우 404
    """
    result = await db.execute(select(Menu).where(Menu.id == menu_id))
    menu = result.scalar_one_or_none()

    if not menu:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Menu with id '{menu_id}' not found",
        )

    if hard_delete:
        await db.delete(menu)
    else:
        menu.is_deleted = True
        menu.is_active = False
        menu.updated_by = get_user_id(current_user)

    await db.commit()


@router.put("/{menu_id}/move", response_model=MenuResponse)
async def move_menu(
    *,
    db: DbSession,
    current_user: CurrentAdminOptional,
    menu_id: UUID,
    move_in: MenuMove,
) -> Any:
    """메뉴 이동 (부모 변경 및 순서 변경).

    Args:
        db: DB 세션
        current_user: 관리자 사용자
        menu_id: 메뉴 ID
        move_in: 이동 정보

    Returns:
        이동된 메뉴

    Raises:
        HTTPException: 메뉴를 찾을 수 없는 경우 404
    """
    result = await db.execute(select(Menu).where(Menu.id == menu_id))
    menu = result.scalar_one_or_none()

    if not menu:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Menu with id '{menu_id}' not found",
        )

    # 부모 메뉴 존재 확인
    if move_in.parent_id:
        result = await db.execute(select(Menu).where(Menu.id == move_in.parent_id))
        parent = result.scalar_one_or_none()
        if not parent:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Parent menu with id '{move_in.parent_id}' not found",
            )

        # 자기 자신이나 하위 메뉴로 이동하는지 체크
        if menu_id == move_in.parent_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot move menu to itself",
            )

    # 메뉴 이동
    menu.parent_id = move_in.parent_id
    menu.sort_order = move_in.sort_order
    menu.depth = await calculate_depth(db, move_in.parent_id)
    menu.path = await build_menu_path(db, menu)
    menu.updated_by = get_user_id(current_user)

    await db.commit()
    await db.refresh(menu)

    # 부모 메뉴 정보 로드
    if menu.parent_id:
        await db.refresh(menu, ["parent"])

    menu_dict = {
        "id": menu.id,
        "menu_type": menu.menu_type,
        "parent_id": menu.parent_id,
        "depth": menu.depth,
        "sort_order": menu.sort_order,
        "path": menu.path,
        "menu_name": menu.menu_name,
        "menu_code": menu.menu_code,
        "description": menu.description,
        "icon": menu.icon,
        "link_type": menu.link_type,
        "link_url": menu.link_url,
        "external_url": menu.external_url,
        "permission_type": menu.permission_type,
            "feature_key": menu.feature_key,
        "is_visible": menu.is_visible,
        "is_expandable": menu.is_expandable,
        "default_expanded": menu.default_expanded,
        "created_at": menu.created_at,
        "created_by": menu.created_by,
        "updated_at": menu.updated_at,
        "updated_by": menu.updated_by,
        "is_active": menu.is_active,
        "is_deleted": menu.is_deleted,
        "parent_name": menu.parent.menu_name if menu.parent_id and menu.parent else None,
    }

    return MenuResponse(**menu_dict)


@router.put("/reorder", response_model=dict)
async def reorder_menus(
    *,
    db: DbSession,
    current_user: CurrentAdminOptional,
    reorder_in: MenuReorder,
) -> Any:
    """메뉴 순서 일괄 변경.

    Args:
        db: DB 세션
        current_user: 관리자 사용자
        reorder_in: 정렬된 메뉴 ID 목록

    Returns:
        성공 메시지
    """
    for index, menu_id in enumerate(reorder_in.ordered_ids):
        result = await db.execute(select(Menu).where(Menu.id == menu_id))
        menu = result.scalar_one_or_none()

        if menu:
            menu.sort_order = index
            menu.updated_by = get_user_id(current_user)

    await db.commit()

    return {"message": "메뉴 순서가 변경되었습니다.", "count": len(reorder_in.ordered_ids)}
