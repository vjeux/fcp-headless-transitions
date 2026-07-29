// raw-port: std::__1::basic_ostringstream<char, char_traits<char>, allocator<char>>::~basic_ostringstream()
//   D1 (complete-object) destructor — libc++ template instantiation compiled into Flexo.
//
//   @Flexo 0x00cfccf0  __ZNSt3__119basic_ostringstreamIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev
//
// re/disasm:
//   raw-port/re/disasm/Flexo.__ZNSt3__119basic_ostringstreamIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev.s
//
// This is a libc++ standard-library instantiation, NOT an FCP class. It is reachable from FCP code
// that constructs `std::ostringstream` on the stack; its dtor (this function) is emitted into the
// Flexo binary at 0x00cfccf0. Every callee is a libc++ or libc extern; there are no in-scope FCP
// callees, and depgraph reports 0 external deps to a ported symbol.
//
// OBJECT LAYOUT (basic_ostringstream, recovered from the D1 body):
//   The class inherits VIRTUALLY from basic_ios<char> and CONTAINS a basic_stringbuf<char> subobject
//   between the ostream vptr and the (virtually-based) basic_ios subobject. Total size 0xC0 bytes.
//
//   +0x00  vptr for basic_ostringstream (main vtable, ostream side)      @0xcfcd08
//   +0x08  vptr for basic_stringbuf subobject                            @0xcfcd1e / @0xcfcd3c
//   +0x10..+0x48  basic_stringbuf<char> instance state — includes:
//     +0x10  std::locale subobject (destroyed by locale::~locale @0xcfcd44)
//     +0x48  byte flag — bit 0 set iff long-string mode (heap buffer allocated) @0xcfcd22
//     +0x58  char* — the heap buffer pointer when long-string mode is on;
//            freed via operator delete when 0x48&1 (@0xcfcd28/@0xcfcd2c)
//   +0x70  basic_ios<char> subobject (the virtual base). D2 lives here; destroyed by
//          basic_ios::~basic_ios @0xcfcd63 (tail-call).
//   Also written: (dst + vbase-offset), where vbase-offset is VTT[0][-3] — the virtual-base
//          adjuster for the primary vtable. That word receives VTT[3] at @0xcfcd0f.
//
// CONTROL FLOW (line-for-line):
//   1. save rdi (this) in rbx
//   2. r14 = &VTT for basic_ostringstream                          @0xcfccfa
//      rax = VTT[0]                                                @0xcfcd01  (primary vtable ptr for ostream side)
//      rcx = VTT[3] (VTT+0x18)                                     @0xcfcd04  (secondary vtable ptr for the virtual basic_ios base)
//   3. *(this) = rax                                               @0xcfcd08
//      rax = *(rax - 0x18)   (offset-to-virtual-base from primary vtable, sign-extended)  @0xcfcd0b
//      *(this + rax) = rcx                                         @0xcfcd0f  (install secondary vptr in the basic_ios subobject)
//   4. *(this + 0x8) = &basic_stringbuf_vtable + 0x10              @0xcfcd13/@0xcfcd1a/@0xcfcd1e
//      (arm the object as a basic_stringbuf while running its own state teardown)
//   5. if (*(u8*)(this + 0x48) & 1) { operator delete(*(this+0x58)); }   @0xcfcd22..@0xcfcd2c
//   6. *(this + 0x8) = &basic_streambuf_vtable + 0x10              @0xcfcd31/@0xcfcd38/@0xcfcd3c
//      (demote from stringbuf to its base streambuf for the base subobject dtor path)
//   7. locale::~locale(this + 0x10)                                @0xcfcd40/@0xcfcd44
//   8. basic_ostream::~basic_ostream(this, VTT+0x8)                @0xcfcd49..@0xcfcd53
//      (D2 base-subobject dtor — sub-VTT passes the ostream's own vtable slot)
//   9. this += 0x70;   TAIL-JMP basic_ios::~basic_ios(this)        @0xcfcd58..@0xcfcd63
//
// EVERY callq/jmp target here is a libc++ or libc extern (outside the 5-framework port scope):
//   __ZdlPv                                       @stub 0x1497404  — operator delete (libc++/libc)
//   __ZNSt3__16localeD1Ev                         @stub 0x14973ce  — libc++ locale D1
//   __ZNSt3__113basic_ostreamIcNS_11char_traitsIcEEED2Ev @stub 0x1497344 — libc++ ostream D2
//   __ZNSt3__19basic_iosIcNS_11char_traitsIcEEED2Ev      @stub 0x14973e6 — libc++ basic_ios D2
// Per PORTING_SPEC these are modelled as loud boundary stubs; the dtor itself DOES real work
// (vtable/vbase writes, conditional free, sequencing) and is transcribed in full below.

