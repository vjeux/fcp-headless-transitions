__ZN15OZSimStateArrayaSERKS_:
0000000000283e80	pushq	%rbp
0000000000283e81	movq	%rsp, %rbp
0000000000283e84	pushq	%r15
0000000000283e86	pushq	%r14
0000000000283e88	pushq	%r12
0000000000283e8a	pushq	%rbx
0000000000283e8b	subq	$0x10, %rsp
0000000000283e8f	movq	%rsi, %r14
0000000000283e92	movq	%rdi, %rbx
0000000000283e95	cmpq	%rsi, %rdi
0000000000283e98	je	0x283ec1
0000000000283e9a	movq	(%r14), %rsi
0000000000283e9d	movq	0x8(%r14), %rdx
0000000000283ea1	movq	%rdx, %rax
0000000000283ea4	subq	%rsi, %rax
0000000000283ea7	sarq	$0x3, %rax
0000000000283eab	movabsq	$-0x1084210842108421, %rcx      ## imm = 0xEF7BDEF7BDEF7BDF
0000000000283eb5	imulq	%rax, %rcx
0000000000283eb9	movq	%rbx, %rdi
0000000000283ebc	callq	__ZNSt3__16vectorI17OZSimStateElementNS_9allocatorIS1_EEE18__assign_with_sizeB9nqe210106IPS1_S6_EEvT_T0_l ## void std::__1::vector<OZSimStateElement, std::__1::allocator<OZSimStateElement>>::__assign_with_size[abi:nqe210106]<OZSimStateElement*, OZSimStateElement*>(OZSimStateElement*, OZSimStateElement*, long)
0000000000283ec1	movq	0x38(%r14), %rax
0000000000283ec5	movq	%rax, 0x38(%rbx)
0000000000283ec9	leaq	0x40(%rbx), %r15
0000000000283ecd	leaq	0x40(%r14), %rsi
0000000000283ed1	leaq	-0x28(%rbp), %r12
0000000000283ed5	movq	%r12, %rdi
0000000000283ed8	callq	0x6ddae2                        ## symbol stub for: __ZN13PCSharedCountC1ERKS_
0000000000283edd	movq	%r15, %rdi
0000000000283ee0	movq	%r12, %rsi
0000000000283ee3	callq	0x6ddaf4                        ## symbol stub for: __ZN13PCSharedCountaSES_
0000000000283ee8	leaq	-0x28(%rbp), %rdi
0000000000283eec	callq	0x6ddaee                        ## symbol stub for: __ZN13PCSharedCountD1Ev
0000000000283ef1	movzbl	0x30(%r14), %eax
0000000000283ef6	movb	%al, 0x30(%rbx)
0000000000283ef9	addq	$0x10, %rsp
0000000000283efd	popq	%rbx
0000000000283efe	popq	%r12
0000000000283f00	popq	%r14
0000000000283f02	popq	%r15
0000000000283f04	popq	%rbp
0000000000283f05	retq
0000000000283f06	movq	%rax, %rbx
0000000000283f09	leaq	-0x28(%rbp), %rdi
0000000000283f0d	callq	0x6ddaee                        ## symbol stub for: __ZN13PCSharedCountD1Ev
0000000000283f12	movq	%rbx, %rdi
0000000000283f15	callq	0x6dd07a                        ## symbol stub for: __Unwind_Resume
0000000000283f1a	nopw	(%rax,%rax)
