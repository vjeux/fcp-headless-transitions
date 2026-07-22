//Metal1.0     
//LEN=0000000224
[[ visible ]] FragmentOut HgcCrystallize_hgc_visible(const constant float4* hg_Params, 
    texture2d< float > hg_Texture0, 
    sampler hg_Sampler0,
    float4 texCoord0,
    float4 texCoord1,
    float4 texCoord2)
{
    float4 r0;
    FragmentOut output;

    output.color0 = hg_Texture0.sample(hg_Sampler0, texCoord0.xy);
    r0.xy = texCoord2.xy - texCoord1.xy;
    r0.xy = r0.xy*hg_Params[1].xy;
    r0.x = dot(r0.xy, r0.xy);
    r0.x = sqrt(r0.x);
    output.depth = r0.x*hg_Params[0].z;
    return output;
}


