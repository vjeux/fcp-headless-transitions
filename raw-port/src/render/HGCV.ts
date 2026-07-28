// raw-port: HGCV — Helium framework (render layer)
//
// Three static functions that convert between Helium's HGFormat enum and Apple
// CoreVideo pixel-format FourCC codes, plus a pixel-size-casting policy query.
//
// SYMBOLS PORTED (Helium.framework/Versions/A/Helium):
//   @Helium 0x90b70  HGCV::HGFormatForCVPixelFormat(unsigned int cvFmt, unsigned long selector) -> HGFormat
//   @Helium 0x90f10  HGCV::CVPixelFormatForHGFormat(HGFormat, unsigned long)                    -> unsigned int
//   @Helium 0x90f60  HGCV::AllowPixelSizeCastingForHGFormat(HGFormat)                           -> bool
//
// re/disasm:
//   raw-port/re/disasm/Helium.HGCV.HGFormatForCVPixelFormat.s
//   raw-port/re/disasm/Helium.HGCV.CVPixelFormatForHGFormat.s
//   raw-port/re/disasm/Helium.HGCV.AllowPixelSizeCastingForHGFormat.s
//
// DECODE — RIP-relative data referenced from the disasm:
//   @Helium 0x3cd0a8 — CVPixelFormatForHGFormat's 33-entry `u32[hgFormat-1]` lookup table
//                      (7 bytes leaq @0x90f2a; RIP-relative displacement 0x33c177 lands at 0x90f31+0x33c177).
//   @Helium (in-function immediate) 0x1DFE0FE57 — 33-bit "which HGFormat has a defined CV mapping" bitmap
//                      (bit c set => table[c] is valid; hgFormat-1 == c).
//   @Helium 0x84a96f (+ rip=0x90eff) — literal string "unsupported HGFormat for CoreVideo format %c%c%c%c\n"
//   @Helium 0x84a95d (+ rip=0x90f45) — literal string "unsupported CoreVideo format for HGFormat %s\n"
//   __ZN8HGLogger7warningEPKcz          — HGLogger::warning(const char*, ...) — variadic external
//   __ZN13HGFormatUtils8toStringE8HGFormat — HGFormatUtils::toString(HGFormat) — external
//   __ZZN4HGCV32AllowPixelSizeCastingForHGFormatE8HGFormatE8envCheck          — local static once-flag (u64)
//   __ZZN4HGCV32AllowPixelSizeCastingForHGFormatE8HGFormatE28forcePixelSizeCastingAllowed — local static bool
//   __ZNSt3__111__call_onceERVmPvPFvS2_E — std::__1::call_once — the once-init dispatcher
//   __ZNSt3__117__call_once_proxyB9nqe210106... — the lambda body executed by call_once
//
// The FourCC-based dispatch in HGFormatForCVPixelFormat is a hand-written binary decision tree
// over the input u32 (`%edi`) — mirrored below as a single flat switch. Every case in this port
// was extracted by a full symbolic run of the disasm's control flow (script in the commit
// message references raw-port/re/disasm/Helium.HGCV.HGFormatForCVPixelFormat.s).
//
// The `selector` argument (`%rsi`, mapped to `unsigned long`) selects between the two variants
// of certain multi-plane formats: at every planar/interleaved terminal the code does
// `xorl %eax,%eax; cmpq $0x1,%rsi; sete %al` and then combines the boolean into the returned
// enum. In every observed case this reduces to "return B if selector==1 else A" for specific
// (A,B) pairs (documented per-case below). We name it `selector` — its exact CoreVideo meaning
// is not decoded here (frontier), only the observable effect on the return value.

// -------- types --------

/**
 * HGFormat is an unsigned-int enum in Helium (values referenced here run 1..0x22).
 * Symbolic names are not visible from the disassembly of HGCV — the returned values are
 * raw numeric enum members. We preserve their numeric identity via a branded number type.
 */
export type HGFormat = number & { readonly __brand: "HGFormat" };

/** Constructor helper — asserts an unsigned 32-bit range and brands the value. */
export function HGFormat(v: number): HGFormat {
  return ((v | 0) & 0xffffffff) as unknown as HGFormat;
}

// -------- HGFormatForCVPixelFormat --------

