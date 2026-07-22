===== HgcShrinkAndFeatherMatteMagic =====
//Metal1.0     
//LEN=0000000250
[[ visible ]] FragmentOut HgcShrinkAndFeatherMatteMagic_hgc_visible(const constant float4* hg_Params,
    float4 color0,
    float4 color1)
{
    const float4 c0 = float4(0.000000000, 0.000000000, 0.000000000, 1.000000000);
    float4 r0, r1;
    FragmentOut output;

    r0 = color0;
    r1.w = color1.w;
    r1.w = c0.w - r1.w;
    r1.w = r1.w - hg_Params[0].x;
    r1.w = clamp(r1.w*hg_Params[0].y, 0.00000f, 1.00000f);
    r0.xyz = r0.xyz / fmax(r0.w, 1.00000e-06f);
    output.color0.xyz = r0.xyz*r1.www;
    output.color0.w = r1.w;
    return output;
}
