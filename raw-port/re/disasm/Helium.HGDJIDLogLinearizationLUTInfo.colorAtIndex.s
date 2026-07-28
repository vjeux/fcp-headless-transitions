__ZNK29HGDJIDLogLinearizationLUTInfo12colorAtIndexEfffPfS0_S0_S0_:
0000000000114c60	pushq	%rbp
0000000000114c61	movq	%rsp, %rbp
0000000000114c64	pushq	%r15
0000000000114c66	pushq	%r14
0000000000114c68	pushq	%r12
0000000000114c6a	pushq	%rbx
0000000000114c6b	subq	$0x10, %rsp
0000000000114c6f	movq	%r8, %rbx
0000000000114c72	movq	%rcx, %r14
0000000000114c75	movq	%rdx, %r15
0000000000114c78	movq	%rsi, %r12
0000000000114c7b	movaps	%xmm0, %xmm2
0000000000114c7e	movzbl	__ZGVZNK29HGDJIDLogLinearizationLUTInfo12colorAtIndexEfffPfS0_S0_S0_E2tl(%rip), %eax ## guard variable for HGDJIDLogLinearizationLUTInfo::colorAtIndex(float, float, float, float*, float*, float*, float*) const::tl
0000000000114c85	testb	%al, %al
0000000000114c87	je	0x114cd0
0000000000114c89	movzbl	__ZGVZNK29HGDJIDLogLinearizationLUTInfo12colorAtIndexEfffPfS0_S0_S0_E2cc(%rip), %eax ## guard variable for HGDJIDLogLinearizationLUTInfo::colorAtIndex(float, float, float, float*, float*, float*, float*) const::cc
0000000000114c90	testb	%al, %al
0000000000114c92	je	0x114cea
0000000000114c94	xorps	%xmm0, %xmm0
0000000000114c97	xorps	%xmm1, %xmm1
0000000000114c9a	ucomiss	%xmm2, %xmm1
0000000000114c9d	jbe	0x114d04
0000000000114c9f	ucomisd	__ZZNK29HGDJIDLogLinearizationLUTInfo12colorAtIndexEfffPfS0_S0_S0_E2tl(%rip), %xmm0 ## HGDJIDLogLinearizationLUTInfo::colorAtIndex(float, float, float, float*, float*, float*, float*) const::tl
0000000000114ca7	jbe	0x114d1f
0000000000114ca9	addsd	0x2bff7f(%rip), %xmm0
0000000000114cb1	mulsd	__ZZNK29HGDJIDLogLinearizationLUTInfo12colorAtIndexEfffPfS0_S0_S0_E2cc(%rip), %xmm0 ## HGDJIDLogLinearizationLUTInfo::colorAtIndex(float, float, float, float*, float*, float*, float*) const::cc
0000000000114cb9	callq	0x3c50ea                        ## symbol stub for: _exp
0000000000114cbe	addsd	0x2bff72(%rip), %xmm0
0000000000114cc6	divsd	0x2bff72(%rip), %xmm0
0000000000114cce	jmp	0x114d2f
0000000000114cd0	movss	%xmm2, -0x24(%rbp)
0000000000114cd5	callq	__ZNK29HGDJIDLogLinearizationLUTInfo12colorAtIndexEfffPfS0_S0_S0_.cold.1 ## HGDJIDLogLinearizationLUTInfo::colorAtIndex(float, float, float, float*, float*, float*, float*) const (.cold.1)
0000000000114cda	movss	-0x24(%rbp), %xmm2
0000000000114cdf	movzbl	__ZGVZNK29HGDJIDLogLinearizationLUTInfo12colorAtIndexEfffPfS0_S0_S0_E2cc(%rip), %eax ## guard variable for HGDJIDLogLinearizationLUTInfo::colorAtIndex(float, float, float, float*, float*, float*, float*) const::cc
0000000000114ce6	testb	%al, %al
0000000000114ce8	jne	0x114c94
0000000000114cea	movss	%xmm2, -0x24(%rbp)
0000000000114cef	callq	__ZNK29HGDJIDLogLinearizationLUTInfo12colorAtIndexEfffPfS0_S0_S0_.cold.2 ## HGDJIDLogLinearizationLUTInfo::colorAtIndex(float, float, float, float*, float*, float*, float*) const (.cold.2)
0000000000114cf4	movss	-0x24(%rbp), %xmm2
0000000000114cf9	xorps	%xmm0, %xmm0
0000000000114cfc	xorps	%xmm1, %xmm1
0000000000114cff	ucomiss	%xmm2, %xmm1
0000000000114d02	ja	0x114c9f
0000000000114d04	ucomiss	0x2b2fb5(%rip), %xmm2
0000000000114d0b	jbe	0x114d5e
0000000000114d0d	movsd	0x2b554b(%rip), %xmm0
0000000000114d15	ucomisd	__ZZNK29HGDJIDLogLinearizationLUTInfo12colorAtIndexEfffPfS0_S0_S0_E2tl(%rip), %xmm0 ## HGDJIDLogLinearizationLUTInfo::colorAtIndex(float, float, float, float*, float*, float*, float*) const::tl
0000000000114d1d	ja	0x114ca9
0000000000114d1f	addsd	0x2bfef9(%rip), %xmm0
0000000000114d27	divsd	0x2bfef9(%rip), %xmm0
0000000000114d2f	divsd	0x2bc119(%rip), %xmm0
0000000000114d37	cvtsd2ss	%xmm0, %xmm0
0000000000114d3b	movss	%xmm0, (%r12)
0000000000114d41	movss	%xmm0, (%r15)
0000000000114d46	movss	%xmm0, (%r14)
0000000000114d4b	movl	$0x3f800000, (%rbx)             ## imm = 0x3F800000
0000000000114d51	addq	$0x10, %rsp
0000000000114d55	popq	%rbx
0000000000114d56	popq	%r12
0000000000114d58	popq	%r14
0000000000114d5a	popq	%r15
0000000000114d5c	popq	%rbp
0000000000114d5d	retq
0000000000114d5e	xorps	%xmm0, %xmm0
0000000000114d61	cvtss2sd	%xmm2, %xmm0
0000000000114d65	ucomisd	__ZZNK29HGDJIDLogLinearizationLUTInfo12colorAtIndexEfffPfS0_S0_S0_E2tl(%rip), %xmm0 ## HGDJIDLogLinearizationLUTInfo::colorAtIndex(float, float, float, float*, float*, float*, float*) const::tl
0000000000114d6d	ja	0x114ca9
0000000000114d73	jmp	0x114d1f
0000000000114d75	nopw	%cs:(%rax,%rax)
