// PCBlend.ts — ProCore PCBlend: metadata about PCBlend blend modes.
//
// This class is a bag of static helpers (no instance state — every method is
// operator-()-style). It provides:
//   * localized menu-heading strings ("Blend Modes", "Mask Blend Modes", ...),
//   * a lazily-parsed "|"/";"-separated menu string split into per-mode (combine,
//     over) name pairs,
//   * two hard-coded arrays that map compact UI indices <-> PCBlendMode values
//     (elementBlendModes: 33 entries; layerBlendModes: 35 entries),
//   * predicates on PCBlendMode (isAbelian / isAssociative /
//     isNormalOverNothing / isNothingOverNothing / treatsBlackLikeNormal), each
//     driven by a hard-coded bitmask literal read from the disasm,
//   * lrBlendToPCBlend, a tiny 4-entry PCLightWrapBlendMode -> PCBlendMode LUT.
//
// PCBlend is pure metadata — no pixel math. The actual blend equations
// (multiply / screen / overlay / ...) live in the shader/compositor path, not
// here. See raw-port/re/disasm/ProCore.PCBlend.*.s for the full disassembly of
// every method transcribed below.
//
// Provenance:
//   Symbols come from /Applications/Final Cut Pro.app/Contents/Frameworks/
//   ProCore.framework/Versions/A/ProCore (x86_64 slice). Bitmask literals,
//   jump-table contents, and the two hard-coded (element|layer)BlendModes
//   arrays are read directly from the __const segment of that binary.
//
// Numerics: no floating-point ops in this class; everything is uint32 bitmask
// arithmetic. All bit tests are exactly `(mask >> mode) & 1` — we use BigInt
// because several masks exceed 32 bits (e.g. isNormalOverNothing's
// 0x1000da0dfdf7d, isAssociative's 0x1000880800719).

// ---------------------------------------------------------------------------
// Types & PCException stubs (undecoded frontier — see resolve.py ProCore).
// ---------------------------------------------------------------------------

/** PCBlendMode — an integer enum. FCP passes it as `unsigned int` on the ABI
 * boundary (see edi in every method). Values in [0, 0x33] are the currently
 * valid range (any `mode > 0x33` throws PCIllegalArgumentException in every
 * predicate below). We keep this as `number` because the enum tag names are
 * not disclosed by the binary; only numeric values are decoded here. */
export type PCBlendMode = number;

/** PCLightWrapBlendMode — 1-based enum passed to lrBlendToPCBlend. Only values
 * 1..4 are mapped; anything else returns 0. Kept as `number` for the same
 * reason as PCBlendMode. */
export type PCLightWrapBlendMode = number;

/** Placeholder for PCString (a wrapper around CFString + a C-string backing).
 * The real class lives in ProCore alongside PCString::PCString(char const*,
 * char const*) @0xADDR-not-yet-transcribed. Here we surface just the payload
 * strings — a real port would return an actual PCString instance. */
export interface PCString {
  readonly text: string;
  readonly bundleId?: string;
}

function pcStringLiteral(text: string, bundleId: string): PCString {
  // Faithful to `PCString::PCString(char const*, char const*)` @ProCore
  // (undecoded here — construction is delegated to whoever ports PCString).
  return { text, bundleId };
}

// ---------------------------------------------------------------------------
// Hard-coded blend-mode index tables read from the ProCore __const segment.
// ---------------------------------------------------------------------------

/**
 * PCBlend::getElementBlendModes(unsigned int&)::elementBlendModes  @0x15ad40.
 * 33 uint32 entries. `getElementBlendModes(count&)` sets `count = 0x21` and
 * returns this pointer (see @0x17e09).
 */
export const elementBlendModes: readonly number[] = [
  0, 37, 2, 3, 4, 5, 6, 37, 8, 9, 10, 11, 12, 37, 14, 15, 16, 17, 18, 19, 20,
  37, 22, 23, 37, 25, 26, 27, 28, 29, 37, 31, 35,
];

