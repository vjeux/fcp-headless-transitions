__ZN9HGStencil6GetDODEP10HGRendereri6HGRect:
00000000002d2110	cmpl	$0x2, %edx
00000000002d2113	jl	0x2d2124
00000000002d2115	leaq	_HGRectNull(%rip), %rcx
00000000002d211c	movq	(%rcx), %rax
00000000002d211f	movq	0x8(%rcx), %rdx
00000000002d2123	retq
00000000002d2124	pushq	%rbp
00000000002d2125	movq	%rsp, %rbp
00000000002d2128	pushq	%r15
00000000002d212a	pushq	%r14
00000000002d212c	pushq	%r12
00000000002d212e	pushq	%rbx
00000000002d212f	movq	%rsi, %rbx
00000000002d2132	movq	%rdi, %r14
00000000002d2135	movq	%rsi, %rdi
00000000002d2138	movq	%r14, %rsi
00000000002d213b	xorl	%edx, %edx
00000000002d213d	callq	__ZN10HGRenderer8GetInputEP6HGNodei ## HGRenderer::GetInput(HGNode*, int)
00000000002d2142	movq	%rbx, %rdi
00000000002d2145	movq	%rax, %rsi
00000000002d2148	callq	__ZN10HGRenderer6GetDODEP6HGNode ## HGRenderer::GetDOD(HGNode*)
00000000002d214d	movq	%rax, %r15
00000000002d2150	movq	%rdx, %r12
00000000002d2153	movq	%rbx, %rdi
00000000002d2156	movq	%r14, %rsi
00000000002d2159	movl	$0x1, %edx
00000000002d215e	callq	__ZN10HGRenderer8GetInputEP6HGNodei ## HGRenderer::GetInput(HGNode*, int)
00000000002d2163	movq	%rbx, %rdi
00000000002d2166	movq	%rax, %rsi
00000000002d2169	callq	__ZN10HGRenderer6GetDODEP6HGNode ## HGRenderer::GetDOD(HGNode*)
00000000002d216e	movq	%rdx, %rcx
00000000002d2171	movq	%r15, %rdi
00000000002d2174	movq	%r12, %rsi
00000000002d2177	movq	%rax, %rdx
00000000002d217a	popq	%rbx
00000000002d217b	popq	%r12
00000000002d217d	popq	%r14
00000000002d217f	popq	%r15
00000000002d2181	popq	%rbp
00000000002d2182	jmp	_HGRectIntersection
00000000002d2187	nopw	(%rax,%rax)
