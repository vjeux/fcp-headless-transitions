// MXF__MXFBuildIndex.ts — raw transcription of Flexo `MXF::MXFBuildIndex`.
//
// The base class of Flexo's MXF (SMPTE 377M) index-table builders. NESTED IN A NAMESPACE, so the
// file name joins with the DOUBLE underscore per PORTING_SPEC.md (`MXF::MXFBuildIndex` ->
// `MXF__MXFBuildIndex.ts`), matching the landed siblings in this directory —
// `MXF__MXFPartitionEntry.ts`, `MXF__MXFPartitionData.ts`, `MXF__FileReader.ts`,
// `MXF__MXFAVCPictureDataDecoder.ts`.
//
// Provenance (Flexo framework, x86_64 slice of
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Flexo.framework/Versions/A/Flexo):
//
//   @0x1440250  MXF::MXFBuildIndex::MXFBuildIndex(MXF::FileReader*, unsigned int, unsigned int)
//                 __ZN3MXF13MXFBuildIndexC2EPNS_10FileReaderEjj   (C2, base-object ctor)
//
// ONLY the C2 base-object constructor exists in the symbol table for this class — there is no
// `C1` at any address (`grep '3MXF13MXFBuildIndexC' raw-port/army/inventory/Flexo.syms.txt` returns
// this one line), which is what an ABSTRACT class looks like: no complete object of this type is
// ever constructed, so no complete-object constructor was emitted. The vtable this constructor
// installs carries two `__cxa_pure_virtual` slots, which says the same thing independently (see
// below). This differs from the landed `MXF__MXFPartitionEntry.ts`, where C1 and C2 are one folded
// body — there the note was "same address", here it is "the other variant does not exist".
//
// Disassembly (regenerate with
//   `bash raw-port/tools/disasm.sh --sym __ZN3MXF13MXFBuildIndexC2EPNS_10FileReaderEjj Flexo`):
//   raw-port/re/disasm/Flexo.__ZN3MXF13MXFBuildIndexC2EPNS_10FileReaderEjj.s (14 lines)
//
// Every OTHER member of the class is a SEPARATE ledger unit and is deliberately NOT ported here;
// each gets ADDED to this file when its own unit is claimed (one class = one file; G6 add-only).
// The inventory lists nine more:
//   D2 @0x1440280, D1 @0x1494050, D0 @0x1494060, checkAndInitData @0x1440320,
//   clipWrappedMediaFromInitMedia @0x1440410, containsVideoTrack @0x1440810,
//   getIndexTableWithPosition @0x14408a0, isIndexTableRequiered @0x1440910 (sic — the misspelling
//   is Apple's, it is in the mangled name), decodeLastFrame @0x1430b80.
// Four of those are quoted below AS EVIDENCE for what the constructor's slots are. Quoting a
// sibling's instructions to ground a field is what the landed `MXF__MXFPartitionEntry.ts` does with
// `updateEntry`; none of those bodies is transcribed here.
//
// ---------------------------------------------------------------------------------------------
// STRUCT LAYOUT — every byte this constructor writes, and nothing else
// ---------------------------------------------------------------------------------------------
//
//   +0x00  void*  vtable      `movq %rax,(%rdi)`        @0x144025b   (the leaq @0x1440254)
//   +0x08  u32    streamID    `movl %edx,0x8(%rdi)`     @0x144025e   <- 1st `unsigned int` arg
//   +0x0c  u32    indexSID    `movl %ecx,0xc(%rdi)`     @0x1440261   <- 2nd `unsigned int` arg
//   +0x10  ptr    fileReader  `movq %rsi,0x10(%rdi)`    @0x1440264   <- the `MXF::FileReader*` arg
//   +0x18  u64    (zero)      `movups %xmm0,0x18(%rdi)` @0x144026b   xmm0 zeroed @0x1440268
//   +0x20  u64    (zero)      same 16-byte store, upper half
//   +0x28  u64    (zero)      `movq $0x0,0x28(%rdi)`    @0x144026f
//
// So the constructor establishes exactly [0x00,0x30) and touches nothing else. It does NOT say the
// object is 0x30 bytes: this is the base subobject of a class hierarchy (see the C2-only note
// above), and a derived constructor is free to write past 0x30. What is asserted here is only what
// was measured — bytes [0x30,0x80) of a poisoned arena come back untouched (ORACLE below).
//
// ARGUMENT ORDER. Under the SysV ABI the implicit `this` is %rdi, so `MXF::FileReader*` is %rsi and
// the two `unsigned int`s are %edx and %ecx in declaration order. The FileReader therefore lands at
// +0x10 while the two integers land at +0x08 and +0x0c, which is the reverse of the order the
// parameters appear in — the same shape the landed `MXF__MXFPartitionEntry.ts` documents.
//
// ---------------------------------------------------------------------------------------------
// THE VTABLE POINTER — resolved, then CONFIRMED against the running image
// ---------------------------------------------------------------------------------------------
// The store is `leaq 0x4eb4bd(%rip),%rax ; movq %rax,(%rdi)`. The displacement is relative to the
// address of the NEXT instruction, so the value is 0x144025b + 0x4eb4bd = **0x192b718**, in
// __DATA_CONST. Re-derived from the raw bytes rather than from the printed listing:
//
//   0x1440254  48 8d 05 bd b4 4e 00     disp 0x4eb4bd -> 0x1440254 + 7 + 0x4eb4bd = 0x192b718
//
// This arithmetic is written out because getting it wrong is a filed defect on this project
// (`raw-port/army/ops/2026-08-11-a-landed-vtable-constant-is-0x500-low-and-invents-a-variant-.md`:
// a landed constant was 0x500 low, and the difference was then explained as a second "variant" that
// does not exist). Two independent checks say 0x192b718 is right, both executed:
//
//   1. IT IS A VTABLE. The eight words at 0x192b718 in the LIVE image resolve, via `dladdr`, to
//      this class's own methods:
//
//        [0] 0x1494050  MXF::MXFBuildIndex::~MXFBuildIndex()            (D1)
//        [1] 0x1494060  MXF::MXFBuildIndex::~MXFBuildIndex()            (D0, deleting)
//        [2] 0x1440910  MXF::MXFBuildIndex::isIndexTableRequiered()
//        [3] 0x1440320  MXF::MXFBuildIndex::checkAndInitData(MXFWrapping, MXFIndexTableSequence&)
//        [4] __cxa_pure_virtual in libc++abi.dylib
//        [5] __cxa_pure_virtual in libc++abi.dylib
//        [6] 0x1430b80  MXF::MXFBuildIndex::decodeLastFrame(MXFMedia*)
//
//      and the two words BELOW it are the standard Itanium-ABI vtable header: offset-to-top 0x0 at
//      0x192b708 and a typeinfo pointer at 0x192b710 -> 0x192b750, whose name string reads
//      `N3MXF13MXFBuildIndexE`. So the vtable OBJECT begins at 0x192b708 and the pointer a
//      constructor installs is that address + 0x10 = 0x192b718, exactly as the ABI requires.
//      The two `__cxa_pure_virtual` slots are why this class is abstract.
//   2. THE BINARY INSTALLS IT. Calling the constructor in the live image writes
//      `slide + 0x192b718` into +0x00 on every case tried (ORACLE below).
//
// ---------------------------------------------------------------------------------------------
// WHAT THE SLOTS ARE — grounded on sibling bodies and on two LANDED files, not inferred from names
// ---------------------------------------------------------------------------------------------
//
// +0x08 and +0x0c: `getIndexTableWithPosition` @0x14408a0 passes them straight through, in order,
// to `MXF::FileReader::loadIndexTable(long long, unsigned int, unsigned int, long long)`:
//
//   0x14408d1  movq 0x10(%r15),%rdi      ; this->fileReader   -> the receiver
//   0x14408d5  movl 0x8(%r15),%edx       ; this->+0x08        -> loadIndexTable's 1st unsigned
//   0x14408d9  movl 0xc(%r15),%ecx       ; this->+0x0c        -> loadIndexTable's 2nd unsigned
//   0x14408e4  callq __ZN3MXF10FileReader14loadIndexTableExjjx
//
// which is also what proves +0x10 holds an `MXF::FileReader*` — it is used as one. That callee is
// a one-instruction forwarder (`jmp __ZN3MXF16MXFPartitionData14loadIndexTableExjjx` @0x1448619),
// and in `MXF::MXFPartitionData::loadIndexTable` @0x14337d0 the two unsigned parameters are each
// compared against one field of an `MXF::MXFPartitionEntry`:
//
//   0x1433910  cmpl %r12d,%edx           ; the 1st unsigned vs entry->+0x00
//   0x14338ab  cmpl %ebx,0x30(%r12)      ; the 2nd unsigned vs entry->+0x30
//
// Both of those entry fields are already NAMED by landed files in this directory, from their own
// decode evidence: `MXF__MXFPartitionData.ts:52` documents `+0x00 uint32 streamID` (and its ported
// `lastStreamPosition(streamID)` compares exactly this field), and `MXF__MXFPartitionEntry.ts`
// documents `+0x30 u32 indexSID`, overwritten from the `kmiIndexSID` KLV item. Hence the two names
// used here. `checkAndInitData` @0x1440369 corroborates the first one from the other side: it
// passes this->+0x08 as the `unsigned int` argument of
// `MXF::MXFPartitionData::lastStreamPosition(unsigned int)`, whose landed port calls that parameter
// `streamID`.
//
// +0x18/+0x20/+0x28 ARE ONE libc++ `std::vector`, not three unrelated words. The destructor
// @0x1440280 reads them as `__begin_`/`__end_`, walks the range, and deallocates:
//
//   0x1440298  movq 0x18(%rdi),%rdi      ; __begin_
//   0x144029c  movq 0x20(%rbx),%rcx      ; __end_
//   0x14402a0  cmpq %rdi,%rcx ; je …     ; empty range -> skip the loop
//   0x14402c6  subq %rdi,%rax            ; (__end_ - __begin_)
//   0x14402c9  sarq $0x3,%rax            ; ... / 8
//   0x14402cd  imulq %r12,%rax           ; ... * 0x6db6db6db6db6db7  == the /56 idiom
//   0x14402d1  addq $0x38,%r14           ; the loop steps by 0x38 = 56 bytes
//   0x14402da  movq (%rdi,%r14),%rax     ; element + 0x28
//   0x14402e6  callq __ZdaPv             ; operator delete[] on it
//   0x14402fa  movq %rdi,0x20(%rbx)      ; __end_ = __begin_   (libc++'s clear-then-deallocate)
//   0x1440306  jmp __ZdlPv               ; operator delete(__begin_)
//
// The element stride is 0x38 and each element owns a `new[]` array at its own +0x28. That
// `movq %rdi,0x20(%rbx)` before `operator delete` is the tell for `std::vector`'s three-word
// layout, so +0x28 is `__end_cap_`. `containsVideoTrack` @0x1440810 reads the same pair
// (`movq 0x18(%rdi),%rcx ; cmpq %rcx,0x20(%rdi)`) and sends an ObjC `hasMedia` message to the
// pointer at each element's +0x00. This port therefore models the three words as the vector's three
// pointers and does NOT name the element type, which no body here establishes.
//
// ---------------------------------------------------------------------------------------------
// CALLEES: none. The body has no call of any kind — no in-scope callee, no extern, no allocation,
// no indirect or virtual dispatch (`depgraph.py deps` lists nothing for this symbol). Nothing in
// this file is a stub.
// ---------------------------------------------------------------------------------------------
//
// ORACLE — EXECUTED against live Final Cut Pro, and against THIS FILE, not read:
//   raw-port/re/oracle/MXF__MXFBuildIndex_ctor_oracle.py     (loads Flexo, calls the ctor)
//   raw-port/re/oracle/MXF__MXFBuildIndex_ctor_driver.mts    (imports THIS module, compares bytes)
// The symbol is LOCAL (`t` in the inventory), so it is not dlsym-able; it is called BY ADDRESS at
// `_dyld_get_image_vmaddr_slide(Flexo) + 0x1440250` under `arch -x86_64` — the port is transcribed
// from the x86_64 slice while a natively loaded image is arm64, and an address-based differential
// on the wrong slice fails silently toward VERIFIED. The 41 opcode bytes at that address are
// asserted against the bytes decoded above BEFORE anything is called, so a moved symbol is a
// refusal rather than a wrong answer. Flexo is loaded by walking `otool -L` depth-first and
// `CDLL(..., RTLD_GLOBAL)`-ing each dependency (37 images; `DYLD_*` is stripped from hardened
// python).
//
// MEASURED 2026-08-11 — 6 argument tuples, including (0,0,0), 0xffffffff in both integers,
// 0x80000000/0x7fffffff, a receiver pointer of 0x1122334455667788, and one whose receiver is
// 0xcdcdcdcdcdcdcdcd, i.e. EQUAL to the poison, so that a byte-diff is blind to that one store and
// the comparison still has to come out right. For every tuple, a 0x80-byte arena poisoned with 0xCD
// came back with bytes [0x00,0x30) EXACTLY as this port models them and bytes [0x30,0x80) still
// 0xCD. The TS side is the REAL module imported by the driver under
// `node --experimental-strip-types`, so the comparison is TypeScript-against-binary rather than
// binary-against-a-Python-restatement of the same misreading; the driver prints the constructor's
// own source text so a reviewer can see the measured code is the committed code.
//
// 7 MUTANTS, 7 KILLED — each a plausible misreading of THIS body, all evaluated in the same node
// process over the same 6 tuples (image = the 0x80-byte object, fields = the values the port hands
// its caller):
//   swapIntegers  the two `unsigned int`s stored the other way round      image 4/6, fields 4/6
//   readerAt0x18  the FileReader stored into the vector's __begin_        image 6/6, fields 0/6
//   vtableSymbol  the constant taken as the vtable SYMBOL 0x192b708       image 6/6, fields 6/6
//                 instead of symbol+0x10 (the recorded 0x500-low defect)
//   wideStreamID  `movl %edx,0x8(%rdi)` read as a 64-bit store            image 5/6, fields 0/6
//   omitEndCap    the trailing `movq $0x0,0x28(%rdi)` missed              image 6/6, fields 0/6
//   zeroTo0x38    the 16-byte zero store misread as reaching 0x38         image 6/6, fields 0/6
//   signedInts    the integers modelled SIGNED (`| 0`, not `>>> 0`)       image 0/6, fields 4/6
// That last row is the honest one and is why the driver compares fields as well as bytes: a signed
// and an unsigned 32-bit store put the SAME four bytes in the object, so the object image cannot
// distinguish them — only the value the port hands its caller can, and it does, on 0x80000000,
// 0x9abcdef0 and 0xffffffff.

