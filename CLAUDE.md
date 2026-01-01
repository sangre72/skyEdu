# 스카이동행 - 병원동행 플랫폼

## 프로젝트 개요

병원 방문이 어려운 고객(고령자, 1인가구, 장애인 등)과 전문 동행매니저를 연결하는 O2O 매칭 플랫폼입니다.

- **슬로건**: 든든한 스카이동행이 되어드립니다
- **비전**: 누구나 안심하고 병원에 갈 수 있는 사회
- **미션**: 전문적이고 따뜻한 병원동행 서비스의 대중화

---

## 필수 스킬 준수 (CRITICAL)

> **IMPORTANT**: 모든 소스 코드 작업은 아래 스킬의 가이드라인을 **반드시** 준수해야 합니다.

### 준수해야 할 스킬 목록

| 스킬 | 경로 | 적용 대상 |
|------|------|----------|
| **coding-guide** | `~/.claude/skills/coding-guide` | 모든 코드 작업 |
| **refactor** | `~/.claude/skills/refactor` | 프론트엔드 레이아웃, 모듈화 |

### coding-guide 주요 규칙

1. **데이터베이스 테이블 필수 컬럼**
   - `id`, `created_at`, `created_by`, `updated_at`, `updated_by`, `is_active`, `is_deleted`
   - 날짜 기본값: PostgreSQL은 `NOW()`, Oracle은 `SYSDATE` 등 DB에 맞게 적용

2. **보안 규칙**
   - JWT: `python-jose[cryptography]` 사용
   - 비밀번호: `passlib[bcrypt]` 사용
   - 쿠키: `httpOnly`, `secure`, `sameSite` 필수

3. **에러 처리**
   - 프로덕션: HTTP 상태 코드 대신 `success` 필드로 판단
   - 스택 트레이스 노출 금지

### refactor 주요 규칙

1. **프론트엔드 레이아웃 구조**
   - Header → Header Utility → Menu → Contents → Footer
   - 모든 컴포넌트 반응형 필수 (xs/sm/md/lg)

2. **모듈화 원칙**
   - 컴포넌트 200줄 이하
   - 영역별 분리: components, hooks, lib, stores, types
   - index.ts를 통한 Public API export

---

## 핵심 비즈니스 로직

### 서비스 유형

| 서비스 | 코드 | 가격 | 포함 내용 |
|--------|------|------|----------|
| 풀케어 (PRO) | `full_care` | 35,000원/시간 | 자택픽업 → 병원동행 → 진료/검사 → 약국 → 귀가 |
| 병원케어 (BASIC) | `hospital_care` | 25,000원/시간 | 병원 내 만남 → 진료동행 → 수납/약수령 |
| 특화케어 (SPECIAL) | `special_care` | 별도협의 | 건강검진, 항암치료, 수술/입퇴원, 응급실, VIP |

**추가 요금**:
- 이동거리 10km 초과: km당 500원
- 긴급 동행 (당일): +50%
- 야간/주말: +30%

### 사용자 역할

| 역할 | 코드 | 설명 |
|------|------|------|
| 고객 | `customer` | 서비스 예약, 결제, 리뷰 작성 |
| 매니저 | `manager` | 예약 수락/거절, 서비스 수행, 리포트 작성 |
| 관리자 | `admin` | 회원/예약/정산 관리, 통계 조회 |

### 예약 상태 흐름

```
pending → confirmed → in_progress → completed
    ↓         ↓            ↓
cancelled  cancelled   cancelled (with refund)
```

| 상태 | 코드 | 설명 |
|------|------|------|
| 대기 | `pending` | 예약 생성, 매니저 매칭 대기 |
| 확정 | `confirmed` | 매니저 수락, 결제 완료 |
| 진행중 | `in_progress` | 서비스 진행 중 |
| 완료 | `completed` | 서비스 완료 |
| 취소 | `cancelled` | 예약 취소 |

### 매니저 등급 & 수수료

| 등급 | 조건 | 매니저 수익 | 플랫폼 수수료 |
|------|------|------------|-------------|
| 신규 | 가입 후 3개월 미만 | 75% | 25% |
| 일반 | 기본 등급 | 80% | 20% |
| 우수 | 평점 4.8+ & 50건+ | 85% | 15% |

