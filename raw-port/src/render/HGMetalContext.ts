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
//
// re/disasm:
//   raw-port/re/disasm/Helium.__ZNK14HGMetalContext16bufferInfiniPoolEv.s
//   raw-port/re/disasm/Helium.__ZNK14HGMetalContext10deviceInfoEv.s
//   raw-port/re/disasm/Helium.__ZNK14HGMetalContext11texturePoolEv.s
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
}
