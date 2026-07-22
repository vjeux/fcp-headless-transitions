//Metal1.0     
//LEN=0000000119
[[ visible ]] FragmentOut HgcPSImageTint_hgc_visible(const constant float4* hg_Params,
    float4 color0)
{
    float4 r0;
    FragmentOut output;

    r0 = color0;
    r0.xyz = r0.xyz*hg_Params[0].xyz;
    output.color0 = r0;
    return output;
}
