//Metal1.0     
//LEN=0000000bd2
[[ visible ]] FragmentOut HgcUnderwaterRefractV2_hgc_visible(const constant float4* hg_Params, 
    texture2d< float > hg_Texture0, 
    sampler hg_Sampler0,
    float4 texCoord0)
{
    const float4 c0 = float4(6.281380177, 1.000000000, 0.000000000, 0.5000000000);
    float4 r0, r1, r2, r3;
    FragmentOut output;

    r0.x = dot(texCoord0, hg_Params[2]);
    r0.w = 1.00000f / r0.x;
    r0.z = 1.00000f / hg_Params[6].z;
    r0.y = dot(texCoord0, hg_Params[1]);
    r0.x = dot(texCoord0, hg_Params[0]);
    r0.xy = r0.xy*r0.ww;
    r1.w = r0.x*r0.z + c0.w;
    r1.z = 1.00000f / hg_Params[7].z;
    r1.z = r0.y*r1.z + c0.w;
    r0.zw = mix(hg_Params[9].xy, hg_Params[9].zw, r1.ww);
    r1.xy = mix(hg_Params[14].xy, hg_Params[14].zw, r1.ww);
    r2.xy = mix(r0.zw, r1.xy, r1.zz);
    r2.xy = r2.xy*c0.xx;
    r1.xy = mix(hg_Params[10].xy, hg_Params[10].zw, r1.ww);
    r0.zw = mix(hg_Params[15].xy, hg_Params[15].zw, r1.ww);
    r0.zw = mix(r1.xy, r0.zw, r1.zz);
    r2.z = sin(r2.x);
    r2.x = r0.z*c0.x;
    r1.x = sin(r2.y);
    r1.y = r1.x*hg_Params[20].y;
    r2.y = sin(r2.x);
    r0.z = r0.w*c0.x;
    r1.y = r2.z*hg_Params[19].y + r1.y;
    r2.w = r1.x*hg_Params[20].x;
    r0.w = r2.y*hg_Params[21].y + r1.y;
    r2.x = sin(r0.z);
    r3.x = r2.x*hg_Params[22].y + r0.w;
    r1.xy = mix(hg_Params[11].xy, hg_Params[11].zw, r1.ww);
    r0.zw = mix(hg_Params[16].xy, hg_Params[16].zw, r1.ww);
    r0.zw = mix(r1.xy, r0.zw, r1.zz);
    r2.z = r2.z*hg_Params[19].x + r2.w;
    r1.x = r2.y*hg_Params[21].x + r2.z;
    r1.y = r2.x*hg_Params[22].x + r1.x;
    r0.zw = r0.zw*c0.xx;
    r1.x = sin(r0.z);
    r2.xy = mix(hg_Params[12].xy, hg_Params[12].zw, r1.ww);
    r0.z = r1.x*hg_Params[23].x + r1.y;
    r2.z = r1.x*hg_Params[23].y + r3.x;
    r1.xy = mix(hg_Params[17].xy, hg_Params[17].zw, r1.ww);
    r1.xy = mix(r2.xy, r1.xy, r1.zz);
    r2.y = r1.x*c0.x;
    r0.w = sin(r0.w);
    r2.x = r0.w*hg_Params[24].y + r2.z;
    r2.z = r0.w*hg_Params[24].x + r0.z;
    r1.x = r1.y*c0.x;
    r2.y = sin(r2.y);
    r1.y = r2.y*hg_Params[25].y + r2.x;
    r2.x = sin(r1.x);
    r2.w = r2.x*hg_Params[26].y + r1.y;
    r1.xy = mix(hg_Params[13].xy, hg_Params[13].zw, r1.ww);
    r0.zw = mix(hg_Params[18].xy, hg_Params[18].zw, r1.ww);
    r0.zw = mix(r1.xy, r0.zw, r1.zz);
    r3.w = r2.y*hg_Params[25].x + r2.z;
    r0.zw = r0.zw*c0.xx;
    r0.zw = sin(r0.zw);
    r3.x = r2.x*hg_Params[26].x + r3.w;
    r3.x = r0.z*hg_Params[27].x + r3.x;
    r3.x = r0.w*hg_Params[28].x + r3.x;
    r0.x = r3.x*hg_Params[8].x + r0.x;
    r0.z = r0.z*hg_Params[27].y + r2.w;
    r1.x = r0.w*hg_Params[28].y + r0.z;
    r0.y = r1.x*hg_Params[8].y + r0.y;
    r0.w = c0.y;
    r3.x = dot(r0.xyw, hg_Params[5].xyz);
    r3.z = 1.00000f / r3.x;
    r3.y = dot(r0.xyw, hg_Params[4].xyz);
    r3.x = dot(r0.xyw, hg_Params[3].xyz);
    r3.xy = r3.xy*r3.zz;
    r3.xy = r3.xy + hg_Params[29].xy;
    r3.xy = r3.xy*hg_Params[29].zw;
    output.color0 = hg_Texture0.sample(hg_Sampler0, r3.xy);
    return output;
}
