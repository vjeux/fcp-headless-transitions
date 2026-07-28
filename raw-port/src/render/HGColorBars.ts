// raw-port/src/render/HGColorBars.ts
//
// FCP `HGColorBars` — Helium render-graph node (extends HGNode). This is
// a THIN FACADE around a private shader-graph node `HgcColorBars` held at
// this->[+0x198]. Every user-facing call the class overrides forwards to
// that child node via its vtable:
//   - SetParameter(i,fA,fB,fC,fD) -> child->vtable[+0x60]  (HgcColorBars::SetParameter)
//   - GetOutput(HGRenderer*)       -> just returns the child pointer
// All other vtable slots either inherit HGNode's or the HGColorBars
// destructor (see below). FAITHFUL PORT from Helium.framework; every
// method cites @0xADDR.
//
// Provenance framework:
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Helium.framework/Versions/A/Helium
//
// Method map (x86_64 slice):
//   @0x0000000000030c10  C2 — HGColorBars()                (base ctor)
//   @0x0000000000030cf0  C1 — HGColorBars()                (complete ctor — tail-jmp to C2)
//   @0x0000000000030d40  D1/D2 — ~HGColorBars()             (complete/base dtor, folded)
//   @0x0000000000030d80  D0 — ~HGColorBars() (deleting)     (dtor + HGObject::operator delete)
//   @0x0000000000030dd0  SetParameter(int,float,float,float,float)
//   @0x0000000000030df0  GetOutput(HGRenderer*)
//
// Vtable @Helium 0xa05598 (installed ptr 0xa055a8 — this is what the ctor
// writes to (%rdi) at @0x030c22). Slots that DIFFER from HGNode:
//   *0x00 = 0x30d40  ~HGColorBars() [D1/D2]     (was HGNode's D1/D2)
//   *0x08 = 0x30d80  ~HGColorBars() [D0]        (was HGNode's D0)
//   *0x60 = 0x30dd0  HGColorBars::SetParameter  (was HGNode::SetParameter)
// Every other slot resolves to HGNode's inherited method.
//
// STRUCT LAYOUT — extends HGNode. Total size 0x1a0 (0x1a0 == 416 dec),
// visible in the ctor at @0x30c37 as `movl $0x1a0,%edi` — that is the
// SIZE of the OTHER thing (the HgcColorBars child) which is the SAME
// SIZE as HGColorBars itself because HGColorBars is HGNode + one extra
// pointer field:
//   ---- inherited from HGNode (size 0x198) ----
//     0x00..0x197 : all HGNode fields (see raw-port/src/render/HGNode.ts).
//   ---- HGColorBars-specific ----
//     0x198 : HGNode*  child  (a `HgcColorBars*` — a shader-graph node
//                              constructed via `HgcColorBars::HgcColorBars()`
//                              during this class's ctor).
// (0x198 + 0x8 = 0x1a0 total.)
//
// FRONTIER (throw-stubs, cited by @0xADDR):
//   HgcColorBars::HgcColorBars()             @Helium 0x31f6a0..* (called from @0x30c47)
//   HgcColorBars::~HgcColorBars() [via *0x18] @Helium 0x31f7a0    (called from @0x30ca? and *0x18)
//   HgcColorBars::SetParameter(i,f,f,f,f)    @Helium 0x31f7f0    (called from @0x30de3 via *0x60)
// `HgcColorBars` is a separate class living in the shader-graph layer;
// its own port is deferred. Every call into it here is a THROWING stub
// that cites the exact @0xADDR of the callq/jmpq.
//
// Note on symbol relations:
//   C1 (complete-object ctor) at @0x30cf0 is a 6-instruction thunk that
//   tail-jumps to C2 (base-object ctor) at @0x030cf5. Semantically
//   identical for this final class; the TS port has ONE ctor covering
//   both.
//
//   D0 (deleting dtor) at @0x30d80 runs the "logical" dtor body then
//   calls HGObject::operator delete. D1/D2 at @0x30d40 (compiler-folded
//   into the same body) DON'T free memory. In TS with GC we have one
//   `dispose()` method covering the shared behaviour; the "deleting"
//   variant is a comment because the JS memory model has no explicit
//   `operator delete`.

import { HGNode } from './HGNode';
import { HGObject } from './HGObject';

// ── Frontier stubs — `HgcColorBars` (shader-graph child) ─────────────────
//
// HgcColorBars is a separate class (HGNode subclass) living in the Helium
// shader-graph layer. HGColorBars OWNS an instance of it at [+0x198] and
// forwards SetParameter / dtor calls into it. Its methods are not yet
// transcribed; each stub cites the exact address at which HGColorBars'
// code calls into HgcColorBars.

