#!/bin/bash

# 곁에 Backend 실행 스크립트

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# 색상 정의
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}🏥 곁에 Backend 시작${NC}"
echo "================================"

# .env 파일 확인
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}⚠️  .env 파일이 없습니다. .env.example에서 복사합니다.${NC}"
    cp .env.example .env
    echo -e "${GREEN}✅ .env 파일이 생성되었습니다. 필요시 수정하세요.${NC}"
fi

# 가상환경 확인 및 생성
if [ ! -d ".venv" ]; then
    echo -e "${YELLOW}📦 가상환경 생성 중...${NC}"
    python3 -m venv .venv
fi

# 가상환경 활성화
echo -e "${GREEN}🔧 가상환경 활성화${NC}"
source .venv/bin/activate

# 의존성 설치 확인
if [ ! -f ".venv/.installed" ]; then
    echo -e "${YELLOW}📥 의존성 설치 중...${NC}"
    pip install --upgrade pip
    pip install -r requirements.txt
    touch .venv/.installed
    echo -e "${GREEN}✅ 의존성 설치 완료${NC}"
fi

# Docker 서비스 확인
echo -e "${GREEN}🐳 Docker 서비스 확인${NC}"
if ! docker ps | grep -q "gyeote-db"; then
    echo -e "${YELLOW}⚠️  PostgreSQL이 실행되지 않았습니다.${NC}"
    echo -e "${YELLOW}   다음 명령어로 Docker 서비스를 시작하세요:${NC}"
    echo -e "${YELLOW}   cd ../docker && docker compose up -d${NC}"
    echo ""
fi

# 서버 실행
echo ""
echo -e "${GREEN}🚀 Backend 서버 시작${NC}"
echo -e "${GREEN}   API: http://localhost:8000${NC}"
echo -e "${GREEN}   Docs: http://localhost:8000/docs${NC}"
echo "================================"
echo ""

uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