/**
 * @Helium 0x90b70  HGCV::HGFormatForCVPixelFormat(unsigned int cvFmt, unsigned long selector)
 *
 * Faithful transcription of the flat dispatch. Every case is annotated with the terminal
 * address in the disasm; unmatched cvFmt values fall through to the shared warning epilogue
 * at @0x90edb which calls `HGLogger::warning("unsupported HGFormat for CoreVideo format %c%c%c%c\n", ...)`
 * and returns 0.
 *
 * `selector==1` semantics per terminal (unchanged from asm):
 *   @0x90d88  return (selector==1) ? 0x23 : 0x22       (`orl $0x22, %eax` on al)
 *   @0x90dfb  return (selector==1) ? 0xb  : 0x3        (`leal 0x3(,%rax,8), %eax`)
 *   @0x90e6e  return (selector==1) ? 0xa  : 0x1        (`leal (%rax,%rax,8), %eax; incl %eax`)
 */
export function HGFormatForCVPixelFormat(cvFmt: number, selector: number): HGFormat {
  const cv = cvFmt >>> 0;
  const planarA_B = (a: number, b: number) => HGFormat(selector === 1 ? b : a);

  switch (cv) {
    // --- constant-only terminals ---
    case 0x00000020: return HGFormat(0x16); // @0x90e7d (via 0x90e64 je from cmp $0x20)
    case 0x32433038: return HGFormat(0xa);  // @0x90eab '80C2'
    case 0x32433066: return HGFormat(0xd);  // @0x90d82 'f0C2'
    case 0x32433068: return HGFormat(0xc);  // @0x90eb7 'h0C2'
    case 0x32433136: return HGFormat(0xb);  // @0x90ecf '61C2'
    case 0x32767579: return HGFormat(0xe);  // @0x90bc0 'yuv2'
    case 0x42475241: return HGFormat(0x17); // @0x90ec3 'ARGB'
    case 0x4c303038: return HGFormat(0x1);  // @0x90e18 (movl $0x1, %eax) '800L'
    case 0x4c303066: return HGFormat(0x7);  // @0x90e35 'f00L'
    case 0x4c303068: return HGFormat(0x5);  // @0x90e99 'h00L'
    case 0x4c303136: return HGFormat(0x3);  // @0x90e93 '610L'
    case 0x52474241: return HGFormat(0x18); // @0x90e9f 'ABGR'
    case 0x52476641: return HGFormat(0x1c); // @0x90eb1 'AfGR'
    case 0x52476841: return HGFormat(0x1b); // @0x90d5c 'AhGR'
    case 0x7234666c: return HGFormat(0x1d); // @0x90ea5 'lf4r' (Apple 'rf4l')
    case 0x72343038: return HGFormat(0x16); // @0x90e7d '804r'
    case 0x79343038: return HGFormat(0x16); // @0x90e7d '804y'
    case 0x76323130: return HGFormat(0x1f); // @0x90ebd '012v'
    case 0x76323136: return HGFormat(0x10); // @0x90ed5 '612v'
    case 0x79343136: return HGFormat(0x1a); // @0x90ec9 '614y'
    case 0x79757666: return HGFormat(0xf);  // @0x90e5b 'fvuy'
    case 0x79757673: return HGFormat(0xf);  // @0x90e5b 'svuy'

    // --- selector-dependent terminals ---
    // @0x90d88 (0x23 : 0x22)
    case 0x26787630: // '&xv0'
    case 0x26787632: // '&xv2'
    case 0x2d787630: // '-xv0'
    case 0x2d787632: // '-xv2'
      return planarA_B(0x22, 0x23);

    // @0x90dfb (0xb : 0x3)
    case 0x73346173: // 'sa4s'
    case 0x73763232: // 'sv22'
    case 0x73763434: // 'sv44'
    case 0x78343230: // 'x420'
    case 0x78343232: // 'x422'
    case 0x78343434: // 'x444'
    case 0x78663230: // 'xf20'
    case 0x78663232: // 'xf22'
    case 0x78663434: // 'xf44'
      return planarA_B(0x3, 0xb);

    // @0x90e6e (0xa : 0x1)
    case 0x26386630: // '&8f0'
    case 0x26387630: // '&8v0'
    case 0x2d386630: // '-8f0'
    case 0x2d387630: // '-8v0'
    case 0x34323066: // '420f'
    case 0x34323076: // '420v'
    case 0x34323266: // '422f'
    case 0x34323276: // '422v'
    case 0x34343466: // '444f'
    case 0x34343476: // '444v'
    case 0x76306138: // 'v0a8' (mac: '8a0v')
      return planarA_B(0x1, 0xa);

    // --- unmatched: warning path @0x90edb, returns 0 ---
    default:
      // @0x90ee8..@0x90efe extracts 4 signed bytes of cv (via sarl/movsbl) and passes to
      // `HGLogger::warning("unsupported HGFormat for CoreVideo format %c%c%c%c\n", %c,%c,%c,%c)`.
      // Then `xorl %eax,%eax; popq %rbp; retq` -> returns 0.
      // FRONTIER: HGLogger::warning is an external variadic C++ function; we surface the
      // diagnostic as a console.warn so the audit trail survives, without inventing behavior.
      const b0 = (cv >>> 24) & 0xff;   // NOTE: asm does `sarl $0x18` (arith shift) then movsbl to
      const b1 = (cv >>> 16) & 0xff;   // sign-extend; the printf %c prints the low byte modulo 256
      const b2 = (cv >>> 8) & 0xff;    // either way, so we forward the raw bytes here.
      const b3 = cv & 0xff;
      const chars = String.fromCharCode(b3, b2, b1, b0); // %c%c%c%c is printed in the order arg-3..arg-0
      // (The asm passes %esi=cv>>24, %edx=cv>>16, %ecx=cv>>8, %r8d=cv&0xff and printf reads
      // them left-to-right, so the string is byte3, byte2, byte1, byte0 of the u32.)
      console.warn(`unsupported HGFormat for CoreVideo format ${chars}`);
      return HGFormat(0);
  }
}

