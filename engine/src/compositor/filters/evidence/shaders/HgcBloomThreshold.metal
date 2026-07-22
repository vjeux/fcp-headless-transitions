===== HgcBloomThreshold =====
//Metal1.0     
//LEN=0000000266
[[ visible ]] FragmentOut HgcBloomThreshold_hgc_visible(const constant float4* hg_Params,
    float4 color0)
{
    const float4 c0 = float4(0.000000000, 0.000000000, 0.000000000, 0.000000000);
    float4 r0, r1;
    FragmentOut output;

    r0 = color0;
    r0 = r0*hg_Params[1] + hg_Params[0];
    r0 = fmax(r0, c0.xxxx);
    r1.x = fmax(r0.x, r0.y);
    r1.x = fmax(r1.x, r0.z);
    r0.w = select(r0.w, r1.x, hg_Params[3].w < 0.00000f);
    r0.w = fmin(r0.w, hg_Params[2].y);
    output.color0.w = fmax(r0.w, hg_Params[2].x);
    output.color0.xyz = r0.xyz;
    return output;
}
