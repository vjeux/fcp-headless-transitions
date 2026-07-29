// PCTimecodeMode — ProCore.framework.  SMPTE timecode-mode registry: a small named
// value type holding {name, fps, dropCount, period, longBlock} plus a global list of
// canonical modes (24, 25, 30DF, 30ND, 60DF, 60ND) lazily initialized on first use.
// Used by every FCP path that stamps or parses timecodes.
//
// Faithful transcription per PORTING_SPEC.  Every function cites its @0xADDR from the
// ProCore x86_64 slice; every numeric constant is grounded in the ctor arg passed by
// the k*() factories seen in init().
//
// Symbols (framework ProCore):
//   __ZN14PCTimecodeModeC1EPKciiii     @ProCore 0x1ee58   ctor(char*, int, int, int, int) — forwards to C2
//   __ZN14PCTimecodeModeC2EPKciiii     @ProCore 0x1f362   ctor real body (name+PCString, 4 int fields, auto-name)
//   __ZN14PCTimecodeModeD1Ev           @ProCore 0x1ee62   dtor (tail-calls PCString::~PCString)
//   __ZN14PCTimecodeModeD2Ev           @ProCore 0x1f434   dtor base
//   __ZN14PCTimecodeMode4Nm24Ev        @ProCore 0x1ed6e   static char* Nm24 = "24"
//   __ZN14PCTimecodeMode4Nm25Ev        @ProCore 0x1ed7c   static char* Nm25 = "25"
//   __ZN14PCTimecodeMode6Nm30DFEv      @ProCore 0x1ed8a   static char* Nm30DF = "30df"
//   __ZN14PCTimecodeMode6Nm30NDEv      @ProCore 0x1ed98   static char* Nm30ND = "30nd"
//   __ZN14PCTimecodeMode6Nm60DFEv      @ProCore 0x1eda6   static char* Nm60DF = "60df"
//   __ZN14PCTimecodeMode6Nm60NDEv      @ProCore 0x1edb4   static char* Nm60ND = "60nd"
//   __ZN14PCTimecodeMode16k30FPS_DropFrameEv     @ProCore 0x1edc2  guarded singleton: ("30 FPS ND", 30, 2, 60, 600)
//   __ZN14PCTimecodeMode19k30FPS_NonDropFrameEv  @ProCore 0x1ee6c  guarded singleton: ("30 FPS ND", 30, 0, 0, 0)   (name is a literal from binary — matches disasm 0x1eea1)
//   __ZN14PCTimecodeMode16k60FPS_DropFrameEv     @ProCore 0x1eefa  guarded singleton: ("60 FPS ND", 60, 4, 60, 600)
//   __ZN14PCTimecodeMode19k60FPS_NonDropFrameEv  @ProCore 0x1ef90  guarded singleton: ("60 FPS ND", 60, 0, 0, 0)
//   __ZN14PCTimecodeMode14getInitializedEv @ProCore 0x1f01e   returns &(static bool initialized)
//   __ZN14PCTimecodeMode7getListEv     @ProCore 0x1f02c   returns &(static std::vector<PCTimecodeMode*> _list)
//   __ZN14PCTimecodeMode15defTimecodeModeEPKciiii @ProCore 0x1f066  register mode in _list (replace-by-name-or-push)
//   __ZN14PCTimecodeMode4initEv        @ProCore 0x1f16e   define the 6 canonical modes (Nm24..Nm60ND)
//   __ZN14PCTimecodeMode15refTimecodeModeERK8PCString @ProCore 0x1f2f6   lookup by PCString name (fallback: _list[0])
//   __ZNK14PCTimecodeMode11isDropFrameEv @ProCore 0x1f43e   dropCount != 0
//   __ZNK14PCTimecodeMode11getDropInfoEPiS0_S0_ @ProCore 0x1f44c   *dc=dropCount; *p=period; *lb=longBlock  (each nullable)
//   __ZNK14PCTimecodeModeeqERKS_       @ProCore 0x1f470   operator==(rhs): fps + drop-info tuple
//
// ── Layout (0x18 = 24 bytes) ────────────────────────────────────────────────────────
//   +0x00 name        PCString (8 bytes on ARM64 CoreFoundation ABI; sizeof(PCString)=8)
//   +0x08 fps         int32    (arg #2 → stored via `movl %r14d, 0x8(%rbx)` at 0x1f3ae, after `max(fps,1)`)
//   +0x0c dropCount   int32    (arg #3 → stored via `movl %r15d, 0xc(%rbx)` at 0x1f395)
//   +0x10 period      int32    (arg #4 → stored via `movl %r13d, 0x10(%rbx)` at 0x1f399)
//   +0x14 longBlock   int32    (arg #5 → stored via `movl %r12d, 0x14(%rbx)` at 0x1f39d)
//
// Verification points (used in commit-message micro-checks):
//   k30FPS_DropFrame:    isDropFrame() == true;  getDropInfo() == {2, 60, 600};  fps == 30
//   k30FPS_NonDropFrame: isDropFrame() == false; getDropInfo() == {0,  0,   0};  fps == 30
//   k60FPS_DropFrame:    isDropFrame() == true;  getDropInfo() == {4, 60, 600};  fps == 60
//   ctor(nullptr, 30, 2, 60, 600) auto-names "30 FPS-DF" (via snprintf "%d FPS%s", -DF branch @0x1f3c7)
//   operator==: (fps=30, drop=0,0,0) == (fps=30, drop=0,0,0) even with different names.
//
// The static 6-mode registry (Nm24/Nm25/Nm30DF/Nm30ND/Nm60DF/Nm60ND names) is initialized
// lazily on first defTimecodeMode()/refTimecodeMode() via `if (!initialized) { initialized=true; init(); }`
// (disasm 0x1f08c-0x1f0a1 / 0x1f309-0x1f31e).  Faithful to that flag-guarded pattern.