---

## 핵심 기능 우선순위

### P0 (MVP 필수)

**고객용**:
- 간편 예약 (3단계: 날짜 → 병원 → 서비스)
- 매니저 선택 (프로필/후기 기반)
- 실시간 현황 확인

**매니저용**:
- 일정 관리 (가능 시간대 설정)
- 예약 수락/거절
- 서비스 체크리스트 (단계별 체크)

**관리자용**:
- 회원/예약 관리
- 매칭 관리 (수동 매칭, 긴급 배정)

### P1 (고도화)
- 진료 리포트 작성/조회
- 가족에게 실시간 알림 공유
- 정산 관리
- 통계 대시보드

### P2 (추후)
- 정기 예약
- AI 매칭 추천

---

## 데이터 모델 (핵심 테이블)

### users
```
id, name, phone (unique, required), email (optional), password_hash (optional),
role, kakao_id, is_verified, is_active, created_at, updated_at
```
> **Note**: 휴대폰 인증 기반으로 phone이 필수, email은 선택사항

### reservations
```
id, user_id, manager_id, service_type, scheduled_date, scheduled_time,
estimated_hours, hospital_name, hospital_address, hospital_department,
pickup_address, symptoms, special_requests, status, price
```

### managers (매니저 프로필)
```
id, user_id, status, rating, total_services, certifications, available_areas, bank_account
```

### payments
```
id, reservation_id, amount, method, status, paid_at, refunded_at
```

### reviews
```
id, reservation_id, user_id, manager_id, rating, content
```

---

## API 엔드포인트

### 인증 `/api/v1/auth`
| Method | Endpoint | 설명 |
|--------|----------|------|
| POST | `/send-code` | 휴대폰 인증번호 발송 |
| POST | `/verify-code` | 인증번호 확인 (verification_token 반환) |
| POST | `/register` | 회원가입 (verification_token 필요) |
| POST | `/login` | 로그인 (휴대폰 + 인증코드) |
| POST | `/refresh` | 토큰 갱신 |
| POST | `/kakao` | 카카오 로그인 (TODO) |

> **개발 모드**: 인증번호 `000000` 입력 시 항상 인증 통과

### 예약 `/api/v1/reservations`
| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/` | 예약 목록 |
| POST | `/` | 예약 생성 |
| GET | `/{id}` | 예약 상세 |
| PATCH | `/{id}` | 예약 수정 |
| DELETE | `/{id}` | 예약 취소 |
| PATCH | `/{id}/status` | 상태 업데이트 (매니저) |

### 매니저 `/api/v1/managers`
| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/` | 매니저 목록 |
| GET | `/{id}` | 매니저 상세 |
| GET | `/{id}/reviews` | 리뷰 목록 |
| GET | `/{id}/schedule` | 일정 조회 |
| PATCH | `/{id}/schedule` | 일정 수정 |

---

## 기술 스택

### Frontend
- **Framework**: Next.js 14 (App Router)
- **UI**: React 18 + MUI (Material-UI) v5
- **State**: Zustand + TanStack Query
- **Forms**: React Hook Form + Zod
- **Maps**: react-kakao-maps-sdk

### Backend
- **Framework**: Python 3.11 + FastAPI
- **ORM**: SQLAlchemy 2.0 + Alembic
- **Validation**: Pydantic v2
- **Task Queue**: Celery + Redis
- **Auth**: python-jose (JWT) + passlib

### Infrastructure
- **Database**: PostgreSQL 15
- **Cache**: Redis 7
- **Container**: Docker + Docker Compose
- **CI/CD**: GitHub Actions

---

## UI/UX 가이드

### MUI 테마 색상
```typescript
primary: '#2563EB'    // 파란색 - 주요 액션
secondary: '#7C3AED'  // 보라색 - 보조 액션
success: '#10B981'    // 녹색 - 성공/완료
warning: '#F59E0B'    // 주황색 - 경고
error: '#EF4444'      // 빨간색 - 오류
background: '#F9FAFB' // 배경색
```

### 폰트
- Primary: Pretendard
- Fallback: Noto Sans KR, sans-serif