/**
 * PCBlend::getLayerBlendModes(unsigned int&)::layerBlendModes  @0x15add0.
 * 35 uint32 entries. `getLayerBlendModes(count&)` sets `count = 0x23` and
 * returns this pointer (see @0x17e2e).
 */
export const layerBlendModes: readonly number[] = [
  34, 37, 0, 37, 2, 3, 4, 5, 6, 37, 8, 9, 10, 11, 12, 37, 14, 15, 16, 17, 18,
  19, 20, 37, 22, 23, 37, 25, 26, 27, 28, 29, 37, 31, 35,
];

/**
 * PCBlend::lrBlendToPCBlend(PCLightWrapBlendMode)::(jump-table)  @0x123600.
 * 4 uint32 entries, indexed by `mode - 1` (see @0x182ee `decl %edi`).
 */
const kLrBlendTable: readonly number[] = [9, 10, 14, 16];

// ---------------------------------------------------------------------------
// PCException stubs — thrown by several predicates below. Real classes at
// `PCIllegalArgumentException::PCIllegalArgumentException()` and
// `PCUnsupportedOperationException::PCUnsupportedOperationException(...)`;
// neither is transcribed yet.
// ---------------------------------------------------------------------------

export class PCIllegalArgumentException extends Error {
  constructor() {
    // Faithful stub — the real ctor at
    // __ZN26PCIllegalArgumentExceptionC1Ev is not yet transcribed.
    super('PCIllegalArgumentException');
    this.name = 'PCIllegalArgumentException';
  }
}

export class PCUnsupportedOperationException extends Error {
  constructor(msg: string, file: string, line: number) {
    // Faithful stub — the real ctor
    // __ZN11PCExceptionC2ERK8PCStringS2_i is not yet transcribed.
    super(`PCUnsupportedOperationException: ${msg} (${file}:${line})`);
    this.name = 'PCUnsupportedOperationException';
  }
}

// ---------------------------------------------------------------------------
// Lazy singletons (mirroring FCP's `static PCString*` locals). We keep the
// laziness for parity with the disasm; in practice these are cheap to build.
// ---------------------------------------------------------------------------

let pModeMenuString: PCString | null = null;
let pModeMenuCombineString: PCString | null = null;
let pLightWrapModeMenuString: PCString | null = null;
let pReflectionModeMenuString: PCString | null = null;
let pMaskModeMenuString: PCString | null = null;

// Lazily-built vector<PCString> of per-mode names. The FCP layout is a flat
// array of pairs { combineName, overName } indexed by mode, i.e. the entry
// for PCBlendMode m lives at [2*m] (combine form) and [2*m+1] (over form).
// See modeName(mode, combine) @0x17bb6:
//     xorb $0x1, %r14b                ; b = !combine
//     movzbl %r14b, %ecx
//     leal (%rbx, %rcx, 2), %ecx      ; idx = mode + 2*b  = 2*mode + (!combine)
// (`rbx=mode, rcx=!combine`; note the LEA scales by 2 on rcx, not rbx — so the
// formula on the right is subtle. Because `mode + 2*(!combine)` can't index a
// flat pair-array of length 2*N correctly, the intended pairing is
// `2*mode + (!combine)` — this is only consistent if r14 (the bool) is the
// factor being scaled, and rbx (the mode) is scaled *elsewhere* by the array
// stride. The asm's stride at the final load is `,8` because sizeof(PCString*)
// is 8, and the pointer arithmetic is *(vector.begin() + idx). We keep the
// arithmetic literal as in the disasm and expose modeName(mode, combine)
// accordingly.)
let modeNameVector: PCString[] | null = null;
let maskModeNameVector: PCString[] | null = null;

// ---------------------------------------------------------------------------
// The methods, one per FCP export.
// ---------------------------------------------------------------------------

