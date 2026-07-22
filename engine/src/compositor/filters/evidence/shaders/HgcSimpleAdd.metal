===== HgcSimpleAdd =====
//Metal1.0     
//LEN=000000011e
[[ visible ]] FragmentOut HgcSimpleAdd_hgc_visible(const constant float4* hg_Params,
    float4 color0,
    float4 color1)
{
    float4 r0, r1;
    FragmentOut output;

    r0 = color1;
    r1 = color0;
    output.color0 = r1 + r0;
    return output;
}
