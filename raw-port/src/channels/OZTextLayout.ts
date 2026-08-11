// OZTextLayout.ts — Ozone text-layout element (a very large polymorphic
// composite that anchors 6 sub-object vtables and embeds a std::mutex,
// a PCMutex, and an OZElement).
//
// Source: /Applications/Final Cut Pro.app/Contents/Frameworks/
//         Ozone.framework/Versions/A/Ozone (macOS FCP, x86_64 slice —
//         file offset 0x4000 for the x86_64 slice of the FAT binary).
//
// Symbols ported (all six methods brief.py listed):
//   * OZTextLayout::OZTextLayout(OZFactory*, PCString const&, unsigned int)
//                                                              [C2] @0x63f770
//   * OZTextLayout::OZTextLayout(OZTextLayout const&, unsigned int)
//                                                              [C2] @0x63f7e0
//   * OZTextLayout::~OZTextLayout()                            [D2] @0x63f850
//   * OZTextLayout::setText(CMTime, PCString const&)                @0x63f8b0
//   * OZTextLayout::~OZTextLayout()                            [D1] @0x6dc5d0
//   * OZTextLayout::~OZTextLayout()                            [D0] @0x6dc630
//   * non-virtual thunk to OZTextLayout::~OZTextLayout() [D1, adj 6720]  @0x6dc610
//   * non-virtual thunk to OZTextLayout::~OZTextLayout() [D1, adj 18968] @0x6dc620
//     (both `ud2` traps, like every member of the D1/D0 thunk family — see below)
//
// -----------------------------------------------------------------------------
// SIX-VTABLE MULTIPLE-INHERITANCE LAYOUT (recovered from the ctor bodies)
// -----------------------------------------------------------------------------
// Both ctors install SIX sub-object vtable pointers at fixed offsets. The
// RIP-relative `leaq` targets (verified with `resolve.py Ozone sym`)
// all name `vtable for OZTextLayout` — one primary + five secondary
// sub-object vtables:
//
//   this+0x000   ← vtable-for-OZTextLayout (+0x10)  = Ozone VA 0x888ea8
//                 primary vtable (installed @0x63f785 / @0x63f7fc)
//   this+0x0c8   ← vtable-for-OZTextLayout (+0x88)  = Ozone VA 0x888f20
//                 (installed @0x63f78f / @0x63f806)  — an OZElement sub-
//                 object's vtable-hole; the D2 dtor calls
//                 `OZElement::~OZElement()` with `this+0xc8` as `this`
//                 @0x63f85f-0x63f860, confirming this is where the
//                 embedded OZElement subobject starts.
//   this+0x0d8   ← vtable-for-OZTextLayout (+0x980) = Ozone VA 0x889818
//                 (installed @0x63f79d / @0x63f814)
//   this+0x0f0   ← vtable-for-OZTextLayout (+0xbd8) = Ozone VA 0x889a70
//                 (installed @0x63f7ab / @0x63f822)
//   this+0x1a40  ← vtable-for-OZTextLayout (+0xc30) = Ozone VA 0x889ac8
//                 (installed @0x63f7b9 / @0x63f830)
//   this+0x4a18  ← vtable-for-OZTextLayout (+0xd08) = Ozone VA 0x889ba0
//                 (installed @0x63f7c7 / @0x63f83e)
//
// The class is thus a *very* large object (>0x4a20 bytes) with an
// OZLockingElement primary base + five additional MI subobjects. The
// text-manipulation behavior is spread across all six vtables — porting
// them individually is out-of-scope here (the six installed-ptrs are
// pure address facts, not fetchable-through-C++ semantics).
//
// -----------------------------------------------------------------------------
// FIELD LAYOUT DECODED BY THE DTOR (D2 @0x63f850)
// -----------------------------------------------------------------------------
//   +0x000  vptr (primary)                — re-installed to `vtable-for-
//                                            OZLocking (+0x10)` @0x63f870
//                                            (leaq __ZTV9OZLocking(%rip)+0x10;
//                                             movq %rax, (%rbx)).
//   +0x008  std::__1::mutex               — tail-jumped to
//                                            `std::__1::mutex::~mutex()` at
//                                            end of dtor (@0x63f89e).
//   +0x058  heap-allocated buf ptr        — nullable; if non-null it is
//                                            mirrored into +0x60 and freed
//                                            via `operator delete` @0x63f87f-
//                                            0x63f88c. The `movq %rdi, 0x60(%rbx)`
//                                            @0x63f888 is a compiler-emitted
//                                            "poison-the-cached-copy" write
//                                            — it copies the about-to-be-
//                                            freed pointer into the +0x60
//                                            slot so any invariant checker
//                                            walking the pair sees the
//                                            same value on both sides.
//   +0x080  PCMutex                       — destroyed via PCMutex::~PCMutex()
//                                            @0x63f873-0x63f87a.
//   +0x0c8  OZElement subobject            — destroyed via OZElement::~OZElement()
//                                            @0x63f85f-0x63f860.
//   +0x0d8, +0x0f0, +0x1a40, +0x4a18      — additional MI-subobject anchors
//                                            (see vtable table above); the
//                                            dtor does not descend into them
//                                            explicitly — either they are
//                                            trivially destructible or their
//                                            teardown happens inside
//                                            OZElement::~OZElement().
//
// -----------------------------------------------------------------------------
// FRONTIER CALLEES — all THROWING stubs, cited by symbol + address.
// -----------------------------------------------------------------------------
//   * OZLockingElement::OZLockingElement(OZFactory*, PCString const&,
//                                        unsigned int)
//         — @0x63f779 (called by C2-from-factory-name ctor).
//   * OZLockingElement::OZLockingElement(OZElement const&, unsigned int)
//         — @0x63f7f0 (called by C2-copy ctor; note the `addq $0xc8, %rsi`
//           @0x63f7e9 that shifts the const-ref arg to point at the OZ
//           Element subobject inside the source OZTextLayout).
//   * OZElement::~OZElement()                     — @0x63f860 (D2 body)
//   * PCMutex::~PCMutex()                         — Ozone symbol stub 0x6def0a
//                                                    (called @0x63f87a).
//   * operator delete (__ZdlPv)                   — Ozone symbol stub 0x6dfc36
//                                                    (called @0x63f88c).
//   * std::__1::mutex::~mutex()                   — Ozone symbol stub 0x6dfbe2
//                                                    (tail-jumped @0x63f89e).
//   * vtable for OZLocking                        — `__ZTV9OZLocking(%rip)`,
//                                                    referenced by the D2 body
//                                                    @0x63f865 (base+0x10 skew;
//                                                    re-installed at *(this)).
//
// -----------------------------------------------------------------------------
// D1 / D0 ARE `ud2` TRAPS
// (and so is every non-virtual THUNK to them — see destroy_D1_thunk6720_trap,
//  which ports __ZThn6720_N12OZTextLayoutD1Ev @0x6dc610; the six bytes
//  `55 48 89 e5 0f 0b` are identical across D1 @0x6dc5d0, its Thn200/Thn216/
//  Thn240/Thn6720/Thn18968 thunks and the Thn6720 D0 @0x6dc670)
// -----------------------------------------------------------------------------
// The D1 (`~OZTextLayout` @0x6dc5d0) and D0 (`~OZTextLayout` @0x6dc630)
// entry points are BOTH the two-byte sequence
//   pushq %rbp; movq %rsp, %rbp; ud2
// i.e. immediate `#UD` (undefined-opcode) trap.  This is Clang/LLVM's
// standard way to spell "this virtual entry is deliberately unreachable
// / has been ICF-eliminated / is a stub". OZTextLayout's real teardown
// is D2 @0x63f850; a client calling D1 or D0 crashes the process on
// purpose. The JS port mirrors that by raising a hard error from those
// entry points.
//
// -----------------------------------------------------------------------------
// setText(CMTime, PCString const&) @0x63f8b0 IS AN EMPTY OVERRIDE
// -----------------------------------------------------------------------------
// The body is only
//   pushq %rbp ; movq %rsp,%rbp ; popq %rbp ; retq
// i.e. a NO-OP. This class inherits `setText` from an ancestor (almost
// certainly OZLockingElement or a related text-mutator) and deliberately
// overrides it to do nothing — presumably because OZTextLayout takes its
// text from the animation graph rather than from a direct setter. The JS
// port preserves that no-op semantics literally.
//
// -----------------------------------------------------------------------------
// This class holds no arithmetic — it is a lifetime + vtable-install
// harness. Nothing to bit-exact against, so raw-port/army/gate/
// oracle_map.json is NOT extended here.
//
// @class OZTextLayout (Ozone)

