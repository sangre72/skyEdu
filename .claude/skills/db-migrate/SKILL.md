---
name: db-migrate
user_invocable: true
description: Alembic을 사용하여 데이터베이스 마이그레이션을 관리합니다.
---

# 데이터베이스 마이그레이션 스킬

사용자가 `/db-migrate` 명령어를 실행하면 DB 마이그레이션을 수행합니다.

## 실행 단계

### 기본 실행 (최신 버전으로 업그레이드)

```bash
cd backend
source .venv/bin/activate

# 마이그레이션 상태 확인
alembic current

# 최신 버전으로 마이그레이션
alembic upgrade head

deactivate
```

## 옵션

### --generate / --autogenerate

모델 변경사항을 감지하여 새 마이그레이션 파일 생성:

```bash
cd backend
source .venv/bin/activate

# 자동 마이그레이션 생성
alembic revision --autogenerate -m "설명"

deactivate
```

**사용 예시:**
```bash
/db-migrate --generate "add user profile table"
/db-migrate --generate "add manager rating column"
```

### --downgrade

이전 버전으로 롤백:

```bash
# 한 단계 롤백
alembic downgrade -1

# 특정 버전으로 롤백
alembic downgrade abc123
```

### --history

마이그레이션 히스토리 확인:

```bash
alembic history --verbose
```

### --status

현재 마이그레이션 상태 확인:

```bash
alembic current
alembic heads
```

## 워크플로우

### 새 테이블/컬럼 추가 시

1. SQLAlchemy 모델 수정 (`backend/app/models/`)
2. 마이그레이션 생성: `/db-migrate --generate "변경 설명"`
3. 생성된 마이그레이션 파일 확인
4. 마이그레이션 적용: `/db-migrate`

### 예시

```python
# 1. 모델 수정 (app/models/user.py)
class UserProfile(Base):
    __tablename__ = "user_profiles"

    id = Column(UUID, primary_key=True)
    user_id = Column(UUID, ForeignKey("users.id"))
    nickname = Column(String(50))  # 새 컬럼 추가
```

```bash
# 2. 마이그레이션 생성
/db-migrate --generate "add nickname to user_profiles"

# 3. 마이그레이션 적용
/db-migrate
```

## 결과 출력

### 성공 시
```
✅ 마이그레이션 완료!

현재 버전: abc123def456
적용된 마이그레이션:
  - 2025_01_01_add_user_profiles (abc123)
  - 2025_01_02_add_reservations (def456)

데이터베이스가 최신 상태입니다.
```

### 생성 시
```
✅ 마이그레이션 파일 생성 완료!

파일: alembic/versions/2025_01_03_xyz789_add_nickname.py

다음 단계:
1. 생성된 마이그레이션 파일을 확인하세요
2. 필요시 upgrade(), downgrade() 함수를 수정하세요
3. /db-migrate 명령으로 적용하세요
```

## 주의사항

### 프로덕션 환경
- 마이그레이션 전 반드시 백업
- 다운타임 필요 여부 확인
- 롤백 계획 수립

### 자동 생성 마이그레이션 검토
- 자동 생성된 마이그레이션은 항상 수동 검토 필요
- 인덱스, 제약조건 확인
- 데이터 마이그레이션 로직 추가 필요 여부 확인

## 트러블슈팅

### "Target database is not up to date"
```bash
# 현재 상태 확인
alembic current

# 강제 마킹 (주의: 실제 스키마와 일치해야 함)
alembic stamp head
```

### 마이그레이션 충돌
```bash
# 브랜치 확인
alembic heads

# 병합
alembic merge heads -m "merge migrations"
```
