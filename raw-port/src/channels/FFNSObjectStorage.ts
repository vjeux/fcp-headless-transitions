// FFNSObjectStorage — Flexo.framework helper that holds a single retained
// Objective-C object (id) as an ivar of a C++ HGObject subclass. It is used
// to bridge NS* references (NSString/NSDictionary/NSArray/…) into Helium's
// HGObject hierarchy so they can travel through node-graph slots that only
// know about C++ types.
//
// Faithful transcription of the two destructor slots the Itanium ABI emits.
// Source disassembly:
//   raw-port/re/disasm/Flexo.FFNSObjectStorage.D1.s    (D1 base dtor    @0x569a90)
//   raw-port/re/disasm/Flexo.FFNSObjectStorage.D0.s    (D0 deleting dtor @0x569ad0)
//
// Flexo symbols referenced (all resolved via nm+c++filt of Flexo):
//   __ZTV17FFNSObjectStorage           — the class vtable that gets written back into
//                                        *this at the start of each dtor. Rebind target
//                                        is `vtable + 0x10` (skipping offset-to-top +
//                                        typeinfo slots), computed by leaq at
//                                        @0x569a99 (D1) / @0x569ad9 (D0).
//   _objc_release                      — ObjC runtime call. Invoked indirectly through
//                                        the __DATA_CONST pointer at literal pool ref
//                                        @0x569aa7 (D1) / @0x569ae7 (D0).
//   __ZN8HGObjectD2Ev                  — HGObject::~HGObject (base subobject dtor).
//                                        Stub @0x1496d86, tail-jmp @0x569ab6 (D1),
//                                        callq @0x569af0 (D0).
//   __ZN8HGObjectdlEPv                 — HGObject::operator delete(void*). Stub
//                                        @0x1496d8c, tail-jmp @0x569afe (D0 only).
//   ___clang_call_terminate            — cxa personality unwind handler @0x569abe /
//                                        @0x569b06. Reachable only via unwind edges
//                                        emitted by clang around _objc_release — not
//                                        part of the normal control flow, so we do not
//                                        surface it here (unwind is not modelled).
//
// Struct layout (recovered from the dtors — this is the ONLY field they touch
// beyond the HGObject base subobject):
//   +0x000  vptr                          → rebind target FFNSObjectStorage vtable + 0x10
//   +0x008  HGObject subobject tail       (opaque here; owned by HGObject::~HGObject)
//   +0x010  id  ns                        strong retain, released with objc_release
// The rest of the object is HGObject state — decoded elsewhere as needed.

// ─── Frontier callees (undecoded — throw per PORTING_SPEC Rule 3) ─────────────────────

/**
 * ObjC-runtime retained-release. Called through the indirect stub at
 *   @Flexo 0x569aa7  callq *0x1383c5b(%rip)   (D1)
 *   @Flexo 0x569ae7  callq *0x1383c1b(%rip)   (D0)
 * pointing at the __DATA_CONST pointer to the runtime symbol `_objc_release`.
 * Not decoded in this port — it's a libobjc.dylib import.
 */
function objc_release(_obj: object | null): void {
  throw new Error("_objc_release not yet transcribed — @Flexo 0x569aa7 (D1) / @Flexo 0x569ae7 (D0)");
}

/**
 * HGObject::~HGObject (base subobject destructor).
 *   D1: jmp   __ZN8HGObjectD2Ev  @Flexo 0x569ab6  (stub 0x1496d86)
 *   D0: callq __ZN8HGObjectD2Ev  @Flexo 0x569af0  (stub 0x1496d86)
 */
function HGObject_D2(_self: FFNSObjectStorage): void {
  throw new Error("HGObject::~HGObject not yet transcribed — @Flexo stub 0x1496d86 (called @0x569ab6 / @0x569af0)");
}

/**
 * HGObject::operator delete(void*) — HGObject-provided global-delete replacement.
 *   D0: jmp __ZN8HGObjectdlEPv @Flexo 0x569afe (stub 0x1496d8c)
 * No-op in a GC runtime, but recorded here so future oracle work sees the site.
 */
