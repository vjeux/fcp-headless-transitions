// copyCropValues.ts — the file-local (static) free function
//   `copyCropValues(__CVBuffer*, unsigned int, float*)`  (__ZL14copyCropValuesP10__CVBufferjPf)
// faithfully transcribed from the FCP Flexo framework binary at
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Flexo.framework/Versions/A/Flexo
// Source disassembly:
//   raw-port/re/disasm/Flexo.__ZL14copyCropValuesP10__CVBufferjPf.s  (87 lines)
//
// This is a ProRes RAW crop helper: it reads one of two CVBuffer attachments off the
// decoded image buffer and produces a 4-float crop vector written to `out`.
//   1. It first tries the "ProResRAW_RecommendedCrop" attachment. If present and the
//      backing CFData is at least 16 bytes, the first 16 bytes ARE the 4 crop floats
//      (copied verbatim as an xmm quad).
//   2. Otherwise it falls back to "ProResRAW_DefaultCrop": if present with >= 4 bytes,
//      those 4 bytes are 4 unsigned chars, zero-extended to int32, converted to float,
//      and divided by `1 << shift` (a broadcast scalar) to normalise them.
//   3. If neither attachment yields data (buffer null / attachment missing / too short),
//      the crop vector is all zeros.
//
// The two attachment KEYS were recovered from the __cfstring literals the two `leaq`s
// point at (otool prints "@\"bad cfstring ref\"" for both because the __cfstring dataptr
// is a rebased pointer): fat-x86_64 __cfstring @0x19b2da8 -> C string @0x16640c0 len 0x19
// = "ProResRAW_RecommendedCrop"; __cfstring @0x19b2dc8 -> C string @0x16640da len 0x15
// = "ProResRAW_DefaultCrop".
//
// FRONTIER CALLEES — all TRUE OUT-OF-SCOPE CoreVideo / CoreFoundation externs, modelled
// as boundary stubs exactly like HGCVPixelBuffer's CoreVideo externs. The FCP function
// body itself is fully transcribed; only the extern targets are stubs:
//   _CVBufferCopyAttachment  @stub 0x149531c   (CoreVideo)
//   _CFDataGetLength         @stub 0x149475e   (CoreFoundation)
//   _CFDataGetBytes          @stub 0x1494758   (CoreFoundation)
//   _CFRelease               @stub 0x149484e   (CoreFoundation)  <- NO-OP, not a throw
//
// The first three are VALUE-PRODUCING externs: JS cannot fabricate an attachment, a
// CFData length or its bytes, so their citing throws are correct and required. The
// fourth is not. `_CFRelease` is a LIFETIME/OWNERSHIP primitive returning void, and it
// is called on NORMAL paths — @0xe1845e releasing the default-crop attachment right
// after the crop math, and @0xe18482 releasing the recommended-crop attachment in the
// shared tail immediately before `movups %xmm0,(%rbx)` @0xe1848b. Throwing there would
// abandon the four floats the function has just computed, on the ordinary success path.
// Per the RESOLVED "CFRelease/CFRetain-family externs = NO-OP, not throw" ruling it is
// modelled as a JS no-op (the JS GC owns the surrogate), which is the landed convention:
// raw-port/src/infra/PCCFRef_CFArray.ts and PCCFRef_CFDictionary.ts both define
// `function CFRelease(...): void { // JS surrogate: no-op }`.
// (The _\_\_stack_chk_guard/_\_\_stack_chk_fail canary @0xe18498/0xe184ab is a compiler
//  stack-protector artifact with no observable value semantics and is not modelled.)

/** Apple CoreVideo opaque image buffer handle (`__CVBuffer*` / `CVBufferRef`). Out of
 *  scope: an opaque pointer at this boundary. */
export type CVBufferRef = unknown;
/** Apple CoreFoundation `CFDataRef` — opaque byte container. Out of scope. */
export type CFDataRef = unknown;

// --- CoreVideo / CoreFoundation boundary stubs (TRUE out-of-scope externs) -----------------

/** `CVBufferCopyAttachment(CVBufferRef, CFStringRef key, CFAllocatorRef*)` — CoreVideo
 *  extern, called via Flexo symbol stub @0x149531c (`callq` @Flexo 0xe183c8 / 0xe18408).
 *  Returns a retained attachment value (here a `CFDataRef`) or null. */
