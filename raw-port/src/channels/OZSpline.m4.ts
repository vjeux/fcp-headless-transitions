// OZSpline.m4.ts — OZSpline methods, chunk 4 (indices 80..99 of 137).
// ProChannel.framework/Versions/A/ProChannel  (x86_64 slice; VA==offset since __TEXT@0).
//
// This chunk covers the vertex-mutation surface (setAllVerticesValues, setVertex, moveVertex,
// scaleTangents{AroundPoint,Before/AfterInsertion,BeforeDeletion}, deleteVertex/deleteVertices/
// deleteAllVertices, addVertex(NoTangents)/appendVertex(esNoTangents)/setVertexNoTangents,
// setVertexFlag, deriveVertex, getPoint{Input,Output}Tangents, derivePoint).
//
// Follow-up chunk after OZSpline.m0.ts (which decoded ctor/dtor + the object layout). All offset
// references below reuse the layout recovered there:
//   +0x08  PCSpinLock                                            +0x28..+0x38  validVertices
//   +0x10..+0x20  allVertices (owned)                             +0x90        dirty
//   +0xa0  externalLockManager (nullable; ->+0x30 = external lock override; else internal lock)
//   +0xa8  OZSplineState* sp   (sp->+0x02 is a "wantsTangentBookkeeping" bool consulted by
//                                 derivePoint @0x390fa)
//
// Faithful per raw-port/army/PORTING_SPEC.md. Every ported fn cites its @0xADDR; every method
// whose body isn't yet decoded is a throw-stub citing the same @0xADDR (so frontier.py sees the
// gap). No approximations, no invented constants.

import type { OZVertex } from "./OZSpline.m0.js";
import { OZSpline } from "./OZSpline.m0.js";

// ── Externals surfaced by this chunk (as throw-stubs, per anti-shortcut rule) ─────────────────────

/** OZSpline::refreshValidVerticesList() @ProChannel 0x2d0ec — invoked at the end of
 *  deleteAllVertices (@0x37b2a) and by any mutator that changes membership. Decoded body pending
 *  (see OZSpline.m0.ts throw-stub of the same method). */
function refreshValidVerticesList(_self: OZSpline): void {
  throw new Error("OZSpline::refreshValidVerticesList @ProChannel 0x2d0ec not yet transcribed");
}

/** OZSpline::derivePoint(CMTime const&, double*, double*, double*, double*, CMTime const&, bool)
 *  @ProChannel 0x390a8 — the big point-derivation routine (2500 bytes). Called by
 *  deriveVertex @0x39002 (via vtable[0x130]) and getPointInputTangents @0x39050 / getPointOutput‐
 *  Tangents @0x39a6c. Body not yet transcribed; separate chunk. */
function derivePointStub(): never {
  throw new Error("OZSpline::derivePoint @ProChannel 0x390a8 not yet transcribed");
}

// ── Class extension: chunk-4 methods added to OZSpline ────────────────────────────────────────────
//
// One-class-per-file is respected: this file EXTENDS OZSpline via TypeScript's declaration-merging
// so every method still belongs to the OZSpline class (matching the FCP class boundary). The m0
// file defines the class; this file adds member methods to its prototype.

