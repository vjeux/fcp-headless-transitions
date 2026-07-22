//Metal1.0     
//LEN=0000000249
[[ visible ]] FragmentOut HgcGlowCombineFx_hgc_visible(const constant float4* hg_Params,
    float4 color0,
    float4 color1)
{
    const float4 c0 = float4(1.000000000, 0.000000000, 0.000000000, 0.000000000);
    float4 r0, r1, r2;
    FragmentOut output;

    r0 = color1;
    r1.w = clamp(r0.w*hg_Params[0].x, 0.00000f, 1.00000f);
    r0.xyz = r0.xyz*hg_Params[0].xxx;
    r1.xyz = fmin(r0.xyz, hg_Params[1].xyz);
    r0.x = c0.x - r1.w;
    r2 = color0;
    r1.xyz = fmax(r1.xyz, c0.yyy);
    output.color0 = r0.xxxx*r2 + r1;
    return output;
}


