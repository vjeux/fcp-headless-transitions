__ZN25HgcBT2100_HLG_InverseOETF10GetProgramEP10HGRenderer:
00000000003b12f0	pushq	%rbp
00000000003b12f1	movq	%rsp, %rbp
00000000003b12f4	movq	%rsi, %rdi
00000000003b12f7	movl	$0x60000, %esi                  ## imm = 0x60000
00000000003b12fc	callq	__ZN10HGRenderer9GetTargetEj    ## HGRenderer::GetTarget(unsigned int)
00000000003b1301	xorl	%ecx, %ecx
00000000003b1303	cmpl	$0x60b10, %eax                  ## imm = 0x60B10
00000000003b1308	leaq	0x62ce0c(%rip), %rax            ## literal pool for: "//Metal1.0     \n//LEN=0000000407\nfragment FragmentOut fragmentFunc(VertexInOut frag [[ stage_in ]], \n    const constant float4* hg_Params [[ buffer(0) ]], \n    texture2d< float > hg_Texture0 [[ texture(0) ]], \n    sampler hg_Sampler0 [[ sampler(0) ]])\n{\n    const float4 c0 = float4(0.000000000, 0.004999999888, 0.000000000, 0.000000000);\n    float4 r0, r1, r2;\n    FragmentOut output;\n\n    r0 = hg_Texture0.sample(hg_Sampler0, frag._texCoord0.xy);\n    r1.xyz = fmax(r0.xyz, c0.xxx);\n    r0.xyz = r1.xyz*hg_Params[1].xxx + hg_Params[1].yyy;\n    r2.xyz = r1.xyz*r1.xyz;\n    r1.w = float(r0.w >= c0.y);\n    r2.xyz = r2.xyz*hg_Params[0].yyy;\n    r0.xyz = exp2(r0.xyz);\n    r0.xyz = r0.xyz*hg_Params[1].zzz + hg_Params[1].www;\n    r1.xyz = float3(hg_Params[0].xxx < r1.xyz);\n    output.color0.xyz = select(r2.xyz, r0.xyz, -r1.xyz < 0.00000f);\n    output.color0.w = r1.w*r0.w;\n    return output;\n}\n//MD5=9d3926b3:95147086:aed26591:6ed500f8\n//SIG=00000000:00000001:00000001:00000000:0001:0002:0003:0000:0000:0000:0002:0000:0001:01:0:1:0\n"
00000000003b130f	cmoveq	%rax, %rcx
00000000003b1313	movq	%rcx, %rax
00000000003b1316	popq	%rbp
00000000003b1317	retq
00000000003b1318	nopl	(%rax,%rax)
