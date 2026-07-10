
## Background render double-launch (2026-07-10)
- The `navi.background`/bash background tool can fire the SAME command more than once
  (observed 2-3 concurrent `gen engine --all`). Two `--all` renders writing the same
  frame dirs RACE and one leaves an orphaned tsx (PPID 1) at 100% CPU that starves the
  real render (360°_Bloom stuck for 4+ min).
- FIX: guard the render script with an atomic `mkdir /tmp/fct_render.lock` lock +
  `trap 'rmdir' EXIT`. Duplicate launches abort cleanly. Script: /tmp/rr_guarded.sh.
- When killing a duplicate render, also kill its re-exec'd python child AND any tsx
  (the CLI execs itself under venv, so children re-parent to init when the parent dies).
