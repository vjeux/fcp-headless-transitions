//Metal1.0     
//LEN=0000000477
[[ visible ]] FragmentOut HgcScrape_hgc_visible(const constant float4* hg_Params, 
    texture2d< float > hg_Texture0, 
    sampler hg_Sampler0,
    float4 texCoord0)
{
    const float4 c0 = float4(0.5000000000, 0.000000000, 0.000000000, 0.000000000);
    float4 r0, r1;
    FragmentOut output;

    r0.zw = texCoord0.xy - hg_Params[0].xy;
    r0.xy = r0.zw/hg_Params[4].xy;
    r0.zw = r0.xy*hg_Params[1].xy;
    r1.x = dot(r0.xy, hg_Params[1].xy);
    r0.z = float(r0.z >= -r0.w);
    r1.y = float(r1.x >= hg_Params[2].x);
    r1.z = float(-r1.y >= c0.z);
    r1.z = fmin(r0.z, r1.z);
    r1.w = r1.x*hg_Params[3].w;
    r0.w = c0.x*hg_Params[2].x + -r1.x;
    r0.z = fmin(r0.z, r1.y);
    r0.z = select(c0.z, r0.w, -r0.z < 0.00000f);
    r1.w = -r1.x*r1.w;
    r0.w = r1.w*c0.x;
    r0.z = select(r0.z, r0.w, -r1.z < 0.00000f);
    r0.zw = r0.zz*hg_Params[1].xy + r0.xy;
    r0.xy = 1.00000f / hg_Params[4].zw;
    r0.xy = r0.zw*r0.xy + hg_Params[0].xy;
    r0.xy = r0.xy + hg_Params[5].xy;
    r0.xy = r0.xy*hg_Params[5].zw;
    output.color0 = hg_Texture0.sample(hg_Sampler0, r0.xy);
    return output;
}


