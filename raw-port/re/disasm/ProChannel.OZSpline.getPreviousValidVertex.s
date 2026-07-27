__ZN8OZSpline22getPreviousValidVertexEPvPS0_RK6CMTime:
000000000002f828	pushq	%rbp
000000000002f829	movq	%rsp, %rbp
000000000002f82c	pushq	%r15
000000000002f82e	pushq	%r14
000000000002f830	pushq	%rbx
000000000002f831	pushq	%rax
000000000002f832	movq	%rdx, %rbx
000000000002f835	movq	%rdi, %r14
000000000002f838	cmpb	$0x1, 0x70(%rdi)
000000000002f83c	jne	0x2f85f
000000000002f83e	movq	%r14, %rdi
000000000002f841	callq	__ZN8OZSpline18getValidVertexIterEPv ## OZSpline::getValidVertexIter(void*)
000000000002f846	cmpq	0x48(%r14), %rax
000000000002f84a	je	0x2f881
000000000002f84c	movq	%rax, %rcx
000000000002f84f	movb	$0x1, %al
000000000002f851	testq	%rbx, %rbx
000000000002f854	je	0x2f88f
000000000002f856	movq	-0x8(%rcx), %rcx
000000000002f85a	movq	%rcx, (%rbx)
000000000002f85d	jmp	0x2f88f
000000000002f85f	movq	%rcx, %r15
000000000002f862	movq	%r14, %rdi
000000000002f865	callq	__ZN8OZSpline13getVertexIterEPv ## OZSpline::getVertexIter(void*)
000000000002f86a	leaq	-0x20(%rbp), %rsi
000000000002f86e	movq	%rax, (%rsi)
000000000002f871	movq	%r14, %rdi
000000000002f874	movq	%rbx, %rdx
000000000002f877	movq	%r15, %rcx
000000000002f87a	callq	__ZN8OZSpline22getPreviousValidVertexERKNSt3__111__wrap_iterIPP8OZVertexEEPPvRK6CMTime ## OZSpline::getPreviousValidVertex(std::__1::__wrap_iter<OZVertex**> const&, void**, CMTime const&)
000000000002f87f	jmp	0x2f88f
000000000002f881	testq	%rbx, %rbx
000000000002f884	je	0x2f88d
000000000002f886	movq	$0x0, (%rbx)
000000000002f88d	xorl	%eax, %eax
000000000002f88f	addq	$0x8, %rsp
000000000002f893	popq	%rbx
000000000002f894	popq	%r14
000000000002f896	popq	%r15
000000000002f898	popq	%rbp
000000000002f899	retq
