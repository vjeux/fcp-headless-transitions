// HGRenderJob — Helium render job (partial port).
//
// Transcribed from /Applications/Final Cut Pro.app/Contents/Frameworks/
// Helium.framework/Versions/A/Helium (x86_64 slice). Disassembly sources:
//   raw-port/re/disasm/Helium.__ZN11HGRenderJob10SetUserTagEy.s          (SetUserTag)
//   raw-port/re/disasm/Helium.__ZN11HGRenderJob11SetUserNameEPKc.s       (SetUserName)
//   raw-port/re/disasm/Helium.__ZN11HGRenderJob7SetTypeENS_4TypeE.s      (SetType)
//   raw-port/re/disasm/Helium.__ZN11HGRenderJob8SetStateENS_5StateE.s    (SetState)
//   raw-port/re/disasm/Helium.__ZN11HGRenderJob11SetPriorityENS_8PriorityE.s (SetPriority)
//   raw-port/re/disasm/Helium.__ZN11HGRenderJob11SetResourceENS_8ResourceE.s (SetResource)
//   raw-port/re/disasm/Helium.__ZN11HGRenderJob11SetResourceENS_8ResourceE.s (SetResource)
//   raw-port/re/disasm/Helium.__ZN11HGRenderJob23SetRenderThreadPriorityENS_20RenderThreadPriorityE.s
//                                                                       (SetRenderThreadPriority)
//   raw-port/re/disasm/Helium.__ZN11HGRenderJob17SetGPUGraphicsAPIENS_14GPUGraphicsAPIE.s
//                                                                       (SetGPUGraphicsAPI)
//   raw-port/re/disasm/Helium.__ZN11HGRenderJob19UsesOnlyGPUResourceEv.s (UsesOnlyGPUResource)
//   raw-port/re/disasm/Helium.__ZN11HGRenderJob7GetTypeEv.s              (GetType)
//   raw-port/re/disasm/Helium.__ZN11HGRenderJob17GetGPUGraphicsAPIEv.s   (GetGPUGraphicsAPI —
//                                                                       read only to pin the
//                                                                       +0x64 offset/width; the
//                                                                       getter itself is a
//                                                                       separate ledger entry)
//   raw-port/re/disasm/Helium.__ZN11HGRenderJob24IsRequestedVirtualScreenEi.s
//                                                                       (IsRequestedVirtualScreen)
//   raw-port/re/disasm/Helium.__ZN11HGRenderJob20SetVirtualScreenMaskEj.s
//   raw-port/re/disasm/Helium.__ZN11HGRenderJob20GetVirtualScreenMaskEv.s
//   raw-port/re/disasm/Helium.__ZN11HGRenderJob16SetVirtualScreenEi.s    (these three read only
//                                                                       to pin the +0xbc
//                                                                       offset/width and prove it
//                                                                       is a BITMASK; each is a
//                                                                       separate ledger entry)
//
// This file ports ONLY the methods listed under "Symbols ported here" below.
// HGRenderJob is a large class (fields at offsets 0xc8 and 0xd8 imply at
// least a 0xe0-byte layout); every other method is a separate ledger entry
// and will be added to THIS file (additive extension only) when it is
// claimed. Never a rewrite / drop of a currently-landed method.
//
// -----------------------------------------------------------------------------
// STRUCT LAYOUT (partial — recovered only for the touched offsets)
// -----------------------------------------------------------------------------
// HGRenderJob {
//   ...                          // fields 0x00..0x0b not yet decoded
//   uint32_t type;      // offset 0x0c — HGRenderJob::Type enum tag.
//                       // SetType @0x54514 writes it via `movl %esi, 0xc(%rdi)`.
//                       // Values not enumerated here; opaque u32.
//   ...                          // fields 0x10..0x6b not yet decoded
//   uint32_t state;     // offset 0x6c — HGRenderJob::State enum tag.
//                       // SetState @0x54644 writes it via `movl %esi, 0x6c(%rdi)`
//                       // and GetState @0x54744 reads it back via
//                       // `movl 0x6c(%rdi), %eax` — a matched 32-bit store/load
//                       // pair, which pins both the offset and the width.
//                       // Values not enumerated here; opaque u32.
//   uint32_t renderThreadPriority; // offset 0x70 — HGRenderJob::RenderThreadPriority
//                       // enum tag. SetRenderThreadPriority @0x544b4 writes it
//                       // via `movl %esi, 0x70(%rdi)`. Values not enumerated
//                       // here; opaque u32.
//   ...                          // fields 0x74..0xc7 not yet decoded
//   uint64_t userTag;   // offset 0xc8 — a user-supplied tag word; the
//                       // SetUserTag setter @0x54650 writes to it. The
//                       // matching getter (GetUserTag) is a separate
//                       // ledger entry not in this file's scope.
//   ...                          // fields 0xd0..0xd7 not yet decoded
//   char*    userName;  // offset 0xd8 — a heap-owned C-string (strdup'd
//                       // copy of the caller's buffer). SetUserName @0x54670
//                       // frees the old string if non-null, nulls the slot,
//                       // then (if the new arg is non-null) strdup's it and
//                       // stores the new pointer. Ownership: HGRenderJob's
//                       // dtor is responsible for the final free (separate
//                       // ledger entry, not in this file's scope).
//   ...                          // fields >0xe0 not yet decoded
// }
//
// The `movq %rsi, 0xc8(%rdi)` at @0x54654 stores the argument (%rsi = 2nd
// SysV integer arg, the `y` = unsigned long long) into `this[0xc8]`.
// SetUserName @0x54670 touches only `this[0xd8]`. There are no other stores.
//
// -----------------------------------------------------------------------------
// FRONTIER CALLEES
// -----------------------------------------------------------------------------
//   SetUserTag              — none.
//   SetUserName             — `_free` @0x3c513e (libc extern, outside port scope), and
//                             `_strdup` @0x3c5606 (libc extern, outside port scope). Both
//                             are modelled as boundary stubs; see externs section below.
//   SetType                 — none.
//   SetRenderThreadPriority — none.
//   SetGPUGraphicsAPI       — none.
//   UsesOnlyGPUResource     — none.
//   GetType                 — none (5-instruction leaf load of this+0x0c).
//   SetState                — none.
//
// -----------------------------------------------------------------------------
// Symbols ported here (mangled → address)
// -----------------------------------------------------------------------------
//   * __ZN11HGRenderJob10SetUserTagEy
//       — HGRenderJob::SetUserTag(unsigned long long) @Helium 0x54650
//   * __ZN11HGRenderJob7SetTypeENS_4TypeE
//       — HGRenderJob::SetType(HGRenderJob::Type) @Helium 0x54510
//   * __ZN11HGRenderJob11SetUserNameEPKc
//       — HGRenderJob::SetUserName(char const*) @Helium 0x54670
//   * __ZN11HGRenderJob11SetPriorityENS_8PriorityE
//       — HGRenderJob::SetPriority(HGRenderJob::Priority) @Helium 0x544a0
//   * __ZN11HGRenderJob11SetResourceENS_8ResourceE
//       — HGRenderJob::SetResource(HGRenderJob::Resource) @Helium 0x54380
//   * __ZN11HGRenderJob23SetRenderThreadPriorityENS_20RenderThreadPriorityE
//       — HGRenderJob::SetRenderThreadPriority(HGRenderJob::RenderThreadPriority) @Helium 0x544b0
//   * __ZN11HGRenderJob17SetGPUGraphicsAPIENS_14GPUGraphicsAPIE
//       — HGRenderJob::SetGPUGraphicsAPI(HGRenderJob::GPUGraphicsAPI) @Helium 0x54490
//   * __ZN11HGRenderJob19UsesOnlyGPUResourceEv
//       — HGRenderJob::UsesOnlyGPUResource() @Helium 0x54b20
//   * __ZN11HGRenderJob7GetTypeEv
//       — HGRenderJob::GetType() @Helium 0x54730
//   * __ZN11HGRenderJob24IsRequestedVirtualScreenEi
//       — HGRenderJob::IsRequestedVirtualScreen(int) @Helium 0x54ad0
//   * __ZN11HGRenderJob8SetStateENS_5StateE
//       — HGRenderJob::SetState(HGRenderJob::State) @Helium 0x54640
//
// -----------------------------------------------------------------------------
// FULL DISASM — IsRequestedVirtualScreen @0x54ad0
// -----------------------------------------------------------------------------
//   0x54ad0  pushq  %rbp                    ; frame prologue
//   0x54ad1  movq   %rsp, %rbp
//   0x54ad4  testl  %esi, %esi              ; flags on screen & screen -> SF = sign(screen)
//   0x54ad6  js     0x54ae6                 ; SF=1 (screen < 0) -> the false tail
//   0x54ad8  movl   0xbc(%rdi), %eax        ; eax = this->virtualScreenMask (u32 load)
//   0x54ade  movl   %esi, %ecx              ; ecx = screen (only CL is used by the shift)
//   0x54ae0  shrl   %cl, %eax               ; LOGICAL right shift; x86 masks the count to
//                                           ; 5 bits for a 32-bit operand, so the machine
//                                           ; shifts by (screen & 31) — NOT a saturating or
//                                           ; zeroing shift. screen=32 re-tests bit 0.
//   0x54ae2  andb   $0x1, %al               ; keep bit 0 -> the bool return value
//   0x54ae4  popq   %rbp                    ; epilogue
//   0x54ae5  retq
//   0x54ae6  xorl   %eax, %eax              ; false tail: eax = 0
//   0x54ae8  andb   $0x1, %al               ; (redundant mask the compiler kept)
//   0x54aea  popq   %rbp                    ; epilogue
//   0x54aeb  retq
//   0x54aec  nopl   (%rax)                  ; padding
//
// `testl %esi,%esi ; js` is the standard signed-negative test: `test` ANDs the
// operand with itself, so SF is simply bit 31 of `screen`, and `js` takes the
// branch exactly when screen < 0. There is NO upper-bound check — the only
// thing that keeps screen>=32 in range is the hardware's 5-bit shift-count
// mask, which the port reproduces with JS `>>>` (ECMA-262 ToUint32 + `& 31`,
// the same masking rule). Modelling it as "return false for screen >= 32"
// would be a rewrite, and the oracle below measures the difference: 170 of
// 1,600 cases.
//
// The field at +0xbc is pinned as a u32 BITMASK by three sibling methods (each
// its own ledger entry, read here only for the layout, exactly as
// GetGPUGraphicsAPI was used for +0x64):
//   SetVirtualScreenMask(unsigned) @0x545d0  — `movl %esi, 0xbc(%rdi)`  (u32 store)
//   GetVirtualScreenMask()         @0x54af0  — `movl 0xbc(%rdi), %eax`  (u32 load)
//   SetVirtualScreen(int)          @0x545b0  — `movl $0x1,%eax ; movl %esi,%ecx ;
//                                               shll %cl,%eax ; movl %eax,0xbc(%rdi)`
//                                              i.e. mask = 1 << (screen & 31), which is
//                                              what makes "bit N = screen N" certain
//                                              rather than inferred.
//
// -----------------------------------------------------------------------------
// FULL DISASM — SetUserTag @0x54650
// -----------------------------------------------------------------------------
//   0x54650  pushq  %rbp                              ; frame prologue
//   0x54651  movq   %rsp, %rbp
//   0x54654  movq   %rsi, 0xc8(%rdi)                  ; this->userTag = arg
//                                                    ; (%rdi = this, %rsi = tag)
//   0x5465b  popq   %rbp                              ; epilogue
//   0x5465c  retq
//   0x5465d  nopl   (%rax)                            ; padding
//
// -----------------------------------------------------------------------------
// FULL DISASM — SetUserName @0x54670
// -----------------------------------------------------------------------------
//   0x54670  pushq  %rbp                              ; frame prologue
//   0x54671  movq   %rsp, %rbp
//   0x54674  pushq  %r14                              ; save callee-saved
//   0x54676  pushq  %rbx
//   0x54677  movq   %rsi, %r14                        ; r14 = name (arg, %rsi)
//   0x5467a  movq   %rdi, %rbx                        ; rbx = this (%rdi)
//   0x5467d  movq   0xd8(%rdi), %rdi                  ; rdi = this->userName
//   0x54684  testq  %rdi, %rdi                        ; if (userName == null)
//   0x54687  je     0x54699                           ;   skip the free
//   0x54689  callq  0x3c513e ## symbol stub for: _free ; free(userName)
//   0x5468e  movq   $0x0, 0xd8(%rbx)                  ; this->userName = null
//   0x54699  testq  %r14, %r14                        ; if (name == null)
//   0x5469c  je     0x546ad                           ;   skip the strdup
//   0x5469e  movq   %r14, %rdi                        ; rdi = name
//   0x546a1  callq  0x3c5606 ## symbol stub for: _strdup ; rax = strdup(name)
//   0x546a6  movq   %rax, 0xd8(%rbx)                  ; this->userName = rax
//   0x546ad  popq   %rbx                              ; epilogue
//   0x546ae  popq   %r14
//   0x546b0  popq   %rbp
//   0x546b1  retq
//   0x546b2  nopw   %cs:(%rax,%rax)                   ; padding
//
// The compare-branch pattern here is x86 `testq r,r; je L`: `testq r14,r14`
// is a bitwise-AND of the pointer with itself which sets ZF iff the pointer
// is zero, and `je` branches on ZF=1. So both `je` sites are the classic
// "if the pointer is null, skip the libc call" guard — modelled below with
// a plain JS truthiness test on the string / stored slot.
//
// -----------------------------------------------------------------------------
// FULL DISASM — SetRenderThreadPriority @0x544b0
// -----------------------------------------------------------------------------
//   0x544b0  pushq  %rbp                              ; frame prologue
//   0x544b1  movq   %rsp, %rbp
//   0x544b4  movl   %esi, 0x70(%rdi)                  ; this->renderThreadPriority = arg (u32)
//                                                    ; (%rdi = this, %esi = enum value)
//   0x544b7  popq   %rbp                              ; epilogue
//   0x544b8  retq
//   0x544b9  nopl   (%rax)                            ; padding
//
// A pure setter — 6-line body, one 32-bit store, no callees, no branches.
//
// LIBC EXTERNS (out-of-scope boundary stubs) — the two symbol stubs above
// call into libSystem (libc), NOT into any FCP framework. Per the port
// discipline (see raw-port/army/PORTING_SPEC.md Rule 3 & the DEP-WORKER
// brief) they are modelled as boundary stubs; the SetUserName body below
// uses local `_free` / `_strdup` helpers that document the ABI at the
// citation address and delegate to plain-JS equivalents (JS has GC'd
// strings, so `free` is a no-op and `strdup` returns the string as-is).

