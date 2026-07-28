__ZN13PCPixelFormat7hasGrayENS_12ChannelOrderE:
00000000000353fe	pushq	%rbp
00000000000353ff	movq	%rsp, %rbp
0000000000035402	xorl	%eax, %eax
0000000000035404	cmpl	$0x12, %edi
0000000000035407	cmovbl	%edi, %eax
000000000003540a	leaq	(%rax,%rax,2), %rax
000000000003540e	leaq	__ZN12_GLOBAL__N_19pixelInfoE(%rip), %rcx ## (anonymous namespace)::pixelInfo
0000000000035415	movb	0xd(%rcx,%rax,8), %al
0000000000035419	popq	%rbp
000000000003541a	retq
000000000003541b	nop
