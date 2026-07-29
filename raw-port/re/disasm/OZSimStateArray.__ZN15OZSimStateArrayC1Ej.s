__ZN15OZSimStateArrayC1Ej:
0000000000283b80	pushq	%rbp
0000000000283b81	movq	%rsp, %rbp
0000000000283b84	pushq	%r15
0000000000283b86	pushq	%r14
0000000000283b88	pushq	%r12
0000000000283b8a	pushq	%rbx
0000000000283b8b	subq	$0x10, %rsp
0000000000283b8f	movq	%rdi, %rbx
0000000000283b92	xorps	%xmm0, %xmm0
0000000000283b95	movups	%xmm0, (%rdi)
0000000000283b98	movq	$0x0, 0x10(%rdi)
0000000000283ba0	movq	%rdi, -0x30(%rbp)
0000000000283ba4	movb	$0x0, -0x28(%rbp)
0000000000283ba8	testl	%esi, %esi
0000000000283baa	je	0x283bfc
0000000000283bac	movl	%esi, %eax
0000000000283bae	imulq	$0xf8, %rax, %r14
0000000000283bb5	movq	%r14, %rdi
0000000000283bb8	callq	0x6dfca2                        ## symbol stub for: __Znwm
0000000000283bbd	movq	%rax, %r15
0000000000283bc0	movq	%rax, %r12
0000000000283bc3	movq	%r15, (%rbx)
0000000000283bc6	movq	%r15, 0x8(%rbx)
0000000000283bca	addq	%r14, %r15
0000000000283bcd	movq	%r15, 0x10(%rbx)
0000000000283bd1	nopw	%cs:(%rax,%rax)
0000000000283be0	movq	%r12, %rdi
0000000000283be3	callq	__ZN17OZSimStateElementC1Ev     ## OZSimStateElement::OZSimStateElement()
0000000000283be8	addq	$0xf8, %r12
0000000000283bef	addq	$-0xf8, %r14
0000000000283bf6	jne	0x283be0
0000000000283bf8	movq	%r15, 0x8(%rbx)
0000000000283bfc	movq	0x5a090d(%rip), %rax            ## literal pool symbol address: _kCMTimeZero
0000000000283c03	movq	0x10(%rax), %rcx
0000000000283c07	movq	%rcx, 0x28(%rbx)
0000000000283c0b	movups	(%rax), %xmm0
0000000000283c0e	movups	%xmm0, 0x18(%rbx)
0000000000283c12	movb	$0x0, 0x30(%rbx)
0000000000283c16	movq	$0x0, 0x38(%rbx)
0000000000283c1e	leaq	0x40(%rbx), %rdi
0000000000283c22	callq	0x6ddae8                        ## symbol stub for: __ZN13PCSharedCountC1Ev
0000000000283c27	addq	$0x10, %rsp
0000000000283c2b	popq	%rbx
0000000000283c2c	popq	%r12
0000000000283c2e	popq	%r14
0000000000283c30	popq	%r15
0000000000283c32	popq	%rbp
0000000000283c33	retq
0000000000283c34	movq	%rax, %r14
0000000000283c37	leaq	-0x30(%rbp), %rdi
0000000000283c3b	callq	__ZNSt3__128__exception_guard_exceptionsINS_6vectorI17OZSimStateElementNS_9allocatorIS2_EEE16__destroy_vectorEED1B9nqe210106Ev ## std::__1::__exception_guard_exceptions<std::__1::vector<OZSimStateElement, std::__1::allocator<OZSimStateElement>>::__destroy_vector>::~__exception_guard_exceptions[abi:nqe210106]()
0000000000283c40	movq	%r14, %rdi
0000000000283c43	callq	0x6dd07a                        ## symbol stub for: __Unwind_Resume
0000000000283c48	movq	%rax, %r14
0000000000283c4b	movq	%rbx, %rdi
0000000000283c4e	callq	__ZNSt3__16vectorI17OZSimStateElementNS_9allocatorIS1_EEED2B9nqe210106Ev ## std::__1::vector<OZSimStateElement, std::__1::allocator<OZSimStateElement>>::~vector[abi:nqe210106]()
0000000000283c53	movq	%r14, %rdi
0000000000283c56	callq	0x6dd07a                        ## symbol stub for: __Unwind_Resume
0000000000283c5b	movq	%rax, %r14
0000000000283c5e	movq	%r12, 0x8(%rbx)
0000000000283c62	leaq	-0x30(%rbp), %rdi
0000000000283c66	callq	__ZNSt3__128__exception_guard_exceptionsINS_6vectorI17OZSimStateElementNS_9allocatorIS2_EEE16__destroy_vectorEED1B9nqe210106Ev ## std::__1::__exception_guard_exceptions<std::__1::vector<OZSimStateElement, std::__1::allocator<OZSimStateElement>>::__destroy_vector>::~__exception_guard_exceptions[abi:nqe210106]()
0000000000283c6b	movq	%r14, %rdi
0000000000283c6e	callq	0x6dd07a                        ## symbol stub for: __Unwind_Resume
0000000000283c73	nopw	%cs:(%rax,%rax)
