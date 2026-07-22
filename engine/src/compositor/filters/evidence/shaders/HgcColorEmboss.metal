//Metal1.0     
//LEN=0000000575
[[ visible ]] FragmentOut HgcColorEmboss_hgc_visible(const constant float4* hg_Params, 
    texture2d< float > hg_Texture0, 
    sampler hg_Sampler0,
    float4 texCoord0,
    float4 texCoord1)
{
    const float4 c0 = float4(0.5000000000, 0.000000000, 0.000000000, 0.000000000);
    float4 r0, r1, r2, r3, r4, r5;
    FragmentOut output;

    r0.x = hg_Params[2].x + c0.x;
    r1.x = hg_Params[2].z - c0.x;
    r2.y = hg_Params[2].y + c0.x;
    r3.y = hg_Params[2].w - c0.x;
    r4.xy = texCoord1.xy + hg_Params[0].xy;
    r4.x = fmax(r4.x, r0.x);
    r4.y = fmax(r4.y, r2.y);
    r4.x = fmin(r4.x, r1.x);
    r4.y = fmin(r4.y, r3.y);
    r4.xy = r4.xy + hg_Params[3].xy;
    r4.xy = r4.xy*hg_Params[3].zw;
    r4 = hg_Texture0.sample(hg_Sampler0, r4.xy);
    r4 = r4 / float4(fmax(r4.www, 1.00000e-06f), 1.);
    r5.xy = texCoord1.xy + hg_Params[1].xy;
    r5.x = fmax(r5.x, r0.x);
    r5.y = fmax(r5.y, r2.y);
    r5.x = fmin(r5.x, r1.x);
    r5.y = fmin(r5.y, r3.y);
    r5.xy = r5.xy + hg_Params[3].xy;
    r5.xy = r5.xy*hg_Params[3].zw;
    r5 = hg_Texture0.sample(hg_Sampler0, r5.xy);
    r5 = r5 / float4(fmax(r5.www, 1.00000e-06f), 1.);
    r0 = hg_Texture0.sample(hg_Sampler0, texCoord0.xy);
    r0 = r0 / float4(fmax(r0.www, 1.00000e-06f), 1.);
    r4 = r4 - r5;
    r4 = r4 + r0;
    r4.xyz = r4.xyz*r4.www;
    output.color0 = r4;
    return output;
}


