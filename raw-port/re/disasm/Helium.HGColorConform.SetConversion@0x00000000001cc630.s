__ZN14HGColorConform13SetConversionEN12HGColorGamma26hgColorGammaColorPrimariesENS0_28hgColorGammaTransferFunctionENS0_30hgColorGammaMatrixCoefficientsES1_S2_S3_:
00000000001cc630	pushq	%rbp
00000000001cc631	movq	%rsp, %rbp
00000000001cc634	pushq	%r15
00000000001cc636	pushq	%r14
00000000001cc638	pushq	%r13
00000000001cc63a	pushq	%r12
00000000001cc63c	pushq	%rbx
00000000001cc63d	pushq	%rax
00000000001cc63e	movl	%r8d, %r15d
00000000001cc641	movl	%ecx, %r12d
00000000001cc644	movl	%edx, %r13d
00000000001cc647	movl	%esi, %r14d
00000000001cc64a	movq	%rdi, %rbx
00000000001cc64d	movl	0x10(%rbp), %r10d
00000000001cc651	cmpl	$0x1, 0x1e4(%rdi)
00000000001cc658	jne	0x1cc696
00000000001cc65a	cmpl	%r14d, 0x1e8(%rbx)
00000000001cc661	jne	0x1cc696
00000000001cc663	cmpl	%r13d, 0x1f0(%rbx)
00000000001cc66a	jne	0x1cc696
00000000001cc66c	cmpl	%r12d, 0x1f8(%rbx)
00000000001cc673	jne	0x1cc696
00000000001cc675	cmpl	%r15d, 0x1ec(%rbx)
00000000001cc67c	jne	0x1cc696
00000000001cc67e	cmpl	%r9d, 0x1f4(%rbx)
00000000001cc685	jne	0x1cc696
00000000001cc687	movb	$0x1, %al
00000000001cc689	cmpl	%r10d, 0x1fc(%rbx)
00000000001cc690	je	0x1cc766
00000000001cc696	movl	%r14d, %edi
00000000001cc699	movl	%r13d, %esi
00000000001cc69c	movl	%r12d, %edx
00000000001cc69f	movl	%r15d, %ecx
00000000001cc6a2	movl	%r9d, %r8d
00000000001cc6a5	movl	%r9d, -0x2c(%rbp)
00000000001cc6a9	movl	%r10d, %r9d
00000000001cc6ac	callq	__ZN12HGColorGamma14TestConversionENS_26hgColorGammaColorPrimariesENS_28hgColorGammaTransferFunctionENS_30hgColorGammaMatrixCoefficientsES0_S1_S2_ ## HGColorGamma::TestConversion(HGColorGamma::hgColorGammaColorPrimaries, HGColorGamma::hgColorGammaTransferFunction, HGColorGamma::hgColorGammaMatrixCoefficients, HGColorGamma::hgColorGammaColorPrimaries, HGColorGamma::hgColorGammaTransferFunction, HGColorGamma::hgColorGammaMatrixCoefficients)
00000000001cc6b1	testb	%al, %al
00000000001cc6b3	je	0x1cc701
00000000001cc6b5	movq	%rbx, %rdi
00000000001cc6b8	callq	__ZN6HGNode9ClearBitsEv         ## HGNode::ClearBits()
00000000001cc6bd	movl	$0x1, 0x1e4(%rbx)
00000000001cc6c7	movq	%rbx, %rdi
00000000001cc6ca	callq	__ZN14HGColorConform21ClearConversionParamsEv ## HGColorConform::ClearConversionParams()
00000000001cc6cf	movl	%r14d, 0x1e8(%rbx)
00000000001cc6d6	movl	%r13d, 0x1f0(%rbx)
00000000001cc6dd	movl	%r12d, 0x1f8(%rbx)
00000000001cc6e4	movl	%r15d, 0x1ec(%rbx)
00000000001cc6eb	movl	-0x2c(%rbp), %eax
00000000001cc6ee	movl	%eax, 0x1f4(%rbx)
00000000001cc6f4	movl	0x10(%rbp), %eax
00000000001cc6f7	movl	%eax, 0x1fc(%rbx)
00000000001cc6fd	movb	$0x1, %al
00000000001cc6ff	jmp	0x1cc766
00000000001cc701	movl	%r14d, %edi
00000000001cc704	movl	%r13d, %esi
00000000001cc707	movl	%r12d, %edx
00000000001cc70a	movl	%r15d, %ecx
00000000001cc70d	movl	$0x8, %r8d
00000000001cc713	xorl	%r9d, %r9d
00000000001cc716	callq	__ZN12HGColorGamma14TestConversionENS_26hgColorGammaColorPrimariesENS_28hgColorGammaTransferFunctionENS_30hgColorGammaMatrixCoefficientsES0_S1_S2_ ## HGColorGamma::TestConversion(HGColorGamma::hgColorGammaColorPrimaries, HGColorGamma::hgColorGammaTransferFunction, HGColorGamma::hgColorGammaMatrixCoefficients, HGColorGamma::hgColorGammaColorPrimaries, HGColorGamma::hgColorGammaTransferFunction, HGColorGamma::hgColorGammaMatrixCoefficients)
00000000001cc71b	testb	%al, %al
00000000001cc71d	je	0x1cc741
00000000001cc71f	movl	%r15d, %edi
00000000001cc722	movl	$0x8, %esi
00000000001cc727	xorl	%edx, %edx
00000000001cc729	movl	%r15d, %ecx
00000000001cc72c	movl	-0x2c(%rbp), %r8d
00000000001cc730	movl	0x10(%rbp), %r9d
00000000001cc734	callq	__ZN12HGColorGamma14TestConversionENS_26hgColorGammaColorPrimariesENS_28hgColorGammaTransferFunctionENS_30hgColorGammaMatrixCoefficientsES0_S1_S2_ ## HGColorGamma::TestConversion(HGColorGamma::hgColorGammaColorPrimaries, HGColorGamma::hgColorGammaTransferFunction, HGColorGamma::hgColorGammaMatrixCoefficients, HGColorGamma::hgColorGammaColorPrimaries, HGColorGamma::hgColorGammaTransferFunction, HGColorGamma::hgColorGammaMatrixCoefficients)
00000000001cc739	testb	%al, %al
00000000001cc73b	jne	0x1cc6b5
00000000001cc741	cmpl	$0x0, 0x1e4(%rbx)
00000000001cc748	je	0x1cc764
00000000001cc74a	movq	%rbx, %rdi
00000000001cc74d	callq	__ZN6HGNode9ClearBitsEv         ## HGNode::ClearBits()
00000000001cc752	movl	$0x0, 0x1e4(%rbx)
00000000001cc75c	movq	%rbx, %rdi
00000000001cc75f	callq	__ZN14HGColorConform21ClearConversionParamsEv ## HGColorConform::ClearConversionParams()
00000000001cc764	xorl	%eax, %eax
00000000001cc766	addq	$0x8, %rsp
00000000001cc76a	popq	%rbx
00000000001cc76b	popq	%r12
00000000001cc76d	popq	%r13
00000000001cc76f	popq	%r14
00000000001cc771	popq	%r15
00000000001cc773	popq	%rbp
00000000001cc774	retq
00000000001cc775	nopw	%cs:(%rax,%rax)
