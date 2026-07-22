//Metal1.0     
//LEN=0000000588
[[ visible ]] FragmentOut HgcDroplet_hgc_visible(const constant float4* hg_Params, 
    texture2d< float > hg_Texture0, 
    sampler hg_Sampler0,
    float4 texCoord0)
{
    const float4 c0 = float4(9.999999975e-07, 1.000000000, -2.000000000, 0.000000000);
    const float4 c1 = float4(0.000000000, 1.000000000, 2.000000000, 3.000000000);
    const float4 c2 = float4(0.000000000, 1.000000000, -1.000000000, 0.000000000);
    float4 r0, r1, r2, r3, r4;
    FragmentOut output;

    r0.xy = texCoord0.xy*hg_Params[0].xy + hg_Params[0].zw;
    r1 = float4(dot(r0.xy, r0.xy));
    r2.x = fmax(r1.x, c0.x);
    r2 = rsqrt(r2.xxxx);
    r1 = r1*r2;
    r2.xy = r0.xy*r2.xy;
    r1 = r1*hg_Params[2].xxxx + hg_Params[2].yyyy;
    r1 = r1 - c1;
    r3.xyz = clamp(r1.xyz, 0.00000f, 1.00000f);
    r4.xyz = -r3.xyz*c1.zzz + c1.www;
    r3.xyz = r3.xyz*r3.xyz;
    r4.xyz = r3.xyz*r4.xyz;
    r4.xyz = r4.xyz*c0.yzy + c2.xyz;
    r3.x = select(r4.x, c2.x, r1.x < 0.00000f);
    r3.x = select(r4.y, r3.x, r1.y < 0.00000f);
    r3.x = select(r4.z, r3.x, r1.z < 0.00000f);
    r1.x = select(c2.x, r3.x, r1.w < 0.00000f);
    r1.xy = r1.xx*r2.xy;
    r1.xy = r1.xy*hg_Params[2].zz + r0.xy;
    r1.xy = r1.xy*hg_Params[1].xy + hg_Params[1].zw;
    r1.xy = r1.xy + hg_Params[3].xy;
    r1.xy = r1.xy*hg_Params[3].zw;
    output.color0 = hg_Texture0.sample(hg_Sampler0, r1.xy);
    return output;
}


