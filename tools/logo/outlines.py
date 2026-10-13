from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
import os
# Usage: python3 tools/logo/outlines.py /path/to/urbanist-latin-%s-normal.woff2   (pip install fonttools brotli)
# The pattern needs %s for the weight; @fontsource/urbanist ships these files.
import sys
F = sys.argv[1]
def glyphs(text, weight, x0, base, size):
    f=TTFont(F%weight); gs=f.getGlyphSet(); cmap=f.getBestCmap(); upm=f['head'].unitsPerEm
    sc=size/upm; x=x0; d=''
    for ch in text:
        g=cmap[ord(ch)]; pen=SVGPathPen(gs)
        tp=TransformPen(pen,(sc,0,0,-sc,x,base)); gs[g].draw(tp)
        d+=pen.getCommands(); x+=gs[g].width*sc
    return d, x, f
size=140; base=120
# "j" then mark (o) then "ule" then "Wise"
dj,x,f=glyphs('j','600',0,base,size)
upm=f['head'].unitsPerEm
# o metrics: width of 'o' glyph
gs=f.getGlyphSet(); cmap=f.getBestCmap()
ow=gs[cmap[ord('o')]].width*size/upm
# x-height
xh=f['OS/2'].sxHeight*size/upm
mark_r=xh/2*1.04; cx=x+ow/2; cy=base-xh/2
x2=x+ow
dule,x3,_=glyphs('ule','600',x2,base,size)
dwise,x4,_=glyphs('Wise','500',x3+6,base,size)
cap=f['OS/2'].sCapHeight*size/upm
print('width',x4,'xh',xh,'cap',cap,'mark',cx,cy,mark_r)
import json
json.dump({'j':dj,'ule':dule,'wise':dwise,'cx':cx,'cy':cy,'r':mark_r,'w':x4,'base':base,'xh':xh,'cap':cap},open(os.path.join(os.path.dirname(os.path.abspath(__file__)),'wordmark-outlines.json'),'w'))
