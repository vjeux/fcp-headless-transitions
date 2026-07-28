__ZN13PCPixelFormat8hasAlphaENS_12ChannelOrderE:
000000000003541c	pushq	%rbp
000000000003541d	movq	%rsp, %rbp
0000000000035420	xorl	%eax, %eax
0000000000035422	cmpl	$0x12, %edi
0000000000035425	cmovbl	%edi, %eax
0000000000035428	leaq	(%rax,%rax,2), %rax
000000000003542c	leaq	__ZN12_GLOBAL__N_19pixelInfoE(%rip), %rcx ## (anonymous namespace)::pixelInfo
0000000000035433	movb	0xe(%rcx,%rax,8), %al
0000000000035437	popq	%rbp
0000000000035438	retq
0000000000035439	nop