import type { PCString } from "../infra/PCString";

/**
 * `OZFactory` — the factory-based ctor's first arg; used only as an
 * opaque pointer that gets threaded into `OZLockingElement`'s ctor. Not
 * yet ported.
 *
 * @source Ozone (`9OZFactory`)
 */
export type OZFactory = { readonly __brand: "OZFactory*" };

/**
 * `OZLockingElement` — the primary base of OZTextLayout. The class name
 * comes straight out of the mangled symbols
 *   _ZN16OZLockingElementC2EP9OZFactoryRK8PCStringj
 *   _ZN16OZLockingElementC2ERK9OZElementj
 * that the two ctors tail-call. Not yet ported.
 *
 * @source Ozone (`16OZLockingElement`)
 */
export interface OZLockingElement {
  /**
   * `OZLockingElement::OZLockingElement(OZFactory*, PCString const&,
   * unsigned int)` — @Ozone 0x63f779.
   */
  initFromFactoryName(factory: OZFactory, name: PCString, flags: number): void;
  /**
   * `OZLockingElement::OZLockingElement(OZElement const&, unsigned int)`
   * — @Ozone 0x63f7f0. Note the const-ref arg is expected to point at an
   * OZElement subobject: the caller shifts by +0xc8 first (@0x63f7e9)
   * to convert an `OZTextLayout const&` into an `OZElement const&`.
   */
  initFromElementCopy(elementRef: OZElement, flags: number): void;
  /** `OZLockingElement::~OZLockingElement` — not called by this class
   *  directly; the D2 dtor descends through its OZElement subobject
   *  (see below) so this is present here only for completeness. */
}

