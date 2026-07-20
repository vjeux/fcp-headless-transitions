===== HgcPoke =====
//Metal1.0     
//LEN=0000000533
[[ visible ]] FragmentOut HgcPoke_hgc_visible(const constant float4* hg_Params, 
    texture2d< float > hg_Texture0, 
    sampler hg_Sampler0,
    float4 texCoord0)
{
    const float4 c0 = float4(-9.999999747e-06, 0.000000000, 0.000000000, 1.000000000);
    float4 r0, r1, r2, r3, r4;
    FragmentOut output;

    r0.xy = texCoord0.xy;
    r0.w = c0.w;
    r1.x = dot(r0.xyw, hg_Params[1].xyz);
    r1.y = dot(r0.xyw, hg_Params[2].xyz);
    r2.x = dot(r0.xyw, hg_Params[3].xyz);
    r3.x = fmin(c0.x, r2.x);
    r4.x = fmax(-c0.x, r2.x);
    r4.x = select(r4.x, r3.x, r2.x < 0.00000f);
    r0.xy = r1.xy/r4.xx;
    r0.xy = r0.xy - hg_Params[0].xy;
    r2.x = dot(r0.xy, r0.xy);
    r2.x = sqrt(r2.x);
    r2.x = fmax(r2.x, -c0.x);
    r2.x = r2.x*hg_Params[0].z;
    r2.xy = rsqrt(r2.xx);
    r0.xy = r0.xy*r2.xy + hg_Params[0].xy;
    r3.x = dot(r0.xyw, hg_Params[4].xyz);
    r3.y = dot(r0.xyw, hg_Params[5].xyz);
    r0.x = dot(r0.xyw, hg_Params[6].xyz);
    r1.x = fmin(c0.x, r0.x);
    r4.x = fmax(-c0.x, r0.x);
    r0.x = select(r4.x, r1.x, r0.x < 0.00000f);
    r3.xy = r3.xy/r0.xx;
    r3.xy = mix(texCoord0.xy, r3.xy, hg_Params[0].ww);
    r3.xy = r3.xy + hg_Params[7].xy;
    r3.xy = r3.xy*hg_Params[7].zw;
    output.color0 = hg_Texture0.sample(hg_Sampler0, r3.xy);
    return output;
}


