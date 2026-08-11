// HGMetalContext.ts — Helium framework (render layer).
//
// Source: /Applications/Final Cut Pro.app/Contents/Frameworks/Helium.framework/
//         Versions/A/Helium  (macOS FCP, x86_64 slice).
//
// -----------------------------------------------------------------------------
// SYMBOLS PORTED
// -----------------------------------------------------------------------------
//   * HGMetalContext::bufferInfiniPool() const     @Helium 0x1d34e0
//     __ZNK14HGMetalContext16bufferInfiniPoolEv
//   * HGMetalContext::deviceInfo() const            @Helium 0x1d2fb0
//     __ZNK14HGMetalContext10deviceInfoEv
//   * HGMetalContext::texturePool() const           @Helium 0x1d34c0
//     __ZNK14HGMetalContext11texturePoolEv
//   * HGMetalContext::textureInfiniPool() const     @Helium 0x1d3500
//     __ZNK14HGMetalContext17textureInfiniPoolEv
//   * HGMetalContext::setCommandBufferLimits(unsigned int, unsigned long)
//                                                   @Helium 0x1d3530
//     __ZN14HGMetalContext22setCommandBufferLimitsEjm
//
// re/disasm:
//   raw-port/re/disasm/Helium.__ZNK14HGMetalContext16bufferInfiniPoolEv.s
//   raw-port/re/disasm/Helium.__ZNK14HGMetalContext10deviceInfoEv.s
//   raw-port/re/disasm/Helium.__ZNK14HGMetalContext11texturePoolEv.s
//   raw-port/re/disasm/Helium.__ZNK14HGMetalContext17textureInfiniPoolEv.s
//   raw-port/re/disasm/Helium.__ZN14HGMetalContext22setCommandBufferLimitsEjm.s
//
// -----------------------------------------------------------------------------
// FULL DISASM (12 lines, @0x1d34e0..@0x1d34f7)
// -----------------------------------------------------------------------------
//   __ZNK14HGMetalContext16bufferInfiniPoolEv:
//     0x1d34e0  cmpb   $0x1, 0x68(%rdi)          ; flag byte at this[+0x68] == 1?
//     0x1d34e4  jne    0x1d34f4                  ; no -> return nullptr branch
//     0x1d34e6  pushq  %rbp                      ; frame prologue (only on taken path)
//     0x1d34e7  movq   %rsp, %rbp
//     0x1d34ea  movq   0x18(%rdi), %rax          ; rax = this[+0x18]  (wrapper ptr)
//     0x1d34ee  movq   0x40(%rax), %rax          ; rax = wrapper[+0x40]  (pool ptr)
//     0x1d34f2  popq   %rbp
//     0x1d34f3  retq
//     0x1d34f4  xorl   %eax, %eax                ; else return NULL
//     0x1d34f6  retq
//     0x1d34f7  nopw   (%rax,%rax)               ; alignment padding
//
// -----------------------------------------------------------------------------
// FRONTIER CALLEES
// -----------------------------------------------------------------------------
// Zero. Pure inline branching getter — no callq, no external symbol stubs,
// no indirect calls. Two 8-byte loads and a byte compare; the disasm is
// end-to-end faithfully transcribable in TypeScript.
// depgraph.py deps for __ZNK14HGMetalContext16bufferInfiniPoolEv reports
// 0 in-scope callees, 0 externs, 0 indirect — pure straight-line code.
//
// -----------------------------------------------------------------------------
// FULL DISASM (12 lines, @0x1d34c0..@0x1d34d7)
// -----------------------------------------------------------------------------
//   __ZNK14HGMetalContext11texturePoolEv:
//     0x1d34c0  cmpb   $0x1, 0x67(%rdi)          ; flag byte at this[+0x67] == 1?
//     0x1d34c4  jne    0x1d34d4                  ; no -> return nullptr branch
//     0x1d34c6  pushq  %rbp                      ; frame prologue (only on taken path)
//     0x1d34c7  movq   %rsp, %rbp
//     0x1d34ca  movq   0x18(%rdi), %rax          ; rax = this[+0x18]  (wrapper ptr)
//     0x1d34ce  movq   0x38(%rax), %rax          ; rax = wrapper[+0x38]  (texture pool ptr)
//     0x1d34d2  popq   %rbp
//     0x1d34d3  retq
//     0x1d34d4  xorl   %eax, %eax                ; else return NULL
//     0x1d34d6  retq
//     0x1d34d7  nopw   (%rax,%rax)               ; alignment padding
//
// texturePool @0x1d34c0 is the immediate text-section predecessor of
// bufferInfiniPool @0x1d34e0 and is instruction-for-instruction the same shape
// with two operands changed: the gating flag moves from +0x68 to +0x67, and the
// payload slot inside the SAME +0x18 wrapper moves from +0x40 to +0x38. Zero
// callees as well — no callq, no extern stubs, no indirect calls.
//
// -----------------------------------------------------------------------------
// FULL DISASM (12 lines, @0x1d3500..@0x1d3517)
// -----------------------------------------------------------------------------
//   __ZNK14HGMetalContext17textureInfiniPoolEv:
//     0x1d3500  cmpb   $0x1, 0x69(%rdi)          ; flag byte at this[+0x69] == 1?
//     0x1d3504  jne    0x1d3514                  ; no -> return nullptr branch
//     0x1d3506  pushq  %rbp                      ; frame prologue (only on taken path)
//     0x1d3507  movq   %rsp, %rbp
//     0x1d350a  movq   0x18(%rdi), %rax          ; rax = this[+0x18]  (wrapper ptr)
//     0x1d350e  movq   0x48(%rax), %rax          ; rax = wrapper[+0x48]  (tex infinipool ptr)
//     0x1d3512  popq   %rbp
//     0x1d3513  retq
//     0x1d3514  xorl   %eax, %eax                ; else return NULL
//     0x1d3516  retq
//     0x1d3517  nopw   (%rax,%rax)               ; alignment padding
//
// textureInfiniPool @0x1d3500 is the immediate text-section successor of
// bufferInfiniPool @0x1d34e0 and completes a three-member accessor family that
// is instruction-for-instruction identical apart from two operands. Laid side
// by side the two strides are exactly parallel — one byte per flag, eight bytes
// per payload slot:
//
//     accessor            flag byte   wrapper slot   addr
//     texturePool         +0x67       +0x38          0x1d34c0
//     bufferInfiniPool    +0x68       +0x40          0x1d34e0
//     textureInfiniPool   +0x69       +0x48          0x1d3500
//
// All three dereference the SAME wrapper pointer at HGMetalContext+0x18, so the
// wrapper carries at least three consecutive pool pointers at +0x38/+0x40/+0x48
// and the context carries three consecutive gating bytes at +0x67/+0x68/+0x69.
// Zero callees here as well — no callq, no extern stubs, no indirect calls;
// depgraph.py reports `deps: []`, `n_extern_oos: 0`, `indirect: 0` for this node.