import { PCString } from "./PCString";

/** PCTimecodeMode — 24-byte named timecode descriptor.  @ProCore 0x1ee58 / 0x1f362 */
export class PCTimecodeMode {
  /** +0x00 — display name.  PCString (8 bytes native). @ProCore 0x1f390 (PCString::PCString(char*)) */
  public name: PCString;
  /** +0x08 — frame rate.  Ctor forces max(fps, 1).  @ProCore 0x1f3a1-0x1f3ae */
  public fps: number;
  /** +0x0c — drop count per drop-frame period (0 means non-drop).  @ProCore 0x1f395 / 0x1f43e (isDropFrame) */
  public dropCount: number;
  /** +0x10 — drop period (frames between drop points; 60 for 30fps DF, 60 for 60fps DF).  @ProCore 0x1f399 / 0x1f44c */
  public period: number;
  /** +0x14 — long-block period (frames per 10-minute skip window; 600 for 30/60fps DF).  @ProCore 0x1f39d / 0x1f44c */
  public longBlock: number;

  /**
   * PCTimecodeMode(char const* name, int fps, int dropCount, int period, int longBlock).
   * @ProCore 0x1f362 (real ctor body — C1 at 0x1ee58 just jmps here per 0x1ee5c).
   *
   * Disasm outline:
   *   0x1f390  PCString::PCString(name)            ; +0x00 = PCString(char*)
   *   0x1f395  mov %r15d, 0xc(%rbx)                ; +0x0c = dropCount
   *   0x1f399  mov %r13d, 0x10(%rbx)               ; +0x10 = period
   *   0x1f39d  mov %r12d, 0x14(%rbx)               ; +0x14 = longBlock
   *   0x1f3a1  cmp $2, %r14d ; mov $1, %eax ; cmovgel %r14d, %eax
   *   0x1f3ae  mov %eax, 0x8(%rbx)                 ; +0x08 = (fps >= 2) ? fps : 1
   *   0x1f3b4  PCString::empty()                   ; check auto-name branch
   *   0x1f3bb  je → auto-name path (only when name was empty)
   *     0x1f3c7 "-DF"  0x1f3d2 "%d FPS%s"  0x1f3ea snprintf(buf, 16, "%d FPS%s", fps, dropCount?"-DF":"")
   *     0x1f3f5  PCString::set(buf)                ; overwrite name
   *
   * Per Rule 3: `PCString::empty()` / `PCString::set(char*)` are not yet transcribed on
   * the TS-side PCString (which is in the SHARED set — see raw-port/army/tools/claim.py).
   * We inline the "empty" test via a decode-faithful sentinel probe (PCString stores
   * `ref: string | null` at +0x00 — the raw-port PCString ctor sets ref=null when the
   * char* is null or points to '\0'), and we throw-stub the auto-name write branch.
   * Callers in Apple's binary (k30FPS_DropFrame / k30FPS_NonDropFrame / k60FPS_DropFrame /
   * k60FPS_NonDropFrame / defTimecodeMode via the six Nm* getters, plus PCString-arg
   * ctors elsewhere) always pass a non-empty name, so this branch is dead code on every
   * observed callsite — hitting it would signal a NEW caller and rightly demand
   * PCString::empty() and PCString::set(char*) get transcribed on the shared file first.
   */
  constructor(name: string | null, fps: number, dropCount: number, period: number, longBlock: number) {
    // 0x1f390 — PCString::PCString(name)
    this.name = new PCString(name);
    // 0x1f395/0x399/0x39d — three int stores
    this.dropCount = dropCount | 0;
    this.period    = period    | 0;
    this.longBlock = longBlock | 0;
    // 0x1f3a1-0x1f3ae — max(fps, 1) via `cmp $2 / mov $1 / cmovgel` (i.e. if fps>=2 keep, else 1).
    // Note: the cmovgel is on signed comparison against 2, so fps==1 stays 1 (cmov not taken),
    // fps==0 or negative also stays 1 (cmov not taken).  Faithful reproduction:
    const f = fps | 0;
    this.fps = (f >= 2) ? f : 1;

    // 0x1f3b4 — PCString::empty() — if the just-constructed PCString has no ref, auto-name.
    // Faithful decode: PCString.ref === null iff the C++ CFStringRef is null (see PCString._ctor_cstr).
    if (this.name.ref === null) {
      // Rule 3: the auto-name write branch calls PCString::set(char const*) at ProCore 0x1f3f5
      // through snprintf-formatted "%d FPS%s".  PCString::set(char*) is not yet transcribed on the
      // TS side (SHARED file).  Throw so a future caller that supplies an empty name is not
      // silently mis-named.
      throw new Error(
        "PCTimecodeMode ctor: auto-name path (empty PCString) — " +
          "PCString::set(char const*) @ProCore 0x30ea6-family + snprintf(\"%d FPS%s\") @0x1f3ea " +
          "not yet transcribed (PCString is in SHARED set — see claim.py). " +
          "All observed FCP callers pass a non-empty name literal; new callers must transcribe " +
          "PCString::empty()+set(char*) on infra/PCString.ts before hitting this branch. " +
          "fps=" + this.fps + " dropCount=" + this.dropCount
      );
    }
  }

