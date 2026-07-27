__ZN15OZChannelBool3D4getXERK6CMTimed:
00000000000535ee	pushq	%rbp
00000000000535ef	movq	%rsp, %rbp
00000000000535f2	addq	$0x88, %rdi
00000000000535f9	callq	__ZNK9OZChannel13getValueAsIntERK6CMTimed ## OZChannel::getValueAsInt(CMTime const&, double) const
00000000000535fe	testl	%eax, %eax
0000000000053600	setne	%al
0000000000053603	popq	%rbp
0000000000053604	retq
0000000000053605	nop