/**
 * PCBlend::modeMenuString(bool combine)  @ProCore 0x178e8.
 *
 *   testl %edi, %edi         ; if (combine)
 *   je    0x1792b            ;   goto no-combine branch
 *   ...  new PCString("Blend Modes Combine", "com.apple.procore.framework")
 *   into `pModeMenuCombineString`, cached.
 *   no-combine branch:
 *   ...  new PCString("Blend Modes",         "com.apple.procore.framework")
 *   into `pModeMenuString`, cached.
 *
 * Uses `operator new(0x8)` @stub __Znwm and PCString::PCString(char const*,
 * char const*) @__ZN8PCStringC1EPKcS1_ (undecoded — see PCString stub above).
 */
export function modeMenuString(combine: boolean): PCString {
  if (combine) {
    if (pModeMenuCombineString === null) {
      pModeMenuCombineString = pcStringLiteral(
        'Blend Modes Combine',
        'com.apple.procore.framework',
      );
    }
    return pModeMenuCombineString;
  } else {
    if (pModeMenuString === null) {
      pModeMenuString = pcStringLiteral(
        'Blend Modes',
        'com.apple.procore.framework',
      );
    }
    return pModeMenuString;
  }
}

/**
 * PCBlend::lightWrapModeMenuString()  @ProCore 0x1797e.
 *   `pLightWrapModeMenuString` lazy PCString("Light Wrap Blend Modes",
 *   "com.apple.procore.framework"). Mirrors modeMenuString exactly.
 */
export function lightWrapModeMenuString(): PCString {
  if (pLightWrapModeMenuString === null) {
    pLightWrapModeMenuString = pcStringLiteral(
      'Light Wrap Blend Modes',
      'com.apple.procore.framework',
    );
  }
  return pLightWrapModeMenuString;
}

/**
 * PCBlend::reflectionModeMenuString()  @ProCore 0x179d6.
 *   Lazy PCString("Blend Modes Reflection", "com.apple.procore.framework").
 */
export function reflectionModeMenuString(): PCString {
  if (pReflectionModeMenuString === null) {
    pReflectionModeMenuString = pcStringLiteral(
      'Blend Modes Reflection',
      'com.apple.procore.framework',
    );
  }
  return pReflectionModeMenuString;
}

/**
 * PCBlend::maskModeMenuString()  @ProCore 0x17bfa.
 *   Lazy PCString("Mask Blend Modes", "com.apple.procore.framework").
 */
export function maskModeMenuString(): PCString {
  if (pMaskModeMenuString === null) {
    pMaskModeMenuString = pcStringLiteral(
      'Mask Blend Modes',
      'com.apple.procore.framework',
    );
  }
  return pMaskModeMenuString;
}

/**
 * PCBlend::getModeNameVector()  @ProCore 0x17a7a (private).
 *
 * In the binary this is a static-local vector<PCString> protected by a
 * `guard variable` (`__ZGVZN7PCBlendL17getModeNameVectorEvE14modeNameVector`).
 * The public callers `modeCount(bool)` and `modeName(...)` compare the vector
 * `.end()` against `.begin()` (loaded from the two adjacent globals at
 * `.begin()+0` and `.begin()+8`, i.e. `__ZZN7PCBlendL17getModeNameVectorEvE14modeNameVector`
 * and RIP-relative +8 later) and, if equal (never populated), call
 * `initializeModeNameVector()`. The guard-variable path (once the vector is
 * built) just returns.
 *
 * In TS we surface a plain reference; the "guard" is `modeNameVector != null`.
 */
export function getModeNameVector(): PCString[] {
  if (modeNameVector === null) {
    // The .cold.1 path @0xdd40f is only reached in the rare re-entrant
    // initialization case (unresolved — not yet transcribed). Real FCP would
    // call __cxa_guard_acquire and re-enter; we short-circuit to lazy init.
    initializeModeNameVector();
  }
  return modeNameVector!;
}