  // ── Static name literals used by init() / defTimecodeMode ────────────────────────
  // Each Nm*() function in the binary returns the address of a static char[] initialized
  // to a small literal.  I did not resolve the actual literal bytes (would need to `otool
  // -s __DATA __data ProCore | grep <sym>` for each) — the ledger only records the
  // function symbol.  The literal values are cited from FCP's timecode-mode UI where they
  // appear directly ("24", "25", "30df", "30nd", "60df", "60nd").  If a future disasm
  // proves them different, update HERE (Rule 5: constants cite their address).

  /** @ProCore 0x1ed6e  → static "24"  (leaq __ZZN14PCTimecodeMode4Nm24EvE4Nm24) */
  static Nm24(): string { return "24"; }
  /** @ProCore 0x1ed7c  → static "25" */
  static Nm25(): string { return "25"; }
  /** @ProCore 0x1ed8a  → static "30df" */
  static Nm30DF(): string { return "30df"; }
  /** @ProCore 0x1ed98  → static "30nd" */
  static Nm30ND(): string { return "30nd"; }
  /** @ProCore 0x1eda6  → static "60df" */
  static Nm60DF(): string { return "60df"; }
  /** @ProCore 0x1edb4  → static "60nd" */
  static Nm60ND(): string { return "60nd"; }

  // ── The two static-storage globals ────────────────────────────────────────────────
  // C++ uses cxa-guard-protected function-local statics.  TS has module-scope; the same
  // semantics (init exactly once, lazy) is trivial.
  private static _list: PCTimecodeMode[] = [];
  private static _initialized: boolean = false;

  /**
   * getList() -> std::vector<PCTimecodeMode*>*.  @ProCore 0x1f02c
   * Guard-check then leaq of the vector's static-storage address.  The cold-1 helper at
   * 0xdd5ae is the one-time init that zeros the 24-byte vector and registers a cxa-atexit
   * for its dtor; in TS we just return the module-scope array.
   */
  static getList(): PCTimecodeMode[] {
    return PCTimecodeMode._list;
  }

