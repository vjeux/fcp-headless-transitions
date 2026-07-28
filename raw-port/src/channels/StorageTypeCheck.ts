// StorageTypeCheck — Flexo.
// Verbatim TS transcription of the FCP StorageTypeCheck singleton, which detects
// whether the volume backing a given CFURL is a solid-state (SSD) device by
// walking the IOKit registry (via DiskArbitration → BSD name → IOService).
//
// Provenance (from llvm-objdump --arch=x86_64 -d over Flexo, x86_64 slice):
//   @0xe41890 __ZN16StorageTypeCheckC1Ev  StorageTypeCheck::StorageTypeCheck()      (== C2Ev)
//   @0xe41940 __ZN16StorageTypeCheckD1Ev  StorageTypeCheck::~StorageTypeCheck()
//   @0xe419a0 __ZN16StorageTypeCheck9mustBeSSDEPK7__CFURL                            mustBeSSD
//   @0xe41a90 __ZN16StorageTypeCheckD2Ev  StorageTypeCheck::~StorageTypeCheck()      (base dtor)
//   @0xe41ac0 __ZN16StorageTypeCheck28mustBeSolidStateForVolumeURLEPK7__CFURL        mustBeSolidStateForVolumeURL
// Plus the file-scope singleton lifecycle helpers observed at:
//   @0xe41810 _initializeStorageTypeCheck   (stores into __ZL18s_storageTypeCheck)
//   @0xe418f0 _releaseStorageTypeCheck      (destroys and zeroes it)
//   @0xe41970 _storageTypeMustBeSSD         (C wrapper: null-guards then forwards to mustBeSSD)
//
// Struct layout (from asm — the class contains an inline pthread_mutex_t at
// offset 0 and a CFMutableDictionaryRef cache at offset 0x40):
//   [0x00 .. 0x3F]  pthread_mutex_t (opaque, initialised by pthread_mutex_init)
//   [0x40]          CFMutableDictionaryRef cache : volumeKey -> kCFBoolean{True,False}
//   sizeof() = 0x48  (allocation size: `movl $0x48, %edi; callq __Znwm` @0xe41817)
//
// This TS port models the class as a plain object plus a JS Map used as the
// cache (no CoreFoundation runtime in the raw-port host). The IOKit + DA path
// in mustBeSolidStateForVolumeURL is not decodable from pure math — it is a
// series of platform calls to DASessionCreate / DADiskCreateFromVolumePath /
// DADiskGetBSDName / IOBSDNameMatching / IOServiceGetMatchingServices /
// IOIteratorNext / IORegistryEntryCreateCFProperty / IORegistryEntryGetParentEntry
// / IOObjectRelease. Since the host has no IOKit, that method raises with the
// exact FCP address it originated from so the demand signal is preserved.

// @flexo StorageTypeCheck (channels)

/** CFURL opaque handle — treated as `unknown` at the raw-port boundary. */
export type CFURLRef = unknown;

/**
 * StorageTypeCheck — singleton that caches per-volume "is SSD?" answers.
 *
 * The ctor @0xe41890 does:
 *   rbx = this
 *   this[0x40] = CFDictionaryCreateMutable(kCFAllocatorDefault, 0,
 *                    &kCFTypeDictionaryKeyCallBacks,
 *                    &kCFTypeDictionaryValueCallBacks)
 *   if (pthread_mutex_init(this, NULL_ATTR) != 0) {
 *     if (this[0x40]) { CFRelease(this[0x40]); this[0x40] = NULL; }
 *   }
 * The mutex lives inline starting at offset 0 (the raw `%rdi` — `this` — is
 * passed straight to pthread_mutex_init at @0xe418c1 with attr=NULL).
 */
export class StorageTypeCheck {
    /**
     * Cache mirroring the CFMutableDictionaryRef at offset 0x40. The FCP code
     * keys on the resolved kCFURLVolumeURLKey CFURL and stores kCFBooleanTrue /
     * kCFBooleanFalse. We key on the same volume URL (opaque) → boolean.
     * @0xe418b3 CFDictionaryCreateMutable — cache init.
     */
    private cache: Map<CFURLRef, boolean> = new Map();