### 디자인 원칙
- 고령자 친화적 UI (큰 글씨, 명확한 버튼)
- 3단계 이내 예약 완료
- 실시간 상태 시각화

---

## 프로젝트 구조

```
skyedu/
├── frontend/                 # Next.js 프론트엔드
│   └── src/
│       ├── app/              # App Router 페이지
│       │   ├── (auth)/       # 인증 (로그인/회원가입)
│       │   ├── (customer)/   # 고객 페이지
│       │   ├── (manager)/    # 매니저 페이지
│       │   └── admin/        # 관리자 페이지
│       ├── components/       # React 컴포넌트
│       ├── hooks/            # 커스텀 훅
│       ├── lib/              # 유틸리티
│       ├── stores/           # Zustand 스토어
│       ├── types/            # TypeScript 타입
│       └── theme/            # MUI 테마
├── backend/                  # Python FastAPI 백엔드
│   ├── alembic/              # DB 마이그레이션
│   │   ├── versions/         # 마이그레이션 파일
│   │   └── env.py            # Alembic 환경 설정
│   └── app/
│       ├── api/
│       │   ├── deps.py       # 의존성 (인증, DB 세션)
│       │   └── v1/endpoints/ # API 엔드포인트
│       ├── core/             # 설정, 보안
│       ├── db/               # DB 세션, Base 클래스
│       ├── models/           # SQLAlchemy 모델
│       ├── schemas/          # Pydantic 스키마
│       ├── services/         # 비즈니스 로직
│       └── tasks/            # Celery 태스크 (TODO)
├── docker/                   # Docker 설정
├── docs/                     # 기획서, 문서
└── .github/                  # CI/CD 워크플로우
```

---

## 개발 명령어 (Skills)

| 명령어 | 설명 |
|--------|------|
| `/dev-setup` | 개발 환경 설정 (Docker, 의존성 설치) |
| `/lint` | 코드 린트 검사 (ESLint, Ruff) |
| `/lint --fix` | 린트 오류 자동 수정 |
| `/test` | 테스트 실행 (pytest, Jest) |
| `/db-migrate` | DB 마이그레이션 적용 |
| `/db-migrate --generate "설명"` | 마이그레이션 파일 생성 |
| `/build` | 프로젝트 빌드 |
| `/gitpush` | 변경사항 분석 후 커밋 & 푸시 |
| `/gitpull` | dev 브랜치 동기화 |

---

## 코딩 컨벤션

### TypeScript/JavaScript
- ESLint + Prettier 사용
- 함수형 컴포넌트 + 훅 패턴
- 절대 경로 import (`@/components/...`)
- `any` 사용 금지 → `unknown` 사용
- `strict: true` 모드 준수

**네이밍 컨벤션:**
- 변수/함수: `camelCase` (예: `getUserInfo`)
- 상수: `UPPER_SNAKE_CASE` (예: `MAX_RETRIES`)
- 컴포넌트/클래스: `PascalCase` (예: `UserProfile`)
- Boolean: `is`, `has`, `should` 접두사 (예: `isLoading`)
- 이벤트 핸들러: `handle` 접두사 (예: `handleClick`)

**파일명:**
- 컴포넌트: `PascalCase.tsx` (예: `UserCard.tsx`)
- 유틸리티: `camelCase.ts` (예: `formatDate.ts`)
- 타입: `types.ts` 또는 `*.types.ts`
- 테스트: `*.test.ts`, `*.spec.ts`

**Import 순서:**
1. 외부 라이브러리 (react, next 등)
2. 내부 모듈 (@/components 등)
3. 상대 경로 (../components 등)
4. 타입 import (type { ... })

### Python
- Ruff 린터 사용 (line-length: 100)
- Type hints 필수
- PEP 8 스타일 가이드 준수
- docstring 필수 (Google 스타일)

**네이밍 컨벤션:**
- 변수/함수: `snake_case` (예: `get_user_info`)
- 상수: `UPPER_SNAKE_CASE` (예: `MAX_RETRIES`)
- 클래스: `PascalCase` (예: `UserService`)
- Private: `_` 접두사 (예: `_internal_method`)
- 비동기 함수: async/await 사용

