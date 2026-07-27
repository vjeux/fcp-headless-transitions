__ZN15OZChannelBool3D4getYERK6CMTimed:
0000000000053606	pushq	%rbp
0000000000053607	movq	%rsp, %rbp
000000000005360a	addq	$0x120, %rdi                    ## imm = 0x120
0000000000053611	callq	__ZNK9OZChannel13getValueAsIntERK6CMTimed ## OZChannel::getValueAsInt(CMTime const&, double) const
0000000000053616	testl	%eax, %eax
0000000000053618	setne	%al
000000000005361b	popq	%rbp
000000000005361c	retq
000000000005361d	nop
