#!/usr/bin/env python3
"""Generate the Last-Metre Eyes relay diagram (2026-10-29).

Two variants of one drawing: relay-h.svg (desktop, chain left to right) and
relay-v.svg (phones, chain top to bottom). The case study inlines both and
CSS shows one. Spec: docs/lme-relay-animation.md.

Each SVG carries its own <style>: keyframes for the drone, the 42 kB packet
and the map cells, keyed on DrawingTrace's data-trace states (armed, play).
Outside that component (the full-size <img>) nothing matches, so the file
shows the finished state: map filled, packet delivered, decision shown.

Evidence styling (Nathan, 2026-10-29): solid where the work is real (the
drone), dashed where it is modelled (HaLow), dotted where it was a mock in
the demo (L-band). Every label is a claim the write-up already makes.
Run: python scripts/build-lme-relay.py
"""
from math import hypot
from pathlib import Path
from html import escape
import xml.etree.ElementTree as ET

out_dir = Path(__file__).resolve().parents[1] / 'public' / 'images' / 'viasat-entry'
paper = '#f3f0e9'; ink = '#242321'; muted = '#6d6962'; accent = '#c84b1a'; accent_dark = '#9f3510'
FONT = 'Inter,Arial,sans-serif'
# Timeline in seconds (one clock for both variants).
SURVEY = (0.0, 1.4); TO_RELAY = (1.5, 2.0); TO_SAT = (2.0, 2.6); TO_IC = (2.6, 3.2); MAP_IN = 3.25; DECISION = 3.6
DASH = {'real': '', 'modelled': '7 6', 'mock': '2 5'}

LAYOUT = {
    'h': dict(vb=(1000, 450), bld=(30, 70, 300, 290), relay=(455, 300), sat=(655, 92), ic=(875, 300)),
    'v': dict(vb=(360, 860), bld=(20, 20, 270, 230), relay=(325, 380), sat=(110, 540), ic=(200, 720)),
}
ROOF = [(0, .14), (.18, .1), (.32, .2), (.5, .06), (.66, .16), (.82, .08), (1, .18), (1, 1), (0, 1)]
WALLS = [(.36, .32, .36, .66), (.36, .8, .36, 1), (.66, .2, .66, .55), (.66, .7, .66, 1), (.36, .56, .55, .56)]
SURVEY_UV = [(.08, .86), (.22, .86), (.24, .62), (.28, .42), (.48, .4), (.52, .7), (.6, .84), (.8, .86), (.86, .6), (.8, .36), (.92, .3)]
COLS, ROWS = 12, 7


def f(n):
    return f'{n:.1f}'.rstrip('0').rstrip('.')


def pts(seq):
    return ' '.join(f'{f(x)},{f(y)}' for x, y in seq)


def lengths(poly):
    acc = [0.0]
    for (x1, y1), (x2, y2) in zip(poly, poly[1:]):
        acc.append(acc[-1] + hypot(x2 - x1, y2 - y1))
    return acc


def point_at(poly, d):
    acc = lengths(poly)
    for i in range(len(poly) - 1):
        if d <= acc[i + 1] or i == len(poly) - 2:
            seg = acc[i + 1] - acc[i] or 1
            t = min(1, max(0, (d - acc[i]) / seg))
            (x1, y1), (x2, y2) = poly[i], poly[i + 1]
            return x1 + (x2 - x1) * t, y1 + (y2 - y1) * t


def keyframes(name, legs, total, extra='', vanish=False):
    """legs: list of (polyline, t0, t1) in seconds; frames are % of total.
    vanish: compress the path into 0-98 % and fade out at the last point."""
    frames = []
    for poly, t0, t1 in legs:
        acc = lengths(poly)
        for i, (x, y) in enumerate(poly):
            t = t0 + (t1 - t0) * (acc[i] / acc[-1] if acc[-1] else 0)
            frames.append((t, x, y))
    out = []
    start = legs[0][1]
    span = 98 if vanish else 100
    for t, x, y in frames:
        pct = span * (t - start) / total
        out.append(f'{pct:.2f}% {{ transform: translate({f(x)}px, {f(y)}px);{extra} }}')
    if vanish:
        x, y = frames[-1][1:]
        out.append(f'100% {{ transform: translate({f(x)}px, {f(y)}px); opacity: 0; }}')
    return f'@keyframes {name} {{ ' + ' '.join(out) + ' }'


