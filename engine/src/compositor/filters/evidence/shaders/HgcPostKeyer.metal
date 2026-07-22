===== HgcPostKeyer =====
//Metal1.0     
//LEN=0000000265
[[ visible ]] FragmentOut HgcPostKeyer_hgc_visible(const constant float4* hg_Params,
    float4 color0,
    float4 color1,
    float4 color2)
{
    const float4 c0 = float4(1.500000000, 0.000000000, 0.000000000, 0.000000000);
    float4 r0, r1, r2;
    FragmentOut output;

    r0.w = clamp(color0.w, 0.00000f, 1.00000f);
    r1.w = color1.w;
    r2.xyz = color2.xyz;
    r2.w = r0.w*r1.w;
    r0.xyz = r2.xyz*r2.www;
    r0.w = r2.w;
    r1.xyz = r2.www*c0.xxx;
    r2.xyz = fmin(r2.xyz, r1.xyz);
    output.color0 = select(r2, r0, hg_Params[0] < 0.00000f);
    return output;
}
