__ZN28HGLensDistort_distort_kernel10GetProgramEP10HGRenderer:
000000000022a830	pushq	%rbp
000000000022a831	movq	%rsp, %rbp
000000000022a834	movq	%rsi, %rdi
000000000022a837	movl	$0x60000, %esi                  ## imm = 0x60000
000000000022a83c	callq	__ZN10HGRenderer9GetTargetEj    ## HGRenderer::GetTarget(unsigned int)
000000000022a841	xorl	%ecx, %ecx
000000000022a843	cmpl	$0x60b10, %eax                  ## imm = 0x60B10
000000000022a848	leaq	0x6eb679(%rip), %rax            ## literal pool for: "//Metal1.0     \n//LEN=000000045b\nfragment FragmentOut fragmentFunc(VertexInOut frag [[ stage_in ]], \n    const constant float4* hg_Params [[ buffer(0) ]], \n    texture2d< float > hg_Texture0 [[ texture(0) ]], \n    sampler hg_Sampler0 [[ sampler(0) ]])\n{\n    const float4 c0 = float4(0.000000000, 0.000000000, 0.000000000, 0.000000000);\n    float4 r0, r1, r2, r3;\n    FragmentOut output;\n\n    r0.xy = frag._texCoord0.xy - hg_Params[1].xy;\n    r0.xy = r0.xy*hg_Params[0].zw;\n    r1.x = dot(r0.xy, r0.xy);\n    r1.x = rsqrt(r1.x);\n    r2.x = 1.00000f / r1.x;\n    r3.x = r2.x*hg_Params[2].x;\n    r3.y = tan(r3.x);\n    r3.z = hg_Params[2].z*r1.x;\n    r3.x = r3.y*r3.z;\n    r0.xy = r0.xy*r3.xx;\n    r0.xy = r0.xy*hg_Params[0].xy + hg_Params[1].xy;\n    r2 = r2.xxxx - hg_Params[2].yyyy;\n    r0.xy = r0.xy + hg_Params[4].xy;\n    r0.xy = r0.xy*hg_Params[4].zw;\n    r0 = hg_Texture0.sample(hg_Sampler0, r0.xy);\n    output.color0 = select(c0.xxxx, r0, r2 < 0.00000f);\n    return output;\n}\n//MD5=4d322dfd:2a8a7e67:eec40bc0:42abbacd\n//SIG=00000000:00000000:00000000:00000000:0001:0005:0004:0000:0000:0000:0002:0000:0001:01:0:1:0\n"
000000000022a84f	cmoveq	%rax, %rcx
000000000022a853	movq	%rcx, %rax
000000000022a856	popq	%rbp
000000000022a857	retq
000000000022a858	nopl	(%rax,%rax)
