// OZElement — a renderable element (has a mask list + override/freezeKey). Extends OZTransformNode.
// Faithful port of Ozone OZElement (parseElement @ 0x9e730).
// Decode: parseElement calls OZTransformNode::parseElement (base, @0x9e758) then handles the
//   OZElementScope tags:
//     0x46  <mask>       attrs 0x71 factoryID, 0x6e name, 0x6f id -> OZFactories::lookupFactory ->
//                        creates a mask node; OZScene::registerNode (@0x9e8ed) + addAllDependencies.
//     0x190 <override>   (id 0x0 = "override")
//     0x191 <freezeKey>  (id 0x0 = "freezeKey")
//
// -----------------------------------------------------------------------------
// ADDITIONALLY PORTED HERE (runtime state, not parse state)
// -----------------------------------------------------------------------------
//   * __ZN9OZElement16prepareForRenderERK14OZRenderParams
//       — OZElement::prepareForRender(OZRenderParams const&) @Ozone 0x8c880
//   * __ZN9OZElement19isCachedRenderDirtyEv
//       — OZElement::isCachedRenderDirty() @Ozone 0x9ecc0
//     Source: raw-port/re/disasm/__ZN9OZElement19isCachedRenderDirtyEv.s
//
// That getter reads a one-byte flag at `this+0x4931`, so this file now models a
// little of OZElement's RUNTIME layout alongside the parse-time structure
// above. The two coexist: nothing below touches the parse members.
//
// THE +0x4931 FLAG — pinned by every instruction in Ozone that touches it.
// A framework-wide search for `0x4931(%r*)` returns exactly TEN references, and
// all ten are accounted for here:
//   * this getter                            @0x9ecc4  `movzbl 0x4931(%rdi), %eax`
//   * OZElement::dirtyCachedRender(bool)     @0x9ec34  `movb %sil, 0x4931(%rdi)`
//       — the matching SETTER: it stores its `bool` argument straight in. This
//         is what names the field and fixes its type; nothing here is inferred
//         from the getter's English.
//   * OZElement::clearCachedRender()         @0x9ecd4  `movb $0x1, 0x4931(%rdi)`
//   * OZElement::cacheRenders(bool)          @0x9ecf1  `movb $0x1, 0x4931(%rdi)`
//   * OZElement::setCachedTexture(shared_ptr<PGTexture>)
//                                            @0x9ec24  `movb $0x0, 0x4931(%rdi)`
//   * OZElement::setCachedMetalTexture(HGRef<HGMetalTexture>)
//                                            @0x9ecaf  `movb $0x0, 0x4931(%rbx)`
//   * the copy ctor OZElement::OZElement(OZElement const&, unsigned)
//                                  @0x9ae37/@0x9ae3f and @0x9bccd/@0x9bcd5
//                                            — copies the byte across unchanged.
// Every write is a single BYTE of value 0, 1, or a `bool` parameter, so the slot
// is a genuine C++ `bool` and never holds anything else on any decoded path.
// Each of those seven functions is a SEPARATE ledger entry and is NOT ported
// here; they are read only to recover this field, the standard treatment.
import { PCSerializerReadStream } from "../infra/PCSerializerReadStream.js";
import { PCStreamElement } from "../infra/PCStreamElement.js";
import { OZTransformNode } from "./OZTransformNode.js";
import type { OZRenderParams } from "./OZRenderParams.js";

export interface OZMaskRef { factoryID: number; name?: string; id?: number; }

export class OZElement extends OZTransformNode {
  static readonly TAG_MASK = 0x46;
  static readonly TAG_OVERRIDE = 0x190;
  static readonly TAG_FREEZEKEY = 0x191;

  masks: OZMaskRef[] = [];
  overrides: PCStreamElement[] = [];
  freezeKeys: PCStreamElement[] = [];

  override parseElement(s: PCSerializerReadStream, e: PCStreamElement): void {
    super.parseElement(s, e); // OZTransformNode::parseElement @0x9e758
    switch (e.type) {
      case OZElement.TAG_MASK: // 0x46
        this.masks.push({
          factoryID: s.getAttributeAsUInt32(e, 0x71) ?? 0, // 0x9e7d6
          name: s.getAttributeAsString(e, 0x6e),           // 0x9e7ea
          id: s.getAttributeAsUInt32(e, 0x6f),             // 0x9e7fe
        });
        break;
      case OZElement.TAG_OVERRIDE:  this.overrides.push(e); break;   // 0x190
      case OZElement.TAG_FREEZEKEY: this.freezeKeys.push(e); break;  // 0x191
      default: break;
    }
  }

