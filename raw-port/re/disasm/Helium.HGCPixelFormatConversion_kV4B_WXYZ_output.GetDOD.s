__ZN41HGCPixelFormatConversion_kV4B_WXYZ_output6GetDODEP10HGRendereri6HGRect:
00000000000fd200	testl	%edx, %edx
00000000000fd202	je	0xfd213
00000000000fd204	leaq	_HGRectNull(%rip), %rcx
00000000000fd20b	movq	(%rcx), %rax
00000000000fd20e	movq	0x8(%rcx), %rdx
00000000000fd212	retq
00000000000fd213	pushq	%rbp
00000000000fd214	movq	%rsp, %rbp
00000000000fd217	pushq	%rbx
00000000000fd218	pushq	%rax
00000000000fd219	movq	%rdi, %rax
00000000000fd21c	movq	%rsi, %rdi
00000000000fd21f	movq	%rsi, %rbx
00000000000fd222	movq	%rax, %rsi
00000000000fd225	xorl	%edx, %edx
00000000000fd227	callq	__ZN10HGRenderer8GetInputEP6HGNodei ## HGRenderer::GetInput(HGNode*, int)
00000000000fd22c	movq	%rbx, %rdi
00000000000fd22f	movq	%rax, %rsi
00000000000fd232	addq	$0x8, %rsp
00000000000fd236	popq	%rbx
00000000000fd237	popq	%rbp
00000000000fd238	jmp	__ZN10HGRenderer6GetDODEP6HGNode ## HGRenderer::GetDOD(HGNode*)
00000000000fd23d	nopl	(%rax)
