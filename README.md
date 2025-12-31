# 곁에 (Gyeote) - 병원동행 플랫폼

> 아플 때 곁에 있어주는 든든한 동행 서비스

병원 방문이 어려운 고객(고령자, 1인가구, 장애인 등)과 전문 동행매니저를 연결하는 O2O 매칭 플랫폼입니다.

## 기술 스택

### Frontend
- **Framework**: Next.js 14 (App Router)
- **UI**: React 18 + MUI (Material-UI) v5
- **State**: Zustand + TanStack Query
- **Forms**: React Hook Form + Zod

### Backend
- **Framework**: Python FastAPI
- **ORM**: SQLAlchemy 2.0 + Alembic
- **Validation**: Pydantic v2
- **Task Queue**: Celery + Redis

### Infrastructure
- **Database**: PostgreSQL 15
- **Cache**: Redis 7
- **Storage**: AWS S3
- **Container**: Docker

## 프로젝트 구조

```
skyedu/
├── frontend/          # Next.js 프론트엔드
├── backend/           # Python FastAPI 백엔드
├── docs/              # 기획서 및 문서
├── docker/            # Docker 설정
└── .github/           # CI/CD 워크플로우
```

## 시작하기

### 사전 요구사항
- Docker & Docker Compose
- Node.js 20+
- Python 3.11+

### 개발 환경 실행

```bash
# 레포지토리 클론
git clone https://github.com/sangre72/skyEdu.git
cd skyedu

# Docker Compose로 실행
docker-compose -f docker/docker-compose.yml up -d

# 프론트엔드: http://localhost:3000
# 백엔드 API: http://localhost:8000
# API 문서: http://localhost:8000/docs
```

## 문서

- [기획서](./docs/01_기획서.md)
- [제작플랜](./docs/02_제작플랜.md)

## 라이선스

Private - All Rights Reserved
