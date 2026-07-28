// FFAVFQTVideoCursor.ts — FCP Flexo framework class.
// Transcribed from the x86_64 disassembly of Flexo in
// /Applications/Final Cut Pro.app/Contents/Frameworks/Flexo.framework/
// Versions/A/Flexo (see /tmp/Flexo_tV.txt @0xdfb4b0..0xdfb597 for the
// full ground-truth bytes reproduced verbatim in the doc-comments below).
//
// Sibling of FFAVFQTAudioCursor (already ported in this directory) — the
// two classes share the same shape (Quicktime-flavoured subclass of a
// FFAVF*Cursor base, with a distinct vtable and one method that routes
// through the concrete FFAVFQTMediaReader variant). This class differs
// in three ways:
//   1. Its base is FFAVFVideoCursor (not FFAVFAudioCursor), and its base
//      ctor takes a THIRD `int` arg (the audio ctor drops it) — so the
//      mode param is FORWARDED to the base here rather than ignored.
//   2. It has a `copy() const` method (@0xdfb510) that the audio variant
//      does not, and which is the interesting body of this class: it
//      queries the retained NSObject at +0x48 via an ObjC `-copy`
//      selector, then constructs a fresh FFAVFVideoCursor with the same
//      reader/cursor and the trackID returned by vtable slot *0x50.
//   3. Its routed method is `createSampleBufferFromDisk` (@0xdfb5a0), not
//      `createSampleBufferForReadRequest` — but the tail-call shape is
//      identical (drop the `int` arg1 to slot 4, insert `bool=true` at
//      slot 3, forward `sampleCursor` at slot 2). Note the inserted bool
//      here is `1` (`movl $0x1, %edx` @0xdfb5b7), not `0` — a semantic
//      divergence from the audio variant.
//
// Symbols (nm | c++filt):
//   0xdfb4b0 t FFAVFQTVideoCursor::FFAVFQTVideoCursor(FFAVFQTMediaReader*, AVSampleCursor*, int)  (C2)
//   (C1 is folded/absent in the x86_64 slice — trivial delegator to C2 by ABI.)
//   0xdfb4d0 t FFAVFQTVideoCursor::~FFAVFQTVideoCursor()  (D2 — tail-jmp to FFAVFVideoCursor::~FFAVFVideoCursor)
//   0xdfb4e0 t FFAVFQTVideoCursor::~FFAVFQTVideoCursor()  (D1 — byte-identical body to D2)
//   0xdfb4f0 t FFAVFQTVideoCursor::~FFAVFQTVideoCursor()  (D0 — call base D2 then operator delete)
//   0xdfb510 t FFAVFQTVideoCursor::copy() const
//   0xdfb5a0 t FFAVFQTVideoCursor::createSampleBufferFromDisk(int, FFMediaReaderRequestMode, CMTime, FFPrerollBatch*) const
//
// PROVENANCE / DECODE:
//   /tmp/Flexo_tV.txt inspected linearly across the labels above.
//   Referenced externs (all cited by @0xADDR at each callq/jmp/leaq below):
//     __ZN16FFAVFVideoCursorC2EP16FFAVFMediaReaderP14AVSampleCursori
//         FFAVFVideoCursor::FFAVFVideoCursor(FFAVFMediaReader*, AVSampleCursor*, int)   — base ctor
//         called from C2 @0xdfb4b9 and copy() @0xdfb55c.
//     __ZN16FFAVFVideoCursorD2Ev
//         FFAVFVideoCursor::~FFAVFVideoCursor()   — base dtor
//         called from D2 @0xdfb4d5, D1 @0xdfb4e5, D0 @0xdfb4f9.
//     __ZdlPv (symbol stub @0x1497404)
//         operator delete(void*)   — invoked from D0 @0xdfb507 and copy()'s
//         cleanup landing pad @0xdfb58a.
//     __Unwind_Resume (symbol stub @0x1495d30)
//         _Unwind_Resume — copy()'s cleanup landing pad @0xdfb592.
//     __ZNK18FFAVFQTMediaReader26createSampleBufferFromDiskEP14AVSampleCursorbi24FFMediaReaderRequestMode6CMTimeP14FFPrerollBatch
//         FFAVFQTMediaReader::createSampleBufferFromDisk(AVSampleCursor*, bool, int,
//           FFMediaReaderRequestMode, CMTime, FFPrerollBatch*) const
//         tail-jmp target from createSampleBufferFromDisk @0xdfb5bd.
//     _objc_msgSend (bind @__DATA_CONST __got 0x18ed6c0)
//         used at @0xdfb529 with selref "copy" @0x1bb85e0 (rebase target
//         @0x17704f5 = cstring "copy" in __TEXT __objc_methname).
//     _objc_release (bind @__DATA_CONST __got 0x18ed708)
//         used at @0xdfb56e to release the temporary +[reader copy] result.
//
//   Vtable install disp math (verified numerically):
//     C2 @0xdfb4be leaq 0xb1a97b(%rip),%rax ; next-insn RIP = 0xdfb4c5.
//       0xdfb4c5 + 0xb1a97b = 0x1915e40 (vtable+0x10 for FFAVFQTVideoCursor).
//     copy() @0xdfb561 leaq 0xb1a8d8(%rip),%rax ; next-insn RIP = 0xdfb568.
//       0xdfb568 + 0xb1a8d8 = 0x1915e40 (same vtable+0x10 — confirms the
//       fresh object it constructs is a FFAVFQTVideoCursor even though the
//       base ctor it calls is FFAVFVideoCursor's).
//     Selref @0xdfb522 leaq 0xdbd0b7(%rip),%rsi ; next-insn RIP = 0xdfb529.
//       0xdfb529 + 0xdbd0b7 = 0x1bb85e0. dyld_info -fixups reports that
//       DATA/__objc_selrefs slot is a rebase to 0x17704f5, and the bytes
//       at 0x17704f5 in the thin binary spell out "copy\0". Confirmed via:
//         python3 read of /tmp/Flexo.x86_64 at offset 0x17704F5 for 64 bytes,
//         split at the first NUL byte, yields the cstring b'copy'. Confirmed.
//
// ── STRUCT LAYOUT (inherited entirely from FFAVFVideoCursor base) ─────
//   +0x00 vptr           : vtable ptr (base+0x10 = 0x1915e40) — installed
//                          by C2 after base ctor returns.
//   +0x08 mediaReader    : FFAVFMediaReader* (base field) — used by
//                          createSampleBufferFromDisk as the target of the
//                          tail-call; and by copy() @0xdfb547 as the arg
//                          to the fresh FFAVFVideoCursor's C2. Read from
//                          the parent object; upcast valid because the
//                          runtime type is a FFAVFQTMediaReader*.
//   +0x48 avAsset        : id (retained NSObject; likely an AVAsset/AVAssetTrack)
//                          — read by copy() @0xdfb51e as the target of
//                          `-copy` messaging. NOT a field on the base
//                          FFAVFAudioCursor (which has no such method);
//                          the offset 0x48 is well past the base's
//                          +0x08/+0x10 pair, so it's a field owned by
//                          FFAVFVideoCursor (video-only ObjC handle).
//
// The `copy()` method's control flow:
//   1. Load this.avAsset (+0x48) into %rdi and the "copy" selref (+bytes @0x1bb85e0)
//      into %rsi, then call objc_msgSend @0x18ed6c0 (i.e. `[this.avAsset copy]`).
//   2. If the msgSend result is nil (test %rax,%rax; je) — return nullptr.
//   3. Otherwise: heap-allocate 0x50 (80) bytes for a fresh FFAVFVideoCursor,
//      read this.mediaReader (+0x08 into %r12 as ptr), call vtable slot *0x50
//      on `this` (returns an int trackID via %eax), then invoke
//      FFAVFVideoCursor::C2(newObj, this.mediaReader, [avAsset copy], trackID).
//   4. Install the FFAVFQTVideoCursor vtable at newObj+0 (leaq VT+0x10;
//      movq %rax,(%rbx) @0xdfb561..0xdfb568 — SAME vtable disp as this C2).
//   5. Release the temporary [avAsset copy] result via _objc_release @0xdfb56e
//      (the base ctor is expected to have already retained/consumed it).
//   6. Return the new FFAVFQTVideoCursor pointer.
//
// The vtable slot *0x50 is an unresolved frontier — its meaning here is
// "give me the int discriminator to pass to the base ctor as `mode`".
// The likely source is FFAVFVideoCursor::trackID() const or similar, but
// we do not have the base vtable dumped in this brief. The port accepts
// it as an opaque virtual call and demands the frontier (throwing stub
// citing @0xdfb54e).

