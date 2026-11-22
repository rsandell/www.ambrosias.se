import sys
from psd_tools import PSDImage
for f in sys.argv[1:]:
    p=PSDImage.open(f)
    print('==',f.split('/')[-1],p.size,p.color_mode,'layers(all):',sum(1 for _ in p.descendants()))
    def walk(l,d=0):
        if d>3: return
        extra=[]
        if l.has_vector_mask(): extra.append('vmask')
        if l.has_mask(): extra.append('rastermask')
        if l.has_origination(): extra.append('origination')
        print('  '*d+f"[{l.kind}] {l.name!r} vis={l.visible} {l.bbox} {' '.join(extra)}")
        if l.is_group():
            for c in l: walk(c,d+1)
    for l in p: walk(l)
