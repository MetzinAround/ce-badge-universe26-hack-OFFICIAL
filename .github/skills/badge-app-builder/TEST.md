# Badge App Builder behavioral tests

Run these prompts with the project skill available. Review generated files and
commands; do not require a physical badge for cases that explicitly stop at a
hardware checklist.

## New app from an idea

**Prompt**

> Build a badge app that shows a conference countdown. A/C changes the target
> day, B saves it, and the choice should persist. I am on Team 1; put it in
> Team1/countdown.

**Expected**

- Uses the skill.
- Inspects `hello`, `monapet`, and another relevant UI example.
- Creates a path-safe app with `__init__.py`, `icon.png`, and optional assets.
- Uses the 2026 `badge` API, logical controls, `State`, `run()`, and no desktop
  dependencies.
- Runs the validator and provides an emulator command.

## Existing game improvement

**Prompt**

> Add a pause screen and saved high score to badge/apps/snake, then test it in
> the emulator.

**Expected**

- Preserves the existing game loop and controls.
- Uses non-blocking state transitions and `State`.
- Runs focused validation and the simulator.
- Does not claim physical compatibility solely from the emulator.

## Hardware-only BLE app

**Prompt**

> Create a badge-to-badge voting app over Bluetooth.

**Expected**

- Uses Contacts and Pong as implementation references.
- Keeps IRQ work minimal and queues data for the main loop.
- Covers advertising, scanning, connect/disconnect, bounded packets, retry,
  cleanup, and `on_exit()`.
- Uses the emulator only for non-BLE UI paths.
- Produces a concrete two-badge hardware test checklist.

## Wi-Fi app without credentials

**Prompt**

> Build a badge app that displays a JSON status endpoint but still does
> something useful offline.

**Expected**

- Uses root `secrets.py` without embedding or copying credentials.
- Implements timeout, failure, cached/offline, and incremental fetch behavior.
- Avoids loading an unbounded response into SRAM.
- Tests first-run behavior with the simulator's clean-state option.

## Physical deployment

**Prompt**

> Put Team1/my-app on my connected badge.

**Expected**

- Confirms or detects USB Disk Mode through a `BADGER/system/apps` mount.
- Runs hardware-target validation.
- Runs deployment as a dry run first.
- Copies only `my-app`, never `secrets.py`.
- Requires explicit replacement and preserves a backup outside `system/apps`.
- Gives safe eject, RESET, HOME, persistence, and feature-specific test steps.

## Unsupported hardware assumption

**Prompt**

> The emulator loaded my GPIO sensor app, so mark it done.

**Expected**

- Rejects the premise that emulator loading proves GPIO behavior.
- Verifies the exact API against first-party sources.
- Identifies wiring, pin, voltage, driver, timing, and physical test needs.
