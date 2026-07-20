===== HgcGradientBlur2 =====
//Metal1.0     
//LEN=0000000d41
[[ visible ]] FragmentOut HgcGradientBlur2_hgc_visible(const constant float4* hg_Params,
    float4 color0,
    float4 color1,
    float4 color2,
    float4 color3,
    float4 color4,
    float4 texCoord5)
{
    const float4 c0 = float4(7.000000000, 3.000000000, 2.000000000, 1.000000000);
    const float4 c1 = float4(4.000000000, 0.000000000, 1.000000000, 0.000000000);
    float4 r0, r1, r2, r3, r4, r5, r6, r7, r8, r9;
    FragmentOut output;

    r0 = color0;
    r1 = color1;
    r2.w = c0.w;
    r2.xy = texCoord5.xy;
    r2.x = dot(r2.xyw, hg_Params[1].xyz);
    r2.x = r2.x*hg_Params[2].x + c0.w;
    r3.x = r2.x*c0.x;
    r4.y = floor(fabs(r3.x));
    r3.w = select(r4.y, -r4.y, r3.x < 0.00000f);
    r2.w = r3.w - c0.y;
    r4.x = r3.x - r3.w;
    r3.x = abs(hg_Params[0].x);
    r5.y = float(r2.w == c0.z);
    r6.x = float(r3.w < c1.x);
    r6.z = float(r2.x < c0.w);
    r6.y = float(c1.y < r2.x);
    r2.y = fmin(r6.y, r6.z);
    r6.y = float(-r6.x >= c1.y);
    r6.x = r2.y*hg_Params[0].x;
    r2.z = r6.x*r6.y;
    r6.x = float(c1.y >= r2.w);
    r6.y = r2.w - c0.w;
    r6.y = abs(r6.y);
    r6.x = float(-r6.x >= c1.y);
    r7.x = r2.z*r6.x;
    r7.y = float(-r6.y >= c1.y);
    r6.z = r7.x*r7.y;
    r7.y = float(-r7.y >= c1.y);
    r5.x = r7.x*r7.y;
    r7 = select(r0, r1, -r6.zzzz < 0.00000f);
    r8 = color2;
    r6.x = r5.x*r5.y;
    r7 = select(r7, r8, -r6.xxxx < 0.00000f);
    r9.y = float(-r5.y >= c1.y);
    r9.x = float(r2.w == c0.y);
    r6.y = r5.x*r9.y;
    r6.w = r9.x;
    r3.z = r6.y*r9.x;
    r5 = color3;
    r7 = select(r7, r5, -r3.zzzz < 0.00000f);
    r6.w = float(-r6.w >= c1.y);
    r3.y = r6.y*r6.w;
    r9 = select(r1, r8, -r6.zzzz < 0.00000f);
    r6 = select(r9, r5, -r6.xxxx < 0.00000f);
    r9 = color4;
    r6 = select(r6, r9, -r3.zzzz < 0.00000f);
    r6 = select(r6, c1.zyyz, -r3.yyyy < 0.00000f);
    r7 = select(r7, c1.zyyz, -r3.yyyy < 0.00000f);
    r4.z = float(r3.w == c1.z);
    r3.y = float(c1.y >= r3.w);
    r3.w = r3.w - c0.z;
    r3.w = abs(r3.w);
    r3.xzw = float3(-r3.xyw >= c1.yyy);
    r3.y = fmin(r2.y, r3.x);
    r4.y = fmin(r3.y, r3.z);
    r4.w = fmin(r4.y, r4.z);
    r4.y = r4.y*-r4.z + r4.y;
    r3.z = c1.z - r4.x;
    r6 = mix(r6, r7, r3.zzzz);
    r7 = select(r1, r8, -r4.wwww < 0.00000f);
    r1 = select(r0, r1, -r4.wwww < 0.00000f);
    r4.z = fmin(r4.y, r3.w);
    r8 = select(r1, r8, -r4.zzzz < 0.00000f);
    r7 = select(r7, r5, -r4.zzzz < 0.00000f);
    r1.x = r3.w;
    r1.y = abs(r2.w);
    r1.xy = float2(-r1.xy >= c1.yy);
    r1.z = r1.y;
    r1.x = fmin(r4.y, r1.x);
    r1.y = fmin(r1.x, r1.y);
    r1.z = float(-r1.z >= c1.y);
    r5 = select(r8, r5, -r1.yyyy < 0.00000f);
    r1.x = fmin(r1.x, r1.z);
    r7 = select(r7, r9, -r1.yyyy < 0.00000f);
    r7 = select(r7, c1.zyyz, -r1.xxxx < 0.00000f);
    r5 = select(r5, c1.zyyz, -r1.xxxx < 0.00000f);
    r5 = mix(r7, r5, r3.zzzz);
    r6 = select(r0, r6, -r2.zzzz < 0.00000f);
    r5 = select(r6, r5, -r3.yyyy < 0.00000f);
    r4.x = float(c1.y >= r2.x);
    r8.x = r4.x;
    r8.y = r2.y;
    r8.xy = float2(-r8.xy >= c1.yy);
    r8.x = fmin(r8.y, r8.x);
    r8.y = fmin(r8.y, r4.x);
    r5 = select(r5, r0, -r8.yyyy < 0.00000f);
    r8.y = r8.x*-hg_Params[0].x;
    r5 = select(r5, r9, r8.yyyy < 0.00000f);
    r8.x = fmin(r8.x, r3.x);
    output.color0 = select(r5, r0, -r8.xxxx < 0.00000f);
    return output;
}


