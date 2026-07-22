//Metal1.0     
//LEN=0000000145
[[ visible ]] FragmentOut HgcGlow_hgc_visible(const constant float4* hg_Params,
    float4 color0)
{
    float4 r0;
    FragmentOut output;

    r0 = color0;
    r0.w = clamp(dot(r0, hg_Params[0]), 0.00000f, 1.00000f);
    r0.xyz = r0.xyz*r0.www;
    output.color0 = r0;
    return output;
}


