===== HgcVignette =====
//Metal1.0     
//LEN=00000004c1
[[ visible ]] FragmentOut HgcVignette_hgc_visible(const constant float4* hg_Params,
    float4 color0,
    float4 color1,
    float4 texCoord2)
{
    const float4 c0 = float4(2.000000000, -1.000000000, 0.000000000, 3.000000000);
    float4 r0, r1, r2, r3, r4;
    FragmentOut output;

    r0 = color0;
    r1 = color1;
    r2.z = c0.z;
    r2.xy = texCoord2.xy*hg_Params[4].xy;
    r2.xy = r2.xy*c0.xx + c0.yy;
    r2.xyz = r2.xyz - hg_Params[0].xyz;
    r2.x = dot(r2.xyz, r2.xyz);
    r2.x = sqrt(r2.x);
    r3.x = r2.x - hg_Params[1].y;
    r3.x = clamp(r3.x*hg_Params[1].x, 0.00000f, 1.00000f);
    r4.x = r3.x*r3.x;
    r3.x = r3.x*-c0.x + c0.w;
    r3.x = r3.x*r4.x;
    r2.x = r2.x*hg_Params[1].x + hg_Params[1].y;
    r2.x = clamp(select(r3.x, r2.x, hg_Params[5].x < 0.00000f), 0.00000f, 1.00000f);
    r1 = mix(r0, r1, r2.xxxx);
    r4 = mix(-c0.yyyy, hg_Params[2], r2.xxxx);
    r2.xyz = mix(-c0.yyy, hg_Params[3].xyz, r2.xxx);
    r3 = r1 / float4(fmax(r1.www, 1.00000e-06f), 1.);
    r3 = r3*r4;
    r0.xyz = float3(dot(r3, hg_Params[6]));
    r3.xyz = mix(r0.xyz, r3.xyz, r2.xyz);
    r3.w = r1.w;
    r3.xyz = r3.xyz*r3.www;
    output.color0 = r3;
    return output;
}


