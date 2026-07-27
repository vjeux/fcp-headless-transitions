// OZDropZoneTypeUndoParams — POD parameters struct for a "drop-zone type change" undo record
// in Ozone.framework. FAITHFUL PORT — do NOT approximate. Every method cites @0xADDR (Ozone).
//
// Struct layout (0xe0 = 224 bytes; recovered from ctor @0x106b40, dtor @0x107880, op= @0x103360):
//
//   offset  size  field
//   ------  ----  -----------------------------------------------------------------
//   +0x00   0x08  scalar0 : uint64  (raw 8-byte word — `mov (%rsi),%rax; mov %rax,(%rdi)`
//                                    at 0x106b57. No vtable dispatch anywhere in the dtor,
//                                    so this is NOT a vtable pointer — a plain scalar/pointer
//                                    handle. Op= also copies it raw at 0x10336d.)
//   +0x08   0x18  s0      : std::string   (SSO short-string; `testb $0x1, 0x8` @0x106b61 tests
//                                          the "long" bit, either 24-byte block-copy via xmm0
//                                          or basic_string::__init_copy_ctor_external.)
//   +0x20   0x18  v0      : std::vector<uint32_t>  (begin@+0x20, end@+0x28, cap_end@+0x30;
//                                                   element size = 4 confirmed by `sarq $0x2`
//                                                   in op= @0x103397; empty-init then
//                                                   memcpy(new[byteLen]) at 0x106bc2..0x106be6.)
//   +0x38   0x18  v1      : std::vector<uint32_t>  (begin@+0x38, end@+0x40, cap_end@+0x48;
//                                                   same shape as v0; `sarq $0x2` @0x1033b2.)
//   +0x50   0x18  m0      : std::map<uint32_t, std::string>
//                              (libc++ __tree layout: __begin_node@+0x50, __end_node.__left_
//                               @+0x58 + parent slot, size@+0x60; ctor self-inits __end_node,
//                               then copies via __emplace_hint_unique_key_args in a walk.)
//   +0x68   0x18  s1      : std::string   (SSO — `testb $0x1, 0x68(%r15)` @0x106c81.)
//   +0x80   0x18  s2      : std::string   (SSO — `testb $0x1, 0x80(%r15)` @0x106d05.)
//   +0x98   0x18  s3      : std::string   (SSO — `testb $0x1, 0x98(%r15)` @0x106d48.)
//   +0xb0   0x18  s4      : std::string   (SSO — `testb $0x1, 0xb0(%r15)` @0x106d87.)
//   +0xc8   0x10  blob16  : 16 bytes      (single xmm move — `movups 0xc8(%r15),%xmm0 ;
//                                          movups %xmm0,0xc8(%rbx)` @0x106dc8..0x106dd0 in ctor
//                                          and @0x103412..0x10341a in op=. Modelled as two
//                                          uint64 words {blob16Lo,blob16Hi}; without further
//                                          decode we do NOT guess a semantic type.)
//   +0xd8   0x04  u32Tail : uint32_t      (`movl 0xd8(%r15),%eax ; movl %eax,0xd8(%rbx)`
//                                          @0x106dbb..0x106dc2 in ctor; same in op= @0x103421.)
//
// DECODE references (see re/disasm/):
//   Ozone.OZDropZoneTypeUndoParams.operator=.s                          @0x103360
//   Ozone.OZDropZoneTypeUndoParams.OZDropZoneTypeUndoParams(OZDropZoneTypeUndoParams const&).s
//                                                                       @0x106b40
//   Ozone.OZDropZoneTypeUndoParams.~OZDropZoneTypeUndoParams.s          @0x107880
//
// Only 3 methods exist in the framework: copy-ctor, copy-assign, dtor. There is NO default
// ctor exported and NO other member function — this class is a plain PARAMS bag populated by
// its OWNER (the enclosing scope's code path, e.g. OZImageElement::convertDropZoneToDropZone
// TypeValue @0x???) via direct field writes. That means we cannot faithfully model
// field-population from disasm of THIS class — we only model copy/assign/destroy.
//
// Callees invoked by the 3 methods (all libc++ / libSystem — NOT Ozone frontier):
//   __ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE
//        25__init_copy_ctor_externalEPKcm         (long-string deep-copy) — ctor
//   __ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEaSERKS5_
//                                                 (string operator=)     — op=
//   __ZNSt3__16vectorIjNS_9allocatorIjEEE18__assign_with_sizeB9nqe210106IPjS5_EEvT_T0_l
//                                                 (vector<u32> assign)   — op=
//   __ZNSt3__16vectorIjNS_9allocatorIjEEE20__throw_length_errorB9nqe210106Ev
//                                                 (vector length_error)  — ctor error path
//   __ZNSt3__16__treeI...E30__emplace_hint_unique_key_argsI...E          — ctor map-walk
//   __ZNSt3__16__treeI...E14__assign_multiI...E                         — op= map-assign
//   __ZNSt3__16__treeI...E7destroyEP...                                 — dtor, ctor unwind
//   __Znwm  (operator new)                                              — ctor vector alloc
//   _memcpy                                                             — ctor vector fill
//   __ZdlPv (operator delete)                                           — dtor string/map buffers
//   __Unwind_Resume                                                     — ctor unwind
//
// None of the callees are Ozone-frontier — they are the C++ standard library and libSystem.
// The TypeScript port therefore uses JS-native types (string, number[], Map<number,string>)
// that provide equivalent semantics without transcribing libc++ itself. The @0xADDR provenance
// remains on this class's methods, which is where the FCP-observable behaviour lives.

