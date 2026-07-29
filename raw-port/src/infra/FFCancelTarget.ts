// FFCancelTarget.ts — a one-shot cancellation flag (ObjC class).
// Faithfully transcribed from the FCP Flexo framework binary at
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Flexo.framework/Versions/A/Flexo
//
// Source disassembly saved at:
//   raw-port/re/disasm/Flexo.FFCancelTarget.canceled.s
//   raw-port/re/disasm/Flexo.FFCancelTarget.signal.s
//
// nm -n Flexo (x86_64) confirms the two symbols:
//   000000000077b170 t -[FFCancelTarget canceled]
//   000000000077b180 t -[FFCancelTarget signal:]
//
// The class has ONE ivar (from __objc_ivar):
//   _OBJC_IVAR_$_FFCancelTarget._canceled  at ivar-offset 0x8  (BOOL / signed char)
//
// STRUCT LAYOUT (recovered from __objc_ivar table + method disasm):
//   +0x00  isa (Objective-C class ptr)               // standard ObjC object header
//   +0x08  int8_t _canceled                          // read by -canceled (movsbl 0x8(%rdi))
//                                                    // written by -signal: (movb $0x1, 0x8(%rdi))
//
// SEMANTICS (from the two methods that exist):
//   -canceled  @0x000000000077b170  returns the signed byte at +0x8 as an int
//     (movsbl = sign-extend byte to 32-bit, matching a BOOL return that the runtime
//      widens; callers use `if ([target canceled]) ...`).
//   -signal:   @0x000000000077b180  sets the byte at +0x8 to 1. The `id sender`
//     argument (%rdx at the ObjC ABI) is IGNORED — the method is a plain flip.
//
// There is no init/dealloc/retain override in the binary — the flag is zero-init'd
// by the ObjC runtime's default +alloc (memory is calloc'd), so a freshly created
// FFCancelTarget starts uncancelled (_canceled == 0) with no explicit ctor call.
//
// Design note: this is a monotonic cancellation token — once -signal: is called
// (from any thread), any subsequent observer of -canceled sees a non-zero value.
// No memory-barrier/atomic intrinsic is used in the disasm; the store is a plain
// byte write, and byte reads/writes on x86 are naturally atomic at the CPU level.
// (Callers that want an ordered read use OSMemoryBarrier / dispatch semantics
// AROUND the object; the object itself does not.)

/**
 * Objective-C class `FFCancelTarget` — a monotonic cancellation flag.
 *
 * Sole ivar: `_canceled` (int8) at +0x8.
 *
 * @see raw-port/re/disasm/Flexo.FFCancelTarget.canceled.s
 * @see raw-port/re/disasm/Flexo.FFCancelTarget.signal.s
 */
export class FFCancelTarget {
  /**
   * Ivar `_canceled` @ offset +0x8 (int8_t; signed char in ObjC).
   *
   * Zero on construction (default +alloc gives calloc'd memory). Flipped to 1
   * exactly once, permanently, when -signal: is invoked.
   *
   * @see @Flexo 0x000000000077b180  -[FFCancelTarget signal:]
   */
  private _canceled: number = 0;

  /**
   * -[FFCancelTarget canceled]
   *
   * Disasm at @Flexo 0x000000000077b170:
   *   pushq %rbp
   *   movq  %rsp, %rbp
   *   movsbl 0x8(%rdi), %eax     ; load int8 at ivar +0x8, sign-extend to 32-bit
   *   popq  %rbp
   *   retq
   *
   * Returns the current value of the `_canceled` byte, sign-extended to int32.
   * In practice this is 0 (not cancelled) or 1 (cancelled) since the only
   * writer is -signal:, which stores exactly $0x1.
   *
   * @returns int32 — the sign-extended value of the `_canceled` int8 ivar
   */
  canceled(): number {
    // movsbl 0x8(%rdi), %eax — sign-extend int8 to int32.
    // Our TS field is stored as a JS number already in the int8 range {0,1},
    // and JS bitwise ops treat integer values <128 identically to their
    // sign-extended int32 form, so returning the value directly reproduces
    // the movsbl result bit-for-bit.
    return this._canceled | 0;
  }

  /**
   * -[FFCancelTarget signal:]
   *
   * Disasm at @Flexo 0x000000000077b180:
   *   pushq %rbp
   *   movq  %rsp, %rbp
   *   movb  $0x1, 0x8(%rdi)      ; store constant 1 into ivar +0x8
   *   popq  %rbp
   *   retq
   *
   * Unconditionally sets `_canceled` to 1. The ObjC `sender` parameter
   * (which would be in %rdx at the ABI level) is entirely UNUSED by the
   * method body — the binary never touches %rdx. We accept it here for
   * API shape parity but do not read it.
   *
   * @param _sender the ObjC sender id — deliberately ignored (see disasm)
   */
  signal(_sender: unknown = null): void {
    // movb $0x1, 0x8(%rdi) — write literal 1 into the _canceled byte.
    this._canceled = 1;
  }
}
