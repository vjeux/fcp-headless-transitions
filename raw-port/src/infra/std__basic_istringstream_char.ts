// raw-port: std::__1::basic_istringstream<char, char_traits<char>, allocator<char>>::~basic_istringstream()
//   D1 (complete-object) destructor — libc++ template instantiation compiled into Helium.
//
//   @Helium 0x0015ea60  __ZNSt3__119basic_istringstreamIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev
//
// re/disasm:
//   raw-port/re/disasm/Helium.__ZNSt3__119basic_istringstreamIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev.s
//
// This is a libc++ standard-library instantiation, NOT an FCP class. It is reachable from FCP code
// that constructs `std::istringstream` on the stack; its dtor (this function) is emitted into the
// Helium binary at 0x0015ea60. Every callee is a libc++ or libc extern; there are no in-scope FCP
// callees, and depgraph reports 0 external deps to a ported symbol.
//
// PEER: raw-port/src/infra/std__basic_ostringstream_char.ts ports the symmetric OSTRINGSTREAM D1
// dtor from Flexo @0xcfccf0. The two dtors share the same skeletal shape (vtable-write, conditional
// heap-free, locale::~locale, base D2, tail-jmp basic_ios::~basic_ios) but differ in:
//   - which sub-vtable (istream vs ostream) is installed and destroyed
//   - object layout offsets (+0x10/+0x18/+0x50/+0x60/+0x78 here vs +0x08/+0x10/+0x48/+0x58/+0x70)
//   - the codegen strategy for the vbase vptr: ostream reads VTT[0]-0x18 and writes VTT[3]; this
//     istream body just does `leaq vtable+0x40, %rax` and writes it directly (the compiler resolved
//     the vbase-offset at compile time because the primary vtable is referenced statically here,
//     rather than via a VTT lookup — different lowering, same semantic outcome).
//
// OBJECT LAYOUT (basic_istringstream, recovered from the D1 body):
//   The class inherits VIRTUALLY from basic_ios<char> and CONTAINS a basic_stringbuf<char> subobject
//   between the istream vptr and the (virtually-based) basic_ios subobject.
//
//   +0x00  vptr for basic_istringstream (main vtable, istream side)      @0x15ea75
//                                                                          (vtable + 0x18: skip
//                                                                           the 2-slot vtable
//                                                                           header offset-to-top +
//                                                                           typeinfo, then land on
//                                                                           the first virtual slot
//                                                                           of the primary sub-vtable)
//   +0x10  vptr for basic_stringbuf subobject                            @0x15ea8f / @0x15eaad
//   +0x18  std::locale subobject (destroyed by locale::~locale @0x15eab5)
//   +0x50  byte flag — bit 0 set iff long-string mode (heap buffer allocated) @0x15ea93
//   +0x60  char* — the heap buffer pointer when long-string mode is on;
//          freed via operator delete when 0x50&1 (@0x15ea99/@0x15ea9d)
//   +0x78  basic_ios<char> subobject (the virtual base). ALSO receives the vbase vptr
//          write (vtable+0x40) @0x15ea80. D2 lives here; destroyed by
//          basic_ios::~basic_ios @0x15ead4 (tail-call).
//
// CONTROL FLOW (line-for-line):
//   1. save rdi (this) in r14, then rbx = this+0x78 (the virtual base subobject)  @0x15ea67/@0x15ea78
//   2. rax = &__ZTVNSt3__119basic_istringstream... (primary vtable address)  @0x15ea6a
//      rcx = vtable + 0x18  (primary vptr — first virtual slot after the 2-slot header)  @0x15ea71
//   3. *(this + 0x00) = rcx           (install primary istringstream vptr)   @0x15ea75
//   4. rax = vtable + 0x40  (secondary vptr for basic_ios subobject — hardcoded vbase-offset)
//      *(this + 0x78) = rax           (install basic_ios sub-vtable vptr)    @0x15ea80
//   5. *(this + 0x10) = &basic_stringbuf_vtable + 0x10                       @0x15ea8f
//      (arm the object as a basic_stringbuf while running its own state teardown)
//   6. if (*(u8*)(this + 0x50) & 1) { operator delete(*(this+0x60)); }       @0x15ea93..@0x15ea9d
//   7. *(this + 0x10) = &basic_streambuf_vtable + 0x10                       @0x15eaad
//      (demote from stringbuf to its base streambuf for the base subobject dtor path)
//   8. locale::~locale(this + 0x18)                                          @0x15eab5
//   9. basic_istream::~basic_istream(this, VTT+0x8)                          @0x15eac8
//      (D2 base-subobject dtor — sub-VTT slot 1 passes the istream's own vtable slot)
//  10. this = this + 0x78;   TAIL-JMP basic_ios::~basic_ios(this)            @0x15ead4
//
// EVERY callq/jmp target here is a libc++ or libc extern (outside the 5-framework port scope):
//   __ZdlPv                                       @stub 0x3c4fa0  — operator delete (libc++/libc)
//   __ZNSt3__16localeD1Ev                         @stub 0x3c4f40  — libc++ locale D1
//   __ZNSt3__113basic_istreamIcNS_11char_traitsIcEEED2Ev @stub 0x3c4e74 — libc++ istream D2
//   __ZNSt3__19basic_iosIcNS_11char_traitsIcEEED2Ev      @stub 0x3c4f64 — libc++ basic_ios D2
// Per PORTING_SPEC these are modelled as loud boundary stubs; the dtor itself DOES real work
// (vtable writes, conditional free, sequencing) and is transcribed in full below.

