#!/usr/bin/env python3
"""Generate the canonical Najmi pixel-art sprite set.

The art is authored on a small grid and exported with nearest-neighbour scaling
so it stays crisp in the Three.js billboards. Every standing pose shares the same
canvas, which keeps the character's world height consistent across scenes.

Run from the repository root:
    python3 scripts/generate-sprites.py
"""

from __future__ import annotations

import os
from PIL import Image, ImageDraw, ImageFilter

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "public", "sprites")
os.makedirs(OUT, exist_ok=True)

# Palette -------------------------------------------------------------------
OUTLINE = (247, 241, 227)
WHITE = (255, 255, 255)
INK = (42, 37, 35)
HAIR = (42, 37, 35)
HAIR_HI = (80, 66, 56)
SKIN = (217, 160, 106)
SKIN_SH = (185, 124, 75)
SKIN_HI = (238, 189, 140)
HOODIE = (217, 164, 65)
HOODIE_SH = (168, 111, 40)
HOODIE_HI = (240, 197, 98)
POCKET = (180, 120, 45)
TEAL = (47, 79, 95)
TEAL_SH = (33, 57, 70)
SHOE = (242, 234, 216)
SHOE_SH = (196, 188, 170)
RED = (201, 84, 72)
CYAN = (127, 231, 255)
CYAN_DIM = (86, 178, 203)


def rect(d: ImageDraw.ImageDraw, x0: int, y0: int, x1: int, y1: int, c):
    d.rectangle([x0, y0, x1 - 1, y1 - 1], fill=c + (255,))


def ell(d: ImageDraw.ImageDraw, x0: int, y0: int, x1: int, y1: int, c):
    d.ellipse([x0, y0, x1 - 1, y1 - 1], fill=c + (255,))


def poly(d: ImageDraw.ImageDraw, points, c):
    d.polygon(points, fill=c + (255,))


def stroke(d: ImageDraw.ImageDraw, points, width: int, c):
    """Blocky pixel line, used for sleeves and legs."""
    for index in range(len(points) - 1):
        x0, y0 = points[index]
        x1, y1 = points[index + 1]
        steps = max(abs(x1 - x0), abs(y1 - y0), 1)
        for step in range(steps + 1):
            x = round(x0 + (x1 - x0) * step / steps)
            y = round(y0 + (y1 - y0) * step / steps)
            half = width // 2
            d.rectangle([x - half, y - half, x + half, y + half], fill=c + (255,))


def outline(image: Image.Image, margin: int = 2, color=OUTLINE) -> Image.Image:
    """Wrap the silhouette in a readable cream outline."""
    width, height = image.size
    mask = image.split()[3].filter(ImageFilter.MaxFilter(3))
    mask = mask.filter(ImageFilter.MaxFilter(3))
    result = Image.new("RGBA", (width + margin * 2, height + margin * 2), (0, 0, 0, 0))
    result.paste(Image.new("RGBA", (width, height), color + (255,)), (margin, margin), mask)
    result.alpha_composite(image, (margin, margin))
    return result


