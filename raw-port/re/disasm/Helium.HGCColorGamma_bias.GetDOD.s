__ZN18HGCColorGamma_bias6GetDODEP10HGRendereri6HGRect:
00000000000fd510	testl	%edx, %edx
00000000000fd512	je	0xfd523
00000000000fd514	leaq	_HGRectNull(%rip), %rcx
00000000000fd51b	movq	(%rcx), %rax
00000000000fd51e	movq	0x8(%rcx), %rdx
00000000000fd522	retq
00000000000fd523	pushq	%rbp
00000000000fd524	movq	%rsp, %rbp
00000000000fd527	pushq	%rbx
00000000000fd528	pushq	%rax
00000000000fd529	movq	%rdi, %rax
00000000000fd52c	movq	%rsi, %rdi
00000000000fd52f	movq	%rsi, %rbx
00000000000fd532	movq	%rax, %rsi
00000000000fd535	xorl	%edx, %edx
00000000000fd537	callq	__ZN10HGRenderer8GetInputEP6HGNodei ## HGRenderer::GetInput(HGNode*, int)
00000000000fd53c	movq	%rbx, %rdi
00000000000fd53f	movq	%rax, %rsi
00000000000fd542	addq	$0x8, %rsp
00000000000fd546	popq	%rbx
00000000000fd547	popq	%rbp
00000000000fd548	jmp	__ZN10HGRenderer6GetDODEP6HGNode ## HGRenderer::GetDOD(HGNode*)
00000000000fd54d	nopl	(%rax)
