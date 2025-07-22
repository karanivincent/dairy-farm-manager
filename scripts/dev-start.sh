#!/bin/bash

# Colors for better visibility
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo ""
echo "🚀 ${GREEN}Starting Daily Farm Manager Development Servers${NC}"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📱 ${BLUE}Frontend (React PWA):${NC}"
echo "   ${YELLOW}➜${NC} Local:    http://localhost:5173"
echo "   ${YELLOW}➜${NC} Network:  http://localhost:5173"
echo ""
echo "🔧 ${BLUE}Backend API (NestJS):${NC}"
echo "   ${YELLOW}➜${NC} Local:    http://localhost:3000"
echo "   ${YELLOW}➜${NC} Swagger:  http://localhost:3000/api-docs"
echo ""
echo "🗄️  ${BLUE}Database Tools:${NC}"
echo "   ${YELLOW}➜${NC} pgAdmin:  http://localhost:5050"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Press Ctrl+C to stop all servers"
echo ""

# Run the dev command
npm run dev:concurrent