/**
 * `OZElement` — the by-value subobject embedded at OZTextLayout+0xc8.
 * Not yet ported.
 *
 * @source Ozone (`9OZElement`)
 */
export interface OZElement {
  /** `OZElement::~OZElement()` — @Ozone 0x63f860 (called by D2). */
  destroy(): void;
}

/**
 * `PCMutex` — ProCore recursive-mutex primitive; embedded at
 * OZTextLayout+0x80. Not yet ported.
 *
 * @source Ozone/ProCore (`7PCMutex`)
 */
export interface PCMutex {
  /** `PCMutex::~PCMutex()` — Ozone symbol stub 0x6def0a. */
  destroy(): void;
}

/**
 * `std::__1::mutex` — libc++ mutex, embedded at OZTextLayout+0x08. Not
 * yet ported (its dtor is tail-jumped from the JS port's `destroy()`).
 *
 * @source Ozone (`std::__1::mutex`)
 */
export interface StdMutex {
  /** `std::__1::mutex::~mutex()` — Ozone symbol stub 0x6dfbe2. */
  destroy(): void;
}

/**
 * `CMTime` — Core Media time. The setText method takes it BY VALUE (4
 * 64-bit registers on x86_64), but since the setText body is a no-op
 * we never inspect the fields — the JS port surfaces the arg type
 * without reaching for the ported `CMTime.ts` (that would introduce
 * an unused import and drag the CMTime interface into a class that
 * never touches it).
 *
 * @source Ozone (`6CMTime`)
 */
export type CMTimeArg = { readonly __brand: "CMTime by value" };

/**
 * `vtable-for-OZTextLayout` sub-object vtable pointers, keyed by the
 * offset from the object base where each one is installed. These are
 * PURE ADDRESSES — the JS port cannot dispatch through them without
 * porting the corresponding methods (which is not in scope for this
 * file). We surface them as brand-typed handles so that a future port
 * can wire them in.
 *
 * @addr Ozone 0x888ea8 / 0x888f20 / 0x889818 / 0x889a70 / 0x889ac8 /
 *       0x889ba0 (six install sites).
 */
export interface OZTextLayoutVtableAnchors {
  /** installed at this+0x000  — Ozone VA 0x888ea8 (base+0x10 skew). */
  primary: { readonly __brand: "vtable-for-OZTextLayout(+0x10)" };
  /** installed at this+0x0c8  — Ozone VA 0x888f20 (base+0x88 skew). */
  subObject_0x0c8: { readonly __brand: "vtable-for-OZTextLayout(+0x88)" };
  /** installed at this+0x0d8  — Ozone VA 0x889818 (base+0x980 skew). */
  subObject_0x0d8: { readonly __brand: "vtable-for-OZTextLayout(+0x980)" };
  /** installed at this+0x0f0  — Ozone VA 0x889a70 (base+0xbd8 skew). */
  subObject_0x0f0: { readonly __brand: "vtable-for-OZTextLayout(+0xbd8)" };
  /** installed at this+0x1a40 — Ozone VA 0x889ac8 (base+0xc30 skew). */
  subObject_0x1a40: { readonly __brand: "vtable-for-OZTextLayout(+0xc30)" };
  /** installed at this+0x4a18 — Ozone VA 0x889ba0 (base+0xd08 skew). */
  subObject_0x4a18: { readonly __brand: "vtable-for-OZTextLayout(+0xd08)" };
}

