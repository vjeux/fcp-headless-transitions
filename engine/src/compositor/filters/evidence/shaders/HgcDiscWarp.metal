//Metal1.0     
//LEN=000000041b
[[ visible ]] FragmentOut HgcDiscWarp_hgc_visible(const constant float4* hg_Params, 
    texture2d< float > hg_Texture0, 
    sampler hg_Sampler0,
    float4 texCoord0)
{
    const float4 c0 = float4(0.000000000, 1.000000000, 0.000000000, 0.000000000);
    float4 r0, r1, r2;
    FragmentOut output;

    r0.xy = texCoord0.xy*hg_Params[1].xy + hg_Params[1].zw;
    r1.xy = float2(dot(r0.xy, r0.xy));
    r2.xy = rsqrt(r1.xx);
    r2.xy = select(r2.xy, c0.xx, r1.xy < 0.00000f);
    r2.xy = select(c0.xx, r2.xy, -r1.xy < 0.00000f);
    r0.xy = r0.xy*r2.xy;
    r2.xy = r1.xy*r2.xy;
    r2.xy = r2.xy*hg_Params[0].xx;
    r1.xy = 1.00000f / r2.xx;
    r1.xy = r2.xy - r1.xy;
    r2.xy = r2.xy - c0.yy;
    r2.xy = select(r1.xy, c0.xx, r2.xy < 0.00000f);
    r2.xy = r2.xy*hg_Params[0].yy;
    r0.xy = r0.xy*r2.xy;
    r0.xy = r0.xy*hg_Params[2].xy + hg_Params[2].zw;
    r0.xy = r0.xy + hg_Params[3].xy;
    r0.xy = r0.xy*hg_Params[3].zw;
    output.color0 = hg_Texture0.sample(hg_Sampler0, r0.xy);
    return output;
}


