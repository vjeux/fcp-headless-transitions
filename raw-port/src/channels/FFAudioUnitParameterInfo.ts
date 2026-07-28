// FFAudioUnitParameterInfo.ts — Flexo POD holding a snapshot of an
// AudioUnit parameter's descriptor: id, retained CFString name, flag bits,
// unit tag, clump id, min/max/default float values. Constructor extracts
// this from Core Audio's AudioUnitParameterInfo (as returned by
// kAudioUnitProperty_ParameterInfo). Copy/assign do CFRetain/CFRelease
// bookkeeping on mName.
//
// FRAMEWORK: Flexo.framework (Final Cut Pro).
// BINARY:    /Applications/Final Cut Pro.app/Contents/Frameworks/Flexo.framework/Versions/A/Flexo
// DECODE:    raw-port/re/disasm/Flexo.FFAudioUnitParameterInfo.*.s + /tmp/Flexo_tV.txt
//
// SYMBOLS (from /tmp/Flexo_symmap.tsv):
//   __ZN24FFAudioUnitParameterInfoC1ERKS_                             @0x005328b0
//   __ZN24FFAudioUnitParameterInfoC2ERKS_                             @0x005328b0 (ICF-folded with C1)
//     ; copy-ctor: FFAudioUnitParameterInfo(FFAudioUnitParameterInfo const&)
//   __ZN24FFAudioUnitParameterInfoC1EjRK22AudioUnitParameterInfo      @0x00532900
//   __ZN24FFAudioUnitParameterInfoC2EjRK22AudioUnitParameterInfo      @0x00532900 (ICF-folded with C1)
//     ; ctor: FFAudioUnitParameterInfo(unsigned int id, AudioUnitParameterInfo const&)
//   __ZN24FFAudioUnitParameterInfoD1Ev                                @0x005329b0
//   __ZN24FFAudioUnitParameterInfoD2Ev                                @0x00532990
//     ; dtor (D1 and D2 are the same body): CFRelease(mName) if nonzero.
//   __ZN24FFAudioUnitParameterInfoaSERKS_                             @0x005329d0
//     ; operator=(FFAudioUnitParameterInfo const&)
//   __ZNK24FFAudioUnitParameterInfo6EqualsERKS_                       @0x00532a40
//     ; bool Equals(FFAudioUnitParameterInfo const&) const
//
// INSTANCE LAYOUT (recovered from the ctors + Equals):
//   +0x00  uint32   mParameterID       (copied as movl)
//   +0x04  uint32   -- padding, unused
//   +0x08  CFStringRef mName           (retained; CFRelease in dtor)
//   +0x10  uint32   mFlags             (masked with 0xf7ffffef in ctor tail)
//   +0x14  uint32   mUnit              (forced to 0 if !(flags & 0x100000))
//   +0x18  uint32   mClumpID
//   +0x1c  float    mMinValue          (loaded via movsd — pair with mMax)
//   +0x20  float    mMaxValue
//   +0x24  float    mDefaultValue
//   size   = 0x28
//
// SOURCE (Core Audio) AudioUnitParameterInfo LAYOUT ACCESSED IN THE CTOR:
//   +0x40  uint32   unit
//   +0x48  CFStringRef cfNameString  (used when flags bit 0x08000000 set)
//   +0x50  uint32   clumpID
//   +0x54  float    minValue
//   +0x58  float    maxValue
//   +0x5c  float    defaultValue
//   +0x60  uint32   flags
//   (0x54/0x58 are copied as a single 8-byte movsd — they are adjacent
//    float min/max in the Core Audio struct.)
//
// CORE-FOUNDATION CALLEES (frontier — kept as small local shims):
//   _CFStringCreateWithCString  stub @0x1494902     (used in u32/AUPI ctor)
//   _CFRetain                   stub @0x1494854     (copy-ctor + operator=)
//   _CFRelease                  stub @0x149484e     (dtor + operator=)
//   _CFStringCompare            stub @0x14948d8     (Equals)
//
// Since a live CFStringRef is an opaque `void*` retain-count-managed by
// CoreFoundation, we model it in TS as an opaque `CFStringRef` alias
// (`unknown | null`) plus the four CF calls as user-supplied shims. The
// C++ semantics (retain / release / compare / create-from-cstring) are
// preserved bit-exact; only the pointer-identity of the CFString is
// carried across.

// -----------------------------------------------------------------------
// CoreFoundation stubs — supply real bridges to bind to live CF at runtime.
// -----------------------------------------------------------------------
export type CFStringRef = unknown; // opaque