/**
 * `vtable-for-OZLocking (+0x10)` — the vtable pointer the D2 dtor
 * REINSTALLS at *(this) mid-teardown (@0x63f865-0x63f870). This is the
 * classic Itanium-ABI "as a derived-class dtor runs, restore each base's
 * vptr on the way out so any virtual call in the base dtor sees the
 * base's own overrides" pattern.
 *
 * @addr Ozone RIP-relative to `__ZTV9OZLocking` (+0x10 skew).
 */
export type OZLockingVtable = { readonly __brand: "vtable-for-OZLocking(+0x10)" };

/**
 * OZTextLayout — a large polymorphic composite anchored on six sub-
 * object vtables + a std::mutex + a PCMutex + an OZElement + a
 * heap-owned buffer at +0x58.
 *
 * The JS port models the C++ object as three named subobjects; the JS
 * host is expected to construct the OZLockingElement / OZElement /
 * PCMutex / std::mutex sub-objects via their own ports (not-yet-landed
 * frontier) and hand them to us. The huge un-decoded interior region
 * (offsets +0x60..+0x4a20 minus the named holes) is represented as an
 * opaque byte-buffer brand so no code accidentally reads or writes it.
 *
 * Layout summary (see the top-of-file decode for cite lines):
 *   +0x000  primary vtable    ← [installed by ctor]
 *   +0x008  std::__1::mutex   (embedded)
 *   +0x058  heap-owned ptr    (nullable; freed on dtor)
 *   +0x060  cached copy of +0x58 (poison-write during free)
 *   +0x080  PCMutex           (embedded)
 *   +0x0c8  OZElement subobject
 *   +0x0d8, +0x0f0, +0x1a40, +0x4a18  ← sub-object vtable anchors
 *
 * @source Ozone
 * @classAddr 0x63f770 (factory-name C2) / 0x63f7e0 (copy C2)
 */
export class OZTextLayout {
  /**
   * +0x008 — embedded std::__1::mutex (dtor tail-jumps into this @0x63f89e).
   * The JS port stores it as a supplied object so the host can decide
   * whether to use a real Mutex, a shim, or a stub.
   */
  stdMutex: StdMutex;

  /**
   * +0x058 — the nullable heap-owned buffer that the D2 dtor releases via
   * `operator delete` @0x63f88c. Set to null on construction; assigned
   * (elsewhere in the class family) as strings/glyphs get realized.
   */
  buf_0x58: unknown;

  /**
   * +0x080 — embedded PCMutex (recursive lock).
   */
  pcMutex: PCMutex;

  /**
   * +0x0c8 — embedded OZElement subobject (destroyed FIRST by D2 @0x63f860).
   */
  element: OZElement;

  /**
   * Anchors for the six sub-object vtables. See
   * `OZTextLayoutVtableAnchors` for the address mapping. These are
   * install-time facts, not runtime data; a full port would replace
   * each brand with an interface exposing that sub-object's methods.
   */
  vtableAnchors: OZTextLayoutVtableAnchors;

  /**
   * The dtor rewrites the primary vptr to `vtable-for-OZLocking (+0x10)`
   * mid-teardown (@0x63f865-0x63f870). The JS port tracks whether this
   * has happened so a debugger / invariant checker can distinguish a
   * partially-destroyed instance. This flips true inside `destroy()`.
   */
  primaryVtableRewrittenToOZLocking: boolean = false;

  /**
   * Reserved brand-typed placeholder for the >0x4a20-byte interior of
   * the class between the named subobjects. Not decoded here.
   */
  interiorBlob: { readonly __brand: "OZTextLayout interior" };

  private constructor(init: {
    stdMutex: StdMutex;
    pcMutex: PCMutex;
    element: OZElement;
    vtableAnchors: OZTextLayoutVtableAnchors;
    interiorBlob: { readonly __brand: "OZTextLayout interior" };
  }) {
    this.stdMutex = init.stdMutex;
    this.pcMutex = init.pcMutex;
    this.element = init.element;
    this.vtableAnchors = init.vtableAnchors;
    this.interiorBlob = init.interiorBlob;
    this.buf_0x58 = null;
  }

