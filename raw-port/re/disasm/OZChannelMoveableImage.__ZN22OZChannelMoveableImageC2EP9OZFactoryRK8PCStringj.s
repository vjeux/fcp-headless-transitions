__ZN22OZChannelMoveableImageC2EP9OZFactoryRK8PCStringj:
0000000000339730	pushq	%rbp
0000000000339731	movq	%rsp, %rbp
0000000000339734	pushq	%rbx
0000000000339735	pushq	%rax
0000000000339736	movq	%rdi, %rbx
0000000000339739	callq	__ZN25OZChanElementOrFootageRefC2EP9OZFactoryRK8PCStringj ## OZChanElementOrFootageRef::OZChanElementOrFootageRef(OZFactory*, PCString const&, unsigned int)
000000000033973e	leaq	0x5164ab(%rip), %rax
0000000000339745	movq	%rax, (%rbx)
0000000000339748	leaq	0x516821(%rip), %rax
000000000033974f	movq	%rax, 0x10(%rbx)
0000000000339753	movq	$0x0, 0xa0(%rbx)
000000000033975e	movb	$0x0, 0xa8(%rbx)
0000000000339765	addq	$0x8, %rsp
0000000000339769	popq	%rbx
000000000033976a	popq	%rbp
000000000033976b	retq
000000000033976c	nopl	(%rax)
