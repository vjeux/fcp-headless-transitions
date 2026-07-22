//Metal1.0     
//LEN=0000000448
[[ visible ]] FragmentOut HgcGlassBlock_hgc_visible(const constant float4* hg_Params, 
    texture2d< float > hg_Texture0, 
    sampler hg_Sampler0,
    float4 texCoord0)
{
    const float4 c0 = float4(0.000000000, 0.000000000, 0.000000000, 0.000000000);
    float4 r0, r1, r2;
    FragmentOut output;

    r0.xy = texCoord0.xy - hg_Params[0].xy;
    r1.xy = r0.xy*hg_Params[1].xy;
    r1.xy = floor(r1.xy);
    r1.xy = r1.xy*hg_Params[1].zw;
    r0.xy = r0.xy - r1.xy;
    r2.x = dot(r1.xy, hg_Params[2].xy);
    r2.y = dot(r1.xy, hg_Params[2].zw);
    r2.xy = r2.xy + r0.xy;
    r2.xy = r2.xy + hg_Params[0].xy;
    r1.xy = fmax(r2.xy, hg_Params[3].xy);
    r1.xy = fmin(r1.xy, hg_Params[4].xy);
    r0.xy = hg_Params[3].xy - r2.xy;
    r2.xy = r2.xy - hg_Params[4].xy;
    r0.x = fmax(r0.x, r0.y);
    r0.y = fmax(r2.x, r2.y);
    r0.x = fmax(r0.x, r0.y);
    r1.xy = r1.xy + hg_Params[5].xy;
    r1.xy = r1.xy*hg_Params[5].zw;
    r1 = hg_Texture0.sample(hg_Sampler0, r1.xy);
    output.color0 = select(r1, c0.xxxx, -r0.xxxx < 0.00000f);
    return output;
}


