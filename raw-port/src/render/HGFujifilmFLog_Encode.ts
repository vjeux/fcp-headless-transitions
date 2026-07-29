// raw-port/src/render/HGFujifilmFLog_Encode.ts
//
// FCP `HGFujifilmFLog::Encode` — nested Helium HGNode subclass. Wraps an
// owned `HgcLogVideo_encode` compositor (and optionally an HGColorMatrix
// converter for the sRGB/Rec709 input path) and configures the compositor,
// via two SetParameter calls, to implement the Fujifilm F-Log forward
// transfer function (scene-linear light → F-Log encoded video). The `Encode`
// nested-class facade pattern matches HGACEScct::Encode — see
// raw-port/src/render/HGACEScct_Encode.ts for the structural template.
//
// FRAMEWORK: Helium.framework
// FAT slice offset: 0x4000; thin binary /tmp/Helium.x86_64 has VA == file
// offset (segment __TEXT vmaddr = 0). Constants read via
// `raw-port/army/tools/resolve.py Helium const 0x…`.
//
// SKELETON — full ctor/dtor/GetOutput bodies below.
//
// @Helium 0x103ec0  HGFujifilmFLog::Encode::Encode(SceneColorimetry, LogEncoding)  [C2]
// @Helium 0x103f90  HGFujifilmFLog::Encode::Encode(SceneColorimetry, LogEncoding)  [C1 tail-jmp to C2]
// @Helium 0x103fa0  HGFujifilmFLog::Encode::~Encode()                              [D2]
// @Helium 0x103ff0  HGFujifilmFLog::Encode::~Encode()                              [D1]
// @Helium 0x104040  HGFujifilmFLog::Encode::~Encode()                              [D0 deleting]
// @Helium 0x1040a0  HGFujifilmFLog::Encode::GetOutput(HGRenderer*)

import { HGNode } from './HGNode.js';

/**
 * `HGFujifilmFLog::Encode` — skeleton stub. Ctor + GetOutput are fleshed
 * out incrementally below (this file is committed early so wt_merge can
 * begin queuing, then the bodies are filled in from disasm).
 *
 * @Helium 0x103ec0 ctor / 0x103fa0 dtors / 0x1040a0 GetOutput
 */
export class HGFujifilmFLogEncode extends HGNode {
  constructor() {
    super();
    // @Helium 0x103ec0 not yet transcribed — skeleton commit.
    throw new Error(
      "HGFujifilmFLog::Encode::Encode @Helium 0x103ec0 not yet transcribed"
    );
  }
}
