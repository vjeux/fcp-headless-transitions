__ZN17HgcColorIsolation10GetProgramEP10HGRenderer:
000000000145aef0	pushq	%rbp
000000000145aef1	movq	%rsp, %rbp
000000000145aef4	movq	%rsi, %rdi
000000000145aef7	movl	$0x60000, %esi                  ## imm = 0x60000
000000000145aefc	callq	0x1495ea4                       ## symbol stub for: __ZN10HGRenderer9GetTargetEj
000000000145af01	xorl	%ecx, %ecx
000000000145af03	cmpl	$0x60b10, %eax                  ## imm = 0x60B10
000000000145af08	leaq	0x24afb8(%rip), %rax            ## literal pool for: "//Metal1.0     \n//LEN=000000073d\nfragment FragmentOut fragmentFunc(VertexInOut frag [[ stage_in ]], \n    const constant float4* hg_Params [[ buffer(0) ]], \n    texture2d< float > hg_Texture0 [[ texture(0) ]], \n    sampler hg_Sampler0 [[ sampler(0) ]], \n    texture2d< float > hg_Texture1 [[ texture(1) ]], \n    sampler hg_Sampler1 [[ sampler(1) ]])\n{\n    const float4 c0 = float4(0.5000000000, 0.000000000, 0.000000000, 1.000000000);\n    float4 r0, r1, r2, r3, r4, r5;\n    FragmentOut output;\n\n    r0.xyz = clamp(hg_Texture0.sample(hg_Sampler0, frag._texCoord0.xy).xyz, 0.00000f, 1.00000f);\n    r0.w = c0.w;\n    r1.x = dot(r0, hg_Params[0]);\n    r2.x = dot(r0, hg_Params[1]);\n    r3.x = dot(r0, hg_Params[2]);\n    r4.x = dot(r0, hg_Params[3]);\n    r5.x = dot(r0, hg_Params[4]);\n    r0.x = dot(r0, hg_Params[5]);\n    r1.x = pow(fabs(r1.x), hg_Params[6].x);\n    r2.x = pow(fabs(r2.x), hg_Params[6].x);\n    r3.x = pow(fabs(r3.x), hg_Params[6].x);\n    r1.x = r1.x + r2.x;\n    r1.x = r1.x + r3.x;\n    r1.xw = pow(r1.xx, hg_Params[6].yy);\n    r4.x = pow(fabs(r4.x), hg_Params[6].x);\n    r5.x = pow(fabs(r5.x), hg_Params[6].x);\n    r0.x = pow(fabs(r0.x), hg_Params[6].x);\n    r4.x = r4.x + r5.x;\n    r4.x = r4.x + r0.x;\n    r4.xw = pow(r4.xx, hg_Params[6].yy);\n    r2.w = r4.w*r1.w + -r4.w;\n    r1.x = r1.x - r4.x;\n    r2.w = clamp(r2.w/r1.x, 0.00000f, 1.00000f);\n    r2.w = c0.w - r2.w;\n    r2.w = clamp(r2.w*hg_Params[8].w + hg_Params[7].w, 0.00000f, 1.00000f);\n    r2.x = r2.w*hg_Params[9].x;\n    r2.x = fmax(r2.x, c0.x);\n    r3.x = hg_Params[9].x - c0.x;\n    r2.x = fmin(r2.x, r3.x);\n    r2.y = c0.x;\n    output.color0.w = hg_Texture1.sample(hg_Sampler1, r2.xy).w;\n    output.color0.xyz = c0.www;\n    return output;\n}\n//MD5=90563df0:d1e83cf7:1539e1ed:e2dc6396\n//SIG=00000000:00000001:00000001:00000000:0001:000a:0006:0000:0000:0000:0002:0000:0001:02:0:1:0\n"
000000000145af0f	cmoveq	%rax, %rcx
000000000145af13	movq	%rcx, %rax
000000000145af16	popq	%rbp
000000000145af17	retq
000000000145af18	nopl	(%rax,%rax)
