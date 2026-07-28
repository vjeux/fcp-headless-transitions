// FFAudioGainChannelConstantValueBuffer — a "constant gain" audio-gain buffer node in
// Flexo's audio rendering graph. The class is a concrete leaf of FFAudioGainChannelBuffer
// with an additional (indefinite-buffer) parent, wired into FFLocklessQueue as a queue
// element, and further inheriting from FFAudioMixBuss (the audio-node bus interface).
// It represents "the gain value doesn't change over this buffer's span" — its bufferType
// tag is 0 and its numSamples is a directly-stored uint64 count. Any downstream mixer
// that asks it for a gain-value sample knows it's constant.
//
// Verbatim from FCP's Flexo framework:
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Flexo.framework/Versions/A/Flexo
// Source disassembly for all four exported symbols saved at:
//   raw-port/re/disasm/Flexo.FFAudioGainChannelConstantValueBuffer.<mangled>.s
//
// FOUR EXPORTED SYMBOLS:
//   @Flexo 0xe63d20  __ZNK37FFAudioGainChannelConstantValueBuffer10bufferTypeEv
//                     bufferType() const                              [vtable slot *0x10]
//   @Flexo 0xe63d30  __ZNK37FFAudioGainChannelConstantValueBuffer10numSamplesEv
//                     numSamples() const                              [vtable slot *0x18]
//   @Flexo 0xe63fa0  __ZN37FFAudioGainChannelConstantValueBufferD1Ev  ~FFAudioGain... [D1]
//                                                                     [vtable slot *0x00]
//   @Flexo 0xe63fd0  __ZN37FFAudioGainChannelConstantValueBufferD0Ev  ~FFAudioGain... [D0]
//                                                                     [vtable slot *0x08]
//
// VTABLE (via `python3 raw-port/army/tools/resolve.py Flexo vtable
// FFAudioGainChannelConstantValueBuffer`, vtable @0x19180b8, installed-ptr 0x19180c8):
//
//   PRIMARY VTABLE (this file's class):
//   *0x00 -> 0xe63fa0  ~FFAudioGainChannelConstantValueBuffer  [D1 — THIS FILE]
//   *0x08 -> 0xe63fd0  ~FFAudioGainChannelConstantValueBuffer  [D0 — THIS FILE]
//   *0x10 -> 0xe63d20  bufferType() const                       [THIS FILE]
//   *0x18 -> 0xe63d30  numSamples() const                       [THIS FILE]
//   *0x20 -> 0xe63ab0  FFAudioGainChannelBuffer::indefinite() const  [inherited]
//   *0x28 -> 0x0       (unused slot / RTTI-adjacent)
//
//   SECONDARY VTABLES (multiple-inheritance sub-object dispatch tables — the class
//   inherits from FFLocklessQueue<...>, FFLocklessQueueElement<...>, and FFAudioMixBuss.
//   Those live at *0x30..*0xd8 in the same on-disk vtable region; they are cited here
//   for provenance but not decoded — this class overrides NONE of them, they are all
//   inherited straight from the base classes):
//   *0x30 -> typeinfo for FFLocklessQueue<FFAudioGainChannelBuffer*> @0x1917ff0
//   *0x38 -> FFLocklessQueue<FFAudioGainChannelBuffer*>::~FFLocklessQueue()  @0xe64010
//   *0x40 -> FFLocklessQueue<FFAudioGainChannelBuffer*>::~FFLocklessQueue()  @0xe64090
//   *0x48 -> FFLocklessQueueBase::compare(...)                                @0x378eb0
//   *0x50 -> FFLocklessQueueBase::performMigration(...)                       @0x12b9f50
//   *0x60 -> typeinfo for FFLocklessQueueElement<FFAudioGainChannelBuffer*>   @0x1918140
//   *0x68 -> FFLocklessQueueElement<...>::~FFLocklessQueueElement()           @0xe64120
//   *0x70 -> FFLocklessQueueElement<...>::~FFLocklessQueueElement()           @0xe64130
//   *0xc8 -> typeinfo for FFAudioMixBuss                                       @0x19181e8
//   *0xd0 -> FFAudioMixBuss::~FFAudioMixBuss()                                 @0xe641a0
//   *0xd8 -> FFAudioMixBuss::~FFAudioMixBuss()                                 @0xe641d0
//   *0xe0 -> FFAudioMixBuss::ConnectBuss(FFAudioNode*, unsigned int)           @0xe64210
//   *0xe8 -> FFAudioMixBuss::DisconnectBuss()                                  @0xe64440
//   *0xf0 -> FFAudioBuss::PrerollBegin(CMTime, CMTime, CMTime, double, FFPrerollSync*) @0xe644f0
//   *0xf8 -> FFAudioBuss::PrerollEnd()                                          @0xe64500
//
// STRUCT LAYOUT (only offsets THIS CLASS'S four functions read/write are decoded here;
// the rest belong to the base classes and will be modeled when those are ported):
//
//   +0x00  vtable*             // set in D1 @0xe63fab and D0 @0xe63fd7 (both perform
//                              //   leaq VT+0x10(%rip),%rax; movq %rax,(%rdi)).
//   +0x08  void* ownedResource // an owned heap resource. D1 @0xe63fae / D0 @0xe63fda both:
//                              //   movq 0x8(%rdi), %rax          ; load
//                              //   testq %rax, %rax; je <null-skip>
//                              // On non-null: scratch-store to +0x10 then operator delete.
//                              // On null: D1 returns immediately, D0 tail-calls delete(this).
//   +0x10  void* scratch10     // Clang scratch write target. D1 @0xe63fb7 / D0 @0xe63fed:
//                              //   movq %rax, 0x10(%rdi)         ; scratch (like OZHistogramDelegate +0x18)
//                              // Note: this is DIFFERENT from the OZHistogramDelegate case
//                              // where the scratch went to +0x18 — the ownedResource field
//                              // here lives at +0x8 (not +0x10), so the scratch slot is one
//                              // ptr-width later.
//   +0x40  uint64_t numSamples // read by `numSamples() const` @0xe63d34:
//                              //   movq 0x40(%rdi), %rax; ret
//                              // Stored elsewhere (out-of-file — ctor not exported to us).
//
// Fields at +0x18..+0x38 are OWNED BY BASE CLASSES (FFLocklessQueue members,
// FFLocklessQueueElement members, FFAudioMixBuss members). Their offsets can be
// recovered when those parents are ported; the four bodies here never dereference them.
//
// RUNTIME IMPORTS resolved:
//   __ZdlPv  (operator delete(void*))  @Flexo __stubs 0x1497404
//     — verified: called on `ownedResource` (both dtors) and on `this` (D0 only).

