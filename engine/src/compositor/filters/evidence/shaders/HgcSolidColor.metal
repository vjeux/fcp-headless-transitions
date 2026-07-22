===== HgcSolidColor =====
//Metal1.0     
//LEN=00000000c9
[[ visible ]] FragmentOut HgcSolidColor_hgc_visible(const constant float4* hg_Params)
{
    FragmentOut output;

    output.color0 = hg_Params[0];
    return output;
}
