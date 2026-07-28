__ZN40HGCPixelFormatConversion_kV4S_WXYZ_input6GetDODEP10HGRendereri6HGRect:
00000000000f4dc0	testl	%edx, %edx
00000000000f4dc2	je	0xf4dd3
00000000000f4dc4	leaq	_HGRectNull(%rip), %rcx
00000000000f4dcb	movq	(%rcx), %rax
00000000000f4dce	movq	0x8(%rcx), %rdx
00000000000f4dd2	retq
00000000000f4dd3	pushq	%rbp
00000000000f4dd4	movq	%rsp, %rbp
00000000000f4dd7	pushq	%rbx
00000000000f4dd8	pushq	%rax
00000000000f4dd9	movq	%rdi, %rax
00000000000f4ddc	movq	%rsi, %rdi
00000000000f4ddf	movq	%rsi, %rbx
00000000000f4de2	movq	%rax, %rsi
00000000000f4de5	xorl	%edx, %edx
00000000000f4de7	callq	__ZN10HGRenderer8GetInputEP6HGNodei ## HGRenderer::GetInput(HGNode*, int)
00000000000f4dec	movq	%rbx, %rdi
00000000000f4def	movq	%rax, %rsi
00000000000f4df2	addq	$0x8, %rsp
00000000000f4df6	popq	%rbx
00000000000f4df7	popq	%rbp
00000000000f4df8	jmp	__ZN10HGRenderer6GetDODEP6HGNode ## HGRenderer::GetDOD(HGNode*)
00000000000f4dfd	nopl	(%rax)
