__ZN13PCPixelFormat14getNumChannelsENS_12ChannelOrderE:
0000000000035476	pushq	%rbp
0000000000035477	movq	%rsp, %rbp
000000000003547a	xorl	%eax, %eax
000000000003547c	cmpl	$0x12, %edi
000000000003547f	cmovbl	%edi, %eax
0000000000035482	leaq	(%rax,%rax,2), %rax
0000000000035486	leaq	__ZN12_GLOBAL__N_19pixelInfoE(%rip), %rcx ## (anonymous namespace)::pixelInfo
000000000003548d	movl	0x14(%rcx,%rax,8), %eax
0000000000035491	popq	%rbp
0000000000035492	retq
0000000000035493	nop