declare module "./OZSpline.m0.js" {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface OZSpline {
    /** OZSpline::setAllVerticesValues(double, CMTime const&) @0x35048 */
    setAllVerticesValues(v: number, tCtx: unknown): void;
    /** OZSpline::setVertex(void*, CMTime const&, double, CMTime const&) @0x350cc */
    setVertex(handle: OZVertex, tU: unknown, value: number, tCtx: unknown): void;
    /** OZSpline::moveVertex(void*, CMTime const&, CMTime const&, bool, bool, bool) @0x355d8 */
    moveVertex(handle: OZVertex, newU: unknown, tCtx: unknown, b0: boolean, b1: boolean, b2: boolean): void;
    /** OZSpline::scaleTangentsAroundPoint(CMTime const&, CMTime const&, CMTime const&) @0x35cca */
    scaleTangentsAroundPoint(uPivot: unknown, deltaU: unknown, tCtx: unknown): void;
    /** OZSpline::scaleTangentsAfterInsertion(void*, CMTime const&, CMTime const&) @0x36526 */
    scaleTangentsAfterInsertion(newVertex: OZVertex, insertU: unknown, tCtx: unknown): void;
    /** OZSpline::deleteVertex(CMTime const&, bool, CMTime const&) @0x37170 */
    deleteVertexAtTime(u: unknown, refreshList: boolean, tCtx: unknown): void;
    /** OZSpline::scaleTangentsBeforeDeletion(void*, CMTime const&) @0x37354 */
    scaleTangentsBeforeDeletion(victim: OZVertex, tCtx: unknown): void;
    /** OZSpline::deleteVertex(void*, bool, CMTime const&) @0x377a6 */
    deleteVertexByHandle(handle: OZVertex, refreshList: boolean, tCtx: unknown): boolean;
    /** OZSpline::deleteVertices(CMTime const&, CMTime const&) @0x378c4 */
    deleteVerticesInRange(uLo: unknown, uHi: unknown): void;
    /** OZSpline::deleteAllVertices() @0x37a94 */
    deleteAllVertices(): boolean;
    /** OZSpline::addVertex(CMTime const&, double, CMTime const&, bool) @0x37b64 */
    addVertex(u: unknown, value: number, tCtx: unknown, refreshList: boolean): OZVertex | null;
    /** OZSpline::setVertexFlag(void*, unsigned int) @0x38756 */
    setVertexFlag(handle: OZVertex | null, flag: number): boolean;
    /** OZSpline::addVertexNoTangents(CMTime const&, double, CMTime const&, bool) @0x38780 */
    addVertexNoTangents(u: unknown, value: number, tCtx: unknown, refreshList: boolean): OZVertex | null;
    /** OZSpline::appendVertexNoTangents(CMTime const&, double, CMTime const&) @0x38b2a */
    appendVertexNoTangents(u: unknown, value: number, tCtx: unknown): OZVertex | null;
    /** OZSpline::appendVertexesNoTangents(unsigned int, CMTime*, double*, CMTime const&) @0x38c2e */
    appendVertexesNoTangents(count: number, us: unknown, vs: unknown, tCtx: unknown): void;
    /** OZSpline::setVertexNoTangents(void*, CMTime const&, double, CMTime const&) @0x38db2 */
    setVertexNoTangents(handle: OZVertex, u: unknown, value: number, tCtx: unknown): void;
    /** OZSpline::deriveVertex(void*, CMTime const&) @0x39002 */
    deriveVertex(handle: OZVertex, tCtx: unknown): boolean;
    /** OZSpline::getPointInputTangents(CMTime const&, double*, double*, CMTime const&) @0x39018 */
    getPointInputTangents(u: unknown, tCtx: unknown): { dxdu: number; dydu: number };
    /** OZSpline::getPointOutputTangents(CMTime const&, double*, double*, CMTime const&) @0x39a6c */
    getPointOutputTangents(u: unknown, tCtx: unknown): { dxdu: number; dydu: number };
  }
}

// Helper: resolve the lock the way every mutator does — this is verbatim the 6-instruction
// sequence at the start of setAllVerticesValues (@0x3505d..@0x35076), deleteAllVertices
// (@0x37aa1..@0x37aba), setVertex (@0x350ee..@0x35107), etc. Every occurrence is textually
// identical, so it's transcribed once here and cited from each caller.
function resolveLock(self: OZSpline): { lock(): void; unlock(): void } {
  // The C++ read chain: rax = self->0xa0; if rax && *(rax+0x30) is non-null, use *(rax+0x30);
  //                    else use &self->0x8 (the internal PCSpinLock).
  const anyself = self as unknown as {
    _externalLockMgr: { lockPtrAt0x30: { lock(): void; unlock(): void } | null } | null;
    _spinLock: { lock(): void; unlock(): void };
  };
  const mgr = anyself._externalLockMgr;
  if (mgr && mgr.lockPtrAt0x30) return mgr.lockPtrAt0x30;
  return anyself._spinLock;
}

