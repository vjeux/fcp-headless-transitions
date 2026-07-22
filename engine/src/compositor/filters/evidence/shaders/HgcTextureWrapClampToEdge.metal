//Metal1.0     
//LEN=00000002a8
[[ visible ]] FragmentOut HgcTextureWrapClampToEdge_hgc_visible(const constant float4* hg_Params, 
    texture2d< float > hg_Texture0, 
    sampler hg_Sampler0,
    float4 texCoord0)
{
    const float4 c0 = float4(0.5000000000, 0.000000000, 0.000000000, 0.000000000);
    float4 r0, r1;
    FragmentOut output;

    r0.xy = texCoord0.xy - hg_Params[0].zw;
    r1.xy = hg_Params[0].xy - c0.xx;
    r0.xy = fmin(r0.xy, r1.xy);
    r0.xy = fmax(r0.xy, c0.xx);
    r0.xy = r0.xy + hg_Params[0].zw;
    r0.xy = r0.xy + hg_Params[1].xy;
    r0.xy = r0.xy*hg_Params[1].zw;
    output.color0 = hg_Texture0.sample(hg_Sampler0, r0.xy);
    return output;
}
