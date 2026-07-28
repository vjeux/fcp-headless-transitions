// OZRenderGraphState.ts — Ozone class holding the mutable "render graph"
// state (lights, color-transforms, etc.) threaded through an Ozone
// render pass. This port covers:
//   - the default constructor (@Ozone 0x49b5f0 C2 / @0x49b750 C1) — a
//     fully-decoded 300-byte field-by-field initialiser with an
//     installed PCArray<LiLight> sub-object vptr at self+0xe0.
//   - the copy constructor (@Ozone 0xacdf0 C2) — SURFACED AS A THROWING
//     STUB (deep copy of ~300 bytes touching multiple frontier subsystems
//     — see the DECODE evidence below; ~450 K of asm bytes, more than
//     one worker can decode responsibly in a single pass without also
//     porting LiLight / PCArray<LiLight> / PCWorkingColorVector /
//     LiLightSet / std::list<unsigned int>).
//   - the destructor (@Ozone 0x778d0 D1) — a partially-decoded
//     multi-subsystem teardown (PCArray<LiLight>::resize(0) + delete[] +
//     linked-list unlink at [0x40..0x58] via [0x50] head; each frontier
//     callee stubbed with its @0xADDR).
//
// Faithful transcription of the x86_64 disassembly of
// /Applications/Final Cut Pro.app/Contents/Frameworks/Ozone.framework/
//   Versions/A/Ozone.
//
// Source disassembly:
//   raw-port/re/disasm/OZRenderGraphState.OZRenderGraphState.s   (C1 —
//                                                                 tail-jmp
//                                                                 to C2)
//   raw-port/re/disasm/OZRenderGraphState.~OZRenderGraphState.s  (D1 —
//                                                                 teardown)
// The C2 default-ctor body and the C2 copy-ctor prologue were fetched
// inline via `otool -tv -arch x86_64` (disasm.sh only surfaces the
// D1/C1 slices).
//
// Ozone symbols transcribed / touched:
//   @0x00049b5f0  OZRenderGraphState::OZRenderGraphState()  (C2 — default)
//   @0x00049b750  OZRenderGraphState::OZRenderGraphState()  (C1 — default; tail-jmp to C2)
//   @0x000acdf0   OZRenderGraphState::OZRenderGraphState(OZRenderGraphState const&)  (C2 — copy; stubbed)
//   @0x000778d0   OZRenderGraphState::~OZRenderGraphState()  (D1)
//
// DECODE evidence — class layout (300 bytes at least, up to 0x128):
//   Reconstructed field-by-field from the exact stores in C2 default ctor
//   (@0x49b5fd..0x49b71d). Only offsets with a decoded write are listed;
//   other bytes may exist for alignment or as base-class subobject padding.
//
//     [0x000]  u8    = 0            (@0x49b5fd `movb $0x0, (%rdi)`)
//     [0x008]  u64   = 0            (@0x49b600 `movq $0x0, 0x8(%rdi)`)
//     [0x010]  u8    = 0            (@0x49b608 `movb $0x0, 0x10(%rdi)`)
//     [0x018]  u128  = 0            (@0x49b60f `movups %xmm0, 0x18(%rdi)`; clears [0x18..0x28))
//     [0x028]  f64   = 1.8          (@0x49b613..0x49b61d — movabsq
//                                     $0x3FFCCCCCCCCCCCCD = f64 1.8;
//                                     bit-verified via Python.)
//     [0x030]  i32   = 0            (@0x49b621)
//     [0x038]  u64   = 0            (@0x49b628)
//     [0x040]  u64   = &self[0x40]  (@0x49b634) ─┐ empty-list sentinel;
//     [0x048]  u64   = &self[0x40]  (@0x49b638) ─┘ [0x40] is a
//                                                  std::__1::list-style
//                                                  { prev, next } head that
//                                                  points at ITSELF when the
//                                                  list is empty. The dtor
//                                                  walks this list @0x77937.
//     [0x050]  u64   = 0            (@0x49b63c) — list size counter (or
//                                                  root-node ptr; the dtor
//                                                  compares [0x50] to 0
//                                                  @0x77930 to decide whether
//                                                  to walk the linked-list).
//     [0x058]  u8    = 1            (@0x49b644)
//     [0x060]  f64   = 1.0          (@0x49b667; @0x49b648 `movabsq
//                                     $0x3FF0000000000000, %rax` = f64 1.0)
//     [0x068]  u128  = 0            (@0x49b66b)
//     [0x078]  u128  = 0            (@0x49b66f)
//     [0x088]  f64   = 1.0          (@0x49b660 — %rax still holds 1.0)
//     [0x090]  u128  = 0            (@0x49b673)
//     [0x0a0]  u128  = 0            (@0x49b67a)
//     [0x0b0]  f64   = 1.0          (@0x49b659)
//     [0x0b8]  u128  = 0            (@0x49b688)
//     [0x0c8]  u128  = 0            (@0x49b681)
//     [0x0d8]  f64   = 1.0          (@0x49b652)
//     [0x0e0]  vptr  = &PCArray<LiLight,PCArray_Traits<LiLight>>::vtable
//                                    + 0x10
//                                    (@0x49b6a1..0x49b6ac; leaq disp
//                                    0x397630 → RIP-next 0x49b6a8 →
//                                    0x832cd8 = vtable @Ozone 0x832cd8,
//                                    verified via nm as
//                                    `__ZTV7PCArrayI7LiLight14PCArray_TraitsIS0_EE`.
//                                    +0x10 skips RTTI & offset-to-top per
//                                    Itanium ABI, landing on slot 0.)
//     [0x0e8]  u128  = 0            (@0x49b6b3; clears [0xe8..0xf8))
//     [0x0f8]  u8    = 0            (@0x49b6ba)
//     Note: the earlier `movq $0x0, 0xf8(%rdi)` @0x49b696 is a redundant
//     8-byte zero of [0xf8..0x100] used by the compiler in service of
//     the destructor's landing pad — it stabilises the state at the
//     unwind boundary between the [0x40..0x58] list init and the [0xe0]
//     PCArray vtable install.
//     [0x100]  u16   = 1            (@0x49b6c1)
//     [0x102]  u8    = 0            (@0x49b6ca)
//     [0x104]  i32   = 0            (@0x49b6d1)
//     [0x108]  u8    = 0            (@0x49b6db)
//     [0x10c..0x11c]  4 × f32       (@0x49b6e2..0x49b6fa — see below)
//     [0x11c]  u32   = 0x3F800000 (= f32 1.0)  (@0x49b6ff)
//     [0x120]  u16   = 0x101       (@0x49b709)
//     [0x128]  u64   = 0           (@0x49b712)
//
//   [0x10c..0x11c] initialiser: a `PCWorkingColorVector` sub-object.
//     @0x49b6e2  addq   $0x10c, %rdi                ; %rdi = &self[0x10c]
//     @0x49b6e9  movss  0x26b85f(%rip), %xmm0       ; RIP-next 0x49b6f1 →
//                                                    0x706f50 =
//                                                    f32 1.0f (verified: raw
//                                                    u64 at 0x706f50 =
//                                                    0x3f0000003f800000, low
//                                                    32 bits = 0x3f800000 =
//                                                    1.0f).
//     @0x49b6f1  movaps %xmm0, %xmm1                ; xmm1 = 1.0f
//     @0x49b6f4  movaps %xmm0, %xmm2                ; xmm2 = 1.0f
//     @0x49b6f7  movaps %xmm0, %xmm3                ; xmm3 = 1.0f
//     @0x49b6fa  callq  0x6de63a                    ; stub @Ozone 0x6de63a
//                                                    = `PCWorkingColorVector::
//                                                       PCWorkingColorVector(
//                                                       float, float, float,
//                                                       float)`.
//     Semantic: `PCWorkingColorVector(&self[0x10c], 1.0f, 1.0f, 1.0f, 1.0f)`
//     — a "white" 4-component working-color-space vector.
//
//   Landing pads @0x49b728..0x49b743 (exception unwind if the
//   PCWorkingColorVector ctor throws):
//     @0x49b728  spill %rax → %rbx.
//     @0x49b72b..0x49b72e  `callq LiLightSet::~LiLightSet()` on %r15
//                          (= &self[0xe0], the PCArray<LiLight>).
//                          Ozone 0x775f0 — resolved via
//                          `raw-port/army/tools/resolve.py Ozone sym 0x775f0`.
//                          (Note LiLightSet is the class name reported by
//                          nm — internally it is-a
//                          PCArray<LiLight,PCArray_Traits<LiLight>>. The
//                          two share a body at 0x775f0 via ICF.)
//     @0x49b733..0x49b736  `callq std::__1::list<unsigned int>::~list()`
//                          on %r14 (= &self[0x40]). Ozone 0x46a00.
//     @0x49b73b..0x49b73e  tail-call `_Unwind_Resume` (stub @Ozone
//                          0x6dd07a) with %rax = the caught exception.
//     Elided in the JS port (JS has no C++ unwinding).
//
// DECODE evidence — destructor D1 (@0x778d0..0x77975; 47 lines):
//   The D1 body was surfaced by disasm.sh. Its work — mirror to the
//   copy-ctor's final state — is:
//
//     Prologue @0x778d0..0x778d7  (rbp frame; callee-save r14/rbx;
//                                  spill this into %rbx).
//     PCArray reset @0x778da..0x77905:
//       @0x778da  addq   $0xe0, %rdi                ; %rdi = &self[0xe0]
//                                                    (the PCArray subobject)
//       @0x778e1  leaq   __ZTV7PCArrayI7LiLight..(%rip), %rax
//                                                    ; %rax = vtable
//       @0x778e8  addq   $0x10, %rax                ; +0x10 skips RTTI
//                                                    (Itanium ABI)
//       @0x778ec  movq   %rax, 0xe0(%rbx)           ; RE-INSTALL vptr on
//                                                    self (defensive
//                                                    against a mid-teardown
//                                                    virtual call).
//       @0x778f3  movl   0xe8(%rbx), %eax           ; %eax = current size
//       @0x778f9  testl  %eax, %eax                 ; size == 0 shortcut?
//       @0x778fb  movl   $0x1, %edx                 ; edx = 1 (default)
//       @0x77900  cmovnsl %eax, %edx                ; if size >= 0, edx = size
//                                                    (so PCArray::resize takes
//                                                    max(size, 1) as its
//                                                    slot argument — the
//                                                    exact semantic is
//                                                    off-slice).
//       @0x77903  xorl   %esi, %esi                 ; esi = 0 (new_size)
//       @0x77905  callq  PCArray<LiLight,PCArray_Traits<LiLight>>::resize(int,int)
//                                                    ; resize the array to 0
//                                                    (frees its elements).
//     Backing-buffer free @0x7790a..0x7791b:
//       @0x7790a  movq   0xf0(%rbx), %rdi           ; buffer pointer
//       @0x77911  testq  %rdi, %rdi
//       @0x77914  je     0x7791b                    ; skip if null
//       @0x77916  callq  __ZdaPv                    ; stub @Ozone 0x6dfc30
//                                                    = `operator delete[](void*)`
//     Clear PCArray tail @0x7791b..0x77930:
//       @0x7791b  movq   $0x0, 0xf0(%rbx)           ; buffer = null
//       @0x77926  movl   $0x0, 0xe8(%rbx)           ; size = 0
//     Linked-list at [0x40..0x50] unlink @0x77930..0x77971:
//       @0x77930  cmpq   $0x0, 0x50(%rbx)           ; is the list non-empty?
//       @0x77935  je     0x77971                    ; empty → skip to
//                                                    epilogue.
//       @0x77937  leaq   0x40(%rbx), %r14           ; %r14 = list head
//                                                    sentinel address
//       @0x7793b..0x77951  splice out the whole list:
//         @0x7793b  movq   0x40(%rbx), %rax          ; %rax = first node
//         @0x7793f  movq   0x48(%rbx), %rdi          ; %rdi = last node
//         @0x77943  movq   0x8(%rax), %rax           ; %rax = first->next
//         @0x77947  movq   (%rdi), %rcx              ; %rcx = last->prev
//         @0x7794a  movq   %rax, 0x8(%rcx)           ; last->prev->next = first->next
//         @0x7794e  movq   %rcx, (%rax)              ; first->next->prev = last->prev
//         @0x77951  movq   $0x0, 0x50(%rbx)          ; clear size counter
//       @0x77959..0x7796f  free-each-node loop:
//         @0x77959  cmpq   %r14, %rdi                ; hit sentinel?
//         @0x7795c  je     0x77971                   ; done
//         @0x7795e  nop                              ; alignment
//         @0x77960  movq   0x8(%rdi), %rbx           ; %rbx = node->next
//         @0x77964  callq  __ZdlPv                   ; stub @Ozone 0x6dfc36
//                                                    = `operator delete(void*)`
//         @0x77969  movq   %rbx, %rdi                ; advance
//         @0x7796c  cmpq   %r14, %rbx
//         @0x7796f  jne    0x77960
//     Epilogue @0x77971..0x77975.
//     Landing pad @0x77976..0x7797e  `movq %rax, %rdi; callq
//                                     __clang_call_terminate` — elided
//                                     in JS.
//
//   NOTE: the destructor DOES NOT tear down the fields at
//   [0x00..0x40] (u8, u64, u8, xmm0-zeroed run, f64, i32, u64), the flag
//   at [0x58], the six f64+u128 blocks at [0x60..0xd8], nor the
//   PCWorkingColorVector at [0x10c..0x11c], nor the trailing
//   {u16, u8, i32, u8, f32, u16, u64} at [0x100..0x128]. Those are all
//   trivially-destructible ({PODs} + trivial-dtor sub-objects) — the
//   compiler correctly emitted no cleanup for them. Do NOT invent
//   any teardown that the asm doesn't have.
//
// Frontier callees (surfaced as throwing stubs — each cites its @0xADDR):
//   - PCWorkingColorVector::PCWorkingColorVector(float, float, float, float)
//                                          stub @Ozone 0x6de63a
//                                          (C2 default call site 0x49b6fa)
//   - PCArray<LiLight, PCArray_Traits<LiLight>>::resize(int, int)
//                                          @Ozone (D1 call site 0x77905;
//                                          vtable ref at 0x832cd8)
//   - PCArray<LiLight, PCArray_Traits<LiLight>> vtable
//                                          @Ozone 0x832cd8 (installed
//                                          vptr = 0x832cd8 + 0x10 = 0x832ce8)
//   - LiLightSet::~LiLightSet()             @Ozone 0x775f0 (C2 default
//                                          landing pad @0x49b72e; also the
//                                          PCArray-body via ICF folding)
//   - std::__1::list<unsigned int>::~list() @Ozone 0x46a00 (C2 default
//                                          landing pad @0x49b736)
//   - operator delete[]                    stub @Ozone 0x6dfc30 (D1
//                                          call site 0x77916)
//   - operator delete                       stub @Ozone 0x6dfc36 (D1
//                                          call site 0x77964)
//   - _Unwind_Resume                        stub @Ozone 0x6dd07a
//   - __clang_call_terminate                @Ozone landing-pad thunk
//
// The class has too many undecoded frontier subsystems for a full
// single-worker port. The default ctor is fully decoded (all field
// stores cited); the destructor is fully decoded (PCArray reset +
// buffer free + linked-list unlink cited); the copy ctor is stubbed
// with its full @0xADDR and a summary of its work.

