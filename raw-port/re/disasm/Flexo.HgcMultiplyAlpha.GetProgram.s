__ZN16HgcMultiplyAlpha10GetProgramEP10HGRenderer:
00000000014689a0	pushq	%rbp
00000000014689a1	movq	%rsp, %rbp
00000000014689a4	movq	%rsi, %rdi
00000000014689a7	movl	$0x60000, %esi                  ## imm = 0x60000
00000000014689ac	callq	0x1495ea4                       ## symbol stub for: __ZN10HGRenderer9GetTargetEj
00000000014689b1	xorl	%ecx, %ecx
00000000014689b3	cmpl	$0x60b10, %eax                  ## imm = 0x60B10
00000000014689b8	leaq	0x244099(%rip), %rax            ## literal pool for: "//Metal1.0     \n//LEN=00000002d3\nfragment FragmentOut fragmentFunc(VertexInOut frag [[ stage_in ]], \n    const constant float4* hg_Params [[ buffer(0) ]], \n    texture2d< float > hg_Texture0 [[ texture(0) ]], \n    sampler hg_Sampler0 [[ sampler(0) ]], \n    texture2d< float > hg_Texture1 [[ texture(1) ]], \n    sampler hg_Sampler1 [[ sampler(1) ]])\n{\n    float4 r0, r1;\n    FragmentOut output;\n\n    r0.w = hg_Texture0.sample(hg_Sampler0, frag._texCoord0.xy).w;\n    r1.w = hg_Texture1.sample(hg_Sampler1, frag._texCoord1.xy).w;\n    output.color0 = r0.wwww*r1.wwww;\n    return output;\n}\n//MD5=4c765c06:d722b3b3:a8d43463:0e9ddbe0\n//SIG=00000000:00000003:00000003:00000000:0000:0000:0002:0000:0000:0000:0006:0000:0002:02:0:1:0\n"
00000000014689bf	cmoveq	%rax, %rcx
00000000014689c3	movq	%rcx, %rax
00000000014689c6	popq	%rbp
00000000014689c7	retq
00000000014689c8	nopl	(%rax,%rax)
