# Copilot instructions for GitHub Universe badge development

This repository targets the **GitHub Universe 2026 badge** by default and also
hosts the Campus Experts hackathon workflow layered on top of it. Upstream
badge runtime, hardware, and legacy 2025 material live in `badge/`, `badge25/`,
`hardware/`, `eink/`, and `ir-beacon/`. Campus Experts workflow, tooling, and
team submissions live in `Team1/`-`Team4/`, `docs/`, `simulator/`,
`contacts-editor/`, and `.github/skills/badge-app-builder/`. See
[`docs/UPSTREAM-SYNC.md`](../docs/UPSTREAM-SYNC.md) for the full ownership
boundary and sync policy.

## Upstream badge development (`badge/`, `hardware/`, `badge25/`)

- Work in `badge/` for current firmware and applications.
- Read `badge/AGENTS.md` before changing a 2026 app.
- Read `hardware/README.md` before using raw GPIO, I2C, ADC, IR, power,
  wireless, display, touch, switch, or interrupt hardware.
- Read `hardware/USB_SERIAL.md` before communicating with a connected badge or
  modifying its filesystem.
- `badge25/` is the preserved Universe 2025 source tree. Read
  `badge25/AGENTS.md` only when intentionally maintaining that badge.
- `badge25/simulator/` and `badge25/badgerware/` document the legacy 2025
  runtime and must not be treated as authoritative for 2026 apps.

### Universe 2026 essentials

- The RP2350B firmware supplies `badge`, `screen`, `image`, `font`, `color`,
  `shape`, `brush`, `vec2`, `rect`, `mat3`, `run`, button constants, display
  mode constants, and filesystem helpers as globals.
- Prefer orientation-aware logical actions such as `BUTTON_SELECT`,
  `BUTTON_LEFT`, and `BUTTON_RIGHT`.
- Read input with `badge.pressed()`, `badge.held()`, `badge.released()`, and
  `badge.touched()`.
- Use `badge.ticks` and `badge.ticks_delta`; movement must be frame-rate
  independent.
- Draw with `screen.pen`, `color.rgb()`, `screen.shape()`, and
  `screen.blit()`.
- Load sprites with `image.load(path).spritesheet(columns, rows)`.
- Use `screen.width` and `screen.height`; HIRES mode is 320x240 and the common
  logical mode is 160x120.
- Keep `badge/secrets.py` empty in source control.
- New apps need `badge/apps/<name>/__init__.py` and a 24x24 `icon.png`.
- Use `mpremote devs` to discover a connected badge, then explicit
  `mpremote connect <port> ...` commands. Never run concurrent serial commands:
  only one process can own the USB serial port.
- Remote filesystem paths in `mpremote fs` commands begin with `:`. The normal
  REPL mounts `/system` read-only; use a host mount for transient tests or USB
  mass-storage mode to deploy under `/system/apps/`. Inspect state under
  `:/state/`, and reset after copying so the normal startup path is exercised.

When porting a 2025 app, preserve behavior and assets but explicitly translate
the graphics, input, timing, orientation, lifecycle, and state APIs. Use
`badge/apps/input_test/`, `badge/apps/demos/` and `badge/apps/plucky_cluck/` as
primary references.

## Campus Experts workflow (`TeamN/`, `docs/`, `simulator/`)

Use the physical badge as the compatibility target. The simulator is useful
for fast iteration, but it cannot prove BLE, GPIO, IR electrical behavior,
real timing, power use, or exact memory behavior.

1. Before creating an app, identify the user's assigned `TeamN` folder from
   their prompt or current app path. Do not place a CE submission in
   `badge/apps/`.
2. Use the `badge-app-builder` skill for app creation, debugging, validation,
   simulator work, and physical badge deployment.
3. Read the closest example in `badge/apps/` before creating an app.
4. Read the relevant reference in
   `.github/skills/badge-app-builder/references/`.
5. For a Campus Experts submission, create apps under the assigned
   `TeamN/<lowercase-app-name>/` folder. Treat `badge/apps/` as examples and
   shared badge code.
6. Include `__init__.py` and a 24x24 `icon.png`.
7. Use the 160x120 default logical layout, but use `screen.width` and
   `screen.height` so apps also work in `HIRES | VSYNC` mode.
8. Keep `update()` short and non-blocking.
9. Use the Universe 2026 `badge` API and logical actions such as
   `badge.pressed(BUTTON_SELECT)` and `badge.held(BUTTON_LEFT)`. Do not use
   the archived 2025 `io` API in new apps.
10. Use `State` or a uniquely named root file for saved data.
11. Never put credentials in an app. Device credentials belong in the root
    `badge/secrets.py`, which must not be committed or deployed.
12. Run the validator after each meaningful change. Before a pull request,
    run `validate_submissions.py TeamN`.
13. Call `run(update)` at module scope. Do not put it behind an
    `if __name__ == "__main__"` guard; the physical launcher imports apps.
14. Before declaring Campus Experts repository work complete, run the exact
    repository checks listed below. Do not rely only on a simulator launch or
    unresolved review thread status.

### Campus Experts commands

```bash
python3 .github/skills/badge-app-builder/scripts/scaffold_app.py my-app \
  --title "My App" --apps-dir Team1
python3 .github/skills/badge-app-builder/scripts/validate_app.py Team1/my-app
python3 simulator/badge_simulator.py Team1/my-app
```

Replace `Team1` with the team's assigned folder.

Use `--target hardware` when checking a hardware-only feature. Use
`--screenshots`, `--clean`, and `--perf` when those checks matter.

For changes to shared code, examples, validators, or workflows, run:

```bash
python3 -m unittest discover \
  -s .github/skills/badge-app-builder/tests -v
python3 -m compileall -q badge simulator .github/skills/badge-app-builder
python3 .github/skills/badge-app-builder/scripts/validate_submissions.py badge/apps
python3 .github/skills/badge-app-builder/scripts/validate_submissions.py
```

### Hardware and feature rules for Campus Experts apps

- HOME belongs to the launcher. Do not take it over in normal apps.
- Keep BLE interrupt handlers short. Queue data and process it in `update()`.
- Bound network responses, queues, histories, and cached data.
- Use an offline path for Wi-Fi apps where possible.
- Treat IR, LEDs, battery, GPIO, Qw/ST accessories, and charging as
  hardware-only behavior until tested on a real badge.
- Do not claim physical compatibility from an emulator launch alone.
- Use logical, orientation-aware controls. Do not map behavior to physical A,
  B, or C positions.
- Use `badge.ticks_delta` for frame-rate-independent movement and animation.
- Use `badge.imu()`, `badge.direction()`, `badge.touched()`, and
  `badge.upside_down()` only when the app needs those 2026 features.

## Repository hygiene

Do not commit `.venv/`, `__pycache__/`, `*.pyc`, `.badge_state/`,
`badge/secrets.py`, `.DS_Store`, screenshots, or personal credentials.

GitHub Actions must use read-only permissions, full commit SHAs for remote
actions, `persist-credentials: false` for checkout, and a job timeout. Do not
use `pull_request_target` or expose secrets to code from pull requests.

This repository is the maintained Campus Experts fork of `badger/home`. The
old Badgeware runtime is archived in `badge25/`; do not copy its API into new
apps. See [`docs/UPSTREAM-SYNC.md`](../docs/UPSTREAM-SYNC.md) before changing
any file that overlaps between the upstream runtime and the Campus layer.
