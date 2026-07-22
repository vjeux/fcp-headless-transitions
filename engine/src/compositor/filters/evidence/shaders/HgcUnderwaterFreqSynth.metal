//Metal1.0     
//LEN=0000000dd8
[[ visible ]] FragmentOut HgcUnderwaterFreqSynth_hgc_visible(const constant float4* hg_Params, 
    texture2d< float > hg_Texture0, 
    sampler hg_Sampler0,
    float4 texCoord0)
{
    const float4 c0 = float4(0.03125000000, 0.5000000000, 32.00000000, -16.00000000);
    const float4 c1 = float4(2.000000000, -1.000000000, 256.0000000, -0.003906250000);
    const float4 c2 = float4(0.000000000, 0.000000000, 0.000000000, 0.000000000);
    float4 r0, r1, r2, r3;
    FragmentOut output;

    r0.xy = texCoord0.xy*c0.xx + c0.yy;
    r1.xy = mix(hg_Params[12].xy, hg_Params[12].zw, r0.xx);
    r2.xy = mix(hg_Params[18].xy, hg_Params[18].zw, r0.xx);
    r2.xy = mix(r1.xy, r2.xy, r0.yy);
    r2.xy = fract(r2.xy);
    r2.xy = r2.xy*c0.zz + c0.ww;
    r2.xy = r2.xy + hg_Params[24].xy;
    r2.xy = r2.xy*hg_Params[24].zw;
    r2.xy = hg_Texture0.sample(hg_Sampler0, r2.xy).xy;
    r2.xy = r2.xy*c1.xx + c1.yy;
    r1.xy = r2.xx*hg_Params[0].xy;
    r1.xy = r2.yy*hg_Params[1].xy + r1.xy;
    r2.xy = mix(hg_Params[13].xy, hg_Params[13].zw, r0.xx);
    r3.xy = mix(hg_Params[19].xy, hg_Params[19].zw, r0.xx);
    r3.xy = mix(r2.xy, r3.xy, r0.yy);
    r3.xy = fract(r3.xy);
    r3.xy = r3.xy*c0.zz + c0.ww;
    r3.xy = r3.xy + hg_Params[24].xy;
    r3.xy = r3.xy*hg_Params[24].zw;
    r3.xy = hg_Texture0.sample(hg_Sampler0, r3.xy).xy;
    r3.xy = r3.xy*c1.xx + c1.yy;
    r1.xy = r3.xx*hg_Params[2].xy + r1.xy;
    r1.xy = r3.yy*hg_Params[3].xy + r1.xy;
    r2.xy = mix(hg_Params[14].xy, hg_Params[14].zw, r0.xx);
    r3.xy = mix(hg_Params[20].xy, hg_Params[20].zw, r0.xx);
    r3.xy = mix(r2.xy, r3.xy, r0.yy);
    r3.xy = fract(r3.xy);
    r3.xy = r3.xy*c0.zz + c0.ww;
    r3.xy = r3.xy + hg_Params[24].xy;
    r3.xy = r3.xy*hg_Params[24].zw;
    r3.xy = hg_Texture0.sample(hg_Sampler0, r3.xy).xy;
    r3.xy = r3.xy*c1.xx + c1.yy;
    r1.xy = r3.xx*hg_Params[4].xy + r1.xy;
    r1.xy = r3.yy*hg_Params[5].xy + r1.xy;
    r2.xy = mix(hg_Params[15].xy, hg_Params[15].zw, r0.xx);
    r3.xy = mix(hg_Params[21].xy, hg_Params[21].zw, r0.xx);
    r3.xy = mix(r2.xy, r3.xy, r0.yy);
    r3.xy = fract(r3.xy);
    r3.xy = r3.xy*c0.zz + c0.ww;
    r3.xy = r3.xy + hg_Params[24].xy;
    r3.xy = r3.xy*hg_Params[24].zw;
    r3.xy = hg_Texture0.sample(hg_Sampler0, r3.xy).xy;
    r3.xy = r3.xy*c1.xx + c1.yy;
    r1.xy = r3.xx*hg_Params[6].xy + r1.xy;
    r1.xy = r3.yy*hg_Params[7].xy + r1.xy;
    r2.xy = mix(hg_Params[16].xy, hg_Params[16].zw, r0.xx);
    r3.xy = mix(hg_Params[22].xy, hg_Params[22].zw, r0.xx);
    r3.xy = mix(r2.xy, r3.xy, r0.yy);
    r3.xy = fract(r3.xy);
    r3.xy = r3.xy*c0.zz + c0.ww;
    r3.xy = r3.xy + hg_Params[24].xy;
    r3.xy = r3.xy*hg_Params[24].zw;
    r3.xy = hg_Texture0.sample(hg_Sampler0, r3.xy).xy;
    r3.xy = r3.xy*c1.xx + c1.yy;
    r1.xy = r3.xx*hg_Params[8].xy + r1.xy;
    r1.xy = r3.yy*hg_Params[9].xy + r1.xy;
    r2.xy = mix(hg_Params[17].xy, hg_Params[17].zw, r0.xx);
    r3.xy = mix(hg_Params[23].xy, hg_Params[23].zw, r0.xx);
    r0.xy = mix(r2.xy, r3.xy, r0.yy);
    r0.xy = fract(r0.xy);
    r0.xy = r0.xy*c0.zz + c0.ww;
    r0.xy = r0.xy + hg_Params[24].xy;
    r0.xy = r0.xy*hg_Params[24].zw;
    r0.xy = hg_Texture0.sample(hg_Sampler0, r0.xy).xy;
    r0.xy = r0.xy*c1.xx + c1.yy;
    r1.xy = r0.xx*hg_Params[10].xy + r1.xy;
    r1.xy = r0.yy*hg_Params[11].xy + r1.xy;
    r1.xz = r1.xy*c0.yy + c0.yy;
    r1.yw = r1.xz*c1.zz;
    r1.yw = fract(r1.yw);
    r1.xz = r1.yw*c1.ww + r1.xz;
    output.color0.xzw = r1.xzw;
    output.color0.y = c2.y;
    return output;
}


