__ZN13HGLegacyBlend6GetROIEP10HGRendereri6HGRect:
0000000000241cd0	pushq	%rbp
0000000000241cd1	movq	%rsp, %rbp
0000000000241cd4	pushq	%r15
0000000000241cd6	pushq	%r14
0000000000241cd8	pushq	%rbx
0000000000241cd9	pushq	%rax
0000000000241cda	cmpl	$0x1, %edx
0000000000241cdd	ja	0x241d1e
0000000000241cdf	movq	%r8, %rbx
0000000000241ce2	movq	%rcx, %r14
0000000000241ce5	movq	%rsi, %r15
0000000000241ce8	movq	%rdi, %rsi
0000000000241ceb	movq	%r15, %rdi
0000000000241cee	callq	__ZN10HGRenderer8GetInputEP6HGNodei ## HGRenderer::GetInput(HGNode*, int)
0000000000241cf3	movq	%r15, %rdi
0000000000241cf6	movq	%rax, %rsi
0000000000241cf9	callq	__ZN10HGRenderer6GetDODEP6HGNode ## HGRenderer::GetDOD(HGNode*)
0000000000241cfe	movq	%rax, %rdi
0000000000241d01	movq	%rdx, %rsi
0000000000241d04	movq	%r14, %rdx
0000000000241d07	movq	%rbx, %rcx
0000000000241d0a	callq	_HGRectIntersection
0000000000241d0f	movq	%rax, %rdi
0000000000241d12	movq	%rdx, %rsi
0000000000241d15	callq	_HGRectIsNull
0000000000241d1a	testl	%eax, %eax
0000000000241d1c	je	0x241d2c
0000000000241d1e	leaq	_HGRectNull(%rip), %rax
0000000000241d25	movq	(%rax), %r14
0000000000241d28	movq	0x8(%rax), %rbx
0000000000241d2c	movq	%r14, %rax
0000000000241d2f	movq	%rbx, %rdx
0000000000241d32	addq	$0x8, %rsp
0000000000241d36	popq	%rbx
0000000000241d37	popq	%r14
0000000000241d39	popq	%r15
0000000000241d3b	popq	%rbp
0000000000241d3c	retq
0000000000241d3d	nopl	(%rax)
