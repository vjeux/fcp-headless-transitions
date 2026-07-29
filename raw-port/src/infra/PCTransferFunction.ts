// PCTransferFunction.ts — ProCore transfer-function name lookup.
//
// This file ports one FREE FUNCTION (not a member of any class):
//
//   PCGetTransferFunctionString(PCTransferFunctionValue value) -> CFStringRef
//
// It maps a `PCTransferFunctionValue` enum (u32) to the corresponding
// CoreVideo `kCVImageBufferTransferFunction_*` CFStringRef constant, or
// returns `null` for values outside the mapped set. The function is used
// throughout ProCore to attach a transfer-function tag to CVImageBuffers.
//
// FRAMEWORK: ProCore.framework (Final Cut Pro).
// DECODE: raw-port/re/disasm/ProCore.__Z27PCGetTransferFunctionString23PCTransferFunctionValue.s
//
// -----------------------------------------------------------------------------
// SYMBOL PORTED
// -----------------------------------------------------------------------------
//   __Z27PCGetTransferFunctionString23PCTransferFunctionValue @0xc1736
//     — PCGetTransferFunctionString(PCTransferFunctionValue)
//
// -----------------------------------------------------------------------------
// DISASM SHAPE (jump-table switch)
// -----------------------------------------------------------------------------
// The compiler emitted a compact jump-table:
//   @0xc173a  xorl %eax, %eax           ; rax = null (the default return)
//   @0xc173c  decl %edi                 ; edi = value - 1   (make it 0-based)
//   @0xc173e  cmpl $0x11, %edi          ; if (unsigned) edi > 17 …
//   @0xc1741  ja   0xc17a5              ;   … jump straight to the return (null)
//   @0xc1743  leaq 0x5e(%rip), %rcx     ; rcx = &jumpTable[0]   (base @0xc17a8)
//   @0xc174a  movslq (%rcx,%rdi,4), %rdx; rdx = jumpTable[edi]  (signed i32 offset)
//   @0xc174e  addq  %rcx, %rdx          ; rdx = base + offset  (case target)
//   @0xc1751  jmpq  *%rdx               ; goto case-body
//
// Each case-body loads one `_kCVImageBufferTransferFunction_*` extern
// (a `CFStringRef *` published by CoreVideo) into %rax, then jumps to
// @0xc17a2 which dereferences the pointer (`movq (%rax), %rax`) to
// produce the CFStringRef value.
//
// The 18-entry (17 valid + one because value==0 becomes edi==-1 which
// is > 17 as unsigned so also falls through to null) jump table was
// read from the ProCore binary at the address `leaq` resolves to
// (@0xc17a8) — the FILE offset in the x86_64 slice equals the VA
// because __TEXT is loaded at VA 0. The entries decode to (case 1-based):
//
//   case  1  -> @0xc1753  _kCVImageBufferTransferFunction_ITU_R_709_2
//   case  2  -> @0xc176e  _kCVImageBufferTransferFunction_UseGamma
//   cases 3-6 -> @0xc17a5  (return null)
//   case  7  -> @0xc175c  _kCVImageBufferTransferFunction_SMPTE_240M_1995
//   case  8  -> @0xc1789  _kCVImageBufferTransferFunction_Linear
//   cases 9-12 -> @0xc17a5 (return null)
//   case 13  -> @0xc1792  _kCVImageBufferTransferFunction_sRGB
//   case 14  -> @0xc1765  _kCVImageBufferTransferFunction_ITU_R_2020
//   case 15  -> @0xc17a5  (return null)
//   case 16  -> @0xc1777  _kCVImageBufferTransferFunction_SMPTE_ST_2084_PQ
//   case 17  -> @0xc1780  _kCVImageBufferTransferFunction_SMPTE_ST_428_1
//   case 18  -> @0xc179b  _kCVImageBufferTransferFunction_ITU_R_2100_HLG
//
// -----------------------------------------------------------------------------
// FRONTIER CALLEES / EXTERNS
// -----------------------------------------------------------------------------
// No in-scope FCP callees. Every non-null branch reads one CoreVideo
// literal-pool symbol at a RIP-relative address:
//
//   _kCVImageBufferTransferFunction_ITU_R_709_2       (CoreVideo, extern)
//   _kCVImageBufferTransferFunction_UseGamma          (CoreVideo, extern)
//   _kCVImageBufferTransferFunction_SMPTE_240M_1995   (CoreVideo, extern)
//   _kCVImageBufferTransferFunction_Linear            (CoreVideo, extern)
//   _kCVImageBufferTransferFunction_sRGB              (CoreVideo, extern)
//   _kCVImageBufferTransferFunction_ITU_R_2020        (CoreVideo, extern)
//   _kCVImageBufferTransferFunction_SMPTE_ST_2084_PQ  (CoreVideo, extern)
//   _kCVImageBufferTransferFunction_SMPTE_ST_428_1    (CoreVideo, extern)
//   _kCVImageBufferTransferFunction_ITU_R_2100_HLG    (CoreVideo, extern)
//
// These are TRUE out-of-scope externs (CoreVideo.framework). CoreVideo
// publishes them as `CFStringRef *` symbols; the machine dereferences
// (`movq (%rax), %rax` @0xc17a2) to fetch the CFString value. In TS
// we have no CoreVideo binding to import from; per the porting spec
// (PORTING_SPEC.md Rule 3, DEP-WORKER brief) they are modelled as
// boundary stubs that return the extern's C symbol NAME as a plain
// string. Callers of this function within the port compare / attach
// this identifier symbolically; the mapping back to an actual CFString
// happens at the JS/native bridge (out of scope here).
//
// -----------------------------------------------------------------------------
// FULL DISASM  (raw-port/re/disasm/ProCore.__Z27PCGetTransferFunctionString23PCTransferFunctionValue.s)
// -----------------------------------------------------------------------------
//   0xc1736  pushq  %rbp
//   0xc1737  movq   %rsp, %rbp
//   0xc173a  xorl   %eax, %eax                 ; rax = 0 (null CFStringRef)
//   0xc173c  decl   %edi                       ; edi = value - 1
//   0xc173e  cmpl   $0x11, %edi                ; edi <=> 17
//   0xc1741  ja     0xc17a5                    ; unsigned above -> default (null)
//   0xc1743  leaq   0x5e(%rip), %rcx           ; rcx = &jumpTable@0xc17a8
//   0xc174a  movslq (%rcx,%rdi,4), %rdx        ; rdx = table[edi]
//   0xc174e  addq   %rcx, %rdx                 ; rdx = base + table[edi]
//   0xc1751  jmpq   *%rdx                      ; jump to case body
//   ... case bodies at 0xc1753/0x175c/0x1765/0x176e/0x1777/0x1780/0x1789/0x1792/0x179b ...
//   0xc17a2  movq   (%rax), %rax               ; rax = *rax (deref extern ptr)
//   0xc17a5  popq   %rbp                       ; common epilogue (rax already null)
//   0xc17a6  retq
//
// The `ja` at 0xc1741 uses unsigned comparison (CF-based). Because
// `decl` on `value == 0` produces edi = 0xFFFFFFFF (== unsigned 2^32-1),
// value=0 also falls through to the null return. So the mapped domain
// is exactly the enum values 1..18 above.

