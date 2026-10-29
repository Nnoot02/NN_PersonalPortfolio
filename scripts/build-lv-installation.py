#!/usr/bin/env python3
"""Generate the approved spatial installation cutaway (2026-10-22).

Source: components/LvCablingWriteUp.tsx for buried consumer mains, separate
phase conduits in trefoil and individually enclosed buried submains.
Room arrangement, equipment envelopes and access zone are illustrative.
Projection is isometric: three world axes have equal projected length.
Render order: slabs/walls, revealed buried services, equipment, labels.
Hidden services use dashed lines intentionally; no overhead routes exist.
Run: python scripts/build-lv-installation.py
"""
from pathlib import Path
from html import escape
import xml.etree.ElementTree as ET
# Resolve output from this tracked script, independently of the working directory.
root = Path(__file__).resolve().parents[1] / 'public' / 'images'
paper='#f3f0e9'; deep='#e8e3d9'; ink='#242321'; muted='#6d6962'; line='#d1cbc0'; accent='#9f3510'
s=[]
def add(x): s.append(x)
def p(x,y,z=0): return (230+19.0525588833*(x-y),135+11*(x+y)-22*z)
def poly(v,fill=paper,stroke=line,w=1.4):
 add('<polygon points="'+ ' '.join(f'{a:.1f},{b:.1f}' for a,b in [p(*q) for q in v])+f'" fill="{fill}" stroke="{stroke}" stroke-width="{w}" stroke-linejoin="round"/>')
# Route trace (2026-10-29): a path given a step joins mask instReveal{step}.
# The mask holds a solid copy of it with pathLength="1"; the case study's CSS
# draws the copy on, so the dashed original is revealed without losing its
# dashes. One mask per step: a shared mask would reveal a later route wherever
# it crosses an earlier one. Outside that CSS (the full-size <img>, the
# homepage thumbnail) the copy is solid and the route shows in full.
reveal={}
def path(v,color=ink,w=2,dash='',step=0):
 pts=' '.join(f'{a:.1f},{b:.1f}' for a,b in [p(*q) for q in v])
 mask=f' mask="url(#instReveal{step})"' if step else ''
 add(f'<polyline points="{pts}" fill="none" stroke="{color}" stroke-width="{w}" stroke-linejoin="round" stroke-dasharray="{dash}"{mask}/>')
 if step: reveal.setdefault(step,[]).append(f'<polyline class="lv-trace-reveal" style="--plot-i:{step}" pathLength="1" points="{pts}" fill="none" stroke="#fff" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>')
def text(x,y,t,size=16,color=ink,weight=400): add(f'<text x="{x}" y="{y}" font-family="Arial,sans-serif" font-size="{size}" fill="{color}" font-weight="{weight}">{escape(t)}</text>')
def box(x,y,z,w,d,h):
 poly([(x,y,z+h),(x+w,y,z+h),(x+w,y+d,z+h),(x,y+d,z+h)],paper,ink,1.7)
 poly([(x+w,y,z),(x+w,y+d,z),(x+w,y+d,z+h),(x+w,y,z+h)],deep,ink,1.7)
 poly([(x,y+d,z),(x+w,y+d,z),(x+w,y+d,z+h),(x,y+d,z+h)],paper,ink,1.7)
def leader(x,y,v):
 a,b=p(*v);add(f'<path d="M{x},{y} H{a:.1f} V{b:.1f}" fill="none" stroke="{muted}" stroke-width="1"/><circle cx="{a:.1f}" cy="{b:.1f}" r="3" fill="{accent}"/>')
