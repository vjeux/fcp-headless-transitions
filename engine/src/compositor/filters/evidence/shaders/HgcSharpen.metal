===== HgcSharpen =====
//Metal1.0     
//LEN=00000001a9
[[ visible ]] FragmentOut HgcSharpen_hgc_visible(const constant float4* hg_Params,
    float4 color0,
    float4 color1)
{
    const float4 c0 = float4(0.000000000, 0.000000000, 0.000000000, 0.000000000);
    float4 r0, r1;
    FragmentOut output;

    r0 = color0;
    r1 = color1;
    r1 = r0 - r1;
    r1 = r1*hg_Params[0] + r0;
    output.color0 = fmax(r1, c0.xxxx);
    return output;
}


