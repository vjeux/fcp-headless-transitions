// raw-port/src/infra/PCBufferReadStream.ts
//
// FCP `PCBufferReadStream` — ProCore.framework read-only byte stream over a CFData blob.
//
// Despite the "Stream" name (and the shared PCStream base — see raw-port/src/infra/PCStream.ts
// which is landed), THIS class is a *read* interface: `write()` is a stub that returns 0, and
// the polymorphic write slot inherited from PCStream is never used here. The class is closer to
// a bounded C++ `memcpy` cursor than a text sink. All state is a triple of raw byte pointers
// derived from CFDataGetBytePtr/CFDataGetLength; `getPos` reports the cursor as an offset from
// the base pointer, `setPos` clamps into [base, end].
//
// FRAMEWORK: ProCore.framework (Final Cut Pro).
// BINARY:    /Applications/Final Cut Pro.app/Contents/Frameworks/ProCore.framework/Versions/A/ProCore
// DECODE:    raw-port/re/disasm/ProCore.PCBufferReadStream.*.s
//            plus explicit `awk` extraction of C2/D0/D2 (only C1 is emitted with a matching label
//            by otool -tV; C2/D2 need direct label lookup).
//
// STRUCT LAYOUT (recovered from C2 @0x5159e — every field's offset is emitted verbatim):
//   +0x00  vptr                                       installed @0x515b3-0x515ba
//                                                       `leaq 0xf9b16(%rip),%rax ; movq %rax,(%rbx)`
//                                                       → VA 0x515ba + 0xf9b16 = 0x14b0d0
//                                                       (== `vtable for PCBufferReadStream` @0x14b0c0 + 0x10).
//   +0x08  CFDataRef                                  retained via `_CFRetain` @0x515c0.
//   +0x10  const uint8_t* base                        = `_CFDataGetBytePtr(data)` @0x515cc.
//   +0x18  const uint8_t* end                         = base + `_CFDataGetLength(data)` @0x515df.
//   +0x20  const uint8_t* cur                         = base (initial cursor).
//   sizeof(PCBufferReadStream) = 0x28 bytes (four pointer-sized fields after vptr).
//
// EXPORTED SYMBOLS:
//   @ProCore 0x000000000005159e   C2  (const __CFData*)
//   @ProCore 0x000000000005160a   C1  (const __CFData*)                       — tail-jmps to C2.
//   @ProCore 0x0000000000051614   D2  ()                                     — CFRelease + PCStream::~
//   @ProCore 0x000000000005164c   D1  ()                                     — 4-byte thunk into D2 body
//                                                                              (empty label under otool)
//   @ProCore 0x0000000000051656   D0  ()                                     — tail-jmp to `operator delete`
//   @ProCore 0x0000000000051672   read(void*, u64)
//   @ProCore 0x00000000000516bc   write(const void*, u64)                    — always returns 0
//   @ProCore 0x00000000000516c4   getPos()                                    — cur - base
//   @ProCore 0x00000000000516d2   setPos(u64)                                 — clamp to [base, end]
//   @ProCore 0x00000000000516ec   getError() const                            — returns PCString().
//
// SEMANTICS (from disasm):
//   * `read(void* dst, u64 nBytes)`:
//       Let n = min(nBytes, end - cur).  (Coded as `leaq (cur, nBytes),%rdi ; subq cur,end→r14 ;
//        cmpq end,(cur+nBytes) ; cmovb %rdx,%r14` — i.e. `r14 = (cur+n < end) ? nBytes : end-cur`.)
//       If n > 0: memcpy(dst, cur, n).
//       cur += n.
//       Return n.
//     Note: never advances past `end`, and returns the actual number of bytes copied. Never sets
//     an error flag (this class has no error state; `getError` always returns an empty string).
//   * `write(const void*, u64)`: no-op, returns 0. (`xorl %eax,%eax ; ret`.) Present so the
//     class is not abstract on that overload; the polymorphic write-slot inherited from PCStream
//     is not exercised for reads.
//   * `getPos()`:  cur - base.  Cursor position as offset into the buffer.
//   * `setPos(u64 off)`: cur = min(base + off, end).  Clamped to end (never past); no lower
//     clamp because `off` is unsigned (u64) and base + off ≥ base by construction.
//   * `getError()`: `PCString()` — default-constructed empty PCString. Written directly to the
//     out-param (%rdi is the return slot for the sret PCString), then that slot is returned.
//     The instruction stream literally: `callq PCString::PCString() ; movq %rbx, %rax ; ret`.
//   * D2: writes back a *base* vptr (@0x5161d: `leaq 0xf9aac(%rip),%rax ; movq %rax,(%rdi)` →
//       VA 0x51624 + 0xf9aac = 0x14b0d0 — same VA the ctor installed. This is standard clang
//       "reinstall vtable during destructor" (partial-destruction defense). Then CFRelease the
//       CFDataRef if non-null, then tail-jmp to PCStream::~PCStream (D2).
//     D0: chain to D2 then tail-jmp to `operator delete(void*)`.
//     D1: aliased to a 4-byte thunk that jumps to D2 body (Itanium-ABI dual-emit).
//
// FRONTIER (deferred — stubbed as TS Node/browser-agnostic shims; not fabricated):
//   • `_CFRetain` / `_CFRelease` / `_CFDataGetBytePtr` / `_CFDataGetLength`:
//       CoreFoundation entry points. We take the CFData at ctor time as an *opaque handle* and
//       model it as a `Uint8Array` view of the underlying bytes plus a JS-side refcount that
//       matches CF's retain/release calls. The bytes are captured at ctor time (CFDataGetBytePtr
//       is a stable pointer for the lifetime of a *retained* CFData), which mirrors the FCP
//       semantics: the buffer must not mutate under the reader.
//   • `_memcpy`: modeled by `Uint8Array.set(subarray)` — bit-for-bit copy of `n` bytes.
//   • `PCString::PCString()` — the landed PCString class already exposes a no-arg ctor that
//     produces an empty CFString-backed PCString (see raw-port/src/infra/PCString.ts). We call
//     it directly.
//   • `PCStream::~PCStream()` — landed. D2 tail-jmps to it after CFRelease.
//
// NON-FABRICATION NOTE:
//   The polymorphic write slot (*0x18 in PCStream's vtable) inherited by PCBufferReadStream is
//   not decoded here because THIS class does not call it — the vtable install at ctor time
//   places PCBufferReadStream's own vtable (VA 0x14b0d0), whose *0x18 slot content is not needed
//   for any of the six exported methods. If a caller invokes stream write through the vptr on a
//   PCBufferReadStream, they must look up the vtable slot at VA 0x14b0d0+0x18 — which is not
//   traversed by any code path in this file.