export interface CFStringBridge {
  // _CFStringCreateWithCString(alloc=NULL, cstr, encoding) -> new CFString (+1)
  // @stub 0x01494902 — canonical Core Foundation API.
  createWithCString(cstr: string, encoding: number): CFStringRef;
  // _CFRetain  @stub 0x01494854
  retain(s: CFStringRef): CFStringRef;
  // _CFRelease @stub 0x0149484e
  release(s: CFStringRef): void;
  // _CFStringCompare(a, b, options=0) -> CFComparisonResult (0 == equal)
  // @stub 0x014948d8
  compare(a: CFStringRef, b: CFStringRef): number;
}

// Default bridge raises when called — the class works without a bridge
// as long as no mName is present. Wire a real bridge to persist names.
let cfBridge: CFStringBridge = {
  createWithCString(_c, _e) {
    // No CF bridge installed at runtime.
    // The base ctor calls this whenever a source AudioUnitParameterInfo
    // does not carry a CFStringRef (flags bit 0x08000000 clear) —
    // wire a bridge via setCFStringBridge() before constructing from
    // such source structs. @0x0053295d
    throw new Error(
      "FFAudioUnitParameterInfo: CFStringBridge not installed " +
        "(CFStringCreateWithCString @stub 0x01494902) — call setCFStringBridge()",
    );
  },
  retain(_s) {
    throw new Error(
      "FFAudioUnitParameterInfo: CFStringBridge not installed " +
        "(CFRetain @stub 0x01494854)",
    );
  },
  release(_s) {
    // Silent no-op default so instances constructed without a name can
    // be destroyed safely. The dtor only calls release() when mName!=null,
    // and constructing a named instance requires a bridge anyway — so
    // reaching here means the user replaced the bridge mid-life.
  },
  compare(_a, _b) {
    throw new Error(
      "FFAudioUnitParameterInfo: CFStringBridge not installed " +
        "(CFStringCompare @stub 0x014948d8)",
    );
  },
};
export function setCFStringBridge(b: CFStringBridge): void {
  cfBridge = b;
}

// Source struct we copy from in the (uint, AudioUnitParameterInfo&) ctor.
// Only the fields the ctor actually reads are listed.
export interface AudioUnitParameterInfoSrc {
  // +0x40 uint32 unit
  unit: number;
  // +0x48 CFStringRef cfNameString  (used only if flags bit 0x08000000 set)
  cfNameString: CFStringRef | null;
  // +0x50 uint32 clumpID
  clumpID: number;
  // +0x54 float min
  minValue: number;
  // +0x58 float max
  maxValue: number;
  // +0x5c float default
  defaultValue: number;
  // +0x60 uint32 flags (must be full 32-bit; ctor masks with 0xf7ffffef)
  flags: number;
  // For the !(flags & 0x08000000) branch, the ctor passes rdx (i.e. the
  // AudioUnitParameterInfo struct pointer itself) as `cstr` to
  // CFStringCreateWithCString. In real CoreAudio, that struct begins
  // with a `char name[52]` at offset 0 — a NUL-terminated C string.
  // We surface it as a plain JS string.
  nameCString?: string;
}

// -----------------------------------------------------------------------
// FFAudioUnitParameterInfo
// -----------------------------------------------------------------------
export class FFAudioUnitParameterInfo {
  // +0x00
  mParameterID: number;
  // +0x08
  mName: CFStringRef | null;
  // +0x10
  mFlags: number;
  // +0x14
  mUnit: number;
  // +0x18
  mClumpID: number;
  // +0x1c
  mMinValue: number;
  // +0x20
  mMaxValue: number;
  // +0x24
  mDefaultValue: number;

  // -------------------------------------------------------------------
  // Ctor A (default): produces a zeroed instance. This is not one of
  // the emitted symbols but the class is used inside std::vector, which
  // needs a way to bring a fresh slot to life before a placement-copy.
  // The TS class ergonomics need SOME initializer — this is the minimal
  // one that matches "all bytes 0 as if calloc'd".
  // -------------------------------------------------------------------
  private constructor() {
    this.mParameterID = 0;
    this.mName = null;
    this.mFlags = 0;
    this.mUnit = 0;
    this.mClumpID = 0;
    this.mMinValue = Math.fround(0);
    this.mMaxValue = Math.fround(0);
    this.mDefaultValue = Math.fround(0);
  }

