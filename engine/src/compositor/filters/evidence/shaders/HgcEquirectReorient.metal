//Metal1.0     
//LEN=0000000abb
[[ visible ]] FragmentOut HgcEquirectReorient_hgc_visible(const constant float4* hg_Params, 
    texture2d< float > hg_Texture0, 
    sampler hg_Sampler0,
    float4 texCoord0)
{
    const float4 c0 = float4(0.5000000000, 6.283185482, -3.141592741, 1.000000000);
    const float4 c1 = float4(0.05747731403, -0.1212390736, -0.01348046958, 0.1956359297);
    const float4 c2 = float4(0.9999956489, 1.570796371, -0.3329946101, -0.01872929931);
    const float4 c3 = float4(-0.2121143937, 0.1591549367, 1.570728779, 0.07426100224);
    const float4 c4 = float4(0.3183098733, 0.5000000000, 0.000000000, -2.000000000);
    float4 r0, r1, r2;
    FragmentOut output;

    r0.w = c0.w;
    r0.xy = texCoord0.xy;
    r1.x = dot(r0.xyw, hg_Params[5].xyz);
    r1.y = 1.00000f / hg_Params[0].x;
    r1.x = r1.x*r1.y + c0.x;
    r0.x = dot(r0.xyw, hg_Params[6].xyz);
    r0.y = r1.x*c0.y + c0.z;
    r1.y = 1.00000f / hg_Params[1].x;
    r0.x = r0.x*r1.y + c0.x;
    r0.x = r0.x*-c0.z;
    r1.w = sin(r0.x);
    r0.xz = cos(r0.xy);
    r0.z = r1.w*r0.z;
    r0.w = sin(r0.y);
    r1.xyz = r0.zzz*hg_Params[4].xyz;
    r0.w = r0.w*r1.w;
    r0.xyz = r0.xxx*hg_Params[3].xyz;
    r0.xyz = r0.www*hg_Params[2].xyz + r0.xyz;
    r2.xyz = r0.xyz + r1.xyz;
    r0.xz = abs(r2.xz);
    r0.w = fmax(r0.x, r0.z);
    r1.x = 1.00000f / r0.w;
    r0.w = fmin(r0.x, r0.z);
    r0.w = r0.w*r1.x;
    r1.x = r0.w*r0.w;
    r1.z = r1.x*c1.z + c1.x;
    r1.z = r1.z*r1.x + c1.y;
    r1.z = r1.z*r1.x + c1.w;
    r1.z = r1.z*r1.x + c2.z;
    r1.x = r1.z*r1.x + c2.x;
    r0.w = r1.x*r0.w;
    r0.y = float(r0.y < -r1.y);
    r1.x = c2.y - r0.w;
    r0.x = r0.z - r0.x;
    r0.x = select(r0.w, r1.x, r0.x < 0.00000f);
    r0.z = -r0.x - c0.z;
    r0.x = select(r0.x, r0.z, r2.z < 0.00000f);
    r0.z = abs(r2.y);
    r1.x = c0.w - r0.z;
    r0.w = r0.z*c2.w + c3.w;
    r0.w = r0.w*r0.z + c3.x;
    r0.x = select(r0.x, -r0.x, r2.x < 0.00000f);
    r0.x = r0.x*c3.y;
    r1.x = sqrt(r1.x);
    r0.z = r0.w*r0.z + c3.z;
    r0.z = r0.z*r1.x;
    r0.w = r0.y*r0.z;
    r0.w = r0.w*c4.w + r0.z;
    r0.y = r0.y*-c0.z + r0.w;
    r0.z = hg_Params[0].x - c0.w;
    r0.yz = r0.yz*c4.xy;
    r0.y = r0.y - c4.y;
    r0.x = r0.x*hg_Params[0].x;
    r0.x = fmin(r0.z, r0.x);
    r0.z = c4.y*-hg_Params[0].x;
    r0.x = fmax(r0.z, r0.x);
    r2.x = c4.y*-hg_Params[1].x;
    r0.z = hg_Params[1].x*c4.y + -c4.y;
    r0.y = r0.y*hg_Params[1].x;
    r0.y = fmin(r0.z, r0.y);
    r0.w = c0.w;
    r0.y = fmax(r2.x, r0.y);
    r1.y = dot(r0.xyw, hg_Params[8].xyz);
    r1.x = dot(r0.xyw, hg_Params[7].xyz);
    r1.xy = r1.xy + hg_Params[9].xy;
    r1.xy = r1.xy*hg_Params[9].zw;
    output.color0 = hg_Texture0.sample(hg_Sampler0, r1.xy);
    return output;
}
