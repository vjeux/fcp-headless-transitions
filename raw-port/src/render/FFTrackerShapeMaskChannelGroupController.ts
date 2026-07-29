// FFTrackerShapeMaskChannelGroupController.ts — Flexo ObjC class.
//
// A tiny ObjC subclass of ProInspector's `OZFolderGroupController` (identified via
// dyld_info -fixups on __DATA,__objc_data @0x01c3e850: bind → ProInspector/
// _OBJC_CLASS_$_OZFolderGroupController). The subclass overrides ONE selector:
//
//   -[FFTrackerShapeMaskChannelGroupController augmentEnclosedGroup:withFolder:context:]
//     @Flexo 0x000000000064abe0
//
// Purpose (recovered from the disasm chain): after the base class builds the group's
// inspector UI, this override reaches into the runtime-typed channel folder to find
// the tracker's "analysis method" enum channel, extract its integer point-value, and
// feed it into a follow-up `augmentUIWithChan:context:` call on the enclosing group,
// then locks that added row so the user can't hide the tracker's analysis-method
// channel from the visibility control.
//
// Provenance: /Applications/Final Cut Pro.app/Contents/Frameworks/
//             Flexo.framework/Versions/A/Flexo (x86_64 slice).
// Disasm saved: raw-port/re/disasm/Flexo.FFTrackerShapeMaskChannelGroupController.augmentEnclosedGroup_withFolder_context.s
//
// nm -n Flexo (x86_64) confirms the sole method symbol:
//   000000000064abe0 t -[FFTrackerShapeMaskChannelGroupController augmentEnclosedGroup:withFolder:context:]
//
// ObjC class metadata (from __objc_data @0x01c3e848):
//   isa        → metaclass @0x1c3e870  (this class's metaclass)
//   superclass → bind ProInspector/_OBJC_CLASS_$_OZFolderGroupController   (@Flexo __DATA 0x01c3e850)
//   cache      → bind libobjc/__objc_empty_cache
//
// SELECTORS SENT (resolved by chasing __objc_selrefs -> __objc_methname):
//   0x1bd5818 → "augmentEnclosedGroup:withFolder:context:"   (used for the super2 call)
//   0x1bd5820 → "analysisMethodChannel"                       (on the FFTrackerShapeMask)
//   0x1bbb108 → "pointValue"                                  (on the enum channel)
//   0x1bbcb88 → "augmentUIWithChan:context:"                  (on the enclosingGroup)
//   0x1bd5828 → "setIgnoreChanVisibilityState:"               (on the added UI row)
//
// EXTERNAL C++ TYPE:
//   FFOZRiggedChannelFolder (typeinfo __ZTI23FFOZRiggedChannelFolder @0x18f6448) —
//   a Flexo-defined subclass of ProChannel's OZChannelFolder (typeinfo
//   __ZTI15OZChannelFolder). The runtime dispatch `__dynamic_cast(from=OZChannelFolder,
//   to=FFOZRiggedChannelFolder, hint=0)` is performed on the raw `folder` argument to
//   safely down-cast. Field @+0x80 on the down-cast is a retained
//   `FFTrackerShapeMask*` (an ObjC id, confirmed by the fact that the very next
//   instruction sends it the -analysisMethodChannel selector, which is defined
//   on FFTrackerShapeMask @Flexo 0x000000000062a720).
//
// FAITHFUL CONTROL FLOW (line-by-line from the 49-line disasm):
//
//   push rbp / mov rbp,rsp / push r15/r14/r12/rbx / sub rsp,0x10       -- prologue
//   mov rbx,r8     ; save arg4  (id context)                            @0x64abef
//   mov r12,rcx    ; save arg3  (OZChannelFolder* folder)               @0x64abf2
//   mov r14,rdx    ; save arg2  (id enclosingGroup)                     @0x64abf5
//   mov -0x30(%rbp),rdi  ; save self  →  super2 struct base             @0x64abf8
//
//   ; --- 1. `id result = [super augmentEnclosedGroup:enclosingGroup withFolder:folder
//   ;         context:context];`  (objc_msgSendSuper2 packs {self, class} at rdi)
//   mov rax,[rip+ObjcClassRef_self]           ; class @ 0x64abfc         (super2 needs it)
//   mov -0x28(%rbp),rax                       ; store into super struct  (super struct = {self,class})
//   mov rsi,[rip+SEL:augmentEnclosedGroup...] ; @0x64ac07
//   lea rdi,-0x30(%rbp)                       ; &super struct            @0x64ac0e
//   ;                                          ; NOTE: r14/r12/rbx already hold the 3 args
//   callq __objc_msgSendSuper2                ; @0x64ac12
//   mov r15,rax                               ; result = super's return  @0x64ac17
//
//   ; --- 2. `FFOZRiggedChannelFolder* rigged =
//   ;         dynamic_cast<FFOZRiggedChannelFolder*>(folder);`
//   mov rsi,[rip+&_ZTI15OZChannelFolder]      ; from-type-info (base)    @0x64ac1a
//   lea rdx,[_ZTI23FFOZRiggedChannelFolder]   ; to-type-info (derived)   @0x64ac21
//   mov rdi,r12                               ; src = folder             @0x64ac28
//   xor ecx,ecx                               ; hint = 0                 @0x64ac2b
//   callq __dynamic_cast                      ; @0x64ac2d  -> rax = rigged (or null)
//
//   ; --- 3. `id tracker = rigged->trackerShapeMask_ivar (at +0x80);`
//   mov rdi,0x80(%rax)                        ; +0x80 field (FFTrackerShapeMask*)  @0x64ac32
//
//   ; --- 4. `id chan = [tracker analysisMethodChannel];`
//   mov rsi,[rip+SEL:analysisMethodChannel]   ; @0x64ac39
//   mov r12,[rip+&objc_msgSend]               ; cache msgSend in r12     @0x64ac40
//   callq *r12                                ; @0x64ac47  -> rax = chan
//
//   ; --- 5. `NSInteger pointVal = [chan pointValue];`
//   mov rsi,[rip+SEL:pointValue]              ; @0x64ac4a
//   mov rdi,rax                               ; receiver = chan          @0x64ac51
//   callq *r12                                ; @0x64ac54  -> rax = pointValue
//
//   ; --- 6. `id row = [enclosingGroup augmentUIWithChan:pointVal context:context];`
//   mov rsi,[rip+SEL:augmentUIWithChan:...]   ; @0x64ac57
//   mov rdi,r14                               ; receiver = enclosingGroup @0x64ac5e
//   mov rdx,rax                               ; arg1 = pointVal (integer) @0x64ac61
//   mov rcx,rbx                               ; arg2 = context            @0x64ac64
//   callq *r12                                ; @0x64ac67  -> rax = added UI row
//
//   ; --- 7. `[row setIgnoreChanVisibilityState:YES];`
//   mov rsi,[rip+SEL:setIgnoreChanVisibilityState:]  ; @0x64ac6a
//   mov rdi,rax                               ; receiver = row            @0x64ac71
//   mov edx,1                                 ; YES                       @0x64ac74
//   callq *r12                                ; @0x64ac79  -> rax discarded
//
//   ; --- 8. `return result;`  (the super's return value)
//   mov rax,r15                               ; @0x64ac7c
//   ; epilogue: add rsp,0x10; pop rbx/r12/r14/r15/rbp; ret
//
// NOTE: r15 (=super's return, i.e. the initial UI row for the "enclosed group" itself)
// is preserved across all inner calls precisely because the class wants to hand it back
// to the caller — the augmentUIWithChan row is a DIFFERENT row (the tracker's analysis-
// method sub-row), which is why r15 (the original enclosed-group row) is returned and
// the augmentUIWithChan row is only mutated (setIgnoreChanVisibilityState:) and dropped
// on the floor. This is a real detail of the FCP UI (locking the tracker's analysis-
// method channel visibility) so we mirror it exactly.

