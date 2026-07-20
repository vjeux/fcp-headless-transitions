===== HgcInsectEyeBorder =====
//Metal1.0     
//LEN=0000000967
[[ visible ]] FragmentOut HgcInsectEyeBorder_hgc_visible(const constant float4* hg_Params,
    float4 color0,
    float4 texCoord1)
{
    const float4 c0 = float4(1.732100010, -2.000000000, 0.3333329856, 0.6766660213);
    const float4 c1 = float4(3.000000000, 0.5000000000, 0.9990000129, 1.000000000);
    const float4 c2 = float4(0.000000000, -0.8659999967, 0.2500000000, 0.000000000);
    float4 r0, r1, r2, r3, r4, r5, r6, r7;
    FragmentOut output;

    r0.xy = texCoord1.xy + hg_Params[5].xy;
    r1 = r0.xxxx*hg_Params[3].xxxx + hg_Params[3].zzzz;
    r0 = r0.yyyy*hg_Params[3].yyyy + hg_Params[3].wwww;
    r1.yw = r1.yw + hg_Params[4].xx;
    r0.zw = r0.zw + hg_Params[4].yy;
    r2 = color0;
    r3 = r0 + r0;
    r4 = fract(r3);
    r3 = r3 - r4;
    r4 = r1*c0.xxxx + -r0;
    r5 = fract(r4);
    r4 = r4 - r5;
    r5 = r1*c0.xxxx + r0;
    r6 = fract(r5);
    r5 = r5 - r6;
    r6 = r3*c0.yyyy + r5;
    r6 = r6*c0.zzzz + c0.wwww;
    r6 = fract(r6);
    r6 = r6*c1.xxxx + c1.yyyy;
    r7 = fract(r6);
    r6 = r6 - r7;
    r4 = r3 + r4;
    r4 = r4 - r5;
    r4 = r4 + r6;
    r4 = r4 - c1.zzzz;
    r5 = r3*c0.yyyy + r5;
    r5 = r5 - r6;
    r5 = r5*c0.zzzz;
    r7 = fract(r5);
    r5 = r5 - r7;
    r6 = select(-c0.yyyy, c1.wwww, r4 < 0.00000f);
    r5 = -c0.yyyy*r5 + r6;
    r5 = r5 + r3;
    r7 = select(-c1.yyyy, c1.wwww, r4 < 0.00000f);
    r3 = r3*c1.yyyy + r7;
    r6 = fract(r3);
    r3 = r3 - r6;
    r4 = float4(r4 >= c2.xxxx);
    r3 = r3 + r4;
    r7 = r5*c1.yyyy;
    r7 = fract(r7);
    r3 = r3 - r7;
    r5 = r5*c2.yyyy + r1;
    r3 = r0 - r3;
    r6 = r3 + r3;
    r4 = r5*c0.xxxx + -r3;
    r5 = r5*c0.xxxx + r3;
    r7 = clamp(r6*hg_Params[1].xxxx + hg_Params[1].yyyy, 0.00000f, 1.00000f);
    r6 = clamp(r6*hg_Params[2].xxxx + hg_Params[2].yyyy, 0.00000f, 1.00000f);
    r7 = fmax(r7, r6);
    r1 = clamp(r4*hg_Params[1].xxxx + hg_Params[1].yyyy, 0.00000f, 1.00000f);
    r7 = fmax(r7, r1);
    r4 = clamp(r4*hg_Params[2].xxxx + hg_Params[2].yyyy, 0.00000f, 1.00000f);
    r7 = fmax(r7, r4);
    r0 = clamp(r5*hg_Params[1].xxxx + hg_Params[1].yyyy, 0.00000f, 1.00000f);
    r7 = fmax(r7, r0);
    r5 = clamp(r5*hg_Params[2].xxxx + hg_Params[2].yyyy, 0.00000f, 1.00000f);
    r7 = fmax(r7, r5);
    r7.x = dot(r7, c2.zzzz);
    r7 = hg_Params[0]*r7.xxxx;
    r3.x = c1.w - r7.w;
    output.color0 = r2*r3.xxxx + r7;
    return output;
}


