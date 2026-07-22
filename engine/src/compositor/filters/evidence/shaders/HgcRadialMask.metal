===== HgcRadialMask =====
//Metal1.0     
//LEN=00000002fe
[[ visible ]] FragmentOut HgcRadialMask_hgc_visible(const constant float4* hg_Params,
    float4 color0,
    float4 texCoord1)
{
    const float4 c0 = float4(0.5000000000, 0.000000000, 0.000000000, 0.000000000);
    float4 r0, r1;
    FragmentOut output;

    r0.z = c0.z;
    r0.x = dot(hg_Params[3], texCoord1);
    r0.y = dot(hg_Params[4], texCoord1);
    r0.w = dot(hg_Params[5], texCoord1);
    r0.xy = r0.xy/r0.ww;
    r0.xyz = r0.xyz - hg_Params[1].xyz;
    r0.xyz = r0.xyz*hg_Params[0].xyz;
    r0 = float4(dot(r0.xyz, r0.xyz));
    r0 = sqrt(r0);
    r1 = hg_Params[2] - c0.xxxx;
    r1 = fmax(r1, c0.zzzz);
    r0 = clamp(r0 - r1, 0.00000f, 1.00000f);
    r1 = color0;
    output.color0 = r1*-r0 + r1;
    return output;
}