// -------- frontier / external boundary --------

/**
 * Loud boundary for libc++ `operator delete(void*)`.
 * @extern @Flexo stub 0x1497404 ## symbol stub for: __ZdlPv
 * True out-of-scope extern (libc++). Called from @0xcfcd2c when the long-string flag is on.
 */
function __ZdlPv(_p: unknown): void {
  throw new Error(
    "__ZdlPv (operator delete) @extern-stub 0x1497404 — out-of-scope libc++/libc boundary",
  );
}

/**
 * Loud boundary for libc++ `std::__1::locale::~locale()`.
 * @extern @Flexo stub 0x14973ce ## symbol stub for: __ZNSt3__16localeD1Ev
 * True out-of-scope extern (libc++). Called from @0xcfcd44 on (this+0x10).
 */
function __ZNSt3__16localeD1Ev(_this: unknown): void {
  throw new Error(
    "std::__1::locale::~locale @extern-stub 0x14973ce — out-of-scope libc++ boundary",
  );
}

/**
 * Loud boundary for libc++ `std::__1::basic_ostream<char>::~basic_ostream()` (D2, base-subobject).
 * @extern @Flexo stub 0x1497344 ## symbol stub for: __ZNSt3__113basic_ostreamIcNS_11char_traitsIcEEED2Ev
 * True out-of-scope extern (libc++). Called from @0xcfcd53 with (rdi=this, rsi=VTT+0x8) so the
 * D2 body uses the correct sub-VTT slot for the ostream sub-vtable.
 */
function __ZNSt3__113basic_ostreamIcNS_11char_traitsIcEEED2Ev(
  _this: unknown,
  _subVtt: unknown,
): void {
  throw new Error(
    "std::__1::basic_ostream<char>::~basic_ostream (D2) @extern-stub 0x1497344 — out-of-scope libc++ boundary",
  );
}

/**
 * Loud boundary for libc++ `std::__1::basic_ios<char>::~basic_ios()` (D2, base-subobject).
 * @extern @Flexo stub 0x14973e6 ## symbol stub for: __ZNSt3__19basic_iosIcNS_11char_traitsIcEEED2Ev
 * True out-of-scope extern (libc++). Tail-called from @0xcfcd63 with rdi = (this + 0x70).
 */
function __ZNSt3__19basic_iosIcNS_11char_traitsIcEEED2Ev(_this: unknown): void {
  throw new Error(
    "std::__1::basic_ios<char>::~basic_ios (D2) @extern-stub 0x14973e6 — out-of-scope libc++ boundary",
  );
}

// -------- libc++ static tables (transcribed as opaque provenance handles) --------

/**
 * VTT for std::__1::basic_ostringstream<char, char_traits<char>, allocator<char>>.
 * @const @Flexo 0xcfccfa  leaq __ZTTNSt3__119basic_ostringstreamIcNS_11char_traitsIcEENS_9allocatorIcEEEE(%rip)
 *
 * A VTT (virtual-table-table) is a libc++/Itanium-ABI construct. Slot [0] is the object's primary
 * vtable-pointer; slot [3] (= VTT+0x18) is the vtable-pointer for the virtual base subobject. The
 * primary vtable at slot[0] embeds an offset-to-virtual-base at *(vtable - 0x18) which the dtor
 * uses at @0xcfcd0b/@0xcfcd0f to locate the virtual base subobject. We model the VTT as an opaque
 * two-slot record; the four-arg dtor never dereferences the vtables — it just re-installs their
 * addresses into the object header words.
 */
