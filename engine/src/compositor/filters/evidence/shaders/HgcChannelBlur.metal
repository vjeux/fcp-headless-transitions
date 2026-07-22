//Metal1.0     
//LEN=00000001aa
[[ visible ]] FragmentOut HgcChannelBlur_hgc_visible(const constant float4* hg_Params,
    float4 color0,
    float4 color1)
{
    float4 r0, r1;
    FragmentOut output;

    r0 = color0;
    r1 = color1;
    r1.xyz = r1.xyz / fmax(r1.w, 1.00000e-06f);
    r1.xyz = mix(r0.xyz, r1.xyz, hg_Params[0].xyz);
    output.color0.xyz = r1.xyz*r0.www;
    output.color0.w = r0.w;
    return output;
}


