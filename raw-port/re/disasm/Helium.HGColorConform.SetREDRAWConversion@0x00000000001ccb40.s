__ZN14HGColorConform19SetREDRAWConversionEv:
00000000001ccb40	pushq	%rbp
00000000001ccb41	movq	%rsp, %rbp
00000000001ccb44	pushq	%rbx
00000000001ccb45	pushq	%rax
00000000001ccb46	movq	%rdi, %rbx
00000000001ccb49	callq	__ZN6HGNode9ClearBitsEv         ## HGNode::ClearBits()
00000000001ccb4e	movl	$0x16, 0x1e4(%rbx)
00000000001ccb58	movq	%rbx, %rdi
00000000001ccb5b	callq	__ZN14HGColorConform21ClearConversionParamsEv ## HGColorConform::ClearConversionParams()
00000000001ccb60	movb	$0x1, %al
00000000001ccb62	addq	$0x8, %rsp
00000000001ccb66	popq	%rbx
00000000001ccb67	popq	%rbp
00000000001ccb68	retq
00000000001ccb69	nopl	(%rax)
