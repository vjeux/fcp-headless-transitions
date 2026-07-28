__ZN30HGCColorGamma_2vuy_xyxz_expand6GetDODEP10HGRendereri6HGRect:
00000000000fcf60	testl	%edx, %edx
00000000000fcf62	je	0xfcf73
00000000000fcf64	leaq	_HGRectNull(%rip), %rcx
00000000000fcf6b	movq	(%rcx), %rax
00000000000fcf6e	movq	0x8(%rcx), %rdx
00000000000fcf72	retq
00000000000fcf73	pushq	%rbp
00000000000fcf74	movq	%rsp, %rbp
00000000000fcf77	pushq	%rbx
00000000000fcf78	pushq	%rax
00000000000fcf79	movq	%rdi, %rax
00000000000fcf7c	movq	%rsi, %rdi
00000000000fcf7f	movq	%rsi, %rbx
00000000000fcf82	movq	%rax, %rsi
00000000000fcf85	xorl	%edx, %edx
00000000000fcf87	callq	__ZN10HGRenderer8GetInputEP6HGNodei ## HGRenderer::GetInput(HGNode*, int)
00000000000fcf8c	movq	%rbx, %rdi
00000000000fcf8f	movq	%rax, %rsi
00000000000fcf92	addq	$0x8, %rsp
00000000000fcf96	popq	%rbx
00000000000fcf97	popq	%rbp
00000000000fcf98	jmp	__ZN10HGRenderer6GetDODEP6HGNode ## HGRenderer::GetDOD(HGNode*)
00000000000fcf9d	nopl	(%rax)
