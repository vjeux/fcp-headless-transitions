__ZN13PCPixelFormat7isFloatENS_12ChannelOrderE:
0000000000035458	pushq	%rbp
0000000000035459	movq	%rsp, %rbp
000000000003545c	xorl	%eax, %eax
000000000003545e	cmpl	$0x12, %edi
0000000000035461	cmovbl	%edi, %eax
0000000000035464	leaq	(%rax,%rax,2), %rax
0000000000035468	leaq	__ZN12_GLOBAL__N_19pixelInfoE(%rip), %rcx ## (anonymous namespace)::pixelInfo
000000000003546f	movb	0x10(%rcx,%rax,8), %al
0000000000035473	popq	%rbp
0000000000035474	retq
0000000000035475	nop
