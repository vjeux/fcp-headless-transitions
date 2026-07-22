//Metal1.0     
//LEN=000000010f
[[ visible ]] FragmentOut HgcPremultiply_hgc_visible(const constant float4* hg_Params,
    float4 color0)
{
    float4 r0;
    FragmentOut output;

    r0 = color0;
    r0.xyz = r0.xyz*r0.www;
    output.color0 = r0;
    return output;
}
