// Li3DEngineScene.ts — faithful transcription of ~Li3DEngineScene @Ozone 0x3bc210.
//
// This class is a SceneKit-adjacent facade (holds a std::recursive_mutex, an
// ObjC/PCNSRef to an SCNRenderer, and a std::map<u64, PCNSRef<SCNRenderer*>>).
// Only its D1 destructor is emitted in the Ozone binary — every other method is
// inlined or ObjC-bridged and lives outside this ledger entry.
//
// Source disasm: raw-port/re/disasm/Li3DEngineScene.~Li3DEngineScene.s

// ---------------------------------------------------------------------------
// Layout recovered from the disasm at 0x3bc210:
//
//   00 pushq %rbp / movq %rsp,%rbp / pushq %rbx / pushq %rax
//   04 movq %rdi,%rbx                       ; rbx = this
//   07 addq $0x50, %rdi                     ; %rdi = &this[+0x50] = &map
//   0b movq 0x58(%rbx), %rsi                ; %rsi = *(this + 0x58) = map end-node/root
//   0f callq std::__1::__tree<...
//                     PCNSRef<SCNRenderer*>>::destroy(tree_node*)
//                                          ; destroys the map's tree nodes
//   14 leaq 0x40(%rbx), %rdi                ; %rdi = &this[+0x40] = &nsRef
//   18 callq ProCore_Impl::PCNSRefImpl::release() const
//                                          ; releases the ObjC ref
//   1d movq %rbx, %rdi                      ; %rdi = this
//   20 addq $0x8, %rsp / popq %rbx / popq %rbp
//   28 jmp  std::__1::recursive_mutex::~recursive_mutex()
//                                          ; tail-call: mutex is at +0x00
//
// Field offsets:
//   +0x00 std::__1::recursive_mutex  (first member; tail-called at 0x3bc238)
//   +0x40 ProCore_Impl::PCNSRefImpl  (accessed at 0x3bc226, release'd)
//   +0x50 std::__1::__tree<u64, PCNSRef<SCNRenderer*>> root/begin
//   +0x58 std::__1::__tree<...> end-node ptr (passed as arg2 to destroy)
//
// The exact size of the class between +0x08 and +0x3f is unknown (nothing in
// the destructor touches it). Fields between +0x60 and end are also unknown.
// We leave the class as an opaque holder with the four decoded fields typed;
// any accessor is a throw-stub citing its unresolved decode.

/** ObjC/CoreFoundation-side handle. Real object is an SCNRenderer* wrapped in
 *  a PCNSRef (reference-counted). JS side stores the raw handle; retain/release
 *  is a no-op here (see PCColorSpaceHandle.ts for the same pattern). */
export interface SCNRendererRef {
  readonly __scnRendererHandle: unknown;
}

/** ProCore_Impl::PCNSRefImpl — one-slot ObjC-ref RAII holder. `release()`
 *  is @0x6df522 (stub in Ozone) which we treat as a no-op on JS side. */
export interface PCNSRefImpl_SCNRenderer {
  ref: SCNRendererRef | null;
}

/** std::__1::recursive_mutex — POSIX pthread wrapper. In JS single-threaded
 *  execution the destructor is a no-op. */
export interface RecursiveMutex {
  readonly __recursiveMutex: unknown;
}

/**
 * std::__1::__tree<__value_type<u64, PCNSRef<SCNRenderer*>>,
 *                  __map_value_compare<u64, pair<u64 const, PCNSRef<SCNRenderer*>>,
 *                                      less<u64>, true>,
 *                  allocator<pair<u64 const, PCNSRef<SCNRenderer*>>>>
 *   ::destroy(__tree_node<value_type, void*>*)   @Ozone 0x3bc221 (callq target)
 *
 * Called by ~Li3DEngineScene to tear down the entire tree from the root end-node
 * pointer. The concrete method address is not resolved via a __stub (it's a
 * direct callq into another translation unit's __text region); resolving that
 * address to a symbol is a further RE step we defer with a throw-stub so the
 * gap is loud.
 */