/**
 * `HGMetalBufferWrapperInfinipool` — opaque wrapper type declared inline
 * inside HGMetalContext. The full definition lives in a not-yet-ported
 * ledger unit; here we only need a `readonly poolAt0x40` field so
 * `bufferInfiniPool` can read the offset the disasm reads.
 *
 * The `unique symbol` phantom brand keeps this distinct from other
 * opaque wrapper handles at the type level. The runtime shape is a
 * heap-allocated struct with at least a pointer at +0x40 (the only
 * offset this port has observed so far).
 */
export interface HGMetalBufferWrapperInfinipool {
  readonly __hgMetalBufferWrapperInfinipool: unique symbol;
  /**
   * @Helium offset +0x40 — the `HGBufferInfiniPool*` payload the wrapper
   * exposes to `bufferInfiniPool`. Read @0x1d34ee via
   * `movq 0x40(%rax), %rax` when the wrapper pointer at HGMetalContext+0x18
   * is dereferenced. Marked `readonly` because this port only observes
   * the load; the writer is in a different (not-yet-ported) method.
   */
  readonly poolAt0x40: HGBufferInfiniPool | null;
  /**
   * @Helium offset +0x38 — the `HGTexturePool*` payload the SAME wrapper
   * exposes to `texturePool`. Read @0x1d34ce via
   * `movq 0x38(%rax), %rax` when the wrapper pointer at HGMetalContext+0x18
   * is dereferenced. Marked `readonly` for the same reason as `poolAt0x40`:
   * this port only observes the load; the writer lives in a different
   * (not-yet-ported) method.
   */
  readonly texturePoolAt0x38: HGTexturePool | null;
  /**
   * @Helium offset +0x48 — the `HGTextureInfiniPool*` payload the SAME wrapper
   * exposes to `textureInfiniPool`. Read @0x1d350e via
   * `movq 0x48(%rax), %rax` when the wrapper pointer at HGMetalContext+0x18
   * is dereferenced. Marked `readonly` for the same reason as the two slots
   * above: this port only observes the load; the writer lives in a different
   * (not-yet-ported) method.
   */
  readonly textureInfiniPoolAt0x48: HGTextureInfiniPool | null;
}

