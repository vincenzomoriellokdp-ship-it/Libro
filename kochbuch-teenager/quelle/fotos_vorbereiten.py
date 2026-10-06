# Schneidet die KI-Fotos (fotos/NNN.png) auf das Format des Fotorahmens zu und speichert sie druckfertig (300 dpi) als fotos_druck/NNN.jpg
import os, sys
from PIL import Image
D = os.path.dirname(os.path.abspath(__file__))
BREITE_IN, HOEHE_IN = 10260 / 1440, 3900 / 1440
os.makedirs(os.path.join(D, 'fotos_druck'), exist_ok=True)
for f in sorted(os.listdir(os.path.join(D, 'fotos'))):
    if not f[:3].isdigit(): continue
    im = Image.open(os.path.join(D, 'fotos', f)).convert('RGB')
    ziel = BREITE_IN / HOEHE_IN
    w, h = im.size
    if w / h > ziel:
        nw = int(h * ziel); im = im.crop(((w - nw) // 2, 0, (w - nw) // 2 + nw, h))
    else:
        nh = int(w / ziel); im = im.crop((0, (h - nh) // 2, w, (h - nh) // 2 + nh))
    px = int(BREITE_IN * 300)
    if im.width > px: im = im.resize((px, int(px / ziel)), Image.LANCZOS)
    im.save(os.path.join(D, 'fotos_druck', f[:3] + '.jpg'), quality=90, dpi=(300, 300))
    print(f, '->', im.size)
