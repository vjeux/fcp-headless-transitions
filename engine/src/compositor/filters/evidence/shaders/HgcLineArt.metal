//Metal1.0     
//LEN=0000000301
[[ visible ]] FragmentOut HgcLineArt_hgc_visible(const constant float4* hg_Params, 
    texture2d< float > hg_Texture0, 
    sampler hg_Sampler0,
    float4 texCoord0,
    float4 texCoord1,
    float4 texCoord2,
    float4 texCoord3,
    float4 texCoord4)
{
    float4 r0, r1, r2, r3, r4;
    FragmentOut output;

    r0 = hg_Texture0.sample(hg_Sampler0, texCoord0.xy);
    r1 = hg_Texture0.sample(hg_Sampler0, texCoord1.xy);
    r2 = hg_Texture0.sample(hg_Sampler0, texCoord2.xy);
    r3 = hg_Texture0.sample(hg_Sampler0, texCoord3.xy);
    r4 = hg_Texture0.sample(hg_Sampler0, texCoord4.xy);
    r1 = fmax(r0, r1);
    r1 = fmax(r1, r2);
    r1 = fmax(r1, r3);
    r1 = fmax(r1, r4);
    output.color0 = r1 - r0;
    return output;
}


