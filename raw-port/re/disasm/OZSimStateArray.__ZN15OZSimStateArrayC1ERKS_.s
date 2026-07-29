__ZN15OZSimStateArrayC1ERKS_:
0000000000283d10	pushq	%rbp
0000000000283d11	movq	%rsp, %rbp
0000000000283d14	pushq	%r14
0000000000283d16	pushq	%rbx
0000000000283d17	movq	%rsi, %r14
0000000000283d1a	movq	%rdi, %rbx
0000000000283d1d	xorps	%xmm0, %xmm0
0000000000283d20	movups	%xmm0, (%rdi)
0000000000283d23	movq	$0x0, 0x10(%rdi)
0000000000283d2b	movq	(%rsi), %rsi
0000000000283d2e	movq	0x8(%r14), %rdx
0000000000283d32	movq	%rdx, %rax
0000000000283d35	subq	%rsi, %rax
0000000000283d38	sarq	$0x3, %rax
0000000000283d3c	movabsq	$-0x1084210842108421, %rcx      ## imm = 0xEF7BDEF7BDEF7BDF
0000000000283d46	imulq	%rax, %rcx
0000000000283d4a	callq	__ZNSt3__16vectorI17OZSimStateElementNS_9allocatorIS1_EEE16__init_with_sizeB9nqe210106IPS1_S6_EEvT_T0_m ## void std::__1::vector<OZSimStateElement, std::__1::allocator<OZSimStateElement>>::__init_with_size[abi:nqe210106]<OZSimStateElement*, OZSimStateElement*>(OZSimStateElement*, OZSimStateElement*, unsigned long)
0000000000283d4f	movq	0x28(%r14), %rax
0000000000283d53	movq	%rax, 0x28(%rbx)
0000000000283d57	movups	0x18(%r14), %xmm0
0000000000283d5c	movups	%xmm0, 0x18(%rbx)
0000000000283d60	movzbl	0x30(%r14), %eax
0000000000283d65	movb	%al, 0x30(%rbx)
0000000000283d68	movq	0x38(%r14), %rax
0000000000283d6c	movq	%rax, 0x38(%rbx)
0000000000283d70	leaq	0x40(%rbx), %rdi
0000000000283d74	addq	$0x40, %r14
0000000000283d78	movq	%r14, %rsi
0000000000283d7b	callq	0x6ddae2                        ## symbol stub for: __ZN13PCSharedCountC1ERKS_
0000000000283d80	popq	%rbx
0000000000283d81	popq	%r14
0000000000283d83	popq	%rbp
0000000000283d84	retq
0000000000283d85	movq	%rax, %r14
0000000000283d88	movq	%rbx, %rdi
0000000000283d8b	callq	__ZNSt3__16vectorI17OZSimStateElementNS_9allocatorIS1_EEED2B9nqe210106Ev ## std::__1::vector<OZSimStateElement, std::__1::allocator<OZSimStateElement>>::~vector[abi:nqe210106]()
0000000000283d90	movq	%r14, %rdi
0000000000283d93	callq	0x6dd07a                        ## symbol stub for: __Unwind_Resume
0000000000283d98	nopl	(%rax,%rax)
