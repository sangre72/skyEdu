import asyncio
import sys
from pathlib import Path

# Add project root to python path
sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlalchemy import select
from app.db.session import async_session_maker
from app.models.user_group import UserGroup

async def seed_groups():
    """Seed default user groups."""
    groups_to_create = [
        {"name": "VIP 고객", "description": "특별 관리 대상 고객 그룹"},
        {"name": "일반 고객", "description": "일반 서비스 이용 고객 그룹"},
        {"name": "신규 고객", "description": "최근 가입한 고객 그룹"},
        {"name": "블랙리스트", "description": "서비스 이용 제한 대상 그룹"},
        {"name": "관리자", "description": "일반 관리자 그룹"},
        {"name": "시스템 관리자", "description": "최상위 시스템 관리자 그룹"},
    ]
    
    async with async_session_maker() as db:
        created_count = 0
        for group_data in groups_to_create:
            # Check if group exists
            result = await db.execute(select(UserGroup).where(UserGroup.name == group_data["name"]))
            if not result.scalar_one_or_none():
                group = UserGroup(**group_data)
                db.add(group)
                created_count += 1
                print(f"✓ 그룹 생성: {group_data['name']}")
        
        if created_count > 0:
            await db.commit()
            print(f"\n총 {created_count}개의 그룹이 생성되었습니다.")
        else:
            print("\n이미 모든 그룹이 존재합니다.")

if __name__ == "__main__":
    asyncio.run(seed_groups())
