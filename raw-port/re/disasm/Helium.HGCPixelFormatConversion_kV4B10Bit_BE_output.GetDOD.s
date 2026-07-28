__ZN44HGCPixelFormatConversion_kV4B10Bit_BE_output6GetDODEP10HGRendereri6HGRect:
00000000000fd480	testl	%edx, %edx
00000000000fd482	je	0xfd493
00000000000fd484	leaq	_HGRectNull(%rip), %rcx
00000000000fd48b	movq	(%rcx), %rax
00000000000fd48e	movq	0x8(%rcx), %rdx
00000000000fd492	retq
00000000000fd493	pushq	%rbp
00000000000fd494	movq	%rsp, %rbp
00000000000fd497	pushq	%rbx
00000000000fd498	pushq	%rax
00000000000fd499	movq	%rdi, %rax
00000000000fd49c	movq	%rsi, %rdi
00000000000fd49f	movq	%rsi, %rbx
00000000000fd4a2	movq	%rax, %rsi
00000000000fd4a5	xorl	%edx, %edx
00000000000fd4a7	callq	__ZN10HGRenderer8GetInputEP6HGNodei ## HGRenderer::GetInput(HGNode*, int)
00000000000fd4ac	movq	%rbx, %rdi
00000000000fd4af	movq	%rax, %rsi
00000000000fd4b2	addq	$0x8, %rsp
00000000000fd4b6	popq	%rbx
00000000000fd4b7	popq	%rbp
00000000000fd4b8	jmp	__ZN10HGRenderer6GetDODEP6HGNode ## HGRenderer::GetDOD(HGNode*)
00000000000fd4bd	nopl	(%rax)
