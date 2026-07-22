===== HgcAlphaMult =====
//Metal1.0     
//LEN=0000000146
[[ visible ]] FragmentOut HgcAlphaMult_hgc_visible(const constant float4* hg_Params,
    float4 color0,
    float4 color1)
{
    float4 r0, r1;
    FragmentOut output;

    r0 = color0;
    r1.w = color1.w;
    output.color0.xyz = r0.xyz;
    output.color0.w = r0.w*r1.w;
    return output;
}
