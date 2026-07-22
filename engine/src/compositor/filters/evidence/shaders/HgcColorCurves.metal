//Metal1.0     
//LEN=00000015af
[[ visible ]] FragmentOut HgcColorCurves_hgc_visible(const constant float4* hg_Params,
    float4 color0, 
    texture2d< float > hg_Texture1, 
    sampler hg_Sampler1, 
    texture2d< float > hg_Texture2, 
    sampler hg_Sampler2, 
    texture2d< float > hg_Texture3, 
    sampler hg_Sampler3, 
    texture2d< float > hg_Texture4, 
    sampler hg_Sampler4)
{
    const float4 c0 = float4(0.5000000000, 0.000000000, 0.000000000, 0.000000000);
    float4 r0, r1, r2, r3, r4, r5;
    FragmentOut output;

    r0 = color0;
    r1.xyz = r0.xyz;
    r2.xyz = float3(dot(r1.xyz, hg_Params[4].xyz));
    r3.x = fmax(r2.x, hg_Params[10].x);
    r3.x = fmin(r3.x, hg_Params[11].x);
    r3.x = r3.x*hg_Params[18].x;
    r3.x = fmax(r3.x, c0.x);
    r4.x = hg_Params[18].x - c0.x;
    r3.x = fmin(r3.x, r4.x);
    r3.y = c0.x;
    r3.x = hg_Texture1.sample(hg_Sampler1, r3.xy).x;
    r4.xyz = r2.xyz - hg_Params[11].xxx;
    r4.xyz = fmax(r4.xyz, c0.yyy);
    r4.xyz = r4.xyz*hg_Params[11].zzz + hg_Params[11].yyy;
    r5.xyz = r2.xyz - hg_Params[11].xxx;
    r5.xyz = select(r4.xyz, r3.xxx, r5.xyz < 0.00000f);
    r3.xyz = r2.xyz - hg_Params[10].xxx;
    r3.xyz = fmin(r3.xyz, c0.yyy);
    r3.xyz = r3.xyz*hg_Params[10].zzz + hg_Params[10].yyy;
    r4.xyz = r2.xyz - hg_Params[10].xxx;
    r5.xyz = select(r5.xyz, r3.xyz, r4.xyz < 0.00000f);
    r5.xyz = r5.xyz - r2.xyz;
    r1.xyz = r1.xyz + r5.xyz;
    r4.xyz = r1.xyz;
    r1.x = dot(r1.xyz, hg_Params[4].xyz);
    r3.xyz = fmax(r4.xyz, hg_Params[12].xxx);
    r3.xyz = fmin(r3.xyz, hg_Params[13].xxx);
    r2.x = r3.x*hg_Params[19].x;
    r2.x = fmax(r2.x, c0.x);
    r5.x = hg_Params[19].x - c0.x;
    r2.x = fmin(r2.x, r5.x);
    r2.y = c0.x;
    r3.x = hg_Texture2.sample(hg_Sampler2, r2.xy).x;
    r5.x = r3.y*hg_Params[19].x;
    r5.x = fmax(r5.x, c0.x);
    r2.x = hg_Params[19].x - c0.x;
    r5.x = fmin(r5.x, r2.x);
    r5.y = c0.x;
    r5.x = hg_Texture2.sample(hg_Sampler2, r5.xy).x;
    r3.y = r5.x;
    r2.x = r3.z*hg_Params[19].x;
    r2.x = fmax(r2.x, c0.x);
    r5.x = hg_Params[19].x - c0.x;
    r2.x = fmin(r2.x, r5.x);
    r2.y = c0.x;
    r2.x = hg_Texture2.sample(hg_Sampler2, r2.xy).x;
    r3.z = r2.x;
    r5.xyz = r4.xyz - hg_Params[13].xxx;
    r5.xyz = fmax(r5.xyz, c0.yyy);
    r5.xyz = r5.xyz*hg_Params[13].zzz + hg_Params[13].yyy;
    r2.xyz = r4.xyz - hg_Params[13].xxx;
    r2.xyz = select(r5.xyz, r3.xyz, r2.xyz < 0.00000f);
    r3.xyz = r4.xyz - hg_Params[12].xxx;
    r3.xyz = fmin(r3.xyz, c0.yyy);
    r3.xyz = r3.xyz*hg_Params[12].zzz + hg_Params[12].yyy;
    r5.xyz = r4.xyz - hg_Params[12].xxx;
    r2.xyz = select(r2.xyz, r3.xyz, r5.xyz < 0.00000f);
    r4.xyz = mix(r4.xyz, r2.xyz, hg_Params[0].xyz);
    r5.xyz = fmax(r4.xyz, hg_Params[14].xxx);
    r5.xyz = fmin(r5.xyz, hg_Params[15].xxx);
    r3.x = r5.x*hg_Params[20].x;
    r3.x = fmax(r3.x, c0.x);
    r2.x = hg_Params[20].x - c0.x;
    r3.x = fmin(r3.x, r2.x);
    r3.y = c0.x;
    r5.x = hg_Texture3.sample(hg_Sampler3, r3.xy).x;
    r2.x = r5.y*hg_Params[20].x;
    r2.x = fmax(r2.x, c0.x);
    r3.x = hg_Params[20].x - c0.x;
    r2.x = fmin(r2.x, r3.x);
    r2.y = c0.x;
    r2.x = hg_Texture3.sample(hg_Sampler3, r2.xy).x;
    r5.y = r2.x;
    r3.x = r5.z*hg_Params[20].x;
    r3.x = fmax(r3.x, c0.x);
    r2.x = hg_Params[20].x - c0.x;
    r3.x = fmin(r3.x, r2.x);
    r3.y = c0.x;
    r3.x = hg_Texture3.sample(hg_Sampler3, r3.xy).x;
    r5.z = r3.x;
    r2.xyz = r4.xyz - hg_Params[15].xxx;
    r2.xyz = fmax(r2.xyz, c0.yyy);
    r2.xyz = r2.xyz*hg_Params[15].zzz + hg_Params[15].yyy;
    r3.xyz = r4.xyz - hg_Params[15].xxx;
    r3.xyz = select(r2.xyz, r5.xyz, r3.xyz < 0.00000f);
    r5.xyz = r4.xyz - hg_Params[14].xxx;
    r5.xyz = fmin(r5.xyz, c0.yyy);
    r5.xyz = r5.xyz*hg_Params[14].zzz + hg_Params[14].yyy;
    r2.xyz = r4.xyz - hg_Params[14].xxx;
    r3.xyz = select(r3.xyz, r5.xyz, r2.xyz < 0.00000f);
    r4.xyz = mix(r4.xyz, r3.xyz, hg_Params[1].xyz);
    r2.xyz = fmax(r4.xyz, hg_Params[16].xxx);
    r2.xyz = fmin(r2.xyz, hg_Params[17].xxx);
    r5.x = r2.x*hg_Params[21].x;
    r5.x = fmax(r5.x, c0.x);
    r3.x = hg_Params[21].x - c0.x;
    r5.x = fmin(r5.x, r3.x);
    r5.y = c0.x;
    r2.x = hg_Texture4.sample(hg_Sampler4, r5.xy).x;
    r3.x = r2.y*hg_Params[21].x;
    r3.x = fmax(r3.x, c0.x);
    r5.x = hg_Params[21].x - c0.x;
    r3.x = fmin(r3.x, r5.x);
    r3.y = c0.x;
    r3.x = hg_Texture4.sample(hg_Sampler4, r3.xy).x;
    r2.y = r3.x;
    r5.x = r2.z*hg_Params[21].x;
    r5.x = fmax(r5.x, c0.x);
    r3.x = hg_Params[21].x - c0.x;
    r5.x = fmin(r5.x, r3.x);
    r5.y = c0.x;
    r5.x = hg_Texture4.sample(hg_Sampler4, r5.xy).x;
    r2.z = r5.x;
    r3.xyz = r4.xyz - hg_Params[17].xxx;
    r3.xyz = fmax(r3.xyz, c0.yyy);
    r3.xyz = r3.xyz*hg_Params[17].zzz + hg_Params[17].yyy;
    r5.xyz = r4.xyz - hg_Params[17].xxx;
    r5.xyz = select(r3.xyz, r2.xyz, r5.xyz < 0.00000f);
    r2.xyz = r4.xyz - hg_Params[16].xxx;
    r2.xyz = fmin(r2.xyz, c0.yyy);
    r2.xyz = r2.xyz*hg_Params[16].zzz + hg_Params[16].yyy;
    r3.xyz = r4.xyz - hg_Params[16].xxx;
    r5.xyz = select(r5.xyz, r2.xyz, r3.xyz < 0.00000f);
    r5.xyz = mix(r4.xyz, r5.xyz, hg_Params[2].xyz);
    r3.x = dot(r5.xyz, hg_Params[4].xyz);
    r3.x = select(r3.x, r1.x, hg_Params[3].x < 0.00000f);
    r3.y = dot(r5.xyz, hg_Params[5].xyz);
    r3.z = dot(r5.xyz, hg_Params[6].xyz);
    r2.x = dot(r3.xyz, hg_Params[7].xyz);
    r2.y = dot(r3.xyz, hg_Params[8].xyz);
    r2.z = dot(r3.xyz, hg_Params[9].xyz);
    r2.w = r0.w;
    output.color0 = r2;
    return output;
}


