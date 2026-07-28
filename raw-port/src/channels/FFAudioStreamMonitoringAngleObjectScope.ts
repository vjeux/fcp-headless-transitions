// FFAudioStreamMonitoringAngleObjectScope.ts — Flexo's per-angle audio-stream
// object scope. Faithful transcription of all three externally-visible
// FFAudioStreamMonitoringAngleObjectScope methods from
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Flexo.framework/
//     Versions/A/Flexo
//
// Source disassembly:
//   raw-port/re/disasm/Flexo.FFAudioStreamMonitoringAngleObjectScope.IsObjectPlayEnabled.s @0xe6a3e0
//   raw-port/re/disasm/Flexo.FFAudioStreamMonitoringAngleObjectScope.D1.s                  @0xe6a440
//   raw-port/re/disasm/Flexo.FFAudioStreamMonitoringAngleObjectScope.~FFAudioStreamMonitoringAngleObjectScope.s @0xe6a450
//
// nm confirms these are the ONLY externally-visible methods:
//   00000000e6a3e0 T FFAudioStreamMonitoringAngleObjectScope::IsObjectPlayEnabled() const
//   00000000e6a440 T FFAudioStreamMonitoringAngleObjectScope::~FFAudioStreamMonitoringAngleObjectScope()  [D1]
//   00000000e6a450 T FFAudioStreamMonitoringAngleObjectScope::~FFAudioStreamMonitoringAngleObjectScope()  [D0]
//
// ---------------------------------------------------------------------------
// Class relationships (recovered from the dtor call graph):
//   FFAudioStreamMonitoringAngleObjectScope  is-a  FFAudioStreamObjectScope
//     — both D1 and D0 chain through FFAudioStreamObjectScope::~FFAudioStreamObjectScope
//       (@0xe6a445 tail-jmp and @0xe6a459 call). D0 additionally tail-jumps
//       into `operator delete(void*)` (@Flexo __stubs 0x1497404 = __ZdlPv).
//
// The base class FFAudioStreamObjectScope is visible in the adjacent asm:
//   FFAudioStreamObjectScope::FFAudioStreamObjectScope(FFAudioSourceScope&)
//     @0xe6a4c0 initializes an offset map (installed vptr, then a large tail
//     of zeroed fields from +0x98 through +0x108, plus a _kCMTimeInvalid at
//     +0xf4/+0x104). None of that is used by the derived-class methods here.
//
// ---------------------------------------------------------------------------
// Struct layout — RECOVERED byte-for-byte from IsObjectPlayEnabled and the dtors.
//
// Only two fields of the derived object are observable from THESE methods:
//   +0x00  vtbl       *const void         (Itanium C++ vtable pointer — the
//                                          concrete FFAudioStreamMonitoringAngleObjectScope
//                                          vtable, not the base class one. Not read
//                                          by these methods; the D1/D0 dtor entry
//                                          is dispatched externally via that slot.)
//   +0x08  objcObject id                  (Objective-C `id` — an NSObject-like
//                                          instance that responds to selectors
//                                          `container`, `audioAngles`, and `angleID`.
//                                          Read twice by IsObjectPlayEnabled:
//                                          @0xe6a3ed (for [self.[+8] container]) and
//                                          @0xe6a412 (for [self.[+8] angleID]).)
//
// Everything from +0x10..+0x108 belongs to the base FFAudioStreamObjectScope,
// undecoded here — see its own port when it lands.
//
// ---------------------------------------------------------------------------
// Cited callees / __stubs / Objective-C selector refs:
//
//   FFAudioStreamObjectScope::~FFAudioStreamObjectScope()   @Flexo  __ZN24FFAudioStreamObjectScopeD2Ev
//                                                          invoked @0xe6a445 (D1 tail-jmp) and
//                                                          @0xe6a459 (D0 call).
//   operator delete(void*)                                  @Flexo  __stubs 0x1497404  (__ZdlPv)
//                                                          tail-jumped @0xe6a467 (D0 final free).
//   objc_msgSend                                            @Flexo __got (via the RIP-relative
//                                                          `movq 0xa832c1(%rip),%r15` @0xe6a3f8;
//                                                          RIP=0xe6a3ff; 0xe6a3ff+0xa832c1=0x18ed6c0
//                                                          — an Objective-C runtime import entry;
//                                                          the concrete stub is Apple's public
//                                                          `_objc_msgSend`). Every subsequent
//                                                          `callq *%r15` in this function is an
//                                                          objc_msgSend dispatch.
//
//   Objective-C selector refs (SEL* slots in Flexo __DATA,__objc_selrefs):
//     "container"        @Flexo  0xe6a3f1 leaq -> selref (RIP=0xe6a3f8; +0xd4e8c0=0x1bb2cb8)
//     "audioAngles"      @Flexo  0xe6a402 leaq -> selref (RIP=0xe6a409; +0xd52d0f=0x1bbd118)
//     "angleID"          @Flexo  0xe6a416 leaq -> selref (RIP=0xe6a41d; +0xd52d73=0x1bbd189)
//     "containsObject:"  @Flexo  0xe6a420 leaq -> selref (RIP=0xe6a427; +0xd4e8a9=0x1bb2cd0)
//
// ---------------------------------------------------------------------------
// IsObjectPlayEnabled semantics (see raw-port/re/disasm/... .s):
//
// In pseudo-Objective-C:
//   BOOL IsObjectPlayEnabled(self) {
//     id obj          = self->objcObject;              // +0x08
//     id container    = [obj  container];              // @0xe6a3ff
//     NSSet* angles   = [container audioAngles];       // @0xe6a40c  (a set-like)
//     id angleID      = [obj  angleID];                // @0xe6a41d
//     BOOL contained  = [angles containsObject:angleID]; // @0xe6a42d
//     return contained != NO;                          // @0xe6a430-0xe6a432
//   }
//
// The setne after testb collapses to the identity for BOOL (0/1); we return
// `contained !== 0` explicitly to mirror the asm's `%al != 0` result.

