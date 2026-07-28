__ZN10HGCropNode6GetDODEP10HGRendereri6HGRect:
0000000000247790	testl	%edx, %edx
0000000000247792	je	0x2477a3
0000000000247794	leaq	_HGRectNull(%rip), %rcx
000000000024779b	movq	(%rcx), %rax
000000000024779e	movq	0x8(%rcx), %rdx
00000000002477a2	retq
00000000002477a3	pushq	%rbp
00000000002477a4	movq	%rsp, %rbp
00000000002477a7	pushq	%r14
00000000002477a9	pushq	%rbx
00000000002477aa	movq	%rdi, %rbx
00000000002477ad	movq	%rsi, %rdi
00000000002477b0	movq	%rsi, %r14
00000000002477b3	movq	%rbx, %rsi
00000000002477b6	xorl	%edx, %edx
00000000002477b8	callq	__ZN10HGRenderer8GetInputEP6HGNodei ## HGRenderer::GetInput(HGNode*, int)
00000000002477bd	movq	%r14, %rdi
00000000002477c0	movq	%rax, %rsi
00000000002477c3	callq	__ZN10HGRenderer6GetDODEP6HGNode ## HGRenderer::GetDOD(HGNode*)
00000000002477c8	movq	0x1a0(%rbx), %r8
00000000002477cf	movq	0x1a8(%rbx), %rcx
00000000002477d6	movq	%rax, %rdi
00000000002477d9	movq	%rdx, %rsi
00000000002477dc	movq	%r8, %rdx
00000000002477df	popq	%rbx
00000000002477e0	popq	%r14
00000000002477e2	popq	%rbp
00000000002477e3	jmp	_HGRectIntersection
00000000002477e8	nopl	(%rax,%rax)