def draw_head(d: ImageDraw.ImageDraw, pose: str, back: bool = False, lying: bool = False):
    if lying:
        # Top-down head: hair ring, face, sleepy or phone-lit eyes.
        ell(d, 10, 2, 30, 20, HAIR)
        ell(d, 12, 5, 28, 18, SKIN)
        rect(d, 13, 5, 27, 8, HAIR)
        poly(d, [(12, 6), (16, 3), (18, 8), (21, 4), (24, 8), (27, 4), (29, 7), (29, 3), (12, 3)], HAIR)
        rect(d, 13, 10, 15, 12, INK)
        rect(d, 25, 10, 27, 12, INK)
        if pose == "phone":
            rect(d, 22, 10, 24, 12, WHITE)
            rect(d, 23, 11, 24, 12, INK)
            rect(d, 16, 15, 24, 16, SKIN_SH)
            rect(d, 19, 16, 21, 18, RED)
        else:
            rect(d, 14, 13, 16, 14, INK)
            rect(d, 24, 13, 26, 14, INK)
            rect(d, 18, 15, 22, 16, SKIN_SH)
        rect(d, 11, 9, 12, 12, SKIN_SH)
        rect(d, 28, 9, 29, 12, SKIN_SH)
        return

    if back:
        ell(d, 19, 5, 37, 23, HAIR)
        ell(d, 21, 8, 35, 21, HAIR_HI)
        rect(d, 23, 10, 33, 20, HAIR)
        rect(d, 25, 21, 31, 27, SKIN_SH)
        rect(d, 21, 23, 35, 28, HOODIE_SH)
        return

    # Hair silhouette and face.
    ell(d, 19, 5, 37, 23, HAIR)
    rect(d, 20, 8, 36, 23, HAIR)
    rect(d, 22, 10, 34, 23, SKIN)
    # Neck.
    rect(d, 25, 21, 31, 27, SKIN_SH)
    # Ears.
    rect(d, 20, 13, 22, 18, SKIN)
    rect(d, 34, 13, 36, 18, SKIN)
    rect(d, 20, 14, 21, 16, SKIN_SH)
    rect(d, 35, 14, 36, 16, SKIN_SH)

    # Fringe: solid cap plus chunky spikes.
    rect(d, 20, 6, 36, 11, HAIR)
    poly(d, [(20, 9), (23, 12), (23, 7), (20, 7)], HAIR)
    poly(d, [(24, 10), (26, 13), (27, 9), (24, 8)], HAIR)
    poly(d, [(29, 10), (31, 12), (32, 8), (29, 7)], HAIR)
    poly(d, [(33, 9), (35, 11), (36, 7), (33, 7)], HAIR)
    rect(d, 20, 6, 22, 15, HAIR)
    rect(d, 34, 7, 36, 15, HAIR)
    # Hair highlight.
    rect(d, 24, 6, 30, 7, HAIR_HI)
    rect(d, 32, 7, 33, 9, HAIR_HI)

    # Face.
    if pose == "surprised":
        rect(d, 23, 13, 27, 18, WHITE)
        rect(d, 31, 13, 35, 18, WHITE)
        rect(d, 24, 14, 26, 17, INK)
        rect(d, 32, 14, 34, 17, INK)
        rect(d, 26, 17, 33, 21, INK)
        rect(d, 27, 18, 32, 20, RED)
        rect(d, 26, 22, 33, 23, SKIN_SH)
        rect(d, 21, 19, 23, 20, RED)
        rect(d, 35, 19, 37, 20, RED)
        # Raised eyebrows.
        rect(d, 22, 10, 27, 12, INK)
        rect(d, 31, 10, 36, 12, INK)
    elif pose == "sad":
        rect(d, 23, 15, 26, 16, INK)
        rect(d, 31, 15, 34, 16, INK)
        rect(d, 22, 12, 26, 13, INK)
        rect(d, 31, 12, 35, 13, INK)
        rect(d, 26, 20, 31, 21, SKIN_SH)
        rect(d, 25, 21, 27, 22, SKIN_SH)
        rect(d, 30, 21, 32, 22, SKIN_SH)
        rect(d, 22, 18, 24, 19, RED)
        rect(d, 33, 18, 35, 19, RED)
    elif pose == "pinch":
        rect(d, 23, 14, 25, 16, INK)
        rect(d, 31, 14, 33, 16, INK)
        rect(d, 22, 12, 25, 13, INK)
        rect(d, 31, 12, 34, 13, INK)
        rect(d, 26, 19, 31, 21, RED)
        rect(d, 27, 20, 30, 21, WHITE)
        rect(d, 21, 18, 23, 19, RED)
        rect(d, 34, 18, 36, 19, RED)
    elif pose == "cheer":
        # Happy, closed eyes and a wide open smile.
        rect(d, 22, 12, 26, 13, INK)
        rect(d, 31, 12, 35, 13, INK)
        rect(d, 23, 14, 25, 15, INK)
        rect(d, 31, 14, 33, 15, INK)
        rect(d, 24, 13, 25, 14, HAIR_HI)
        rect(d, 32, 13, 33, 14, HAIR_HI)
        rect(d, 25, 18, 34, 22, SKIN_SH)
        rect(d, 26, 19, 33, 22, INK)
        rect(d, 27, 19, 32, 20, WHITE)
        rect(d, 27, 21, 32, 22, RED)
        rect(d, 21, 18, 23, 19, RED)
        rect(d, 34, 18, 36, 19, RED)
    elif pose == "point":
        # Determined expression used while questioning the System.
        rect(d, 22, 12, 26, 13, INK)
        rect(d, 31, 12, 35, 13, INK)
        rect(d, 23, 14, 25, 16, INK)
        rect(d, 31, 14, 33, 16, INK)
        rect(d, 27, 19, 31, 20, INK)
        rect(d, 26, 22, 32, 23, SKIN_SH)
        rect(d, 21, 18, 23, 19, RED)
        rect(d, 34, 18, 36, 19, RED)
    elif pose == "shout":
        # Angry brows and an open shout.
        rect(d, 22, 11, 27, 13, INK)
        rect(d, 31, 11, 36, 13, INK)
        rect(d, 23, 14, 27, 17, WHITE)
        rect(d, 31, 14, 35, 17, WHITE)
        rect(d, 24, 15, 26, 17, INK)
        rect(d, 32, 15, 34, 17, INK)
        rect(d, 25, 19, 34, 23, INK)
        rect(d, 26, 20, 33, 23, RED)
        rect(d, 27, 20, 32, 21, WHITE)
        rect(d, 21, 18, 23, 19, RED)
        rect(d, 34, 18, 36, 19, RED)
    else:
        rect(d, 23, 14, 25, 16, INK)
        rect(d, 31, 14, 33, 16, INK)
        rect(d, 23, 14, 24, 15, WHITE)
        rect(d, 31, 14, 32, 15, WHITE)
        rect(d, 27, 18, 29, 19, SKIN_SH)
        rect(d, 26, 20, 30, 21, INK)
        rect(d, 21, 18, 23, 19, RED)
        rect(d, 34, 18, 36, 19, RED)
    rect(d, 28, 16, 29, 18, SKIN_SH)


