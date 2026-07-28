__ZN40HGCPixelFormatConversion_kV4F_WXYZ_input6GetDODEP10HGRendereri6HGRect:
00000000000f4e50	testl	%edx, %edx
00000000000f4e52	je	0xf4e63
00000000000f4e54	leaq	_HGRectNull(%rip), %rcx
00000000000f4e5b	movq	(%rcx), %rax
00000000000f4e5e	movq	0x8(%rcx), %rdx
00000000000f4e62	retq
00000000000f4e63	pushq	%rbp
00000000000f4e64	movq	%rsp, %rbp
00000000000f4e67	pushq	%rbx
00000000000f4e68	pushq	%rax
00000000000f4e69	movq	%rdi, %rax
00000000000f4e6c	movq	%rsi, %rdi
00000000000f4e6f	movq	%rsi, %rbx
00000000000f4e72	movq	%rax, %rsi
00000000000f4e75	xorl	%edx, %edx
00000000000f4e77	callq	__ZN10HGRenderer8GetInputEP6HGNodei ## HGRenderer::GetInput(HGNode*, int)
00000000000f4e7c	movq	%rbx, %rdi
00000000000f4e7f	movq	%rax, %rsi
00000000000f4e82	addq	$0x8, %rsp
00000000000f4e86	popq	%rbx
00000000000f4e87	popq	%rbp
00000000000f4e88	jmp	__ZN10HGRenderer6GetDODEP6HGNode ## HGRenderer::GetDOD(HGNode*)
00000000000f4e8d	nopl	(%rax)