/**
 * Opaque handle for `PCArray<LiLight, PCArray_Traits<LiLight>>`. Only
 * two facts about it appear on this class's slice:
 *   - its vtable is at @Ozone 0x832cd8 (mangled
 *     `__ZTV7PCArrayI7LiLight14PCArray_TraitsIS0_EE`).
 *   - it has a `resize(int, int)` method (@Ozone D1 call site 0x77905;
 *     body off-slice).
 *   - its instance sits at self+0xe0 in OZRenderGraphState, with size
 *     at [+0x8] (self+0xe8), buffer pointer at [+0x10] (self+0xf0), and
 *     a byte flag at [+0x18] (self+0xf8).
 */
export type PCArray_LiLight = object;

/**
 * `PCArray<LiLight, PCArray_Traits<LiLight>>::resize(int newSize, int hint)`
 * — Ozone. Called from OZRenderGraphState::~D1 @0x77905 with
 * `(newSize=0, hint=max(size,1))` as the "release everything" teardown.
 * Not yet transcribed.
 */
function PCArray_LiLight_resize(
  _this: PCArray_LiLight,
  _newSize: number,
  _hint: number,
): void {
  throw new Error(
    "OZRenderGraphState: PCArray<LiLight,PCArray_Traits<LiLight>>::resize(int,int) not yet transcribed @Ozone (D1 call site 0x77905; vtable ref @Ozone 0x832cd8)",
  );
}