// Type aliases (local; not exported — we do NOT introduce cross-file leaks).
type u32 = number;
type u64 = bigint;

/**
 * OZDropZoneTypeUndoParams — 224-byte parameter block passed to
 *   OZDropZoneTypeUndo::OZDropZoneTypeUndo(OZScene*, OZDropZoneTypeUndoParams const&)
 * to record enough state to undo a drop-zone type change. Only copy-ctor / copy-assign /
 * dtor are exported by the framework; every field is public-by-implication (a plain params
 * bag written directly by the calling site).
 */
export class OZDropZoneTypeUndoParams {
  /** @+0x00  raw 64-bit word. Not a vtable ptr (dtor performs no virtual dispatch on it).
   *          Copied verbatim by ctor @0x106b57 and op= @0x10336d. Bigint to preserve full 64 bits. */
  scalar0: u64;

  /** @+0x08  std::string #0. In JS we model as `string`; the libc++ SSO/long distinction
   *          is invisible to callers. */
  s0: string;

  /** @+0x20  std::vector<uint32_t> #0. Element size = 4 (sarq $0x2 @0x103397 in op=). */
  v0: u32[];

  /** @+0x38  std::vector<uint32_t> #1. Element size = 4 (sarq $0x2 @0x1033b2 in op=). */
  v1: u32[];

  /** @+0x50  std::map<uint32_t, std::string>. Ordered map keyed by u32 (libc++ __map_value_compare
   *          with std::less<unsigned int>). JS `Map` does NOT preserve numeric ordering the way
   *          std::map does; the port keeps std::map's key type via `Map<u32,string>` but a
   *          caller relying on ordered traversal would need to sort keys itself. This does NOT
   *          affect copy/assign/destroy semantics, which is all this class exposes. */
  m0: Map<u32, string>;

  /** @+0x68  std::string #1. */
  s1: string;
  /** @+0x80  std::string #2. */
  s2: string;
  /** @+0x98  std::string #3. */
  s3: string;
  /** @+0xb0  std::string #4. */
  s4: string;

  /** @+0xc8  16-byte blob, low  8 bytes. movups xmm0 copy — NO further semantic decode yet. */
  blob16Lo: u64;
  /** @+0xd0  16-byte blob, high 8 bytes. */
  blob16Hi: u64;

  /** @+0xd8  trailing uint32. movl-copied in both ctor and op=. */
  u32Tail: u32;

