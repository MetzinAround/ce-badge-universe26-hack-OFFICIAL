# Campus Experts Badge Hack Universe 26

Build and test apps for the Universe 2026 Hackable Conference Badge.

This repository is the Campus Experts layer on top of
[`badger/home`](https://github.com/badger/home), the upstream Universe 2026
badge repository. It keeps the upstream badge runtime and hardware references
available while adding a simple team workflow for Campus Experts.

This repository includes:

- The `badge-app-builder` Copilot skill.
- The [Pimoroni Badgeware Web Simulator](https://pimoroni.github.io/badgeware-web-simulator/)
  as the preferred quick browser preview, plus a local Pygame simulator for
  repository-local, command-line testing.
- App validation and physical-badge deployment scripts.
- Working Universe 2026 examples for screens, games, saved state, images,
  Wi-Fi, IR, BLE,
  and launcher integration.
- Hardware, Badgeware API, emulator, and deployment references.

## Repository layout

| Path | Purpose |
| --- | --- |
| [`badge/`](./badge/) | Upstream Universe 2026 `/system` files and apps |
| [`badge25/`](./badge25/) | Archived Universe 2025 files, docs, simulator, and apps |
| [`hardware/`](./hardware/) | Universe 2026 schematic and hardware/GPIO reference |
| [`eink/`](./eink/) | Earlier e-ink badge resources |
| [`ir-beacon/`](./ir-beacon/) | IR beacon utilities and protocol experiments |
| `Team1/`-`Team4/` | Campus Experts team app submissions |
| [`docs/`](./docs/) | Campus Experts and fork/sync documentation |
| [`simulator/`](./simulator/) | Local Pygame simulator |
| [`.github/skills/badge-app-builder/`](./.github/skills/badge-app-builder/) | Copilot skill for building badge apps |

See the [Universe 2026 hardware reference](./hardware/README.md) for the
RP2350 GPIO map and onboard peripherals, and the
[USB serial and MicroPython REPL guide](./hardware/USB_SERIAL.md) to inspect
a connected badge and copy files or apps.

## Pimoroni and Badgeware resources

The Universe 2026 badge is a custom derivative of Pimoroni's
[Tufty 2350](https://shop.pimoroni.com/products/tufty-2350). These upstream
resources are useful references but do not model GitHub's custom
accelerometer, IR, capacitive-control, or firmware APIs exactly:

- [`pimoroni/tufty2350`](https://github.com/pimoroni/tufty2350) firmware,
  board definitions, modules, and examples
- [`pimoroni/badgeware-docs`](https://github.com/pimoroni/badgeware-docs)
  Badgeware documentation and examples
- [`pimoroni/badgeware-simulator`](https://github.com/pimoroni/badgeware-simulator)
  desktop Badgeware Simulator (an alternative to this repo's local simulator)
- [`pimoroni/badgeware-web-simulator`](https://github.com/pimoroni/badgeware-web-simulator)
  source for the browser-based simulator linked above

## Campus Experts team workflow

Campus Experts work in teams of four. Each team uses one shared fork, works
inside its assigned `Team1` through `Team4` folder, and sends one final pull
request back to this repository.

For the shortest path, follow
[Build a badge app with Copilot](docs/COPILOT-QUICKSTART.md). Read
[CONTRIBUTING.md](CONTRIBUTING.md) for the full team and pull request workflow.

## Start here

Install Python 3.10 or newer and create a virtual environment:

```bash
python3 -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements.txt
```

Tell Copilot your team folder, app path, idea, and controls:

```text
I am on Team 1. Build a badge app in Team1/countdown. It should show a
conference countdown. A/C changes the target day, B saves it, and the choice
must persist. Use the badge-app-builder skill, inspect the closest examples,
create an icon, validate the app, and list physical badge tests.
```

Or scaffold one directly:

```bash
python3 .github/skills/badge-app-builder/scripts/scaffold_app.py countdown \
  --title "Countdown" \
  --apps-dir Team1
```

The apps under `badge/apps/` are examples and shared badge code. For Campus Experts
submissions, create apps under `TeamN/<app-name>/` as explained in
[CONTRIBUTING.md](CONTRIBUTING.md). Start with the smallest useful example:

| Need | Example |
|---|---|
| Basic screen | `badge/apps/hello` |
| Button-driven game | `badge/apps/snake` |
| Physics and sprites | `badge/apps/flappy` |
| Saved state | `badge/apps/monapet` |
| Images | `badge/apps/gallery` |
| Wi-Fi and an API | `badge/apps/badge` |
| Robust network refresh | `badge/apps/contributions` |
| IR beacons | `badge/apps/quest` |
| BLE and Web Bluetooth | `badge/apps/contacts` |
| Badge-to-badge BLE | `badge/apps/pong` |
| Launcher behavior | `badge/apps/menu` |

## Validate and run

Validate the app:

```bash
python3 .github/skills/badge-app-builder/scripts/validate_app.py \
  Team1/countdown
```

Run it in the simulator:

```bash
python3 simulator/badge_simulator.py Team1/countdown
```

Check every app in one team folder:

```bash
python3 .github/skills/badge-app-builder/scripts/validate_submissions.py Team1
```

Useful simulator options:

- `--screenshots screenshots` and press F12 for a native 160x120 capture.
- `--clean` to clear saved simulator state and cached data.
- `--perf` to show frame time and estimated badge asset memory.
- `R` to hot-reload after editing.
- `H` or `Esc` to return to the launcher.
- `F` to show the device frame.
- `P` to toggle simulated charging.
- `1`-`9` to simulate IR beacon events.

The local simulator does not prove BLE, GPIO, real IR timing, LED behavior,
battery behavior, radio conditions, or exact RP2350 MicroPython performance.
For a browser-based simulator, see the
[Pimoroni Badgeware Web Simulator](https://pimoroni.github.io/badgeware-web-simulator/).
Use the local simulator when you need the Campus workflow, local files, or
repeatable command-line checks.

## Deploy to a physical badge

Put the badge into USB Disk Mode by double-pressing RESET. Preview a deployment:

```bash
python3 .github/skills/badge-app-builder/scripts/deploy_app.py \
  Team1/countdown
```

After reviewing the file list, write it:

```bash
python3 .github/skills/badge-app-builder/scripts/deploy_app.py \
  Team1/countdown --write
```

Use `--replace` only when replacing an existing app. The tool keeps a
timestamped backup and never copies `badge/secrets.py`.

After safe eject, press RESET, open the app, test its controls and failure
paths, press HOME, and reopen it to check saved state.

## Important references

- Skill instructions: `.github/skills/badge-app-builder/SKILL.md`
- App contract: `.github/skills/badge-app-builder/references/app-contract.md`
- Badgeware API: `.github/skills/badge-app-builder/references/badgeware-api.md`
- Hardware limits: `.github/skills/badge-app-builder/references/hardware.md`
- Simulator: `.github/skills/badge-app-builder/references/emulator.md`
- Physical badge: `.github/skills/badge-app-builder/references/physical-badge.md`
- Upstream fork and sync model: `docs/UPSTREAM-SYNC.md`
- Migration from the old snapshot: `docs/MIGRATION-FROM-STANDALONE.md`

The active runtime is the Universe 2026 `badge` API from `badger/home`. The
Universe 2025 Badgeware runtime is archived upstream under `badge25/` and is
not the target for new apps. The physical badge is the compatibility target;
emulator success is only one step in the test process.
