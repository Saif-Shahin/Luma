# IR Remote Control Setup for Luma Mirror

This guide will help you set up a physical IR remote control to control your Luma smart mirror on a Raspberry Pi.

## Prerequisites

- Raspberry Pi (any model with IR receiver support)
- IR receiver module (e.g., TSOP4838, VS1838B)
- Physical IR remote control
- Luma mirror installed

## Hardware Setup

### 1. Connect IR Receiver to Raspberry Pi

Connect your IR receiver to the Raspberry Pi GPIO pins:

- **VCC** → Pin 1 (3.3V) or Pin 2 (5V)
- **GND** → Pin 6 (Ground)
- **OUT** → Pin 12 (GPIO 18)

```
IR Receiver Pinout (looking at the front):
 _____
| o o o |
|_______|
 | | |
 V G O
 C N U
 C D T
```

## Software Setup

### 1. Install LIRC (Linux Infrared Remote Control)

```bash
sudo apt-get update
sudo apt-get install lirc
```

### 2. Configure LIRC

Edit `/boot/config.txt`:

```bash
sudo nano /boot/config.txt
```

Add these lines at the end:

```
# Enable IR receiver on GPIO 18
dtoverlay=gpio-ir,gpio_pin=18
```

Edit `/etc/lirc/lirc_options.conf`:

```bash
sudo nano /etc/lirc/lirc_options.conf
```

Change:

```
driver = default
device = /dev/lirc0
```

### 3. Reboot Raspberry Pi

```bash
sudo reboot
```

### 4. Test IR Receiver

After reboot, test if the IR receiver is working:

```bash
mode2 -d /dev/lirc0
```

Press buttons on your remote. You should see pulse/space data being printed.

### 5. Record Your Remote Buttons

Stop the `lircd` service:

```bash
sudo systemctl stop lircd
```

Record your remote configuration:

```bash
irrecord -d /dev/lirc0 ~/luma-remote.conf
```

Follow the on-screen instructions:
1. Press each button multiple times when prompted
2. Name the buttons according to their function (KEY_POWER, KEY_UP, KEY_DOWN, etc.)

