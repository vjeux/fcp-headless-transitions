__ZNK17OZChannelPosition11getPositionERK6CMTimePdS3_d:
00000000000808b2	pushq	%rbp
00000000000808b3	movq	%rsp, %rbp
00000000000808b6	pushq	%r15
00000000000808b8	pushq	%r14
00000000000808ba	pushq	%r12
00000000000808bc	pushq	%rbx
00000000000808bd	subq	$0x10, %rsp
00000000000808c1	movq	%rcx, %rbx
00000000000808c4	movq	%rsi, %r14
00000000000808c7	movq	%rdi, %r15
00000000000808ca	testq	%rdx, %rdx
00000000000808cd	je	0x808f6
00000000000808cf	movq	%rdx, %r12
00000000000808d2	leaq	0x88(%r15), %rdi
00000000000808d9	movq	%r14, %rsi
00000000000808dc	movsd	%xmm0, -0x28(%rbp)
00000000000808e1	movsd	-0x28(%rbp), %xmm0
00000000000808e6	callq	__ZNK9OZChannel16getValueAsDoubleERK6CMTimed ## OZChannel::getValueAsDouble(CMTime const&, double) const
00000000000808eb	movsd	%xmm0, (%r12)
00000000000808f1	movsd	-0x28(%rbp), %xmm0
00000000000808f6	testq	%rbx, %rbx
00000000000808f9	je	0x80911
00000000000808fb	addq	$0x120, %r15                    ## imm = 0x120
0000000000080902	movq	%r15, %rdi
0000000000080905	movq	%r14, %rsi
0000000000080908	callq	__ZNK9OZChannel16getValueAsDoubleERK6CMTimed ## OZChannel::getValueAsDouble(CMTime const&, double) const
000000000008090d	movsd	%xmm0, (%rbx)
0000000000080911	addq	$0x10, %rsp
0000000000080915	popq	%rbx
0000000000080916	popq	%r12
0000000000080918	popq	%r14
000000000008091a	popq	%r15
000000000008091c	popq	%rbp
000000000008091d	retq
