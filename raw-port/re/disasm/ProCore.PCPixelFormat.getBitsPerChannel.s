__ZN13PCPixelFormat17getBitsPerChannelENS_12ChannelOrderE:
00000000000353a4	pushq	%rbp
00000000000353a5	movq	%rsp, %rbp
00000000000353a8	xorl	%eax, %eax
00000000000353aa	cmpl	$0x12, %edi
00000000000353ad	cmovbl	%edi, %eax
00000000000353b0	leaq	(%rax,%rax,2), %rax
00000000000353b4	leaq	__ZN12_GLOBAL__N_19pixelInfoE(%rip), %rcx ## (anonymous namespace)::pixelInfo
00000000000353bb	movl	0x4(%rcx,%rax,8), %eax
00000000000353bf	popq	%rbp
00000000000353c0	retq
00000000000353c1	nop