/**
 * HGRenderJob::Type — enum tag stored at +0x0c. Values are not yet enumerated
 * here; SetType passes `esi` (an unsigned 32-bit int) straight into the slot.
 * Model as an opaque u32 alias until a ctor / other setters pin the enum values.
 */
export type HGRenderJobType = number;

/**
 * HGRenderJob::Priority — enum tag stored at +0x68. Values are not yet enumerated
 * here; SetPriority @0x544a0 passes `esi` (an unsigned 32-bit int) straight into
 * the slot via `movl %esi, 0x68(%rdi)`. Model as an opaque u32 alias until a ctor
 * / other setters pin the enum values.
 */
export type HGRenderJobPriority = number;

/**
 * HGRenderJob::Resource — enum tag stored at +0x10. Values are not yet enumerated
 * here; SetResource @0x54380 passes `esi` (an unsigned 32-bit int) straight into
 * the slot via `movl %esi, 0x10(%rdi)`. Model as an opaque u32 alias until a ctor
 * / other setters pin the enum values.
 */
export type HGRenderJobResource = number;

/**
 * HGRenderJob::RenderThreadPriority — enum tag stored at +0x70. Values are not
 * yet enumerated here; SetRenderThreadPriority passes `esi` (an unsigned 32-bit
 * int) straight into the slot. Model as an opaque u32 alias until a ctor or
 * other setter pins the enum values.
 */
