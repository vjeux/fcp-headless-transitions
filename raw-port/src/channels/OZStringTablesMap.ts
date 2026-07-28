// OZStringTablesMap.ts — FCP ProChannel framework class.
// Transcribed from the x86_64 disassembly of ProChannel in
// /Applications/Final Cut Pro.app/Contents/Frameworks/ProChannel.framework/
// Versions/A/ProChannel (see raw-port/re/disasm/ProChannel.OZStringTablesMap.*.s).
//
// Symbols (nm -arch x86_64 | c++filt):
//   0x000636b8 T __ZN17OZStringTablesMap11getInstanceEv  OZStringTablesMap::getInstance()  (static)
//   0x00063cc2 T __ZN17OZStringTablesMapC2Ev             OZStringTablesMap::OZStringTablesMap()  (C2)
//   0x00063d14 T __ZN17OZStringTablesMapD1Ev             OZStringTablesMap::~OZStringTablesMap() (D1)
//   0x00063d50 T __ZN17OZStringTablesMapD0Ev             OZStringTablesMap::~OZStringTablesMap() (D0 deleting)
//
// Data globals (nm x86_64):
//   0x000ec590 __ZN17OZStringTablesMap17_sStringTablesMapE   static pointer instance holder
//   0x000d9d78 __ZTV17OZStringTablesMap                      vtable
//
// PROVENANCE / DECODE:
//   raw-port/re/disasm/ProChannel.OZStringTablesMap.getInstance.s
//   raw-port/re/disasm/ProChannel.OZStringTablesMap.OZStringTablesMap.s  (C2 body)
//   raw-port/re/disasm/ProChannel.OZStringTablesMap.~OZStringTablesMap.s (D0 body; D1 read via
//                     `xcrun llvm-objdump --arch=x86_64 --macho -d`)
//   Referenced externs:
//     __ZN11PCSingletonC2Ej                    PCSingleton::PCSingleton(unsigned int)
//     __ZN11PCSingletonD2Ev                    PCSingleton::~PCSingleton() (base D2)
//     __ZN13PCSharedMutexC1Ev                  PCSharedMutex::PCSharedMutex()   (frontier — stub)
//     __ZN13PCSharedMutexD2Ev                  PCSharedMutex::~PCSharedMutex()  (frontier — stub)
//     __ZNSt3__16__tree...destroyE...          std::__tree<PCString, vector<PCString>>::destroy
//                                              (map<PCString, vector<PCString>> node freer)
//     __Znwm                                   operator new(unsigned long)
//     __ZdlPv                                  operator delete(void*)
//     __Unwind_Resume                          Itanium C++ ABI unwind resumption
//
// ── CLASS ROLE ──────────────────────────────────────────────────────────
// OZStringTablesMap is a ProChannel singleton (registered via PCSingleton
// with tag 0x32 == 50) that owns a shared-mutex-guarded
// std::map<PCString, std::vector<PCString>> — a table of named string
// tables, used by the Ozone parameter-plumbing to look up localised /
// enumerated string sets by key.  There is no per-instance public API
// decoded here (getters would live at other addresses); this port
// covers the lifecycle only:
//   1. Static factory `getInstance()` @0x636b8 — classic Meyers-style
//      "lazily allocate and stash into a static pointer" singleton.
//   2. Base ctor C2 @0x63cc2 — chains PCSingleton(0x32), installs
//      vtable, constructs the embedded PCSharedMutex, zeros the
//      __tree header at +0x70.
//   3. Base dtor D1 @0x63d14 — restores vtbl, destroys the map's
//      __tree node graph, destroys the PCSharedMutex, tail-calls
//      PCSingleton::~PCSingleton().
//   4. Deleting dtor D0 @0x63d50 — same as D1, then `operator delete(this)`.
//
// ── STRUCT LAYOUT (recovered from C2 @0x63cc2 and D0 @0x63d50) ──────────
//   +0x00  vptr        : *const void                     (installed to &VT+0x10)
//                        vtable slot; PCSingleton::C2 installed its own
//                        first, then C2 overwrites at 0x63ce1 with
//                        &__ZTV17OZStringTablesMap + 0x10.
//   +0x08  PCSingleton subobject   0x60 bytes            (C2 delegate)
//                        Constructed via PCSingleton::C2 called at 0x63cd1
//                        with %rdi = this (offset 0) and %esi = 0x32 (tag=50).
//                        Note: PCSingleton is the *base class* here, so its
//                        subobject overlaps starting at offset 0.  The
//                        PCSharedMutex is however placed at +0x08 (see
//                        0x63ce4 `leaq 0x8(%rbx), %rdi`), so the effective
//                        layout is:
//                          +0x00  vptr (from PCSingleton, then overridden)
//                          +0x08  PCSharedMutex             ~0x68 bytes
//                          +0x70  __tree begin/sentinel ptr
//                          +0x78  __tree __pair1 (parent link) — zeroed
//                          +0x80  __tree size (size_t)          — zeroed
//                        Total instance size: 0x88 bytes (getInstance
//                        allocates via `operator new(0x88)` @0x636cb).
//
// The vtable install adjustment (`addq $0x10, %rax` at 0x63cdd) is
// standard Itanium ABI — the installed pointer is the address of the
// first virtual-function slot, past RTTI (offset-to-top + typeinfo).
//
// ── FRONTIER CALLEES ────────────────────────────────────────────────────
// PCSharedMutex and the std::__tree<PCString, vector<PCString>> node
// destroyer are undecoded frontier classes.  We model them as
// throwing stubs so any actual runtime use is a hard, cited failure
// (decode-before-implement).  The lifecycle wiring itself is exact.