/**
 * HgcColorBars::HgcColorBars() — @Helium 0x31f6a0
 * Called from HGColorBars::HGColorBars() @0x030c47 on a freshly
 * `HGObject::operator new(0x1a0)`-allocated block. Not yet transcribed.
 */
class HgcColorBars_stub extends HGNode {
  constructor() {
    super();
    // throw: HgcColorBars::HgcColorBars() @Helium 0x31f6a0 not yet transcribed @0x030c47
    throw new Error(
      "HgcColorBars::HgcColorBars() @Helium 0x31f6a0 not yet transcribed (called from HGColorBars::HGColorBars() @0x030c47)",
    );
  }

  /**
   * HgcColorBars::SetParameter(int, float, float, float, float)
   *   @Helium 0x31f7f0 — slot *0x60 of HgcColorBars vtable @0xa43560.
   * Called via `jmpq *%rax` from HGColorBars::SetParameter @0x030de3.
   */
  SetParameter(_i: number, _a: number, _b: number, _c: number, _d: number): void {
    // throw: HgcColorBars::SetParameter @Helium 0x31f7f0 not yet transcribed @0x030de3
    throw new Error(
      "HgcColorBars::SetParameter(int, float, float, float, float) @Helium 0x31f7f0 not yet transcribed (dispatched via vtable *0x60 at HGColorBars::SetParameter @0x030de3)",
    );
  }

  /**
   * HgcColorBars::~HgcColorBars() (D0 deleting slot) — @Helium 0x31f7a0
   * Called via vtable *0x18 (Release slot in HGObject vtable, which for
   * HgcColorBars is actually its D0 — see HgcColorBars vtable dump). The
   * *0x18 slot is used by HGColorBars ctor/dtor to release/replace the
   * child. Not yet transcribed.
   */
  vtable_0x18_release_or_dtor(): void {
    // throw: HgcColorBars vtable *0x18 (~HgcColorBars D0) @Helium 0x31f7a0 not yet transcribed @0x030d9d/@0x030c60/@0x030c77
    throw new Error(
      "HgcColorBars vtable *0x18 (HgcColorBars::~HgcColorBars D0 @Helium 0x31f7a0) not yet transcribed (called from HGColorBars ~/ctor at @0x030d9d, @0x030c60, @0x030c77)",
    );
  }
}

/**
 * HGColorBars — Helium HGNode subclass; thin facade around a
 * HgcColorBars shader-graph child stored at [+0x198]. See file header.
 */
export class HGColorBars extends HGNode {
  /** +0x198 — HgcColorBars* child, constructed in ctor via
   *  `HGObject::operator new(0x1a0)` + `HgcColorBars::HgcColorBars()`. */
  private child: HgcColorBars_stub | null = null;