import type { CMTime } from "../infra/CMTime";
import type {
  AVSampleCursor,
  FFAVFMediaReader,
  FFAVFQTMediaReader,
  FFMediaReaderRequestMode,
  FFPrerollBatch,
} from "./FFAVFQTAudioCursor";

/**
 * FFAVFQTVideoCursor — a Quicktime-flavoured video cursor variant of
 * FFAVFVideoCursor. Adds an extra retained NSObject at +0x48 (the AVAsset
 * whose track this cursor walks), and routes its "disk-fetch" fast path
 * through the concrete FFAVFQTMediaReader variant.
 *
 * @class Flexo FFAVFQTVideoCursor
 * @provenance Flexo @0xdfb4b0 (C2), @0xdfb4d0 (D2), @0xdfb4e0 (D1),
 *             @0xdfb4f0 (D0), @0xdfb510 (copy), @0xdfb5a0
 *             (createSampleBufferFromDisk).
 *             vtable+0x10 = 0x1915e40 (target of leaq @0xdfb4be, verified
 *             again by the same disp in copy() @0xdfb561).
 */
export class FFAVFQTVideoCursor {
  /**
   * +0x08 (inherited from FFAVFVideoCursor) — retained media reader.
   * The runtime type is a FFAVFQTMediaReader* (which extends
   * FFAVFMediaReader), so we type it as the concrete subclass for the
   * benefit of createSampleBufferFromDisk's tail-call.
   */
  mediaReader: FFAVFQTMediaReader | null = null;

