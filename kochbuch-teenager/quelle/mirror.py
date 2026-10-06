import sys, zipfile, shutil
src = sys.argv[1]; tmp = src + '.tmp'
with zipfile.ZipFile(src) as zi, zipfile.ZipFile(tmp, 'w', zipfile.ZIP_DEFLATED) as zo:
    for it in zi.infolist():
        data = zi.read(it.filename)
        if it.filename == 'word/settings.xml' and b'mirrorMargins' not in data:
            anker = b'<w:displayBackgroundShape/>'
            if anker in data:
                i = data.index(anker) + len(anker)
            else:
                i = data.index(b'>', data.index(b'<w:settings')) + 1
            data = data[:i] + b'<w:mirrorMargins/>' + data[i:]
        zo.writestr(it, data)
shutil.move(tmp, src); print('mirror ok')
