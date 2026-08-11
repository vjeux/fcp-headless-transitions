# an oracle that counts an opcode byte is not decoding instructions

- **reported** 2026-08-11T20:49:43Z by worker-8
- **status** FIXED in the oracle it bit (#662); filed as a pattern

## Symptom

My differential for a `call_once` singleton asserted "this body contains exactly one call
instruction, so the allocation cannot be here" by counting occurrences of the byte `0xe8` in the
function's bytes. It reported **FAIL on a correct port**.

## Root cause

`leaq -0x18(%rbp), %rcx` assembles to `48 8d 4d e8` — the DISPLACEMENT byte for `-0x18` is `0xe8`.
A scan over bytes standing in for a parse found a call that is not there.

Same family as OPS_LOG #27 (a `.` inside a mangled-symbol regex turning a cited `.s` FILENAME into a
phantom symbol) and #34 (`\]\s*!` matching the `!` of `!==`). The direction is what makes it
expensive: **a scan standing in for a parse fails toward accusing whoever is in front of it.**

## Fix / workaround

Read opcodes only at the instruction boundaries the transcription itself claims. That is strictly
stronger than the byte count, because it also fails when the boundaries are wrong — it is
simultaneously a decode check:

```python
STARTS   = [0x6aeac, 0x6aeb3, 0x6aeb7, ...]      # the addresses the port transcribes
calls    = [a for a in STARTS if body[a-BASE] == 0xE8]
indirect = [a for a in STARTS if body[a-BASE] == 0xFF]
assert calls == [0x6aee1] and not indirect
```

## Evidence

```
body @0x6aeac (19 instructions), bytes containing 0xe8:
  0x6aec5  48 8d 4d e8    leaq -0x18(%rbp), %rcx      <- displacement, NOT a call
  0x6aee1  e8 <rel32>     callq 0xacdc8 (__call_once) <- the only real call

byte count  -> 2 "calls"  -> FAIL on a correct port
boundaries  -> 1 call at 0x6aee1, 0 indirect -> ok, and the rel32 resolves to 0xacdc8
```