  /**
   * HGColorBars::HGColorBars() — C2 @0x030c10 (C1 @0x030cf0 tail-jmp
   * to C2). Mangled: __ZN11HGColorBarsC2Ev / __ZN11HGColorBarsC1Ev.
   *
   * Body @0x030c10..0x030c84:
   *   0x030c1d: callq HGNode::HGNode()          # base ctor
   *   0x030c22: leaq  0x9d497f(%rip),%rax        # HGColorBars vtable installed-ptr @0xa055a8
   *   0x030c29: movq  %rax,(%rbx)                # this->vtable = 0xa055a8
   *   0x030c2c: movq  $0x0,0x198(%rbx)           # this->child = nullptr
   *   0x030c37: movl  $0x1a0,%edi                # sizeof(HgcColorBars) == 0x1a0 (same as this class)
   *   0x030c3c: callq HGObject::operator new(unsigned long)
   *   0x030c41: movq  %rax,%r14                  # r14 = raw block
   *   0x030c47: callq HgcColorBars::HgcColorBars()  # in-place construct
   *   0x030c4c: movq  0x198(%rbx),%rdi           # rdi = current this->child (== nullptr here)
   *   0x030c53: cmpq  %r14,%rdi                  # (defensive) if new == current, skip both
   *   0x030c56: je    0x030c6c                   #   -> only re-check r14 case
   *   0x030c58: testq %rdi,%rdi                  # else: if current != nullptr...
   *   0x030c5b: je    0x030c63                   #        ...delete-via-vtable *0x18
   *   0x030c5d: movq  (%rdi),%rax
   *   0x030c60: callq *0x18(%rax)                # (child)->vtable[*0x18]()
   *   0x030c63: movq  %r14,0x198(%rbx)           # this->child = new
   *   0x030c6a: jmp   0x030c7a                   # done
   *   0x030c6c: testq %r14,%r14                  # only-r14 branch: if new != nullptr...
   *   0x030c6f: je    0x030c7a                   # ...else nothing
   *   0x030c71: movq  (%r14),%rax
   *   0x030c74: movq  %r14,%rdi
   *   0x030c77: callq *0x18(%rax)                # ...delete-via-vtable *0x18
   *   0x030c7a: epilogue
   *
   * The @0x030c53 `cmpq %r14,%rdi` is the standard clang "assign to
   * unique_ptr-like member" idiom: it protects against the pathological
   * case where the newly-allocated pointer happens to equal the
   * existing one (impossible right after `new`, but defensively
   * checked). In practice this ctor always takes the `%r14 != %rdi &&
   * %rdi == null` path, so the vcall at @0x030c60 is skipped and
   * `this->child` is set from null to the freshly-constructed
   * HgcColorBars.
   *
   * The 0x030c85+ region is a clang exception-unwind block that runs
   * only if `HgcColorBars::HgcColorBars()` throws (@0x030c85 sets up
   * `___clang_call_terminate`, @0x030cab calls HGObject::operator delete
   * on the raw block, @0x030cca chains through to HGNode::~HGNode()).
   * Since the frontier stub throws unconditionally, the TS transcription
   * emulates this by letting the thrown Error propagate; the base
   * HGNode has already been constructed by `super()` and will be GC'd.
   */
  constructor() {
    // @0x030c1d: base ctor.
    super();
    // @0x030c2c: this->child = nullptr.
    this.child = null;
    // @0x030c37..@0x030c47: allocate 0x1a0 bytes via HGObject::operator new,
    // then in-place construct HgcColorBars. NOTE: HGObject::operator new
    // is the Helium slab allocator (see HGObject.ts); in JS the `new`
    // expression already allocates, so the `operator new` step is folded
    // into the `new HgcColorBars_stub()` below. This throws in this
    // port (frontier), which is the correct anti-shortcut behaviour.
    const newChild = new HgcColorBars_stub();
    // Unreachable in this port because HgcColorBars_stub() throws. The
    // real FCP would continue as follows:
    // @0x030c4c..@0x030c6a: unique-ptr-style replace-with-release. Since
    // `this->child` was just set to null at @0x030c2c, the current
    // pointer is null so no release happens; we jump straight to
    // storing the new pointer.
    // @0x030c63: this->child = newChild.
    this.child = newChild;
  }

  /**
   * HGColorBars::~HGColorBars() — D0 (deleting) @0x030d80.
   * Mangled: __ZN11HGColorBarsD0Ev / D1Ev @0x030d40 / D2Ev @0x030d40.
   *
   * Body @0x030d80..0x030db6:
   *   0x030d89: leaq  0x9d4818(%rip),%rax        # HGColorBars vtable installed-ptr @0xa055a8
   *   0x030d90: movq  %rax,(%rdi)                # this->vtable = 0xa055a8 (restore this class's vtable
   *                                              #   before running our body — standard C++ ABI)
   *   0x030d93: movq  0x198(%rdi),%rdi           # child = this->child
   *   0x030d9a: testq %rdi,%rdi
   *   0x030d9d: je    0x030da5                   # if (child) ...
   *   0x030d9f: movq  (%rdi),%rax
   *   0x030da2: callq *0x18(%rax)                #   child->vtable[*0x18]()  (HgcColorBars D0)
   *   0x030da5: movq  %rbx,%rdi
   *   0x030da8: callq HGNode::~HGNode()          # base dtor
   *   0x030dad: movq  %rbx,%rdi                  # tail-call: ...
   *   0x030db6: jmp   HGObject::operator delete  # ... deallocate the raw block
   *
   * D1/D2 (non-deleting) at @0x030d40 share the same body but WITHOUT
   * the final `jmp HGObject::operator delete` — they just restore
   * vtable, delete-via-vtable the child, and tail-call HGNode::~HGNode().
   *
   * In TS with GC we implement one `dispose()` method that runs the
   * shared body; the "deleting" variant's memory-free step is a no-op.
   */
  dispose(): void {
    // @0x030d89..@0x030d90: vtable restore is a machine-level detail
    // (needed so that any virtual call FROM inside this dtor dispatches
    // to HGColorBars', not a subclass's, override). It has no TS
    // observable effect.
    // @0x030d93..@0x030da2: if (child) child->vtable[*0x18]().
    if (this.child !== null) {
      this.child.vtable_0x18_release_or_dtor();
      // Unreachable — stub throws. Real FCP would then continue.
    }
    // @0x030da8: HGNode::~HGNode() — base dtor. In TS we have no
    // explicit base-dtor call; the parent's cleanup (if any) is by
    // convention this class's responsibility to invoke. HGNode has
    // its own release path for its own owned refs — we call the
    // published entry point on `this` cast to HGObject-ish, but the
    // TS `HGNode` class doesn't expose a base dtor as a method; the
    // faithful transcription just clears our added field.
    this.child = null;
    // @0x030db6: HGObject::operator delete — in JS the block is freed
    // by GC when no references remain; nothing to do here.
  }