export type HGRenderJobRenderThreadPriority = number;

/**
 * HGRenderJob::MetalShaderPrecision — enum tag stored at +0x88. Values are not
 * yet enumerated here: `SetMetalShaderPrecision` @Helium 0x54504 passes `esi`
 * (an unsigned 32-bit int) straight into the slot with no validation, masking
 * or branching, and its reader `GetMetalShaderPrecision` @Helium 0x54794 hands
 * the same 32 bits back (`movl 0x88(%rdi), %eax`), so no decoded instruction
 * pins a single enumerator. Model as an opaque u32 alias until a ctor or a
 * comparison site reveals the values — same treatment as
 * `HGRenderJobRenderThreadPriority` above.
 */
export type HGRenderJobMetalShaderPrecision = number;

/**
 * HGRenderJob::GPUGraphicsAPI — enum tag stored at +0x64. Values are not yet
 * enumerated here: `SetGPUGraphicsAPI` @Helium 0x54494 passes `esi` (an unsigned
 * 32-bit int) straight into the slot with no validation, masking or branching,
 * and its reader `GetGPUGraphicsAPI` @Helium 0x547f4 hands the same 32 bits back
 * (`movl 0x64(%rdi), %eax`), so no decoded instruction pins a single enumerator.
 * That matched 32-bit store/load pair is what fixes both the offset and the
 * width. Model as an opaque u32 alias until a ctor or a comparison site reveals
 * the values — same treatment as `HGRenderJobMetalShaderPrecision` above.
 */
export type HGRenderJobGPUGraphicsAPI = number;

/**
 * HGRenderJob::State — enum tag stored at +0x6c. Values are not yet enumerated
 * here: `SetState` @Helium 0x54644 passes `esi` (an unsigned 32-bit int) straight
 * into the slot with no validation, masking or branching, and its reader
 * `GetState` @Helium 0x54744 hands the same 32 bits back
 * (`movl 0x6c(%rdi), %eax`), so no decoded instruction pins a single enumerator.
 * That matched 32-bit store/load pair is what fixes both the offset and the
 * width. Model as an opaque u32 alias until a ctor or a comparison site reveals
 * the values — same treatment as `HGRenderJobGPUGraphicsAPI` above.
 */
export type HGRenderJobState = number;

/**
 * The pointee shape that `UsesOnlyGPUResource` @Helium 0x54b20 dereferences — both at
 * `this+0x18` (`cmpl $0x1, 0x8(%rcx)` @0x54b40) and for every entry of the vector at
 * `this+0x28..+0x30` (`cmpl $0x0, 0x8(%rax)` @0x54b74). Only the u32 at +0x08 is read by
 * any decoded instruction, so only that word is modelled; naming the rest would be the
 * magic-offset guesswork PORTING_SPEC Rule 5 forbids.
 */
export interface HGRenderJobTaggedRef {
  /** +0x08 (u32) — compared against 1 @0x54b40 and against 0 @0x54b74. */
  tag08: number;
}

/**
 * `HGRenderJob` — Helium render job. This file ports the setters listed in
 * "Symbols ported here" (see file header); every other method is a
 * separate ledger entry. Field offsets not yet decoded are omitted; the
 * visible members are `userTag` at offset 0xc8 and `userName` at 0xd8.
 */
export class HGRenderJob {
  /** @Helium HGRenderJob@0x0c — the u32 HGRenderJob::Type enum tag.
   *  Written by SetType @0x54514. Zero-initialised to a neutral tag until
   *  a ctor is transcribed to reveal the true default. */
  _type: HGRenderJobType = 0; // @Helium HGRenderJob@0x0c

  /** @Helium HGRenderJob@0x68 — the u32 HGRenderJob::Priority enum tag.
   *  Written by SetPriority @0x544a4 via `movl %esi, 0x68(%rdi)`. Zero-
   *  initialised until a ctor pins the true default. */
  _priority: HGRenderJobPriority = 0; // @Helium HGRenderJob@0x68

  /** @Helium HGRenderJob@0x6c — the u32 HGRenderJob::State enum tag.
   *  Written by SetState @0x54644 via a single `movl %esi, 0x6c(%rdi)`, and read
   *  back by GetState @0x54744 via `movl 0x6c(%rdi), %eax` — a matched 32-bit
   *  store/load pair, which is what fixes both the offset and the width.
   *  Confirmed by calling the live pair on a 0xAA-filled buffer under
   *  `arch -x86_64`: only the four bytes at +0x6c change. Zero-initialised to a
   *  neutral tag until a ctor is transcribed to reveal the true default. */
  state: HGRenderJobState = 0; // @Helium HGRenderJob@0x6c

  /** @Helium HGRenderJob@0x10 — the u32 HGRenderJob::Resource enum tag.
   *  Written by SetResource @0x54384 via `movl %esi, 0x10(%rdi)`. Zero-
   *  initialised until a ctor pins the true default. */
  _resource: HGRenderJobResource = 0; // @Helium HGRenderJob@0x10

  /** @Helium HGRenderJob@0xc8 — the user-supplied tag word. Written by
   *  SetUserTag @0x54654; read by the matching getter (separate ledger
   *  entry). Stored as bigint because it is a 64-bit value with no
   *  sign convention and callers may set values that exceed 2^53. */
  userTag: bigint = 0n; // @Helium HGRenderJob@0xc8

  /** @Helium HGRenderJob@0xd8 — a heap-owned C-string (null when unset).
   *  Written by SetUserName @0x5468e / @0x546a6; read by the matching
   *  GetUserName getter (separate ledger entry). Modelled as `string |
   *  null` because JS has GC'd strings — the machine's owning-pointer
   *  semantics reduce to "the field either holds a string or is null". */
  userName: string | null = null; // @Helium HGRenderJob@0xd8

  /** @Helium HGRenderJob@0x70 — the u32 HGRenderJob::RenderThreadPriority
   *  enum tag. Written by SetRenderThreadPriority @0x544b4 via a single
   *  `movl %esi, 0x70(%rdi)`. Zero-initialised to a neutral tag until a
   *  ctor is transcribed to reveal the true default. */
  renderThreadPriority: HGRenderJobRenderThreadPriority = 0; // @Helium HGRenderJob@0x70

