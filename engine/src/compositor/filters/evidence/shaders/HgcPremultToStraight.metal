===== HgcPremultToStraight =====
//Metal1.0     
//LEN=0000000122
[[ visible ]] FragmentOut HgcPremultToStraight_hgc_visible(const constant float4* hg_Params,
    float4 color0)
{
    float4 r0;
    FragmentOut output;

    r0 = color0;
    output.color0 = r0 / float4(fmax(r0.www, 1.00000e-06f), 1.);
    return output;
}
