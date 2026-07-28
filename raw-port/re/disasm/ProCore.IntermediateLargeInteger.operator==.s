__ZNK24IntermediateLargeIntegereqEx:
00000000000bec30	pushq	%rbp
00000000000bec31	movq	%rsp, %rbp
00000000000bec34	movq	(%rdi), %rcx
00000000000bec37	movq	0x8(%rdi), %rax
00000000000bec3b	testq	%rcx, %rcx
00000000000bec3e	js	0xbec50
00000000000bec40	testq	%rax, %rax
00000000000bec43	jne	0xbec5d
00000000000bec45	xorl	%eax, %eax
00000000000bec47	cmpq	$0x0, 0x10(%rdi)
00000000000bec4c	jne	0xbec5f
00000000000bec4e	jmp	0xbec68
00000000000bec50	cmpq	$-0x1, %rax
00000000000bec54	jne	0xbec5d
00000000000bec56	cmpq	$-0x1, 0x10(%rdi)
00000000000bec5b	je	0xbec61
00000000000bec5d	xorl	%eax, %eax
00000000000bec5f	popq	%rbp
00000000000bec60	retq
00000000000bec61	movq	$-0x1, %rax
00000000000bec68	xorq	0x18(%rdi), %rax
00000000000bec6c	xorq	%rsi, %rcx
00000000000bec6f	orq	%rax, %rcx
00000000000bec72	sete	%al
00000000000bec75	jmp	0xbec5f