/**
 * `HGBufferInfiniPool` — opaque handle for the return value of
 * `HGMetalContext::bufferInfiniPool()`. Not modelled here (the concrete
 * type lives elsewhere in the Metal-buffer subsystem, currently
 * `todo`). The port declares an opaque handle so the getter has a
 * legible return type; every downstream user treats the value as an
 * opaque pointer.
 */
export interface HGBufferInfiniPool {
  readonly __hgBufferInfiniPool: unique symbol;
}

/**
 * `HGTexturePool` — opaque handle for the return value of
 * `HGMetalContext::texturePool()`. Not modelled here (the concrete type
 * lives elsewhere in the Metal-texture subsystem, currently `todo`). The
 * port declares an opaque handle so the getter has a legible return type;
 * every downstream user treats the value as an opaque pointer, exactly as
 * the disasm does (one 8-byte load, returned in %rax untouched).
 */
export interface HGTexturePool {
  readonly __hgTexturePool: unique symbol;
}

/**
 * `HGTextureInfiniPool` — opaque handle for the return value of
 * `HGMetalContext::textureInfiniPool()`. Not modelled here (the concrete type
 * lives elsewhere in the Metal-texture subsystem, currently `todo`). The port
 * declares an opaque handle so the getter has a legible return type; every
 * downstream user treats the value as an opaque pointer, exactly as the disasm
 * does (one 8-byte load, returned in %rax untouched). It is a distinct brand
 * from `HGTexturePool` because the two come out of different wrapper slots
 * (+0x38 vs +0x48) behind different gating flags (+0x67 vs +0x69).
 */
export interface HGTextureInfiniPool {
  readonly __hgTextureInfiniPool: unique symbol;
}

/**
 * `HGMetalDeviceInfo` — opaque handle for the return value of
 * `HGMetalContext::deviceInfo()`. The getter is a single 8-byte load of
 * the pointer stored at HGMetalContext+0x10, so this port only needs the
 * value to be an opaque pointer type. The concrete Metal device-info
 * struct lives in a different (not-yet-ported) ledger unit; every
 * downstream user treats the value as an opaque pointer.
 */
export interface HGMetalDeviceInfo {
  readonly __hgMetalDeviceInfo: unique symbol;
}

/**
 * `HGMetalContext` — Helium's Metal-backed render context. Only the
 * fields touched by `bufferInfiniPool` are decoded here (offsets
 * +0x18, +0x40 through the wrapper, and the flag at +0x68); every
 * other field is undecoded and NOT modelled (per Rule 5 — no
 * fabricated fields).
 */
export class HGMetalContext {
  /**
   * @Helium offset +0x18 — the `HGMetalBufferWrapperInfinipool*` this
   * context owns. Read @0x1d34ea via `movq 0x18(%rdi), %rax` inside
   * `bufferInfiniPool`. Only dereferenced when
   * `isBufferInfiniPoolEnabled` (at +0x68) is 1.
   *
   * The `movq` load is 8-byte-wide, so the field is pointer-sized — a
   * heap reference to an opaque wrapper instance (nullable before the
   * pool is initialised). The writer for this slot lives in a
   * different (not-yet-ported) HGMetalContext method; its identity is
   * OUT OF SCOPE for this ledger unit.
   */
  bufferWrapper_at_0x18: HGMetalBufferWrapperInfinipool | null = null;

