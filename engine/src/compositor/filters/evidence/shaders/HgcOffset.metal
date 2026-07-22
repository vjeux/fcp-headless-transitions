//Metal1.0     
//LEN=000000049a
[[ visible ]] FragmentOut HgcOffset_hgc_visible(const constant float4* hg_Params, 
    texture2d< float > hg_Texture0, 
    sampler hg_Sampler0,
    float4 texCoord0)
{
    const float4 c0 = float4(0.5000000000, 0.000000000, 0.000000000, 1.000000000);
    float4 r0, r1;
    FragmentOut output;

    r0.xy = texCoord0.xy;
    r0.w = c0.w;
    r1.x = dot(r0.xyw, hg_Params[7].xyz);
    r1.z = 1.00000f / r1.x;
    r1.y = dot(r0.xyw, hg_Params[6].xyz);
    r1.x = dot(r0.xyw, hg_Params[5].xyz);
    r1.zw = r1.xy*r1.zz + hg_Params[0].zw;
    r0.x = r1.z + hg_Params[1].x;
    r1.xy = hg_Params[1].xy*c0.xx + r1.zw;
    r1.x = select(r1.z, r0.x, r1.x < 0.00000f);
    r0.w = c0.w;
    r1.z = r1.w + hg_Params[1].y;
    r1.y = select(r1.w, r1.z, r1.y < 0.00000f);
    r1.xy = floor(r1.xy);
    r0.xy = r1.xy + c0.xx;
    r1.x = dot(r0.xyw, hg_Params[4].xyz);
    r1.z = 1.00000f / r1.x;
    r1.y = dot(r0.xyw, hg_Params[3].xyz);
    r1.x = dot(r0.xyw, hg_Params[2].xyz);
    r1.xy = r1.xy*r1.zz;
    r1.xy = r1.xy + hg_Params[8].xy;
    r1.xy = r1.xy*hg_Params[8].zw;
    output.color0 = hg_Texture0.sample(hg_Sampler0, r1.xy);
    return output;
}