  /** @Helium HGRenderJob@0x88 — the u32 HGRenderJob::MetalShaderPrecision
   *  enum tag. Written by SetMetalShaderPrecision @0x54504 via a single
   *  `movl %esi, 0x88(%rdi)`, and read back by GetMetalShaderPrecision
   *  @0x54794 via `movl 0x88(%rdi), %eax` — a matched 32-bit store/load pair,
   *  which is what fixes both the offset and the width. Zero-initialised to a
   *  neutral tag until a ctor is transcribed to reveal the true default. */
  metalShaderPrecision: HGRenderJobMetalShaderPrecision = 0; // @Helium HGRenderJob@0x88

  /** @Helium HGRenderJob@0x64 — the u32 HGRenderJob::GPUGraphicsAPI enum tag.
   *  Written by SetGPUGraphicsAPI @0x54494 via a single `movl %esi, 0x64(%rdi)`,
   *  and read back by GetGPUGraphicsAPI @0x547f4 via `movl 0x64(%rdi), %eax` — a
   *  matched 32-bit store/load pair, which is what fixes both the offset and the
   *  width. Confirmed by calling the live pair on a 0xAA-filled buffer: only the
   *  four bytes at +0x64 change. Zero-initialised to a neutral tag until a ctor is
   *  transcribed to reveal the true default. */
  gpuGraphicsAPI: HGRenderJobGPUGraphicsAPI = 0; // @Helium HGRenderJob@0x64

  /** @Helium HGRenderJob@0x18 — a nullable pointer to a tagged object whose u32 at
   *  +0x08 is compared against 1 by UsesOnlyGPUResource @0x54b40
   *  (`cmpl $0x1, 0x8(%rcx)`). Nothing else in the decoded methods touches it, so
   *  only the tag word is modelled; the pointee's remaining layout is undecoded. */
  taggedRef18: HGRenderJobTaggedRef | null = null; // @Helium HGRenderJob@0x18

  /** @Helium HGRenderJob@0x28 / +0x30 — begin/end of a std::vector of 16-BYTE entries
   *  (`addq $0x10` stride @0x54b5f/0x54b80), each of which starts with a pointer that
   *  UsesOnlyGPUResource dereferences at +0x08 (`movq -0x10(%rdx), %rax ; cmpl $0x0,
   *  0x8(%rax)` @0x54b70). Modelled as the array of pointed-to objects, so `.length`
   *  is the (end-begin)/16 the machine computes; the other 8 bytes of each entry are
   *  not read by any decoded method. */
  taggedRefs: Array<HGRenderJobTaggedRef> = []; // @Helium HGRenderJob@0x28..+0x30

  /** @Helium HGRenderJob@0x50 — an 8-byte slot that UsesOnlyGPUResource tests only for
   *  non-null (`cmpq $0x0, 0x50(%rdi)` @0x54b46). Its type is undecoded, so it is
   *  modelled as an opaque nullable reference. */
  slot50: unknown | null = null; // @Helium HGRenderJob@0x50

  /** @Helium HGRenderJob@0xbc — the u32 virtual-screen BITMASK (bit N set = virtual
   *  screen N is requested). Read by IsRequestedVirtualScreen @0x54ad8 via
   *  `movl 0xbc(%rdi), %eax`; the same dword is written by SetVirtualScreenMask
   *  @0x545d4 (`movl %esi, 0xbc(%rdi)`), read back by GetVirtualScreenMask @0x54af4
   *  (`movl 0xbc(%rdi), %eax`) — a matched 32-bit store/load pair that fixes both the
   *  offset and the width — and set to a single bit by SetVirtualScreen @0x545c1
   *  (`movl $0x1,%eax ; shll %cl,%eax ; movl %eax,0xbc(%rdi)`), which is what proves
   *  the dword is a per-screen bit set rather than a screen index. Held as an
   *  unsigned 32-bit value. Zero-initialised (no screens requested) until a ctor is
   *  transcribed to reveal the true default. */
  virtualScreenMask: number = 0; // @Helium HGRenderJob@0xbc

  /**
   * `HGRenderJob::SetUserTag(unsigned long long)` @Helium 0x54650
   * (__ZN11HGRenderJob10SetUserTagEy).
   *
   * Faithful line-for-line transcription: writes the argument to the
   * userTag field at `this+0xc8`. No callees, no side effects, no
   * threading barriers — the disasm is a single 8-byte store between
   * a frame prologue and a `retq`.
   *
   * @param tag  the tag value (SysV %rsi at call site).
   */
  SetUserTag(tag: bigint): void {
    // ------------------------------------------------------------
    // @0x54650..0x54651 — prologue (no TS-visible effect).
    // @0x54654 — movq %rsi, 0xc8(%rdi)  →  this->userTag = tag
    // @0x5465b..0x5465c — epilogue + retq.
    // ------------------------------------------------------------
    this.userTag = tag;
  }

  /**
   * `HGRenderJob::SetType(HGRenderJob::Type)` @Helium 0x54510
   * (__ZN11HGRenderJob7SetTypeENS_4TypeE).
   *
   * Faithful line-for-line transcription of a 6-line function: writes the
   * u32 argument to the +0x0c slot. No callees, no side effects. From
   * raw-port/re/disasm/Helium.__ZN11HGRenderJob7SetTypeENS_4TypeE.s:
   *
   *   0x54510  pushq %rbp                    ; frame prologue
   *   0x54511  movq  %rsp, %rbp
   *   0x54514  movl  %esi, 0xc(%rdi)         ; this->_type (u32) = esi
   *   0x54517  popq  %rbp                    ; epilogue
   *   0x54518  retq
   *   0x54519  nopl  (%rax)                  ; padding
   *
   * @param type — HGRenderJob::Type enum value (SysV %esi, u32).
   */
  SetType(type: HGRenderJobType): void {
    // ------------------------------------------------------------
    // @0x54510..0x54511 — prologue (no TS-visible effect).
    // @0x54514 — movl %esi, 0xc(%rdi) : store u32 at offset +0x0c.
    //   Model 32-bit truncation with `>>> 0` so a negative / oversized
    //   JS number stores the same bit-pattern the machine would.
    // @0x54517..0x54518 — epilogue + retq.
    // ------------------------------------------------------------
    this._type = type >>> 0;
  }

  /**
   * `HGRenderJob::SetUserName(char const*)` @Helium 0x54670
   * (__ZN11HGRenderJob11SetUserNameEPKc).
   *
   * Line-for-line transcription:
   *   1. Load old `this->userName` (0xd8 slot). If non-null,
   *      call libc `free(old)` and set the slot to null. Nulling
   *      the slot BEFORE the strdup call matches the machine
   *      (`movq $0x0, 0xd8(%rbx)` @0x5468e) — an out-of-memory /
   *      throwing strdup would leave the field observably null,
   *      not dangling at the freed pointer.
   *   2. If the new `name` argument is non-null, call libc
   *      `strdup(name)` and store the returned pointer in the
   *      0xd8 slot (`movq %rax, 0xd8(%rbx)` @0x546a6). If the
   *      argument is null, leave the slot as its post-free null.
   *
   * Signature note: the C prototype takes a `char const*` — passing
   * `null` is the "clear this field" idiom and the disasm handles it
   * (the second `je` @0x5469c). We model that as `string | null`.
   *
   * @param name  the new user name (a copy is taken via `_strdup`),
   *              or `null` to clear the field.
   */
  SetUserName(name: string | null): void {
    // ------------------------------------------------------------
    // @0x54670..0x54677 — prologue + arg saves (no TS effect).
    // @0x5467d — movq 0xd8(%rdi), %rdi   ; rdi = this->userName
    // @0x54684..0x54687 — testq %rdi,%rdi; je 0x54699
    //                     (skip the free branch if userName == null)
    // ------------------------------------------------------------
    const oldName = this.userName; // @0x5467d
    if (oldName !== null) {
      // @0x54689 — callq _free  ; free(this->userName)
      _free(oldName);
      // @0x5468e — movq $0x0, 0xd8(%rbx)  ; this->userName = null
      this.userName = null;
    }

    // ------------------------------------------------------------
    // @0x54699..0x5469c — testq %r14,%r14; je 0x546ad
    //                     (skip the strdup branch if name == null)
    // ------------------------------------------------------------
    if (name !== null) {
      // @0x5469e..0x546a1 — movq %r14,%rdi ; callq _strdup
      //                     rax = strdup(name)
      const copy = _strdup(name);
      // @0x546a6 — movq %rax, 0xd8(%rbx)  ; this->userName = rax
      this.userName = copy;
    }

    // @0x546ad..0x546b1 — epilogue + retq.
  }

