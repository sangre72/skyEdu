"""동행인(매니저) 샘플 데이터 생성 스크립트.

사용법:
  python scripts/seed_managers.py           # 기본 30명 생성
  python scripts/seed_managers.py --special # 자원봉사자 10명 + 신규매니저 10명 추가
"""

import argparse
import asyncio
import random
import sys
import uuid
from decimal import Decimal
from pathlib import Path

# 프로젝트 루트를 path에 추가
sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlalchemy import select, text
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import async_session_maker
from app.models.manager import Manager, ManagerGrade, ManagerStatus
from app.models.user import User, UserRole

# 샘플 데이터
FIRST_NAMES = [
    "서연", "민서", "지우", "서윤", "지민",
    "수빈", "하은", "예은", "윤서", "채원",
    "민준", "서준", "도윤", "예준", "시우",
    "하준", "주원", "지호", "준서", "건우",
    "유진", "소희", "미영", "정숙", "영희",
    "순자", "옥순", "명숙", "정희", "혜정",
]

LAST_NAMES = ["김", "이", "박", "최", "정", "강", "조", "윤", "장", "임"]

CERTIFICATIONS = [
    "careWorker",      # 요양보호사
    "nurseAide",       # 간호조무사
    "socialWorker",    # 사회복지사
    "nurse",           # 간호사
]

INTRODUCTIONS = [
    "10년 이상 병원동행 경험으로 어르신들의 든든한 동반자가 되어드립니다. 친절하고 세심한 케어로 안심하고 병원을 다녀오실 수 있도록 도와드리겠습니다.",
    "간호조무사 출신으로 의료 지식을 바탕으로 정확하고 꼼꼼한 동행 서비스를 제공합니다. 진료 내용 기록과 약 관리까지 철저하게 도와드립니다.",
    "사회복지사로서 어르신들의 마음을 먼저 헤아리는 따뜻한 동행을 약속드립니다. 병원이 두려우신 분들도 편안하게 다녀오실 수 있어요.",
    "응급상황 대처 능력을 갖춘 전문 동행매니저입니다. 만약의 상황에도 침착하게 대응하여 보호자님의 걱정을 덜어드립니다.",
    "치매 어르신 전문 케어 경험이 풍부합니다. 인내심을 가지고 어르신의 페이스에 맞춰 안전하게 동행해드립니다.",
    "휠체어 이동이 필요하신 분들을 위한 이동 보조 전문입니다. 편안하고 안전한 이동을 책임지겠습니다.",
    "항암치료 동행 전문으로 힘든 치료 과정을 함께 해드립니다. 정서적 지지와 실질적인 도움을 모두 드립니다.",
    "건강검진 동행 서비스를 전문으로 합니다. 검진 전 준비사항부터 검진 후 결과 설명까지 꼼꼼하게 챙겨드립니다.",
    "어르신 눈높이에 맞춘 친절한 설명으로 병원 방문의 두려움을 없애드립니다. 가족처럼 따뜻하게 모시겠습니다.",
    "정형외과, 재활의학과 동행 경험이 많습니다. 거동이 불편하신 분들의 이동을 안전하게 도와드립니다.",
]

# 지역 코드 (regions.json 기반)
AREAS = {
    "seoul": [
        "seoul-gangnam", "seoul-seocho", "seoul-songpa", "seoul-gangdong",
        "seoul-mapo", "seoul-yongsan", "seoul-jongno", "seoul-jung",
        "seoul-nowon", "seoul-dobong", "seoul-gwanak", "seoul-dongjak",
    ],
    "gyeonggi": [
        "gyeonggi-seongnam", "gyeonggi-suwon", "gyeonggi-yongin",
        "gyeonggi-goyang", "gyeonggi-bucheon", "gyeonggi-anyang",
        "gyeonggi-hanam", "gyeonggi-paju", "gyeonggi-hwaseong", "gyeonggi-gwacheon",
    ],
    "busan": ["busan-haeundae", "busan-busanjin", "busan-nam", "busan-dong", "busan-suyeong"],
    "daegu": ["daegu-suseong", "daegu-dalseo", "daegu-jung"],
    "incheon": ["incheon-namdong", "incheon-bupyeong", "incheon-yeonsu", "incheon-gyeyang"],
    "gwangju": ["gwangju-seo", "gwangju-buk"],
    "daejeon": ["daejeon-seo", "daejeon-yuseong"],
}

