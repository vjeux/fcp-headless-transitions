//Metal1.0     
//LEN=00000006fd
[[ visible ]] FragmentOut HgcBlackHole_hgc_visible(const constant float4* hg_Params, 
    texture2d< float > hg_Texture0, 
    sampler hg_Sampler0,
    float4 color1,
    float4 texCoord0)
{
    const float4 c0 = float4(1.000000000, 2.000000000, 9.999999975e-07, 0.000000000);
    float4 r0, r1, r2;
    FragmentOut output;

    r0.x = dot(texCoord0, hg_Params[4]);
    r0.z = 1.00000f / r0.x;
    r0.y = dot(texCoord0, hg_Params[3]);
    r0.x = dot(texCoord0, hg_Params[2]);
    r0.xy = r0.xy*r0.zz + -hg_Params[0].xy;
    r1.x = dot(r0.xy, r0.xy);
    r0.z = fmax(r1.x, c0.z);
    r0.z = rsqrt(r0.z);
    r1.z = r0.z*r1.x;
    r0.w = clamp(r1.z/hg_Params[1].y, 0.00000f, 1.00000f);
    r0.w = r0.w*hg_Params[1].x + r1.z;
    r0.xy = r0.zz*r0.xy;
    r0.xy = r0.xy*r0.ww + hg_Params[0].xy;
    r0.w = c0.x;
    r1.x = dot(r0.xyw, hg_Params[7].xyz);
    r1.w = 1.00000f / r1.x;
    r1.y = dot(r0.xyw, hg_Params[6].xyz);
    r1.x = dot(r0.xyw, hg_Params[5].xyz);
    r0.xy = r1.xy*r1.ww;
    r0.xy = r0.xy*hg_Params[1].zz;
    r1.xy = float2(hg_Params[9].xy < r0.xy);
    r0.zw = float2(r0.xy < hg_Params[8].xy);
    r0.z = fmax(r0.z, r0.w);
    r1.x = fmax(r1.x, r1.y);
    r0.z = fmax(r0.z, r1.x);
    r0.xy = fmax(r0.xy, hg_Params[8].xy);
    r0.w = r1.z + hg_Params[1].x;
    r0.w = r0.w*hg_Params[1].z;
    r1.xy = fmin(r0.xy, hg_Params[9].xy);
    r0.x = r1.z/r0.w;
    r0.x = clamp(r0.x*c0.y + -c0.x, 0.00000f, 1.00000f);
    r2.x = r0.x*hg_Params[1].w + -hg_Params[1].w;
    r1.xy = r1.xy + hg_Params[10].xy;
    r1.xy = r1.xy*hg_Params[10].zw;
    r1 = hg_Texture0.sample(hg_Sampler0, r1.xy);
    r1 = select(r1, c0.wwww, -r0.zzzz < 0.00000f);
    r0 = color1;
    r2.x = r2.x + c0.x;
    output.color0 = mix(r0, r1, r2.xxxx);
    return output;
}


