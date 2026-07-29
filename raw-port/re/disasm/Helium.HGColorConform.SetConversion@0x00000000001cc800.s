__ZN14HGColorConform13SetConversionEN12HGColorGamma30hgColorGammaMatrixCoefficientsENS_30hgColorConformLogLinearizationENS0_20hgColorGammaLogGamutENS0_26hgColorGammaColorPrimariesE:
00000000001cc800	pushq	%rbp
00000000001cc801	movq	%rsp, %rbp
00000000001cc804	pushq	%r15
00000000001cc806	pushq	%r14
00000000001cc808	pushq	%r13
00000000001cc80a	pushq	%r12
00000000001cc80c	pushq	%rbx
00000000001cc80d	pushq	%rax
00000000001cc80e	movl	%ecx, %ebx
00000000001cc810	movl	%edx, %r15d
00000000001cc813	movl	%esi, %r12d
00000000001cc816	movq	%rdi, %r14
00000000001cc819	xorl	%eax, %eax
00000000001cc81b	testl	%r8d, %r8d
00000000001cc81e	setne	%al
00000000001cc821	leal	(%rax,%rax,2), %r13d
00000000001cc825	cmpl	$0x3, 0x1e4(%rdi)
00000000001cc82c	jne	0x1cc852
00000000001cc82e	cmpl	%r12d, 0x200(%r14)
00000000001cc835	jne	0x1cc852
00000000001cc837	cmpl	%r15d, 0x208(%r14)
00000000001cc83e	jne	0x1cc852
00000000001cc840	cmpl	%ebx, 0x20c(%r14)
00000000001cc847	jne	0x1cc852
00000000001cc849	cmpl	%r13d, 0x210(%r14)
00000000001cc850	je	0x1cc889
00000000001cc852	movq	%r14, %rdi
00000000001cc855	callq	__ZN6HGNode9ClearBitsEv         ## HGNode::ClearBits()
00000000001cc85a	movl	$0x3, 0x1e4(%r14)
00000000001cc865	movq	%r14, %rdi
00000000001cc868	callq	__ZN14HGColorConform21ClearConversionParamsEv ## HGColorConform::ClearConversionParams()
00000000001cc86d	movl	%r12d, 0x200(%r14)
00000000001cc874	movl	%r15d, 0x208(%r14)
00000000001cc87b	movl	%ebx, 0x20c(%r14)
00000000001cc882	movl	%r13d, 0x210(%r14)
00000000001cc889	movb	$0x1, %al
00000000001cc88b	addq	$0x8, %rsp
00000000001cc88f	popq	%rbx
00000000001cc890	popq	%r12
00000000001cc892	popq	%r13
00000000001cc894	popq	%r14
00000000001cc896	popq	%r15
00000000001cc898	popq	%rbp
00000000001cc899	retq
00000000001cc89a	nopw	(%rax,%rax)
