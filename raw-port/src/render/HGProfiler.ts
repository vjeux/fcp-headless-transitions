// HGProfiler — assembled from method-chunks by assemble_class.py (anti-shortcut chunking).
// Framework: Helium. 8 methods across 1 chunks of 20.
// Chunks landed: [0] / [0].
// This file only UNIONS chunk exports; each method body lives in its <Class>.m<k>.ts.
//
// Provenance (aggregator is a pass-through; real decode lives in the .m0.ts chunk):
//   _tb_init      @Helium 0x1c3c50  — raw-port/re/disasm/Helium.HGProfiler._tb_init.s
//   C2 ctor       @Helium 0x1c3ca0  ; C1 ctor @Helium 0x1c3d20 — raw-port/re/disasm/Helium.HGProfiler.HGProfiler.s
//   init          @Helium 0x1c3d10  — raw-port/re/disasm/Helium.HGProfiler.init.s
//   start         @Helium 0x1c3d90  — raw-port/re/disasm/Helium.HGProfiler.start.s
//   stop          @Helium 0x1c3db0  — raw-port/re/disasm/Helium.HGProfiler.stop.s
//   getTime       @Helium 0x1c3dd0  — raw-port/re/disasm/Helium.HGProfiler.getTime.s
//   getTimeSec    @Helium 0x1c3e20  — raw-port/re/disasm/Helium.HGProfiler.getTimeSec.s
// Class statics: _first (u8), _tbfreq (f32), s_tbinfo @Helium 0xade3b0 (mach_timebase_info_data_t).
// RIP constants: K1=1e-6 @Helium 0x85ab20, K2=0.001 @Helium 0x85ee90.

import { HGProfiler_m0_methods } from "./HGProfiler.m0";

export const HGProfiler_methods = {
  ...HGProfiler_m0_methods
};
