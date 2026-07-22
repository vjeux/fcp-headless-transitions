===== HgcOutlineGradientStroke =====
//Metal1.0     
//LEN=0000000730
[[ visible ]] FragmentOut HgcOutlineGradientStroke_hgc_visible(const constant float4* hg_Params,
    float4 color0, 
    texture2d< float > hg_Texture1, 
    sampler hg_Sampler1)
{
    const float4 c0 = float4(0.000000000, 0.5000000000, 0.000000000, 0.000000000);
    float4 r0, r1, r2, r3;
    FragmentOut output;

    r0.x = color0.x;
    r0.z = hg_Params[0].y - hg_Params[0].x;
    r1.x = r0.x - hg_Params[0].x;
    r1.x = clamp(r1.x/r0.z, 0.00000f, 1.00000f);
    r0.y = float(hg_Params[0].x < r0.x);
    r0.w = float(hg_Params[0].y >= r0.x);
    r0.w = fmin(r0.y, r0.w);
    r0.y = r0.z*hg_Params[0].w;
    r1.x = r0.z*r1.x;
    r1.y = c0.y;
    r1.xy = r1.xy + hg_Params[2].xy;
    r1.xy = r1.xy*hg_Params[2].zw;
    r1 = hg_Texture1.sample(hg_Sampler1, r1.xy);
    r1 = select(c0.xxxx, r1, -r0.wwww < 0.00000f);
    r0.z = r0.z + r0.y;
    r0.w = r0.y + hg_Params[0].y;
    r0.w = -r0.z*hg_Params[1].x + r0.w;
    r2.x = hg_Params[0].x - r0.y;
    r0.z = r0.z*hg_Params[1].y + r2.x;
    r2.xy = float2(r0.zx >= r0.xw);
    r2.x = fmax(r2.x, r2.y);
    r2.z = r0.x - r0.z;
    r2.y = 1.00000f / r0.y;
    r2.w = r2.z*r2.y;
    r2.z = select(r1.w, c0.x, -r2.x < 0.00000f);
    r1.w = r0.w - r0.y;
    r0.y = r0.z + r0.y;
    r3.x = float(r0.x < r1.w);
    r0.z = float(r0.y < r0.x);
    r0.w = r0.w - r0.x;
    r0.z = fmin(r0.z, r3.x);
    r0.y = float(r0.y >= r0.x);
    r1.w = float(r0.x >= r1.w);
    r2.w = r2.z*r2.w;
    r2.x = float(-r2.x >= c0.x);
    r0.z = float(-r0.z >= c0.x);
    r0.zw = r2.xy*r0.zw;
    r0.y = fmin(r0.z, r0.y);
    r0.y = select(r2.z, r2.w, -r0.y < 0.00000f);
    r0.x = r0.y*r0.w;
    r1.w = fmin(r0.z, r1.w);
    r1.w = select(r0.y, r0.x, -r1.w < 0.00000f);
    r1.w = pow(r1.w, hg_Params[0].z);
    r1.xyz = r1.xyz*r1.www;
    output.color0 = r1;
    return output;
}