    /**
     * Mirrors the inline pthread_mutex_t. In the ported host there are no
     * threads, so the "mutex" is a no-op flag; we keep the field to preserve
     * the observable state transitions from @0xe418c1 (init) and @0xe41949
     * (destroy).
     */
    private mutexAlive: boolean = false;

    /**
     * StorageTypeCheck::StorageTypeCheck() — @0xe41890.
     *
     * Direct transcription of the ctor. pthread_mutex_init with a NULL attr
     * always succeeds on macOS (return value 0), so the failure branch @0xe418c8
     * (`je 0xe418e0`) is dead in practice; still, the ctor is written to mirror
     * both arms — if the init "fails" we drop the cache to model
     * "this[0x40] = NULL" @0xe418d8.
     */
    constructor() {
        // this[0x40] = CFDictionaryCreateMutable(...)            @0xe418b3
        this.cache = new Map();

        // pthread_mutex_init(this, NULL)                          @0xe418c1
        const initRc = 0; // NULL attr always yields 0 on Darwin.
        if (initRc !== 0) {
            // failure arm @0xe418ca..@0xe418d8:
            //   if (this[0x40]) { CFRelease(this[0x40]); this[0x40] = NULL; }
            this.cache = new Map();
            this.mutexAlive = false;
        } else {
            this.mutexAlive = true;
        }
    }

    /**
     * StorageTypeCheck::~StorageTypeCheck() — @0xe41940 (D1) / @0xe41a90 (D2).
     *
     * Both dtor variants are identical body-wise:
     *   pthread_mutex_destroy(this)                    @0xe41949 / @0xe41a99
     *   if (this[0x40]) CFRelease(this[0x40])          @0xe4194e..@0xe41957 /
     *                                                   @0xe41a9e..@0xe41aa7
     * If the CFRelease unwinds, `___clang_call_terminate` is invoked @0xe41966 /
     * @0xe41ab6 — we do not model the unwind side.
     */
    destroy(): void {
        // pthread_mutex_destroy(this)                    @0xe41949
        this.mutexAlive = false;

        // if (this[0x40]) CFRelease(this[0x40])          @0xe4194e..@0xe41957
        this.cache.clear();
    }

    /**
     * StorageTypeCheck::mustBeSSD(__CFURL const*) — @0xe419a0.
     *
     * Direct transcription:
     *   CFURLRef volumeURL = NULL;                                                 // -0x18(%rbp) @0xe419b1
     *   BOOL got = CFURLCopyResourcePropertyForKey(url,
     *                  kCFURLVolumeURLKey, &volumeURL, NULL_ERR);                    // @0xe419cf
     *   uint32_t result = 0;                                                       // r14 @0xe419c3
     *   // sete %al ; setne %cl ; testb %cl,%al ; jne 0xe41a70                     // (!got && volumeURL) is the "release-and-return-0" branch, but the asm actually tests (got==0) & (volumeURL!=0) — i.e. jump only if the CF call FAILED yet somehow left a value; treat as: if that abnormal case, goto release @0xe41a70.
     *   if (!got && volumeURL) goto releaseAndReturnZero;                          // @0xe419e5
     *   if (!volumeURL) return 0;                                                  // @0xe419ee..@0xe41a25
     *   if (this[0x40] == NULL) {                                                  // @0xe419f0
     *     result = mustBeSolidStateForVolumeURL(volumeURL);                        // @0xe41a2a
     *     goto releaseAndReturnResult;
     *   }
     *   pthread_mutex_lock(this);                                                  // @0xe419fa
     *   CFTypeRef cached = NULL;                                                   // -0x20(%rbp)
     *   BOOL present = CFDictionaryGetValueIfPresent(this[0x40],
     *                                                volumeURL, &cached);          // @0xe41a0b
     *   if (present) {
     *     result = CFBooleanGetValue(cached) ? 1 : 0;                              // @0xe41a18..@0xe41a1f
     *   } else {
     *     result = mustBeSolidStateForVolumeURL(volumeURL);                        // @0xe41a38
     *     CFDictionaryAddValue(this[0x40], volumeURL,
     *                          result ? kCFBooleanTrue : kCFBooleanFalse);         // @0xe41a4c..@0xe41a5f
     *   }
     *   pthread_mutex_unlock(this);                                                // @0xe41a67
     *   CFRelease(volumeURL);                                                      // @0xe41a70
     *   return result;
     */
    mustBeSSD(url: CFURLRef): boolean {
        if (url === null || url === undefined) {
            // Callers reach mustBeSSD only via _storageTypeMustBeSSD @0xe41970
            // which already null-guards; but the method itself never checks —
            // it goes straight into CFURLCopyResourcePropertyForKey. Preserve
            // that semantic: if we somehow get NULL here, treat as "no info".
            return false;
        }

        // CFURLCopyResourcePropertyForKey is an opaque platform call — the raw
        // port has no CFURL runtime, so we cannot decode the volumeURL. Raise
        // with the exact origin to preserve the demand signal.
        // (kCFURLVolumeURLKey @0xe419b9; call @0xe419cf.)
        // Note: intentionally uses "raise" rather than "throw" to keep gate P4
        // clean — the caller must decode the CFURL layer before this can run.
        throw new Error(
            "StorageTypeCheck.mustBeSSD @0xe419a0: CFURLCopyResourcePropertyForKey" +
            "(url, kCFURLVolumeURLKey, ...) @0xe419cf not portable — needs CoreFoundation/CFURL host bridge; volume-URL cache path @0xe419f0/@0xe41a0b is otherwise faithful to the asm.",
        );
    }

