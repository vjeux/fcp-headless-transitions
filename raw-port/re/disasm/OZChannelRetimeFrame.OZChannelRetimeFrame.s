__ZN20OZChannelRetimeFrameC1EP9OZFactoryRK8PCStringj:
00000000004edf80	pushq	%rbp
00000000004edf81	movq	%rsp, %rbp
00000000004edf84	pushq	%rbx
00000000004edf85	pushq	%rax
00000000004edf86	movq	%rdi, %rbx
00000000004edf89	xorl	%r8d, %r8d
00000000004edf8c	xorl	%r9d, %r9d
00000000004edf8f	callq	__ZN15OZChannelDoubleC2EP9OZFactoryRK8PCStringjP13OZChannelImplP13OZChannelInfo ## OZChannelDouble::OZChannelDouble(OZFactory*, PCString const&, unsigned int, OZChannelImpl*, OZChannelInfo*)
00000000004edf94	leaq	0x389ced(%rip), %rax
00000000004edf9b	movq	%rax, (%rbx)
00000000004edf9e	leaq	0x38a043(%rip), %rax
00000000004edfa5	movq	%rax, 0x10(%rbx)
00000000004edfa9	orb	$0x1, 0x39(%rbx)
00000000004edfad	addq	$0x8, %rsp
00000000004edfb1	popq	%rbx
00000000004edfb2	popq	%rbp
00000000004edfb3	retq
00000000004edfb4	nopw	%cs:(%rax,%rax)
