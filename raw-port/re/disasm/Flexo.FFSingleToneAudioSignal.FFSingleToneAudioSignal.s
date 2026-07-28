__ZN23FFSingleToneAudioSignalC1Eyddd:
0000000001258ef0	pushq	%rbp
0000000001258ef1	movq	%rsp, %rbp
0000000001258ef4	movb	$0x0, 0x18(%rdi)
0000000001258ef8	movq	$0x0, 0x10(%rdi)
0000000001258f00	leaq	0x6c8ad9(%rip), %rax
0000000001258f07	movq	%rax, (%rdi)
0000000001258f0a	movsd	%xmm0, 0x20(%rdi)
0000000001258f0f	movsd	%xmm1, 0x28(%rdi)
0000000001258f14	movsd	%xmm2, 0x30(%rdi)
0000000001258f19	movq	%rsi, 0x8(%rdi)
0000000001258f1d	popq	%rbp
0000000001258f1e	retq
0000000001258f1f	nop
