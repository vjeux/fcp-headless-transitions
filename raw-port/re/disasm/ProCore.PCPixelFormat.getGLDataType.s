__ZN13PCPixelFormat13getGLDataTypeENS_12ChannelOrderE:
0000000000035342	pushq	%rbp
0000000000035343	movq	%rsp, %rbp
0000000000035346	xorl	%eax, %eax
0000000000035348	cmpl	$0x12, %edi
000000000003534b	cmovbl	%edi, %eax
000000000003534e	leaq	(%rax,%rax,2), %rax
0000000000035352	leaq	__ZN12_GLOBAL__N_16glInfoE(%rip), %rcx ## (anonymous namespace)::glInfo
0000000000035359	movl	0x8(%rcx,%rax,4), %eax
000000000003535d	popq	%rbp
000000000003535e	retq
000000000003535f	nop
