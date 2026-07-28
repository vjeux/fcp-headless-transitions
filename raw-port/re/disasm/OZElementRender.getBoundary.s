__ZN15OZElementRender11getBoundaryER7LiAgentP6PCRectIdE:
00000000004512e0	pushq	%rbp
00000000004512e1	movq	%rsp, %rbp
00000000004512e4	movq	0x5d0(%rdi), %rax
00000000004512eb	leaq	0x10(%rdi), %rcx
00000000004512ef	movq	(%rax), %r8
00000000004512f2	movq	%rax, %rdi
00000000004512f5	movq	%rdx, %rsi
00000000004512f8	movq	%rcx, %rdx
00000000004512fb	callq	*0x5e0(%r8)
0000000000451302	movb	$0x1, %al
0000000000451304	popq	%rbp
0000000000451305	retq
0000000000451306	nopw	%cs:(%rax,%rax)