// -------- CVPixelFormatForHGFormat --------

/**
 * @Helium 0x90f10  HGCV::CVPixelFormatForHGFormat(HGFormat hg, unsigned long selector) -> unsigned int
 *
 * Two-step decode:
 *   1. compute `c = (hg - 1) & 0xffffffff`; if c < 0x21 AND bit-c is set in the 33-bit bitmap
 *      0x1DFE0FE57, index the table at @Helium 0x3cd0a8 (u32[c]) and return it.
 *   2. otherwise, `HGFormatUtils::toString(hg)` + `HGLogger::warning(...)` and return 0x42475241 ('ARGB').
 *
 * NOTE — the `unsigned long` second argument is passed but the function body never reads it,
 * so we accept-and-ignore it here (matching the asm which never touches %rsi).
 *
 * @const CV_TABLE — the 33-entry u32 table at @Helium 0x3cd0a8, transcribed verbatim from the
 * binary via `struct.unpack_from("<33I", ...)`. Zero entries at indices where the bitmap bit is
 * clear are unreachable (guarded by the AND with the bit test).
 * @const BITMAP    — 0x1DFE0FE57 (33 bits), verbatim from the `movabsq` immediate at @0x90f19.
 */
export function CVPixelFormatForHGFormat(hg: HGFormat, _selector?: number): number {
  const c = (((hg as unknown as number) - 1) >>> 0);
  const BITMAP = 0x1DFE0FE57n; // @0x90f19 movabsq $0x1DFE0FE57, %rdx
  // c < 0x21 unsigned AND bit-c of BITMAP is set
  if (c < 0x21 && ((BITMAP >> BigInt(c)) & 1n) === 1n) {
    return CV_TABLE[c]! >>> 0;
  }
  // @0x90f39 warning path; @0x90f4f `movl $0x42475241, %eax` = 'ARGB'
  console.warn(
    // FRONTIER: HGFormatUtils::toString(HGFormat) — the real code prints its returned C-string.
    `unsupported CoreVideo format for HGFormat ${(hg as unknown as number).toString()}`
  );
  return 0x42475241 >>> 0;
}

/**
 * The 33-entry lookup table at @Helium 0x3cd0a8 (raw-port/re/disasm decode verified by direct
 * `struct.unpack_from("<33I", ...)` on the thin x86_64 binary of Helium.framework).
 * @table cv-for-hg table @Helium 0x3cd0a8
 */
export const CV_TABLE: readonly number[] = [
  0x4c303038, 0x4c303038, 0x4c303136, 0x00000000, 0x4c303068, 0x00000000, 0x4c303066, 0x00000000,
  0x00000000, 0x32433038, 0x32433136, 0x32433068, 0x32433066, 0x42475241, 0x42475241, 0x52476841,
  0x00000000, 0x00000000, 0x00000000, 0x00000000, 0x00000000, 0x42475241, 0x42475241, 0x42475241,
  0x52476841, 0x52476841, 0x52476841, 0x52476641, 0x52476641, 0x00000000, 0x42475241, 0x42475241,
  0x52476841,
];

// -------- AllowPixelSizeCastingForHGFormat --------

