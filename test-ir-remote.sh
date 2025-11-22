#!/bin/bash

echo "======================================"
echo "🔍 IR Remote Diagnostic Test"
echo "======================================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Test 1: Check if LIRC config is installed
echo "Test 1: LIRC Configuration"
if [ -f /etc/lirc/lircd.conf.d/mirror-remote.conf ]; then
    echo -e "${GREEN}✓${NC} LIRC config installed"
else
    echo -e "${RED}✗${NC} LIRC config not found"
    echo "   Run: ./setup-ir-remote.sh"
fi

# Test 2: Check if LIRC daemon is running
echo ""
echo "Test 2: LIRC Daemon Status"
if systemctl is-active --quiet lircd; then
    echo -e "${GREEN}✓${NC} LIRC daemon is running"
else
    echo -e "${RED}✗${NC} LIRC daemon is not running"
    echo "   Run: sudo systemctl restart lircd"
fi

# Test 3: Test LIRC button detection
echo ""
echo "Test 3: LIRC Button Detection"
echo -e "${YELLOW}Press ANY button on your remote within 3 seconds...${NC}"
timeout 3s irw > /tmp/irw_diag.txt 2>&1
if [ -s /tmp/irw_diag.txt ]; then
    echo -e "${GREEN}✓${NC} LIRC is detecting button presses"
    echo "   Last button detected:"
    tail -n 1 /tmp/irw_diag.txt | sed 's/^/   /'
else
    echo -e "${RED}✗${NC} No button presses detected"
    echo "   Test manually: irw"
fi
rm -f /tmp/irw_diag.txt

# Test 4: Check if IR server is running
echo ""
echo "Test 4: IR Remote Server Status"
if lsof -Pi :8765 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo -e "${GREEN}✓${NC} IR Remote Server is running on port 8765"
    PID=$(lsof -ti:8765)
    echo "   Process ID: $PID"
else
    echo -e "${RED}✗${NC} IR Remote Server is not running"
    echo "   Start with: npm run ir-server"
fi

# Test 5: Check if Luma app is running
echo ""
echo "Test 5: Luma App Status"
if lsof -Pi :5173 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo -e "${GREEN}✓${NC} Luma App is running on port 5173"
    echo "   Access at: http://localhost:5173"
else
    echo -e "${RED}✗${NC} Luma App is not running"
    echo "   Start with: npm run dev"
fi

# Test 6: Check Node dependencies
echo ""
echo "Test 6: Node.js Dependencies"
if npm list ws > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} WebSocket package (ws) is installed"
else
    echo -e "${RED}✗${NC} WebSocket package not found"
    echo "   Install with: npm install ws"
fi

echo ""
echo "======================================"
echo "Summary"
echo "======================================"
echo ""
echo "If all tests pass, your IR remote should work!"
echo ""
echo "If tests fail:"
echo "  1. Run setup: ./setup-ir-remote.sh"
echo "  2. Start IR server: npm run ir-server"
echo "  3. Start Luma app: npm run dev"
echo "  4. Check browser console for WebSocket connection"
echo ""
