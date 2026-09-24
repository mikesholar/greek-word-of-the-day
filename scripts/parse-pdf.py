import re, json
from xml.etree import ElementTree as ET
src = open('all.html', encoding='utf-8').read()
src = re.sub(r'<!DOCTYPE[^>]*>', '', src).replace(' xmlns="http://www.w3.org/1999/xhtml"', '')
root = ET.fromstring(src)
GREEK = re.compile(r'[Ͱ-Ͽἀ-῿]')
ROW_BOUNDS = [220, 395, 565, 760]
EN_LIMIT = [120, 290, 460, 630]
def to_lines(ws):
    lines = []
    for y, x, h, t in sorted(ws):
        if lines and y - lines[-1]['y'] < 5:
            lines[-1]['w'].append((x, t, h))
        else:
            lines.append(dict(y=y, w=[(x, t, h)]))
    return [dict(t=' '.join(t for _, t, _ in sorted(l['w'])), big=max(h for *_, h in l['w']) > 11) for l in lines]
cards = []
for page in root.iter('page'):
    cells = {}
    for w in page.iter('word'):
        x0, y0, x1, y1 = (float(w.get(k)) for k in ('xMin','yMin','xMax','yMax'))
        if y1 - y0 < 9 or y0 > 760: continue
        col = min(range(3), key=lambda i: abs((x0+x1)/2 - [124, 297, 470][i]))
        row = next(i for i, b in enumerate(ROW_BOUNDS) if y0 < b)
        zone = 'en' if y0 < EN_LIMIT[row] else 'el'
        cells.setdefault((row, col), {}).setdefault(zone, []).append((y0, x0, y1 - y0, w.text))
    for key in sorted(cells):
        en = to_lines(cells[key].get('en', []))
        el = to_lines(cells[key].get('el', []))
        n = next((i for i, l in enumerate(el) if not GREEK.search(l['t'].split(' / ')[0])), len(el))
        tr, _, forms = ' '.join(l['t'] for l in el[n:]).partition(' / ')
        cards.append(dict(
            en=' '.join(l['t'] for l in en if l['big']),
            note=' '.join(l['t'] for l in en if not l['big']),
            el=' '.join(l['t'] for l in el[:n]), tr=tr, forms=forms))
print(len(cards))
print('incomplete', [c for c in cards if not (c['en'] and c['el'] and c['tr'])])
for c in cards:
    if c['en'] in ('bedroom','x < y','life','busy','window','boiled','How much is this?'): print(c)
json.dump(cards, open('words.json','w'), ensure_ascii=False, separators=(',',':'))
