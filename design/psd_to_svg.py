# Bygger om logotypen som SVG ur design/vector_003_clean.psd (PSD:ns vektormasker, ingen tracing).
# Skriver static/img/logo.svg, static/favicon.svg, static/img/bg-shield.svg och PNG-ikonerna.
# Körs i en container, se design/build-logo.sh (PSD:n monteras skrivskyddat på /in, repot på /site).
import argparse, collections, io
from psd_tools import PSDImage
from psd_tools.constants import Tag

ap = argparse.ArgumentParser()
ap.add_argument('--psd', default='/in/vector_003_clean.psd')
ap.add_argument('--out', default='/site')
ap.add_argument('--prec', type=int, default=2, help='decimaler i banor')
a = ap.parse_args()

PAPER = '#f4efe2'   # --paper i assets/css/main.css, bakgrund för ikonerna som inte får vara genomskinliga
p = PSDImage.open(a.psd)
W, H = p.size


def num(v):
    s = f'{v:.{a.prec}f}'.rstrip('0').rstrip('.')
    return '0' if s in ('-0', '') else s


def area(pts):
    return 0.5 * sum(x0 * y1 - x1 * y0 for (x0, y0), (x1, y1) in zip(pts, pts[1:] + pts[:1]))


def pathd(vm):
    # Alla delbanor har operationen "combine" (union). Med samma lindningsriktning på alla ger
    # fill-rule nonzero exakt unionen, så de som går åt andra hållet vänds. (Utan det blev
    # det rutmönster i glaset där delbanor med motsatt riktning överlappar.)
    d = []
    pt = lambda pr: (pr[1] * W, pr[0] * H)
    q = lambda p_: (round(p_[0], a.prec), round(p_[1], a.prec))
    for sp in vm.paths:
        ks = [(pt(k.preceding), pt(k.anchor), pt(k.leaving)) for k in sp]
        if len(ks) < 3: continue
        if area([k[1] for k in ks]) < 0:
            ks = [(l, an, pr) for pr, an, l in reversed(ks)]
        # Koordinater avrundas först och skrivs sedan relativt föregående (avrundade) punkt, så
        # avrundningsfel inte ackumuleras. Raka segment blir "l", övriga "c".
        cx, cy = q(ks[0][1])
        d.append(f'M{num(cx)} {num(cy)}')
        for i in range(1, len(ks) + 1):
            k0, k1 = ks[i - 1], ks[i % len(ks)]
            c1, c2, e = q(k0[2]), q(k1[0]), q(k1[1])
            if c1 == q(k0[1]) and c2 == e:
                d.append(f'l{num(e[0] - cx)} {num(e[1] - cy)}')
            else:
                d.append(f'c{num(c1[0] - cx)} {num(c1[1] - cy)} {num(c2[0] - cx)} {num(c2[1] - cy)} {num(e[0] - cx)} {num(e[1] - cy)}')
            cx, cy = e
        d.append('Z')
    return ''.join(d)


def hexc(c):
    return '#%02x%02x%02x' % tuple(round(c[k]) for k in (b'Rd  ', b'Grn ', b'Bl  '))


def colour(l):
    if l.name.startswith('Shape'):
        return hexc(l.tagged_blocks.get_data(Tag.SOLID_COLOR_SHEET_SETTING)[b'Clr '])
    im = l.topil().convert('RGBA')
    c = collections.Counter(x[:3] for x in im.getdata() if x[3] > 200).most_common(1)[0][0]
    return '#%02x%02x%02x' % c


def outside_stroke(l):
    # Lagerstilen "Stroke, Outside" (svart 4 px) som ger konturen runt skölden och den vita innersköldens kant
    try:
        fx = l.tagged_blocks.get_data(Tag.OBJECT_BASED_EFFECTS_LAYER_INFO)[b'FrFX']
    except Exception:
        return None
    if not fx.get(b'enab'): return None
    return fx[b'Sz  '], hexc(fx[b'Clr '])


layers = []   # (namn, färg, bana, stroke, klippt)
shield_d = None
for l in p.descendants():
    if l.is_group() or not l.visible or not l.has_vector_mask(): continue
    d = pathd(l.vector_mask)
    if l.name == 'Shape 1': shield_d = d
    layers.append(dict(name=l.name, col=colour(l), d=d, stroke=outside_stroke(l), clip=bool(l.clipping_layer)))
