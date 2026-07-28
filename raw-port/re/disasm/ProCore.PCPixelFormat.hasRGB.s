__ZN13PCPixelFormat6hasRGBENS_12ChannelOrderE:
00000000000353e0	pushq	%rbp
00000000000353e1	movq	%rsp, %rbp
00000000000353e4	xorl	%eax, %eax
00000000000353e6	cmpl	$0x12, %edi
00000000000353e9	cmovbl	%edi, %eax
00000000000353ec	leaq	(%rax,%rax,2), %rax
00000000000353f0	leaq	__ZN12_GLOBAL__N_19pixelInfoE(%rip), %rcx ## (anonymous namespace)::pixelInfo
00000000000353f7	movb	0xc(%rcx,%rax,8), %al
00000000000353fb	popq	%rbp
00000000000353fc	retq
00000000000353fd	nop