// ---------------------------------------------------------------------------
// Opaque Objective-C bridge — the concrete NSObject class isn't decoded
// from these methods, so we model the messaging surface as a typed interface.
// ---------------------------------------------------------------------------

/**
 * The Objective-C object stored at (self)+0x08. It responds to three
 * selectors that IsObjectPlayEnabled dispatches on:
 *   - `container` -> returns an object that itself responds to `audioAngles`.
 *   - `angleID`   -> returns the angle-ID object used as a set-lookup key.
 *
 * The concrete class of this object isn't visible from
 * FFAudioStreamMonitoringAngleObjectScope's own methods — it will be pinned
 * down when a caller/producer that constructs one is transcribed. Until then
 * we model the messaging surface as a typed interface.
 */
export interface FFMonitoringAngleObjCObject {
  /** `[self container]` @0xe6a3ff — returns the multi-cam container. */
  container(): FFMonitoringAngleContainer;
  /** `[self angleID]` @0xe6a41d — returns the angle-identifier used as
   *  the containsObject: key. */
  angleID(): FFMonitoringAngleID;
}

/** The container returned by `[obj container]`. Its only observed selector
 *  is `audioAngles` (@0xe6a40c) which returns a set-of-angle-IDs. */
export interface FFMonitoringAngleContainer {
  /** `[self audioAngles]` @0xe6a40c — the set queried at @0xe6a42d. */
  audioAngles(): FFAudioAnglesSet;
}

/** The NSSet-like collection returned by `[container audioAngles]`. */
export interface FFAudioAnglesSet {
  /** `[self containsObject:x]` @0xe6a42d — returns a BOOL. */
  containsObject(x: FFMonitoringAngleID): boolean;
}

/** Opaque angle-ID (the object returned by `[obj angleID]`). Used only as an
 *  NSSet lookup key here. */
