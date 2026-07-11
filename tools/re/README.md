# tools/re — FCP filter reverse-engineering + Phase-2 verification toolkit

Committed tools for the "reverse-engineer every FCP filter and match the TS engine"
work (see docs/FILTER_RE.md + docs/FILTER_RE_PHASE2.md). Do NOT write scratch scripts
in /tmp for this — extend these instead (ROADMAP rule: everything in the repo).

- **extract_shader.py** — pull the verbatim embedded Metal fragment source
  (`Hgc<Name>_hgc_visible`) out of FCP's Filters Mach-O. `--list [substr]` enumerates
  all 246. This is the ground-truth per-pixel algorithm (Phase 1).
- **filter_usage.py** — map each implemented filter UUID -> the built-in transitions
  that use it (blast-radius check before a Phase-2 change).
- **filter_probe.py** — render ONE filter through the REAL headless FCP engine on
  image A (static params, t=0 where A fully covers) -> `filter(A)`. Uses the
  Blurs/Directional skeleton; keep the injected `<filter>` at factoryID="7".
- **filter_verify.py** — the Phase-2 fidelity check: runs filter_probe (headless FCP)
  AND engine/test/_filter_apply.ts (the registered TS filter) on the same input and
  reports mean|err| / PSNR. This is a legitimate check (headless IS FCP), distinct
  from the banned render-vs-render TS-*transition* scoring.

## ⚠️ The identity trap (read before trusting any probe number)
If the injected synthetic filter has a WRONG factoryID, or param names/ids that don't
match the real plugin's nested structure, the FCP host SILENTLY IGNORES it and renders
image A UNCHANGED. A TS-vs-headless compare then scores the TS filter against a bare
copy of the input — a meaningless number that has flipped at least one real decision
(the PAELevels gamma direction, 2026-07-11). Both tools now emit an `identity_warning`
/ stderr warning when the headless output is within JPEG noise of the input
(`headless_vs_input_mad < 1.5`). If you see it: the probe did NOT exercise the filter —
grep a real transition `.motr` that uses the plugin (e.g. `grep -rl <UUID>` under the
Transitions templates dir) to get the correct factoryID + param names/ids + nesting,
and remember `filter_probe` pins the injected filter to the skeleton's factoryID slot.
**When a synthetic probe can't be made to apply, fall back to the GUI GT** (`fct probe
<slug>`): it drives the real plumbing and is the one truth.


Run headless tools with the FCP frameworks on the path + venv python, e.g.:
  PYTHONPATH="$PWD" DYLD_FRAMEWORK_PATH="/Applications/Final Cut Pro.app/Contents/Frameworks" \
    venv/bin/python3 tools/re/filter_verify.py --spec '{"uuid":"...","pluginName":"...","params":[...]}'
(filter_verify sets DYLD/PYTHONPATH for its own headless subprocess automatically.)

The TS half is engine/test/_filter_apply.ts (reads FCT_FILTER_SPEC JSON: uuid,
pluginName, in, out, time, params[] with optional children[] for color groups).