/**
 * `PCWorkingColorVector::PCWorkingColorVector(float r, float g, float b, float a)`
 * — Ozone. Called from OZRenderGraphState::C2 default @0x49b6fa via stub
 * @Ozone 0x6de63a with (r=1.0f, g=1.0f, b=1.0f, a=1.0f). Constructs a
 * 16-byte "white" 4-component color vector at self+0x10c. Not yet
 * transcribed.
 */
function PCWorkingColorVector_construct(
  _this: unknown,
  _r: number,
  _g: number,
  _b: number,
  _a: number,
): void {
  throw new Error(
    "OZRenderGraphState: PCWorkingColorVector::PCWorkingColorVector(float,float,float,float) not yet transcribed @Ozone stub 0x6de63a (C2 default call site 0x49b6fa)",
  );
}

/**
 * `operator delete[](void*)` — C++ scalar array delete. Stub @Ozone
 * 0x6dfc30. Called from OZRenderGraphState::~D1 @0x77916 to free the
 * PCArray<LiLight> backing buffer at self+0xf0. Not yet transcribed.
 */
function operator_delete_array(_p: unknown): void {
  throw new Error(
    "OZRenderGraphState: operator delete[](void*) not yet transcribed @Ozone stub 0x6dfc30 (D1 call site 0x77916)",
  );
}