add('<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800" role="img" aria-labelledby="instTitle instDesc"><title id="instTitle">Commercial LV cabling design: installation cutaway</title><desc id="instDesc">Indicative isometric arrangement, not an as-built survey. A padmount kiosk feeds a main switchboard through a fifteen metre buried conduit run. A cutaway slab reveals three separate buried submains and risers to boards in the supermarket, hairdresser and butcher tenancies. Communal circuits are beside the MSB. A shaded working area and a local main earth electrode show installation relationships. An enlarged trench section shows backfill, marker tape, sand surround, bedding and the conduit grouping; layer thicknesses are indicative. Electrical ratings are in the one-line view.</desc><rect width="1200" height="800" fill="'+paper+'"/>')
text(46,42,'INSTALLATION / CUTAWAY',14,accent,700)
text(46,78,'From site supply to each tenancy',30,ink,700)
text(46,107,'Site supply, buried routes and switchboard access',16,muted)
# Site and exposed building slab
# No enclosing site outline: the physical slabs carry the spatial reference.
poly([(18,0,0),(36,0,0),(36,7,0),(18,7,0)],deep,line)
# Thin slab above a separate soil cutaway. Thicknesses remain illustrative.
for face in ([(18,7,-.15),(36,7,-.15),(36,7,-1.5),(18,7,-1.5)],
             [(36,0,-.15),(36,7,-.15),(36,7,-1.5),(36,0,-1.5)]):
 poly(face,paper,line)
 poly(face,'url(#instSoil)',line)
poly([(18,7,0),(36,7,0),(36,7,-.15),(18,7,-.15)],deep,line)
poly([(36,0,0),(36,7,0),(36,7,-.15),(36,0,-.15)],deep,line)
# Rear wall and cut partitions; foreground removed
poly([(18,0,0),(36,0,0),(36,0,2.2),(18,0,2.2)],paper,line)
for x in (24,28,32):
 poly([(x,0,0),(x,6.5,0),(x,6.5,.65),(x,0,.65)],paper,line)
# Continuous exposed trench. All coordinates are world-space until projected.
add('<g data-stop="mains">')
poly([(3,3,0),(18.5,3,0),(18.5,4.5,0),(3,4.5,0)],deep,line)
poly([(3,4.5,0),(18.5,4.5,0),(18.5,4.5,-.8),(3,4.5,-.8)],'#ded7ca',line)
for y,z in ((3.2,-.65),(3.42,-.65),(3.31,-.46),(3.8,-.65),(4.18,-.65)):
 path([(3,y,z),(18.5,y,z)],accent if y<3.5 else muted,1.4,step=2)
add('</g>')
# Marker tape is shown in the indicative section A only.
# Kiosk kept closed so internals do not compete with the route.
add('<g data-stop="supply">')
poly([(.7,.7,0),(3.8,.7,0),(3.8,3.1,0),(.7,3.1,0)],deep,line)
box(1,1,0,2.5,1.8,1.8)
path([(2.25,2.81,.15),(2.25,2.81,1.65)],ink,1)
for x in (2.05,2.45): path([(x,2.82,.7),(x,2.82,1)],ink,1.4)
for z in (.35,.48,.61): path([(1.2,2.82,z),(1.8,2.82,z)],muted,.8)
# Five exposed conduit ends sweep into the kiosk base.
for i,(y,z) in enumerate(((3.2,-.65),(3.42,-.65),(3.31,-.46),(3.8,-.65),(4.18,-.65))):
 path([(2.65+i*.08,2.8,.15),(3,y,z)],accent if i<3 else muted,1.4,step=1)
add('</g>')
# switchboard access zone; board and service terminations
add('<g data-stop="msb">')
poly([(18.8,1.3,.02),(22.3,1.3,.02),(22.3,3,.02),(18.8,3,.02)],'#e5d5c7',accent,1)
box(19,.35,0,3,.8,2.2)
for x in (20,21): path([(x,1.16,.15),(x,1.16,2.05)],ink,1)
for x in (19.8,20.8,21.8): path([(x,1.17,.85),(x,1.17,1.1)],ink,1.5)
# Continue each conduit from its exposed trench end to an MSB bottom entry.
for i,(y,z) in enumerate(((3.2,-.65),(3.42,-.65),(3.31,-.46),(3.8,-.65),(4.18,-.65))):
 x=19.25+i*.12
 path([(18.5,y,z),(x,y,z),(x,.8,z),(x,.8,0)],accent if i<3 else muted,1.3,'6 5',step=3)
 path([(x,.8,0),(x,.8,.2)],accent if i<3 else muted,1.3,step=3)
