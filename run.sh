#!/bin/bash

# 곁에 전체 프로젝트 실행 스크립트

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# 색상 정의
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}"
echo "╔══════════════════════════════════════╗"
echo "║      🏥 곁에 (Gyeote) 개발 서버       ║"
echo "║      병원동행 플랫폼                  ║"
echo "╚══════════════════════════════════════╝"
echo -e "${NC}"

# 명령어 처리
case "${1:-all}" in
    docker|db)
        echo -e "${GREEN}🐳 Docker 서비스 시작 (PostgreSQL + Redis)${NC}"
        cd docker
        docker compose up -d
        echo ""
        echo -e "${GREEN}✅ Docker 서비스 시작 완료${NC}"
        echo -e "   PostgreSQL: localhost:5432"
        echo -e "   Redis: localhost:6379"
        ;;

    backend|api)
        echo -e "${GREEN}🔧 Backend 서버 시작${NC}"
        cd backend
        ./run.sh
        ;;

    frontend|web)
        echo -e "${GREEN}🎨 Frontend 서버 시작${NC}"
        cd frontend
        ./run.sh
        ;;

    all)
        echo -e "${YELLOW}사용법:${NC}"
        echo ""
        echo -e "  ${GREEN}./run.sh docker${NC}    - Docker 서비스 시작 (DB, Redis)"
        echo -e "  ${GREEN}./run.sh backend${NC}   - Backend API 서버 시작"
        echo -e "  ${GREEN}./run.sh frontend${NC}  - Frontend 개발 서버 시작"
        echo ""
        echo -e "${YELLOW}개발 시작 순서:${NC}"
        echo "  1. ./run.sh docker   (터미널 1)"
        echo "  2. ./run.sh backend  (터미널 2)"
        echo "  3. ./run.sh frontend (터미널 3)"
        echo ""
        echo -e "${YELLOW}접속 URL:${NC}"
        echo "  Frontend: http://localhost:3000"
        echo "  Backend:  http://localhost:8000"
        echo "  API Docs: http://localhost:8000/docs"
        ;;

    stop)
        echo -e "${YELLOW}🛑 Docker 서비스 중지${NC}"
        cd docker
        docker compose down
        echo -e "${GREEN}✅ Docker 서비스 중지 완료${NC}"
        ;;

    *)
        echo -e "${RED}알 수 없는 명령: $1${NC}"
        echo "사용법: ./run.sh [docker|backend|frontend|stop]"
        exit 1
        ;;
esac
