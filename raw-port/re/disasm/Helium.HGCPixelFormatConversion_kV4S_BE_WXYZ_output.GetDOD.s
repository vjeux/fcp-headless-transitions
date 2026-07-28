__ZN44HGCPixelFormatConversion_kV4S_BE_WXYZ_output6GetDODEP10HGRendereri6HGRect:
00000000000fd3e0	testl	%edx, %edx
00000000000fd3e2	je	0xfd3f3
00000000000fd3e4	leaq	_HGRectNull(%rip), %rcx
00000000000fd3eb	movq	(%rcx), %rax
00000000000fd3ee	movq	0x8(%rcx), %rdx
00000000000fd3f2	retq
00000000000fd3f3	pushq	%rbp
00000000000fd3f4	movq	%rsp, %rbp
00000000000fd3f7	pushq	%rbx
00000000000fd3f8	pushq	%rax
00000000000fd3f9	movq	%rdi, %rax
00000000000fd3fc	movq	%rsi, %rdi
00000000000fd3ff	movq	%rsi, %rbx
00000000000fd402	movq	%rax, %rsi
00000000000fd405	xorl	%edx, %edx
00000000000fd407	callq	__ZN10HGRenderer8GetInputEP6HGNodei ## HGRenderer::GetInput(HGNode*, int)
00000000000fd40c	movq	%rbx, %rdi
00000000000fd40f	movq	%rax, %rsi
00000000000fd412	addq	$0x8, %rsp
00000000000fd416	popq	%rbx
00000000000fd417	popq	%rbp
00000000000fd418	jmp	__ZN10HGRenderer6GetDODEP6HGNode ## HGRenderer::GetDOD(HGNode*)
00000000000fd41d	nopl	(%rax)
