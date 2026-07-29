__ZN22OZChannelMoveableImageC1EP9OZFactoryRK8PCStringj:
0000000000339770	pushq	%rbp
0000000000339771	movq	%rsp, %rbp
0000000000339774	pushq	%rbx
0000000000339775	pushq	%rax
0000000000339776	movq	%rdi, %rbx
0000000000339779	callq	__ZN25OZChanElementOrFootageRefC2EP9OZFactoryRK8PCStringj ## OZChanElementOrFootageRef::OZChanElementOrFootageRef(OZFactory*, PCString const&, unsigned int)
000000000033977e	leaq	0x51646b(%rip), %rax
0000000000339785	movq	%rax, (%rbx)
0000000000339788	leaq	0x5167e1(%rip), %rax
000000000033978f	movq	%rax, 0x10(%rbx)
0000000000339793	movq	$0x0, 0xa0(%rbx)
000000000033979e	movb	$0x0, 0xa8(%rbx)
00000000003397a5	addq	$0x8, %rsp
00000000003397a9	popq	%rbx
00000000003397aa	popq	%rbp
00000000003397ab	retq
00000000003397ac	nopl	(%rax)
