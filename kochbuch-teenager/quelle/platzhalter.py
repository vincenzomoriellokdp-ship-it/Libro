# Erzeugt pro Rezept ein Platzhalterbild (gleiches Format wie die späteren Fotos)
import json, os
from PIL import Image, ImageDraw, ImageFont
D = os.path.dirname(os.path.abspath(__file__))
os.makedirs(os.path.join(D, 'fotos_druck'), exist_ok=True)
W, H = 2137, 812
f1 = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 54)
for t in ['teil1.json', 'teil2.json', 'teil3.json', 'teil4.json']:
    for k in json.load(open(os.path.join(D, t)))['kapitel']:
        for r in k['rezepte']:
            im = Image.new('RGB', (W, H), (238, 236, 232))
            d = ImageDraw.Draw(im)
            d.rectangle([20, 20, W - 21, H - 21], outline=(200, 196, 190), width=6)
            txt = f"FOTO {r['nr']}: {r['titel']}"
            w = d.textlength(txt, font=f1)
            d.text(((W - w) / 2, H / 2 - 30), txt, fill=(150, 146, 140), font=f1)
            im.save(os.path.join(D, 'fotos_druck', f"{r['nr']:03d}.jpg"), quality=80, dpi=(300, 300))
print('ok')