**Import 순서:**
1. 표준 라이브러리
2. 서드파티 라이브러리
3. 로컬 모듈

### Git 커밋
- Conventional Commits 형식
- 타입: feat, fix, docs, style, refactor, test, chore

---

## 보안 규칙 (필수)

> **CRITICAL**: 보안 관련 기능은 반드시 검증된 라이브러리와 방식만 사용합니다.
> OWASP Top 10 취약점(Injection, XSS, CSRF 등)을 반드시 방지해야 합니다.

### Python (FastAPI)

| 기능 | 필수 라이브러리 | 금지 |
|------|----------------|------|
| JWT | `python-jose[cryptography]` | `PyJWT` 단독 사용 |
| 비밀번호 해싱 | `passlib[bcrypt]`, `bcrypt` | 직접 구현, MD5, SHA1 |
| 암호화 | `cryptography` | 직접 구현 |
| HTTP 클라이언트 | `httpx` (async) | `urllib` 직접 사용 |

```python
# 올바른 import
from jose import jwt  # python-jose 사용
import bcrypt         # passlib과 함께 사용
```

### TypeScript/JavaScript

| 기능 | 필수 라이브러리 | 금지 |
|------|----------------|------|
| JWT | `jose` | `jsonwebtoken` 단독 |
| 인증 쿠키 | `httpOnly`, `secure`, `sameSite` 필수 | 일반 쿠키에 토큰 저장 |

### 인증 쿠키 필수 설정

```python
response.set_cookie(
    key="token",
    value=token,
    httponly=True,      # JavaScript 접근 차단
    secure=True,        # HTTPS 전용 (프로덕션)
    samesite="lax",     # CSRF 방지
)
```

### 취약점 방지 필수 사항

| 취약점 | 방지 방법 |
|--------|----------|
| SQL Injection | ORM 사용, 파라미터 바인딩 필수 |
| XSS | 입력값 이스케이프, CSP 헤더 |
| CSRF | SameSite 쿠키, CSRF 토큰 |
| 인증 우회 | JWT 검증, 세션 관리 |
| 민감정보 노출 | 환경변수, 로그 마스킹 |

### 금지 사항

- 비밀번호 평문 저장/로깅
- 토큰을 localStorage에 저장 (XSS 취약)
- 직접 암호화 알고리즘 구현
- 환경변수 없이 시크릿 키 하드코딩
- SQL 문자열 직접 조합
- 사용자 입력값 검증 없이 사용

### JWT 인증 필수

> **중요**: 공개 API를 제외한 모든 API는 JWT access token 검증이 필수입니다.

| 구분 | 인증 필요 | 예시 |
|------|----------|------|
| 공개 API | X | 로그인, 회원가입, 공개 조회 |
| 일반 API | O | 예약 CRUD, 사용자 정보 |
| 관리자 API | O + 권한 | 사용자 관리, 시스템 설정 |

### 에러 처리 규칙

| 항목 | 개발 환경 | 프로덕션 환경 |
|------|----------|-------------|
| 에러 메시지 | 상세 메시지 | 일반 메시지 |
| 스택 트레이스 | 포함 | 절대 금지 |
| 성공/실패 판단 | `success` 필드 | `success` 필드 |

---

## 환경 변수

### Backend (.env)
```
DATABASE_URL=postgresql+asyncpg://postgres:password@localhost:5432/skyedu
REDIS_URL=redis://localhost:6379/0
SECRET_KEY=your-secret-key-change-in-production
KAKAO_CLIENT_ID=
KAKAO_CLIENT_SECRET=
TOSS_CLIENT_KEY=
TOSS_SECRET_KEY=
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_KAKAO_MAP_KEY=
NEXT_PUBLIC_KAKAO_CLIENT_ID=
```

---

## 아키텍처 가이드

### 모듈화 원칙

1. **공유 타입**: `frontend/src/types/`에만 정의
2. **컴포넌트 전용 타입**: 해당 컴포넌트 파일 내 `interface`로 정의 (OK)
3. **레이어 분리**: lib(로직), components(UI), hooks(상태), stores(전역상태)
4. **Public API**: `index.ts`에서 명시적 export

### 디렉토리 구조

