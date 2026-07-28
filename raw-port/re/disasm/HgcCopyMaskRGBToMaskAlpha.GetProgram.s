__ZN25HgcCopyMaskRGBToMaskAlpha10GetProgramEP10HGRenderer:
00000000006a2030	pushq	%rbp
00000000006a2031	movq	%rsp, %rbp
00000000006a2034	subq	$0x20, %rsp
00000000006a2038	movq	%rdi, -0x10(%rbp)
00000000006a203c	movq	%rsi, -0x18(%rbp)
00000000006a2040	movq	-0x18(%rbp), %rdi
00000000006a2044	movl	$0x60000, %esi                  ## imm = 0x60000
00000000006a2049	callq	0x6dd380                        ## symbol stub for: __ZN10HGRenderer9GetTargetEj
00000000006a204e	movl	%eax, -0x1c(%rbp)
00000000006a2051	cmpl	$0x60b10, -0x1c(%rbp)           ## imm = 0x60B10
00000000006a2058	jne	0x6a2067
00000000006a205a	leaq	0x156b48(%rip), %rax            ## literal pool for: "//Metal1.0     \n//LEN=0000000228\nfragment FragmentOut fragmentFunc(VertexInOut frag [[ stage_in ]], \n    const constant float4* hg_Params [[ buffer(0) ]], \n    texture2d< float > hg_Texture0 [[ texture(0) ]], \n    sampler hg_Sampler0 [[ sampler(0) ]])\n{\n    float4 r0;\n    FragmentOut output;\n\n    r0.xyz = hg_Texture0.sample(hg_Sampler0, frag._texCoord0.xy).xyz;\n    output.color0 = r0.xyzx;\n    return output;\n}\n//MD5=60c2618d:6648efc9:fffa8e87:b7ed2f65\n//SIG=00000000:00000001:00000001:00000000:0000:0000:0001:0000:0000:0000:0002:0000:0001:01:0:1:0\n"
00000000006a2061	movq	%rax, -0x8(%rbp)
00000000006a2065	jmp	0x6a206f
00000000006a2067	movq	$0x0, -0x8(%rbp)
00000000006a206f	movq	-0x8(%rbp), %rax
00000000006a2073	addq	$0x20, %rsp
00000000006a2077	popq	%rbp
00000000006a2078	retq
00000000006a2079	nopl	(%rax)