// ── Fully-transcribed methods ─────────────────────────────────────────────────────────────────────

/**
 * OZSpline::setAllVerticesValues(double v, CMTime const& t) @ProChannel 0x35048. Sequence:
 *   1) resolve lock (same 6-instr chain, @0x3505d..@0x35076); lock (@0x35076).
 *   2) r15 = self->0x28 (validVertices.begin). While r15 != self->0x30 (validVertices.end):
 *        rdi = *r15;               // vertex ptr
 *        rax = *rdi;               // vertex vtable
 *        (*(rax+0x20))(vertex, r14=t as CMTime*, xmm0=v as double);   // vtable[0x20](t,v)
 *        r15 += 8;
 *      (@0x3507b..@0x3509e).
 *   3) resolve lock again (@0x350a0..@0x350bc). tail-call PCSpinLock::unlock (@0x350c6).
 */
OZSpline.prototype.setAllVerticesValues = function (v: number, tCtx: unknown): void {
  const lock = resolveLock(this);
  lock.lock();
  const vv = (this as unknown as { _validVertices: OZVertex[] })._validVertices;
  for (let i = 0; i < vv.length; i++) {
    // vertex->vtable[0x20](t, v) — the "setValueAtTime" virtual on OZVertex-family types.
    (vv[i] as unknown as { __vtable_0x20__(t: unknown, v: number): void }).__vtable_0x20__(tCtx, v);
  }
  lock.unlock();
};

/**
 * OZSpline::deleteAllVertices() @ProChannel 0x37a94. Returns `bool` = (the vector had elements
 * before we cleared it). Sequence:
 *   1) resolve lock (@0x37aa1..@0x37aba); lock (@0x37aba).
 *   2) r14 = begin = self->0x10; r15 = end = self->0x18.
 *   3) while (end != begin) { walk from the back deleting each: (*end[-1]->vtable[1])();
 *      *end[-1] = null; end--; self->0x18 = end. } (@0x37ac7..@0x37b02)
 *   4) After the loop, self->0x28 = rax (=r14=begin), self->0x30 = rcx (=end=begin) → the
 *      validVertices vector collapses to empty (@0x37b04..0x37b11).
 *      Also writes uint16 0x100 to self->0x90 (@0x37b04): +0x90 = 0 (byte low), +0x91 = 1
 *      (byte high) — i.e. dirty=false, validListInit=true.
 *   5) zero self->0x78..self->0x88 (@0x37b15..0x37b25) — the fourth vector.
 *   6) call self->refreshValidVerticesList() (@0x37b2a).
 *   7) resolve lock again + unlock (@0x37b2f..0x37b51).
 *   8) return `bl = (begin != end)`  — i.e. "did we delete anything?" (@0x37b4b..0x37b56).
 *
 * NOTE the ordering: the "did we delete anything" test happens AFTER the walk mutated end. So
 * the test compares the ORIGINAL end (still in r15) to the ORIGINAL begin (still in r14) — i.e.
 * "was the vector non-empty at entry".
 */
OZSpline.prototype.deleteAllVertices = function (): boolean {
  const lock = resolveLock(this);
  lock.lock();
  const anyself = this as unknown as {
    _allVertices: OZVertex[];
    _validVertices: OZVertex[];
    _dirty: boolean;
    _validListInit: boolean;
    _buf78_begin: number; _buf78_end: number; _buf78_cap: number;
  };
  const hadAny = anyself._allVertices.length > 0;
  // Step 3 — walk back-to-front, per-element vtable[1] destroy then pop.
  while (anyself._allVertices.length > 0) {
    const v = anyself._allVertices[anyself._allVertices.length - 1];
    if (v != null) v.__delete__();
    anyself._allVertices.pop();
  }
  // Step 4 — validVertices collapses; dirty=false, validListInit=true.
  anyself._validVertices.length = 0;
  anyself._dirty = false;
  anyself._validListInit = true;
  // Step 5 — fourth-vector reset.
  anyself._buf78_begin = anyself._buf78_end = anyself._buf78_cap = 0;
  // Step 6 — refresh (throw-stub in this port until 0x2d0ec is decoded).
  try {
    refreshValidVerticesList(this);
  } catch (e) {
    lock.unlock();
    throw e;
  }
  lock.unlock();
  return hadAny;
};