add('</g>')
# buried submain bundles: explicit dashed hidden paths, no overhead ghost routes
tenancies = ((25.6,'SUP',24,28),(29.6,'HAI',28,32),(33.6,'BUT',32,36))
add('<g data-stop="submains">')
for i,(x,name,left,right) in enumerate(tenancies):
 assert left < x and x+.8 < right, 'Each DB must sit wholly inside its own tenancy'
 # MSB entry, buried route and tenancy entry form one continuous centreline.
 add(f'<g data-route="{name}">')
 source_x=20.7+i*.3
 path([(source_x,.8,.2),(source_x,.8,0)],accent,1.6,step=4)
 path([(source_x,.8,0),(source_x,.8,-1),(source_x,5.1+i*.3,-1),
       (x+.4,5.1+i*.3,-1),(x+.4,.45,-1),(x+.4,.45,0)],accent,1.6,'6 5',step=4)
 path([(x+.4,.45,0),(x+.4,.45,1.2)],accent,2,step=5)
 add('</g>')
 box(x,0,1.2,.8,.45,.85)
 a,b=p(x+.8,.45,2.05)
 add(f'<path d="M{a:.1f},{b:.1f} h12" stroke="{muted}" stroke-width="1"/>')
 text(round(a+16),round(b+4),name+'-DB',12,accent,700)
add('</g>')
box(22.5,0,1,.65,.45,1)
a,b=p(23.15,.45,2)
add(f'<path d="M{a:.1f},{b:.1f} h12" stroke="{muted}" stroke-width="1"/>')
text(round(a+16),round(b+4),'COM',12,accent,700)
# name rooms directly rather than electrical legend
for x,name in ((24.5,'SUPERMARKET'),(28.5,'HAIRDRESSER'),(32.5,'BUTCHER')):
 a,b=p(x,6,.02);text(round(a),round(b),name,12,muted,700)
text(986,580,'Floor slab',13,muted)
leader(976,588,(36,5,-.07))
text(986,624,'Soil',13,muted)
leader(976,632,(36,5,-1))
# Local electrode beside the room: below ground, not an upright schematic symbol.
poly([(17,.15,0),(17.6,.15,0),(17.6,.75,0),(17,.75,0)],deep,ink,1)
path([(17.3,.45,0),(17.3,.45,-1.4)],muted,1.8,'2 3')
path([(17.3,.45,-.3),(18.8,.45,-.3),(19,.45,.2)],muted,1.5,'2 4')
text(442,227,'Main earth electrode',14,muted)
leader(442,238,(17.3,.45,0))
# exterior labels in reserved space
text(312,164,'01  SITE SUPPLY',14,accent,700);leader(312,177,(3.5,1.9,1.4))
text(650,164,'02  SWITCHROOM / MSB',14,accent,700);leader(650,177,(20.5,1.2,2.2))
text(870,258,'03  TENANCY BOARDS',14,accent,700)
text(870,282,'One board inside each bay',14,muted)
leader(870,295,(34,.8,2.05))
text(46,373,'15 m buried consumer mains',18,ink,700)
text(46,398,'600 mm burial in the design calculations.',14,muted)
leader(280,410,(11,4,-.6))
text(46,482,'MSB working area',18,ink,700)
text(46,507,'Keep the space in front of the board clear.',14,muted)
leader(340,520,(20.5,2.4,.03))
# Enlarged trench build-up; thicknesses illustrative, not compliance dimensions.
# The 600 mm design burial basis remains in the main route caption.
add(f'<defs><pattern id="instSand" width="7" height="7" patternUnits="userSpaceOnUse"><path d="M0,7 L7,0" stroke="{line}" stroke-width="1"/></pattern><pattern id="instSoil" width="12" height="12" patternUnits="userSpaceOnUse"><circle cx="3" cy="4" r=".8" fill="{line}"/><circle cx="9" cy="10" r=".7" fill="{line}"/></pattern></defs>')
add('<g data-stop="trench">')
add(f'<rect x="46" y="548" width="452" height="210" fill="{paper}" stroke="{line}" stroke-width="1"/>')
text(60,573,'A / TRENCH SECTION',13,accent,700)
text(317,573,'Indicative build-up',12,muted)
# Ground, soil backfill, sand surround, bedding and conduit end faces.
add(f'<rect x="90" y="600" width="160" height="146" fill="{deep}"/>')
add('<rect x="90" y="600" width="160" height="78" fill="url(#instSoil)"/>')
add(f'<rect x="90" y="678" width="160" height="68" fill="{paper}"/>')
add('<rect x="90" y="678" width="160" height="68" fill="url(#instSand)"/>')
add(f'<path d="M60,600 H480 M90,600 V746 H250 V600" fill="none" stroke="{ink}" stroke-width="1.4"/>')
add(f'<path d="M94,638 H246" stroke="{accent}" stroke-width="2.2" stroke-dasharray="8 4"/>')
add(f'<path d="M90,736 H250" stroke="{line}" stroke-width="1"/>')
for cx,cy,label in ((124,724,'A'),(144,724,'B'),(134,706.68,'C'),(186,724,'N'),(222,724,'E')):
 add(f'<circle cx="{cx}" cy="{cy}" r="10" fill="{paper}" stroke="{ink}" stroke-width="1.3"/>')
 text(cx-3.7,cy+3.5,label,10,ink,700)
