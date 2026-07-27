__ZN8OZSpline18getNextValidVertexEPvPS0_RK6CMTime:
000000000002df68	pushq	%rbp
000000000002df69	movq	%rsp, %rbp
000000000002df6c	pushq	%r15
000000000002df6e	pushq	%r14
000000000002df70	pushq	%rbx
000000000002df71	pushq	%rax
000000000002df72	movq	%rdx, %rbx
000000000002df75	movq	%rdi, %r14
000000000002df78	cmpb	$0x1, 0x70(%rdi)
000000000002df7c	jne	0x2dfaa
000000000002df7e	movq	%r14, %rdi
000000000002df81	callq	__ZN8OZSpline18getValidVertexIterEPv ## OZSpline::getValidVertexIter(void*)
000000000002df86	movq	%rax, %rcx
000000000002df89	movq	0x50(%r14), %rax
000000000002df8d	cmpq	%rax, %rcx
000000000002df90	je	0x2dfcc
000000000002df92	addq	$0x8, %rcx
000000000002df96	cmpq	%rax, %rcx
000000000002df99	je	0x2dfcc
000000000002df9b	movb	$0x1, %al
000000000002df9d	testq	%rbx, %rbx
000000000002dfa0	je	0x2dfda
000000000002dfa2	movq	(%rcx), %rcx
000000000002dfa5	movq	%rcx, (%rbx)
000000000002dfa8	jmp	0x2dfda
000000000002dfaa	movq	%rcx, %r15
000000000002dfad	movq	%r14, %rdi
000000000002dfb0	callq	__ZN8OZSpline13getVertexIterEPv ## OZSpline::getVertexIter(void*)
000000000002dfb5	leaq	-0x20(%rbp), %rsi
000000000002dfb9	movq	%rax, (%rsi)
000000000002dfbc	movq	%r14, %rdi
000000000002dfbf	movq	%rbx, %rdx
000000000002dfc2	movq	%r15, %rcx
000000000002dfc5	callq	__ZN8OZSpline18getNextValidVertexERKNSt3__111__wrap_iterIPP8OZVertexEEPPvRK6CMTime ## OZSpline::getNextValidVertex(std::__1::__wrap_iter<OZVertex**> const&, void**, CMTime const&)
000000000002dfca	jmp	0x2dfda
000000000002dfcc	testq	%rbx, %rbx
000000000002dfcf	je	0x2dfd8
000000000002dfd1	movq	$0x0, (%rbx)
000000000002dfd8	xorl	%eax, %eax
000000000002dfda	addq	$0x8, %rsp
000000000002dfde	popq	%rbx
000000000002dfdf	popq	%r14
000000000002dfe1	popq	%r15
000000000002dfe3	popq	%rbp
000000000002dfe4	retq
000000000002dfe5	nop
