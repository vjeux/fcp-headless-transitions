===== HgcConvolvePass7tapDefocus =====
//Metal1.0     
//LEN=0000000482
[[ visible ]] FragmentOut HgcConvolvePass7tapDefocus_hgc_visible(const constant float4* hg_Params, 
    texture2d< float > hg_Texture0, 
    sampler hg_Sampler0,
    float4 color1,
    float4 texCoord0,
    float4 texCoord2,
    float4 texCoord3,
    float4 texCoord4,
    float4 texCoord5,
    float4 texCoord6,
    float4 texCoord7)
{
    float4 r0, r1, r2, r3, r4, r5, r6, r7;
    FragmentOut output;

    r0 = hg_Texture0.sample(hg_Sampler0, texCoord0.xy);
    r1 = hg_Texture0.sample(hg_Sampler0, texCoord2.xy);
    r2 = hg_Texture0.sample(hg_Sampler0, texCoord3.xy);
    r3 = hg_Texture0.sample(hg_Sampler0, texCoord4.xy);
    r4 = hg_Texture0.sample(hg_Sampler0, texCoord5.xy);
    r5 = hg_Texture0.sample(hg_Sampler0, texCoord6.xy);
    r6 = hg_Texture0.sample(hg_Sampler0, texCoord7.xy);
    r7 = color1;
    r0 = hg_Params[7]*r0;
    r0 = hg_Params[8]*r1 + r0;
    r0 = hg_Params[9]*r2 + r0;
    r0 = hg_Params[10]*r3 + r0;
    r0 = hg_Params[11]*r4 + r0;
    r0 = hg_Params[12]*r5 + r0;
    r0 = hg_Params[13]*r6 + r0;
    r0 = hg_Params[14]*r7 + r0;
    output.color0 = hg_Params[15]*r0;
    return output;
}


