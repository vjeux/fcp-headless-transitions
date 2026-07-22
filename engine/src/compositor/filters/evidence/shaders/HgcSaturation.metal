===== HgcSaturation =====
//Metal1.0     
//LEN=0000000217
[[ visible ]] FragmentOut HgcSaturation_hgc_visible(const constant float4* hg_Params,
    float4 color0)
{
    const float4 c0 = float4(0.2125000060, 0.7153999805, 0.07209999859, 0.000000000);
    float4 r0, r1;
    FragmentOut output;

    r0 = color0;
    r0 = r0 / float4(fmax(r0.www, 1.00000e-06f), 1.);
    r1.xyz = float3(dot(r0.xyz, c0.xyz));
    r0.xyz = clamp(mix(r1.xyz, r0.xyz, hg_Params[0].xyz), 0.00000f, 1.00000f);
    r0.xyz = r0.xyz*r0.www;
    output.color0 = r0;
    return output;
}
