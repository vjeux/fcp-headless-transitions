//Metal1.0     
//LEN=000000021d
[[ visible ]] FragmentOut HgcChannelMixer_hgc_visible(const constant float4* hg_Params,
    float4 color0)
{
    float4 r0, r1, r2, r3;
    FragmentOut output;

    r0 = color0;
    r1 = r0 / float4(fmax(r0.www, 1.00000e-06f), 1.);
    r2.x = clamp(dot(r1, hg_Params[3]), 0.00000f, 1.00000f);
    r3.w = r2.x;
    r3.z = dot(r1, hg_Params[2]);
    r3.x = dot(r1, hg_Params[0]);
    r3.y = dot(r1, hg_Params[1]);
    r3.xyz = r3.xyz*r2.xxx;
    output.color0 = mix(r0, r3, hg_Params[4]);
    return output;
}


