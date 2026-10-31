"""Apply the Keystead imagery grid: white 1px lines in 28px cells on a 2576px-wide image.

Usage: python3 add_grid.py <base image> <output jpg> [line opacity 0-1]
"""
import sys
from PIL import Image, ImageDraw

WIDTH = 2576   # design-system reference width
CELL = 28      # grid cell size at that width
LINE = 1       # line thickness

src, out = sys.argv[1], sys.argv[2]
opacity = float(sys.argv[3]) if len(sys.argv) > 3 else 0.35

base = Image.open(src).convert("RGB")
height = round(base.height * WIDTH / base.width)
base = base.resize((WIDTH, height), Image.LANCZOS)

grid = Image.new("RGBA", base.size, (0, 0, 0, 0))
draw = ImageDraw.Draw(grid)
alpha = round(255 * opacity)
for x in range(0, WIDTH, CELL):
    draw.rectangle([x, 0, x + LINE - 1, height - 1], fill=(255, 255, 255, alpha))
for y in range(0, height, CELL):
    draw.rectangle([0, y, WIDTH - 1, y + LINE - 1], fill=(255, 255, 255, alpha))

result = Image.alpha_composite(base.convert("RGBA"), grid).convert("RGB")
result.save(out, "JPEG", quality=84, optimize=True, progressive=True)
print(f"{out}: {WIDTH}x{height}, {CELL}px cells, opacity {opacity}")
