__ZN44HgcBilateralFilterInterpSC_InterpolatorLastX10GetProgramEP10HGRenderer:
000000000031c3c0	pushq	%rbp
000000000031c3c1	movq	%rsp, %rbp
000000000031c3c4	movq	%rsi, %rdi
000000000031c3c7	movl	$0x60000, %esi                  ## imm = 0x60000
000000000031c3cc	callq	__ZN10HGRenderer9GetTargetEj    ## HGRenderer::GetTarget(unsigned int)
000000000031c3d1	xorl	%ecx, %ecx
000000000031c3d3	cmpl	$0x60b10, %eax                  ## imm = 0x60B10
000000000031c3d8	leaq	0x67b0be(%rip), %rax            ## literal pool for: "//Metal1.0     \n//LEN=0000000531\nfragment FragmentOut fragmentFunc(VertexInOut frag [[ stage_in ]], \n    const constant float4* hg_Params [[ buffer(0) ]], \n    texture2d< float > hg_Texture0 [[ texture(0) ]], \n    sampler hg_Sampler0 [[ sampler(0) ]], \n    texture2d< float > hg_Texture1 [[ texture(1) ]], \n    sampler hg_Sampler1 [[ sampler(1) ]], \n    texture2d< float > hg_Texture2 [[ texture(2) ]], \n    sampler hg_Sampler2 [[ sampler(2) ]], \n    texture2d< float > hg_Texture3 [[ texture(3) ]], \n    sampler hg_Sampler3 [[ sampler(3) ]])\n{\n    float4 r0, r1, r2, r3, r4;\n    FragmentOut output;\n\n    r0 = hg_Texture0.sample(hg_Sampler0, frag._texCoord0.xy);\n    r1.xw = hg_Texture1.sample(hg_Sampler1, frag._texCoord1.xy).xw;\n    r2.xw = hg_Texture2.sample(hg_Sampler2, frag._texCoord2.xy).xw;\n    r3.x = hg_Texture3.sample(hg_Sampler3, frag._texCoord3.xy).x;\n    r0.x = fmin(r0.x, hg_Params[0].y);\n    r4.x = float(r0.x >= hg_Params[0].x);\n    r1.x = r1.x / fmax(r1.w, 1.00000e-06f);\n    r2.x = r2.x / fmax(r2.w, 1.00000e-06f);\n    r0.x = r0.x*hg_Params[0].z + hg_Params[0].w;\n    r0.x = mix(r1.x, r2.x, r0.x);\n    r0.x = r0.x*r4.x + r3.x;\n    output.color0 = r0;\n    return output;\n}\n//MD5=10c87e55:65bf1157:b1c1d7bd:cb16bfdf\n//SIG=00000000:0000000f:0000000f:00000000:0000:0001:0005:0000:0000:0000:001e:0000:0004:04:0:1:0\n"
000000000031c3df	cmoveq	%rax, %rcx
000000000031c3e3	movq	%rcx, %rax
000000000031c3e6	popq	%rbp
000000000031c3e7	retq
000000000031c3e8	nopl	(%rax,%rax)
