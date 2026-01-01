---
name: dev-setup
user_invocable: true
description: 개발 환경을 설정합니다. Docker Compose 실행, 의존성 설치, 환경변수 설정을 포함합니다.
---

# 개발 환경 설정 스킬

사용자가 `/dev-setup` 명령어를 실행하면 다음 단계를 자동으로 수행합니다.

## 실행 단계

### 1단계: 환경 확인

먼저 필요한 도구가 설치되어 있는지 확인합니다:

```bash
# Docker 확인
docker --version

# Docker Compose 확인
docker compose version

# Node.js 확인
node --version

# Python 확인
python3 --version

# pnpm 확인 (없으면 npm 사용)
pnpm --version || npm --version
```

### 2단계: 환경변수 파일 설정

```bash
# .env 파일이 없으면 .env.example에서 복사
if [ ! -f .env ]; then
  if [ -f .env.example ]; then
    cp .env.example .env
    echo "✅ .env 파일을 생성했습니다. 필요한 값을 설정해주세요."
  else
    echo "⚠️ .env.example 파일이 없습니다. 환경변수를 수동으로 설정해주세요."
  fi
fi
```

### 3단계: Docker 서비스 실행

```bash
# Docker Compose로 개발 환경 실행
cd docker
docker compose up -d

# 서비스 상태 확인
docker compose ps
```

### 4단계: Backend 의존성 설치

```bash
cd backend

# Python 가상환경 생성 (없는 경우)
if [ ! -d ".venv" ]; then
  python3 -m venv .venv
fi

# 가상환경 활성화 및 의존성 설치
source .venv/bin/activate
pip install -r requirements.txt
pip install -r requirements-dev.txt

# 비활성화
deactivate
```

### 5단계: Frontend 의존성 설치

```bash
cd frontend

# 의존성 설치
pnpm install || npm install
```

### 6단계: Database 마이그레이션

```bash
cd backend
source .venv/bin/activate

# Alembic 마이그레이션 실행
alembic upgrade head

deactivate
```

## 완료 메시지

```
✅ 개발 환경 설정 완료!

서비스 상태:
- PostgreSQL: http://localhost:5432
- Redis: http://localhost:6379
- Backend API: http://localhost:8000
- Frontend: http://localhost:3000

다음 명령어로 개발 서버를 실행할 수 있습니다:

Backend:
  cd backend && source .venv/bin/activate && uvicorn app.main:app --reload

Frontend:
  cd frontend && pnpm dev (또는 npm run dev)
```

## 옵션

- `--docker-only`: Docker 서비스만 실행
- `--frontend-only`: Frontend 의존성만 설치
- `--backend-only`: Backend 의존성만 설치
- `--skip-docker`: Docker 실행 건너뛰기

## 트러블슈팅

### Docker 포트 충돌
```
포트가 이미 사용 중입니다.

해결 방법:
1. 사용 중인 프로세스 확인: lsof -i :5432
2. 프로세스 종료 또는 docker-compose.yml에서 포트 변경
```

### Python 가상환경 오류
```
가상환경 생성에 실패했습니다.

해결 방법:
1. python3-venv 패키지 설치: sudo apt install python3-venv
2. 또는 pyenv 사용
```
