// HgcDither_GPU.ts — Helium's `HgcDither_GPU` dither compute node (GPU/Metal path).
//
// Framework:  /Applications/Final Cut Pro.app/Contents/Frameworks/Helium.framework/
//             Versions/A/Helium   (x86_64 thin slice; VA == file offset)
//
// This file currently ports ONE method — the identity `GetOutput` override below. The rest of the
// class is listed here so the next worker has the map, and so `frontier.py` can see the gap; they
// are NOT stubbed here, because an un-ported method that no one has claimed is better represented
// by its absence than by a fake body.
//
// SYMBOLS (nm -arch x86_64 | c++filt) — note every one is nm class `t` (FILE-LOCAL, not exported),
// so they are reachable only by x86_64 vmaddr + image slide, never by dlsym:
//   0x307e30  t  HgcDither_GPU::GetProgram(HGRenderer*)
//   0x308250  t  HgcDither_GPU::BindTexture(HGHandler*, int)
//   0x308380  t  HgcDither_GPU::Bind(HGHandler*)
//   0x3083c0  t  HgcDither_GPU::GetDOD(HGRenderer*, int, HGRect)
//   0x3083f0  t  HgcDither_GPU::GetROI(HGRenderer*, int, HGRect)
//   0x3085e0  t  HgcDither_GPU::SetParameter(int, float, float, float, float)
//   0x3085f0  t  HgcDither_GPU::GetParameter(int, float*)
//   0x308600  t  HgcDither_GPU::GetOutput(HGRenderer*)                   <- ported below
//   0x308440  t  HgcDither_GPU::HgcDither_GPU()                          [C2]
//   0x3084b0  t  HgcDither_GPU::HgcDither_GPU()                          [C1]
//   0x308520  t  HgcDither_GPU::~HgcDither_GPU()                         [D2 base]
//   0x308560  t  HgcDither_GPU::~HgcDither_GPU()                         [D1 complete]
//   0x3085a0  t  HgcDither_GPU::~HgcDither_GPU()                         [D0 deleting]
//
// The CPU twin of this node is already ported in raw-port/src/render/HgcDither_CPU.ts, and its
// `GetOutput` @0x307620 is the same three-instruction identity — the two classes share the shape,
// not the address, so each is transcribed from its own disassembly.

import { HGNode } from "./HGNode.js";

/**
 * `HgcDither_GPU` — extends HGNode. No field layout is declared here: the ctors @0x308440 (C2) /
 * @0x3084b0 (C1) have not been transcribed yet, and inventing members ahead of that decode is
 * exactly the "magic offsets" anti-pattern PORTING_SPEC Rule 5 rejects. The subclass exists so the
 * ported method below can name the receiver type its C++ signature actually takes.
 */
export class HgcDither_GPU extends HGNode {}

/**
 * `HgcDither_GPU::GetOutput(HGRenderer*)` @Helium 0x308600.
 *
 * Verbatim disassembly (raw-port/re/disasm/Helium.__ZN13HgcDither_GPU9GetOutputEP10HGRenderer.s —
 * the whole function, 5 instructions plus alignment padding):
 *   0x308600  pushq  %rbp
 *   0x308601  movq   %rsp, %rbp
 *   0x308604  movq   %rdi, %rax        ; return value = %rdi = `this`
 *   0x308607  popq   %rbp
 *   0x308608  retq
 *   0x308609  nopl   (%rax)            ; alignment padding, not part of the body
 *
 * Identity pass: the node is its own output, and the `HGRenderer*` argument (%rsi) is never read
 * — no load, no compare, no branch. The frame push/pop is the only other work.
 *
 * ORACLE (differential against the live binary; the symbol is file-local so it is called at
 * x86_64 vmaddr 0x308600 + the loaded Helium image slide, under `arch -x86_64` because the port's
 * addresses are x86_64 offsets):
 *   this=0x1122334455667788 renderer=0x0                -> 0x1122334455667788   == this
 *   this=0x1                renderer=0xdeadbeef         -> 0x1                  == this
 *   this=0x7fffffffffff     renderer=0x1122334455667788 -> 0x7fffffffffff       == this
 *   this=0x0                renderer=0x99               -> 0x0                  == this
 * i.e. the return is the receiver for every probe, and varying the renderer argument (including a
 * garbage pointer) never changes it — confirming the argument really is ignored rather than
 * merely unread on the paths a reader happened to check.
 * @0x308600
 */
export function HgcDither_GPU_GetOutput(
  self: HgcDither_GPU,
  _renderer?: unknown,
): HgcDither_GPU {
  // @0x308604: movq %rdi, %rax
  return self;
}
