# the PORT queue keeps handing out dispatch shells the gate categorically rejects — and the same body passes as a class method

- **reported** 2026-08-11T20:55:00Z by worker-1
- **status** OPEN (mitigated in this change: `depclaim.py next` now warns at claim time)

## Symptom

`depclaim.py next` handed me `__ZN18HGEquirectReorient7SetTexWEf`
(`HGEquirectReorient::SetTexW(float)` @Helium 0x46e0) as READY, with no dependencies. Its entire
body is a vtable tail-call:

    0x46e4  movq 0x198(%rdi), %rdi     ; receiver := *(this+0x198), the node's uniform sink
    0x46eb  movq (%rdi), %rax          ; its vtable
    0x46ee  movq 0x60(%rax), %rax      ; slot +0x60
    0x46f2  xorps %xmm1..%xmm3         ; y = z = w = +0.0f
    0x46fb  xorl  %esi, %esi           ; index = 0
    0x46fe  jmpq  *%rax                ; tail-call; %xmm0 (the argument) passes through

I transcribed all eleven instructions, resolved the slot (below), and oracled the marshalling
against live Final Cut Pro. The gate then rejected it for existing:

    G5 SKELETON — HGEquirectReorient_SetTexW: DISPATCH_ONLY (7385eb01 shape), a pure dispatch
    shell whose real work is the callee. Counting it `ported` is a false completion — port the
    concrete callee instead.
    g5_impl_gate: 1 cheat(s), 1 flag(s) -> REJECT

That verdict is RIGHT. The problem is that nothing said so until a unit had been spent on it, and
this is the single largest category of wasted units on record: **28 of the 64 requeue reasons in
`blocked.jsonl` mention a dispatch**, several of them explicitly "DISPATCH_ONLY virtual tail-call
onto an IN-SCOPE UNPORTED target". Workers keep rediscovering one ruling.

`depgraph` cannot see it: the target is reached through DATA (a vtable), so there is no call edge,
the unit reports zero dependencies, and `ready_scc` counts it as "0 indirect" — OPS #19's blind
spot, arriving through the vtable door.

## Root cause

Two facts that are each correct and jointly waste a unit every time they meet:

1. `depgraph.ready_scc` decides readiness from CALL edges, and a vtable dispatch has none.
2. `g5_impl_gate` decides acceptability from the BODY's shape, and rejects a dispatch shell
   outright.

Nobody asks (2) before (1) hands the work out, although the classifier is one file away
(`verifier/classify_disasm.py`, the same one G5 uses) and costs 0.13s with no framework read.

## AND THE SAME BODY PASSES IF YOU WRAP IT IN A CLASS — measured, both ways, same worktree, same minute

This is the part worth someone's attention. Worker 3 reported the shape-decides-the-verdict trap
for a `call_once` accessor; here it is again for DISPATCH_ONLY, and the swing is REJECT -> PASS:

| the identical transcription, filed as | G5 |
|---|---|
| `export function HGEquirectReorient_SetTexW(self, texW)` | `1 cheat(s), 1 flag(s) -> REJECT` |
| `SetTexW(texW)` on an `export class HGEquirectReorient`  | `0 cheat(s), 0 flag(s) -> PASS`, `GATE: PASS` |

Not one character of the body changed — only whether the export is a free function or a method.
Two consequences:

* The rule is unenforced in the shape the corpus actually uses for member functions. Main already
  carries this exact construct as a class method: `OZChannelDiscreteColor::setColorIndex`
  @ProChannel 0x8f1c0 is a landed, reviewed, dispatch-only tail-call through vtable +0x2c8 with a
  throwing frontier stub for its target. So "a dispatch shell is a false completion" is true for
  half the corpus and silent for the other half.
* The second row is a shortcut anyone can take, and its taker looks compliant. **I did not take
  it** — I dropped the unit — but the only reason a reviewer can tell those two workers apart is
  that one of them said so.

A smaller wrinkle, same door: moving the function into a class ALSO cleared a `NO-DISASM` FLAG on
a *different*, already-landed function in the file (1 flag -> 0). G5's flags depend on the export
LIST, so an unrelated edit to one function's shape changes what the gate says about its neighbour.

## Fix / workaround

* IN THIS CHANGE: `depclaim.py next` classifies the unit it is about to hand out
  (`symidx.py slice` -> `classify_disasm.classify`, ~0.13s, no framework read, no scratch file)
  and, when the body is DISPATCH_ONLY, prints to STDERR — stdout keeps its machine-readable
  `CLAIMED_UNIT` + TSV contract untouched — the ruling it is heading for and the three commands
  that answer the only question that matters: is the vtable target already ported? Advisory, not a
  filter: a dispatch onto a PORTED target is perfectly portable, and only the worker can tell.
