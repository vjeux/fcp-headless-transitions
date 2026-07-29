__ZNK16PCBinaryXMLField12getAsFigTimeEP6CMTime:
0000000000066ae8	pushq	%rbp
0000000000066ae9	movq	%rsp, %rbp
0000000000066aec	pushq	%r14
0000000000066aee	pushq	%rbx
0000000000066aef	subq	$0x10, %rsp
0000000000066af3	movq	%rsi, %rbx
0000000000066af6	movl	(%rdi), %eax
0000000000066af8	cmpl	$0x4, %eax
0000000000066afb	je	0x66b29
0000000000066afd	cmpl	$0x5, %eax
0000000000066b00	jne	0x66b3c
0000000000066b02	addq	$0x40, %rdi
0000000000066b06	callq	__ZNK8PCString10createCStrEv    ## PCString::createCStr() const
0000000000066b0b	movq	%rax, %r14
0000000000066b0e	leaq	-0x18(%rbp), %rdi
0000000000066b12	movq	%rax, (%rdi)
0000000000066b15	movq	%rbx, %rsi
0000000000066b18	callq	__ZN15PCStreamElement10aToFigTimeEPPKcP6CMTime ## PCStreamElement::aToFigTime(char const**, CMTime*)
0000000000066b1d	movl	%eax, %ebx
0000000000066b1f	movq	%r14, %rdi
0000000000066b22	callq	0xde89a                         ## symbol stub for: _free
0000000000066b27	jmp	0x66b3e
0000000000066b29	movq	0x38(%rdi), %rax
0000000000066b2d	movq	%rax, 0x10(%rbx)
0000000000066b31	movups	0x28(%rdi), %xmm0
0000000000066b35	movups	%xmm0, (%rbx)
0000000000066b38	movb	$0x1, %bl
0000000000066b3a	jmp	0x66b3e
0000000000066b3c	xorl	%ebx, %ebx
0000000000066b3e	movl	%ebx, %eax
0000000000066b40	addq	$0x10, %rsp
0000000000066b44	popq	%rbx
0000000000066b45	popq	%r14
0000000000066b47	popq	%rbp
0000000000066b48	retq
0000000000066b49	nop
