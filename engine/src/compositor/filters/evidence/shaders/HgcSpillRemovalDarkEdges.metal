===== HgcSpillRemovalDarkEdges =====
//Metal1.0     
//LEN=00000005f4
[[ visible ]] FragmentOut HgcSpillRemovalDarkEdges_hgc_visible(const constant float4* hg_Params,
    float4 color0)
{
    const float4 c0 = float4(8.000000000, 1.000000000, 0.000000000, 0.000000000);
    const float4 c1 = float4(-0.1145000011, -0.3855000138, 0.5000000000, 0.000000000);
    const float4 c2 = float4(0.5016000271, -0.4555999935, -0.04589999840, 0.000000000);
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
    r3.xyz = mix(r3.xyz, r0.xyz, r1.xyz);
    r2.xyz = r0.xyz - r3.xyz;
    r2.xyz = abs(r2.xyz);
    r2.w = dot(r2.xyz, 1.00000f);
    r2.w = clamp(r2.w + r2.w, 0.00000f, 1.00000f);
    r4.x = dot(r3.xyz, c1.xyz);
    r4.y = dot(r3.xyz, c2.xyz);
    r4.w = fmax(r4.x, r4.y);
    r4.w = clamp(r4.w*hg_Params[11].w, 0.00000f, 1.00000f);
    r2.w = r2.w*-r4.w + r2.w;
    r1.xyz = r3.xyz*hg_Params[10].xyz;
    output.color0.xyz = mix(r3.xyz, r1.xyz, r2.www);
    output.color0.w = r0.w;
    return output;
}