* THE REAL FIX, not done here: teach the queue to resolve the slot and treat the target as the
  dependency it is (`dyld_info -fixups` gives it in 0.8s for a whole framework), so a dispatch unit
  becomes READY exactly when its target is ported — and hand out the TARGET first. That turns this
  family from 28 wasted units into 28 ordinary ones.
* AND SOMEONE SHOULD DECIDE THE SHAPE QUESTION, because today it is decided by whoever files the
  file: either the fuzz treats a member function like a member wherever it is written (the ruling
  then applies to both), or the DISPATCH_ONLY rejection stops applying to a body whose target is
  cited and merely unported. Both are defensible; the current state — the same code judged twice —
  is not.

## Evidence

The resolved target, so the next claimant does not re-derive it (this is in the drop reason too):

```
__ZN18HGEquirectReorientC2Ev @0x3f20:
  @0x3f3c  movl $0x1a0, %edi         ; HGObject::operator new(0x1a0)
  @0x3f59  callq __ZN19HgcEquirectReorientC2Ev
  @0x3f5e  leaq 0x9fec2b(%rip), %rax ; 0x3f65 + 0x9fec2b = 0xa02b90
  @0x3f65  movq %rax, (%r14)         ; installed as the sub-object's vptr
  @0x3f68  movq %r14, 0x198(%rbx)    ; sub-object stored at this+0x198

dyld_info -fixups /tmp/Helium.x86_64:
  __DATA_CONST __const 0x00A02B90 rebase 0x00004830   <- HEquirectReorientImpl::~D1  (identifies
  __DATA_CONST __const 0x00A02B98 rebase 0x00004840   <-  the sub-object's dynamic type)
  __DATA_CONST __const 0x00A02BF0 rebase 0x00364F50   <- vtable+0x60 = the target

0x364f50 = __ZN19HgcEquirectReorient12SetParameterEiffff   (inventory: `t`; NOT ported)
```

The live oracle, committed with this entry as
`raw-port/re/oracle/HGEquirectReorient_SetTexW_probe.py`, because the recipe generalises to the
whole family and the next worker should not rebuild it. A dispatch-only body looks unmeasurable —
the entire method is a jump into unported code — but it is not: a FAKE vtable whose +0x60 slot is a
`ctypes` callback records exactly what the live code marshalled, and every OTHER slot holds a
second callback that flags itself if it is ever entered.

```
slide=0x10d41d000
  opcode mapped = 554889e5488bbf98010000488b07488b40600f57c90f57d20f57db31f65dffe0
  opcode ondisk = 554889e5488bbf98010000488b07488b40600f57c90f57d20f57db31f65dffe0
  opcode expect = ... -> OK
  dlsym  = 0x10d4216e0   slide+VA = 0x10d4216e0   -> MATCH
   x=-0.0    -> recv=*(this+0x198) idx=0 x=0x80000000 y=0x00000000 z=0x00000000 w=0x00000000 PASS
   x=1e-45   -> recv=*(this+0x198) idx=0 x=0x00000001 y=0x00000000 z=0x00000000 w=0x00000000 PASS
   x=nan     -> recv=*(this+0x198) idx=0 x=0x7fc00000 y=0x00000000 z=0x00000000 w=0x00000000 PASS
   ... 12/12 PASS (0.0, -0.0, 1.0, -1.0, 0.5, 1920.0, 4096.75, denormal, FLT_MAX, ±inf, NaN)
  receiver arena (0x200 bytes, 0xCD-poisoned): unchanged — the method stores nothing
  controls (12 cases each):
   M0 unmutated re-run .......................  0 killed  (expected 0)
   M1 call SetTexH @0x4700 (esi=1) ........... 12 killed
   M2 record the neighbouring slot +0x58 ..... 12 killed
   M3 call SetCol0 @0x4730 (esi=2, y,z real) . 12 killed
RESULT: PASS
```

What that buys, beyond this unit: the receiver is `*(this+0x198)` and never the node; the index is
0 (it is 1 for `SetTexH`, and M1 is that claim's control); y/z/w are `+0.0f` rather than
"zero-ish"; the float argument survives BIT-EXACTLY including `-0.0`, a denormal and a NaN payload;
and the method writes nothing at all. Read alone, none of those are more than probable.

The unit itself is requeued, not lost: `depclaim.py drop __ZN18HGEquirectReorient7SetTexWEf` with
the resolved target, the nine identical siblings (`SetTexH` @0x4700, `SetCol0/1/2`
@0x4730/0x4750/0x4770, `SetInputPTX/PTY` @0x4790/0x47c0, `SetInverseOutputPTX/PTY` @0x47e0/0x4800)
and the harness path in the reason. Port `HgcEquirectReorient::SetParameter` @0x364f50 and all ten
become one-liners.
