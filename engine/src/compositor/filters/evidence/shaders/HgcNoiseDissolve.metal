//Metal1.0     
//LEN=00000001c1
[[ visible ]] FragmentOut HgcNoiseDissolve_hgc_visible(const constant float4* hg_Params,
    float4 color0,
    float4 color1)
{
    float4 r0, r1;
    FragmentOut output;

    r0 = color0;
    r1.x = color1.x;
    r0 = r0 / float4(fmax(r0.www, 1.00000e-06f), 1.);
    r1 = float4(r1.xxxx >= hg_Params[0]);
    r1 = r0.wwww*r1;
    output.color0.xyz = r0.xyz*r1.xyz;
    output.color0.w = r1.w;
    return output;
}