```
frontend/src/
├── app/                  # Next.js App Router 페이지
│   ├── (auth)/           # 인증 관련 (로그인/회원가입)
│   ├── companion/        # 동행인 페이지
│   ├── mypage/           # 마이페이지
│   └── reservation/      # 예약 페이지
├── components/           # 재사용 컴포넌트
│   ├── common/           # 공통 (Header, Footer, RegionSelector)
│   ├── auth/             # 인증 관련
│   └── companion/        # 동행인 관련
├── hooks/                # 커스텀 React 훅
├── lib/                  # 유틸리티, API, 상수
├── stores/               # Zustand 전역 상태
├── types/                # 공유 TypeScript 타입
└── theme/                # MUI 테마 설정
```

### 모듈 Import 가이드

각 모듈은 `index.ts`를 통해 export하므로 간결하게 import할 수 있습니다:

```typescript
// 타입
import type { User, Reservation, Province, Promotion } from '@/types';

// 훅
import { useAuth, useReservations, useRegions, useApi } from '@/hooks';

// 라이브러리
import { api, formatPrice, SERVICE_PRICES } from '@/lib';
```

### 의존성 규칙

```
types → lib → hooks → stores → components → app
  ↓      ↓      ↓        ↓          ↓         ↓
(최하위)                                  (최상위)
```

- `types/` → 다른 모듈 import 금지
- `lib/` → types만 import 가능
- `hooks/` → types, lib import 가능
- `stores/` → types, lib import 가능
- `components/` → lib, hooks, stores import 가능
- `app/` → 모든 모듈 import 가능

### 훅 모듈 (`hooks/`)

| 훅 | 설명 |
|-----|------|
| `useAuth` | 로그인/로그아웃, 인증 상태, 역할 확인 |
| `useApi` | 범용 API 호출 (로딩/에러 상태 관리) |
| `useMutation` | POST/PUT/DELETE용 (성공/실패 콜백) |
| `useReservations` | 예약 목록 조회 |
| `useReservation` | 단일 예약 조회 |
| `useCreateReservation` | 예약 생성 |
| `useCancelReservation` | 예약 취소 |
| `useCompanions` | 동행인 목록 조회 |
| `useCompanion` | 단일 동행인 조회 |
| `useRegions` | 지역 데이터 (JSON 동적 로딩) |

### 타입 모듈 (`types/`)

| 파일 | 내용 |
|------|------|
| `user.ts` | User, UserRole, AuthResponse, LoginRequest |
| `reservation.ts` | Reservation, ServiceType, ReservationStatus |
| `manager.ts` | Manager, ManagerStatus, ManagerGrade |
| `region.ts` | Province, District, RegionData |
| `promotion.ts` | Promotion, DiscountType, DiscountTarget |
| `index.ts` | 전체 re-export + ApiError, PaginatedResponse |

### 라이브러리 모듈 (`lib/`)

| 파일 | 내용 |
|------|------|
| `api.ts` | ApiClient 클래스 (axios 기반) |
| `utils.ts` | 포맷팅 함수 (날짜, 가격, 전화번호 등) |
| `constants.ts` | 상수 (가격, 수수료, 지역, 운영시간 등) |
| `geolocation.ts` | 위치 관련 유틸리티 |
| `mockData.ts` | 개발용 Mock 데이터 |
| `index.ts` | 전체 re-export |

---

## 구현된 기능 (Frontend)

### 1. 접근성 - 글씨 크기 조절

**전역 글씨 크기 설정**이 사이트 전체에 적용됩니다.

| 파일 | 설명 |
|------|------|
| `stores/settingsStore.ts` | UI 크기 상태 관리 (Zustand + persist) |
| `theme/ScaledThemeProvider.tsx` | MUI 테마에 scale 동적 적용 |
| `components/common/UISizeControl.tsx` | 글씨 크기 조절 UI 컴포넌트 |

**크기 단계:**
| 단계 | 코드 | 배율 |
|------|------|------|
| 작게 | `small` | 0.9x |
| 보통 | `medium` | 1.0x |
| 크게 | `large` | 1.15x |
| 아주 크게 | `xlarge` | 1.3x |