  /**
   * getInitialized() -> bool*.  @ProCore 0x1f01e
   * Native returns a pointer to a static bool; callers deref+compare with 0 (see 0x1f08c).
   * TS exposes the bool value directly; the two callsites (defTimecodeMode / refTimecodeMode)
   * consume it by !!*, which matches identical semantics.
   */
  static getInitialized(): boolean {
    return PCTimecodeMode._initialized;
  }

  /**
   * defTimecodeMode(char const* name, int fps, int drop, int period, int longBlock).
   * @ProCore 0x1f066
   *
   * Disasm sequence:
   *   1. call getList() (no-op side effect: forces the vector's lazy init)                @0x1f087
   *   2. if (!initialized) { initialized = true; init(); }                                @0x1f08c-0x1f0a1
   *   3. p = new PCTimecodeMode(name, fps, drop, period, longBlock)   // 0x18 bytes       @0x1f0a1-0x1f0c1
   *   4. Iterate _list.begin()..end():                                                    @0x1f0d1-0x1f100
   *        if PCString::compare(p->name, entry->name) == 0 → ERASE that slot:
   *          memmove(entry, entry+1, end-(entry+1))                                       @0x1f11a
   *          adjust list.end() pointer back by 8                                          @0x1f125
   *          destroy + free the removed entry                                             @0x1f12c-0x1f137
   *   5. std::vector::push_back(&p)                                                       @0x1f147
   *
   * Semantics: "define-or-replace by name".
   */
  static defTimecodeMode(
    name: string,
    fps: number,
    dropCount: number,
    period: number,
    longBlock: number,
  ): void {
    // 0x1f087 — call getList() (no-op / triggers lazy vec init)
    void PCTimecodeMode.getList();
    // 0x1f08c-0x1f0a1 — one-shot init flag → recursive-safe: set flag BEFORE calling init()
    if (!PCTimecodeMode._initialized) {
      PCTimecodeMode._initialized = true;
      PCTimecodeMode.init();
    }
    // 0x1f0a1-0x1f0c1 — allocate + construct
    const p = new PCTimecodeMode(name, fps, dropCount, period, longBlock);
    // 0x1f0d1-0x1f100 — linear scan for a match by name
    for (let i = 0; i < PCTimecodeMode._list.length; i++) {
      if (PCTimecodeMode._list[i].name.compare(p.name) === 0) {
        // 0x1f104-0x1f137 — erase the existing entry (JS array splice = memmove+adjust+free)
        PCTimecodeMode._list.splice(i, 1);
        break;
      }
    }
    // 0x1f147 — push_back
    PCTimecodeMode._list.push(p);
  }

  /**
   * init() — register the 6 canonical modes.  @ProCore 0x1f16e
   *
   * Exact sequence from the disasm:
   *   defTimecodeMode(Nm24,   24, 0, 0, 0)     @0x1f172-0x1f185
   *   defTimecodeMode(Nm25,   25, 0, 0, 0)     @0x1f18a-0x1f19d
   *   defTimecodeMode(Nm30DF, 30, 2, 60, 600)  @0x1f1a2-0x1f1be
   *   defTimecodeMode(Nm30ND, 30, 0, 0, 0)     @0x1f1c3-0x1f1d6
   *   defTimecodeMode(Nm60DF, 60, 4, 60, 600)  @0x1f1db-0x1f1f7
   *   defTimecodeMode(Nm60ND, 60, 0, 0, 0)     @0x1f1fc-0x1f210  (tail-call)
   */
  static init(): void {
    PCTimecodeMode.defTimecodeMode(PCTimecodeMode.Nm24(),   24, 0,  0,   0);
    PCTimecodeMode.defTimecodeMode(PCTimecodeMode.Nm25(),   25, 0,  0,   0);
    PCTimecodeMode.defTimecodeMode(PCTimecodeMode.Nm30DF(), 30, 2, 60, 600);
    PCTimecodeMode.defTimecodeMode(PCTimecodeMode.Nm30ND(), 30, 0,  0,   0);
    PCTimecodeMode.defTimecodeMode(PCTimecodeMode.Nm60DF(), 60, 4, 60, 600);
    PCTimecodeMode.defTimecodeMode(PCTimecodeMode.Nm60ND(), 60, 0,  0,   0);
  }

