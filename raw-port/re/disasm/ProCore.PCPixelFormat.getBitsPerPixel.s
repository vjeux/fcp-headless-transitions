__ZN13PCPixelFormat15getBitsPerPixelENS_12ChannelOrderE:
0000000000035388	pushq	%rbp
0000000000035389	movq	%rsp, %rbp
000000000003538c	xorl	%eax, %eax
000000000003538e	cmpl	$0x12, %edi
0000000000035391	cmovbl	%edi, %eax
0000000000035394	leaq	(%rax,%rax,2), %rax
0000000000035398	leaq	__ZN12_GLOBAL__N_19pixelInfoE(%rip), %rcx ## (anonymous namespace)::pixelInfo
000000000003539f	movl	(%rcx,%rax,8), %eax
00000000000353a2	popq	%rbp
00000000000353a3	retq