import { PCString } from "./PCString.js";

// ── Frontier stubs for CoreFoundation ────────────────────────────────────────────────────

/**
 * CFData-like handle. In FCP this is a `__CFData*` (opaque). Our port models it as a
 * pointer-plus-bytes: `data` is the raw byte buffer, `retain`/`release` mimic CF's refcount.
 *
 * We deliberately do NOT invent a full CoreFoundation shim; only the surface PCBufferReadStream
 * uses (CFRetain / CFRelease / CFDataGetBytePtr / CFDataGetLength) is faithful to the disasm.
 */
export interface CFDataRef {
  /** Bytes of the CFData. Stable for the lifetime of the retain issued by PCBufferReadStream. */
  bytes: Uint8Array;
  /**
   * Called by PCBufferReadStream ctor @ProCore 0x515c0 to increment the refcount. Mirroring
   * CFRetain: returns the same pointer. Modeled as a required method on the CFData handle so
   * this port never invents its own refcount table.
   */
  retain(): void;
  /**
   * Called by PCBufferReadStream D2 @ProCore 0x51630 to decrement the refcount and free when
   * it hits zero. Mirroring CFRelease.
   */
  release(): void;
}

/**
 * `_CFDataGetBytePtr(CFDataRef)` @ProCore call stub @0xddf52 (referenced from C2 @0x515cc).
 * CoreFoundation returns a `const uint8_t*` that is stable for the lifetime of a retained
 * CFData. We surface that as a stable `Uint8Array` view (no copy).
 */
function CFDataGetBytePtr(data: CFDataRef): Uint8Array {
  // In CF this is `(const UInt8*)data->_bytes`. We keep the same array reference so `read`
  // sees byte updates only if the caller mutates the CFData between retain and release —
  // which they must not, per CF contract.
  return data.bytes;
}

/**
 * `_CFDataGetLength(CFDataRef)` @ProCore call stub @0xddf5e (referenced from C2 @0x515df).
 * Returns the byte count of the CFData.
 */
function CFDataGetLength(data: CFDataRef): number {
  return data.bytes.length;
}

// ── The class ────────────────────────────────────────────────────────────────────────────

/**
 * `PCBufferReadStream` — bounded, read-only byte cursor over a CFData.
 *
 * Extends `PCStream` in FCP but overrides the vtable to a class-specific one that never
 * exercises the base's pure-virtual write slot. We match this in TS by NOT extending the
 * `PCStream` class — PCStream is abstract in the port and its `write` slot must be
 * implemented; PCBufferReadStream's `write` returns 0 and is not a text sink. We express
 * that class relationship in this comment; call sites that need a `PCStream` view of a
 * `PCBufferReadStream` should not exist because no read-flow does so (verified by the
 * absence of any polymorphic-write call in the disasm of any of the six methods).
 */