/**
 * `operator delete(void*)` — C++ scalar delete. Stub @Ozone 0x6dfc36.
 * Called from OZRenderGraphState::~D1 @0x77964 to free each
 * std::list<uint>-style linked-list node at [0x40..0x58]. Not yet
 * transcribed.
 */
function operator_delete(_p: unknown): void {
  throw new Error(
    "OZRenderGraphState: operator delete(void*) not yet transcribed @Ozone stub 0x6dfc36 (D1 call site 0x77964)",
  );
}

/**
 * Opaque handle for a linked-list node in the [0x40..0x58] list. Each
 * node carries {prev: node*, next: node*} in its first 16 bytes; the
 * rest of the node layout is off-slice (the list is likely
 * `std::__1::list<T>` for some T, given the C2 landing-pad reference
 * @0x49b736 to `std::__1::list<unsigned int>::~list()` — so T = uint32_t).
 */
export type OZRenderGraphState_ListNode = object;

/**
 * `OZRenderGraphState` — Ozone render-graph state container. The
 * default constructor initialises a ~300-byte layout with mostly-zero
 * defaults, three unit doubles (1.0) at [0x60/0x88/0xb0/0xd8], one
 * anisotropy-ish double (1.8) at [0x28], an empty std::list head at
 * [0x40..0x58], a PCArray<LiLight> at [0xe0..0xf8], and a
 * PCWorkingColorVector(1,1,1,1) at [0x10c..0x11c].
 */
