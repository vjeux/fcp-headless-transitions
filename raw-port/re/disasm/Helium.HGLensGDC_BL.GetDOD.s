__ZN12HGLensGDC_BL6GetDODEP10HGRendereri6HGRect:
00000000001e3770	testl	%edx, %edx
00000000001e3772	je	0x1e3783
00000000001e3774	leaq	_HGRectNull(%rip), %rcx
00000000001e377b	movq	(%rcx), %rax
00000000001e377e	movq	0x8(%rcx), %rdx
00000000001e3782	retq
00000000001e3783	pushq	%rbp
00000000001e3784	movq	%rsp, %rbp
00000000001e3787	pushq	%rbx
00000000001e3788	pushq	%rax
00000000001e3789	movq	%rdi, %rax
00000000001e378c	movq	%rsi, %rdi
00000000001e378f	movq	%rsi, %rbx
00000000001e3792	movq	%rax, %rsi
00000000001e3795	xorl	%edx, %edx
00000000001e3797	callq	__ZN10HGRenderer8GetInputEP6HGNodei ## HGRenderer::GetInput(HGNode*, int)
00000000001e379c	movq	%rbx, %rdi
00000000001e379f	movq	%rax, %rsi
00000000001e37a2	addq	$0x8, %rsp
00000000001e37a6	popq	%rbx
00000000001e37a7	popq	%rbp
00000000001e37a8	jmp	__ZN10HGRenderer6GetDODEP6HGNode ## HGRenderer::GetDOD(HGNode*)
00000000001e37ad	nopl	(%rax)
