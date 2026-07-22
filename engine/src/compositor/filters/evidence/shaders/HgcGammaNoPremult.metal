//Metal1.0     
//LEN=0000000169
[[ visible ]] FragmentOut HgcGammaNoPremult_hgc_visible(const constant float4* hg_Params,
    float4 color0)
{
    float4 r0, r1, r2;
    FragmentOut output;

    r0 = color0;
    r1 = abs(r0);
    r2.xyz = pow(r1.xyz, hg_Params[0].xyz);
    r2.w = r1.w;
    output.color0 = select(r2, -r2, r0 < 0.00000f);
    return output;
}
