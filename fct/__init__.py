"""fct — the single clean toolkit for the FCP headless-transition project.

Replaces ~160 ad-hoc scripts. Four responsibilities, one way to do each:

  fct.gen      generate frames to disk for a source (gui | headless | engine)
  fct.read     read one frame from disk -> numpy array (nothing kept in memory)
  fct.compare  visual comparison between TWO files on disk (PSNR + diff image)
  fct.montage  build a video montage from frame directories

Everything reads/writes PNG files on disk. No in-memory frame passing between
stages. The three renderers all emit 24 frames per slug at the SAME half-open
progress (i/24), 1920x1080, named frame_0000.png .. frame_0023.png, so any two
sources are directly comparable frame-for-frame.

Canonical data locations (on disk, one place each):
  ~/fct-gui-gt/<slug>/frame_XXXX.png       GUI ground truth  (the ONLY real truth)
  ~/fct-frames/headless/<slug>/frame_*.png headless shim render
  ~/fct-frames/engine/<slug>/frame_*.png   TS engine render
"""
from .config import SLUGS, slug_motr, GUI_GT_DIR, FRAMES_DIR, N_FRAMES, SIZE, GAM
