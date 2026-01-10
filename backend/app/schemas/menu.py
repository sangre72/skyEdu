"""Menu schemas for API."""
from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, Field


class MenuBase(BaseModel):
    """메뉴 기본 스키마."""

    menu_type: str = Field(default="admin", description="메뉴 타입 (site/user/admin)")
    parent_id: Optional[UUID] = Field(None, description="부모 메뉴 ID")
    menu_name: str = Field(..., min_length=1, max_length=100, description="메뉴 이름")
    menu_code: str = Field(..., min_length=1, max_length=50, description="메뉴 코드")
    description: Optional[str] = Field(None, description="메뉴 설명")
    icon: Optional[str] = Field(None, max_length=100, description="아이콘 (MUI 아이콘명)")
    link_type: str = Field(default="url", description="링크 타입 (url/new_window/modal/external/none)")
    link_url: Optional[str] = Field(None, max_length=1000, description="링크 URL")
    external_url: Optional[str] = Field(None, max_length=1000, description="외부 링크 URL")
    permission_type: str = Field(default="admin", description="권한 타입 (public/member/groups/users/roles/admin)")
    feature_key: Optional[str] = Field(None, max_length=100, description="연결된 기능 키 (예: feature.auth.login)")
    is_visible: bool = Field(default=True, description="표시 여부")
    is_expandable: bool = Field(default=True, description="확장 가능 여부")
    default_expanded: bool = Field(default=False, description="기본 확장 여부")


class MenuCreate(MenuBase):
    """메뉴 생성 스키마."""

    pass


class MenuUpdate(BaseModel):
    """메뉴 수정 스키마 (부분 업데이트)."""

    menu_name: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = None
    icon: Optional[str] = Field(None, max_length=100)
    link_type: Optional[str] = None
    link_url: Optional[str] = Field(None, max_length=1000)
    external_url: Optional[str] = Field(None, max_length=1000)
    permission_type: Optional[str] = None
    feature_key: Optional[str] = Field(None, max_length=100)
    is_visible: Optional[bool] = None
    is_expandable: Optional[bool] = None
    default_expanded: Optional[bool] = None
    is_active: Optional[bool] = None


class MenuMove(BaseModel):
    """메뉴 이동 스키마."""

    parent_id: Optional[UUID] = Field(None, description="새 부모 메뉴 ID (None이면 루트)")
    sort_order: int = Field(..., ge=0, description="새 정렬 순서")


class MenuReorder(BaseModel):
    """메뉴 순서 변경 스키마."""

    ordered_ids: list[UUID] = Field(..., description="정렬된 메뉴 ID 목록")


class MenuResponse(MenuBase):
    """메뉴 응답 스키마."""

    id: UUID
    depth: int
    sort_order: int
    path: str
    parent_name: Optional[str] = None
    created_at: datetime
    created_by: Optional[UUID] = None
    updated_at: datetime
    updated_by: Optional[UUID] = None
    is_active: bool
    is_deleted: bool

    model_config = {"from_attributes": True}


class MenuTreeNode(BaseModel):
    """메뉴 트리 노드 스키마 (재귀 구조)."""

    id: UUID
    menu_name: str
    menu_code: str
    menu_type: str
    parent_id: Optional[UUID] = None
    depth: int
    sort_order: int
    icon: Optional[str] = None
    link_url: Optional[str] = None
    feature_key: Optional[str] = None
    is_visible: bool
    is_active: bool
    children: list["MenuTreeNode"] = []

    model_config = {"from_attributes": True}


class MenuListResponse(BaseModel):
    """메뉴 목록 응답 스키마."""

    items: list[MenuResponse]
    total: int