# Label leaders end in their actual material layer; no crossing annotation lines.
for yy,xx,label in ((620,236,'Backfill'),(642,239,'Marker tape'),(687,239,'Sand surround'),(747,239,'Bedding')):
 target_y = {'Backfill':618,'Marker tape':638,'Sand surround':684,'Bedding':741}[label]
 add(f'<path d="M{xx},{target_y} H262 V{yy-4} H274" fill="none" stroke="{muted}" stroke-width=".9"/>')
 text(282,yy,label,13,muted)
text(282,718,'ABC trefoil + N + E',13,muted)
add('</g>')
# Section reference on the physical trench, kept clear of the route label leader.
ax,ay=p(8.5,5.2,0)
path([(8.5,5.2,0),(8.5,4.5,-.3)],muted,1)
add(f'<circle cx="{ax:.1f}" cy="{ay:.1f}" r="9" fill="{paper}" stroke="{accent}" stroke-width="1.3"/>')
text(round(ax-4),round(ay+4),'A',11,accent,700)
add(f'<path d="M550,654 H1154" stroke="{line}"/>')
text(580,684,'BENEATH THE SLAB',13,accent,700)
text(580,712,'Three separate buried submains',14,muted)
text(580,736,'Each rises into its own tenancy board',14,muted)
text(934,684,'ROUTE KEY',13,accent,700)
for yy,dash,label in ((709,'','visible / cutaway'),(736,'6 5','buried / hidden')):
 add(f'<path d="M934,{yy-4} H969" stroke="{accent}" stroke-width="1.8" stroke-dasharray="{dash}"/>')
 text(982,yy,label,14,muted)
text(46,782,'Indicative arrangement, not to scale. Roof and front walls removed; partitions cut low.',14,muted)
add('<defs>'+''.join(f'<mask id="instReveal{k}" maskUnits="userSpaceOnUse" x="0" y="0" width="1200" height="800">'+''.join(v)+'</mask>' for k,v in sorted(reveal.items()))+'</defs>')
add('</svg>')
data='\n'.join(s)+'\n'
ET.fromstring(data)
assert '\u2014' not in data
(root/'lv-cabling-installation.svg').write_bytes(data.encode('utf-8'))
print(root/'lv-cabling-installation.svg')
