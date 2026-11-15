"""Last-Metre Eyes site scene for the Viasat case study miniature (nnoott.com).

Cutaway collapsed building with a roof slab dropped from the back wall onto a broken
column, the drone working in the sheltered void under its front edge, the relay on a
mast at the site perimeter (solar panel, battery box, dish), a fenced site
edge, debris and a fallen beam, dashed local link and backhaul, satellite with dish.
Self-contained: standard library only. Rerender command and hashes: README.md.
"""
import math


def _b(api, name, x0, y0, z0, dx, dy, dz, mat, bevel=0.0):
    # helpers take a centre; scene constants are written as min corner + size
    api.box(name, (x0 + dx / 2, y0 + dy / 2, z0 + dz / 2), (dx, dy, dz), mat, bevel=bevel)


def _dashes(api, name, a, b, step, size, mat, gap_from=0.0):
    ax, ay, az = a
    bx, by, bz = b
    length = math.dist(a, b)
    n = int(length / step)
    for i in range(n):
        if i % 2:
            continue
        t = (i + 0.5) / n
        if t < gap_from:
            continue
        api.box(f"{name}-{i}", (ax + (bx - ax) * t, ay + (by - ay) * t, az + (bz - az) * t),
                (size, size, size), mat)


def _drone(api, k=1.3):
    # Hero quadcopter, scaled by k. Contrast rules: teal rotor discs read against the beige
    # floor and grey slab, a concrete shell separates from both the floor and the dark arms.
    for i, rot in enumerate((math.pi / 4, -math.pi / 4)):
        api.box(f"arm-{i}", (0, 0, 0), (1.76 * k, 0.11 * k, 0.08 * k), "ink", rotation=(0, 0, rot))
    api.box("chassis", (0, 0, -0.04 * k), (0.42 * k, 0.52 * k, 0.12 * k), "ink", bevel=0.02)
    api.box("shell", (0, 0, 0.1 * k), (0.48 * k, 0.56 * k, 0.16 * k), "concrete", bevel=0.03)
    r = 0.62 * k
    for i, (ox, oy) in enumerate([(-r, -r), (r, r), (-r, r), (r, -r)]):
        api.cylinder(f"motor-{i}", (ox, oy, 0.04 * k), 0.11 * k, 0.16 * k, "ink", vertices=12)
        api.cylinder(f"rotor-{i}", (ox, oy, 0.15 * k), 0.31 * k, 0.04 * k, "info", vertices=20)
        api.cylinder(f"hub-{i}", (ox, oy, 0.19 * k), 0.08 * k, 0.06 * k, "ink", vertices=10)
    api.box("gimbal", (0, 0.12 * k, -0.17 * k), (0.12 * k, 0.12 * k, 0.1 * k), "ink")
    api.box("lens", (0, 0.2 * k, -0.24 * k), (0.16 * k, 0.12 * k, 0.12 * k), "ink", bevel=0.02)


