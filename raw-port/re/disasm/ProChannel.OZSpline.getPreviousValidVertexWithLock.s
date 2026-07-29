__ZN8OZSpline30getPreviousValidVertexWithLockEPvPS0_RK6CMTime:
000000000002f7b2	pushq	%rbp
000000000002f7b3	movq	%rsp, %rbp
000000000002f7b6	pushq	%r15
000000000002f7b8	pushq	%r14
000000000002f7ba	pushq	%r12
000000000002f7bc	pushq	%rbx
000000000002f7bd	movq	%rcx, %r14
000000000002f7c0	movq	%rdx, %r15
000000000002f7c3	movq	%rsi, %r12
000000000002f7c6	movq	%rdi, %rbx
000000000002f7c9	movq	0xa0(%rdi), %rax
000000000002f7d0	testq	%rax, %rax
000000000002f7d3	je	0x2f7de
000000000002f7d5	movq	0x30(%rax), %rdi
000000000002f7d9	testq	%rdi, %rdi
000000000002f7dc	jne	0x2f7e2
000000000002f7de	leaq	0x8(%rbx), %rdi
000000000002f7e2	callq	0xacb16                         ## symbol stub for: __ZN10PCSpinLock4lockEv
000000000002f7e7	movq	%rbx, %rdi
000000000002f7ea	movq	%r12, %rsi
000000000002f7ed	movq	%r15, %rdx
000000000002f7f0	movq	%r14, %rcx
000000000002f7f3	callq	__ZN8OZSpline22getPreviousValidVertexEPvPS0_RK6CMTime ## OZSpline::getPreviousValidVertex(void*, void**, CMTime const&)
000000000002f7f8	movl	%eax, %r14d
000000000002f7fb	movq	0xa0(%rbx), %rax
000000000002f802	testq	%rax, %rax
000000000002f805	je	0x2f810
000000000002f807	movq	0x30(%rax), %rdi
000000000002f80b	testq	%rdi, %rdi
000000000002f80e	jne	0x2f817
000000000002f810	addq	$0x8, %rbx
000000000002f814	movq	%rbx, %rdi
000000000002f817	callq	0xacb1c                         ## symbol stub for: __ZN10PCSpinLock6unlockEv
000000000002f81c	movl	%r14d, %eax
000000000002f81f	popq	%rbx
000000000002f820	popq	%r12
000000000002f822	popq	%r14
000000000002f824	popq	%r15
000000000002f826	popq	%rbp
000000000002f827	retq
