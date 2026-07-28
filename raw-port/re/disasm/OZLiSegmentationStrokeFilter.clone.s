__ZNK28OZLiSegmentationStrokeFilter5cloneEv:
0000000000424550	pushq	%rbp
0000000000424551	movq	%rsp, %rbp
0000000000424554	pushq	%r15
0000000000424556	pushq	%r14
0000000000424558	pushq	%r12
000000000042455a	pushq	%rbx
000000000042455b	subq	$0x20, %rsp
000000000042455f	movq	%rsi, %r15
0000000000424562	movq	%rdi, %r14
0000000000424565	movl	$0x600, %edi                    ## imm = 0x600
000000000042456a	callq	0x6dfca2                        ## symbol stub for: __Znwm
000000000042456f	movq	%rax, %rbx
0000000000424572	movq	0x28(%r15), %rsi
0000000000424576	leaq	0x30(%r15), %rdx
000000000042457a	movq	%rax, %rdi
000000000042457d	callq	__ZN28OZLiSegmentationStrokeFilterC1EP11OZImageMaskRK14OZRenderParams ## OZLiSegmentationStrokeFilter::OZLiSegmentationStrokeFilter(OZImageMask*, OZRenderParams const&)
0000000000424582	movq	%rbx, -0x38(%rbp)
0000000000424586	movq	(%rbx), %rax
0000000000424589	movq	-0x18(%rax), %rsi
000000000042458d	addq	%rbx, %rsi
0000000000424590	leaq	-0x30(%rbp), %rbx
0000000000424594	movq	%rbx, %rdi
0000000000424597	callq	0x6ddadc                        ## symbol stub for: __ZN13PCSharedCountC1EP13PCShared_base
000000000042459c	movq	-0x38(%rbp), %r12
00000000004245a0	testq	%r12, %r12
00000000004245a3	jne	0x4245b3
00000000004245a5	movl	$0x1, %edi
00000000004245aa	callq	0x6dd290                        ## symbol stub for: __Z28throw_PCNullPointerExceptionb
00000000004245af	movq	-0x38(%rbp), %r12
00000000004245b3	movq	0x10(%r15), %rax
00000000004245b7	movq	%rax, 0x10(%r12)
00000000004245bc	leaq	0x18(%r15), %rsi
00000000004245c0	leaq	-0x28(%rbp), %rdi
00000000004245c4	callq	0x6ddae2                        ## symbol stub for: __ZN13PCSharedCountC1ERKS_
00000000004245c9	leaq	0x18(%r12), %rdi
00000000004245ce	leaq	-0x28(%rbp), %rsi
00000000004245d2	callq	0x6ddaf4                        ## symbol stub for: __ZN13PCSharedCountaSES_
00000000004245d7	leaq	-0x28(%rbp), %rdi
00000000004245db	callq	0x6ddaee                        ## symbol stub for: __ZN13PCSharedCountD1Ev
00000000004245e0	movl	0x20(%r15), %eax
00000000004245e4	movl	%eax, 0x20(%r12)
00000000004245e9	movq	-0x38(%rbp), %rax
00000000004245ed	movq	%rax, (%r14)
00000000004245f0	leaq	0x8(%r14), %r15
00000000004245f4	movq	%r15, %rdi
00000000004245f7	callq	0x6ddae8                        ## symbol stub for: __ZN13PCSharedCountC1Ev
00000000004245fc	cmpq	$0x0, (%r14)
0000000000424600	je	0x424623
0000000000424602	leaq	-0x28(%rbp), %rdi
0000000000424606	movq	%rbx, %rsi
0000000000424609	callq	0x6ddae2                        ## symbol stub for: __ZN13PCSharedCountC1ERKS_
000000000042460e	leaq	-0x28(%rbp), %rsi
0000000000424612	movq	%r15, %rdi
0000000000424615	callq	0x6ddaf4                        ## symbol stub for: __ZN13PCSharedCountaSES_
000000000042461a	leaq	-0x28(%rbp), %rdi
000000000042461e	callq	0x6ddaee                        ## symbol stub for: __ZN13PCSharedCountD1Ev
0000000000424623	movq	%rbx, %rdi
0000000000424626	callq	0x6ddaee                        ## symbol stub for: __ZN13PCSharedCountD1Ev
000000000042462b	movq	%r14, %rax
000000000042462e	addq	$0x20, %rsp
0000000000424632	popq	%rbx
0000000000424633	popq	%r12
0000000000424635	popq	%r14
0000000000424637	popq	%r15
0000000000424639	popq	%rbp
000000000042463a	retq
000000000042463b	movq	%rax, %r14
000000000042463e	leaq	-0x28(%rbp), %rdi
0000000000424642	callq	0x6ddaee                        ## symbol stub for: __ZN13PCSharedCountD1Ev
0000000000424647	jmp	0x42464c
0000000000424649	movq	%rax, %r14
000000000042464c	movq	%r15, %rdi
000000000042464f	jmp	0x424658
0000000000424651	movq	%rax, %r14
0000000000424654	leaq	-0x28(%rbp), %rdi
0000000000424658	callq	0x6ddaee                        ## symbol stub for: __ZN13PCSharedCountD1Ev
000000000042465d	movq	%rbx, %rdi
0000000000424660	callq	0x6ddaee                        ## symbol stub for: __ZN13PCSharedCountD1Ev
0000000000424665	movq	%r14, %rdi
0000000000424668	callq	0x6dd07a                        ## symbol stub for: __Unwind_Resume
000000000042466d	movq	%rax, %r14
0000000000424670	movq	%rbx, %rdi
0000000000424673	callq	0x6dfc36                        ## symbol stub for: __ZdlPv
0000000000424678	movq	%r14, %rdi
000000000042467b	callq	0x6dd07a                        ## symbol stub for: __Unwind_Resume
0000000000424680	movq	%rax, %r14
0000000000424683	movq	%rbx, %rdi
0000000000424686	callq	0x6ddaee                        ## symbol stub for: __ZN13PCSharedCountD1Ev
000000000042468b	movq	%r14, %rdi
000000000042468e	callq	0x6dd07a                        ## symbol stub for: __Unwind_Resume
0000000000424693	nopw	%cs:(%rax,%rax)
