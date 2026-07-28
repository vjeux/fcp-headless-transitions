__ZN28OZLiSegmentationStrokeFilterC1EP11OZImageMaskRK14OZRenderParams:
0000000000424450	pushq	%rbp
0000000000424451	movq	%rsp, %rbp
0000000000424454	pushq	%r15
0000000000424456	pushq	%r14
0000000000424458	pushq	%rbx
0000000000424459	pushq	%rax
000000000042445a	movq	%rdx, %r15
000000000042445d	movq	%rsi, %r14
0000000000424460	movq	%rdi, %rbx
0000000000424463	leaq	__ZTV13PCShared_base(%rip), %rax ## vtable for PCShared_base
000000000042446a	addq	$0x10, %rax
000000000042446e	movq	%rax, 0x5f0(%rdi)
0000000000424475	movq	$0x0, 0x5f8(%rdi)
0000000000424480	leaq	0x43d271(%rip), %rsi
0000000000424487	callq	0x6dd83c                        ## symbol stub for: __ZN13LiImageSourceC2Ev
000000000042448c	leaq	0x43ddd5(%rip), %rax
0000000000424493	movq	%rax, (%rbx)
0000000000424496	leaq	0x43deb3(%rip), %rax
000000000042449d	movq	%rax, 0x5f0(%rbx)
00000000004244a4	movq	$0x0, 0x10(%rbx)
00000000004244ac	leaq	0x18(%rbx), %rdi
00000000004244b0	callq	0x6ddae8                        ## symbol stub for: __ZN13PCSharedCountC1Ev
00000000004244b5	movl	$0x0, 0x20(%rbx)
00000000004244bc	leaq	0x43dc8d(%rip), %rax
00000000004244c3	movq	%rax, (%rbx)
00000000004244c6	leaq	0x43dd6b(%rip), %rax
00000000004244cd	movq	%rax, 0x5f0(%rbx)
00000000004244d4	movq	%r14, 0x28(%rbx)
00000000004244d8	leaq	0x30(%rbx), %rdi
00000000004244dc	movq	%r15, %rsi
00000000004244df	callq	__ZN14OZRenderParamsC1ERKS_     ## OZRenderParams::OZRenderParams(OZRenderParams const&)
00000000004244e4	leaq	0x43d0f5(%rip), %rax
00000000004244eb	movq	%rax, (%rbx)
00000000004244ee	leaq	0x43d1d3(%rip), %rax
00000000004244f5	movq	%rax, 0x5f0(%rbx)
00000000004244fc	movq	%r14, 0x28(%rbx)
0000000000424500	addq	$0x8, %rsp
0000000000424504	popq	%rbx
0000000000424505	popq	%r14
0000000000424507	popq	%r15
0000000000424509	popq	%rbp
000000000042450a	retq
000000000042450b	movq	%rax, %r14
000000000042450e	leaq	0x43d1db(%rip), %rsi
0000000000424515	movq	%rbx, %rdi
0000000000424518	callq	__ZN13LiImageFilterD2Ev         ## LiImageFilter::~LiImageFilter()
000000000042451d	jmp	0x424536
000000000042451f	movq	%rax, %r14
0000000000424522	leaq	0x43d1cf(%rip), %rsi
0000000000424529	movq	%rbx, %rdi
000000000042452c	callq	0x6dd842                        ## symbol stub for: __ZN13LiImageSourceD2Ev
0000000000424531	jmp	0x424536
0000000000424533	movq	%rax, %r14
0000000000424536	addq	$0x5f0, %rbx                    ## imm = 0x5F0
000000000042453d	movq	%rbx, %rdi
0000000000424540	callq	__ZN13PCShared_baseD2Ev         ## PCShared_base::~PCShared_base()
0000000000424545	movq	%r14, %rdi
0000000000424548	callq	0x6dd07a                        ## symbol stub for: __Unwind_Resume
000000000042454d	nopl	(%rax)
