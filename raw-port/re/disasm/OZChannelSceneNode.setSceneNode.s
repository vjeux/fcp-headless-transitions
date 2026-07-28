__ZN18OZChannelSceneNode12setSceneNodeEP11OZSceneNode:
0000000000213d50	pushq	%rbp
0000000000213d51	movq	%rsp, %rbp
0000000000213d54	movq	%rsi, 0x100(%rdi)
0000000000213d5b	leaq	0x10(%rsi), %rax
0000000000213d5f	testq	%rsi, %rsi
0000000000213d62	cmoveq	%rsi, %rax
0000000000213d66	movq	%rax, 0xd0(%rdi)
0000000000213d6d	popq	%rbp
0000000000213d6e	retq
0000000000213d6f	nop
