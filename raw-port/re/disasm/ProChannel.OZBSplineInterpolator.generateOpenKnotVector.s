__ZN21OZBSplineInterpolator22generateOpenKnotVectorER8OZSpline:
0000000000041d4a	pushq	%rbp
0000000000041d4b	movq	%rsp, %rbp
0000000000041d4e	pushq	%r15
0000000000041d50	pushq	%r14
0000000000041d52	pushq	%r13
0000000000041d54	pushq	%r12
0000000000041d56	pushq	%rbx
0000000000041d57	subq	$0x18, %rsp
0000000000041d5b	movq	%rdi, %rbx
0000000000041d5e	movl	0x20(%rdi), %eax
0000000000041d61	movl	0x70(%rdi), %r15d
0000000000041d65	movq	%rax, -0x30(%rbp)
0000000000041d69	addl	%eax, %r15d
0000000000041d6c	leaq	0x40(%rdi), %r14
0000000000041d70	movq	0x40(%rdi), %rax
0000000000041d74	movq	%rax, 0x48(%rdi)
0000000000041d78	leaq	-0x38(%rbp), %rsi
0000000000041d7c	movq	$0x0, (%rsi)
0000000000041d83	movq	%r14, %rdi
0000000000041d86	callq	__ZNSt3__16vectorIdNS_9allocatorIdEEE9push_backB9nqe210106EOd ## std::__1::vector<double, std::__1::allocator<double>>::push_back[abi:nqe210106](double&&)
0000000000041d8b	cmpl	$0x2, %r15d
0000000000041d8f	jb	0x41df7
0000000000041d91	movq	-0x30(%rbp), %rax
0000000000041d95	addl	$0x2, %eax
0000000000041d98	movq	%rax, -0x30(%rbp)
0000000000041d9c	movl	%r15d, %r13d
0000000000041d9f	movl	$0x1, %eax
0000000000041da4	xorl	%r15d, %r15d
0000000000041da7	leaq	0x1(%rax), %r12
0000000000041dab	movl	0x70(%rbx), %ecx
0000000000041dae	cmpq	%rcx, %rax
0000000000041db1	jb	0x41ddd
0000000000041db3	cmpq	-0x30(%rbp), %r12
0000000000041db7	jae	0x41ddd
0000000000041db9	movq	(%r14), %rax
0000000000041dbc	movsd	(%rax,%r15), %xmm0
0000000000041dc2	addsd	0x6d75e(%rip), %xmm0
0000000000041dca	movsd	%xmm0, -0x38(%rbp)
0000000000041dcf	movq	%r14, %rdi
0000000000041dd2	leaq	-0x38(%rbp), %rsi
0000000000041dd6	callq	__ZNSt3__16vectorIdNS_9allocatorIdEEE9push_backB9nqe210106EOd ## std::__1::vector<double, std::__1::allocator<double>>::push_back[abi:nqe210106](double&&)
0000000000041ddb	jmp	0x41deb
0000000000041ddd	movq	(%r14), %rsi
0000000000041de0	addq	%r15, %rsi
0000000000041de3	movq	%r14, %rdi
0000000000041de6	callq	__ZNSt3__16vectorIdNS_9allocatorIdEEE9push_backB9nqe210106EOd ## std::__1::vector<double, std::__1::allocator<double>>::push_back[abi:nqe210106](double&&)
0000000000041deb	addq	$0x8, %r15
0000000000041def	movq	%r12, %rax
0000000000041df2	cmpq	%r12, %r13
0000000000041df5	jne	0x41da7
0000000000041df7	addq	$0x18, %rsp
0000000000041dfb	popq	%rbx
0000000000041dfc	popq	%r12
0000000000041dfe	popq	%r13
0000000000041e00	popq	%r14
0000000000041e02	popq	%r15
0000000000041e04	popq	%rbp
0000000000041e05	retq
