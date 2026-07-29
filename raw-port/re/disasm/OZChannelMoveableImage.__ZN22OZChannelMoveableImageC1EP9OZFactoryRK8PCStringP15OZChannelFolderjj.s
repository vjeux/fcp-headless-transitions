__ZN22OZChannelMoveableImageC1EP9OZFactoryRK8PCStringP15OZChannelFolderjj:
0000000000339590	pushq	%rbp
0000000000339591	movq	%rsp, %rbp
0000000000339594	pushq	%rbx
0000000000339595	pushq	%rax
0000000000339596	movq	%rdi, %rbx
0000000000339599	callq	__ZN25OZChanElementOrFootageRefC2EP9OZFactoryRK8PCStringP15OZChannelFolderjj ## OZChanElementOrFootageRef::OZChanElementOrFootageRef(OZFactory*, PCString const&, OZChannelFolder*, unsigned int, unsigned int)
000000000033959e	leaq	0x51664b(%rip), %rax
00000000003395a5	movq	%rax, (%rbx)
00000000003395a8	leaq	0x5169c1(%rip), %rax
00000000003395af	movq	%rax, 0x10(%rbx)
00000000003395b3	movq	$0x0, 0xa0(%rbx)
00000000003395be	movb	$0x0, 0xa8(%rbx)
00000000003395c5	addq	$0x8, %rsp
00000000003395c9	popq	%rbx
00000000003395ca	popq	%rbp
00000000003395cb	retq
00000000003395cc	nopl	(%rax)
