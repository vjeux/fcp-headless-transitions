//Metal1.0     
//LEN=00000001b2
[[ visible ]] FragmentOut HgcNegative_hgc_visible(const constant float4* hg_Params,
    float4 color0)
{
    const float4 c0 = float4(1.000000000, 0.000000000, 0.000000000, 0.000000000);
    float4 r0;
    FragmentOut output;

    r0 = color0;
    r0 = r0 / float4(fmax(r0.www, 1.00000e-06f), 1.);
    r0.xyz = c0.xxx - r0.xyz;
    r0.xyz = r0.xyz*r0.www;
    output.color0 = r0;
    return output;
}


