===== HgcAddNoiseNormal =====
//Metal1.0     
//LEN=00000001f8
[[ visible ]] FragmentOut HgcAddNoiseNormal_hgc_visible(const constant float4* hg_Params,
    float4 color0,
    float4 color1)
{
    const float4 c0 = float4(2.000000000, -1.000000000, 0.000000000, 0.000000000);
    float4 r0, r1;
    FragmentOut output;

    r0.xyz = color0.xyz;
    r0.xyz = r0.xyz*c0.xxx + c0.yyy;
    r1 = color1;
    r0.xyz = r0.xyz*hg_Params[0].xyz;
    r1.xyz = r1.www*r0.xyz + r1.xyz;
    output.color0 = fmax(r1, c0.zzzz);
    return output;
}


