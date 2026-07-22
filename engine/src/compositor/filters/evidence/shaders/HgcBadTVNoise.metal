//Metal1.0     
//LEN=00000009fb
[[ visible ]] FragmentOut HgcBadTVNoise_hgc_visible(const constant float4* hg_Params, 
    texture2d< float > hg_Texture0, 
    sampler hg_Sampler0, 
    texture2d< float > hg_Texture1, 
    sampler hg_Sampler1, 
    texture2d< float > hg_Texture2, 
    sampler hg_Sampler2,
    float4 texCoord0)
{
    const float4 c0 = float4(2.000000000, 0.5000000000, -1.000000000, 0.000000000);
    const float4 c1 = float4(9.999999975e-07, 3.000000000, 0.000000000, 0.000000000);
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
    r1.w = dot(texCoord0, hg_Params[5]);
    r1.z = dot(texCoord0, hg_Params[4]);
    r0.z = r1.x*c0.x + c0.z;
    r0.y = dot(texCoord0, hg_Params[2]);
    r1.x = r0.z*hg_Params[8].x + r0.y;
    r0.yzw = c0.www;
    r0.x = hg_Params[11].x;
    r2 = r1 - r0;
    r0 = r1 + r0;
    r3.x = dot(r2, hg_Params[0]);
    r3.y = dot(r2, hg_Params[1]);
    r3.xy = r3.xy + hg_Params[14].xy;
    r3.xy = r3.xy*hg_Params[14].zw;
    r3.z = hg_Texture1.sample(hg_Sampler1, r3.xy).z;
    r3.w = dot(r1, hg_Params[1]);
    r3.y = dot(r0, hg_Params[1]);
    r3.x = dot(r0, hg_Params[0]);
    r1.x = dot(r1, hg_Params[0]);
    r1.y = r3.w;
    r2.xy = r1.xy + hg_Params[14].xy;
    r2.xy = r2.xy*hg_Params[14].zw;
    r2.yw = hg_Texture1.sample(hg_Sampler1, r2.xy).yw;
    r0.xy = r3.xy + hg_Params[14].xy;
    r0.xy = r0.xy*hg_Params[14].zw;
    r3.x = hg_Texture1.sample(hg_Sampler1, r0.xy).x;
    r3.y = r2.y;
    r0.x = fmax(r2.w, c1.x);
    r1.xy = r1.xy + hg_Params[15].xy;
    r1.xy = r1.xy*hg_Params[15].zw;
    r2.xyz = hg_Texture2.sample(hg_Sampler2, r1.xy).xyz;
    r0.xyz = r3.xyz/r0.xxx;
    r0.xyz = r2.xyz*c0.xxx + r0.xyz;
    r2.x = r3.w*hg_Params[10].y;
    r2.x = fract(r2.x);
    r2.x = clamp(r2.x*hg_Params[10].z + -hg_Params[10].x, 0.00000f, 1.00000f);
    r2.y = -r2.x - r2.x;
    r0.xyz = r0.xyz + c0.zzz;
    r0.w = r2.w;
    r0.w = dot(r0, hg_Params[12]);
    r2.x = r2.x*r2.x;
    r2.y = r2.y + c1.y;
    r2.x = r2.x*r2.y;
    r2.x = mix(hg_Params[10].w, -c0.z, r2.x);
    r0.xyz = mix(r0.www, r0.xyz, hg_Params[7].xyz);
    r0.xyz = r0.xyz*r2.xxx;
    output.color0.xyz = r2.www*r0.xyz;
    output.color0.w = r2.w;
    return output;
}


