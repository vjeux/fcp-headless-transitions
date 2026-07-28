__ZN13FactoryParser12parseElementER22PCSerializerReadStreamR15PCStreamElement:
00000000000486e0	cmpl	$0x5e, 0x8(%rdx)
00000000000486e4	jne	0x48705
00000000000486e6	pushq	%rbp
00000000000486e7	movq	%rsp, %rbp
00000000000486ea	subq	$0x10, %rsp
00000000000486ee	leaq	-0x4(%rbp), %rax
00000000000486f2	movq	%rsi, %rdi
00000000000486f5	movq	%rdx, %rsi
00000000000486f8	movq	%rax, %rdx
00000000000486fb	callq	0x6de76c                        ## symbol stub for: __ZN22PCSerializerReadStream10getAsFloatER15PCStreamElementPf
0000000000048700	addq	$0x10, %rsp
0000000000048704	popq	%rbp
0000000000048705	movb	$0x1, %al
0000000000048707	retq
0000000000048708	nopl	(%rax,%rax)