/**
 * PCBlend::initializeModeNameVector()  @ProCore 0x17a90 (private).
 *
 * Effectively:
 *   1. `s = modeMenuString(/*combine=*\/true)` @0x17aa8   — "Blend Modes Combine" localized
 *   2. sep = CFStringFind(s.cf_str(), "|", 0) != -1 ? "|"
 *          : CFStringFind(s.cf_str(), ";", 0) != -1 ? ";"
 *          : PANIC (@0x17b85 tail-calls `push_back(PCString const&)` on
 *            an empty vector — effectively an emplace of the whole string).
 *   3. arr = CFStringCreateArrayBySeparatingStrings(NULL, s.cf_str(), sep)
 *   4. for (i=0; i<CFArrayGetCount(arr); ++i)
 *        modeNameVector.push_back(PCString(CFArrayGetValueAtIndex(arr, i)))
 *   5. CFRelease(arr)
 *
 * (CFStringFind targets @0x14d058 "|", 0x14d078 ";" — both single-character
 * __cfstring literals in ProCore.framework, verified by dumping the __cfstring
 * entries at those file offsets.)
 *
 * We inherit the same behavior: split the (combine) localized menu string on
 * "|" or ";" and store each token as a PCString. In this port the localized
 * string is the raw C literal "Blend Modes Combine" (PCString isn't decoded
 * yet, so its localization pipeline is deferred). That yields a 1-element
 * vector, which is FAITHFUL for the current PCString stub but obviously not
 * useful UI — a full port must first decode PCString/localization.
 */
export function initializeModeNameVector(): void {
  const s = modeMenuString(true);
  let sep: string | null = null;
  if (s.text.indexOf('|') !== -1) sep = '|';
  else if (s.text.indexOf(';') !== -1) sep = ';';
  if (sep === null) {
    // FCP's fallback @0x17b85: push_back the whole string. We match that.
    modeNameVector = [s];
    return;
  }
  const parts = s.text.split(sep);
  modeNameVector = parts.map((t) =>
    pcStringLiteral(t, 'com.apple.procore.framework'),
  );
}

/**
 * PCBlend::modeCount(bool combine)  @ProCore 0x17a2e.
 *
 *   getModeNameVector();
 *   if (vec.end == vec.begin) initializeModeNameVector();
 *   n = (vec.end - vec.begin) / sizeof(PCString)  ; sarq $0x3 => /8
 *   ; then:  n = n + 2*combine - 2   (leaq (rax,rcx,2),rax; addq $-2,rax
 *   ;                                  where rcx = movzbl(combine))
 *
 * Returns `size + 2*combine - 2` where `size = modeNameVector.length`
 * (elements, not bytes — the sarq $0x3 accounts for sizeof(PCString*) = 8).
 * Actually the shift is on the *raw byte-difference* between the two vector
 * pointers, and PCString here is stored as a pointer (or the vector's element
 * stride is 8), which matches "one 8-byte slot per entry" — i.e. n = vec.size.
 */
export function modeCount(combine: boolean): number {
  const vec = getModeNameVector();
  const n = vec.length;
  return n + 2 * (combine ? 1 : 0) - 2;
}

/**
 * PCBlend::modeName(PCBlendMode mode, bool combine)  @ProCore 0x17bb6.
 *
 *   getModeNameVector();
 *   if (vec.end == vec.begin) initializeModeNameVector();
 *   b = combine ^ 1                  ; b = !combine (0 if combine, 1 otherwise)
 *   idx = mode + 2*b                 ; leal (rbx, rcx, 2), ecx
 *   return &vec.begin[idx]           ; leaq (rax, rcx*8), rax  (byte offset idx*8)
 *
 * Returns the PCString AT `mode + 2*(!combine)` in the flat vector. The
 * offsets are exactly as the asm computes them — we do not "helpfully" recast
 * this into the more-intuitive pair-of-two-per-mode indexing; a shortcut here
 * would silently mis-index.
 */
export function modeName(mode: PCBlendMode, combine: boolean): PCString {
  const vec = getModeNameVector();
  const b = combine ? 0 : 1;
  const idx = (mode | 0) + 2 * b;
  return vec[idx];
}

/**
 * PCBlend::maskModeCount()  @ProCore 0x17c52.
 *
 *   getMaskModeNameVector();
 *   if (vec.end == vec.begin) initializeMaskModeNameVector();
 *   n = (end - begin) / 8            ; sarq $0x3
 *   return n
 *
 * (No `+2*combine-2` correction — mask modes are single-form.)
 */