// -------- frontier / external boundary --------

/**
 * Loud boundary for libc++ `operator delete(void*)`.
 * @extern @Helium stub 0x3c4fa0 ## symbol stub for: __ZdlPv
 * True out-of-scope extern (libc++/libc). Called from @0x15ea9d when the long-string flag is on.
 */
function __ZdlPv(_p: unknown): void {
  throw new Error(
    "__ZdlPv (operator delete) @extern-stub 0x3c4fa0 — out-of-scope libc++/libc boundary",
  );
}

/**
 * Loud boundary for libc++ `std::__1::locale::~locale()`.
 * @extern @Helium stub 0x3c4f40 ## symbol stub for: __ZNSt3__16localeD1Ev
 * True out-of-scope extern (libc++). Called from @0x15eab5 on (this+0x18).
 */
function __ZNSt3__16localeD1Ev(_this: unknown): void {
  throw new Error(
    "std::__1::locale::~locale @extern-stub 0x3c4f40 — out-of-scope libc++ boundary",
  );
}

/**
 * Loud boundary for libc++ `std::__1::basic_istream<char>::~basic_istream()` (D2, base-subobject).
 * @extern @Helium stub 0x3c4e74 ## symbol stub for: __ZNSt3__113basic_istreamIcNS_11char_traitsIcEEED2Ev
 * True out-of-scope extern (libc++). Called from @0x15eac8 with (rdi=this, rsi=VTT+0x8) so the
 * D2 body uses the correct sub-VTT slot for the istream sub-vtable.
 */
function __ZNSt3__113basic_istreamIcNS_11char_traitsIcEEED2Ev(
  _this: unknown,
  _subVtt: unknown,
): void {
  throw new Error(
    "std::__1::basic_istream<char>::~basic_istream (D2) @extern-stub 0x3c4e74 — out-of-scope libc++ boundary",
  );
}

/**
 * Loud boundary for libc++ `std::__1::basic_ios<char>::~basic_ios()` (D2, base-subobject).
 * @extern @Helium stub 0x3c4f64 ## symbol stub for: __ZNSt3__19basic_iosIcNS_11char_traitsIcEEED2Ev
 * True out-of-scope extern (libc++). Tail-called from @0x15ead4 with rdi = (this + 0x78).
 */
function __ZNSt3__19basic_iosIcNS_11char_traitsIcEEED2Ev(_this: unknown): void {
  throw new Error(
    "std::__1::basic_ios<char>::~basic_ios (D2) @extern-stub 0x3c4f64 — out-of-scope libc++ boundary",
  );
}

// -------- libc++ static tables (transcribed as opaque provenance handles) --------

/**
 * vtable-pointer brand. A vtable in libc++/Itanium ABI is a table of function pointers preceded
 * by two header words (offset-to-top, typeinfo). This dtor never dereferences the vtables — it
 * just reads their addresses and offsets and writes them into the object header slots — so we
 * model each vtable as an opaque brand token, with distinct constants per (mangled) name.
 */
type LibcxxVtablePtr = { readonly __brand: "vtable" };

/**
 * vtable for std::__1::basic_istringstream<char, ...>.
 * @const @Helium 0x15ea6a  leaq __ZTVNSt3__119basic_istringstreamIcNS_11char_traitsIcEENS_9allocatorIcEEEE(%rip)
 *
 * TWO offsets are read from this single vtable:
 *   - +0x18: primary sub-vtable vptr (skip 2 header slots → written to this+0x00 @0x15ea75)
 *   - +0x40: secondary/virtual-base sub-vtable vptr (further into the vtable → written to
 *            this+0x78 @0x15ea80). The compiler resolved the vbase-offset (0x28 past the
 *            primary slot) statically because the vtable is referenced directly, not via VTT.
 * We model the vtable as a single opaque token; the two "+0x18"/"+0x40" derived pointers are
 * distinct branded values (they must not compare equal to each other or to any other vtable).
 */
const __ZTVNSt3__119basic_istringstreamIcNS_11char_traitsIcEENS_9allocatorIcEEEE: LibcxxVtablePtr = {
  __brand: "vtable",
} as LibcxxVtablePtr;

