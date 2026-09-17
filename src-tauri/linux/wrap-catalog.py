from pathlib import Path

mi = Path("src-tauri/io.github.compozitorium.studio.metainfo.xml").read_text()
if mi.startswith("<?xml"):
    mi = mi.split(">", 1)[1].lstrip()
stock = '<icon type="stock">io.github.compozitorium.studio</icon>'
mi = mi.replace(
    stock,
    stock
    + '\n  <icon type="cached" width="64" height="64">io.github.compozitorium.studio.png</icon>'
    + '\n  <icon type="cached" width="128" height="128">io.github.compozitorium.studio.png</icon>',
    1,
)
Path("src-tauri/linux/swcatalog.xml").write_text(
    '<?xml version="1.0" encoding="UTF-8"?>\n'
    '<components version="0.16" origin="compozitorium">\n'
    + mi
    + "</components>\n"
)
