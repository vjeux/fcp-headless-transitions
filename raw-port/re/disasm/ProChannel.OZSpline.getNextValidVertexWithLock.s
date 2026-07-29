__ZN8OZSpline26getNextValidVertexWithLockEPvPS0_RK6CMTime:
000000000002f73c	pushq	%rbp
000000000002f73d	movq	%rsp, %rbp
000000000002f740	pushq	%r15
000000000002f742	pushq	%r14
000000000002f744	pushq	%r12
000000000002f746	pushq	%rbx
000000000002f747	movq	%rcx, %r14
000000000002f74a	movq	%rdx, %r15
000000000002f74d	movq	%rsi, %r12
000000000002f750	movq	%rdi, %rbx
000000000002f753	movq	0xa0(%rdi), %rax
000000000002f75a	testq	%rax, %rax
000000000002f75d	je	0x2f768
000000000002f75f	movq	0x30(%rax), %rdi
000000000002f763	testq	%rdi, %rdi
000000000002f766	jne	0x2f76c
000000000002f768	leaq	0x8(%rbx), %rdi
000000000002f76c	callq	0xacb16                         ## symbol stub for: __ZN10PCSpinLock4lockEv
000000000002f771	movq	%rbx, %rdi
000000000002f774	movq	%r12, %rsi
000000000002f777	movq	%r15, %rdx
000000000002f77a	movq	%r14, %rcx
000000000002f77d	callq	__ZN8OZSpline18getNextValidVertexEPvPS0_RK6CMTime ## OZSpline::getNextValidVertex(void*, void**, CMTime const&)
000000000002f782	movl	%eax, %r14d
000000000002f785	movq	0xa0(%rbx), %rax
000000000002f78c	testq	%rax, %rax
000000000002f78f	je	0x2f79a
000000000002f791	movq	0x30(%rax), %rdi
000000000002f795	testq	%rdi, %rdi
000000000002f798	jne	0x2f7a1
000000000002f79a	addq	$0x8, %rbx
000000000002f79e	movq	%rbx, %rdi
000000000002f7a1	callq	0xacb1c                         ## symbol stub for: __ZN10PCSpinLock6unlockEv
000000000002f7a6	movl	%r14d, %eax
000000000002f7a9	popq	%rbx
000000000002f7aa	popq	%r12
000000000002f7ac	popq	%r14
000000000002f7ae	popq	%r15
000000000002f7b0	popq	%rbp
000000000002f7b1	retq
