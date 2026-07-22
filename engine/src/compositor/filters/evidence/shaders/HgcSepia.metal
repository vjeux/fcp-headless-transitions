//Metal1.0     
//LEN=00000002c6
[[ visible ]] FragmentOut HgcSepia_hgc_visible(const constant float4* hg_Params,
    float4 color0)
{
    const float4 c0 = float4(0.2989999950, 0.5870000124, 0.1140000001, 0.2000000030);
    const float4 c1 = float4(1.000000000, 0.9559999704, -0.2720000148, -1.105000019);
    float4 r0, r1, r2;
    FragmentOut output;

    r0 = color0;
    r0 = r0 / float4(fmax(r0.www, 1.00000e-06f), 1.);
    r1.x = dot(r0.xyz, c0.xyz);
    r1.y = r0.w*c0.w;
    r2.x = dot(r1.xy, c1.xy);
    r2.y = dot(r1.xy, c1.xz);
    r2.z = dot(r1.xy, c1.xw);
    r2.xyz = mix(r0.xyz, r2.xyz, hg_Params[0].xyz);
    output.color0.xyz = r2.xyz*r0.www;
    output.color0.w = r0.w;
    return output;
}