  /**
   * `HGRenderJob::SetPriority(HGRenderJob::Priority)` @Helium 0x544a0
   * (__ZN11HGRenderJob11SetPriorityENS_8PriorityE).
   *
   * Faithful line-for-line transcription of a 6-line function: writes the
   * u32 argument to the +0x68 slot. No callees, no side effects. From
   * raw-port/re/disasm/Helium.__ZN11HGRenderJob11SetPriorityENS_8PriorityE.s:
   *
   *   0x544a0  pushq %rbp                    ; frame prologue
   *   0x544a1  movq  %rsp, %rbp
   *   0x544a4  movl  %esi, 0x68(%rdi)        ; this->_priority (u32) = esi
   *   0x544a7  popq  %rbp                    ; epilogue
   *   0x544a8  retq
   *   0x544a9  nopl  (%rax)                  ; padding
   *
   * This is the exact same body-shape as SetType (above, @0x54510) — a
   * bare u32 store into a fixed offset — with a different slot (+0x68
   * vs +0x0c) and a different enum-arg tag (HGRenderJob::Priority vs
   * HGRenderJob::Type). Model 32-bit truncation with `>>> 0` so a
   * negative/oversized JS number stores the same bit-pattern the
   * machine would; the disasm uses `movl` (32-bit), not `movq`.
   *
   * @param priority — HGRenderJob::Priority enum value (SysV %esi, u32).
   */
  SetPriority(priority: HGRenderJobPriority): void {
    // ------------------------------------------------------------
    // @0x544a0..0x544a1 — prologue (no TS-visible effect).
    // @0x544a4 — movl %esi, 0x68(%rdi) : store u32 at offset +0x68.
    //   Model 32-bit truncation with `>>> 0` so a negative / oversized
    //   JS number stores the same bit-pattern the machine would.
    // @0x544a7..0x544a8 — epilogue + retq.
    // ------------------------------------------------------------
    this._priority = priority >>> 0;
  }

  /**
   * `HGRenderJob::SetResource(HGRenderJob::Resource)` @Helium 0x54380
   * (__ZN11HGRenderJob11SetResourceENS_8ResourceE).
   *
   * Faithful line-for-line transcription of a 6-line function: writes the
   * u32 argument to the +0x10 slot. No callees, no side effects. From
   * raw-port/re/disasm/Helium.__ZN11HGRenderJob11SetResourceENS_8ResourceE.s:
   *
   *   0x54380  pushq %rbp                    ; frame prologue
   *   0x54381  movq  %rsp, %rbp
   *   0x54384  movl  %esi, 0x10(%rdi)        ; this->_resource (u32) = esi
   *   0x54387  popq  %rbp                    ; epilogue
   *   0x54388  retq
   *   0x54389  nopl  (%rax)                  ; padding
   *
   * This is the exact same body-shape as SetType (@0x54510) and SetPriority
   * (@0x544a0) — a bare u32 store into a fixed offset — with slot +0x10 and
   * the HGRenderJob::Resource enum-arg tag. Model 32-bit truncation with
   * `>>> 0` so a negative/oversized JS number stores the same bit-pattern the
   * machine would; the disasm uses `movl` (32-bit), not `movq`.
   *
   * @param resource — HGRenderJob::Resource enum value (SysV %esi, u32).
   */
  SetResource(resource: HGRenderJobResource): void {
    // ------------------------------------------------------------
    // @0x54380..0x54381 — prologue (no TS-visible effect).
    // @0x54384 — movl %esi, 0x10(%rdi) : store u32 at offset +0x10.
    //   Model 32-bit truncation with `>>> 0` so a negative / oversized
    //   JS number stores the same bit-pattern the machine would.
    // @0x54387..0x54388 — epilogue + retq.
    // ------------------------------------------------------------
    this._resource = resource >>> 0;
  }

  /**
   * `HGRenderJob::SetRenderThreadPriority(HGRenderJob::RenderThreadPriority)`
   *   @Helium 0x544b0
   *   (__ZN11HGRenderJob23SetRenderThreadPriorityENS_20RenderThreadPriorityE)
   *
   * Faithful line-for-line transcription of a 6-line function: writes the
   * u32 argument to the `renderThreadPriority` slot at `this+0x70`. No
   * callees, no side effects. From raw-port/re/disasm/
   * Helium.__ZN11HGRenderJob23SetRenderThreadPriorityENS_20RenderThreadPriorityE.s:
   *
   *   0x544b0  pushq %rbp                    ; frame prologue
   *   0x544b1  movq  %rsp, %rbp
   *   0x544b4  movl  %esi, 0x70(%rdi)        ; this->renderThreadPriority (u32) = esi
   *   0x544b7  popq  %rbp                    ; epilogue
   *   0x544b8  retq
   *   0x544b9  nopl  (%rax)                  ; padding
   *
   * @param priority — HGRenderJob::RenderThreadPriority enum value
   *                   (SysV %esi, u32; the width is `movl`, so a 32-bit
   *                   store).
   */
  SetRenderThreadPriority(priority: HGRenderJobRenderThreadPriority): void {
    // ------------------------------------------------------------
    // @0x544b0..0x544b1 — prologue (no TS-visible effect).
    // @0x544b4 — movl %esi, 0x70(%rdi) : store u32 at offset +0x70.
    //   Model 32-bit truncation with `>>> 0` so a negative / oversized
    //   JS number stores the same bit-pattern the machine would.
    // @0x544b7..0x544b8 — epilogue + retq.
    // ------------------------------------------------------------
    this.renderThreadPriority = priority >>> 0;
  }

