__ZN15PCStreamElement10aToFigTimeEPPKcP6CMTime:
00000000000287d8	testq	%rdi, %rdi
00000000000287db	je	0x28899
00000000000287e1	pushq	%rbp
00000000000287e2	movq	%rsp, %rbp
00000000000287e5	pushq	%r15
00000000000287e7	pushq	%r14
00000000000287e9	pushq	%r13
00000000000287eb	pushq	%r12
00000000000287ed	pushq	%rbx
00000000000287ee	subq	$0x18, %rsp
00000000000287f2	movq	%rdi, %rbx
00000000000287f5	movq	(%rdi), %r15
00000000000287f8	testq	%r15, %r15
00000000000287fb	je	0x28888
0000000000028801	movq	%rsi, %r14
0000000000028804	callq	0xde726                         ## symbol stub for: ___error
0000000000028809	movl	$0x0, (%rax)
000000000002880f	leaq	-0x30(%rbp), %rsi
0000000000028813	movq	%r15, %rdi
0000000000028816	movl	$0xa, %edx
000000000002881b	callq	0xdeba0                         ## symbol stub for: _strtoll
0000000000028820	movq	%rax, %r15
0000000000028823	callq	0xde726                         ## symbol stub for: ___error
0000000000028828	cmpl	$0x22, (%rax)
000000000002882b	je	0x28888
000000000002882d	leaq	-0x30(%rbp), %rsi
0000000000028831	movq	(%rsi), %rdi
0000000000028834	movl	$0xa, %edx
0000000000028839	callq	0xdeb9a                         ## symbol stub for: _strtol
000000000002883e	movq	%rax, %r12
0000000000028841	callq	0xde726                         ## symbol stub for: ___error
0000000000028846	cmpl	$0x22, (%rax)
0000000000028849	je	0x28888
000000000002884b	leaq	-0x30(%rbp), %rsi
000000000002884f	movq	(%rsi), %rdi
0000000000028852	movl	$0x10, %edx
0000000000028857	callq	0xdebac                         ## symbol stub for: _strtoull
000000000002885c	movq	%rax, %r13
000000000002885f	callq	0xde726                         ## symbol stub for: ___error
0000000000028864	cmpl	$0x22, (%rax)
0000000000028867	je	0x28888
0000000000028869	leaq	-0x30(%rbp), %rsi
000000000002886d	movq	(%rsi), %rdi
0000000000028870	movl	$0xa, %edx
0000000000028875	callq	0xdebac                         ## symbol stub for: _strtoull
000000000002887a	movq	%rax, -0x38(%rbp)
000000000002887e	callq	0xde726                         ## symbol stub for: ___error
0000000000028883	cmpl	$0x22, (%rax)
0000000000028886	jne	0x2889c
0000000000028888	xorl	%eax, %eax
000000000002888a	addq	$0x18, %rsp
000000000002888e	popq	%rbx
000000000002888f	popq	%r12
0000000000028891	popq	%r13
0000000000028893	popq	%r14
0000000000028895	popq	%r15
0000000000028897	popq	%rbp
0000000000028898	retq
0000000000028899	xorl	%eax, %eax
000000000002889b	retq
000000000002889c	movq	%r15, (%r14)
000000000002889f	movl	%r12d, 0x8(%r14)
00000000000288a3	movl	%r13d, 0xc(%r14)
00000000000288a7	movl	-0x38(%rbp), %eax
00000000000288aa	movq	%rax, 0x10(%r14)
00000000000288ae	movq	-0x30(%rbp), %rax
00000000000288b2	movq	%rax, (%rbx)
00000000000288b5	movb	$0x1, %al
00000000000288b7	jmp	0x2888a
00000000000288b9	nop
