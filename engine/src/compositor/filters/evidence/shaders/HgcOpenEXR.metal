//Metal1.0     
//LEN=000000038e
[[ visible ]] FragmentOut HgcOpenEXR_hgc_visible(const constant float4* hg_Params,
    float4 color0)
{
    const float4 c0 = float4(0.000000000, 1.000000000, 0.000000000, 0.000000000);
    float4 r0, r1, r2, r3;
    FragmentOut output;

    r0 = color0;
    r1.xyz = r0.xyz - hg_Params[1].xyz;
    r1.xyz = fmax(c0.xxx, r1.xyz);
    r1.xyz = r1.xyz*hg_Params[0].xyz;
    r2.xyz = r1.xyz - hg_Params[4].xyz;
    r2.xyz = r2.xyz*hg_Params[5].xxx + c0.yyy;
    r2.xyz = log2(r2.xyz);
    r2.xyz = r2.xyz*hg_Params[5].yyy + hg_Params[4].xyz;
    r3.xyz = float3(hg_Params[4].xyz < r1.xyz);
    r1.xyz = select(r1.xyz, r2.xyz, -r3.xyz < 0.00000f);
    r1.xyz = fmax(c0.xxx, r1.xyz);
    r1.xyz = pow(r1.xyz, hg_Params[2].xyz);
    r1.xyz = r1.xyz*hg_Params[3].xyz;
    output.color0.xyz = select(r1.xyz, r0.xyz, r0.xyz < 0.00000f);
    output.color0.w = r0.w;
    return output;
}