  /**
   * @Helium offset +0x68 — a `uint8_t` flag that gates access to the
   * wrapper at +0x18. Read @0x1d34e0 via
   * `cmpb $0x1, 0x68(%rdi)` inside `bufferInfiniPool`. When the byte
   * equals 1 the wrapper is live and the pool is returned; any other
   * value (including 0) makes the getter return `null`.
   *
   * The `cmpb` is a strict `== 1` check (not `!= 0`), so we mirror it
   * exactly — this is the same discipline as the byte-flag reads
   * everywhere else in the port (compare, don't coerce to truthy).
   */
  isBufferInfiniPoolEnabled_at_0x68: number = 0;

  /**
   * @Helium offset +0x67 — a `uint8_t` flag that gates access to the
   * wrapper at +0x18 for the TEXTURE pool (the byte immediately below the
   * buffer-infinipool flag at +0x68). Read @0x1d34c0 via
   * `cmpb $0x1, 0x67(%rdi)` inside `texturePool`. When the byte equals 1
   * the wrapper is live and the texture pool is returned; any other value
   * (including 0) makes the getter return `null`.
   *
   * The `cmpb` is a strict `== 1` check (not `!= 0`), so we mirror it
   * exactly — compare, don't coerce to truthy.
   */
  isTexturePoolEnabled_at_0x67: number = 0;

  /**
   * @Helium offset +0x69 — a `uint8_t` flag that gates access to the
   * wrapper at +0x18 for the TEXTURE INFINIPOOL (the byte immediately above
   * the buffer-infinipool flag at +0x68). Read @0x1d3500 via
   * `cmpb $0x1, 0x69(%rdi)` inside `textureInfiniPool`. When the byte equals
   * 1 the wrapper is live and the texture infinipool is returned; any other
   * value (including 0) makes the getter return `null`.
   *
   * The `cmpb` is a strict `== 1` check (not `!= 0`), so we mirror it
   * exactly — compare, don't coerce to truthy.
   */
  isTextureInfiniPoolEnabled_at_0x69: number = 0;

  /**
   * @Helium offset +0x10 — the `HGMetalDeviceInfo*` this context holds.
   * Read @0x1d2fb4 via `movq 0x10(%rdi), %rax` inside `deviceInfo`. An
   * 8-byte-wide load, so the field is pointer-sized — a heap reference
   * to an opaque device-info instance (nullable before it is set). The
   * writer for this slot lives in a different (not-yet-ported)
   * HGMetalContext method; its identity is OUT OF SCOPE for this ledger
   * unit.
   */
  deviceInfo_at_0x10: HGMetalDeviceInfo | null = null;

  /**
   * `HGMetalContext::bufferInfiniPool() const` — @Helium 0x1d34e0
   * (__ZNK14HGMetalContext16bufferInfiniPoolEv).
   *
   * Faithful line-for-line transcription of the 12-line disassembly
   * quoted in the file header. Two-path getter:
   *
   *   * If the byte flag at this[+0x68] equals 1, load
   *     `this[+0x18]` (the wrapper pointer), then load
   *     `wrapper[+0x40]` (the pool pointer) and return it.
   *   * Otherwise return null (`xorl %eax, %eax; retq` @0x1d34f4).
   *
   * No in-scope callees. No externs. No indirect calls. `depgraph.py`
   * confirms 0 deps of every kind.
   *
   * The disasm reveals a compiler-emitted "hot / cold" split: the
   * cold `nullptr` path at @0x1d34f4 has no frame prologue/epilogue,
   * the hot path pushes/pops %rbp only when it needs to load through
   * the wrapper. Both paths reach the same return-value contract, so
   * the TS mirror is a single conditional expression.
   *
   * The `const` qualifier in the C++ signature matches the `__ZNK...`
   * mangling; every observed access is a read. We reflect that with
   * no writes in the method body.
   */
  bufferInfiniPool(): HGBufferInfiniPool | null {
    // @0x1d34e0  cmpb $0x1, 0x68(%rdi)          ; flag == 1?
    // @0x1d34e4  jne  0x1d34f4                  ; not equal -> return null
    if (this.isBufferInfiniPoolEnabled_at_0x68 !== 1) {
      // @0x1d34f4  xorl %eax, %eax
      // @0x1d34f6  retq
      return null;
    }
    // @0x1d34ea  movq 0x18(%rdi), %rax          ; rax = this->bufferWrapper_at_0x18
    const wrapper = this.bufferWrapper_at_0x18;
    // If the wrapper pointer is null while the flag is 1, the machine
    // still executes `movq 0x40(%rax), %rax` — a null-deref crash. We
    // do NOT insert a defensive null check because the disasm doesn't
    // @0x1d34ea (Rule 1: transcribe, don't reimplement). The TS mirror
    // throws through the field access exactly as the FCP binary would.
    // @0x1d34ee  movq 0x40(%rax), %rax          ; rax = wrapper->poolAt0x40
    // @0x1d34f2  popq %rbp
    // @0x1d34f3  retq
    return wrapper!.poolAt0x40;
  }

