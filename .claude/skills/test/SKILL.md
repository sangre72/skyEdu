---
name: test
user_invocable: true
description: Frontend(Jest/Vitest)와 Backend(pytest) 테스트를 실행합니다.
---

# 테스트 실행 스킬

사용자가 `/test` 명령어를 실행하면 테스트를 수행합니다.

## 실행 단계

### 1단계: Backend 테스트

```bash
cd backend
source .venv/bin/activate

# pytest 실행 (커버리지 포함)
pytest --cov=app tests/ -v

deactivate
```

### 2단계: Frontend 테스트

```bash
cd frontend

# Jest 또는 Vitest 실행
pnpm test || npm test

# 커버리지 포함
pnpm test:coverage || npm run test:coverage
```

## 옵션

### --backend / --frontend

특정 영역만 테스트:

```bash
/test --backend
/test --frontend
```

### --watch

변경 감지 모드로 실행:

```bash
# Frontend
cd frontend && pnpm test:watch

# Backend
cd backend && pytest-watch
```

### --coverage

커버리지 리포트 생성:

```bash
# Backend
pytest --cov=app --cov-report=html tests/

# Frontend
pnpm test:coverage
```

### 특정 파일/디렉토리 테스트

```bash
/test backend/tests/test_auth.py
/test frontend/src/components/__tests__/
```

## 결과 출력

### 성공 시
```
✅ 테스트 완료!

Backend:
  - 45 tests passed
  - Coverage: 82%
  - Duration: 12.3s

Frontend:
  - 28 tests passed
  - Coverage: 75%
  - Duration: 8.5s
```

### 실패 시
```
❌ 테스트 실패

Backend 실패:
  tests/test_auth.py::test_login_invalid_password
    AssertionError: Expected 401, got 200

Frontend 실패:
  src/components/UserCard.test.tsx
    Expected: "John Doe"
    Received: "Jane Doe"

실패한 테스트 재실행: /test --failed
```

## 테스트 구조

### Backend (pytest)
```
backend/
├── tests/
│   ├── conftest.py          # 공통 fixtures
│   ├── test_auth.py         # 인증 테스트
│   ├── test_reservations.py # 예약 테스트
│   └── test_managers.py     # 매니저 테스트
```

### Frontend (Jest/Vitest)
```
frontend/
├── src/
│   ├── components/
│   │   ├── __tests__/       # 컴포넌트 테스트
│   │   └── UserCard.test.tsx
│   └── lib/
│       └── __tests__/       # 유틸리티 테스트
```

## CI 연동

GitHub Actions에서 자동으로 테스트가 실행됩니다:
- PR 생성 시
- main 브랜치 push 시
- 테스트 실패 시 merge 차단