export function maskModeCount(): number {
  const vec = getMaskModeNameVector();
  return vec.length;
}

/**
 * PCBlend::getMaskModeNameVector()  @ProCore 0x17c8a (private).
 * Direct analogue of getModeNameVector() with its own guard variable
 * (`__ZGVZN7PCBlendL21getMaskModeNameVectorEvE18maskModeNameVector`). Body of
 * disasm is the same guard-then-cold-init pattern.
 */
export function getMaskModeNameVector(): PCString[] {
  if (maskModeNameVector === null) {
    initializeMaskModeNameVector();
  }
  return maskModeNameVector!;
}

/**
 * PCBlend::initializeMaskModeNameVector()  @ProCore 0x17ca0 (private).
 * Direct analogue of initializeModeNameVector, but sourcing from
 * `maskModeMenuString()` @0x17bfa ("Mask Blend Modes"). Uses the same
 * "|" -> ";" fallback via CFStringFind.
 */
export function initializeMaskModeNameVector(): void {
  const s = maskModeMenuString();
  let sep: string | null = null;
  if (s.text.indexOf('|') !== -1) sep = '|';
  else if (s.text.indexOf(';') !== -1) sep = ';';
  if (sep === null) {
    maskModeNameVector = [s];
    return;
  }
  const parts = s.text.split(sep);
  maskModeNameVector = parts.map((t) =>
    pcStringLiteral(t, 'com.apple.procore.framework'),
  );
}

/**
 * PCBlend::maskModeName(PCBlendMode mode)  @ProCore 0x17dc1.
 *
 *   getMaskModeNameVector();
 *   if (vec.end == vec.begin) initializeMaskModeNameVector();
 *   idx = mode                          ; movl %ebx, %ecx
 *   return &vec.begin[idx]              ; leaq (rax, rcx*8), rax
 *
 * Direct 1:1 lookup — one entry per mask mode (no combine variant).
 */
export function maskModeName(mode: PCBlendMode): PCString {
  const vec = getMaskModeNameVector();
  return vec[mode | 0];
}

/**
 * PCBlend::indexToElementBlendMode(unsigned int index)  @ProCore 0x17df7.
 *   Return elementBlendModes[index]  (no bounds check in asm — caller
 *   guarantees `index < 0x21`; passing out-of-range yields OOB read in FCP).
 */
export function indexToElementBlendMode(index: number): PCBlendMode {
  return elementBlendModes[index >>> 0];
}

/**
 * PCBlend::getElementBlendModes(unsigned int& count)  @ProCore 0x17e09.
 *   *count = 0x21; return elementBlendModes.
 * We surface the same info via a return-tuple.
 */
export function getElementBlendModesWithCount(): {
  count: number;
  modes: readonly number[];
} {
  return { count: 0x21, modes: elementBlendModes };
}

/**
 * PCBlend::getElementBlendModes()  (void overload)  @ProCore 0x17ee6.
 *   Returns elementBlendModes (no count).
 */
export function getElementBlendModes(): readonly number[] {
  return elementBlendModes;
}

/**
 * PCBlend::indexToLayerBlendMode(unsigned int index)  @ProCore 0x17e1c.
 *   Return layerBlendModes[index].
 */
export function indexToLayerBlendMode(index: number): PCBlendMode {
  return layerBlendModes[index >>> 0];
}

/**
 * PCBlend::getLayerBlendModes(unsigned int& count)  @ProCore 0x17e2e.
 *   *count = 0x23; return layerBlendModes.
 */
export function getLayerBlendModesWithCount(): {
  count: number;
  modes: readonly number[];
} {
  return { count: 0x23, modes: layerBlendModes };
}

/**
 * PCBlend::getLayerBlendModes()  (void overload)  @ProCore 0x17ef3.
 *   Returns layerBlendModes.
 */
export function getLayerBlendModes(): readonly number[] {
  return layerBlendModes;
}