  /**
   * OZDropZoneTypeUndoParams::OZDropZoneTypeUndoParams(OZDropZoneTypeUndoParams const& src)
   *   @Ozone 0x106b40
   *
   * Faithful transcription of the copy constructor. All field copies mirror the disassembly
   * order (this is important for the map at +0x50: libc++ constructs the tree END NODE first,
   * then walks src.m0 emplacing each entry — the observable end state is a value-copy of the
   * map, so in TS we build a fresh Map by iteration).
   *
   *   0x106b57  copy scalar0 : (this+0x00) <- *(src+0x00)                        (raw qword)
   *   0x106b61  copy s0      : basic_string SSO/long copy into (this+0x08)
   *   0x106b8d  zero-init v0 : (this+0x20..+0x30) = 0                            (empty vector)
   *   0x106ba4  fill  v0     : n_bytes = *(src+0x28) - *(src+0x20)
   *                            if n_bytes>0: new[n_bytes] then memcpy(src.v0.data,n_bytes)
   *                            if n_bytes<0: throw length_error @0x106de6
   *   0x106bf7  zero-init v1 : (this+0x38..+0x48) = 0                            (empty vector)
   *   0x106c0e  fill  v1     : same shape as v0 (throw length_error @0x106ded)
   *   0x106c59  init  m0     : self-linked empty __tree end-node at +0x50..+0x60
   *   0x106c6c  walk  src.m0 : iterate __tree from *(src+0x50) until back at end,
   *                            calling __emplace_hint_unique_key_args(...) for each node.
   *                            (In TS: for each [k,v] in src.m0 → this.m0.set(k,v).)
   *   0x106c7d  copy s1      : basic_string copy into (this+0x68)
   *   0x106cfe  copy s2      : basic_string copy into (this+0x80)
   *   0x106d41  copy s3      : basic_string copy into (this+0x98)
   *   0x106d80  copy s4      : basic_string copy into (this+0xb0)
   *   0x106dc8  copy blob16  : movups 0xc8(%r15),%xmm0 ; movups %xmm0,0xc8(%rbx)
   *   0x106dbb  copy u32Tail : movl 0xd8(%r15),%eax ; movl %eax,0xd8(%rbx)
   *   0x106dd7  epilogue
   *
   * The unwind block @0x106df4..0x106f01 unwinds partially-constructed sub-objects if a later
   * copy throws (string/vector alloc failure). In TS the value copies cannot throw partial
   * allocations, so we do a straight full copy and let JS handle any OOM at the runtime layer.
   */
  constructor(src: OZDropZoneTypeUndoParams) {
    // @0x106b57 — copy scalar0 raw.
    this.scalar0 = src.scalar0;
    // @0x106b61 — copy s0 (string).
    this.s0 = src.s0;
    // @0x106b8d/@0x106ba4 — v0 (vector<u32>) deep copy.
    this.v0 = src.v0.slice();
    // @0x106bf7/@0x106c0e — v1 (vector<u32>) deep copy.
    this.v1 = src.v1.slice();
    // @0x106c59/@0x106c6c — m0 (map<u32,string>) deep copy by walking src's tree.
    this.m0 = new Map<u32, string>(src.m0);
    // @0x106c7d — s1.
    this.s1 = src.s1;
    // @0x106cfe — s2.
    this.s2 = src.s2;
    // @0x106d41 — s3.
    this.s3 = src.s3;
    // @0x106d80 — s4.
    this.s4 = src.s4;
    // @0x106dc8 — 16-byte blob (two 64-bit words).
    this.blob16Lo = src.blob16Lo;
    this.blob16Hi = src.blob16Hi;
    // @0x106dbb — trailing u32.
    this.u32Tail = src.u32Tail;
  }