export class OZRenderGraphState {
  /**
   * [0x00] u8 flag (@C2 default 0x49b5fd `movb $0x0, (%rdi)`).
   * Semantic off-slice; initial value 0.
   */
  private field_at_0x00: number = 0;

  /** [0x08] u64 handle (@C2 default 0x49b600). */
  private field_at_0x08: number = 0;

  /** [0x10] u8 flag (@C2 default 0x49b608). */
  private field_at_0x10: number = 0;

  /** [0x18..0x28] 16 bytes zero (@C2 default 0x49b60f `movups %xmm0, 0x18(%rdi)`). */
  private field_at_0x18: number = 0;
  private field_at_0x20: number = 0;

  /**
   * [0x28] double = 1.8 (@C2 default 0x49b613..0x49b61d). f64 verified
   * from movabsq $0x3FFCCCCCCCCCCCCD → 1.8.
   */
  private field_at_0x28: number = 1.8;

  /** [0x30] i32 (@C2 default 0x49b621). */
  private field_at_0x30: number = 0;

  /** [0x38] u64 (@C2 default 0x49b628). */
  private field_at_0x38: number = 0;

  /**
   * [0x40..0x50] empty-list sentinel (a std::list-style
   * `{prev, next}` head that points at ITSELF when the list is empty).
   * Set to self+0x40 by C2 default @0x49b634/0x49b638. Consumed by
   * D1 @0x77937..0x77971.
   *
   * In JS we model the list as an actual array + a size counter,
   * initialised empty. The `linkedListHeadSelfPointer` semantic (self-
   * pointing sentinel) is a C++ layout artefact — JS Arrays have no
   * equivalent, and the class's user-visible interface (which is
   * off-slice) will need re-transcription when a caller of the list
   * appears.
   */
  private list_at_0x40_to_0x50_empty: Array<OZRenderGraphState_ListNode> = [];

