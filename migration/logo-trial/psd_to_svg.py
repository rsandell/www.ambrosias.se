# Trial: read the vector masks of design/vector_003_clean.psd and write an SVG. Run in a container with psd-tools, input mounted read-only at /in, output dir at /work:
#   docker run --rm -v "$PWD/design:/in:ro" -v "$PWD/migration/logo-trial:/work" python:3.12-slim sh -c "pip install -q psd-tools pillow numpy; python -W ignore -I /work/psd_to_svg.py"
import json, collections
from psd_tools import PSDImage
from psd_tools.constants import Tag
p=PSDImage.open('/in/vector_003_clean.psd'); W,H=p.size
def dom(l):
    im=l.composite()
    if im is None: return None
    im=im.convert('RGBA'); px=[x for x in im.getdata() if x[3]>200]
    if not px: return None
    c=collections.Counter(x[:3] for x in px).most_common(2)
    return c
def pathd(vm):
    d=''
    for sp in vm.paths:
        ks=list(sp)
        if not ks: continue
        pt=lambda pr:(pr[1]*W,pr[0]*H)
        a=pt(ks[0].anchor); d+=f'M{a[0]:.1f} {a[1]:.1f}'
        for i in range(1,len(ks)+1):
            k0=ks[i-1];k1=ks[i%len(ks)]
            c1=pt(k0.leaving);c2=pt(k1.preceding);e=pt(k1.anchor)
            d+=f'C{c1[0]:.1f} {c1[1]:.1f} {c2[0]:.1f} {c2[1]:.1f} {e[0]:.1f} {e[1]:.1f}'
        d+='Z'
    return d
body=[]
clip=None
for l in p.descendants():
    if l.is_group() or not l.visible or not l.has_vector_mask(): continue
    c=dom(l)
    col=('#003399' if l.name.startswith('Shape 2') else ('#fff200' if l.name=='Shape 1' else ('#%02x%02x%02x'%c[0][0] if c else None)))
    if not col: continue
    c=c or [((0,0,0),0)]
    ops=collections.Counter(str(getattr(sp,'operation',None)) for sp in l.vector_mask.paths)
    print(l.name, col, [('#%02x%02x%02x'%a,n) for a,n in c], dict(ops), 'opacity',l.opacity)
    dd=pathd(l.vector_mask)
    if l.name=='Shape 1':
        body.append(f'<defs><clipPath id="s"><path d="{dd}"/></clipPath></defs><path fill="{col}" d="{dd}"/><g clip-path="url(#s)">')
    else:
        body.append(f'<path fill="{col}" fill-rule="nonzero" d="{dd}"/>')
svg=f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}">'+''.join(body)+'</g></svg>'
open('/work/logo_test.svg','w').write(svg); print(len(svg),'bytes')
