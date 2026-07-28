__ZN31HgcBilateralFilterInterp_Divide10GetProgramEP10HGRenderer:
000000000031a330	pushq	%rbp
000000000031a331	movq	%rsp, %rbp
000000000031a334	movq	%rsi, %rdi
000000000031a337	movl	$0x60000, %esi                  ## imm = 0x60000
000000000031a33c	callq	__ZN10HGRenderer9GetTargetEj    ## HGRenderer::GetTarget(unsigned int)
000000000031a341	xorl	%ecx, %ecx
000000000031a343	cmpl	$0x60b10, %eax                  ## imm = 0x60B10
000000000031a348	leaq	0x67c140(%rip), %rax            ## literal pool for: "//Metal1.0     \n//LEN=00000003a1\nfragment FragmentOut fragmentFunc(VertexInOut frag [[ stage_in ]], \n    const constant float4* hg_Params [[ buffer(0) ]], \n    texture2d< float > hg_Texture0 [[ texture(0) ]], \n    sampler hg_Sampler0 [[ sampler(0) ]], \n    texture2d< float > hg_Texture1 [[ texture(1) ]], \n    sampler hg_Sampler1 [[ sampler(1) ]])\n{\n    const float4 c0 = float4(1.844674407e+19, 0.000000000, 0.000000000, 0.000000000);\n    float4 r0, r1;\n    FragmentOut output;\n\n    r0 = hg_Texture0.sample(hg_Sampler0, frag._texCoord0.xy);\n    r1 = hg_Texture1.sample(hg_Sampler1, frag._texCoord1.xy);\n    r1 = fmin(r1, c0.xxxx);\n    r1 = fmax(r1, -c0.xxxx);\n    r1 = 1.00000f / r1;\n    r1 = fmin(r1, c0.xxxx);\n    r1 = fmax(r1, -c0.xxxx);\n    output.color0 = r0*r1;\n    return output;\n}\n//MD5=314717b8:2f43b310:ddf87b49:5f4d38e7\n//SIG=00000000:00000003:00000003:00000000:0001:0000:0002:0000:0000:0000:0006:0000:0002:02:0:1:0\n"
000000000031a34f	cmoveq	%rax, %rcx
000000000031a353	movq	%rcx, %rax
000000000031a356	popq	%rbp
000000000031a357	retq
000000000031a358	nopl	(%rax,%rax)
