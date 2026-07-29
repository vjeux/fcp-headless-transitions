__ZN13HGColorMatrix10GetProgramEP10HGRenderer:
0000000000246560	pushq	%rbp
0000000000246561	movq	%rsp, %rbp
0000000000246564	movq	%rsi, %rdi
0000000000246567	movl	$0x60000, %esi                  ## imm = 0x60000
000000000024656c	callq	__ZN10HGRenderer9GetTargetEj    ## HGRenderer::GetTarget(unsigned int)
0000000000246571	xorl	%ecx, %ecx
0000000000246573	cmpl	$0x60b10, %eax                  ## imm = 0x60B10
0000000000246578	leaq	0x6e2f4e(%rip), %rax            ## literal pool for: "//Metal1.0     \n//LEN=00000002b7\nfragment FragmentOut fragmentFunc(VertexInOut frag [[ stage_in ]], \n    const constant float4* hg_Params [[ buffer(0) ]], \n    texture2d< float > hg_Texture0 [[ texture(0) ]], \n    sampler hg_Sampler0 [[ sampler(0) ]])\n{\n    float4 r0;\n    FragmentOut output;\n\n    r0 = hg_Texture0.sample(hg_Sampler0, frag._texCoord0.xy);\n    output.color0.x = dot(hg_Params[0], r0);\n    output.color0.y = dot(hg_Params[1], r0);\n    output.color0.z = dot(hg_Params[2], r0);\n    output.color0.w = dot(hg_Params[3], r0);\n    return output;\n}\n//MD5=f59a11f6:3c3dcb91:f1061cc0:3190f271\n//SIG=00000000:00000001:00000001:00000000:0000:0004:0001:0000:0000:0000:0002:0000:0001:01:0:1:0\n"
000000000024657f	cmoveq	%rax, %rcx
0000000000246583	movq	%rcx, %rax
0000000000246586	popq	%rbp
0000000000246587	retq
0000000000246588	nopl	(%rax,%rax)
