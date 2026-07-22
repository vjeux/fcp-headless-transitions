//Metal1.0     
//LEN=0000000208
[[ visible ]] FragmentOut HgcColorize_hgc_visible(const constant float4* hg_Params,
    float4 color0)
{
    float4 r0, r1, r2;
    FragmentOut output;

    r0 = color0;
    r1.xyz = r0.xyz / fmax(r0.w, 1.00000e-06f);
    r1.w = dot(r1.xyz, hg_Params[4].xyz);
    r2.xyz = mix(hg_Params[0].xyz, hg_Params[1].xyz, r1.www);
    r1.xyz = mix(r1.xyz, r2.xyz, hg_Params[2].xyz);
    r1.w = r0.w;
    r1.xyz = r1.xyz*r0.www;
    output.color0 = mix(r0, r1, hg_Params[3]);
    return output;
}


