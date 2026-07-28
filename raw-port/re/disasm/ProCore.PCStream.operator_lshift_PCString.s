__ZN8PCStreamlsERK8PCString:
0000000000006e92	pushq	%rbp
0000000000006e93	movq	%rsp, %rbp
0000000000006e96	pushq	%r15
0000000000006e98	pushq	%r14
0000000000006e9a	pushq	%rbx
0000000000006e9b	pushq	%rax
0000000000006e9c	movq	%rsi, %r14
0000000000006e9f	movq	%rdi, %rbx
0000000000006ea2	movq	%rsi, %rdi
0000000000006ea5	callq	__ZNK8PCString4sizeEv           ## PCString::size() const
0000000000006eaa	movl	%eax, %r15d
0000000000006ead	movq	%r14, %rdi
0000000000006eb0	callq	__ZNK8PCString10createCStrEv    ## PCString::createCStr() const
0000000000006eb5	movq	%rax, %r14
0000000000006eb8	testl	%r15d, %r15d
0000000000006ebb	je	0x6ecc
0000000000006ebd	movl	%r15d, %edx
0000000000006ec0	movq	(%rbx), %rax
0000000000006ec3	movq	%rbx, %rdi
0000000000006ec6	movq	%r14, %rsi
0000000000006ec9	callq	*0x18(%rax)
0000000000006ecc	movq	%r14, %rdi
0000000000006ecf	callq	0xde89a                         ## symbol stub for: _free
0000000000006ed4	movq	%rbx, %rax
0000000000006ed7	addq	$0x8, %rsp
0000000000006edb	popq	%rbx
0000000000006edc	popq	%r14
0000000000006ede	popq	%r15
0000000000006ee0	popq	%rbp
0000000000006ee1	retq