**Recommended button names** (matching Luma's mappings):
- `KEY_POWER` - Power button
- `KEY_UP` - Up arrow (hold for 2s = Channel Up)
- `KEY_DOWN` - Down arrow (hold for 2s = Channel Down)
- `KEY_LEFT` - Left arrow (hold for 2s = Back)
- `KEY_RIGHT` - Right arrow
- `KEY_ENTER` or `KEY_OK` - OK/Enter button
- `KEY_VOLUMEUP` or `KEY_1` - Volume up / Brightness up
- `KEY_VOLUMEDOWN` or `KEY_0` - Volume down / Brightness down

### 6. Install Remote Configuration

Copy the configuration file:

```bash
sudo cp ~/luma-remote.conf /etc/lirc/lircd.conf.d/luma-remote.conf
```

Start the `lircd` service:

```bash
sudo systemctl start lircd
sudo systemctl enable lircd
```

### 7. Test LIRC Configuration

Test if LIRC is receiving button presses:

```bash
irw
```

Press buttons on your remote. You should see output like:

```
0000000000000001 00 KEY_POWER luma-remote
0000000000000002 00 KEY_UP luma-remote
```

If you see this output, your IR remote is working correctly!

## Luma Application Setup

### 1. Install Dependencies

Navigate to your Luma directory and install the required WebSocket package:

```bash
cd /path/to/Luma
npm install
```

### 2. Start the IR Remote Server

The IR remote server listens for IR button presses and communicates with the Luma app via WebSocket.

**Option A: Start both services together**

```bash
npm start
```

This will start both the IR remote server and the Luma app.

**Option B: Start services separately**

```bash
# Terminal 1: Start IR remote server
npm run ir-server

# Terminal 2: Start Luma app
npm run dev
```

### 3. Verify Connection

When the app starts, you should see in the console:

```
✅ Connected to IR remote server
📡 IR Remote Server Ready
```

## Button Mappings

The IR remote controls the Luma mirror with the following button mappings:

### Short Press (Quick Press)
| IR Button | Luma Action | Function |
|-----------|-------------|----------|
| KEY_POWER | POWER | Toggle display on/off |
| KEY_UP | UP | Navigate up / Move widget up |
| KEY_DOWN | DOWN | Navigate down / Move widget down |
| KEY_LEFT | LEFT | Navigate left / Move widget left |
| KEY_RIGHT | RIGHT | Navigate right / Move widget right |
| KEY_ENTER / KEY_OK | OK | Confirm selection / Toggle item |
| KEY_VOLUMEUP / KEY_1 | BRIGHTNESS_UP | Increase brightness (+10%) |
| KEY_VOLUMEDOWN / KEY_0 | BRIGHTNESS_DOWN | Decrease brightness (-10%) |

### Long Press (Hold for 2 seconds)
| IR Button | Luma Action | Function |
|-----------|-------------|----------|
| KEY_LEFT (hold 2s) | BACK | Go back / Exit submenu |
| KEY_UP (hold 2s) | CHANNEL_UP | Next widget in rearrange mode |
| KEY_DOWN (hold 2s) | CHANNEL_DOWN | Previous widget in rearrange mode |

## Customizing Button Mappings

To customize button mappings for your specific remote, edit `server/ir-remote-server.js`:

### Adding Short Press Actions

Edit the `BUTTON_MAP` object:

```javascript
const BUTTON_MAP = {
  'KEY_POWER': 'POWER',
  'KEY_UP': 'UP',
  // Add your custom mappings here
};
```

### Adding Long Press Actions

Edit the `LONG_PRESS_MAP` object:

```javascript
const LONG_PRESS_MAP = {
  'KEY_LEFT': 'BACK',        // Hold LEFT for 2s → BACK
  'KEY_UP': 'CHANNEL_UP',    // Hold UP for 2s → CHANNEL_UP
  'KEY_DOWN': 'CHANNEL_DOWN', // Hold DOWN for 2s → CHANNEL_DOWN
  // Add your custom long-press mappings here
};
```

### Adjusting Long Press Duration

Edit the `LONG_PRESS_THRESHOLD` constant (default = 20, approximately 2 seconds):

```javascript
const LONG_PRESS_THRESHOLD = 20; // ~2 seconds (LIRC sends ~10 repeats/second)
```

After making changes, restart the IR remote server.

## Troubleshooting

### IR receiver not working

1. Check wiring connections
2. Verify GPIO pin in `/boot/config.txt`
3. Test with `mode2 -d /dev/lirc0`

### LIRC not detecting buttons

1. Check if `lircd` service is running: `sudo systemctl status lircd`
2. Test with `irw` command
3. Re-record remote configuration with `irrecord`

### WebSocket connection failed

1. Check if IR remote server is running
2. Verify port 8765 is not blocked by firewall
3. Check browser console for errors

### Buttons not responding in Luma app

1. Check browser console for button press logs
2. Verify button mappings in `server/ir-button-config.json`
3. Ensure IR button names match LIRC configuration

## Autostart on Boot

To automatically start the IR remote server and Luma app on boot:

### 1. Create systemd service for IR server

```bash
sudo nano /etc/systemd/system/luma-ir-server.service
```

Add:

```ini
[Unit]
Description=Luma IR Remote Server
After=lircd.service

[Service]
Type=simple
User=pi
WorkingDirectory=/home/pi/Luma
ExecStart=/usr/bin/node /home/pi/Luma/server/ir-remote-server.js
Restart=always

[Install]
WantedBy=multi-user.target
```

### 2. Create systemd service for Luma app

```bash
sudo nano /etc/systemd/system/luma-app.service
```

Add:

```ini
[Unit]
Description=Luma Smart Mirror Application
After=luma-ir-server.service

[Service]
Type=simple
User=pi
WorkingDirectory=/home/pi/Luma
ExecStart=/usr/bin/npm run dev
Restart=always

[Install]
WantedBy=multi-user.target
```

### 3. Enable and start services

```bash
sudo systemctl enable luma-ir-server.service
sudo systemctl enable luma-app.service
sudo systemctl start luma-ir-server.service
sudo systemctl start luma-app.service
```

### 4. Autostart Chromium in kiosk mode

Edit autostart:

```bash
sudo nano /etc/xdg/lxsession/LXDE-pi/autostart
```

Add:

```
@chromium-browser --kiosk --disable-restore-session-state http://localhost:5173
```

## Advanced Configuration

### Custom LIRC Socket Path

If your LIRC socket is in a different location, edit `server/ir-remote-server.js`:

```javascript
const LIRC_SOCKET = '/path/to/your/lirc/socket';
```

### Custom WebSocket Port

To use a different WebSocket port, edit `server/ir-remote-server.js` and `src/hooks/useIRRemote.js`:

```javascript
// server/ir-remote-server.js
const WS_PORT = 8765;

// src/hooks/useIRRemote.js
const WS_URL = 'ws://localhost:8765';
```

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review console logs for errors
3. Verify LIRC is working with `irw` command
4. Check WebSocket connection in browser console

## License

MIT License - See LICENSE file for details
