__ZN15OZChannelBool3D4getZERK6CMTimed:
000000000005361e	pushq	%rbp
000000000005361f	movq	%rsp, %rbp
0000000000053622	addq	$0x1b8, %rdi                    ## imm = 0x1B8
0000000000053629	callq	__ZNK9OZChannel13getValueAsIntERK6CMTimed ## OZChannel::getValueAsInt(CMTime const&, double) const
000000000005362e	testl	%eax, %eax
0000000000053630	setne	%al
0000000000053633	popq	%rbp
0000000000053634	retq
0000000000053635	nop
