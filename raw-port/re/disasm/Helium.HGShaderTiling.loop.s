__ZNK14HGShaderTiling4loopEjj:
00000000000c7a40	pushq	%rbp
00000000000c7a41	movq	%rsp, %rbp
00000000000c7a44	movl	0x28(%rdi), %ecx
00000000000c7a47	movl	$0xffffffff, %eax               ## imm = 0xFFFFFFFF
00000000000c7a4c	testl	$0x40000000, %ecx               ## imm = 0x40000000
00000000000c7a52	je	0xc7a77
00000000000c7a54	leal	(,%rcx,8), %eax
00000000000c7a5b	sarl	$0x1f, %eax
00000000000c7a5e	imull	%esi, %edx
00000000000c7a61	andl	%eax, %edx
00000000000c7a63	addl	0x30(%rdi), %edx
00000000000c7a66	xorl	%eax, %eax
00000000000c7a68	testl	$0x8000000, %ecx                ## imm = 0x8000000
00000000000c7a6e	je	0xc7a73
00000000000c7a70	movl	0x4c(%rdi), %eax
00000000000c7a73	addl	%eax, %edx
00000000000c7a75	movl	%edx, %eax
00000000000c7a77	popq	%rbp
00000000000c7a78	retq
00000000000c7a79	nopl	(%rax)