/**
 * PCBlend::elementBlendModeToIndex(PCBlendMode m)  @ProCore 0x17e41.
 *
 *   rax = 0
 *   do {
 *     if (elementBlendModes[rax] == m) return rax;
 *     ++rax;
 *   } while (rax != 0x21);
 *   return 0;                            ; not-found fallback is 0
 *
 * Note: 0 is a valid index AND the not-found sentinel. FCP callers rely on
 * the returned index being meaningful only when the mode is known-present.
 */
export function elementBlendModeToIndex(m: PCBlendMode): number {
  for (let i = 0; i < 0x21; i++) {
    if (elementBlendModes[i] === (m | 0)) return i;
  }
  return 0;
}

/**
 * PCBlend::layerBlendModeToIndex(PCBlendMode m)  @ProCore 0x17e63.
 *   Same linear scan, over layerBlendModes[0..0x23].
 */
export function layerBlendModeToIndex(m: PCBlendMode): number {
  for (let i = 0; i < 0x23; i++) {
    if (layerBlendModes[i] === (m | 0)) return i;
  }
  return 0;
}

/**
 * PCBlend::indexToBlendMode(unsigned int index, bool isLayer)  @ProCore 0x17e85.
 *
 *   rdx = &elementBlendModes
 *   if (isLayer != 0) rdx = &layerBlendModes    ; cmovneq %rcx, %rdx
 *   return rdx[index]
 */
export function indexToBlendMode(index: number, isLayer: boolean): PCBlendMode {
  const tbl = isLayer ? layerBlendModes : elementBlendModes;
  return tbl[index >>> 0];
}

/**
 * PCBlend::blendModeToIndex(PCBlendMode m, bool isLayer)  @ProCore 0x17ea4.
 *
 *   if (isLayer != 0) {
 *     linear-scan layerBlendModes[0..0x23]; return index if match, else 0.
 *   } else {
 *     linear-scan elementBlendModes[0..0x21]; return index if match, else 0.
 *   }
 *
 * Note the asm inlines two copies of the loop rather than dispatching to
 * layerBlendModeToIndex/elementBlendModeToIndex — we mirror by delegating,
 * which is behavior-identical (both loops return 0 on not-found).
 */
export function blendModeToIndex(m: PCBlendMode, isLayer: boolean): number {
  if (isLayer) return layerBlendModeToIndex(m);
  return elementBlendModeToIndex(m);
}

// ---------------------------------------------------------------------------
// Predicate group — each is a bitmask literal read from the disasm. Every
// mask address is cited to a specific instruction so a reviewer can diff
// mask-by-mask.
// ---------------------------------------------------------------------------

/**
 * PCBlend::isAbelian(PCBlendMode m)  @ProCore 0x17f00.
 *
 *   cmpl $0x18, %edi         ; unsigned compare
 *   setb %dl                 ; dl = (m < 0x18)
 *   movl $0xc00718, %eax
 *   shrl %cl, %eax           ; eax = 0xC00718 >> m
 *   andb %dl, %al            ; result = (m < 0x18) & (bit0 of shifted mask)
 *
 * No exception — invalid modes just return false. The mask literal
 * 0xC00718 is loaded verbatim at @0x17f0c.
 */
export function isAbelian(m: PCBlendMode): boolean {
  const mode = m | 0;
  if (mode < 0 || mode >= 0x18) return false;
  const mask = 0xc00718; // @0x17f0c
  return ((mask >>> mode) & 1) === 1;
}

/**
 * PCBlend::isAssociative(PCBlendMode m)  @ProCore 0x17f17.
 *
 *   cmpl $0x33, %edi
 *   ja   .illegal                                    ; m > 0x33 -> PCIllegalArgumentException
 *   movabsq $0x53e5fd864, %rax
 *   btq %rcx, %rax                                    ; test bit m of mask A
 *   jae  .not_a                                       ; bit clear -> continue
 *   xorl %eax, %eax                                   ; bit set -> return false
 *   jmp  .ret
 *   .not_a:
 *   movb $0x1, %al
 *   movabsq $0x1000880800719, %rdx
 *   btq %rcx, %rdx                                    ; test bit m of mask B
 *   jae  .not_b                                       ; bit clear -> continue
 *   ret 1                                             ; bit set -> return true
 *   .not_b:
 *   movabsq $0xeffc000000000, %rax
 *   btq %rcx, %rax                                    ; test bit m of mask C
 *   jae  .illegal                                     ; bit clear -> illegal-arg
 *   ; bit set -> throw PCUnsupportedOperationException("not implemented yet",
 *   ;                  ".../PCBlend.cpp", 0x1f0=496)
 *
 * Masks read directly from the disasm (@0x17f2f, @0x17f45, @0x17f60).
 */
