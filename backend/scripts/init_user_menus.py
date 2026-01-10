"""사용자 메뉴 초기화 스크립트."""
import asyncio
import sys
from pathlib import Path

# 프로젝트 루트를 Python 경로에 추가
sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlalchemy import select
from app.db.session import async_session_maker
from app.models.menu import Menu, MenuType, LinkType, PermissionType


async def init_user_menus():
    """기본 사용자 메뉴 초기화."""
    # 메인 메뉴
    main_menus = [
        {
            "menu_code": "home",
            "menu_name": "홈",
            "menu_type": MenuType.USER.value,
            "link_type": LinkType.URL.value,
            "link_url": "/",
            "permission_type": PermissionType.PUBLIC.value,
            "icon": "Home",
            "sort_order": 1,
            "is_visible": True,
        },
        {
            "menu_code": "companions",
            "menu_name": "동행인 찾기",
            "menu_type": MenuType.USER.value,
            "link_type": LinkType.URL.value,
            "link_url": "/companions",
            "permission_type": PermissionType.PUBLIC.value,
            "icon": "People",
            "sort_order": 2,
            "is_visible": True,
        },
        {
            "menu_code": "reservation",
            "menu_name": "예약하기",
            "menu_type": MenuType.USER.value,
            "link_type": LinkType.URL.value,
            "link_url": "/reservation/new",
            "permission_type": PermissionType.MEMBER.value,
            "icon": "CalendarToday",
            "feature_key": "feature.reservation.create",
            "sort_order": 3,
            "is_visible": True,
        },
        {
            "menu_code": "about",
            "menu_name": "서비스 소개",
            "menu_type": MenuType.USER.value,
            "link_type": LinkType.URL.value,
            "link_url": "/about",
            "permission_type": PermissionType.PUBLIC.value,
            "icon": "Info",
            "sort_order": 4,
            "is_visible": True,
        },
        {
            "menu_code": "become_companion",
            "menu_name": "동행인 되기",
            "menu_type": MenuType.USER.value,
            "link_type": LinkType.URL.value,
            "link_url": "/become-companion",
            "permission_type": PermissionType.PUBLIC.value,
            "icon": "PersonAdd",
            "feature_key": "feature.manager.registration",
            "sort_order": 5,
            "is_visible": True,
        },
    ]

    # 마이페이지 메뉴 (서브메뉴 포함)
    mypage_menu = {
        "menu_code": "mypage",
        "menu_name": "마이페이지",
        "menu_type": MenuType.USER.value,
        "link_type": LinkType.URL.value,
        "link_url": "/mypage",
        "permission_type": PermissionType.MEMBER.value,
        "icon": "AccountCircle",
        "sort_order": 6,
        "is_visible": True,
        "is_expandable": True,
        "default_expanded": False,
    }

    mypage_submenus = [
        {
            "menu_code": "mypage_profile",
            "menu_name": "내 정보",
            "menu_type": MenuType.USER.value,
            "link_type": LinkType.URL.value,
            "link_url": "/mypage/profile",
            "permission_type": PermissionType.MEMBER.value,
            "icon": "Person",
            "sort_order": 1,
            "depth": 1,
        },
        {
            "menu_code": "mypage_reservations",
            "menu_name": "예약 내역",
            "menu_type": MenuType.USER.value,
            "link_type": LinkType.URL.value,
            "link_url": "/mypage/reservations",
            "permission_type": PermissionType.MEMBER.value,
            "icon": "Assignment",
            "sort_order": 2,
            "depth": 1,
        },
        {
            "menu_code": "mypage_payments",
            "menu_name": "결제 내역",
            "menu_type": MenuType.USER.value,
            "link_type": LinkType.URL.value,
            "link_url": "/mypage/payments",
            "permission_type": PermissionType.MEMBER.value,
            "icon": "Payment",
            "sort_order": 3,
            "depth": 1,
        },
        {
            "menu_code": "mypage_reviews",
            "menu_name": "내 리뷰",
            "menu_type": MenuType.USER.value,
            "link_type": LinkType.URL.value,
            "link_url": "/mypage/reviews",
            "permission_type": PermissionType.MEMBER.value,
            "icon": "RateReview",
            "sort_order": 4,
            "depth": 1,
        },
    ]

    # 헤더 유틸리티 메뉴
    header_utility_menus = [
        {
            "menu_code": "login",
            "menu_name": "로그인",
            "menu_type": MenuType.HEADER_UTILITY.value,
            "link_type": LinkType.URL.value,
            "link_url": "/login",
            "permission_type": PermissionType.PUBLIC.value,
            "icon": "Login",
            "feature_key": "feature.auth.login",
            "sort_order": 1,
            "is_visible": True,
        },
        {
            "menu_code": "register",
            "menu_name": "회원가입",
            "menu_type": MenuType.HEADER_UTILITY.value,
            "link_type": LinkType.URL.value,
            "link_url": "/register",
            "permission_type": PermissionType.PUBLIC.value,
            "icon": "PersonAdd",
            "feature_key": "feature.auth.registration",
            "sort_order": 2,
            "is_visible": True,
        },
        {
            "menu_code": "mypage_icon",
            "menu_name": "마이페이지",
            "menu_type": MenuType.HEADER_UTILITY.value,
            "link_type": LinkType.URL.value,
            "link_url": "/mypage",
            "permission_type": PermissionType.MEMBER.value,
            "icon": "AccountCircle",
            "sort_order": 3,
            "is_visible": True,
        },
        {
            "menu_code": "logout",
            "menu_name": "로그아웃",
            "menu_type": MenuType.HEADER_UTILITY.value,
            "link_type": LinkType.NONE.value,
            "link_url": None,
            "permission_type": PermissionType.MEMBER.value,
            "icon": "Logout",
            "sort_order": 4,
            "is_visible": True,
        },
    ]

    # 푸터 유틸리티 메뉴
    footer_utility_menus = [
        {
            "menu_code": "terms",
            "menu_name": "이용약관",
            "menu_type": MenuType.FOOTER_UTILITY.value,
            "link_type": LinkType.URL.value,
            "link_url": "/terms",
            "permission_type": PermissionType.PUBLIC.value,
            "icon": "Description",
            "sort_order": 1,
            "is_visible": True,
        },
        {
            "menu_code": "privacy",
            "menu_name": "개인정보처리방침",
            "menu_type": MenuType.FOOTER_UTILITY.value,
            "link_type": LinkType.URL.value,
            "link_url": "/privacy",
            "permission_type": PermissionType.PUBLIC.value,
            "icon": "PrivacyTip",
            "sort_order": 2,
            "is_visible": True,
        },
        {
            "menu_code": "contact",
            "menu_name": "고객센터",
            "menu_type": MenuType.FOOTER_UTILITY.value,
            "link_type": LinkType.URL.value,
            "link_url": "/contact",
            "permission_type": PermissionType.PUBLIC.value,
            "icon": "ContactSupport",
            "sort_order": 3,
            "is_visible": True,
        },
    ]

    async with async_session_maker() as db:
        created_count = 0
        updated_count = 0

        # 메인 메뉴 생성
        for menu_data in main_menus:
            result = await db.execute(select(Menu).where(Menu.menu_code == menu_data["menu_code"]))
            existing = result.scalar_one_or_none()

            if not existing:
                menu = Menu(**menu_data)
                db.add(menu)
                created_count += 1
                print(f"✓ 메인 메뉴 생성: {menu_data['menu_name']} ({menu_data['menu_code']})")
            else:
                for key, value in menu_data.items():
                    setattr(existing, key, value)
                updated_count += 1
                print(f"↻ 메인 메뉴 업데이트: {menu_data['menu_name']} ({menu_data['menu_code']})")

        # 마이페이지 메인 메뉴 생성
        result = await db.execute(select(Menu).where(Menu.menu_code == mypage_menu["menu_code"]))
        mypage_parent = result.scalar_one_or_none()

        if not mypage_parent:
            mypage_parent = Menu(**mypage_menu)
            db.add(mypage_parent)
            await db.flush()  # ID 생성을 위해 flush
            created_count += 1
            print(f"✓ 마이페이지 메뉴 생성: {mypage_menu['menu_name']}")
        else:
            for key, value in mypage_menu.items():
                setattr(mypage_parent, key, value)
            updated_count += 1
            print(f"↻ 마이페이지 메뉴 업데이트: {mypage_menu['menu_name']}")

        # 마이페이지 서브메뉴 생성
        for submenu_data in mypage_submenus:
            submenu_data["parent_id"] = mypage_parent.id
            submenu_data["path"] = f"{mypage_parent.id}/"

            result = await db.execute(select(Menu).where(Menu.menu_code == submenu_data["menu_code"]))
            existing = result.scalar_one_or_none()

            if not existing:
                submenu = Menu(**submenu_data)
                db.add(submenu)
                created_count += 1
                print(f"  ✓ 서브메뉴 생성: {submenu_data['menu_name']} ({submenu_data['menu_code']})")
            else:
                for key, value in submenu_data.items():
                    setattr(existing, key, value)
                updated_count += 1
                print(f"  ↻ 서브메뉴 업데이트: {submenu_data['menu_name']} ({submenu_data['menu_code']})")

        # 헤더 유틸리티 메뉴 생성
        print("\n[헤더 유틸리티 메뉴]")
        for menu_data in header_utility_menus:
            result = await db.execute(select(Menu).where(Menu.menu_code == menu_data["menu_code"]))
            existing = result.scalar_one_or_none()

            if not existing:
                menu = Menu(**menu_data)
                db.add(menu)
                created_count += 1
                print(f"✓ 생성: {menu_data['menu_name']} ({menu_data['menu_code']})")
            else:
                for key, value in menu_data.items():
                    setattr(existing, key, value)
                updated_count += 1
                print(f"↻ 업데이트: {menu_data['menu_name']} ({menu_data['menu_code']})")

        # 푸터 유틸리티 메뉴 생성
        print("\n[푸터 유틸리티 메뉴]")
        for menu_data in footer_utility_menus:
            result = await db.execute(select(Menu).where(Menu.menu_code == menu_data["menu_code"]))
            existing = result.scalar_one_or_none()

            if not existing:
                menu = Menu(**menu_data)
                db.add(menu)
                created_count += 1
                print(f"✓ 생성: {menu_data['menu_name']} ({menu_data['menu_code']})")
            else:
                for key, value in menu_data.items():
                    setattr(existing, key, value)
                updated_count += 1
                print(f"↻ 업데이트: {menu_data['menu_name']} ({menu_data['menu_code']})")

        await db.commit()

        print(f"\n완료! 생성: {created_count}개, 업데이트: {updated_count}개")


if __name__ == "__main__":
    print("사용자 메뉴 초기화 중...\n")
    asyncio.run(init_user_menus())
