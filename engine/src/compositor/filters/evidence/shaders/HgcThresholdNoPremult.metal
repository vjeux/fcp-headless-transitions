===== HgcThresholdNoPremult =====
//Metal1.0     
//LEN=0000000242
[[ visible ]] FragmentOut HgcThresholdNoPremult_hgc_visible(const constant float4* hg_Params,
    float4 color0)
{
    const float4 c0 = float4(0.3086000085, 0.6093999743, 0.08200000226, 0.5000000000);
    float4 r0, r1;
    FragmentOut output;

    r0 = color0;
    r1.x = dot(r0.xyz, c0.xyz);
    r1.x = r1.x - hg_Params[0].x;
    r1.x = clamp(r1.x*hg_Params[1].x + c0.w, 0.00000f, 1.00000f);
    r1.xyz = mix(hg_Params[2].xyz, hg_Params[3].xyz, r1.xxx);
    output.color0.xyz = r1.xyz*r0.www;
    output.color0.w = r0.w;
    return output;
}


