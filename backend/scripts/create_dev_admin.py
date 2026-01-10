import asyncio
import sys
from pathlib import Path

# Add project root to python path
sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlalchemy import select
from app.db.session import async_session_maker
from app.models.user import User, UserRole
from app.core.security import get_password_hash

async def create_dev_admin():
    """Create a default admin user if none exists."""
    async with async_session_maker() as db:
        # Check if any admin exists
        result = await db.execute(select(User).where(User.role == UserRole.ADMIN.value).limit(1))
        admin = result.scalar_one_or_none()
        
        if admin:
            print(f"Admin user already exists: {admin.email or admin.phone} (Name: {admin.name})")
            return

        # Check if user with default phone exists
        phone = "01012345678"
        result = await db.execute(select(User).where(User.phone == phone))
        existing_user = result.scalar_one_or_none()

        if existing_user:
            print(f"User with phone {phone} exists but is not admin. Updating to admin...")
            existing_user.role = UserRole.ADMIN.value
            existing_user.is_active = True
            existing_user.is_verified = True
            await db.commit()
            print("User updated to admin successfully!")
            return

        # Create default admin
        print("Creating default admin user...")
        new_admin = User(
            phone=phone,
            name="관리자",
            email="admin@example.com",
            role=UserRole.ADMIN.value,
            is_verified=True,
            is_active=True,
            password_hash=get_password_hash("admin1234"),
        )
        db.add(new_admin)
        await db.commit()
        print("Default admin user created successfully!")
        print(f"Phone: {phone}")
        print("Password: admin1234")

if __name__ == "__main__":
    asyncio.run(create_dev_admin())
