//Metal1.0     
//LEN=0000000287
[[ visible ]] FragmentOut HgcRandomTile_hgc_visible(const constant float4* hg_Params, 
    texture2d< float > hg_Texture0, 
    sampler hg_Sampler0,
    float4 texCoord0)
{
    float4 r0, r1;
    FragmentOut output;

    r0.xy = texCoord0.xy + hg_Params[3].xy;
    r0.xy = r0.xy*hg_Params[3].zw;
    r0 = hg_Texture0.sample(hg_Sampler0, r0.xy);
    r1.xyz = texCoord0.xyz - hg_Params[2].xyz;
    r1.xyz = r1.xyz*hg_Params[1].xyz;
    r1.x = dot(r1.xyz, r1.xyz);
    r1.x = sqrt(r1.x);
    r1.x = clamp(r1.x*hg_Params[0].x + hg_Params[0].y, 0.00000f, 1.00000f);
    output.color0 = r0*r1.xxxx;
    return output;
}


