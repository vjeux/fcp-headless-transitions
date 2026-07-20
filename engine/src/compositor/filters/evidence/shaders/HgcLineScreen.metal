===== HgcLineScreen =====
//Metal1.0     
//LEN=0000000313
[[ visible ]] FragmentOut HgcLineScreen_hgc_visible(const constant float4* hg_Params,
    float4 color0,
    float4 texCoord1)
{
    const float4 c0 = float4(1.000000000, 0.5000000000, 0.000000000, 0.000000000);
    float4 r0, r1, r2;
    FragmentOut output;

    r0 = texCoord1 + hg_Params[3];
    r0 = r0 - hg_Params[0];
    r0 = r0*hg_Params[4];
    r0.xyz = float3(dot(r0, hg_Params[1]));
    r0.xyz = fract(r0.xyz);
    r1 = color0;
    r2.xyz = c0.xxx - r0.xyz;
    r0.xyz = fmin(r2.xyz, r0.xyz);
    r0.xyz = r0.xyz + r0.xyz;
    r2.xyz = float3(dot(r1, hg_Params[5]));
    r2.xyz = r2.xyz - r0.xyz;
    r2.xyz = clamp(r2.xyz*hg_Params[2].xyz + c0.yyy, 0.00000f, 1.00000f);
    r1.xyz = r2.xyz*r1.www;
    output.color0 = r1;
    return output;
}


