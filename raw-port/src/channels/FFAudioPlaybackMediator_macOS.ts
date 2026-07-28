// FFAudioPlaybackMediator_macOS.ts — macOS-specific subclass of FFAudioPlaybackMediator that
// adds role-key and effect-window awareness to the base "should this audio play?" decision.
// Transcribed from FCP Flexo framework (Final Cut Pro.app/.../Flexo).
//
// DECODE: raw-port/re/disasm/Flexo.FFAudioPlaybackMediator_macOS.C1.s
//         raw-port/re/disasm/Flexo.FFAudioPlaybackMediator_macOS.D0.s
//         raw-port/re/disasm/Flexo.FFAudioPlaybackMediator_macOS.D1.s
//         raw-port/re/disasm/Flexo.FFAudioPlaybackMediator_macOS.shouldPlayObject.s
//
// Struct layout (from field reads across the four methods):
//   +0x00  vtable*        (written by the ctor at 0x0e6973e — RIP+disp = 0xaaec2b resolves into
//                          Flexo's __DATA_CONST vtable region for this class)
//   +0x08 .. +0x67        (inherited from FFAudioPlaybackMediator base — layout owned by base
//                          class; not read here)
//   +0x68  bool  mode_flag  (read once at shouldPlayObject 0x0e6976d: `cmpb $0x1, 0x68(%r15)` —
//                            if 0 the method returns whatever the BASE returned; if 1 it takes
//                            the role-key augmented path).
// The `bool` ctor arg is passed straight through to the base ctor at 0x0e69739; the +0x68 flag
// is written by the base class (or a further-derived instance), not by our ctor here.
//
// Frontier callees (ObjC + block-based; not decoded here — the receiver classes are ObjC and the
// selrefs come from Flexo's __objc_selrefs table which we do not read):
//   __ZNK23FFAudioPlaybackMediator16shouldPlayObjectEP16FFAnchoredObjectS1_  (base's method — the
//        first step of shouldPlayObject at 0x0e69768)
//   __ZL29_objectsWithOpenEffectWindowsv  — file-local helper returning an NSArray of anchored
//        objects that currently have open effect-editor windows (called twice: 0x0e697cc and
//        0x0e69886)
//   ____ZNK29..._block_invoke  — the on-stack block dispatched at 0x0e698ec whose descriptor is
//        "___block_descriptor_48_e8_32o40r_e32_v32?0\"FFAnchoredObject\"8*16*24l" (a return-bool
//        block that takes an FFAnchoredObject* — the actual filter predicate)
//   Multiple objc_msgSend calls with selrefs at RIPs +0xd53f1e, +0xd53c42, +0xd4f4f8, +0xd538fe,
//        +0xd5395e, +0xd4f48a, +0xd4ecbb, +0xd557b0 (each `containedRolesForRoleKey:` — the
//        disassembler tags all indirect msgSend calls with the SAME selector name from the LAST
//        __objc_selrefs entry it saw; the actual SEL bytes must be read from those RIPs to
//        confirm each one).

/** Placeholder for the ObjC-typed FFAnchoredObject* argument type. Concrete class definition
 *  lives in Flexo's ObjC namespace; not decoded here. */
export type FFAnchoredObject = unknown;

/** Placeholder for the base FFAudioPlaybackMediator instance state. Base ctor sets fields the
 *  derived class only reads (specifically the byte at +0x68). Not decoded here — a frontier
 *  hand-off to whoever ports FFAudioPlaybackMediator. */
export class FFAudioPlaybackMediator {
  /** +0x68 — read at shouldPlayObject 0x0e6976d. Concrete meaning owned by the base class. */
  mode_flag: boolean = false;

  /**
   * FFAudioPlaybackMediator(bool) — base ctor. Frontier: not decoded in this port; the derived
   * ctor at 0x0e69730 calls into it directly at 0x0e69739. Modelled as a no-op stub so the
   * derived ctor can be transcribed faithfully.
   * @frontier __ZN23FFAudioPlaybackMediatorC2Eb  (base ctor — un-decoded)
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  constructor(_flag: boolean) {
    // 0x0e69739 — target of the delegating call in the derived ctor. Body not yet decoded.
  }

  /**
   * FFAudioPlaybackMediator::shouldPlayObject(FFAnchoredObject*, FFAnchoredObject*) const →ï  bool
   * @frontier __ZNK23FFAudioPlaybackMediator16shouldPlayObjectEP16FFAnchoredObjectS1_
   *          (base virtual — the derived method calls it at 0x0e69768 and augments the result).
   */
  shouldPlayObject(_a: FFAnchoredObject, _b: FFAnchoredObject): boolean {
    throw new Error(
      "FFAudioPlaybackMediator::shouldPlayObject [base] is not yet decoded; the derived " +
      "FFAudioPlaybackMediator_macOS::shouldPlayObject at Flexo 0x0e69750 calls into it at " +
      "0x0e69768 and augments the result via ObjC role-key predicates."
    );
  }