/**
 * PCTransferFunctionValue — the ProCore transfer-function enum. The u32
 * argument to `PCGetTransferFunctionString`; only the values enumerated
 * in the jump table (1, 2, 7, 8, 13, 14, 16, 17, 18) map to a non-null
 * CFStringRef. Values 0 and 3–6, 9–12, 15 (and everything above 18)
 * return `null` (the `xorl %eax, %eax` default @0xc173a).
 *
 * The enum's NAMED symbols are not yet decoded from ProCore's public
 * headers; we keep the value as a plain `number` here so the caller
 * passes exactly the u32 the disasm expects.
 */
export type PCTransferFunctionValue = number;

/**
 * Symbolic marker for a CoreVideo `kCVImageBufferTransferFunction_*`
 * CFStringRef. The real thing is a `CFStringRef` from CoreVideo (out of
 * scope). In TS we return the C symbol NAME so callers can route it
 * through the JS/native bridge that owns the actual CoreVideo binding.
 * Returning `null` matches the `xorl %eax, %eax` default @0xc173a.
 */
export type CVTransferFunctionCFString = string;

/**
 * `PCGetTransferFunctionString(PCTransferFunctionValue value)`
 * @ProCore 0xc1736 (__Z27PCGetTransferFunctionString23PCTransferFunctionValue).
 *
 * Maps a PC transfer-function enum value to the corresponding CoreVideo
 * `kCVImageBufferTransferFunction_*` CFStringRef constant. Returns
 * `null` for values outside the mapped set (see the enum-value table in
 * the file header).
 *
 * TRANSCRIPTION NOTES
 * -------------------
 * The machine is a `decl`+`cmpl $0x11`+`ja`+`jmpq *table` compact-switch;
 * we mirror it as a plain JS switch on `value` (1-based, matching the
 * ABI the machine sees). Every case cites the address of both the
 * jump-table entry that leads to it and the `movq LIT(%rip), %rax`
 * that loads the CoreVideo extern's pointer.
 *
 * The default arm (`xorl %eax, %eax` @0xc173a followed by all paths
 * that eventually reach @0xc17a5) becomes `return null`. The extern
 * dereference `movq (%rax), %rax` @0xc17a2 is modelled implicitly by
 * returning the resolved CFStringRef *value* — a plain string. Because
 * the `movq (%rax), %rax` is only executed on the non-null arms, the
 * null-default path (any unmapped case) skips it and returns null.
 */