/**
 * External-runtime stubs. These types are real ObjC classes / C++ types that live in
 * OTHER Flexo/ProChannel/ProInspector translation units. They are shown here as bare
 * interfaces so this class's control flow can be modeled 1:1; each field/selector
 * that this file references is documented with the FCP address that reads/sends it.
 */

/**
 * `OZChannelFolder` — base class from ProChannel (also ported at
 * raw-port/src/channels/OZChannelFolder.ts). Used only as the source type of the
 * runtime `__dynamic_cast` at @Flexo 0x000000000064ac2d.
 * Typeinfo symbol: `_ZTI15OZChannelFolder` @0x18e9bb8.
 */
export interface OZChannelFolder_External {
  // opaque — the down-cast is what matters, not the base fields.
  readonly __ozChannelFolder: true;
}

/**
 * `FFOZRiggedChannelFolder` — Flexo C++ subclass of OZChannelFolder. Its layout
 * has (at +0x80) a retained `FFTrackerShapeMask*` — the tracker whose UI this
 * controller augments. Recovery: the load `mov 0x80(%rax),%rdi` @0x64ac32
 * feeds a `-analysisMethodChannel` message; that selector is implemented on
 * `FFTrackerShapeMask` (@Flexo 0x000000000062a720) and only on that class in
 * this framework, so +0x80 must be a `FFTrackerShapeMask*`.
 * Typeinfo symbol: `_ZTI23FFOZRiggedChannelFolder` @0x18f6448.
 */
export interface FFOZRiggedChannelFolder_External extends OZChannelFolder_External {
  /** +0x80: retained FFTrackerShapeMask. @Flexo 0x000000000064ac32 */
  readonly trackerShapeMask: FFTrackerShapeMask_External;
}

