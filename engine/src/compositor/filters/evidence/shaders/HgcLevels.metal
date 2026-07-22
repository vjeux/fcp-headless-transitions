//Metal1.0     
//LEN=00000003f8
[[ visible ]] FragmentOut HgcLevels_hgc_visible(const constant float4* hg_Params,
    float4 color0)
{
    const float4 c0 = float4(9.999999747e-06, 0.000000000, 0.000000000, 0.000000000);
    float4 r0, r1, r2, r3;
    FragmentOut output;

    r0 = color0;
    r1 = hg_Params[0] - hg_Params[2];
    r1 = r1 + c0.xxxx;
    r2 = hg_Params[1] - hg_Params[3];
    r3 = r0 / float4(fmax(r0.www, 1.00000e-06f), 1.);
    r1 = r2/r1;
    r2 = r1*-hg_Params[0] + hg_Params[1];
    r1 = clamp(r3*r1 + r2, 0.00000f, 1.00000f);
    r1 = clamp(r1 + c0.xxxx, 0.00000f, 1.00000f);
    r3 = hg_Params[5] - hg_Params[7];
    r3 = r3 + c0.xxxx;
    r2 = hg_Params[6] - hg_Params[8];
    r1 = pow(r1, hg_Params[4]);
    r3 = r2/r3;
    r2 = r3*-hg_Params[5] + hg_Params[6];
    r1 = clamp(r1*r3 + r2, 0.00000f, 1.00000f);
    r1 = clamp(r1 + c0.xxxx, 0.00000f, 1.00000f);
    r1 = pow(r1, hg_Params[9]);
    r1.xyz = r1.www*r1.xyz;
    output.color0 = mix(r0, r1, hg_Params[10]);
    return output;
}