export interface FFMonitoringAngleID {
  readonly __ffMonitoringAngleID: true;
}

// ---------------------------------------------------------------------------
// Base-class stub — FFAudioStreamObjectScope is upstream and not ported yet.
// ---------------------------------------------------------------------------

/** FFAudioStreamObjectScope — base class of
 *  FFAudioStreamMonitoringAngleObjectScope. Not ported yet. */
export interface FFAudioStreamObjectScope {
  readonly __ffAudioStreamObjectScope: true;
}

/**
 * FFAudioStreamObjectScope::~FFAudioStreamObjectScope()  [D2 base-object dtor]  @Flexo __ZN24FFAudioStreamObjectScopeD2Ev
 * @stub — invoked from FFAudioStreamMonitoringAngleObjectScope D1 @0xe6a445
 *         (tail-jmp) and D0 @0xe6a459 (call). Not ported yet.
 */
function ffAudioStreamObjectScope_D2_dtor_stub(
  _self: FFAudioStreamObjectScope,
): void {
  throw new Error(
    "FFAudioStreamObjectScope::~FFAudioStreamObjectScope() [D2] not ported — " +
      "called from FFAudioStreamMonitoringAngleObjectScope D1@0xe6a445 / " +
      "D0@0xe6a459 (Flexo __ZN24FFAudioStreamObjectScopeD2Ev)",
  );
}

/**
 * `operator delete(void*)`  (libc++abi __ZdlPv) — tail-jumped from the D0
 * deleting dtor @0xe6a467. GC'd runtime no-op; expressed here so the control
 * flow matches the disasm exactly.
 */
function operator_delete_stub(_this: FFAudioStreamMonitoringAngleObjectScope): void {
  // GC'd runtime — no explicit free. Faithful to the tail-call jmp at
  // @0xe6a467 (`jmp 0x1497404  ## symbol stub for: __ZdlPv`).
}

// ---------------------------------------------------------------------------
// FFAudioStreamMonitoringAngleObjectScope
// ---------------------------------------------------------------------------

/**
 * FFAudioStreamMonitoringAngleObjectScope — a per-monitoring-angle scope
 * that reads its play-enabled state by looking up the angle's ID in its
 * container's `audioAngles` NSSet. Derives from FFAudioStreamObjectScope
 * (see file header).
 */
export interface FFAudioStreamMonitoringAngleObjectScope
  extends FFAudioStreamObjectScope {
  /** +0x00 — Itanium C++ vtable pointer (not read by these methods). */
  vtbl: number;
  /** +0x08 — Objective-C `id` (an NSObject responding to `container`,
   *  `audioAngles` — through container — and `angleID`).
   *  Read by IsObjectPlayEnabled @0xe6a3ed and @0xe6a412. */
  objcObject: FFMonitoringAngleObjCObject;
}

/**
 * FFAudioStreamMonitoringAngleObjectScope::IsObjectPlayEnabled() const   @Flexo 0xe6a3e0
 *
 * Returns whether this monitoring-angle scope's angle-ID is currently in
 * its container's audioAngles set — i.e. whether the angle is enabled for
 * playback.
 *
 * Faithful transcription (each objc_msgSend dispatched through r15 =
 * `_objc_msgSend`, loaded once @0xe6a3f8):
 *
 *   @0xe6a3ed rdi = this->objcObject                           ; (this)+0x08
 *   @0xe6a3f1 rsi = selref "container"
 *   @0xe6a3f8 r15 = &_objc_msgSend                             ; (loaded once, reused)
 *   @0xe6a3ff callq *%r15                                       ; rax = [obj container]
 *   @0xe6a402 rsi = selref "audioAngles"
 *   @0xe6a409 rdi = rax  (the container)
 *   @0xe6a40c callq *%r15                                       ; rax = [container audioAngles]
 *   @0xe6a40f r14 = rax                                         ; save the set
 *   @0xe6a412 rdi = this->objcObject                            ; (this)+0x08 again
 *   @0xe6a416 rsi = selref "angleID"
 *   @0xe6a41d callq *%r15                                       ; rax = [obj angleID]
 *   @0xe6a420 rsi = selref "containsObject:"
 *   @0xe6a427 rdi = r14  (the set)
 *   @0xe6a42a rdx = rax  (the angleID)
 *   @0xe6a42d callq *%r15                                       ; rax = [set containsObject:angleID]
 *   @0xe6a430 testb %al,%al                                     ;
 *   @0xe6a432 setne %al                                         ; al = (rax_lo != 0) — identity for BOOL
 *   @0xe6a435-0xe6a43f epilogue + retq                          ; return al (bool)
 */
