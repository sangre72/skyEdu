# Gyeote Project Skills

병원동행 플랫폼 프로젝트를 위한 Claude Code skills 모음입니다.

## 사용 가능한 Skills

| Skill | 명령어 | 설명 |
|-------|--------|------|
| [dev-setup](./dev-setup) | `/dev-setup` | 개발 환경 설정 (Docker, 의존성 설치) |
| [lint](./lint) | `/lint` | 코드 린트 검사 (ESLint, Ruff) |
| [test](./test) | `/test` | 테스트 실행 (pytest, Jest) |
| [db-migrate](./db-migrate) | `/db-migrate` | DB 마이그레이션 관리 (Alembic) |
| [build](./build) | `/build` | 프로젝트 빌드 |

## Quick Start

### 1. 개발 환경 설정
```
/dev-setup
```

### 2. 코드 작성 후 린트 검사
```
/lint
/lint --fix  # 자동 수정
```

### 3. 테스트 실행
```
/test
/test --backend   # 백엔드만
/test --frontend  # 프론트엔드만
```

### 4. DB 스키마 변경 시
```
/db-migrate --generate "변경 설명"
/db-migrate
```

### 5. 빌드
```
/build
```

### 6. Git 작업
```
/gitpush   # 변경사항 커밋 & 푸시
/gitpull   # dev 브랜치 동기화
```

## 추가 정보

- 각 skill 폴더의 `SKILL.md` 파일에서 상세 사용법을 확인할 수 있습니다.
- 글로벌 skills (`~/.claude/skills/`)와 함께 사용할 수 있습니다.
