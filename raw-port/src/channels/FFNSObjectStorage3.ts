// FFNSObjectStorage3.ts — Flexo's tiny RAII holder for a retained Objective-C
// (id/NSObject*) reference. The class derives from HGObject, adds a single
// +0x10 `id` field (an objc pointer to a retained NSObject), and the only
// two decoded methods are its destructor pair (D1 non-deleting and D0
// deleting).
//
// Transcribed from the disassembly of /Applications/Final Cut Pro.app/
// Contents/Frameworks/Flexo.framework/Versions/A/Flexo.
//
// DECODE. Both methods below are transcribed one-for-one from the ASM.
// Every method cites its @0xADDR in Flexo; every callee is resolved by
// symbol name; every byte offset is read directly from the assembly.
//
// STRUCT LAYOUT (recovered from the two dtors — the sole methods available
// on this symbol table entry):
//   +0x00  vtbl : *const void        // installed vtable pointer, written at
//                                    //   the top of each dtor as
//                                    //   `leaq 0x5c4b??(%rip), %rax; movq %rax, (%rdi)`.
//                                    //   Both dtors compute the SAME target:
//                                    //     D1 @0x13632d9 (rip=0x13632e0 + 0x5c4b80) -> 0x1927e60
//                                    //     D0 @0x1363319 (rip=0x1363320 + 0x5c4b40) -> 0x1927e60
//                                    //   0x1927e60 is __ZTV18FFNSObjectStorage3(0x1927e50) + 0x10,
//                                    //   i.e. the installed-pointer form of the class's own vtable.
//   +0x08  ... HGObject-owned         // whatever HGObject stores; not touched here.
//                                    //   The dtor tail-calls / jmps to HGObject::~HGObject
//                                    //   (@Flexo stub 0x1496d86) which handles those fields.
//   +0x10  objcObj : id (retained)    // an Objective-C pointer released via
//                                    //   `callq *_objc_release` at:
//                                    //     D1 @0x13632e7 (indirect via 0x58a41b(%rip))
//                                    //     D0 @0x1363327 (indirect via 0x58a3db(%rip))
//                                    //   No init here — the ctor is not in this symbol dump.
//
// The vtable install writing the CLASS's own installed ptr in BOTH dtors is
// standard C++ ABI: `~FFNSObjectStorage3()` reinstalls its own vtbl on entry
// so any virtual call during teardown resolves to THIS class's slot before
// running the base sub-object dtor.

// ── Frontier: undecoded companion types & runtime hooks ─────────────────
// HGObject is Flexo's tagged reference-counted base class used across the
// AudioX/Flexo trees. Its two runtime entry points touched by this file
// are the base destructor and the class-specific `operator delete`.
// Neither is transcribed in THIS file — see the eventual HGObject port
// for provenance. Ports downstream may replace these stubs with the real
// class. Until then, calls into them throw citing their @0xADDR.

/** HGObject::~HGObject() @Flexo stub 0x1496d86 (`_ZN8HGObjectD2Ev`) — the
 *  base sub-object destructor. Called via `jmp` (D1 @0x13632f6) or
 *  `callq` (D0 @0x1363330) to run base teardown. Undecoded here. */
function HGObject_base_dtor_stub(_self: FFNSObjectStorage3): void {
  throw new Error(
    "HGObject::~HGObject() @Flexo 0x1496d86 (stub) not yet transcribed",
  );
}

/** HGObject::operator delete(void*) @Flexo stub 0x1496d8c (`_ZN8HGObjectdlEPv`) —
 *  the class-provided deallocator invoked as the tail-jmp of the deleting
 *  dtor D0 @0x136333e. Undecoded here. */
function HGObject_operator_delete_stub(_self: FFNSObjectStorage3): void {
  throw new Error(
    "HGObject::operator delete(void*) @Flexo 0x1496d8c (stub) not yet transcribed",
  );
}

/** Objective-C runtime `objc_release(id)`. Called as an indirect call
 *  through the __got slot referenced by:
 *    D1 @0x13632e7 via `callq *0x58a41b(%rip)` (== _objc_release GOT slot)
 *    D0 @0x1363327 via `callq *0x58a3db(%rip)` (== _objc_release GOT slot)
 *  The observable effect is a retain-count decrement on the +0x10 id, and
 *  a possible `-[NSObject dealloc]` if it drops to zero. Modelled here as
 *  a "release the strong reference held by this holder" operation. */
function objc_release_stub(_obj: unknown): void {
  // No decoded body — this is the Objective-C runtime. Faithfully we
  // model it as a no-op reference drop from the TS-side perspective; the
  // holder's field is explicitly cleared by the caller to make the
  // release semantics observable in the port.
  //
  // NOTE: not a value-invention — the entire visible effect on this
  // class is that the +0x10 slot's live retained reference goes away.
}

