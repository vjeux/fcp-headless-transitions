__ZN17HgcScreeningMatte10GetProgramEP10HGRenderer:
000000000146c8a0	pushq	%rbp
000000000146c8a1	movq	%rsp, %rbp
000000000146c8a4	movq	%rsi, %rdi
000000000146c8a7	movl	$0x60000, %esi                  ## imm = 0x60000
000000000146c8ac	callq	0x1495ea4                       ## symbol stub for: __ZN10HGRenderer9GetTargetEj
000000000146c8b1	xorl	%ecx, %ecx
000000000146c8b3	cmpl	$0x60b10, %eax                  ## imm = 0x60B10
000000000146c8b8	leaq	0x24228b(%rip), %rax            ## literal pool for: "//Metal1.0     \n//LEN=00000003eb\nfragment FragmentOut fragmentFunc(VertexInOut frag [[ stage_in ]], \n    const constant float4* hg_Params [[ buffer(0) ]], \n    texture2d< float > hg_Texture0 [[ texture(0) ]], \n    sampler hg_Sampler0 [[ sampler(0) ]], \n    texture2d< float > hg_Texture1 [[ texture(1) ]], \n    sampler hg_Sampler1 [[ sampler(1) ]])\n{\n    const float4 c0 = float4(0.5000000000, 0.2117599994, 0.7699999809, 0.3411799967);\n    float4 r0, r1, r2, r3, r4;\n    FragmentOut output;\n\n    r0 = hg_Texture0.sample(hg_Sampler0, frag._texCoord0.xy);\n    r1.w = hg_Texture1.sample(hg_Sampler1, frag._texCoord1.xy).w;\n    r2.w = r0.w;\n    r3.xyz = r0.yyy*c0.xxx + c0.yyy;\n    r4.xyz = r0.yyy*c0.zzz + c0.www;\n    r3.xyz = select(r4.xyz, r3.xyz, hg_Params[0].xyz < 0.00000f);\n    r2.xyz = mix(r3.xyz, r0.xyz, r1.www);\n    output.color0 = r2;\n    return output;\n}\n//MD5=79bd52d9:01ff5cee:20a838b9:e851623b\n//SIG=00000000:00000003:00000003:00000000:0001:0001:0005:0000:0000:0000:0006:0000:0002:02:0:1:0\n"
000000000146c8bf	cmoveq	%rax, %rcx
000000000146c8c3	movq	%rcx, %rax
000000000146c8c6	popq	%rbp
000000000146c8c7	retq
000000000146c8c8	nopl	(%rax,%rax)
