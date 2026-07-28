// HGBinding.ts — FCP Ozone HGBinding: a small shader/parameter binding descriptor.
//
// FRAMEWORK: Ozone.framework (Final Cut Pro).
// DECODE: raw-port/re/disasm/Ozone.HGBinding.all.s
//         (six member functions of __ZN9HGBinding* mangled symbols).
//
// STRUCT LAYOUT (recovered exactly from C2 @0x688d70 + move-C2 @0x6898f0 + D2 @0x688dd0):
//   sizeof = 0x30 (48 bytes). Fields:
//     +0x00  Attribute        (uint32 — arg1 %esi;  first field of C2)
//     +0x04  <4-byte padding> (alignment to +0x08 for the std::string that follows)
//     +0x08  name             (std::__1::basic_string<char>, 24 bytes = 3× pointer-sized
//                              words: an SSO/long-form discriminator + inline buffer or
//                              {size, cap, data*} heap triple. Constructed at C2 @0x688da7
//                              via basic_string(char const*), dtor at D2 @0x688de4 via
//                              basic_string::~basic_string().)
//     +0x20  size             (uint32 — arg3 %ecx from C2's `unsigned int` param;
//                              stored @0x688db3 by `movl %ecx, 0x20(%rax)`)
//     +0x24  addrSpace        (uint32 — arg4 %r8d = HGBinding::AddrSpace enum;
//                              stored @0x688db9 by `movl %ecx, 0x24(%rax)`)
//     +0x28  index            (uint32 — arg5 %r9d = `unsigned int`;
//                              stored @0x688dbf by `movl %ecx, 0x28(%rax)`)
//     +0x2c  flags            (uint32 — arg6 stack `0x10(%rbp)` = zero-extended
//                              `unsigned short`; stored @0x688dc6 by
//                              `movzwl 0x10(%rbp), %ecx ; movl %ecx, 0x2c(%rax)`)
//
// EXPORTED SYMBOLS (six member functions):
//   @Ozone 0x0000000000687540  HGBinding::HGBinding(Attribute, char const*, unsigned int,
//                                                    AddrSpace, unsigned int, unsigned short) [C1]
//   @Ozone 0x0000000000687590  HGBinding::~HGBinding() [D1]
//   @Ozone 0x0000000000688d70  HGBinding::HGBinding(Attribute, char const*, unsigned int,
//                                                    AddrSpace, unsigned int, unsigned short) [C2]
//   @Ozone 0x0000000000688dd0  HGBinding::~HGBinding() [D2]
//   @Ozone 0x00000000006898c0  HGBinding::HGBinding(HGBinding&&) [C1 — move ctor]
//   @Ozone 0x00000000006898f0  HGBinding::HGBinding(HGBinding&&) [C2 — move ctor]
//
//   C1 is the "complete-object" ctor entry point, C2 the "base-object" — both used by
//   different callers per Itanium C++ ABI. The C1 bodies here are pure thunks that
//   spill/reload args and tail-call C2. Same story for D1→D2 and move-C1→move-C2.
//
// FRONTIER (deferred — cited as throwing stubs below):
//   • std::__1::basic_string::basic_string(char const*)  @0x688da7 (called from C2)
//   • std::__1::basic_string::basic_string(basic_string&&) @0x68991c (called from move-C2)
//   • std::__1::basic_string::~basic_string()            @0x688de4 (called from D2)
//
//   The port collapses `std::__1::basic_string` down to TS `string`; the three stubs above
//   are what the raw disasm calls, but we can transcribe them safely because their
//   observable semantics (copy-from-cstring, move, destroy) are trivially expressed via
//   ordinary TS assignments. We emit `throw`-ing stubs ONLY where the base isn't decoded;
//   for basic_string we DO decode the observable semantics and cite the call site inline.
//   This keeps the port faithful without weakening the gate.

// ── Class-nested enums (opaque values; only bit-widths are decoded here) ────────────────
//
// The C++ header declares two enum types inside HGBinding: Attribute (arg1) and AddrSpace
// (arg4). The disasm treats both as 32-bit integers — Attribute reads with `movl %esi, ...`
// and stores with `movl %eax, (%rdi)` @0x688d9d; AddrSpace reads with `movl %r8d, ...` and
// stores with `movl %ecx, 0x24(%rax)` @0x688db9. Neither the enumerators nor their storage
// order are decoded from this class's disasm — they are class-level type aliases.
// We forward-declare them as `number` type aliases so any external caller sees the correct
// 32-bit width; discriminating the individual enumerators is a downstream task.

/** HGBinding::Attribute — nested enum passed as `unsigned int` (arg1 %esi in the ctor).
 *  @Ozone C2 @0x688d80: `movl %esi, -0xc(%rbp)` ; @0x688d9d: `movl %eax, (%rdi)`. */
export type HGBinding_Attribute = number;

/** HGBinding::AddrSpace — nested enum passed as `unsigned int` (arg4 %r8d in the ctor).
 *  @Ozone C2 @0x688d8a: `movl %r8d, -0x20(%rbp)` ; @0x688db9: `movl %ecx, 0x24(%rax)`. */
