__ZN8OZSpline26getAllValidVerticesHandlesERNSt3__16vectorIPvNS0_9allocatorIS2_EEEERK6CMTime:
0000000000034a92	pushq	%rbp
0000000000034a93	movq	%rsp, %rbp
0000000000034a96	pushq	%r15
0000000000034a98	pushq	%r14
0000000000034a9a	pushq	%r13
0000000000034a9c	pushq	%r12
0000000000034a9e	pushq	%rbx
0000000000034a9f	subq	$0x68, %rsp
0000000000034aa3	movq	%rdx, %r14
0000000000034aa6	movq	%rsi, %r15
0000000000034aa9	movq	%rdi, %rbx
0000000000034aac	movq	0xa0(%rdi), %rax
0000000000034ab3	testq	%rax, %rax
0000000000034ab6	je	0x34ac1
0000000000034ab8	movq	0x30(%rax), %rdi
0000000000034abc	testq	%rdi, %rdi
0000000000034abf	jne	0x34ac5
0000000000034ac1	leaq	0x8(%rbx), %rdi
0000000000034ac5	callq	0xacb16                         ## symbol stub for: __ZN10PCSpinLock4lockEv
0000000000034aca	movq	0x28(%rbx), %r13
0000000000034ace	movq	0x959eb(%rip), %rax             ## literal pool symbol address: _kCMTimeZero
0000000000034ad5	movq	0x10(%rax), %rcx
0000000000034ad9	movq	%rcx, -0x30(%rbp)
0000000000034add	movups	(%rax), %xmm0
0000000000034ae0	movaps	%xmm0, -0x40(%rbp)
0000000000034ae4	cmpq	%r13, 0x30(%rbx)
0000000000034ae8	je	0x34b80
0000000000034aee	leaq	-0x48(%rbp), %r12
0000000000034af2	movq	(%r13), %rdi
0000000000034af6	movq	0x20(%rdi), %rax
0000000000034afa	movq	%rax, -0x50(%rbp)
0000000000034afe	movups	0x10(%rdi), %xmm0
0000000000034b02	movaps	%xmm0, -0x60(%rbp)
0000000000034b06	cmpq	0x28(%rbx), %r13
0000000000034b0a	je	0x34b3f
0000000000034b0c	addq	$0x10, %rdi
0000000000034b10	movq	0x10(%rdi), %rax
0000000000034b14	movq	%rax, 0x28(%rsp)
0000000000034b19	movups	(%rdi), %xmm0
0000000000034b1c	movups	%xmm0, 0x18(%rsp)
0000000000034b21	movq	-0x30(%rbp), %rax
0000000000034b25	movq	%rax, 0x10(%rsp)
0000000000034b2a	movaps	-0x40(%rbp), %xmm0
0000000000034b2e	movups	%xmm0, (%rsp)
0000000000034b32	callq	0xaca80                         ## symbol stub for: _CMTimeCompare
0000000000034b37	testl	%eax, %eax
0000000000034b39	je	0x34b72
0000000000034b3b	movq	(%r13), %rdi
0000000000034b3f	movq	-0x50(%rbp), %rax
0000000000034b43	movq	%rax, -0x30(%rbp)
0000000000034b47	movaps	-0x60(%rbp), %xmm0
0000000000034b4b	movaps	%xmm0, -0x40(%rbp)
0000000000034b4f	movq	(%rdi), %rax
0000000000034b52	movq	%r14, %rsi
0000000000034b55	callq	*0x88(%rax)
0000000000034b5b	testb	%al, %al
0000000000034b5d	je	0x34b72
0000000000034b5f	movq	(%r13), %rax
0000000000034b63	movq	%rax, -0x48(%rbp)
0000000000034b67	movq	%r15, %rdi
0000000000034b6a	movq	%r12, %rsi
0000000000034b6d	callq	__ZNSt3__16vectorIPvNS_9allocatorIS1_EEE9push_backB9nqe210106ERKS1_ ## std::__1::vector<void*, std::__1::allocator<void*>>::push_back[abi:nqe210106](void* const&)
0000000000034b72	addq	$0x8, %r13
0000000000034b76	cmpq	0x30(%rbx), %r13
0000000000034b7a	jne	0x34af2
0000000000034b80	movq	0xa0(%rbx), %rax
0000000000034b87	testq	%rax, %rax
0000000000034b8a	je	0x34b95
0000000000034b8c	movq	0x30(%rax), %rdi
0000000000034b90	testq	%rdi, %rdi
0000000000034b93	jne	0x34b9c
0000000000034b95	addq	$0x8, %rbx
0000000000034b99	movq	%rbx, %rdi
0000000000034b9c	callq	0xacb1c                         ## symbol stub for: __ZN10PCSpinLock6unlockEv
0000000000034ba1	movb	$0x1, %al
0000000000034ba3	addq	$0x68, %rsp
0000000000034ba7	popq	%rbx
0000000000034ba8	popq	%r12
0000000000034baa	popq	%r13
0000000000034bac	popq	%r14
0000000000034bae	popq	%r15
0000000000034bb0	popq	%rbp
0000000000034bb1	retq