function CVBufferCopyAttachment(
  _buffer: CVBufferRef,
  _key: string,
  _attachmentMode: number,
): CFDataRef {
  throw new Error(
    "CVBufferCopyAttachment — CoreVideo extern, out-of-scope; entered via copyCropValues @Flexo 0xe18390 (stub 0x149531c)",
  );
}

/** `CFDataGetLength(CFDataRef)` — CoreFoundation extern, called via Flexo symbol stub
 *  @0x149475e (`callq` @Flexo 0xe183d8 / 0xe18418). Returns the byte length (CFIndex). */
function CFDataGetLength(_data: CFDataRef): number {
  throw new Error(
    "CFDataGetLength — CoreFoundation extern, out-of-scope; entered via copyCropValues @Flexo 0xe18390 (stub 0x149475e)",
  );
}

/** `CFDataGetBytes(CFDataRef, CFRange{loc,len}, UInt8* out)` — CoreFoundation extern,
 *  called via Flexo symbol stub @0x1494758 (`callq` @Flexo 0xe183f1 / 0xe18434). Copies
 *  `len` bytes starting at `loc` into `out`. Here it fills a stack buffer that is then
 *  reinterpreted as either 4 float32 (16 bytes) or 4 uint8 (4 bytes). */
function CFDataGetBytes(
  _data: CFDataRef,
  _rangeLoc: number,
  _rangeLen: number,
  _out: Uint8Array,
): void {
  throw new Error(
    "CFDataGetBytes — CoreFoundation extern, out-of-scope; entered via copyCropValues @Flexo 0xe18390 (stub 0x1494758)",
  );
}

/** `CFRelease(CFTypeRef)` — CoreFoundation extern, called via Flexo symbol stub
 *  @0x149484e (`callq` @Flexo 0xe1845e / 0xe18482). Balances the +1 retain that
 *  CVBufferCopyAttachment returned. Returns void and produces no value the crop result
 *  depends on.
 *
 *  MODELLED AS A NO-OP, deliberately, unlike the three externs above it. In the native
 *  binary this decrements the CF retain count and, at zero, runs the object's finalize
 *  callback; the JS surrogate has no CF runtime and the handle simply becomes
 *  unreachable. Both call sites are on the NORMAL, non-null path — @0xe1845e and
 *  @0xe18482, the latter in the shared tail immediately before the result store
 *  `movups %xmm0,(%rbx)` @0xe1848b — so a throw here would abandon the four floats the
 *  function has already computed, which is a divergence rather than an honest
 *  incompleteness marker. This follows the RESOLVED lifetime-extern ruling and the
 *  landed precedent in raw-port/src/infra/PCCFRef_CFArray.ts /
 *  PCCFRef_CFDictionary.ts. Documented here so a future parity harness can hook the
 *  boundary. */
function CFRelease(_cf: CFDataRef): void {
  // JS surrogate: no-op — the release has no observable effect in JS. See the doc
  // comment above and the FRONTIER CALLEES block in the file header.
}

// --- attachment keys (recovered __cfstring literals) ---------------------------------------
/** @Flexo __cfstring 0x19b2da8 -> "ProResRAW_RecommendedCrop" (C string @0x16640c0, len 0x19). */
const KEY_RECOMMENDED_CROP = "ProResRAW_RecommendedCrop";
/** @Flexo __cfstring 0x19b2dc8 -> "ProResRAW_DefaultCrop" (C string @0x16640da, len 0x15). */
const KEY_DEFAULT_CROP = "ProResRAW_DefaultCrop";