/**
 * `FFTrackerShapeMask` — Flexo ObjC class. This file only touches its
 * `-analysisMethodChannel` accessor (@Flexo 0x000000000062a720), which returns the
 * enum channel that models the tracker's analysis method (e.g. "auto" / "point"
 * / "shape" — the actual enum values live in .motr templates, out of scope here).
 */
export interface FFTrackerShapeMask_External {
  /** -[FFTrackerShapeMask analysisMethodChannel] @Flexo 0x000000000062a720 */
  analysisMethodChannel(): OZChannelEnum_External;
}

/**
 * The concrete channel returned by `-analysisMethodChannel`. The disasm only
 * sends it `-pointValue`, so we only model that selector here (the base channel
 * hierarchy — OZChannel/OZChannelEnum — lives in ProChannel and is ported
 * separately). `pointValue` returns an NSInteger (the enum's current integer).
 */
export interface OZChannelEnum_External {
  /** Returns the current integer sample of the enum channel. */
  pointValue(): number;
}

/**
 * `OZFolderGroupController` — the ProInspector ObjC superclass of this class.
 * External bind confirmed by `dyld_info -fixups` on
 * `__DATA,__objc_data` @0x01c3e850 → `ProInspector/_OBJC_CLASS_$_OZFolderGroupController`.
 * We model only the one virtual selector the subclass overrides.
 *
 * The base's `-augmentEnclosedGroup:withFolder:context:` returns the newly-created
 * inspector UI row for the enclosed group; the subclass calls this via
 * objc_msgSendSuper2 and simply RETURNS that row unchanged (after augmenting with
 * an extra analysis-method sub-row, which it locks and drops).
 */
export interface OZFolderGroupController_External {
  augmentEnclosedGroup(
    enclosingGroup: EnclosingGroup_External,
    folder: OZChannelFolder_External,
    context: unknown,
  ): EnclosedGroupRow_External;
}

/** The enclosing inspector group — receives `-augmentUIWithChan:context:`. */
export interface EnclosingGroup_External {
  /**
   * @Flexo 0x000000000064ac67  callq *objc_msgSend
   * SEL: `augmentUIWithChan:context:` (selref @0x1bbcb88)
   * Returns the newly-created row for the added channel.
   */
  augmentUIWithChanContext(chan: number, context: unknown): EnclosedGroupRow_External;
}

/**
 * A UI row returned by both `-augmentEnclosedGroup:...` (base) and
 * `-augmentUIWithChan:context:` — the subclass only touches the row-of-a-chan
 * via `-setIgnoreChanVisibilityState:` (locks the visibility toggle for that
 * row so the user can't hide the analysis-method channel).
 */
export interface EnclosedGroupRow_External {
  /**
   * @Flexo 0x000000000064ac79  callq *objc_msgSend
   * SEL: `setIgnoreChanVisibilityState:` (selref @0x1bd5828)
   */
  setIgnoreChanVisibilityState(ignore: boolean): void;
}

/**
 * `__dynamic_cast` — C++ RTTI down-cast (from libc++abi). Returns the cast pointer,
 * or `null` if the object isn't of the target type / typeinfos don't match.
 *
 * @Flexo 0x000000000064ac2d  callq __stubs:___dynamic_cast
 */
declare function dynamic_cast_FFOZRiggedChannelFolder(
  from: OZChannelFolder_External,
): FFOZRiggedChannelFolder_External | null;

/**
 * ObjC class `FFTrackerShapeMaskChannelGroupController`.
 *
 * A ProInspector `OZFolderGroupController` subclass that adds a locked
 * "analysis method" row to a tracker's shape-mask inspector group.
 *
 * @see raw-port/re/disasm/Flexo.FFTrackerShapeMaskChannelGroupController.augmentEnclosedGroup_withFolder_context.s
 */
