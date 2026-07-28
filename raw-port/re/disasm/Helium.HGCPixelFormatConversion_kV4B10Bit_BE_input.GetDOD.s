__ZN43HGCPixelFormatConversion_kV4B10Bit_BE_input6GetDODEP10HGRendereri6HGRect:
00000000000f4f70	testl	%edx, %edx
00000000000f4f72	je	0xf4f83
00000000000f4f74	leaq	_HGRectNull(%rip), %rcx
00000000000f4f7b	movq	(%rcx), %rax
00000000000f4f7e	movq	0x8(%rcx), %rdx
00000000000f4f82	retq
00000000000f4f83	pushq	%rbp
00000000000f4f84	movq	%rsp, %rbp
00000000000f4f87	pushq	%rbx
00000000000f4f88	pushq	%rax
00000000000f4f89	movq	%rdi, %rax
00000000000f4f8c	movq	%rsi, %rdi
00000000000f4f8f	movq	%rsi, %rbx
00000000000f4f92	movq	%rax, %rsi
00000000000f4f95	xorl	%edx, %edx
00000000000f4f97	callq	__ZN10HGRenderer8GetInputEP6HGNodei ## HGRenderer::GetInput(HGNode*, int)
00000000000f4f9c	movq	%rbx, %rdi
00000000000f4f9f	movq	%rax, %rsi
00000000000f4fa2	addq	$0x8, %rsp
00000000000f4fa6	popq	%rbx
00000000000f4fa7	popq	%rbp
00000000000f4fa8	jmp	__ZN10HGRenderer6GetDODEP6HGNode ## HGRenderer::GetDOD(HGNode*)
00000000000f4fad	nopl	(%rax)
