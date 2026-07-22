//Metal1.0     
//LEN=00000001d0
[[ visible ]] FragmentOut HgcPrism_hgc_visible(const constant float4* hg_Params,
    float4 color0,
    float4 color1,
    float4 color2)
{
    float4 r0, r1, r2;
    FragmentOut output;

    r0.xw = color0.xw;
    r1.yw = color1.yw;
    r2.zw = color2.zw;
    output.color0.x = r0.x;
    output.color0.y = r1.y;
    output.color0.z = r2.z;
    r0.w = fmax(r0.w, r1.w);
    output.color0.w = fmax(r0.w, r2.w);
    return output;
}


