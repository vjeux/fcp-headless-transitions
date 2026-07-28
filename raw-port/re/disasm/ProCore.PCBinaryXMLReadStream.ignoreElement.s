__ZN21PCBinaryXMLReadStream13ignoreElementEv:
0000000000066096	pushq	%rbp
0000000000066097	movq	%rsp, %rbp
000000000006609a	pushq	%r14
000000000006609c	pushq	%rbx
000000000006609d	movq	%rdi, %rbx
00000000000660a0	callq	__ZNK22PCSerializerReadStream14currentElementEv ## PCSerializerReadStream::currentElement() const
00000000000660a5	movq	%rax, %r14
00000000000660a8	movq	0x98(%rbx), %rdi
00000000000660af	movq	0x20(%rax), %rsi
00000000000660b3	movq	(%rdi), %rax
00000000000660b6	callq	*0x28(%rax)
00000000000660b9	movb	$0x1, 0x28(%r14)
00000000000660be	popq	%rbx
00000000000660bf	popq	%r14
00000000000660c1	popq	%rbp
00000000000660c2	retq
00000000000660c3	nop
