//Metal1.0     
//LEN=00000004b4
[[ visible ]] FragmentOut HgcIndent_hgc_visible(const constant float4* hg_Params,
    float4 color0, 
    texture2d< float > hg_Texture1, 
    sampler hg_Sampler1,
    float4 texCoord1,
    float4 texCoord2,
    float4 texCoord3,
    float4 texCoord4)
{
    float4 r0, r1, r2, r3;
    FragmentOut output;

    r0 = hg_Texture1.sample(hg_Sampler1, texCoord1.xy);
    r1 = hg_Texture1.sample(hg_Sampler1, texCoord2.xy);
    r2 = hg_Texture1.sample(hg_Sampler1, texCoord3.xy);
    r3 = hg_Texture1.sample(hg_Sampler1, texCoord4.xy);
    r1 = r1 - r0;
    r1.x = dot(hg_Params[1], r1);
    r3 = r3 - r2;
    r1.y = dot(hg_Params[1], r3);
    r1.z = hg_Params[6].z;
    r1.xyz = normalize(r1.xyz).xyz;
    r0.x = clamp(dot(r1.xyz, hg_Params[0].xyz), 0.00000f, 1.00000f);
    r0.x = r0.x*hg_Params[2].x + hg_Params[7].x;
    r1.x = clamp(dot(r1.xyz, hg_Params[5].xyz), 0.00000f, 1.00000f);
    r1.x = pow(r1.x, hg_Params[3].x);
    r1.x = clamp(r1.x*hg_Params[4].x, 0.00000f, 1.00000f);
    r2 = color0;
    r3.xyz = r2.xyz / fmax(r2.w, 1.00000e-06f);
    r3.xyz = r3.xyz*r0.xxx + r1.xxx;
    output.color0.xyz = r3.xyz*r2.www;
    output.color0.w = r2.w;
    return output;
}