  /**
   * +0x10 (inherited from FFAVFVideoCursor) — retained sample cursor.
   */
  sampleCursor: AVSampleCursor | null = null;

  /**
   * +0x48 — retained NSObject (AVAsset or AVAssetTrack). Read by copy()
   * @0xdfb51e as the receiver of `-copy` messaging. Owned by
   * FFAVFVideoCursor (base subobject), not FFAVFAudioCursor — the audio
   * cursor sibling does not have this slot.
   */
  avAsset: object | null = null;

  /**
   * FFAVFQTVideoCursor::FFAVFQTVideoCursor(reader, cursor, mode) — C2 ctor.
   *
   * Flexo @0xdfb4b0..0xdfb4ce.
   *
   *     pushq  %rbp
   *     movq   %rsp, %rbp
   *     pushq  %rbx
   *     pushq  %rax
   *     movq   %rdi, %rbx                        ; save `this`
   *     callq  __ZN16FFAVFVideoCursorC2EP16FFAVFMediaReaderP14AVSampleCursori
   *                                              ; base(FFAVFMediaReader*,
   *                                              ;      AVSampleCursor*, int)
   *                                              ; rsi=reader, rdx=cursor,
   *                                              ; rcx=mode ALL forwarded
   *                                              ; (unlike audio, video's
   *                                              ;  base ctor DOES take
   *                                              ;  the third int arg).
   *     leaq   0xb1a97b(%rip), %rax              ; rax = 0x1915e40 (vtable+0x10)
   *     movq   %rax, (%rbx)                      ; install vptr at +0x00
   *     addq   $0x8, %rsp
   *     popq   %rbx
   *     popq   %rbp
   *     retq
   *
   * The `mode` (aka trackID in the copy() call site's usage) is forwarded
   * to the base ctor via `rcx` in the SysV ABI — arg 3 of the base is
   * passed in rcx. This ctor does not itself store `mode` in any observable
   * slot of the this-subclass; the base decides where it lives (frontier
   * — the offset in the base object is not decoded in this file).
   */
  constructor(
    reader: FFAVFQTMediaReader | null,
    cursor: AVSampleCursor | null,
    mode: number,
  ) {
    // Base ctor stores reader -> +0x08 and cursor -> +0x10 (retain semantics
    // owned by FFAVFVideoCursor; not yet transcribed — the base symbol
    // __ZN16FFAVFVideoCursorC2EP16FFAVFMediaReaderP14AVSampleCursori is
    // called from @0xdfb4b9 and its body is a separate frontier port).
    // The third arg `mode` lands somewhere in the base object; we retain
    // the JS parameter so the constructor signature matches the C++ one.
    this.mediaReader = reader;
    this.sampleCursor = cursor;
    // @0xdfb4be leaq 0xb1a97b(%rip),%rax ; @0xdfb4c5 movq %rax,(%rbx) —
    // installs vtable+0x10 (=0x1915e40, vtable base 0x1915e30). In the TS
    // port we track class identity implicitly via the JS class — no
    // explicit vptr field is stored. The frontier +0x48 field (avAsset)
    // is initialized to null here for observable-state fidelity; the
    // base ctor does NOT touch +0x48 (the base is FFAVFVideoCursor, which
    // owns the field but must initialize it via a separate code path —
    // likely a setter invoked after construction, not decoded here).
    void mode; // consumed by the base ctor — kept in signature only.
  }

