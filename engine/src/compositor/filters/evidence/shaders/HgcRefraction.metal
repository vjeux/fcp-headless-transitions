//Metal1.0     
//LEN=00000004b0
[[ visible ]] FragmentOut HgcRefraction_hgc_visible(const constant float4* hg_Params, 
    texture2d< float > hg_Texture0, 
    sampler hg_Sampler0, 
    texture2d< float > hg_Texture1, 
    sampler hg_Sampler1,
    float4 texCoord0,
    float4 texCoord1,
    float4 texCoord2,
    float4 texCoord3,
    float4 texCoord4)
{
    const float4 c0 = float4(0.000000000, 0.000000000, 0.000000000, 0.000000000);
    float4 r0, r1, r2, r3;
    FragmentOut output;

    r0.zw = texCoord1.zw;
    r0.x = dot(texCoord1, hg_Params[2]);
    r0.y = dot(texCoord1, hg_Params[3]);
    r1 = hg_Texture0.sample(hg_Sampler0, texCoord0.xy);
    r2 = hg_Texture0.sample(hg_Sampler0, texCoord2.xy);
    r2 = r2 - r1;
    r2.y = dot(hg_Params[4], r2);
    r1 = hg_Texture0.sample(hg_Sampler0, texCoord3.xy);
    r3 = hg_Texture0.sample(hg_Sampler0, texCoord4.xy);
    r1 = r1 - r3;
    r2.x = dot(hg_Params[4], r1);
    r2.zw = c0.zz;
    r2 = r2*hg_Params[9] + r0;
    r3.y = dot(r2, hg_Params[1]);
    r3.x = dot(r2, hg_Params[0]);
    r3.xy = r3.xy + hg_Params[26].xy;
    r3.xy = r3.xy*hg_Params[26].zw;
    output.color0 = hg_Texture1.sample(hg_Sampler1, r3.xy);
    return output;
}


