# Subsystem swarm — parallel per-subsystem improvement against the FCP oracle

Goal (2026-07-23, vjeux): run a swarm of agents that each improve ONE of the top-3
least-developed subsystems in parallel, testing each engine NODE **independently against
the FCP source of truth** — NOT the full 65-slug GUI-GT suite (which is slow + race-prone).

## The three subsystems (by measured dB deficit, from the subsystem audit)
| id            | code owned                                   | deficit | worst slugs |
|---------------|----------------------------------------------|---------|-------------|
| `perspective` | perspective.ts, z-composite.ts, geometry.ts  | 27.7    | Switch, Drop_In, Swing, Reflection |
| `replicator`  | replicator.ts (compositor+parser)            | 23.1    | Clone_Spin, Video_Wall, Combo_Spin |
| `panels`      | shapes.ts, masks.ts, gradient.ts             | 21.0    | Center, Lower, Up-Over, Light_Sweep |

## The test unit: ONE node vs headless FCP (fast, isolated, deterministic)
Each subsystem owns a **capability pack** — a list of synthetic single-primitive scenes
(`fct/subswarm/packs/<subsystem>.json`) built on a MINIMAL skeleton, rendered through BOTH
headless FCP (`ozengine`) and the TS engine (`_scene_render.ts`), then PSNR-compared. This
is the `fct caps` mechanism (tools/re/probe_scene.py) extended with new injectors + a
camera-bearing skeleton (the 3D-fold oracle needs a real Camera node — camera-less
perspective is a documented FALSE FAIL where headless != GUI).

Run ONE subsystem's pack (seconds per node, no 65-slug render, no shared baseline):
```
fct.sh subswarm test <subsystem>            # run all nodes in the pack vs FCP
fct.sh subswarm test <subsystem> <cap-id>   # run one node
fct.sh subswarm list <subsystem>            # list the pack's nodes
fct.sh subswarm status                      # per-subsystem PASS/FAIL scoreboard (on disk)
```

## Why this avoids the historical slowness + races
- **No full suite**: an agent runs ONLY its subsystem's pack (a handful of nodes), never
  `gen --all` (2-3 min) or the 65-slug gate.
- **No shared baseline / frames**: each node test renders into a private tempdir; there is
  no shared `FCT_FRAMES_DIR` baseline to corrupt (the old race). PASS/FAIL is per-node PSNR
  vs FCP, self-contained.
- **Isolated worktrees**: each agent gets its own git worktree + branch (setup_worktree.sh),
  so edits to perspective.ts / replicator.ts / shapes.ts never collide.
- **Disjoint code ownership**: the three subsystems edit disjoint files (enforced in the
  brief), so there is no merge contention on the hot path.

See `orchestrate.py` for the launcher and `packs/` for the per-subsystem node tests.