  /**
   * FFAVFQTVideoCursor::~FFAVFQTVideoCursor()  — D2 base destructor.
   *
   * Flexo @0xdfb4d0..0xdfb4d9.
   *
   *     pushq  %rbp
   *     movq   %rsp, %rbp
   *     popq   %rbp
   *     jmp    __ZN16FFAVFVideoCursorD2Ev       ; tail-jmp to base D2
   *
   * Adds no cleanup of its own — pure tail-call to the base dtor
   * (FFAVFVideoCursor::~FFAVFVideoCursor, not yet transcribed; the base
   * is responsible for releasing mediaReader/sampleCursor/avAsset).
   *
   * D1 @0xdfb4e0..0xdfb4e9 is byte-identical (same three insns + same
   * `jmp __ZN16FFAVFVideoCursorD2Ev` target). Folded into this method;
   * a caller of D1 semantics gets the same observable effect.
   */
  destroy(): void {
    // Base ~FFAVFVideoCursor() releases the retained fields. Not yet
    // transcribed @__ZN16FFAVFVideoCursorD2Ev (called from @0xdfb4d5 and
    // @0xdfb4e5 and @0xdfb4f9).
    this.mediaReader = null;
    this.sampleCursor = null;
    this.avAsset = null;
  }

  /**
   * FFAVFQTVideoCursor::~FFAVFQTVideoCursor()  — D0 deleting destructor.
   *
   * Flexo @0xdfb4f0..0xdfb50b.
   *
   *     pushq  %rbp
   *     movq   %rsp, %rbp
   *     pushq  %rbx
   *     pushq  %rax
   *     movq   %rdi, %rbx                        ; save this
   *     callq  __ZN16FFAVFVideoCursorD2Ev        ; run base D2 in place
   *     movq   %rbx, %rdi
   *     addq   $0x8, %rsp
   *     popq   %rbx
   *     popq   %rbp
   *     jmp    0x1497404                         ; symbol stub for __ZdlPv
   *                                              ; => operator delete(this)
   *
   * In TS there is no operator delete — GC handles the memory. We only
   * mirror the observable state-clearing side of the base dtor.
   */
  destroyAndFree(): void {
    // Base D2 semantics (release retains); see destroy() above.
    this.destroy();
    // operator delete @0x1497404 stub — no-op in TS (GC).
  }