def draw_body(d: ImageDraw.ImageDraw, pose: str, back: bool = False, lying: bool = False):
    if lying:
        # Top-down body, head at the top of the canvas.
        # Arms out to the sides.
        stroke(d, [(14, 24), (7, 28), (5, 33)], 5, HOODIE)
        stroke(d, [(26, 24), (33, 28), (35, 33)], 5, HOODIE)
        ell(d, 3, 31, 9, 38, SKIN)
        ell(d, 31, 31, 37, 38, SKIN)
        # Torso.
        rect(d, 12, 18, 28, 46, HOODIE)
        rect(d, 12, 42, 28, 47, HOODIE_SH)
        rect(d, 16, 26, 24, 34, POCKET)
        rect(d, 17, 27, 23, 30, HOODIE_SH)
        # Shorts.
        rect(d, 12, 45, 28, 54, TEAL)
        rect(d, 13, 45, 27, 48, TEAL_SH)
        rect(d, 19, 48, 21, 54, TEAL_SH)
        # Legs.
        rect(d, 13, 53, 19, 66, SKIN)
        rect(d, 21, 53, 27, 66, SKIN)
        rect(d, 13, 60, 19, 63, SKIN_SH)
        rect(d, 21, 60, 27, 63, SKIN_SH)
        # Shoes.
        rect(d, 12, 64, 20, 70, SHOE)
        rect(d, 20, 64, 28, 70, SHOE)
        rect(d, 12, 68, 20, 70, SHOE_SH)
        rect(d, 20, 68, 28, 70, SHOE_SH)
        if pose == "phone":
            rect(d, 28, 24, 37, 38, INK)
            rect(d, 29, 25, 36, 35, CYAN_DIM)
            rect(d, 30, 26, 35, 32, CYAN)
            rect(d, 31, 27, 33, 29, WHITE)
            ell(d, 27, 30, 31, 35, SKIN)
        return

    # Shorts and legs first (behind torso).
    if pose == "walk1":
        poly(d, [(20, 45), (27, 45), (24, 54), (17, 54)], TEAL)
        poly(d, [(29, 45), (36, 45), (38, 54), (31, 54)], TEAL)
        poly(d, [(24, 53), (28, 53), (26, 64), (20, 64)], SKIN)
        poly(d, [(31, 53), (35, 53), (38, 63), (33, 63)], SKIN)
        rect(d, 17, 62, 27, 68, SHOE)
        rect(d, 33, 61, 40, 67, SHOE)
        rect(d, 17, 66, 27, 68, SHOE_SH)
        rect(d, 33, 65, 40, 67, SHOE_SH)
    elif pose == "walk2":
        poly(d, [(20, 45), (27, 45), (24, 53), (18, 53)], TEAL)
        poly(d, [(29, 45), (36, 45), (37, 53), (30, 53)], TEAL)
        poly(d, [(21, 52), (26, 52), (23, 63), (17, 63)], SKIN)
        poly(d, [(30, 52), (35, 52), (36, 64), (30, 64)], SKIN)
        rect(d, 15, 61, 24, 67, SHOE)
        rect(d, 30, 62, 38, 68, SHOE)
        rect(d, 15, 65, 24, 67, SHOE_SH)
        rect(d, 30, 66, 38, 68, SHOE_SH)
    elif pose == "walk3":
        poly(d, [(20, 45), (27, 45), (22, 54), (15, 54)], TEAL)
        poly(d, [(29, 45), (36, 45), (39, 54), (32, 54)], TEAL)
        poly(d, [(21, 53), (26, 53), (21, 63), (15, 63)], SKIN)
        poly(d, [(31, 53), (36, 53), (39, 62), (34, 62)], SKIN)
        rect(d, 14, 61, 23, 67, SHOE)
        rect(d, 34, 60, 42, 66, SHOE)
        rect(d, 14, 65, 23, 67, SHOE_SH)
        rect(d, 34, 64, 42, 66, SHOE_SH)
    elif pose == "walk4":
        poly(d, [(20, 45), (27, 45), (26, 54), (20, 54)], TEAL)
        poly(d, [(29, 45), (36, 45), (35, 54), (29, 54)], TEAL)
        poly(d, [(22, 53), (27, 53), (25, 64), (21, 64)], SKIN)
        poly(d, [(30, 53), (35, 53), (34, 64), (30, 64)], SKIN)
        rect(d, 20, 63, 28, 68, SHOE)
        rect(d, 29, 63, 37, 68, SHOE)
        rect(d, 20, 67, 28, 68, SHOE_SH)
        rect(d, 29, 67, 37, 68, SHOE_SH)
    else:
        rect(d, 19, 45, 37, 54, TEAL)
        rect(d, 19, 45, 37, 48, TEAL_SH)
        rect(d, 27, 48, 29, 54, TEAL_SH)
        rect(d, 20, 53, 26, 65, SKIN)
        rect(d, 30, 53, 36, 65, SKIN)
        rect(d, 20, 60, 26, 63, SKIN_SH)
        rect(d, 30, 60, 36, 63, SKIN_SH)
        rect(d, 18, 63, 27, 69, SHOE)
        rect(d, 29, 63, 38, 69, SHOE)
        rect(d, 18, 67, 27, 69, SHOE_SH)
        rect(d, 29, 67, 38, 69, SHOE_SH)

    # Torso / hoodie.
    d.rounded_rectangle([18, 25, 38, 47], radius=4, fill=HOODIE + (255,))
    rect(d, 18, 42, 38, 47, HOODIE_SH)
    rect(d, 20, 26, 36, 29, HOODIE_HI)
    rect(d, 23, 33, 33, 41, POCKET)
    rect(d, 24, 34, 32, 37, HOODIE_SH)
    rect(d, 25, 33, 26, 37, HOODIE)
    # Hood behind neck.
    ell(d, 21, 22, 35, 30, HOODIE_SH)
    rect(d, 24, 22, 32, 27, HOODIE_SH)
    # Drawstrings.
    rect(d, 23, 27, 24, 33, OUTLINE)
    rect(d, 32, 27, 33, 33, OUTLINE)
    rect(d, 23, 33, 24, 34, INK)
    rect(d, 32, 33, 33, 34, INK)

    # Arms.
    if back:
        stroke(d, [(17, 28), (14, 35), (14, 42)], 5, HOODIE)
        stroke(d, [(39, 28), (42, 35), (42, 42)], 5, HOODIE)
        ell(d, 12, 41, 17, 46, SKIN)
        ell(d, 39, 41, 44, 46, SKIN)
    elif pose == "surprised":
        stroke(d, [(17, 28), (11, 24), (8, 17)], 5, HOODIE)
        stroke(d, [(39, 28), (45, 24), (48, 17)], 5, HOODIE)
        ell(d, 5, 13, 11, 19, SKIN)
        ell(d, 45, 13, 51, 19, SKIN)
        rect(d, 5, 16, 11, 19, SKIN_SH)
        rect(d, 45, 16, 51, 19, SKIN_SH)
    elif pose == "pinch":
        stroke(d, [(17, 28), (13, 35), (13, 41)], 5, HOODIE)
        ell(d, 11, 40, 16, 45, SKIN)
        stroke(d, [(39, 28), (43, 33), (36, 37)], 5, HOODIE)
        ell(d, 32, 34, 38, 40, SKIN)
        rect(d, 33, 35, 36, 38, RED)
        rect(d, 32, 36, 37, 37, RED)
    elif pose == "sad":
        stroke(d, [(17, 28), (14, 35), (14, 42)], 5, HOODIE)
        stroke(d, [(39, 28), (42, 35), (42, 42)], 5, HOODIE)
        ell(d, 12, 41, 17, 46, SKIN)
        ell(d, 39, 41, 44, 46, SKIN)
    elif pose == "walk1":
        stroke(d, [(17, 28), (13, 34), (15, 40)], 5, HOODIE)
        stroke(d, [(39, 28), (43, 33), (41, 39)], 5, HOODIE)
        ell(d, 13, 39, 18, 44, SKIN)
        ell(d, 39, 38, 44, 43, SKIN)
    elif pose == "walk2":
        stroke(d, [(17, 28), (13, 33), (15, 39)], 5, HOODIE)
        stroke(d, [(39, 28), (43, 34), (41, 40)], 5, HOODIE)
        ell(d, 13, 38, 18, 43, SKIN)
        ell(d, 39, 39, 44, 44, SKIN)
    elif pose == "walk3":
        stroke(d, [(17, 28), (14, 34), (17, 39)], 5, HOODIE)
        stroke(d, [(39, 28), (44, 33), (43, 39)], 5, HOODIE)
        ell(d, 15, 38, 20, 43, SKIN)
        ell(d, 41, 38, 46, 43, SKIN)
    elif pose == "walk4":
        stroke(d, [(17, 28), (14, 34), (14, 40)], 5, HOODIE)
        stroke(d, [(39, 28), (43, 34), (42, 40)], 5, HOODIE)
        ell(d, 12, 39, 17, 44, SKIN)
        ell(d, 40, 39, 45, 44, SKIN)
    elif pose == "cheer":
        stroke(d, [(17, 28), (12, 21), (11, 14)], 5, HOODIE)
        stroke(d, [(39, 28), (44, 21), (45, 14)], 5, HOODIE)
        ell(d, 8, 10, 14, 16, SKIN)
        ell(d, 42, 10, 48, 16, SKIN)
        rect(d, 8, 13, 14, 16, SKIN_SH)
        rect(d, 42, 13, 48, 16, SKIN_SH)
    elif pose == "point":
        stroke(d, [(17, 28), (13, 35), (13, 42)], 5, HOODIE)
        stroke(d, [(39, 28), (45, 29), (49, 30)], 5, HOODIE)
        ell(d, 11, 41, 16, 46, SKIN)
        ell(d, 47, 27, 53, 33, SKIN)
        rect(d, 49, 30, 53, 32, SKIN_SH)
    elif pose == "shout":
        stroke(d, [(17, 28), (10, 32), (6, 39)], 5, HOODIE)
        stroke(d, [(39, 28), (46, 32), (50, 39)], 5, HOODIE)
        ell(d, 3, 37, 9, 43, SKIN)
        ell(d, 47, 37, 53, 43, SKIN)
        rect(d, 3, 40, 9, 43, SKIN_SH)
        rect(d, 47, 40, 53, 43, SKIN_SH)
    else:
        stroke(d, [(17, 28), (13, 34), (13, 42)], 5, HOODIE)
        stroke(d, [(39, 28), (43, 34), (43, 42)], 5, HOODIE)
        ell(d, 11, 41, 16, 46, SKIN)
        ell(d, 40, 41, 45, 46, SKIN)


