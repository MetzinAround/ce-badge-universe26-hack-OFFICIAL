# Universe 2026 app contract

## Directory

Campus Experts build in their assigned team folder:

```text
TeamN/<app-name>/
├── __init__.py
├── icon.png
└── assets/
```

An app is discovered when it contains `__init__.py` or `__init__.mpy`.
Provide a 24x24 `icon.png`. The `assets/` directory is optional.

## Runtime

The launcher supplies common globals such as `badge`, `screen`, `image`,
`font`, `color`, `shape`, `brush`, `vec2`, `rect`, `mat3`, `run`, button
constants, display-mode constants, and filesystem helpers.

Use an explicit app directory when an app has local modules or relative assets:

```python
import os
import sys

APP_DIR = "/system/apps/my_app"
os.chdir(APP_DIR)
sys.path.insert(0, APP_DIR)
```

The minimal lifecycle is:

```python
def update():
    pass


run(update)
```

An app may return a `/system/apps/<name>` path from `update()` when it acts as a
launcher. Ordinary apps return `None`.

## Input and timing

```python
if badge.pressed(BUTTON_SELECT):
    confirm()

if badge.held(BUTTON_LEFT):
    x -= speed * (badge.ticks_delta / 1000)

if badge.released(BUTTON_BACK):
    cancel()
```

Use logical actions. HOME is reserved for returning to the launcher.

## Drawing and assets

Set `screen.pen` before drawing and use `screen.shape(...)`, `screen.blit(...)`,
and `screen.text(...)`. Use `image.load(...)` for images and
`image.load(...).spritesheet(columns, rows)` for sprite sheets. Prefer
paletted/optimized PNGs and load large assets on demand.

## State

```python
from badgeware import State

state = {"score": 0}
State.load("my_app", state)
State.save("my_app", state)
```

Save after meaningful changes, not on every frame. Never store credentials in
app state.
