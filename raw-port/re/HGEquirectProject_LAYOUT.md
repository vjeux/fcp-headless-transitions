# HGEquirectProject struct layout (partial)

Recovered from `HGEquirectProject::setParams(HGEquirectProjectParams const&)`
@Helium 0x1c0820. Only the region touched by setParams is decoded here; the
vtable / base HGNode fields and the full params record are open frontiers.

## Object fields
| offset | size | type | name            | provenance |
|--------|------|------|-----------------|------------|
| +0x198 | 0x9c | struct HGEquirectProjectParams | params | memcpy dst @0x1c0829/@0x1c0835 |

### Params sub-fields read by setParams (params_base = +0x198)
| abs offset | rel | type | name | provenance |
|-----------|-----|------|------|------------|
| +0x1e0 | +0x48 | i32 | srcWidth  | movl 0x1e0 @0x1c0860 |
| +0x1e4 | +0x4c | i32 | srcHeight | movl 0x1e4 @0x1c0866 |
| +0x1e8 | +0x50 | i32 | panX      | subl 0x1e8 @0x1c08c3 |
| +0x1ec | +0x54 | i32 | panY      | subl 0x1ec @0x1c08f8 |
| +0x1f0 | +0x58 | u8  | paramsLocked | cmpb 0x1f0 @0x1c083a |

### Derived projection transform block (written iff paramsLocked==0)
| offset | type | name | value | provenance |
|--------|------|------|-------|------------|
| +0x1f4 | f32 | xformA_scaleX | 1.0 | movlps @0x1c08b0 (lo) |
| +0x1f8 | f32 | xformA_scaleY | 6.0 | movlps @0x1c08b0 (hi) |
| +0x1fc | u32 | xformA_pad    | 0   | movl   @0x1c08b7 |
| +0x200 | f32 | xformA_transX | -panX*0.5 | movss @0x1c08de |
| +0x204 | f32 | xformA_r0     | 0.0 | movsd  @0x1c08e6 (lo) |
| +0x208 | f32 | xformA_r1     | 1.0 | movsd  @0x1c08e6 (hi) |
| +0x20c | u32 | xformA_pad2   | 0   | movl   @0x1c08ee |
| +0x210 | f32 | xformA_transY | -panY*0.5 | movss @0x1c0909 |
| +0x214 | f32 | xformB_scaleX | 1.0 | movlps @0x1c084f (lo) |
| +0x218 | f32 | xformB_scaleY | 6.0 | movlps @0x1c084f (hi) |
| +0x21c | u32 | xformB_pad    | 0   | movl   @0x1c0856 |
| +0x220 | f32 | xformB_halfW  | srcWidth/2  | movss @0x1c0879 |
| +0x224 | f32 | xformB_r0     | 0.0 | movsd  @0x1c0896 (lo) |
| +0x228 | f32 | xformB_r1     | 1.0 | movsd  @0x1c0896 (hi) |
| +0x22c | u32 | xformB_pad2   | 0   | movl   @0x1c089e |
| +0x230 | f32 | xformB_halfH  | srcHeight/2 | movss @0x1c08a8 |

## Constants (RIP-relative literals, x86_64 slice bytes verified)
- 0x3c7cc0 : `00 00 80 3f 00 00 c0 40` = {1.0f, 6.0f}  (movss/movlps xmm0)
- 0x3c7cb0 : `00 00 00 00 00 00 80 3f` = {0.0f, 1.0f}  (movsd xmm1)
- 0x3c7cc8 : `00 00 00 3f` = 0.5f  (movss xmm2, center-offset scale)

## Notes
- `sarl` w/ implicit count 1 + `x += (x>>>31)` = signed divide-by-2 toward zero.
- Field semantic names (`xformA_`/`xformB_`, half-dimensions, center offsets)
  are inferred from the two 8-byte movlps/movsd grouped writes; offsets +
  constants are authoritative.
