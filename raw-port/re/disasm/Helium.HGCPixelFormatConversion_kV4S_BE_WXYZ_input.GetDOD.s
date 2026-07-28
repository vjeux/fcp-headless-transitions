__ZN43HGCPixelFormatConversion_kV4S_BE_WXYZ_input6GetDODEP10HGRendereri6HGRect:
00000000000f4ee0	testl	%edx, %edx
00000000000f4ee2	je	0xf4ef3
00000000000f4ee4	leaq	_HGRectNull(%rip), %rcx
00000000000f4eeb	movq	(%rcx), %rax
00000000000f4eee	movq	0x8(%rcx), %rdx
00000000000f4ef2	retq
00000000000f4ef3	pushq	%rbp
00000000000f4ef4	movq	%rsp, %rbp
00000000000f4ef7	pushq	%rbx
00000000000f4ef8	pushq	%rax
00000000000f4ef9	movq	%rdi, %rax
00000000000f4efc	movq	%rsi, %rdi
00000000000f4eff	movq	%rsi, %rbx
00000000000f4f02	movq	%rax, %rsi
00000000000f4f05	xorl	%edx, %edx
00000000000f4f07	callq	__ZN10HGRenderer8GetInputEP6HGNodei ## HGRenderer::GetInput(HGNode*, int)
00000000000f4f0c	movq	%rbx, %rdi
00000000000f4f0f	movq	%rax, %rsi
00000000000f4f12	addq	$0x8, %rsp
00000000000f4f16	popq	%rbx
00000000000f4f17	popq	%rbp
00000000000f4f18	jmp	__ZN10HGRenderer6GetDODEP6HGNode ## HGRenderer::GetDOD(HGNode*)
00000000000f4f1d	nopl	(%rax)