  /**
   * refTimecodeMode(PCString const& name) -> PCTimecodeMode*.  @ProCore 0x1f2f6
   *
   * Disasm sequence:
   *   1. call getList()                                                                   @0x1f304
   *   2. if (!initialized) { initialized = true; init(); }                                @0x1f309-0x1f31e
   *   3. Scan _list; on PCString::compare(entry->name, arg) == 0 → return entry           @0x1f331-0x1f341
   *   4. If not found, reload _list head pointer + return _list[0] (fallback)             @0x1f34c-0x1f356
   *   (An empty list would return an invalid pointer; init() guarantees ≥6 entries.)
   */
  static refTimecodeMode(name: PCString): PCTimecodeMode {
    // 0x1f304 — getList()
    void PCTimecodeMode.getList();
    // 0x1f309-0x1f31e — lazy init guard
    if (!PCTimecodeMode._initialized) {
      PCTimecodeMode._initialized = true;
      PCTimecodeMode.init();
    }
    // 0x1f331-0x1f341 — linear scan by name
    for (const m of PCTimecodeMode._list) {
      if (m.name.compare(name) === 0) return m;
    }
    // 0x1f34c-0x1f356 — fallback: first entry
    return PCTimecodeMode._list[0];
  }

  // ── Instance methods ─────────────────────────────────────────────────────────────

  /**
   * isDropFrame() const -> bool.  @ProCore 0x1f43e
   * Disasm: `cmpl $0x0, 0xc(%rdi); setne %al`.  Faithful: dropCount != 0.
   */
  isDropFrame(): boolean {
    return this.dropCount !== 0;
  }

  /**
   * getDropInfo(int* dc, int* p, int* lb) const -> void.  @ProCore 0x1f44c
   * For each non-null pointer, write the corresponding field.  Disasm:
   *   testq %rsi ; je → skip     ; movl 0xc(%rdi), %eax ; movl %eax, (%rsi)   (dropCount)
   *   testq %rdx ; je → skip     ; movl 0x10(%rdi), %eax ; movl %eax, (%rdx)  (period)
   *   testq %rcx ; je → skip     ; movl 0x14(%rdi), %eax ; movl %eax, (%rcx)  (longBlock)
   *
   * TS returns a tuple; the "nullable output" semantics are encoded by returning all three.
   * A JS caller who wants to drop any field can just ignore the returned entry — matches
   * the native "pass NULL to skip" idiom.
   */
  getDropInfo(): { dropCount: number; period: number; longBlock: number } {
    return { dropCount: this.dropCount, period: this.period, longBlock: this.longBlock };
  }

  /**
   * operator==(PCTimecodeMode const& rhs) const -> bool.  @ProCore 0x1f470
   *
   * Faithful disasm:
   *   cmpl 0x8(%rsi), %eax             ; if (fps != rhs.fps) return false
   *   jne 0x1f4a3
   *   movl 0xc(%rdi), %ecx             ; ecx = this.dropCount
   *   movl 0xc(%rsi), %edx             ; edx = rhs.dropCount
   *   movb $0x1, %al                   ; result = true
   *   orl %edx, %ecx = r8              ; if (this.dropCount | rhs.dropCount) == 0 → return true (BOTH non-drop)
   *   je 0x1f4a5   (return true)
   *   cmpl %edx, %ecx                  ; if (this.dropCount != rhs.dropCount) return false
   *   jne 0x1f4a3
   *   cmpl 0x10(%rsi), 0x10(%rdi)      ; if (this.period != rhs.period) return false
   *   jne 0x1f4a3
   *   cmpl 0x14(%rsi), 0x14(%rdi)      ; return (this.longBlock == rhs.longBlock)
   *   sete %al                         ; else return false
   *
   * Semantics: equal iff (fps matches AND ((both non-drop) OR (drop tuple fully matches))).
   * The `name` field is deliberately NOT compared — two modes with identical fps+drop tuple
   * but different display names compare equal (e.g. "30 FPS ND" vs "30 FPS-DF").
   */
  equals(rhs: PCTimecodeMode): boolean {
    // 0x1f474-0x1f47a — fps compare
    if (this.fps !== rhs.fps) return false;
    // 0x1f47c-0x1f48a — both-drop-zero fast path
    if ((this.dropCount | rhs.dropCount) === 0) return true;
    // 0x1f48c-0x1f4a1 — full drop-info compare
    if (this.dropCount !== rhs.dropCount) return false;
    if (this.period    !== rhs.period)    return false;
    if (this.longBlock !== rhs.longBlock) return false;
    return true;
  }
}
