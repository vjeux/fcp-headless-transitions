// raw-port/src/render/HGARRILogC_Encode.ts
//
// FCP `HGARRILogC::Encode` — nested Helium HGNode subclass. Wraps an
// owned HGColorMatrix (source-gamut → ARRI Wide Gamut RGB) followed by
// an owned HgcLogVideo_encode compositor configured for the ARRI LogC
// forward transfer function at a specified Exposure Index. Structural
// twin of HGACEScct::Encode (raw-port/src/render/HGACEScct_Encode.ts)
// but with an extra matrix stage in front of the segmented log shader.
//
// SKELETON commit — full body follows.
//
// @Helium 0x1023f0 HGARRILogC::Encode::Encode(HGARRILogC::SceneColorimetry, unsigned int)  [C2]
// @Helium 0x1025c0 HGARRILogC::Encode::Encode(HGARRILogC::SceneColorimetry, unsigned int)  [C1]
// @Helium 0x1025d0 HGARRILogC::Encode::~Encode()  [D2]
// @Helium 0x102620 HGARRILogC::Encode::~Encode()  [D1]
// @Helium 0x102670 HGARRILogC::Encode::~Encode()  [D0]
// @Helium 0x1026d0 HGARRILogC::Encode::GetOutput(HGRenderer*)

/** @Helium 0x1023f0 — TODO transcribe skeleton */
export class HGARRILogCEncode {}