  /**
   * `HGRenderJob::SetGPUGraphicsAPI(HGRenderJob::GPUGraphicsAPI)` @Helium 0x54490
   *   (__ZN11HGRenderJob17SetGPUGraphicsAPIENS_14GPUGraphicsAPIE)
   *
   * Faithful line-for-line transcription of the whole 6-line function: one u32
   * store into the `gpuGraphicsAPI` slot at `this+0x64`. Structural twin of
   * `SetRenderThreadPriority` / `SetMetalShaderPrecision` above, a different slot.
   * No callees, no validation, no branches. From raw-port/re/disasm/
   * Helium.__ZN11HGRenderJob17SetGPUGraphicsAPIENS_14GPUGraphicsAPIE.s:
   *
   *   0x54490  pushq %rbp                    ; frame prologue
   *   0x54491  movq  %rsp, %rbp
   *   0x54494  movl  %esi, 0x64(%rdi)        ; this->gpuGraphicsAPI (u32) = esi
   *   0x54497  popq  %rbp                    ; epilogue
   *   0x54498  retq
   *   0x54499  nopl  (%rax)                  ; padding
   *
   * The offset and width are pinned by the matching reader `GetGPUGraphicsAPI`
   * @Helium 0x547f4 (`movl 0x64(%rdi), %eax`), and confirmed by DIFFERENTIAL
   * against the live binary: both symbols are exported (`nm` class T), so calling
   * the pair through dlsym on a 0x200-byte buffer pre-filled with 0xAA, under
   * `arch -x86_64` (the port's addresses are x86_64 offsets), gives for each of
   * 0, 1, 2, 0x12345678, 0x80000000 and 0xffffffff: the four bytes at +0x64 hold
   * the value, `GetGPUGraphicsAPI` returns it, and EVERY other byte of the buffer
   * is still 0xAA — i.e. the setter really is this single store and touches
   * nothing else.
   *
   * @param api — HGRenderJob::GPUGraphicsAPI enum value (SysV %esi, u32).
   */
  SetGPUGraphicsAPI(api: HGRenderJobGPUGraphicsAPI): void {
    // ------------------------------------------------------------
    // @0x54490..0x54491 — prologue (no TS-visible effect).
    // @0x54494 — movl %esi, 0x64(%rdi) : store u32 at offset +0x64.
    //   Model 32-bit truncation with `>>> 0` so a negative / oversized
    //   JS number stores the same bit-pattern the machine would.
    // @0x54497..0x54498 — epilogue + retq.
    // ------------------------------------------------------------
    this.gpuGraphicsAPI = api >>> 0;
  }

  /**
   * `HGRenderJob::UsesOnlyGPUResource()` @Helium 0x54b20
   *   (__ZN11HGRenderJob19UsesOnlyGPUResourceEv)
   *
   * Full transcription of the 40-line body (raw-port/re/disasm/
   * Helium.__ZN11HGRenderJob19UsesOnlyGPUResourceEv.s). Returns `bool` in %al.
   *
   *   0x54b20  movl  0x10(%rdi), %ecx        ; ecx = this->_resource (u32 @+0x10)
   *   0x54b23  movb  $0x1, %al               ; default answer = true
   *   0x54b25  leal  -0x2(%rcx), %edx        ; edx = resource - 2
   *   0x54b28  cmpl  $0x4, %edx
   *   0x54b2b  jae   0x54b2e                 ; UNSIGNED >= 4 -> keep going
   *   0x54b2d  retq                          ;   else return true (no frame was built)
   *   0x54b2e  cmpl  $0x6, %ecx
   *   0x54b31  jne   0x54b4f                 ; resource != 6 -> 0x54b4f: xorl %eax,%eax; ret
   *   0x54b33  pushq %rbp ; movq %rsp,%rbp
   *   0x54b37  movq  0x18(%rdi), %rcx        ; rcx = this->taggedRef18
   *   0x54b3b  testq %rcx, %rcx
   *   0x54b3e  je    0x54b46                 ; null -> skip the tag test
   *   0x54b40  cmpl  $0x1, 0x8(%rcx)
   *   0x54b44  je    0x54b4d                 ; tag08 == 1 -> return true (al still 1)
   *   0x54b46  cmpq  $0x0, 0x50(%rdi)
   *   0x54b4b  je    0x54b52                 ; slot50 == null -> walk the vector
   *   0x54b4d  popq  %rbp ; retq             ;   else return true
   *   0x54b4f  xorl  %eax, %eax ; retq       ; the resource != 6 exit -> false
   *   0x54b52  movq  0x28(%rdi), %rdx        ; rdx = vector begin
   *   0x54b56  movq  0x30(%rdi), %rcx        ; rcx = vector end
   *   0x54b5a  cmpq  %rcx, %rdx
   *   0x54b5d  je    0x54b88                 ; EMPTY vector -> 0x54b88: xorl %eax,%eax -> false
   *   0x54b5f  addq  $0x10, %rdx             ; pre-advance; entries are 16 bytes
   *   0x54b70  movq  -0x10(%rdx), %rax       ; rax = entry[i].ptr
   *   0x54b74  cmpl  $0x0, 0x8(%rax)
   *   0x54b78  setne %al                     ; al = (ptr->tag08 != 0)
   *   0x54b7b  je    0x54b4d                 ; a ZERO tag returns immediately with al = 0
   *   0x54b7d  cmpq  %rcx, %rdx
   *   0x54b80  leaq  0x10(%rdx), %rdx
   *   0x54b84  jne   0x54b70                 ; loop while the pre-increment cursor != end
   *   0x54b86  jmp   0x54b4d                 ; ran out -> return al, which is 1
   *
   * So: resource in {2,3,4,5} is unconditionally GPU-only; anything other than 6 is not;
   * and resource == 6 is GPU-only when EITHER `taggedRef18->tag08 == 1` OR `slot50` is
   * non-null, else when the +0x28 vector is non-empty and EVERY entry's `tag08` is
   * non-zero. An empty vector on that last path answers FALSE.
   *
   * Note the two branches that are easy to invert: `cmpl $0x4,%edx ; jae` is UNSIGNED, so
   * resource 0 and 1 wrap to 0xfffffffe/0xffffffff and take the `jae` (they are NOT in the
   * true set); and `je 0x54b52` fires when slot50 IS null, i.e. the vector walk is the
   * fallback, not the primary test.
   *
   * DIFFERENTIAL against the live binary (exported `T`, so dlsym reaches it; run under
   * `arch -x86_64`): raw-port/re/oracle/HGRenderJob_UsesOnlyGPUResource_oracle.py builds
   * synthetic jobs — every resource value 0..8, taggedRef18 null / tag 0 / 1 / 2, slot50
   * null or not, and vectors of length 0..3 with every tag combination — and compares the
   * live answer to this body: 2,880 cases, 1,522 TRUE / 1,358 FALSE, 0 divergences.
   *
   * @returns true when the job needs only GPU resources.
   */
  UsesOnlyGPUResource(): boolean {
    // @0x54b20/0x54b25/0x54b28 — UNSIGNED (resource - 2) < 4, i.e. resource in {2,3,4,5}
    const resource = this._resource >>> 0;
    if (((resource - 2) >>> 0) < 4) return true; // @0x54b2b jae not taken -> @0x54b2d ret al=1
    // @0x54b2e/0x54b31 — anything but 6 is false
    if (resource !== 6) return false; // @0x54b4f xorl %eax,%eax ; retq
    // @0x54b37..0x54b44 — taggedRef18 != null && taggedRef18->tag08 == 1 -> true
    const ref = this.taggedRef18;
    if (ref !== null && (ref.tag08 >>> 0) === 1) return true; // @0x54b44 je -> @0x54b4d (al=1)
    // @0x54b46/0x54b4b — slot50 non-null -> true; null -> fall through to the vector walk
    if (this.slot50 !== null && this.slot50 !== undefined) return true; // @0x54b4d (al=1)
    // @0x54b52..0x54b5d — an empty vector answers false
    const refs = this.taggedRefs;
    if (refs.length === 0) return false; // @0x54b88 xorl %eax,%eax
    // @0x54b70..0x54b84 — every entry's tag08 must be non-zero; the first zero returns false
    for (let i = 0; i < refs.length; i++) {
      if ((refs[i].tag08 >>> 0) === 0) return false; // @0x54b78 setne al=0 ; @0x54b7b je
    }
    return true; // @0x54b86 jmp 0x54b4d with al = 1 from the last setne
  }

