# Universe 2026 runtime API

This file describes the active 2026 runtime. The old `badgeware` drawing and
`io` input model belongs to the archived Universe 2025 source under `badge25/`.

## Runtime globals

Common globals are supplied by the firmware:

```python
badge, screen, image, font, color, shape, brush
vec2, rect, mat3, run
BUTTON_UP, BUTTON_DOWN, BUTTON_LEFT, BUTTON_RIGHT
BUTTON_SELECT, BUTTON_BACK, BUTTON_MENU, BUTTON_HOME
HIRES, VSYNC
```

## Input

```python
if badge.pressed(BUTTON_SELECT):
    select()

if badge.held(BUTTON_LEFT):
    move(-speed * badge.ticks_delta / 1000)

if badge.released(BUTTON_BACK):
    close()
```

Set-returning forms are useful for diagnostics:

```python
pressed = badge.pressed()
held = badge.held()
released = badge.released()
```

Additional 2026 inputs include `badge.touched(action)`, `badge.direction()`,
`badge.imu()`, and `badge.upside_down()`.

## Drawing

```python
screen.pen = color.rgb(20, 24, 28)
screen.rectangle(screen.clip)

screen.pen = color.rgb(255, 255, 255)
screen.shape(shape.rounded_rectangle(8, 8, 80, 24, 4))
screen.text("Hello", 12, 12)
```

Images and sprites:

```python
picture = image.load("assets/picture.png")
sheet = image.load("assets/characters.png").spritesheet(7, 2)
screen.blit(picture, vec2(10, 10))
screen.blit(sheet.sprite(0, 0), rect(40, 20, 32, 32))
```

Use `screen.width` and `screen.height`; do not hard-code 160x120 when the app
supports `HIRES | VSYNC`.

## State and filesystem

`State` remains imported from `badgeware` in the 2026 firmware:

```python
from badgeware import State
State.load("my_app", {"score": 0})
State.save("my_app", {"score": 10})
```

The `/system` tree is normally read-only through the serial REPL. Use
`mpremote mount badge` for transient tests or USB mass-storage mode for
persistent deployment. Keep real credentials only in the device's root
`secrets.py`.

## Porting table

| 2025 | 2026 |
|---|---|
| `io.BUTTON_A in io.pressed` | `badge.pressed(BUTTON_SELECT)` or another logical action |
| `io.ticks_delta` | `badge.ticks_delta` |
| `screen.brush = brushes.color(...)` | `screen.pen = color.rgb(...)` |
| `screen.draw(shapes.rectangle(...))` | `screen.shape(shape.rectangle(...))` |
| `Image.load(...)` | `image.load(...)` |
| `SpriteSheet(path, columns, rows)` | `image.load(path).spritesheet(columns, rows)` |
| `PixelFont.load(...)` | `font.<name>` |
| `screen.scale_blit(...)` | `screen.blit(sprite, rect(...))` |
