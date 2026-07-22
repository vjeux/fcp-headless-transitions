//Metal1.0     
//LEN=00000001e8
[[ visible ]] FragmentOut HgcGloom_hgc_visible(const constant float4* hg_Params,
    float4 color0,
    float4 color1)
{
    const float4 c0 = float4(0.000000000, 0.000000000, 0.000000000, 0.000000000);
    float4 r0, r1;
    FragmentOut output;

    r0 = color0;
    r1 = color1;
    r1 = fmin(r0, r1);
    r0 = mix(r0, r1, hg_Params[0]);
    r1.xyz = r0.xyz;
    r1.w = c0.w;
    output.color0 = select(r0, r1, r0.wwww < 0.00000f);
    return output;
}


