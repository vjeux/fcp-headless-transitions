__ZN21OZBSplineInterpolator26generatePeriodicKnotVectorER8OZSpline:
0000000000041e06	pushq	%rbp
0000000000041e07	movq	%rsp, %rbp
0000000000041e0a	pushq	%r15
0000000000041e0c	pushq	%r14
0000000000041e0e	pushq	%r12
0000000000041e10	pushq	%rbx
0000000000041e11	subq	$0x10, %rsp
0000000000041e15	movl	0x20(%rdi), %r14d
0000000000041e19	movl	0x70(%rdi), %r15d
0000000000041e1d	leal	(%r15,%r14), %r12d
0000000000041e21	leaq	0x40(%rdi), %rbx
0000000000041e25	movq	0x40(%rdi), %rax
0000000000041e29	movq	%rax, 0x48(%rdi)
0000000000041e2d	leaq	-0x28(%rbp), %rsi
0000000000041e31	movq	$0x0, (%rsi)
0000000000041e38	movq	%rbx, %rdi
0000000000041e3b	callq	__ZNSt3__16vectorIdNS_9allocatorIdEEE9push_backB9nqe210106EOd ## std::__1::vector<double, std::__1::allocator<double>>::push_back[abi:nqe210106](double&&)
0000000000041e40	cmpl	$0x2, %r12d
0000000000041e44	jl	0x41e7f
0000000000041e46	addl	%r14d, %r15d
0000000000041e49	decl	%r15d
0000000000041e4c	movsd	0x6d6d4(%rip), %xmm0
0000000000041e54	leaq	-0x28(%rbp), %r14
0000000000041e58	movsd	%xmm0, -0x30(%rbp)
0000000000041e5d	movsd	%xmm0, -0x28(%rbp)
0000000000041e62	movq	%rbx, %rdi
0000000000041e65	movq	%r14, %rsi
0000000000041e68	callq	__ZNSt3__16vectorIdNS_9allocatorIdEEE9push_backB9nqe210106EOd ## std::__1::vector<double, std::__1::allocator<double>>::push_back[abi:nqe210106](double&&)
0000000000041e6d	movsd	-0x30(%rbp), %xmm0
0000000000041e72	addsd	0x6d6ae(%rip), %xmm0
0000000000041e7a	decl	%r15d
0000000000041e7d	jne	0x41e58
0000000000041e7f	addq	$0x10, %rsp
0000000000041e83	popq	%rbx
0000000000041e84	popq	%r12
0000000000041e86	popq	%r14
0000000000041e88	popq	%r15
0000000000041e8a	popq	%rbp
0000000000041e8b	retq