/**
 * OZSpline::setVertexFlag(void* vertex, unsigned int flag) @ProChannel 0x38756. Complete disasm:
 *   pushq %rbp; movq %rsp,%rbp; pushq %rbx; pushq %rax  (@0x38756..0x3875b)
 *   rbx = rsi (vertex)                                   (@0x3875c)
 *   test vertex, vertex; jz skip                         (@0x3875f..0x38762)
 *   rax = *vertex (vtable); rdi = vertex; esi = flag;
 *   callq *0x98(rax)  — vertex->vtable[0x98](flag)      (@0x38764..0x3876c)
 * skip:
 *   test vertex, vertex; setne %al  — al = (vertex != 0) (@0x38772..0x38775)
 *   epilogue and retq                                    (@0x38778..)
 *
 * i.e. "if the vertex handle is non-null, dispatch its flag-setter; return whether we did".
 */
OZSpline.prototype.setVertexFlag = function (handle: OZVertex | null, flag: number): boolean {
  if (handle == null) return false;
  (handle as unknown as { __vtable_0x98__(f: number): void }).__vtable_0x98__(flag);
  return true;
};

/**
 * OZSpline::deriveVertex(void* handle, CMTime const& tCtx) @ProChannel 0x39002. Complete disasm:
 *   pushq %rbp; movq %rsp,%rbp                          (@0x39002..0x39003)
 *   rax = *rdi (self vtable)                            (@0x39006)
 *   ecx = 1                                             (@0x39009)
 *   callq *0x130(rax)  — self->vtable[0x130](arg=rcx=1)  (@0x3900e)
 *   movb $1, %al; popq %rbp; retq                       (@0x39014..)
 *
 * Interesting: deriveVertex does NOT use its `handle` or `tCtx` args — it just dispatches into
 * self->vtable[0x130] with esi=<unused> and ecx=1. Return value is hard-wired `true`. The vtable
 * slot resolves through OZSpline's own vtable (this is a dispatched call to a derived-class
 * override; the base binary body of this vtable target is what actually consults handle & tCtx).
 */
OZSpline.prototype.deriveVertex = function (_handle: OZVertex, _tCtx: unknown): boolean {
  // self->vtable[0x130](arg=1). The base OZSpline vtable[0x130] target isn't yet decoded — throw.
  const vtable = (this as unknown as { __vtable__?: Record<number, (a: number) => void> }).__vtable__;
  if (vtable == null || vtable[0x130] == null) {
    throw new Error(
      "OZSpline::deriveVertex @ProChannel 0x39002 dispatches vtable[0x130] — target not yet transcribed",
    );
  }
  vtable[0x130](1);
  return true;
};

/**
 * OZSpline::getPointInputTangents(CMTime const& t, double* outDxDu, double* outDyDu, CMTime const& tCtx)
 *   @ProChannel 0x39018. Sequence:
 *   1) reserve two stack doubles at [rbp-0x30] and [rbp-0x28]; zero them (@0x39030..0x3903d).
 *   2) call self->derivePoint(t, [rbp-0x30], [rbp-0x28], null, null, tCtx, true) (@0x39050).
 *      Args map: rdx=[rbp-0x30] (x tangent), rcx=[rbp-0x28] (y tangent), r8=r9=null, on-stack
 *      arg7 = tCtx (rax at 0x3904f), arg8 = 1 (pushed at 0x3904d).
 *   3) load xmm1 = *(rbp-0x30) (x); xmm0 = *(rbp-0x28) (y).                   (@0x39059/@0x39066)
 *      xmm2 = x*x; xmm3 = y*y; xmm3 += xmm2; xmm2 = sqrt(x*x+y*y).            (@0x3905e..0x3907b)
 *   4) if outDxDu != null: xmm1 /= xmm2; *outDxDu = xmm1.                     (@0x3907f..0x39088)
 *   5) if outDyDu != null: xmm0 /= xmm2; *outDyDu = xmm0.                     (@0x3908d..0x39096)
 *
 * i.e. normalize the (x,y) tangent vector returned by derivePoint into a unit vector. Since
 * derivePoint isn't decoded yet, this must throw until we can call it faithfully.
 */
