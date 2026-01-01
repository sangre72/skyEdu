"""매니저 API 엔드포인트."""
from datetime import date
from decimal import Decimal
from uuid import UUID

from fastapi import APIRouter, HTTPException, Query, status
from sqlalchemy import func, select
from sqlalchemy.orm import joinedload

from app.api.deps import CurrentAdmin, CurrentManager, CurrentUser, CurrentUserOptional, DbSession
from app.models.manager import Manager, ManagerSchedule, ManagerStatus
from app.models.review import Review
from app.models.user import User, UserRole
from app.schemas.manager import (
    ManagerCreate,
    ManagerDetailResponse,
    ManagerListResponse,
    ManagerResponse,
    ManagerUpdate,
    ScheduleCreate,
    ScheduleResponse,
    ScheduleUpdate,
)

router = APIRouter()


def _build_manager_response(manager: Manager) -> ManagerResponse:
    """매니저 응답 객체 생성."""
    return ManagerResponse(
        id=manager.id,
        user_id=manager.user_id,
        status=manager.status,
        grade=manager.grade,
        rating=Decimal(str(manager.rating)),
        total_services=manager.total_services,
        certifications=manager.certifications or [],
        available_areas=manager.available_areas or [],
        introduction=manager.introduction,
        profile_image=manager.profile_image,
        created_at=manager.created_at,
        name=manager.user.name if manager.user else None,
        phone=manager.user.phone if manager.user else None,
    )


@router.post("/register", response_model=ManagerResponse, status_code=status.HTTP_201_CREATED)
async def register_manager(
    data: ManagerCreate,
    current_user: CurrentUser,
    db: DbSession,
) -> ManagerResponse:
    """매니저 등록 신청."""
    # 이미 매니저인지 확인
    result = await db.execute(
        select(Manager).where(Manager.user_id == current_user.id)
    )
    existing = result.scalar_one_or_none()

    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="이미 매니저로 등록되어 있습니다.",
        )

    manager = Manager(
        user_id=current_user.id,
        introduction=data.introduction,
        certifications=data.certifications,
        available_areas=data.available_areas,
        status=ManagerStatus.PENDING.value,
    )

    db.add(manager)
    await db.flush()
    await db.refresh(manager, ["user"])

    # 사용자 역할 업데이트
    current_user.role = UserRole.MANAGER.value
    await db.flush()

    return _build_manager_response(manager)


@router.get("/", response_model=ManagerListResponse)
async def get_managers(
    db: DbSession,
    current_user: CurrentUserOptional,
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    area: str | None = None,
    status_filter: str | None = Query(None, alias="status"),
) -> ManagerListResponse:
    """매니저 목록 조회."""
    query = select(Manager).options(joinedload(Manager.user))

    # 공개 조회는 활성 매니저만
    if not current_user or current_user.role != UserRole.ADMIN.value:
        query = query.where(Manager.status == ManagerStatus.ACTIVE.value)
    elif status_filter:
        query = query.where(Manager.status == status_filter)

    # 지역 필터
    if area:
        query = query.where(Manager.available_areas.contains([area]))

    # 총 개수 조회
    count_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar() or 0

    # 페이지네이션
    offset = (page - 1) * limit
    query = query.order_by(Manager.rating.desc()).offset(offset).limit(limit)

    result = await db.execute(query)
    managers = result.scalars().unique().all()

    return ManagerListResponse(
        items=[_build_manager_response(m) for m in managers],
        total=total,
        page=page,
        limit=limit,
    )


@router.get("/me", response_model=ManagerDetailResponse)
async def get_my_manager_profile(
    current_user: CurrentManager,
    db: DbSession,
) -> ManagerDetailResponse:
    """내 매니저 프로필 조회."""
    result = await db.execute(
        select(Manager)
        .options(joinedload(Manager.user))
        .where(Manager.user_id == current_user.id)
    )
    manager = result.scalar_one_or_none()

    if not manager:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="매니저 프로필을 찾을 수 없습니다.",
        )

    # 리뷰 통계
    stats_result = await db.execute(
        select(
            func.count(Review.id).label("count"),
            func.avg(Review.rating).label("avg"),
        ).where(Review.manager_id == current_user.id)
    )
    stats = stats_result.first()

    base = _build_manager_response(manager)
    return ManagerDetailResponse(
        **base.model_dump(),
        reviews_count=stats.count if stats else 0,
        avg_rating=Decimal(str(stats.avg or 0)),
    )


@router.get("/{manager_id}", response_model=ManagerDetailResponse)
async def get_manager(
    manager_id: UUID,
    db: DbSession,
) -> ManagerDetailResponse:
    """매니저 상세 조회."""
    result = await db.execute(
        select(Manager)
        .options(joinedload(Manager.user))
        .where(Manager.id == manager_id)
    )
    manager = result.scalar_one_or_none()

    if not manager:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="매니저를 찾을 수 없습니다.",
        )

    # 리뷰 통계
    stats_result = await db.execute(
        select(
            func.count(Review.id).label("count"),
            func.avg(Review.rating).label("avg"),
        ).where(Review.manager_id == manager.user_id)
    )
    stats = stats_result.first()

    base = _build_manager_response(manager)
    return ManagerDetailResponse(
        **base.model_dump(),
        reviews_count=stats.count if stats else 0,
        avg_rating=Decimal(str(stats.avg or 0)),
    )


