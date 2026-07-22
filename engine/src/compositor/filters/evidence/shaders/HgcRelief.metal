//Metal1.0     
//LEN=000000033d
[[ visible ]] FragmentOut HgcRelief_hgc_visible(const constant float4* hg_Params, 
    texture2d< float > hg_Texture0, 
    sampler hg_Sampler0, 
    texture2d< float > hg_Texture1, 
    sampler hg_Sampler1,
    float4 color,
    float4 texCoord0,
    float4 texCoord1)
{
    const float4 c0 = float4(-1.000000000, 2.000000000, 0.000000000, 0.000000000);
    float4 r0, r1, r2, r3;
    FragmentOut output;

    r0.xy = select(hg_Params[2].xy, color.xy, hg_Params[3].xy < 0.00000f);
    r1.y = r0.y*c0.y + c0.x;
    r2 = hg_Texture0.sample(hg_Sampler0, texCoord0.xy);
    r3 = hg_Texture1.sample(hg_Sampler1, texCoord1.xy);
    r3 = float4(dot(r3, hg_Params[0]));
    r3 = -r0.xxxx*r1.yyyy + r3;
    r3 = clamp(r3*hg_Params[1], 0.00000f, 1.00000f);
    output.color0 = r2*r3;
    return output;
}


