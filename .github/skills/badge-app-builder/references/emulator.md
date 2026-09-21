# Universe 2026 emulator workflow

The local simulator models the 2026 runtime for fast UI and state iteration.
It does not prove physical touch, IMU, wireless, GPIO, IR, power, or exact
MicroPython memory behavior.

## Setup

```bash
python3 -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements.txt
python simulator/badge_simulator.py Team1/<app-name>
```

Useful options include `--scale`, `--screenshots`, `--clean`, `--perf`, and
`--dpi`. Screenshots use the active logical display size.

## Controls

Use the simulator's logical controls:

- Arrow keys: directional actions.
- Enter: SELECT.
- Backspace: BACK.
- Tab: MENU.
- H or Escape: HOME and return to the launcher.
- R: hot reload.
- F12: screenshot when screenshots are enabled.

The exact key map is printed by the simulator and may change as the 2026
input model gains touch and orientation support.

## What to test

Exercise every screen, logical control, launcher return path, first-run state
path, saved-state path, and error path. Use `--clean` for first-run behavior
and `--perf` for asset and frame-time risks.

Do not mark BLE, touch, IMU, GPIO, IR, battery, charging, wireless, or exact
memory behavior as complete from emulator success alone.
