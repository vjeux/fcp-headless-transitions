===== HgcReconstructDT =====
//Metal1.0     
//LEN=00000001a4
[[ visible ]] FragmentOut HgcReconstructDT_hgc_visible(const constant float4* hg_Params,
    float4 color0)
{
    const float4 c0 = float4(0.000000000, 0.000000000, 0.000000000, 0.000000000);
    float4 r0;
    FragmentOut output;

    r0.x = color0.x;
    r0.x = r0.x*hg_Params[0].x;
    output.color0.xyz = r0.xxx;
    output.color0.w = float(-fabs(r0.x) < c0.w);
    return output;
}
