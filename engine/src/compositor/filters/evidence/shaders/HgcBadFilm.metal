===== HgcBadFilm =====
//Metal1.0     
//LEN=00000002ad
[[ visible ]] FragmentOut HgcBadFilm_hgc_visible(const constant float4* hg_Params,
    float4 color0,
    float4 color1)
{
    const float4 c0 = float4(0.000000000, 0.000000000, 0.000000000, 1.000000000);
    float4 r0, r1, r2;
    FragmentOut output;

    r0 = color0;
    r1 = color1;
    r1.w = -r1.w + c0.w;
    r2.xyz = r0.xyz / fmax(r0.w, 1.00000e-06f);
    r2.xyz = r1.www*r2.xyz + r1.xyz;
    r2.w = r0.w;
    r1.w = c0.w;
    r1.xyz = hg_Params[0].xyz;
    r1 = r2*r1;
    r1.w = dot(r1, hg_Params[2]);
    r1.xyz = mix(r1.www, r1.xyz, hg_Params[1].xyz);
    output.color0.xyz = r0.www*r1.xyz;
    output.color0.w = r0.w;
    return output;
}


