===== HgcPolarToRect =====
//Metal1.0     
//LEN=0000000594
[[ visible ]] FragmentOut HgcPolarToRect_hgc_visible(const constant float4* hg_Params, 
    texture2d< float > hg_Texture0, 
    sampler hg_Sampler0,
    float4 texCoord0)
{
    const float4 c0 = float4(2.000000000, 0.000000000, 0.5000000000, 0.000000000);
    float4 r0, r1, r2;
    FragmentOut output;

    r0.xy = texCoord0.xy*hg_Params[3].xy + hg_Params[2].xy;
    r1.x = r0.x*hg_Params[0].x;
    r1.y = cos(r1.x);
    r1.zw = hg_Params[2].xy + hg_Params[2].xy;
    r1.x = sin(r1.x);
    r1.xy = r0.yy*r1.xy + hg_Params[1].xy;
    r0.zw = r1.xy/r1.zw;
    r2.xy = fract(r0.zw);
    r2.xy = r1.zw*r2.xy;
    r0.xy = floor(r0.zw);
    r0.zw = r0.xy*c0.zz;
    r0.zw = floor(r0.zw);
    r0.xy = -r0.zw*c0.xx + r0.xy;
    r1.zw = r1.zw - r2.xy;
    r1.zw = mix(r2.xy, r1.zw, fabs(r0.xy));
    r0.z = abs(hg_Params[5].z);
    r1.xy = select(r1.zw, r1.xy, -r0.zz < 0.00000f);
    r0.xy = r1.zw - r1.xy;
    r0.xy = float2(c0.zz < fabs(r0.xy));
    r0.z = float(-r0.z >= c0.y);
    r0.x = fmax(r0.x, r0.y);
    r0.y = float(-r0.z >= c0.y);
    r0.x = fmin(r0.y, r0.x);
    r1.xy = select(r1.xy, r1.zw, -r0.xx < 0.00000f);
    r1.xy = r1.xy - hg_Params[2].xy;
    r1.xy = r1.xy*hg_Params[4].xy;
    r1.xy = r1.xy + hg_Params[6].xy;
    r1.xy = r1.xy*hg_Params[6].zw;
    r1 = hg_Texture0.sample(hg_Sampler0, r1.xy);
    output.color0 = select(r1, c0.yyyy, -r0.xxxx < 0.00000f);
    return output;
}