  /**
   * `OZTextLayout::OZTextLayout(OZFactory*, PCString const&, unsigned int)`
   * C2 body @0x63f770.
   *
   * Mirrored control flow:
   *   pushq %rbp; movq %rsp,%rbp; pushq %rbx; pushq %rax                @0x63f770
   *   movq %rdi, %rbx                                                   @0x63f776
   *   callq __ZN16OZLockingElementC2EP9OZFactoryRK8PCStringj             @0x63f779
   *     — build the OZLockingElement primary base with (%rdi=this,
   *       %rsi=factory, %rdx=name, %rcx=flags). This subsumes ALL of the
   *       zero-init that OZTextLayout itself needs (mutexes,
   *       OZElement, etc.); the OZTextLayout ctor body proper only
   *       overrides the six vtable slots afterward.
   *   leaq 0x249723(%rip), %rax ; movq %rax, (%rbx)                     @0x63f77e-0x63f785
   *     — install the OZTextLayout primary vtable at +0x000
   *       (Ozone VA 0x888ea8 = `vtable for OZTextLayout (+0x10)`).
   *   leaq 0x249791(%rip), %rax ; movq %rax, 0xc8(%rbx)                 @0x63f788-0x63f78f
   *     — install the OZElement-sub-object vtable at +0xc8
   *       (Ozone VA 0x888f20).
   *   leaq 0x24a07b(%rip), %rax ; movq %rax, 0xd8(%rbx)                 @0x63f796-0x63f79d
   *   leaq 0x24a2c5(%rip), %rax ; movq %rax, 0xf0(%rbx)                 @0x63f7a4-0x63f7ab
   *   leaq 0x24a30f(%rip), %rax ; movq %rax, 0x1a40(%rbx)               @0x63f7b2-0x63f7b9
   *   leaq 0x24a3d9(%rip), %rax ; movq %rax, 0x4a18(%rbx)               @0x63f7c0-0x63f7c7
   *     — install the remaining four sub-object vtables.
   *   addq $0x8, %rsp; popq %rbx; popq %rbp; retq                       @0x63f7ce-0x63f7d4
   *
   * @addr 0x63f770 (Ozone, C2)
   */
  static createFromFactoryName(
    factory: OZFactory,
    name: PCString,
    flags: number,
    subobjects: {
      stdMutex: StdMutex;
      pcMutex: PCMutex;
      element: OZElement;
      base: OZLockingElement;
      vtableAnchors: OZTextLayoutVtableAnchors;
      interiorBlob: { readonly __brand: "OZTextLayout interior" };
    },
  ): OZTextLayout {
    // @0x63f779 — `OZLockingElement::OZLockingElement(factory, name, flags)`.
    // The C++ ctor is invoked in-place on `this` (which coincides with
    // the OZLockingElement primary-base subobject); we surface it here
    // as an explicit init call on the supplied base object.
    subobjects.base.initFromFactoryName(factory, name, flags);
    // @0x63f77e-0x63f7c7 — the six vtable installs. In the JS port these
    // are pure identity facts (a `new OZTextLayout(...)` sets up the
    // class-identity of the object; the anchors just cite the addresses).
    return new OZTextLayout({
      stdMutex: subobjects.stdMutex,
      pcMutex: subobjects.pcMutex,
      element: subobjects.element,
      vtableAnchors: subobjects.vtableAnchors,
      interiorBlob: subobjects.interiorBlob,
    });
  }

  /**
   * `OZTextLayout::OZTextLayout(OZTextLayout const&, unsigned int)`
   * C2 body @0x63f7e0. The copy-ctor differs from the factory-name ctor
   * only in the base-class call: it shifts %rsi (the source
   * OZTextLayout const&) by +0xc8 to point at the source's OZElement
   * subobject, then calls
   * `OZLockingElement::OZLockingElement(OZElement const&, unsigned int)`.
   * The six vtable-install steps that follow are byte-for-byte
   * identical to the factory-name ctor (the same six RIP-relative
   * displacements, differ only by the four-byte offset difference in
   * each instruction's position).
   *
   * Mirrored control flow:
   *   pushq %rbp; movq %rsp,%rbp; pushq %rbx; pushq %rax                @0x63f7e0
   *   movq %rdi, %rbx                                                   @0x63f7e6
   *   addq $0xc8, %rsi                                                   @0x63f7e9
   *     — shift src pointer to its OZElement subobject.
   *   callq __ZN16OZLockingElementC2ERK9OZElementj                        @0x63f7f0
   *   [ six identical vtable installs @0x63f7f5-0x63f83e ]
   *   addq $0x8, %rsp; popq %rbx; popq %rbp; retq                        @0x63f845-0x63f84b
   *
   * @addr 0x63f7e0 (Ozone, C2)
   */
  static createFromCopy(
    source: OZTextLayout,
    flags: number,
    subobjects: {
      stdMutex: StdMutex;
      pcMutex: PCMutex;
      element: OZElement;
      base: OZLockingElement;
      vtableAnchors: OZTextLayoutVtableAnchors;
      interiorBlob: { readonly __brand: "OZTextLayout interior" };
    },
  ): OZTextLayout {
    // @0x63f7e9 — `addq $0xc8, %rsi` shifts the source-ref to its
    // embedded OZElement subobject. In the JS port we just reach for
    // `source.element` — same net effect.
    // @0x63f7f0 — OZLockingElement copy-ctor with `source.element` and flags.
    subobjects.base.initFromElementCopy(source.element, flags);
    // @0x63f7f5-0x63f83e — six vtable installs (identical to the
    // factory-name ctor's post-base-call block; represented in the JS
    // port by class-identity).
    return new OZTextLayout({
      stdMutex: subobjects.stdMutex,
      pcMutex: subobjects.pcMutex,
      element: subobjects.element,
      vtableAnchors: subobjects.vtableAnchors,
      interiorBlob: subobjects.interiorBlob,
    });
  }

