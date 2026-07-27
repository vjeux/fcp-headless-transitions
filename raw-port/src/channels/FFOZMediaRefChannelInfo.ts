// raw-port: FFOZMediaRefChannelInfo — Flexo framework (channels layer)
//
// Only the two published entry points are visible: base + deleting dtors.
// Both are trivial aggregate destroy sequences:
//
//   0x002200c0  FFOZMediaRefChannelInfo::~FFOZMediaRefChannelInfo()   (D1, base)
//   0x002200e0  FFOZMediaRefChannelInfo::~FFOZMediaRefChannelInfo()   (D0, deleting)
//
// Class layout inferred from the dtors:
//   +0x00 .. base OZChannelInfo (destroyed via OZChannelInfo::~OZChannelInfo D2)
//   +0x50 .. embedded PCSingleton (destroyed via PCSingleton::~PCSingleton D2)
//
// The two ~ methods differ ONLY by:
//   D0 destroys OZChannelInfo THEN tail-calls operator delete(this)
//   D1 destroys OZChannelInfo as its own tail-call (no delete)
//
// The additional-frontier callees are already ported:
//   PCSingleton::~PCSingleton  → PCSingleton.destroy()   (../infra/PCSingleton.ts)
//   OZChannelInfo::~OZChannelInfo → OZChannelInfo.destroy() (./OZChannelInfo.ts)

import { OZChannelInfo } from "./OZChannelInfo";
import { PCSingleton } from "../infra/PCSingleton";

/**
 * FFOZMediaRefChannelInfo — a media-reference channel info aggregate.
 *
 * The only decoded methods are the destructors; the actual data payload
 * (media-ref specifics) is not observable from the dtors alone (the field at
 * +0x50 is just the PCSingleton subobject; the actual media-ref content
 * lives between +0x?? in the base OZChannelInfo and/or +0x?? after +0x50
 * and is not touched by the dtor).
 *
 * We extend OZChannelInfo to mirror the C++ inheritance visible in
 * ~D1 tail-calling __ZN13OZChannelInfoD2Ev at @0x2200db.
 */
export class FFOZMediaRefChannelInfo extends OZChannelInfo {
  /**
   * Field +0x50: embedded PCSingleton. Presence proven by
   *   @0x2200c9  addq $0x50, %rdi
   *   @0x2200cd  callq PCSingleton::~PCSingleton (D2)
   *
   * The PCSingleton tag argument is set by the constructor, which lives in
   * OTHER translation units (only the dtors are published in Flexo at these
   * addresses). We therefore accept the tag as a ctor arg — passing a real
   * decoded tag once callers land, or `0` while the frontier is un-decoded.
   * The dtor-only surface itself does not observe the tag value.
   */
  protected _singleton: PCSingleton;

  constructor(pcSingletonTag: number = 0) {
    super();
    this._singleton = new PCSingleton(pcSingletonTag >>> 0);
  }

  /**
   * FFOZMediaRefChannelInfo::~FFOZMediaRefChannelInfo()  @0x002200c0  (D1, base)
   *
   * Faithful asm mirror:
   *   @0x2200c0  push %rbp; mov %rsp,%rbp; push %rbx; push %rax
   *   @0x2200c6  mov %rdi, %rbx                    // save this
   *   @0x2200c9  add $0x50, %rdi                   // rdi = &this->_singleton (+0x50)
   *   @0x2200cd  call PCSingleton::~PCSingleton (D2)  // stub 0x1495ff4
   *   @0x2200d2  mov %rbx, %rdi                    // rdi = this
   *   @0x2200d5..da  epilogue
   *   @0x2200db  jmp OZChannelInfo::~OZChannelInfo (D2)  // stub 0x14962c4 (tail)
   *
   * Order: PCSingleton first (reverse construction order — same as C++
   * language rules; the base class OZChannelInfo is destroyed LAST).
   */
  override destroy(): void {
    // @0x2200c9..0x2200cd — destroy embedded PCSingleton at +0x50.
    this._singleton.destroy();
    // @0x2200db — tail-jmp to OZChannelInfo::~OZChannelInfo (base subobject dtor).
    super.destroy();
  }

  /**
   * FFOZMediaRefChannelInfo::~FFOZMediaRefChannelInfo()  @0x002200e0  (D0, deleting)
   *
   * Faithful asm mirror:
   *   @0x2200e0  push %rbp; mov %rsp,%rbp; push %rbx; push %rax
   *   @0x2200e6  mov %rdi, %rbx
   *   @0x2200e9  add $0x50, %rdi
   *   @0x2200ed  call PCSingleton::~PCSingleton (D2)  // stub 0x1495ff4
   *   @0x2200f2  mov %rbx, %rdi
   *   @0x2200f5  call OZChannelInfo::~OZChannelInfo (D2)  // stub 0x14962c4  (NOT a tail jmp — real call)
   *   @0x2200fa  mov %rbx, %rdi                    // rdi = this for operator delete
   *   @0x2200fd..0x220102  epilogue
   *   @0x220103  jmp __ZdlPv                       // tail operator delete(this)
   *
   * Diff from D1: an explicit CALL to OZChannelInfo::~OZChannelInfo (not a
   * tail jmp), then epilogue, then a tail jmp to operator delete. The
   * observable side effects are the same as D1's destroy sequence; only
   * the deletion of the heap block differs — which in JS is GC's job.
   */
  destroyAndDelete(): void {
    // Same destruction sequence as D1.
    this._singleton.destroy();
    super.destroy();
    // @0x220103 — tail jmp to operator delete. No JS equivalent; caller
    // drops the reference and GC reclaims. We deliberately do NOT
    // fabricate any additional cleanup.
  }
}
