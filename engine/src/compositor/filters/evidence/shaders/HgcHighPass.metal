===== HgcHighPass =====
//Metal1.0     
//LEN=000000025d
[[ visible ]] FragmentOut HgcHighPass_hgc_visible(const constant float4* hg_Params,
    float4 color0,
    float4 color1)
{
    const float4 c0 = float4(0.5000000000, 0.000000000, 0.000000000, 0.000000000);
    float4 r0, r1;
    FragmentOut output;

    r0 = color0;
    r0 = r0 / float4(fmax(r0.www, 1.00000e-06f), 1.);
    r1 = color1;
    r1.xyz = r1.xyz / fmax(r1.w, 1.00000e-06f);
    r1.xyz = r0.xyz - r1.xyz;
    r1.xyz = r1.xyz*hg_Params[0].xyz + c0.xxx;
    r0.xyz = fmax(r1.xyz, c0.yyy);
    r0.xyz = r0.xyz*r0.www;
    output.color0 = r0;
    return output;
}


