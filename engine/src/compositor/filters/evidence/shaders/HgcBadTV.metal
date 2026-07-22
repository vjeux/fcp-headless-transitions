//Metal1.0     
//LEN=0000000876
[[ visible ]] FragmentOut HgcBadTV_hgc_visible(const constant float4* hg_Params, 
    texture2d< float > hg_Texture0, 
    sampler hg_Sampler0, 
    texture2d< float > hg_Texture1, 
    sampler hg_Sampler1,
    float4 texCoord0)
{
    const float4 c0 = float4(2.000000000, 0.5000000000, -1.000000000, 0.000000000);
    const float4 c1 = float4(0.000000000, 3.000000000, 0.000000000, 0.000000000);
    float4 r0, r1, r2, r3;
    FragmentOut output;

    r0.x = dot(texCoord0, hg_Params[3]);
    r1.y = r0.x + hg_Params[6].y;
    r0.y = c0.y*hg_Params[9].x + r0.x;
    r0.z = r0.y/hg_Params[9].x;
    r0.w = floor(r0.z);
    r0.w = -r0.w*hg_Params[9].x + r0.y;
    r0.z = c0.y;
    r0.xy = r0.zw + hg_Params[13].xy;
    r0.xy = r0.xy*hg_Params[13].zw;
    r1.x = hg_Texture0.sample(hg_Sampler0, r0.xy).x;
    r1.z = dot(texCoord0, hg_Params[4]);
    r1.w = dot(texCoord0, hg_Params[5]);
    r0.z = r1.x*c0.x + c0.z;
    r0.y = dot(texCoord0, hg_Params[2]);
    r1.x = r0.z*hg_Params[8].x + r0.y;
    r0.yzw = c0.www;
    r0.x = hg_Params[11].x;
    r2 = r1 - r0;
    r0 = r1 + r0;
    r3.x = dot(r2, hg_Params[0]);
    r3.y = dot(r2, hg_Params[1]);
    r2.y = dot(r0, hg_Params[1]);
    r2.x = dot(r0, hg_Params[0]);
    r0.x = dot(r1, hg_Params[1]);
    r0.z = dot(r1, hg_Params[0]);
    r2.xy = r2.xy + hg_Params[14].xy;
    r2.xy = r2.xy*hg_Params[14].zw;
    r2.x = hg_Texture1.sample(hg_Sampler1, r2.xy).x;
    r0.w = r0.x;
    r1.xy = r0.zw + hg_Params[14].xy;
    r1.xy = r1.xy*hg_Params[14].zw;
    r2.yw = hg_Texture1.sample(hg_Sampler1, r1.xy).yw;
    r0.y = r0.x*hg_Params[10].y;
    r3.xy = r3.xy + hg_Params[14].xy;
    r3.xy = r3.xy*hg_Params[14].zw;
    r2.z = hg_Texture1.sample(hg_Sampler1, r3.xy).z;
    r0.x = fract(r0.y);
    r0.x = clamp(r0.x*hg_Params[10].z + -hg_Params[10].x, 0.00000f, 1.00000f);
    r0.y = -r0.x - r0.x;
    r1.w = dot(r2, hg_Params[12]);
    r0.x = r0.x*r0.x;
    r0.y = r0.y + c1.y;
    r0.x = r0.x*r0.y;
    r0.x = mix(hg_Params[10].w, -c0.z, r0.x);
    r1.xyz = mix(r1.www, r2.xyz, hg_Params[7].xyz);
    output.color0.xyz = r1.xyz*r0.xxx;
    output.color0.w = r2.w;
    return output;
}