import { PCSingleton } from "../infra/PCSingleton.js";
import { PCString } from "../infra/PCString.js";

// ── PCSharedMutex frontier stub ─────────────────────────────────────────
//
// PCSharedMutex is a POD-ish reader/writer mutex used across
// ProChannel/ProCore.  Not yet transcribed.  Referenced here from:
//   0x63ce8   callq __ZN13PCSharedMutexC1Ev   (ctor)  — Helium/ProChannel stub
//   0x63d78   callq __ZN13PCSharedMutexD2Ev   (dtor)  — direct call (not a stub)
//
// The C++ constructor initialises an opaque byte block starting at
// this+0x08 whose size we cannot recover without decoding the ctor.
// The class layout above reserves +0x08..+0x70 (0x68 bytes) for this
// subobject — that upper bound is derived from the fact that the
// next observed store (0x63ced `leaq 0x78(%rbx), %rax`) uses +0x70
// as the __tree begin slot, and PCSingleton subobject is at offset 0.

/** Opaque PCSharedMutex subobject — frontier. */
export interface PCSharedMutexOpaque {
  readonly __pcSharedMutex: "opaque — PCSharedMutex not yet transcribed";
}

function PCSharedMutex_ctor(_this: object): PCSharedMutexOpaque {
  // __ZN13PCSharedMutexC1Ev — referenced from OZStringTablesMap C2 @0x63ce8.
  throw new Error(
    "PCSharedMutex::PCSharedMutex() not yet transcribed " +
    "(referenced from OZStringTablesMap C2 @ProChannel 0x63ce8)"
  );
}

function PCSharedMutex_dtor(_m: PCSharedMutexOpaque): void {
  // __ZN13PCSharedMutexD2Ev — referenced from OZStringTablesMap D1 @0x63d3c and D0 @0x63d78.
  throw new Error(
    "PCSharedMutex::~PCSharedMutex() not yet transcribed " +
    "(referenced from OZStringTablesMap D1 @ProChannel 0x63d3c, D0 @0x63d78)"
  );
}

// ── std::__tree<PCString, vector<PCString>> node destroyer stub ─────────
//
// The mangled symbol is:
//   __ZNSt3__16__treeINS_12__value_typeI8PCStringNS_6vectorIS2_...9EEE7destroyEP...
// i.e. std::__1::__tree<...>::destroy(__tree_node<...>*).  A recursive
// free of the map's internal red-black tree.  Not yet transcribed —
// tree-node allocation isn't reachable from the ctor path (empty map
// after C2), so this only fires when a caller has populated the map
// and then dropped the singleton, which is not on the currently
// decoded call graph.

