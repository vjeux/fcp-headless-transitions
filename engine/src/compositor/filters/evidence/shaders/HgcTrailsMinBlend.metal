===== HgcTrailsMinBlend =====
//Metal1.0     
//LEN=00000001a3
[[ visible ]] FragmentOut HgcTrailsMinBlend_hgc_visible(const constant float4* hg_Params,
    float4 color0,
    float4 color1)
{
    const float4 c0 = float4(1.000000000, 0.000000000, 0.000000000, 0.000000000);
    float4 r0, r1;
    FragmentOut output;

    r0 = color0;
    r1 = color1;
    r1 = mix(c0.xxxx, r1, hg_Params[0]);
    output.color0 = fmin(r0, r1);
    return output;
}
