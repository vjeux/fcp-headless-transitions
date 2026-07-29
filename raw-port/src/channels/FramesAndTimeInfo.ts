// raw-port/src/channels/FramesAndTimeInfo.ts
//
// FCP `FramesAndTimeInfo` — a data-carrier struct (48B / sizeof=0x30) that the
// Flexo framework stores in `std::list<FramesAndTimeInfo>` collections. Only the
// destructor is exported by the binary (D1); the ctor + copy-ctor are inlined at
// every use-site, and the struct is otherwise moved by memberwise-copy inside
// the list-node's `push_back` (see DECODE below). Two of its trailing fields are
// PCNSRef Objective-C-pointer wrappers, retained on copy and released on destruct.
//
// Framework: Flexo
//
// Provenance (this class exports EXACTLY ONE method: the D1 destructor):
//   FramesAndTimeInfo::~FramesAndTimeInfo()  [D1]  @Flexo 0x38a770
//     mangled: __ZN17FramesAndTimeInfoD1Ev
//
// DECODE: raw-port/re/disasm/Flexo.FramesAndTimeInfo.~FramesAndTimeInfo.s  (D1 dtor, 20 lines)
//         plus caller-side layout evidence in
//         __ZNSt3__14listI17FramesAndTimeInfoNS_9allocatorIS1_EEE9push_backERKS1_
//         (@Flexo 0x38a6c0 - the FramesAndTimeInfo copy performed into the freshly-
//         allocated 0x40-byte list-node, header +0x10, payload +0x10..+0x40).
//
// Struct layout (recovered from push_back's field-by-field copy - every offset
// below is the OFFSET WITHIN FramesAndTimeInfo, i.e. subtract 0x10 from the
// list-node offsets seen in the disasm):
//   +0x00  u32   frameCountOrIndex     (`movl (%r15), %eax ; movl %eax, 0x10(%rbx)` @0x38a6e4)
//   +0x04  16B   blobA                 (`movups 0x4(%r15), %xmm0 ; movups %xmm0, 0x14(%rbx)`
//                                        @0x38a6f2 - two 8B values, treated as an opaque 16B
//                                        block until a caller reveals the sub-field split)
//   +0x14  u64   blobB                 (`movq 0x14(%r15), %rax ; movq %rax, 0x24(%rbx)`
//                                        @0x38a6ea - single 8B slot)
//   +0x1c  pad   (4B, brings +0x20 to 8-byte alignment for the PCNSRef fields)
//   +0x20  ptr   nsref0.payload        (`movq 0x20(%r15), %rax ; movq %rax, 0x30(%rbx)`
//                                        @0x38a6ff - retained via PCNSRefImpl::retain
//                                        (%rdi = &node+0x30) @0x38a70a)
//   +0x28  ptr   nsref1.payload        (`movq 0x28(%r15), %rax ; movq %rax, 0x38(%rbx)`
//                                        @0x38a716 - retained via PCNSRefImpl::retain
//                                        (%rdi = &node+0x38) @0x38a71e)
// Total sizeof = 0x30 (48B). Confirmed by node alloc: `movl $0x40, %edi ; callq __Znwm`
// @0x38a6d1 (0x40 = 0x10 list-node header + 0x30 payload).
//
// EXTERNAL FUNCTIONS REFERENCED (throw-stubs cite each callee address):
//   * ProCore_Impl::PCNSRefImpl::release()  @Flexo __stubs 0x1496f96
//     called TWICE in the D1 dtor - once on &this+0x28 (@0x38a77d) and once on
//     &this+0x20 (@0x38a789). Both PCNSRef fields drop one refcount on destruct.
//   * ProCore_Impl::PCNSRefImpl::retain()   @Flexo __stubs 0x1496f90
//     called from list::push_back on both nsref fields when copying into the node.
//   * ___clang_call_terminate               @Flexo (called from the dtor's
//     personality landing pad @0x38a798 / @0x38a7a0 if a release throws).

// -- Opaque PCNSRef payload type ---------------------------------------------
//
// PCNSRef<T*> - a retained Objective-C-pointer wrapper. Its retain/release entry
// points live at Flexo __stubs 0x1496f90 / 0x1496f96 and dispatch through the
// ProCore_Impl runtime; that path is out of scope here (see MaskBaseSubSegmentationInfo.ts
// for the same treatment). We keep the payload as an opaque handle so the
// TS-side dtor can model the "one release each" call sequence without wiring
// the full runtime.

/**
 * PCNSRef payload as observed by FramesAndTimeInfo - a single retained pointer.
 * Layout is 8 bytes: just the payload pointer. The refcount lives on the
 * Objective-C object itself in the real binary; the retain/release calls are
 * routed through the boundary stubs below so the missing coverage stays visible.
 */
export interface PCNSRef {
  payload: unknown | null;
}

/**
 * PCNSRefImpl::retain - @Flexo __stubs 0x1496f90 (__ZNK12ProCore_Impl11PCNSRefImpl6retainEv).
 * External runtime call. Boundary throw-stub: retain is not performed on the TS
 * side; call sites that construct/copy a FramesAndTimeInfo route through this so
 * the missing coverage is visible.
 */
export function PCNSRefImpl_retain(_ref: PCNSRef): void {
  throw new Error(
    "PCNSRefImpl::retain @Flexo 0x1496f90 not yet transcribed (extern runtime stub)",
  );
}

/**
 * PCNSRefImpl::release - @Flexo __stubs 0x1496f96 (__ZNK12ProCore_Impl11PCNSRefImpl7releaseEv).
 * External runtime call. Boundary throw-stub: release is not performed on the TS
 * side. The FramesAndTimeInfo D1 dtor invokes this twice (once per PCNSRef field);
 * TS callers exercising destruction must handle the throw or wire the stub.
 */
