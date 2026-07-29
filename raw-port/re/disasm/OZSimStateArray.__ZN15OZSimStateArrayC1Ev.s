__ZN15OZSimStateArrayC1Ev:
0000000000283a20	pushq	%rbp
0000000000283a21	movq	%rsp, %rbp
0000000000283a24	pushq	%r14
0000000000283a26	pushq	%rbx
0000000000283a27	movq	%rdi, %rbx
0000000000283a2a	xorps	%xmm0, %xmm0
0000000000283a2d	movups	%xmm0, (%rdi)
0000000000283a30	movq	$0x0, 0x10(%rdi)
0000000000283a38	movq	0x5a0ad1(%rip), %rax            ## literal pool symbol address: _kCMTimeZero
0000000000283a3f	movups	(%rax), %xmm0
0000000000283a42	movups	%xmm0, 0x18(%rdi)
0000000000283a46	movq	0x10(%rax), %rax
0000000000283a4a	movq	%rax, 0x28(%rdi)
0000000000283a4e	movb	$0x0, 0x30(%rdi)
0000000000283a52	movq	$0x0, 0x38(%rdi)
0000000000283a5a	addq	$0x40, %rdi
0000000000283a5e	callq	0x6ddae8                        ## symbol stub for: __ZN13PCSharedCountC1Ev
0000000000283a63	popq	%rbx
0000000000283a64	popq	%r14
0000000000283a66	popq	%rbp
0000000000283a67	retq
0000000000283a68	movq	%rax, %r14
0000000000283a6b	movq	%rbx, %rdi
0000000000283a6e	callq	__ZNSt3__16vectorI17OZSimStateElementNS_9allocatorIS1_EEED2B9nqe210106Ev ## std::__1::vector<OZSimStateElement, std::__1::allocator<OZSimStateElement>>::~vector[abi:nqe210106]()
0000000000283a73	movq	%r14, %rdi
0000000000283a76	callq	0x6dd07a                        ## symbol stub for: __Unwind_Resume
0000000000283a7b	nopl	(%rax,%rax)
