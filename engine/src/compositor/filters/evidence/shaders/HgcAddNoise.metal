===== HgcAddNoise =====
//Metal1.0     
//LEN=00000001da
[[ visible ]] FragmentOut HgcAddNoise_hgc_visible(const constant float4* hg_Params,
    float4 color0,
    float4 color1)
{
    const float4 c0 = float4(2.000000000, 0.000000000, 0.000000000, 1.000000000);
    float4 r0, r1;
    FragmentOut output;

    r0 = color0;
    r1.w = color1.w;
    r0 = r0*c0.xxxw + -c0.wwwy;
    r0 = r0*hg_Params[0];
    r0 = mix(r0, fabs(r0), hg_Params[1]);
    output.color0 = r0*r1.wwww;
    return output;
}