def standing(pose: str, back: bool = False) -> Image.Image:
    image = Image.new("RGBA", (56, 72), (0, 0, 0, 0))
    draw = ImageDraw.Draw(image)
    draw_body(draw, pose, back=back)
    draw_head(draw, pose, back=back)
    # Small chest highlight and seam details.
    if not back:
        rect(draw, 27, 29, 29, 31, HOODIE_HI)
        rect(draw, 22, 47, 34, 48, TEAL_SH)
    else:
        rect(draw, 22, 30, 34, 32, HOODIE_SH)
        rect(draw, 24, 33, 32, 40, HOODIE_SH)
    return outline(image, margin=2)


def lying(pose: str) -> Image.Image:
    image = Image.new("RGBA", (40, 72), (0, 0, 0, 0))
    draw = ImageDraw.Draw(image)
    # Pillow cannot composite through ImageDraw; draw the glow first on the
    # canvas via a second layer.
    if pose == "phone":
        glow = Image.new("RGBA", image.size, (0, 0, 0, 0))
        gd = ImageDraw.Draw(glow)
        gd.ellipse([25, 21, 39, 41], fill=CYAN + (38,))
        gd.ellipse([27, 23, 37, 37], fill=CYAN + (54,))
        image.alpha_composite(glow)
        draw = ImageDraw.Draw(image)
    draw_body(draw, pose, lying=True)
    draw_head(draw, pose, lying=True)
    # A few seams.
    rect(draw, 19, 46, 21, 52, TEAL_SH)
    rect(draw, 14, 58, 18, 60, SKIN_SH)
    rect(draw, 22, 58, 26, 60, SKIN_SH)
    return outline(image, margin=2)


