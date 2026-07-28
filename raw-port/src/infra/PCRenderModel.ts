// PCRenderModel — ProCore.framework. Small render/working-gamut config object owned by
// the render engine: encapsulates the target platform Type (macOS/iOS-A/iOS-B), two
// PCColorSpaceHandle members (SDR-Rec709 vs sRGB working color spaces), and two blending
// gamma floats indexed by PCWorkingGamutValue.
//
// Layout recovered from the C2 ctor + accessor disassembly:
//   +0x00 Type type                              (u32; enum PCRenderModel::Type — 0/1/2 seen)
//   +0x08 PCColorSpaceHandle workingCS[0]        (video gamut — Rec.709 / working[0])
//   +0x10 PCColorSpaceHandle workingCS[1]        (sRGB gamut  — sRGB    / working[1])
//   +0x18 float blendingGamma[0]                 (default blending gamma — video gamut)
//   +0x1c float blendingGamma[1]                 (sRGB blending gamma — hard-coded 1.956)
// (PCColorSpaceHandle is a PCCFRef<CGColorSpace*>, one pointer wide, so each slot is 8 bytes.)
//
// Ported methods (each cites its @0xADDR):
//   @ProCore 0x00051a1e  PCRenderModel::getDefaultBlendingGamma()          -> float
//   @ProCore 0x00051a2c  PCRenderModel::PCRenderModel(Type)                (C2 base ctor)
//   @ProCore 0x00051acc  PCRenderModel::PCRenderModel(Type)                (C1 complete ctor; tail-jmp to C2)
//   @ProCore 0x00051ad6  PCRenderModel::getType() const
//   @ProCore 0x00051ade  PCRenderModel::is_macOS() const
//   @ProCore 0x00051aea  PCRenderModel::is_iOS() const
//   @ProCore 0x00051afa  PCRenderModel::getWorkingColorSpace(PCWorkingGamutValue) const
//   @ProCore 0x00051b1e  PCRenderModel::getBlendingGamma(PCWorkingGamutValue) const
//   @ProCore 0x00051bb4  PCRenderModel::~PCRenderModel()
//
// Numeric constants (each cites the address it was read from):
//   ProCore __TEXT __const 0x00125770  float 0x3ffa5e35 = 1.9559999704360962   (default blending gamma / Rec.709)
//   ProCore __TEXT __const 0x00125778  float 0x3ffa5e35 = 1.9559999704360962   (table[0])
//   ProCore __TEXT __const 0x0012577c  float 0x3f800347 = 1.000100016593933    (table[1] — iOS/HDR gamma)
//   Ctor immediate at 0x00051aa6:      float 0x3ffa5e35 = 1.9559999704360962   (blendingGamma[1] = 1.956)
//
// Referenced ProCore symbols (undecoded; each stub below cites its own addr):
//   @ProCore 0x00051a50  PCColorSpaceCache::sRGB()                        __ZN17PCColorSpaceCache4sRGBEv
//   @ProCore 0x00051a5a  PCColorSpaceCache::rec709()                      __ZN17PCColorSpaceCache6rec709Ev
//   @ProCore call to     _PCGetWorkingColorSpace                          (C stub; called with 0 then 1)
//   @ProCore 0x00051a6e  PCColorSpaceHandle::PCColorSpaceHandle(CGColorSpace*) __ZN18PCColorSpaceHandleC1EP12CGColorSpace
//   @ProCore 0x00051b17  PCColorSpaceHandle::getCGColorSpace() const      __ZNK18PCColorSpaceHandle15getCGColorSpaceEv
//   @ProCore 0x00051bc1  PCCFRef<CGColorSpace*>::~PCCFRef()               __ZN7PCCFRefIP12CGColorSpaceED2Ev
//
// Source disassembly:
//   raw-port/re/disasm/ProCore.PCRenderModel.getDefaultBlendingGamma.s
//   raw-port/re/disasm/ProCore.PCRenderModel.getType.s
//   raw-port/re/disasm/ProCore.PCRenderModel.is_macOS.s
//   raw-port/re/disasm/ProCore.PCRenderModel.is_iOS.s
//   raw-port/re/disasm/ProCore.PCRenderModel.getWorkingColorSpace.s
//   raw-port/re/disasm/ProCore.PCRenderModel.getBlendingGamma.s
//   raw-port/re/disasm/ProCore.PCRenderModel.~PCRenderModel.s
//   (C1/C2 ctors extracted from /tmp/ProCore_tV.txt by label; see doc-comment above.)

