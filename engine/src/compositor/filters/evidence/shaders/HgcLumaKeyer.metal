//Metal1.0     
//LEN=00000002b2
[[ visible ]] FragmentOut HgcLumaKeyer_hgc_visible(const constant float4* hg_Params,
    float4 color0, 
    texture2d< float > hg_Texture1, 
    sampler hg_Sampler1)
{
    const float4 c0 = float4(0.000000000, 255.0000000, 0.5000000000, 0.000000000);
    float4 r0;
    FragmentOut output;

    r0.x = color0.x;
    r0.x = fmax(r0.x, c0.x);
    r0.x = fmin(r0.x, hg_Params[2].x);
    r0.x = r0.x*c0.y + c0.z;
    r0.y = c0.z;
    r0.xy = r0.xy + hg_Params[3].xy;
    r0.xy = r0.xy*hg_Params[3].zw;
    r0.x = hg_Texture1.sample(hg_Sampler1, r0.xy).x;
    output.color0 = clamp(r0.xxxx*hg_Params[1] + hg_Params[0], 0.00000f, 1.00000f);
    return output;
}


