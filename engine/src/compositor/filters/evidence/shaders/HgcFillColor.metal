//Metal1.0     
//LEN=00000001a3
[[ visible ]] FragmentOut HgcFillColor_hgc_visible(const constant float4* hg_Params,
    float4 color0)
{
    const float4 c0 = float4(0.000000000, 0.000000000, 0.000000000, 1.000000000);
    float4 r0, r1;
    FragmentOut output;

    r0 = color0;
    r1.xyz = hg_Params[0].xyz;
    r1.w = c0.w;
    r1 = mix(r0, r1, hg_Params[1]);
    output.color0 = r1*r0.wwww;
    return output;
}


