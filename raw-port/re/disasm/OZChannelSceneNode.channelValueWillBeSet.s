__ZN18OZChannelSceneNode21channelValueWillBeSetEP9OZChannelRK6CMTimed:
0000000000213c80	movq	0x100(%rdi), %rdi
0000000000213c87	testq	%rdi, %rdi
0000000000213c8a	je	0x213cc2
0000000000213c8c	pushq	%rbp
0000000000213c8d	movq	%rsp, %rbp
0000000000213c90	subq	$0x40, %rsp
0000000000213c94	movq	0x10(%rdx), %rax
0000000000213c98	movq	%rax, -0x10(%rbp)
0000000000213c9c	movups	(%rdx), %xmm1
0000000000213c9f	movaps	%xmm1, -0x20(%rbp)
0000000000213ca3	movq	(%rdi), %rax
0000000000213ca6	movq	-0x10(%rbp), %rcx
0000000000213caa	movq	%rcx, 0x10(%rsp)
0000000000213caf	movaps	-0x20(%rbp), %xmm1
0000000000213cb3	movups	%xmm1, (%rsp)
0000000000213cb7	callq	*0x130(%rax)
0000000000213cbd	addq	$0x40, %rsp
0000000000213cc1	popq	%rbp
0000000000213cc2	retq
0000000000213cc3	nopw	%cs:(%rax,%rax)