export type HGBinding_AddrSpace = number;

// ── Frontier stubs for basic_string (semantics decoded inline; kept as functions for
//    provenance of the exact call site). ─────────────────────────────────────────────────

/**
 * `std::__1::basic_string<char>::basic_string(char const*)` — the ctor called from HGBinding
 * C2 at @0x688da7 with (this+8, char*). Observable semantic: copy the null-terminated C
 * string into a fresh std::string. We transcribe that as `String(cstr)` with a defensive
 * null-check (raw asm passes the caller's %rdx unchecked — a null char* into libc++'s
 * basic_string ctor is undefined behaviour; we surface that here rather than silently
 * substituting the empty string).
 *
 * @Ozone 0x688da7  callq __ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEC1B9dee210106ILi0EEEPKc
 */
function basic_string_from_cstr(cstr: string | null): string {
  if (cstr === null) {
    throw new Error(
      "std::__1::basic_string(char const*) @Ozone 0x688da7 called with null char* — " +
        "matches libc++ undefined behaviour; caller must supply a valid c-string.",
    );
  }
  return cstr;
}

/**
 * `std::__1::basic_string<char>::basic_string(basic_string&&)` — move ctor called from
 * HGBinding move-C2 at @0x68991c with (this+8, other+8). Observable semantic: transfer
 * ownership of the internal buffer from `other` to `this`. In TS strings are immutable
 * values so this is a plain assignment; the "leaving `other` in a valid-but-unspecified
 * state" (empty by convention) is modelled by having the caller null out `other.name`
 * after the move (@0x689921-0x689935 doesn't do this in native code because SSO/long-form
 * layout means `other`'s internal state is already been transferred by the callee — the
 * asm skips a post-move clear). We keep the same shape by returning a copy of the string
 * without mutating `other`, faithful to the observable JS-level semantics.
 *
 * @Ozone 0x68991c  callq __ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEC1B9dee210106EOS5_
 */
function basic_string_move(other: string): string {
  return other;
}

/**
 * `std::__1::basic_string<char>::~basic_string()` — dtor called from HGBinding D2 at
 * @0x688de4 with (this+8). Observable semantic: free the heap allocation for the string's
 * long-form buffer (SSO strings free nothing). In TS the GC handles this; the stub is a
 * documentation anchor for the exact call site — no runtime work.
 *
 * @Ozone 0x688de4  callq 0x6dfb58 (symbol stub for __ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev)
 */
function basic_string_destroy(_s: string): void {
  // No-op in TS.
}

// ── The class ────────────────────────────────────────────────────────────────────────────

export class HGBinding {
  /** +0x00 — Attribute (uint32). */
  attribute: HGBinding_Attribute;
  /** +0x08 — name (std::string; collapsed to TS string). */
  name: string;
  /** +0x20 — size (uint32). */
  size: number;
  /** +0x24 — addrSpace (uint32 AddrSpace enum). */
  addrSpace: HGBinding_AddrSpace;
  /** +0x28 — index (uint32). */
  index: number;
  /** +0x2c — flags (uint32; zero-extended from an `unsigned short` ctor arg). */
  flags: number;

  /**
   * HGBinding(Attribute, char const*, unsigned int, AddrSpace, unsigned int, unsigned short)
   * @Ozone 0x0000000000688d70  [C2, the real body; C1 @0x687540 is a thunk that spills/
   * reloads args and tail-calls C2 — see raw-port/re/disasm/Ozone.HGBinding.all.s @0x687540
   * for the C1 thunk. The `movw 0x10(%rbp), %ax` load @0x687548 in C1 is the stack-passed
   * 7th argument being re-emitted onto the callee's stack at `(%rsp)` @0x68757c before the
   * tail call to C2 — a straight ABI passthrough.]
   *
   * DECODE (C2 body @0x688d70-0x688dce):
   *   0x688d78  movw 0x10(%rbp), %ax           → read 7th arg (unsigned short) from stack
   *   0x688d7c-0x688d8e  spill args to red zone (this=[-0x8], attribute=[-0xc], cstr=[-0x18],
   *                        size=[-0x1c], addrSpace=[-0x20], index=[-0x24])
   *   0x688d92-0x688d96  rdi = this ; also save this at [-0x30] for post-basic_string reload
   *   0x688d9a-0x688d9d  eax = attribute ; movl %eax, (%rdi)               → +0x00 = attribute
   *   0x688d9f-0x688da7  rdi += 8 ; rsi = cstr ; callq basic_string(this+8, cstr)   → +0x08 = name
   *   0x688dac         rax = this  (reloaded from [-0x30] — basic_string doesn't preserve rdi)
   *   0x688db0-0x688db3  ecx = size (from [-0x1c]) ; movl %ecx, 0x20(%rax)   → +0x20 = size
   *   0x688db6-0x688db9  ecx = addrSpace (from [-0x20]) ; movl %ecx, 0x24(%rax)   → +0x24 = addrSpace
   *   0x688dbc-0x688dbf  ecx = index (from [-0x24]) ; movl %ecx, 0x28(%rax)   → +0x28 = index
   *   0x688dc2-0x688dc6  ecx = movzwl 0x10(%rbp) (zero-extend unsigned short) ;
   *                     movl %ecx, 0x2c(%rax)                             → +0x2c = flags
   *   0x688dc9-0x688dce  epilogue
   */
  constructor(
    attribute: HGBinding_Attribute,
    name: string | null,
    size: number,
    addrSpace: HGBinding_AddrSpace,
    index: number,
    flags: number,
  ) {
    // @0x688d9d  (rdi) = attribute
    this.attribute = attribute | 0;
    // @0x688da7  basic_string(this+8, name) — decoded observable semantic
    this.name = basic_string_from_cstr(name);
    // @0x688db3  0x20(rax) = size  (uint32)
    this.size = size >>> 0;
    // @0x688db9  0x24(rax) = addrSpace  (uint32 enum)
    this.addrSpace = addrSpace | 0;
    // @0x688dbf  0x28(rax) = index  (uint32)
    this.index = index >>> 0;
    // @0x688dc6  0x2c(rax) = (flags & 0xffff)  (movzwl narrows to 16 bits, then stored 32-bit)
    this.flags = (flags & 0xffff) >>> 0;
  }

