===== HgcSpillRemoval =====
//Metal1.0     
//LEN=00000003a7
[[ visible ]] FragmentOut HgcSpillRemoval_hgc_visible(const constant float4* hg_Params,
    float4 color0)
{
    const float4 c0 = float4(8.000000000, 1.000000000, 0.000000000, 0.000000000);
    float4 r0, r1, r2, r3, r4;
    FragmentOut output;

    r0 = color0;
    r1.xyz = float3(dot(r0, hg_Params[3]));
    r2.xyz = float3(dot(r0, hg_Params[4]));
    r2.xyz = abs(r2.xyz);
    r1.xyz = r2.xyz*hg_Params[5].xyz + r1.xyz;
    r3.x = dot(r0, hg_Params[0]);
    r3.y = dot(r0, hg_Params[1]);
    r3.z = dot(r0, hg_Params[2]);
    r4.x = dot(r0, hg_Params[6]);
    r4.y = dot(r0, hg_Params[7]);
    r4.z = dot(r0, hg_Params[8]);
    r2.xyz = clamp(r2.xyz*hg_Params[9].xyz, 0.00000f, 1.00000f);
    r3.xyz = mix(r3.xyz, r4.xyz, r2.xyz);
    r1.xyz = clamp(r1.xyz*c0.xxx + c0.yyy, 0.00000f, 1.00000f);
    output.color0.xyz = mix(r3.xyz, r0.xyz, r1.xyz);
    output.color0.w = r0.w;
    return output;
}
