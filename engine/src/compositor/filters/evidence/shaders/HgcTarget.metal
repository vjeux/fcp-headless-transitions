===== HgcTarget =====
//Metal1.0     
//LEN=000000028f
[[ visible ]] FragmentOut HgcTarget_hgc_visible(const constant float4* hg_Params, 
    texture2d< float > hg_Texture0, 
    sampler hg_Sampler0,
    float4 texCoord0)
{
    float4 r0;
    FragmentOut output;

    r0.xyz = texCoord0.xyz - hg_Params[0].xyz;
    r0.xy = r0.xy*hg_Params[2].xy;
    r0.x = dot(r0.xyz, r0.xyz);
    r0.x = sqrt(r0.x);
    r0.xy = hg_Params[1].xy*r0.xx;
    r0.xy = r0.xy*hg_Params[2].zw;
    r0.xy = hg_Params[0].xy*hg_Params[3].xy + r0.xy;
    r0.xy = r0.xy + hg_Params[4].xy;
    r0.xy = r0.xy*hg_Params[4].zw;
    output.color0 = hg_Texture0.sample(hg_Sampler0, r0.xy);
    return output;
}