export function isAssociative(m: PCBlendMode): boolean {
  const mode = BigInt(m | 0);
  if ((m | 0) < 0 || (m | 0) > 0x33) throw new PCIllegalArgumentException();
  const maskA = 0x53e5fd864n; // @0x17f2f — "definitely NOT associative"
  const maskB = 0x1000880800719n; // @0x17f45 — "definitely associative"
  const maskC = 0xeffc000000000n; // @0x17f60 — "not implemented"
  if (((maskA >> mode) & 1n) === 1n) return false;
  if (((maskB >> mode) & 1n) === 1n) return true;
  if (((maskC >> mode) & 1n) === 1n) {
    throw new PCUnsupportedOperationException(
      'not implemented yet',
      '/Library/Caches/com.apple.xbs/Sources/ProCore/ProCore-45000.0.33/PCBlend.cpp',
      0x1f0,
    );
  }
  // No mask matched -> falls through to illegal-arg path at @0x17fda.
  throw new PCIllegalArgumentException();
}

/**
 * PCBlend::isNormalOverNothing(PCBlendMode m)  @ProCore 0x18056.
 *
 *   cmpl $0x33, %edi
 *   ja   .illegal
 *   movb $0x1, %al
 *   movabsq $0x1000da0dfdf7d, %rdx
 *   btq %rcx, %rdx                                    ; test bit m
 *   jae  .not_true
 *   ret 1                                             ; bit set -> true
 *   .not_true:
 *   movl $0x1e000000, %eax
 *   btq %rcx, %rax                                    ; test bit m of mask B
 *   jae  .maybe_unsupported
 *   xorl %eax, %eax; ret                              ; bit set -> false
 *   .maybe_unsupported:
 *   movabsq $0xeffc000000000, %rax
 *   btq %rcx, %rax
 *   jae  .illegal                                     ; bit clear -> illegal
 *   ; bit set -> PCUnsupportedOperationException("not implemented yet",
 *   ;              ".../PCBlend.cpp", 0x234=564)
 */
export function isNormalOverNothing(m: PCBlendMode): boolean {
  const mode = BigInt(m | 0);
  if ((m | 0) < 0 || (m | 0) > 0x33) throw new PCIllegalArgumentException();
  const maskA = 0x1000da0dfdf7dn; // @0x18070 — "yes"
  const maskB = 0x1e000000n; // @0x1808b — "no"
  const maskC = 0xeffc000000000n; // @0x1809a — "not implemented"
  if (((maskA >> mode) & 1n) === 1n) return true;
  if (((maskB >> mode) & 1n) === 1n) return false;
  if (((maskC >> mode) & 1n) === 1n) {
    throw new PCUnsupportedOperationException(
      'not implemented yet',
      '/Library/Caches/com.apple.xbs/Sources/ProCore/ProCore-45000.0.33/PCBlend.cpp',
      0x234,
    );
  }
  throw new PCIllegalArgumentException();
}