export function stdTree_destroy_SCNRendererMap(
  _mapBase: unknown,
  _endNode: unknown,
): void {
  throw new Error(
    "std::__1::__tree<u64, PCNSRef<SCNRenderer*>>::destroy(tree_node*) " +
    "@Ozone callq target of 0x3bc221 not yet transcribed",
  );
}

/**
 * ProCore_Impl::PCNSRefImpl::release() const   @Ozone stub 0x6df522
 * mangled: __ZNK12ProCore_Impl11PCNSRefImpl7releaseEv
 *
 * Decrements the ObjC ref-count. In JS we no-op; when the PCNSRefImpl class is
 * itself transcribed this will be replaced by the real body. Loud stub for now.
 */
export function PCNSRefImpl_release(_impl: PCNSRefImpl_SCNRenderer): void {
  throw new Error(
    "ProCore_Impl::PCNSRefImpl::release() const @Ozone stub 0x6df522 " +
    "(__ZNK12ProCore_Impl11PCNSRefImpl7releaseEv) not yet transcribed",
  );
}

/**
 * std::__1::recursive_mutex::~recursive_mutex()  @Ozone stub 0x6dfbb8
 * mangled: __ZNSt3__115recursive_mutexD1Ev
 *
 * Wraps pthread_mutex_destroy. JS no-op equivalent — we mark it as an
 * undecoded external so the tail-call site reads faithfully.
 */
export function RecursiveMutex_dtor(_m: RecursiveMutex): void {
  throw new Error(
    "std::__1::recursive_mutex::~recursive_mutex() @Ozone stub 0x6dfbb8 " +
    "(__ZNSt3__115recursive_mutexD1Ev) not yet transcribed",
  );
}

export class Li3DEngineScene {
  /** +0x00 std::recursive_mutex — first member, tail-destroyed. */
  public mutex: RecursiveMutex;
  /** +0x40 ProCore_Impl::PCNSRefImpl to an SCNRenderer. */
  public renderer: PCNSRefImpl_SCNRenderer;
  /** +0x50 std::map<u64, PCNSRef<SCNRenderer*>> — root/begin sentinel. */
  public renderersMapBase: unknown;
  /** +0x58 std::map end-node ptr (arg2 to std::__tree::destroy). */
  public renderersMapEnd: unknown;

  constructor(
    mutex: RecursiveMutex,
    renderer: PCNSRefImpl_SCNRenderer,
    mapBase: unknown = null,
    mapEnd: unknown = null,
  ) {
    // No emitted ctor in Ozone — this class is constructed from another TU or
    // via placement-new in an ObjC layer. We accept the four decoded fields
    // and let the caller wire them, mirroring the observed layout.
    this.mutex = mutex;
    this.renderer = renderer;
    this.renderersMapBase = mapBase;
    this.renderersMapEnd = mapEnd;
  }

  /**
   * ~Li3DEngineScene()   @Ozone 0x00003bc210   __ZN15Li3DEngineSceneD1Ev
   *
   * Faithful transcription of the disasm:
   *   1) std::__tree::destroy(&renderersMapBase, renderersMapEnd)   [@0x3bc221]
   *   2) PCNSRefImpl::release() on &renderer                        [@0x3bc22a]
   *   3) tail-call std::recursive_mutex::~recursive_mutex()          [@0x3bc238]
   * On any exception the landing pad tail-calls __clang_call_terminate.
   */
  public destroy(): void {
    // @0x3bc219  addq $0x50, %rdi   ; @0x3bc21d  movq 0x58(%rbx), %rsi
    // @0x3bc221  callq std::__tree::destroy
    stdTree_destroy_SCNRendererMap(this.renderersMapBase, this.renderersMapEnd);
    // @0x3bc226  leaq 0x40(%rbx), %rdi
    // @0x3bc22a  callq ProCore_Impl::PCNSRefImpl::release
    PCNSRefImpl_release(this.renderer);
    // @0x3bc238  jmp std::recursive_mutex::~recursive_mutex   (tail-call on this=+0x00)
    RecursiveMutex_dtor(this.mutex);
  }
}