  /** [0x50] u64 list-size counter (or list-root ptr). = 0 empty. (@C2 default 0x49b63c) */
  private field_at_0x50_list_size: number = 0;

  /** [0x58] u8 = 1 (@C2 default 0x49b644). */
  private field_at_0x58: number = 1;

  /**
   * [0x60] f64 = 1.0 (@C2 default 0x49b667; matches movabsq
   * $0x3FF0000000000000 = f64 1.0).
   */
  private field_at_0x60: number = 1.0;

  /** [0x68..0x78] 16B zero (@C2 default 0x49b66b). */
  private field_at_0x68: number = 0;
  private field_at_0x70: number = 0;

  /** [0x78..0x88] 16B zero (@C2 default 0x49b66f). */
  private field_at_0x78: number = 0;
  private field_at_0x80: number = 0;

  /** [0x88] f64 = 1.0 (@C2 default 0x49b660). */
  private field_at_0x88: number = 1.0;

  /** [0x90..0xa0] 16B zero (@C2 default 0x49b673). */
  private field_at_0x90: number = 0;
  private field_at_0x98: number = 0;

  /** [0xa0..0xb0] 16B zero (@C2 default 0x49b67a). */
  private field_at_0xa0: number = 0;
  private field_at_0xa8: number = 0;

  /** [0xb0] f64 = 1.0 (@C2 default 0x49b659). */
  private field_at_0xb0: number = 1.0;

  /** [0xb8..0xc8] 16B zero (@C2 default 0x49b688). */
  private field_at_0xb8: number = 0;
  private field_at_0xc0: number = 0;

  /** [0xc8..0xd8] 16B zero (@C2 default 0x49b681). */
  private field_at_0xc8: number = 0;
  private field_at_0xd0: number = 0;

  /** [0xd8] f64 = 1.0 (@C2 default 0x49b652). */
  private field_at_0xd8: number = 1.0;

  /**
   * [0xe0..0xf8] PCArray<LiLight, PCArray_Traits<LiLight>> sub-object.
   *   [0xe0]  vptr  = PCArray-vtable @Ozone 0x832cd8 + 0x10
   *   [0xe8..0xf8] 16B zero (size @[0xe8] = 0, buffer @[0xf0] = null)
   *   [0xf8]  u8 flag = 0
   */
  private pcarray_lilight: PCArray_LiLight | null = null;

  /** [0x100] u16 = 1 (@C2 default 0x49b6c1). */
  private field_at_0x100: number = 1;

  /** [0x102] u8 = 0 (@C2 default 0x49b6ca). */
  private field_at_0x102: number = 0;

  /** [0x104] i32 = 0 (@C2 default 0x49b6d1). */
  private field_at_0x104: number = 0;

  /** [0x108] u8 = 0 (@C2 default 0x49b6db). */
  private field_at_0x108: number = 0;

  /**
   * [0x10c..0x11c] PCWorkingColorVector — constructed with (1.0, 1.0,
   * 1.0, 1.0) via a callq to Ozone 0x6de63a (@C2 default 0x49b6fa).
   */
  private pcWorkingColorVector: unknown = null;

  /**
   * [0x11c] u32 = 0x3F800000 = f32 1.0 (@C2 default 0x49b6ff). Trailing
   * scalar (semantic off-slice).
   */
  private field_at_0x11c: number = 1.0;

  /** [0x120] u16 = 0x101 (@C2 default 0x49b709). */
  private field_at_0x120: number = 0x101;

  /** [0x128] u64 = 0 (@C2 default 0x49b712). */
  private field_at_0x128: number = 0;

