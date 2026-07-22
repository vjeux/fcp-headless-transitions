//Metal1.0     
//LEN=000000018b
[[ visible ]] FragmentOut HgcGamma_hgc_visible(const constant float4* hg_Params,
    float4 color0)
{
    float4 r0, r1;
    FragmentOut output;

    r0 = color0;
    r0 = r0 / float4(fmax(r0.www, 1.00000e-06f), 1.);
    r1 = pow(r0, hg_Params[0]);
    r0 = select(r1, r0, r0 < 0.00000f);
    r0.xyz = r0.xyz*r0.www;
    output.color0 = r0;
    return output;
}