function __tree_PCString_vecPCString_destroy(_root: object | null): void {
  // Called from D1 @0x63d33 and D0 @0x63d6f with %rsi = this[+0x78] (the
  // tree's __pair1 root pointer stored at +0x78 in our layout).
  throw new Error(
    "std::__1::__tree<PCString, std::__1::vector<PCString>>::destroy " +
    "not yet transcribed " +
    "(referenced from OZStringTablesMap D1 @ProChannel 0x63d33, D0 @0x63d6f)"
  );
}

// ── OZStringTablesMap class ─────────────────────────────────────────────

/**
 * OZStringTablesMap — a ProChannel singleton owning a shared-mutex-
 * guarded map<PCString, vector<PCString>>.
 *
 * Extends PCSingleton (base class at offset 0 in the C++ layout).
 * Constructed with singleton tag `0x32` (== 50, see C2 @0x63cd1).
 */
export class OZStringTablesMap extends PCSingleton {
  /**
   * +0x08  PCSharedMutex subobject.  Guards `map` for reader/writer access.
   *  Provenance: C2 @0x63ce4 `leaq 0x8(%rbx), %rdi ; callq PCSharedMutex::C1`.
   */
  public readonly mutex: PCSharedMutexOpaque;

  /**
   * +0x70..+0x88  std::map<PCString, std::vector<PCString>> as std::__tree.
   *  Provenance: C2 @0x63ced..0x63cf8 zeros the __tree header:
   *    0x63ced  leaq  0x78(%rbx), %rax   ; sentinel node address
   *    0x63cf1  xorps %xmm0, %xmm0
   *    0x63cf4  movups %xmm0, 0x78(%rbx) ; zero +0x78, +0x80  (parent, size)
   *    0x63cf8  movq  %rax, 0x70(%rbx)   ; +0x70 = &sentinel  (begin==end when empty)
   *  In JS we model the map with the standard Map, keyed by PCString
   *  content — the __tree_node graph is only observable to native
   *  destroyers (whose stub sits above).
   */
  public readonly map: Map<string, PCString[]>;

  /**
   * OZStringTablesMap::OZStringTablesMap()  —  ProChannel @0x63cc2 (C2 base ctor).
   *
   * Faithful mirror of raw-port/re/disasm/
   * ProChannel.OZStringTablesMap.OZStringTablesMap.s:
   *
   *   0x63cc2  pushq %rbp
   *   0x63cc3  movq  %rsp, %rbp
   *   0x63cc6  pushq %r14
   *   0x63cc8  pushq %rbx
   *   0x63cc9  movq  %rdi, %rbx                    ; %rbx = this
   *   0x63ccc  movl  $0x32, %esi                   ; tag argument = 50
   *   0x63cd1  callq __ZN11PCSingletonC2Ej         ; PCSingleton::PCSingleton(this, 0x32)
   *   0x63cd6  leaq  __ZTV17OZStringTablesMap(%rip), %rax  ; vtable base
   *   0x63cdd  addq  $0x10, %rax                   ; skip RTTI slots -> first vfunc-slot
   *   0x63ce1  movq  %rax, (%rbx)                  ; this->vptr = &VT + 0x10
   *                                                ;   (overwrites PCSingleton's install)
   *   0x63ce4  leaq  0x8(%rbx), %rdi               ; &this->mutex (at +0x08)
   *   0x63ce8  callq __ZN13PCSharedMutexC1Ev       ; PCSharedMutex::PCSharedMutex(&mutex)
   *   0x63ced  leaq  0x78(%rbx), %rax              ; &(__tree.__pair1) sentinel
   *   0x63cf1  xorps %xmm0, %xmm0
   *   0x63cf4  movups %xmm0, 0x78(%rbx)            ; parent=nullptr, size=0
   *   0x63cf8  movq  %rax, 0x70(%rbx)              ; __tree.__begin = &sentinel
   *   0x63cfc  popq  %rbx ; popq %r14 ; popq %rbp ; retq
   *
   * The 0x63d01..0x63d10 tail is the Itanium C++ ABI unwind cleanup
   * (called if PCSharedMutex::C1 throws): it undoes the PCSingleton
   * registration via PCSingleton::~PCSingleton() (D2) then re-raises.
   * JS throws propagate naturally, so we mirror this by making the
   * ctor cleanup rely on the language's own unwind — no explicit
   * try/catch is needed because the only frontier here (PCSharedMutex
   * ctor) is currently a hard throwing stub.
   */
  public constructor() {
    // 0x63cd1 — chain into PCSingleton with tag 50 (0x32).  This runs
    //   the singleton-registration and sets a vtbl we will overwrite next.
    super(0x32);

    // 0x63cdd/0x63ce1 — vtable install (no observable effect in JS).
    //   Left as a comment for provenance; the ABI-visible act is that
    //   this->vptr is now &__ZTV17OZStringTablesMap + 0x10 @ProChannel 0xd9d88.

    // 0x63ce4/0x63ce8 — construct embedded PCSharedMutex at +0x08.
    //   Frontier: PCSharedMutex_ctor will throw @ProChannel 0x63ce8 until PCSharedMutex is transcribed.
    this.mutex = PCSharedMutex_ctor(this);

    // 0x63ced..0x63cf8 — zero-init the __tree header (empty map).
    //   In JS we just start with an empty Map.
    this.map = new Map<string, PCString[]>();
  }