**사용법:**
```typescript
// 컴포넌트에서 (수동 적용 불필요 - 테마에서 자동 적용)
// CSS 변수로도 사용 가능
// document.documentElement.style.getPropertyValue('--ui-scale')
```

### 2. 지역 데이터 시스템

**동적 JSON 로딩 방식**으로 지역 데이터를 관리합니다.

| 파일 | 설명 |
|------|------|
| `public/data/regions.json` | 시/도 및 시/군/구 전체 데이터 |
| `hooks/useRegions.ts` | 지역 데이터 로딩 훅 |
| `components/common/RegionSelector.tsx` | 지역 선택 공통 컴포넌트 |

**regions.json 구조:**
```json
{
  "provinces": [
    { "code": "seoul", "name": "서울특별시", "shortName": "서울" }
  ],
  "districts": {
    "seoul": [
      { "code": "seoul-gangnam", "name": "강남구" }
    ]
  }
}
```

**useRegions 훅 반환값:**
- `provinces`: 시/도 목록
- `districts`: 시/군/구 목록 (시/도별)
- `getProvince(code)`: 시/도 정보
- `getDistrictsByProvince(code)`: 해당 시/도의 시/군/구 목록
- `getFullRegionName(code)`: 전체 지역명 (예: "서울 강남구")
- `getProvinceName(code)`: 시/도명
- `isLoading`, `error`: 로딩 상태

**RegionSelector 사용:**
```tsx
<RegionSelector
  province={province}
  onProvinceChange={setProvince}
  multiple={true}  // 다중 선택
  selectedDistricts={districts}
  onDistrictsChange={setDistricts}
  showCompanionCount={true}  // 동행인 수 표시
  provinceCompanionCounts={{ seoul: 42, gyeonggi: 18 }}
  districtCompanionCounts={{ 'seoul-gangnam': 8 }}
/>
```

### 3. 동행인 페이지

| 페이지 | 경로 | 설명 |
|--------|------|------|
| 동행인 목록 | `/companions` | 전국/지역별 필터, 프로필 카드 |
| 동행인 상세 | `/companions/[id]` | 프로필, 후기, 예약 버튼 |
| 동행인 블로그 | `/companions/[id]/blog` | 활동 내역, 통계, 뱃지 |

**목록 페이지 기능:**
- 시/도 → 시/군/구 2단계 필터링
- "전국 보기" 버튼
- 가격 필터 (20,000원 이하 ~ 50,000원 이상)
- 정렬 (추천순, 평점순, 가격순, 리뷰순)
- 뱃지 표시 (NEW, 할인)

### 4. 동행인 설정 (동행인 전용)

| 페이지 | 경로 | 설명 |
|--------|------|------|
| 설정 메인 | `/companion/settings` | 설정 메뉴 카드 |
| 프로모션 설정 | `/companion/settings/promotions` | 할인/프로모션 관리 |
| 서비스 지역 | `/companion/settings/areas` | 활동 지역 설정 |
| 일정 관리 | `/companion/schedule` | 캘린더 기반 일정 |
| 대시보드 | `/companion/dashboard` | 통계, 예약 현황 |

**프로모션 설정:**
- 할인 유형: 정률(%) / 정액(원)
- 대상: 전체 / 신규고객 / 재방문 / 특정 서비스
- 기간 설정, 최대 사용 횟수
- 활성/비활성 토글

**서비스 지역 설정:**
- 시/도 → 시/군/구 다중 선택
- 지역별 동행인 수 표시 (경쟁 현황)
- "기회 지역" 추천 (동행인 2명 이하)
- 색상 코딩: 회색(0명), 초록(1-2명, 기회), 파랑(3명+)

### 5. 동행인 일정 관리

| 파일 | 설명 |
|------|------|
| `app/companion/schedule/page.tsx` | 캘린더 기반 일정 관리 |

**기능:**
- FullCalendar 스타일 월간 캘린더
- 휴무일 설정 (클릭/드래그)
- 시간대별 예약 가능 설정
- 예약 현황 표시

### 6. 동행인 가입 프로세스

| 페이지 | 경로 | 설명 |
|--------|------|------|
| 가입 신청 | `/companion/register` | 동행인 등록 폼 |
| 가입 안내 | `/become-companion` | 동행인 되기 안내 |

