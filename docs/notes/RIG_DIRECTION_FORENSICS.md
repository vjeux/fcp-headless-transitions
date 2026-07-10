# RIG-DIRECTION forensics (handoff for g1 worker) — 2026-07-06

## GOAL
Make headless render the GUI's Push direction. Empirical anchor: headless with Push popup value=1
scores 23.22dB vs GUI (~/fct-gui-gt/Movements__Push); native value=2 scores 14.48dB. Fix must be
GENERIC (no per-transition hack), work for all ~17 directional transitions.

## VERIFIED FACTS (lldb + disassembly, prior investigation)
- The rig IS evaluated headless: OZRigWidget::getSnapshotIDsForValue is CALLED with value=2.0 during
  render; doPassThrough called 30x; setActiveSnapshot NEVER called.
- Direction rig: widgetType=2, snapshot IDs [1,2,3,4] with Value channels 0,1,2,3 respectively.
- getSnapshotIDsForValue type-2 logic (arm64 disasm): finds snapshot whose Value channel EXACTLY equals
  the requested value (|value - snapValue| < 1.27e-7). So value=2 -> snapshot id=3 (Value==2). Returns
  snapA=id, snapB=0, blend=0. This is deterministic and the rig applies snapshot-3 geometry = "dir2".
- Push.motr Direction popup: id=100, default="0", value="2". Menu tags: L->R=0, R->L=3, T->B=1, B->T=2.
- FCP roundtrip fcpxml (/tmp/gt_all_65_roundtrip.fcpxmld/Info.fcpxml): <filter-video ref name="Push"/>
  with ZERO <param> overrides. So FCP applied a built-in default, NOT the template's value=2.
- GUI Push motion (verified pixel analysis): A(sepia) slides UP, B enters from BOTTOM.

## THE OPEN QUESTION (what g1 must resolve)
Headless renders value=2 (snapshot id=3) = 14.5dB. GUI matches value=1 (14.5->23.2). The GUI used NO
param override, yet renders as-if value=1 — which is neither the stored value(2) nor default(0).
WHY? Candidate mechanisms to test:
  (a) MENU-INDEX vs TAG: popup stored numeric may be a menu-list INDEX not a tag; the value FCP feeds
      the rig may be remapped through the menu entry order [LtR=0,RtL=3,TtB=1,BtT=2]. Test what
      getValueAsDouble returns for the popup channel (index vs tag) and whether the rig gets a remapped value.
  (b) FCP resets published popup params to a coded apply-default on insert that differs from motr default.
  (c) The 24 GT frames' timing (A-return trimmed) interacts with a slightly different snapshot.
DELIVERABLE OPTIONS:
  1. A GENERIC code change (oz_render.mm or ozengine.py) that makes headless resolve the SAME snapshot
     FCP does on apply, for ALL directional transitions. Verify: Push>=23dB AND at least 2 other
     directional transitions (e.g. Diagonal, Mask) improve or hold vs ~/fct-gui-gt, AND a non-directional
     guard (Wipes_Mask? no it's directional — use Movements_Rotate or Dissolves_Divide) does not regress.
  2. If truly not resolvable generically in-engine, a precise mechanism writeup + the exact minimal generic
     hook needed, with disasm evidence.

## HOW TO WORK (worktree w1 = ~/fct-worktrees/w1, branch agent/g1-rig-direction)
- Build: cd ~/fct-worktrees/w1 && ./build.sh   (builds THIS worktree's oz_render.dylib)
- Render/score one slug (uses this worktree's dylib):
    cd ~/fct-worktrees/w1
    DYLD_FRAMEWORK_PATH="/Applications/Final Cut Pro.app/Contents/Frameworks" \
      ~/random/final-cut-pro-transitions/venv/bin/python3 ~/fct-notes/score_slug.py Movements__Push --frames
- To reproduce dir variants: copy Push.motr to /tmp, edit the Direction popup value= attribute, render.
  (This is for DIAGNOSIS only — the SHIPPED fix must NOT edit .motr templates.)
- Directional transitions (have a Direction popup id=100): Push, Slide, Flip, Swing, Smear, Scale,
  Clothesline, Switch, Color Planes, Mask, Diagonal, 360 Divide. (Slide In, Center Reveal use id=219.)
