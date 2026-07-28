__ZN13PCPixelFormat15getGLDataFormatENS_12ChannelOrderE:
0000000000035324	pushq	%rbp
0000000000035325	movq	%rsp, %rbp
0000000000035328	xorl	%eax, %eax
000000000003532a	cmpl	$0x12, %edi
000000000003532d	cmovbl	%edi, %eax
0000000000035330	leaq	(%rax,%rax,2), %rax
0000000000035334	leaq	__ZN12_GLOBAL__N_16glInfoE(%rip), %rcx ## (anonymous namespace)::glInfo
000000000003533b	movl	0x4(%rcx,%rax,4), %eax
000000000003533f	popq	%rbp
0000000000035340	retq
0000000000035341	nop