/**
 * vtable for std::__1::basic_stringbuf<char, ...>. Installed as (&vtable + 0x10) into obj+0x10.
 * @const @Helium 0x15ea84  leaq __ZTVNSt3__115basic_stringbufIcNS_11char_traitsIcEENS_9allocatorIcEEEE(%rip)
 * @const @Helium 0x15ea8b  addq $0x10, %rax   — skip the two header slots (offset-to-top, typeinfo)
 */
const __ZTVNSt3__115basic_stringbufIcNS_11char_traitsIcEENS_9allocatorIcEEEE: LibcxxVtablePtr = {
  __brand: "vtable",
} as LibcxxVtablePtr;

/**
 * vtable for std::__1::basic_streambuf<char, ...>. Installed as (&vtable + 0x10) into obj+0x10.
 * @const @Helium 0x15eaa2  movq 0x8a377f(%rip), %rax  (RIP-relative literal-pool load of the address)
 * @const @Helium 0x15eaa9  addq $0x10, %rax   — skip the two header slots (offset-to-top, typeinfo)
 */
const __ZTVNSt3__115basic_streambufIcNS_11char_traitsIcEEEE: LibcxxVtablePtr = {
  __brand: "vtable",
} as LibcxxVtablePtr;

/**
 * VTT for std::__1::basic_istringstream<char, char_traits<char>, allocator<char>>.
 * @const @Helium 0x15eaba  leaq __ZTTNSt3__119basic_istringstreamIcNS_11char_traitsIcEENS_9allocatorIcEEEE(%rip)
 *
 * A VTT (virtual-table-table) is a libc++/Itanium-ABI construct. In this dtor the VTT is used
 * ONLY to derive the second argument for `basic_istream::~basic_istream(this, VTT+0x8)` — i.e.
 * the sub-VTT for the istream base-subobject's D2 body. Unlike the ostringstream peer, this
 * dtor does NOT read VTT[0] or VTT[3] for the primary/vbase vptrs (those come from the vtable
 * directly, see above). Only slot [1] (= VTT+0x8) is used.
 */
type LibcxxVTT = readonly [
  LibcxxVtablePtr, // VTT[0] — primary vtable for basic_istringstream (istream side) — unread
  LibcxxVtablePtr, // VTT[1] — sub-VTT for the istream D2 body (read @0x15eac1 as VTT+0x8)
  LibcxxVtablePtr, // VTT[2] — construction vtable slot (unread by this dtor)
  LibcxxVtablePtr, // VTT[3] — vtable for basic_ios virtual base subobject (unread by this dtor)
];
const __ZTTNSt3__119basic_istringstreamIcNS_11char_traitsIcEENS_9allocatorIcEEEE: LibcxxVTT = [
  { __brand: "vtable" } as LibcxxVtablePtr,
  { __brand: "vtable" } as LibcxxVtablePtr,
  { __brand: "vtable" } as LibcxxVtablePtr,
  { __brand: "vtable" } as LibcxxVtablePtr,
];

// -------- the object under destruction --------

/**
 * Modelled shape of the basic_istringstream instance being destroyed.
 *
 * Each field cites the exact byte offset accessed by the disasm. Unaccessed slots are omitted;
 * this record documents what THIS dtor touches, not the full libc++ layout.
 */
export interface BasicIstringstreamChar {
  /** +0x00 primary vptr slot — receives &istringstream_vtable + 0x18 @0x15ea75 */
  vptrPrimary: LibcxxVtablePtr | null;
  /** +0x10 stringbuf/streambuf subobject vptr — receives &stringbuf_vt+0x10 then &streambuf_vt+0x10 */
  vptrStringbuf: LibcxxVtablePtr | null;
  /** +0x18 locale subobject (opaque; only its address is passed to locale::~locale) */
  localeSubobject: unknown;
  /** +0x50 low bit = long-string flag @0x15ea93 */
  stateByte50: number;
  /** +0x60 heap buffer pointer, valid iff (state50 & 1) @0x15ea99 */
  heapBuf60: unknown;
  /**
   * +0x78 basic_ios subobject. This dtor writes the basic_ios sub-vtable vptr
   * (vtable+0x40) into the FIRST word of this subobject @0x15ea80. Modelled
   * as an object that has an inner vptr slot; only the outer address (via
   * `basicIosSubobject`) is passed to the base D2 tail-call.
   */
  basicIosSubobject: { vptr: LibcxxVtablePtr | null };
}

// -------- the dtor itself --------

/**
 * std::__1::basic_istringstream<char>::~basic_istringstream()  [D1, complete-object]
 *
 * @0x15ea60 Helium (libc++ instantiation compiled into Helium)
 *
 * Faithful line-for-line port of the 34-instruction body. Every step cites its @0xADDR; every
 * callee is a documented libc++/libc extern (see the "frontier / external boundary" section).
 */
