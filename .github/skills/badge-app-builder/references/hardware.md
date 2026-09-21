# Universe 2026 badge hardware

Source of truth: `badger/home/hardware/README.md` and the firmware-facing
`badger/home/badge/AGENTS.md`.

## Core hardware

- RP2350B MCU.
- 8 MB PSRAM and 16 MB QSPI flash.
- 320x240 LCD. Most apps use the 160x120 logical mode.
- 2.4 GHz wireless module.
- LSM6DS3TR-C IMU.
- CAP1208 capacitive touch controller.
- IR transmitter and receiver.
- Ambient-light sensor, battery sensing, four case LEDs, and Qw/ST I2C.

The 2026 board is not the 2025 Tufty runtime. Do not use the old 512 kB SRAM
limit, old Badgeware input model, or old pin assumptions as active guidance.

## Logical controls

Use firmware actions instead of physical switch names:

```text
BUTTON_UP, BUTTON_DOWN, BUTTON_LEFT, BUTTON_RIGHT,
BUTTON_SELECT, BUTTON_BACK, BUTTON_MENU, BUTTON_HOME
```

The firmware uses the IMU and touch controller to keep the display and controls
consistent when the badge is inverted. Do not map behavior to physical A, B, or
C positions.

## Display and timing

- The normal drawing surface is 160x120.
- `badge.mode(HIRES | VSYNC)` requests a 320x240 surface.
- Use `screen.width`, `screen.height`, and `screen.clip`.
- Use `badge.ticks_delta` for movement and animation.
- Keep `update()` short and avoid blocking work.

## Application-facing hardware APIs

Prefer:

```python
badge.touched(BUTTON_SELECT)
badge.direction()
badge.imu()
badge.upside_down()
```

Use the firmware API instead of directly accessing committed LCD, PSRAM,
wireless, internal-I2C, or power-control pins. The Qw/ST connector uses the
external I2C bus on GPIO4/5.

For low-level work, the current schematic documents IR transmit on GPIO16,
IR receive on GPIO17, the internal I2C bus on GPIO18/19, battery sense on
GPIO40, ambient light on GPIO43, and case LEDs on GPIO0..3. Verify board
definitions before using raw GPIO.

## Hardware-only checks

The simulator cannot prove touch electrical behavior, IMU timing, wireless
behavior, GPIO, IR range/timing, battery use, charging, power rails, or exact
MicroPython memory behavior. Test those features on a real badge.