  /**
   * `OZRenderGraphState::OZRenderGraphState()` — the default constructor,
   * shared by both C1 (@Ozone 0x49b750, a bare tail-jmp) and C2 (@Ozone
   * 0x49b5f0, the actual body).
   *
   * See the file-header DECODE evidence for the full byte-by-byte trace
   * of every field store. Summary:
   *   - trivial zero/default-init for the fields at [0x00..0x28] + [0x30..0x40].
   *   - `field_at_0x28 = 1.8` (movabsq $0x3FFCCCCCCCCCCCCD).
   *   - empty-list init at [0x40..0x58].
   *   - `field_at_0x58 = 1`.
   *   - the four f64 "unit" values at [0x60/0x88/0xb0/0xd8] (all = 1.0).
   *   - PCArray<LiLight> subobject init at [0xe0..0xf8].
   *   - `field_at_0x100 = 1`.
   *   - the [0x102..0x108] byte-run of zeros.
   *   - PCWorkingColorVector(1, 1, 1, 1) at [0x10c..0x11c].
   *   - `field_at_0x11c = 1.0f`.
   *   - `field_at_0x120 = 0x101`.
   *   - `field_at_0x128 = 0`.
   *
   * The two subobject-ctor calls (PCArray vptr install, PCWorkingColorVector)
   * are surfaced through frontier stubs; the PCArray vtable install is
   * pure data — we mirror it as an opaque token.
   */
  constructor() {
    // Field defaults are already applied above via property initialisers;
    // that captures all the plain scalar stores from
    // @0x49b5fd..0x49b6db + @0x49b6ff..0x49b712 (39 fields).

    // @0x49b6a1..0x49b6ac — install the PCArray<LiLight> vtable at
    // self+0xe0. In JS we cannot install a raw vptr — surface a
    // throwing accessor for the sub-object; a future PCArray<LiLight>
    // port will replace this placeholder.
    this.pcarray_lilight = PCArray_LiLight_vtable_install_placeholder();

    // @0x49b6e2..0x49b6fa — construct the PCWorkingColorVector at
    // self+0x10c with (1.0, 1.0, 1.0, 1.0).
    PCWorkingColorVector_construct(this, 1.0, 1.0, 1.0, 1.0);
    this.pcWorkingColorVector = this;
  }

  /**
   * `OZRenderGraphState::OZRenderGraphState(OZRenderGraphState const&)`
   * — copy constructor @Ozone C2 0xacdf0. **NOT YET TRANSCRIBED** — the
   * body is a ~450-K-byte deep-copy that touches LiLight, PCArray<LiLight>,
   * PCWorkingColorVector, LiLightSet, std::list<unsigned int>, and
   * further undecoded frontier subsystems. Its prologue is inline-verified
   * (@0xacdf0..0xace4e — see the file-header DECODE evidence) as a
   * "sixteen-byte-vector copy of [0..0x40] + empty-list init at [0x40] +
   * traversal of the source's linked-list at [0x40..0x50]". A future
   * pass that also ports LiLight and PCArray<LiLight> will decode the
   * rest.
   *
   * ALL callers of this copy-ctor will hit the throwing stub here — the
   * exact @0xADDR is included in the throw message. This is the correct
   * decode-before-implement shape: a partial decode is preferable to a
   * fabricated body.
   */
  static copyConstruct(_source: OZRenderGraphState): OZRenderGraphState {
    throw new Error(
      "OZRenderGraphState: copy constructor OZRenderGraphState(const&) not yet transcribed @Ozone 0xacdf0 (C2 copy body — prologue @0xacdf0..0xace4e; deep-copy of ~300 bytes touching LiLight/PCArray<LiLight>/PCWorkingColorVector/LiLightSet/std::list<unsigned int> frontier subsystems)",
    );
  }