/**
 * `MXF::MXFBuildIndex` — the abstract base of Flexo's MXF index-table builders.
 *
 * Only the constructor at @Flexo 0x1440250 is transcribed in this file, so only the state that
 * constructor establishes is modelled. Every field carries the offset and the instruction that
 * proves it (see the file header).
 *
 * POINTERS AS NUMERIC ADDRESSES: `bigint`, the convention the landed
 * `raw-port/src/channels/OZChannelMaterialRoot.ts` uses — this constructor stores pointer-width
 * words verbatim and the oracle compares them as the 64-bit values the binary wrote.
 */
export class MXF__MXFBuildIndex {
  /**
   * +0x00 — the vtable pointer, `vtable for MXF::MXFBuildIndex` + 0x10 = **0x192b718** (Flexo
   * vmaddr, __DATA_CONST). Installed by `leaq 0x4eb4bd(%rip),%rax ; movq %rax,(%rdi)`
   * @0x1440254/@0x144025b. The vtable object itself starts at 0x192b708 (offset-to-top 0, typeinfo
   * 0x192b750 = `N3MXF13MXFBuildIndexE`); slots 4 and 5 are `__cxa_pure_virtual`, which is what
   * makes the class abstract. Full slot table and the two live-image checks are in the file header.
   *
   * It is an image-relative address, so a running process holds `slide + 0x192b718`; the constant
   * stored here is the vmaddr, matching how the landed `OZChannel.ts` records its own vtables.
   */
  vtable: bigint = 0x192b718n;