  // -------------------------------------------------------------------
  // FFAudioUnitParameterInfo(unsigned int id, AudioUnitParameterInfo const&)
  //   @0x00532900 (C2) / same as C1 (ICF-folded)
  //
  //   0000000000532909  movl  %esi, (%rdi)                 // mParameterID = id
  //   000000000053290b  movq  $0x0, 0x8(%rdi)              // mName = NULL
  //   0000000000532913  movl  0x60(%rdx), %eax             // eax = src.flags
  //   0000000000532916  movl  %eax, 0x10(%rdi)             // mFlags = flags
  //   0000000000532919  movl  0x40(%rdx), %ecx             // ecx = src.unit
  //   000000000053291c  movl  %ecx, 0x14(%rdi)             // mUnit = unit
  //   000000000053291f  movl  0x50(%rdx), %ecx             // ecx = src.clumpID
  //   0000000000532922  movl  %ecx, 0x18(%rdi)             // mClumpID = clumpID
  //   0000000000532925  movsd 0x54(%rdx), %xmm0            // xmm0 = 8B [min|max]
  //   000000000053292a  movsd %xmm0, 0x1c(%rdi)            // store to [+0x1c|+0x20]
  //   000000000053292f  movss 0x5c(%rdx), %xmm0            // xmm0 = src.default
  //   0000000000532934  movss %xmm0, 0x24(%rdi)            // mDefaultValue
  //   0000000000532939  testl $0x100000, %eax              // flags & 0x00100000 ?
  //   000000000053293e  jne   0x532947                     //   if yes, keep unit
  //   0000000000532940  movl  $0x0, 0x14(%rbx)             //   else mUnit = 0
  //   0000000000532947  testl $0x8000000, %eax             // flags & 0x08000000 ?
  //   000000000053294c  jne   0x532963                     //   yes: retain path
  //   000000000053294e  xorl  %edi, %edi                   // alloc = NULL
  //   0000000000532950  movq  %rdx, %rsi                   // cstr = &src
  //   0000000000532953  movl  $0x8000100, %edx             // enc = kCFStringEncodingUTF8
  //                                                           (0x08000100)
  //   0000000000532958  callq _CFStringCreateWithCString   // @stub 0x1494902
  //   000000000053295d  movq  %rax, 0x8(%rbx)              // mName = new CFString
  //   0000000000532961  jmp   0x532975
  //   0000000000532963  movq  0x48(%rdx), %rdi             // rdi = src.cfNameString
  //   0000000000532967  movq  %rdi, 0x8(%rbx)              // mName = src ptr
  //   000000000053296b  testq %rdi, %rdi
  //   000000000053296e  je    0x532975
  //   0000000000532970  callq _CFRetain                    // @stub 0x1494854
  //   0000000000532975  andl  $0xf7ffffef, 0x10(%rbx)      // mFlags &= 0xf7ffffef
  //                                                           (i.e. clears bits
  //                                                            0x00000010 and
  //                                                            0x08000000)
  //   0000000000532982  retq
  // -------------------------------------------------------------------
  static fromAudioUnitParameterInfo(
    id: number,
    src: AudioUnitParameterInfoSrc,
  ): FFAudioUnitParameterInfo {
    const self = new FFAudioUnitParameterInfo();
    // @0x00532909
    self.mParameterID = id >>> 0;
    // @0x0053290b
    self.mName = null;
    // @0x00532913
    const flags = src.flags >>> 0;
    // @0x00532916
    self.mFlags = flags;
    // @0x00532919..0x0053291c
    self.mUnit = src.unit >>> 0;
    // @0x0053291f..0x00532922
    self.mClumpID = src.clumpID >>> 0;
    // @0x00532925..0x0053292a  (movsd covers +0x1c and +0x20)
    self.mMinValue = Math.fround(src.minValue);
    self.mMaxValue = Math.fround(src.maxValue);
    // @0x0053292f..0x00532934
    self.mDefaultValue = Math.fround(src.defaultValue);

    // @0x00532939..0x00532940  clear mUnit if (flags & 0x100000) == 0
    if ((flags & 0x00100000) === 0) {
      self.mUnit = 0;
    }

    // @0x00532947..0x00532975  mName acquisition
    if ((flags & 0x08000000) === 0) {
      // @0x0053294e..0x0053295d  make a CFString from the C name
      const cstr = src.nameCString ?? "";
      // encoding = 0x08000100 == kCFStringEncodingUTF8
      self.mName = cfBridge.createWithCString(cstr, 0x08000100);
    } else {
      // @0x00532963..0x00532970  adopt the src CFStringRef with a retain
      const p = src.cfNameString ?? null;
      self.mName = p;
      if (p !== null) {
        cfBridge.retain(p);
      }
    }

    // @0x00532975..0x0053297c  mFlags &= 0xf7ffffef  (clears bits 4 and 27)
    self.mFlags = (self.mFlags & 0xf7ffffef) >>> 0;

    return self;
  }

