//Metal1.0     
//LEN=00000003a5
[[ visible ]] FragmentOut HgcStarburst_hgc_visible(const constant float4* hg_Params, 
    texture2d< float > hg_Texture0, 
    sampler hg_Sampler0,
    float4 texCoord0)
{
    const float4 c0 = float4(0.000000000, 0.000000000, 0.000000000, 0.000000000);
    float4 r0, r1, r2;
    FragmentOut output;

    r0.xy = texCoord0.xy - hg_Params[0].xy;
    r0.xy = r0.xy*hg_Params[2].xy;
    r1.x = dot(r0.xy, r0.xy);
    r2.x = rsqrt(r1.x);
    r2.x = select(r2.x, c0.x, r1.x < 0.00000f);
    r2.x = select(c0.x, r2.x, -r1.x < 0.00000f);
    r1.x = r1.x*r2.x;
    r1.x = r1.x*hg_Params[1].x;
    r2.x = 1.00000f / r1.x;
    r1.x = select(c0.x, r2.x, -fabs(r1.x) < 0.00000f);
    r0.xy = r0.xy*r1.xx;
    r0.xy = r0.xy*hg_Params[2].zw + hg_Params[0].xy;
    r0.xy = r0.xy + hg_Params[3].xy;
    r0.xy = r0.xy*hg_Params[3].zw;
    output.color0 = hg_Texture0.sample(hg_Sampler0, r0.xy);
    return output;
}


