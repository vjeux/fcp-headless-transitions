===== HgcFisheye =====
//Metal1.0     
//LEN=00000003b9
[[ visible ]] FragmentOut HgcFisheye_hgc_visible(const constant float4* hg_Params, 
    texture2d< float > hg_Texture0, 
    sampler hg_Sampler0,
    float4 texCoord0)
{
    const float4 c0 = float4(0.000000000, 0.000000000, 0.000000000, 1.000000000);
    float4 r0, r1;
    FragmentOut output;

    r0.xy = texCoord0.xy;
    r0.w = c0.w;
    r1.x = dot(r0.xyw, hg_Params[2].xyz);
    r1.y = dot(r0.xyw, hg_Params[3].xyz);
    r1.xy = r1.xy - hg_Params[6].xy;
    r1.zw = r1.xy*r1.xy;
    r1.z = dot(r1.zw, hg_Params[5].xy);
    r1.z = rsqrt(r1.z);
    r0.w = -hg_Params[4].x;
    r1.w = pow(r1.z, r0.w);
    r0.x = r1.z*r1.w;
    r1.xy = r1.xy*r0.xx;
    r1.zw = c0.xw;
    r1 = r1 + hg_Params[6];
    r0.x = dot(r1, hg_Params[0]);
    r0.y = dot(r1, hg_Params[1]);
    r0.xy = r0.xy + hg_Params[7].xy;
    r0.xy = r0.xy*hg_Params[7].zw;
    output.color0 = hg_Texture0.sample(hg_Sampler0, r0.xy);
    return output;
}