  /**
   * +0x08 u32 — the FIRST `unsigned int` constructor argument (%edx). `getIndexTableWithPosition`
   * @0x14408d5 hands it to `FileReader::loadIndexTable` as that call's first unsigned, where it is
   * compared against an `MXF::MXFPartitionEntry`'s +0x00 (@0x1433910) — the field the landed
   * `MXF__MXFPartitionData.ts:52` documents as `streamID`. `checkAndInitData` @0x1440369 passes the
   * same word to `MXFPartitionData::lastStreamPosition(unsigned int)`, whose landed port names that
   * parameter `streamID` too. `movl %edx,0x8(%rdi)` @0x144025e.
   */
  streamID: number;

  /**
   * +0x0c u32 — the SECOND `unsigned int` constructor argument (%ecx). `getIndexTableWithPosition`
   * @0x14408d9 hands it to `FileReader::loadIndexTable` as that call's second unsigned, where it is
   * compared against an `MXF::MXFPartitionEntry`'s +0x30 (@0x14338ab) — the field the landed
   * `MXF__MXFPartitionEntry.ts` documents as `indexSID`, overwritten from the `kmiIndexSID` KLV
   * item. `movl %ecx,0xc(%rdi)` @0x1440261.
   */
  indexSID: number;

  /**
   * +0x10 — the `MXF::FileReader*` constructor argument (%rsi), stored verbatim. Used as the
   * receiver of `FileReader::loadIndexTable` @0x14408d1 and, at +0x40 into it, of
   * `MXFPartitionData::lastStreamPosition` @0x1440360. `movq %rsi,0x10(%rdi)` @0x1440264.
   */
  fileReader: bigint;

