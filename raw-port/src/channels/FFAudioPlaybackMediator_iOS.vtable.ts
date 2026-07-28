// @vtable FFAudioPlaybackMediator_iOS (Flexo)
//
// DECODE: recovered by faithful transcription from
//   re/disasm/Flexo.FFAudioPlaybackMediator_iOS.ctor_dtors.s
// specifically the ctor at @0xe696e0:
//   0xe696ee  leaq  0xaaec3b(%rip), %rax
//   0xe696f5  movq  %rax, (%rdi)         ; store vptr
//
// Effective address at the `leaq`:
//   next_instr = 0xe696f5
//   0xe696f5 + 0xaaec3b = 0x1918330
//
// Per the Itanium C++ ABI, the value written into the vptr is `vtable_addr + 0x10`
// (skipping the offset-to-top and RTTI slots at 0x00 and 0x08). Therefore the
// vtable *object* begins at 0x1918320 in Flexo's __DATA section.
//
// Individual slot resolution (dtor slot 0, dtor slot 1, virtual methods…)
// is out of scope for this porting unit — none of the three ported functions
// dispatch through the vtable; they only *install* it.

/** @0x1918320 vtable object for FFAudioPlaybackMediator_iOS in Flexo __DATA;
 *  cited from ctor @0xe696ee (leaq 0xaaec3b(%rip) → effective 0x1918330 = base+0x10). */
export const FFAudioPlaybackMediator_iOS_VTABLE_ADDR = 0x1918320;
