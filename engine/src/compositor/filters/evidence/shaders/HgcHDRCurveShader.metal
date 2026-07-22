//Metal1.0     
//LEN=00000001a2
[[ visible ]] FragmentOut HgcHDRCurveShader_hgc_visible(const constant float4* hg_Params,
    float4 color0)
{
    const float4 c0 = float4(0.000000000, 0.000000000, 0.000000000, 0.000000000);
    float4 r0;
    FragmentOut output;

    r0 = color0;
    r0.xyz = r0.xyz - hg_Params[0].xyz;
    output.color0.w = r0.w;
    output.color0.xyz = fmax(r0.xyz, c0.xxx);
    return output;
}
