//Metal1.0     
//LEN=0000000235
[[ visible ]] FragmentOut HgcPosterize_hgc_visible(const constant float4* hg_Params,
    float4 color0)
{
    const float4 c0 = float4(1.000000000, 0.000000000, 0.000000000, 0.000000000);
    float4 r0, r1;
    FragmentOut output;

    r0 = color0;
    r0 = r0 / float4(fmax(r0.www, 1.00000e-06f), 1.);
    r0 = r0*hg_Params[0];
    r0 = floor(r0);
    r1 = hg_Params[0] - c0.xxxx;
    r0 = fmin(r1, r0);
    r0 = fmax(r0, c0.yyyy);
    r0 = r0*hg_Params[1];
    r0.xyz = r0.xyz*r0.www;
    output.color0 = r0;
    return output;
}