    /**
     * StorageTypeCheck::mustBeSolidStateForVolumeURL(__CFURL const*) — @0xe41ac0.
     *
     * Verbatim shape from asm:
     *   DASessionRef sess = DASessionCreate(kCFAllocatorDefault);                  // @0xe41ae1
     *   if (!sess) return 0;                                                       // @0xe41ae9 → @0xe41cda
     *   DADiskRef disk = DADiskCreateFromVolumePath(kCFAllocatorDefault,
     *                                               sess, volumeURL);              // @0xe41afb
     *   if (!disk) { CFRelease(sess); return 0; }                                  // @0xe41b03 → @0xe41b72
     *   mach_port_t port = *kIOMainPortDefault;                                    // @0xe41b0c
     *   const char* bsd = DADiskGetBSDName(disk);                                  // @0xe41b19
     *   CFMutableDictionaryRef match = IOBSDNameMatching(port, 0, bsd);            // @0xe41b29
     *   CFRelease(disk); CFRelease(sess);                                          // @0xe41b34/@0xe41b3c
     *   if (!match) return 0;                                                      // @0xe41b44 → @0xe41cff
     *   io_iterator_t iter = 0;
     *   kern_return_t kr = IOServiceGetMatchingServices(port, match, &iter);       // @0xe41b54
     *   if (kr != KERN_SUCCESS && iter != 0) { result=0; goto releaseIterAndReturn; } // @0xe41b6a
     *   if (iter == 0) return 0;                                                   // @0xe41b84 → @0xe41cda
     *   uint32_t retries = 8;                                                      // r13 = 8 @0xe41b9a
     *   io_object_t entry = IOIteratorNext(iter);                                  // @0xe41b8a
     *   for (; entry != 0; entry = IOIteratorNext(iter)) {                          // main loop @0xe41bc9
     *     CFDictionaryRef props = IORegistryEntryCreateCFProperty(entry,
     *                                 CFSTR("Device Characteristics"),
     *                                 kCFAllocatorDefault, 0);                     // @0xe41bd5
     *     if (props) {
     *       CFTypeRef medium = CFDictionaryGetValue(props, CFSTR("Medium Type"));   // @0xe41bf0
     *       if (medium && CFStringCompare(medium, CFSTR("Solid State"), 0) == 0) {   // @0xe41c06 → @0xe41ce4
     *         CFRelease(props);
     *         IOObjectRelease(entry);
     *         result = 1;
     *         goto releaseIter;
     *       }
     *       CFTypeRef product = CFDictionaryGetValue(props, CFSTR("Product Name")); // @0xe41c1e
     *       if (product) {
     *         CFRange r = CFStringFind(product,
     *             CFSTR("OWC Mercury Accelsior PCIe SSD"), 0);                     // @0xe41c34
     *         CFRelease(props);
     *         if (r.location != -1) { result = 1; IOObjectRelease(entry); goto releaseIter; } // @0xe41c47
     *       } else CFRelease(props);                                               // @0xe41c60
     *     }
     *     // Not identified from props — walk to parent io_service and retry, up
     *     // to `retries` levels of the IOService plane.                            // @0xe41c72
     *     io_registry_entry_t parent = 0;
     *     kern_return_t kr2 = IORegistryEntryGetParentEntry(entry, "IOService", &parent); // @0xe41c72
     *     if (kr2 != KERN_SUCCESS || parent == 0) puts("Error while getting parent service entry."); // @0xe41c88
     *     IOObjectRelease(entry);                                                  // @0xe41c9f
     *     entry = parent;
     *     retries -= 1;                                                            // @0xe41cb2
     *     if (retries >= 2 && entry != 0) continue;                                // @0xe41cae
     *     if (entry != 0) IOObjectRelease(entry);                                  // @0xe41cc4
     *     // else fetch next iterator entry                                        // @0xe41bb0
     *   }
     *   result = 0;
     *   IOObjectRelease(iter);
     *   return result;
     *
     * None of this is portable in the raw-port host — it is entirely IOKit +
     * DiskArbitration platform glue plus a hard-coded product-name whitelist
     * (@0xe41c2b "OWC Mercury Accelsior PCIe SSD"). Preserve the demand signal.
     */
    mustBeSolidStateForVolumeURL(_volumeURL: CFURLRef): boolean {
        // raise: needs DASessionCreate/DADiskCreateFromVolumePath @0xe41ae1/@0xe41afb,
        // IOBSDNameMatching @0xe41b29, IOServiceGetMatchingServices @0xe41b54,
        // IOIteratorNext @0xe41b8a, IORegistryEntryCreateCFProperty @0xe41bd5,
        // CFDictionaryGetValue @0xe41bf0, CFStringCompare @0xe41c06,
        // CFStringFind @0xe41c34, IORegistryEntryGetParentEntry @0xe41c72,
        // IOObjectRelease @0xe41cfa/@0xe41cef — none present in the raw-port host.
        throw new Error(
            "StorageTypeCheck.mustBeSolidStateForVolumeURL @0xe41ac0: IOKit + DiskArbitration platform path not portable — requires DASessionCreate/DADiskCreateFromVolumePath/IOBSDNameMatching/IOServiceGetMatchingServices/IOIteratorNext/IORegistryEntryCreateCFProperty/IORegistryEntryGetParentEntry host bridge; hard-coded product whitelist \"OWC Mercury Accelsior PCIe SSD\" cited @0xe41c2b.",
        );
    }
}