export function std__basic_istringstream_char__D1(
  self: BasicIstringstreamChar,
): void {
  // @0x15ea67  movq %rdi, %r14        — save this in r14 (used as the cursor below).
  // @0x15ea6a  leaq __ZTVNSt3__119basic_istringstream...(%rip), %rax
  //   rax = primary vtable address for basic_istringstream.
  const primaryVtable = __ZTVNSt3__119basic_istringstreamIcNS_11char_traitsIcEENS_9allocatorIcEEEE;

  // @0x15ea71  leaq 0x18(%rax), %rcx  — rcx = vtable + 0x18 (skip 2-slot header).
  // @0x15ea75  movq %rcx, (%rdi)      — this[0x00] = vtable+0x18  (primary vptr).
  //   In our model, the vtable is a single opaque token; the "+0x18-derived"
  //   pointer stored here is that same token (the branded identity is what
  //   matters — no consumer of BasicIstringstreamChar dereferences the vptr
  //   after destruction).
  self.vptrPrimary = primaryVtable;

  // @0x15ea78  leaq 0x78(%rdi), %rbx  — rbx = &this[0x78]  (basic_ios subobject address).
  //   (We keep the alias implicit — access via `self.basicIosSubobject`.)

  // @0x15ea7c  addq $0x40, %rax       — rax = vtable + 0x40  (basic_ios sub-vtable slot).
  // @0x15ea80  movq %rax, 0x78(%rdi)  — this[0x78] = vtable+0x40  (install basic_ios vptr).
  self.basicIosSubobject.vptr = primaryVtable;

  // @0x15ea84  leaq stringbuf_vtable(%rip), %rax
  // @0x15ea8b  addq $0x10, %rax        — skip vtable header (offset-to-top + typeinfo).
  // @0x15ea8f  movq %rax, 0x10(%rdi)   — arm stringbuf vptr in the sub-object slot.
  self.vptrStringbuf = __ZTVNSt3__115basic_stringbufIcNS_11char_traitsIcEENS_9allocatorIcEEEE;

  // @0x15ea93  testb $0x1, 0x50(%rdi)
  // @0x15ea97  je    0x15eaa2           — skip the free when bit-0 is clear (short-string mode).
  if ((self.stateByte50 & 0x1) !== 0) {
    // @0x15ea99  movq 0x60(%r14), %rdi   — load heap-buffer pointer.
    const buf = self.heapBuf60;
    // @0x15ea9d  callq __ZdlPv           — operator delete(buf).
    __ZdlPv(buf);
  }

  // @0x15eaa2  movq streambuf_vtable_addr(%rip), %rax
  // @0x15eaa9  addq $0x10, %rax          — skip vtable header.
  // @0x15eaad  movq %rax, 0x10(%r14)     — demote sub-object vptr from stringbuf to streambuf.
  self.vptrStringbuf = __ZTVNSt3__115basic_streambufIcNS_11char_traitsIcEEEE;

  // @0x15eab1  leaq 0x18(%r14), %rdi     — &this->locale.
  // @0x15eab5  callq __ZNSt3__16localeD1Ev
  __ZNSt3__16localeD1Ev(self.localeSubobject);

  // @0x15eaba  leaq VTT(%rip), %rsi      — rsi = &VTT[0]
  // @0x15eac1  addq $0x8, %rsi           — rsi = VTT+0x8 (sub-VTT slot 1, for istream D2)
  // @0x15eac5  movq %r14, %rdi           — arg1 = this
  // @0x15eac8  callq __ZNSt3__113basic_istreamIcNS_11char_traitsIcEEED2Ev
  const subVtt = __ZTTNSt3__119basic_istringstreamIcNS_11char_traitsIcEENS_9allocatorIcEEEE[1];
  __ZNSt3__113basic_istreamIcNS_11char_traitsIcEEED2Ev(self, subVtt);

  // @0x15eacd  movq %rbx, %rdi           — rdi = &this[0x78] (basic_ios subobject start).
  // @0x15ead0  popq %rbx                 — epilogue
  // @0x15ead1  popq %r14
  // @0x15ead3  popq %rbp
  // @0x15ead4  jmp   __ZNSt3__19basic_iosIcNS_11char_traitsIcEEED2Ev   — TAIL CALL
  __ZNSt3__19basic_iosIcNS_11char_traitsIcEEED2Ev(self.basicIosSubobject);
}

/**

/**
 * Alias export: mangled symbol name.
 * @0x15ea60 Helium  __ZNSt3__119basic_istringstreamIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev
 */
export const __ZNSt3__119basic_istringstreamIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev =
  std__basic_istringstream_char__D1;