BANK_NAMES = ["신한은행", "국민은행", "우리은행", "하나은행", "농협", "카카오뱅크", "토스뱅크"]


# === 자원봉사자 샘플 데이터 ===
VOLUNTEER_DATA = [
    {
        "name": "김봉사",
        "phone": "010-1111-0001",
        "introduction": "은퇴 후 봉사활동을 하고 있습니다. 어르신들의 병원 방문을 무료로 도와드립니다.",
        "certifications": ["careWorker"],
        "available_areas": ["seoul-gangnam", "seoul-seocho"],
        "rating": 4.8,
        "total_services": 45,
    },
    {
        "name": "이나눔",
        "phone": "010-1111-0002",
        "introduction": "사회복지사 출신으로 따뜻한 마음으로 봉사합니다. 교통약자 동행 전문입니다.",
        "certifications": ["socialWorker"],
        "available_areas": ["seoul-mapo", "seoul-seodaemun"],
        "rating": 4.9,
        "total_services": 62,
    },
    {
        "name": "박헌신",
        "phone": "010-1111-0003",
        "introduction": "간호사 경력 20년, 은퇴 후 재능기부로 병원동행 봉사 중입니다.",
        "certifications": ["nurse"],
        "available_areas": ["seoul-songpa", "seoul-gangdong"],
        "rating": 5.0,
        "total_services": 89,
    },
    {
        "name": "정사랑",
        "phone": "010-1111-0004",
        "introduction": "독거어르신 병원동행 봉사 3년차입니다. 따뜻한 손길이 되어드릴게요.",
        "certifications": ["careWorker"],
        "available_areas": ["gyeonggi-seongnam", "gyeonggi-yongin"],
        "rating": 4.7,
        "total_services": 34,
    },
    {
        "name": "최희망",
        "phone": "010-1111-0005",
        "introduction": "장애인복지관에서 10년간 근무한 경험으로 봉사합니다.",
        "certifications": ["socialWorker", "careWorker"],
        "available_areas": ["incheon-namdong", "incheon-yeonsu"],
        "rating": 4.8,
        "total_services": 56,
    },
    {
        "name": "강나눔",
        "phone": "010-1111-0006",
        "introduction": "부산에서 활동 중인 자원봉사자입니다. 어르신들의 병원 길동무가 되어드려요.",
        "certifications": ["careWorker"],
        "available_areas": ["busan-haeundae", "busan-suyeong"],
        "rating": 4.6,
        "total_services": 28,
    },
    {
        "name": "윤온정",
        "phone": "010-1111-0007",
        "introduction": "간호조무사 출신, 무료 병원동행으로 사회에 기여하고 싶습니다.",
        "certifications": ["nurseAide"],
        "available_areas": ["seoul-nowon", "seoul-dobong"],
        "rating": 4.9,
        "total_services": 41,
    },
    {
        "name": "한따뜻",
        "phone": "010-1111-0008",
        "introduction": "대학생 봉사동아리 출신, 졸업 후에도 꾸준히 봉사 중입니다.",
        "certifications": [],
        "available_areas": ["seoul-gwanak", "seoul-dongjak"],
        "rating": 4.5,
        "total_services": 15,
    },
    {
        "name": "임배려",
        "phone": "010-1111-0009",
        "introduction": "경기도 고양시 지역 자원봉사자입니다. 1인가구 어르신 동행 전문.",
        "certifications": ["careWorker"],
        "available_areas": ["gyeonggi-goyang", "gyeonggi-paju"],
        "rating": 4.8,
        "total_services": 38,
    },
    {
        "name": "조감사",
        "phone": "010-1111-0010",
        "introduction": "은퇴 의사입니다. 의료 지식을 활용해 병원동행 봉사를 하고 있습니다.",
        "certifications": ["nurse"],
        "available_areas": ["seoul-jongno", "seoul-jung"],
        "rating": 5.0,
        "total_services": 72,
    },
]

