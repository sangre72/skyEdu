---
name: lint
user_invocable: true
description: Frontend(ESLint/Prettier)와 Backend(Ruff/Black) 코드 린트 및 포맷팅을 실행합니다.
---

# 린트 및 포맷팅 스킬

사용자가 `/lint` 명령어를 실행하면 코드 품질 검사를 수행합니다.

## 실행 단계

### 1단계: Frontend 린트

```bash
cd frontend

# ESLint 실행
pnpm lint || npm run lint

# Prettier 포맷 확인
pnpm format:check || npm run format:check
```

### 2단계: Backend 린트

```bash
cd backend
source .venv/bin/activate

# Ruff 린트 실행
ruff check app/

# Ruff 포맷 확인
ruff format --check app/

# mypy 타입 체크 (선택)
mypy app/

deactivate
```

## 옵션

### --fix

자동 수정 모드로 실행합니다:

```bash
# Frontend
cd frontend
pnpm lint:fix || npm run lint -- --fix
pnpm format || npm run format

# Backend
cd backend
source .venv/bin/activate
ruff check app/ --fix
ruff format app/
deactivate
```

### --frontend / --backend

특정 영역만 린트합니다:

```bash
# Frontend만
/lint --frontend

# Backend만
/lint --backend
```

## 결과 출력

### 성공 시
```
✅ 린트 검사 완료!

Frontend:
  - ESLint: 0 errors, 0 warnings
  - Prettier: All files formatted

Backend:
  - Ruff: All checks passed
  - Type check: No issues found
```

### 오류 발생 시
```
❌ 린트 오류가 발견되었습니다.

Frontend ESLint 오류:
  src/components/Header.tsx
    Line 15: 'unused' is defined but never used

Backend Ruff 오류:
  app/api/v1/endpoints/auth.py
    Line 23: F401 'typing.Optional' imported but unused

자동 수정: /lint --fix
```

## 설정 파일

### Frontend (ESLint)
- `.eslintrc.js` 또는 `eslint.config.js`
- `.prettierrc`

### Backend (Ruff)
- `pyproject.toml` 또는 `ruff.toml`

## CI 연동

GitHub Actions에서 자동으로 린트 검사가 실행됩니다:
- PR 생성 시
- main 브랜치 push 시