  // -------------------------------------------------------------------
  // Copy ctor: FFAudioUnitParameterInfo(FFAudioUnitParameterInfo const&)
  //   @0x005328b0 (C2/C1 folded)
  //
  //   pushq %rbp / movq %rsp,%rbp / movq %rdi,%rax
  //   movl  (%rsi),%ecx            // mParameterID
  //   movl  %ecx,(%rdi)
  //   movq  0x8(%rsi),%rdi         // mName pointer (into arg0 slot)
  //   movq  %rdi,0x8(%rax)
  //   movq  0x10(%rsi),%rcx        // 8 bytes at +0x10 (flags+unit)
  //   movq  %rcx,0x10(%rax)
  //   movl  0x18(%rsi),%ecx        // clumpID
  //   movl  %ecx,0x18(%rax)
  //   movsd 0x1c(%rsi),%xmm0       // min+max (8 bytes)
  //   movsd %xmm0,0x1c(%rax)
  //   movss 0x24(%rsi),%xmm0       // default
  //   movss %xmm0,0x24(%rax)
  //   testq %rdi,%rdi              // if mName != NULL
  //   je    0x5328f0
  //     popq %rbp
  //     jmp  _CFRetain             // tail-call, retain (this,)
  //   popq %rbp / retq
  // -------------------------------------------------------------------
  static copy(other: FFAudioUnitParameterInfo): FFAudioUnitParameterInfo {
    const self = new FFAudioUnitParameterInfo();
    self.mParameterID = other.mParameterID >>> 0;
    self.mName = other.mName; // pointer copy
    self.mFlags = other.mFlags >>> 0;
    self.mUnit = other.mUnit >>> 0;
    self.mClumpID = other.mClumpID >>> 0;
    self.mMinValue = Math.fround(other.mMinValue);
    self.mMaxValue = Math.fround(other.mMaxValue);
    self.mDefaultValue = Math.fround(other.mDefaultValue);
    if (self.mName !== null) {
      cfBridge.retain(self.mName);
    }
    return self;
  }

  // -------------------------------------------------------------------
  // ~FFAudioUnitParameterInfo() (D1 @0x005329b0 / D2 @0x00532990)
  //   movq  0x8(%rdi),%rdi         // rdi = mName
  //   testq %rdi,%rdi
  //   je    return
  //   callq _CFRelease             // @stub 0x149484e
  //   return
  // -------------------------------------------------------------------
  dispose(): void {
    // @0x00532994
    const name = this.mName;
    // @0x00532998
    if (name !== null) {
      // @0x0053299d
      cfBridge.release(name);
    }
    this.mName = null;
  }

  // -------------------------------------------------------------------
  // operator=(FFAudioUnitParameterInfo const&)  @0x005329d0
  //   Retain other.mName (if !NULL), Release this.mName (if !NULL),
  //   then copy pointer + all POD fields. Note the order: RETAIN FIRST
  //   so self-assignment / aliased assignment is safe.
  //
  //   0000000000005329dd  movq 0x8(%rsi), %rdi   ; rdi = other.mName
  //   00000000005329e1    testq %rdi,%rdi
  //   00000000005329e4    je  0x5329eb
  //   00000000005329e6    callq _CFRetain
  //   00000000005329eb    movq 0x8(%rbx), %rdi   ; rdi = this.mName
  //   00000000005329ef    testq %rdi,%rdi
  //   00000000005329f2    je  0x5329f9
  //   00000000005329f4    callq _CFRelease
  //   00000000005329f9    movq 0x8(%r14),%rax    ; mName = other.mName
  //   00000000005329fd    movq %rax,0x8(%rbx)
  //   0000000000005329e01 movl (%r14),%eax        ; mParameterID
  //   ... movq 0x10 (flags+unit) ... movl 0x18 (clumpID)
  //       movsd 0x1c (min+max) ... movss 0x24 (default)
  //   0000000000005329e2b movq %rbx,%rax          ; return *this
  // -------------------------------------------------------------------
  assign(other: FFAudioUnitParameterInfo): FFAudioUnitParameterInfo {
    // @0x005329dd..0x005329e6  retain other.mName if non-null
    if (other.mName !== null) {
      cfBridge.retain(other.mName);
    }
    // @0x005329eb..0x005329f4  release this.mName if non-null
    if (this.mName !== null) {
      cfBridge.release(this.mName);
    }
    // @0x005329f9..0x00532a26  copy all POD + pointer fields
    this.mName = other.mName;
    this.mParameterID = other.mParameterID >>> 0;
    this.mFlags = other.mFlags >>> 0;
    this.mUnit = other.mUnit >>> 0;
    this.mClumpID = other.mClumpID >>> 0;
    this.mMinValue = Math.fround(other.mMinValue);
    this.mMaxValue = Math.fround(other.mMaxValue);
    this.mDefaultValue = Math.fround(other.mDefaultValue);
    return this;
  }

