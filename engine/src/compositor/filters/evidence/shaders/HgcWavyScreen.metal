//Metal1.0     
//LEN=000000038e
[[ visible ]] FragmentOut HgcWavyScreen_hgc_visible(const constant float4* hg_Params,
    float4 color0,
    float4 texCoord1)
{
    const float4 c0 = float4(0.5000000000, -2.000000000, 1.000000000, 0.000000000);
    float4 r0, r1, r2;
    FragmentOut output;

    r0 = color0;
    r1.xy = hg_Params[1].xy*c0.xx + texCoord1.xy;
    r1.xy = r1.xy*hg_Params[2].xy;
    r2.x = hg_Params[0].x*r1.x;
    r2.x = fract(r2.x);
    r2.x = r2.x*c0.y + c0.z;
    r1.y = hg_Params[1].y - r1.y;
    r1.y = fabs(r2.x)*hg_Params[0].z + r1.y;
    r1.xyz = r1.yyy*hg_Params[0].yyy;
    r1.xyz = fract(r1.xyz);
    r1.xyz = r1.xyz*c0.yyy + c0.zzz;
    r1.xyz = abs(r1.xyz);
    r2.xyz = float3(dot(r0, hg_Params[3]));
    r2.xyz = r2.xyz - r1.xyz;
    r2.xyz = clamp(r2.xyz*hg_Params[0].www + c0.xxx, 0.00000f, 1.00000f);
    r0.xyz = r2.xyz*r0.www;
    output.color0 = r0;
    return output;
}


