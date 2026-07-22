===== HgcGlassDistort =====
//Metal1.0     
//LEN=00000006fa
[[ visible ]] FragmentOut HgcGlassDistort_hgc_visible(const constant float4* hg_Params, 
    texture2d< float > hg_Texture0, 
    sampler hg_Sampler0, 
    texture2d< float > hg_Texture1, 
    sampler hg_Sampler1, 
    texture2d< float > hg_Texture2, 
    sampler hg_Sampler2, 
    texture2d< float > hg_Texture3, 
    sampler hg_Sampler3,
    float4 texCoord0,
    float4 texCoord1,
    float4 texCoord2,
    float4 texCoord3)
{
    const float4 c0 = float4(0.5000000000, 0.2500000000, 0.000000000, 0.000000000);
    float4 r0, r1, r2, r3, r4;
    FragmentOut output;

    r0.x = hg_Texture3.sample(hg_Sampler3, texCoord1.xy).x;
    r1.xzw = hg_Texture3.sample(hg_Sampler3, texCoord2.xy).xzw;
    r2.x = hg_Texture3.sample(hg_Sampler3, texCoord3.xy).x;
    r0.x = r0.x*r0.x;
    r1.x = r1.x*r1.x + -r0.x;
    r1.y = r2.x*r2.x + -r0.x;
    r1 = r1*hg_Params[1];
    r2 = float4(hg_Params[0] < fabs(r1));
    r0.xy = fmin(hg_Params[0].xy, r1.xy);
    r0.xy = fmax(-hg_Params[0].xy, r0.xy);
    r0.xy = r0.xy + texCoord0.xy;
    r1 = r1*c0.xxxx;
    r3 = float4(hg_Params[0] < fabs(r1));
    r4.xy = fmin(hg_Params[0].xy, r1.xy);
    r4.xy = fmax(-hg_Params[0].xy, r4.xy);
    r4.xy = texCoord0.xy*c0.xx + r4.xy;
    r1.xy = r1.xy*c0.xx;
    r1.xy = texCoord0.xy*c0.yy + r1.xy;
    r0.xy = r0.xy + hg_Params[2].xy;
    r0.xy = r0.xy*hg_Params[2].zw;
    r0 = hg_Texture0.sample(hg_Sampler0, r0.xy);
    r4.xy = r4.xy + hg_Params[3].xy;
    r4.xy = r4.xy*hg_Params[3].zw;
    r4 = hg_Texture1.sample(hg_Sampler1, r4.xy);
    r1.xy = r1.xy + hg_Params[4].xy;
    r1.xy = r1.xy*hg_Params[4].zw;
    r1 = hg_Texture2.sample(hg_Sampler2, r1.xy);
    r3 = select(r4, r1, -r3 < 0.00000f);
    output.color0 = select(r0, r3, -r2 < 0.00000f);
    return output;
}
