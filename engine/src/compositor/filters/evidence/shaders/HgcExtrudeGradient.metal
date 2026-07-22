===== HgcExtrudeGradient =====
//Metal1.0     
//LEN=0000000181
[[ visible ]] FragmentOut HgcExtrudeGradient_hgc_visible(const constant float4* hg_Params, 
    texture2d< float > hg_Texture0, 
    sampler hg_Sampler0,
    float4 color,
    float4 texCoord0)
{
    float4 r0;
    FragmentOut output;

    r0.w = hg_Texture0.sample(hg_Sampler0, texCoord0.xy).w;
    output.color0 = color*r0.wwww;
    return output;
}