def build(kind):
    L = LAYOUT[kind]; W, H = L['vb']; bx, by, bw, bh = L['bld']
    P = lambda u, v: (bx + u * bw, by + v * bh)
    rx, ry = L['relay']; sx, sy = L['sat']; ix, iy = L['ic']
    k = f'lme{kind}'
    s = []
    add = s.append

    def text(x, y, t, size=15, weight=400, color=ink, anchor='middle', cls='', style=''):
        c = (f' class="{cls}"' if cls else '') + (f' style="{style}"' if style else '')
        add(f'<text{c} x="{f(x)}" y="{f(y)}" text-anchor="{anchor}" font-family="{FONT}" font-size="{size}" font-weight="{weight}" fill="{color}">{escape(t)}</text>')

    def label(x, y, a, b, anchor='middle'):
        text(x, y, a, 15, 600, ink, anchor)
        text(x, y + 18, b, 13, 400, accent_dark, anchor)

    def link(poly, ev, w=2):
        add(f'<polyline points="{pts(poly)}" fill="none" stroke="{ink}" stroke-width="{w}" stroke-linejoin="round" stroke-dasharray="{DASH[ev]}"/>')

    survey = [P(u, v) for u, v in SURVEY_UV]
    survey_len = lengths(survey)[-1]
    # Occupancy cells, each revealed when the drone first passes within ~1.6 cells.
    cw, ch = bw * .86 / COLS, bh * .62 / ROWS
    gx, gy = bx + bw * .07, by + bh * .3
    seen = {}
    for i in range(141):
        x, y = point_at(survey, survey_len * i / 140)
        t = SURVEY[0] + (SURVEY[1] - SURVEY[0]) * i / 140
        for c in range(COLS):
            for r in range(ROWS):
                if (c, r) not in seen and hypot(gx + (c + .5) * cw - x, gy + (r + .5) * ch - y) < cw * 1.6:
                    seen[(c, r)] = t
    exit_pt = survey[-1]
    if kind == 'h':
        halow = [exit_pt, (bx + bw + 30, exit_pt[1]), (bx + bw + 30, ry), (rx - 26, ry)]
        lb_start, lb_sat, sat_ic = (rx, ry - 54), (sx, sy + 26), (sx, sy + 26)
    else:
        halow = [exit_pt, (rx, exit_pt[1]), (rx, ry - 54)]
        lb_start, lb_sat, sat_ic = (rx - 24, ry - 9), (sx, sy - 12), (sx, sy + 12)
    to_ic = [sat_ic, (ix, iy - 40)]

    total_packet = TO_IC[1] - TO_RELAY[0]
    style = '\n'.join([
        '@keyframes lme-appear { from { opacity: 0; } to { opacity: 1; } }',
        keyframes(f'{k}-drone', [(survey, *SURVEY)], SURVEY[1] - SURVEY[0]),
        keyframes(f'{k}-packet', [(halow, *TO_RELAY), ([lb_start, lb_sat], *TO_SAT), (to_ic, *TO_IC)], total_packet, ' opacity: 1;', vanish=True),
        '@media (prefers-reduced-motion: no-preference) {',
        '  .drawing-trace[data-trace="armed"] .lme-cell, .drawing-trace[data-trace="armed"] .lme-late { opacity: 0; }',
        f'  .drawing-trace[data-trace="armed"] .{k}-drone {{ transform: translate({f(survey[0][0])}px, {f(survey[0][1])}px); }}',
        '  .drawing-trace[data-trace="play"] .lme-cell { animation: lme-appear 120ms linear calc(var(--t) * 1s) both; }',
        '  .drawing-trace[data-trace="play"] .lme-late { animation: lme-appear 200ms linear calc(var(--t) * 1s) both; }',
        f'  .drawing-trace[data-trace="play"] .{k}-drone {{ animation: {k}-drone {SURVEY[1] - SURVEY[0]}s linear both; }}',
        f'  .drawing-trace[data-trace="play"] .{k}-packet {{ animation: {k}-packet {total_packet:.1f}s linear {TO_RELAY[0]}s forwards; }}',
        '}',
        f'.{k}-packet {{ opacity: 0; }}',
    ])
    title = 'Last-Metre Eyes: relay chain from drone to incident command'
    desc = ('A drone surveys inside a damaged structure and builds an occupancy map. A 42 kB map packet goes over a modelled '
            'Wi-Fi HaLow link to a perimeter relay, over Viasat L-band (a mock in the demo) to incident command, which makes '
            'a go, no-go or cleared entry decision. Solid lines are real work, dashed lines modelled, dotted lines a mock.')
    add(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}" class="lme-relay lme-relay-{kind}" role="img" aria-labelledby="{k}Title {k}Desc">'
        f'<title id="{k}Title">{escape(title)}</title><desc id="{k}Desc">{escape(desc)}</desc><style>{style}</style>')

    # Drone segment: damaged structure, interior walls, rubble, map cells, survey path, drone.
    add('<g data-stop="drone">')
    add(f'<polygon points="{pts(P(u, v) for u, v in ROOF)}" fill="{paper}" stroke="{ink}" stroke-width="2" stroke-linejoin="round"/>')
    for u1, v1, u2, v2 in WALLS:
        (x1, y1), (x2, y2) = P(u1, v1), P(u2, v2)
        add(f'<line x1="{f(x1)}" y1="{f(y1)}" x2="{f(x2)}" y2="{f(y2)}" stroke="{ink}" stroke-width="1.6"/>')
    for i in range(5):
        x, y = P(.06 + i * .045, .9)
        add(f'<line x1="{f(x)}" y1="{f(y)}" x2="{f(x + 10)}" y2="{f(y - 12)}" stroke="{muted}" stroke-width="1.2"/>')
    for (c, r), t in sorted(seen.items(), key=lambda kv: kv[1]):
        add(f'<rect class="lme-cell" style="--t:{t:.2f}" x="{f(gx + c * cw + 1)}" y="{f(gy + r * ch + 1)}" width="{f(cw - 2)}" height="{f(ch - 2)}" fill="{accent}" fill-opacity=".22"/>')
    add(f'<polyline points="{pts(survey)}" fill="none" stroke="{ink}" stroke-width="1.5" stroke-dasharray="2 4" opacity=".55"/>')
    add(f'<g class="{k}-drone" transform="translate({f(exit_pt[0])} {f(exit_pt[1])})">')
    for dx, dy in ((-7, -7), (7, -7), (-7, 7), (7, 7)):
        add(f'<circle cx="{dx}" cy="{dy}" r="4.5" fill="none" stroke="{ink}" stroke-width="1.6"/>')
    add(f'<path d="M-7 -7L7 7M7 -7L-7 7" stroke="{ink}" stroke-width="1.6"/><circle r="2.4" fill="{ink}"/></g>')
    label(bx + bw / 2, by + bh + 26, 'Drone inside the structure', 'Real · my capstone aircraft')
    add('</g>')

    add('<g data-stop="halow">')
    link(halow, 'modelled')
    if kind == 'h':
        label(bx + bw + 52, (exit_pt[1] + ry) / 2 + 6, 'Wi-Fi HaLow', 'Modelled', 'start')
    else:
        label(rx - 18, ry - 52, 'Wi-Fi HaLow', 'Modelled', 'end')
    add('</g>')

    add('<g data-stop="relay">')
    add(f'<rect x="{rx - 22}" y="{ry - 26}" width="44" height="34" rx="3" fill="{paper}" stroke="{ink}" stroke-width="2"/>')
    add(f'<path d="M{rx} {ry - 26}V{ry - 48}M{rx} {ry + 8}V{ry + 30}M{rx - 20} {ry + 30}H{rx + 20}M{rx - 9} {ry - 9}H{rx + 1}" stroke="{ink}" stroke-width="2" fill="none"/>')
    add(f'<circle cx="{rx}" cy="{ry - 50}" r="3" fill="{ink}"/>')
    if kind == 'h':
        label(rx, ry + 56, 'Perimeter relay', 'Concept · sky view')
    else:
        label(rx + 22, ry + 56, 'Perimeter relay', 'Concept · sky view', 'end')
    add('</g>')

    add('<g data-stop="lband">')
    link([lb_start, lb_sat], 'mock', 1.2)
    link(to_ic, 'mock', 1.2)
    add(f'<rect x="{sx - 9}" y="{sy - 9}" width="18" height="18" fill="{paper}" stroke="{ink}" stroke-width="2" transform="rotate(45 {sx} {sy})"/>')
    add(f'<path d="M{sx - 46} {sy - 7}h28v14h-28zM{sx + 18} {sy - 7}h28v14h-28zM{sx - 18} {sy}h6M{sx + 12} {sy}h6" fill="none" stroke="{ink}" stroke-width="1.6"/>')
    if kind == 'h':
        label(sx, sy - 48, 'Viasat L-band', 'Mock in the demo')
    else:
        label(sx + 52, sy + 2, 'Viasat L-band', 'Mock in the demo', 'start')
    add('</g>')

    add('<g data-stop="ic">')
    add(f'<rect x="{ix - 52}" y="{iy - 40}" width="104" height="70" rx="3" fill="{paper}" stroke="{ink}" stroke-width="2"/>')
    add(f'<path d="M{ix} {iy + 30}V{iy + 42}M{ix - 22} {iy + 42}H{ix + 22}" stroke="{ink}" stroke-width="2" fill="none"/>')
    mcw, mch = 84 / COLS, 50 / ROWS
    add(f'<g class="lme-late" style="--t:{MAP_IN}">')
    for c, r in seen:
        add(f'<rect x="{f(ix - 42 + c * mcw)}" y="{f(iy - 30 + r * mch)}" width="{f(mcw - .6)}" height="{f(mch - .6)}" fill="{accent}" fill-opacity=".35"/>')
    add('</g>')
    text(ix, iy + 70, 'Go · no-go · cleared', 13, 600, ink, 'middle', 'lme-late', f'--t:{DECISION}')
    label(ix, iy + 96, 'Incident command', 'Target · first map under 15 min')
    add('</g>')

    # The 42 kB packet rides the links; hidden in the finished state.
    add(f'<g class="{k}-packet"><rect x="-6" y="-6" width="12" height="12" fill="{accent}"/>'
        f'<text y="-12" text-anchor="middle" font-family="{FONT}" font-size="13" font-weight="600" fill="{accent_dark}">42 kB</text></g>')
    add('</svg>')
    data = '\n'.join(s) + '\n'
    ET.fromstring(data)
    assert '—' not in data
    path = out_dir / f'relay-{kind}.svg'
    path.write_bytes(data.encode('utf-8'))
    print(path, len(seen), 'cells')


for kind in LAYOUT:
    build(kind)