  /**
   * `OZTextLayout::~OZTextLayout()` — D2 @0x63f850.
   *
   * Mirrored control flow (register annotations show the C++ compiler's
   * choice; the JS port collapses the sequence into a straight-line
   * teardown):
   *   pushq %rbp; movq %rsp,%rbp; pushq %rbx; pushq %rax                @0x63f850
   *   movq %rdi, %rbx                                                   @0x63f856
   *   addq $0xc8, %rdi                                                   @0x63f859
   *   callq __ZN9OZElementD2Ev                                            @0x63f860
   *     — OZElement subobject dtor (this+0xc8).
   *   leaq __ZTV9OZLocking(%rip), %rax ; addq $0x10, %rax ;
   *     movq %rax, (%rbx)                                                @0x63f865-0x63f870
   *     — re-install `vtable for OZLocking (+0x10)` at *(this).
   *   leaq 0x80(%rbx), %rdi ; callq __ZN7PCMutexD2Ev                     @0x63f873-0x63f87a
   *     — PCMutex subobject dtor (this+0x80).
   *   movq 0x58(%rbx), %rdi ; testq %rdi, %rdi ; je .Ltail               @0x63f87f-0x63f886
   *     — nullable heap-buf ptr at this+0x58.
   *   movq %rdi, 0x60(%rbx) ; callq __ZdlPv                              @0x63f888-0x63f88c
   *     — mirror the pointer into +0x60 (post-free poison-write copy)
   *       and delete it.
   *   .Ltail:                                                             @0x63f891
   *   addq $0x8, %rbx ; movq %rbx, %rdi ; ... ;
   *     jmp __ZNSt3__15mutexD1Ev                                          @0x63f891-0x63f89e
   *     — tail-jmp `std::mutex::~mutex()` on this+0x08.
   *
   * @addr 0x63f850 (Ozone, D2)
   */
  destroy(): void {
    // @0x63f859-0x63f860 — OZElement subobject dtor first.
    this.element.destroy();
    // @0x63f865-0x63f870 — mid-teardown vtable-swap to OZLocking's.
    // The JS port doesn't dispatch through the vptr, but it does
    // record the swap so introspection can distinguish a "post-
    // OZLocking-restore" state.
    this.primaryVtableRewrittenToOZLocking = true;
    // @0x63f873-0x63f87a — PCMutex subobject dtor.
    this.pcMutex.destroy();
    // @0x63f87f-0x63f88c — free the +0x58 heap ptr if non-null, and
    // mirror-write the pointer into +0x60 first (the C++ compiler's
    // "poison" copy).
    if (this.buf_0x58 !== null) {
      // The `movq %rdi, 0x60(%rbx)` @0x63f888 writes the ABOUT-TO-BE-
      // FREED pointer into the +0x60 slot. Some Ozone builds check
      // that the two match (as a use-after-free guard). We don't
      // model the +0x60 field independently in the JS port because
      // the value it holds is transient — set-then-freed within one
      // instruction of each other. If a JS host cares, it can read
      // `this.buf_0x58` before it's cleared to null.
      // (Free is host-supplied: `operator delete` is not a JS concept.)
      this.buf_0x58 = null;
    }
    // @0x63f89e — tail-jmp `std::mutex::~mutex()` on this+0x08.
    this.stdMutex.destroy();
  }

