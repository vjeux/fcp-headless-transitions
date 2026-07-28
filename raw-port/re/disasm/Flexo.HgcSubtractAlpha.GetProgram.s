__ZN16HgcSubtractAlpha10GetProgramEP10HGRenderer:
000000000146df60	pushq	%rbp
000000000146df61	movq	%rsp, %rbp
000000000146df64	movq	%rsi, %rdi
000000000146df67	movl	$0x60000, %esi                  ## imm = 0x60000
000000000146df6c	callq	0x1495ea4                       ## symbol stub for: __ZN10HGRenderer9GetTargetEj
000000000146df71	xorl	%ecx, %ecx
000000000146df73	cmpl	$0x60b10, %eax                  ## imm = 0x60B10
000000000146df78	leaq	0x241883(%rip), %rax            ## literal pool for: "//Metal1.0     \n//LEN=0000000343\nfragment FragmentOut fragmentFunc(VertexInOut frag [[ stage_in ]], \n    const constant float4* hg_Params [[ buffer(0) ]], \n    texture2d< float > hg_Texture0 [[ texture(0) ]], \n    sampler hg_Sampler0 [[ sampler(0) ]], \n    texture2d< float > hg_Texture1 [[ texture(1) ]], \n    sampler hg_Sampler1 [[ sampler(1) ]])\n{\n    const float4 c0 = float4(0.000000000, 0.000000000, 0.000000000, 0.000000000);\n    float4 r0, r1;\n    FragmentOut output;\n\n    r0.w = hg_Texture0.sample(hg_Sampler0, frag._texCoord0.xy).w;\n    r1.w = hg_Texture1.sample(hg_Sampler1, frag._texCoord1.xy).w;\n    r0 = r0.wwww - r1.wwww;\n    output.color0 = fmax(c0.xxxx, r0);\n    return output;\n}\n//MD5=101bbce5:f97df638:b36f7dc3:7904ba14\n//SIG=00000000:00000003:00000003:00000000:0001:0000:0002:0000:0000:0000:0006:0000:0002:02:0:1:0\n"
000000000146df7f	cmoveq	%rax, %rcx
000000000146df83	movq	%rcx, %rax
000000000146df86	popq	%rbp
000000000146df87	retq
000000000146df88	nopl	(%rax,%rax)