  /**
   * OZDropZoneTypeUndoParams::operator=(OZDropZoneTypeUndoParams const& rhs)
   *   @Ozone 0x103360
   *
   * Faithful transcription of copy-assign. Note the disassembly's KEY SELF-ASSIGN GUARD:
   *
   *   0x103380  cmpq %r14,%rbx        (rhs == this ?)
   *   0x103383  je   0x1033cc         (if yes, SKIP vector1/vector2/map assignments — but
   *                                    still do s0, s1..s4, blob16, u32Tail assignments,
   *                                    which are no-ops on self anyway)
   *
   * Order of writes:
   *   0x10336d  scalar0    : *(this+0x00) = *(rhs+0x00)
   *   0x10337b  s0         : basic_string::operator=(&this->s0, &rhs->s0)
   *   0x103380  IF this != rhs:
   *     0x1033a0    v0     : vector::__assign_with_size(&this->v0, rhs.v0.data,
   *                                                     rhs.v0.data_end,
   *                                                     (rhs.v0.data_end - rhs.v0.data) >> 2)
   *     0x1033b6    v1     : same shape as v0
   *     0x1033c7    m0     : __tree::__assign_multi (walks rhs.m0, assigns to this.m0)
   *   0x1033d4  s1         : basic_string::operator=
   *   0x1033e7  s2         : basic_string::operator=
   *   0x1033fa  s3         : basic_string::operator=
   *   0x10340d  s4         : basic_string::operator=
   *   0x103412  blob16     : movups 0xc8(%r14),%xmm0 ; movups %xmm0,0xc8(%rbx)
   *   0x103421  u32Tail    : movl 0xd8(%r14),%eax ; movl %eax,0xd8(%rbx)
   *   0x10342e  return this  (movq %rbx,%rax)
   */
  assign(rhs: OZDropZoneTypeUndoParams): OZDropZoneTypeUndoParams {
    // @0x10336d — scalar0 raw copy.
    this.scalar0 = rhs.scalar0;
    // @0x10337b — s0 string assign.
    this.s0 = rhs.s0;
    // @0x103380 — self-assign guard: skip the 3 containers if rhs === this.
    if (rhs !== this) {
      // @0x1033a0 — v0 vector<u32> assign.
      this.v0 = rhs.v0.slice();
      // @0x1033b6 — v1 vector<u32> assign.
      this.v1 = rhs.v1.slice();
      // @0x1033c7 — m0 map<u32,string> multi-assign.
      this.m0 = new Map<u32, string>(rhs.m0);
    }
    // @0x1033d4 — s1..s4 string assigns.
    this.s1 = rhs.s1;
    // @0x1033e7
    this.s2 = rhs.s2;
    // @0x1033fa
    this.s3 = rhs.s3;
    // @0x10340d
    this.s4 = rhs.s4;
    // @0x103412 — blob16 (xmm move).
    this.blob16Lo = rhs.blob16Lo;
    this.blob16Hi = rhs.blob16Hi;
    // @0x103421 — u32Tail.
    this.u32Tail = rhs.u32Tail;
    // @0x10342e — return *this.
    return this;
  }

  /**
   * OZDropZoneTypeUndoParams::~OZDropZoneTypeUndoParams()  @Ozone 0x107880  (D2 — base dtor)
   *
   * Faithful transcription. The dtor reverses construction order, freeing "long" strings and
   * the map's tree buffer / vectors' backing storage. In TS, JavaScript's garbage collector
   * reclaims these automatically — there is no explicit `delete[]`. We model destroy() as a
   * clear-to-empty operation so a caller who explicitly invokes it observes the state that
   * the C++ dtor leaves (no-op for a value that will subsequently be GC'd).
   *
   *   0x107889  testb $1, 0xb0 — if s4 is "long": operator delete(*(this+0xc0))    @0x1078f1
   *   0x107892  testb $1, 0x98 — if s3 is "long": operator delete(*(this+0xa8))    @0x107906
   *   0x10789b  testb $1, 0x80 — if s2 is "long": operator delete(*(this+0x90))    @0x10791b
   *   0x1078a4  testb $1, 0x68 — if s1 is "long": operator delete(*(this+0x78))    @0x1078aa
   *   0x1078b3  destroy m0 tree: __tree::destroy(&this->m0, root)                  @0x1078bb
   *   0x1078c0  free   v1     : if *(this+0x38) != 0: operator delete(that ptr)    @0x1078cd
   *   0x1078d2  free   v0     : if *(this+0x20) != 0: operator delete(that ptr)    @0x1078df
   *   0x1078e4  testb $1, 0x08 — if s0 is "long": tail-jmp operator delete(*(this+0x18)) @0x10793d
   *
   * Note: scalar0 (+0x00), blob16 (+0xc8) and u32Tail (+0xd8) are NOT touched by the dtor —
   * they own no heap resources.
   */
  destroy(): void {
    // @0x107889 — s4 destroy.
    this.s4 = "";
    // @0x107892 — s3 destroy.
    this.s3 = "";
    // @0x10789b — s2 destroy.
    this.s2 = "";
    // @0x1078a4 — s1 destroy.
    this.s1 = "";
    // @0x1078bb — m0 map destroy.
    this.m0.clear();
    // @0x1078c0 — v1 vector destroy.
    this.v1.length = 0;
    // @0x1078d2 — v0 vector destroy.
    this.v0.length = 0;
    // @0x1078e4 — s0 destroy (tail-jmp to operator delete).
    this.s0 = "";
  }
}
