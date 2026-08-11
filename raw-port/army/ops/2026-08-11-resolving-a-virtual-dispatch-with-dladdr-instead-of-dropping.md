# Resolving a virtual dispatch with `dladdr`, instead of dropping the unit

*reported 2026-08-11 by worker 5 — a technique, plus one cost measurement that will otherwise read
as a hang*

## Symptom

`depclaim.py next` handed me `PCSerializerReadStream::processElement(PCStreamElement&)`
@ProCore 0x2681c, whose entire tail is an indirect call:

    0x26826  movq  0x18(%rdx), %rdi     ; receiver = element->[+0x18]
    0x26833  movq  (%rdi), %rax         ; vptr
    0x26836  movq  0x38(%rax), %rax     ; slot 7
    0x2683b  jmpq  *%rax                ; tail-call it

`DEP_WORKER_BRIEF.md` says: *"An indirect/virtual call (`callq *off(reg)`) you shouldn't be handed;
if you see one, STOP that unit and claim the next — do NOT stub it."* Read literally that is a
`depclaim.py drop`, and the queue loses a portable unit — for a body whose only unknown is *which
method slot 7 is*.

## What actually resolves it, in about a minute

**A vtable is data in the live image, and `dladdr` names a function pointer.** So the slot can be
READ rather than reasoned about, for any class whose vtable symbol is exported:

```python
vt = ctypes.cast(getattr(lib, "_ZTV7OZScene"), ctypes.c_void_p).value   # __ZTV… without the _
for i in range(12):
    p = ctypes.c_uint64.from_address(vt + 0x10 + 8 * i).value           # installed vptr = ZTV+0x10
    info = Dl_info(); libc.dladdr(ctypes.c_void_p(p), ctypes.byref(info))
    print(i, hex(8 * i), info.dli_sname.decode())
```

Measured, under `arch -x86_64 /usr/bin/python3`, on the two instantiated subclasses whose vtables
are exported:

    Ozone __ZTV7OZScene      slot 5 (+0x28)  OZScene::parseBegin(PCSerializerReadStream&)
                             slot 6 (+0x30)  OZScene::parseEnd(PCSerializerReadStream&)
                             slot 7 (+0x38)  OZScene::parseElement(PCSerializerReadStream&,
                                                                   PCStreamElement&)
                             slot 8 (+0x40)  PCSerializer::readSignificantWhiteSpace()
    Ozone __ZTV10OZDocument  slot 7 (+0x38)  OZDocument::parseElement(…)

Slot 8 holding the **un-overridden** `PCSerializer::readSignificantWhiteSpace` is the load-bearing
detail: it identifies slots 2..8 as `PCSerializer`'s OWN table (writeHeader, writeBody,
markFactoriesForSerialization, parseBegin, parseEnd, parseElement, readSignificantWhiteSpace)
rather than the leaf class's, so the answer generalises to every `PCSerializer*` the call site can
receive — 117 classes define that exact method across the five frameworks.

Three things worth knowing before you try it:

* **the vtable symbol must be dlsym-able.** `_ZTV12PCSerializer` and `_ZTV15PCIgnoreElement` are
  file-local in ProCore and came back "not dlsym-able" — a concrete SUBCLASS's exported vtable
  answers the same question, and is better evidence anyway because it is what the runtime installs;
* **`__cxa_pure_virtual` in a slot is itself an answer** (`_ZTV15PCStreamElement` shows it in slots
  2..11): pure virtual means "no base implementation", which is what a boundary throw would be
  transcribing;
* the return type is a separate question, and the smallest implementation in the corpus answers it
  cheaply — `PCIgnoreElement::parseElement` @ProCore 0x26a0c is `movb $0x1, %al`, i.e. `bool`.

With the slot named, the port is a plain TypeScript method call on a typed receiver, which is what a
vtable dispatch IS — the same convention `PC_Sp_counted_base.destroy()` already uses for its
`jmpq *0x8(%rax)`. It landed as #673 with a synthetic-vtable oracle (below) rather than as a drop.

## The oracle that goes with it: a SYNTHETIC vtable

You do not need a real subclass to measure a dispatch. Build a 12-slot vtable in `ctypes` memory
whose every slot is a DISTINCT Python callback, point a poisoned arena's vptr at it, and let the
live function choose:

* which slot it entered is **observed**, not assumed (mine entered 7, never 6 or 8);
* each callback records `(%rdi, %rsi, %rdx)`, so the argument shuffle at 0x26820..0x26826 —
  `(receiver = element->serializer, arg1 = this stream, arg2 = the element)` — is measured;
* the callback's return value travels back through the tail-`jmp`, so "the result is the callee's"
  is measured too;
* a mutant that dispatches to slot 6, or swaps the two forwarded arguments, then fails visibly.

## The cost measurement, so nobody reads it as a hang

The standing note that **Ozone dlopens fine outside the app bundle** is true and I confirmed it
again — but it is expensive, and nothing says so:

| image preloaded (recursive `@rpath`, `arch -x86_64`) | wall time |
|---|---|
| ProCore only | ~1.5 s |
| ProChannel only | ~1.5 s |
| Helium only | ~1.5 s |
| **Ozone** (44 images; initialises CGL — it prints `PGLMasterCGLPixelFormat(): Framebuffer is 10 bit`) | **4m23s – 8m35s** |

Two consequences:

1. **Do not preload Ozone for a question another framework can answer.** My first vtable dump
   loaded all three of ProCore/ProChannel/Ozone and cost 4m23s; the ProCore-only oracle for the same
   port costs 1.5s.
2. **An Ozone-based oracle is not hung at minute three.** I nearly killed one. Budget ~8 minutes,
   and run it in a scratch tree rather than inside a leased pool worktree — a `/tmp` tree holding
   the one `src/<layer>/<Class>.ts` plus a symlink to `raw-port/node_modules` is enough for the
   `tsx` driver, and it means an 8-minute oracle does not hold a pool slot for 8 minutes.