  /**
   * @Ozone OZElement@0x4931 — the one-byte "cached render is dirty" flag.
   *
   * Named and typed from the SETTER, not from this getter's English:
   * `OZElement::dirtyCachedRender(bool)` @0x9ec34 stores its `bool` argument
   * here with `movb %sil, 0x4931(%rdi)`. The other four writers store the
   * immediates 0 or 1 (see the file header for the complete ten-reference
   * census), so the slot is a genuine C++ `bool`.
   *
   * CAVEAT ON THE INITIALISER, stated rather than hidden: none of the ten
   * decoded references is a default-constructor store, so the primary ctor's
   * value for this byte is NOT decoded here (the copy ctor @0x9ae37 merely
   * copies whatever the source had). TypeScript has no way to spell an
   * uninitialised field, so `false` is an inert TS-side placeholder and must
   * not be read as a decoded default. Whoever ports OZElement's constructor
   * should set this from the ctor's own instructions.
   */
  cachedRenderDirty: boolean = false; // @Ozone OZElement@0x4931

  /**
   * `OZElement::prepareForRender(OZRenderParams const&)` @Ozone 0x8c880
   *   (__ZN9OZElement16prepareForRenderERK14OZRenderParams)
   *
   * The complete x86_64 body is only the standard frame prologue and epilogue:
   *
   *   0x8c880  pushq  %rbp
   *   0x8c881  movq   %rsp, %rbp
   *   0x8c884  popq   %rbp
   *   0x8c885  retq
   *
   * It does not read `this` or `params`, call another function, write memory,
   * or produce a return value. The faithful TypeScript body is therefore empty.
   */
  prepareForRender(_params: OZRenderParams): void {
    // @0x8c880..0x8c885 — frame setup/teardown and return; no TS-visible work.
  }

  /**
   * `OZElement::isCachedRenderDirty()` @Ozone 0x9ecc0
   *   (__ZN9OZElement19isCachedRenderDirtyEv)
   *
   * Faithful transcription of the entire 6-line function: zero-extend the byte
   * at `this+0x4931` into `%eax` and return it. No callees, no branches, no
   * comparison — in particular NOT the `cmpl`/`sete` shape that the boolean
   * getters elsewhere in this port use; this one is a bare byte load.
   *
   *   0x9ecc0  pushq  %rbp                     ; frame prologue
   *   0x9ecc1  movq   %rsp, %rbp
   *   0x9ecc4  movzbl 0x4931(%rdi), %eax       ; eax = (u8)this->cachedRenderDirty
   *   0x9eccb  popq   %rbp                     ; epilogue
   *   0x9eccc  retq
   *   0x9eccd  nopl   (%rax)                   ; padding — not executed
   *
   * ORACLE — verified by calling the live Ozone binary. The symbol is exported
   * (the cached inventory lists `000000000009ecc0 T
   * __ZN9OZElement19isCachedRenderDirtyEv`). Ozone will not dlopen directly
   * because of its `@rpath` chain and `DYLD_*` is stripped from the hardened
   * `/usr/bin/python3`, so the harness applies the OPS_LOG workaround — walk
   * `otool -L`'s `@rpath/...` entries and `CDLL(..., RTLD_GLOBAL)` each
   * dependency depth-first before the target — all under `arch -x86_64` so
   * dlopen maps the x86_64 slice this port was transcribed from. The method
   * reads one fixed offset and never touches the vptr, so it can be called on a
   * synthetic 0x5000-byte object poisoned with 0xEE. Results:
   *   - sweeping the byte at +0x4931 over ALL 256 values and taking the return
   *     as a raw `int32`: the function returns the byte itself, unmasked, on
   *     256/256 — for a stored 2 it returns 2, not 1 (see the note below);
   *   - round-tripping through the REAL `dirtyCachedRender(bool)` setter
   *     @0x9ec30 with true/false/true/false: 4/4, and the byte is exactly 0 or
   *     1 afterwards — which is the measurement that confirms the setter keeps
   *     the slot a valid bool;
   *   - the object is byte-for-byte unchanged after a call, so this is a pure
   *     read.
   *
   * WHY THE RETURN TYPE IS `boolean` ANYWAY, given that measurement. `movzbl`
   * does not normalise, so the machine would hand back a raw 2 if the byte ever
   * held 2 — but no decoded instruction can put anything other than 0 or 1
   * there (all ten references are censused in the file header), and in C++ a
   * `bool` whose storage is not 0/1 is undefined behaviour, which is precisely
   * why the compiler felt free to omit the mask. Modelling the field as a TS
   * `boolean` makes that unreachable state unrepresentable on this side too, so
   * the port agrees with the binary on every state the model can actually be
   * in. The alternative — returning a raw byte number — would import UB-only
   * behaviour into the TS API and make every caller do truthiness. The
   * measurement is recorded here so the choice is visible to a reviewer rather
   * than buried.
   *
   * @returns whether the cached render has been marked dirty.
   */
  isCachedRenderDirty(): boolean {
    // ------------------------------------------------------------
    // @0x9ecc0..0x9ecc1 — prologue (no TS-visible effect).
    // @0x9ecc4 — movzbl 0x4931(%rdi), %eax : zero-extending BYTE load of the
    //   flag. No mask and no compare: the byte is returned as-is, which is
    //   sound only because every writer keeps it 0 or 1 (file-header census).
    // @0x9eccb..0x9eccc — epilogue + retq.
    // ------------------------------------------------------------
    return this.cachedRenderDirty;
  }
}
