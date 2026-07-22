//Metal1.0     
//LEN=00000002db
[[ visible ]] FragmentOut HgcStripes_hgc_visible(const constant float4* hg_Params,
    float4 texCoord0)
{
    const float4 c0 = float4(-0.2500000000, 1.000000000, -2.000000000, 3.000000000);
    float4 r0, r1;
    FragmentOut output;

    r0.x = texCoord0.x - hg_Params[0].x;
    r0.x = r0.x*hg_Params[4].x;
    r0.x = r0.x*hg_Params[3].x + c0.x;
    r0.x = fract(r0.x);
    r1.x = c0.y - r0.x;
    r0.x = fmin(r1.x, r0.x);
    r0.x = clamp(r0.x*hg_Params[3].y + hg_Params[3].z, 0.00000f, 1.00000f);
    r1.x = r0.x*r0.x;
    r0.x = r0.x*c0.z + c0.w;
    r1.x = r1.x*r0.x;
    r1 = mix(hg_Params[2], hg_Params[1], r1.xxxx);
    r1.xyz = r1.xyz*r1.www;
    output.color0 = r1;
    return output;
}


