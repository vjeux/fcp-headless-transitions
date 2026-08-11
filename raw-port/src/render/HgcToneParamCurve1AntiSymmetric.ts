// HgcToneParamCurve1AntiSymmetric.ts — raw transcription of Helium's
// `HgcToneParamCurve1AntiSymmetric`.
//
// ONE symbol is transcribed in this file — `GetParameter(int, float*)`. Every
// other member is a SEPARATE ledger unit and is NOT ported here:
//   0x34d9e0  SetParameter(int, float, float, float, float)
//   (plus the ctor/dtor/render entry points the class shares with its siblings)
//
// Sibling precedent: raw-port/src/render/HgcToneParamCurve4AntiSymmetric.ts is
// already landed and documents the same `this+0x198` constant/parameter pool
// (32-byte-aligned records) that this getter indexes. Note the "4" and "1" are
// DIFFERENT classes at different addresses, not variants of one file. This class
// has NO case-only `HGC…` twin (checked in raw-port/army/inventory/Helium.syms.txt:
// zero `HGCToneParamCurve1AntiSymmetric` symbols), so the filename is unambiguous.
//
// Provenance (Helium framework, x86_64 slice):
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Helium.framework/Versions/A/Helium
//
// Symbol ported in this file:
//   @0x34da60  HgcToneParamCurve1AntiSymmetric::GetParameter(int, float*)
//                __ZN31HgcToneParamCurve1AntiSymmetric12GetParameterEiPf
//
// Source disassembly (re-derived with
// `raw-port/tools/disasm.sh --sym __ZN31HgcToneParamCurve1AntiSymmetric12GetParameterEiPf Helium`):
//   raw-port/re/disasm/__ZN31HgcToneParamCurve1AntiSymmetric12GetParameterEiPf.s (19 lines)
//
// ---------------------------------------------------------------------------
// FULL DISASM — the whole function
// ---------------------------------------------------------------------------
//   0x34da60  movl  $0xffffffff, %eax     ; the DEFAULT return value: -1
//   0x34da65  cmpl  $0x3, %esi            ; flags on (index - 3)
//   0x34da68  ja    0x34daa8              ; UNSIGNED above -> straight to retq
//                                         ; with %eax still -1
//   0x34da6a  pushq %rbp                  ; frame built only on the accepted path
//   0x34da6b  movq  %rsp, %rbp
//   0x34da6e  movq  0x198(%rdi), %rax     ; rax = this->pool
//   0x34da75  movl  %esi, %ecx            ; ecx = index (zero-extends to rcx)
//   0x34da77  shlq  $0x5, %rcx            ; rcx = index * 32  -> 32-BYTE STRIDE
//   0x34da7b  movss (%rax,%rcx), %xmm0    ; out[0] = pool[rec + 0]
//   0x34da80  movss %xmm0, (%rdx)
//   0x34da84  movss 0x4(%rax,%rcx), %xmm0 ; out[1] = pool[rec + 4]
//   0x34da8a  movss %xmm0, 0x4(%rdx)
//   0x34da8f  movss 0x8(%rax,%rcx), %xmm0 ; out[2] = pool[rec + 8]
//   0x34da95  movss %xmm0, 0x8(%rdx)
//   0x34da9a  movss 0xc(%rax,%rcx), %xmm0 ; out[3] = pool[rec + 0xc]
//   0x34daa0  movss %xmm0, 0xc(%rdx)
//   0x34daa5  xorl  %eax, %eax            ; success -> 0
//   0x34daa7  popq  %rbp
//   0x34daa8  retq
//   0x34daa9  nopl  (%rax)                ; padding, not executed
//
// THREE decode points that are easy to get wrong, each measured by the oracle:
//
// 1. `ja` IS UNSIGNED (PORTING_SPEC's AT&T table: `cmp $3,%esi` computes
//    `esi - 3`, and `ja` is CF=0 & ZF=0). So a NEGATIVE index does not "fall
//    through as small" — as a u32 it is huge, so it is rejected exactly like an
//    index above 3. Modelling the guard as the signed `index > 3` changes the
//    answer on 320 of 960 measured cases.
// 2. THE STRIDE IS 32 BYTES (`shlq $0x5`), while only 16 bytes are copied out.
//    Each record is therefore twice the size of the data this getter returns —
//    the upper 16 bytes belong to the record and are simply not part of this
//    accessor's contract (`SetParameter` @0x34d9e0 takes exactly four floats,
//    matching the four copied here). Using a 16-byte stride reads a different
//    record: 120 of 960 cases wrong.
// 3. THE REJECT PATH WRITES NOTHING. The `ja` jumps past every `movss`, so the
//    caller's buffer is left exactly as it was — it is not zeroed, not
//    partially filled. Returning 0 there instead of -1 is wrong on 800 of 960.
//
// ---------------------------------------------------------------------------
// STRUCT LAYOUT (partial — only what a decoded instruction proves)
// ---------------------------------------------------------------------------
//   +0x000..+0x197  the opaque HGNode base subobject — untouched by this unit.
//   +0x198          the constant/parameter pool POINTER, loaded by
//                   `movq 0x198(%rdi), %rax` @0x34da6e. Records are 32 bytes;
//                   this getter reads the first four float32 cells of record
//                   `index`. The pool is allocated and filled by the ctor (a
//                   separate ledger unit), exactly as documented for the landed
//                   sibling HgcToneParamCurve4AntiSymmetric @0x350cfe.
//
// CALLEES: none — no callq, no extern, no indirect or virtual dispatch
// (`depgraph.py deps` lists nothing for this symbol).
//
// ---------------------------------------------------------------------------
// ORACLE
// ---------------------------------------------------------------------------
// Verified by CALLING the live function —
// raw-port/re/oracle/HgcToneParamCurve1AntiSymmetric_GetParameter_oracle.py. The
// symbol is LOCAL (`nm` type `t`), so dlsym cannot reach it; the harness calls it
// at `dyld slide + 0x34da60` via raw-port/re/oracle/ozone_loader.py. No ctor is
// needed — the body reads one pointer field and four floats, so a synthetic
// object with a pool planted at +0x198 is a complete stand-in. 960 cases (40
// randomised 6-record pools x indices -8..15): return code and all four floats
// matched on 960/960, compared as RAW u32 bit patterns rather than float values
// so a NaN payload or a signed zero could not be smeared; the out buffer was
// untouched past 16 bytes and completely untouched on every reject; and neither
// the object nor the pool was modified in 40/40 trials.
// NEGATIVE CONTROLS (measured, same 960 cases): a signed index guard -> 320
// wrong; a 16-byte stride -> 120 wrong; copying only two floats -> 160 wrong;
// returning 0 instead of -1 on the reject path -> 800 wrong.

