===== HgcOuterGlowColorize =====
//Metal1.0     
//LEN=0000000227
[[ visible ]] FragmentOut HgcOuterGlowColorize_hgc_visible(const constant float4* hg_Params,
    float4 color0)
{
    const float4 c0 = float4(1.000000000, 0.000000000, 0.000000000, 0.000000000);
    float4 r0, r1;
    FragmentOut output;

    r0.w = color0.w;
    r0.x = r0.w*hg_Params[3].x;
    r0.x = fmin(r0.x, c0.x);
    r1.xyz = mix(hg_Params[0].xyz, hg_Params[1].xyz, r0.xxx);
    r0.x = r0.x*hg_Params[2].x;
    r1.w = fmin(r0.x, c0.x);
    r1.xyz = r1.xyz*r1.www;
    output.color0 = r1;
    return output;
}
