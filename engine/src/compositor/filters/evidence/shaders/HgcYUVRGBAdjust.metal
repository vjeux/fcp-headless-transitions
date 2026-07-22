===== HgcYUVRGBAdjust =====
//Metal1.0     
//LEN=00000002c0
[[ visible ]] FragmentOut HgcYUVRGBAdjust_hgc_visible(const constant float4* hg_Params,
    float4 color0)
{
    const float4 c0 = float4(1.000000000, 1.139999986, -0.3939999938, -0.5809999704);
    const float4 c1 = float4(1.000000000, 2.028000116, 0.000000000, 0.000000000);
    float4 r0, r1;
    FragmentOut output;

    r0 = color0;
    r0 = clamp(r0 / float4(fmax(r0.www, 1.00000e-06f), 1.), 0.00000f, 1.00000f);
    r1.x = dot(c0.xy, hg_Params[0].xz);
    r1.y = dot(c0.xzw, hg_Params[0].xyz);
    r1.z = dot(c1.xy, hg_Params[0].xy);
    r0.xyz = clamp(r0.xyz + r1.xyz, 0.00000f, 1.00000f);
    r0.xyz = r0.xyz*r0.www;
    output.color0 = r0;
    return output;
}
