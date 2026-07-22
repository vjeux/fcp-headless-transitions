//Metal1.0     
//LEN=00000004dd
[[ visible ]] FragmentOut HgcTwirl_hgc_visible(const constant float4* hg_Params, 
    texture2d< float > hg_Texture0, 
    sampler hg_Sampler0,
    float4 texCoord0)
{
    const float4 c0 = float4(-3.000000000, 1.000000000, 2.000000000, 0.000000000);
    float4 r0, r1, r2;
    FragmentOut output;

    r0.xyz = texCoord0.xyz - hg_Params[0].xyz;
    r0.xyz = r0.xyz*hg_Params[2].xyx;
    r1.x = dot(r0.xyz, r0.xyz);
    r1.x = rsqrt(r1.x);
    r1.x = r1.x*hg_Params[1].x;
    r1.x = clamp(1.00000f / r1.x, 0.00000f, 1.00000f);
    r2.x = r1.x*r1.x;
    r1.x = r2.x*r1.x;
    r2.x = r2.x*c0.x + c0.y;
    r2.x = r1.x*c0.z + r2.x;
    r2.x = r2.x*hg_Params[1].y;
    r1.x = cos(r2.x);
    r1.y = sin(r2.x);
    r2.xy = float2(-r1.y, r1.x);
    r1.x = dot(r0.xy, r1.xy);
    r1.y = dot(r0.xy, r2.xy);
    r1.xy = r1.xy*hg_Params[2].zw + hg_Params[0].xy;
    r0.xy = r1.xy + hg_Params[4].xy;
    r0.xy = r0.xy*hg_Params[4].zw;
    r0 = hg_Texture0.sample(hg_Sampler0, r0.xy);
    r1.xy = r1.xy - hg_Params[3].zw;
    r2 = fmin(r1.yyyy, r1.xxxx);
    r1.xy = hg_Params[3].xy - r1.xy;
    r2 = fmin(r1.xxxx, r2);
    r1 = fmin(r1.yyyy, r2);
    output.color0 = select(r0, c0.wwww, r1 < 0.00000f);
    return output;
}