export class FFTrackerShapeMaskChannelGroupController implements OZFolderGroupController_External {
  /**
   * -[FFTrackerShapeMaskChannelGroupController augmentEnclosedGroup:withFolder:context:]
   *
   * @Flexo 0x000000000064abe0
   *
   * Behavior (exact transcription of the 49-line disasm):
   *   1. Delegate to `super` to build the base enclosed-group row.
   *   2. Down-cast the raw `folder` argument to a Flexo `FFOZRiggedChannelFolder`
   *      via `__dynamic_cast` (returns the derived pointer, or null if the base
   *      isn't actually rigged).
   *   3. Reach into the rigged folder at C++ field +0x80 to get the underlying
   *      `FFTrackerShapeMask` object.
   *   4. Ask the tracker for its `analysisMethodChannel` — an enum channel that
   *      models the current tracker mode.
   *   5. Sample that channel with `-pointValue` to get its current integer.
   *   6. Ask `enclosingGroup` to append a UI row for that integer channel via
   *      `-augmentUIWithChan:context:`.
   *   7. Lock the newly-added row's visibility toggle with
   *      `-setIgnoreChanVisibilityState:YES` so the user cannot hide it.
   *   8. Return the ORIGINAL row (step 1's return value), NOT the row from
   *      step 6 — that row is created purely for the side-effect of appending
   *      it to the enclosing group.
   *
   * NOTE: this method throws if `dynamic_cast_FFOZRiggedChannelFolder` returns
   * null — the disasm dereferences `+0x80(%rax)` unconditionally, so in the
   * running FCP binary that path is a hard segfault if the folder isn't rigged.
   * Callers only invoke this override when the base's controller-class dispatch
   * (keyed on the folder's runtime class) has already narrowed to this subclass,
   * so the down-cast is guaranteed to succeed in practice.
   */
  augmentEnclosedGroup(
    enclosingGroup: EnclosingGroup_External,
    folder: OZChannelFolder_External,
    context: unknown,
  ): EnclosedGroupRow_External {
    // 1. [super augmentEnclosedGroup:enclosingGroup withFolder:folder context:context]
    //    @0x64abfc..0x64ac17 — objc_msgSendSuper2 with the same 3 args.
    const superResult: EnclosedGroupRow_External = objc_msgSendSuper2_augmentEnclosedGroup(
      this,
      enclosingGroup,
      folder,
      context,
    );

    // 2. rigged = __dynamic_cast(folder, OZChannelFolder → FFOZRiggedChannelFolder, hint=0)
    //    @0x64ac1a..0x64ac2d
    const rigged = dynamic_cast_FFOZRiggedChannelFolder(folder);
    if (rigged === null) {
      // The FCP binary would segfault here; we surface the invariant loudly instead.
      // (This is not an approximation — the underlying binary really does deref
      //  +0x80(null) if the runtime dispatch is misconfigured; we upgrade that
      //  UB to a loud throw as required by the porting spec.)
      throw new Error(
        "FFTrackerShapeMaskChannelGroupController.augmentEnclosedGroup: folder is not an FFOZRiggedChannelFolder " +
          "(dynamic_cast @0x000000000064ac2d returned null; FCP's binary would segfault on the +0x80 deref @0x64ac32)",
      );
    }

    // 3. tracker = rigged->trackerShapeMask   (+0x80 field of FFOZRiggedChannelFolder)
    //    @0x64ac32
    const tracker: FFTrackerShapeMask_External = rigged.trackerShapeMask;

    // 4. chan = [tracker analysisMethodChannel]      @0x64ac39..0x64ac47
    const chan: OZChannelEnum_External = tracker.analysisMethodChannel();

    // 5. pointVal = [chan pointValue]                @0x64ac4a..0x64ac54
    const pointVal: number = chan.pointValue();

    // 6. addedRow = [enclosingGroup augmentUIWithChan:pointVal context:context]  @0x64ac57..0x64ac67
    const addedRow: EnclosedGroupRow_External = enclosingGroup.augmentUIWithChanContext(
      pointVal,
      context,
    );

    // 7. [addedRow setIgnoreChanVisibilityState:YES]   @0x64ac6a..0x64ac79
    addedRow.setIgnoreChanVisibilityState(true);

    // 8. return superResult (r15 preserved through inner calls)   @0x64ac7c
    return superResult;
  }
}

/**
 * Stub for the ObjC runtime's `objc_msgSendSuper2` — real FCP invokes the base
 * class's implementation of `augmentEnclosedGroup:withFolder:context:` via this
 * primitive. Ported code that runs OFFLINE (without the ObjC runtime, without
 * ProInspector) has no way to actually reach the ProInspector base — this stub
 * is the loud gap that the porting spec requires so callers can never silently
 * skip the super call.
 *
 * @Flexo 0x000000000064ac12  callq __stubs:_objc_msgSendSuper2
 * SEL: `augmentEnclosedGroup:withFolder:context:` (selref @0x1bd5818)
 * Super class: `OZFolderGroupController` (bind @0x1c3e850 →
 *              ProInspector/_OBJC_CLASS_$_OZFolderGroupController)
 */
function objc_msgSendSuper2_augmentEnclosedGroup(
  _self: FFTrackerShapeMaskChannelGroupController,
  _enclosingGroup: EnclosingGroup_External,
  _folder: OZChannelFolder_External,
  _context: unknown,
): EnclosedGroupRow_External {
  throw new Error(
    "objc_msgSendSuper2 [OZFolderGroupController augmentEnclosedGroup:withFolder:context:] " +
      "@Flexo 0x000000000064ac12 not yet transcribed " +
      "(super class OZFolderGroupController lives in ProInspector — external framework, " +
      "external ObjC-runtime call — cannot be executed without the FCP ObjC runtime)",
  );
}
