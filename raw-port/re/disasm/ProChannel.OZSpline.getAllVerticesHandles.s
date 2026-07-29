__ZN8OZSpline21getAllVerticesHandlesERNSt3__16vectorIPvNS0_9allocatorIS2_EEEE:
000000000003499a	pushq	%rbp
000000000003499b	movq	%rsp, %rbp
000000000003499e	pushq	%r15
00000000000349a0	pushq	%r14
00000000000349a2	pushq	%r13
00000000000349a4	pushq	%r12
00000000000349a6	pushq	%rbx
00000000000349a7	subq	$0x58, %rsp
00000000000349ab	movq	%rsi, %r14
00000000000349ae	movq	%rdi, %rbx
00000000000349b1	movq	0xa0(%rdi), %rax
00000000000349b8	testq	%rax, %rax
00000000000349bb	je	0x349c6
00000000000349bd	movq	0x30(%rax), %rdi
00000000000349c1	testq	%rdi, %rdi
00000000000349c4	jne	0x349ca
00000000000349c6	leaq	0x8(%rbx), %rdi
00000000000349ca	callq	0xacb16                         ## symbol stub for: __ZN10PCSpinLock4lockEv
00000000000349cf	movq	0x10(%rbx), %r12
00000000000349d3	movq	0x95ae6(%rip), %rax             ## literal pool symbol address: _kCMTimeZero
00000000000349da	movq	0x10(%rax), %rcx
00000000000349de	movq	%rcx, -0x30(%rbp)
00000000000349e2	movups	(%rax), %xmm0
00000000000349e5	movaps	%xmm0, -0x40(%rbp)
00000000000349e9	cmpq	0x30(%rbx), %r12
00000000000349ed	je	0x34a60
00000000000349ef	xorl	%r13d, %r13d
00000000000349f2	leaq	-0x48(%rbp), %r15
00000000000349f6	movq	(%r12,%r13), %rax
00000000000349fa	testq	%r13, %r13
00000000000349fd	je	0x34a2f
00000000000349ff	movq	0x20(%rax), %rcx
0000000000034a03	movq	%rcx, 0x28(%rsp)
0000000000034a08	movups	0x10(%rax), %xmm0
0000000000034a0c	movups	%xmm0, 0x18(%rsp)
0000000000034a11	movq	-0x30(%rbp), %rax
0000000000034a15	movq	%rax, 0x10(%rsp)
0000000000034a1a	movaps	-0x40(%rbp), %xmm0
0000000000034a1e	movups	%xmm0, (%rsp)
0000000000034a22	callq	0xaca80                         ## symbol stub for: _CMTimeCompare
0000000000034a27	testl	%eax, %eax
0000000000034a29	je	0x34a4e
0000000000034a2b	movq	(%r12,%r13), %rax
0000000000034a2f	movq	0x20(%rax), %rcx
0000000000034a33	movq	%rcx, -0x30(%rbp)
0000000000034a37	movups	0x10(%rax), %xmm0
0000000000034a3b	movaps	%xmm0, -0x40(%rbp)
0000000000034a3f	movq	%rax, -0x48(%rbp)
0000000000034a43	movq	%r14, %rdi
0000000000034a46	movq	%r15, %rsi
0000000000034a49	callq	__ZNSt3__16vectorIPvNS_9allocatorIS1_EEE9push_backB9nqe210106ERKS1_ ## std::__1::vector<void*, std::__1::allocator<void*>>::push_back[abi:nqe210106](void* const&)
0000000000034a4e	leaq	(%r12,%r13), %rax
0000000000034a52	addq	$0x8, %rax
0000000000034a56	addq	$0x8, %r13
0000000000034a5a	cmpq	0x30(%rbx), %rax
0000000000034a5e	jne	0x349f6
0000000000034a60	movq	0xa0(%rbx), %rax
0000000000034a67	testq	%rax, %rax
0000000000034a6a	je	0x34a75
0000000000034a6c	movq	0x30(%rax), %rdi
0000000000034a70	testq	%rdi, %rdi
0000000000034a73	jne	0x34a7c
0000000000034a75	addq	$0x8, %rbx
0000000000034a79	movq	%rbx, %rdi
0000000000034a7c	callq	0xacb1c                         ## symbol stub for: __ZN10PCSpinLock6unlockEv
0000000000034a81	movb	$0x1, %al
0000000000034a83	addq	$0x58, %rsp
0000000000034a87	popq	%rbx
0000000000034a88	popq	%r12
0000000000034a8a	popq	%r13
0000000000034a8c	popq	%r14
0000000000034a8e	popq	%r15
0000000000034a90	popq	%rbp
0000000000034a91	retq
