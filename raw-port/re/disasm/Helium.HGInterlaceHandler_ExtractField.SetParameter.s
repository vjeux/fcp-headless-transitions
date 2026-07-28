__ZN31HGInterlaceHandler_ExtractField12SetParameterEiffff:
0000000000092f90	pushq	%rbp
0000000000092f91	movq	%rsp, %rbp
0000000000092f94	pushq	%rbx
0000000000092f95	subq	$0x18, %rsp
0000000000092f99	movaps	%xmm0, -0x20(%rbp)
0000000000092f9d	movq	%rdi, %rbx
0000000000092fa0	callq	__ZN6HGNode9ClearBitsEv         ## HGNode::ClearBits()
0000000000092fa5	movq	0x198(%rbx), %rdi
0000000000092fac	movq	(%rdi), %rax
0000000000092faf	movq	0x60(%rax), %rax
0000000000092fb3	xorps	%xmm0, %xmm0
0000000000092fb6	movaps	-0x20(%rbp), %xmm1
0000000000092fba	cmpeqss	%xmm0, %xmm1
0000000000092fbf	movss	0x334cf9(%rip), %xmm0
0000000000092fc7	andnps	%xmm0, %xmm1
0000000000092fca	xorps	%xmm0, %xmm0
0000000000092fcd	xorps	%xmm2, %xmm2
0000000000092fd0	xorps	%xmm3, %xmm3
0000000000092fd3	xorl	%esi, %esi
0000000000092fd5	addq	$0x18, %rsp
0000000000092fd9	popq	%rbx
0000000000092fda	popq	%rbp
0000000000092fdb	jmpq	*%rax
0000000000092fdd	nopl	(%rax)
