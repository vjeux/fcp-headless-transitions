===== HgcBulge =====
//Metal1.0     
//LEN=0000000395
[[ visible ]] FragmentOut HgcBulge_hgc_visible(const constant float4* hg_Params, 
    texture2d< float > hg_Texture0, 
    sampler hg_Sampler0,
    float4 texCoord0)
{
    const float4 c0 = float4(1.000000000, -2.000000000, 3.000000000, 9.999999975e-07);
    float4 r0;
    FragmentOut output;

    r0.xy = texCoord0.xy - hg_Params[0].xy;
    r0.xy = r0.xy*hg_Params[2].zw;
    r0.z = dot(r0.xy, r0.xy);
    r0.w = r0.z + c0.w;
    r0.w = rsqrt(r0.w);
    r0.z = r0.w*r0.z;
    r0.z = clamp(-r0.z*hg_Params[1].x + c0.x, 0.00000f, 1.00000f);
    r0.w = r0.z*c0.y + c0.z;
    r0.z = r0.z*r0.z;
    r0.z = r0.z*r0.w;
    r0.z = r0.z*hg_Params[1].y + c0.x;
    r0.xy = r0.xy*r0.zz;
    r0.xy = r0.xy*hg_Params[2].xy + hg_Params[0].xy;
    r0.xy = r0.xy + hg_Params[3].xy;
    r0.xy = r0.xy*hg_Params[3].zw;
    output.color0 = hg_Texture0.sample(hg_Sampler0, r0.xy);
    return output;
}
