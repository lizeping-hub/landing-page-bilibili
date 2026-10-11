"""Offline 12-second layered illustration film. No runtime canvas/video encoding."""
from pathlib import Path
from PIL import Image, ImageDraw
import math
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'tmp/video-runtime'))
import imageio_ffmpeg

WIDTH, HEIGHT, FPS = 1280, 720, 24
assets = ROOT / 'src/assets'
scenes = [Image.open(assets / f'{name}.webp').convert('RGB') for name in ['tech', 'music', 'life']]
hero = Image.open(assets / 'hero.webp').convert('RGBA')
hero.thumbnail((158, 127), Image.Resampling.LANCZOS)

def background(index, time):
    # Separate slow camera layer; movement repeats smoothly in each scene.
    scale = 1.04 + 0.025 * math.sin(time / 4 * math.pi)
    sw, sh = round(WIDTH * scale), round(HEIGHT * scale)
    image = scenes[index].resize((sw, sh), Image.Resampling.BICUBIC)
    x = round((sw - WIDTH) * (0.5 + 0.25 * math.sin(time * math.pi / 4)))
    y = round((sh - HEIGHT) * 0.45)
    return image.crop((x, y, x + WIDTH, y + HEIGHT))

process = subprocess.Popen([imageio_ffmpeg.get_ffmpeg_exe(), '-y', '-f', 'rawvideo', '-vcodec', 'rawvideo', '-s', f'{WIDTH}x{HEIGHT}', '-pix_fmt', 'rgb24', '-r', str(FPS), '-i', '-', '-an', '-c:v', 'libx264', '-preset', 'slow', '-crf', '27', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', str(assets / 'universe.mp4')], stdin=subprocess.PIPE, stderr=subprocess.DEVNULL)
for frame in range(12 * FPS):
    t = frame / FPS
    index = int(t // 4)
    local = t % 4
    image = background(index, local)
    if local > 3.45:
        image = Image.blend(image, background((index + 1) % 3, 0), (local - 3.45) / 0.55)
    # Foreground layers: a small television passing through the three worlds,
    # plus deterministic pixel signals. They remain separate from the camera.
    overlay = Image.new('RGBA', (WIDTH, HEIGHT))
    draw = ImageDraw.Draw(overlay)
    for particle in range(14):
        x = (particle * 113 + t * (10 + particle % 3 * 7)) % WIDTH
        y = 80 + ((particle * 53) % 500) + math.sin(t * 1.1 + particle) * 12
        size = 2 + particle % 3
        color = (251, 114, 153, 120) if particle % 2 else (0, 174, 236, 110)
        draw.rectangle((x, y, x + size, y + size), fill=color)
    overlay.alpha_composite(hero, (1050, round(546 + math.sin(t * math.pi / 6) * 12)))
    image = Image.alpha_composite(image.convert('RGBA'), overlay).convert('RGB')
    process.stdin.write(image.tobytes())
process.stdin.close()
if process.wait() != 0: raise RuntimeError('Film encoding failed')
print('universe.mp4', (assets / 'universe.mp4').stat().st_size, 'bytes; 12s, 1280x720, 24fps, H.264, no audio')