/**
 * Opaque owned-resource type at struct offset +0x08. The dtors never touch a sub-field
 * of it, so its destructor must be trivial (POD / raw buffer). Given the class name
 * ("constant-value buffer"), this is most likely a small heap-allocated `float`/`double`
 * cell holding the constant gain value — but nothing in the decoded bytes proves that.
 * A concrete type will be demanded by a downstream setter/allocator, not by us.
 */
export type FFAudioGainChannelConstantValueBufferOwnedResource = object;

/**
 * FFAudioGainChannelConstantValueBuffer — a constant-gain audio buffer node.
 *
 * The class is heap-allocated (D0 exists and tail-calls `operator delete(this)`), lives
 * on the vtable-based FFAudioGainChannelBuffer / FFAudioMixBuss / FFLocklessQueue*
 * multi-inheritance hierarchy, and reports:
 *   • bufferType()  → 0   (compile-time constant tag; there is no per-instance state
 *                          that changes this — the return is a literal `xorl %eax,%eax`)
 *   • numSamples()  → the uint64 count stored at +0x40 (this is per-instance)
 *
 * Field +0x40 (numSamples) is written by an ctor/setter that is NOT exported in this
 * class's symbol set — it lives either inline in a caller or in a base class initializer.
 * We accept the field as read-only from THIS file and expose a setter as an internal API
 * for the ctor to invoke (marked package-private in spirit).
 */