# === 신규 매니저 샘플 데이터 (total_services 5건 이하) ===
NEW_MANAGER_DATA = [
    {
        "name": "김신규",
        "phone": "010-2222-0001",
        "introduction": "요양보호사 자격 취득 후 첫 활동을 시작했습니다. 정성껏 모시겠습니다.",
        "certifications": ["careWorker"],
        "available_areas": ["seoul-gangnam", "seoul-gangdong"],
        "rating": 4.5,
        "total_services": 2,
    },
    {
        "name": "이새내기",
        "phone": "010-2222-0002",
        "introduction": "간호대 졸업생입니다. 병원 시스템을 잘 알고 있어요!",
        "certifications": ["nurse"],
        "available_areas": ["seoul-mapo", "seoul-yongsan"],
        "rating": 4.8,
        "total_services": 5,
    },
    {
        "name": "박시작",
        "phone": "010-2222-0003",
        "introduction": "사회복지학 전공으로 현장 경험을 쌓고자 시작했습니다.",
        "certifications": ["socialWorker"],
        "available_areas": ["gyeonggi-seongnam", "gyeonggi-hanam"],
        "rating": 4.3,
        "total_services": 1,
    },
    {
        "name": "정첫걸음",
        "phone": "010-2222-0004",
        "introduction": "간호조무사 자격증 보유, 열심히 배우며 성장하겠습니다.",
        "certifications": ["nurseAide"],
        "available_areas": ["seoul-songpa", "seoul-gangdong"],
        "rating": 4.6,
        "total_services": 3,
    },
    {
        "name": "최도전",
        "phone": "010-2222-0005",
        "introduction": "요양보호사 1급 취득! 어르신 케어 전문가가 되고 싶습니다.",
        "certifications": ["careWorker"],
        "available_areas": ["incheon-bupyeong", "incheon-gyeyang"],
        "rating": 4.4,
        "total_services": 4,
    },
    {
        "name": "강새싹",
        "phone": "010-2222-0006",
        "introduction": "부산에서 활동을 시작한 신규 매니저입니다. 친절하게 모시겠습니다.",
        "certifications": ["careWorker"],
        "available_areas": ["busan-nam", "busan-busanjin"],
        "rating": 4.2,
        "total_services": 2,
    },
    {
        "name": "윤출발",
        "phone": "010-2222-0007",
        "introduction": "복지관 인턴 경험을 살려 병원동행 서비스를 시작했습니다.",
        "certifications": ["socialWorker"],
        "available_areas": ["seoul-gwangjin", "seoul-seongdong"],
        "rating": 4.7,
        "total_services": 5,
    },
    {
        "name": "한시작",
        "phone": "010-2222-0008",
        "introduction": "경기 남부 지역에서 활동 시작! 성실하게 임하겠습니다.",
        "certifications": ["nurseAide"],
        "available_areas": ["gyeonggi-suwon", "gyeonggi-hwaseong"],
        "rating": 4.5,
        "total_services": 3,
    },
    {
        "name": "임데뷔",
        "phone": "010-2222-0009",
        "introduction": "대학병원 근처에서 활동 중입니다. 대형병원 동행 경험 있어요.",
        "certifications": ["nurse"],
        "available_areas": ["seoul-jongno", "seoul-seodaemun"],
        "rating": 4.9,
        "total_services": 4,
    },
    {
        "name": "조초보",
        "phone": "010-2222-0010",
        "introduction": "이제 막 시작한 초보 매니저입니다. 최선을 다해 모시겠습니다!",
        "certifications": ["careWorker"],
        "available_areas": ["gyeonggi-anyang", "gyeonggi-gwacheon"],
        "rating": 4.0,
        "total_services": 1,
    },
]


