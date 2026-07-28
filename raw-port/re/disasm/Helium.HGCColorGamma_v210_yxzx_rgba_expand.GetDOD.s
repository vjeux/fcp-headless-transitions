__ZN35HGCColorGamma_v210_yxzx_rgba_expand6GetDODEP10HGRendereri6HGRect:
00000000000fd020	testl	%edx, %edx
00000000000fd022	je	0xfd033
00000000000fd024	leaq	_HGRectNull(%rip), %rcx
00000000000fd02b	movq	(%rcx), %rax
00000000000fd02e	movq	0x8(%rcx), %rdx
00000000000fd032	retq
00000000000fd033	pushq	%rbp
00000000000fd034	movq	%rsp, %rbp
00000000000fd037	pushq	%rbx
00000000000fd038	pushq	%rax
00000000000fd039	movq	%rdi, %rax
00000000000fd03c	movq	%rsi, %rdi
00000000000fd03f	movq	%rsi, %rbx
00000000000fd042	movq	%rax, %rsi
00000000000fd045	xorl	%edx, %edx
00000000000fd047	callq	__ZN10HGRenderer8GetInputEP6HGNodei ## HGRenderer::GetInput(HGNode*, int)
00000000000fd04c	movq	%rbx, %rdi
00000000000fd04f	movq	%rax, %rsi
00000000000fd052	addq	$0x8, %rsp
00000000000fd056	popq	%rbx
00000000000fd057	popq	%rbp
00000000000fd058	jmp	__ZN10HGRenderer6GetDODEP6HGNode ## HGRenderer::GetDOD(HGNode*)
00000000000fd05d	nopl	(%rax)
