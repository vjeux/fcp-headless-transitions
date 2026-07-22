//Metal1.0     
//LEN=0000000492
[[ visible ]] FragmentOut HgcHalftone_hgc_visible(const constant float4* hg_Params,
    float4 color0,
    float4 texCoord1)
{
    const float4 c0 = float4(0.000000000, 0.5000000000, 2.000000000, 3.000000000);
    const float4 c1 = float4(0.000000000, 1.000000000, 0.000000000, 0.000000000);
    float4 r0, r1, r2, r3;
    FragmentOut output;

    r0 = texCoord1 - hg_Params[0];
    r0 = r0*hg_Params[4];
    r1.x = dot(r0, hg_Params[1]);
    r1.y = dot(r0, hg_Params[2]);
    r1.xy = r1.xy + hg_Params[0].xy;
    r1.xy = fract(r1.xy);
    r0 = color0;
    r2 = r1.xxyy - c0.xyxy;
    r2 = clamp(r2 + r2, 0.00000f, 1.00000f);
    r3 = -r2*c0.zzzz + c0.wwww;
    r2 = r2*r2;
    r2 = r2*r3;
    r2.yw = -r2.yw;
    r2 = r2*c0.yyyy + c0.xyxy;
    r1 = float4(r1.xxyy < c0.yyyy);
    r1.yw = -r1.yw;
    r1 = r1 + c1.xyxy;
    r1 = r2*r1;
    r3.xyz = float3(dot(r0, hg_Params[5]));
    r1.xyz = float3(dot(r1, 1.00000f));
    r3.xyz = r3.xyz - r1.xyz;
    r3.xyz = clamp(r3.xyz*hg_Params[3].xyz + c0.yyy, 0.00000f, 1.00000f);
    r3.xyz = r3.xyz*r0.www;
    r3.w = r0.w;
    output.color0 = mix(r0, r3, hg_Params[6]);
    return output;
}


