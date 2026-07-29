__ZN14HGColorConform13SetConversionEN12HGColorGamma30hgColorGammaMatrixCoefficientsENS_27hgColorConformLogConversionENS0_26hgColorGammaColorPrimariesE:
00000000001cc780	pushq	%rbp
00000000001cc781	movq	%rsp, %rbp
00000000001cc784	pushq	%r15
00000000001cc786	pushq	%r14
00000000001cc788	pushq	%r12
00000000001cc78a	pushq	%rbx
00000000001cc78b	movl	%ecx, %ebx
00000000001cc78d	movl	%edx, %r14d
00000000001cc790	movl	%esi, %r12d
00000000001cc793	movq	%rdi, %r15
00000000001cc796	cmpl	$0x2, 0x1e4(%rdi)
00000000001cc79d	jne	0x1cc7ba
00000000001cc79f	cmpl	%r12d, 0x200(%r15)
00000000001cc7a6	jne	0x1cc7ba
00000000001cc7a8	cmpl	%r14d, 0x204(%r15)
00000000001cc7af	jne	0x1cc7ba
00000000001cc7b1	cmpl	%ebx, 0x210(%r15)
00000000001cc7b8	je	0x1cc7ea
00000000001cc7ba	movq	%r15, %rdi
00000000001cc7bd	callq	__ZN6HGNode9ClearBitsEv         ## HGNode::ClearBits()
00000000001cc7c2	movl	$0x2, 0x1e4(%r15)
00000000001cc7cd	movq	%r15, %rdi
00000000001cc7d0	callq	__ZN14HGColorConform21ClearConversionParamsEv ## HGColorConform::ClearConversionParams()
00000000001cc7d5	movl	%r12d, 0x200(%r15)
00000000001cc7dc	movl	%r14d, 0x204(%r15)
00000000001cc7e3	movl	%ebx, 0x210(%r15)
00000000001cc7ea	movb	$0x1, %al
00000000001cc7ec	popq	%rbx
00000000001cc7ed	popq	%r12
00000000001cc7ef	popq	%r14
00000000001cc7f1	popq	%r15
00000000001cc7f3	popq	%rbp
00000000001cc7f4	retq
00000000001cc7f5	nopw	%cs:(%rax,%rax)
