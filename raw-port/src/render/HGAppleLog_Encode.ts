// raw-port/src/render/HGAppleLog_Encode.ts — SKELETON (see PORTING_SPEC rule 3).
// Full transcription follows in a subsequent commit; addresses cited to prove
// this file is grounded and traceable to the disassembly in
// raw-port/re/disasm/Helium.HGAppleLog.Encode.s and
// raw-port/re/disasm/Helium.HGAppleLog.Encode_GetOutput.s.
//
// FRAMEWORK: Helium.framework (thin x86_64 slice at /tmp/Helium.x86_64,
// VA == file offset — verified in HGACEScct_Encode.ts and reused here).
// FAT slice offset: 0x4000.
//
// Symbols in play:
//   @Helium 0x102f30  HGAppleLog::Encode::Encode(SceneColorimetry, LogColorimetry) [C2]
//   @Helium 0x103030  HGAppleLog::Encode::Encode(...)  [C1 — tail-jmp to C2]
//   @Helium 0x103040  HGAppleLog::Encode::~Encode()   [D2]
//   @Helium 0x103090  HGAppleLog::Encode::~Encode()   [D1]
//   @Helium 0x1030e0  HGAppleLog::Encode::~Encode()   [D0 — tail-jmp HGObject::operator delete]
//   @Helium 0x103140  HGAppleLog::Encode::GetOutput(HGRenderer*)
throw new Error("HGAppleLog::Encode skeleton @Helium 0x102f30 — full body pending in next commit");