/**
 * copyCropValues(__CVBuffer* buffer, unsigned int shift, float* out)
 * @0xADDR Flexo 0x0000000000e18390  (__ZL14copyCropValuesP10__CVBufferjPf)
 *
 * SysV ABI: rdi=buffer, esi=shift (uint32, stashed in r15d @0xe183b9), rdx=out (r15/rbx).
 * Writes exactly 4 float32 into `out` (`movups %xmm0,(%rbx)` @0xe1848b) and returns void.
 *
 * FULL DISASM WALK (raw-port/re/disasm/Flexo.__ZL14copyCropValuesP10__CVBufferjPf.s):
 *   0xe183b0  testq %rdi,%rdi ; je 0xe1846e            ; buffer == null -> zero result
 *   0xe183bc  leaq @"ProResRAW_RecommendedCrop",%rsi
 *   0xe183c8  callq _CVBufferCopyAttachment(buffer,key,0) ; r14 = recommended attachment
 *   0xe183d0  testq %rax,%rax ; je 0xe183fc            ; null -> try default
 *   0xe183d8  callq _CFDataGetLength(r14)
 *   0xe183dd  cmpq $0x10,%rax ; jb 0xe183fc            ; < 16 bytes -> try default
 *   0xe183e3  CFDataGetBytes(r14, {0,16}, -0x40(%rbp)) ; copy 16 bytes
 *   0xe183f6  movaps -0x40(%rbp),%xmm0                 ; xmm0 = 4 float32 (verbatim)
 *   0xe183fa  jmp 0xe1847b                             ; -> store + release r14
 *   ; --- default-crop fallback @0xe183fc ---
 *   0xe18408  callq _CVBufferCopyAttachment(buffer,"ProResRAW_DefaultCrop",0) ; r12
 *   0xe1840d  testq %rax,%rax ; je 0xe18473            ; null -> zero result (still release r14)
 *   0xe18418  callq _CFDataGetLength(r12)
 *   0xe1841d  xorps %xmm1,%xmm1                        ; result = 0 unless >= 4 bytes
 *   0xe18420  cmpq $0x4,%rax ; jl 0xe18457             ; < 4 bytes -> keep zero
 *   0xe18434  CFDataGetBytes(r12, {0,4}, -0x40(%rbp))  ; copy 4 bytes (4 uint8)
 *   0xe18439  movl $1,%eax ; movl %r15d,%ecx ; shll %cl,%eax ; eax = 1 << shift
 *   0xe18443  cvtsi2ss %eax,%xmm0                      ; xmm0 = (float)(1<<shift)
 *   0xe18447  pmovzxbd -0x40(%rbp),%xmm1               ; xmm1 = zero-extend 4 uint8 -> 4 int32
 *   0xe1844d  cvtdq2ps %xmm1,%xmm1                     ; -> 4 float32
 *   0xe18450  shufps $0,%xmm0,%xmm0                    ; broadcast (1<<shift) to all 4 lanes
 *   0xe18454  divps %xmm0,%xmm1                        ; xmm1 = byte[i] / (1<<shift)
 *   0xe18457  movaps %xmm1,-0x50(%rbp) ; CFRelease(r12) ; movaps -0x50,%xmm0
 *   0xe18467  testq %r14,%r14 ; jne 0xe1847b           ; if recommended attachment existed, release it
 *   0xe1846c  jmp 0xe1848b                             ; else store result now
 *   ; --- shared release-r14-then-store tail @0xe1847b ---
 *   0xe1847b  movaps %xmm0,-0x50 ; CFRelease(r14) ; movaps -0x50,%xmm0
 *   0xe1848b  movups %xmm0,(%rbx)                      ; out[0..3] = result
 *   ; (@0xe1846e / @0xe18473 zero xmm0 for the null-buffer / null-default cases)
 *
 * Two `movaps -0x50(%rbp)` round-trips (@0xe18457/@0xe1847b) exist purely to preserve the
 * result quad across the CFRelease calls (which clobber xmm regs) — value-transparent, so
 * this port just keeps the result in a local across the (throwing) release stubs.
 *
 * NUMERICS: the recommended-crop path copies 4 IEEE-754 float32 verbatim. The default-crop
 * path is `(float)byte[i] / (float)(1 << shift)` per lane — a single-precision divide
 * (`divps`), so each lane is wrapped in Math.fround. `1 << shift` is a 32-bit shift (`shll`),
 * masked to 5 bits by the hardware; `cvtsi2ss` treats the result as a SIGNED int32.
 *
 * In-scope callees: NONE. All four callees are CoreVideo/CoreFoundation externs (stubs above).
 */