/**
 * @Helium 0x90f60  HGCV::AllowPixelSizeCastingForHGFormat(HGFormat) -> bool
 *
 * The function has TWO layers:
 *
 *  A) A `std::call_once`-protected environment probe (@0x90f6b..@0x90f9d).
 *     The u64 flag `HGCV::AllowPixelSizeCastingForHGFormat::envCheck` (static local, initialized to -1)
 *     is checked once; on first call, `__call_once_proxy` invokes a lambda whose body is NOT in
 *     this function's disasm (it's the compiler-generated proxy at
 *     __ZNSt3__117__call_once_proxyB9nqe210106INS_5tupleIJOZN4HGCV32AllowPixelSizeCastingForHGFormatE8HGFormatE3$_0EEEEEvPv).
 *     That lambda's observable side-effect is to write into the static bool
 *     `HGCV::AllowPixelSizeCastingForHGFormat::forcePixelSizeCastingAllowed` (probably an env-var read).
 *     FRONTIER: the lambda body is a separately-disassembled callee not ported here.
 *
 *  B) The actual predicate (@0x90f9f..@0x90fbc):
 *        `((uint32)(hg - 0x19) < 0xFFFFFFFE)  &&  (hg != 0x1b)   ||   forcePixelSizeCastingAllowed`
 *     Reading `setb %cl` after `cmpl $-0x2, %eax`: %eax = (uint32)(hg-0x19). The immediate -2 is
 *     compared as UNSIGNED (setb = below), so this is `hg-0x19 <u 0xFFFFFFFE`, which is only false
 *     when `hg-0x19 == 0xFFFFFFFF` i.e. hg == 0x18 ... wait, 0x18-0x19 = -1 = 0xFFFFFFFF, not
 *     <u 0xFFFFFFFE. And hg == 0x1a: 0x1a-0x19 = 1 = <u 0xFFFFFFFE = true. So the ONLY hg making
 *     that cl==0 is hg == 0x18 (produces 0xFFFFFFFF which is NOT below 0xFFFFFFFE).
 *
 *     Actually re-reading — `leal -0x19(%rbx), %eax; cmpl $-0x2, %eax; setb %cl`
 *     `-0x2` as an imm32 to cmpl sign-extends to 0xFFFFFFFE. `setb` uses the CF flag from the
 *     UNSIGNED compare `%eax vs 0xFFFFFFFE`. So cl = 1 iff (hg-0x19) <u 0xFFFFFFFE.
 *     (hg-0x19) values that are >=u 0xFFFFFFFE are 0xFFFFFFFE (hg=0x17) and 0xFFFFFFFF (hg=0x18).
 *     So cl=0 for hg∈{0x17, 0x18}. Otherwise cl=1.
 *
 *   And `cmpl $0x1b, %ebx; setne %al` -> al = (hg != 0x1b).
 *   Then `andb %cl, %al` -> result of the boolean AND.
 *   Then `orb forcePixelSizeCastingAllowed, %al` -> ORed with the global static.
 *   The full 32-bit eax is returned; the caller uses only the low byte (boolean).
 *
 * Final decoded predicate:
 *   allow = ( hg != 0x17 AND hg != 0x18 AND hg != 0x1b ) OR forcePixelSizeCastingAllowed
 */
export function AllowPixelSizeCastingForHGFormat(hg: HGFormat): boolean {
  // Trigger the once-init side-effect (FRONTIER stub — the lambda body is not transcribed).
  _envCheck_call_once();
  const h = (hg as unknown as number) >>> 0;
  const cl = (((h - 0x19) >>> 0) < 0xFFFFFFFE) ? 1 : 0;
  const al = (h !== 0x1b) ? 1 : 0;
  const andResult = cl & al;
  return (andResult | (_forcePixelSizeCastingAllowed ? 1 : 0)) !== 0;
}

/** Static local `HGCV::AllowPixelSizeCastingForHGFormat::forcePixelSizeCastingAllowed` (u8; treated as bool). */
let _forcePixelSizeCastingAllowed = false;

/** Static local `HGCV::AllowPixelSizeCastingForHGFormat::envCheck` — call-once flag (u64, sentinel -1). */
let _envCheckDone = false;

/**
 * Stand-in for the once-init lambda body (@0x90f88 leaq references
 * `__ZNSt3__117__call_once_proxy...INS_5tupleIJOZN4HGCV32AllowPixelSizeCastingForHGFormatE8HGFormatE3$_0EEEEEvPv`).
 * FRONTIER: the lambda's body is not yet transcribed; we invoke it exactly once and leave
 * `_forcePixelSizeCastingAllowed` at its zero default. This models the observable state of a
 * clean run (no env override) without inventing the env-probe logic.
 */
function _envCheck_call_once(): void {
  if (_envCheckDone) return;
  _envCheckDone = true;
  // No env-var read is transcribed here; the real body is a distinct symbol
  // (@Helium __ZNSt3__117__call_once_proxy... $_0 lambda) whose disasm was not requested.
  // A dedicated port would replace this stub with the decoded env-var lookup.
}
