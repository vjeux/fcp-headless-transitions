//Metal1.0     
//LEN=0000000316
[[ visible ]] FragmentOut HgcYIQAdjust_hgc_visible(const constant float4* hg_Params,
    float4 color0)
{
    const float4 c0 = float4(1.000000000, 0.9559999704, 0.6209999919, 0.000000000);
    const float4 c1 = float4(1.000000000, -0.2720000148, -0.6470000148, 0.000000000);
    const float4 c2 = float4(1.000000000, -1.105000019, 1.702000022, 0.000000000);
    float4 r0, r1;
    FragmentOut output;

    r0 = color0;
    r0 = clamp(r0 / float4(fmax(r0.www, 1.00000e-06f), 1.), 0.00000f, 1.00000f);
    r1.x = dot(c0.xyz, hg_Params[0].xyz);
    r1.y = dot(c1.xyz, hg_Params[0].xyz);
    r1.z = dot(c2.xyz, hg_Params[0].xyz);
    r0.xyz = clamp(r0.xyz + r1.xyz, 0.00000f, 1.00000f);
    r0.xyz = r0.xyz*r0.www;
    output.color0 = r0;
    return output;
}