  /**
   * `HGMetalContext::deviceInfo() const` — @Helium 0x1d2fb0
   * (__ZNK14HGMetalContext10deviceInfoEv).
   *
   * Faithful line-for-line transcription of the 7-line disassembly:
   *
   *   __ZNK14HGMetalContext10deviceInfoEv:
   *     0x1d2fb0  pushq %rbp
   *     0x1d2fb1  movq  %rsp, %rbp
   *     0x1d2fb4  movq  0x10(%rdi), %rax    ; rax = this->deviceInfo_at_0x10
   *     0x1d2fb8  popq  %rbp
   *     0x1d2fb9  retq
   *     0x1d2fba  nopw  (%rax,%rax)         ; alignment padding
   *
   * Pure straight-line accessor: a single 8-byte load of the pointer at
   * HGMetalContext+0x10, returned directly. No branch, no callq, no
   * external symbol stubs, no indirect calls. `depgraph.py deps` for
   * __ZNK14HGMetalContext10deviceInfoEv reports 0 in-scope callees,
   * 0 externs, 0 indirect.
   *
   * The `const` qualifier in the C++ signature matches the `__ZNK...`
   * mangling; the single observed access is a read, so the method body
   * performs no writes.
   */
  deviceInfo(): HGMetalDeviceInfo | null {
    // @0x1d2fb4  movq 0x10(%rdi), %rax          ; rax = this->deviceInfo_at_0x10
    // @0x1d2fb8  popq %rbp
    // @0x1d2fb9  retq
    return this.deviceInfo_at_0x10;
  }

  /**
   * `HGMetalContext::texturePool() const` — @Helium 0x1d34c0
   * (__ZNK14HGMetalContext11texturePoolEv).
   *
   * Faithful line-for-line transcription of the 12-line disassembly quoted
   * in the file header. Two-path getter:
   *
   *   * If the byte flag at this[+0x67] equals 1, load `this[+0x18]` (the
   *     wrapper pointer), then load `wrapper[+0x38]` (the texture-pool
   *     pointer) and return it.
   *   * Otherwise return null (`xorl %eax, %eax; retq` @0x1d34d4).
   *
   * No in-scope callees. No externs. No indirect calls — `depgraph.py deps`
   * for __ZNK14HGMetalContext11texturePoolEv reports 0 deps of every kind.
   *
   * Same compiler-emitted hot/cold split as `bufferInfiniPool`: the cold
   * null path at @0x1d34d4 has no frame prologue/epilogue, and the hot path
   * pushes/pops %rbp only when it loads through the wrapper. Both paths
   * reach the same return-value contract, so the TS mirror is a single
   * conditional.
   *
   * The `const` qualifier in the C++ signature matches the `__ZNK...`
   * mangling; every observed access is a read, so the body performs no
   * writes.
   */
  texturePool(): HGTexturePool | null {
    // @0x1d34c0  cmpb $0x1, 0x67(%rdi)          ; flag == 1?
    // @0x1d34c4  jne  0x1d34d4                  ; not equal -> return null
    if (this.isTexturePoolEnabled_at_0x67 !== 1) {
      // @0x1d34d4  xorl %eax, %eax
      // @0x1d34d6  retq
      return null;
    }
    // @0x1d34ca  movq 0x18(%rdi), %rax          ; rax = this->bufferWrapper_at_0x18
    const wrapper = this.bufferWrapper_at_0x18;
    // If the wrapper pointer is null while the flag is 1, the machine still
    // executes `movq 0x38(%rax), %rax` — a null-deref crash. We do NOT insert
    // a defensive null check because the disasm doesn't @0x1d34ca (Rule 1:
    // transcribe, don't reimplement). The TS mirror faults on the field
    // access exactly as the FCP binary would.
    // @0x1d34ce  movq 0x38(%rax), %rax          ; rax = wrapper->texturePoolAt0x38
    // @0x1d34d2  popq %rbp
    // @0x1d34d3  retq
    return wrapper!.texturePoolAt0x38;
  }