type LibcxxVtablePtr = { readonly __brand: "vtable" };
type LibcxxVTT = readonly [
  LibcxxVtablePtr, // VTT[0] — primary vtable for basic_ostringstream (ostream side)
  LibcxxVtablePtr, // VTT[1] — construction vtable slot (unused by this dtor)
  LibcxxVtablePtr, // VTT[2] — construction vtable slot (unused by this dtor)
  LibcxxVtablePtr, // VTT[3] — vtable for basic_ios virtual base subobject
];
const __ZTTNSt3__119basic_ostringstreamIcNS_11char_traitsIcEENS_9allocatorIcEEEE: LibcxxVTT = [
  { __brand: "vtable" } as LibcxxVtablePtr,
  { __brand: "vtable" } as LibcxxVtablePtr,
  { __brand: "vtable" } as LibcxxVtablePtr,
  { __brand: "vtable" } as LibcxxVtablePtr,
];

/**
 * vtable for std::__1::basic_stringbuf<char, ...>. Installed as (&vtable + 0x10) into obj+0x8.
 * @const @Flexo 0xcfcd13  leaq __ZTVNSt3__115basic_stringbufIcNS_11char_traitsIcEENS_9allocatorIcEEEE(%rip)
 * @const @Flexo 0xcfcd1a  addq $0x10, %rax   — skip the two header slots (offset-to-top, typeinfo)
 */
const __ZTVNSt3__115basic_stringbufIcNS_11char_traitsIcEENS_9allocatorIcEEEE: LibcxxVtablePtr = {
  __brand: "vtable",
} as LibcxxVtablePtr;

/**
 * vtable for std::__1::basic_streambuf<char, ...>. Installed as (&vtable + 0x10) into obj+0x8.
 * @const @Flexo 0xcfcd31  movq 0xbf0d40(%rip), %rax  (RIP-relative literal-pool load of the address)
 * @const @Flexo 0xcfcd38  addq $0x10, %rax   — skip the two header slots (offset-to-top, typeinfo)
 */
const __ZTVNSt3__115basic_streambufIcNS_11char_traitsIcEEEE: LibcxxVtablePtr = {
  __brand: "vtable",
} as LibcxxVtablePtr;

// -------- the object under destruction --------

/**
 * Modelled shape of the basic_ostringstream instance being destroyed.
 *
 * Each field cites the exact byte offset accessed by the disasm. Unaccessed slots are omitted;
 * this record documents what THIS dtor touches, not the full 0xC0-byte libc++ layout.
 */
export interface BasicOstringstreamChar {
  /** +0x00 primary vptr slot — receives VTT[0] @0xcfcd08 */
  vptrPrimary: LibcxxVtablePtr | null;
  /** +0x08 stringbuf/streambuf subobject vptr — receives &stringbuf_vt+0x10 then &streambuf_vt+0x10 */
  vptrStringbuf: LibcxxVtablePtr | null;
  /**
   * The virtual base offset word: this dtor writes VTT[3] to *(this + *(VTT[0] - 0x18)).
   * The offset is a signed 64-bit read from the vtable header at slot[-3]. We model the store
   * as a scalar field because the resolved offset is a runtime-constant of the layout (0x70).
   * @0xcfcd0b: movq -0x18(%rax), %rax     — sign-extended vbase-offset
   * @0xcfcd0f: movq %rcx, (%rdi,%rax)     — install VTT[3] at (this + vbase-offset)
   */
  vbaseVptrSlot: LibcxxVtablePtr | null;
  /** +0x10 locale subobject (opaque; only its address is passed to locale::~locale) */
  localeSubobject: unknown;
  /** +0x48 low bit = long-string flag @0xcfcd22 */
  stateByte48: number;
  /** +0x58 heap buffer pointer, valid iff (state48 & 1) @0xcfcd28 */
  heapBuf58: unknown;
  /** +0x70 basic_ios subobject (opaque; only its address is passed to basic_ios::~basic_ios) */
  basicIosSubobject: unknown;
}

// -------- the dtor itself --------

/**
 * std::__1::basic_ostringstream<char>::~basic_ostringstream()  [D1, complete-object]
 *
 * @0xcfccf0 Flexo (libc++ instantiation compiled into Flexo)
 *
 * Faithful line-for-line port of the 35-instruction body. Every step cites its @0xADDR; every
 * callee is a documented libc++/libc extern (see the "frontier / external boundary" section).
 */