  /**
   * `HGRenderJob::SetMetalShaderPrecision(HGRenderJob::MetalShaderPrecision)`
   *   @Helium 0x54500
   *   (__ZN11HGRenderJob23SetMetalShaderPrecisionENS_20MetalShaderPrecisionE)
   *
   * Faithful line-for-line transcription of a 7-line function: writes the u32
   * argument to the `metalShaderPrecision` slot at `this+0x88`. Structural twin
   * of `SetRenderThreadPriority` above, one slot over. No callees, no
   * validation, no side effects. From raw-port/re/disasm/
   * Helium.__ZN11HGRenderJob23SetMetalShaderPrecisionENS_20MetalShaderPrecisionE.s:
   *
   *   0x54500  pushq %rbp                    ; frame prologue
   *   0x54501  movq  %rsp, %rbp
   *   0x54504  movl  %esi, 0x88(%rdi)        ; this->metalShaderPrecision (u32) = esi
   *   0x5450a  popq  %rbp                    ; epilogue
   *   0x5450b  retq
   *   0x5450c  nopl  (%rax)                  ; padding — not executed
   *
   * The width is `movl`, so a 32-bit store; nothing adjacent is touched and the
   * enum value is stored verbatim (no mask, no range check, no branch).
   *
   * ORACLE: verified against the live Helium binary. Both this setter and its
   * reader `GetMetalShaderPrecision` @0x54790 are EXPORTED (`nm` type `T`), so
   * the harness dlopens Helium under `arch -x86_64 /usr/bin/python3` (the port
   * is transcribed from the x86_64 slice), calls the real setter on a 0x200-byte
   * buffer pre-filled with 0xEE, and then checks (a) the raw dword at +0x88,
   * (b) the value the real getter returns, and (c) that no other byte of the
   * buffer changed. 1,536 cases over 0, 1, 2, 3, 0x7fffffff, 0x80000000,
   * 0xffffffff and random u32s: 1536/1536 agreed with this port on all three
   * checks — the stored dword, the real getter's round-trip, and the untouched
   * remainder (zero buffers showed a collateral write, so the store really is
   * the 4 bytes at +0x88 and nothing else).
   * NEGATIVE CONTROLS (measured): storing only 16 bits -> 1238 of 1536 wrong;
   * sign-extending with `| 0` instead of `>>> 0` -> 630 wrong; writing the
   * neighbouring renderThreadPriority slot instead -> 1494 wrong.
   *
   * @param precision — HGRenderJob::MetalShaderPrecision enum value
   *                    (SysV %esi, u32).
   */
  SetMetalShaderPrecision(precision: HGRenderJobMetalShaderPrecision): void {
    // ------------------------------------------------------------
    // @0x54500..0x54501 — prologue (no TS-visible effect).
    // @0x54504 — movl %esi, 0x88(%rdi) : store u32 at offset +0x88.
    //   `>>> 0` models the 32-bit truncation, so a negative / oversized JS
    //   number stores the same bit-pattern the machine would (identical
    //   treatment to SetRenderThreadPriority above).
    // @0x5450a..0x5450b — epilogue + retq.
    // ------------------------------------------------------------
    this.metalShaderPrecision = precision >>> 0;
  }

  /**
   * `HGRenderJob::SetState(HGRenderJob::State)` @Helium 0x54640
   *   (__ZN11HGRenderJob8SetStateENS_5StateE)
   *
   * Faithful line-for-line transcription of the whole 6-line function: one u32
   * store into the `state` slot at `this+0x6c`. Structural twin of
   * `SetGPUGraphicsAPI` / `SetRenderThreadPriority` above, a different slot.
   * No callees, no validation, no branches. From raw-port/re/disasm/
   * Helium.__ZN11HGRenderJob8SetStateENS_5StateE.s:
   *
   *   0x54640  pushq %rbp                    ; frame prologue
   *   0x54641  movq  %rsp, %rbp
   *   0x54644  movl  %esi, 0x6c(%rdi)        ; this->state (u32) = esi
   *   0x54647  popq  %rbp                    ; epilogue
   *   0x54648  retq
   *   0x54649  nopl  (%rax)                  ; padding
   *
   * The offset and width are pinned by the matching reader `GetState`
   * @Helium 0x54740 (`movl 0x6c(%rdi), %eax` @0x54744), and confirmed by
   * DIFFERENTIAL against the live binary: both symbols are exported (`nm` class
   * T), so calling the pair through dlsym on a 0x200-byte buffer pre-filled with
   * 0xAA, under `arch -x86_64` (the port's addresses are x86_64 offsets, and the
   * arm64 slice can differ — a wrong-slice oracle fails silently toward
   * VERIFIED), gives across 513 cases (0, 1, 2, 3, 7, 0xaaaaaaaa, 0xffffffff,
   * 0x12345678, 0x80000000, 0xdeadbeef, 0x100000000, 0x1ffffffff,
   * 0xffffffffffffffff and 500 random 64-bit words): the four bytes at +0x6c
   * hold the LOW 32 bits little-endian, `GetState` returns exactly those 32 bits,
   * and EVERY other byte of the buffer is still 0xAA — i.e. the setter really is
   * this single 32-bit store, it truncates rather than widening, and it touches
   * nothing else. A second store overwrites the slot outright (Set(0xffffffff)
   * then Set(1) leaves `01000000`), confirming a plain `movl` and not a
   * read-modify-write.
   *
   * @param state — HGRenderJob::State enum value (SysV %esi, u32).
   */
  SetState(state: HGRenderJobState): void {
    // ------------------------------------------------------------
    // @0x54640..0x54641 — prologue (no TS-visible effect).
    // @0x54644 — movl %esi, 0x6c(%rdi) : store u32 at offset +0x6c.
    //   Model 32-bit truncation with `>>> 0` so a negative / oversized
    //   JS number stores the same bit-pattern the machine would.
    // @0x54647..0x54648 — epilogue + retq.
    // ------------------------------------------------------------
    this.state = state >>> 0;
  }