/**
 * PCRenderModel::Type — 3 values observed (0/1/2).
 *  is_macOS() returns (type == 0)     — @ProCore 0x00051ade
 *  is_iOS()   returns (type-1 <u 2)   — @ProCore 0x00051aea, i.e. type ∈ {1,2}
 * So: 0 = macOS, 1 = iOS_A, 2 = iOS_B (the exact iOS discriminant is not disclosed by
 * these three methods — we preserve the raw discriminator).
 */
export enum PCRenderModel_Type {
    macOS = 0,
    iOS_A = 1,
    iOS_B = 2,
}

/**
 * PCWorkingGamutValue — the argument type of getWorkingColorSpace/getBlendingGamma.
 * getWorkingColorSpace switches on this: 0 -> this+0x8, 1 -> this+0x10, else -> no-op return.
 * Only the two mapped values are decoded here; other values fall through to an
 * undecoded default and the getters return the last xmm0 the compiler happened to leave
 * (real UB — represented as a throw here rather than a silent value).
 * @ProCore 0x00051afa (getWorkingColorSpace switch)
 */
export enum PCWorkingGamutValue {
    Video_Rec709 = 0,
    sRGB         = 1,
}

// -----------------------------------------------------------------------------
// Referenced-but-not-yet-transcribed ProCore symbols. Each stub cites the exact
// call site so frontier.py can pick them up.
// -----------------------------------------------------------------------------

/** @ProCore 0x00051a50  __ZN17PCColorSpaceCache4sRGBEv */
function PCColorSpaceCache_sRGB(_out_handle_ptr: unknown): void {
    throw new Error("PCColorSpaceCache::sRGB @ProCore 0x00051a50 not yet transcribed");
}

/** @ProCore 0x00051a5a  __ZN17PCColorSpaceCache6rec709Ev */
function PCColorSpaceCache_rec709(_out_handle_ptr: unknown): void {
    throw new Error("PCColorSpaceCache::rec709 @ProCore 0x00051a5a not yet transcribed");
}

/** @ProCore stub call _PCGetWorkingColorSpace (C symbol; called with gamut 0 then 1). */
function PCGetWorkingColorSpace(_gamut: number): unknown {
    throw new Error("_PCGetWorkingColorSpace @ProCore (imported stub, callsites 0x00051a63/0x00051a78) not yet transcribed");
}

/** @ProCore 0x00051a6e  __ZN18PCColorSpaceHandleC1EP12CGColorSpace */
function PCColorSpaceHandle_ctor(_out_handle: unknown, _cg: unknown): void {
    throw new Error("PCColorSpaceHandle::PCColorSpaceHandle(CGColorSpace*) @ProCore 0x00051a6e not yet transcribed");
}

/** @ProCore 0x00051b17  __ZNK18PCColorSpaceHandle15getCGColorSpaceEv */
function PCColorSpaceHandle_getCGColorSpace(_handle_this: unknown): unknown {
    throw new Error("PCColorSpaceHandle::getCGColorSpace() const @ProCore 0x00051b17 not yet transcribed");
}

/** @ProCore 0x00051bc1  __ZN7PCCFRefIP12CGColorSpaceED2Ev */
function PCCFRef_CGColorSpace_dtor(_ref_this: unknown): void {
    throw new Error("PCCFRef<CGColorSpace*>::~PCCFRef() @ProCore 0x00051bc1 not yet transcribed");
}

// -----------------------------------------------------------------------------
// PCRenderModel — struct + methods. Kept as a class-with-fields to mirror the
// binary layout. Fields are ordered exactly as the ctor writes them.
// -----------------------------------------------------------------------------

// Opaque handle placeholder; the real one will replace this when PCColorSpaceHandle lands.
type PCColorSpaceHandle = unknown;

export class PCRenderModel {
    // +0x00
    private type: PCRenderModel_Type;
    // +0x08  workingCS[0] — Rec.709 for type==macOS(0), sRGB for type==iOS_A(1), else
    //        _PCGetWorkingColorSpace(0). Populated in-place by the *Handle ctor.
    private workingCS0: PCColorSpaceHandle;
    // +0x10  workingCS[1] — always _PCGetWorkingColorSpace(1) wrapped in a handle.
    private workingCS1: PCColorSpaceHandle;
    // +0x18  blendingGamma[0] — table @ 0x125778 indexed by ((type-1) <u 2).
    private blendingGamma0: number;
    // +0x1c  blendingGamma[1] — hard-coded 1.9559999704360962 (movl $0x3ffa5e35).
    private blendingGamma1: number;