**가입 폼 단계:**
1. 기본 정보 (이름, 연락처)
2. 서비스 지역 선택 (RegionSelector)
3. 자격증/경력
4. 서비스 유형 및 가격 설정

### 7. 예약 시스템

| 페이지 | 경로 | 설명 |
|--------|------|------|
| 예약하기 | `/reservation/new` | 3단계 예약 폼 |
| 예약 내역 | `/mypage/reservations` | 예약 목록/상세 |

**예약 3단계:**
1. 날짜/시간 선택
2. 병원 정보 입력
3. 서비스 유형 선택 및 확인

### 8. 마이페이지

| 페이지 | 경로 | 설명 |
|--------|------|------|
| 메인 | `/mypage` | 프로필, 메뉴 |
| 예약 내역 | `/mypage/reservations` | 예약 목록 |
| 프로필 수정 | `/mypage/profile` | 정보 수정 |

### 9. 인증 시스템 (휴대폰 인증 기반)

| 페이지 | 경로 | 설명 |
|--------|------|------|
| 로그인 | `/login` | 휴대폰 인증 로그인 |
| 회원가입 | `/register` | 휴대폰 인증 + 역할 선택 가입 |
| 이용약관 | `/terms` | 서비스 이용약관 |
| 개인정보처리방침 | `/privacy` | 개인정보 처리방침 |

**인증 흐름:**
1. 휴대폰 번호 입력 → 인증번호 발송 (`/send-code`)
2. 인증번호 확인 → verification_token 발급 (`/verify-code`)
3. 회원가입: 이름, 역할 선택 + verification_token 전송 (`/register`)
4. 로그인: 휴대폰 + 인증번호로 직접 로그인 (`/login`)

> **개발 모드**: 인증번호 `000000` 입력 시 항상 인증 통과

---

## 구현된 기능 (Backend)

### 1. 데이터베이스 모델

| 모델 | 테이블 | 설명 |
|------|--------|------|
| `User` | `users` | 사용자 (고객/매니저/관리자) |
| `UserProfile` | `user_profiles` | 사용자 추가 정보 |
| `Manager` | `managers` | 매니저 프로필 |
| `ManagerSchedule` | `manager_schedules` | 매니저 일정 |
| `Reservation` | `reservations` | 예약 |
| `Payment` | `payments` | 결제 |
| `Review` | `reviews` | 리뷰 |
| `Promotion` | `promotions` | 프로모션/할인 |

### 2. API 엔드포인트 (구현 완료)

| 라우터 | 경로 | 주요 기능 |
|--------|------|----------|
| `auth` | `/api/v1/auth` | 회원가입, 로그인, 로그아웃 |
| `users` | `/api/v1/users` | 사용자 CRUD, 역할 변경 |
| `reservations` | `/api/v1/reservations` | 예약 CRUD, 상태 변경, 매니저 배정 |
| `managers` | `/api/v1/managers` | 매니저 등록, 프로필, 스케줄 관리 |
| `payments` | `/api/v1/payments` | 결제 생성, 확인, 환불 |
| `reviews` | `/api/v1/reviews` | 리뷰 CRUD, 통계 |

### 3. 인증 시스템

| 의존성 | 설명 | 사용 |
|--------|------|------|
| `get_current_user` | JWT 토큰 검증, 사용자 반환 | 인증 필수 API |
| `get_current_user_optional` | 선택적 인증 | 공개/인증 혼합 API |
| `get_current_active_manager` | 매니저 권한 확인 | 매니저 전용 API |
| `get_current_admin` | 관리자 권한 확인 | 관리자 전용 API |

**Type Aliases:**
```python
from app.api.deps import CurrentUser, CurrentManager, CurrentAdmin, DbSession

@router.get("/me")
async def get_me(current_user: CurrentUser, db: DbSession):
    ...
```

### 4. 서비스 레이어

| 서비스 | 파일 | 기능 |
|--------|------|------|
| `PriceService` | `services/price.py` | 가격 계산, 추가 요금, 매니저 수익 |
| `ReservationService` | `services/reservation.py` | 예약 생성, 매니저 가용성 체크 |

