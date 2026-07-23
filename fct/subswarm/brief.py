#!/usr/bin/env python3
"""fct/subswarm/brief.py — render the navi sub-agent brief for one subsystem.

The swarm agents are NAVI SUB-AGENTS (spawn_agent tool), NOT Claude Code / tmux. Each agent
works ONE subsystem in an ISOLATED git worktree, edits only its owned files, and verifies
with its subsystem's FCP-oracle tests (caps pack + minimized repros) — NEVER the 65-slug
GUI-GT suite. This renders the exact brief string to pass to spawn_agent(task=...)."""
import os, json
HERE = os.path.dirname(os.path.abspath(__file__))
SUBS = json.load(open(os.path.join(HERE, "subsystems.json")))
REPO = "~/random/final-cut-pro-transitions"

def render(name):
    if name not in SUBS:
        raise SystemExit(f"unknown subsystem {name!r}")
    s = SUBS[name]
    owns = "\n".join(f"      - {f}" for f in s["owns_files"])
    mins = " ".join(s["minimized_cases"])
    targets = ", ".join(s["target_slugs"])
    wt = f"~/fct-swarm/worktrees/subsw-{name}"
    return f"""You are a NAVI sub-agent improving ONE subsystem of the FCP-transitions TS engine.
Work autonomously on cli:vjeux-mac. Do NOT ask questions. Report a concise result when done.

SUBSYSTEM: {name} — {s['title']}  (measured dB deficit {s['deficit']})
{s['note']}

## Your isolated worktree (already created for you)
    cd {wt}
It is a git worktree on branch swarm/subsw-{name} off origin/main. node_modules, venv, and
oz_render.dylib are symlinked from the main repo. STAY in this worktree for ALL work — never cd
to {REPO} to build/test, or you will collide with the other two agents.

Export your PRIVATE frames dir + render lock at the top of your shell (isolation — never share
these with another agent; this is what makes parallel work race-free):
    export FCT_FRAMES_DIR=~/fct-swarm/frames/subsw-{name}
    export FCT_LOCK=~/fct-swarm/locks/subsw-{name}.lock
(The frames dir is pre-seeded with per-slug symlinks into the shared baseline; min-gen replaces
a slug's symlink with a real dir before writing, so re-renders never write through the symlink.)

## You OWN these files — edit ONLY these (disjoint from the other agents):
{owns}
    Do not edit any other engine/ file, the parser (unless listed), or fct/. If a fix truly
    needs a file you don't own, STOP and report it — do not reach across subsystems.

## The ONE truth for your work: per-node tests against headless FCP (NOT the 65-slug suite)
Historically the full suite was slow + race-prone. DO NOT run `fct gen --all`, `fct regress`,
`fct gate`, or `fct baseline`. Your oracle is your subsystem's isolated node tests:

    ./fct.sh subswarm test {name}        # caps pack (synthetic single-node scenes vs headless FCP)
                                      #   + your minimized real-slug repros (engine-vs-FCP)
    ./fct.sh subswarm caps {name}        # just the fast synthetic caps
    ./fct.sh min-score {mins}   # node-level real-slug repros (99 dB = pixel-match FCP)

Each caps node renders ONE primitive through headless FCP (ozengine) AND the TS engine and
PSNR-compares — deterministic, isolated (private tempdir), no shared baseline to corrupt.
Raise the FAILing nodes toward their min_psnr, and raise your min-score cases toward 99 dB.
NOTE: after you edit a compositor .ts file, re-render your minimized cases before scoring them:
    ./fct.sh min-gen {mins} ; ./fct.sh min-score {mins}
(the caps pack always renders the TS engine fresh, so `subswarm caps` needs no pre-render.)

## The loop (decode-don't-fit; measure twice)
1. `./fct.sh subswarm test {name}` — see which nodes FAIL and by how much.
2. For a FAILing node: `./fct.sh subswarm caps {name} <cap-id> --keep` (the runner prints the
   kept headless.png / ts.png paths — inspect them to SEE how FCP differs). DECODE why FCP
   differs (read the real algorithm from the FCP binary / .motr — use tools/re/*, read_const.py,
   the shipped .motr templates). Do NOT curve-fit a magic constant.
3. Fix ONLY your owned file(s). Re-run the test. A fix must raise the FAILing node(s) and must
   NOT lower any currently-passing node in your pack or any min-score case.
4. Commit each correctness improvement in your worktree with a clear message, then push it to
   origin/main:  bash fct/swarm/push_helper.sh subsw-{name} "<msg>"
   (it rebases on origin/main and pushes; keeps blast radius to your files).

## Guard rails (from ROADMAP)
- FAITHFUL, NOT FITTED: behavior depends only on node/filter type + params. NO scene-signature
  discriminators, NO per-slug hardcoding, NO behavior-flag env gating. One unconditional flow.
- The camera-bearing caps are a VALID oracle: a real Camera node makes headless FCP and the GUI
  agree on the 3D projection. (Camera-LESS perspective is a known false-fail — do not add
  camera-less perspective caps and do not "fix" the engine to match camera-less headless.)
- tsc must stay clean: (cd engine && node_modules/.bin/tsc --noEmit).
- These target slugs are where your subsystem's dB deficit lives (context, not a gate): {targets}.

When you have raised at least one node measurably (and regressed none), pushed it, and re-run
`./fct.sh subswarm test {name}` shows the improvement, report: which nodes moved (before→after
dB), what the real FCP algorithm was, the commit hash(es), and what remains.
"""
if __name__ == "__main__":
    import sys
    print(render(sys.argv[1]))