export function PCNSRefImpl_release(_ref: PCNSRef): void {
  throw new Error(
    "PCNSRefImpl::release @Flexo 0x1496f96 not yet transcribed (extern runtime stub)",
  );
}

// -- The class ---------------------------------------------------------------

/**
 * FramesAndTimeInfo - 48-byte data carrier (sizeof = 0x30). The FCP binary does
 * NOT emit a C1/C2 constructor symbol for this class: every construction site
 * is inlined and initializes the fields directly (see the list-node fill-in at
 * @Flexo 0x38a6e4-0x38a71e). This file matches that reality - a data class with
 * a real D1 dtor and no exported ctor.
 *
 * @Flexo class name mangled prefix: `17FramesAndTimeInfo` (nm/c++filt).
 */
export class FramesAndTimeInfo {
  /**
   * +0x00 (u32). Populated at every inlined construction; the only observed
   * write in push_back is a straight copy (`movl (%r15), %eax` @0x38a6e4).
   * Name reflects the class name only - no ctor decode has narrowed its role
   * beyond "the first 4 bytes of the struct".
   */
  frameCountOrIndex: number = 0;

  /**
   * +0x04..+0x14 (16B). Copied as a single `movups` in push_back (@0x38a6f2);
   * kept as a pair of u64 slots so the byte offsets stay explicit until a ctor
   * or reader reveals whether this is (two int64s), (a CMTime prefix), or a
   * float4. Treating it as opaque is faithful - the disasm never SPLITS this
   * block, it moves it whole.
   */
  blobA_lo: bigint = 0n; // +0x04 (8B, low  half of the 16B move)
  blobA_hi: bigint = 0n; // +0x0c (8B, high half of the 16B move)

  /**
   * +0x14 (u64). Copied as a single `movq` in push_back (@0x38a6ea). Distinct
   * from the 16B blobA move above, hence a field of its own.
   */
  blobB: bigint = 0n;

  // +0x1c..+0x20 (4B pad). Present so that the following pointer field lands
  // at the natural 8-byte alignment observed in the disasm (@0x38a6ff copies
  // from src+0x20, not src+0x1c). Not addressable from TS - documented only.

  /**
   * +0x20 (PCNSRef, 8B payload). Retained on copy (@0x38a70a) and released on
   * destruct - the SECOND of the two `release` calls in the D1 dtor (@0x38a789).
   */
  nsref0: PCNSRef = { payload: null };

  /**
   * +0x28 (PCNSRef, 8B payload). Retained on copy (@0x38a71e) and released on
   * destruct - the FIRST of the two release calls in the D1 dtor (@0x38a77d),
   * because the dtor drops nsref1 (+0x28) BEFORE nsref0 (+0x20). See dtor
   * decode below.
   */
  nsref1: PCNSRef = { payload: null };

  /**
   * FramesAndTimeInfo::~FramesAndTimeInfo() [D1]
   * @Flexo 0x000000000038a770  (__ZN17FramesAndTimeInfoD1Ev)
   *
   * DECODE (raw-port/re/disasm/Flexo.FramesAndTimeInfo.~FramesAndTimeInfo.s, full 20 lines):
   *   0x38a770  pushq %rbp                     ; frame setup
   *   0x38a771  movq  %rsp, %rbp
   *   0x38a774  pushq %rbx                     ; save callee-saved
   *   0x38a775  pushq %rax                     ; 16B stack alignment
   *   0x38a776  movq  %rdi, %rbx               ; %rbx = this
   *   0x38a779  addq  $0x28, %rdi              ; %rdi = &this->nsref1  (+0x28)
   *   0x38a77d  callq 0x1496f96                ; -> PCNSRefImpl::release(nsref1)
   *   0x38a782  addq  $0x20, %rbx              ; %rbx = &this->nsref0  (+0x20)
   *   0x38a786  movq  %rbx, %rdi               ; %rdi = &this->nsref0
   *   0x38a789  callq 0x1496f96                ; -> PCNSRefImpl::release(nsref0)
   *   0x38a78e  addq  $0x8, %rsp               ; unwind stack
   *   0x38a792  popq  %rbx                     ; restore callee-saved
   *   0x38a793  popq  %rbp
   *   0x38a794  retq
   *   ; landing pad (personality routine - an exception thrown by the first
   *   ; release() lands here so we can NOT skip the second one; the runtime
   *   ; policy on a double-throw is to terminate):
   *   0x38a795  movq  %rax, %rdi
   *   0x38a798  callq ___clang_call_terminate
   *   0x38a79d  movq  %rax, %rdi
   *   0x38a7a0  callq ___clang_call_terminate
   *   0x38a7a5  nopw  %cs:(%rax,%rax)          ; alignment
   *
   * Field-destruction ORDER (nsref1 first, then nsref0) is a plain C++ dtor:
   * members are destroyed in REVERSE declaration order, so `nsref1` (last-declared
   * pointer field) is released before `nsref0`. This transcription preserves that
   * order exactly, so a hooked TS PCNSRefImpl_release sees the same call sequence.
   */
  destroy(): void {
    // @Flexo 0x38a77d: PCNSRefImpl::release(&this + 0x28)  -- nsref1 first.
    PCNSRefImpl_release(this.nsref1);
    // @Flexo 0x38a789: PCNSRefImpl::release(&this + 0x20)  -- then nsref0.
    PCNSRefImpl_release(this.nsref0);
  }
}