  /**
   * OZStringTablesMap::~OZStringTablesMap()  —  ProChannel @0x63d14 (D1 complete dtor)
   * and @0x63d50 (D0 deleting dtor).  Both share the same body except D0 tail-calls
   * `operator delete(this)` after the base dtor chain finishes.
   *
   * D0 body (raw-port/re/disasm/ProChannel.OZStringTablesMap.~OZStringTablesMap.s):
   *
   *   0x63d50  pushq %rbp
   *   0x63d51  movq  %rsp, %rbp
   *   0x63d54  pushq %rbx
   *   0x63d55  pushq %rax
   *   0x63d56  movq  %rdi, %rbx                    ; %rbx = this
   *   0x63d59  leaq  __ZTV17OZStringTablesMap(%rip), %rax
   *   0x63d60  addq  $0x10, %rax
   *   0x63d64  movq  %rax, (%rdi)                  ; restore vptr (Itanium ABI)
   *   0x63d67  addq  $0x70, %rdi                   ; %rdi = &this->__tree_header
   *   0x63d6b  movq  0x78(%rbx), %rsi              ; %rsi = __tree.__pair1 (root)
   *   0x63d6f  callq __tree<PCString,vec<PCString>>::destroy   ; free node graph
   *   0x63d74  leaq  0x8(%rbx), %rdi               ; &this->mutex
   *   0x63d78  callq __ZN13PCSharedMutexD2Ev        ; ~PCSharedMutex
   *   0x63d7d  movq  %rbx, %rdi
   *   0x63d80  callq __ZN11PCSingletonD2Ev          ; ~PCSingleton (unregisters)
   *   0x63d85  movq  %rbx, %rdi
   *   0x63d88  addq  $0x8, %rsp
   *   0x63d8c  popq  %rbx ; popq %rbp
   *   0x63d8e  jmp   __ZdlPv                        ; operator delete(this)  (D0 only)
   *
   * D1 @0x63d14 is identical up to the final `jmp __ZdlPv` — instead
   * D1 tail-calls `PCSingleton::~PCSingleton` @0x63d4a and returns
   * (the caller does the memory free, if any).
   *
   * We expose this as a single `.destroy()` method (JS has no dtors);
   * callers that would have gone through D0 must additionally drop
   * their reference to `this` (mirroring `operator delete`).  The
   * `delete` variant is thus just a convention on the caller side —
   * both variants execute the same TS body.
   */
  public override destroy(): void {
    // 0x63d64 — vptr restore is a no-op in JS.

    // 0x63d67..0x63d6f — free the __tree's node graph.  In JS the Map
    //   has no explicit node pool, but we call the frontier stub for
    //   provenance so that if the destroyer is ever wired up its call
    //   site is visible.  When map is empty (the always-post-ctor state
    //   until setters are ported) the native code would skip destruction
    //   of any real nodes — the root pointer is nullptr — so we replicate
    //   that short-circuit here to keep destroy() usable without the
    //   frontier being present.
    //
    //   Provenance: 0x63d6b `movq 0x78(%rbx),%rsi` reads +0x78, which
    //   C2 @0x63cf4 zeroed.  Empty map ⇒ nullptr root ⇒ __tree::destroy
    //   is a no-op (its first check is `if (root == nullptr) return`).
    if (this.map.size !== 0) {
      // Non-empty case genuinely needs the destroyer to walk nodes.
      // Cited @0x63d6f — throws until decoded.
      __tree_PCString_vecPCString_destroy(this.map as unknown as object);
    }
    this.map.clear();

    // 0x63d74/0x63d78 — destroy embedded PCSharedMutex.
    //   Frontier: PCSharedMutex_dtor will throw @ProChannel 0x63d78 until decoded.
    PCSharedMutex_dtor(this.mutex);

    // 0x63d7d/0x63d80 — chain into PCSingleton's base dtor.
    super.destroy();

    // 0x63d8e — `operator delete(this)` is the D0 tail; expressed here
    //   as "the caller is expected to drop its reference".  Modelling
    //   it as an explicit action would need a heap abstraction we do
    //   not have.
  }

