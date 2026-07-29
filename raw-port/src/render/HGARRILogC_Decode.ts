// raw-port/src/render/HGARRILogC_Decode.ts
//
// FCP `HGARRILogC::Decode` — nested Helium HGNode subclass. Inverse of
// HGARRILogC::Encode (see ./HGARRILogC_Encode.ts). Wraps an owned
// `HgcLogVideo_decode` compositor (upstream) feeding into an owned
// `HGColorMatrix` (downstream, ARRI Wide Gamut RGB → destination gamut).
// The compositor implements the ARRI ALEXA LogC inverse transfer
// function (LogC log-encoded video → linear scene-linear) for a
// specified Exposure Index (EI).
//
// SKELETON — bodies to be filled next. All entry points cite their
// @0xADDR and throw pending transcription.
//
// FRAMEWORK: Helium.framework
// FAT slice offset: 0x4000; thin binary /tmp/Helium.x86_64 has VA ==
// file offset (segment __TEXT vmaddr = 0).
//
// SYMBOLS:
//   @Helium 0x1027a0  HGARRILogC::Decode::Decode(SceneColorimetry, ei) [C2]  __ZN10HGARRILogC6DecodeC2ENS_16SceneColorimetryEj
//   @Helium 0x102a20  HGARRILogC::Decode::Decode(SceneColorimetry, ei) [C1 — tail-jmp to C2]  __ZN10HGARRILogC6DecodeC1ENS_16SceneColorimetryEj
//   @Helium 0x102a30  HGARRILogC::Decode::~Decode()  [D2]  __ZN10HGARRILogC6DecodeD2Ev
//   @Helium 0x102a80  HGARRILogC::Decode::~Decode()  [D1]  __ZN10HGARRILogC6DecodeD1Ev
//   @Helium 0x102ad0  HGARRILogC::Decode::~Decode()  [D0]  __ZN10HGARRILogC6DecodeD0Ev
//   @Helium 0x102b30  HGARRILogC::Decode::GetOutput(HGRenderer*)  __ZN10HGARRILogC6Decode9GetOutputEP10HGRenderer
//
// VTABLE (installed ptr = 0xa187c0, from ctor `leaq 0x915ffc(%rip)` @0x1027bd
//   ⇒ 0x1027c4 + 0x915ffc = 0xa187c0; reinstalled in all three dtors).

import { HGNode } from './HGNode.js';

export class HGARRILogCDecode extends HGNode {
  /** @Helium 0x1027a0 skeleton — body pending. */
  constructor(_colorimetry: number, _ei: number) {
    super();
    throw new Error("HGARRILogC::Decode::Decode @Helium 0x1027a0 not yet transcribed");
  }

  /** @Helium 0x102a30/0x102a80/0x102ad0 skeleton — body pending. */
  destruct(): void {
    throw new Error("HGARRILogC::Decode::~Decode @Helium 0x102a30 not yet transcribed");
  }

  /** @Helium 0x102b30 skeleton — body pending. */
  GetOutput(_renderer: unknown): HGNode {
    throw new Error("HGARRILogC::Decode::GetOutput @Helium 0x102b30 not yet transcribed");
  }
}
