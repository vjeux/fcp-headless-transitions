__ZN10HGCropNode10GetProgramEP10HGRenderer:
0000000000247960	pushq	%rbp
0000000000247961	movq	%rsp, %rbp
0000000000247964	movq	%rsi, %rdi
0000000000247967	movl	$0x60000, %esi                  ## imm = 0x60000
000000000024796c	callq	__ZN10HGRenderer9GetTargetEj    ## HGRenderer::GetTarget(unsigned int)
0000000000247971	xorl	%ecx, %ecx
0000000000247973	cmpl	$0x60b10, %eax                  ## imm = 0x60B10
0000000000247978	leaq	0x6e1fbd(%rip), %rax            ## literal pool for: "//Metal1.0     \n//LEN=0000000355\nfragment FragmentOut fragmentFunc(VertexInOut frag [[ stage_in ]], \n    const constant float4* hg_Params [[ buffer(0) ]], \n    texture2d< float > hg_Texture0 [[ texture(0) ]], \n    sampler hg_Sampler0 [[ sampler(0) ]])\n{\n    const float4 c0 = float4(0.000000000, 0.000000000, 0.000000000, 0.000000000);\n    float4 r0, r1;\n    FragmentOut output;\n\n    r0 = hg_Texture0.sample(hg_Sampler0, frag._texCoord0.xy);\n    r1.xy = frag._texCoord1.xy - hg_Params[0].xy;\n    r1.zw = hg_Params[0].zw - frag._texCoord1.xy;\n    r1 = float4(r1 < c0.xxxx);\n    r1 = float4(dot(r1, 1.00000f));\n    r1 = float4(r1 <= c0.xxxx);\n    r0 = r0*r1;\n    output.color0 = r0*hg_Params[1];\n    return output;\n}\n//MD5=71c0cb25:36879384:725a4797:f8967426\n//SIG=00000000:00000001:00000001:00000000:0001:0002:0002:0000:0000:0000:0006:0000:0002:01:0:1:0\n"
000000000024797f	cmoveq	%rax, %rcx
0000000000247983	movq	%rcx, %rax
0000000000247986	popq	%rbp
0000000000247987	retq
0000000000247988	nopl	(%rax,%rax)
