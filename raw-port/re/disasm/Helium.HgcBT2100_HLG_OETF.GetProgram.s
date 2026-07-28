__ZN18HgcBT2100_HLG_OETF10GetProgramEP10HGRenderer:
00000000003b0140	pushq	%rbp
00000000003b0141	movq	%rsp, %rbp
00000000003b0144	movq	%rsi, %rdi
00000000003b0147	movl	$0x60000, %esi                  ## imm = 0x60000
00000000003b014c	callq	__ZN10HGRenderer9GetTargetEj    ## HGRenderer::GetTarget(unsigned int)
00000000003b0151	xorl	%ecx, %ecx
00000000003b0153	cmpl	$0x60b10, %eax                  ## imm = 0x60B10
00000000003b0158	leaq	0x62d84a(%rip), %rax            ## literal pool for: "//Metal1.0     \n//LEN=0000000424\nfragment FragmentOut fragmentFunc(VertexInOut frag [[ stage_in ]], \n    const constant float4* hg_Params [[ buffer(0) ]], \n    texture2d< float > hg_Texture0 [[ texture(0) ]], \n    sampler hg_Sampler0 [[ sampler(0) ]])\n{\n    const float4 c0 = float4(0.000000000, 0.000000000, 0.000000000, 0.000000000);\n    float4 r0, r1, r2;\n    FragmentOut output;\n\n    r0 = hg_Texture0.sample(hg_Sampler0, frag._texCoord0.xy);\n    r1.xyz = fmax(r0.xyz, c0.xxx);\n    r2.xyz = fmax(r0.xyz, hg_Params[0].xxx);\n    r2.xyz = r2.xyz - hg_Params[1].zzz;\n    r1.x = sqrt(r1.x);\n    r1.z = sqrt(r1.z);\n    r1.y = sqrt(r1.y);\n    r1.xyz = r1.xyz*hg_Params[1].xxx;\n    r2.xyz = log2(r2.xyz);\n    r2.xyz = r2.xyz*hg_Params[1].yyy + hg_Params[1].www;\n    r0.xyz = float3(hg_Params[0].xxx < r0.xyz);\n    output.color0.xyz = select(r1.xyz, r2.xyz, -r0.xyz < 0.00000f);\n    output.color0.w = r0.w;\n    return output;\n}\n//MD5=5c824207:76fd8e2e:0a00acd2:9472bca2\n//SIG=00000000:00000001:00000001:00000000:0001:0002:0003:0000:0000:0000:0002:0000:0001:01:0:1:0\n"
00000000003b015f	cmoveq	%rax, %rcx
00000000003b0163	movq	%rcx, %rax
00000000003b0166	popq	%rbp
00000000003b0167	retq
00000000003b0168	nopl	(%rax,%rax)