def generate_phone() -> str:
    """임의의 휴대폰 번호 생성."""
    return f"010{random.randint(1000, 9999):04d}{random.randint(1000, 9999):04d}"


def generate_bank_account() -> str:
    """임의의 계좌번호 생성."""
    return f"{random.randint(100, 999)}-{random.randint(10, 99)}-{random.randint(100000, 999999)}"


def generate_manager_data(index: int) -> dict:
    """단일 매니저 데이터 생성."""
    first_name = FIRST_NAMES[index % len(FIRST_NAMES)]
    last_name = random.choice(LAST_NAMES)
    name = f"{last_name}{first_name}"

    # 지역 선택 (1~3개)
    province = random.choice(list(AREAS.keys()))
    districts = random.sample(AREAS[province], min(random.randint(1, 3), len(AREAS[province])))

    # 자격증 선택 (1~3개)
    certs = random.sample(CERTIFICATIONS, random.randint(1, min(3, len(CERTIFICATIONS))))

    # 등급 및 통계 (가중치 적용)
    grade_weights = [
        (ManagerGrade.NEW.value, 0.3),
        (ManagerGrade.REGULAR.value, 0.5),
        (ManagerGrade.PREMIUM.value, 0.2),
    ]
    grade = random.choices(
        [g[0] for g in grade_weights],
        weights=[g[1] for g in grade_weights],
    )[0]

    # 등급에 따른 통계 범위
    if grade == ManagerGrade.NEW.value:
        total_services = random.randint(0, 20)
        rating = round(random.uniform(4.0, 4.7), 1)
    elif grade == ManagerGrade.REGULAR.value:
        total_services = random.randint(20, 80)
        rating = round(random.uniform(4.3, 4.8), 1)
    else:  # PREMIUM
        total_services = random.randint(50, 200)
        rating = round(random.uniform(4.7, 5.0), 1)

    return {
        "name": name,
        "phone": generate_phone(),
        "districts": districts,
        "certifications": certs,
        "introduction": random.choice(INTRODUCTIONS),
        "grade": grade,
        "total_services": total_services,
        "rating": rating,
        "bank_name": random.choice(BANK_NAMES),
        "bank_account": generate_bank_account(),
    }


async def seed_managers(session: AsyncSession, count: int = 30) -> None:
    """매니저 샘플 데이터 생성."""
    print(f"동행인 {count}명 데이터 생성 시작...")

    # 기존 샘플 데이터 확인 (phone이 010으로 시작하는 테스트 데이터)
    result = await session.execute(
        text("SELECT COUNT(*) FROM users WHERE phone LIKE '010%' AND role = 'manager'")
    )
    existing_count = result.scalar()
    print(f"기존 테스트 매니저 수: {existing_count}")

    created_count = 0
    for i in range(count):
        data = generate_manager_data(i)

        # 중복 체크 (phone)
        result = await session.execute(
            text("SELECT id FROM users WHERE phone = :phone"),
            {"phone": data["phone"]},
        )
        if result.fetchone():
            # 중복이면 새 번호 생성
            data["phone"] = generate_phone()

        # User 생성
        user = User(
            id=uuid.uuid4(),
            name=data["name"],
            phone=data["phone"],
            role=UserRole.MANAGER.value,
            is_verified=True,
            is_active=True,
            is_deleted=False,
        )
        session.add(user)
        await session.flush()

        # Manager 프로필 생성
        manager = Manager(
            id=uuid.uuid4(),
            user_id=user.id,
            status=ManagerStatus.ACTIVE.value,
            grade=data["grade"],
            rating=Decimal(str(data["rating"])),
            total_services=data["total_services"],
            certifications=data["certifications"],
            available_areas=data["districts"],
            introduction=data["introduction"],
            bank_name=data["bank_name"],
            bank_account=data["bank_account"],
            is_volunteer=False,
            is_active=True,
            is_deleted=False,
        )
        session.add(manager)
        created_count += 1

        if (i + 1) % 10 == 0:
            print(f"  {i + 1}명 생성 완료...")

    await session.commit()
    print(f"총 {created_count}명의 동행인 생성 완료!")


