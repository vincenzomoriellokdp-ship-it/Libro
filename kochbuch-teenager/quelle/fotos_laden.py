# Lädt die 100 KI-Rezeptfotos (GPT Image 2.5 via Higgsfield) nach fotos/NNN.png
import json, os, urllib.request
D = os.path.dirname(os.path.abspath(__file__))
os.makedirs(os.path.join(D, 'fotos'), exist_ok=True)
for nr, url in json.load(open(os.path.join(D, 'urls.json'))).items():
    ziel = os.path.join(D, 'fotos', f'{int(nr):03d}.png')
    if not os.path.exists(ziel):
        urllib.request.urlretrieve(url, ziel)
        print('geladen', nr)