  /**
   * `HGRenderJob::IsRequestedVirtualScreen(int)` @Helium 0x54ad0
   * (__ZN11HGRenderJob24IsRequestedVirtualScreenEi).
   *
   * Tests one bit of the virtual-screen mask at `this+0xbc`: returns true iff
   * virtual screen `screen` is in the requested set. A negative index short-
   * circuits to false through the `js` tail at @0x54ae6; there is no upper-bound
   * check at all, so a large index is folded by the hardware's 5-bit shift-count
   * mask (`shrl %cl` on a 32-bit operand shifts by `screen & 31`). See the FULL
   * DISASM block in the file header for the line-by-line decode.
   *
   * ORACLE: verified against the live Helium binary. The symbol is EXPORTED
   * (`nm -arch x86_64` type `T` @0x54ad0), so the harness dlopens Helium under
   * `arch -x86_64 /usr/bin/python3` — the port is transcribed from the x86_64
   * slice and calling the arm64 image would compare against code this port did
   * not transcribe — and calls the real method on a 0x200-byte object pre-filled
   * with 0xEE, with the mask dword planted at +0xbc. 1,600 cases (32 masks: 0, 1,
   * 2, 0x80000000, 0xffffffff, 0xAAAAAAAA, 0x55555555, 0xEEEEEEEE + 24 random
   * u32s; x 50 screen indices: -4..39, 63, 64, 127, INT_MAX, INT_MIN, -1):
   * 1600/1600 bit-identical to this port, and 0 cases mutated any byte of the
   * object (it is a pure read), with the real GetVirtualScreenMask @0x54af0
   * confirming the planted dword on every call.
   * NEGATIVE CONTROLS (measured, same 1,600 cases): dropping the negative-screen
   * guard -> 84 wrong; treating screen >= 32 as false instead of masking the
   * shift count to 5 bits -> 170 wrong; always testing bit 0 -> 616 wrong;
   * reading the neighbouring dword at +0xb8 -> 750 wrong.
   *
   * @param screen — the virtual-screen index (SysV %esi, signed int).
   * @returns whether that screen's bit is set in `virtualScreenMask`.
   */
  IsRequestedVirtualScreen(screen: number): boolean {
    // ------------------------------------------------------------
    // @0x54ad0..0x54ad1 — prologue (no TS-visible effect).
    // @0x54ad4 — testl %esi, %esi : flags on `screen & screen`, so SF = bit 31.
    // @0x54ad6 — js 0x54ae6 : taken iff screen < 0.
    // ------------------------------------------------------------
    if (screen < 0) {
      // @0x54ae6 — xorl %eax, %eax ; @0x54ae8 — andb $0x1, %al : return false.
      // @0x54aea..0x54aeb — epilogue + retq.
      return false;
    }
    // ------------------------------------------------------------
    // @0x54ad8 — movl 0xbc(%rdi), %eax : load the u32 mask.
    // @0x54ade — movl %esi, %ecx      : shift count (CL) = screen.
    // @0x54ae0 — shrl %cl, %eax       : logical right shift by (screen & 31).
    //   JS `>>>` applies ToUint32 to both operands and masks the count with
    //   `& 31`, which is exactly the x86 32-bit shift-count rule — so the
    //   screen >= 32 wrap-around is reproduced, not approximated.
    // @0x54ae2 — andb $0x1, %al       : keep bit 0 as the bool result.
    // @0x54ae4..0x54ae5 — epilogue + retq.
    // ------------------------------------------------------------
    return (((this.virtualScreenMask >>> 0) >>> screen) & 1) !== 0;
  }

  /**
   * `HGRenderJob::GetType()` -> `HGRenderJob::Type`
   *   @Helium 0x54730
   *   (__ZN11HGRenderJob7GetTypeEv)
   *
   * The plain reader for the `Type` tag at `this+0x0c` — the exact slot
   * `SetType` @0x54514 writes with `movl %esi, 0xc(%rdi)`. A 5-instruction
   * leaf: no callees, no branches, no validation, no side effects, and the
   * enum value is returned verbatim (nothing is masked or range-checked, so an
   * out-of-enum value set by SetType comes straight back out).
   *
   * Full body from raw-port/re/disasm/Helium.__ZN11HGRenderJob7GetTypeEv.s:
   *
   *   0x54730  pushq %rbp                    ; frame prologue
   *   0x54731  movq  %rsp, %rbp
   *   0x54734  movl  0xc(%rdi), %eax         ; eax = this->_type (u32 @+0x0c)
   *   0x54737  popq  %rbp                    ; epilogue
   *   0x54738  retq
   *   0x54739  nopl  (%rax)                  ; padding — not executed
   *
   * The load is `movl` (32-bit) into `%eax`, and the SysV return convention
   * for a 32-bit enum is `%eax`, so the caller sees an UNSIGNED 32-bit value.
   * `>>> 0` models that; `| 0` would be wrong and the oracle below measures
   * exactly that difference.
   *
   * ORACLE — verified against the live Helium binary. Both this getter
   * (`0000000000054730 T`) and the real `SetType` (`0000000000054510 T`) are
   * exported, so the harness dlopens Helium under `arch -x86_64
   * /usr/bin/python3` (the port is transcribed from the x86_64 slice — see
   * OPS_LOG on the arm64 mismatch) and runs three checks over 3,070 cases
   * (exhaustive 0..63, plus 0x7fffffff / 0x80000000 / 0xffffffff / 0xfffffffe
   * / 0x0000ffff / 0xffff0000, plus 3,000 random u32s):
   *   (a) write the dword at +0x0c directly, call the real getter — 3070/3070
   *       equal to this port;
   *   (b) round-trip through the REAL SetType, then the real getter —
   *       3070/3070, which also confirms getter and setter share one slot;
   *   (c) repeat (a) with the rest of the 0x200-byte object poisoned 0x5A
   *       instead of 0xEE — 3070/3070 unchanged, so no other field is read.
   * NEGATIVE CONTROLS (measured): reading 16 bits instead of 32 -> 3005/3070
   * wrong; reading the neighbouring +0x10 slot -> 3070/3070 wrong; and for
   * signedness, FCP returns 2147483648 for the stored 0x80000000, so `| 0`
   * (which yields -2147483648) is measurably the wrong model.
   *
   * @returns the HGRenderJob::Type enum tag as an unsigned 32-bit value.
   */
  GetType(): HGRenderJobType {
    // ------------------------------------------------------------
    // @0x54730..0x54731 — prologue (no TS-visible effect).
    // @0x54734 — movl 0xc(%rdi), %eax : 32-bit load of the Type slot.
    //   `>>> 0` reproduces the unsigned 32-bit width of the %eax return, so
    //   a field holding 0x80000000 reads back as 2147483648 (what the binary
    //   returns), not -2147483648.
    // @0x54737..0x54738 — epilogue + retq.
    // ------------------------------------------------------------
    return this._type >>> 0;
  }
}

// ============================================================================
// LIBC EXTERN BOUNDARY STUBS
// ============================================================================
// These are out-of-scope externs (libSystem / libc) reached through the
// mach-o "symbol stub for" indirection at the cited addresses. Per the
// DEP-WORKER brief and PORTING_SPEC.md Rule 3, extern C-runtime calls are
// modelled as boundary stubs — they document the ABI they satisfy and
// delegate to a plain-JS equivalent (JS has GC'd strings, so `free` is a
// no-op and `strdup` returns the string as-is; a caller can never observe
// the difference through the HGRenderJob interface because the field is
// only read/written by other HGRenderJob methods that follow the same
// model).

/**
 * libc `void free(void *ptr)` — reached via the mach-o symbol stub at
 * @Helium 0x3c513e (call site: @0x54689 in SetUserName). JS strings are
 * garbage-collected; the machine's semantic guarantee is only "the
 * storage backing `ptr` is released and must not be dereferenced". At
 * the TS boundary the field that held `ptr` is nulled *by the caller*,
 * so there is nothing observable to model. This stub exists to preserve
 * the call-site provenance @0x54689.
 */
function _free(_ptr: string): void {
  // @Helium 0x3c513e (symbol stub for: _free) — libc extern, no-op in JS.
  void _ptr;
}

/**
 * libc `char *strdup(const char *s)` — reached via the mach-o symbol
 * stub at @Helium 0x3c5606 (call site: @0x546a1 in SetUserName). Copies
 * a NUL-terminated C string into a fresh heap allocation and returns
 * that pointer. At the TS boundary the "copy" is just the same
 * immutable string value; JS strings are already value-semantic.
 */
function _strdup(s: string): string {
  // @Helium 0x3c5606 (symbol stub for: _strdup) — libc extern.
  // The value semantics of a JS string equal the "returns a heap copy"
  // contract of C strdup from the caller's perspective.
  return s;
}