export class PCBufferReadStream {
  /** +0x00 vptr — installed @ProCore 0x515b3-0x515ba → VA 0x14b0d0 (class vtable + 0x10). */
  readonly __vptr = 0x14b0d0;

  /** +0x08 CFDataRef — retained on entry, released on D2. `null` after destroy. */
  private data: CFDataRef | null;

  /** +0x10 base pointer — `CFDataGetBytePtr(data)`. In TS: the Uint8Array of the CFData. */
  private base: Uint8Array;

  /** +0x18 end offset — length of `base` (i.e. one past last valid byte). Held as an integer. */
  private end: number;

  /** +0x20 cur offset — current cursor, initially 0. Held as an integer (0 ≤ cur ≤ end). */
  private cur: number;

  /**
   * `PCBufferReadStream::PCBufferReadStream(__CFData const*)`  — C2 @ProCore 0x5159e
   * (C1 @0x5160a tail-jmps to C2; both share this body).
   *
   * DECODE:
   *   0x515ae  callq PCStream::PCStream()               ; base ctor
   *   0x515b3  leaq 0xf9b16(%rip),%rax                  ; VA 0x14b0d0 (own vtable+0x10)
   *   0x515ba  movq %rax,(%rbx)                         ; install vptr
   *   0x515c0  callq _CFRetain(data)                    ; retain input
   *   0x515c5  movq %r14,0x8(%rbx)                      ; +0x08 = data
   *   0x515cc  callq _CFDataGetBytePtr(data)            ; rax = base ptr
   *   0x515d4  movq %rax,0x10(%rbx)                     ; +0x10 = base
   *   0x515d8  movq %rax,0x20(%rbx)                     ; +0x20 = cur = base
   *   0x515df  callq _CFDataGetLength(data)             ; rax = length
   *   0x515e4  addq %rax,%r15                           ; r15 = base + length
   *   0x515e7  movq %r15,0x18(%rbx)                     ; +0x18 = end (= base + length)
   */
  constructor(data: CFDataRef) {
    // @ProCore 0x515ae: PCStream::PCStream() — the landed base sets its vptr and has no
    // observable state we track here. Our TS PCStream base ctor is idempotent; we do not
    // route through it because we override the vptr immediately and the base has no fields
    // the read path reads.

    // @ProCore 0x515c0
    data.retain();

    // @ProCore 0x515c5
    this.data = data;

    // @ProCore 0x515cc..0x515d8
    this.base = CFDataGetBytePtr(data);

    // @ProCore 0x515d8: cur := base (byte-pointer-equal; in our int-cursor model, offset 0).
    this.cur = 0;

    // @ProCore 0x515df..0x515e7: end := base + CFDataGetLength(data). In our int-cursor
    // model that's just the length itself.
    this.end = CFDataGetLength(data);
  }

  /**
   * `PCBufferReadStream::~PCBufferReadStream()` — D2 @ProCore 0x51614 (D0 @0x51656 chains
   * D2 then tail-jmps to `operator delete`).
   *
   * DECODE:
   *   0x5161d  leaq 0xf9aac(%rip),%rax ; movq %rax,(%rdi)   ; reinstall own vtable during dtor
   *   0x51627  movq 0x8(%rdi),%rdi                          ; load `data`
   *   0x5162b  testq %rdi,%rdi ; je …0x51635                ; skip release if null
   *   0x51630  callq _CFRelease(data)
   *   0x5163e  jmp PCStream::~PCStream() (D2)               ; base dtor tail-call
   *
   * We do not model the "reinstall base vptr" partial-destruction safeguard because there
   * are no polymorphic calls on `this` after this point in TS. We faithfully release the
   * CFData; we don't do explicit base-dtor because PCStream has no destroyable state in the
   * port beyond the vptr, which is bookkeeping.
   */
  destroy(): void {
    // @ProCore 0x5162b..0x51630
    if (this.data !== null) {
      this.data.release();
      this.data = null;
    }
  }

