===== HgcGradientColorize =====
//Metal1.0     
//LEN=00000006a4
[[ visible ]] FragmentOut HgcGradientColorize_hgc_visible(const constant float4* hg_Params,
    float4 color0, 
    texture2d< float > hg_Texture1, 
    sampler hg_Sampler1)
{
    const float4 c0 = float4(0.9999899864, 0.5000000000, -2.000000000, 1.000000000);
    const float4 c1 = float4(0.000000000, 0.2989999950, 0.5870000124, 0.1140000001);
    float4 r0, r1, r2;
    FragmentOut output;

    r0 = color0;
    r1 = r0 / float4(fmax(r0.www, 1.00000e-06f), 1.);
    r1.x = dot(r1, hg_Params[0]);
    r1.x = c0.x - r1.x;
    r1.x = r1.x*hg_Params[1].x + hg_Params[1].y;
    r1.y = r1.x*c0.y;
    r1.y = fract(r1.y);
    r1.z = -r1.y + c0.y;
    r1.z = fabs(r1.z)*c0.z + c0.w;
    r1.y = select(r1.z, r1.x, hg_Params[2].x < 0.00000f);
    r1.z = fract(r1.x);
    r1.x = abs(r1.x);
    r1.xz = float2(-r1.xz >= c1.xx);
    r1.y = fract(r1.y);
    r1.y = r1.y + r1.z;
    r1.x = r1.y - r1.x;
    r1.x = r1.x*hg_Params[3].x;
    r1.x = fmin(r1.x, hg_Params[3].y);
    r1.x = fmax(r1.x, c1.x);
    r1.x = floor(r1.x);
    r1.y = c0.y;
    r1.x = r1.x + c0.y;
    r1.xy = r1.xy + hg_Params[8].xy;
    r1.xy = r1.xy*hg_Params[8].zw;
    r1 = hg_Texture1.sample(hg_Sampler1, r1.xy);
    r2.x = dot(r1.xyz, c1.yzw);
    r2 = clamp(mix(r2.xxxx, r1, hg_Params[4]), 0.00000f, 1.00000f);
    r2 = select(r1, r2, -hg_Params[6].xxxx < 0.00000f);
    r1.w = dot(r2, hg_Params[5]);
    r1.xyz = mix(r1.www, r2.yzw, hg_Params[4].yzw);
    r2 = r2.yzwx*r0.wwww + -r0;
    r1.xyz = r1.xyz*r0.www;
    r1.w = r0.w;
    r1 = mix(r0, r1, hg_Params[7].xxxx);
    r0 = r2*hg_Params[7].xxxx + r0;
    output.color0 = select(r1, r0, -fabs(hg_Params[6].xxxx) < 0.00000f);
    return output;
}