/**
 * `HgcToneParamCurve1AntiSymmetric` instance state — only the ONE field this
 * unit reads.
 *
 * The class is an HGNode subclass; everything below +0x198 is the opaque HGNode
 * base as far as `GetParameter` is concerned (the body never touches it).
 */
export interface HgcToneParamCurve1AntiSymmetricState {
  /** HGNode base subobject placeholder (+0x000..+0x197) — untouched by this unit. */
  _hgNode: unknown;

  /**
   * +0x198 — the constant/parameter pool pointer, loaded by
   * `movq 0x198(%rdi), %rax` @0x34da6e. Records are 32 bytes (`shlq $0x5`
   * @0x34da77), i.e. 8 float32 cells, of which this accessor reads the first
   * four. Modelled as a Float32Array so that indexing is in float32 ELEMENTS —
   * the machine's byte offsets 0/4/8/0xc are elements 0/1/2/3 of the record.
   * Allocated and filled by the ctor (a separate ledger unit).
   */
  pool: Float32Array | null;
}

/**
 * `HgcToneParamCurve1AntiSymmetric::GetParameter(int index, float* out)`
 *   — @Helium 0x34da60
 *     __ZN31HgcToneParamCurve1AntiSymmetric12GetParameterEiPf
 *
 * Copies the four float32 parameters of record `index` out of the pool at
 * `this+0x198` into the caller's buffer, and returns 0. An index outside 0..3
 * — INCLUDING any negative index, because the guard is the unsigned `ja`
 * @0x34da68 — returns -1 and writes nothing at all. See the FULL DISASM block in
 * the file header for the line-by-line decode and the measured cost of each
 * plausible mis-read.
 *
 * @param self   the instance (SysV %rdi).
 * @param index  the parameter record index (SysV %esi, a signed int in the C++
 *               signature but compared UNSIGNED by the machine).
 * @param out    the caller's destination buffer (SysV %rdx); exactly 4 float32
 *               are written, and only on the accepted path.
 * @returns 0 on success, -1 when the index is rejected.
 */
export function HgcToneParamCurve1AntiSymmetric_GetParameter( // @Helium 0x34da60
  self: HgcToneParamCurve1AntiSymmetricState,
  index: number,
  out: Float32Array,
): number {
  // @0x34da60 — movl $0xffffffff, %eax : the default return value is -1, set
  //   BEFORE the guard; every early exit carries it.
  // @0x34da65/@0x34da68 — cmpl $0x3, %esi ; ja : an UNSIGNED compare, so a
  //   negative index (huge as a u32) is rejected here too. `>>> 0` is what
  //   reproduces that; a signed `index > 3` would admit every negative index.
  if ((index >>> 0) > 3) {
    // @0x34daa8 — retq with %eax = -1, having written nothing to `out`.
    return -1;
  }

  // @0x34da6e — movq 0x198(%rdi), %rax : load the pool pointer.
  const pool = self.pool;
  if (pool === null) {
    throw new Error(
      'HgcToneParamCurve1AntiSymmetric::GetParameter @Helium 0x34da6e: null pool ' +
        '(+0x198) — the binary dereferences it unconditionally on this path and faults',
    );
  }

  // @0x34da75/@0x34da77 — movl %esi, %ecx ; shlq $0x5, %rcx : a 32-BYTE record
  //   stride. Indexing a Float32Array is in 4-byte elements, so 32 bytes is 8.
  const rec = index * 8;

  if (rec + 4 > pool.length) {
    // The machine has no such check — it would read whatever follows the pool.
    // That is not modellable, so this is the loud gap PORTING_SPEC Rule 3 wants
    // rather than a guess, and it is what keeps the four reads below provably in
    // range instead of `undefined -> NaN` (gate G7 / OPS_LOG #13).
    throw new Error(
      'HgcToneParamCurve1AntiSymmetric::GetParameter @Helium 0x34da7b: record ' +
        `${index} (32-byte stride) runs past the end of the +0x198 pool — the ` +
        'binary would read adjacent memory and this port will not invent it',
    );
  }

  // @0x34da7b..@0x34daa0 — four movss loads from the record, four movss stores
  //   into the caller's buffer, at byte offsets 0/4/8/0xc = elements 0/1/2/3.
  //   Float32Array-to-Float32Array preserves the exact 32-bit pattern, so a NaN
  //   payload or a signed zero survives just as the `movss` pair does.
  out[0] = pool[rec + 0];
  out[1] = pool[rec + 1];
  out[2] = pool[rec + 2];
  out[3] = pool[rec + 3];

  // @0x34daa5 — xorl %eax, %eax : success.
  return 0;
}