def build(spec, api):
    pos = {o["id"]: o["position"] for o in spec["objects"]}

    with api.group("ground", pos["ground"]):
        _b(api, "plate", -0.3, -0.3, -0.4, 13.1, 9.0, 0.4, "ground")
        # site perimeter fence along the front edge
        # kerb and footpath strip along the front edge
        _b(api, "kerb", -0.3, 8.45, 0, 13.1, 0.25, 0.08, "concrete")
        _b(api, "path", 0.0, 7.55, 0, 6.0, 0.55, 0.03, "concrete")
        # fence bays: posts and a top rail
        for i in range(5):
            _b(api, f"post-{i}", 0.2 + i * 1.3, 8.25, 0, 0.12, 0.12, 0.75, "ink")
        for i in range(5):
            x = 0.32 + i * 1.3
            _b(api, f"rail-top-{i}", x, 8.27, 0.63, 1.18 if i < 4 else 1.38, 0.07, 0.07, "ink")
        # gate: short posts and a striped boom arm across the gap
        _b(api, "gate-post-0", 6.9, 8.22, 0, 0.14, 0.14, 0.62, "ink")
        _b(api, "gate-post-1", 8.25, 8.23, 0, 0.12, 0.12, 0.5, "concrete")
        _b(api, "gate-cap", 8.23, 8.21, 0.5, 0.16, 0.16, 0.06, "ink")
        for i in range(6):
            _b(api, f"boom-{i}", 6.97 + i * 0.2, 8.17, 0.46, 0.2, 0.16, 0.14,
               "ink" if i % 2 == 0 else "ground")
        _b(api, "boom-tail", 6.77, 8.18, 0.48, 0.2, 0.12, 0.1, "ink")
        # responder staging: field tent on ink poles, generator, equipment cases
        _b(api, "tent-pad", 8.9, 0.7, 0, 2.5, 2.2, 0.03, "concrete")
        for i, (px, py) in enumerate(((9.0, 0.8), (10.95, 0.8), (9.0, 2.65), (10.95, 2.65))):
            _b(api, f"tent-pole-{i}", px, py, 0.03, 0.1, 0.1, 0.9, "ink")
        _b(api, "tent-roof", 8.9, 0.7, 0.93, 2.2, 2.1, 0.1, "slab")
        _b(api, "tent-ridge", 9.3, 0.9, 1.03, 1.4, 1.7, 0.1, "concrete")
        _b(api, "tent-valance", 8.9, 2.8, 0.78, 2.2, 0.06, 0.15, "ink")
        _b(api, "tent-table", 9.4, 1.2, 0.03, 1.2, 0.7, 0.38, "slab")
        _b(api, "tent-laptop", 9.6, 1.35, 0.41, 0.5, 0.4, 0.06, "ink")
        _b(api, "gen-body", 11.5, 1.0, 0.03, 0.7, 1.0, 0.55, "ground")
        _b(api, "gen-top", 11.45, 0.95, 0.58, 0.8, 1.1, 0.08, "slab")
        for k in range(4):
            _b(api, f"gen-vent-{k}", 12.21, 1.15 + k * 0.2, 0.12, 0.03, 0.1, 0.38, "ink")
        _b(api, "case-a", 11.55, 2.3, 0.03, 0.5, 0.55, 0.32, "slab")
        _b(api, "case-b", 11.55, 2.95, 0.03, 0.5, 0.5, 0.22, "concrete")
        _b(api, "case-strap", 11.55, 2.42, 0.35, 0.5, 0.1, 0.05, "ink")

    with api.group("building", pos["building"]):
        _b(api, "floor", 1, 1, 0, 6.5, 6.5, 0.2, "ground")
        hx = [3.2, 3.0, 2.6, 2.1, 1.5, 1.0]
        hy = [3.2, 3.1, 2.9, 2.5, 1.9, 1.2]
        for i, h in enumerate(hx):
            if i == 1:
                _b(api, f"wall-x-{i}-low", 1, 1.4 + i, 0.2, 0.4, 1.0, 1.1, "concrete")
                _b(api, f"wall-x-{i}-high", 1, 1.4 + i, 2.1, 0.4, 1.0, h - 1.9, "concrete")
                continue
            _b(api, f"wall-x-{i}", 1, 1.4 + i, 0.2, 0.4, 1.0, h, "concrete")
            # block coursing: slab bands on the inner face + an offset cap block on the top
            for j, z in enumerate((0.8, 1.45, 2.1, 2.75)):
                if z + 0.1 < h + 0.2 - 0.15:
                    _b(api, f"course-x-{i}-{j}", 1.4, 1.4 + i, z, 0.08, 1.0, 0.1, "slab")
            _b(api, f"cap-x-{i}", 1.0, 1.4 + i + (0.35 if i % 2 else -0.05), 0.2 + h, 0.4, 0.55, 0.22, "slab")
        for i, h in enumerate(hy):
            if i == 4:
                _b(api, f"wall-y-{i}-low", 1.4 + i, 1, 0.2, 1.0, 0.4, 0.8, "concrete")
                _b(api, f"wall-y-{i}-high", 1.4 + i, 1, 1.6, 1.0, 0.4, h - 1.4, "concrete")
                continue
            _b(api, f"wall-y-{i}", 1.4 + i, 1, 0.2, 1.0, 0.4, h, "concrete")
            for j, z in enumerate((0.8, 1.45, 2.1, 2.75)):
                if z + 0.1 < h + 0.2 - 0.15:
                    _b(api, f"course-y-{i}-{j}", 1.4 + i, 1.4, z, 1.0, 0.08, 0.1, "slab")
            _b(api, f"cap-y-{i}", 1.4 + i + (0.35 if i % 2 == 0 else -0.05), 1, 0.2 + h, 0.55, 0.4, 0.22, "slab")
        _b(api, "corner", 1, 1, 0.2, 0.4, 0.4, 3.2, "concrete")
        # exposed rebar poking up from broken wall tops (ink, bent tips)
        for k, (rx_, ry_, rz_) in enumerate(((1.15, 4.8, 2.3), (5.7, 1.15, 1.9))):
            api.box(f"rebar-w-{k}", (rx_, ry_, rz_ + 0.3), (0.12, 0.12, 0.6), "ink", rotation=(0.15 * (k % 2 * 2 - 1), 0.1, 0))
            api.box(f"rebar-w-tip-{k}", (rx_ + 0.06, ry_, rz_ + 0.62), (0.22, 0.12, 0.12), "ink", rotation=(0, 0.4, 0))
        # front stubs with a doorway gap at x 3.4..4.4 (stub 2 omitted), framed in slab
        for i, h in enumerate([1.1, 0.7, 0.9, 0.5, 0.8, 0.6]):
            if i == 2:
                continue
            _b(api, f"stub-y-{i}", 1.4 + i, 7.1, 0.2, 1.0, 0.4, h, "concrete")
        for k, x in enumerate((3.3, 4.3)):
            _b(api, f"door-post-{k}", x, 7.05, 0.2, 0.12, 0.5, 1.2, "slab")
        _b(api, "door-lintel", 3.3, 7.05, 1.4, 1.12, 0.5, 0.12, "slab")
        _b(api, "door-sill", 3.42, 7.1, 0.2, 0.88, 0.4, 0.05, "ink")
        for i, h in enumerate([0.9, 1.2, 0.6, 0.8, 0.5, 0.7]):
            _b(api, f"stub-x-{i}", 7.1, 1.4 + i, 0.2, 0.4, 1.0, h, "concrete")
        _b(api, "corner-front", 7.1, 7.1, 0.2, 0.4, 0.4, 1.0, "concrete")
        # window openings: deep dark reveal, slab frame (sill, lintel, jambs)
        _b(api, "dark-x", 1.05, 2.4, 1.3, 0.3, 1.0, 0.8, "ink")
        _b(api, "sill-x", 1, 2.3, 1.2, 0.55, 1.2, 0.1, "slab")
        _b(api, "lintel-x", 1, 2.3, 2.1, 0.55, 1.2, 0.15, "slab")
        _b(api, "jamb-x-0", 1.4, 2.3, 1.3, 0.15, 0.1, 0.8, "slab")
        _b(api, "jamb-x-1", 1.4, 3.4, 1.3, 0.15, 0.1, 0.8, "slab")
        _b(api, "dark-y", 5.4, 1.05, 1.0, 1.0, 0.3, 0.6, "ink")
        _b(api, "sill-y", 5.3, 1, 0.9, 1.2, 0.55, 0.1, "slab")
        _b(api, "lintel-y", 5.3, 1, 1.6, 1.2, 0.55, 0.15, "slab")
        _b(api, "jamb-y-0", 5.3, 1.4, 1.0, 0.1, 0.15, 0.6, "slab")
        _b(api, "jamb-y-1", 6.4, 1.4, 1.0, 0.1, 0.15, 0.6, "slab")
        # exposed floor slab edge along the front and right sides
        _b(api, "edge-front", 1, 7.5, 0, 6.5, 0.08, 0.2, "slab")
        _b(api, "edge-right", 7.5, 1, 0, 0.08, 6.5, 0.2, "slab")
        # column stubs (clear of the drone void) with capped tops and a bent bar
        for k, (cx, cy, h) in enumerate(((4.9, 6.1, 0.9), (6.3, 6.3, 1.2), (2.4, 6.4, 0.8))):
            _b(api, f"col-{k}", cx, cy, 0.2, 0.35, 0.35, h, "concrete")
            _b(api, f"col-cap-{k}", cx - 0.05, cy - 0.05, 0.2 + h, 0.45, 0.45, 0.1, "slab")
        api.box("col-bar", (5.07, 6.27, 1.4), (0.09, 0.09, 0.4), "ink", rotation=(0.3, 0.2, 0))

    with api.group("slab", pos["slab"]):
        # Collapsed roof slab in two pieces split by a crack: the upper piece still on the
        # y = 1 wall, the lower piece sheared up a little and dropped onto a capped prop.
        y0, z0, y1, z1 = 1.4, 2.6, 4.6, 1.7
        ang = math.atan2(z0 - z1, y1 - y0)
        ym = 3.0
        t = (ym - y0) / (y1 - y0)
        la = ym - y0 - 0.04
        lb = y1 - ym - 0.04
        zm = lambda y: z0 + (z1 - z0) * (y - y0) / (y1 - y0)
        ca = math.cos(ang)
        api.box("roof-back", (3.4, y0 + la / 2 / ca * ca, zm(y0 + la / 2 / ca * ca)),
                (4.0, la / ca, 0.22), "slab", rotation=(-ang, 0, 0))
        yb = ym + 0.04 + (lb / 2) 
        api.box("roof-front", (3.4, yb, zm(yb) + 0.07), (4.0, lb / ca, 0.22), "slab",
                rotation=(-ang, 0, 0))
        # crack line and a spall notch on the front corner
        api.box("crack", (3.4, ym + 0.02, zm(ym) + 0.03), (4.0, 0.07, 0.2), "ink",
                rotation=(-ang, 0, 0))
        # prop: pad, shaft, capital
        _b(api, "prop-pad", 4.85, 4.1, 0.2, 0.65, 0.65, 0.12, "concrete")
        _b(api, "prop", 5.0, 4.25, 0.32, 0.35, 0.35, 1.18, "concrete")
        _b(api, "prop-cap", 4.9, 4.15, 1.44, 0.55, 0.55, 0.14, "concrete")
        _b(api, "prop-crack", 5.0, 4.6, 0.8, 0.35, 0.04, 0.05, "ink")
        # torn corner: ink hole through the front piece top, broken lip and loose spalls
        def top(y):
            return zm(y) + 0.07 + 0.11
        api.box("hole", (1.95, 4.0, top(4.0) + 0.01), (0.7, 0.5, 0.05), "ink",
                rotation=(-ang, 0, 0.12))
        api.box("hole-lip", (1.95, 4.3, top(4.3) + 0.03), (0.9, 0.12, 0.08), "slab",
                rotation=(-ang, 0, 0.12))
        api.box("slab-chunk-0", (3.0, 3.75, top(3.75) + 0.08), (0.4, 0.3, 0.16), "slab",
                rotation=(-ang + 0.2, 0.15, 0.6))
        # sagging +x end of the front piece: a broken wedge drooping off the edge
        api.box("sag-0", (5.5, 4.0, zm(4.0) - 0.05), (0.5, 1.0, 0.18), "slab",
                rotation=(-ang, 0.18, 0.1))
        api.box("sag-1", (5.8, 4.35, zm(4.35) - 0.28), (0.4, 0.5, 0.16), "concrete",
                rotation=(-ang, 0.5, 0.2))
        # rebar stubs: thick ink rods bending down out of the broken front edge
        for k, x in enumerate((1.9, 4.3)):
            api.box(f"rebar-{k}", (x, 4.82, 1.6), (0.09, 0.55, 0.09), "ink", rotation=(-0.45, 0, 0))
            api.box(f"rebar-tip-{k}", (x, 5.08, 1.52), (0.09, 0.09, 0.2), "ink", rotation=(0.2, 0, 0))

    with api.group("rubble", pos["rubble"]):
        # irregular broken slabs and fragments, rotated, some leaning on walls
        api.box("heap-a-0", (6.4, 2.15, 0.45), (0.9, 0.7, 0.3), "concrete", rotation=(0, 0.1, 0.25))
        api.box("heap-a-1", (6.5, 2.2, 0.72), (0.65, 0.5, 0.2), "slab", rotation=(0.1, -0.15, -0.4))
        api.box("heap-a-lean", (6.9, 1.4, 0.8), (0.9, 0.12, 0.7), "slab", rotation=(-0.5, 0, 0.1))
        api.box("heap-b-0", (2.1, 5.85, 0.45), (0.95, 0.7, 0.3), "concrete", rotation=(0.05, 0.1, 0.5))
        api.box("heap-b-1", (2.2, 5.9, 0.7), (0.55, 0.45, 0.2), "slab", rotation=(-0.2, 0.15, 0.9))
        api.box("heap-c-0", (8.15, 5.8, 0.25), (0.9, 0.6, 0.28), "concrete", rotation=(0, 0.12, -0.35))
        api.box("heap-c-1", (8.2, 5.8, 0.5), (0.5, 0.4, 0.18), "slab", rotation=(0.2, -0.1, 0.6))
        api.box("block-6", (5.55, 7.8, 0.2), (0.8, 0.5, 0.28), "concrete", rotation=(0, 0.1, 0.4))
        api.box("block-7", (6.5, 7.75, 0.14), (0.45, 0.3, 0.2), "slab", rotation=(0.15, 0, -0.5))
        api.box("block-8", (3.3, 6.45, 0.4), (0.6, 0.4, 0.22), "concrete", rotation=(0.1, 0.2, 0.7))
        api.box("block-9", (6.6, 3.5, 0.42), (0.6, 0.45, 0.24), "concrete", rotation=(-0.1, 0.1, 1.1))
        # chunk broken off the slab corner, rebar poking from it
        api.box("spall", (5.9, 4.9, 0.4), (0.7, 0.55, 0.22), "slab", rotation=(0, 0.1, 0.5))
        api.box("spall-rebar", (5.9, 4.9, 0.56), (0.09, 0.5, 0.09), "ink", rotation=(0, 0, 0.5))
        api.box("beam", (6.0, 5.4, 0.35), (2.2, 0.3, 0.3), "slab", rotation=(0, 0.12, 0.5))
        # broken pipe stub and a plank
        api.cylinder("pipe", (8.6, 2.4, 0.5), 0.14, 0.6, "ink", vertices=12)
        api.cylinder("pipe-rim", (8.6, 2.4, 0.82), 0.17, 0.05, "concrete", vertices=12)
        api.box("plank", (4.4, 7.2, 0.24), (1.3, 0.28, 0.07), "ground", rotation=(0, 0, 0.35))
        for i, (x, y, z) in enumerate([
            (5.6, 2.6, 0.2), (4.9, 6.2, 0.2),
            (8.4, 3.2, 0), (8.6, 4.4, 0), (9.2, 7.6, 0), (7.6, 8.6, 0), (4.0, 8.4, 0), (1.0, 8.0, 0),
        ]):
            api.box(f"chip-{i}", (x + 0.12, y + 0.1, z + 0.08), (0.25, 0.22, 0.14), "concrete",
                    rotation=(0.2, -0.2, 0.3 * i))

    with api.group("drone", pos["drone"]):
        _drone(api)

    with api.group("relay", pos["relay"]):
        _b(api, "foot", -0.5, -0.5, 0, 1.0, 1.0, 0.15, "concrete")
        _b(api, "mast", -0.06, -0.06, 0.15, 0.12, 0.12, 2.3, "ink")
        _b(api, "node", -0.4, -0.3, 2.4, 0.8, 0.6, 0.7, "ground")
        _b(api, "lid", -0.46, -0.36, 3.1, 0.92, 0.72, 0.1, "concrete")
        _b(api, "hinge", -0.3, 0.3, 3.0, 0.6, 0.08, 0.1, "ink")
        _b(api, "gland", -0.08, -0.3, 2.28, 0.16, 0.16, 0.14, "ink")
        _b(api, "antenna", 0.15, -0.04, 3.2, 0.08, 0.08, 0.8, "ink")
        _b(api, "ant-tip", 0.12, -0.07, 4.0, 0.14, 0.14, 0.12, "concrete")
        _b(api, "whip", -0.3, -0.03, 3.2, 0.06, 0.06, 0.45, "ink")
        _b(api, "ballast-a", -0.45, -0.45, 0.15, 0.3, 0.3, 0.2, "slab")
        _b(api, "ballast-b", -0.45, 0.15, 0.15, 0.3, 0.3, 0.2, "slab")
        _b(api, "battery", 0.12, 0.1, 0.15, 0.32, 0.3, 0.32, "slab")
        # tripod legs splaying from the mast to the foot
        for k, (lx, ly) in enumerate(((0.45, 0.0), (0.0, 0.45), (-0.4, -0.4))):
            api.line(f"leg-{k}", [(0, 0, 1.1), (lx, ly, 0.15)], 0.05, "ink")
        # dish on a short arm, +x side, tilted up toward the satellite
        for nm, dz, r, d, mat in (("dish", 0.0, 0.4, 0.07, "concrete"),
                                  ("dish-hub", 0.06, 0.11, 0.07, "ink")):
            api.cylinder(nm, (0.5 - dz * 0.2, 0.1 - dz * 0.2, 1.95 + dz), r, d, mat,
                         vertices=16, rotation=(0.2, -0.2, 0))
        api.box("dish-feed", (0.43, 0.03, 2.2), (0.06, 0.06, 0.28), "ink")
        _b(api, "arm", 0.0, -0.05, 1.9, 0.4, 0.1, 0.07, "ink")
        # solar panel on the +y side: ink frame with four cells and a support
        _b(api, "solar-post", -0.04, 0.2, 1.45, 0.08, 0.08, 0.35, "ink")
        tilt = -0.55
        c, sn = math.cos(tilt), math.sin(tilt)
        def _ps(name, lx, ly, lz, sx, sy, sz, mat):
            # local panel coords (lx,ly,lz) rotated about x by tilt, panel centre below
            px, py, pz = -0.05, 0.5, 1.85
            api.box(name, (px + lx, py + ly * c - lz * sn, pz + ly * sn + lz * c),
                    (sx, sy, sz), mat, rotation=(tilt, 0, 0))
        _ps("solar-frame", 0, 0, 0, 0.78, 0.56, 0.06, "ink")
        for i, cx in enumerate((-0.19, 0.19)):
            for j, cy in enumerate((-0.13, 0.13)):
                _ps(f"solar-{i}-{j}", cx, cy, 0.03, 0.33, 0.22, 0.04, "info")
        _b(api, "status", 0.40, -0.15, 2.6, 0.05, 0.3, 0.3, "status")

    rx, ry, _ = pos["relay"]
    dx, dy, dz = pos["drone"]
    sx, sy, sz = pos["satellite"]
    with api.group("link-local", pos["link-local"]):
        _dashes(api, "dash", (dx, dy, dz + 0.2), (rx - 0.4, ry, 2.75), 0.45, 0.16, "info", gap_from=0.2)
    with api.group("link-backhaul", pos["link-backhaul"]):
        _dashes(api, "dash", (rx, ry, 3.2), (sx, sy, sz - 0.95), 0.45, 0.16, "info")

    with api.group("satellite", pos["satellite"]):
        api.box("body", (0, 0, 0), (0.6, 0.6, 0.6), "ground")
        api.box("band", (0, 0, 0.12), (0.64, 0.64, 0.14), "slab")
        api.box("stalk", (0, 0, -0.42), (0.06, 0.06, 0.25), "ink")
        api.cylinder("dish", (0, 0, -0.58), 0.28, 0.06, "concrete", vertices=16)
        api.box("boom", (-0.12, -0.12, 0.42), (0.06, 0.06, 0.26), "ink")
        api.box("boom-tip", (-0.12, -0.12, 0.58), (0.12, 0.12, 0.1), "concrete")
        s2 = math.sqrt(0.5)
        for tag, sg in (("a", -1), ("b", 1)):
            cx, cy = sg * 1.1, -sg * 1.1
            rot = (0, 0, -math.pi / 4)
            api.box("yoke-" + tag, (sg * 0.5, -sg * 0.5, 0), (0.5, 0.08, 0.08), "ink", rotation=rot)
            api.box("frame-" + tag, (cx, cy, 0), (1.3, 0.08, 0.5), "ink", rotation=rot)
            for i, t in enumerate((-0.43, 0, 0.43)):
                api.box("cell-%s%d" % (tag, i), (cx + t * s2, cy - t * s2, 0), (0.37, 0.11, 0.4), "info", rotation=rot)
