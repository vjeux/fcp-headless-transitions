__ZNK39HgcAVASpatialAverageAdaptive_LowerField21InitProgramDescriptorEP19HGProgramDescriptor:
000000000021cef0	pushq	%rbp
000000000021cef1	movq	%rsp, %rbp
000000000021cef4	pushq	%r14
000000000021cef6	pushq	%rbx
000000000021cef7	subq	$0x80, %rsp
000000000021cefe	movq	%rsi, %rbx
000000000021cf01	leaq	0x6ef3fe(%rip), %rsi            ## literal pool for: "HgcAVASpatialAverageAdaptive_LowerField_hgc_visible"
000000000021cf08	leaq	0x6f3c17(%rip), %rdx            ## literal pool for: "//Metal1.0     \n//LEN=0000001720\n[[ visible ]] FragmentOut HgcAVASpatialAverageAdaptive_LowerField_hgc_visible(const constant float4* hg_Params, \n    texture2d< float > hg_Texture0, \n    sampler hg_Sampler0, \n    texture2d< float > hg_Texture1, \n    sampler hg_Sampler1,\n    float4 texCoord0,\n    float4 texCoord1,\n    float4 texCoord2,\n    float4 texCoord3,\n    float4 texCoord4,\n    float4 texCoord5,\n    float4 texCoord6)\n{\n    const float4 c0 = float4(3.000000000, -1.000000000, 4.000000000, 0.000000000);\n    const float4 c1 = float4(2.000000000, 0.000000000, 1.000000000, 3.000000000);\n    const float4 c2 = float4(4.000000000, 1.000000000, 0.5699999928, -0.07000000030);\n    const float4 c3 = float4(9999.000000, 0.5000000000, 0.000000000, 0.000000000);\n    float4 r0, r1, r2, r3, r4, r5, r6, r7, r8;\n    FragmentOut output;\n\n    r0.y = hg_Texture1.sample(hg_Sampler1, texCoord3.xy).y;\n    r1.y = hg_Texture1.sample(hg_Sampler1, texCoord2.xy).y;\n    r0.x = r0.y - r1.y;\n    r1.y = hg_Texture1.sample(hg_Sampler1, texCoord5.xy).y;\n    r2.y = hg_Texture1.sample(hg_Sampler1, texCoord4.xy).y;\n    r0.y = r1.y - r2.y;\n    r1.y = hg_Texture1.sample(hg_Sampler1, texCoord6.xy).y;\n    r2.xy = texCoord1.xy - c0.xy;\n    r2.xy = r2.xy*hg_Params[2].zw;\n    r2.y = hg_Texture1.sample(hg_Sampler1, r2.xy).y;\n    r0.z = r1.y - r2.y;\n    r1.xy = texCoord1.xy + c0.zw;\n    r1.xy = r1.xy*hg_Params[2].zw;\n    r1.y = hg_Texture1.sample(hg_Sampler1, r1.xy).y;\n    r2.xy = texCoord1.xy - c0.zy;\n    r2.xy = r2.xy*hg_Params[2].zw;\n    r2.y = hg_Texture1.sample(hg_Sampler1, r2.xy).y;\n    r0.w = r1.y - r2.y;\n    r0 = abs(r0);\n    r1.xy = texCoord1.xy + c0.yw;\n    r1.xy = r1.xy*hg_Params[2].zw;\n    r1.y = hg_Texture1.sample(hg_Sampler1, r1.xy).y;\n    r2.xy = texCoord1.xy - c0.yy;\n    r2.xy = r2.xy*hg_Params[2].zw;\n    r2.y = hg_Texture1.sample(hg_Sampler1, r2.xy).y;\n    r1.x = r1.y - r2.y;\n    r2.xy = texCoord1.xy - c1.xy;\n    r2.xy = r2.xy*hg_Params[2].zw;\n    r2.y = hg_Texture1.sample(hg_Sampler1, r2.xy).y;\n    r3.xy = texCoord1.xy + c1.xz;\n    r3.xy = r3.xy*hg_Params[2].zw;\n    r3.y = hg_Texture1.sample(hg_Sampler1, r3.xy).y;\n    r1.y = r2.y - r3.y;\n    r2.xy = texCoord1.xy - c0.xw;\n    r2.xy = r2.xy*hg_Params[2].zw;\n    r2.y = hg_Texture1.sample(hg_Sampler1, r2.xy).y;\n    r3.xy = texCoord1.xy + c1.wz;\n    r3.xy = r3.xy*hg_Params[2].zw;\n    r3.y = hg_Texture1.sample(hg_Sampler1, r3.xy).y;\n    r1.z = r2.y - r3.y;\n    r2.xy = texCoord1.xy - c0.zw;\n    r2.xy = r2.xy*hg_Params[2].zw;\n    r2.y = hg_Texture1.sample(hg_Sampler1, r2.xy).y;\n    r3.xy = texCoord1.xy + c2.xy;\n    r3.xy = r3.xy*hg_Params[2].zw;\n    r3.y = hg_Texture1.sample(hg_Sampler1, r3.xy).y;\n    r1.w = r2.y - r3.y;\n    r1 = abs(r1);\n    r2.xy = texCoord1.xy*hg_Params[2].zw;\n    r2.y = hg_Texture1.sample(hg_Sampler1, r2.xy).y;\n    r3.xy = texCoord1.xy + c1.yz;\n    r3.xy = r3.xy*hg_Params[2].zw;\n    r3.y = hg_Texture1.sample(hg_Sampler1, r3.xy).y;\n    r2.z = r2.y - r3.y;\n    r2.z = abs(r2.z);\n    r3 = float4(r0 < hg_Params[0].xxxx);\n    r4.x = dot(r3, 1.00000f);\n    r5 = float4(r1 < hg_Params[0].xxxx);\n    r4.y = dot(r5, 1.00000f);\n    r6.xy = hg_Params[0].yy - r0.xy;\n    r6.z = hg_Params[0].y - r2.z;\n    r6.xyz = float3(r6.xyz < c1.yyy);\n    r4.z = fmin(r6.x, r6.y);\n    r4.z = fmin(r6.z, r4.z);\n    r6.xy = hg_Params[0].yy - r1.xy;\n    r6.z = hg_Params[0].y - r2.z;\n    r6.xyz = float3(r6.xyz < c1.yyy);\n    r4.w = fmin(r6.x, r6.y);\n    r4.w = fmin(r6.z, r4.w);\n    r4.xy = r4.xy*r4.wz;\n    r4.xy = select(c2.yy, c1.yy, r4.xy <= 0.00000f);\n    r2.xy = texCoord0.xy - c1.yz;\n    r6.xy = texCoord0.xy - c1.yz;\n    r6.xy = r6.xy + hg_Params[1].xy;\n    r6.xy = r6.xy*hg_Params[1].zw;\n    r6 = hg_Texture0.sample(hg_Sampler0, r6.xy);\n    r7.xy = texCoord0.xy + hg_Params[1].xy;\n    r7.xy = r7.xy*hg_Params[1].zw;\n    r7 = hg_Texture0.sample(hg_Sampler0, r7.xy);\n    r6 = r6 + r7;\n    r6 = r6*c2.zzzz;\n    r7.xy = texCoord0.xy - c1.yx;\n    r7.xy = r7.xy + hg_Params[1].xy;\n    r7.xy = r7.xy*hg_Params[1].zw;\n    r7 = hg_Texture0.sample(hg_Sampler0, r7.xy);\n    r8.xy = texCoord0.xy + c1.yz;\n    r8.xy = r8.xy + hg_Params[1].xy;\n    r8.xy = r8.xy*hg_Params[1].zw;\n    r8 = hg_Texture0.sample(hg_Sampler0, r8.xy);\n    r7 = r7 + r8;\n    r6 = r7*c2.wwww + r6;\n    r4 = r4.xxxx - r4.yyyy;\n    r5 = select(c1.yyyy, r5, r4 < 0.00000f);\n    r5 = select(r5, r3, r4 > 0.00000f);\n    r1 = select(c1.yyyy, r1, r4 < 0.00000f);\n    r1 = select(r1, r0, r4 > 0.00000f);\n    r5 = select(c3.xxxx, r1, r5 > 0.00000f);\n    r5.xyz = fmin(r5.xyz, r5.yxw);\n    r5.xyz = fmin(r5.xyz, r5.zzx);\n    r5.xyz = r5.xyz - r1.xyz;\n    r8.xy = select(c0.zw, c1.wy, r5.zz >= 0.00000f);\n    r8.xy = select(r8.xy, c1.xy, r5.yy >= 0.00000f);\n    r8.xy = select(r8.xy, c1.zy, r5.xx >= 0.00000f);\n    r8.x = r8.x*r4.x;\n    r2.xy = r2.xy + r8.xy;\n    r2.xy = r2.xy + hg_Params[1].xy;\n    r2.xy = r2.xy*hg_Params[1].zw;\n    r2 = hg_Texture0.sample(hg_Sampler0, r2.xy);\n    r8.xy = texCoord0.xy - r8.xy;\n    r8.xy = r8.xy + hg_Params[1].xy;\n    r8.xy = r8.xy*hg_Params[1].zw;\n    r8 = hg_Texture0.sample(hg_Sampler0, r8.xy);\n    r2 = mix(r8, r2, c3.yyyy);\n    r7.xy = texCoord0.xy - c1.yz;\n    r7.xy = r7.xy + hg_Params[1].xy;\n    r7.xy = r7.xy*hg_Params[1].zw;\n    r7 = hg_Texture0.sample(hg_Sampler0, r7.xy);\n    r3.xy = texCoord0.xy + hg_Params[1].xy;\n    r3.xy = r3.xy*hg_Params[1].zw;\n    r3 = hg_Texture0.sample(hg_Sampler0, r3.xy);\n    r0.x = fmin(r7.x, r3.x);\n    r0.y = fmin(r7.x, r2.x);\n    r0.z = fmin(r3.x, r2.x);\n    r1.xz = float2(r0.yy >= r0.xz);\n    r5.yz = float2(r0.xx >= r0.yz);\n    r5.x = fmin(r5.y, r5.z);\n    r1.y = fmin(r1.x, r1.z);\n    r5.y = mix(r1.y, c1.y, r5.x);\n    r5.z = fmax(r5.x, r5.y);\n    r5.z = c2.y - r5.z;\n    r5.x = dot(r5.xyz, r0.xyz);\n    r8.x = r7.x - r5.x;\n    r8.y = r3.x - r5.x;\n    r2 = select(r2, r7, r8.xxxx == 0.00000f);\n    r2 = select(r2, r3, r8.yyyy == 0.00000f);\n    output.color0 = select(r2, r6, r4 == 0.00000f);\n    return output;\n}\n"
000000000021cf0f	movq	%rbx, %rdi
000000000021cf12	callq	__ZN19HGProgramDescriptor26SetVisibleShaderWithSourceEPKcS1_ ## HGProgramDescriptor::SetVisibleShaderWithSource(char const*, char const*)
000000000021cf17	leaq	0x6ef41c(%rip), %rsi            ## literal pool for: "HgcAVASpatialAverageAdaptive_LowerField"
000000000021cf1e	movq	%rbx, %rdi
000000000021cf21	callq	__ZN19HGProgramDescriptor23SetFragmentFunctionNameEPKc ## HGProgramDescriptor::SetFragmentFunctionName(char const*)
000000000021cf26	movl	$0x4, -0x90(%rbp)
000000000021cf30	movb	$0x16, -0x88(%rbp)
000000000021cf37	movabsq	$0x746e656d67617246, %rax       ## imm = 0x746E656D67617246
000000000021cf41	movq	%rax, -0x87(%rbp)
000000000021cf48	movl	$0x74754f74, -0x80(%rbp)        ## imm = 0x74754F74
000000000021cf4f	movb	$0x0, -0x7c(%rbp)
000000000021cf53	movaps	0x1ae136(%rip), %xmm0
000000000021cf5a	movups	%xmm0, -0x70(%rbp)
000000000021cf5e	leaq	-0x90(%rbp), %rsi
000000000021cf65	movq	%rbx, %rdi
000000000021cf68	callq	__ZN19HGProgramDescriptor16SetReturnBindingE9HGBinding ## HGProgramDescriptor::SetReturnBinding(HGBinding)
000000000021cf6d	testb	$0x1, -0x88(%rbp)
000000000021cf74	je	0x21cf7f
000000000021cf76	movq	-0x78(%rbp), %rdi
000000000021cf7a	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
000000000021cf7f	xorps	%xmm0, %xmm0
000000000021cf82	movaps	%xmm0, -0x60(%rbp)
000000000021cf86	movq	$0x0, -0x50(%rbp)
000000000021cf8e	movl	$0x2, -0x40(%rbp)
000000000021cf95	movb	$0xc, -0x38(%rbp)
000000000021cf99	movl	$0x616f6c66, -0x37(%rbp)        ## imm = 0x616F6C66
000000000021cfa0	movw	$0x3474, -0x33(%rbp)            ## imm = 0x3474
000000000021cfa6	movb	$0x0, -0x31(%rbp)
000000000021cfaa	movaps	0x642c9f(%rip), %xmm0
000000000021cfb1	movups	%xmm0, -0x20(%rbp)
000000000021cfb5	leaq	-0x60(%rbp), %rdi
000000000021cfb9	leaq	-0x40(%rbp), %rsi
000000000021cfbd	callq	__ZNSt3__16vectorI9HGBindingNS_9allocatorIS1_EEE24__emplace_back_slow_pathIJS1_EEEPS1_DpOT_ ## HGBinding* std::__1::vector<HGBinding, std::__1::allocator<HGBinding>>::__emplace_back_slow_path<HGBinding>(HGBinding&&)
000000000021cfc2	movq	%rax, -0x58(%rbp)
000000000021cfc6	testb	$0x1, -0x38(%rbp)
000000000021cfca	je	0x21cfd9
000000000021cfcc	movq	-0x28(%rbp), %rdi
000000000021cfd0	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
000000000021cfd5	movq	-0x58(%rbp), %rax
000000000021cfd9	movl	$0x9, -0x40(%rbp)
000000000021cfe0	leaq	-0x38(%rbp), %r14
000000000021cfe4	movb	$0x20, -0x38(%rbp)
000000000021cfe8	movups	0x6de722(%rip), %xmm0           ## literal pool for: "texture2d<float>"
000000000021cfef	movups	%xmm0, -0x37(%rbp)
000000000021cff3	movb	$0x0, -0x27(%rbp)
000000000021cff7	movaps	0x1ae092(%rip), %xmm0
000000000021cffe	movups	%xmm0, -0x20(%rbp)
000000000021d002	cmpq	-0x50(%rbp), %rax
000000000021d006	jae	0x21d040
000000000021d008	movl	$0x9, (%rax)
000000000021d00e	movq	0x10(%r14), %rcx
000000000021d012	movq	%rcx, 0x18(%rax)
000000000021d016	movups	(%r14), %xmm0
000000000021d01a	movups	%xmm0, 0x8(%rax)
000000000021d01e	xorps	%xmm0, %xmm0
000000000021d021	movups	%xmm0, (%r14)
000000000021d025	movq	$0x0, 0x10(%r14)
000000000021d02d	movups	0x18(%r14), %xmm0
000000000021d032	movups	%xmm0, 0x20(%rax)
000000000021d036	addq	$0x30, %rax
000000000021d03a	movq	%rax, -0x58(%rbp)
000000000021d03e	jmp	0x21d064
000000000021d040	leaq	-0x60(%rbp), %rdi
000000000021d044	leaq	-0x40(%rbp), %rsi
000000000021d048	callq	__ZNSt3__16vectorI9HGBindingNS_9allocatorIS1_EEE24__emplace_back_slow_pathIJS1_EEEPS1_DpOT_ ## HGBinding* std::__1::vector<HGBinding, std::__1::allocator<HGBinding>>::__emplace_back_slow_path<HGBinding>(HGBinding&&)
000000000021d04d	testb	$0x1, -0x38(%rbp)
000000000021d051	movq	%rax, -0x58(%rbp)
000000000021d055	je	0x21d064
000000000021d057	movq	-0x28(%rbp), %rdi
000000000021d05b	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
000000000021d060	movq	-0x58(%rbp), %rax
000000000021d064	movl	$0x6, -0x40(%rbp)
000000000021d06b	movb	$0xe, -0x38(%rbp)
000000000021d06f	movl	$0x706d6173, -0x37(%rbp)        ## imm = 0x706D6173
000000000021d076	movl	$0x72656c70, -0x34(%rbp)        ## imm = 0x72656C70
000000000021d07d	movb	$0x0, -0x30(%rbp)
000000000021d081	movaps	0x1ae008(%rip), %xmm0
000000000021d088	movups	%xmm0, -0x20(%rbp)
000000000021d08c	cmpq	-0x50(%rbp), %rax
000000000021d090	jae	0x21d0ca
000000000021d092	movl	$0x6, (%rax)
000000000021d098	movq	0x10(%r14), %rcx
000000000021d09c	movq	%rcx, 0x18(%rax)
000000000021d0a0	movups	(%r14), %xmm0
000000000021d0a4	movups	%xmm0, 0x8(%rax)
000000000021d0a8	xorps	%xmm0, %xmm0
000000000021d0ab	movups	%xmm0, (%r14)
000000000021d0af	movq	$0x0, 0x10(%r14)
000000000021d0b7	movups	0x18(%r14), %xmm0
000000000021d0bc	movups	%xmm0, 0x20(%rax)
000000000021d0c0	addq	$0x30, %rax
000000000021d0c4	movq	%rax, -0x58(%rbp)
000000000021d0c8	jmp	0x21d0ee
000000000021d0ca	leaq	-0x60(%rbp), %rdi
000000000021d0ce	leaq	-0x40(%rbp), %rsi
000000000021d0d2	callq	__ZNSt3__16vectorI9HGBindingNS_9allocatorIS1_EEE24__emplace_back_slow_pathIJS1_EEEPS1_DpOT_ ## HGBinding* std::__1::vector<HGBinding, std::__1::allocator<HGBinding>>::__emplace_back_slow_path<HGBinding>(HGBinding&&)
000000000021d0d7	testb	$0x1, -0x38(%rbp)
000000000021d0db	movq	%rax, -0x58(%rbp)
000000000021d0df	je	0x21d0ee
000000000021d0e1	movq	-0x28(%rbp), %rdi
000000000021d0e5	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
000000000021d0ea	movq	-0x58(%rbp), %rax
000000000021d0ee	movl	$0x9, -0x40(%rbp)
000000000021d0f5	movb	$0x20, -0x38(%rbp)
000000000021d0f9	movups	0x6de611(%rip), %xmm0           ## literal pool for: "texture2d<float>"
000000000021d100	movups	%xmm0, -0x37(%rbp)
000000000021d104	movb	$0x0, -0x27(%rbp)
000000000021d108	movaps	0x1adf81(%rip), %xmm0
000000000021d10f	movups	%xmm0, -0x20(%rbp)
000000000021d113	cmpq	-0x50(%rbp), %rax
000000000021d117	jae	0x21d151
000000000021d119	movl	$0x9, (%rax)
000000000021d11f	movq	0x10(%r14), %rcx
000000000021d123	movq	%rcx, 0x18(%rax)
000000000021d127	movups	(%r14), %xmm0
000000000021d12b	movups	%xmm0, 0x8(%rax)
000000000021d12f	xorps	%xmm0, %xmm0
000000000021d132	movups	%xmm0, (%r14)
000000000021d136	movq	$0x0, 0x10(%r14)
000000000021d13e	movups	0x18(%r14), %xmm0
000000000021d143	movups	%xmm0, 0x20(%rax)
000000000021d147	addq	$0x30, %rax
000000000021d14b	movq	%rax, -0x58(%rbp)
000000000021d14f	jmp	0x21d175
000000000021d151	leaq	-0x60(%rbp), %rdi
000000000021d155	leaq	-0x40(%rbp), %rsi
000000000021d159	callq	__ZNSt3__16vectorI9HGBindingNS_9allocatorIS1_EEE24__emplace_back_slow_pathIJS1_EEEPS1_DpOT_ ## HGBinding* std::__1::vector<HGBinding, std::__1::allocator<HGBinding>>::__emplace_back_slow_path<HGBinding>(HGBinding&&)
000000000021d15e	testb	$0x1, -0x38(%rbp)
000000000021d162	movq	%rax, -0x58(%rbp)
000000000021d166	je	0x21d175
000000000021d168	movq	-0x28(%rbp), %rdi
000000000021d16c	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
000000000021d171	movq	-0x58(%rbp), %rax
000000000021d175	movl	$0x6, -0x40(%rbp)
000000000021d17c	movb	$0xe, -0x38(%rbp)
000000000021d180	movl	$0x706d6173, -0x37(%rbp)        ## imm = 0x706D6173
000000000021d187	movl	$0x72656c70, -0x34(%rbp)        ## imm = 0x72656C70
000000000021d18e	movb	$0x0, -0x30(%rbp)
000000000021d192	movaps	0x1adef7(%rip), %xmm0
000000000021d199	movups	%xmm0, -0x20(%rbp)
000000000021d19d	cmpq	-0x50(%rbp), %rax
000000000021d1a1	jae	0x21d1db
000000000021d1a3	movl	$0x6, (%rax)
000000000021d1a9	movq	0x10(%r14), %rcx
000000000021d1ad	movq	%rcx, 0x18(%rax)
000000000021d1b1	movups	(%r14), %xmm0
000000000021d1b5	movups	%xmm0, 0x8(%rax)
000000000021d1b9	xorps	%xmm0, %xmm0
000000000021d1bc	movups	%xmm0, (%r14)
000000000021d1c0	movq	$0x0, 0x10(%r14)
000000000021d1c8	movups	0x18(%r14), %xmm0
000000000021d1cd	movups	%xmm0, 0x20(%rax)
000000000021d1d1	addq	$0x30, %rax
000000000021d1d5	movq	%rax, -0x58(%rbp)
000000000021d1d9	jmp	0x21d1ff
000000000021d1db	leaq	-0x60(%rbp), %rdi
000000000021d1df	leaq	-0x40(%rbp), %rsi
000000000021d1e3	callq	__ZNSt3__16vectorI9HGBindingNS_9allocatorIS1_EEE24__emplace_back_slow_pathIJS1_EEEPS1_DpOT_ ## HGBinding* std::__1::vector<HGBinding, std::__1::allocator<HGBinding>>::__emplace_back_slow_path<HGBinding>(HGBinding&&)
000000000021d1e8	testb	$0x1, -0x38(%rbp)
000000000021d1ec	movq	%rax, -0x58(%rbp)
000000000021d1f0	je	0x21d1ff
000000000021d1f2	movq	-0x28(%rbp), %rdi
000000000021d1f6	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
000000000021d1fb	movq	-0x58(%rbp), %rax
000000000021d1ff	movl	$0x8, -0x40(%rbp)
000000000021d206	movb	$0xc, -0x38(%rbp)
000000000021d20a	movl	$0x616f6c66, -0x37(%rbp)        ## imm = 0x616F6C66
000000000021d211	movw	$0x3474, -0x33(%rbp)            ## imm = 0x3474
000000000021d217	movb	$0x0, -0x31(%rbp)
000000000021d21b	movaps	0x1ade6e(%rip), %xmm0
000000000021d222	movups	%xmm0, -0x20(%rbp)
000000000021d226	cmpq	-0x50(%rbp), %rax
000000000021d22a	jae	0x21d264
000000000021d22c	movl	$0x8, (%rax)
000000000021d232	movq	0x10(%r14), %rcx
000000000021d236	movq	%rcx, 0x18(%rax)
000000000021d23a	movups	(%r14), %xmm0
000000000021d23e	movups	%xmm0, 0x8(%rax)
000000000021d242	xorps	%xmm0, %xmm0
000000000021d245	movups	%xmm0, (%r14)
000000000021d249	movq	$0x0, 0x10(%r14)
000000000021d251	movups	0x18(%r14), %xmm0
000000000021d256	movups	%xmm0, 0x20(%rax)
000000000021d25a	addq	$0x30, %rax
000000000021d25e	movq	%rax, -0x58(%rbp)
000000000021d262	jmp	0x21d288
000000000021d264	leaq	-0x60(%rbp), %rdi
000000000021d268	leaq	-0x40(%rbp), %rsi
000000000021d26c	callq	__ZNSt3__16vectorI9HGBindingNS_9allocatorIS1_EEE24__emplace_back_slow_pathIJS1_EEEPS1_DpOT_ ## HGBinding* std::__1::vector<HGBinding, std::__1::allocator<HGBinding>>::__emplace_back_slow_path<HGBinding>(HGBinding&&)
000000000021d271	testb	$0x1, -0x38(%rbp)
000000000021d275	movq	%rax, -0x58(%rbp)
000000000021d279	je	0x21d288
000000000021d27b	movq	-0x28(%rbp), %rdi
000000000021d27f	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
000000000021d284	movq	-0x58(%rbp), %rax
000000000021d288	movl	$0x8, -0x40(%rbp)
000000000021d28f	movb	$0xc, -0x38(%rbp)
000000000021d293	movl	$0x616f6c66, -0x37(%rbp)        ## imm = 0x616F6C66
000000000021d29a	movw	$0x3474, -0x33(%rbp)            ## imm = 0x3474
000000000021d2a0	movb	$0x0, -0x31(%rbp)
000000000021d2a4	movaps	0x1adde5(%rip), %xmm0
000000000021d2ab	movups	%xmm0, -0x20(%rbp)
000000000021d2af	cmpq	-0x50(%rbp), %rax
000000000021d2b3	jae	0x21d2ed
000000000021d2b5	movl	$0x8, (%rax)
000000000021d2bb	movq	0x10(%r14), %rcx
000000000021d2bf	movq	%rcx, 0x18(%rax)
000000000021d2c3	movups	(%r14), %xmm0
000000000021d2c7	movups	%xmm0, 0x8(%rax)
000000000021d2cb	xorps	%xmm0, %xmm0
000000000021d2ce	movups	%xmm0, (%r14)
000000000021d2d2	movq	$0x0, 0x10(%r14)
000000000021d2da	movups	0x18(%r14), %xmm0
000000000021d2df	movups	%xmm0, 0x20(%rax)
000000000021d2e3	addq	$0x30, %rax
000000000021d2e7	movq	%rax, -0x58(%rbp)
000000000021d2eb	jmp	0x21d311
000000000021d2ed	leaq	-0x60(%rbp), %rdi
000000000021d2f1	leaq	-0x40(%rbp), %rsi
000000000021d2f5	callq	__ZNSt3__16vectorI9HGBindingNS_9allocatorIS1_EEE24__emplace_back_slow_pathIJS1_EEEPS1_DpOT_ ## HGBinding* std::__1::vector<HGBinding, std::__1::allocator<HGBinding>>::__emplace_back_slow_path<HGBinding>(HGBinding&&)
000000000021d2fa	testb	$0x1, -0x38(%rbp)
000000000021d2fe	movq	%rax, -0x58(%rbp)
000000000021d302	je	0x21d311
000000000021d304	movq	-0x28(%rbp), %rdi
000000000021d308	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
000000000021d30d	movq	-0x58(%rbp), %rax
000000000021d311	movl	$0x8, -0x40(%rbp)
000000000021d318	movb	$0xc, -0x38(%rbp)
000000000021d31c	movl	$0x616f6c66, -0x37(%rbp)        ## imm = 0x616F6C66
000000000021d323	movw	$0x3474, -0x33(%rbp)            ## imm = 0x3474
000000000021d329	movb	$0x0, -0x31(%rbp)
000000000021d32d	movaps	0x1add5c(%rip), %xmm0
000000000021d334	movups	%xmm0, -0x20(%rbp)
000000000021d338	cmpq	-0x50(%rbp), %rax
000000000021d33c	jae	0x21d376
000000000021d33e	movl	$0x8, (%rax)
000000000021d344	movq	0x10(%r14), %rcx
000000000021d348	movq	%rcx, 0x18(%rax)
000000000021d34c	movups	(%r14), %xmm0
000000000021d350	movups	%xmm0, 0x8(%rax)
000000000021d354	xorps	%xmm0, %xmm0
000000000021d357	movups	%xmm0, (%r14)
000000000021d35b	movq	$0x0, 0x10(%r14)
000000000021d363	movups	0x18(%r14), %xmm0
000000000021d368	movups	%xmm0, 0x20(%rax)
000000000021d36c	addq	$0x30, %rax
000000000021d370	movq	%rax, -0x58(%rbp)
000000000021d374	jmp	0x21d39a
000000000021d376	leaq	-0x60(%rbp), %rdi
000000000021d37a	leaq	-0x40(%rbp), %rsi
000000000021d37e	callq	__ZNSt3__16vectorI9HGBindingNS_9allocatorIS1_EEE24__emplace_back_slow_pathIJS1_EEEPS1_DpOT_ ## HGBinding* std::__1::vector<HGBinding, std::__1::allocator<HGBinding>>::__emplace_back_slow_path<HGBinding>(HGBinding&&)
000000000021d383	testb	$0x1, -0x38(%rbp)
000000000021d387	movq	%rax, -0x58(%rbp)
000000000021d38b	je	0x21d39a
000000000021d38d	movq	-0x28(%rbp), %rdi
000000000021d391	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
000000000021d396	movq	-0x58(%rbp), %rax
000000000021d39a	movl	$0x8, -0x40(%rbp)
000000000021d3a1	movb	$0xc, -0x38(%rbp)
000000000021d3a5	movl	$0x616f6c66, -0x37(%rbp)        ## imm = 0x616F6C66
000000000021d3ac	movw	$0x3474, -0x33(%rbp)            ## imm = 0x3474
000000000021d3b2	movb	$0x0, -0x31(%rbp)
000000000021d3b6	movaps	0x1adcd3(%rip), %xmm0
000000000021d3bd	movups	%xmm0, -0x20(%rbp)
000000000021d3c1	cmpq	-0x50(%rbp), %rax
000000000021d3c5	jae	0x21d3ff
000000000021d3c7	movl	$0x8, (%rax)
000000000021d3cd	movq	0x10(%r14), %rcx
000000000021d3d1	movq	%rcx, 0x18(%rax)
000000000021d3d5	movups	(%r14), %xmm0
000000000021d3d9	movups	%xmm0, 0x8(%rax)
000000000021d3dd	xorps	%xmm0, %xmm0
000000000021d3e0	movups	%xmm0, (%r14)
000000000021d3e4	movq	$0x0, 0x10(%r14)
000000000021d3ec	movups	0x18(%r14), %xmm0
000000000021d3f1	movups	%xmm0, 0x20(%rax)
000000000021d3f5	addq	$0x30, %rax
000000000021d3f9	movq	%rax, -0x58(%rbp)
000000000021d3fd	jmp	0x21d423
000000000021d3ff	leaq	-0x60(%rbp), %rdi
000000000021d403	leaq	-0x40(%rbp), %rsi
000000000021d407	callq	__ZNSt3__16vectorI9HGBindingNS_9allocatorIS1_EEE24__emplace_back_slow_pathIJS1_EEEPS1_DpOT_ ## HGBinding* std::__1::vector<HGBinding, std::__1::allocator<HGBinding>>::__emplace_back_slow_path<HGBinding>(HGBinding&&)
000000000021d40c	testb	$0x1, -0x38(%rbp)
000000000021d410	movq	%rax, -0x58(%rbp)
000000000021d414	je	0x21d423
000000000021d416	movq	-0x28(%rbp), %rdi
000000000021d41a	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
000000000021d41f	movq	-0x58(%rbp), %rax
000000000021d423	movl	$0x8, -0x40(%rbp)
000000000021d42a	movb	$0xc, -0x38(%rbp)
000000000021d42e	movl	$0x616f6c66, -0x37(%rbp)        ## imm = 0x616F6C66
000000000021d435	movw	$0x3474, -0x33(%rbp)            ## imm = 0x3474
000000000021d43b	movb	$0x0, -0x31(%rbp)
000000000021d43f	movaps	0x1adc4a(%rip), %xmm0
000000000021d446	movups	%xmm0, -0x20(%rbp)
000000000021d44a	cmpq	-0x50(%rbp), %rax
000000000021d44e	jae	0x21d488
000000000021d450	movl	$0x8, (%rax)
000000000021d456	movq	0x10(%r14), %rcx
000000000021d45a	movq	%rcx, 0x18(%rax)
000000000021d45e	movups	(%r14), %xmm0
000000000021d462	movups	%xmm0, 0x8(%rax)
000000000021d466	xorps	%xmm0, %xmm0
000000000021d469	movups	%xmm0, (%r14)
000000000021d46d	movq	$0x0, 0x10(%r14)
000000000021d475	movups	0x18(%r14), %xmm0
000000000021d47a	movups	%xmm0, 0x20(%rax)
000000000021d47e	addq	$0x30, %rax
000000000021d482	movq	%rax, -0x58(%rbp)
000000000021d486	jmp	0x21d4ac
000000000021d488	leaq	-0x60(%rbp), %rdi
000000000021d48c	leaq	-0x40(%rbp), %rsi
000000000021d490	callq	__ZNSt3__16vectorI9HGBindingNS_9allocatorIS1_EEE24__emplace_back_slow_pathIJS1_EEEPS1_DpOT_ ## HGBinding* std::__1::vector<HGBinding, std::__1::allocator<HGBinding>>::__emplace_back_slow_path<HGBinding>(HGBinding&&)
000000000021d495	testb	$0x1, -0x38(%rbp)
000000000021d499	movq	%rax, -0x58(%rbp)
000000000021d49d	je	0x21d4ac
000000000021d49f	movq	-0x28(%rbp), %rdi
000000000021d4a3	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
000000000021d4a8	movq	-0x58(%rbp), %rax
000000000021d4ac	movl	$0x8, -0x40(%rbp)
000000000021d4b3	movb	$0xc, -0x38(%rbp)
000000000021d4b7	movl	$0x616f6c66, -0x37(%rbp)        ## imm = 0x616F6C66
000000000021d4be	movw	$0x3474, -0x33(%rbp)            ## imm = 0x3474
000000000021d4c4	movb	$0x0, -0x31(%rbp)
000000000021d4c8	movaps	0x1adbc1(%rip), %xmm0
000000000021d4cf	movups	%xmm0, -0x20(%rbp)
000000000021d4d3	cmpq	-0x50(%rbp), %rax
000000000021d4d7	jae	0x21d511
000000000021d4d9	movl	$0x8, (%rax)
000000000021d4df	movq	0x10(%r14), %rcx
000000000021d4e3	movq	%rcx, 0x18(%rax)
000000000021d4e7	movups	(%r14), %xmm0
000000000021d4eb	movups	%xmm0, 0x8(%rax)
000000000021d4ef	xorps	%xmm0, %xmm0
000000000021d4f2	movups	%xmm0, (%r14)
000000000021d4f6	movq	$0x0, 0x10(%r14)
000000000021d4fe	movups	0x18(%r14), %xmm0
000000000021d503	movups	%xmm0, 0x20(%rax)
000000000021d507	addq	$0x30, %rax
000000000021d50b	movq	%rax, -0x58(%rbp)
000000000021d50f	jmp	0x21d535
000000000021d511	leaq	-0x60(%rbp), %rdi
000000000021d515	leaq	-0x40(%rbp), %rsi
000000000021d519	callq	__ZNSt3__16vectorI9HGBindingNS_9allocatorIS1_EEE24__emplace_back_slow_pathIJS1_EEEPS1_DpOT_ ## HGBinding* std::__1::vector<HGBinding, std::__1::allocator<HGBinding>>::__emplace_back_slow_path<HGBinding>(HGBinding&&)
000000000021d51e	testb	$0x1, -0x38(%rbp)
000000000021d522	movq	%rax, -0x58(%rbp)
000000000021d526	je	0x21d535
000000000021d528	movq	-0x28(%rbp), %rdi
000000000021d52c	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
000000000021d531	movq	-0x58(%rbp), %rax
000000000021d535	movl	$0x8, -0x40(%rbp)
000000000021d53c	movb	$0xc, -0x38(%rbp)
000000000021d540	movl	$0x616f6c66, -0x37(%rbp)        ## imm = 0x616F6C66
000000000021d547	movw	$0x3474, -0x33(%rbp)            ## imm = 0x3474
000000000021d54d	movb	$0x0, -0x31(%rbp)
000000000021d551	movaps	0x1adb38(%rip), %xmm0
000000000021d558	movups	%xmm0, -0x20(%rbp)
000000000021d55c	cmpq	-0x50(%rbp), %rax
000000000021d560	jae	0x21d59a
000000000021d562	movl	$0x8, (%rax)
000000000021d568	movq	0x10(%r14), %rcx
000000000021d56c	movq	%rcx, 0x18(%rax)
000000000021d570	movups	(%r14), %xmm0
000000000021d574	movups	%xmm0, 0x8(%rax)
000000000021d578	xorps	%xmm0, %xmm0
000000000021d57b	movups	%xmm0, (%r14)
000000000021d57f	movq	$0x0, 0x10(%r14)
000000000021d587	movups	0x18(%r14), %xmm0
000000000021d58c	movups	%xmm0, 0x20(%rax)
000000000021d590	addq	$0x30, %rax
000000000021d594	movq	%rax, -0x58(%rbp)
000000000021d598	jmp	0x21d5ba
000000000021d59a	leaq	-0x60(%rbp), %rdi
000000000021d59e	leaq	-0x40(%rbp), %rsi
000000000021d5a2	callq	__ZNSt3__16vectorI9HGBindingNS_9allocatorIS1_EEE24__emplace_back_slow_pathIJS1_EEEPS1_DpOT_ ## HGBinding* std::__1::vector<HGBinding, std::__1::allocator<HGBinding>>::__emplace_back_slow_path<HGBinding>(HGBinding&&)
000000000021d5a7	testb	$0x1, -0x38(%rbp)
000000000021d5ab	movq	%rax, -0x58(%rbp)
000000000021d5af	je	0x21d5ba
000000000021d5b1	movq	-0x28(%rbp), %rdi
000000000021d5b5	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
000000000021d5ba	leaq	-0x60(%rbp), %rsi
000000000021d5be	movq	%rbx, %rdi
000000000021d5c1	callq	__ZN19HGProgramDescriptor19SetArgumentBindingsERKNSt3__16vectorI9HGBindingNS0_9allocatorIS2_EEEE ## HGProgramDescriptor::SetArgumentBindings(std::__1::vector<HGBinding, std::__1::allocator<HGBinding>> const&)
000000000021d5c6	movq	-0x60(%rbp), %rbx
000000000021d5ca	testq	%rbx, %rbx
000000000021d5cd	je	0x21d608
000000000021d5cf	movq	-0x58(%rbp), %r14
000000000021d5d3	movq	%rbx, %rdi
000000000021d5d6	cmpq	%r14, %rbx
000000000021d5d9	jne	0x21d5e9
000000000021d5db	jmp	0x21d5ff
000000000021d5dd	nopl	(%rax)
000000000021d5e0	addq	$-0x30, %r14
000000000021d5e4	cmpq	%rbx, %r14
000000000021d5e7	je	0x21d5fb
000000000021d5e9	testb	$0x1, -0x28(%r14)
000000000021d5ee	je	0x21d5e0
000000000021d5f0	movq	-0x18(%r14), %rdi
000000000021d5f4	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
000000000021d5f9	jmp	0x21d5e0
000000000021d5fb	movq	-0x60(%rbp), %rdi
000000000021d5ff	movq	%rbx, -0x58(%rbp)
000000000021d603	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
000000000021d608	addq	$0x80, %rsp
000000000021d60f	popq	%rbx
000000000021d610	popq	%r14
000000000021d612	popq	%rbp
000000000021d613	retq
000000000021d614	jmp	0x21d62f
000000000021d616	jmp	0x21d62f
000000000021d618	jmp	0x21d62f
000000000021d61a	jmp	0x21d62f
000000000021d61c	jmp	0x21d62f
000000000021d61e	jmp	0x21d62f
000000000021d620	jmp	0x21d62f
000000000021d622	jmp	0x21d62f
000000000021d624	jmp	0x21d62f
000000000021d626	jmp	0x21d62f
000000000021d628	jmp	0x21d62f
000000000021d62a	movq	%rax, %rbx
000000000021d62d	jmp	0x21d641
000000000021d62f	movq	%rax, %rbx
000000000021d632	testb	$0x1, -0x38(%rbp)
000000000021d636	je	0x21d641
000000000021d638	movq	-0x28(%rbp), %rdi
000000000021d63c	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
000000000021d641	leaq	-0x60(%rbp), %rdi
000000000021d645	callq	__ZNSt3__16vectorI9HGBindingNS_9allocatorIS1_EEED1B9nqe210106Ev ## std::__1::vector<HGBinding, std::__1::allocator<HGBinding>>::~vector[abi:nqe210106]()
000000000021d64a	movq	%rbx, %rdi
000000000021d64d	callq	0x3c4e02                        ## symbol stub for: __Unwind_Resume
000000000021d652	movq	%rax, %rbx
000000000021d655	testb	$0x1, -0x88(%rbp)
000000000021d65c	je	0x21d64a
000000000021d65e	movq	-0x78(%rbp), %rdi
000000000021d662	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
000000000021d667	movq	%rbx, %rdi
000000000021d66a	callq	0x3c4e02                        ## symbol stub for: __Unwind_Resume
000000000021d66f	nop