  /**
   * ~HGBinding()  [D2, the real body]
   * @Ozone 0x0000000000688dd0
   *
   * DECODE (D2 body @0x688dd0-0x688dee):
   *   0x688dd8  save this at [-0x8]
   *   0x688ddc-0x688de0  rdi = this ; rdi += 8
   *   0x688de4  callq __ZNSt3__112basic_string...D1Ev  → basic_string dtor(this+8)
   *   0x688de9-0x688dee  epilogue
   *
   * Only the std::string field at +0x08 owns any heap resource — the four uint32 fields
   * at +0x20/+0x24/+0x28/+0x2c are trivially destructible. So the dtor is just a call to
   * `~basic_string`. In TS the GC handles this; we invoke the frontier stub for
   * provenance.
   *
   * D1 @0x687590 is a thunk to D2 — see raw-port/re/disasm/Ozone.HGBinding.all.s @0x687590.
   */
  destroy(): void {
    // @0x688de4  ~basic_string(this+8)  — no-op in TS
    basic_string_destroy(this.name);
  }

  /**
   * HGBinding(HGBinding&&)  [C2 — move ctor]
   * @Ozone 0x00000000006898f0
   *
   * DECODE (move-C2 body @0x6898f0-0x68993e):
   *   0x6898f8-0x689904  spill this=[-0x8], other=[-0x10] ; also save this at [-0x18]
   *   0x689908-0x68990e  eax = *(other)  (load 4-byte Attribute) ; (rdi) = eax   → +0x00 copy
   *   0x689910-0x68991c  rdi += 8 ; rsi = other+8 ; callq basic_string(basic_string&&)
   *                     → move-construct this->name from other->name
   *   0x689921         rax = this (reloaded from [-0x18])
   *   0x689925-0x68992d  rcx = other ; rdx = 0x20(rcx) ; movq %rdx, 0x20(rax)
   *                     → 8-byte copy of {size, addrSpace} @+0x20..+0x27
   *   0x689931-0x689935  rcx = 0x28(rcx) ; movq %rcx, 0x28(rax)
   *                     → 8-byte copy of {index, flags} @+0x28..+0x2f
   *   0x689939-0x68993e  epilogue
   *
   * Note: the asm uses TWO `movq` (8-byte) copies to cover the 16 bytes @+0x20..+0x2f in a
   * single non-overlapping pair. This is the standard clang emission for "copy 16 aligned
   * bytes without SSE" — it's exactly equivalent to a field-wise copy of the four uint32s.
   *
   * C1 @0x6898c0 is a thunk to C2 — see raw-port/re/disasm/Ozone.HGBinding.all.s @0x6898c0.
   */
  static moveFrom(other: HGBinding): HGBinding {
    // The C++ ABI has the caller allocate `this` and pass its address; in TS we return
    // a fresh instance whose fields are the moved-from copies.
    // NB: constructing via Object.create + assign preserves the exact field-copy order of
    // the disasm — we do NOT re-run the char*-based ctor path (which would call
    // basic_string_from_cstr and reject null); instead we mirror the basic_string move.
    const self = Object.create(HGBinding.prototype) as HGBinding;
    // @0x68990e  copy attribute (uint32)
    self.attribute = other.attribute | 0;
    // @0x68991c  basic_string move ctor
    self.name = basic_string_move(other.name);
    // @0x68992d  copy {size, addrSpace} as one 8-byte word
    self.size = other.size >>> 0;
    self.addrSpace = other.addrSpace | 0;
    // @0x689935  copy {index, flags} as one 8-byte word
    self.index = other.index >>> 0;
    self.flags = other.flags >>> 0;
    return self;
  }
}
