__ZN20HgcAVAMotionDilation10GetProgramEP10HGRenderer:
0000000000215390	pushq	%rbp
0000000000215391	movq	%rsp, %rbp
0000000000215394	movq	%rsi, %rdi
0000000000215397	movl	$0x60000, %esi                  ## imm = 0x60000
000000000021539c	callq	__ZN10HGRenderer9GetTargetEj    ## HGRenderer::GetTarget(unsigned int)
00000000002153a1	xorl	%ecx, %ecx
00000000002153a3	cmpl	$0x60b10, %eax                  ## imm = 0x60B10
00000000002153a8	leaq	0x6f207c(%rip), %rax            ## literal pool for: "//Metal1.0     \n//LEN=00000006f5\nfragment FragmentOut fragmentFunc(VertexInOut frag [[ stage_in ]], \n    const constant float4* hg_Params [[ buffer(0) ]], \n    texture2d< float > hg_Texture0 [[ texture(0) ]], \n    sampler hg_Sampler0 [[ sampler(0) ]], \n    texture2d< float > hg_Texture1 [[ texture(1) ]], \n    sampler hg_Sampler1 [[ sampler(1) ]], \n    texture2d< float > hg_Texture2 [[ texture(2) ]], \n    sampler hg_Sampler2 [[ sampler(2) ]])\n{\n    const float4 c0 = float4(1.000000000, 0.000000000, 0.000000000, 0.000000000);\n    float4 r0, r1, r2, r3;\n    FragmentOut output;\n\n    r0.w = hg_Texture0.sample(hg_Sampler0, frag._texCoord0.xy).w;\n    r0.x = r0.w;\n    r1.w = hg_Texture0.sample(hg_Sampler0, frag._texCoord3.xy).w;\n    r1.x = r1.w;\n    r2.w = hg_Texture1.sample(hg_Sampler1, frag._texCoord4.xy).w;\n    r1.y = r2.w;\n    r2.w = hg_Texture1.sample(hg_Sampler1, frag._texCoord1.xy).w;\n    r1.z = r2.w;\n    r2.xz = float2(r1.yy >= r1.xz);\n    r3.yz = float2(r1.xx >= r1.yz);\n    r3.x = fmin(r3.y, r3.z);\n    r2.y = fmin(r2.x, r2.z);\n    r3.y = mix(r2.y, c0.y, r3.x);\n    r3.z = fmax(r3.x, r3.y);\n    r3.z = c0.x - r3.z;\n    r3.x = dot(r1.xyz, r3.xyz);\n    r0.x = fmax(r0.x, r3.x);\n    r2.z = hg_Texture2.sample(hg_Sampler2, frag._texCoord5.xy).z;\n    r1.x = fmax(r0.x, r2.z);\n    r2.x = r0.x + r2.z;\n    r3.z = hg_Texture2.sample(hg_Sampler2, frag._texCoord2.xy).z;\n    r1.x = fmax(r1.x, r3.z);\n    r2.x = r2.x + r3.z;\n    r3.zw = hg_Texture2.sample(hg_Sampler2, frag._texCoord2.xy).zw;\n    output.color0.x = fmax(r1.x, r3.w);\n    output.color0.y = r2.x;\n    output.color0.z = r0.x;\n    output.color0.w = r3.z;\n    return output;\n}\n//MD5=5d9ce490:ce0288d4:2a2c5d1d:5c45678e\n//SIG=00000000:00000000:00000000:00000000:0001:0000:0004:0000:0000:0000:007e:0000:0006:03:0:1:0\n"
00000000002153af	cmoveq	%rax, %rcx
00000000002153b3	movq	%rcx, %rax
00000000002153b6	popq	%rbp
00000000002153b7	retq
00000000002153b8	nopl	(%rax,%rax)
