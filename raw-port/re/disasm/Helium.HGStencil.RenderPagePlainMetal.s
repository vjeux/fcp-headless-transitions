__ZN9HGStencil20RenderPagePlainMetalEP6HGPage:
00000000002d24d0	pushq	%rbp
00000000002d24d1	movq	%rsp, %rbp
00000000002d24d4	pushq	%r15
00000000002d24d6	pushq	%r14
00000000002d24d8	pushq	%r13
00000000002d24da	pushq	%r12
00000000002d24dc	pushq	%rbx
00000000002d24dd	subq	$0x28, %rsp
00000000002d24e1	movq	%rsi, %rbx
00000000002d24e4	movq	%rdi, %r14
00000000002d24e7	leaq	-0x30(%rbp), %rdi
00000000002d24eb	movq	%r14, %rsi
00000000002d24ee	movq	%rbx, %rdx
00000000002d24f1	callq	__ZN28HGPagePullMetalTexturesGuardC1EP6HGNodeP6HGPage ## HGPagePullMetalTexturesGuard::HGPagePullMetalTexturesGuard(HGNode*, HGPage*)
00000000002d24f6	movq	0x8(%rbx), %r15
00000000002d24fa	testq	%r15, %r15
00000000002d24fd	je	0x2d250a
00000000002d24ff	movq	(%r15), %rax
00000000002d2502	movq	%r15, %rdi
00000000002d2505	callq	*0x10(%rax)
00000000002d2508	jmp	0x2d2548
00000000002d250a	movq	(%rbx), %rdi
00000000002d250d	movq	0x10(%rbx), %rsi
00000000002d2511	movq	0x18(%rbx), %rdx
00000000002d2515	movl	0x20(%rbx), %ecx
00000000002d2518	movl	0x10(%r14), %r9d
00000000002d251c	shrl	$0xc, %r9d
00000000002d2520	andl	$0x1, %r9d
00000000002d2524	movzbl	0xf8(%rbx), %eax
00000000002d252b	movl	%eax, (%rsp)
00000000002d252e	movl	$0x0, 0x8(%rsp)
00000000002d2536	movl	$0x1, %r8d
00000000002d253c	callq	__ZN13HGGPURenderer12CreateBufferE6HGRect8HGFormat14HGGPURenderAPIbbb ## HGGPURenderer::CreateBuffer(HGRect, HGFormat, HGGPURenderAPI, bool, bool, bool)
00000000002d2541	movq	%rax, %r15
00000000002d2544	movq	%rax, 0x8(%rbx)
00000000002d2548	movq	(%rbx), %rsi
00000000002d254b	movq	0x10(%rbx), %rcx
00000000002d254f	movq	0x18(%rbx), %r8
00000000002d2553	movq	(%r14), %rax
00000000002d2556	movq	%r14, %rdi
00000000002d2559	movl	$0x1, %edx
00000000002d255e	callq	*0x180(%rax)
00000000002d2564	movq	%rax, %rdi
00000000002d2567	movq	%rdx, %rsi
00000000002d256a	callq	_HGRectIsNull
00000000002d256f	testl	%eax, %eax
00000000002d2571	jne	0x2d259b
00000000002d2573	movq	(%rbx), %rsi
00000000002d2576	movq	0x10(%rbx), %rcx
00000000002d257a	movq	0x18(%rbx), %r8
00000000002d257e	movq	(%r14), %rax
00000000002d2581	movq	%r14, %rdi
00000000002d2584	xorl	%edx, %edx
00000000002d2586	callq	*0x180(%rax)
00000000002d258c	movq	%rax, %rdi
00000000002d258f	movq	%rdx, %rsi
00000000002d2592	callq	_HGRectIsNull
00000000002d2597	testl	%eax, %eax
00000000002d2599	je	0x2d25c9
00000000002d259b	movq	(%rbx), %rdi
00000000002d259e	movq	0x10(%rbx), %rdx
00000000002d25a2	movq	0x18(%rbx), %rcx
00000000002d25a6	movq	%r15, %rsi
00000000002d25a9	callq	__ZN13HGGPURenderer10ClearMetalEP8HGBuffer6HGRect ## HGGPURenderer::ClearMetal(HGBuffer*, HGRect)
00000000002d25ae	leaq	-0x30(%rbp), %rdi
00000000002d25b2	callq	__ZN28HGPagePullMetalTexturesGuardD1Ev ## HGPagePullMetalTexturesGuard::~HGPagePullMetalTexturesGuard()
00000000002d25b7	movq	%r15, %rax
00000000002d25ba	addq	$0x28, %rsp
00000000002d25be	popq	%rbx
00000000002d25bf	popq	%r12
00000000002d25c1	popq	%r13
00000000002d25c3	popq	%r14
00000000002d25c5	popq	%r15
00000000002d25c7	popq	%rbp
00000000002d25c8	retq
00000000002d25c9	movq	(%rbx), %rdi
00000000002d25cc	movq	0x40(%r14), %rsi
00000000002d25d0	movq	(%rdi), %rax
00000000002d25d3	movq	%r14, %rdx
00000000002d25d6	callq	*0x170(%rax)
00000000002d25dc	testq	%rax, %rax
00000000002d25df	je	0x2d25ae
00000000002d25e1	leaq	__ZTI9HGHandler(%rip), %rsi     ## typeinfo for HGHandler
00000000002d25e8	leaq	__ZTI14HGMetalHandler(%rip), %rdx ## typeinfo for HGMetalHandler
00000000002d25ef	movq	%rax, %rdi
00000000002d25f2	xorl	%ecx, %ecx
00000000002d25f4	callq	0x3c5018                        ## symbol stub for: ___dynamic_cast
00000000002d25f9	testq	%rax, %rax
00000000002d25fc	je	0x2d25ae
00000000002d25fe	movq	%rax, %r12
00000000002d2601	movq	(%r14), %rax
00000000002d2604	movq	%r14, %rdi
00000000002d2607	movq	%rbx, %rsi
00000000002d260a	xorl	%edx, %edx
00000000002d260c	movq	%r12, %rcx
00000000002d260f	callq	*0x1d8(%rax)
00000000002d2615	movq	%r12, %rdi
00000000002d2618	movq	%r15, %rsi
00000000002d261b	callq	__ZN14HGMetalHandler10BindBufferEP8HGBitmap ## HGMetalHandler::BindBuffer(HGBitmap*)
00000000002d2620	movq	%r14, -0x38(%rbp)
00000000002d2624	xorl	%r13d, %r13d
00000000002d2627	jmp	0x2d263d
00000000002d2629	nopl	(%rax)
00000000002d2630	incq	%r13
00000000002d2633	cmpq	$0x8, %r13
00000000002d2637	je	0x2d26c4
00000000002d263d	movq	0xa8(%rbx,%r13,8), %r14
00000000002d2645	movq	%r12, %rdi
00000000002d2648	movl	%r13d, %esi
00000000002d264b	movq	%r14, %rdx
00000000002d264e	callq	__ZN14HGMetalHandler11BindTextureEiP8HGBitmap ## HGMetalHandler::BindTexture(int, HGBitmap*)
00000000002d2653	testq	%r14, %r14
00000000002d2656	je	0x2d2630
00000000002d2658	movq	(%r12), %rax
00000000002d265c	movq	%r12, %rdi
00000000002d265f	movl	%r13d, %esi
00000000002d2662	xorl	%edx, %edx
00000000002d2664	callq	*0x48(%rax)
00000000002d2667	movq	(%r12), %rax
00000000002d266b	movq	%r12, %rdi
00000000002d266e	xorl	%esi, %esi
00000000002d2670	xorl	%edx, %edx
00000000002d2672	callq	*0x30(%rax)
00000000002d2675	movq	(%r12), %rax
00000000002d2679	movq	%r12, %rdi
00000000002d267c	movl	%r13d, %esi
00000000002d267f	callq	*0x50(%rax)
00000000002d2682	movq	(%r12), %rax
00000000002d2686	movq	%r12, %rdi
00000000002d2689	callq	*0x58(%rax)
00000000002d268c	xorl	%eax, %eax
00000000002d268e	subl	0x14(%r14), %eax
00000000002d2692	xorps	%xmm0, %xmm0
00000000002d2695	cvtsi2sd	%eax, %xmm0
00000000002d2699	xorl	%eax, %eax
00000000002d269b	subl	0x18(%r14), %eax
00000000002d269f	xorps	%xmm1, %xmm1
00000000002d26a2	cvtsi2sd	%eax, %xmm1
00000000002d26a6	movq	(%r12), %rax
00000000002d26aa	xorps	%xmm2, %xmm2
00000000002d26ad	movq	%r12, %rdi
00000000002d26b0	callq	*0x60(%rax)
00000000002d26b3	movq	(%r12), %rax
00000000002d26b7	movq	%r12, %rdi
00000000002d26ba	xorl	%esi, %esi
00000000002d26bc	callq	*0x38(%rax)
00000000002d26bf	jmp	0x2d2630
00000000002d26c4	movq	0x10(%rbx), %rsi
00000000002d26c8	movq	0x18(%rbx), %rdx
00000000002d26cc	movq	(%r12), %rax
00000000002d26d0	movq	%r12, %rdi
00000000002d26d3	movl	$0x8, %ecx
00000000002d26d8	callq	*0xc0(%rax)
00000000002d26de	movq	-0x38(%rbp), %rdi
00000000002d26e2	movq	(%rdi), %rax
00000000002d26e5	movq	%rbx, %rsi
00000000002d26e8	xorl	%edx, %edx
00000000002d26ea	movq	%r12, %rcx
00000000002d26ed	callq	*0x1e0(%rax)
00000000002d26f3	jmp	0x2d25ae
00000000002d26f8	jmp	0x2d26fc
00000000002d26fa	jmp	0x2d26fc
00000000002d26fc	movq	%rax, %rbx
00000000002d26ff	leaq	-0x30(%rbp), %rdi
00000000002d2703	callq	__ZN28HGPagePullMetalTexturesGuardD1Ev ## HGPagePullMetalTexturesGuard::~HGPagePullMetalTexturesGuard()
00000000002d2708	movq	%rbx, %rdi
00000000002d270b	callq	0x3c4e02                        ## symbol stub for: __Unwind_Resume
