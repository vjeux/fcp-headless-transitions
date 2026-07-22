===== HgcRefractionHeightMap =====
//Metal1.0     
//LEN=0000000644
[[ visible ]] FragmentOut HgcRefractionHeightMap_hgc_visible(const constant float4* hg_Params, 
    texture2d< float > hg_Texture0, 
    sampler hg_Sampler0,
    float4 texCoord0,
    float4 texCoord1,
    float4 texCoord2,
    float4 texCoord3,
    float4 texCoord4,
    float4 texCoord5,
    float4 texCoord6,
    float4 texCoord7)
{
    const float4 c0 = float4(0.1250000000, 256.0000000, 0.000000000, -0.003906250000);
    float4 r0, r1, r2, r3, r4, r5, r6, r7, r8;
    FragmentOut output;

    r0 = hg_Texture0.sample(hg_Sampler0, texCoord0.xy);
    r1 = hg_Texture0.sample(hg_Sampler0, texCoord1.xy);
    r2 = hg_Texture0.sample(hg_Sampler0, texCoord2.xy);
    r3 = hg_Texture0.sample(hg_Sampler0, texCoord3.xy);
    r4 = hg_Texture0.sample(hg_Sampler0, texCoord4.xy);
    r5 = hg_Texture0.sample(hg_Sampler0, texCoord5.xy);
    r6 = hg_Texture0.sample(hg_Sampler0, texCoord6.xy);
    r7 = hg_Texture0.sample(hg_Sampler0, texCoord7.xy);
    r0.x = dot(r0, hg_Params[0]);
    r1.x = dot(r1, hg_Params[0]);
    r2.x = dot(r2, hg_Params[0]);
    r3.x = dot(r3, hg_Params[0]);
    r4.x = dot(r4, hg_Params[0]);
    r5.x = dot(r5, hg_Params[0]);
    r6.x = dot(r6, hg_Params[0]);
    r7.x = dot(r7, hg_Params[0]);
    r8.zw = c0.zz;
    r1.x = r1.x + r0.x;
    r2.x = r2.x + r1.x;
    r3.x = r3.x + r2.x;
    r4.x = r4.x + r3.x;
    r5.x = r5.x + r4.x;
    r6.x = r6.x + r5.x;
    r7.x = r7.x + r6.x;
    r8.x = c0.x*r7.x;
    r8.y = r8.x*c0.y;
    r8.y = fract(r8.y);
    r8.x = clamp(r8.y*c0.w + r8.x, 0.00000f, 1.00000f);
    output.color0 = r8;
    return output;
}
