===== HgcLineArtThreshold =====
//Metal1.0     
//LEN=0000000201
[[ visible ]] FragmentOut HgcLineArtThreshold_hgc_visible(const constant float4* hg_Params,
    float4 color0)
{
    const float4 c0 = float4(0.3086000085, 0.6093999743, 0.08200000226, 0.5000000000);
    float4 r0;
    FragmentOut output;

    r0.xyz = color0.xyz;
    r0.x = dot(r0.xyz, c0.xyz);
    r0.x = r0.x - hg_Params[0].x;
    r0.x = clamp(r0.x*hg_Params[1].x + c0.w, 0.00000f, 1.00000f);
    output.color0 = mix(hg_Params[2], hg_Params[3], r0.xxxx);
    return output;
}
