//Metal1.0     
//LEN=0000000e9a
[[ visible ]] FragmentOut HgcPageCurl_hgc_visible(const constant float4* hg_Params, 
    texture2d< float > hg_Texture0, 
    sampler hg_Sampler0,
    float4 texCoord0)
{
    const float4 c0 = float4(0.000000000, 1.000000000, 0.9990000129, -0.01872929931);
    const float4 c1 = float4(-0.2121143937, 1.570728779, 1.570796371, 0.07426100224);
    const float4 c2 = float4(-1.000000000, 1.000000000, 2.000000000, 0.5000000000);
    const float4 c3 = float4(3.000000000, 0.000000000, -3.141592741, 0.000000000);
    float4 r0, r1, r2, r3, r4;
    FragmentOut output;

    r0.xy = texCoord0.xy*hg_Params[1].xy + hg_Params[1].zw;
    r0.zw = r0.xy - hg_Params[2].xy;
    r1.w = dot(r0.zw, hg_Params[3].xy);
    r2.y = -r1.w/hg_Params[4].x;
    r2.x = select(c0.x, r2.y, r1.w < 0.00000f);
    r3.x = select(c0.x, -r2.y, r1.w < 0.00000f);
    r0.x = c0.y - r2.x;
    r0.x = -fabs(r0.x) + c0.y;
    r0.x = fmin(r0.x, c0.z);
    r0.x = fmax(r0.x, -c0.z);
    r0.y = abs(r0.x);
    r2.w = r0.y*c0.w + c1.w;
    r2.z = c0.y - r0.y;
    r2.w = r0.y*r2.w + c1.x;
    r0.y = r0.y*r2.w + c1.y;
    r2.z = sqrt(r2.z);
    r2.z = -r2.z*r0.y + c1.z;
    r0.x = float(r0.x < c0.x);
    r2.w = r0.x*r2.z;
    r4.y = -hg_Params[3].y;
    r4.x = hg_Params[3].x;
    r2.y = r3.x + c0.y;
    r0.y = hg_Params[3].x;
    r0.x = -hg_Params[3].y;
    r0.xy = r0.zw*r0.xy;
    r0.z = r2.w*c2.z + -r2.z;
    r2.w = dot(r0.xy, 1.00000f);
    r0.x = r0.z*hg_Params[4].x;
    r2.z = fmax(-r2.x, c0.x);
    r0.y = r2.w;
    r0.x = select(r1.w, r0.x, r1.w < 0.00000f);
    r0.zw = r0.xy*hg_Params[3].yx;
    r0.xy = r0.xy*r4.xy;
    r0.zw = r0.xz + r0.yw;
    r0.xy = r0.zw + hg_Params[2].xy;
    r0.xy = r0.xy*hg_Params[0].xy + hg_Params[0].zw;
    r0.xy = r0.xy + hg_Params[7].xy;
    r0.xy = r0.xy*hg_Params[7].zw;
    r0 = hg_Texture0.sample(hg_Sampler0, r0.xy);
    r2.z = r2.z*r2.z;
    r2.z = r0.w*r2.z;
    r1.xyz = r2.zzz*hg_Params[5].xyz;
    r2.z = abs(r2.y);
    r2.y = -r2.x*r2.x + c0.y;
    r2.z = -r2.z + c0.y;
    r4.z = clamp(fmin(r2.z, c0.z), 0.00000f, 1.00000f);
    r2.z = sqrt(fabs(r2.y));
    r4.w = r4.z;
    r2.z = select(c0.y, r2.z, r1.w < 0.00000f);
    r2.x = dot(r2.xz, c2.xy);
    r2.z = r4.w*c0.w + c1.w;
    r2.y = c2.y - r4.w;
    r2.z = r4.w*r2.z + c1.x;
    r2.z = r4.w*r2.z + c1.y;
    r2.y = sqrt(r2.y);
    r2.z = r2.y*r2.z + -c1.z;
    r2.y = r2.x*c2.w + c2.w;
    r2.y = fmax(r2.y, c0.x);
    r0.xyz = r0.xyz*r2.yyy + r1.xyz;
    r2.x = r2.z*hg_Params[4].x;
    r2.y = select(r1.w, r2.x, r1.w < 0.00000f);
    r2.x = -r3.x*r3.x + c2.y;
    r1.x = abs(r2.x);
    r2.z = c3.z*hg_Params[4].x + -r2.y;
    r2.xy = r4.xy*r2.zw;
    r2.x = dot(r2.xy, 1.00000f);
    r2.y = sqrt(r1.x);
    r3.z = select(c2.y, r2.y, r1.w < 0.00000f);
    r2.y = dot(r2.zw, hg_Params[3].yx);
    r1.x = dot(r3.xz, c2.xy);
    r2.z = r1.x*c2.w + c2.w;
    r2.xy = r2.xy + hg_Params[2].xy;
    r1.x = fmax(r2.z, c0.x);
    r2.xy = r2.xy*hg_Params[0].xy + hg_Params[0].zw;
    r2.xy = r2.xy + hg_Params[7].xy;
    r2.xy = r2.xy*hg_Params[7].zw;
    r2 = hg_Texture0.sample(hg_Sampler0, r2.xy);
    r2.xyz = r2.xyz*r1.xxx;
    r1.xyz = r2.www*hg_Params[6].xyz;
    r4.y = c2.y - hg_Params[6].w;
    r2.xyz = r2.xyz*r4.yyy + r1.xyz;
    r1.y = fmax(-r3.x, c0.x);
    r1.z = r1.y*r1.y;
    r1.x = c2.y - hg_Params[4].x;
    r1.y = -r1.x - hg_Params[4].x;
    r1.z = r2.w*r1.z;
    r1.y = r1.y - c2.y;
    r1.x = r1.w - r1.x;
    r1.x = clamp(r1.x/r1.y, 0.00000f, 1.00000f);
    r1.y = -r1.x*c2.z + c3.x;
    r1.x = r1.x*r1.x;
    r1.x = r1.x*r1.y;
    r2.xyz = r1.zzz*hg_Params[5].xyz + r2.xyz;
    r2 = r1.xxxx*-r2 + r2;
    r1.y = c2.y - r2.w;
    r0 = r1.xxxx*-r0 + r0;
    output.color0 = r0*r1.yyyy + r2;
    return output;
}


