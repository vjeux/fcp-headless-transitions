//Metal1.0     
//LEN=000000020f
[[ visible ]] FragmentOut HgcTextureScreen_hgc_visible(const constant float4* hg_Params,
    float4 color0,
    float4 color1)
{
    float4 r0, r1;
    FragmentOut output;

    r0 = color0;
    r0 = r0*r0;
    r0.x = dot(r0, hg_Params[1]);
    r1 = color1;
    r1.x = dot(r1, hg_Params[1]);
    r1.x = r1.x*hg_Params[0].x + hg_Params[0].z;
    r1.x = clamp(r0.x*hg_Params[0].y + r1.x, 0.00000f, 1.00000f);
    output.color0.xyz = r1.xxx*r1.www;
    output.color0.w = r1.w;
    return output;
}