  /**
   * FFAVFQTVideoCursor::copy() const
   *
   * Flexo @0xdfb510..0xdfb597. Full body verbatim:
   *
   *     pushq  %rbp
   *     movq   %rsp, %rbp
   *     pushq  %r15
   *     pushq  %r14
   *     pushq  %r12
   *     pushq  %rbx
   *     movq   %rdi, %r15                        ; %r15 = this (const-qualified)
   *     movq   0x48(%rdi), %rdi                  ; rdi = this.avAsset (+0x48)
   *     movq   0xdbd0b7(%rip), %rsi              ; rsi = @sel("copy") — selref
   *                                              ;   @0x1bb85e0 (rebase target
   *                                              ;   @0x17704f5 = cstring "copy")
   *     callq  *0xaf2191(%rip)                    ; call _objc_msgSend
   *                                              ;   (via __got 0x18ed6c0)
   *                                              ;   -> id [avAsset copy]
   *     testq  %rax, %rax                        ; nil?
   *     je     0xdfb576                           ; if nil, return 0
   *     movq   %rax, %r14                        ; %r14 = copiedAvAsset
   *     movl   $0x50, %edi
   *     callq  0x1497452                         ; __Znwm(0x50) => 80-byte alloc
   *     movq   %rax, %rbx                        ; %rbx = newCursor
   *     movq   (%r15), %rax                      ; %rax = this.vptr
   *     movq   0x8(%r15), %r12                   ; %r12 = this.mediaReader (+0x08)
   *     movq   %r15, %rdi                        ; rdi = this
   *     callq  *0x50(%rax)                       ; virtual call vtable[*0x50]
   *                                              ;   — returns int trackID via
   *                                              ;   %eax (only low 32 bits used
   *                                              ;   by the caller: `movl %eax,%ecx`).
   *                                              ;   FRONTIER: base vtable slot 0x50
   *                                              ;   is not decoded in this file.
   *     movq   %rbx, %rdi                        ; rdi = newCursor (new `this`)
   *     movq   %r12, %rsi                        ; rsi = mediaReader
   *     movq   %r14, %rdx                        ; rdx = copiedAvAsset
   *                                              ;   NOTE: base ctor's arg 2 is
   *                                              ;   AVSampleCursor* — this code
   *                                              ;   passes the copiedAvAsset in
   *                                              ;   its place. That means the
   *                                              ;   FFAVFVideoCursor base ctor
   *                                              ;   accepts an AVSampleCursor*
   *                                              ;   OR an AVAsset* (id) in this
   *                                              ;   slot — the two ObjC types
   *                                              ;   are register-compatible and
   *                                              ;   the base ctor presumably has
   *                                              ;   a type-erased "retain me"
   *                                              ;   behaviour. Alternately the
   *                                              ;   base ctor's signature in the
   *                                              ;   binary is actually
   *                                              ;   (FFAVFMediaReader*, id, int)
   *                                              ;   and the c++filt-decoded name
   *                                              ;   `AVSampleCursor*` is a
   *                                              ;   header-vestigial artifact.
   *                                              ;   We mirror the asm faithfully
   *                                              ;   (pass copiedAvAsset).
   *     movl   %eax, %ecx                        ; ecx = trackID (base arg 3)
   *     callq  __ZN16FFAVFVideoCursorC2EP16FFAVFMediaReaderP14AVSampleCursori
   *                                              ; base(FFAVFMediaReader*, id/cursor, int)
   *     leaq   0xb1a8d8(%rip), %rax              ; rax = 0x1915e40 (vtable+0x10)
   *     movq   %rax, (%rbx)                      ; install FFAVFQTVideoCursor vptr
   *                                              ;   at newCursor+0x00. SAME
   *                                              ;   vtable slot base as our own
   *                                              ;   C2 uses (verified numerically).
   *     movq   %r14, %rdi                        ; rdi = copiedAvAsset
   *     callq  *0xaf2194(%rip)                    ; call _objc_release
   *                                              ;   (via __got 0x18ed708) — the
   *                                              ;   base ctor is expected to
   *                                              ;   have retained it, so we
   *                                              ;   drop our local +1 ref.
   *     jmp    0xdfb578                           ; fall through to epilogue
   *   0xdfb576:
   *     xorl   %ebx, %ebx                        ; ebx = 0 (return null)
   *   0xdfb578:
   *     movq   %rbx, %rax                        ; return newCursor (or 0)
   *     popq   %rbx
   *     popq   %r12
   *     popq   %r14
   *     popq   %r15
   *     popq   %rbp
   *     retq
   *
   *   Cleanup landing pad (invoked only if the base ctor throws; not
   *   modeled in the JS body — see the general policy in this port about
   *   __Unwind_Resume):
   *   0xdfb584: movq %rax,%r14 ; movq %rbx,%rdi ; callq __ZdlPv @0x1497404
   *             (free the partially-constructed newCursor)
   *   0xdfb58f: movq %r14,%rdi ; callq __Unwind_Resume @0x1495d30
   *
   * SEMANTIC SUMMARY: `copy()` returns a fresh FFAVFQTVideoCursor* that
   * shares the same mediaReader as `this` but owns its own copy of the
   * AVAsset and re-queries `this`'s vtable slot *0x50 (trackID/mode) to
   * pass into the new object's base ctor. If the source avAsset is nil,
   * returns null.
   */
  copy(): FFAVFQTVideoCursor | null {
    // @0xdfb51e — load this.avAsset (+0x48).
    const avAsset = this.avAsset;

    // @0xdfb522..@0xdfb529 — [avAsset copy] via objc_msgSend.
    // In TS we do not have live ObjC; the caller is responsible for
    // wiring in an ObjC bridge or a JS stand-in that responds to `copy`.
    // We define the observable contract: nil -> null; non-nil -> a
    // fresh object (assumed retained +1 by the msgSend return
    // convention).
    if (avAsset === null) {
      // @0xdfb52f..@0xdfb532 je 0xdfb576 — nil-return path.
      return null;
    }

    // @0xdfb529 — send `copy` selector. Frontier: the ObjC bridge.
    // The observable requirement is that the returned object is a
    // freshly-retained clone of `avAsset`. In the pure-TS transcription
    // we simulate the +1 retain by naming the local variable; the
    // matching _objc_release @0xdfb56e drops it below.
    const copiedAvAsset = this.__objc_msgSend_copy(avAsset);
    if (copiedAvAsset === null) {
      // @0xdfb52f..@0xdfb532 — same nil-branch, taken when the ObjC
      // -copy method itself returns nil (e.g. if the target does not
      // conform to <NSCopying>). Faithful to the asm.
      return null;
    }

    // @0xdfb537..@0xdfb541 __Znwm(0x50) — allocate 80 bytes for the
    // fresh FFAVFVideoCursor. Modeled as `new FFAVFQTVideoCursor(...)`
    // with a deferred base-ctor call.
    //
    // @0xdfb547 — %r12 = this.mediaReader (+0x08).
    const mediaReader = this.mediaReader;

    // @0xdfb544..@0xdfb54e — virtual call this.vtable[*0x50](this)
    // returning a 32-bit int trackID/mode. FRONTIER: we do not have
    // FFAVFVideoCursor's vtable dumped here. The behaviour is a
    // read-only query on `this` (const-qualified copy() means the
    // callee cannot mutate `this`). We surface it as a demand for the
    // caller to supply this method on the concrete subclass. If not
    // overridden it throws — the correct signal that the frontier is
    // undecoded.
    const trackID = this.__vtable_slot_0x50();

    // @0xdfb54b..@0xdfb55c — call the base ctor on the new object.
    // In our TS model the base ctor's field-init side is captured by
    // the constructor invocation with the three args.
    // NOTE: as documented in the disasm annotation, the `copiedAvAsset`
    // is passed in the AVSampleCursor* slot — this is faithful to the
    // asm. Whether the base treats it as an AVSampleCursor or as an
    // AVAsset is a frontier we do not resolve here; the observable
    // effect is that the fresh cursor's +0x10 slot receives the
    // copiedAvAsset.
    //
    // (@0xdfb561..@0xdfb568 then installs THIS class's vptr at
    // newCursor+0 — captured implicitly by using our JS class.)
    const newCursor = new FFAVFQTVideoCursor(
      mediaReader,
      copiedAvAsset as unknown as AVSampleCursor,
      trackID,
    );
    // The base ctor also *does not* touch +0x48 (avAsset). We set it on
    // the new cursor separately so the observable field state matches
    // what the AutoRelease/retain machinery would land at once the base
    // consumes the arg — the base is expected to retain `copiedAvAsset`
    // and store it somewhere (probably +0x48, given that the immediate
    // release @0xdfb56e is a *balancing* drop of our own +1). We mirror
    // that by installing it now:
    newCursor.avAsset = copiedAvAsset;

    // @0xdfb56b..@0xdfb56e — _objc_release(copiedAvAsset). The base
    // ctor retained it above; we drop our local reference. Modeled as
    // a no-op comment in TS (GC handles the balance).
    // No JS field to clear — `copiedAvAsset` is a local that goes out
    // of scope.

    // @0xdfb578..@0xdfb583 — return newCursor.
    return newCursor;
  }