  // ── Static singleton pointer ─────────────────────────────────────────
  //
  // __ZN17OZStringTablesMap17_sStringTablesMapE @ProChannel 0x0ec590.
  // Written once by `getInstance()` @0x636e0 on first call; read every
  // call at @0x636bf.  Modelled as a private static field.
  private static _sStringTablesMap: OZStringTablesMap | null = null;

  /**
   * OZStringTablesMap::getInstance()  —  ProChannel @0x636b8 (static).
   *
   * Faithful mirror of raw-port/re/disasm/
   * ProChannel.OZStringTablesMap.getInstance.s:
   *
   *   0x636b8  pushq %rbp
   *   0x636b9  movq  %rsp, %rbp
   *   0x636bc  pushq %r14
   *   0x636be  pushq %rbx
   *   0x636bf  movq  __ZN17OZStringTablesMap17_sStringTablesMapE(%rip), %rbx
   *   0x636c6  testq %rbx, %rbx
   *   0x636c9  jne   0x636e7                          ; if already set, skip alloc
   *   0x636cb  movl  $0x88, %edi                      ; sizeof(OZStringTablesMap) = 0x88
   *   0x636d0  callq __Znwm                            ; operator new(0x88)
   *   0x636d5  movq  %rax, %rbx
   *   0x636d8  movq  %rax, %rdi
   *   0x636db  callq __ZN17OZStringTablesMapC2Ev      ; placement-ctor on the new block
   *   0x636e0  movq  %rbx, __ZN17OZStringTablesMap17_sStringTablesMapE(%rip)
   *   0x636e7  movq  %rbx, %rax                        ; return pointer
   *   0x636ea  popq  %rbx ; popq %r14 ; popq %rbp ; retq
   *
   * The 0x636ef..0x636fd tail is Itanium unwind cleanup: if the C2
   * call throws, `operator delete(pointer_from_new)` is invoked and
   * the exception is resumed.  In JS that path is expressed by the
   * ctor throwing before `_sStringTablesMap` is assigned — the
   * partially-constructed instance is unreachable and GC'd.
   *
   * NOTE: unlike a Meyers-style local-static singleton, this pointer
   * is NOT thread-safe by itself (there is no ABI guard variable
   * around it — the ctor's PCSingleton subobject provides mutual
   * exclusion at registration time via PCSingleton's global lock, but
   * the null-check + store here is not atomic).  ProChannel relies on
   * getInstance() being first called during single-threaded
   * initialisation.
   */
  public static getInstance(): OZStringTablesMap {
    // 0x636bf/0x636c6 — cached-pointer null check.
    if (OZStringTablesMap._sStringTablesMap !== null) {
      // 0x636c9 jne — early return.
      return OZStringTablesMap._sStringTablesMap;
    }

    // 0x636cb/0x636d0 — operator new(0x88) allocates raw 0x88 bytes.
    //   0x636db — C2 runs on the fresh block.
    // We combine both into the JS `new` expression, which by
    // construction (a) allocates a fresh object and (b) runs the ctor.
    const inst = new OZStringTablesMap();

    // 0x636e0 — publish to the static slot.
    OZStringTablesMap._sStringTablesMap = inst;

    // 0x636e7 — return pointer.
    return inst;
  }
}
