__ZN10HGAnaglyph6GetDODEP10HGRendereri6HGRect:
000000000006f7b0	cmpl	$0x2, %edx
000000000006f7b3	jl	0x6f7c4
000000000006f7b5	leaq	_HGRectNull(%rip), %rcx
000000000006f7bc	movq	(%rcx), %rax
000000000006f7bf	movq	0x8(%rcx), %rdx
000000000006f7c3	retq
000000000006f7c4	pushq	%rbp
000000000006f7c5	movq	%rsp, %rbp
000000000006f7c8	pushq	%r15
000000000006f7ca	pushq	%r14
000000000006f7cc	pushq	%r12
000000000006f7ce	pushq	%rbx
000000000006f7cf	movq	%rsi, %rbx
000000000006f7d2	movq	%rdi, %r14
000000000006f7d5	movq	%rsi, %rdi
000000000006f7d8	movq	%r14, %rsi
000000000006f7db	xorl	%edx, %edx
000000000006f7dd	callq	__ZN10HGRenderer8GetInputEP6HGNodei ## HGRenderer::GetInput(HGNode*, int)
000000000006f7e2	movq	%rbx, %rdi
000000000006f7e5	movq	%rax, %rsi
000000000006f7e8	callq	__ZN10HGRenderer6GetDODEP6HGNode ## HGRenderer::GetDOD(HGNode*)
000000000006f7ed	movq	%rax, %r15
000000000006f7f0	movq	%rdx, %r12
000000000006f7f3	movq	%rbx, %rdi
000000000006f7f6	movq	%r14, %rsi
000000000006f7f9	movl	$0x1, %edx
000000000006f7fe	callq	__ZN10HGRenderer8GetInputEP6HGNodei ## HGRenderer::GetInput(HGNode*, int)
000000000006f803	movq	%rbx, %rdi
000000000006f806	movq	%rax, %rsi
000000000006f809	callq	__ZN10HGRenderer6GetDODEP6HGNode ## HGRenderer::GetDOD(HGNode*)
000000000006f80e	movq	%rdx, %rcx
000000000006f811	movq	%r15, %rdi
000000000006f814	movq	%r12, %rsi
000000000006f817	movq	%rax, %rdx
000000000006f81a	popq	%rbx
000000000006f81b	popq	%r12
000000000006f81d	popq	%r14
000000000006f81f	popq	%r15
000000000006f821	popq	%rbp
000000000006f822	jmp	_HGRectIntersection
000000000006f827	nopw	(%rax,%rax)