function HGObject_operator_delete(_p: unknown): void {
  throw new Error("HGObject::operator delete(void*) not yet transcribed — @Flexo stub 0x1496d8c (called @0x569afe)");
}

// ─── The class ────────────────────────────────────────────────────────────────────────

/** Sentinel for `*this = &vtable_FFNSObjectStorage + 0x10`. */
const FFNSObjectStorage_vtable_plus_0x10 = Symbol("FFNSObjectStorage::vtable+0x10");

/**
 * FFNSObjectStorage — see file header for provenance.
 *
 * Only the fields the destructors read are modelled; the HGObject subobject remains
 * opaque here (see raw-port/src/render for other HGObject-derived transcriptions).
 */
export class FFNSObjectStorage {
  /** @0x000 — instance vtable pointer. */
  vptr: symbol = FFNSObjectStorage_vtable_plus_0x10;
  /** @0x010 — the strongly-retained ObjC object; nullable (0/nil ⇒ no-op release). */
  ns: object | null = null;

  /**
   * FFNSObjectStorage::~FFNSObjectStorage() — D1 base destructor.
   * @Flexo 0x569a90 (raw-port/re/disasm/Flexo.FFNSObjectStorage.D1.s)
   *
   * Line-for-line:
   *   0x569a90  push rbp; mov rbp, rsp; push rbx; push rax                 prologue
   *   0x569a96  mov  rbx, rdi                                              self
   *   0x569a99  lea  rax, [rip+0x1394fd0]        ## &FFNSObjectStorage_vtable+0x10
   *   0x569aa0  mov  [rdi], rax                  ## *this = vtable+0x10
   *   0x569aa3  mov  rdi, [rdi+0x10]             ## rdi = this->ns
   *   0x569aa7  call [rip+0x1383c5b]             ## _objc_release(ns)
   *   0x569aad  mov  rdi, rbx                                              restore self
   *   0x569ab0  add  rsp,8; pop rbx; pop rbp                               epilogue
   *   0x569ab6  jmp  __ZN8HGObjectD2Ev            ## tail HGObject::~HGObject
   * (0x569abb..0x569abe is the clang unwind personality path — not linear flow.)
   *
   * Semantics: rebind vtable to self's slot, release the retained ns, chain into base.
   * `_objc_release(nil)` is a documented objc-runtime no-op, so we do NOT null-check
   * — that matches the asm which unconditionally calls through.
   */
  dtor_D1_at_0x569a90(): void {
    // @0x569aa0 — rebind vtable pointer.
    this.vptr = FFNSObjectStorage_vtable_plus_0x10;
    // @0x569aa3..0x569aa7 — objc_release(this->ns). objc_release is nil-safe.
    objc_release(this.ns);
    // @0x569ab6 — tail-jmp HGObject::~HGObject.
    HGObject_D2(this);
  }

  /**
   * FFNSObjectStorage::~FFNSObjectStorage() — D0 deleting destructor.
   * @Flexo 0x569ad0 (raw-port/re/disasm/Flexo.FFNSObjectStorage.D0.s)
   *
   * Byte-identical prologue and body up through the HGObject::~HGObject call, then
   * a tail-jmp into HGObject::operator delete(this) instead of the D1 return:
   *   0x569ad9  lea  rax, [rip+0x1394f90]        ## &FFNSObjectStorage_vtable+0x10
   *   0x569ae0  mov  [rdi], rax
   *   0x569ae3  mov  rdi, [rdi+0x10]
   *   0x569ae7  call [rip+0x1383c1b]             ## _objc_release
   *   0x569aed  mov  rdi, rbx
   *   0x569af0  call __ZN8HGObjectD2Ev
   *   0x569af5  mov  rdi, rbx
   *   0x569af8  add rsp,8; pop rbx; pop rbp
   *   0x569afe  jmp  __ZN8HGObjectdlEPv          ## tail HGObject::operator delete(this)
   *
   * i.e. D0 = D1 + HGObject::operator delete(this).
   */
  dtor_D0_at_0x569ad0(): void {
    // @0x569ad9..0x569af0 — identical body to D1.
    this.dtor_D1_at_0x569a90();
    // @0x569afe — tail-jmp HGObject::operator delete(this).
    HGObject_operator_delete(this);
  }
}