  // -------------------------------------------------------------------
  // bool Equals(FFAudioUnitParameterInfo const&) const  @0x00532a40
  //
  // Logic (bit-for-bit from disasm):
  //   letA = this.mName; letB = other.mName
  //   //  dl = (A != NULL); r8b = (B != NULL); r8 &= dl; then r8 |= (A == B)
  //   //  cmpb $1, dl == 1 iff  (A == B) || (A && B)
  //   //  -> require BOTH null, OR BOTH non-null equal-ptr, OR BOTH non-null
  //   //     (i.e. same ptr, or both non-null; NOT one-null-one-non-null)
  //   if (!(A == B || (A != NULL && B != NULL))) return 0;
  //   if (this.mParameterID != other.mParameterID) return 0;
  //   if (A != B) {
  //     if (CFStringCompare(A, B, 0) != 0) return 0;
  //   }
  //   if (this.mFlags        != other.mFlags       ) return 0;
  //   if (this.mUnit         != other.mUnit        ) return 0;
  //   if (this.mClumpID      != other.mClumpID     ) return 0;
  //   //  min/max compared with ucomiss (ordered, NaN -> false via jp)
  //   if (!(this.mMinValue      == other.mMinValue     )) return 0;
  //   if (!(this.mMaxValue      == other.mMaxValue     )) return 0;
  //   //  default compared with cmpeqss (ordered equal — NaN -> 0)
  //   return (this.mDefaultValue == other.mDefaultValue) ? 1 : 0;
  //
  // The lead null-vs-null guard collapses to: A==B  ||  (A && B).
  // "A xor B (one is null, the other isn't)" -> return false.
  // -------------------------------------------------------------------
  Equals(other: FFAudioUnitParameterInfo): boolean {
    const A = this.mName;
    const B = other.mName;
    // @0x00532a4a..0x00532a6e
    const bothPresent = A !== null && B !== null;
    const samePtr = A === B;
    if (!(samePtr || bothPresent)) return false;
    // @0x00532a70..0x00532a74
    if ((this.mParameterID >>> 0) !== (other.mParameterID >>> 0)) return false;
    // @0x00532a76..0x00532a99  only compare strings when the pointers differ
    if (!samePtr) {
      // A and B are both non-null here (bothPresent branch)
      if (cfBridge.compare(A as CFStringRef, B as CFStringRef) !== 0) {
        return false;
      }
    }
    // @0x00532a9b..0x00532aa1
    if ((this.mFlags >>> 0) !== (other.mFlags >>> 0)) return false;
    // @0x00532aa3..0x00532aa9
    if ((this.mUnit >>> 0) !== (other.mUnit >>> 0)) return false;
    // @0x00532aab..0x00532ab1
    if ((this.mClumpID >>> 0) !== (other.mClumpID >>> 0)) return false;
    // @0x00532ab3..0x00532abe  min: ucomiss + jne/jp -> ordered equal
    if (!(Math.fround(this.mMinValue) === Math.fround(other.mMinValue))) {
      return false;
    }
    // NaN never equals itself in JS — matches ucomiss semantics.
    if (Number.isNaN(this.mMinValue) || Number.isNaN(other.mMinValue)) {
      return false;
    }
    // @0x00532ac0..0x00532acb  max
    if (!(Math.fround(this.mMaxValue) === Math.fround(other.mMaxValue))) {
      return false;
    }
    if (Number.isNaN(this.mMaxValue) || Number.isNaN(other.mMaxValue)) {
      return false;
    }
    // @0x00532acd..0x00532adc  default via cmpeqss (ordered equal -> 1 else 0)
    const d1 = Math.fround(this.mDefaultValue);
    const d2 = Math.fround(other.mDefaultValue);
    if (Number.isNaN(d1) || Number.isNaN(d2)) return false;
    return d1 === d2;
  }
}
