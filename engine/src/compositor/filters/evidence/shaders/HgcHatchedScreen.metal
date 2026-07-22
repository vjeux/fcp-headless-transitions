//Metal1.0     
//LEN=0000000363
[[ visible ]] FragmentOut HgcHatchedScreen_hgc_visible(const constant float4* hg_Params,
    float4 color0,
    float4 texCoord1)
{
    const float4 c0 = float4(1.000000000, 0.5000000000, 0.000000000, 0.000000000);
    float4 r0, r1, r2;
    FragmentOut output;

    r0 = texCoord1 + hg_Params[4];
    r0 = r0 - hg_Params[0];
    r0 = r0*hg_Params[5];
    r1.x = dot(r0, hg_Params[1]);
    r1.y = dot(r0, hg_Params[2]);
    r1.xy = fract(r1.xy);
    r0 = color0;
    r2.xy = c0.xx - r1.xy;
    r1.xy = fmin(r2.xy, r1.xy);
    r1.xy = r1.xy + r1.xy;
    r1.y = r1.y*c0.y + c0.y;
    r1.xyz = fmin(r1.xxx, r1.yyy);
    r2.xyz = float3(dot(r0, hg_Params[6]));
    r2.xyz = r2.xyz - r1.xyz;
    r2.xyz = clamp(r2.xyz*hg_Params[3].xyz + c0.yyy, 0.00000f, 1.00000f);
    r0.xyz = r2.xyz*r0.www;
    output.color0 = r0;
    return output;
}


