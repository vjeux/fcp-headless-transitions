===== HgcPixellate =====
//Metal1.0     
//LEN=000000037b
[[ visible ]] FragmentOut HgcPixellate_hgc_visible(const constant float4* hg_Params, 
    texture2d< float > hg_Texture0, 
    sampler hg_Sampler0,
    float4 texCoord0)
{
    const float4 c0 = float4(0.5000000000, 0.000000000, 0.000000000, 1.000000000);
    float4 r0, r1;
    FragmentOut output;

    r0.w = c0.w;
    r0.xy = texCoord0.xy;
    r1.x = dot(r0.xyw, hg_Params[0].xyz);
    r1.y = dot(r0.xyw, hg_Params[1].xyz);
    r1.xy = r1.xy - hg_Params[4].xy;
    r1.xy = r1.xy*hg_Params[5].xx;
    r1.xy = floor(r1.xy);
    r1.xy = r1.xy + c0.xx;
    r1.xy = r1.xy*hg_Params[5].yy + hg_Params[4].xy;
    r1.w = c0.w;
    r0.x = dot(r1.xyw, hg_Params[2].xyz);
    r0.y = dot(r1.xyw, hg_Params[3].xyz);
    r0.xy = r0.xy + hg_Params[6].xy;
    r0.xy = r0.xy*hg_Params[6].zw;
    output.color0 = hg_Texture0.sample(hg_Sampler0, r0.xy);
    return output;
}