/**
 * PCBlend::isNothingOverNothing(PCBlendMode m)  @ProCore 0x18170.
 *
 *   cmpl $0x33, %edi
 *   ja   .illegal
 *   movabsq $0x1000da0dfdf7d, %rcx
 *   btq %rax, %rcx                                    ; test bit m of mask A
 *   jae  .not_a
 *   xorl %eax, %eax; ret                              ; bit set -> false
 *   .not_a:
 *   movl $0x1e000000, %ecx
 *   btq %rax, %rcx                                    ; test bit m of mask B
 *   jae  .maybe_unsupported
 *   movb $0x1, %al; ret                               ; bit set -> true
 *   .maybe_unsupported:
 *   movabsq $0xeffc000000000, %rcx
 *   btq %rax, %rcx
 *   jae  .illegal
 *   ; bit set -> PCUnsupportedOperationException("not implemented yet",
 *   ;              ".../PCBlend.cpp", 0x278=632)
 *
 * NB: masks A and B here are the SAME literals as isNormalOverNothing but
 * the RETURN POLARITIES ARE INVERTED (bit-in-A -> false, bit-in-B -> true).
 */
export function isNothingOverNothing(m: PCBlendMode): boolean {
  const mode = BigInt(m | 0);
  if ((m | 0) < 0 || (m | 0) > 0x33) throw new PCIllegalArgumentException();
  const maskA = 0x1000da0dfdf7dn; // @0x18188 — polarity: false
  const maskB = 0x1e000000n; // @0x181a5 — polarity: true
  const maskC = 0xeffc000000000n; // @0x181b4 — "not implemented"
  if (((maskA >> mode) & 1n) === 1n) return false;
  if (((maskB >> mode) & 1n) === 1n) return true;
  if (((maskC >> mode) & 1n) === 1n) {
    throw new PCUnsupportedOperationException(
      'not implemented yet',
      '/Library/Caches/com.apple.xbs/Sources/ProCore/ProCore-45000.0.33/PCBlend.cpp',
      0x278,
    );
  }
  throw new PCIllegalArgumentException();
}

/**
 * PCBlend::treatsBlackLikeNormal(PCBlendMode m)  @ProCore 0x1828a.
 *
 *   movl %edi, %ecx
 *   movabsq $0xfffcdbedfdf7d, %rax
 *   shrq %cl, %rax                    ; rax = 0xFFFCDBEDFDF7D >> m
 *   cmpl $0x33, %edi
 *   ja   .illegal                     ; m > 0x33 -> illegal-arg
 *   testb $0x1, %al
 *   je   .illegal                     ; bit not in valid-mask -> illegal-arg
 *   movl $0x1417d, %eax
 *   btq %rcx, %rax
 *   setb %al                          ; return (bit-of-0x1417D of m)
 *
 * The 0xFFFCDBEDFDF7D mask is the "known-valid PCBlendMode" set (its bits
 * span every mode that isAssociative/isNormalOverNothing/isNothingOverNothing
 * accept — union of their masks A|B|C). Unknown modes throw illegal-arg
 * WITHOUT the PCUnsupportedOperationException path that the other three use.
 */
export function treatsBlackLikeNormal(m: PCBlendMode): boolean {
  const mode = m | 0;
  const modeBig = BigInt(mode);
  if (mode < 0 || mode > 0x33) throw new PCIllegalArgumentException();
  const validMask = 0xfffcdbedfdf7dn; // @0x18293
  if (((validMask >> modeBig) & 1n) === 0n) throw new PCIllegalArgumentException();
  const yesMask = 0x1417dn; // @0x182a9  (fits in 32 bits — the asm used movl)
  return ((yesMask >> modeBig) & 1n) === 1n;
}

/**
 * PCBlend::lrBlendToPCBlend(PCLightWrapBlendMode m)  @ProCore 0x182ea.
 *
 *   decl %edi                       ; m -= 1
 *   xorl %eax, %eax
 *   cmpl $0x3, %edi                 ; unsigned compare
 *   ja   .ret                       ; m-1 > 3 -> return 0
 *   movl %edi, %eax
 *   leaq 0x10b300(%rip), %rcx       ; &kLrBlendTable @0x123600
 *   movl (%rcx, %rax, 4), %eax      ; return kLrBlendTable[m-1]
 *
 * Table @0x123600 read verbatim: {9, 10, 14, 16}.
 */
export function lrBlendToPCBlend(m: PCLightWrapBlendMode): PCBlendMode {
  const idx = (m | 0) - 1;
  if ((idx >>> 0) > 3) return 0;
  return kLrBlendTable[idx];
}
