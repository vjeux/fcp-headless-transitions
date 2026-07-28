__ZN40HGCPixelFormatConversion_kV4B_WXYZ_input6GetDODEP10HGRendereri6HGRect:
00000000000f4d30	testl	%edx, %edx
00000000000f4d32	je	0xf4d43
00000000000f4d34	leaq	_HGRectNull(%rip), %rcx
00000000000f4d3b	movq	(%rcx), %rax
00000000000f4d3e	movq	0x8(%rcx), %rdx
00000000000f4d42	retq
00000000000f4d43	pushq	%rbp
00000000000f4d44	movq	%rsp, %rbp
00000000000f4d47	pushq	%rbx
00000000000f4d48	pushq	%rax
00000000000f4d49	movq	%rdi, %rax
00000000000f4d4c	movq	%rsi, %rdi
00000000000f4d4f	movq	%rsi, %rbx
00000000000f4d52	movq	%rax, %rsi
00000000000f4d55	xorl	%edx, %edx
00000000000f4d57	callq	__ZN10HGRenderer8GetInputEP6HGNodei ## HGRenderer::GetInput(HGNode*, int)
00000000000f4d5c	movq	%rbx, %rdi
00000000000f4d5f	movq	%rax, %rsi
00000000000f4d62	addq	$0x8, %rsp
00000000000f4d66	popq	%rbx
00000000000f4d67	popq	%rbp
00000000000f4d68	jmp	__ZN10HGRenderer6GetDODEP6HGNode ## HGRenderer::GetDOD(HGNode*)
00000000000f4d6d	nopl	(%rax)
