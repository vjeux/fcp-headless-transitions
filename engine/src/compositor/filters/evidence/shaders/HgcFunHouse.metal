//Metal1.0     
//LEN=0000000577
[[ visible ]] FragmentOut HgcFunHouse_hgc_visible(const constant float4* hg_Params, 
    texture2d< float > hg_Texture0, 
    sampler hg_Sampler0,
    float4 texCoord0)
{
    const float4 c0 = float4(0.5000000000, 1.000000000, -2.000000000, 3.000000000);
    const float4 c1 = float4(0.000000000, 0.000000000, 0.000000000, 0.000000000);
    float4 r0, r1, r2, r3;
    FragmentOut output;

    r0.xy = hg_Params[5].xy*c0.xx;
    r1.xy = texCoord0.xy - hg_Params[0].xy;
    r1.xy = r1.xy*hg_Params[4].zw;
    r2.x = dot(r1.xy, hg_Params[1].xy);
    r2.y = dot(r1.xy, hg_Params[1].zw);
    r1.x = clamp(abs(r2.x), 0.00000f, 1.00000f);
    r1.x = clamp(c0.y - r1.x, 0.00000f, 1.00000f);
    r3.x = r1.x*c0.z + c0.w;
    r1.x = r1.x*r1.x;
    r3.x = r1.x*r3.x;
    r3.x = mix(c0.y, hg_Params[3].x, r3.x);
    r2.x = r2.x*r3.x;
    r1.x = dot(r2.xy, hg_Params[2].xy);
    r1.y = dot(r2.xy, hg_Params[2].zw);
    r1.xy = r1.xy*hg_Params[4].xy + hg_Params[0].xy;
    r3.xy = fmax(r1.xy, -r0.xy);
    r3.xy = fmin(r3.xy, r0.xy);
    r2.xy = -r0.xy - r1.xy;
    r1.xy = r1.xy - r0.xy;
    r2.x = fmax(r2.x, r2.y);
    r2.y = fmax(r1.x, r1.y);
    r2.x = fmax(r2.x, r2.y);
    r3.xy = r3.xy + hg_Params[6].xy;
    r3.xy = r3.xy*hg_Params[6].zw;
    r3 = hg_Texture0.sample(hg_Sampler0, r3.xy);
    output.color0 = select(r3, c1.xxxx, -r2.xxxx < 0.00000f);
    return output;
}


