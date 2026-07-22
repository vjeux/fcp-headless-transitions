===== HgcCircleBlur2 =====
//Metal1.0     
//LEN=0000000d02
[[ visible ]] FragmentOut HgcCircleBlur2_hgc_visible(const constant float4* hg_Params,
    float4 color0,
    float4 color1,
    float4 color2,
    float4 color3,
    float4 color4,
    float4 texCoord5)
{
    const float4 c0 = float4(7.000000000, 3.000000000, 2.000000000, 1.000000000);
    const float4 c1 = float4(4.000000000, 1.000000000, 0.000000000, 0.000000000);
    float4 r0, r1, r2, r3, r4, r5, r6, r7, r8, r9;
    FragmentOut output;

    r0 = color0;
    r1.w = c0.w;
    r1.xy = texCoord5.xy;
    r2.y = dot(r1.xyw, hg_Params[3].xyz);
    r2.x = dot(r1.xyw, hg_Params[2].xyz);
    r2.x = dot(r2.xy, r2.xy);
    r2.x = sqrt(r2.x);
    r2.x = -r2.x*hg_Params[1].x + c0.w;
    r2.y = r2.x*c0.x;
    r1 = color1;
    r3 = color2;
    r4 = color3;
    r2.z = floor(fabs(r2.y));
    r2.z = select(r2.z, -r2.z, r2.y < 0.00000f);
    r5.x = r2.z - c0.y;
    r5.w = r5.x - c0.w;
    r6.yz = r5.xx - c0.zy;
    r5.w = abs(r5.w);
    r6.yz = abs(r6.yz);
    r2.y = r2.y - r2.z;
    r5.z = float(c1.z < r2.x);
    r5.y = float(r2.x < c0.w);
    r5.y = fmin(r5.z, r5.y);
    r5.z = r5.y*hg_Params[0].x;
    r2.w = float(r2.z >= c1.x);
    r2.w = r5.z*r2.w;
    r5.z = float(c1.z >= r5.x);
    r5.zw = float2(-r5.zw >= c1.zz);
    r5.x = abs(r5.x);
    r7 = color4;
    r5.z = r2.w*r5.z;
    r6.x = r5.z*r5.w;
    r5.z = r5.z*-r5.w + r5.z;
    r6.y = float(-r6.y >= c1.z);
    r5.w = r5.z*r6.y;
    r8 = select(r0, r1, -r6.xxxx < 0.00000f);
    r9 = select(r1, r3, -r6.xxxx < 0.00000f);
    r6.yz = float2(-r6.yz >= c1.zz);
    r9 = select(r9, r4, -r5.wwww < 0.00000f);
    r8 = select(r8, r3, -r5.wwww < 0.00000f);
    r5.z = r5.z*r6.y;
    r6.y = r5.z*r6.z;
    r6.z = float(-r6.z >= c1.z);
    r5.z = r5.z*r6.z;
    r8 = select(r8, r4, -r6.yyyy < 0.00000f);
    r6 = select(r9, r7, -r6.yyyy < 0.00000f);
    r6 = select(r6, c1.yzzy, -r5.zzzz < 0.00000f);
    r9.x = float(-fabs(hg_Params[0].x) >= c1.z);
    r8 = select(r8, c1.yzzy, -r5.zzzz < 0.00000f);
    r5.w = r2.z - c1.y;
    r5.z = abs(r5.w);
    r5.w = float(c1.z >= r2.z);
    r9.y = fmin(r5.y, r9.x);
    r5.zw = float2(-r5.zw >= c1.zz);
    r5.w = fmin(r9.y, r5.w);
    r9.z = fmin(r5.w, r5.z);
    r5.xz = float2(-r5.xz >= c1.zz);
    r5.z = fmin(r5.w, r5.z);
    r2.z = float(r2.z == c0.z);
    r5.w = fmin(r5.z, r2.z);
    r9.w = c1.y - r2.y;
    r6 = mix(r6, r8, r9.wwww);
    r8 = select(r1, r3, -r9.zzzz < 0.00000f);
    r1 = select(r0, r1, -r9.zzzz < 0.00000f);
    r2.z = r5.z*-r2.z + r5.z;
    r5.z = fmin(r2.z, r5.x);
    r8 = select(r8, r4, -r5.wwww < 0.00000f);
    r1 = select(r1, r3, -r5.wwww < 0.00000f);
    r2.z = r2.z*-r5.x + r2.z;
    r8 = select(r8, r7, -r5.zzzz < 0.00000f);
    r8 = select(r8, c1.yzzy, -r2.zzzz < 0.00000f);
    r1 = select(r1, r4, -r5.zzzz < 0.00000f);
    r1 = select(r1, c1.yzzy, -r2.zzzz < 0.00000f);
    r2.x = float(c1.z >= r2.x);
    r2.y = r2.x;
    r2.z = r5.y;
    r2.yz = float2(-r2.yz >= c1.zz);
    r2.xy = fmin(r2.zz, r2.xy);
    r1 = mix(r8, r1, r9.wwww);
    r6 = select(r0, r6, -r2.wwww < 0.00000f);
    r6 = select(r6, r1, -r9.yyyy < 0.00000f);
    r6 = select(r6, r0, -r2.xxxx < 0.00000f);
    r2.x = r2.y*-hg_Params[0].x;
    r6 = select(r6, r7, r2.xxxx < 0.00000f);
    r2.x = fmin(r2.y, r9.x);
    output.color0 = select(r6, r0, -r2.xxxx < 0.00000f);
    return output;
}