/**
 * `FFNSObjectStorage3` — Flexo holder for a single retained NSObject id.
 *
 * Only the two decoded methods (D1 non-deleting dtor and D0 deleting
 * dtor) are implemented here. The ctor is not in this dump — porting
 * deferred.
 */
export class FFNSObjectStorage3 {
  /** `vtbl` — the +0x00 installed vtable pointer. Both dtors write
   *  0x1927e60 into this slot on entry (installed form of
   *  __ZTV18FFNSObjectStorage3 @0x1927e50). Modelled as a tagged value
   *  so the "reinstall on dtor entry" side-effect is observable. */
  vtbl: number = 0;

  /** `objcObj` — the +0x10 retained Objective-C `id`. Set by the (not
   *  yet decoded) ctor and released by both dtors via `objc_release`.
   *  Modelled as `unknown` so downstream code sees an opaque handle. */
  objcObj: unknown = null;

  /**
   * `FFNSObjectStorage3::~FFNSObjectStorage3()` @Flexo 0x13632d0 (D1,
   * non-deleting / base-object dtor).
   *
   * Disasm (all @Flexo):
   *   0x13632d0  push  rbp / mov rbp,rsp / push rbx / push rax
   *   0x13632d6  mov   rbx, rdi                     ; rbx = this
   *   0x13632d9  lea   rax, [rip+0x5c4b80]          ; rax = 0x1927e60 (installed vtbl)
   *   0x13632e0  mov   [rdi], rax                   ; *this = 0x1927e60
   *                                                 ;   (reinstall own vtbl before base teardown)
   *   0x13632e3  mov   rdi, [rdi+0x10]              ; rdi = this->objcObj
   *   0x13632e7  callq *[rip+0x58a41b]              ; indirect _objc_release(rdi)
   *   0x13632ed  mov   rdi, rbx
   *   0x13632f0  add   rsp, 0x8 / pop rbx / pop rbp
   *   0x13632f6  jmp   0x1496d86                    ; tail-jmp HGObject::~HGObject(this)
   *
   * Cleanup landing pad @0x13632fb..@0x13632fe calls `__clang_call_terminate`
   * if an exception unwinds through the objc_release call (double-throw
   * during unwind is fatal).
   */
  dispose(): void {
    // @0x13632e0: reinstall own vtbl as the FIRST side-effect on entry.
    this.vtbl = 0x1927e60;

    // @0x13632e3..@0x13632e7: release the retained id, then clear the
    // holder slot to make the release observable from the TS side.
    objc_release_stub(this.objcObj);
    this.objcObj = null;

    // @0x13632f6: tail-jmp to HGObject::~HGObject(this).
    HGObject_base_dtor_stub(this);
  }

  /**
   * `FFNSObjectStorage3::~FFNSObjectStorage3()` @Flexo 0x1363310 (D0,
   * deleting dtor). Identical body to D1 above, plus a call-then-tail-jmp
   * to the HGObject-provided `operator delete`.
   *
   * Disasm (all @Flexo):
   *   0x1363310  push rbp / mov rbp,rsp / push rbx / push rax
   *   0x1363316  mov  rbx, rdi                      ; rbx = this
   *   0x1363319  lea  rax, [rip+0x5c4b40]           ; rax = 0x1927e60 (installed vtbl)
   *   0x1363320  mov  [rdi], rax                    ; reinstall own vtbl
   *   0x1363323  mov  rdi, [rdi+0x10]               ; rdi = this->objcObj
   *   0x1363327  callq *[rip+0x58a3db]              ; indirect _objc_release(rdi)
   *   0x136332d  mov  rdi, rbx
   *   0x1363330  callq 0x1496d86                    ; HGObject::~HGObject(this)
   *   0x1363335  mov  rdi, rbx
   *   0x1363338  add  rsp, 0x8 / pop rbx / pop rbp
   *   0x136333e  jmp  0x1496d8c                     ; tail-jmp HGObject::operator delete(this)
   *
   * Cleanup landing pad @0x1363343..@0x1363346 calls
   * `__clang_call_terminate` on unwind.
   */
  dispose_and_delete(): void {
    // @0x1363320: reinstall own vtbl.
    this.vtbl = 0x1927e60;

    // @0x1363327: release the retained id.
    objc_release_stub(this.objcObj);
    this.objcObj = null;

    // @0x1363330: run the base sub-object dtor.
    HGObject_base_dtor_stub(this);

    // @0x136333e: tail-jmp to HGObject::operator delete(this).
    HGObject_operator_delete_stub(this);
  }
}