  /**
   * FFAVFQTVideoCursor::createSampleBufferFromDisk(arg, mode, time, prerollBatch) const
   *
   * Flexo @0xdfb5a0..0xdfb5c1.
   *
   *     pushq  %rbp
   *     movq   %rsp, %rbp
   *     movq   %rcx, %r9                         ; CMTime.value (rcx) -> r9 (new arg slot 6)
   *     movl   %edx, %r8d                        ; mode (edx) -> r8 (arg 5)
   *     movl   %esi, %ecx                        ; int arg1 (esi) -> ecx (arg 4)
   *     movq   0x8(%rdi), %rax                   ; rax = this.mediaReader (+0x08)
   *     movq   0x48(%rdi), %rsi                  ; rsi = this.avAsset (+0x48) (arg 2)
   *                                              ;   !! diverges from audio variant,
   *                                              ;   which reads +0x10 (sampleCursor).
   *                                              ;   The video's disk-fetch is keyed
   *                                              ;   on the AVAsset handle, not the
   *                                              ;   sample cursor.  (Note the c++filt
   *                                              ;   decoded name says "AVSampleCursor*"
   *                                              ;   for arg 2 of the callee — same
   *                                              ;   ABI-position/type-name ambiguity
   *                                              ;   as in copy() above.)
   *     movq   %rax, %rdi                        ; rdi = mediaReader (target `this`)
   *     movl   $0x1, %edx                        ; edx = 1 (bool = true, arg 3)
   *                                              ;   !! diverges from audio variant,
   *                                              ;   which uses `xorl %edx,%edx` (false).
   *     popq   %rbp
   *     jmp    __ZNK18FFAVFQTMediaReader26createSampleBufferFromDiskEP14AVSampleCursorbi24FFMediaReaderRequestMode6CMTimeP14FFPrerollBatch
   *                                              ; tail-call — no return
   *
   * Reshuffles registers to invoke the concrete-reader variant:
   *   mediaReader->createSampleBufferFromDisk(
   *       this.avAsset,           // typed as AVSampleCursor* in the callee's
   *                               //   c++filt-decoded name, but reads +0x48
   *                               //   in this class, so semantically the
   *                               //   AVAsset handle (see copy() for the
   *                               //   same ABI/type ambiguity).
   *       true,                   // bool
   *       arg1,                   // int
   *       mode,                   // FFMediaReaderRequestMode
   *       time,                   // CMTime
   *       prerollBatch)           // FFPrerollBatch*
   */
  createSampleBufferFromDisk(
    arg: number,
    mode: FFMediaReaderRequestMode,
    time: CMTime,
    prerollBatch: FFPrerollBatch | null,
  ): unknown {
    if (this.mediaReader === null) {
      throw new Error(
        "FFAVFQTVideoCursor.createSampleBufferFromDisk @0xdfb5a0: this.mediaReader (+0x08) is null — undefined behaviour in the original (would dereference NULL at @0xdfb5b4 movq %rax,%rdi then tail-jmp).",
      );
    }
    return (
      this.mediaReader as FFAVFQTMediaReader & {
        createSampleBufferFromDisk?: (
          cursor: AVSampleCursor | null,
          flag: boolean,
          arg: number,
          mode: FFMediaReaderRequestMode,
          time: CMTime,
          prerollBatch: FFPrerollBatch | null,
        ) => unknown;
      }
    ).createSampleBufferFromDisk?.(
      this.avAsset as unknown as AVSampleCursor | null, // +0x48 -> rsi
      true, // movl $0x1,%edx @0xdfb5b7
      arg, // esi -> ecx
      mode, // edx -> r8d
      time, // rcx -> r9 (higher CMTime words pass on stack)
      prerollBatch, // stack arg — passed through
    );
  }