OZSpline.prototype.getPointInputTangents = function (
  _u: unknown,
  _tCtx: unknown,
): { dxdu: number; dydu: number } {
  // Would call derivePoint — throw citing both the parent's addr and derivePoint's addr.
  derivePointStub();
};

/**
 * OZSpline::getPointOutputTangents(CMTime const& t, double* outDxDu, double* outDyDu, CMTime const& tCtx)
 *   @ProChannel 0x39a6c — symmetric to getPointInputTangents but 1810 bytes (much larger than the
 *   input variant's 144 bytes). Not yet transcribed; the extra complexity almost certainly is
 *   segment-end-crossing bookkeeping. Deferred.
 */
OZSpline.prototype.getPointOutputTangents = function (
  _u: unknown,
  _tCtx: unknown,
): { dxdu: number; dydu: number } {
  throw new Error("OZSpline::getPointOutputTangents @ProChannel 0x39a6c not yet transcribed");
};

// ── Not-yet-transcribed methods (throw-stubs citing @0xADDR) ──────────────────────────────────────

/**
 * OZSpline::setVertex(void* handle, CMTime const& u, double value, CMTime const& tCtx)
 *   @ProChannel 0x350cc  (1292 bytes). Large mutator: builds two CMTime range structs at
 *   [rbp-0x60,-0x50] and [rsp+0x10,+0x28] from the two CMTime args (@0x35122..0x35146), locks,
 *   then dispatches complex insert/replace logic. Full body deferred.
 */
OZSpline.prototype.setVertex = function (
  _handle: OZVertex,
  _u: unknown,
  _value: number,
  _tCtx: unknown,
): void {
  throw new Error("OZSpline::setVertex @ProChannel 0x350cc not yet transcribed");
};

/**
 * OZSpline::moveVertex(void*, CMTime const&, CMTime const&, bool, bool, bool)
 *   @ProChannel 0x355d8  (1778 bytes). Vertex-time relocation with tangent-scaling side effects
 *   and three bool flags controlling: refreshList / adjustTangents / clampToNeighbours. Deferred.
 */
OZSpline.prototype.moveVertex = function (
  _handle: OZVertex,
  _newU: unknown,
  _tCtx: unknown,
  _b0: boolean,
  _b1: boolean,
  _b2: boolean,
): void {
  throw new Error("OZSpline::moveVertex @ProChannel 0x355d8 not yet transcribed");
};

/**
 * OZSpline::scaleTangentsAroundPoint(CMTime const& uPivot, CMTime const& deltaU, CMTime const& tCtx)
 *   @ProChannel 0x35cca  (2140 bytes). Scales the input/output tangents of every valid vertex
 *   so that the curve's shape is preserved under a time-scaling around `uPivot` by `deltaU`.
 *   The heavy math (vertex-by-vertex tangent scaling with segment-length ratios) is deferred.
 */
OZSpline.prototype.scaleTangentsAroundPoint = function (
  _uPivot: unknown,
  _deltaU: unknown,
  _tCtx: unknown,
): void {
  throw new Error("OZSpline::scaleTangentsAroundPoint @ProChannel 0x35cca not yet transcribed");
};

/**
 * OZSpline::scaleTangentsAfterInsertion(void* newVertex, CMTime const& insertU, CMTime const& tCtx)
 *   @ProChannel 0x36526  (3146 bytes). Called by addVertex/setVertex after a new vertex enters
 *   the sorted list: it rescales the flanking tangents so that the segment shape is preserved on
 *   the two new sub-segments. Deferred.
 */
OZSpline.prototype.scaleTangentsAfterInsertion = function (
  _newVertex: OZVertex,
  _insertU: unknown,
  _tCtx: unknown,
): void {
  throw new Error("OZSpline::scaleTangentsAfterInsertion @ProChannel 0x36526 not yet transcribed");
};

