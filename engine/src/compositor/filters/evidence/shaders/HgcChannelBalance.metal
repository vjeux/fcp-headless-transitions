===== HgcChannelBalance =====
//Metal1.0     
//LEN=000000038a
[[ visible ]] FragmentOut HgcChannelBalance_hgc_visible(const constant float4* hg_Params,
    float4 color0)
{
    const float4 c0 = float4(0.5000000000, 2.000000000, 0.000000000, 0.000000000);
    float4 r0, r1, r2, r3, r4;
    FragmentOut output;

    r0 = color0;
    r1.xyz = r0.xyz / fmax(r0.w, 1.00000e-06f);
    r2.xyz = hg_Params[2].xyz - hg_Params[1].xyz;
    r3.xyz = r1.xyz - c0.xxx;
    r3.xyz = r3.xyz*r2.xyz;
    r3.xyz = r3.xyz + r3.xyz;
    r2.xyz = hg_Params[1].xyz - hg_Params[0].xyz;
    r2.xyz = r2.xyz*r1.xyz;
    r4.xyz = float3(r1.xyz >= c0.xxx);
    r3.xyz = r3.xyz + hg_Params[1].xyz;
    r4.xyz = r3.xyz*r4.xyz;
    r2.xyz = r2.xyz*c0.yyy + hg_Params[0].xyz;
    r1.xyz = float3(r1.xyz < c0.xxx);
    r1.xyz = r2.xyz*r1.xyz + r4.xyz;
    r1.w = r0.w;
    r1.xyz = r1.xyz*r0.www;
    output.color0 = mix(r0, r1, hg_Params[3]);
    return output;
}