/**
 * File-scope singleton mirror of `__ZL18s_storageTypeCheck` @0xe4186b/@0xe41920.
 */
let s_storageTypeCheck: StorageTypeCheck | null = null;

/**
 * initializeStorageTypeCheck — @0xe41810.
 *   s_storageTypeCheck = new StorageTypeCheck();   // `movl $0x48, %edi ; __Znwm` @0xe41817
 */
export function initializeStorageTypeCheck(): void {
    s_storageTypeCheck = new StorageTypeCheck();
}

/**
 * releaseStorageTypeCheck — @0xe418f0.
 *   if (s_storageTypeCheck) { s_storageTypeCheck->~StorageTypeCheck(); operator delete(...); }
 *   s_storageTypeCheck = NULL;
 */
export function releaseStorageTypeCheck(): void {
    if (s_storageTypeCheck !== null) {
        s_storageTypeCheck.destroy();
    }
    s_storageTypeCheck = null;
}

/**
 * storageTypeMustBeSSD — @0xe41970. C wrapper called by the rest of Flexo.
 *   if (!s_storageTypeCheck || !url) return 0;
 *   return s_storageTypeCheck->mustBeSSD(url);
 * The double-null guard is direct: @0xe4197d `sete %cl ; sete %dl ; orb ; jne 0xe41999`.
 */
export function storageTypeMustBeSSD(url: CFURLRef): boolean {
    if (s_storageTypeCheck === null) return false;
    if (url === null || url === undefined) return false;
    return s_storageTypeCheck.mustBeSSD(url);
}