/** OZSpline::deleteVertex(CMTime const&, bool, CMTime const&) @ProChannel 0x37170 (484B). Deferred. */
OZSpline.prototype.deleteVertexAtTime = function (
  _u: unknown,
  _refreshList: boolean,
  _tCtx: unknown,
): void {
  throw new Error("OZSpline::deleteVertex(CMTime,bool,CMTime) @ProChannel 0x37170 not yet transcribed");
};

/**
 * OZSpline::scaleTangentsBeforeDeletion(void* victim, CMTime const& tCtx) @ProChannel 0x37354
 *   (1106 bytes). Symmetric to scaleTangentsAfterInsertion — rescales the tangents on the two
 *   flanking vertices before removing `victim` so the curve shape survives the deletion. Deferred.
 */
OZSpline.prototype.scaleTangentsBeforeDeletion = function (
  _victim: OZVertex,
  _tCtx: unknown,
): void {
  throw new Error("OZSpline::scaleTangentsBeforeDeletion @ProChannel 0x37354 not yet transcribed");
};

/** OZSpline::deleteVertex(void*, bool, CMTime const&) @ProChannel 0x377a6 (286B). Deferred. */
OZSpline.prototype.deleteVertexByHandle = function (
  _handle: OZVertex,
  _refreshList: boolean,
  _tCtx: unknown,
): boolean {
  throw new Error("OZSpline::deleteVertex(void*,bool,CMTime) @ProChannel 0x377a6 not yet transcribed");
};

/** OZSpline::deleteVertices(CMTime const&, CMTime const&) @ProChannel 0x378c4 (464B). Deferred. */
OZSpline.prototype.deleteVerticesInRange = function (_uLo: unknown, _uHi: unknown): void {
  throw new Error("OZSpline::deleteVertices @ProChannel 0x378c4 not yet transcribed");
};

/** OZSpline::addVertex(CMTime const&, double, CMTime const&, bool) @ProChannel 0x37b64 (3058B). */
OZSpline.prototype.addVertex = function (
  _u: unknown,
  _value: number,
  _tCtx: unknown,
  _refreshList: boolean,
): OZVertex | null {
  throw new Error("OZSpline::addVertex @ProChannel 0x37b64 not yet transcribed");
};

/** OZSpline::addVertexNoTangents(CMTime const&, double, CMTime const&, bool) @ProChannel 0x38780 (938B). */
OZSpline.prototype.addVertexNoTangents = function (
  _u: unknown,
  _value: number,
  _tCtx: unknown,
  _refreshList: boolean,
): OZVertex | null {
  throw new Error("OZSpline::addVertexNoTangents @ProChannel 0x38780 not yet transcribed");
};

/** OZSpline::appendVertexNoTangents(CMTime const&, double, CMTime const&) @ProChannel 0x38b2a (260B). */
OZSpline.prototype.appendVertexNoTangents = function (
  _u: unknown,
  _value: number,
  _tCtx: unknown,
): OZVertex | null {
  throw new Error("OZSpline::appendVertexNoTangents @ProChannel 0x38b2a not yet transcribed");
};

/** OZSpline::appendVertexesNoTangents(uint, CMTime*, double*, CMTime const&) @ProChannel 0x38c2e (388B). */
OZSpline.prototype.appendVertexesNoTangents = function (
  _count: number,
  _us: unknown,
  _vs: unknown,
  _tCtx: unknown,
): void {
  throw new Error("OZSpline::appendVertexesNoTangents @ProChannel 0x38c2e not yet transcribed");
};

/** OZSpline::setVertexNoTangents(void*, CMTime const&, double, CMTime const&) @ProChannel 0x38db2 (592B). */
OZSpline.prototype.setVertexNoTangents = function (
  _handle: OZVertex,
  _u: unknown,
  _value: number,
  _tCtx: unknown,
): void {
  throw new Error("OZSpline::setVertexNoTangents @ProChannel 0x38db2 not yet transcribed");
};

// Force the file to compile as a module by exporting a marker (also lets other files verify the
// extension is loaded).
export const OZ_SPLINE_M4_LOADED = true;