  /**
   * FFAudioPlaybackMediator::~FFAudioPlaybackMediator() [base D2].
   * @frontier __ZN23FFAudioPlaybackMediatorD2Ev  (base dtor — un-decoded).
   */
  destroy_base(): void {
    // 0x0e69b19 (from derived D0) — target of the delegating call. Body not yet decoded.
  }
}

export class FFAudioPlaybackMediator_macOS extends FFAudioPlaybackMediator {
  /**
   * FFAudioPlaybackMediator_macOS::FFAudioPlaybackMediator_macOS(bool flag)
   * @Flexo 0x0000000000e69730  (__ZN29FFAudioPlaybackMediator_macOSC1Eb == C2Eb — the two
   *        Itanium-ABI symbols point to the SAME text; nm resolves both to this address.)
   *
   * DECODE (raw-port/re/disasm/Flexo.FFAudioPlaybackMediator_macOS.C1.s):
   *   0x0e69736  save rdi (this) in rbx.
   *   0x0e69739  callq __ZN23FFAudioPlaybackMediatorC2Eb — delegate to the base ctor with the
   *              bool arg still in rsi (which is arg 2 = flag in Itanium ABI).
   *   0x0e6973e  leaq 0xaaec2b(%rip), %rax  — vptr for FFAudioPlaybackMediator_macOS's vtable at
   *              (RIP + disp) = 0x0e69745 + 0xaaec2b = 0x1918370  (Flexo __DATA_CONST vtable).
   *   0x0e69745  movq %rax, (%rbx)          — this->vptr = &vtable.
   *   0x0e69748  epilogue.
   */
  constructor(flag: boolean) {
    // 0x0e69739 — base ctor is called BEFORE the derived vtable install; the field-init in TS
    // must therefore be equivalent to running the base ctor first.
    super(flag);
    // 0x0e6973e-0x0e69745 — install the derived vtable. TS has no C++ vtable; class dispatch
    // handles this implicitly. Documented here for completeness.
  }

  /**
   * FFAudioPlaybackMediator_macOS::~FFAudioPlaybackMediator_macOS()  [D1 — complete dtor, no delete]
   * @Flexo 0x0000000000e69b00  (__ZN29FFAudioPlaybackMediator_macOSD1Ev)
   *
   * DECODE (raw-port/re/disasm/Flexo.FFAudioPlaybackMediator_macOS.D1.s):
   *   0x0e69b04  popq %rbp
   *   0x0e69b05  jmp __ZN23FFAudioPlaybackMediatorD2Ev  — tail-call the base D2 dtor. No derived
   *              cleanup at all — this class adds NO owning members over the base.
   */
  destroy_D1(): void {
    // 0x0e69b05 — tail-call base D2.
    this.destroy_base();
  }

  /**
   * FFAudioPlaybackMediator_macOS::~FFAudioPlaybackMediator_macOS()  [D0 — deleting dtor]
   * @Flexo 0x0000000000e69b10  (__ZN29FFAudioPlaybackMediator_macOSD0Ev)
   *
   * DECODE (raw-port/re/disasm/Flexo.FFAudioPlaybackMediator_macOS.D0.s):
   *   0x0e69b19  callq __ZN23FFAudioPlaybackMediatorD2Ev  — base D2.
   *   0x0e69b27  jmp __ZdlPv — operator delete(this).
   * Equivalent to D1 + operator delete.
   */
  destroy_D0(): void {
    this.destroy_D1();
    // 0x0e69b27 — operator delete: no analogue in TS/GC.
  }