    /**
     * @ProCore 0x00051a2c  PCRenderModel::PCRenderModel(Type)   (C2 — base ctor)
     * @ProCore 0x00051acc  PCRenderModel::PCRenderModel(Type)   (C1 — complete ctor;
     *   its body is `pushq/movq/popq; jmp C2` so we implement C1 by delegating.)
     *
     * Line-by-line mirror of C2:
     *   mov  esi, this[0]              ; store type at +0x00
     *   lea  r15, this+0x8             ; addr of workingCS[0]
     *   cmp  esi, 2 ; je  branch_iOS_B ; type == 2 -> rec709
     *   cmp  esi, 1 ; jne branch_other ; type != 1 -> _PCGetWorkingColorSpace(0)
     *   ; else type == 1: call PCColorSpaceCache::sRGB(&workingCS[0])
     *   ; else type == 2: call PCColorSpaceCache::rec709(&workingCS[0])
     *   ; else (type==0):
     *   ;   rax = _PCGetWorkingColorSpace(0)
     *   ;   PCColorSpaceHandle(&workingCS[0], rax)
     *   ; fallthrough:
     *   rax = _PCGetWorkingColorSpace(1)
     *   PCColorSpaceHandle(this+0x10, rax)
     *   dec  r14d ; xor eax,eax ; cmp r14d,2 ; setb al   (al = ((type-1) <u 2))
     *   lea  rcx, [0x125778]                             (float table)
     *   movss xmm0, [rcx + rax*4] ; movss this+0x18, xmm0
     *   movl  this+0x1c, 0x3ffa5e35                       (=1.956f)
     */
    constructor(type: PCRenderModel_Type) {
        // this[0] = type
        this.type = type;

        // Branch on type (mirrors the je/jne cascade).
        if (type === 2) {
            // 0x51a57: rec709(&workingCS[0])
            this.workingCS0 = {} as PCColorSpaceHandle;
            PCColorSpaceCache_rec709(this.workingCS0);
        } else if (type === 1) {
            // 0x51a50: sRGB(&workingCS[0])
            this.workingCS0 = {} as PCColorSpaceHandle;
            PCColorSpaceCache_sRGB(this.workingCS0);
        } else {
            // 0x51a61-0x51a6e: PCColorSpaceHandle(&workingCS[0], _PCGetWorkingColorSpace(0))
            const cg0 = PCGetWorkingColorSpace(0);
            this.workingCS0 = {} as PCColorSpaceHandle;
            PCColorSpaceHandle_ctor(this.workingCS0, cg0);
        }

        // Fallthrough at 0x51a73: PCColorSpaceHandle(&workingCS[1], _PCGetWorkingColorSpace(1))
        const cg1 = PCGetWorkingColorSpace(1);
        this.workingCS1 = {} as PCColorSpaceHandle;
        PCColorSpaceHandle_ctor(this.workingCS1, cg1);

        // 0x51a89-0x51aa1: al = ((type-1) <u 2); blendingGamma0 = table[al]
        //   table @ ProCore __TEXT __const 0x00125778:
        //     [0] = 0x3ffa5e35 (1.9559999704360962)
        //     [1] = 0x3f800347 (1.000100016593933)
        const idx: number = (((type - 1) >>> 0) < 2) ? 1 : 0;
        const BLEND_TABLE: readonly number[] = [
            Math.fround(1.9559999704360962), // 0x3ffa5e35 @ 0x00125778
            Math.fround(1.000100016593933),  // 0x3f800347 @ 0x0012577c
        ];
        this.blendingGamma0 = Math.fround(BLEND_TABLE[idx]);

        // 0x51aa6: movl this+0x1c, 0x3ffa5e35 (= 1.956f)
        this.blendingGamma1 = Math.fround(1.9559999704360962);
    }

    /**
     * @ProCore 0x00051a1e  PCRenderModel::getDefaultBlendingGamma()
     *   movss xmm0, [rip+0xd3d46]   ; RIP=0x51a2a + 0xd3d46 = 0x125770
     *   ret
     * Const at ProCore __TEXT __const 0x00125770: 0x3ffa5e35 = 1.9559999704360962.
     * Note: this is a plain (non-member) static, exposed on the class here for locality.
     */
    static getDefaultBlendingGamma(): number {
        return Math.fround(1.9559999704360962); // @ 0x00125770
    }

