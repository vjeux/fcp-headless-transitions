//Metal1.0     
//LEN=0000000283
[[ visible ]] FragmentOut HgcUnsharpMask_hgc_visible(const constant float4* hg_Params,
    float4 color0,
    float4 color1)
{
    const float4 c0 = float4(0.000000000, 0.000000000, 0.000000000, 0.000000000);
    float4 r0, r1, r2, r3;
    FragmentOut output;

    r0 = color0;
    r1 = color1;
    r1 = r0 - r1;
    r2 = r1 - hg_Params[1].xxxx;
    r2 = fmax(r2, c0.xxxx);
    r3 = r1 + hg_Params[1].xxxx;
    r3 = fmin(r3, c0.xxxx);
    r1 = select(r2, r3, r1 < 0.00000f);
    r1 = r1*hg_Params[0] + r0;
    r1.w = clamp(r1.w, 0.00000f, 1.00000f);
    output.color0 = fmax(c0.xxxx, r1);
    return output;
}


