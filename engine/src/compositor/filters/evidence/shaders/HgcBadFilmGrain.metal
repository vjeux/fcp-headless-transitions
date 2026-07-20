===== HgcBadFilmGrain =====
//Metal1.0     
//LEN=0000000321
[[ visible ]] FragmentOut HgcBadFilmGrain_hgc_visible(const constant float4* hg_Params,
    float4 color0,
    float4 color1,
    float4 color2)
{
    const float4 c0 = float4(2.000000000, 1.000000000, 0.000000000, 0.000000000);
    float4 r0, r1, r2;
    FragmentOut output;

    r0 = color0;
    r1.xyz = r0.xyz / fmax(r0.w, 1.00000e-06f);
    r2.xyz = color2.xyz;
    r1.xyz = r2.xyz*c0.xxx + r1.xyz;
    r2 = color1;
    r2.w = -r2.w + c0.y;
    r1.xyz = r1.xyz - c0.yyy;
    r1.xyz = r2.www*r1.xyz + r2.xyz;
    r1.w = r0.w;
    r2.w = c0.y;
    r2.xyz = hg_Params[0].xyz;
    r2 = r1*r2;
    r2.w = dot(r2, hg_Params[2]);
    r2.xyz = mix(r2.www, r2.xyz, hg_Params[1].xyz);
    output.color0.xyz = r0.www*r2.xyz;
    output.color0.w = r0.w;
    return output;
}


