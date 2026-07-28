__ZN22LiMaterialLayerUniformC2ERKS_:
00000000001e6080	pushq	%rbp
00000000001e6081	movq	%rsp, %rbp
00000000001e6084	pushq	%r15
00000000001e6086	pushq	%r14
00000000001e6088	pushq	%r13
00000000001e608a	pushq	%r12
00000000001e608c	pushq	%rbx
00000000001e608d	subq	$0x198, %rsp                    ## imm = 0x198
00000000001e6094	movq	%rsi, %r13
00000000001e6097	movq	%rdi, %rbx
00000000001e609a	movq	0x10(%rsi), %rsi
00000000001e609e	leaq	__ZTVN8ProShade4VarTINS_11UniformNodeEEE(%rip), %r15 ## vtable for ProShade::VarT<ProShade::UniformNode>
00000000001e60a5	addq	$0x10, %r15
00000000001e60a9	movq	%r15, (%rdi)
00000000001e60ac	movq	%rsi, 0x10(%rdi)
00000000001e60b0	testq	%rsi, %rsi
00000000001e60b3	je	0x1e60be
00000000001e60b5	movq	(%rsi), %rax
00000000001e60b8	addq	-0x18(%rax), %rsi
00000000001e60bc	jmp	0x1e60c0
00000000001e60be	xorl	%esi, %esi
00000000001e60c0	leaq	0x18(%rbx), %r12
00000000001e60c4	movq	%r12, %rdi
00000000001e60c7	callq	0x6ddadc                        ## symbol stub for: __ZN13PCSharedCountC1EP13PCShared_base
00000000001e60cc	leaq	__ZTVN8ProShade7UniformE(%rip), %rax ## vtable for ProShade::Uniform
00000000001e60d3	addq	$0x10, %rax
00000000001e60d7	movq	%rax, -0x40(%rbp)
00000000001e60db	movq	%rax, (%rbx)
00000000001e60de	movq	0x30(%r13), %rsi
00000000001e60e2	movq	%r15, 0x20(%rbx)
00000000001e60e6	movq	%rsi, 0x30(%rbx)
00000000001e60ea	testq	%rsi, %rsi
00000000001e60ed	je	0x1e60f8
00000000001e60ef	movq	(%rsi), %rax
00000000001e60f2	addq	-0x18(%rax), %rsi
00000000001e60f6	jmp	0x1e60fa
00000000001e60f8	xorl	%esi, %esi
00000000001e60fa	leaq	0x38(%rbx), %r14
00000000001e60fe	movq	%r14, %rdi
00000000001e6101	movq	%r12, -0x1b8(%rbp)
00000000001e6108	callq	0x6ddadc                        ## symbol stub for: __ZN13PCSharedCountC1EP13PCShared_base
00000000001e610d	movq	-0x40(%rbp), %rax
00000000001e6111	movq	%rax, 0x20(%rbx)
00000000001e6115	movq	0x50(%r13), %rsi
00000000001e6119	movq	%r15, 0x40(%rbx)
00000000001e611d	movq	%rsi, 0x50(%rbx)
00000000001e6121	testq	%rsi, %rsi
00000000001e6124	je	0x1e612f
00000000001e6126	movq	(%rsi), %rax
00000000001e6129	addq	-0x18(%rax), %rsi
00000000001e612d	jmp	0x1e6131
00000000001e612f	xorl	%esi, %esi
00000000001e6131	leaq	0x58(%rbx), %rdi
00000000001e6135	movq	%rdi, -0x1a8(%rbp)
00000000001e613c	movq	%r14, -0x1b0(%rbp)
00000000001e6143	callq	0x6ddadc                        ## symbol stub for: __ZN13PCSharedCountC1EP13PCShared_base
00000000001e6148	movq	-0x40(%rbp), %rax
00000000001e614c	movq	%rax, 0x40(%rbx)
00000000001e6150	movq	0x70(%r13), %rsi
00000000001e6154	movq	%r15, 0x60(%rbx)
00000000001e6158	movq	%rsi, 0x70(%rbx)
00000000001e615c	testq	%rsi, %rsi
00000000001e615f	je	0x1e616a
00000000001e6161	movq	(%rsi), %rax
00000000001e6164	addq	-0x18(%rax), %rsi
00000000001e6168	jmp	0x1e616c
00000000001e616a	xorl	%esi, %esi
00000000001e616c	leaq	0x78(%rbx), %rdi
00000000001e6170	movq	%rdi, -0x1a0(%rbp)
00000000001e6177	callq	0x6ddadc                        ## symbol stub for: __ZN13PCSharedCountC1EP13PCShared_base
00000000001e617c	movq	-0x40(%rbp), %rax
00000000001e6180	movq	%rax, 0x60(%rbx)
00000000001e6184	movq	0x90(%r13), %rsi
00000000001e618b	movq	%r15, 0x80(%rbx)
00000000001e6192	movq	%rsi, 0x90(%rbx)
00000000001e6199	testq	%rsi, %rsi
00000000001e619c	je	0x1e61a7
00000000001e619e	movq	(%rsi), %rax
00000000001e61a1	addq	-0x18(%rax), %rsi
00000000001e61a5	jmp	0x1e61a9
00000000001e61a7	xorl	%esi, %esi
00000000001e61a9	leaq	0x98(%rbx), %rdi
00000000001e61b0	movq	%rdi, -0x198(%rbp)
00000000001e61b7	callq	0x6ddadc                        ## symbol stub for: __ZN13PCSharedCountC1EP13PCShared_base
00000000001e61bc	movq	-0x40(%rbp), %rax
00000000001e61c0	movq	%rax, 0x80(%rbx)
00000000001e61c7	movq	0xb0(%r13), %rsi
00000000001e61ce	movq	%r15, 0xa0(%rbx)
00000000001e61d5	movq	%rsi, 0xb0(%rbx)
00000000001e61dc	testq	%rsi, %rsi
00000000001e61df	je	0x1e61ea
00000000001e61e1	movq	(%rsi), %rax
00000000001e61e4	addq	-0x18(%rax), %rsi
00000000001e61e8	jmp	0x1e61ec
00000000001e61ea	xorl	%esi, %esi
00000000001e61ec	leaq	0xb8(%rbx), %rdi
00000000001e61f3	movq	%rdi, -0x190(%rbp)
00000000001e61fa	callq	0x6ddadc                        ## symbol stub for: __ZN13PCSharedCountC1EP13PCShared_base
00000000001e61ff	movq	-0x40(%rbp), %rax
00000000001e6203	movq	%rax, 0xa0(%rbx)
00000000001e620a	movq	0xd0(%r13), %rsi
00000000001e6211	movq	%r15, 0xc0(%rbx)
00000000001e6218	movq	%rsi, 0xd0(%rbx)
00000000001e621f	testq	%rsi, %rsi
00000000001e6222	je	0x1e622d
00000000001e6224	movq	(%rsi), %rax
00000000001e6227	addq	-0x18(%rax), %rsi
00000000001e622b	jmp	0x1e622f
00000000001e622d	xorl	%esi, %esi
00000000001e622f	leaq	0xd8(%rbx), %rdi
00000000001e6236	movq	%rdi, -0x188(%rbp)
00000000001e623d	callq	0x6ddadc                        ## symbol stub for: __ZN13PCSharedCountC1EP13PCShared_base
00000000001e6242	movq	-0x40(%rbp), %rax
00000000001e6246	movq	%rax, 0xc0(%rbx)
00000000001e624d	movq	0xf0(%r13), %rsi
00000000001e6254	movq	%r15, 0xe0(%rbx)
00000000001e625b	movq	%rsi, 0xf0(%rbx)
00000000001e6262	testq	%rsi, %rsi
00000000001e6265	je	0x1e6270
00000000001e6267	movq	(%rsi), %rax
00000000001e626a	addq	-0x18(%rax), %rsi
00000000001e626e	jmp	0x1e6272
00000000001e6270	xorl	%esi, %esi
00000000001e6272	leaq	0xf8(%rbx), %rdi
00000000001e6279	movq	%rdi, -0x180(%rbp)
00000000001e6280	callq	0x6ddadc                        ## symbol stub for: __ZN13PCSharedCountC1EP13PCShared_base
00000000001e6285	movq	-0x40(%rbp), %rax
00000000001e6289	movq	%rax, 0xe0(%rbx)
00000000001e6290	movq	0x110(%r13), %rsi
00000000001e6297	movq	%r15, 0x100(%rbx)
00000000001e629e	movq	%rsi, 0x110(%rbx)
00000000001e62a5	testq	%rsi, %rsi
00000000001e62a8	je	0x1e62b3
00000000001e62aa	movq	(%rsi), %rax
00000000001e62ad	addq	-0x18(%rax), %rsi
00000000001e62b1	jmp	0x1e62b5
00000000001e62b3	xorl	%esi, %esi
00000000001e62b5	leaq	0x118(%rbx), %rdi
00000000001e62bc	movq	%rdi, -0x178(%rbp)
00000000001e62c3	movq	%r15, -0x30(%rbp)
00000000001e62c7	callq	0x6ddadc                        ## symbol stub for: __ZN13PCSharedCountC1EP13PCShared_base
00000000001e62cc	movq	-0x40(%rbp), %rax
00000000001e62d0	movq	%rax, 0x100(%rbx)
00000000001e62d7	movq	0x130(%r13), %rsi
00000000001e62de	movq	%r15, 0x120(%rbx)
00000000001e62e5	movq	%rsi, 0x130(%rbx)
00000000001e62ec	testq	%rsi, %rsi
00000000001e62ef	je	0x1e62fa
00000000001e62f1	movq	(%rsi), %rax
00000000001e62f4	addq	-0x18(%rax), %rsi
00000000001e62f8	jmp	0x1e62fc
00000000001e62fa	xorl	%esi, %esi
00000000001e62fc	leaq	0x138(%rbx), %rdi
00000000001e6303	movq	%rdi, -0x170(%rbp)
00000000001e630a	callq	0x6ddadc                        ## symbol stub for: __ZN13PCSharedCountC1EP13PCShared_base
00000000001e630f	movq	-0x40(%rbp), %rax
00000000001e6313	movq	%rax, 0x120(%rbx)
00000000001e631a	movq	0x150(%r13), %rsi
00000000001e6321	movq	%r15, 0x140(%rbx)
00000000001e6328	movq	%rsi, 0x150(%rbx)
00000000001e632f	testq	%rsi, %rsi
00000000001e6332	je	0x1e633d
00000000001e6334	movq	(%rsi), %rax
00000000001e6337	addq	-0x18(%rax), %rsi
00000000001e633b	jmp	0x1e633f
00000000001e633d	xorl	%esi, %esi
00000000001e633f	leaq	0x158(%rbx), %rdi
00000000001e6346	movq	%rdi, -0x168(%rbp)
00000000001e634d	callq	0x6ddadc                        ## symbol stub for: __ZN13PCSharedCountC1EP13PCShared_base
00000000001e6352	movq	-0x40(%rbp), %rax
00000000001e6356	movq	%rax, 0x140(%rbx)
00000000001e635d	leaq	__ZTVN8ProShade4VarTINS_11SamplerNodeEEE(%rip), %rax ## vtable for ProShade::VarT<ProShade::SamplerNode>
00000000001e6364	addq	$0x10, %rax
00000000001e6368	movq	%rax, -0x38(%rbp)
00000000001e636c	movq	%rax, 0x160(%rbx)
00000000001e6373	movzbl	0x168(%r13), %eax
00000000001e637b	movb	%al, 0x168(%rbx)
00000000001e6381	movq	0x170(%r13), %rax
00000000001e6388	movq	%rax, 0x170(%rbx)
00000000001e638f	leaq	0x178(%rbx), %r14
00000000001e6396	leaq	0x178(%r13), %rsi
00000000001e639d	movq	%r14, %rdi
00000000001e63a0	callq	0x6ddae2                        ## symbol stub for: __ZN13PCSharedCountC1ERKS_
00000000001e63a5	leaq	__ZTVN8ProShade7SamplerE(%rip), %rax ## vtable for ProShade::Sampler
00000000001e63ac	addq	$0x10, %rax
00000000001e63b0	movq	%rax, -0x48(%rbp)
00000000001e63b4	movq	%rax, 0x160(%rbx)
00000000001e63bb	movq	0x190(%r13), %rsi
00000000001e63c2	movq	%r15, 0x180(%rbx)
00000000001e63c9	movq	%rsi, 0x190(%rbx)
00000000001e63d0	testq	%rsi, %rsi
00000000001e63d3	je	0x1e63de
00000000001e63d5	movq	(%rsi), %rax
00000000001e63d8	addq	-0x18(%rax), %rsi
00000000001e63dc	jmp	0x1e63e0
00000000001e63de	xorl	%esi, %esi
00000000001e63e0	leaq	0x160(%rbx), %rax
00000000001e63e7	movq	%rax, -0xa0(%rbp)
00000000001e63ee	leaq	0x198(%rbx), %r15
00000000001e63f5	movq	%r15, %rdi
00000000001e63f8	callq	0x6ddadc                        ## symbol stub for: __ZN13PCSharedCountC1EP13PCShared_base
00000000001e63fd	leaq	__ZTVN8ProShade9Uniform4fE(%rip), %rax ## vtable for ProShade::Uniform4f
00000000001e6404	addq	$0x10, %rax
00000000001e6408	movq	%rax, -0x58(%rbp)
00000000001e640c	movq	%rax, 0x180(%rbx)
00000000001e6413	movq	0x1b0(%r13), %rsi
00000000001e641a	movq	-0x30(%rbp), %rax
00000000001e641e	movq	%rax, 0x1a0(%rbx)
00000000001e6425	movq	%rsi, 0x1b0(%rbx)
00000000001e642c	testq	%rsi, %rsi
00000000001e642f	je	0x1e643a
00000000001e6431	movq	(%rsi), %rax
00000000001e6434	addq	-0x18(%rax), %rsi
00000000001e6438	jmp	0x1e643c
00000000001e643a	xorl	%esi, %esi
00000000001e643c	leaq	0x1b8(%rbx), %rdi
00000000001e6443	callq	0x6ddadc                        ## symbol stub for: __ZN13PCSharedCountC1EP13PCShared_base
00000000001e6448	leaq	__ZTVN8ProShade10Uniform44fE(%rip), %rax ## vtable for ProShade::Uniform44f
00000000001e644f	addq	$0x10, %rax
00000000001e6453	movq	%rax, -0x50(%rbp)
00000000001e6457	movq	%rax, 0x1a0(%rbx)
00000000001e645e	leaq	__ZTVN8ProShade9Sampler2DE(%rip), %r12 ## vtable for ProShade::Sampler2D
00000000001e6465	addq	$0x10, %r12
00000000001e6469	movq	%r12, 0x160(%rbx)
00000000001e6470	movq	-0x38(%rbp), %rax
00000000001e6474	movq	%rax, 0x1c0(%rbx)
00000000001e647b	movzbl	0x1c8(%r13), %eax
00000000001e6483	movb	%al, 0x1c8(%rbx)
00000000001e6489	movq	0x1d0(%r13), %rax
00000000001e6490	movq	%rax, 0x1d0(%rbx)
00000000001e6497	leaq	0x1d8(%rbx), %r14
00000000001e649e	leaq	0x1d8(%r13), %rsi
00000000001e64a5	movq	%r14, %rdi
00000000001e64a8	callq	0x6ddae2                        ## symbol stub for: __ZN13PCSharedCountC1ERKS_
00000000001e64ad	movq	-0x48(%rbp), %rax
00000000001e64b1	movq	%rax, 0x1c0(%rbx)
00000000001e64b8	movq	0x1f0(%r13), %rsi
00000000001e64bf	movq	-0x30(%rbp), %rax
00000000001e64c3	movq	%rax, 0x1e0(%rbx)
00000000001e64ca	movq	%rsi, 0x1f0(%rbx)
00000000001e64d1	testq	%rsi, %rsi
00000000001e64d4	je	0x1e64df
00000000001e64d6	movq	(%rsi), %rax
00000000001e64d9	addq	-0x18(%rax), %rsi
00000000001e64dd	jmp	0x1e64e1
00000000001e64df	xorl	%esi, %esi
00000000001e64e1	leaq	0x1c0(%rbx), %rax
00000000001e64e8	movq	%rax, -0x98(%rbp)
00000000001e64ef	leaq	0x1f8(%rbx), %r15
00000000001e64f6	movq	%r15, %rdi
00000000001e64f9	callq	0x6ddadc                        ## symbol stub for: __ZN13PCSharedCountC1EP13PCShared_base
00000000001e64fe	movq	-0x58(%rbp), %rax
00000000001e6502	movq	%rax, 0x1e0(%rbx)
00000000001e6509	movq	0x210(%r13), %rsi
00000000001e6510	movq	-0x30(%rbp), %rax
00000000001e6514	movq	%rax, 0x200(%rbx)
00000000001e651b	movq	%rsi, 0x210(%rbx)
00000000001e6522	testq	%rsi, %rsi
00000000001e6525	je	0x1e6530
00000000001e6527	movq	(%rsi), %rax
00000000001e652a	addq	-0x18(%rax), %rsi
00000000001e652e	jmp	0x1e6532
00000000001e6530	xorl	%esi, %esi
00000000001e6532	leaq	0x218(%rbx), %rdi
00000000001e6539	callq	0x6ddadc                        ## symbol stub for: __ZN13PCSharedCountC1EP13PCShared_base
00000000001e653e	movq	-0x50(%rbp), %rax
00000000001e6542	movq	%rax, 0x200(%rbx)
00000000001e6549	movq	%r12, 0x1c0(%rbx)
00000000001e6550	movq	-0x38(%rbp), %rax
00000000001e6554	movq	%rax, 0x220(%rbx)
00000000001e655b	movzbl	0x228(%r13), %eax
00000000001e6563	movb	%al, 0x228(%rbx)
00000000001e6569	movq	0x230(%r13), %rax
00000000001e6570	movq	%rax, 0x230(%rbx)
00000000001e6577	leaq	0x238(%rbx), %r14
00000000001e657e	leaq	0x238(%r13), %rsi
00000000001e6585	movq	%r14, %rdi
00000000001e6588	callq	0x6ddae2                        ## symbol stub for: __ZN13PCSharedCountC1ERKS_
00000000001e658d	movq	-0x48(%rbp), %rax
00000000001e6591	movq	%rax, 0x220(%rbx)
00000000001e6598	movq	0x250(%r13), %rsi
00000000001e659f	movq	-0x30(%rbp), %rax
00000000001e65a3	movq	%rax, 0x240(%rbx)
00000000001e65aa	movq	%rsi, 0x250(%rbx)
00000000001e65b1	testq	%rsi, %rsi
00000000001e65b4	je	0x1e65bf
00000000001e65b6	movq	(%rsi), %rax
00000000001e65b9	addq	-0x18(%rax), %rsi
00000000001e65bd	jmp	0x1e65c1
00000000001e65bf	xorl	%esi, %esi
00000000001e65c1	leaq	0x220(%rbx), %rax
00000000001e65c8	movq	%rax, -0x90(%rbp)
00000000001e65cf	leaq	0x258(%rbx), %r15
00000000001e65d6	movq	%r15, %rdi
00000000001e65d9	callq	0x6ddadc                        ## symbol stub for: __ZN13PCSharedCountC1EP13PCShared_base
00000000001e65de	movq	-0x58(%rbp), %rax
00000000001e65e2	movq	%rax, 0x240(%rbx)
00000000001e65e9	movq	0x270(%r13), %rsi
00000000001e65f0	movq	-0x30(%rbp), %rax
00000000001e65f4	movq	%rax, 0x260(%rbx)
00000000001e65fb	movq	%rsi, 0x270(%rbx)
00000000001e6602	testq	%rsi, %rsi
00000000001e6605	je	0x1e6610
00000000001e6607	movq	(%rsi), %rax
00000000001e660a	addq	-0x18(%rax), %rsi
00000000001e660e	jmp	0x1e6612
00000000001e6610	xorl	%esi, %esi
00000000001e6612	leaq	0x278(%rbx), %rdi
00000000001e6619	callq	0x6ddadc                        ## symbol stub for: __ZN13PCSharedCountC1EP13PCShared_base
00000000001e661e	movq	-0x50(%rbp), %rax
00000000001e6622	movq	%rax, 0x260(%rbx)
00000000001e6629	movq	%r12, 0x220(%rbx)
00000000001e6630	movq	-0x38(%rbp), %rax
00000000001e6634	movq	%rax, 0x280(%rbx)
00000000001e663b	movzbl	0x288(%r13), %eax
00000000001e6643	movb	%al, 0x288(%rbx)
00000000001e6649	movq	0x290(%r13), %rax
00000000001e6650	movq	%rax, 0x290(%rbx)
00000000001e6657	leaq	0x298(%rbx), %r14
00000000001e665e	leaq	0x298(%r13), %rsi
00000000001e6665	movq	%r14, %rdi
00000000001e6668	callq	0x6ddae2                        ## symbol stub for: __ZN13PCSharedCountC1ERKS_
00000000001e666d	movq	-0x48(%rbp), %rax
00000000001e6671	movq	%rax, 0x280(%rbx)
00000000001e6678	movq	0x2b0(%r13), %rsi
00000000001e667f	movq	-0x30(%rbp), %rax
00000000001e6683	movq	%rax, 0x2a0(%rbx)
00000000001e668a	movq	%rsi, 0x2b0(%rbx)
00000000001e6691	testq	%rsi, %rsi
00000000001e6694	je	0x1e669f
00000000001e6696	movq	(%rsi), %rax
00000000001e6699	addq	-0x18(%rax), %rsi
00000000001e669d	jmp	0x1e66a1
00000000001e669f	xorl	%esi, %esi
00000000001e66a1	leaq	0x280(%rbx), %rax
00000000001e66a8	movq	%rax, -0x88(%rbp)
00000000001e66af	leaq	0x2b8(%rbx), %r15
00000000001e66b6	movq	%r15, %rdi
00000000001e66b9	callq	0x6ddadc                        ## symbol stub for: __ZN13PCSharedCountC1EP13PCShared_base
00000000001e66be	movq	-0x58(%rbp), %rax
00000000001e66c2	movq	%rax, 0x2a0(%rbx)
00000000001e66c9	movq	0x2d0(%r13), %rsi
00000000001e66d0	movq	-0x30(%rbp), %rax
00000000001e66d4	movq	%rax, 0x2c0(%rbx)
00000000001e66db	movq	%rsi, 0x2d0(%rbx)
00000000001e66e2	testq	%rsi, %rsi
00000000001e66e5	je	0x1e66f0
00000000001e66e7	movq	(%rsi), %rax
00000000001e66ea	addq	-0x18(%rax), %rsi
00000000001e66ee	jmp	0x1e66f2
00000000001e66f0	xorl	%esi, %esi
00000000001e66f2	leaq	0x2d8(%rbx), %rdi
00000000001e66f9	callq	0x6ddadc                        ## symbol stub for: __ZN13PCSharedCountC1EP13PCShared_base
00000000001e66fe	movq	-0x50(%rbp), %rax
00000000001e6702	movq	%rax, 0x2c0(%rbx)
00000000001e6709	movq	%r12, 0x280(%rbx)
00000000001e6710	movq	-0x38(%rbp), %rax
00000000001e6714	movq	%rax, 0x2e0(%rbx)
00000000001e671b	movzbl	0x2e8(%r13), %eax
00000000001e6723	movb	%al, 0x2e8(%rbx)
00000000001e6729	movq	0x2f0(%r13), %rax
00000000001e6730	movq	%rax, 0x2f0(%rbx)
00000000001e6737	leaq	0x2f8(%rbx), %r14
00000000001e673e	leaq	0x2f8(%r13), %rsi
00000000001e6745	movq	%r14, %rdi
00000000001e6748	callq	0x6ddae2                        ## symbol stub for: __ZN13PCSharedCountC1ERKS_
00000000001e674d	movq	-0x48(%rbp), %rax
00000000001e6751	movq	%rax, 0x2e0(%rbx)
00000000001e6758	movq	0x310(%r13), %rsi
00000000001e675f	movq	-0x30(%rbp), %rax
00000000001e6763	movq	%rax, 0x300(%rbx)
00000000001e676a	movq	%rsi, 0x310(%rbx)
00000000001e6771	testq	%rsi, %rsi
00000000001e6774	je	0x1e677f
00000000001e6776	movq	(%rsi), %rax
00000000001e6779	addq	-0x18(%rax), %rsi
00000000001e677d	jmp	0x1e6781
00000000001e677f	xorl	%esi, %esi
00000000001e6781	leaq	0x2e0(%rbx), %rax
00000000001e6788	movq	%rax, -0x80(%rbp)
00000000001e678c	leaq	0x318(%rbx), %r15
00000000001e6793	movq	%r15, %rdi
00000000001e6796	callq	0x6ddadc                        ## symbol stub for: __ZN13PCSharedCountC1EP13PCShared_base
00000000001e679b	movq	-0x58(%rbp), %rax
00000000001e679f	movq	%rax, 0x300(%rbx)
00000000001e67a6	movq	0x330(%r13), %rsi
00000000001e67ad	movq	-0x30(%rbp), %rax
00000000001e67b1	movq	%rax, 0x320(%rbx)
00000000001e67b8	movq	%rsi, 0x330(%rbx)
00000000001e67bf	testq	%rsi, %rsi
00000000001e67c2	je	0x1e67cd
00000000001e67c4	movq	(%rsi), %rax
00000000001e67c7	addq	-0x18(%rax), %rsi
00000000001e67cb	jmp	0x1e67cf
00000000001e67cd	xorl	%esi, %esi
00000000001e67cf	leaq	0x338(%rbx), %rdi
00000000001e67d6	callq	0x6ddadc                        ## symbol stub for: __ZN13PCSharedCountC1EP13PCShared_base
00000000001e67db	movq	-0x50(%rbp), %rax
00000000001e67df	movq	%rax, 0x320(%rbx)
00000000001e67e6	movq	%r12, 0x2e0(%rbx)
00000000001e67ed	movq	-0x38(%rbp), %rax
00000000001e67f1	movq	%rax, 0x340(%rbx)
00000000001e67f8	movzbl	0x348(%r13), %eax
00000000001e6800	movb	%al, 0x348(%rbx)
00000000001e6806	movq	0x350(%r13), %rax
00000000001e680d	movq	%rax, 0x350(%rbx)
00000000001e6814	leaq	0x358(%rbx), %r14
00000000001e681b	leaq	0x358(%r13), %rsi
00000000001e6822	movq	%r14, %rdi
00000000001e6825	callq	0x6ddae2                        ## symbol stub for: __ZN13PCSharedCountC1ERKS_
00000000001e682a	movq	-0x48(%rbp), %rax
00000000001e682e	movq	%rax, 0x340(%rbx)
00000000001e6835	movq	0x370(%r13), %rsi
00000000001e683c	movq	-0x30(%rbp), %rax
00000000001e6840	movq	%rax, 0x360(%rbx)
00000000001e6847	movq	%rsi, 0x370(%rbx)
00000000001e684e	testq	%rsi, %rsi
00000000001e6851	je	0x1e685c
00000000001e6853	movq	(%rsi), %rax
00000000001e6856	addq	-0x18(%rax), %rsi
00000000001e685a	jmp	0x1e685e
00000000001e685c	xorl	%esi, %esi
00000000001e685e	leaq	0x340(%rbx), %rax
00000000001e6865	movq	%rax, -0x78(%rbp)
00000000001e6869	leaq	0x378(%rbx), %r15
00000000001e6870	movq	%r15, %rdi
00000000001e6873	callq	0x6ddadc                        ## symbol stub for: __ZN13PCSharedCountC1EP13PCShared_base
00000000001e6878	movq	-0x58(%rbp), %rax
00000000001e687c	movq	%rax, 0x360(%rbx)
00000000001e6883	movq	0x390(%r13), %rsi
00000000001e688a	movq	-0x30(%rbp), %rax
00000000001e688e	movq	%rax, 0x380(%rbx)
00000000001e6895	movq	%rsi, 0x390(%rbx)
00000000001e689c	testq	%rsi, %rsi
00000000001e689f	je	0x1e68aa
00000000001e68a1	movq	(%rsi), %rax
00000000001e68a4	addq	-0x18(%rax), %rsi
00000000001e68a8	jmp	0x1e68ac
00000000001e68aa	xorl	%esi, %esi
00000000001e68ac	leaq	0x398(%rbx), %rdi
00000000001e68b3	callq	0x6ddadc                        ## symbol stub for: __ZN13PCSharedCountC1EP13PCShared_base
00000000001e68b8	movq	-0x50(%rbp), %rax
00000000001e68bc	movq	%rax, 0x380(%rbx)
00000000001e68c3	movq	%r12, 0x340(%rbx)
00000000001e68ca	movq	0x3b0(%r13), %rsi
00000000001e68d1	movq	-0x30(%rbp), %r15
00000000001e68d5	movq	%r15, 0x3a0(%rbx)
00000000001e68dc	movq	%rsi, 0x3b0(%rbx)
00000000001e68e3	testq	%rsi, %rsi
00000000001e68e6	je	0x1e68f1
00000000001e68e8	movq	(%rsi), %rax
00000000001e68eb	addq	-0x18(%rax), %rsi
00000000001e68ef	jmp	0x1e68f3
00000000001e68f1	xorl	%esi, %esi
00000000001e68f3	movq	-0x40(%rbp), %r14
00000000001e68f7	leaq	0x3b8(%rbx), %rdi
00000000001e68fe	movq	%rdi, -0x160(%rbp)
00000000001e6905	callq	0x6ddadc                        ## symbol stub for: __ZN13PCSharedCountC1EP13PCShared_base
00000000001e690a	movq	%r14, 0x3a0(%rbx)
00000000001e6911	movq	0x3d0(%r13), %rsi
00000000001e6918	movq	%r15, 0x3c0(%rbx)
00000000001e691f	movq	%rsi, 0x3d0(%rbx)
00000000001e6926	testq	%rsi, %rsi
00000000001e6929	je	0x1e6934
00000000001e692b	movq	(%rsi), %rax
00000000001e692e	addq	-0x18(%rax), %rsi
00000000001e6932	jmp	0x1e6936
00000000001e6934	xorl	%esi, %esi
00000000001e6936	leaq	0x3d8(%rbx), %rdi
00000000001e693d	movq	%rdi, -0x158(%rbp)
00000000001e6944	callq	0x6ddadc                        ## symbol stub for: __ZN13PCSharedCountC1EP13PCShared_base
00000000001e6949	movq	%r14, 0x3c0(%rbx)
00000000001e6950	movq	-0x38(%rbp), %rax
00000000001e6954	movq	%rax, 0x3e0(%rbx)
00000000001e695b	movzbl	0x3e8(%r13), %eax
00000000001e6963	movb	%al, 0x3e8(%rbx)
00000000001e6969	movq	0x3f0(%r13), %rax
00000000001e6970	movq	%rax, 0x3f0(%rbx)
00000000001e6977	leaq	0x3f8(%rbx), %r14
00000000001e697e	leaq	0x3f8(%r13), %rsi
00000000001e6985	movq	%r14, %rdi
00000000001e6988	callq	0x6ddae2                        ## symbol stub for: __ZN13PCSharedCountC1ERKS_
00000000001e698d	movq	-0x48(%rbp), %rax
00000000001e6991	movq	%rax, 0x3e0(%rbx)
00000000001e6998	movq	0x410(%r13), %rsi
00000000001e699f	movq	%r15, 0x400(%rbx)
00000000001e69a6	movq	%rsi, 0x410(%rbx)
00000000001e69ad	testq	%rsi, %rsi
00000000001e69b0	je	0x1e69bb
00000000001e69b2	movq	(%rsi), %rax
00000000001e69b5	addq	-0x18(%rax), %rsi
00000000001e69b9	jmp	0x1e69bd
00000000001e69bb	xorl	%esi, %esi
00000000001e69bd	leaq	0x3e0(%rbx), %rax
00000000001e69c4	movq	%rax, -0x70(%rbp)
00000000001e69c8	leaq	0x418(%rbx), %r15
00000000001e69cf	movq	%r15, %rdi
00000000001e69d2	callq	0x6ddadc                        ## symbol stub for: __ZN13PCSharedCountC1EP13PCShared_base
00000000001e69d7	movq	-0x58(%rbp), %rax
00000000001e69db	movq	%rax, 0x400(%rbx)
00000000001e69e2	movq	0x430(%r13), %rsi
00000000001e69e9	movq	-0x30(%rbp), %rax
00000000001e69ed	movq	%rax, 0x420(%rbx)
00000000001e69f4	movq	%rsi, 0x430(%rbx)
00000000001e69fb	testq	%rsi, %rsi
00000000001e69fe	je	0x1e6a09
00000000001e6a00	movq	(%rsi), %rax
00000000001e6a03	addq	-0x18(%rax), %rsi
00000000001e6a07	jmp	0x1e6a0b
00000000001e6a09	xorl	%esi, %esi
00000000001e6a0b	leaq	0x438(%rbx), %rdi
00000000001e6a12	callq	0x6ddadc                        ## symbol stub for: __ZN13PCSharedCountC1EP13PCShared_base
00000000001e6a17	movq	-0x50(%rbp), %rax
00000000001e6a1b	movq	%rax, 0x420(%rbx)
00000000001e6a22	movq	%r12, 0x3e0(%rbx)
00000000001e6a29	movq	0x450(%r13), %rsi
00000000001e6a30	movq	-0x30(%rbp), %r15
00000000001e6a34	movq	%r15, 0x440(%rbx)
00000000001e6a3b	movq	%rsi, 0x450(%rbx)
00000000001e6a42	testq	%rsi, %rsi
00000000001e6a45	je	0x1e6a50
00000000001e6a47	movq	(%rsi), %rax
00000000001e6a4a	addq	-0x18(%rax), %rsi
00000000001e6a4e	jmp	0x1e6a52
00000000001e6a50	xorl	%esi, %esi
00000000001e6a52	movq	-0x40(%rbp), %r14
00000000001e6a56	leaq	0x458(%rbx), %rdi
00000000001e6a5d	movq	%rdi, -0x150(%rbp)
00000000001e6a64	callq	0x6ddadc                        ## symbol stub for: __ZN13PCSharedCountC1EP13PCShared_base
00000000001e6a69	movq	%r14, 0x440(%rbx)
00000000001e6a70	movq	0x470(%r13), %rsi
00000000001e6a77	movq	%r15, 0x460(%rbx)
00000000001e6a7e	movq	%rsi, 0x470(%rbx)
00000000001e6a85	testq	%rsi, %rsi
00000000001e6a88	je	0x1e6a93
00000000001e6a8a	movq	(%rsi), %rax
00000000001e6a8d	addq	-0x18(%rax), %rsi
00000000001e6a91	jmp	0x1e6a95
00000000001e6a93	xorl	%esi, %esi
00000000001e6a95	leaq	0x478(%rbx), %rdi
00000000001e6a9c	movq	%rdi, -0x148(%rbp)
00000000001e6aa3	callq	0x6ddadc                        ## symbol stub for: __ZN13PCSharedCountC1EP13PCShared_base
00000000001e6aa8	movq	%r14, 0x460(%rbx)
00000000001e6aaf	movq	-0x38(%rbp), %rax
00000000001e6ab3	movq	%rax, 0x480(%rbx)
00000000001e6aba	movzbl	0x488(%r13), %eax
00000000001e6ac2	movb	%al, 0x488(%rbx)
00000000001e6ac8	movq	0x490(%r13), %rax
00000000001e6acf	movq	%rax, 0x490(%rbx)
00000000001e6ad6	leaq	0x498(%rbx), %r14
00000000001e6add	leaq	0x498(%r13), %rsi
00000000001e6ae4	movq	%r14, %rdi
00000000001e6ae7	callq	0x6ddae2                        ## symbol stub for: __ZN13PCSharedCountC1ERKS_
00000000001e6aec	movq	-0x48(%rbp), %rax
00000000001e6af0	movq	%rax, 0x480(%rbx)
00000000001e6af7	movq	0x4b0(%r13), %rsi
00000000001e6afe	movq	%r15, 0x4a0(%rbx)
00000000001e6b05	movq	%rsi, 0x4b0(%rbx)
00000000001e6b0c	testq	%rsi, %rsi
00000000001e6b0f	je	0x1e6b1a
00000000001e6b11	movq	(%rsi), %rax
00000000001e6b14	addq	-0x18(%rax), %rsi
00000000001e6b18	jmp	0x1e6b1c
00000000001e6b1a	xorl	%esi, %esi
00000000001e6b1c	leaq	0x480(%rbx), %rax
00000000001e6b23	movq	%rax, -0x68(%rbp)
00000000001e6b27	leaq	0x4b8(%rbx), %r15
00000000001e6b2e	movq	%r15, %rdi
00000000001e6b31	callq	0x6ddadc                        ## symbol stub for: __ZN13PCSharedCountC1EP13PCShared_base
00000000001e6b36	movq	-0x58(%rbp), %rax
00000000001e6b3a	movq	%rax, 0x4a0(%rbx)
00000000001e6b41	movq	0x4d0(%r13), %rsi
00000000001e6b48	movq	-0x30(%rbp), %rax
00000000001e6b4c	movq	%rax, 0x4c0(%rbx)
00000000001e6b53	movq	%rsi, 0x4d0(%rbx)
00000000001e6b5a	testq	%rsi, %rsi
00000000001e6b5d	je	0x1e6b68
00000000001e6b5f	movq	(%rsi), %rax
00000000001e6b62	addq	-0x18(%rax), %rsi
00000000001e6b66	jmp	0x1e6b6a
00000000001e6b68	xorl	%esi, %esi
00000000001e6b6a	leaq	0x4d8(%rbx), %rdi
00000000001e6b71	callq	0x6ddadc                        ## symbol stub for: __ZN13PCSharedCountC1EP13PCShared_base
00000000001e6b76	movq	-0x50(%rbp), %rax
00000000001e6b7a	movq	%rax, 0x4c0(%rbx)
00000000001e6b81	movq	%r12, 0x480(%rbx)
00000000001e6b88	movq	-0x38(%rbp), %rax
00000000001e6b8c	movq	%rax, 0x4e0(%rbx)
00000000001e6b93	movzbl	0x4e8(%r13), %eax
00000000001e6b9b	movb	%al, 0x4e8(%rbx)
00000000001e6ba1	movq	0x4f0(%r13), %rax
00000000001e6ba8	movq	%rax, 0x4f0(%rbx)
00000000001e6baf	leaq	0x4f8(%rbx), %r14
00000000001e6bb6	leaq	0x4f8(%r13), %rsi
00000000001e6bbd	movq	%r14, %rdi
00000000001e6bc0	callq	0x6ddae2                        ## symbol stub for: __ZN13PCSharedCountC1ERKS_
00000000001e6bc5	movq	-0x48(%rbp), %rax
00000000001e6bc9	movq	%rax, 0x4e0(%rbx)
00000000001e6bd0	movq	0x510(%r13), %rsi
00000000001e6bd7	movq	-0x30(%rbp), %rax
00000000001e6bdb	movq	%rax, 0x500(%rbx)
00000000001e6be2	movq	%rsi, 0x510(%rbx)
00000000001e6be9	testq	%rsi, %rsi
00000000001e6bec	je	0x1e6bf7
00000000001e6bee	movq	(%rsi), %rax
00000000001e6bf1	addq	-0x18(%rax), %rsi
00000000001e6bf5	jmp	0x1e6bf9
00000000001e6bf7	xorl	%esi, %esi
00000000001e6bf9	leaq	0x4e0(%rbx), %rax
00000000001e6c00	movq	%rax, -0x60(%rbp)
00000000001e6c04	leaq	0x518(%rbx), %r15
00000000001e6c0b	movq	%r15, %rdi
00000000001e6c0e	callq	0x6ddadc                        ## symbol stub for: __ZN13PCSharedCountC1EP13PCShared_base
00000000001e6c13	movq	-0x58(%rbp), %rax
00000000001e6c17	movq	%rax, 0x500(%rbx)
00000000001e6c1e	movq	0x530(%r13), %rsi
00000000001e6c25	movq	-0x30(%rbp), %rax
00000000001e6c29	movq	%rax, 0x520(%rbx)
00000000001e6c30	movq	%rsi, 0x530(%rbx)
00000000001e6c37	testq	%rsi, %rsi
00000000001e6c3a	je	0x1e6c45
00000000001e6c3c	movq	(%rsi), %rax
00000000001e6c3f	addq	-0x18(%rax), %rsi
00000000001e6c43	jmp	0x1e6c47
00000000001e6c45	xorl	%esi, %esi
00000000001e6c47	leaq	0x538(%rbx), %rdi
00000000001e6c4e	callq	0x6ddadc                        ## symbol stub for: __ZN13PCSharedCountC1EP13PCShared_base
00000000001e6c53	movq	-0x50(%rbp), %rax
00000000001e6c57	movq	%rax, 0x520(%rbx)
00000000001e6c5e	movq	%r12, 0x4e0(%rbx)
00000000001e6c65	movq	-0x38(%rbp), %rax
00000000001e6c69	movq	%rax, 0x540(%rbx)
00000000001e6c70	movzbl	0x548(%r13), %eax
00000000001e6c78	movb	%al, 0x548(%rbx)
00000000001e6c7e	movq	0x550(%r13), %rax
00000000001e6c85	movq	%rax, 0x550(%rbx)
00000000001e6c8c	leaq	0x558(%rbx), %r14
00000000001e6c93	leaq	0x558(%r13), %rsi
00000000001e6c9a	movq	%r14, %rdi
00000000001e6c9d	callq	0x6ddae2                        ## symbol stub for: __ZN13PCSharedCountC1ERKS_
00000000001e6ca2	movq	-0x48(%rbp), %rax
00000000001e6ca6	movq	%rax, 0x540(%rbx)
00000000001e6cad	movq	0x570(%r13), %rsi
00000000001e6cb4	movq	-0x30(%rbp), %rax
00000000001e6cb8	movq	%rax, 0x560(%rbx)
00000000001e6cbf	movq	%rsi, 0x570(%rbx)
00000000001e6cc6	testq	%rsi, %rsi
00000000001e6cc9	je	0x1e6cd4
00000000001e6ccb	movq	(%rsi), %rax
00000000001e6cce	addq	-0x18(%rax), %rsi
00000000001e6cd2	jmp	0x1e6cd6
00000000001e6cd4	xorl	%esi, %esi
00000000001e6cd6	leaq	0x540(%rbx), %rax
00000000001e6cdd	movq	%rax, -0x48(%rbp)
00000000001e6ce1	leaq	0x578(%rbx), %r15
00000000001e6ce8	movq	%r15, %rdi
00000000001e6ceb	callq	0x6ddadc                        ## symbol stub for: __ZN13PCSharedCountC1EP13PCShared_base
00000000001e6cf0	movq	-0x58(%rbp), %rax
00000000001e6cf4	movq	%rax, 0x560(%rbx)
00000000001e6cfb	movq	0x590(%r13), %rsi
00000000001e6d02	movq	-0x30(%rbp), %rax
00000000001e6d06	movq	%rax, 0x580(%rbx)
00000000001e6d0d	movq	%rsi, 0x590(%rbx)
00000000001e6d14	testq	%rsi, %rsi
00000000001e6d17	je	0x1e6d22
00000000001e6d19	movq	(%rsi), %rax
00000000001e6d1c	addq	-0x18(%rax), %rsi
00000000001e6d20	jmp	0x1e6d24
00000000001e6d22	xorl	%esi, %esi
00000000001e6d24	leaq	0x598(%rbx), %rdi
00000000001e6d2b	callq	0x6ddadc                        ## symbol stub for: __ZN13PCSharedCountC1EP13PCShared_base
00000000001e6d30	movq	-0x50(%rbp), %rax
00000000001e6d34	movq	%rax, 0x580(%rbx)
00000000001e6d3b	movq	%r12, 0x540(%rbx)
00000000001e6d42	movq	0x5b0(%r13), %rsi
00000000001e6d49	movq	-0x30(%rbp), %r15
00000000001e6d4d	movq	%r15, 0x5a0(%rbx)
00000000001e6d54	movq	%rsi, 0x5b0(%rbx)
00000000001e6d5b	testq	%rsi, %rsi
00000000001e6d5e	je	0x1e6d69
00000000001e6d60	movq	(%rsi), %rax
00000000001e6d63	addq	-0x18(%rax), %rsi
00000000001e6d67	jmp	0x1e6d6b
00000000001e6d69	xorl	%esi, %esi
00000000001e6d6b	movq	-0x40(%rbp), %r14
00000000001e6d6f	leaq	0x5b8(%rbx), %r12
00000000001e6d76	movq	%r12, %rdi
00000000001e6d79	callq	0x6ddadc                        ## symbol stub for: __ZN13PCSharedCountC1EP13PCShared_base
00000000001e6d7e	movq	%r14, 0x5a0(%rbx)
00000000001e6d85	movq	0x5d0(%r13), %rsi
00000000001e6d8c	movq	%r15, 0x5c0(%rbx)
00000000001e6d93	movq	%rsi, 0x5d0(%rbx)
00000000001e6d9a	testq	%rsi, %rsi
00000000001e6d9d	je	0x1e6da8
00000000001e6d9f	movq	(%rsi), %rax
00000000001e6da2	addq	-0x18(%rax), %rsi
00000000001e6da6	jmp	0x1e6daa
00000000001e6da8	xorl	%esi, %esi
00000000001e6daa	leaq	0x5d8(%rbx), %rdi
00000000001e6db1	movq	%rdi, -0x58(%rbp)
00000000001e6db5	movq	%r12, -0x38(%rbp)
00000000001e6db9	callq	0x6ddadc                        ## symbol stub for: __ZN13PCSharedCountC1EP13PCShared_base
00000000001e6dbe	movq	%r14, 0x5c0(%rbx)
00000000001e6dc5	movq	0x5f0(%r13), %rsi
00000000001e6dcc	movq	%r15, 0x5e0(%rbx)
00000000001e6dd3	movq	%rsi, 0x5f0(%rbx)
00000000001e6dda	testq	%rsi, %rsi
00000000001e6ddd	je	0x1e6de8
00000000001e6ddf	movq	(%rsi), %rax
00000000001e6de2	addq	-0x18(%rax), %rsi
00000000001e6de6	jmp	0x1e6dea
00000000001e6de8	xorl	%esi, %esi
00000000001e6dea	leaq	0x5f8(%rbx), %rdi
00000000001e6df1	movq	%rdi, -0x50(%rbp)
00000000001e6df5	callq	0x6ddadc                        ## symbol stub for: __ZN13PCSharedCountC1EP13PCShared_base
00000000001e6dfa	movq	%r14, 0x5e0(%rbx)
00000000001e6e01	movq	0x610(%r13), %rsi
00000000001e6e08	movq	%r15, 0x600(%rbx)
00000000001e6e0f	movq	%rsi, 0x610(%rbx)
00000000001e6e16	testq	%rsi, %rsi
00000000001e6e19	je	0x1e6e24
00000000001e6e1b	movq	(%rsi), %rax
00000000001e6e1e	addq	-0x18(%rax), %rsi
00000000001e6e22	jmp	0x1e6e26
00000000001e6e24	xorl	%esi, %esi
00000000001e6e26	leaq	0x618(%rbx), %rdi
00000000001e6e2d	movq	%rdi, -0x140(%rbp)
00000000001e6e34	callq	0x6ddadc                        ## symbol stub for: __ZN13PCSharedCountC1EP13PCShared_base
00000000001e6e39	movq	%r14, 0x600(%rbx)
00000000001e6e40	movq	0x630(%r13), %rsi
00000000001e6e47	movq	%r15, 0x620(%rbx)
00000000001e6e4e	movq	%rsi, 0x630(%rbx)
00000000001e6e55	testq	%rsi, %rsi
00000000001e6e58	je	0x1e6e63
00000000001e6e5a	movq	(%rsi), %rax
00000000001e6e5d	addq	-0x18(%rax), %rsi
00000000001e6e61	jmp	0x1e6e65
00000000001e6e63	xorl	%esi, %esi
00000000001e6e65	leaq	0x638(%rbx), %rdi
00000000001e6e6c	movq	%rdi, -0x138(%rbp)
00000000001e6e73	callq	0x6ddadc                        ## symbol stub for: __ZN13PCSharedCountC1EP13PCShared_base
00000000001e6e78	movq	%r14, 0x620(%rbx)
00000000001e6e7f	movq	0x650(%r13), %rsi
00000000001e6e86	movq	%r15, 0x640(%rbx)
00000000001e6e8d	movq	%rsi, 0x650(%rbx)
00000000001e6e94	testq	%rsi, %rsi
00000000001e6e97	je	0x1e6ea2
00000000001e6e99	movq	(%rsi), %rax
00000000001e6e9c	addq	-0x18(%rax), %rsi
00000000001e6ea0	jmp	0x1e6ea4
00000000001e6ea2	xorl	%esi, %esi
00000000001e6ea4	leaq	0x658(%rbx), %rdi
00000000001e6eab	movq	%rdi, -0x130(%rbp)
00000000001e6eb2	callq	0x6ddadc                        ## symbol stub for: __ZN13PCSharedCountC1EP13PCShared_base
00000000001e6eb7	movq	%r14, 0x640(%rbx)
00000000001e6ebe	movq	0x670(%r13), %rsi
00000000001e6ec5	movq	%r15, 0x660(%rbx)
00000000001e6ecc	movq	%rsi, 0x670(%rbx)
00000000001e6ed3	testq	%rsi, %rsi
00000000001e6ed6	je	0x1e6ee1
00000000001e6ed8	movq	(%rsi), %rax
00000000001e6edb	addq	-0x18(%rax), %rsi
00000000001e6edf	jmp	0x1e6ee3
00000000001e6ee1	xorl	%esi, %esi
00000000001e6ee3	leaq	0x678(%rbx), %rdi
00000000001e6eea	movq	%rdi, -0x128(%rbp)
00000000001e6ef1	callq	0x6ddadc                        ## symbol stub for: __ZN13PCSharedCountC1EP13PCShared_base
00000000001e6ef6	movq	%r14, 0x660(%rbx)
00000000001e6efd	movq	0x690(%r13), %rsi
00000000001e6f04	movq	%r15, 0x680(%rbx)
00000000001e6f0b	movq	%rsi, 0x690(%rbx)
00000000001e6f12	testq	%rsi, %rsi
00000000001e6f15	je	0x1e6f20
00000000001e6f17	movq	(%rsi), %rax
00000000001e6f1a	addq	-0x18(%rax), %rsi
00000000001e6f1e	jmp	0x1e6f22
00000000001e6f20	xorl	%esi, %esi
00000000001e6f22	leaq	0x698(%rbx), %rdi
00000000001e6f29	movq	%rdi, -0x120(%rbp)
00000000001e6f30	callq	0x6ddadc                        ## symbol stub for: __ZN13PCSharedCountC1EP13PCShared_base
00000000001e6f35	movq	%r14, 0x680(%rbx)
00000000001e6f3c	movq	0x6b0(%r13), %rsi
00000000001e6f43	movq	%r15, 0x6a0(%rbx)
00000000001e6f4a	movq	%rsi, 0x6b0(%rbx)
00000000001e6f51	testq	%rsi, %rsi
00000000001e6f54	je	0x1e6f5f
00000000001e6f56	movq	(%rsi), %rax
00000000001e6f59	addq	-0x18(%rax), %rsi
00000000001e6f5d	jmp	0x1e6f61
00000000001e6f5f	xorl	%esi, %esi
00000000001e6f61	leaq	0x6b8(%rbx), %rdi
00000000001e6f68	movq	%rdi, -0x118(%rbp)
00000000001e6f6f	callq	0x6ddadc                        ## symbol stub for: __ZN13PCSharedCountC1EP13PCShared_base
00000000001e6f74	movq	%r14, 0x6a0(%rbx)
00000000001e6f7b	movq	0x6d0(%r13), %rsi
00000000001e6f82	movq	%r15, 0x6c0(%rbx)
00000000001e6f89	movq	%rsi, 0x6d0(%rbx)
00000000001e6f90	testq	%rsi, %rsi
00000000001e6f93	je	0x1e6f9e
00000000001e6f95	movq	(%rsi), %rax
00000000001e6f98	addq	-0x18(%rax), %rsi
00000000001e6f9c	jmp	0x1e6fa0
00000000001e6f9e	xorl	%esi, %esi
00000000001e6fa0	leaq	0x6d8(%rbx), %rdi
00000000001e6fa7	movq	%rdi, -0x110(%rbp)
00000000001e6fae	callq	0x6ddadc                        ## symbol stub for: __ZN13PCSharedCountC1EP13PCShared_base
00000000001e6fb3	movq	%r14, 0x6c0(%rbx)
00000000001e6fba	movq	0x6f0(%r13), %rsi
00000000001e6fc1	movq	%r15, 0x6e0(%rbx)
00000000001e6fc8	movq	%rsi, 0x6f0(%rbx)
00000000001e6fcf	testq	%rsi, %rsi
00000000001e6fd2	je	0x1e6fdd
00000000001e6fd4	movq	(%rsi), %rax
00000000001e6fd7	addq	-0x18(%rax), %rsi
00000000001e6fdb	jmp	0x1e6fdf
00000000001e6fdd	xorl	%esi, %esi
00000000001e6fdf	leaq	0x6f8(%rbx), %rdi
00000000001e6fe6	movq	%rdi, -0x108(%rbp)
00000000001e6fed	callq	0x6ddadc                        ## symbol stub for: __ZN13PCSharedCountC1EP13PCShared_base
00000000001e6ff2	movq	%r14, 0x6e0(%rbx)
00000000001e6ff9	movq	0x710(%r13), %rsi
00000000001e7000	movq	%r15, 0x700(%rbx)
00000000001e7007	movq	%rsi, 0x710(%rbx)
00000000001e700e	testq	%rsi, %rsi
00000000001e7011	je	0x1e701c
00000000001e7013	movq	(%rsi), %rax
00000000001e7016	addq	-0x18(%rax), %rsi
00000000001e701a	jmp	0x1e701e
00000000001e701c	xorl	%esi, %esi
00000000001e701e	leaq	0x718(%rbx), %rdi
00000000001e7025	movq	%rdi, -0x100(%rbp)
00000000001e702c	callq	0x6ddadc                        ## symbol stub for: __ZN13PCSharedCountC1EP13PCShared_base
00000000001e7031	movq	%r14, 0x700(%rbx)
00000000001e7038	movq	0x730(%r13), %rsi
00000000001e703f	movq	%r15, 0x720(%rbx)
00000000001e7046	movq	%rsi, 0x730(%rbx)
00000000001e704d	testq	%rsi, %rsi
00000000001e7050	je	0x1e705b
00000000001e7052	movq	(%rsi), %rax
00000000001e7055	addq	-0x18(%rax), %rsi
00000000001e7059	jmp	0x1e705d
00000000001e705b	xorl	%esi, %esi
00000000001e705d	leaq	0x738(%rbx), %rdi
00000000001e7064	movq	%rdi, -0xf8(%rbp)
00000000001e706b	callq	0x6ddadc                        ## symbol stub for: __ZN13PCSharedCountC1EP13PCShared_base
00000000001e7070	movq	%r14, 0x720(%rbx)
00000000001e7077	movq	0x750(%r13), %rsi
00000000001e707e	movq	%r15, 0x740(%rbx)
00000000001e7085	movq	%rsi, 0x750(%rbx)
00000000001e708c	testq	%rsi, %rsi
00000000001e708f	je	0x1e709a
00000000001e7091	movq	(%rsi), %rax
00000000001e7094	addq	-0x18(%rax), %rsi
00000000001e7098	jmp	0x1e709c
00000000001e709a	xorl	%esi, %esi
00000000001e709c	leaq	0x758(%rbx), %rdi
00000000001e70a3	movq	%rdi, -0xf0(%rbp)
00000000001e70aa	callq	0x6ddadc                        ## symbol stub for: __ZN13PCSharedCountC1EP13PCShared_base
00000000001e70af	movq	%r14, 0x740(%rbx)
00000000001e70b6	movq	0x770(%r13), %rsi
00000000001e70bd	movq	%r15, 0x760(%rbx)
00000000001e70c4	movq	%rsi, 0x770(%rbx)
00000000001e70cb	testq	%rsi, %rsi
00000000001e70ce	je	0x1e70d9
00000000001e70d0	movq	(%rsi), %rax
00000000001e70d3	addq	-0x18(%rax), %rsi
00000000001e70d7	jmp	0x1e70db
00000000001e70d9	xorl	%esi, %esi
00000000001e70db	leaq	0x778(%rbx), %rdi
00000000001e70e2	movq	%rdi, -0xe8(%rbp)
00000000001e70e9	callq	0x6ddadc                        ## symbol stub for: __ZN13PCSharedCountC1EP13PCShared_base
00000000001e70ee	movq	%r14, 0x760(%rbx)
00000000001e70f5	movq	0x790(%r13), %rsi
00000000001e70fc	movq	%r15, 0x780(%rbx)
00000000001e7103	movq	%rsi, 0x790(%rbx)
00000000001e710a	testq	%rsi, %rsi
00000000001e710d	je	0x1e7118
00000000001e710f	movq	(%rsi), %rax
00000000001e7112	addq	-0x18(%rax), %rsi
00000000001e7116	jmp	0x1e711a
00000000001e7118	xorl	%esi, %esi
00000000001e711a	leaq	0x798(%rbx), %rdi
00000000001e7121	movq	%rdi, -0xe0(%rbp)
00000000001e7128	callq	0x6ddadc                        ## symbol stub for: __ZN13PCSharedCountC1EP13PCShared_base
00000000001e712d	movq	%r14, 0x780(%rbx)
00000000001e7134	movq	0x7b0(%r13), %rsi
00000000001e713b	movq	%r15, 0x7a0(%rbx)
00000000001e7142	movq	%rsi, 0x7b0(%rbx)
00000000001e7149	testq	%rsi, %rsi
00000000001e714c	je	0x1e7157
00000000001e714e	movq	(%rsi), %rax
00000000001e7151	addq	-0x18(%rax), %rsi
00000000001e7155	jmp	0x1e7159
00000000001e7157	xorl	%esi, %esi
00000000001e7159	leaq	0x7b8(%rbx), %rdi
00000000001e7160	movq	%rdi, -0xd8(%rbp)
00000000001e7167	callq	0x6ddadc                        ## symbol stub for: __ZN13PCSharedCountC1EP13PCShared_base
00000000001e716c	movq	%r14, 0x7a0(%rbx)
00000000001e7173	movq	0x7d0(%r13), %rsi
00000000001e717a	movq	%r15, 0x7c0(%rbx)
00000000001e7181	movq	%rsi, 0x7d0(%rbx)
00000000001e7188	testq	%rsi, %rsi
00000000001e718b	je	0x1e7196
00000000001e718d	movq	(%rsi), %rax
00000000001e7190	addq	-0x18(%rax), %rsi
00000000001e7194	jmp	0x1e7198
00000000001e7196	xorl	%esi, %esi
00000000001e7198	leaq	0x7d8(%rbx), %rdi
00000000001e719f	movq	%rdi, -0xd0(%rbp)
00000000001e71a6	callq	0x6ddadc                        ## symbol stub for: __ZN13PCSharedCountC1EP13PCShared_base
00000000001e71ab	movq	%r14, 0x7c0(%rbx)
00000000001e71b2	movq	0x7f0(%r13), %rsi
00000000001e71b9	movq	%r15, 0x7e0(%rbx)
00000000001e71c0	movq	%rsi, 0x7f0(%rbx)
00000000001e71c7	testq	%rsi, %rsi
00000000001e71ca	je	0x1e71d5
00000000001e71cc	movq	(%rsi), %rax
00000000001e71cf	addq	-0x18(%rax), %rsi
00000000001e71d3	jmp	0x1e71d7
00000000001e71d5	xorl	%esi, %esi
00000000001e71d7	leaq	0x7f8(%rbx), %rdi
00000000001e71de	movq	%rdi, -0xc8(%rbp)
00000000001e71e5	callq	0x6ddadc                        ## symbol stub for: __ZN13PCSharedCountC1EP13PCShared_base
00000000001e71ea	movq	%r14, 0x7e0(%rbx)
00000000001e71f1	movq	0x810(%r13), %rsi
00000000001e71f8	movq	%r15, 0x800(%rbx)
00000000001e71ff	movq	%rsi, 0x810(%rbx)
00000000001e7206	testq	%rsi, %rsi
00000000001e7209	je	0x1e7214
00000000001e720b	movq	(%rsi), %rax
00000000001e720e	addq	-0x18(%rax), %rsi
00000000001e7212	jmp	0x1e7216
00000000001e7214	xorl	%esi, %esi
00000000001e7216	leaq	0x818(%rbx), %rdi
00000000001e721d	movq	%rdi, -0xc0(%rbp)
00000000001e7224	callq	0x6ddadc                        ## symbol stub for: __ZN13PCSharedCountC1EP13PCShared_base
00000000001e7229	movq	%r14, 0x800(%rbx)
00000000001e7230	movq	0x830(%r13), %rsi
00000000001e7237	movq	%r15, 0x820(%rbx)
00000000001e723e	movq	%rsi, 0x830(%rbx)
00000000001e7245	testq	%rsi, %rsi
00000000001e7248	je	0x1e7253
00000000001e724a	movq	(%rsi), %rax
00000000001e724d	addq	-0x18(%rax), %rsi
00000000001e7251	jmp	0x1e7255
00000000001e7253	xorl	%esi, %esi
00000000001e7255	leaq	0x838(%rbx), %rdi
00000000001e725c	movq	%rdi, -0xb8(%rbp)
00000000001e7263	callq	0x6ddadc                        ## symbol stub for: __ZN13PCSharedCountC1EP13PCShared_base
00000000001e7268	movq	%r14, 0x820(%rbx)
00000000001e726f	movq	0x850(%r13), %rsi
00000000001e7276	movq	%r15, 0x840(%rbx)
00000000001e727d	movq	%rsi, 0x850(%rbx)
00000000001e7284	testq	%rsi, %rsi
00000000001e7287	je	0x1e7292
00000000001e7289	movq	(%rsi), %rax
00000000001e728c	addq	-0x18(%rax), %rsi
00000000001e7290	jmp	0x1e7294
00000000001e7292	xorl	%esi, %esi
00000000001e7294	leaq	0x858(%rbx), %rdi
00000000001e729b	movq	%rdi, -0xb0(%rbp)
00000000001e72a2	callq	0x6ddadc                        ## symbol stub for: __ZN13PCSharedCountC1EP13PCShared_base
00000000001e72a7	movq	%r14, 0x840(%rbx)
00000000001e72ae	movq	0x870(%r13), %rsi
00000000001e72b5	movq	%r15, 0x860(%rbx)
00000000001e72bc	movq	%rsi, 0x870(%rbx)
00000000001e72c3	testq	%rsi, %rsi
00000000001e72c6	je	0x1e72d1
00000000001e72c8	movq	(%rsi), %rax
00000000001e72cb	addq	-0x18(%rax), %rsi
00000000001e72cf	jmp	0x1e72d3
00000000001e72d1	xorl	%esi, %esi
00000000001e72d3	leaq	0x878(%rbx), %rdi
00000000001e72da	movq	%rdi, -0xa8(%rbp)
00000000001e72e1	callq	0x6ddadc                        ## symbol stub for: __ZN13PCSharedCountC1EP13PCShared_base
00000000001e72e6	movq	%r14, 0x860(%rbx)
00000000001e72ed	movq	0x890(%r13), %rsi
00000000001e72f4	movq	%r15, 0x880(%rbx)
00000000001e72fb	movq	%rsi, 0x890(%rbx)
00000000001e7302	testq	%rsi, %rsi
00000000001e7305	je	0x1e7310
00000000001e7307	movq	(%rsi), %rax
00000000001e730a	addq	-0x18(%rax), %rsi
00000000001e730e	jmp	0x1e7312
00000000001e7310	xorl	%esi, %esi
00000000001e7312	leaq	0x898(%rbx), %r14
00000000001e7319	movq	%r14, %rdi
00000000001e731c	callq	0x6ddadc                        ## symbol stub for: __ZN13PCSharedCountC1EP13PCShared_base
00000000001e7321	movq	-0x40(%rbp), %rax
00000000001e7325	movq	%rax, 0x880(%rbx)
00000000001e732c	movq	0x8b0(%r13), %rsi
00000000001e7333	movq	%r15, 0x8a0(%rbx)
00000000001e733a	movq	%rsi, 0x8b0(%rbx)
00000000001e7341	testq	%rsi, %rsi
00000000001e7344	je	0x1e734f
00000000001e7346	movq	(%rsi), %rax
00000000001e7349	addq	-0x18(%rax), %rsi
00000000001e734d	jmp	0x1e7351
00000000001e734f	xorl	%esi, %esi
00000000001e7351	leaq	0x8b8(%rbx), %r15
00000000001e7358	movq	%r15, %rdi
00000000001e735b	callq	0x6ddadc                        ## symbol stub for: __ZN13PCSharedCountC1EP13PCShared_base
00000000001e7360	movq	-0x40(%rbp), %rax
00000000001e7364	movq	%rax, 0x8a0(%rbx)
00000000001e736b	movq	0x8d0(%r13), %rsi
00000000001e7372	movq	-0x30(%rbp), %rax
00000000001e7376	movq	%rax, 0x8c0(%rbx)
00000000001e737d	movq	%rsi, 0x8d0(%rbx)
00000000001e7384	testq	%rsi, %rsi
00000000001e7387	je	0x1e7392
00000000001e7389	movq	(%rsi), %rax
00000000001e738c	addq	-0x18(%rax), %rsi
00000000001e7390	jmp	0x1e7394
00000000001e7392	xorl	%esi, %esi
00000000001e7394	leaq	0x8d8(%rbx), %r12
00000000001e739b	movq	%r12, %rdi
00000000001e739e	callq	0x6ddadc                        ## symbol stub for: __ZN13PCSharedCountC1EP13PCShared_base
00000000001e73a3	movq	-0x40(%rbp), %rax
00000000001e73a7	movq	%rax, 0x8c0(%rbx)
00000000001e73ae	movq	0x8f0(%r13), %rsi
00000000001e73b5	movq	-0x30(%rbp), %rax
00000000001e73b9	movq	%rax, 0x8e0(%rbx)
00000000001e73c0	movq	%rsi, 0x8f0(%rbx)
00000000001e73c7	testq	%rsi, %rsi
00000000001e73ca	je	0x1e73d5
00000000001e73cc	movq	(%rsi), %rax
00000000001e73cf	addq	-0x18(%rax), %rsi
00000000001e73d3	jmp	0x1e73d7
00000000001e73d5	xorl	%esi, %esi
00000000001e73d7	leaq	0x8f8(%rbx), %rdi
00000000001e73de	callq	0x6ddadc                        ## symbol stub for: __ZN13PCSharedCountC1EP13PCShared_base
00000000001e73e3	movq	-0x40(%rbp), %rax
00000000001e73e7	movq	%rax, 0x8e0(%rbx)
00000000001e73ee	addq	$0x198, %rsp                    ## imm = 0x198
00000000001e73f5	popq	%rbx
00000000001e73f6	popq	%r12
00000000001e73f8	popq	%r13
00000000001e73fa	popq	%r14
00000000001e73fc	popq	%r15
00000000001e73fe	popq	%rbp
00000000001e73ff	retq
00000000001e7400	movq	%rax, %r13
00000000001e7403	movq	-0x30(%rbp), %rax
00000000001e7407	movq	%rax, 0x8c0(%rbx)
00000000001e740e	movq	%r12, %rdi
00000000001e7411	callq	0x6ddaee                        ## symbol stub for: __ZN13PCSharedCountD1Ev
00000000001e7416	jmp	0x1e741b
00000000001e7418	movq	%rax, %r13
00000000001e741b	movq	-0x30(%rbp), %rax
00000000001e741f	movq	%rax, 0x8a0(%rbx)
00000000001e7426	movq	%r15, %rdi
00000000001e7429	callq	0x6ddaee                        ## symbol stub for: __ZN13PCSharedCountD1Ev
00000000001e742e	jmp	0x1e7433
00000000001e7430	movq	%rax, %r13
00000000001e7433	movq	-0x30(%rbp), %rax
00000000001e7437	movq	%rax, 0x880(%rbx)
00000000001e743e	movq	%r14, %rdi
00000000001e7441	callq	0x6ddaee                        ## symbol stub for: __ZN13PCSharedCountD1Ev
00000000001e7446	jmp	0x1e744b
00000000001e7448	movq	%rax, %r13
00000000001e744b	movq	-0x30(%rbp), %rax
00000000001e744f	movq	%rax, 0x860(%rbx)
00000000001e7456	movq	-0xa8(%rbp), %rdi
00000000001e745d	callq	0x6ddaee                        ## symbol stub for: __ZN13PCSharedCountD1Ev
00000000001e7462	jmp	0x1e7467
00000000001e7464	movq	%rax, %r13
00000000001e7467	movq	-0x30(%rbp), %rax
00000000001e746b	movq	%rax, 0x840(%rbx)
00000000001e7472	movq	-0xb0(%rbp), %rdi
00000000001e7479	callq	0x6ddaee                        ## symbol stub for: __ZN13PCSharedCountD1Ev
00000000001e747e	movq	-0x30(%rbp), %rax
00000000001e7482	movq	%rax, 0x820(%rbx)
00000000001e7489	movq	-0xb8(%rbp), %rdi
00000000001e7490	callq	0x6ddaee                        ## symbol stub for: __ZN13PCSharedCountD1Ev
00000000001e7495	movq	-0x30(%rbp), %rax
00000000001e7499	movq	%rax, 0x800(%rbx)
00000000001e74a0	movq	-0xc0(%rbp), %rdi
00000000001e74a7	callq	0x6ddaee                        ## symbol stub for: __ZN13PCSharedCountD1Ev
00000000001e74ac	movq	-0x30(%rbp), %rax
00000000001e74b0	movq	%rax, 0x7e0(%rbx)
00000000001e74b7	movq	-0xc8(%rbp), %rdi
00000000001e74be	callq	0x6ddaee                        ## symbol stub for: __ZN13PCSharedCountD1Ev
00000000001e74c3	movq	-0x30(%rbp), %rax
00000000001e74c7	movq	%rax, 0x7c0(%rbx)
00000000001e74ce	movq	-0xd0(%rbp), %rdi
00000000001e74d5	callq	0x6ddaee                        ## symbol stub for: __ZN13PCSharedCountD1Ev
00000000001e74da	movq	-0x30(%rbp), %rax
00000000001e74de	movq	%rax, 0x7a0(%rbx)
00000000001e74e5	movq	-0xd8(%rbp), %rdi
00000000001e74ec	callq	0x6ddaee                        ## symbol stub for: __ZN13PCSharedCountD1Ev
00000000001e74f1	movq	-0x30(%rbp), %rax
00000000001e74f5	movq	%rax, 0x780(%rbx)
00000000001e74fc	movq	-0xe0(%rbp), %rdi
00000000001e7503	callq	0x6ddaee                        ## symbol stub for: __ZN13PCSharedCountD1Ev
00000000001e7508	movq	-0x30(%rbp), %rax
00000000001e750c	movq	%rax, 0x760(%rbx)
00000000001e7513	movq	-0xe8(%rbp), %rdi
00000000001e751a	callq	0x6ddaee                        ## symbol stub for: __ZN13PCSharedCountD1Ev
00000000001e751f	movq	-0x30(%rbp), %rax
00000000001e7523	movq	%rax, 0x740(%rbx)
00000000001e752a	movq	-0xf0(%rbp), %rdi
00000000001e7531	callq	0x6ddaee                        ## symbol stub for: __ZN13PCSharedCountD1Ev
00000000001e7536	movq	-0x30(%rbp), %rax
00000000001e753a	movq	%rax, 0x720(%rbx)
00000000001e7541	movq	-0xf8(%rbp), %rdi
00000000001e7548	callq	0x6ddaee                        ## symbol stub for: __ZN13PCSharedCountD1Ev
00000000001e754d	movq	-0x30(%rbp), %rax
00000000001e7551	movq	%rax, 0x700(%rbx)
00000000001e7558	movq	-0x100(%rbp), %rdi
00000000001e755f	callq	0x6ddaee                        ## symbol stub for: __ZN13PCSharedCountD1Ev
00000000001e7564	movq	-0x30(%rbp), %rax
00000000001e7568	movq	%rax, 0x6e0(%rbx)
00000000001e756f	movq	-0x108(%rbp), %rdi
00000000001e7576	callq	0x6ddaee                        ## symbol stub for: __ZN13PCSharedCountD1Ev
00000000001e757b	movq	-0x30(%rbp), %rax
00000000001e757f	movq	%rax, 0x6c0(%rbx)
00000000001e7586	movq	-0x110(%rbp), %rdi
00000000001e758d	callq	0x6ddaee                        ## symbol stub for: __ZN13PCSharedCountD1Ev
00000000001e7592	movq	-0x30(%rbp), %rax
00000000001e7596	movq	%rax, 0x6a0(%rbx)
00000000001e759d	movq	-0x118(%rbp), %rdi
00000000001e75a4	callq	0x6ddaee                        ## symbol stub for: __ZN13PCSharedCountD1Ev
00000000001e75a9	movq	-0x30(%rbp), %rax
00000000001e75ad	movq	%rax, 0x680(%rbx)
00000000001e75b4	movq	-0x120(%rbp), %rdi
00000000001e75bb	callq	0x6ddaee                        ## symbol stub for: __ZN13PCSharedCountD1Ev
00000000001e75c0	movq	-0x30(%rbp), %rax
00000000001e75c4	movq	%rax, 0x660(%rbx)
00000000001e75cb	movq	-0x128(%rbp), %rdi
00000000001e75d2	callq	0x6ddaee                        ## symbol stub for: __ZN13PCSharedCountD1Ev
00000000001e75d7	movq	-0x30(%rbp), %rax
00000000001e75db	movq	%rax, 0x640(%rbx)
00000000001e75e2	movq	-0x130(%rbp), %rdi
00000000001e75e9	callq	0x6ddaee                        ## symbol stub for: __ZN13PCSharedCountD1Ev
00000000001e75ee	movq	-0x30(%rbp), %rax
00000000001e75f2	movq	%rax, 0x620(%rbx)
00000000001e75f9	movq	-0x138(%rbp), %rdi
00000000001e7600	callq	0x6ddaee                        ## symbol stub for: __ZN13PCSharedCountD1Ev
00000000001e7605	movq	-0x30(%rbp), %rax
00000000001e7609	movq	%rax, 0x600(%rbx)
00000000001e7610	movq	-0x140(%rbp), %rdi
00000000001e7617	callq	0x6ddaee                        ## symbol stub for: __ZN13PCSharedCountD1Ev
00000000001e761c	movq	-0x30(%rbp), %rax
00000000001e7620	movq	%rax, 0x5e0(%rbx)
00000000001e7627	movq	-0x50(%rbp), %rdi
00000000001e762b	callq	0x6ddaee                        ## symbol stub for: __ZN13PCSharedCountD1Ev
00000000001e7630	movq	-0x30(%rbp), %rax
00000000001e7634	movq	%rax, 0x5c0(%rbx)
00000000001e763b	movq	-0x58(%rbp), %rdi
00000000001e763f	callq	0x6ddaee                        ## symbol stub for: __ZN13PCSharedCountD1Ev
00000000001e7644	movq	-0x30(%rbp), %rax
00000000001e7648	movq	%rax, 0x5a0(%rbx)
00000000001e764f	movq	-0x38(%rbp), %rdi
00000000001e7653	callq	0x6ddaee                        ## symbol stub for: __ZN13PCSharedCountD1Ev
00000000001e7658	movq	-0x48(%rbp), %rdi
00000000001e765c	callq	__ZN8ProShade9Sampler2DD1Ev     ## ProShade::Sampler2D::~Sampler2D()
00000000001e7661	movq	-0x60(%rbp), %rdi
00000000001e7665	callq	__ZN8ProShade9Sampler2DD1Ev     ## ProShade::Sampler2D::~Sampler2D()
00000000001e766a	movq	-0x68(%rbp), %rdi
00000000001e766e	callq	__ZN8ProShade9Sampler2DD1Ev     ## ProShade::Sampler2D::~Sampler2D()
00000000001e7673	movq	-0x30(%rbp), %rax
00000000001e7677	movq	%rax, 0x460(%rbx)
00000000001e767e	movq	-0x148(%rbp), %rdi
00000000001e7685	callq	0x6ddaee                        ## symbol stub for: __ZN13PCSharedCountD1Ev
00000000001e768a	movq	-0x30(%rbp), %rax
00000000001e768e	movq	%rax, 0x440(%rbx)
00000000001e7695	movq	-0x150(%rbp), %rdi
00000000001e769c	callq	0x6ddaee                        ## symbol stub for: __ZN13PCSharedCountD1Ev
00000000001e76a1	movq	-0x70(%rbp), %rdi
00000000001e76a5	callq	__ZN8ProShade9Sampler2DD1Ev     ## ProShade::Sampler2D::~Sampler2D()
00000000001e76aa	movq	-0x30(%rbp), %rax
00000000001e76ae	movq	%rax, 0x3c0(%rbx)
00000000001e76b5	movq	-0x158(%rbp), %rdi
00000000001e76bc	callq	0x6ddaee                        ## symbol stub for: __ZN13PCSharedCountD1Ev
00000000001e76c1	movq	-0x30(%rbp), %rax
00000000001e76c5	movq	%rax, 0x3a0(%rbx)
00000000001e76cc	movq	-0x160(%rbp), %rdi
00000000001e76d3	callq	0x6ddaee                        ## symbol stub for: __ZN13PCSharedCountD1Ev
00000000001e76d8	movq	-0x78(%rbp), %rdi
00000000001e76dc	callq	__ZN8ProShade9Sampler2DD1Ev     ## ProShade::Sampler2D::~Sampler2D()
00000000001e76e1	movq	-0x80(%rbp), %rdi
00000000001e76e5	callq	__ZN8ProShade9Sampler2DD1Ev     ## ProShade::Sampler2D::~Sampler2D()
00000000001e76ea	movq	-0x88(%rbp), %rdi
00000000001e76f1	callq	__ZN8ProShade9Sampler2DD1Ev     ## ProShade::Sampler2D::~Sampler2D()
00000000001e76f6	movq	-0x90(%rbp), %rdi
00000000001e76fd	callq	__ZN8ProShade9Sampler2DD1Ev     ## ProShade::Sampler2D::~Sampler2D()
00000000001e7702	movq	-0x98(%rbp), %rdi
00000000001e7709	callq	__ZN8ProShade9Sampler2DD1Ev     ## ProShade::Sampler2D::~Sampler2D()
00000000001e770e	movq	-0xa0(%rbp), %rdi
00000000001e7715	callq	__ZN8ProShade9Sampler2DD1Ev     ## ProShade::Sampler2D::~Sampler2D()
00000000001e771a	movq	-0x30(%rbp), %rax
00000000001e771e	movq	%rax, 0x140(%rbx)
00000000001e7725	movq	-0x168(%rbp), %rdi
00000000001e772c	callq	0x6ddaee                        ## symbol stub for: __ZN13PCSharedCountD1Ev
00000000001e7731	movq	-0x30(%rbp), %rax
00000000001e7735	movq	%rax, 0x120(%rbx)
00000000001e773c	movq	-0x170(%rbp), %rdi
00000000001e7743	callq	0x6ddaee                        ## symbol stub for: __ZN13PCSharedCountD1Ev
00000000001e7748	movq	-0x30(%rbp), %rax
00000000001e774c	movq	%rax, 0x100(%rbx)
00000000001e7753	movq	-0x178(%rbp), %rdi
00000000001e775a	callq	0x6ddaee                        ## symbol stub for: __ZN13PCSharedCountD1Ev
00000000001e775f	movq	-0x30(%rbp), %r15
00000000001e7763	movq	%r15, 0xe0(%rbx)
00000000001e776a	movq	-0x180(%rbp), %rdi
00000000001e7771	callq	0x6ddaee                        ## symbol stub for: __ZN13PCSharedCountD1Ev
00000000001e7776	movq	%r15, 0xc0(%rbx)
00000000001e777d	movq	-0x188(%rbp), %rdi
00000000001e7784	callq	0x6ddaee                        ## symbol stub for: __ZN13PCSharedCountD1Ev
00000000001e7789	movq	%r15, 0xa0(%rbx)
00000000001e7790	movq	-0x190(%rbp), %rdi
00000000001e7797	callq	0x6ddaee                        ## symbol stub for: __ZN13PCSharedCountD1Ev
00000000001e779c	movq	%r15, 0x80(%rbx)
00000000001e77a3	movq	-0x198(%rbp), %rdi
00000000001e77aa	callq	0x6ddaee                        ## symbol stub for: __ZN13PCSharedCountD1Ev
00000000001e77af	movq	%r15, 0x60(%rbx)
00000000001e77b3	movq	-0x1a0(%rbp), %rdi
00000000001e77ba	callq	0x6ddaee                        ## symbol stub for: __ZN13PCSharedCountD1Ev
00000000001e77bf	movq	%r15, 0x40(%rbx)
00000000001e77c3	movq	-0x1a8(%rbp), %rdi
00000000001e77ca	callq	0x6ddaee                        ## symbol stub for: __ZN13PCSharedCountD1Ev
00000000001e77cf	movq	%r15, 0x20(%rbx)
00000000001e77d3	movq	-0x1b0(%rbp), %rdi
00000000001e77da	callq	0x6ddaee                        ## symbol stub for: __ZN13PCSharedCountD1Ev
00000000001e77df	movq	%r15, (%rbx)
00000000001e77e2	movq	-0x1b8(%rbp), %rdi
00000000001e77e9	callq	0x6ddaee                        ## symbol stub for: __ZN13PCSharedCountD1Ev
00000000001e77ee	movq	%r13, %rdi
00000000001e77f1	callq	0x6dd07a                        ## symbol stub for: __Unwind_Resume
00000000001e77f6	movq	%rax, %r13
00000000001e77f9	jmp	0x1e747e
00000000001e77fe	movq	%rax, %r13
00000000001e7801	jmp	0x1e7495
00000000001e7806	movq	%rax, %r13
00000000001e7809	jmp	0x1e74ac
00000000001e780e	movq	%rax, %r13
00000000001e7811	jmp	0x1e74c3
00000000001e7816	movq	%rax, %r13
00000000001e7819	jmp	0x1e74da
00000000001e781e	movq	%rax, %r13
00000000001e7821	jmp	0x1e74f1
00000000001e7826	movq	%rax, %r13
00000000001e7829	jmp	0x1e7508
00000000001e782e	movq	%rax, %r13
00000000001e7831	jmp	0x1e751f
00000000001e7836	movq	%rax, %r13
00000000001e7839	jmp	0x1e7536
00000000001e783e	movq	%rax, %r13
00000000001e7841	jmp	0x1e754d
00000000001e7846	movq	%rax, %r13
00000000001e7849	jmp	0x1e7564
00000000001e784e	movq	%rax, %r13
00000000001e7851	jmp	0x1e757b
00000000001e7856	movq	%rax, %r13
00000000001e7859	jmp	0x1e7592
00000000001e785e	movq	%rax, %r13
00000000001e7861	jmp	0x1e75a9
00000000001e7866	movq	%rax, %r13
00000000001e7869	jmp	0x1e75c0
00000000001e786e	movq	%rax, %r13
00000000001e7871	jmp	0x1e75d7
00000000001e7876	movq	%rax, %r13
00000000001e7879	jmp	0x1e75ee
00000000001e787e	movq	%rax, %r13
00000000001e7881	jmp	0x1e7605
00000000001e7886	movq	%rax, %r13
00000000001e7889	jmp	0x1e761c
00000000001e788e	movq	%rax, %r13
00000000001e7891	jmp	0x1e7630
00000000001e7896	movq	%rax, %r13
00000000001e7899	jmp	0x1e7644
00000000001e789e	movq	%rax, %r13
00000000001e78a1	jmp	0x1e7658
00000000001e78a6	movq	%rax, %r13
00000000001e78a9	movq	-0x30(%rbp), %rax
00000000001e78ad	movq	%rax, 0x560(%rbx)
00000000001e78b4	movq	%r15, %rdi
00000000001e78b7	callq	0x6ddaee                        ## symbol stub for: __ZN13PCSharedCountD1Ev
00000000001e78bc	jmp	0x1e78c1
00000000001e78be	movq	%rax, %r13
00000000001e78c1	movq	-0x48(%rbp), %rax
00000000001e78c5	movq	-0x38(%rbp), %rcx
00000000001e78c9	movq	%rcx, (%rax)
00000000001e78cc	movq	%r14, %rdi
00000000001e78cf	callq	0x6ddaee                        ## symbol stub for: __ZN13PCSharedCountD1Ev
00000000001e78d4	jmp	0x1e7661
00000000001e78d9	movq	%rax, %r13
00000000001e78dc	jmp	0x1e7661
00000000001e78e1	movq	%rax, %r13
00000000001e78e4	movq	-0x30(%rbp), %rax
00000000001e78e8	movq	%rax, 0x500(%rbx)
00000000001e78ef	movq	%r15, %rdi
00000000001e78f2	callq	0x6ddaee                        ## symbol stub for: __ZN13PCSharedCountD1Ev
00000000001e78f7	jmp	0x1e78fc
00000000001e78f9	movq	%rax, %r13
00000000001e78fc	movq	-0x60(%rbp), %rax
00000000001e7900	movq	-0x38(%rbp), %rcx
00000000001e7904	movq	%rcx, (%rax)
00000000001e7907	movq	%r14, %rdi
00000000001e790a	callq	0x6ddaee                        ## symbol stub for: __ZN13PCSharedCountD1Ev
00000000001e790f	jmp	0x1e766a
00000000001e7914	movq	%rax, %r13
00000000001e7917	jmp	0x1e766a
00000000001e791c	movq	%rax, %r13
00000000001e791f	movq	-0x30(%rbp), %rax
00000000001e7923	movq	%rax, 0x4a0(%rbx)
00000000001e792a	movq	%r15, %rdi
00000000001e792d	callq	0x6ddaee                        ## symbol stub for: __ZN13PCSharedCountD1Ev
00000000001e7932	jmp	0x1e7937
00000000001e7934	movq	%rax, %r13
00000000001e7937	movq	-0x68(%rbp), %rax
00000000001e793b	movq	-0x38(%rbp), %rcx
00000000001e793f	movq	%rcx, (%rax)
00000000001e7942	movq	%r14, %rdi
00000000001e7945	callq	0x6ddaee                        ## symbol stub for: __ZN13PCSharedCountD1Ev
00000000001e794a	jmp	0x1e7673
00000000001e794f	movq	%rax, %r13
00000000001e7952	jmp	0x1e7673
00000000001e7957	movq	%rax, %r13
00000000001e795a	jmp	0x1e768a
00000000001e795f	movq	%rax, %r13
00000000001e7962	jmp	0x1e76a1
00000000001e7967	movq	%rax, %r13
00000000001e796a	movq	-0x30(%rbp), %rax
00000000001e796e	movq	%rax, 0x400(%rbx)
00000000001e7975	movq	%r15, %rdi
00000000001e7978	callq	0x6ddaee                        ## symbol stub for: __ZN13PCSharedCountD1Ev
00000000001e797d	jmp	0x1e7982
00000000001e797f	movq	%rax, %r13
00000000001e7982	movq	-0x70(%rbp), %rax
00000000001e7986	movq	-0x38(%rbp), %rcx
00000000001e798a	movq	%rcx, (%rax)
00000000001e798d	movq	%r14, %rdi
00000000001e7990	callq	0x6ddaee                        ## symbol stub for: __ZN13PCSharedCountD1Ev
00000000001e7995	jmp	0x1e76aa
00000000001e799a	movq	%rax, %r13
00000000001e799d	jmp	0x1e76aa
00000000001e79a2	movq	%rax, %r13
00000000001e79a5	jmp	0x1e76c1
00000000001e79aa	movq	%rax, %r13
00000000001e79ad	jmp	0x1e76d8
00000000001e79b2	movq	%rax, %r13
00000000001e79b5	movq	-0x30(%rbp), %rax
00000000001e79b9	movq	%rax, 0x360(%rbx)
00000000001e79c0	movq	%r15, %rdi
00000000001e79c3	callq	0x6ddaee                        ## symbol stub for: __ZN13PCSharedCountD1Ev
00000000001e79c8	jmp	0x1e79cd
00000000001e79ca	movq	%rax, %r13
00000000001e79cd	movq	-0x78(%rbp), %rax
00000000001e79d1	movq	-0x38(%rbp), %rcx
00000000001e79d5	movq	%rcx, (%rax)
00000000001e79d8	movq	%r14, %rdi
00000000001e79db	callq	0x6ddaee                        ## symbol stub for: __ZN13PCSharedCountD1Ev
00000000001e79e0	jmp	0x1e76e1
00000000001e79e5	movq	%rax, %r13
00000000001e79e8	jmp	0x1e76e1
00000000001e79ed	movq	%rax, %r13
00000000001e79f0	movq	-0x30(%rbp), %rax
00000000001e79f4	movq	%rax, 0x300(%rbx)
00000000001e79fb	movq	%r15, %rdi
00000000001e79fe	callq	0x6ddaee                        ## symbol stub for: __ZN13PCSharedCountD1Ev
00000000001e7a03	jmp	0x1e7a08
00000000001e7a05	movq	%rax, %r13
00000000001e7a08	movq	-0x80(%rbp), %rax
00000000001e7a0c	movq	-0x38(%rbp), %rcx
00000000001e7a10	movq	%rcx, (%rax)
00000000001e7a13	movq	%r14, %rdi
00000000001e7a16	callq	0x6ddaee                        ## symbol stub for: __ZN13PCSharedCountD1Ev
00000000001e7a1b	jmp	0x1e76ea
00000000001e7a20	movq	%rax, %r13
00000000001e7a23	jmp	0x1e76ea
00000000001e7a28	movq	%rax, %r13
00000000001e7a2b	movq	-0x30(%rbp), %rax
00000000001e7a2f	movq	%rax, 0x2a0(%rbx)
00000000001e7a36	movq	%r15, %rdi
00000000001e7a39	callq	0x6ddaee                        ## symbol stub for: __ZN13PCSharedCountD1Ev
00000000001e7a3e	jmp	0x1e7a43
00000000001e7a40	movq	%rax, %r13
00000000001e7a43	movq	-0x88(%rbp), %rax
00000000001e7a4a	movq	-0x38(%rbp), %rcx
00000000001e7a4e	movq	%rcx, (%rax)
00000000001e7a51	movq	%r14, %rdi
00000000001e7a54	callq	0x6ddaee                        ## symbol stub for: __ZN13PCSharedCountD1Ev
00000000001e7a59	jmp	0x1e76f6
00000000001e7a5e	movq	%rax, %r13
00000000001e7a61	jmp	0x1e76f6
00000000001e7a66	movq	%rax, %r13
00000000001e7a69	movq	-0x30(%rbp), %rax
00000000001e7a6d	movq	%rax, 0x240(%rbx)
00000000001e7a74	movq	%r15, %rdi
00000000001e7a77	callq	0x6ddaee                        ## symbol stub for: __ZN13PCSharedCountD1Ev
00000000001e7a7c	jmp	0x1e7a81
00000000001e7a7e	movq	%rax, %r13
00000000001e7a81	movq	-0x90(%rbp), %rax
00000000001e7a88	movq	-0x38(%rbp), %rcx
00000000001e7a8c	movq	%rcx, (%rax)
00000000001e7a8f	movq	%r14, %rdi
00000000001e7a92	callq	0x6ddaee                        ## symbol stub for: __ZN13PCSharedCountD1Ev
00000000001e7a97	jmp	0x1e7702
00000000001e7a9c	movq	%rax, %r13
00000000001e7a9f	jmp	0x1e7702
00000000001e7aa4	movq	%rax, %r13
00000000001e7aa7	movq	-0x30(%rbp), %rax
00000000001e7aab	movq	%rax, 0x1e0(%rbx)
00000000001e7ab2	movq	%r15, %rdi
00000000001e7ab5	callq	0x6ddaee                        ## symbol stub for: __ZN13PCSharedCountD1Ev
00000000001e7aba	jmp	0x1e7abf
00000000001e7abc	movq	%rax, %r13
00000000001e7abf	movq	-0x98(%rbp), %rax
00000000001e7ac6	movq	-0x38(%rbp), %rcx
00000000001e7aca	movq	%rcx, (%rax)
00000000001e7acd	movq	%r14, %rdi
00000000001e7ad0	callq	0x6ddaee                        ## symbol stub for: __ZN13PCSharedCountD1Ev
00000000001e7ad5	jmp	0x1e770e
00000000001e7ada	movq	%rax, %r13
00000000001e7add	jmp	0x1e770e
00000000001e7ae2	movq	%rax, %r13
00000000001e7ae5	movq	-0x30(%rbp), %rax
00000000001e7ae9	movq	%rax, 0x180(%rbx)
00000000001e7af0	movq	%r15, %rdi
00000000001e7af3	callq	0x6ddaee                        ## symbol stub for: __ZN13PCSharedCountD1Ev
00000000001e7af8	jmp	0x1e7afd
00000000001e7afa	movq	%rax, %r13
00000000001e7afd	movq	-0xa0(%rbp), %rax
00000000001e7b04	movq	-0x38(%rbp), %rcx
00000000001e7b08	movq	%rcx, (%rax)
00000000001e7b0b	movq	%r14, %rdi
00000000001e7b0e	callq	0x6ddaee                        ## symbol stub for: __ZN13PCSharedCountD1Ev
00000000001e7b13	jmp	0x1e771a
00000000001e7b18	movq	%rax, %r13
00000000001e7b1b	jmp	0x1e771a
00000000001e7b20	movq	%rax, %r13
00000000001e7b23	jmp	0x1e7731
00000000001e7b28	movq	%rax, %r13
00000000001e7b2b	jmp	0x1e7748
00000000001e7b30	movq	%rax, %r13
00000000001e7b33	jmp	0x1e775f
00000000001e7b38	movq	%rax, %r13
00000000001e7b3b	jmp	0x1e7776
00000000001e7b40	movq	%rax, %r13
00000000001e7b43	jmp	0x1e7789
00000000001e7b48	movq	%rax, %r13
00000000001e7b4b	jmp	0x1e779c
00000000001e7b50	movq	%rax, %r13
00000000001e7b53	jmp	0x1e77af
00000000001e7b58	movq	%rax, %r13
00000000001e7b5b	jmp	0x1e77bf
00000000001e7b60	movq	%rax, %r13
00000000001e7b63	jmp	0x1e77cf
00000000001e7b68	movq	%rax, %r13
00000000001e7b6b	jmp	0x1e77df