    /**
     * @ProCore 0x00051ad6  PCRenderModel::getType() const
     *   mov eax, [rdi]  ; ret          -> reads this+0x00 (the type u32).
     */
    getType(): PCRenderModel_Type {
        return this.type;
    }

    /**
     * @ProCore 0x00051ade  PCRenderModel::is_macOS() const
     *   cmp [rdi], 0 ; sete al ; ret    -> (type == 0).
     */
    is_macOS(): boolean {
        return this.type === 0;
    }

    /**
     * @ProCore 0x00051aea  PCRenderModel::is_iOS() const
     *   mov eax, [rdi] ; dec eax ; cmp eax, 2 ; setb al ; ret
     * -> ((type - 1) <u 2), i.e. type ∈ {1, 2}.
     */
    is_iOS(): boolean {
        // unsigned-less-than mirror of the asm
        const t = (this.type - 1) >>> 0;
        return t < 2;
    }

    /**
     * @ProCore 0x00051afa  PCRenderModel::getWorkingColorSpace(PCWorkingGamutValue) const
     *   test esi,esi ; je case0
     *   cmp esi,1    ; jne default_return
     *   mov eax, 0x10 ; jmp tail
     * case0:
     *   mov eax, 0x8
     * tail:
     *   add rdi, rax
     *   jmp PCColorSpaceHandle::getCGColorSpace()
     * default_return:
     *   ret     (returns whatever is in rax/xmm0 — undecoded UB)
     *
     * We faithfully reproduce: gamut==0 -> handle at +0x8; gamut==1 -> handle at +0x10;
     * otherwise the source path returns an undefined value with no valid handle target —
     * we throw rather than fabricate one.
     */
    getWorkingColorSpace(gamut: PCWorkingGamutValue): unknown {
        if (gamut === 0) {
            // add rdi, 0x8 ; jmp getCGColorSpace
            return PCColorSpaceHandle_getCGColorSpace(this.workingCS0);
        } else if (gamut === 1) {
            // mov eax, 0x10 ; add rdi, rax ; jmp getCGColorSpace
            return PCColorSpaceHandle_getCGColorSpace(this.workingCS1);
        } else {
            // 0x51b1c: popq rbp ; retq — no valid handle addr computed; caller reads a
            // register the compiler happened to leave. That's UB; refuse to fabricate.
            throw new Error(
                "PCRenderModel::getWorkingColorSpace @ProCore 0x00051afa: default path at " +
                "0x00051b1c returns an undecoded (UB) value for gamut " + String(gamut),
            );
        }
    }

    /**
     * @ProCore 0x00051b1e  PCRenderModel::getBlendingGamma(PCWorkingGamutValue) const
     *   cmp  esi, 1 ; je  gamma_1
     *   test esi,esi; jne default_return
     *   movss xmm0, [rdi + 0x18]  ; jmp tail    (gamut == 0)
     * gamma_1:
     *   movss xmm0, [rdi + 0x1c]                (gamut == 1)
     * tail:
     *   ret
     * default_return:
     *   ret     (returns whatever xmm0 is — undecoded)
     */
    getBlendingGamma(gamut: PCWorkingGamutValue): number {
        if (gamut === 1) {
            return Math.fround(this.blendingGamma1); // this+0x1c
        } else if (gamut === 0) {
            return Math.fround(this.blendingGamma0); // this+0x18
        } else {
            throw new Error(
                "PCRenderModel::getBlendingGamma @ProCore 0x00051b1e: default path at " +
                "0x00051b37 returns undecoded xmm0 for gamut " + String(gamut),
            );
        }
    }

    /**
     * @ProCore 0x00051bb4  PCRenderModel::~PCRenderModel()
     *   ; call PCCFRef::~PCCFRef(this+0x10)   (workingCS[1])
     *   ; tail-jmp PCCFRef::~PCCFRef(this+0x8) (workingCS[0])
     * Two handle refs are released in reverse construction order (both PCCFRef<CGColorSpace*>).
     * (The struct's plain floats need no explicit cleanup.)
     */
    destroy(): void {
        PCCFRef_CGColorSpace_dtor(this.workingCS1);
        PCCFRef_CGColorSpace_dtor(this.workingCS0);
    }
}
