//Metal1.0     
//LEN=000000029d
[[ visible ]] FragmentOut HgcMirror_hgc_visible(const constant float4* hg_Params, 
    texture2d< float > hg_Texture0, 
    sampler hg_Sampler0,
    float4 texCoord0)
{
    float4 r0, r1;
    FragmentOut output;

    r0.xyz = texCoord0.xyz - hg_Params[0].xyz;
    r1.x = dot(r0.xyz, hg_Params[1].xyx);
    r1.y = dot(r0.xyz, hg_Params[1].zwz);
    r1.x = abs(r1.x);
    r0.x = dot(r1.xy, hg_Params[2].xy);
    r0.y = dot(r1.xy, hg_Params[2].zw);
    r0.xy = r0.xy + hg_Params[0].xy;
    r0.xy = r0.xy + hg_Params[3].xy;
    r0.xy = r0.xy*hg_Params[3].zw;
    output.color0 = hg_Texture0.sample(hg_Sampler0, r0.xy);
    return output;
}


