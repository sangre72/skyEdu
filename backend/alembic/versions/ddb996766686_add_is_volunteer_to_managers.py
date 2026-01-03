"""add is_volunteer to managers

Revision ID: ddb996766686
Revises: c1a2b3d4e5f6
Create Date: 2026-01-03 17:24:29.207911

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'ddb996766686'
down_revision: Union[str, None] = 'c1a2b3d4e5f6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # managers 테이블에 is_volunteer 컬럼 추가 (자원봉사자 여부)
    op.add_column('managers', sa.Column('is_volunteer', sa.Boolean(), nullable=False, server_default='false'))


def downgrade() -> None:
    op.drop_column('managers', 'is_volunteer')