export class FFAudioGainChannelConstantValueBuffer {
  /**
   * +0x08 — the sole owned heap pointer released by D1/D0. Null-safe: the dtor's
   * non-null branch (`testq %rax,%rax; je …`) is the empty-buffer state guard.
   */
  ownedResource: FFAudioGainChannelConstantValueBufferOwnedResource | null = null;

  /**
   * +0x10 — Clang scratch-store target. See file header. Kept as a real field so the
   * observable memory sequence `owner+0x10 = owner+0x8; delete owner+0x8` is faithfully
   * reproduced against any hypothetical reflection reader.
   */
  private _scratch10: FFAudioGainChannelConstantValueBufferOwnedResource | null = null;

  /**
   * +0x40 — the constant number of samples this buffer covers. Read verbatim by
   * numSamples() (below). Stored as a native uint64 (`movq 0x40(%rdi), %rax`).
   */
  private _numSamples: bigint = 0n;

  /**
   * FFAudioGainChannelConstantValueBuffer::bufferType() const @Flexo 0xe63d20
   *
   * Body is a compile-time constant zero:
   *   0xe63d20  pushq  %rbp
   *   0xe63d21  movq   %rsp, %rbp
   *   0xe63d24  xorl   %eax, %eax   ; return 0
   *   0xe63d26  popq   %rbp
   *   0xe63d27  retq
   *
   * The return type is unsigned int (32-bit — via `xorl %eax,%eax`, which zeros edx:eax
   * from below and leaves rax=0 as well; caller convention returns `int`/`uint32_t`
   * in eax). Vtable slot *0x10 dispatches here from any FFAudioGainChannelBuffer* base
   * pointer, so 0 is the "constant" discriminator vs whatever other buffer subclasses
   * return (indefinite: unknown value; time-varying: probably 1 or 2).
   */
  bufferType(): number {
    // @0xe63d24 — xorl %eax,%eax. Literal constant 0.
    return 0;
  }

  /**
   * FFAudioGainChannelConstantValueBuffer::numSamples() const @Flexo 0xe63d30
   *
   * Body reads +0x40 verbatim:
   *   0xe63d30  pushq  %rbp
   *   0xe63d31  movq   %rsp, %rbp
   *   0xe63d34  movq   0x40(%rdi), %rax   ; return this->_numSamples
   *   0xe63d38  popq   %rbp
   *   0xe63d39  retq
   *
   * The result is a native 64-bit unsigned. Callers that want a 32-bit count truncate
   * on their side.
   */
  numSamples(): bigint {
    // @0xe63d34 — direct field load, no computation.
    return this._numSamples;
  }

  /**
   * FFAudioGainChannelConstantValueBuffer::~FFAudioGainChannelConstantValueBuffer()
   * [D1 — base/complete] @Flexo 0xe63fa0
   *
   * Mirrors the asm literally:
   *   0xe63fa0  pushq  %rbp
   *   0xe63fa1  movq   %rsp, %rbp
   *   0xe63fa4  leaq   VT_FFAudioGainChannelConstantValueBuffer+0x10(%rip), %rax
   *                                                        ; installed-ptr = 0x19180c8
   *                                                        ; disp 0xab3f15+7 from RIP 0xe63fab
   *   0xe63fab  movq   %rax, (%rdi)                         ; install active vtable
   *   0xe63fae  movq   0x8(%rdi), %rax                      ; load ownedResource
   *   0xe63fb2  testq  %rax, %rax
   *   0xe63fb5  je     0xe63fc4                              ; null → skip delete
   *   0xe63fb7  movq   %rax, 0x10(%rdi)                     ; scratch write (Clang artifact)
   *   0xe63fbb  movq   %rax, %rdi                            ; arg = ownedResource
   *   0xe63fbe  popq   %rbp
   *   0xe63fbf  jmp    __ZdlPv                               ; tail-call operator delete
   *   0xe63fc4  popq   %rbp
   *   0xe63fc5  retq
   *
   * The vtable-install on entry is the Itanium-ABI "set the currently-destructing
   * vtable" step so any virtual call issued during ~FFAudioGainChannelConstantValueBuffer
   * dispatches to THIS class's slots (rather than the derived-most, already torn down).
   */
  D1(): void {
    // @0xe63fa4..@0xe63fab — install this class's active vtable slot (VT+0x10).
    (this as { _vtableActive?: string })._vtableActive =
      "FFAudioGainChannelConstantValueBuffer";

    // @0xe63fae — load ownedResource.
    const owned = this.ownedResource;

    // @0xe63fb2..@0xe63fb5 — branch on null.
    if (owned === null) {
      // @0xe63fc4..@0xe63fc5 — early return.
      return;
    }

    // @0xe63fb7 — scratch write: this[+0x10] = owned. Compiler artifact, mirrored.
    this._scratch10 = owned;

    // @0xe63fbf — tail-call __ZdlPv(owned). In JS: drop the reference.
    this.ownedResource = null;
  }

