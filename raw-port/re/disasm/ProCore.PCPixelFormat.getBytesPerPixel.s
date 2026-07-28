__ZN13PCPixelFormat16getBytesPerPixelENS_12ChannelOrderE:
00000000000353c2	pushq	%rbp
00000000000353c3	movq	%rsp, %rbp
00000000000353c6	xorl	%eax, %eax
00000000000353c8	cmpl	$0x12, %edi
00000000000353cb	cmovbl	%edi, %eax
00000000000353ce	leaq	(%rax,%rax,2), %rax
00000000000353d2	leaq	__ZN12_GLOBAL__N_19pixelInfoE(%rip), %rcx ## (anonymous namespace)::pixelInfo
00000000000353d9	movl	0x8(%rcx,%rax,8), %eax
00000000000353dd	popq	%rbp
00000000000353de	retq
00000000000353df	nop
