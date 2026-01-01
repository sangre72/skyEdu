#!/bin/bash

# 곁에 Frontend 실행 스크립트

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# 색상 정의
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}🏥 곁에 Frontend 시작${NC}"
echo "================================"

# .env.local 파일 확인
if [ ! -f ".env.local" ]; then
    echo -e "${YELLOW}⚠️  .env.local 파일이 없습니다. .env.example에서 복사합니다.${NC}"
    cp .env.example .env.local
    echo -e "${GREEN}✅ .env.local 파일이 생성되었습니다. 필요시 수정하세요.${NC}"
fi

# 패키지 매니저 확인 (pnpm > npm)
if command -v pnpm &> /dev/null; then
    PKG_MANAGER="pnpm"
elif command -v npm &> /dev/null; then
    PKG_MANAGER="npm"
else
    echo -e "${RED}❌ npm 또는 pnpm이 설치되어 있지 않습니다.${NC}"
    exit 1
fi

echo -e "${GREEN}📦 패키지 매니저: $PKG_MANAGER${NC}"

# node_modules 확인 및 설치
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📥 의존성 설치 중...${NC}"
    $PKG_MANAGER install
    echo -e "${GREEN}✅ 의존성 설치 완료${NC}"
fi

# 서버 실행
echo ""
echo -e "${GREEN}🚀 Frontend 서버 시작${NC}"
echo -e "${GREEN}   URL: http://localhost:3000${NC}"
echo "================================"
echo ""

$PKG_MANAGER run dev
