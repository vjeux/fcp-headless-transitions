//Metal1.0     
//LEN=00000002ff
[[ visible ]] FragmentOut HgcPerspectiveTile_hgc_visible(const constant float4* hg_Params, 
    texture2d< float > hg_Texture0, 
    sampler hg_Sampler0,
    float4 texCoord0)
{
    float4 r0, r1;
    FragmentOut output;

    r0.x = dot(texCoord0, hg_Params[3]);
    r1.y = dot(texCoord0, hg_Params[2]);
    r1.x = dot(texCoord0, hg_Params[1]);
    r1.zw = r1.xy/r0.xx;
    r1.xy = select(r1.xy, r1.zw, -fabs(r0.xx) < 0.00000f);
    r1.zw = r1.xy + hg_Params[0].zw;
    r1.xy = r1.zw/hg_Params[0].xy;
    r1.xy = fract(r1.xy);
    r1.xy = r1.xy*hg_Params[0].xy + -hg_Params[0].zw;
    r1.xy = r1.xy + hg_Params[4].xy;
    r1.xy = r1.xy*hg_Params[4].zw;
    output.color0 = hg_Texture0.sample(hg_Sampler0, r1.xy);
    return output;
}


