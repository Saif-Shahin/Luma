#!/bin/bash

echo "======================================"
echo "🎮 Luma IR Remote Setup Script"
echo "======================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Check if LIRC config exists
echo "Step 1: Checking for LIRC configuration..."
if [ -f ~/mirror-remote.lircd.conf ]; then
    echo -e "${GREEN}✓${NC} Found LIRC config: ~/mirror-remote.lircd.conf"
else
    echo -e "${RED}✗${NC} LIRC config not found at ~/mirror-remote.lircd.conf"
    echo "Please create your LIRC config first using 'irrecord'"
    exit 1
fi

# Step 2: Copy LIRC config to system directory
echo ""
echo "Step 2: Installing LIRC configuration..."
sudo cp ~/mirror-remote.lircd.conf /etc/lirc/lircd.conf.d/mirror-remote.conf
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓${NC} LIRC config installed to /etc/lirc/lircd.conf.d/"
else
    echo -e "${RED}✗${NC} Failed to install LIRC config"
    exit 1
fi

# Step 3: Restart LIRC daemon
echo ""
echo "Step 3: Restarting LIRC daemon..."
sudo systemctl restart lircd
sleep 2
if systemctl is-active --quiet lircd; then
    echo -e "${GREEN}✓${NC} LIRC daemon is running"
else
    echo -e "${RED}✗${NC} LIRC daemon failed to start"
    echo "Check status with: sudo systemctl status lircd"
    exit 1
fi

# Step 4: Test LIRC
echo ""
echo "Step 4: Testing LIRC..."
echo -e "${YELLOW}Press ANY button on your remote within 3 seconds...${NC}"

# Run irw with a timeout
timeout 3s irw > /tmp/irw_test.txt 2>&1 &
IRW_PID=$!
sleep 3

if [ -s /tmp/irw_test.txt ]; then
    echo -e "${GREEN}✓${NC} LIRC is receiving button presses!"
    echo "   Sample output:"
    head -n 1 /tmp/irw_test.txt | sed 's/^/   /'
else
    echo -e "${RED}✗${NC} LIRC is not receiving button presses"
    echo "Troubleshooting:"
    echo "  1. Check IR receiver wiring"
    echo "  2. Test with: irw"
    echo "  3. Check LIRC status: sudo systemctl status lircd"
    rm -f /tmp/irw_test.txt
    exit 1
fi
rm -f /tmp/irw_test.txt

# Step 5: Check if Node.js dependencies are installed
echo ""
echo "Step 5: Checking Node.js dependencies..."
if [ -d "node_modules" ]; then
    echo -e "${GREEN}✓${NC} Node modules installed"
else
    echo -e "${YELLOW}⚠${NC} Node modules not found. Installing..."
    npm install
fi

# Check if ws package is installed
if npm list ws > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} WebSocket package (ws) installed"
else
    echo -e "${YELLOW}⚠${NC} Installing WebSocket package..."
    npm install ws
fi

# Step 6: Test if port 8765 is available
echo ""
echo "Step 6: Checking WebSocket port availability..."
if lsof -Pi :8765 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo -e "${YELLOW}⚠${NC} Port 8765 is already in use"
    echo "   Killing existing process..."
    lsof -ti:8765 | xargs kill -9 2>/dev/null
    sleep 1
    echo -e "${GREEN}✓${NC} Port 8765 is now available"
else
    echo -e "${GREEN}✓${NC} Port 8765 is available"
fi

echo ""
echo "======================================"
echo -e "${GREEN}✓ Setup Complete!${NC}"
echo "======================================"
echo ""
echo "Next steps:"
echo ""
echo "1. Start the IR Remote Server (in one terminal):"
echo "   cd ~/Luma"
echo "   npm run ir-server"
echo ""
echo "2. Start the Luma App (in another terminal):"
echo "   cd ~/Luma"
echo "   npm run dev"
echo ""
echo "3. Open browser and check console for:"
echo "   ✅ Connected to IR remote server"
echo "   📡 IR Remote Server Ready"
echo ""
echo "4. Test by pressing buttons on your remote!"
echo ""
echo "Troubleshooting:"
echo "  • View IR server logs: npm run ir-server"
echo "  • Test LIRC manually: irw"
echo "  • Check IR server is running: lsof -i :8765"
echo ""