export function copyCropValues(
  buffer: CVBufferRef,
  shift: number,
  out: Float32Array,
): void {
  const f = Math.fround;

  // @0xe183b0  testq %rdi,%rdi ; je 0xe1846e : null buffer -> zero crop.
  if (buffer === null || buffer === undefined) {
    // @0xe1846e xorps %xmm0 ; @0xe1848b movups %xmm0,(%rbx)
    out[0] = 0;
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    return;
  }

  // @0xe183b9  r15d = (uint32)shift.
  const shiftU = shift >>> 0;

  // @0xe183c8  r14 = CVBufferCopyAttachment(buffer, "ProResRAW_RecommendedCrop", 0).
  const recommended = CVBufferCopyAttachment(buffer, KEY_RECOMMENDED_CROP, 0);

  // result quad (kept in a local across the throwing CFRelease stubs — the two
  // `movaps -0x50(%rbp)` round-trips are just xmm preservation across the calls).
  let r0 = 0;
  let r1 = 0;
  let r2 = 0;
  let r3 = 0;
  let haveResult = false; // whether the recommended-crop fast path produced the quad

  // @0xe183d0..0xe183e1  recommended != null && CFDataGetLength(recommended) >= 16.
  if (recommended !== null && recommended !== undefined) {
    if (CFDataGetLength(recommended) >= 0x10) {
      // @0xe183f1  CFDataGetBytes(recommended, {0,16}, tmp) : the 4 crop float32 verbatim.
      const tmp = new Uint8Array(16);
      CFDataGetBytes(recommended, 0, 0x10, tmp);
      // @0xe183f6  movaps -0x40(%rbp),%xmm0 : reinterpret the 16 bytes as 4 float32 (LE).
      const fv = new Float32Array(tmp.buffer, tmp.byteOffset, 4);
      r0 = fv[0];
      r1 = fv[1];
      r2 = fv[2];
      r3 = fv[3];
      haveResult = true;
      // @0xe183fa jmp 0xe1847b : store, then release r14. (falls through below.)
    }
  }

  if (!haveResult) {
    // --- default-crop fallback @0xe183fc ---
    // @0xe18408  r12 = CVBufferCopyAttachment(buffer, "ProResRAW_DefaultCrop", 0).
    const dflt = CVBufferCopyAttachment(buffer, KEY_DEFAULT_CROP, 0);
    // @0xe1840d  testq %rax,%rax ; je 0xe18473 : null default -> zero result (r0..r3 stay 0),
    //   but still release the recommended attachment if it existed.
    if (dflt !== null && dflt !== undefined) {
      // @0xe18418  CFDataGetLength(r12) ; @0xe1841d xorps %xmm1 (result 0 unless >= 4 bytes).
      const len = CFDataGetLength(dflt);
      // @0xe18420  cmpq $0x4,%rax ; jl 0xe18457 : keep zero when < 4 bytes.
      if (len >= 4) {
        // @0xe18434  CFDataGetBytes(r12, {0,4}, tmp4) : 4 unsigned char crop bytes.
        const tmp4 = new Uint8Array(4);
        CFDataGetBytes(dflt, 0, 4, tmp4);
        // @0xe18439  eax = 1 << shift  (shll masks the count to 5 bits; signed int32).
        const scaleI = (1 << (shiftU & 0x1f)) | 0;
        // @0xe18443  cvtsi2ss %eax,%xmm0 : (float)(1<<shift), broadcast to 4 lanes @0xe18450.
        const scaleF = f(scaleI);
        // @0xe18447..0xe18454  xmm1 = (float)(uint8 byte[i]) ; divps by scaleF (single-prec).
        r0 = f(tmp4[0] / scaleF);
        r1 = f(tmp4[1] / scaleF);
        r2 = f(tmp4[2] / scaleF);
        r3 = f(tmp4[3] / scaleF);
      }
      // @0xe1845e  CFRelease(r12).
      CFRelease(dflt);
    }
  }

  // @0xe18467/@0xe1847b  release the recommended attachment if it was non-null.
  if (recommended !== null && recommended !== undefined) {
    CFRelease(recommended);
  }

  // @0xe1848b  movups %xmm0,(%rbx) : write the 4-float crop vector to `out`.
  out[0] = r0;
  out[1] = r1;
  out[2] = r2;
  out[3] = r3;
}
