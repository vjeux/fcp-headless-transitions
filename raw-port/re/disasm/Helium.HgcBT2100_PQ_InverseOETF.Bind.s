__ZN24HgcBT2100_PQ_InverseOETF4BindEP9HGHandler:
00000000003acae0	pushq	%rbp
00000000003acae1	movq	%rsp, %rbp
00000000003acae4	pushq	%r14
00000000003acae6	pushq	%rbx
00000000003acae7	movq	%rsi, %rbx
00000000003acaea	movq	%rdi, %r14
00000000003acaed	movq	0x198(%rdi), %rdx
00000000003acaf4	movq	(%rsi), %rax
00000000003acaf7	movq	%rsi, %rdi
00000000003acafa	xorl	%esi, %esi
00000000003acafc	movl	$0x1, %ecx
00000000003acb01	callq	*0x90(%rax)
00000000003acb07	movq	0x198(%r14), %rdx
00000000003acb0e	addq	$0x20, %rdx
00000000003acb12	movq	(%rbx), %rax
00000000003acb15	movq	%rbx, %rdi
00000000003acb18	movl	$0x1, %esi
00000000003acb1d	movl	$0x1, %ecx
00000000003acb22	callq	*0x90(%rax)
00000000003acb28	movq	0x198(%r14), %rdx
00000000003acb2f	addq	$0x40, %rdx
00000000003acb33	movq	(%rbx), %rax
00000000003acb36	movq	%rbx, %rdi
00000000003acb39	movl	$0x2, %esi
00000000003acb3e	movl	$0x1, %ecx
00000000003acb43	callq	*0x90(%rax)
00000000003acb49	movq	(%r14), %rax
00000000003acb4c	movq	%r14, %rdi
00000000003acb4f	movq	%rbx, %rsi
00000000003acb52	callq	*0xc0(%rax)
00000000003acb58	xorl	%eax, %eax
00000000003acb5a	popq	%rbx
00000000003acb5b	popq	%r14
00000000003acb5d	popq	%rbp
00000000003acb5e	retq
00000000003acb5f	nop
