===== HgcOuterGlowLumaWeight =====
//Metal1.0     
//LEN=000000015b
[[ visible ]] FragmentOut HgcOuterGlowLumaWeight_hgc_visible(const constant float4* hg_Params,
    float4 color0,
    float4 color1)
{
    float4 r0, r1, r2;
    FragmentOut output;

    r0 = color0;
    r1 = color1;
    r2.x = dot(r1, hg_Params[0]);
    output.color0 = mix(r0, r1, r2.xxxx);
    return output;
}
