#!/usr/bin/env python3
"""Generate the PWA icons (dark rounded square + a green dumbbell). Needs Pillow: pip install pillow
Run from the app folder:  python3 tools/make_icons.py"""
from PIL import Image, ImageDraw
import os

BG, FG = (11, 13, 16), (52, 211, 153)
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'icons')
os.makedirs(OUT, exist_ok=True)

def draw(size, rounded=True, scale=1.0):
    S = size * 4  # supersample for smooth edges
    img = Image.new('RGBA', (S, S), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    if rounded:
        d.rounded_rectangle([0, 0, S - 1, S - 1], radius=int(S * 0.22), fill=BG)
    else:
        d.rectangle([0, 0, S, S], fill=BG)   # full-bleed (iOS / maskable round the corners)
    u = S * scale / 100.0
    ox = S * (1 - scale) / 2
    def R(x0, y0, x1, y1, r=0):
        box = [ox + x0 * u, ox + y0 * u, ox + x1 * u, ox + y1 * u]
        d.rounded_rectangle(box, radius=r * u, fill=FG) if r else d.rectangle(box, fill=FG)
    R(30, 47, 70, 53)                  # bar
    R(20, 33, 30, 67, 3)               # inner plates
    R(70, 33, 80, 67, 3)
    R(11, 40, 20, 60, 3)               # outer plates
    R(80, 40, 89, 60, 3)
    return img.resize((size, size), Image.LANCZOS)

draw(192).save(os.path.join(OUT, 'icon-192.png'))
draw(512).save(os.path.join(OUT, 'icon-512.png'))
draw(512, rounded=False, scale=0.78).save(os.path.join(OUT, 'icon-maskable-512.png'))
draw(180, rounded=False).save(os.path.join(OUT, 'apple-touch-icon.png'))
print('icons written to', os.path.normpath(OUT))
