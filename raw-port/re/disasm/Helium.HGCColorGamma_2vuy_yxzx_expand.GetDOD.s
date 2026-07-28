__ZN30HGCColorGamma_2vuy_yxzx_expand6GetDODEP10HGRendereri6HGRect:
00000000000fcea0	testl	%edx, %edx
00000000000fcea2	je	0xfceb3
00000000000fcea4	leaq	_HGRectNull(%rip), %rcx
00000000000fceab	movq	(%rcx), %rax
00000000000fceae	movq	0x8(%rcx), %rdx
00000000000fceb2	retq
00000000000fceb3	pushq	%rbp
00000000000fceb4	movq	%rsp, %rbp
00000000000fceb7	pushq	%rbx
00000000000fceb8	pushq	%rax
00000000000fceb9	movq	%rdi, %rax
00000000000fcebc	movq	%rsi, %rdi
00000000000fcebf	movq	%rsi, %rbx
00000000000fcec2	movq	%rax, %rsi
00000000000fcec5	xorl	%edx, %edx
00000000000fcec7	callq	__ZN10HGRenderer8GetInputEP6HGNodei ## HGRenderer::GetInput(HGNode*, int)
00000000000fcecc	movq	%rbx, %rdi
00000000000fcecf	movq	%rax, %rsi
00000000000fced2	addq	$0x8, %rsp
00000000000fced6	popq	%rbx
00000000000fced7	popq	%rbp
00000000000fced8	jmp	__ZN10HGRenderer6GetDODEP6HGNode ## HGRenderer::GetDOD(HGNode*)
00000000000fcedd	nopl	(%rax)
