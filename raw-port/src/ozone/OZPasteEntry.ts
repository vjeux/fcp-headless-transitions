// raw-port/src/ozone/OZPasteEntry.ts
//
// FCP `OZPasteEntry` — Ozone.framework. Transcribed from the disassembly at
// /Applications/Final Cut Pro.app/Contents/Frameworks/Ozone.framework/Versions/A/Ozone.
// One class per file (PORTING_SPEC Rule 6).
//
// This unit ports ONE method: the `const` accessor `getInstance()` @Ozone 0x1adb10.
//
// STRUCT LAYOUT (recovered strictly from the two byte offsets getInstance touches):
//
//   struct OZPasteEntry {
//     +0x00  instance : void*   // primary instance pointer (read by `movq (%rdi),%rax`)
//     +0x08  ...                // unmapped so far
//     +0x10  fallback : void*   // fallback instance pointer, returned only when +0x00 is null
//   }
//
// getInstance() is a pure two-field read with NO calls and NO writes (`const`): it returns
// the primary instance pointer at +0x00 when that pointer is non-null, otherwise the fallback
// pointer at +0x10. The pointee type is not observable from this accessor alone, so it is
// modeled as an opaque `OZPasteEntryInstance` handle (an unmapped pointer target).

/**
 * The opaque object `getInstance()` hands back. Its concrete layout is not observable from the
 * accessor at 0x1adb10 (which only forwards a pointer), so it is modeled as an opaque handle;
 * later ports of its members will flesh it out. Two OZPasteEntry handles alias the same
 * instance iff these references are identical (pointer identity).
 */
export interface OZPasteEntryInstance {
  readonly __opaque: unique symbol;
}

/**
 * OZPasteEntry — modeled with only the two pointer fields that getInstance reads. The rest of
 * the class is unmapped and will be filled in by later methods.
 */
export class OZPasteEntry {
  /** +0x00 primary instance pointer, or null. Read by `movq (%rdi),%rax` @0x1adb14. */
  private instance: OZPasteEntryInstance | null = null;
  /** +0x10 fallback instance pointer. Read by `movq 0x10(%rdi),%rax` @0x1adb1e, returned only
   *  when the primary pointer at +0x00 is null. */
  private fallback: OZPasteEntryInstance | null = null;

  /**
   * OZPasteEntry::getInstance() const  @Ozone 0x1adb10.
   *
   * Returns the primary instance pointer (+0x00) if it is non-null, otherwise the fallback
   * pointer (+0x10). Pure read; `const` — no side effects, no calls.
   *
   *   0x1adb14  movq  (%rdi),%rax               ; rax = this->instance  (+0x00)
   *   0x1adb17  testq %rax,%rax                 ; test the primary pointer
   *   0x1adb1a  je    0x1adb1e                  ; if null -> take the fallback
   *   0x1adb1c  popq  %rbp; retq                ; else return the primary pointer
   *   0x1adb1e  movq  0x10(%rdi),%rax           ; rax = this->fallback  (+0x10)
   *   0x1adb22  popq  %rbp; retq                ; return the fallback pointer
   */
  public getInstance(): OZPasteEntryInstance | null {
    // @0x1adb14 rax = this->instance (+0x00)
    const primary = this.instance;
    // @0x1adb17..0x1adb1a testq/je — non-null primary is returned directly.
    if (primary !== null) {
      // @0x1adb1c popq/retq — return the primary instance pointer.
      return primary;
    }
    // @0x1adb1e movq 0x10(%rdi),%rax — primary was null: return the fallback (+0x10).
    return this.fallback;
  }
}
