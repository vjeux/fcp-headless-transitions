//Metal1.0     
//LEN=00000003ae
[[ visible ]] FragmentOut HgcZoomBlur_hgc_visible(const constant float4* hg_Params, 
    texture2d< float > hg_Texture0, 
    sampler hg_Sampler0,
    float4 texCoord0,
    float4 texCoord1,
    float4 texCoord2,
    float4 texCoord3,
    float4 texCoord4)
{
    const float4 c0 = float4(0.1500000060, 0.1000000015, 0.2000000030, 0.2500000000);
    const float4 c1 = float4(0.3000000119, 0.000000000, 0.000000000, 0.000000000);
    float4 r0, r1;
    FragmentOut output;

    r0 = hg_Texture0.sample(hg_Sampler0, texCoord1.xy);
    r0 = r0*c0.xxxx;
    r1 = hg_Texture0.sample(hg_Sampler0, texCoord2.xy);
    r1 = r1*c0.yyyy + r0;
    r0 = hg_Texture0.sample(hg_Sampler0, texCoord3.xy);
    r1 = r0*c0.zzzz + r1;
    r0 = hg_Texture0.sample(hg_Sampler0, texCoord4.xy);
    r0 = r0*c0.wwww + r1;
    r1 = hg_Texture0.sample(hg_Sampler0, texCoord0.xy);
    output.color0 = r1*c1.xxxx + r0;
    return output;
}


