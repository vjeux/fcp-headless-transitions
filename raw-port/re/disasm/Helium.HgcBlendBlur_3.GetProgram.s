__ZN14HgcBlendBlur_310GetProgramEP10HGRenderer:
00000000002359f0	pushq	%rbp
00000000002359f1	movq	%rsp, %rbp
00000000002359f4	movq	%rsi, %rdi
00000000002359f7	movl	$0x60000, %esi                  ## imm = 0x60000
00000000002359fc	callq	__ZN10HGRenderer9GetTargetEj    ## HGRenderer::GetTarget(unsigned int)
0000000000235a01	xorl	%ecx, %ecx
0000000000235a03	cmpl	$0x60b10, %eax                  ## imm = 0x60B10
0000000000235a08	leaq	0x6e8649(%rip), %rax            ## literal pool for: "//Metal1.0     \n//LEN=0000000586\nfragment FragmentOut fragmentFunc(VertexInOut frag [[ stage_in ]], \n    const constant float4* hg_Params [[ buffer(0) ]], \n    texture2d< float > hg_Texture0 [[ texture(0) ]], \n    sampler hg_Sampler0 [[ sampler(0) ]], \n    texture2d< float > hg_Texture1 [[ texture(1) ]], \n    sampler hg_Sampler1 [[ sampler(1) ]], \n    texture2d< float > hg_Texture2 [[ texture(2) ]], \n    sampler hg_Sampler2 [[ sampler(2) ]], \n    texture2d< float > hg_Texture3 [[ texture(3) ]], \n    sampler hg_Sampler3 [[ sampler(3) ]])\n{\n    const float4 c0 = float4(0.000000000, 0.000000000, 0.000000000, 0.000000000);\n    float4 r0, r1, r2, r3, r4;\n    FragmentOut output;\n\n    r0.x = hg_Texture0.sample(hg_Sampler0, frag._texCoord0.xy).x;\n    r1 = hg_Texture1.sample(hg_Sampler1, frag._texCoord1.xy);\n    r2 = hg_Texture2.sample(hg_Sampler2, frag._texCoord2.xy);\n    r3 = hg_Texture3.sample(hg_Sampler3, frag._texCoord3.xy);\n    r0.x = fmax(r0.x, c0.x);\n    r0.x = r0.x*hg_Params[0].x;\n    r4.x = r0.x + hg_Params[1].x;\n    r4.x = clamp(r4.x*hg_Params[2].x, 0.00000f, 1.00000f);\n    r4 = mix(r1, r2, r4.xxxx);\n    r0.x = r0.x + hg_Params[3].x;\n    r0.x = clamp(r0.x*hg_Params[4].x, 0.00000f, 1.00000f);\n    output.color0 = mix(r4, r3, r0.xxxx);\n    return output;\n}\n//MD5=1a704606:298fad20:53f42e0b:42d4cdc2\n//SIG=00000000:0000000f:0000000f:00000000:0001:0005:0005:0000:0000:0000:001e:0000:0004:04:0:1:0\n"
0000000000235a0f	cmoveq	%rax, %rcx
0000000000235a13	movq	%rcx, %rax
0000000000235a16	popq	%rbp
0000000000235a17	retq
0000000000235a18	nopl	(%rax,%rax)
