__ZN32HGCColorGamma_v216_yxzx_collapse6GetDODEP10HGRendereri6HGRect:
00000000000fda30	testl	%edx, %edx
00000000000fda32	je	0xfda43
00000000000fda34	leaq	_HGRectNull(%rip), %rcx
00000000000fda3b	movq	(%rcx), %rax
00000000000fda3e	movq	0x8(%rcx), %rdx
00000000000fda42	retq
00000000000fda43	pushq	%rbp
00000000000fda44	movq	%rsp, %rbp
00000000000fda47	pushq	%rbx
00000000000fda48	pushq	%rax
00000000000fda49	movq	%rdi, %rax
00000000000fda4c	movq	%rsi, %rdi
00000000000fda4f	movq	%rsi, %rbx
00000000000fda52	movq	%rax, %rsi
00000000000fda55	xorl	%edx, %edx
00000000000fda57	callq	__ZN10HGRenderer8GetInputEP6HGNodei ## HGRenderer::GetInput(HGNode*, int)
00000000000fda5c	movq	%rbx, %rdi
00000000000fda5f	movq	%rax, %rsi
00000000000fda62	addq	$0x8, %rsp
00000000000fda66	popq	%rbx
00000000000fda67	popq	%rbp
00000000000fda68	jmp	__ZN10HGRenderer6GetDODEP6HGNode ## HGRenderer::GetDOD(HGNode*)
00000000000fda6d	nopl	(%rax)