  /**
   * HGColorBars::SetParameter(int, float, float, float, float) —
   *   @0x030dd0. Mangled: __ZN11HGColorBars12SetParameterEiffff.
   *
   * This method is ALSO the vtable *0x60 override for HGColorBars
   * (resolve.py: HGColorBars vtable *0x60 -> 0x30dd0).
   *
   * Body @0x030dd0..@0x030de3:
   *   0x030dd4: movq  0x198(%rdi),%rdi           # rdi = this->child
   *   0x030ddb: movq  (%rdi),%rax                # rax = child->vtable
   *   0x030dde: movq  0x60(%rax),%rax            # rax = vtable[*0x60]
   *   0x030de2: popq  %rbp
   *   0x030de3: jmpq  *%rax                      # tail-call — args (int, f, f, f, f) forwarded
   *                                              # verbatim because the register file has been
   *                                              # left untouched apart from %rdi.
   *
   * So this is a pure delegate: forward the same (int, f×4) tuple to
   * `child->vtable[*0x60]` which per resolve.py is
   * `HgcColorBars::SetParameter(int, float, float, float, float)` at
   * @Helium 0x31f7f0.
   *
   * Note @0x030de3 is a `jmpq` (tail call), so the ABI-visible return
   * value of HGColorBars::SetParameter IS the return value of the
   * child's SetParameter — void here in both signatures.
   */
  SetParameter(i: number, a: number, b: number, c: number, d: number): void {
    // @0x030dd4: child = this->child.
    const child = this.child;
    if (child === null) {
      // The x86 code doesn't null-check %rdi before dereferencing at
      // @0x030ddb; the child is always non-null on a live HGColorBars
      // (set unconditionally in the ctor at @0x030c63). Preserving that
      // invariant strictly:
      throw new Error(
        "HGColorBars::SetParameter @0x030dd0 — this->child is null (invariant violation; ctor @0x030c63 should have set it)",
      );
    }
    // @0x030ddb..@0x030de3: child->vtable[*0x60](i, a, b, c, d). For
    // HgcColorBars, *0x60 is HgcColorBars::SetParameter @Helium 0x31f7f0
    // (throw-stubbed above).
    // Args are single-precision (`f` in the mangling), so wrap in
    // Math.fround to match the `movss`/`cvtss2sd` widths the callee
    // will see.
    child.SetParameter(
      i | 0,
      Math.fround(a),
      Math.fround(b),
      Math.fround(c),
      Math.fround(d),
    );
  }

  /**
   * HGColorBars::GetOutput(HGRenderer*) — @0x030df0. Mangled:
   * __ZN11HGColorBars9GetOutputEP10HGRenderer.
   *
   * Body @0x030df0..0x030dfc:
   *   0x030df4: movq  0x198(%rdi),%rax           # rax = this->child
   *   0x030dfb: popq  %rbp
   *   0x030dfc: retq                             # return this->child
   *
   * i.e. just return the child pointer. The HGRenderer* argument is
   * IGNORED (%rsi is never touched). That's not a compiler bug — the
   * HGRenderer* arg is part of the standard HGNode "GetOutput"
   * signature (some subclasses need it to schedule tiles); for a
   * pure-facade like HGColorBars, the child pointer is the output and
   * the renderer is unused.
   *
   * Return type is `HGNode*` in the C++ header (HgcColorBars derives
   * from HGNode); in TS we expose the field directly.
   */
  GetOutput(_renderer: unknown): HGNode | null {
    // @0x030df4/@0x030dfc: return this->child.
    return this.child;
  }
}
