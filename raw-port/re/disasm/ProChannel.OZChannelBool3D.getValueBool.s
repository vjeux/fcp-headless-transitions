__ZN15OZChannelBool3D8getValueERK6CMTimePbS3_S3_d:
0000000000053636	pushq	%rbp
0000000000053637	movq	%rsp, %rbp
000000000005363a	pushq	%r15
000000000005363c	pushq	%r14
000000000005363e	pushq	%r13
0000000000053640	pushq	%r12
0000000000053642	pushq	%rbx
0000000000053643	pushq	%rax
0000000000053644	movsd	%xmm0, -0x30(%rbp)
0000000000053649	movq	%r8, %rbx
000000000005364c	movq	%rcx, %r14
000000000005364f	movq	%rdx, %r15
0000000000053652	movq	%rsi, %r12
0000000000053655	movq	%rdi, %r13
0000000000053658	addq	$0x88, %rdi
000000000005365f	callq	__ZNK9OZChannel13getValueAsIntERK6CMTimed ## OZChannel::getValueAsInt(CMTime const&, double) const
0000000000053664	testl	%eax, %eax
0000000000053666	setne	(%r15)
000000000005366a	leaq	0x120(%r13), %rdi
0000000000053671	movq	%r12, %rsi
0000000000053674	movsd	-0x30(%rbp), %xmm0
0000000000053679	callq	__ZNK9OZChannel13getValueAsIntERK6CMTimed ## OZChannel::getValueAsInt(CMTime const&, double) const
000000000005367e	testl	%eax, %eax
0000000000053680	setne	(%r14)
0000000000053684	addq	$0x1b8, %r13                    ## imm = 0x1B8
000000000005368b	movq	%r13, %rdi
000000000005368e	movq	%r12, %rsi
0000000000053691	movsd	-0x30(%rbp), %xmm0
0000000000053696	callq	__ZNK9OZChannel13getValueAsIntERK6CMTimed ## OZChannel::getValueAsInt(CMTime const&, double) const
000000000005369b	testl	%eax, %eax
000000000005369d	setne	(%rbx)
00000000000536a0	addq	$0x8, %rsp
00000000000536a4	popq	%rbx
00000000000536a5	popq	%r12
00000000000536a7	popq	%r13
00000000000536a9	popq	%r14
00000000000536ab	popq	%r15
00000000000536ad	popq	%rbp
00000000000536ae	retq
00000000000536af	nop