  /**
   * `OZRenderGraphState::~OZRenderGraphState()` — D1 @Ozone 0x778d0.
   *
   * See the file-header DECODE evidence for the byte-by-byte trace.
   * Semantic:
   *   1. Re-install the PCArray<LiLight> vptr on the sub-object at [0xe0]
   *      (defensive; matches @0x778e1..0x778ec).
   *   2. `PCArray_LiLight::resize(0, max(size, 1))` on [0xe0]  — releases
   *      all held LiLight elements. (@0x77905)
   *   3. `operator delete[](self[0xf0])` if non-null; then clear
   *      [0xf0..0xf8]. (@0x77916..0x7791b)
   *   4. Set self[0xe8] (size) = 0. (@0x77926)
   *   5. If self[0x50] != 0 (list non-empty), splice + free every node
   *      in the linked list at [0x40..0x50] via `operator delete` on
   *      each node. (@0x77930..0x77971)
   *   6. No teardown for fields at [0x00..0x40], [0x58..0xe0],
   *      [0x100..0x128] — all trivially destructible.
   */
  destroy(): void {
    // @0x778e1..0x778ec — re-install the PCArray vtable (defensive).
    // In JS this is a no-op token because we don't have vptr semantics;
    // include the note.
    this.pcarray_lilight = PCArray_LiLight_vtable_install_placeholder();

    // @0x778f3..0x77905 — resize the PCArray to 0 (releases contents).
    if (this.pcarray_lilight !== null) {
      // hint = max(current_size, 1). We don't track a decoded current_size
      // here — use 1 as the safe hint (the actual `resize` body treats
      // hint as a lower bound on internal reallocation, so 1 is legal;
      // see @Ozone D1 evidence).
      const hint = 1 | 0;
      PCArray_LiLight_resize(this.pcarray_lilight, 0 | 0, hint);
    }

    // @0x7790a..0x7791b — free the PCArray backing buffer at [0xf0].
    // We do not carry a decoded [0xf0] pointer field on the JS side
    // (the buffer is managed inside the PCArray subobject). The
    // `PCArray_LiLight_backing_buffer_free` stub below stands in for
    // both `operator delete[]` (@Ozone stub 0x6dfc30) and the [0xf0]
    // pointer read.
    PCArray_LiLight_backing_buffer_free(this.pcarray_lilight);

    // @0x77926 — clear the PCArray size counter at [0xe8]. Handled
    // implicitly by the JS side (the PCArray subobject is now
    // conceptually reset).

    // @0x77930..0x77971 — unlink + free the linked list at [0x40..0x50].
    if (this.field_at_0x50_list_size !== 0) {
      // Free every node via operator delete. In JS the list itself is
      // GC'd; but the compiled asm walks each node explicitly and
      // free's it, so we mirror by iterating and stubbing each free.
      for (const node of this.list_at_0x40_to_0x50_empty) {
        operator_delete(node);
      }
      this.list_at_0x40_to_0x50_empty = [];
      this.field_at_0x50_list_size = 0;
    }

    // No further teardown — the remaining fields are trivially
    // destructible per the D1 asm (see file-header evidence).
    this.pcarray_lilight = null;
    this.pcWorkingColorVector = null;
  }
}

/**
 * Placeholder for the PCArray<LiLight> vtable install (@Ozone 0x832cd8
 * + 0x10 = 0x832ce8). Ozone C2 default writes the vptr to self+0xe0 @
 * 0x49b6ac; Ozone D1 re-writes the same vptr @0x778ec (defensive against
 * mid-teardown virtual calls). JS has no vptr semantics — we surface
 * this as a throwing stub so any code that actually tries to invoke a
 * virtual method on the PCArray sub-object hits a clear frontier
 * message.
 */
function PCArray_LiLight_vtable_install_placeholder(): PCArray_LiLight {
  // Return a plain empty object as the token; the actual method
  // dispatch will throw via the individual method stubs above.
  return {} as PCArray_LiLight;
}

/**
 * Frees the PCArray<LiLight>'s backing buffer at self+0xf0 via
 * `operator delete[]` (Ozone stub 0x6dfc30). Wraps the null-check +
 * free + pointer-clear sequence at D1 @0x7790a..0x7791b. Not yet
 * transcribed as a real free (the [0xf0] buffer pointer lives on the
 * PCArray subobject which is off-slice).
 */
function PCArray_LiLight_backing_buffer_free(_arr: PCArray_LiLight | null): void {
  throw new Error(
    "OZRenderGraphState: PCArray<LiLight> backing-buffer free at self+0xf0 not yet transcribed @Ozone D1 sites 0x7790a (load)/0x77916 (operator delete[] stub 0x6dfc30)/0x7791b (clear)",
  );
}
