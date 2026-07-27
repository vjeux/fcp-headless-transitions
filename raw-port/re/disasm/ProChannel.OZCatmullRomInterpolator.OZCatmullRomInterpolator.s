__ZN24OZCatmullRomInterpolatorC1Ev:
00000000000430a2	pushq	%rbp
00000000000430a3	movq	%rsp, %rbp
00000000000430a6	pushq	%rbx
00000000000430a7	pushq	%rax
00000000000430a8	movq	%rdi, %rbx
00000000000430ab	xorps	%xmm0, %xmm0
00000000000430ae	callq	__ZN22OZCardinalInterpolatorC2Ed ## OZCardinalInterpolator::OZCardinalInterpolator(double)
00000000000430b3	leaq	0x92f96(%rip), %rax
00000000000430ba	movq	%rax, (%rbx)
00000000000430bd	addq	$0x8, %rsp
00000000000430c1	popq	%rbx
00000000000430c2	popq	%rbp
00000000000430c3	retq
