//Metal1.0     
//LEN=0000000a48
[[ visible ]] FragmentOut HgcSlitTunnel_hgc_visible(const constant float4* hg_Params, 
    texture2d< float > hg_Texture0, 
    sampler hg_Sampler0, 
    texture2d< float > hg_Texture1, 
    sampler hg_Sampler1,
    float4 texCoord0)
{
    const float4 c0 = float4(0.05747731403, -0.01348046958, -0.1212390736, 0.1956359297);
    const float4 c1 = float4(0.9999956489, -0.3329946101, 1.570796371, 3.141592741);
    const float4 c2 = float4(0.1591549367, 0.5000000000, 0.000000000, 1.000000000);
    float4 r0, r1, r2;
    FragmentOut output;

    r0.xy = texCoord0.xy - hg_Params[0].xy;
    r0.xy = r0.xy + hg_Params[7].xy;
    r0.z = dot(r0.xy, hg_Params[10].xy);
    r0.x = dot(r0.xy, hg_Params[9].xy);
    r1.z = abs(r0.z);
    r0.w = abs(r0.x);
    r0.y = fmax(r0.w, r1.z);
    r1.x = 1.00000f / r0.y;
    r0.y = fmin(r0.w, r1.z);
    r1.w = r0.y*r1.x;
    r1.x = r1.w*r1.w;
    r0.y = r1.x*c0.y + c0.x;
    r0.y = r0.y*r1.x + c0.z;
    r0.y = r0.y*r1.x + c0.w;
    r1.y = r0.y*r1.x + c1.y;
    r0.y = r0.z;
    r2.x = r1.y*r1.x + c1.x;
    r1.xy = r0.xy*r0.xy;
    r0.y = r2.x*r1.w;
    r1.y = dot(r1.xy, 1.00000f);
    r1.x = c1.z - r0.y;
    r0.w = r1.z - r0.w;
    r0.w = select(r0.y, r1.x, r0.w < 0.00000f);
    r1.x = rsqrt(r1.y);
    r0.y = 1.00000f / r1.x;
    r2.x = c1.w - r0.w;
    r0.z = select(r0.w, r2.x, r0.z < 0.00000f);
    r0.x = select(r0.z, -r0.z, r0.x < 0.00000f);
    r0.w = r0.y*hg_Params[3].w + c2.w;
    r1.y = r0.x*c2.x + c2.y;
    r0.z = r0.y/r0.w;
    r2.y = r0.z;
    r2.x = r1.y*hg_Params[6].x;
    r2.w = dot(r2.xy, hg_Params[2].xy);
    r2.z = dot(r2.xy, hg_Params[1].xy);
    r2.zw = r2.zw + hg_Params[13].xy;
    r0.xy = abs(r2.zw);
    r2.y = r0.z;
    r2.x = r2.x - hg_Params[6].x;
    r2.w = dot(r2.xy, hg_Params[2].xy);
    r2.z = dot(r2.xy, hg_Params[1].xy);
    r2.xy = r2.zw + hg_Params[13].xy;
    r0.zw = r0.xy*hg_Params[12].xy;
    r2.z = dot(r0.xy, hg_Params[11].xy);
    r2.w = dot(r0.zw, 1.00000f);
    r0.xy = hg_Params[8].xy - hg_Params[7].xy;
    r0.zw = r0.xy + r2.zw;
    r2.xy = abs(r2.xy);
    r2.w = dot(r2.xy, hg_Params[12].xy);
    r2.z = dot(r2.xy, hg_Params[11].xy);
    r2.xy = r2.zw + r0.xy;
    r0.xy = r0.zw + hg_Params[14].xy;
    r0.xy = r0.xy*hg_Params[14].zw;
    r0 = hg_Texture0.sample(hg_Sampler0, r0.xy);
    r2.xy = r2.xy + hg_Params[15].xy;
    r2.xy = r2.xy*hg_Params[15].zw;
    r2 = hg_Texture1.sample(hg_Sampler1, r2.xy);
    r0 = mix(r0, r2, r1.yyyy);
    r1.x = r1.x*hg_Params[4].x;
    r2.xyz = hg_Params[5].xyz*hg_Params[5].www;
    r2.w = hg_Params[5].w;
    output.color0 = r1.xxxx*r2 + r0;
    return output;
}