PORTRAIT = {'Layer 10', 'Layer 11', 'Layer 12', 'Layer 13'}


def paint(layer, fill, stroke=None):
    out = []
    st = layer['stroke']
    if st:
        # "Outside" i Photoshop: linjen målas under fyllningen, så bara den yttre halvan syns
        out.append(f'<path fill="none" stroke="{stroke or st[1]}" stroke-width="{num(st[0] * 2)}" d="{layer["d"]}"/>')
    clip = ' clip-path="url(#s)"' if layer['clip'] else ''
    out.append(f'<path fill="{fill}"{clip} d="{layer["d"]}"/>')
    return ''.join(out)


def svg(body, view, extra_attrs='', title=True):
    t = '<title id="t">Ambrosiasorden</title>' if title else ''
    lab = ' role="img" aria-labelledby="t"' if title else ''
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{view}"{lab}{extra_attrs}>{t}'
            f'<defs><clipPath id="s"><path d="{shield_d}"/></clipPath></defs>{body}</svg>')


def write(path, text):
    with open(f'{a.out}/{path}', 'w') as f:
        f.write(text)
    print(f'{path}: {len(text)} byte')


# 1. Fullständig logotyp
full = svg(''.join(paint(L, L['col']) for L in layers), f'0 0 {W} {H}')
write('static/img/logo.svg', full)

# 2. Ikon: förenklad sköld utan porträttet, kvadratisk vy så att den blir lika tydlig i 16 px
icon_layers = [L for L in layers if L['name'] not in PORTRAIT]
pad = 40
side = H + 2 * pad
icon_view = f'{num((W - side) / 2)} {-pad} {side} {side}'
write('static/favicon.svg', svg(''.join(paint(L, L['col']) for L in icon_layers), icon_view, title=False))

# 3. Vattenmärke: en färg. Blått och svart blir "bläck", gult och vitt blir ingenting, via en mask.
INK = {'#003399', '#000000'}
mono = ''.join(paint(L, '#fff' if L['col'] in INK else '#000', stroke='#fff') for L in layers)
bb = 12
mono_svg = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{-bb} {-bb} {W + 2 * bb} {H + 2 * bb}" aria-hidden="true">'
            f'<defs><clipPath id="s"><path d="{shield_d}"/></clipPath>'
            f'<mask id="m" maskUnits="userSpaceOnUse" x="{-bb}" y="{-bb}" width="{W + 2 * bb}" height="{H + 2 * bb}">'
            f'<rect x="{-bb}" y="{-bb}" width="{W + 2 * bb}" height="{H + 2 * bb}" fill="#000"/>{mono}</mask></defs>'
            f'<rect x="{-bb}" y="{-bb}" width="{W + 2 * bb}" height="{H + 2 * bb}" fill="#000" mask="url(#m)"/></svg>')
write('static/img/bg-shield.svg', mono_svg)

# 4. PNG-ikoner för äldre webbläsare och iOS (apple-touch-icon får inte vara genomskinlig)
try:
    import cairosvg
    from PIL import Image
    def render(svg_text, size, bg=None):
        im = Image.open(io.BytesIO(cairosvg.svg2png(bytestring=svg_text.encode(), output_width=size, output_height=size))).convert('RGBA')
        if bg:
            base = Image.new('RGBA', im.size, bg)
            im = Image.alpha_composite(base, im)
        return im
    icon_svg = svg(''.join(paint(L, L['col']) for L in icon_layers), icon_view, title=False)
    render(icon_svg, 32).save(f'{a.out}/static/favicon-32.png', optimize=True)
    render(icon_svg, 180, PAPER).convert('RGB').save(f'{a.out}/static/apple-touch-icon.png', optimize=True)
    render(icon_svg, 512, PAPER).convert('RGB').save(f'{a.out}/static/icon-512.png', optimize=True)
    print('PNG: favicon-32.png, apple-touch-icon.png, icon-512.png')
except ImportError:
    print('cairosvg saknas, PNG-ikonerna hoppades över')
