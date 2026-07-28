__ZN26HgcBT2390_Gain_Sat_ToneAdj10GetProgramEP10HGRenderer:
000000000035e050	pushq	%rbp
000000000035e051	movq	%rsp, %rbp
000000000035e054	movq	%rsi, %rdi
000000000035e057	movl	$0x60000, %esi                  ## imm = 0x60000
000000000035e05c	callq	__ZN10HGRenderer9GetTargetEj    ## HGRenderer::GetTarget(unsigned int)
000000000035e061	xorl	%ecx, %ecx
000000000035e063	cmpl	$0x60b10, %eax                  ## imm = 0x60B10
000000000035e068	leaq	0x6551c7(%rip), %rax            ## literal pool for: "//Metal1.0     \n//LEN=0000000469\nfragment FragmentOut fragmentFunc(VertexInOut frag [[ stage_in ]], \n    const constant float4* hg_Params [[ buffer(0) ]], \n    texture2d< float > hg_Texture0 [[ texture(0) ]], \n    sampler hg_Sampler0 [[ sampler(0) ]])\n{\n    const float4 c0 = float4(0.000000000, 0.2649999857, 1.100000024, 0.6779980063);\n    const float4 c1 = float4(0.05930199847, 1.000000000, 12.00000000, 0.2626999915);\n    float4 r0, r1;\n    FragmentOut output;\n\n    r0 = hg_Texture0.sample(hg_Sampler0, frag._texCoord0.xy);\n    r0 = fmax(r0, c0.xxxx);\n    r1.xyz = r0.xyz*c0.yyy;\n    r0.xy = pow(r1.xy, c0.zz);\n    r0.z = r0.y*c0.w;\n    r1.w = r0.x*c1.w + r0.z;\n    r1.y = r1.y*c0.w;\n    r1.x = r1.x*c1.w + r1.y;\n    r0.z = pow(r1.z, c0.z);\n    r1.w = r0.z*c1.x + r1.w;\n    r1.x = r1.z*c1.x + r1.x;\n    r1.x = r1.x/r1.w;\n    r1.x = select(c1.y, r1.x, -r1.w < 0.00000f);\n    r0.xyz = r0.xyz*r1.xxx;\n    output.color0.xyz = r0.xyz*c1.zzz;\n    output.color0.w = r0.w;\n    return output;\n}\n//MD5=2c714e19:97ce859d:2d1a1eb0:61cf40b1\n//SIG=00000000:00000001:00000001:00000000:0002:0000:0002:0000:0000:0000:0002:0000:0001:01:0:1:0\n"
000000000035e06f	cmoveq	%rax, %rcx
000000000035e073	movq	%rcx, %rax
000000000035e076	popq	%rbp
000000000035e077	retq
000000000035e078	nopl	(%rax,%rax)
