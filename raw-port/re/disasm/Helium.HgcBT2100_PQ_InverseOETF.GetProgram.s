__ZN24HgcBT2100_PQ_InverseOETF10GetProgramEP10HGRenderer:
00000000003ac7d0	pushq	%rbp
00000000003ac7d1	movq	%rsp, %rbp
00000000003ac7d4	movq	%rsi, %rdi
00000000003ac7d7	movl	$0x60000, %esi                  ## imm = 0x60000
00000000003ac7dc	callq	__ZN10HGRenderer9GetTargetEj    ## HGRenderer::GetTarget(unsigned int)
00000000003ac7e1	xorl	%ecx, %ecx
00000000003ac7e3	cmpl	$0x60b10, %eax                  ## imm = 0x60B10
00000000003ac7e8	leaq	0x630236(%rip), %rax            ## literal pool for: "//Metal1.0     \n//LEN=00000004a0\nfragment FragmentOut fragmentFunc(VertexInOut frag [[ stage_in ]], \n    const constant float4* hg_Params [[ buffer(0) ]], \n    texture2d< float > hg_Texture0 [[ texture(0) ]], \n    sampler hg_Sampler0 [[ sampler(0) ]])\n{\n    const float4 c0 = float4(0.000000000, 0.000000000, 0.000000000, 0.000000000);\n    float4 r0, r1, r2;\n    FragmentOut output;\n\n    r0 = hg_Texture0.sample(hg_Sampler0, frag._texCoord0.xy);\n    r0.xyz = clamp(r0.xyz, 0.00000f, 1.00000f);\n    r0.xyz = pow(r0.xyz, hg_Params[1].yyy);\n    r1.xyz = r0.xyz - hg_Params[0].xxx;\n    r0.xyz = r0.xyz*hg_Params[0].zzz + hg_Params[0].yyy;\n    r1.xyz = fmax(r1.xyz, c0.xxx);\n    r0.xyz = r1.xyz/r0.xyz;\n    r1.xyz = pow(r0.xyz, hg_Params[1].xxx);\n    r0.xyz = r1.xyz*hg_Params[2].xxx + hg_Params[2].yyy;\n    r2.xyz = r1.xyz*hg_Params[2].zzz;\n    r0.xyz = pow(r0.xyz, hg_Params[1].zzz);\n    r1.xyz = float3(hg_Params[2].www < r1.xyz);\n    output.color0.xyz = select(r2.xyz, r0.xyz, -r1.xyz < 0.00000f);\n    output.color0.w = r0.w;\n    return output;\n}\n//MD5=a07f4f72:4373c56a:f9551245:ece12833\n//SIG=00000000:00000001:00000001:00000000:0001:0003:0003:0000:0000:0000:0002:0000:0001:01:0:1:0\n"
00000000003ac7ef	cmoveq	%rax, %rcx
00000000003ac7f3	movq	%rcx, %rax
00000000003ac7f6	popq	%rbp
00000000003ac7f7	retq
00000000003ac7f8	nopl	(%rax,%rax)