  /**
   * `HGMetalContext::textureInfiniPool() const` — @Helium 0x1d3500
   * (__ZNK14HGMetalContext17textureInfiniPoolEv).
   *
   * Faithful line-for-line transcription of the 12-line disassembly quoted
   * in the file header. Two-path getter:
   *
   *   * If the byte flag at this[+0x69] equals 1, load `this[+0x18]` (the
   *     wrapper pointer), then load `wrapper[+0x48]` (the texture-infinipool
   *     pointer) and return it.
   *   * Otherwise return null (`xorl %eax, %eax; retq` @0x1d3514).
   *
   * No in-scope callees. No externs. No indirect calls — `depgraph.py` reports
   * `deps: []`, `n_extern_oos: 0`, `indirect: 0` for
   * __ZNK14HGMetalContext17textureInfiniPoolEv.
   *
   * Same compiler-emitted hot/cold split as its two siblings: the cold null
   * path at @0x1d3514 has no frame prologue/epilogue, and the hot path
   * pushes/pops %rbp only when it loads through the wrapper. Both paths reach
   * the same return-value contract, so the TS mirror is a single conditional.
   *
   * The `const` qualifier in the C++ signature matches the `__ZNK...`
   * mangling; every observed access is a read, so the body performs no
   * writes.
   */
  textureInfiniPool(): HGTextureInfiniPool | null {
    // @0x1d3500  cmpb $0x1, 0x69(%rdi)          ; flag == 1?
    // @0x1d3504  jne  0x1d3514                  ; not equal -> return null
    if (this.isTextureInfiniPoolEnabled_at_0x69 !== 1) {
      // @0x1d3514  xorl %eax, %eax
      // @0x1d3516  retq
      return null;
    }
    // @0x1d350a  movq 0x18(%rdi), %rax          ; rax = this->bufferWrapper_at_0x18
    const wrapper = this.bufferWrapper_at_0x18;
    // If the wrapper pointer is null while the flag is 1, the machine still
    // executes `movq 0x48(%rax), %rax` — a null-deref crash. We do NOT insert
    // a defensive null check because the disasm doesn't @0x1d350a (Rule 1:
    // transcribe, don't reimplement). The TS mirror faults on the field
    // access exactly as the FCP binary would.
    // @0x1d350e  movq 0x48(%rax), %rax          ; rax = wrapper->textureInfiniPoolAt0x48
    // @0x1d3512  popq %rbp
    // @0x1d3513  retq
    return wrapper!.textureInfiniPoolAt0x48;
  }

  /**
   * @Helium offset +0x40 — a `uint32_t` written by `setCommandBufferLimits`
   * @0x1d3534 (`movl %esi, 0x40(%rdi)`), i.e. a FOUR-byte store of the first
   * argument. No decoded instruction reads it yet, so nothing pins what the
   * limit counts; the name keeps the offset rather than inventing a meaning.
   *
   * NOTE for readers of this file: this is `HGMetalContext+0x40`, which is NOT
   * the `+0x40` that appears in `bufferInfiniPool` above — that one is an offset
   * inside the WRAPPER object hanging off `HGMetalContext+0x18`
   * (`HGMetalBufferWrapperInfinipool.poolAt0x40`). Two different objects.
   *
   * Zero-initialised here; the ctor is a separate ledger entry, so the true
   * default is not yet grounded.
   */
  commandBufferLimit_u32_at_0x40: number = 0; // @Helium HGMetalContext@0x40

