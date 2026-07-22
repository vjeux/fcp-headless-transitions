//Metal1.0     
//LEN=0000000772
[[ visible ]] FragmentOut HgcRingLens_hgc_visible(const constant float4* hg_Params,
    float4 color0, 
    texture2d< float > hg_Texture1, 
    sampler hg_Sampler1,
    float4 texCoord1)
{
    const float4 c0 = float4(0.000000000, 1.000000000, 2.000000000, 3.000000000);
    float4 r0, r1, r2, r3, r4;
    FragmentOut output;

    r0.xy = texCoord1.xy*hg_Params[4].xy + hg_Params[4].zw;
    r1 = float4(dot(r0.xy, r0.xy));
    r2 = rsqrt(r1.xxxx);
    r2 = select(r2, c0.xxxx, r1 < 0.00000f);
    r2 = select(c0.xxxx, r2, -r1 < 0.00000f);
    r0.xy = r0.xy*r2.xy;
    r1 = r1*r2;
    r2.xy = r1.xy*hg_Params[0].xx + hg_Params[0].yy;
    r3 = clamp(r1 - hg_Params[2].xxxx, 0.00000f, 1.00000f);
    r3 = clamp(c0.yyyy - r3, 0.00000f, 1.00000f);
    r4 = -r3*c0.zzzz + c0.wwww;
    r3 = r3*r3;
    r3 = r3*r4;
    r1 = clamp(r1 - hg_Params[2].yyyy, 0.00000f, 1.00000f);
    r1 = clamp(c0.yyyy - r1, 0.00000f, 1.00000f);
    r4 = -r1*c0.zzzz + c0.wwww;
    r1 = r1*r1;
    r1 = r1*r4;
    r2.xy = clamp(r2.xy, 0.00000f, 1.00000f);
    r2.xy = r2.xy*hg_Params[0].zz + hg_Params[0].ww;
    r4.x = r2.x + c0.y;
    r4.x = r4.x*-r2.x + r4.x;
    r4.xy = r2.xy/r4.xx;
    r4.xy = clamp(r4.xy*hg_Params[1].xx + hg_Params[1].yy, 0.00000f, 1.00000f);
    r4.xy = r4.xy*hg_Params[1].zz;
    r0.xy = r0.xy*r4.xy;
    r0.xy = r0.xy*hg_Params[5].xy + hg_Params[5].zw;
    r2.xy = fmax(r0.xy, -hg_Params[3].xy);
    r2.xy = fmin(r2.xy, hg_Params[3].xy);
    r4.xy = -hg_Params[3].xy - r0.xy;
    r0.xy = r0.xy - hg_Params[3].xy;
    r4.x = fmax(r4.x, r4.y);
    r4.y = fmax(r0.x, r0.y);
    r4.x = fmax(r4.x, r4.y);
    r2.xy = r2.xy + hg_Params[6].xy;
    r2.xy = r2.xy*hg_Params[6].zw;
    r2 = hg_Texture1.sample(hg_Sampler1, r2.xy);
    r2 = select(r2, c0.xxxx, -r4.xxxx < 0.00000f);
    r0 = color0;
    r3 = mix(r0, r2, r3);
    output.color0 = mix(r3, r0, r1);
    return output;
}


