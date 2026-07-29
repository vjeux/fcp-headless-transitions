__ZN14HGColorConform22SetLook3DLutConversionEP23HGColorConformLook3DLUTN12HGColorGamma30hgColorGammaMatrixCoefficientsENS2_26hgColorGammaColorPrimariesE:
00000000001c9850	pushq	%rbp
00000000001c9851	movq	%rsp, %rbp
00000000001c9854	pushq	%r15
00000000001c9856	pushq	%r14
00000000001c9858	pushq	%r12
00000000001c985a	pushq	%rbx
00000000001c985b	movl	%ecx, %ebx
00000000001c985d	movl	%edx, %r14d
00000000001c9860	movq	%rsi, %r12
00000000001c9863	movq	%rdi, %r15
00000000001c9866	callq	__ZN6HGNode9ClearBitsEv         ## HGNode::ClearBits()
00000000001c986b	movl	$0x5, 0x1e4(%r15)
00000000001c9876	movq	%r15, %rdi
00000000001c9879	callq	__ZN14HGColorConform21ClearConversionParamsEv ## HGColorConform::ClearConversionParams()
00000000001c987e	movq	0x218(%r15), %rdi
00000000001c9885	cmpq	%r12, %rdi
00000000001c9888	je	0x1c98ab
00000000001c988a	testq	%rdi, %rdi
00000000001c988d	je	0x1c9895
00000000001c988f	movq	(%rdi), %rax
00000000001c9892	callq	*0x18(%rax)
00000000001c9895	movq	%r12, 0x218(%r15)
00000000001c989c	testq	%r12, %r12
00000000001c989f	je	0x1c98ab
00000000001c98a1	movq	(%r12), %rax
00000000001c98a5	movq	%r12, %rdi
00000000001c98a8	callq	*0x10(%rax)
00000000001c98ab	movl	%r14d, 0x220(%r15)
00000000001c98b2	movl	%ebx, 0x224(%r15)
00000000001c98b9	movb	$0x1, %al
00000000001c98bb	popq	%rbx
00000000001c98bc	popq	%r12
00000000001c98be	popq	%r14
00000000001c98c0	popq	%r15
00000000001c98c2	popq	%rbp
00000000001c98c3	retq
00000000001c98c4	nopw	%cs:(%rax,%rax)
