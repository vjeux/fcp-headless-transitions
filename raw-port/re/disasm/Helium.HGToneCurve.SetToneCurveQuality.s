__ZN11HGToneCurve19SetToneCurveQualityENS_18hgToneCurveQualityE:
0000000000248dc0	pushq	%rbp
0000000000248dc1	movq	%rsp, %rbp
0000000000248dc4	pushq	%r14
0000000000248dc6	pushq	%rbx
0000000000248dc7	movl	%esi, %ebx
0000000000248dc9	movq	%rdi, %r14
0000000000248dcc	callq	__ZN6HGNode9ClearBitsEv         ## HGNode::ClearBits()
0000000000248dd1	xorl	%eax, %eax
0000000000248dd3	testl	%ebx, %ebx
0000000000248dd5	cmovgl	%ebx, %eax
0000000000248dd8	cmpl	$0x7, %eax
0000000000248ddb	movl	$0x7, %ecx
0000000000248de0	cmovll	%eax, %ecx
0000000000248de3	movl	%ecx, 0x19c(%r14)
0000000000248dea	popq	%rbx
0000000000248deb	popq	%r14
0000000000248ded	popq	%rbp
0000000000248dee	retq
0000000000248def	nop
