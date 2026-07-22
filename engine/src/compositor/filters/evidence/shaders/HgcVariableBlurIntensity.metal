===== HgcVariableBlurIntensity =====
//Metal1.0     
//LEN=0000000240
[[ visible ]] FragmentOut HgcVariableBlurIntensity_hgc_visible(const constant float4* hg_Params,
    float4 texCoord0)
{
    const float4 c0 = float4(0.000000000, 0.000000000, 0.000000000, 0.000000000);
    float4 r0;
    FragmentOut output;

    r0.zw = c0.zz;
    r0.x = dot(texCoord0, hg_Params[3]);
    r0.y = dot(texCoord0, hg_Params[4]);
    r0 = r0 - hg_Params[0];
    r0.x = dot(r0, r0);
    r0.x = sqrt(r0.x);
    r0.x = r0.x - hg_Params[2].x;
    output.color0 = clamp(r0.xxxx*hg_Params[1], 0.00000f, 1.00000f);
    return output;
}
