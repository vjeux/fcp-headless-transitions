__ZN11HGToneCurve19SetPremultiplyStateEb:
0000000000248df0	pushq	%rbp
0000000000248df1	movq	%rsp, %rbp
0000000000248df4	pushq	%r14
0000000000248df6	pushq	%rbx
0000000000248df7	movl	%esi, %ebx
0000000000248df9	movq	%rdi, %r14
0000000000248dfc	callq	__ZN6HGNode9ClearBitsEv         ## HGNode::ClearBits()
0000000000248e01	movb	%bl, 0x1a0(%r14)
0000000000248e08	popq	%rbx
0000000000248e09	popq	%r14
0000000000248e0b	popq	%rbp
0000000000248e0c	retq
0000000000248e0d	nopl	(%rax)
