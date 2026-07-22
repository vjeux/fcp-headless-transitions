//Metal1.0     
//LEN=0000000396
[[ visible ]] FragmentOut HgcWave_hgc_visible(const constant float4* hg_Params, 
    texture2d< float > hg_Texture0, 
    sampler hg_Sampler0,
    float4 texCoord0)
{
    float4 r0, r1, r2;
    FragmentOut output;

    r0.xy = texCoord0.xy*hg_Params[6].xy;
    r1.xy = texCoord0.xy - hg_Params[2].xy;
    r2.x = hg_Params[1].x*r1.x;
    r2.x = sin(r2.x);
    r2.y = hg_Params[0].x*r2.x;
    r1.x = hg_Params[1].x*r1.y;
    r1.x = sin(r1.x);
    r2.x = hg_Params[0].x*r1.x;
    r2.xy = r2.xy*hg_Params[6].xy;
    r2.xy = r2.xy*hg_Params[3].xy + r0.xy;
    r2.xy = r2.xy*hg_Params[6].zw;
    r1.xy = fmin(r2.xy, hg_Params[4].xy);
    r1.xy = fmax(r1.xy, hg_Params[4].zw);
    r2.xy = select(r1.xy, r2.xy, hg_Params[5].xy < 0.00000f);
    r2.xy = r2.xy + hg_Params[7].xy;
    r2.xy = r2.xy*hg_Params[7].zw;
    output.color0 = hg_Texture0.sample(hg_Sampler0, r2.xy);
    return output;
}


