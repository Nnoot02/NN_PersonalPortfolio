# Last-Metre Eyes site miniature

Source for `public/images/viasat-entry/site-miniature.png`, the illustrative voxel scene in the
Viasat case study (DESIGN.md, Projects Process Atlas miniature system). `scene.py` builds the
geometry; `spec.json` holds the palette, camera, light and the nine object groups.

The render is offline and not part of the build. It uses the InternalOS `blender-pixel-art`
skill's renderer on Blender 5.2.2 LTS (Windows), clean style.

## Rerender

From any working directory, into a fresh output directory:

```
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "<skill>/scripts/Render-PixelScene.ps1" -Spec "<repo>/scripts/miniatures/lme-site/spec.json" -SceneSource "<repo>/scripts/miniatures/lme-site/scene.py" -Style clean -OutputDirectory "<fresh dir>"
```

`<skill>` is the `blender-pixel-art` skill directory (InternalOS plugin). Copy the run's
`native.png` over `public/images/viasat-entry/site-miniature.png`.

## Record

| Item | Value |
|---|---|
| Native size | 320 x 224 (preview 3x) |
| `site-miniature.png` sha256 | `bd33a78761dd898e97239ef72cef315d8722c107e5e0fbeaaf65c1c041d6c7ca` |
| `scene.py` sha256 (LF) | `2ebe304c45b3ca969381ef772d832887cd56fbce41ad829818e8b9ece097c140` |
| `spec.json` sha256 (LF) | `235fd1170e5d6d9a2c1df2f3d20acd680416b1cb3c8f9cfbd67a070e88b3123a` |
| Reproduced | 2026-11-15, rerendered from an unrelated directory, byte-identical PNG |
| Signed off | 2026-11-15, Nathan approved pass 6 (M-4) |

`scripts/portfolio-contract.mjs` pins the same three hashes as literals. A changed source
without a re-render, or a re-render without the source, fails the contract: rerender, then
update the literals and this table together. A different Blender version may not reproduce the
bytes; a fresh render then needs Nathan's sign-off before the hashes move.

The editable `.blend` is not tracked; it is re-created by any rerender.
