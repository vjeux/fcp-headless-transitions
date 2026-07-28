__ZN13PCPixelFormat12hasAlphaLastENS_12ChannelOrderE:
000000000003543a	pushq	%rbp
000000000003543b	movq	%rsp, %rbp
000000000003543e	xorl	%eax, %eax
0000000000035440	cmpl	$0x12, %edi
0000000000035443	cmovbl	%edi, %eax
0000000000035446	leaq	(%rax,%rax,2), %rax
000000000003544a	leaq	__ZN12_GLOBAL__N_19pixelInfoE(%rip), %rcx ## (anonymous namespace)::pixelInfo
0000000000035451	movb	0xf(%rcx,%rax,8), %al
0000000000035455	popq	%rbp
0000000000035456	retq
0000000000035457	nop
