===== HgcColorReduce =====
//Metal1.0     
//LEN=00000007ce
[[ visible ]] FragmentOut HgcColorReduce_hgc_visible(const constant float4* hg_Params,
    float4 color0)
{
    const float4 c0 = float4(100000.0000, 0.000000000, 9.999999747e-06, 1.000000000);
    const float4 c1 = float4(0.5000000000, 0.000000000, 0.000000000, 0.000000000);
    float4 r0, r1, r2, r3, r4, r5, r6, r7;
    FragmentOut output;

    r0 = color0;
    r0 = r0 / float4(fmax(r0.www, 1.00000e-06f), 1.);
    r1.xyz = hg_Params[5].xyz;
    r2.xyz = r0.xyz - hg_Params[1].xyz;
    r1.w = dot(r2.xyz, r2.xyz);
    r2.xyz = hg_Params[6].xyz;
    r3.xyz = r0.xyz - hg_Params[2].xyz;
    r2.w = dot(r3.xyz, r3.xyz);
    r3.xyz = hg_Params[7].xyz;
    r4.xyz = r0.xyz - hg_Params[3].xyz;
    r3.w = dot(r4.xyz, r4.xyz);
    r4.xyz = hg_Params[8].xyz;
    r5.xyz = r0.xyz - hg_Params[4].xyz;
    r4.w = dot(r5.xyz, r5.xyz);
    r5 = r1.wwww - r2.wwww;
    r6 = select(r2, r1, r5 < 0.00000f);
    r5 = select(c0.yxyy, c0.xyyy, r5 < 0.00000f);
    r7 = r6.wwww - r3.wwww;
    r6 = select(r3, r6, r7 < 0.00000f);
    r5 = select(c0.yyxy, r5, r7 < 0.00000f);
    r7 = r6.wwww - r4.wwww;
    r6 = select(r4, r6, r7 < 0.00000f);
    r5 = select(c0.yyyx, r5, r7 < 0.00000f);
    r7.w = fmax(r2.w, r1.w);
    r7.w = fmax(r3.w, r7.w);
    r7.w = fmax(r4.w, r7.w);
    r1.w = r1.w + r5.x;
    r2.w = r2.w + r5.y;
    r3.w = r3.w + r5.z;
    r4.w = r4.w + r5.w;
    r5 = r1.wwww - r2.wwww;
    r5 = select(r2, r1, r5 < 0.00000f);
    r1 = r5.wwww - r3.wwww;
    r5 = select(r3, r5, r1 < 0.00000f);
    r2 = r5.wwww - r4.wwww;
    r5 = select(r4, r5, r2 < 0.00000f);
    r6.w = r6.w + c0.z;
    r6.w = sqrt(r6.w);
    r7.w = r7.w + c0.z;
    r7.w = rsqrt(r7.w);
    r5.w = r5.w + c0.z;
    r5.w = sqrt(r5.w);
    r1.x = r5.w - r6.w;
    r1.x = r1.x*r7.w;
    r1.x = clamp(r1.x*hg_Params[0].x + c0.w, 0.00000f, 1.00000f);
    r1.x = r1.x*c1.x;
    r1.xyz = mix(r6.xyz, r5.xyz, r1.xxx);
    output.color0.xyz = r1.xyz*r0.www;
    output.color0.w = r0.w;
    return output;
}