  /**
   * `PCBufferReadStream::read(void* dst, uint64_t nBytes)` — @ProCore 0x51672.
   *
   * DECODE:
   *   entry:  rdi=this, rsi=dst, rdx=nBytes.
   *   0x51679  movq %rsi,%rax               ; save dst (returned via rdi later? no — rax final == r14)
   *   0x5167c  movq %rdi,%rbx                ; this
   *   0x5167f  movq 0x18(%rdi),%rcx          ; end
   *   0x51683  movq 0x20(%rdi),%rsi          ; cur
   *   0x51687  leaq (%rsi,%rdx),%rdi         ; cur + nBytes
   *   0x5168b  movq %rcx,%r14                ; r14 = end
   *   0x5168e  subq %rsi,%r14                ; r14 = end - cur
   *   0x51691  cmpq %rcx,%rdi                ; (cur + nBytes) vs end
   *   0x51694  cmovbq %rdx,%r14              ;   if (cur+nBytes) <  end → r14 = nBytes
   *                                          ;   else (cur+nBytes) >= end → keep r14 = end-cur
   *   0x51698  testq %r14,%r14 ; je …0x516ac ; skip memcpy on 0
   *   0x5169d  memcpy(dst=%rax, cur=%rsi, r14)
   *   0x516ac  movq 0x20(%rbx),%rsi          ; reload cur (may have been clobbered)
   *   0x516ac  addq %r14,%rsi ; movq %rsi,0x20(%rbx)   ; cur += r14
   *   0x516b3  movq %r14,%rax                 ; return r14 (bytes copied)
   *
   * Semantics: reads at most (end - cur) bytes into dst; if the requested count fits, reads
   * exactly nBytes; returns the actual byte count read; never overreads.
   */
  read(dst: Uint8Array, nBytes: number): number {
    // @ProCore 0x51687..0x51694
    const remaining = this.end - this.cur;
    const n = nBytes < remaining ? nBytes : remaining;
    // (The disasm's `cmovbq` is unsigned "below": (cur+nBytes) < end takes r14=nBytes else
    // keeps r14=end-cur. On non-overflow that's exactly `min(nBytes, end-cur)`. In JS all
    // ints fit in Number's safe range for typical CFData sizes, so we compare directly.)

    // @ProCore 0x51698..0x516a3: memcpy of `n` bytes.
    if (n > 0) {
      // Mirrors `_memcpy(dst, base + cur, n)`.
      dst.set(this.base.subarray(this.cur, this.cur + n));
    }

    // @ProCore 0x516ac..0x516af: cur += n.
    this.cur += n;

    // @ProCore 0x516b3: return n.
    return n;
  }

  /**
   * `PCBufferReadStream::write(const void*, uint64_t)` — @ProCore 0x516bc.
   *
   * BODY:
   *   pushq %rbp ; movq %rsp,%rbp ; xorl %eax,%eax ; popq %rbp ; retq
   *
   * Unconditionally returns 0. This is not a text-sink override — the PCStream *0x18 pure
   * virtual is not called on a PCBufferReadStream in any decoded path in this file. Present
   * only to make the concrete-vs-abstract typing complete.
   */
  write(_src: Uint8Array, _nBytes: number): number {
    // @ProCore 0x516c0: xorl %eax,%eax.
    return 0;
  }

  /**
   * `PCBufferReadStream::getPos()` — @ProCore 0x516c4.
   *
   * BODY:
   *   movq 0x20(%rdi),%rax     ; cur
   *   subq 0x10(%rdi),%rax     ; cur - base
   *   ret
   *
   * Returns cursor as an offset from base. In our int-cursor model, `cur` is already the
   * offset from base (base at offset 0), so this is just `this.cur`.
   */
  getPos(): number {
    // @ProCore 0x516c8..0x516cc
    return this.cur;
  }

  /**
   * `PCBufferReadStream::setPos(uint64_t off)` — @ProCore 0x516d2.
   *
   * BODY:
   *   0x516d6  addq 0x10(%rdi),%rsi    ; rsi = base + off
   *   0x516da  movq 0x18(%rdi),%rax    ; rax = end
   *   0x516de  cmpq %rax,%rsi          ; (base+off) vs end
   *   0x516e1  cmovaq %rax,%rsi        ; if above (unsigned >) → rsi = end
   *   0x516e5  movq %rsi,0x20(%rdi)    ; cur = clamped
   *   ret
   *
   * Clamps to `end` (never past). No lower clamp because `off` is unsigned; `base + off ≥
   * base` by construction.
   */
  setPos(off: number): void {
    // @ProCore 0x516d6..0x516e5
    const candidate = off; // (base at offset 0 in our int-cursor model)
    // `cmova` is unsigned above: candidate > end → end, else candidate.
    this.cur = candidate > this.end ? this.end : candidate;
  }

  /**
   * `PCBufferReadStream::getError() const` — @ProCore 0x516ec.
   *
   * BODY:
   *   pushq %rbp ; movq %rsp,%rbp ; pushq %rbx ; pushq %rax
   *   movq %rdi,%rbx                           ; %rdi is the sret slot (PCString return)
   *   callq PCString::PCString()               ; construct empty PCString in *rdi
   *   movq %rbx,%rax                           ; return the sret slot
   *   epilogue ; ret
   *
   * Semantics: always returns an empty PCString — this class has no error state. Any caller
   * checking `getError()` for a non-empty string will always find success.
   */
  getError(): PCString {
    // @ProCore 0x516f5: PCString::PCString() — the landed empty ctor. We call the no-arg
    // form of the ported class.
    return new PCString();
  }
}