export function FFAudioStreamMonitoringAngleObjectScope_IsObjectPlayEnabled(
  self: FFAudioStreamMonitoringAngleObjectScope,
): boolean {
  // @0xe6a3ed: rdi = self->objcObject
  const obj = self.objcObject;
  // @0xe6a3ff: [obj container]
  const container = obj.container();
  // @0xe6a40c: [container audioAngles]
  const angles = container.audioAngles();
  // @0xe6a412: rdi = self->objcObject (loaded fresh — mirrored)
  const obj2 = self.objcObject;
  // @0xe6a41d: [obj angleID]
  const angleID = obj2.angleID();
  // @0xe6a42d: [angles containsObject: angleID]
  const contained = angles.containsObject(angleID);
  // @0xe6a430-@0xe6a432: testb %al,%al ; setne %al  (identity for BOOL — return the boolean).
  return contained !== false;
}

/**
 * FFAudioStreamMonitoringAngleObjectScope::~FFAudioStreamMonitoringAngleObjectScope()
 *   [D1 non-deleting dtor]                                            @Flexo 0xe6a440
 *
 * Pure trampoline into the base dtor:
 *
 *   @0xe6a440 pushq %rbp / movq %rsp,%rbp
 *   @0xe6a444 popq  %rbp
 *   @0xe6a445 jmp   __ZN24FFAudioStreamObjectScopeD2Ev
 *
 * No subclass-local fields to finalize (the derived class adds only the
 * objcObject pointer, which is an Objective-C reference — its lifetime is
 * managed by ARC/retain-release at the ObjC boundary, NOT by this dtor).
 */
export function FFAudioStreamMonitoringAngleObjectScope_D1_dtor(
  self: FFAudioStreamMonitoringAngleObjectScope,
): void {
  // @0xe6a445 — jmp FFAudioStreamObjectScope::~FFAudioStreamObjectScope() (undecoded stub).
  ffAudioStreamObjectScope_D2_dtor_stub(self);
}

/**
 * FFAudioStreamMonitoringAngleObjectScope::~FFAudioStreamMonitoringAngleObjectScope()
 *   [D0 deleting dtor]                                                @Flexo 0xe6a450
 *
 *   @0xe6a450 pushq %rbp / movq %rsp,%rbp / pushq %rbx / pushq %rax  ; setup + align
 *   @0xe6a456 movq  %rdi, %rbx                                        ; rbx = this
 *   @0xe6a459 callq __ZN24FFAudioStreamObjectScopeD2Ev                ; base dtor
 *   @0xe6a45e movq  %rbx, %rdi                                        ; rdi = this (op delete arg)
 *   @0xe6a461 addq  $0x8, %rsp / popq %rbx / popq %rbp                ; teardown
 *   @0xe6a467 jmp   __ZdlPv                                            ; operator delete(void*)
 */
export function FFAudioStreamMonitoringAngleObjectScope_D0_dtor(
  self: FFAudioStreamMonitoringAngleObjectScope,
): void {
  // @0xe6a459 — call FFAudioStreamObjectScope::~FFAudioStreamObjectScope() (undecoded stub).
  ffAudioStreamObjectScope_D2_dtor_stub(self);
  // @0xe6a467 — tail jmp to operator delete(this) (GC'd runtime no-op).
  operator_delete_stub(self);
}
