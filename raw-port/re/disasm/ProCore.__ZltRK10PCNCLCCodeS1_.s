__ZltRK10PCNCLCCodeS1_:
00000000000c22bd	pushq	%rbp
00000000000c22be	movq	%rsp, %rbp
00000000000c22c1	movl	(%rsi), %eax
00000000000c22c3	cmpl	%eax, (%rdi)
00000000000c22c5	jne	0xc22d5
00000000000c22c7	movl	0x4(%rsi), %eax
00000000000c22ca	cmpl	%eax, 0x4(%rdi)
00000000000c22cd	jne	0xc22d5
00000000000c22cf	movl	0x8(%rdi), %eax
00000000000c22d2	cmpl	0x8(%rsi), %eax
00000000000c22d5	setl	%al
00000000000c22d8	popq	%rbp
00000000000c22d9	retq
