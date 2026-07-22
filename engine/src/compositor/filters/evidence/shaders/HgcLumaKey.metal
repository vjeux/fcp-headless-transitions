===== HgcLumaKey =====
//Metal1.0     
//LEN=00000003f6
[[ visible ]] FragmentOut HgcLumaKey_hgc_visible(const constant float4* hg_Params,
    float4 color0)
{
    const float4 c0 = float4(0.000000000, 1.000000000, 0.000000000, 0.000000000);
    float4 r0, r1, r2, r3, r4;
    FragmentOut output;

    r0 = color0;
    r0 = r0 / float4(fmax(r0.www, 1.00000e-06f), 1.);
    r1.xz = float2(dot(r0.xyz, hg_Params[0].xyz));
    r2.x = hg_Params[2].y - hg_Params[2].x;
    r2.xz = 1.00000f / r2.xx;
    r3.xz = r1.xz - hg_Params[2].xx;
    r3.xz = r3.xz*r2.xz;
    r2.xz = float2(r1.xz >= hg_Params[2].xx);
    r2.xz = r2.xz*r3.xz;
    r3.xz = float2(r1.xz >= hg_Params[2].yy);
    r2.x = clamp(r2.x + r3.x, 0.00000f, 1.00000f);
    r2.y = c0.y - r2.x;
    r4.z = c0.y - hg_Params[2].y;
    r4.z = float(r1.z < r4.z);
    r2.z = clamp(r3.z*r4.z + r2.z, 0.00000f, 1.00000f);
    r2.w = c0.y - r2.z;
    r2.w = dot(r2, hg_Params[1]);
    r2.w = r2.w*r0.w;
    output.color0.xyz = r0.xyz*r2.www;
    output.color0.w = r2.w;
    return output;
}
