//Metal1.0     
//LEN=00000009de
[[ visible ]] FragmentOut HgcSlicedScale_hgc_visible(const constant float4* hg_Params, 
    texture2d< float > hg_Texture0, 
    sampler hg_Sampler0,
    float4 texCoord0)
{
    const float4 c0 = float4(-0.5000000000, 0.000000000, 1.000000000, 0.000000000);
    float4 r0, r1, r2;
    FragmentOut output;

    r0.x = c0.x + hg_Params[11].x;
    r1.y = -c0.x - hg_Params[11].x;
    r0.y = fmax(r0.x, hg_Params[2].y);
    r0.z = r0.y*hg_Params[0].x;
    r1.z = fmin(r1.y, hg_Params[1].z);
    r1.w = r1.z*hg_Params[0].x;
    r1.x = dot(texCoord0, hg_Params[5]);
    r1.x = r1.x/hg_Params[9].x;
    r1.x = r1.x*hg_Params[7].x;
    r1.x = r1.x/hg_Params[10].x;
    r1.z = r1.z*hg_Params[0].x + -r1.z;
    r0.y = -r0.y*hg_Params[0].x + r0.y;
    r2.x = float(r1.x < r1.w);
    r0.w = float(r0.z < r1.x);
    r2.y = r0.w*-r2.x;
    r0.w = float(r0.z >= r1.x);
    r0.z = float(r1.x >= r1.w);
    r1.zw = r1.xx - r1.zw;
    r1.z = select(r1.z, c0.y, r1.w < 0.00000f);
    r0.y = r1.x + r0.y;
    r1.x = r1.x/hg_Params[0].x;
    r1.w = fmin(r1.y, hg_Params[3].w);
    r0.z = c0.z - r0.z;
    r2.x = float(-r0.w >= c0.y);
    r2.x = fmin(r0.z, r2.x);
    r0.z = fmin(r0.z, r0.w);
    r1.z = select(r1.z, r0.y, -r0.z < 0.00000f);
    r2.x = fmin(r2.x, r2.y);
    r1.x = select(r1.z, r1.x, r2.x < 0.00000f);
    r1.z = fmax(r0.x, hg_Params[4].z);
    r2.xy = r1.wz*hg_Params[0].yy;
    r1.x = r1.x*hg_Params[9].x;
    r1.y = dot(texCoord0, hg_Params[6]);
    r1.y = r1.y/hg_Params[9].y;
    r1.y = r1.y*hg_Params[8].y;
    r1.y = r1.y/hg_Params[10].y;
    r1.w = r1.w*hg_Params[0].y + -r1.w;
    r2.w = float(r1.y < r2.x);
    r2.z = float(r2.y < r1.y);
    r0.x = fmin(r2.z, r2.w);
    r2.z = float(r2.y >= r1.y);
    r2.y = float(r1.y >= r2.x);
    r2.w = r2.z;
    r2.x = r1.y - r2.x;
    r1.w = r1.y - r1.w;
    r2.yw = float2(-r2.yw >= c0.yy);
    r2.yw = fmin(r2.yy, r2.zw);
    r2.w = fmin(r2.w, r0.x);
    r1.z = -r1.z*hg_Params[0].y + r1.z;
    r1.w = select(r1.w, c0.y, r2.x < 0.00000f);
    r2.x = r1.y + r1.z;
    r1.w = select(r1.w, r2.x, -r2.y < 0.00000f);
    r1.y = r1.y/hg_Params[0].y;
    r1.y = select(r1.w, r1.y, -r2.w < 0.00000f);
    r0.x = r1.x*hg_Params[5].x;
    r1.x = r1.y*hg_Params[9].y;
    r0.w = c0.z;
    r0.y = r1.x*hg_Params[6].y;
    r2.y = dot(r0.xyw, hg_Params[8].xyw);
    r2.x = dot(r0.xyw, hg_Params[7].xyw);
    r2.xy = r2.xy + hg_Params[12].xy;
    r2.xy = r2.xy*hg_Params[12].zw;
    output.color0 = hg_Texture0.sample(hg_Sampler0, r2.xy);
    return output;
}


