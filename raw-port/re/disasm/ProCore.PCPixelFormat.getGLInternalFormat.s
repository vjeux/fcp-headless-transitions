__ZN13PCPixelFormat19getGLInternalFormatENS_12ChannelOrderE:
0000000000035308	pushq	%rbp
0000000000035309	movq	%rsp, %rbp
000000000003530c	xorl	%eax, %eax
000000000003530e	cmpl	$0x12, %edi
0000000000035311	cmovbl	%edi, %eax
0000000000035314	leaq	(%rax,%rax,2), %rax
0000000000035318	leaq	__ZN12_GLOBAL__N_16glInfoE(%rip), %rcx
000000000003531f	movl	(%rcx,%rax,4), %eax
0000000000035322	popq	%rbp
0000000000035323	retq
