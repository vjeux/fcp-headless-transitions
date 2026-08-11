# a landed vtable constant is 0x500 low, and it invents a "copy variant" that does not exist

- **reported** 2026-08-11T20:45:00Z by reviewer-7
- **status** OPEN — a defect on `main`, needs a worker unit. Found while clearing a G5 NO-DISASM
  flag on PR #652 (which is unrelated and landed clean).

## Symptom

`raw-port/src/channels/OZChannelBase.ts`'s sibling `raw-port/src/channels/OZChannel.ts` records two
different vtable-pointer pairs for one class and describes them as two variants:

    line  25 //   0x00 : void*  vtable             (installed = 0xd0f08)
    line  26 //   0x10 : void*  vtable_thunk_slot  (installed = 0xd1268)
    line 143 /** Primary vtable pointer @0x00 (installed = 0xd0f08 / 0xd1408). */
    line 145 /** Secondary vtable slot @0x10 (installed = 0xd1268 / 0xd1768). */
    line 202   self.ozChannelVtablePrimary = 0xd0f08;     // in OZChannel__C2_base
    line 204   self.ozChannelVtableSecondary = 0xd1268;   // in OZChannel__C2_base
    line 292   self.ozChannelVtablePrimary = 0xd1408;     // in OZChannel__C2_copy

The two constants in the BASE ctor are wrong. Both are 0x500 below the real installed pointer, and
the "copy variant" the file infers from the difference does not exist: both constructors install the
same pair.

## Root cause

An arithmetic slip in the `leaq` RIP-relative resolution, then a plausible story built on top of it.
Decoded from the raw bytes of `/tmp/ProChannel.x86_64` (the displacement is relative to the address
of the NEXT instruction):

    0x13d16  48 8d 05 eb d6 0b 00   disp 0xbd6eb -> 0x13d1d + 0xbd6eb = 0xd1408   (file says 0xd0f08)
    0x13d20  48 8d 05 41 da 0b 00   disp 0xbda41 -> 0x13d27 + 0xbda41 = 0xd1768   (file says 0xd1268)

and the copy ctor, whose constants the file gets RIGHT, resolves to the same two addresses from
different sites — which is the tell that there is one vtable pair, not two:

    0x13fc6  disp 0xbd43b -> 0x13fcd + 0xbd43b = 0xd1408
    0x13fd0  disp 0xbd791 -> 0x13fd7 + 0xbd791 = 0xd1768

Confirmed in the live image (ProChannel slide `0x109d5d000`, `arch -x86_64`), which settles it
without trusting anyone's arithmetic including mine — a vtable is a run of code pointers and the
wrong addresses are not:

    @0xd1408  109d71152 109d7116a 109dc6e90 109dae888 109dc6eb0 109dc6ec0   <- all ProChannel text
    @0xd1768  109d7115c 109d71186 109d71d0a 109d7207c 109da8ca0 109d720e8   <- all ProChannel text
    @0xd0f08  7ff85563fbd8  109e0d2f2  200000000  109e27a28  2  109a312e0   <- not a vtable
    @0xd1268  109e2e280  109d7012a  109d70148  7ff85563fbd8  109e0d351  …   <- not a vtable

`0x0000000200000000` is an offset-to-top/typeinfo word, i.e. those two addresses point into the
MIDDLE of some other vtable's header, which is exactly what being 0x500 off looks like.

## Fix / workaround

A worker unit on `OZChannel.ts`: set both base-ctor constants to `0xd1408` / `0xd1768`, and delete
the primary-vs-copy distinction at lines 25-26, 143-145, 169-171 and 223 — there is one pair. The
copy ctor's own two lines are already correct and should not be touched.

The generalisable part, which is why this is filed rather than just fixed:

* **No gate reads a decoded constant.** G1 checks that a citation EXISTS, G5 checks the body against
  the disassembly, G6 checks nothing was deleted. A number that is grounded in a real `leaq` at a
  real address, and wrong, passes all of them — the same shape as the ctor-initialiser entry already
  in `OPS_LOG.md` ("the wrong value was in the initialiser, which no gate reads").
* **A wrong number does not stay one number.** Here it grew a second claim — two vtable variants —
  and put it in the class-layout comment block, where the next reader takes it as decoded fact and
  the next port of a subclass ctor will look for a variant to match.
* **The G5 NO-DISASM flag earned its keep.** These two exports were flagged only because
  `_sym_names_method` cannot join the export name `OZChannel__C2_base` to a symbol; the flag said
  "re-derive this", I did, and that is the only reason anyone looked. A flag on a LANDED export is
  not noise even when the PR under review does not touch it.

## Evidence

Full derivation, reproducible in any leased worktree:

```
bash raw-port/tools/disasm.sh --sym \
  __ZN9OZChannelC2EP9OZFactoryRK8PCStringP15OZChannelFolderjjP13OZChannelImplP13OZChannelInfo ProChannel
# 27 lines; the two leaq at 0x13d16 / 0x13d20

python3 - <<'EOF'
import struct
d = open('/tmp/ProChannel.x86_64','rb').read()          # __TEXT vmaddr 0, fileoff 0
for va in (0x13d16, 0x13d20):
    b = d[va:va+7]; disp = struct.unpack('<i', b[3:7])[0]
    print(hex(va), b.hex(), 'disp 0x%x -> 0x%x' % (disp, va+7+disp))
EOF
```

and the live check that says which of the two candidates is a vtable at all: dlopen ProChannel
(preload ProCore first), take `_dyld_get_image_vmaddr_slide`, and read six qwords at each address —
a vtable is six consecutive pointers into the image's own text.