export function std__basic_ostringstream_char__D1(
  self: BasicOstringstreamChar,
): void {
  // rbx = rdi (this) — save across the calls below.
  // @0xcfccfa  leaq VTT, %r14   — r14 holds a "cursor" that first points to VTT[0]; later
  //   advanced to VTT+0x8 at @0xcfcd49 for the ostream D2 sub-VTT arg.
  const vtt = __ZTTNSt3__119basic_ostringstreamIcNS_11char_traitsIcEENS_9allocatorIcEEEE;

  // @0xcfcd01  movq (%r14), %rax    — rax = VTT[0]  (primary vtable for the ostream side)
  const vt0: LibcxxVtablePtr = vtt[0];
  // @0xcfcd04  movq 0x18(%r14), %rcx — rcx = VTT[3] (vtable for the virtual basic_ios subobject)
  const vt3: LibcxxVtablePtr = vtt[3];

  // @0xcfcd08  movq %rax, (%rdi)    — install primary vptr
  self.vptrPrimary = vt0;
  // @0xcfcd0b  movq -0x18(%rax), %rax  — read vbase-offset from the primary vtable header
  // @0xcfcd0f  movq %rcx, (%rdi,%rax)  — install secondary vptr at (this + vbase-offset)
  //   For this class the resolved offset is 0x70 (basic_ios subobject start). We store into
  //   the modelled vbase slot; layouts.md notes the vbase-offset is a compile-time constant.
  self.vbaseVptrSlot = vt3;

  // @0xcfcd13  leaq stringbuf_vtable(%rip), %rax
  // @0xcfcd1a  addq $0x10, %rax        — skip vtable header (offset-to-top + typeinfo)
  // @0xcfcd1e  movq %rax, 0x8(%rdi)    — arm stringbuf vptr in the sub-object slot
  self.vptrStringbuf = __ZTVNSt3__115basic_stringbufIcNS_11char_traitsIcEENS_9allocatorIcEEEE;

  // @0xcfcd22  testb $0x1, 0x48(%rdi)
  // @0xcfcd26  je    0xcfcd31            — skip the free when bit-0 is clear (short-string mode)
  if ((self.stateByte48 & 0x1) !== 0) {
    // @0xcfcd28  movq 0x58(%rbx), %rdi   — load heap-buffer pointer
    const buf = self.heapBuf58;
    // @0xcfcd2c  callq __ZdlPv           — operator delete(buf)
    __ZdlPv(buf);
  }

  // @0xcfcd31  movq streambuf_vtable_addr(%rip), %rax
  // @0xcfcd38  addq $0x10, %rax          — skip vtable header
  // @0xcfcd3c  movq %rax, 0x8(%rbx)      — demote sub-object vptr from stringbuf to streambuf
  self.vptrStringbuf = __ZTVNSt3__115basic_streambufIcNS_11char_traitsIcEEEE;

  // @0xcfcd40  leaq 0x10(%rbx), %rdi     — &this->locale
  // @0xcfcd44  callq __ZNSt3__16localeD1Ev
  __ZNSt3__16localeD1Ev(self.localeSubobject);

  // @0xcfcd49  addq $0x8, %r14           — advance VTT cursor to VTT+0x8 (sub-VTT for ostream D2)
  // @0xcfcd4d  movq %rbx, %rdi           — arg1 = this
  // @0xcfcd50  movq %r14, %rsi           — arg2 = VTT+0x8
  // @0xcfcd53  callq __ZNSt3__113basic_ostreamIcNS_11char_traitsIcEEED2Ev
  const subVtt = vtt[1]; // r14 after += 8 points at VTT[1] (a.k.a. VTT+0x8)
  __ZNSt3__113basic_ostreamIcNS_11char_traitsIcEEED2Ev(self, subVtt);

  // @0xcfcd58  addq $0x70, %rbx          — this += 0x70 (virtual base subobject start)
  // @0xcfcd5f  popq %rbx                 — epilogue
  // @0xcfcd60  popq %r14
  // @0xcfcd62  popq %rbp
  // @0xcfcd63  jmp   __ZNSt3__19basic_iosIcNS_11char_traitsIcEEED2Ev   — TAIL CALL
  __ZNSt3__19basic_iosIcNS_11char_traitsIcEEED2Ev(self.basicIosSubobject);
}

/**
 * Alias export: mangled symbol name.
 * @0xcfccf0 Flexo  __ZNSt3__119basic_ostringstreamIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev
 */
export const __ZNSt3__119basic_ostringstreamIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev =
  std__basic_ostringstream_char__D1;
