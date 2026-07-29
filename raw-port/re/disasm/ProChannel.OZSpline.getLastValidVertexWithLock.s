__ZN8OZSpline26getLastValidVertexWithLockEPPvRK6CMTime:
000000000002f6ca	pushq	%rbp
000000000002f6cb	movq	%rsp, %rbp
000000000002f6ce	pushq	%r15
000000000002f6d0	pushq	%r14
000000000002f6d2	pushq	%rbx
000000000002f6d3	pushq	%rax
000000000002f6d4	movq	%rdx, %r14
000000000002f6d7	movq	%rsi, %r15
000000000002f6da	movq	%rdi, %rbx
000000000002f6dd	movq	0xa0(%rdi), %rax
000000000002f6e4	testq	%rax, %rax
000000000002f6e7	je	0x2f6f2
000000000002f6e9	movq	0x30(%rax), %rdi
000000000002f6ed	testq	%rdi, %rdi
000000000002f6f0	jne	0x2f6f6
000000000002f6f2	leaq	0x8(%rbx), %rdi
000000000002f6f6	callq	0xacb16                         ## symbol stub for: __ZN10PCSpinLock4lockEv
000000000002f6fb	movq	%rbx, %rdi
000000000002f6fe	movq	%r15, %rsi
000000000002f701	movq	%r14, %rdx
000000000002f704	callq	__ZN8OZSpline18getLastValidVertexEPPvRK6CMTime ## OZSpline::getLastValidVertex(void**, CMTime const&)
000000000002f709	movl	%eax, %r14d
000000000002f70c	movq	0xa0(%rbx), %rax
000000000002f713	testq	%rax, %rax
000000000002f716	je	0x2f721
000000000002f718	movq	0x30(%rax), %rdi
000000000002f71c	testq	%rdi, %rdi
000000000002f71f	jne	0x2f728
000000000002f721	addq	$0x8, %rbx
000000000002f725	movq	%rbx, %rdi
000000000002f728	callq	0xacb1c                         ## symbol stub for: __ZN10PCSpinLock6unlockEv
000000000002f72d	movl	%r14d, %eax
000000000002f730	addq	$0x8, %rsp
000000000002f734	popq	%rbx
000000000002f735	popq	%r14
000000000002f737	popq	%r15
000000000002f739	popq	%rbp
000000000002f73a	retq
000000000002f73b	nop
