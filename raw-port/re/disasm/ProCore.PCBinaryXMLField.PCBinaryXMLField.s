__ZN16PCBinaryXMLFieldC2E8PCString:
0000000000066de0	pushq	%rbp
0000000000066de1	movq	%rsp, %rbp
0000000000066de4	pushq	%r15
0000000000066de6	pushq	%r14
0000000000066de8	pushq	%rbx
0000000000066de9	pushq	%rax
0000000000066dea	movq	%rsi, %r14
0000000000066ded	movq	%rdi, %r15
0000000000066df0	leaq	0x40(%rdi), %rbx
0000000000066df4	movq	%rbx, %rdi
0000000000066df7	callq	__ZN8PCStringC1Ev               ## PCString::PCString()
0000000000066dfc	xorps	%xmm0, %xmm0
0000000000066dff	movups	%xmm0, 0x48(%r15)
0000000000066e04	movl	$0x5, (%r15)
0000000000066e0b	movq	%rbx, %rdi
0000000000066e0e	movq	%r14, %rsi
0000000000066e11	callq	__ZN8PCString3setERKS_          ## PCString::set(PCString const&)
0000000000066e16	addq	$0x8, %rsp
0000000000066e1a	popq	%rbx
0000000000066e1b	popq	%r14
0000000000066e1d	popq	%r15
0000000000066e1f	popq	%rbp
0000000000066e20	retq
0000000000066e21	movq	%rax, %r14
0000000000066e24	movq	%rbx, %rdi
0000000000066e27	callq	__ZN8PCStringD1Ev               ## PCString::~PCString()
0000000000066e2c	movq	%r14, %rdi
0000000000066e2f	callq	0xde50a                         ## symbol stub for: __Unwind_Resume