  // ── Frontier hooks (throwing stubs — the correct demand signal) ──

  /**
   * ObjC `[receiver copy]` bridge. Frontier — a real port must supply an
   * ObjC runtime interop layer that implements NSCopying. Cited by
   * copy() @0xdfb529 (msgSend @0x18ed6c0 with selref @0x1bb85e0 = "copy").
   */
  protected __objc_msgSend_copy(receiver: object): object | null {
    throw new Error(
      "FFAVFQTVideoCursor.__objc_msgSend_copy @0xdfb529: ObjC `-copy` bridge is undecoded — a real port must supply an NSCopying implementation for the receiver (selref @0x1bb85e0 -> \"copy\", msgSend @0x18ed6c0).",
    );
    void receiver;
  }

  /**
   * FFAVFVideoCursor's vtable slot *0x50 — read-only query on `this`
   * used by copy() @0xdfb54e to obtain the int (trackID/mode) fed into
   * the fresh cursor's base ctor. Frontier — the base class's vtable is
   * not decoded in this file.
   */
  protected __vtable_slot_0x50(): number {
    throw new Error(
      "FFAVFQTVideoCursor.__vtable_slot_0x50 @0xdfb54e: FFAVFVideoCursor's vtable slot *0x50 (const int query on `this`) is undecoded — a downstream port of FFAVFVideoCursor must supply the concrete method (likely trackID()).",
    );
  }
}

// Re-export the base-cursor frontier types so callers can hold and route
// them without also importing FFAVFQTAudioCursor.
export type { AVSampleCursor, FFAVFMediaReader, FFAVFQTMediaReader, FFMediaReaderRequestMode, FFPrerollBatch };