export function PCGetTransferFunctionString(
  value: PCTransferFunctionValue,
): CVTransferFunctionCFString | null {
  // ------------------------------------------------------------
  // @0xc173a — xorl %eax,%eax  (default = null CFStringRef)
  // @0xc173c — decl %edi        (make edi 0-based)
  // @0xc173e..0xc1741 — cmpl $0x11, %edi ; ja default
  //   (unsigned compare — so value==0 which underflows to -1 also
  //    routes to the default arm; matches the disasm exactly.)
  // ------------------------------------------------------------
  // Force 32-bit unsigned semantics on the argument so JS `-1` and
  // oversized values behave the same as the machine's u32 view.
  const v = (value >>> 0) - 1; // @0xc173c decl %edi
  if (v > 0x11) return null;   // @0xc173e..0xc1741 unsigned > 17

  // ------------------------------------------------------------
  // @0xc1743..0xc1751 — leaq/movslq/addq/jmpq indirect through
  // the 18-entry compact jump table @0xc17a8. Each mapped case
  // loads a CoreVideo extern pointer and derefs it @0xc17a2.
  // Cases 3-6, 9-12, 15 all point back to the null epilogue @0xc17a5.
  // ------------------------------------------------------------
  switch (v + 1) {
    case 1:
      // @0xc1753  movq 0x861be(%rip), %rax → _kCVImageBufferTransferFunction_ITU_R_709_2
      // @0xc17a2  movq (%rax), %rax        (extern deref)
      return _cvTransferFunctionExtern("kCVImageBufferTransferFunction_ITU_R_709_2");
    case 2:
      // @0xc176e  movq 0x861cb(%rip), %rax → _kCVImageBufferTransferFunction_UseGamma
      return _cvTransferFunctionExtern("kCVImageBufferTransferFunction_UseGamma");
    case 7:
      // @0xc175c  movq 0x861c5(%rip), %rax → _kCVImageBufferTransferFunction_SMPTE_240M_1995
      return _cvTransferFunctionExtern("kCVImageBufferTransferFunction_SMPTE_240M_1995");
    case 8:
      // @0xc1789  movq 0x86190(%rip), %rax → _kCVImageBufferTransferFunction_Linear
      return _cvTransferFunctionExtern("kCVImageBufferTransferFunction_Linear");
    case 13:
      // @0xc1792  movq 0x861af(%rip), %rax → _kCVImageBufferTransferFunction_sRGB
      return _cvTransferFunctionExtern("kCVImageBufferTransferFunction_sRGB");
    case 14:
      // @0xc1765  movq 0x8619c(%rip), %rax → _kCVImageBufferTransferFunction_ITU_R_2020
      return _cvTransferFunctionExtern("kCVImageBufferTransferFunction_ITU_R_2020");
    case 16:
      // @0xc1777  movq 0x861b2(%rip), %rax → _kCVImageBufferTransferFunction_SMPTE_ST_2084_PQ
      return _cvTransferFunctionExtern("kCVImageBufferTransferFunction_SMPTE_ST_2084_PQ");
    case 17:
      // @0xc1780  movq 0x861b1(%rip), %rax → _kCVImageBufferTransferFunction_SMPTE_ST_428_1
      return _cvTransferFunctionExtern("kCVImageBufferTransferFunction_SMPTE_ST_428_1");
    case 18:
      // @0xc179b  movq 0x8616e(%rip), %rax → _kCVImageBufferTransferFunction_ITU_R_2100_HLG
      return _cvTransferFunctionExtern("kCVImageBufferTransferFunction_ITU_R_2100_HLG");
    // Cases 3, 4, 5, 6, 9, 10, 11, 12, 15 — jump-table entries route
    // straight to @0xc17a5 (the shared null epilogue). The `default:`
    // below models that branch in one clause.
    default:
      // @0xc17a5  popq %rbp; retq  with rax still null from @0xc173a.
      return null;
  }
}

// ============================================================================
// CoreVideo EXTERN BOUNDARY
// ============================================================================
// The `_kCVImageBufferTransferFunction_*` symbols live in CoreVideo.framework
// and are declared as `const CFStringRef * const` — CoreVideo initializes them
// at first-load time with actual CFString values. Inside the FCP binary these
// are literal-pool entries loaded through the RIP-relative `movq LIT(%rip)`
// pattern, then dereferenced (`movq (%rax), %rax`) to produce the CFStringRef.
//
// We CANNOT call CoreVideo from a headless TS port — CoreVideo is TRUE out
// of scope per the 5-framework port charter. Instead we return the extern's
// C symbol NAME as a plain string so any caller can route the value through
// its JS/native bridge. This preserves identity (a caller doing "did this
// come from `ITU_R_709_2`?" gets `str === "kCVImageBufferTransferFunction_ITU_R_709_2"`)
// without pretending we have CoreVideo linkage.

/**
 * Boundary stub for a CoreVideo `_kCVImageBufferTransferFunction_*`
 * literal-pool load. Modelled address citations live at each call site
 * inside `PCGetTransferFunctionString` above. This function is not a
 * ported FCP method — CoreVideo externs are out of scope — it exists
 * only to keep the callers honest about where each string comes from.
 */
function _cvTransferFunctionExtern(cSymbolName: string): CVTransferFunctionCFString {
  // @CoreVideo (extern) — see file header. Returns the symbol name; the
  // caller is responsible for wiring it to a real CFString at the JS
  // ↔ native bridge (out of scope here).
  return cSymbolName;
}
