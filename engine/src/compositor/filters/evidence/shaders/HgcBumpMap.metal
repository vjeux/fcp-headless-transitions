===== HgcBumpMap =====
//Metal1.0     
//LEN=000000045d
[[ visible ]] FragmentOut HgcBumpMap_hgc_visible(const constant float4* hg_Params,
    float4 color0, 
    texture2d< float > hg_Texture1, 
    sampler hg_Sampler1,
    float4 texCoord1)
{
    const float4 c0 = float4(1.000000000, 0.000000000, 255.0000000, 0.000000000);
    float4 r0, r1, r2;
    FragmentOut output;

    r0.xy = color0.xy;
    r1.x = hg_Params[5].x - c0.x;
    r2 = select(c0.xyyy, hg_Params[1], -r1.xxxx < 0.00000f);
    r1.z = dot(texCoord1, r2);
    r2 = select(c0.yxyy, hg_Params[2], -r1.xxxx < 0.00000f);
    r1.w = dot(texCoord1, r2);
    r0.y = clamp(r0.y, 0.00000f, 1.00000f);
    r0.x = clamp(r0.x, 0.00000f, 1.00000f);
    r2.xyw = select(c0.xyy, hg_Params[3].xyw, -r1.xxx < 0.00000f);
    r0.xy = r0.xy*c0.zz;
    r0.xy = r0.xy*hg_Params[0].xy + r1.zw;
    r1.xyw = select(c0.yxy, hg_Params[4].xyw, -r1.xxx < 0.00000f);
    r0.w = c0.x;
    r1.y = dot(r0.xyw, r1.xyw);
    r1.x = dot(r0.xyw, r2.xyw);
    r1.xy = r1.xy + hg_Params[6].xy;
    r1.xy = r1.xy*hg_Params[6].zw;
    output.color0 = hg_Texture1.sample(hg_Sampler1, r1.xy);
    return output;
}


