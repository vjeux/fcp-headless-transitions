//Metal1.0     
//LEN=0000000307
[[ visible ]] FragmentOut HgcEdges_hgc_visible(const constant float4* hg_Params, 
    texture2d< float > hg_Texture0, 
    sampler hg_Sampler0,
    float4 texCoord0,
    float4 texCoord1,
    float4 texCoord2,
    float4 texCoord3)
{
    float4 r0, r1, r2, r3;
    FragmentOut output;

    r0.xyz = hg_Texture0.sample(hg_Sampler0, texCoord1.xy).xyz;
    r1.xyz = hg_Texture0.sample(hg_Sampler0, texCoord2.xy).xyz;
    r2.xyz = hg_Texture0.sample(hg_Sampler0, texCoord3.xy).xyz;
    r3 = hg_Texture0.sample(hg_Sampler0, texCoord0.xy);
    r1.xyz = r3.xyz - r1.xyz;
    r0.xyz = r0.xyz - r2.xyz;
    r1.xyz = r1.xyz*r1.xyz;
    r0.xyz = r0.xyz*r0.xyz + r1.xyz;
    r3.xyz = r0.xyz*hg_Params[0].xyz;
    output.color0 = r3;
    return output;
}