async def seed_special_managers(session: AsyncSession) -> None:
    """자원봉사자 10명 + 신규매니저 10명 생성."""
    created_count = {"volunteer": 0, "new": 0}

    # 자원봉사자 등록
    print("\n=== 자원봉사자 10명 등록 ===")
    for data in VOLUNTEER_DATA:
        # 이미 존재하는지 확인
        result = await session.execute(
            select(User).where(User.phone == data["phone"].replace("-", ""))
        )
        if result.scalar_one_or_none():
            print(f"  이미 존재: {data['name']} ({data['phone']})")
            continue

        # 사용자 생성
        user = User(
            id=uuid.uuid4(),
            name=data["name"],
            phone=data["phone"].replace("-", ""),
            role=UserRole.MANAGER.value,
            is_verified=True,
            is_active=True,
            is_deleted=False,
        )
        session.add(user)
        await session.flush()

        # 매니저 프로필 생성
        manager = Manager(
            id=uuid.uuid4(),
            user_id=user.id,
            introduction=data["introduction"],
            certifications=data["certifications"],
            available_areas=data["available_areas"],
            rating=Decimal(str(data["rating"])),
            total_services=data["total_services"],
            status=ManagerStatus.ACTIVE.value,
            grade=ManagerGrade.REGULAR.value if data["total_services"] >= 6 else ManagerGrade.NEW.value,
            is_volunteer=True,  # 자원봉사자
            is_active=True,
            is_deleted=False,
        )
        session.add(manager)
        created_count["volunteer"] += 1
        print(f"  ✓ 자원봉사자 등록: {data['name']}")

    # 신규 매니저 등록
    print("\n=== 신규 매니저 10명 등록 ===")
    for data in NEW_MANAGER_DATA:
        # 이미 존재하는지 확인
        result = await session.execute(
            select(User).where(User.phone == data["phone"].replace("-", ""))
        )
        if result.scalar_one_or_none():
            print(f"  이미 존재: {data['name']} ({data['phone']})")
            continue

        # 사용자 생성
        user = User(
            id=uuid.uuid4(),
            name=data["name"],
            phone=data["phone"].replace("-", ""),
            role=UserRole.MANAGER.value,
            is_verified=True,
            is_active=True,
            is_deleted=False,
        )
        session.add(user)
        await session.flush()

        # 매니저 프로필 생성
        manager = Manager(
            id=uuid.uuid4(),
            user_id=user.id,
            introduction=data["introduction"],
            certifications=data["certifications"],
            available_areas=data["available_areas"],
            rating=Decimal(str(data["rating"])),
            total_services=data["total_services"],
            status=ManagerStatus.ACTIVE.value,
            grade=ManagerGrade.NEW.value,  # 신규 매니저
            is_volunteer=False,
            is_active=True,
            is_deleted=False,
        )
        session.add(manager)
        created_count["new"] += 1
        print(f"  ✓ 신규 매니저 등록: {data['name']}")

    await session.commit()
    print(f"\n완료! 자원봉사자 {created_count['volunteer']}명, 신규 매니저 {created_count['new']}명 등록됨")


async def main(special: bool = False) -> None:
    """메인 함수."""
    async with async_session_maker() as session:
        if special:
            await seed_special_managers(session)
        else:
            await seed_managers(session, count=30)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="매니저 샘플 데이터 생성")
    parser.add_argument("--special", action="store_true", help="자원봉사자 10명 + 신규매니저 10명 추가")
    args = parser.parse_args()

    asyncio.run(main(special=args.special))
