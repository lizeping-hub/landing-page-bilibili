"""Convert generated originals to sized web assets; preserve originals outside the repo."""
from pathlib import Path
from PIL import Image
import argparse

ROOT = Path(__file__).resolve().parents[1]
parser = argparse.ArgumentParser(description='Optimize the seven generated illustrations for the website.')
parser.add_argument('source', type=Path, help='Directory containing the generated originals listed in docs/素材来源.md')
SOURCE = parser.parse_args().source
FILES = {
    'hero': 'exec-6557b6c3-e31f-4cf6-9d82-427fbb34a048.png',
    'tech': 'exec-03fd525e-c5cf-4b54-98ba-0abed823a398.png',
    'knowledge': 'exec-8906c46d-b8b5-496a-9020-494460edfdd8.png',
    'animation': 'exec-49b791eb-76cb-41dd-88e6-34f2d0dc5c0e.png',
    'game': 'exec-a38efaa7-805b-48f1-a025-b5dc1ce07c38.png',
    'music': 'exec-2723a6ae-b20c-4b2b-98e3-4c98a37f7216.png',
    'life': 'exec-71017aba-6779-44b7-9949-55a7a5a452e5.png',
}
out = ROOT / 'src/assets'
out.mkdir(parents=True, exist_ok=True)
for name, filename in FILES.items():
    image = Image.open(SOURCE / filename)
    image.thumbnail((1000, 900) if name == 'hero' else (960, 540), Image.Resampling.LANCZOS)
    image.save(out / f'{name}.webp', 'WEBP', quality=82 if name == 'hero' else 78, method=6)
    print(name, image.size, (out / f'{name}.webp').stat().st_size)

Image.open(out / 'tech.webp').save(out / 'poster.webp', 'WEBP', quality=78, method=6)
