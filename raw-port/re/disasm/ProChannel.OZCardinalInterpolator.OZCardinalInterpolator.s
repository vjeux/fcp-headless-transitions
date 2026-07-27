__ZN22OZCardinalInterpolatorC1Ed:
0000000000042a70	pushq	%rbp
0000000000042a71	movq	%rsp, %rbp
0000000000042a74	pushq	%rbx
0000000000042a75	pushq	%rax
0000000000042a76	movsd	%xmm0, -0x10(%rbp)
0000000000042a7b	movq	%rdi, %rbx
0000000000042a7e	callq	__ZN21OZHermiteInterpolatorC2Ev ## OZHermiteInterpolator::OZHermiteInterpolator()
0000000000042a83	leaq	0x93516(%rip), %rax
0000000000042a8a	movq	%rax, (%rbx)
0000000000042a8d	movsd	-0x10(%rbp), %xmm0
0000000000042a92	movsd	%xmm0, 0x10(%rbx)
0000000000042a97	addq	$0x8, %rsp
0000000000042a9b	popq	%rbx
0000000000042a9c	popq	%rbp
0000000000042a9d	retq
