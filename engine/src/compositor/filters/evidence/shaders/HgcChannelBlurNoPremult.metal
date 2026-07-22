===== HgcChannelBlurNoPremult =====
//Metal1.0     
//LEN=000000013b
[[ visible ]] FragmentOut HgcChannelBlurNoPremult_hgc_visible(const constant float4* hg_Params,
    float4 color0,
    float4 color1)
{
    float4 r0, r1;
    FragmentOut output;

    r0 = color0;
    r1 = color1;
    output.color0 = mix(r0, r1, hg_Params[0]);
    return output;
}