@router.patch("/me", response_model=ManagerResponse)
async def update_my_manager_profile(
    data: ManagerUpdate,
    current_user: CurrentManager,
    db: DbSession,
) -> ManagerResponse:
    """내 매니저 프로필 수정."""
    result = await db.execute(
        select(Manager)
        .options(joinedload(Manager.user))
        .where(Manager.user_id == current_user.id)
    )
    manager = result.scalar_one_or_none()

    if not manager:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="매니저 프로필을 찾을 수 없습니다.",
        )

    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(manager, field, value)

    await db.flush()
    await db.refresh(manager)

    return _build_manager_response(manager)


@router.patch("/{manager_id}/status", response_model=ManagerResponse)
async def update_manager_status(
    manager_id: UUID,
    new_status: str,
    current_user: CurrentAdmin,
    db: DbSession,
) -> ManagerResponse:
    """매니저 상태 변경 (관리자 전용)."""
    result = await db.execute(
        select(Manager)
        .options(joinedload(Manager.user))
        .where(Manager.id == manager_id)
    )
    manager = result.scalar_one_or_none()

    if not manager:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="매니저를 찾을 수 없습니다.",
        )

    if new_status not in [s.value for s in ManagerStatus]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="유효하지 않은 상태입니다.",
        )

    manager.status = new_status
    await db.flush()
    await db.refresh(manager)

    return _build_manager_response(manager)


# === 스케줄 관리 ===


@router.get("/{manager_id}/schedules", response_model=list[ScheduleResponse])
async def get_manager_schedules(
    manager_id: UUID,
    db: DbSession,
    start_date: date | None = None,
    end_date: date | None = None,
) -> list[ScheduleResponse]:
    """매니저 스케줄 조회."""
    query = select(ManagerSchedule).where(ManagerSchedule.manager_id == manager_id)

    if start_date:
        query = query.where(ManagerSchedule.date >= start_date)
    if end_date:
        query = query.where(ManagerSchedule.date <= end_date)

    query = query.order_by(ManagerSchedule.date, ManagerSchedule.start_time)

    result = await db.execute(query)
    schedules = result.scalars().all()

    return [ScheduleResponse.model_validate(s) for s in schedules]


@router.post("/me/schedules", response_model=ScheduleResponse, status_code=status.HTTP_201_CREATED)
async def create_schedule(
    data: ScheduleCreate,
    current_user: CurrentManager,
    db: DbSession,
) -> ScheduleResponse:
    """스케줄 생성."""
    # 매니저 프로필 조회
    result = await db.execute(
        select(Manager).where(Manager.user_id == current_user.id)
    )
    manager = result.scalar_one_or_none()

    if not manager:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="매니저 프로필을 찾을 수 없습니다.",
        )

    schedule = ManagerSchedule(
        manager_id=manager.id,
        date=data.date,
        start_time=data.start_time,
        end_time=data.end_time,
        is_available=data.is_available,
    )

    db.add(schedule)
    await db.flush()
    await db.refresh(schedule)

    return ScheduleResponse.model_validate(schedule)


@router.patch("/me/schedules/{schedule_id}", response_model=ScheduleResponse)
async def update_schedule(
    schedule_id: UUID,
    data: ScheduleUpdate,
    current_user: CurrentManager,
    db: DbSession,
) -> ScheduleResponse:
    """스케줄 수정."""
    # 매니저 프로필 조회
    manager_result = await db.execute(
        select(Manager).where(Manager.user_id == current_user.id)
    )
    manager = manager_result.scalar_one_or_none()

    if not manager:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="매니저 프로필을 찾을 수 없습니다.",
        )

    result = await db.execute(
        select(ManagerSchedule).where(
            ManagerSchedule.id == schedule_id,
            ManagerSchedule.manager_id == manager.id,
        )
    )
    schedule = result.scalar_one_or_none()

    if not schedule:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="스케줄을 찾을 수 없습니다.",
        )

    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(schedule, field, value)

    await db.flush()
    await db.refresh(schedule)

    return ScheduleResponse.model_validate(schedule)


@router.delete("/me/schedules/{schedule_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_schedule(
    schedule_id: UUID,
    current_user: CurrentManager,
    db: DbSession,
) -> None:
    """스케줄 삭제."""
    # 매니저 프로필 조회
    manager_result = await db.execute(
        select(Manager).where(Manager.user_id == current_user.id)
    )
    manager = manager_result.scalar_one_or_none()

    if not manager:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="매니저 프로필을 찾을 수 없습니다.",
        )

    result = await db.execute(
        select(ManagerSchedule).where(
            ManagerSchedule.id == schedule_id,
            ManagerSchedule.manager_id == manager.id,
        )
    )
    schedule = result.scalar_one_or_none()

    if not schedule:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="스케줄을 찾을 수 없습니다.",
        )

    await db.delete(schedule)
    await db.flush()
