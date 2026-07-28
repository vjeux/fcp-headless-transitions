__ZN19FFScaledAudioSignalC1EP13FFAudioSignald27FFAudioSignalInputOwnership:
0000000001258da0	pushq	%rbp
0000000001258da1	movq	%rsp, %rbp
0000000001258da4	pushq	%rbx
0000000001258da5	pushq	%rax
0000000001258da6	movq	%rdi, %rbx
0000000001258da9	xorps	%xmm1, %xmm1
0000000001258dac	movups	%xmm1, 0x8(%rdi)
0000000001258db0	movb	$0x0, 0x18(%rdi)
0000000001258db4	leaq	0x6c8bed(%rip), %rax
0000000001258dbb	movq	%rax, (%rdi)
0000000001258dbe	testl	%edx, %edx
0000000001258dc0	jne	0x1258dd8
0000000001258dc2	movq	(%rsi), %rax
0000000001258dc5	movq	%rsi, %rdi
0000000001258dc8	movsd	%xmm0, -0x10(%rbp)
0000000001258dcd	callq	*0x10(%rax)
0000000001258dd0	movsd	-0x10(%rbp), %xmm0
0000000001258dd5	movq	%rax, %rsi
0000000001258dd8	movq	%rsi, 0x20(%rbx)
0000000001258ddc	movsd	%xmm0, 0x28(%rbx)
0000000001258de1	movq	0x8(%rsi), %rax
0000000001258de5	movq	%rax, 0x8(%rbx)
0000000001258de9	addq	$0x8, %rsp
0000000001258ded	popq	%rbx
0000000001258dee	popq	%rbp
0000000001258def	retq
