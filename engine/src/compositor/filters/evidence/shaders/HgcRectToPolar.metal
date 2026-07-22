===== HgcRectToPolar =====
//Metal1.0     
//LEN=00000006a7
[[ visible ]] FragmentOut HgcRectToPolar_hgc_visible(const constant float4* hg_Params, 
    texture2d< float > hg_Texture0, 
    sampler hg_Sampler0,
    float4 texCoord0)
{
    const float4 c0 = float4(-0.01348046958, 0.05747731403, 0.000000000, -0.1212390736);
    const float4 c1 = float4(0.1956359297, -0.3329946101, 0.9999956489, 1.570796371);
    const float4 c2 = float4(6.283185482, 3.141592741, 0.000000000, 0.000000000);
    float4 r0, r1, r2;
    FragmentOut output;

    r0.xy = texCoord0.xy*hg_Params[4].xy;
    r0.zw = c0.zz;
    r0 = r0 + hg_Params[6];
    r0 = r0 - hg_Params[1];
    r1.xy = abs(r0.xy);
    r1.z = fmax(r1.x, r1.y);
    r1.w = 1.00000f / r1.z;
    r1.z = fmin(r1.x, r1.y);
    r1.z = r1.z*r1.w;
    r1.w = r1.z*r1.z;
    r2.x = r1.w*c0.x + c0.y;
    r2.x = r2.x*r1.w + c0.w;
    r2.x = r2.x*r1.w + c1.x;
    r2.x = r2.x*r1.w + c1.y;
    r1.w = r2.x*r1.w + c1.z;
    r1.z = r1.w*r1.z;
    r1.x = r1.y - r1.x;
    r1.w = -r1.z + c1.w;
    r1.x = select(r1.z, r1.w, r1.x < 0.00000f);
    r1.y = -r1.x + c2.y;
    r1.x = select(r1.x, r1.y, r0.y < 0.00000f);
    r1.x = select(r1.x, -r1.x, r0.x < 0.00000f);
    r0.x = dot(r0, r0);
    r1.y = r1.x + c2.x;
    r1.x = select(r1.x, r1.y, r1.x < 0.00000f);
    r1.x = r1.x*hg_Params[0].x;
    r1.y = float(r1.x < hg_Params[6].x);
    r0.y = select(r1.x, hg_Params[2].y, -r1.y < 0.00000f);
    r0.w = sqrt(r0.x);
    r0.z = select(r0.y, r1.x, hg_Params[3].z < 0.00000f);
    r0.xy = r0.zw - hg_Params[6].xy;
    r0.xy = r0.xy*hg_Params[5].xy;
    r0.xy = r0.xy + hg_Params[7].xy;
    r0.xy = r0.xy*hg_Params[7].zw;
    output.color0 = hg_Texture0.sample(hg_Sampler0, r0.xy);
    return output;
}
