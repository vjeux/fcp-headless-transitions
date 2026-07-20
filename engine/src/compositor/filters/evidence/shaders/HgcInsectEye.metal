===== HgcInsectEye =====
//Metal1.0     
//LEN=0000000cd4
[[ visible ]] FragmentOut HgcInsectEye_hgc_visible(const constant float4* hg_Params, 
    texture2d< float > hg_Texture0, 
    sampler hg_Sampler0,
    float4 texCoord0)
{
    const float4 c0 = float4(1.732100010, 2.000000000, 0.3333333433, 0.6666666865);
    const float4 c1 = float4(3.000000000, 0.5000000000, 0.9990000129, 1.000000000);
    const float4 c2 = float4(-1.500000000, 0.8659999967, 0.2500000000, 0.000000000);
    float4 r0, r1, r2, r3, r4, r5;
    FragmentOut output;

    r0.xy = texCoord0.xy + hg_Params[5].xy;
    r1.x = r0.x*hg_Params[3].x + hg_Params[3].z;
    r1.yw = r1.xx + hg_Params[4].xx;
    r2.z = r0.y*hg_Params[3].y + hg_Params[3].w;
    r2.xy = r2.zz;
    r2.zw = r2.zz + hg_Params[4].yy;
    r1.xz = r1.xx;
    r3 = r1*c0.xxxx + r2;
    r1 = r1*c0.xxxx + -r2;
    r2 = r2 + r2;
    r2 = floor(r2);
    r3 = floor(r3);
    r4 = -r2*c0.yyyy + r3;
    r5 = r4*c0.zzzz + c0.wwww;
    r5 = fract(r5);
    r1 = floor(r1);
    r1 = r2 + r1;
    r5 = r5*c1.xxxx + c1.yyyy;
    r5 = floor(r5);
    r1 = r1 - r3;
    r1 = r1 + r5;
    r4 = r4 - r5;
    r4 = r4*c0.zzzz;
    r1 = float4(r1 >= c1.zzzz);
    r4 = floor(r4);
    r4 = r4*c0.yyyy + r1;
    r4 = r2 + r4;
    r2 = r2*c1.yyyy;
    r4 = r4 + c1.wwww;
    r3 = r4*hg_Params[0].xxxx;
    r2 = r1*c2.xxxx + r2;
    r2 = r2 + c1.wwww;
    r2 = floor(r2);
    r1 = r2 + r1;
    r4 = r4*c1.yyyy;
    r4 = fract(r4);
    r1 = r1 - r4;
    r3 = r3*c2.yyyy + hg_Params[1].xxxx;
    r5 = r0.xxxx - r3;
    r1 = r1*hg_Params[0].yyyy + hg_Params[1].yyyy;
    r0 = r0.yyyy - r1;
    r2.x = r5.y*hg_Params[2].x + r3.y;
    r2.y = r0.y*hg_Params[2].x + r1.y;
    r3.y = r0.x*hg_Params[2].x + r1.x;
    r3.x = r5.x*hg_Params[2].x + r3.x;
    r1.xy = floor(r3.xy);
    r2.xy = floor(r2.xy);
    r3.xy = r2.xy - hg_Params[5].xy;
    r1.xy = r1.xy - hg_Params[5].xy;
    r3.xy = r3.xy + c1.yy;
    r3.xy = r3.xy*hg_Params[6].xy;
    r1.xy = r1.xy + c1.yy;
    r1.xy = r1.xy*hg_Params[6].xy;
    r3.xy = fmin(r3.xy, hg_Params[7].zw);
    r1.xy = fmin(r1.xy, hg_Params[7].zw);
    r3.xy = fmax(r3.xy, hg_Params[7].xy);
    r4.xy = r3.xy + hg_Params[8].xy;
    r4.xy = r4.xy*hg_Params[8].zw;
    r4 = hg_Texture0.sample(hg_Sampler0, r4.xy);
    r1.xy = fmax(r1.xy, hg_Params[7].xy);
    r2.xy = r1.xy + hg_Params[8].xy;
    r2.xy = r2.xy*hg_Params[8].zw;
    r2 = hg_Texture0.sample(hg_Sampler0, r2.xy);
    r1.y = r0.z*hg_Params[2].x + r1.z;
    r1.xz = r5.zw*hg_Params[2].xx + r3.zw;
    r1.xy = floor(r1.xy);
    r1.xy = r1.xy - hg_Params[5].xy;
    r1.xy = r1.xy + c1.yy;
    r1.xy = r1.xy*hg_Params[6].xy;
    r1.xy = fmin(r1.xy, hg_Params[7].zw);
    r1.w = r0.w*hg_Params[2].x + r1.w;
    r1.zw = floor(r1.zw);
    r1.zw = r1.zw - hg_Params[5].xy;
    r1.zw = r1.zw + c1.yy;
    r5.xy = r1.zw*hg_Params[6].xy;
    r5.xy = fmin(r5.xy, hg_Params[7].zw);
    r2 = r2 + r4;
    r1.xy = fmax(r1.xy, hg_Params[7].xy);
    r1.xy = r1.xy + hg_Params[8].xy;
    r1.xy = r1.xy*hg_Params[8].zw;
    r1 = hg_Texture0.sample(hg_Sampler0, r1.xy);
    r5.xy = fmax(r5.xy, hg_Params[7].xy);
    r5.xy = r5.xy + hg_Params[8].xy;
    r5.xy = r5.xy*hg_Params[8].zw;
    r5 = hg_Texture0.sample(hg_Sampler0, r5.xy);
    r1 = r2 + r1;
    r1 = r1 + r5;
    output.color0 = r1*c2.zzzz;
    return output;
}


