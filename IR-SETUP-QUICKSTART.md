# IR Remote Quick Start Guide

## Your Current Status

✅ **Hardware Working** - IR receiver is blinking when you press buttons
✅ **LIRC Configured** - You have `~/mirror-remote.lircd.conf`
❌ **Not Connected** - Website isn't receiving commands yet

## Quick Setup (5 minutes)

### On your Raspberry Pi (via SSH):

#### Step 1: Run the setup script

```bash
cd ~/Luma
./setup-ir-remote.sh
```

This will:
- Install your LIRC configuration
- Restart the LIRC daemon
- Test if buttons are detected
- Check dependencies

#### Step 2: Start the IR Remote Server

Open a terminal/SSH session:

```bash
cd ~/Luma
npm run ir-server
```

You should see:
```
=================================
🎮 Luma IR Remote Server Running
=================================
WebSocket: ws://localhost:8765
Waiting for IR remote input...
```

**Keep this terminal open!** The server needs to stay running.

#### Step 3: Start the Luma App

Open **another** terminal/SSH session:

```bash
cd ~/Luma
npm run dev
```

You should see:
```
  VITE v7.x.x  ready in XXX ms

  ➜  Local:   http://localhost:5173/
```

#### Step 4: Open the browser

Open Chromium/browser on the Pi and go to: `http://localhost:5173`

#### Step 5: Check the browser console

Press F12 to open developer tools, click "Console" tab.

You should see:
```
✅ Connected to IR remote server
📡 IR Remote Server Ready
```

#### Step 6: Test your remote!

Press any button on your IR remote. You should see in the console:
```
🎮 IR Remote: UP
```

**And the mirror should respond!**

---

## Troubleshooting

### Run the diagnostic test:

```bash
cd ~/Luma
./test-ir-remote.sh
```

This will check:
- ✓ LIRC configuration
- ✓ LIRC daemon status
- ✓ Button detection
- ✓ IR server running
- ✓ Luma app running
- ✓ Dependencies installed

### Common Issues

#### 1. "irw" shows no output when pressing buttons

**Solution:**
```bash
# Check LIRC status
sudo systemctl status lircd

# Restart LIRC
sudo systemctl restart lircd

# Test IR receiver hardware
mode2 -d /dev/lirc0
# Press buttons - you should see pulse/space data
```

#### 2. IR server won't start (port 8765 in use)

**Solution:**
```bash
# Kill existing process
lsof -ti:8765 | xargs kill -9

# Try starting again
npm run ir-server
```

#### 3. Browser shows "Disconnected from IR remote server"

**Solution:**
- Make sure IR server is running (`npm run ir-server`)
- Check port 8765 is listening: `lsof -i :8765`
- Restart the IR server

#### 4. Buttons detected by LIRC but not reaching the app

**Check IR server console:** You should see:
```
IR Button: KEY_UP -> Action: UP
```

**Check browser console:** You should see:
```
🎮 IR Remote: UP
Remote action: UP
```

If missing from IR server console:
- Check `~/mirror-remote.lircd.conf` has correct button names
- Restart IR server after any config changes

---

## Button Mappings

Your current remote config has these buttons:

| Button | LIRC Code | Short Press | Long Press (2s) |
|--------|-----------|-------------|-----------------|
| ↑ | KEY_UP | Navigate up | Channel Up (widget switching) |
| ↓ | KEY_DOWN | Navigate down | Channel Down (widget switching) |
| ← | KEY_LEFT | Navigate left | **BACK** (exit menus) |
| → | KEY_RIGHT | Navigate right | - |
| ⏎ | KEY_ENTER | Select/OK | - |
| Power | KEY_POWER | Toggle display | - |
| 0 | KEY_0 | Brightness down | - |
| 1 | KEY_1 | Brightness up | - |

### Important Notes:

- **BACK function:** Hold LEFT for 2 seconds
- **Widget switching:** Hold UP/DOWN for 2 seconds in rearrange mode
- **Short press:** Normal navigation (quick press and release)

---

## Production Setup (Auto-start on boot)

Once everything works, you can make it auto-start:

### Create systemd service for IR server:

```bash
sudo nano /etc/systemd/system/luma-ir-server.service
```

Paste:
```ini
[Unit]
Description=Luma IR Remote Server
After=lircd.service

[Service]
Type=simple
User=idasu
WorkingDirectory=/home/idasu/Luma
ExecStart=/usr/bin/node /home/idasu/Luma/server/ir-remote-server.js
Restart=always

[Install]
WantedBy=multi-user.target
```

### Enable and start:

```bash
sudo systemctl enable luma-ir-server.service
sudo systemctl start luma-ir-server.service
```

### Check status:

```bash
sudo systemctl status luma-ir-server.service
```

---

## Quick Reference Commands

```bash
# Setup (run once)
./setup-ir-remote.sh

# Test diagnostics
./test-ir-remote.sh

# Test LIRC manually
irw                          # See button presses
mode2 -d /dev/lirc0          # See raw IR signals

# Start services
npm run ir-server            # Terminal 1
npm run dev                  # Terminal 2

# Or start both together
npm start                    # Starts both services

# Check what's running
lsof -i :8765                # IR server
lsof -i :5173                # Luma app

# Restart LIRC
sudo systemctl restart lircd
```

---

## Need Help?

1. Run diagnostic: `./test-ir-remote.sh`
2. Check IR server logs (Terminal 1)
3. Check browser console (F12)
4. Test LIRC: `irw` (press buttons)

If still stuck, share the output of:
```bash
./test-ir-remote.sh
sudo systemctl status lircd
npm run ir-server
```
