===== HgcCircularScreen =====
//Metal1.0     
//LEN=0000000370
[[ visible ]] FragmentOut HgcCircularScreen_hgc_visible(const constant float4* hg_Params,
    float4 color0,
    float4 texCoord1)
{
    const float4 c0 = float4(9.999999975e-07, 1.000000000, 0.5000000000, 0.000000000);
    float4 r0, r1, r2;
    FragmentOut output;

    r0.xy = texCoord1.xy*hg_Params[1].wz + hg_Params[0].xy;
    r0.xyz = float3(dot(r0.xy, r0.xy));
    r1.x = r0.x + c0.x;
    r1.xyz = rsqrt(r1.xxx);
    r0.xyz = r0.xyz*r1.xyz;
    r0.xyz = r0.xyz*hg_Params[1].xxx;
    r0.xyz = fract(r0.xyz);
    r1.xyz = c0.yyy - r0.xyz;
    r1.xyz = fmin(r1.xyz, r0.xyz);
    r1.xyz = r1.xyz + r1.xyz;
    r0 = color0;
    r2.xyz = float3(dot(r0, hg_Params[2]));
    r2.xyz = r2.xyz - r1.xyz;
    r2.xyz = clamp(r2.xyz*hg_Params[1].yyy + c0.zzz, 0.00000f, 1.00000f);
    r0.xyz = r2.xyz*r0.www;
    output.color0 = r0;
    return output;
}
