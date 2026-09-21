# Choosing repository examples

Use the smallest relevant examples first, then combine patterns.

| Need | Best starting point | What it demonstrates |
|---|---|---|
| Minimal screen | `badge/apps/hello` | Basic font, clear, measure, centered text |
| Launcher integration | `badge/apps/menu` and `badge/main.py` | Discovery, icon fallback, pagination, app switching, HOME |
| Button-driven game | `badge/apps/snake` | Grid state, pressed controls, timed updates |
| Physics/collision game | `badge/apps/flappy` | State machine, sprites, delta time, collision, parallax |
| More complex game | `badge/apps/commits` | Intro/play/win/game-over, continuous controls, many objects |
| Offscreen drawing | `badge/apps/sketch` | Writable `Image`, clipping/window concepts, held controls |
| Images and browsing | `badge/apps/gallery` | Directory listing, thumbnails, smooth transitions |
| Persistent simulation | `badge/apps/monapet` | `State`, `init()`, `on_exit()`, `badge.ticks_delta` |
| Battery display | `badge/apps/vault`, `badge/apps/menu/ui.py` | Battery level and charging status |
| Wi-Fi/API basics | `badge/apps/badge` | Credentials, WLAN, streamed download, JSON, cached files |
| Robust network UI | `badge/apps/contributions` | Cached content, background refresh, multiple views |
| Long-running network display | `badge/apps/marquee` | Incremental backend, NTP/timezone, settings, LEDs, charging |
| IR receive | `badge/apps/quest` | NEC receiver, descriptor, persistent completion |
| Startup/frame animation | `badge/apps/startup` | `screen.load_into`, frame sequence, explicit display update |

## Pattern selection

- Start with `hello` for a static informational app.
- Start with `snake` or `flappy` for games; do not copy a large app when a small loop suffices.
- Start with `monapet` for saved preferences or progression.
- Start with `badge` for a single network request and `marquee` for resilient repeated background data.
- Start with `contacts` only for BLE peripheral/Web Bluetooth behavior.
- Start with `pong` for direct badge-to-badge BLE behavior.
- Start with `quest` for IR.

## Important differences

- BLE apps cannot be functionally tested in the current emulator.
- Marquee's LED writes are guarded because the simulator lacks `io.led`.
- Contacts contains an older unguarded `run(update)` pattern; new apps should use the guarded lifecycle template.
- The launcher permits a missing icon through a fallback, but new apps should always ship a 24x24 icon.
- Existing broad exception handling is not automatically a best practice. Catch expected failures narrowly and give the user a visible recovery path.
