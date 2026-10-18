# UAV simulation media

The gallery extends the existing Phase 0 results section. Arrival success is
separate from the 0.5 m aircraft-centre clearance requirement.

## Source and reproduction

Figures were exported from existing trial JSON, not from new simulation runs.
The generator is maintained in InternalOS at
`projects/gps-denied-capstone/tools/build_portfolio_media.py`:

```text
python build_portfolio_media.py OUTPUT_DIR
```

Dependencies: matplotlib, Pillow and FFmpeg. Input paths relative to the
capstone project and their SHA-256 hashes are recorded in
`uav-simulation-provenance.json`, alongside the recomputed clearance values.
PNG exports go to `public/images/uav-simulation/`; MP4 animations go to
`public/videos/uav-simulation/`. The animations align runs at first horizontal
movement and play at 4x. Native controls, no autoplay and `preload="none"` keep
motion and video downloads user initiated.

Baseline geometry uses `phase0_trials/obstacles.py`. Held-out box 02 uses its
own footprint from `2026-10-07-heldout-inputs/manifest.json`, not nominal
geometry. The dotted rectangles illustrate a 0.5 m allowance around true
footprints; they are not observed costmaps or exact Euclidean corner contours.
Reported clearance is the minimum Euclidean distance from the logged truth
track to any true obstacle footprint.

The older `plot_tracks.py` hard-codes 0.45 m inflation. Those existing PNG/GIF
exports were not reused or modified. The new plots label the actual 0.7 m
configuration and deliberately do not invent an omniscient inflated costmap.

## Recorded flights

`depth-loss-reconstruction.webm` is a byte-for-byte copy of
`flight_videos/videos/F1_blind_crash_old_code.webm`; `watchdog-hold-resume.webm`
copies `F2_watchdog_hold_resume.webm`. Both are silent VP9, 1024x768 at 20 fps,
35.1 s and 44.6 s respectively. The source record is
`planning/records/2026-10-01-flight-recordings.md` in the capstone.

They use an earlier 0.45 m configuration and camera-sensor renders with
truth-derived overlays. The original failed trial was not recorded; F1 is a
reconstruction of the old behaviour. Caption tracks and expandable text
sequences describe approximate event times from that source record.

The depth-delay reruns use known seeds and are not a new held-out test.
Capture-time placement remains optional, with hardware clock alignment and
the other adoption checks still required. Simulator EKF and real VIO evidence
remain distinct in the existing limitations section.
