__ZN8OZSpline27getFirstValidVertexWithLockEPPvRK6CMTime:
000000000002f658	pushq	%rbp
000000000002f659	movq	%rsp, %rbp
000000000002f65c	pushq	%r15
000000000002f65e	pushq	%r14
000000000002f660	pushq	%rbx
000000000002f661	pushq	%rax
000000000002f662	movq	%rdx, %r14
000000000002f665	movq	%rsi, %r15
000000000002f668	movq	%rdi, %rbx
000000000002f66b	movq	0xa0(%rdi), %rax
000000000002f672	testq	%rax, %rax
000000000002f675	je	0x2f680
000000000002f677	movq	0x30(%rax), %rdi
000000000002f67b	testq	%rdi, %rdi
000000000002f67e	jne	0x2f684
000000000002f680	leaq	0x8(%rbx), %rdi
000000000002f684	callq	0xacb16                         ## symbol stub for: __ZN10PCSpinLock4lockEv
000000000002f689	movq	%rbx, %rdi
000000000002f68c	movq	%r15, %rsi
000000000002f68f	movq	%r14, %rdx
000000000002f692	callq	__ZN8OZSpline19getFirstValidVertexEPPvRK6CMTime ## OZSpline::getFirstValidVertex(void**, CMTime const&)
000000000002f697	movl	%eax, %r14d
000000000002f69a	movq	0xa0(%rbx), %rax
000000000002f6a1	testq	%rax, %rax
000000000002f6a4	je	0x2f6af
000000000002f6a6	movq	0x30(%rax), %rdi
000000000002f6aa	testq	%rdi, %rdi
000000000002f6ad	jne	0x2f6b6
000000000002f6af	addq	$0x8, %rbx
000000000002f6b3	movq	%rbx, %rdi
000000000002f6b6	callq	0xacb1c                         ## symbol stub for: __ZN10PCSpinLock6unlockEv
000000000002f6bb	movl	%r14d, %eax
000000000002f6be	addq	$0x8, %rsp
000000000002f6c2	popq	%rbx
000000000002f6c3	popq	%r14
000000000002f6c5	popq	%r15
000000000002f6c7	popq	%rbp
000000000002f6c8	retq
000000000002f6c9	nop
