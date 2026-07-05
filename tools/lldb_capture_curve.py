"""
lldb driver: capture the EXACT bezier control polygons the real Motion engine
builds for each curve segment. This is how the curve interpolation was fully
reverse-engineered (see docs/DEBUGGING.md).

Run it with lldb (NOT plain python):
    lldb --batch -o "command script import tools/lldb_capture_curve.py"

It launches a probe (tools/curve_probe.py) that renders a few frames of a .motr
through the engine, breakpoints ProChannel's OZBezierFindParameter (time control
polygon) and OZBezierEval (value control polygon), and prints both per segment.

WHY address-based breakpoints: lldb cannot resolve ProChannel's C++ symbols by
name in the loaded image (they don't bind), and pending name breakpoints set
before launch never fire (the frameworks are dlopen'd late by python). So we:
  1. breakpoint our own shim symbol `oz_render_frame` (binds fine),
  2. continue until it hits => ProChannel is now loaded,
  3. compute slide = __TEXT load addr - file addr, and set breakpoints at
     file-offset + slide:  OZBezierEval=0x9ff00, OZBezierFindParameter=0xa0184
     (arm64 file offsets; re-check with `nm -arch arm64 ProChannel` if FCP updates).

arm64 ABI: first double arg in d0, first pointer arg in x0. Both bezier fns take
(const double* coeffs, double t) — x0=coeffs(4 doubles), d0=t.
"""
import lldb, os, struct

PROBE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "curve_probe.py")
FW = "/Applications/Final Cut Pro.app/Contents/Frameworks"
PY = os.path.expanduser("~/random/final-cut-pro-transitions/venv/bin/python3.14")
# arm64 file offsets in ProChannel (verify via nm if FCP version changes):
OFF_BEZIER_EVAL = 0x9ff00        # OZBezierEval(const double*, double)
OFF_FIND_PARAM  = 0xa0184        # OZBezierFindParameter(const double*, double)

def run():
    dbg = lldb.SBDebugger.Create(); dbg.SetAsync(False)
    t = dbg.CreateTarget(PY)
    t.BreakpointCreateByName("oz_render_frame")
    li = lldb.SBLaunchInfo([PROBE])
    li.SetEnvironmentEntries([f"DYLD_FRAMEWORK_PATH={FW}"], True)
    err = lldb.SBError()
    p = t.Launch(li, err)
    if err.Fail():
        print("launch failed:", err.GetCString()); return
    # The breakpoint on our shim binds once oz_render.dylib is loaded; the single
    # Continue runs the probe up to the first oz_render_frame call, by which point
    # Ozone + ProChannel are loaded. (Launch stops at the dyld entry first.)
    p.Continue()
    if p.GetState() != lldb.eStateStopped:
        print("process exited before hitting oz_render_frame (state=%d); "
              "check that oz_render.dylib built and the probe renders." % p.GetState())
        return
    pc = next((m for m in t.module_iter()
               if m.GetFileSpec().GetFilename() == "ProChannel"), None)
    if pc is None:
        print("ProChannel not loaded"); p.Kill(); return
    slide = None
    for i in range(pc.GetNumSections()):
        s = pc.GetSectionAtIndex(i)
        if s.GetName() == "__TEXT":
            slide = s.GetLoadAddress(t) - s.GetFileAddress(); break
    be = OFF_BEZIER_EVAL + slide
    bf = OFF_FIND_PARAM + slide
    t.BreakpointCreateByAddress(be)
    t.BreakpointCreateByAddress(bf)

    def rd(addr, n):
        e = lldb.SBError(); d = p.ReadMemory(addr, n, e)
        return struct.unpack(f"<{n//8}d", d) if e.Success() else None

    hits = 0
    p.Continue()
    while p.GetState() == lldb.eStateStopped and hits < 200:
        fr = p.GetSelectedThread().GetFrameAtIndex(0)
        pcv = fr.GetPC()
        x0 = fr.FindRegister("x0").GetValueAsUnsigned()
        d0 = float(fr.FindRegister("d0").GetValue())
        arr = rd(x0, 0x20)
        if abs(pcv - bf) < 4:
            print(f"TIME poly={[round(x,4) for x in arr] if arr else None} target={d0:.5f}")
            hits += 1
        elif abs(pcv - be) < 4:
            print(f"VAL  poly={[round(x,3) for x in arr] if arr else None} u={d0:.5f}")
            hits += 1
        p.Continue()
    print(f"captured {hits} bezier evals")
    if p.GetState() == lldb.eStateStopped:
        p.Kill()

run()