  /**
   * +0x18 — `__begin_` of the libc++ `std::vector` embedded at +0x18. Zeroed by
   * `xorps %xmm0,%xmm0 ; movups %xmm0,0x18(%rdi)` @0x1440268/@0x144026b. Read as the range start by
   * the destructor @0x1440298 and by `containsVideoTrack` @0x1440810; elements are 0x38 bytes
   * (the destructor's `/56` idiom and its `addq $0x38` step).
   */
  entriesBegin: bigint;

  /**
   * +0x20 — `__end_` of that vector; the upper half of the same 16-byte zero store @0x144026b.
   * Read at @0x144029c, and set back to `__begin_` by the destructor @0x14402fa before it frees the
   * buffer — the libc++ clear-then-deallocate that identifies the three-word layout.
   */
  entriesEnd: bigint;

  /**
   * +0x28 — `__end_cap_` of that vector. Zeroed by its own `movq $0x0,0x28(%rdi)` @0x144026f, the
   * last store the constructor makes.
   */
  entriesEndCap: bigint;

  /**
   * `MXF::MXFBuildIndex::MXFBuildIndex(MXF::FileReader*, unsigned int, unsigned int)`
   * — @Flexo 0x1440250 (`__ZN3MXF13MXFBuildIndexC2EPNS_10FileReaderEjj`).
   *
   * FULL transcription — every instruction, in order:
   *
   *   0x1440250  pushq  %rbp                     ; frame setup (no TS counterpart)
   *   0x1440251  movq   %rsp,%rbp                ; frame setup (no TS counterpart)
   *   0x1440254  leaq   0x4eb4bd(%rip),%rax      ; rax = 0x192b718 = vtable+0x10
   *   0x144025b  movq   %rax,(%rdi)              ; this->vtable = 0x192b718
   *   0x144025e  movl   %edx,0x8(%rdi)           ; this->streamID = (u32)arg2
   *   0x1440261  movl   %ecx,0xc(%rdi)           ; this->indexSID = (u32)arg3
   *   0x1440264  movq   %rsi,0x10(%rdi)          ; this->fileReader = arg1
   *   0x1440268  xorps  %xmm0,%xmm0              ; xmm0 = 0 — the zero source for the next store
   *   0x144026b  movups %xmm0,0x18(%rdi)         ; zero [0x18,0x28)  (__begin_, __end_)
   *   0x144026f  movq   $0x0,0x28(%rdi)          ; zero [0x28,0x30)  (__end_cap_)
   *   0x1440277  popq   %rbp                     ; frame teardown (no TS counterpart)
   *   0x1440278  retq
   *   0x1440279  nopl   (%rax)                   ; alignment padding, not executed
   *
   * There is no branch, no call and no read of any existing field: the constructor writes seven
   * words and returns. Nothing is conditional, so there is nothing for the AT&T dst-src compare
   * rule to get backwards here.
   *
   * `%edx` and `%ecx` are 32-bit writes into 32-bit slots, so the stored values are the unsigned
   * 32-bit arguments; the port applies `>>> 0` to keep that width exact. The object BYTES are the
   * same either way — a signed model is caught by the oracle's field comparison, not by its
   * byte-diff, and the file header says so rather than claiming a kill the image cannot make.
   *
   * @param fileReader the `MXF::FileReader*` in %rsi -> +0x10.
   * @param streamID   the first `unsigned int` in %edx -> +0x08.
   * @param indexSID   the second `unsigned int` in %ecx -> +0x0c.
   */
  constructor(fileReader: bigint, streamID: number, indexSID: number) {
    // @0x1440254/@0x144025b  leaq 0x4eb4bd(%rip),%rax ; movq %rax,(%rdi)
    this.vtable = 0x192b718n;
    // @0x144025e  movl %edx,0x8(%rdi)
    this.streamID = streamID >>> 0;
    // @0x1440261  movl %ecx,0xc(%rdi)
    this.indexSID = indexSID >>> 0;
    // @0x1440264  movq %rsi,0x10(%rdi)
    this.fileReader = BigInt.asUintN(64, fileReader);
    // @0x1440268/@0x144026b  xorps %xmm0,%xmm0 ; movups %xmm0,0x18(%rdi) — zero [0x18,0x28).
    this.entriesBegin = 0n;
    this.entriesEnd = 0n;
    // @0x144026f  movq $0x0,0x28(%rdi) — zero [0x28,0x30).
    this.entriesEndCap = 0n;
    // @0x1440278  retq — the constructor returns nothing, and writes nothing at or past +0x30.
  }
}
