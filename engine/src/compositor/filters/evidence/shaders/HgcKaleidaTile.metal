//Metal1.0     
//LEN=0000000349
[[ visible ]] FragmentOut HgcKaleidaTile_hgc_visible(const constant float4* hg_Params, 
    texture2d< float > hg_Texture0, 
    sampler hg_Sampler0,
    float4 texCoord0)
{
    const float4 c0 = float4(0.7500000000, 0.5000000000, 0.2500000000, 0.000000000);
    float4 r0, r1;
    FragmentOut output;

    r0.xy = texCoord0.xy - hg_Params[0].xy;
    r1.x = dot(r0.xy, hg_Params[2].xy);
    r1.y = dot(r0.xy, hg_Params[2].zw);
    r1.xy = r1.xy + c0.xx;
    r1.xy = fract(r1.xy);
    r1.xy = r1.xy - c0.yy;
    r1.xy = fabs(r1.xy) - c0.zz;
    r0.xy = r1.xx*hg_Params[1].xy;
    r0.xy = r1.yy*hg_Params[1].zw + r0.xy;
    r0.xy = r0.xy + hg_Params[0].xy;
    r0.xy = r0.xy + hg_Params[3].xy;
    r0.xy = r0.xy*hg_Params[3].zw;
    output.color0 = hg_Texture0.sample(hg_Sampler0, r0.xy);
    return output;
}


