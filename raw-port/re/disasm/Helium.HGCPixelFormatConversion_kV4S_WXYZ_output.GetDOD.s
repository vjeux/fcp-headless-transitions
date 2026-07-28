__ZN41HGCPixelFormatConversion_kV4S_WXYZ_output6GetDODEP10HGRendereri6HGRect:
00000000000fd2a0	testl	%edx, %edx
00000000000fd2a2	je	0xfd2b3
00000000000fd2a4	leaq	_HGRectNull(%rip), %rcx
00000000000fd2ab	movq	(%rcx), %rax
00000000000fd2ae	movq	0x8(%rcx), %rdx
00000000000fd2b2	retq
00000000000fd2b3	pushq	%rbp
00000000000fd2b4	movq	%rsp, %rbp
00000000000fd2b7	pushq	%rbx
00000000000fd2b8	pushq	%rax
00000000000fd2b9	movq	%rdi, %rax
00000000000fd2bc	movq	%rsi, %rdi
00000000000fd2bf	movq	%rsi, %rbx
00000000000fd2c2	movq	%rax, %rsi
00000000000fd2c5	xorl	%edx, %edx
00000000000fd2c7	callq	__ZN10HGRenderer8GetInputEP6HGNodei ## HGRenderer::GetInput(HGNode*, int)
00000000000fd2cc	movq	%rbx, %rdi
00000000000fd2cf	movq	%rax, %rsi
00000000000fd2d2	addq	$0x8, %rsp
00000000000fd2d6	popq	%rbx
00000000000fd2d7	popq	%rbp
00000000000fd2d8	jmp	__ZN10HGRenderer6GetDODEP6HGNode ## HGRenderer::GetDOD(HGNode*)
00000000000fd2dd	nopl	(%rax)
