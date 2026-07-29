__ZN8OZSpline23getVerticesTimeAndValueE11CMTimeRangeRNSt3__16vectorINS1_4pairI6CMTimeNS3_IdjEEEENS1_9allocatorIS6_EEEEPS4_SB_:
0000000000034bb2	pushq	%rbp
0000000000034bb3	movq	%rsp, %rbp
0000000000034bb6	pushq	%r15
0000000000034bb8	pushq	%r14
0000000000034bba	pushq	%r13
0000000000034bbc	pushq	%r12
0000000000034bbe	pushq	%rbx
0000000000034bbf	subq	$0xa8, %rsp
0000000000034bc6	movq	%rcx, %r13
0000000000034bc9	movq	%rdx, %r12
0000000000034bcc	movq	%rsi, %r14
0000000000034bcf	movq	%rdi, %rbx
0000000000034bd2	leaq	0x10(%rbp), %r15
0000000000034bd6	movq	0xa0(%rdi), %rax
0000000000034bdd	testq	%rax, %rax
0000000000034be0	je	0x34beb
0000000000034be2	movq	0x30(%rax), %rdi
0000000000034be6	testq	%rdi, %rdi
0000000000034be9	jne	0x34bef
0000000000034beb	leaq	0x8(%rbx), %rdi
0000000000034bef	callq	0xacb16                         ## symbol stub for: __ZN10PCSpinLock4lockEv
0000000000034bf4	movups	(%r15), %xmm0
0000000000034bf8	movups	0x10(%r15), %xmm1
0000000000034bfd	movups	0x20(%r15), %xmm2
0000000000034c02	movups	%xmm2, 0x20(%rsp)
0000000000034c07	movups	%xmm1, 0x10(%rsp)
0000000000034c0c	movups	%xmm0, (%rsp)
0000000000034c10	leaq	-0x98(%rbp), %rdi
0000000000034c17	callq	0xaca9e                         ## symbol stub for: _CMTimeRangeGetEnd
0000000000034c1c	movq	0x9589d(%rip), %rax             ## literal pool symbol address: _kCMTimeZero
0000000000034c23	movq	0x10(%rax), %rcx
0000000000034c27	movq	%rcx, -0x70(%rbp)
0000000000034c2b	movups	(%rax), %xmm0
0000000000034c2e	movaps	%xmm0, -0x80(%rbp)
0000000000034c32	testq	%r12, %r12
0000000000034c35	je	0x34c7a
0000000000034c37	movq	0x10(%rbx), %rax
0000000000034c3b	cmpq	0x18(%rbx), %rax
0000000000034c3f	je	0x34c52
0000000000034c41	movq	(%rax), %rax
0000000000034c44	movq	0x20(%rax), %rcx
0000000000034c48	movq	%rcx, -0x50(%rbp)
0000000000034c4c	movups	0x10(%rax), %xmm0
0000000000034c50	jmp	0x34c64
0000000000034c52	movq	0x9584f(%rip), %rax             ## literal pool symbol address: _kCMTimeInvalid
0000000000034c59	movq	0x10(%rax), %rcx
0000000000034c5d	movq	%rcx, -0x50(%rbp)
0000000000034c61	movups	(%rax), %xmm0
0000000000034c64	movaps	%xmm0, -0x60(%rbp)
0000000000034c68	movq	-0x50(%rbp), %rax
0000000000034c6c	movq	%rax, 0x10(%r12)
0000000000034c71	movaps	-0x60(%rbp), %xmm0
0000000000034c75	movups	%xmm0, (%r12)
0000000000034c7a	testq	%r13, %r13
0000000000034c7d	je	0x34cc2
0000000000034c7f	movq	0x18(%rbx), %rax
0000000000034c83	cmpq	%rax, 0x10(%rbx)
0000000000034c87	je	0x34c9b
0000000000034c89	movq	-0x8(%rax), %rax
0000000000034c8d	movq	0x20(%rax), %rcx
0000000000034c91	movq	%rcx, -0x50(%rbp)
0000000000034c95	movups	0x10(%rax), %xmm0
0000000000034c99	jmp	0x34cad
0000000000034c9b	movq	0x95806(%rip), %rax             ## literal pool symbol address: _kCMTimeInvalid
0000000000034ca2	movq	0x10(%rax), %rcx
0000000000034ca6	movq	%rcx, -0x50(%rbp)
0000000000034caa	movups	(%rax), %xmm0
0000000000034cad	movaps	%xmm0, -0x60(%rbp)
0000000000034cb1	movq	-0x50(%rbp), %rax
0000000000034cb5	movq	%rax, 0x10(%r13)
0000000000034cb9	movaps	-0x60(%rbp), %xmm0
0000000000034cbd	movups	%xmm0, (%r13)
0000000000034cc2	movq	%r14, -0x30(%rbp)
0000000000034cc6	movq	0x28(%rbx), %r13
0000000000034cca	movq	0x30(%rbx), %r14
0000000000034cce	subq	%r13, %r14
0000000000034cd1	je	0x34d78
0000000000034cd7	sarq	$0x3, %r14
0000000000034cdb	movq	%r14, %r12
0000000000034cde	shrq	%r12
0000000000034ce1	movq	(%r13,%r12,8), %rax
0000000000034ce6	testq	%rax, %rax
0000000000034ce9	je	0x34d26
0000000000034ceb	movq	0x10(%r15), %rcx
0000000000034cef	movq	%rcx, 0x28(%rsp)
0000000000034cf4	movups	(%r15), %xmm0
0000000000034cf8	movups	%xmm0, 0x18(%rsp)
0000000000034cfd	movq	0x20(%rax), %rcx
0000000000034d01	movq	%rcx, 0x10(%rsp)
0000000000034d06	movups	0x10(%rax), %xmm0
0000000000034d0a	movups	%xmm0, (%rsp)
0000000000034d0e	callq	0xaca80                         ## symbol stub for: _CMTimeCompare
0000000000034d13	testl	%eax, %eax
0000000000034d15	jns	0x34d26
0000000000034d17	leaq	(%r13,%r12,8), %r13
0000000000034d1c	addq	$0x8, %r13
0000000000034d20	notq	%r12
0000000000034d23	addq	%r14, %r12
0000000000034d26	movq	%r12, %r14
0000000000034d29	testq	%r12, %r12
0000000000034d2c	jne	0x34cde
0000000000034d2e	cmpq	0x28(%rbx), %r13
0000000000034d32	movq	-0x30(%rbp), %r14
0000000000034d36	je	0x34d7c
0000000000034d38	cmpq	0x30(%rbx), %r13
0000000000034d3c	je	0x34d7c
0000000000034d3e	movq	(%r13), %rax
0000000000034d42	movq	0x10(%r15), %rcx
0000000000034d46	movq	%rcx, 0x28(%rsp)
0000000000034d4b	movups	(%r15), %xmm0
0000000000034d4f	movups	%xmm0, 0x18(%rsp)
0000000000034d54	movq	0x20(%rax), %rcx
0000000000034d58	movq	%rcx, 0x10(%rsp)
0000000000034d5d	movups	0x10(%rax), %xmm0
0000000000034d61	movups	%xmm0, (%rsp)
0000000000034d65	callq	0xaca80                         ## symbol stub for: _CMTimeCompare
0000000000034d6a	xorl	%ecx, %ecx
0000000000034d6c	testl	%eax, %eax
0000000000034d6e	setle	%cl
0000000000034d71	leaq	-0x8(%r13,%rcx,8), %r13
0000000000034d76	jmp	0x34d7c
0000000000034d78	movq	-0x30(%rbp), %r14
0000000000034d7c	cmpq	0x30(%rbx), %r13
0000000000034d80	je	0x34e30
0000000000034d86	addq	$0x8, %r13
0000000000034d8a	movq	0x9572f(%rip), %r15             ## literal pool symbol address: _kCMTimeZero
0000000000034d91	leaq	-0x60(%rbp), %r12
0000000000034d95	movq	-0x8(%r13), %rax
0000000000034d99	movq	0x20(%rax), %rcx
0000000000034d9d	movq	%rcx, -0x70(%rbp)
0000000000034da1	movups	0x10(%rax), %xmm0
0000000000034da5	movaps	%xmm0, -0x80(%rbp)
0000000000034da9	movq	-0x8(%r13), %rdi
0000000000034dad	movq	(%rdi), %rax
0000000000034db0	movq	%r15, %rsi
0000000000034db3	callq	*0x18(%rax)
0000000000034db6	movsd	%xmm0, -0x30(%rbp)
0000000000034dbb	movq	-0x8(%r13), %rdi
0000000000034dbf	movq	(%rdi), %rax
0000000000034dc2	callq	*0xd0(%rax)
0000000000034dc8	movq	-0x70(%rbp), %rcx
0000000000034dcc	movq	%rcx, -0x50(%rbp)
0000000000034dd0	movaps	-0x80(%rbp), %xmm0
0000000000034dd4	movaps	%xmm0, -0x60(%rbp)
0000000000034dd8	movsd	-0x30(%rbp), %xmm0
0000000000034ddd	movsd	%xmm0, -0x48(%rbp)
0000000000034de2	movl	%eax, -0x40(%rbp)
0000000000034de5	movq	%r14, %rdi
0000000000034de8	movq	%r12, %rsi
0000000000034deb	callq	__ZNSt3__16vectorINS_4pairI6CMTimeNS1_IdjEEEENS_9allocatorIS4_EEE9push_backB9nqe210106ERKS4_ ## std::__1::vector<std::__1::pair<CMTime, std::__1::pair<double, unsigned int>>, std::__1::allocator<std::__1::pair<CMTime, std::__1::pair<double, unsigned int>>>>::push_back[abi:nqe210106](std::__1::pair<CMTime, std::__1::pair<double, unsigned int>> const&)
0000000000034df0	movq	-0x88(%rbp), %rax
0000000000034df7	movq	%rax, 0x28(%rsp)
0000000000034dfc	movups	-0x98(%rbp), %xmm0
0000000000034e03	movups	%xmm0, 0x18(%rsp)
0000000000034e08	movq	-0x70(%rbp), %rax
0000000000034e0c	movq	%rax, 0x10(%rsp)
0000000000034e11	movaps	-0x80(%rbp), %xmm0
0000000000034e15	movups	%xmm0, (%rsp)
0000000000034e19	callq	0xaca80                         ## symbol stub for: _CMTimeCompare
0000000000034e1e	cmpq	0x30(%rbx), %r13
0000000000034e22	je	0x34e30
0000000000034e24	addq	$0x8, %r13
0000000000034e28	testl	%eax, %eax
0000000000034e2a	js	0x34d95
0000000000034e30	movq	0xa0(%rbx), %rax
0000000000034e37	testq	%rax, %rax
0000000000034e3a	je	0x34e45
0000000000034e3c	movq	0x30(%rax), %rdi
0000000000034e40	testq	%rdi, %rdi
0000000000034e43	jne	0x34e4c
0000000000034e45	addq	$0x8, %rbx
0000000000034e49	movq	%rbx, %rdi
0000000000034e4c	callq	0xacb1c                         ## symbol stub for: __ZN10PCSpinLock6unlockEv
0000000000034e51	movb	$0x1, %al
0000000000034e53	addq	$0xa8, %rsp
0000000000034e5a	popq	%rbx
0000000000034e5b	popq	%r12
0000000000034e5d	popq	%r13
0000000000034e5f	popq	%r14
0000000000034e61	popq	%r15
0000000000034e63	popq	%rbp
0000000000034e64	retq
0000000000034e65	nop