**PriceService 사용:**
```python
from app.services.price import PriceService

# 총 가격 계산
price_info = PriceService.calculate_total_price(
    service_type="full_care",
    estimated_hours=Decimal("3"),
    scheduled_date=date(2025, 1, 15),
    scheduled_time=time(10, 0),
    distance_km=15,
)
# Returns: base_price, distance_surcharge, urgent_surcharge, total 등

# 매니저 수익 계산
revenue = PriceService.calculate_manager_revenue(
    total_price=Decimal("100000"),
    manager_grade="premium",
)
# Returns: platform_fee, manager_revenue, fee_rate
```

### 5. Alembic 마이그레이션

**명령어:**
```bash
cd backend
source .venv/bin/activate

# 마이그레이션 생성 (모델 변경 후)
alembic revision --autogenerate -m "설명"

# 마이그레이션 적용
alembic upgrade head

# 롤백
alembic downgrade -1
```

### 6. 백엔드 실행

```bash
cd backend

# 가상환경 활성화
source .venv/bin/activate

# 개발 서버 실행
uvicorn app.main:app --reload --port 8000

# API 문서 확인
# http://localhost:8000/docs (Swagger)
# http://localhost:8000/redoc (ReDoc)
```

### 7. 모듈 Import 가이드 (Backend)

```python
# 모델
from app.models import User, Manager, Reservation, Payment, Review, Promotion

# 스키마
from app.schemas import (
    UserResponse, ReservationCreate, ManagerResponse,
    PaymentResponse, ReviewResponse, PromotionResponse
)

# 인증 의존성
from app.api.deps import CurrentUser, CurrentAdmin, DbSession

# 서비스
from app.services import PriceService, ReservationService

# 설정
from app.core.config import settings
from app.core.security import create_access_token, verify_password
```

---

## 리팩터링 TODO

### 타입 중복 개선 (완료)

- [x] `frontend/src/app/reservation/new/page.tsx` - `ServiceType` → `@/types`에서 import
- [x] `frontend/src/app/(auth)/register/page.tsx` - `UserRole` → `@/types`에서 import

### 구조 개선 (완료)

- [x] `frontend/src/hooks/useRegions.ts` - 지역 데이터 로딩 훅 추가
- [x] Backend API 엔드포인트 구현
- [x] Backend 인증 시스템 구현
- [x] Backend 서비스 레이어 구현
- [x] Alembic 마이그레이션 설정

### 기능 구현 현황

**Frontend:**
- [x] 글씨 크기 전역 적용 (ScaledThemeProvider)
- [x] 지역 데이터 JSON 분리 및 동적 로딩
- [x] 지역별 동행인 수 표시 기능
- [x] 동행인 프로모션/할인 설정
- [x] 동행인 서비스 지역 설정
- [x] 동행인 활동 블로그 페이지
- [x] 휴대폰 인증 로그인/회원가입 (백엔드 연동 완료)
- [x] 이용약관/개인정보처리방침 페이지
- [x] API 클라이언트 snake_case/camelCase 자동 변환
- [ ] 예약/동행인 API 연동 (현재 Mock 데이터)
- [ ] 결제 시스템 연동
- [ ] 실시간 알림 시스템

**Backend:**
- [x] 데이터베이스 모델 (User, Manager, Reservation, Payment, Review, Promotion)
- [x] 휴대폰 인증 기반 인증 시스템 (개발모드: 000000 통과)
- [x] JWT 인증 시스템 (access/refresh token)
- [x] API 엔드포인트 (auth, users, reservations, managers, payments, reviews)
- [x] 가격 계산 서비스 (기본가, 추가요금, 수수료)
- [x] 예약 서비스 (가용성 체크, 매칭)
- [x] Alembic 마이그레이션 설정
- [ ] SMS 발송 서비스 연동 (현재 인메모리)
- [ ] Celery 태스크 (알림, 정산)
- [ ] 카카오 OAuth 연동
- [ ] 토스페이먼츠 연동

---

## 문서

- [기획서](./docs/01_기획서.md) - 서비스 기획, 페르소나, IA
- [제작플랜](./docs/02_제작플랜.md) - 기술 스택, DB 설계, API 설계, 마일스톤
