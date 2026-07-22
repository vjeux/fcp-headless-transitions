===== HgcCopyAlpha =====
//Metal1.0     
//LEN=0000000147
[[ visible ]] FragmentOut HgcCopyAlpha_hgc_visible(const constant float4* hg_Params,
    float4 color0,
    float4 color1)
{
    float4 r0, r1;
    FragmentOut output;

    r0 = color0;
    r1.w = color1.w;
    output.color0 = select(r0, r1.wwww, hg_Params[0] < 0.00000f);
    return output;
}
