__ZN22OZChannelMoveableImage16setOffsetChannelEP11OZChannel2D:
0000000000339b90	cmpb	$0x1, 0xa8(%rdi)
0000000000339b97	jne	0x339bcc
0000000000339b99	movq	0xa0(%rdi), %rax
0000000000339ba0	testq	%rax, %rax
0000000000339ba3	je	0x339bc5
0000000000339ba5	pushq	%rbp
0000000000339ba6	movq	%rsp, %rbp
0000000000339ba9	pushq	%r14
0000000000339bab	pushq	%rbx
0000000000339bac	movq	(%rax), %rcx
0000000000339baf	movq	%rdi, %rbx
0000000000339bb2	movq	%rax, %rdi
0000000000339bb5	movq	%rsi, %r14
0000000000339bb8	callq	*0x8(%rcx)
0000000000339bbb	movq	%rbx, %rdi
0000000000339bbe	movq	%r14, %rsi
0000000000339bc1	popq	%rbx
0000000000339bc2	popq	%r14
0000000000339bc4	popq	%rbp
0000000000339bc5	movb	$0x0, 0xa8(%rdi)
0000000000339bcc	movq	%rsi, 0xa0(%rdi)
0000000000339bd3	retq
0000000000339bd4	nopw	%cs:(%rax,%rax)