def bird() -> Image.Image:
    image = Image.new("RGBA", (18, 12), (0, 0, 0, 0))
    d = ImageDraw.Draw(image)
    # Body.
    ell(d, 6, 4, 12, 9, OUTLINE)
    # Wings, slightly raised.
    poly(d, [(6, 5), (1, 3), (3, 6), (1, 8), (6, 7)], (232, 226, 211))
    poly(d, [(12, 5), (17, 3), (15, 6), (17, 8), (12, 7)], (232, 226, 211))
    rect(d, 7, 4, 11, 5, WHITE)
    rect(d, 12, 5, 13, 6, (90, 86, 78))
    rect(d, 6, 8, 9, 9, (196, 188, 170))
    return outline(image, margin=1)


def save(image: Image.Image, name: str, scale: int = 4):
    scaled = image.resize((image.width * scale, image.height * scale), Image.NEAREST)
    path = os.path.join(OUT, name)
    scaled.save(path)
    print(f"wrote {path} {scaled.width}x{scaled.height}")


def contact_sheet(images):
    pad = 18
    cell = 220
    cols = 4
    rows = (len(images) + cols - 1) // cols
    sheet = Image.new("RGB", (cols * cell, rows * (cell + 28)), (17, 21, 28))
    d = ImageDraw.Draw(sheet)
    for index, (name, image) in enumerate(images):
        x = (index % cols) * cell
        y = (index // cols) * (cell + 28)
        thumb = image.copy()
        thumb.thumbnail((cell - pad * 2, cell - pad * 2), Image.NEAREST)
        sheet.paste(thumb, (x + (cell - thumb.width) // 2, y + pad), thumb)
        d.text((x + 14, y + cell + 4), name, fill=(246, 234, 211))
    path = os.path.join(OUT, "contact-sheet.png")
    sheet.save(path)
    print(f"wrote {path}")


def main():
    sprites = {}

    sprites["najmi-idle.png"] = standing("idle")
    sprites["najmi-walk-1.png"] = standing("walk1")
    sprites["najmi-walk-2.png"] = standing("walk2")
    sprites["najmi-walk-3.png"] = standing("walk3")
    sprites["najmi-walk-4.png"] = standing("walk4")
    sprites["najmi-surprised.png"] = standing("surprised")
    sprites["najmi-sad.png"] = standing("sad")
    sprites["najmi-pinch.png"] = standing("pinch")
    sprites["najmi-cheer.png"] = standing("cheer")
    sprites["najmi-point.png"] = standing("point")
    sprites["najmi-shout.png"] = standing("shout")
    sprites["najmi-back.png"] = standing("idle", back=True)
    sprites["najmi-back-walk-1.png"] = standing("walk1", back=True)
    sprites["najmi-back-walk-2.png"] = standing("walk2", back=True)
    sprites["najmi-back-walk-3.png"] = standing("walk3", back=True)
    sprites["najmi-back-walk-4.png"] = standing("walk4", back=True)
    sprites["najmi-phone.png"] = lying("phone")
    sprites["najmi-lying.png"] = lying("lying")

    for name, image in sprites.items():
        save(image, name, 4)

    save(bird(), "bird.png", 5)
    contact_sheet(list(sprites.items()) + [("bird.png", bird())])


if __name__ == "__main__":
    main()