  /**
   * `OZTextLayout::~OZTextLayout()` — D1 @0x6dc5d0. Body is
   *   pushq %rbp ; movq %rsp,%rbp ; ud2
   * i.e. immediate `#UD` trap.  See file-top decode: D1 and D0 are
   * deliberate un-reachable-entry markers.  A JS caller that hits this
   * entry point sees the exact same "process aborts" semantics — the
   * host is expected NOT to invoke this method.
   *
   * @addr 0x6dc5d0 (Ozone, D1 — `ud2` trap)
   */
  destroy_D1_trap(): never {
    throw new Error(
      "OZTextLayout::~OZTextLayout D1 @0x6dc5d0 is a `ud2` trap in the " +
        "shipping Ozone binary (bytes: `pushq %rbp; movq %rsp,%rbp; " +
        "ud2`). The complete-object dtor for this class is D2 " +
        "@0x63f850 — call destroy() instead. Invoking the D1 entry " +
        "point in the native binary crashes the process on purpose.",
    );
  }

  /**
   * `OZTextLayout::~OZTextLayout()` — D0 @0x6dc630. Body is identical to
   * D1: `pushq %rbp; movq %rsp,%rbp; ud2`.
   *
   * @addr 0x6dc630 (Ozone, D0 — `ud2` trap)
   */
  destroy_D0_trap(): never {
    throw new Error(
      "OZTextLayout::~OZTextLayout D0 @0x6dc630 is a `ud2` trap in the " +
        "shipping Ozone binary (bytes: `pushq %rbp; movq %rsp,%rbp; " +
        "ud2`). The delete-thunk entry point has been ICF-folded to a " +
        "hard trap — call destroy() instead.",
    );
  }

  /**
   * `non-virtual thunk to OZTextLayout::~OZTextLayout()` — D1 thunk
   *   @Ozone 0x6dc610 (__ZThn6720_N12OZTextLayoutD1Ev).
   *
   * A DISTINCT exported symbol from the un-thunked D1 @0x6dc5d0 above, at its
   * own address, and its own ledger unit. `Thn6720` is the Itanium-ABI
   * non-virtual thunk whose job is to subtract 6720 (0x1a40) from `this` before
   * chaining — the adjustment for the base subobject a caller holds a pointer to
   * when it destroys this object through that base's vtable slot.
   *
   * Here it never gets as far as adjusting anything. The whole body is
   *
   *   0x6dc610  pushq %rbp                 ; frame prologue
   *   0x6dc611  movq  %rsp, %rbp
   *   0x6dc614  ud2                        ; immediate #UD — an intentional trap
   *   0x6dc616  nopw  %cs:(%rax,%rax)      ; padding, not executed
   *
   * i.e. the same three instructions as the un-thunked D1/D0: there is no
   * `addq $-0x1a40, %rdi` and no `jmp` to a real destructor, so this entry point
   * is a deliberate "unreachable" marker, not a forwarding thunk. Reading it as
   * "undecoded" would be wrong — the trap IS the behaviour, and the throw below
   * is the faithful port of it (PORTING_SPEC Rule 3's loud gap, except that here
   * the loudness is what the machine itself does).
   *
   * The whole family is traps, which is what settles the reading: D1 @0x6dc5d0,
   * the D1 thunks Thn200 @0x6dc5e0, Thn216 @0x6dc5f0, Thn240 @0x6dc600,
   * Thn6720 @0x6dc610 and Thn18968 @0x6dc620, and the D0 thunk Thn6720
   * @0x6dc670 all begin with the identical six bytes `55 48 89 e5 0f 0b`. The
   * real teardown for this class is D2 @0x63f850 — `destroy()` above.
   *
   * ORACLE (raw-port/re/oracle/OZTextLayout_Thn6720_D1_oracle.py): proven two
   * ways against the live image, because "the port throws" is only honest if the
   * machine really traps. STATICALLY, the six bytes at `dyld slide + 0x6dc614`
   * (and at each of the six siblings above) read back as
   * `55 48 89 e5 0f 0b` — 7/7. BEHAVIOURALLY, the function is actually CALLED,
   * in a FORKED CHILD process because a `ud2` raises SIGILL and would otherwise
   * take the harness down with it: the child died with signal 4 (SIGILL), and
   * did not return.
   *
   * @addr 0x6dc610 (Ozone, D1 non-virtual thunk, this-adjustment 6720 — `ud2` trap)
   */
  destroy_D1_thunk6720_trap(): never {
    // @0x6dc614 — ud2 : the machine raises #UD here (measured: SIGILL).
    throw new Error(
      "non-virtual thunk to OZTextLayout::~OZTextLayout D1 @Ozone 0x6dc610 is a " +
        "`ud2` trap in the shipping binary (bytes: `55 48 89 e5 0f 0b` = " +
        "`pushq %rbp; movq %rsp,%rbp; ud2`). It never performs its 6720-byte " +
        "this-adjustment — the entry point is deliberately unreachable, and " +
        "calling it aborts the process with SIGILL (verified by calling it). " +
        "The complete-object dtor for this class is D2 @0x63f850 — call " +
        "destroy() instead.",
    );
  }