  /**
   * @Helium offset +0x48 — a `uint64_t` written by `setCommandBufferLimits`
   * @0x1d3537 (`movq %rdx, 0x48(%rdi)`), i.e. an EIGHT-byte store of the second
   * argument (`unsigned long`). Held as a bigint per PORTING_SPEC Rule 4: the
   * slot is 64 bits wide and the setter accepts values above 2^53 (the oracle
   * drives 0x7fffffffffffffff and 0xffffffffffffffff through it unchanged).
   *
   * Same caution as the field above: `HGMetalContext+0x48` is a different slot
   * from the wrapper's `+0x48` read by `textureInfiniPool`.
   *
   * Zero-initialised here; the ctor is a separate ledger entry.
   */
  commandBufferLimit_u64_at_0x48: bigint = 0n; // @Helium HGMetalContext@0x48

  /**
   * `HGMetalContext::setCommandBufferLimits(unsigned int, unsigned long)`
   *   @Helium 0x1d3530 (__ZN14HGMetalContext22setCommandBufferLimitsEjm)
   *
   * Full 8-line body
   * (raw-port/re/disasm/Helium.__ZN14HGMetalContext22setCommandBufferLimitsEjm.s):
   *
   *   0x1d3530  pushq %rbp                  ; frame prologue
   *   0x1d3531  movq  %rsp, %rbp
   *   0x1d3534  movl  %esi, 0x40(%rdi)      ; this->+0x40 (u32) = arg1
   *   0x1d3537  movq  %rdx, 0x48(%rdi)      ; this->+0x48 (u64) = arg2
   *   0x1d353b  popq  %rbp                  ; epilogue
   *   0x1d353c  retq
   *   0x1d353d  nopl  (%rax)                ; padding — not executed
   *
   * Two independent stores, no branch, no call, no validation, no read-back.
   * The widths differ and that is load-bearing: the first is a `movl` (four
   * bytes, leaving +0x44 alone) and the second a `movq` (all eight bytes of
   * +0x48). Which limit is which is NOT pinned by anything decoded — the method
   * name says "Limits" and the ABI says (u32, u64); no instruction here reads
   * either slot back — so the fields carry their offsets, not invented roles.
   *
   * ORACLE — differential against the live Helium binary, 1,200 cases, 0
   * divergences (raw-port/re/oracle/HGMetalContext_setCommandBufferLimits_oracle.py).
   * The symbol is exported (`T`), so the harness dlsym's it and calls it under
   * `arch -x86_64 /usr/bin/python3` (the port cites x86_64 offsets; the arm64
   * slice would be different code — OPS_LOG) on a 0xAA-poisoned 0x200-byte
   * object. Inputs cover 0, 1, 2, 0x7fffffff, 0x80000000, 0xfffffffe,
   * 0xffffffff for the u32 and 0, 1, 0xffffffff, 0x100000000, 2^53, 2^53+1,
   * 0x7fffffffffffffff, 0x8000000000000000, 0xffffffffffffffff plus random
   * values for the u64. Every case: the dword at +0x40 equals arg1, all eight
   * bytes at +0x48 equal arg2, the four bytes at +0x44 are STILL 0xAA
   * (1200/1200 — proving the `movl`), and no other byte of the object changed.
   * NEGATIVE CONTROLS (300 cases each): storing arg1 as 64 bits -> 300/300
   * wrong; swapping the two slots -> 300/300 wrong; truncating arg2 to 32 bits
   * -> 300/300 wrong.
   *
   * @param limitU32 %esi — the first limit (u32).
   * @param limitU64 %rdx — the second limit (u64, `unsigned long`).
   */
  setCommandBufferLimits(limitU32: number, limitU64: bigint): void {
    // ------------------------------------------------------------
    // @0x1d3530..0x1d3531 — prologue (no TS-visible effect).
    // @0x1d3534 — movl %esi, 0x40(%rdi) : 32-bit store. `>>> 0` models the
    //   truncation so a negative / oversized JS number lands the same bit
    //   pattern the machine would (identical treatment to the u32 setters in
    //   HGRenderJob.ts).
    // ------------------------------------------------------------
    this.commandBufferLimit_u32_at_0x40 = limitU32 >>> 0;
    // ------------------------------------------------------------
    // @0x1d3537 — movq %rdx, 0x48(%rdi) : 64-bit store. BigInt.asUintN(64, …)
    //   models the register's width for the same reason.
    // @0x1d353b..0x1d353c — epilogue + retq (void).
    // ------------------------------------------------------------
    this.commandBufferLimit_u64_at_0x48 = BigInt.asUintN(64, limitU64);
  }
}