  /**
   * FFAudioPlaybackMediator_macOS::shouldPlayObject(FFAnchoredObject* a, FFAnchoredObject* b) const → bool
   * @Flexo 0x0000000000e69750  (__ZNK29FFAudioPlaybackMediator_macOS16shouldPlayObjectEP16FFAnchoredObjectS1_)
   *
   * DECODE (raw-port/re/disasm/Flexo.FFAudioPlaybackMediator_macOS.shouldPlayObject.s) — 115
   * lines of ObjC-heavy predicate composition:
   *
   *   0x0e69768   result = base::shouldPlayObject(a, b) — call chain to
   *               __ZNK23FFAudioPlaybackMediator16shouldPlayObjectEP16FFAnchoredObjectS1_.
   *   0x0e6976d   cmpb $0x1, 0x68(%r15)  — check `this->mode_flag`.
   *   0x0e69772   jne 0x0e69806          — if 0, jump to epilogue: return the base's result.
   *   0x0e69778   preserve base result in %r15b.
   *   0x0e6977b-0x0e69787  [a containedRolesForRoleKey: <sel@RIP+0xd53f1e>] → bool "hasRole1"
   *   0x0e6978d   je 0x0e697a3           — if !hasRole1, skip the second role-key check.
   *   0x0e6978f-0x0e6979b  [a containedRolesForRoleKey: <sel@RIP+0xd53c42>] → bool "hasRole2"
   *   0x0e697a1   je 0x0e69813           — if !hasRole2 (but hasRole1 was true), take the
   *                                        "check b's roles too" branch at 0x0e69813.
   *   0x0e697a3   Common path (hasRole1==0 or hasRole1==1 && hasRole2==1):
   *     if base_result → early-return true (movb $0x1,%al ; jne 0x0e69806).
   *     otherwise: build a stack block, call _objectsWithOpenEffectWindows(), send the roles-check
   *     selector against the returned array, extract the block-captured bool, cleanup the block
   *     with __Block_object_dispose, return that bool.
   *   0x0e69813   ELSE branch: [a containedRolesForRoleKey: <sel@RIP+0xd538fe>] → temp
   *     if temp == 0 → jmp 0x0e6985d (skip to another gate)
   *     else → chain [temp containedRolesForRoleKey: <sel@RIP+0xd5395e>] via same r12=objc_msgSend
   *            plate; setne+testb against base_result; if both true return true, else fall
   *            through to the block-invoking path (starting at 0x0e69864).
   *   0x0e6985d   final gate: if base_result true → return true; else fall through to a SECOND
   *               block-invocation path at 0x0e69864 that ALSO uses _objectsWithOpenEffectWindows
   *               with a block descriptor at
   *               "___block_descriptor_48_e8_32o40r_e32_v32?0\"FFAnchoredObject\"8*16*24l" —
   *               this block is the file-local predicate for the effect-window role match.
   *   Landing pad at 0x0e698f9 for exceptions during block dispatch: cleanup + __Unwind_Resume.
   *
   * Every objc_msgSend receiver-selector pair, every block, and _objectsWithOpenEffectWindows
   * itself are un-decoded from this class's file — the actual boolean predicate depends on
   * decoding: (1) the SEL bytes at each __objc_selrefs RIP, (2) the block-descriptor's
   * captured-state layout, (3) the file-local block-invoke function
   * ____ZNK29FFAudioPlaybackMediator_macOS16shouldPlayObjectEP16FFAnchoredObjectS1__block_invoke,
   * (4) the file-local helper _objectsWithOpenEffectWindows. Faithful transcription of the
   * CONTROL FLOW without those semantics would produce an obviously wrong function; surfaced as
   * a throwing stub citing every decode-boundary.
   *
   * @frontier Flexo 0x0e69768 (base::shouldPlayObject), 0x0e697cc/0x0e69886 (_objectsWithOpen…),
   *           0x0e698bb (block-invoke fn), 5+ objc_msgSend selrefs (0xd53f1e, 0xd53c42,
   *           0xd4f4f8, 0xd538fe, 0xd5395e, 0xd4f48a, 0xd4ecbb, 0xd557b0).
   */
  shouldPlayObject(_a: FFAnchoredObject, _b: FFAnchoredObject): boolean {
    throw new Error(
      "FFAudioPlaybackMediator_macOS::shouldPlayObject @0x0e69750 drives a predicate composed " +
      "of the base FFAudioPlaybackMediator::shouldPlayObject (0x0e69768, un-decoded), a " +
      "file-local ObjC helper _objectsWithOpenEffectWindows (0x0e697cc/0x0e69886, un-decoded), " +
      "5+ objc_msgSend calls with un-decoded selrefs (at RIPs +0xd53f1e, +0xd53c42, +0xd4f4f8, " +
      "+0xd538fe, +0xd5395e, +0xd4f48a, +0xd4ecbb, +0xd557b0), and an inline block whose invoke " +
      "target is ___ZNK29…_block_invoke at 0x0e698bb with descriptor " +
      "'___block_descriptor_48_e8_32o40r_e32_v32?0\"FFAnchoredObject\"8*16*24l'. All frontier."
    );
  }
}
