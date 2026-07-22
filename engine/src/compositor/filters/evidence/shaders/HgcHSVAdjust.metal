===== HgcHSVAdjust =====
//Metal1.0     
//LEN=00000009bb
[[ visible ]] FragmentOut HgcHSVAdjust_hgc_visible(const constant float4* hg_Params,
    float4 color0)
{
    const float4 c0 = float4(0.9999899864, 9.999999747e-06, 9.999999975e-07, 0.000000000);
    const float4 c1 = float4(0.001000000047, 0.000000000, 2.000000000, 4.000000000);
    const float4 c2 = float4(0.1666666716, 6.000000000, 0.000000000, 0.000000000);
    const float4 c3 = float4(0.000000000, 1.000000000, 2.000000000, 3.000000000);
    const float4 c4 = float4(1.000000000, -1.000000000, 0.000000000, 0.000000000);
    float4 r0, r1, r2, r3, r4, r5, r6;
    FragmentOut output;

    r0 = color0;
    output.color0.w = r0.w;
    r1.xyz = fmax(r0.xxx, r0.yyy);
    r1.xyz = fmax(r1.xyz, r0.zzz);
    r1.xyz = fmax(r1.xyz, c0.xxx);
    r1.x = r1.x + c0.y;
    r2.x = 1.00000f / r1.x;
    r2.yz = r2.xx;
    r0.xyz = r0.xyz*r2.xyz;
    r2.xyz = fmax(r0.xxx, r0.yyy);
    r2.xyz = fmax(r2.xyz, r0.zzz);
    r3.x = fmin(r0.x, r0.y);
    r3.x = fmin(r3.x, r0.z);
    r3.x = r2.x - r3.x;
    r4.xyz = float3(r0.xyz >= r2.xyz);
    r4.yz = clamp(r4.yz - r4.xx, 0.00000f, 1.00000f);
    r4.z = clamp(r4.z - r4.y, 0.00000f, 1.00000f);
    r2.x = r2.x + c0.y;
    r2.x = r3.x/r2.x;
    r0.xyz = r0.yzx - r0.zxy;
    r5.xyz = float3(r3.xxx >= c0.zzz);
    r5.xyz = c0.www - r5.xyz;
    r3.x = r3.x + c1.x;
    r0.xyz = r0.xyz/r3.xxx;
    r0.xyz = select(c0.www, r0.xyz, r5.xyz < 0.00000f);
    r0.xyz = r0.xyz + c1.yzw;
    r0 = float4(dot(r0.xyz, r4.xyz));
    r0 = r0*c2.xxxx + hg_Params[0].xxxx;
    r2.xy = clamp(r2.xy*hg_Params[0].yz, 0.00000f, 1.00000f);
    r0 = fract(r0);
    r0 = r0*c2.yyyy;
    r3.xyz = fract(r0.xyz);
    r0 = floor(r0);
    r5 = clamp(r0 - c3, 0.00000f, 1.00000f);
    r0.xyz = clamp(r0.xyz - c1.www, 0.00000f, 1.00000f);
    r4.xyz = -c3.xyy*r2.xxx;
    r4.z = r4.z*r3.z;
    r6.xyz = c4.xyz*r2.xxx;
    r6.x = r6.x*r3.x + r6.y;
    r0.xyz = select(r6.xyz, r4.xyz, -r0.xyz < 0.00000f);
    r4.xyz = c4.yyz*r2.xxx;
    r4.y = r4.y*r3.y;
    r0.xyz = select(r4.xyz, r0.xyz, -r5.www < 0.00000f);
    r6.xyz = c4.yzx*r2.xxx;
    r6.z = r6.z*r3.z + r6.x;
    r0.xyz = select(r6.xyz, r0.xyz, -r5.zzz < 0.00000f);
    r4.xyz = c4.yzy*r2.xxx;
    r4.x = r4.x*r3.x;
    r0.xyz = select(r4.xyz, r0.xyz, -r5.yyy < 0.00000f);
    r6.xyz = c4.zxy*r2.xxx;
    r6.y = r6.y*r3.y + r6.z;
    r0.xyz = select(r6.xyz, r0.xyz, -r5.xxx < 0.00000f);
    r0.xyz = r0.xyz*r2.yyy + r2.yyy;
    output.color0.xyz = r0.xyz*r1.xyz;
    return output;
}


