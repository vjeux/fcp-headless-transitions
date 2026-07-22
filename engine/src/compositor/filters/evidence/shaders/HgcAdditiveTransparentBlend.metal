//Metal1.0     
//LEN=00000001f3
[[ visible ]] FragmentOut HgcAdditiveTransparentBlend_hgc_visible(const constant float4* hg_Params,
    float4 color0,
    float4 color1)
{
    const float4 c0 = float4(1.000000000, 0.000000000, 0.000000000, 0.000000000);
    float4 r0, r1;
    FragmentOut output;

    r0 = color1;
    r1 = color0;
    output.color0.xyz = r0.xyz + r1.xyz;
    r0.x = -r0.w*hg_Params[0].x + c0.x;
    r0.y = r1.w - c0.x;
    output.color0.w = r0.y*r0.x + c0.x;
    return output;
}