  /**
   * FFAudioGainChannelConstantValueBuffer::~FFAudioGainChannelConstantValueBuffer()
   * [D0 — deleting] @Flexo 0xe63fd0
   *
   * Mirrors the asm literally:
   *   0xe63fd0  leaq   VT_FFAudioGainChannelConstantValueBuffer+0x10(%rip), %rax
   *                                                       ; disp 0xab3ee9+7 from RIP 0xe63fd7
   *   0xe63fd7  movq   %rax, (%rdi)                        ; install active vtable
   *   0xe63fda  movq   0x8(%rdi), %rax                     ; load ownedResource
   *   0xe63fde  testq  %rax, %rax
   *   0xe63fe1  je     0x1497404                            ; **NULL BRANCH: tail-call
   *                                                        ;  __ZdlPv on `this`.**
   *                                                        ;  On null-owned we STILL delete
   *                                                        ;  this — D0's contract is to
   *                                                        ;  always free `this`.
   *   0xe63fe7  pushq  %rbp
   *   0xe63fe8  movq   %rsp, %rbp
   *   0xe63feb  pushq  %rbx
   *   0xe63fec  pushq  %rax
   *   0xe63fed  movq   %rax, 0x10(%rdi)                    ; scratch write
   *   0xe63ff1  movq   %rdi, %rbx                          ; save this
   *   0xe63ff4  movq   %rax, %rdi                          ; arg = ownedResource
   *   0xe63ff7  callq  __ZdlPv                              ; delete ownedResource
   *   0xe63ffc  movq   %rbx, %rdi                          ; arg = this
   *   0xe63fff  addq   $0x8, %rsp
   *   0xe64003  popq   %rbx
   *   0xe64004  popq   %rbp
   *   0xe64005  jmp    __ZdlPv                              ; delete this
   *
   * SUBTLE: unlike OZHistogramDelegate's D0 (which jumps to `popq %rbp; retq` on the
   * null branch), THIS class's D0 handles the null branch by branching DIRECTLY into
   * the __ZdlPv stub with `%rdi` still pointing at `this`. That achieves the same
   * effect (`operator delete(this)`) with one fewer instruction because `%rdi` was
   * never overwritten before the je-branch fired. Modeling: on null-owned we skip
   * the ownedResource delete but still mark the object invalidated.
   */
  D0(): void {
    // @0xe63fd0..@0xe63fd7 — install this class's active vtable slot base.
    (this as { _vtableActive?: string })._vtableActive =
      "FFAudioGainChannelConstantValueBuffer";

    // @0xe63fda — load ownedResource.
    const owned = this.ownedResource;

    if (owned === null) {
      // @0xe63fe1 — je 0x1497404 — direct tail-call to operator delete(this).
      // In JS: mark self invalidated; GC handles reclamation.
      (this as { _deleted?: boolean })._deleted = true;
      return;
    }

    // @0xe63fed — scratch write.
    this._scratch10 = owned;

    // @0xe63ff7 — callq __ZdlPv(owned). Drop the reference.
    this.ownedResource = null;

    // @0xe64005 — jmp __ZdlPv(this). Mark self invalidated.
    (this as { _deleted?: boolean })._deleted = true;
  }
}