  /**
   * non-virtual thunk to `OZTextLayout::~OZTextLayout()` [D1], this-adjustment 18968
   *   `__ZThn18968_N12OZTextLayoutD1Ev` — @Ozone 0x6dc620
   *
   * FULL transcription — the entire function is four instructions and one of them traps:
   *
   *   0x6dc620  pushq %rbp                    ; frame prologue
   *   0x6dc621  movq  %rsp,%rbp
   *   0x6dc624  ud2                           ; #UD — undefined opcode, raises SIGILL
   *   0x6dc626  nopw  %cs:(%rax,%rax)         ; alignment padding, never reached
   *
   * The six bytes are `55 48 89 e5 0f 0b`, byte-for-byte identical to D1 @0x6dc5d0 and to every
   * other thunk in the family. It NEVER performs its 18968-byte this-adjustment and never reaches
   * a destructor: the entry point is deliberately unreachable (Clang/LLVM's spelling for a virtual
   * slot that must never be dispatched). The real teardown for this class is D2 @0x63f850 —
   * `destroy()` above — which is why a throw here is the FAITHFUL port and not a deferral: the
   * machine's behaviour at this address IS "abort".
   *
   * ORACLE (raw-port/re/oracle/OZTextLayout_Thn18968_D1_oracle.py, re-run for THIS address rather
   * than inherited from the Thn6720 sibling), proven the same two ways, because "the port throws"
   * is only honest if the machine really traps. STATICALLY: the bytes at
   * `dyld slide + 0x6dc620` read back through the mapped image as `55 48 89 e5 0f 0b`, and so do
   * all ELEVEN siblings — the complete D1 family (D1, Thn200, Thn216, Thn240, Thn6720, Thn18968)
   * AND the complete D0 family (D0 @0x6dc630, Thn200 @0x6dc640, Thn216 @0x6dc650, Thn240
   * @0x6dc660, Thn6720 @0x6dc670, Thn18968 @0x6dc680): 12/12 `ud2`, 0 exceptions. That the WHOLE
   * family traps is what settles the reading as "deliberately unreachable" rather than "undecoded".
   * BEHAVIOURALLY: this thunk was actually CALLED, in a forked CHILD process (a `ud2` would
   * otherwise take the harness down with it) — the child died with signal 4, SIGILL, and did not
   * return.
   *
   * @addr 0x6dc620 (Ozone, D1 non-virtual thunk, this-adjustment 18968 — `ud2` trap)
   */
  destroy_D1_thunk18968_trap(): never {
    // @0x6dc624 — ud2 : the machine raises #UD here (measured: the child died with SIGILL).
    throw new Error(
      "non-virtual thunk to OZTextLayout::~OZTextLayout D1 @Ozone 0x6dc620 is a " +
        "`ud2` trap in the shipping binary (bytes: `55 48 89 e5 0f 0b` = " +
        "`pushq %rbp; movq %rsp,%rbp; ud2`). It never performs its 18968-byte " +
        "this-adjustment — the entry point is deliberately unreachable, and " +
        "calling it aborts the process with SIGILL (verified by calling it). " +
        "The complete-object dtor for this class is D2 @0x63f850 — call " +
        "destroy() instead.",
    );
  }

  /**
   * `OZTextLayout::setText(CMTime, PCString const&)` — @0x63f8b0.
   *
   * The entire body is
   *   pushq %rbp ; movq %rsp, %rbp ; popq %rbp ; retq
   * i.e. a NO-OP override.  OZTextLayout inherits `setText` from an
   * ancestor and deliberately overrides it to do nothing (the class
   * takes its text via the animation graph, not via this virtual).
   *
   * The JS port preserves the no-op semantics literally. The arguments
   * are named-but-ignored — the arg types are surfaced so callers can
   * still dispatch a plausible call, but the method has no side effects.
   *
   * @addr 0x63f8b0 (Ozone) — empty function body
   */
  setText(_time: CMTimeArg, _text: PCString): void {
    // @0x63f8b0..0x63f8b5 — nothing to do. This is intentional; see
    // file-top decode.
  }
}
