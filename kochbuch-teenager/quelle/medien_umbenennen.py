# Benennt die Rezeptbilder im DOCX in word/media/fotoNNN.jpg um (für den späteren Austausch per PowerShell)
import sys, zipfile, shutil, re
src = sys.argv[1]; tmp = src + '.tmp'
zi = zipfile.ZipFile(src)
doc = zi.read('word/document.xml').decode('utf8')
rels = zi.read('word/_rels/document.xml.rels').decode('utf8')
rids = re.findall(r'<a:blip r:embed="([^"]+)"', doc)
assert len(rids) == 100, len(rids)
ziel = {}
for i, rid in enumerate(rids, 1):
    m = re.search(r'Id="%s"[^>]*Target="([^"]+)"' % re.escape(rid), rels) or re.search(r'Target="([^"]+)"[^>]*Id="%s"' % re.escape(rid), rels)
    alt = m.group(1)
    neu = f'media/foto{i:03d}.jpg'
    ziel['word/' + alt] = 'word/' + neu
    rels = rels.replace(f'Target="{alt}"', f'Target="{neu}"')
with zipfile.ZipFile(tmp, 'w', zipfile.ZIP_DEFLATED) as zo:
    for it in zi.infolist():
        data = zi.read(it.filename)
        name = it.filename
        if name == 'word/_rels/document.xml.rels': data = rels.encode('utf8')
        name = ziel.get(name, name)
        zo.writestr(name, data)
zi.close(); shutil.move(tmp, src); print('umbenannt', len(ziel))
