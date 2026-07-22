//Metal1.0     
//LEN=00000002f4
[[ visible ]] FragmentOut HgcTint_hgc_visible(const constant float4* hg_Params,
    float4 color0)
{
    const float4 c0 = float4(1.000000000, 2.000000000, 0.5000000000, 0.000000000);
    float4 r0, r1, r2;
    FragmentOut output;

    r0 = color0;
    r0 = r0 / float4(fmax(r0.www, 1.00000e-06f), 1.);
    r1.w = dot(r0.xyz, hg_Params[2].xyz);
    r2.x = c0.x - r1.w;
    r1.xyz = r2.xxx*hg_Params[0].xyz + -r2.xxx;
    r2.xyz = r1.xyz*c0.yyy + c0.xxx;
    r1.xyz = r1.www*hg_Params[0].xyz;
    r1.xyz = r1.xyz*c0.yyy + -r2.xyz;
    r1.w = float(r1.w < c0.z);
    r1.xyz = r1.www*r1.xyz + r2.xyz;
    r0.xyz = mix(r0.xyz, r1.xyz, hg_Params[1].xyz);
    r0.xyz = r0.xyz*r0.www;
    output.color0 = r0;
    return output;
}


