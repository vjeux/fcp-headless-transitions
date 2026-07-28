__ZNK34HGFujifilmFLogLinearizationLUTInfo12colorAtIndexEfffPfS0_S0_S0_:
0000000000114e00	pushq	%rbp
0000000000114e01	movq	%rsp, %rbp
0000000000114e04	pushq	%r15
0000000000114e06	pushq	%r14
0000000000114e08	pushq	%r12
0000000000114e0a	pushq	%rbx
0000000000114e0b	subq	$0x10, %rsp
0000000000114e0f	movq	%r8, %rbx
0000000000114e12	movq	%rcx, %r14
0000000000114e15	movq	%rdx, %r15
0000000000114e18	movq	%rsi, %r12
0000000000114e1b	movaps	%xmm0, %xmm2
0000000000114e1e	movzbl	__ZGVZNK34HGFujifilmFLogLinearizationLUTInfo12colorAtIndexEfffPfS0_S0_S0_E4cut2(%rip), %eax ## guard variable for HGFujifilmFLogLinearizationLUTInfo::colorAtIndex(float, float, float, float*, float*, float*, float*) const::cut2
0000000000114e25	testb	%al, %al
0000000000114e27	je	0x114e5b
0000000000114e29	movzbl	__ZGVZNK34HGFujifilmFLogLinearizationLUTInfo12colorAtIndexEfffPfS0_S0_S0_E2cc(%rip), %eax ## guard variable for HGFujifilmFLogLinearizationLUTInfo::colorAtIndex(float, float, float, float*, float*, float*, float*) const::cc
0000000000114e30	testb	%al, %al
0000000000114e32	je	0x114e75
0000000000114e34	xorps	%xmm0, %xmm0
0000000000114e37	xorps	%xmm1, %xmm1
0000000000114e3a	ucomiss	%xmm2, %xmm1
0000000000114e3d	jbe	0x114e8f
0000000000114e3f	ucomisd	__ZZNK34HGFujifilmFLogLinearizationLUTInfo12colorAtIndexEfffPfS0_S0_S0_E4cut2(%rip), %xmm0 ## HGFujifilmFLogLinearizationLUTInfo::colorAtIndex(float, float, float, float*, float*, float*, float*) const::cut2
0000000000114e47	jae	0x114eaa
0000000000114e49	addsd	0x2bfe0f(%rip), %xmm0
0000000000114e51	divsd	0x2bfe0f(%rip), %xmm0
0000000000114e59	jmp	0x114ecf
0000000000114e5b	movss	%xmm2, -0x24(%rbp)
0000000000114e60	callq	__ZNK34HGFujifilmFLogLinearizationLUTInfo12colorAtIndexEfffPfS0_S0_S0_.cold.1 ## HGFujifilmFLogLinearizationLUTInfo::colorAtIndex(float, float, float, float*, float*, float*, float*) const (.cold.1)
0000000000114e65	movss	-0x24(%rbp), %xmm2
0000000000114e6a	movzbl	__ZGVZNK34HGFujifilmFLogLinearizationLUTInfo12colorAtIndexEfffPfS0_S0_S0_E2cc(%rip), %eax ## guard variable for HGFujifilmFLogLinearizationLUTInfo::colorAtIndex(float, float, float, float*, float*, float*, float*) const::cc
0000000000114e71	testb	%al, %al
0000000000114e73	jne	0x114e34
0000000000114e75	movss	%xmm2, -0x24(%rbp)
0000000000114e7a	callq	__ZNK34HGFujifilmFLogLinearizationLUTInfo12colorAtIndexEfffPfS0_S0_S0_.cold.2 ## HGFujifilmFLogLinearizationLUTInfo::colorAtIndex(float, float, float, float*, float*, float*, float*) const (.cold.2)
0000000000114e7f	movss	-0x24(%rbp), %xmm2
0000000000114e84	xorps	%xmm0, %xmm0
0000000000114e87	xorps	%xmm1, %xmm1
0000000000114e8a	ucomiss	%xmm2, %xmm1
0000000000114e8d	ja	0x114e3f
0000000000114e8f	ucomiss	0x2b2e2a(%rip), %xmm2
0000000000114e96	jbe	0x114efe
0000000000114e98	movsd	0x2b53c0(%rip), %xmm0
0000000000114ea0	ucomisd	__ZZNK34HGFujifilmFLogLinearizationLUTInfo12colorAtIndexEfffPfS0_S0_S0_E4cut2(%rip), %xmm0 ## HGFujifilmFLogLinearizationLUTInfo::colorAtIndex(float, float, float, float*, float*, float*, float*) const::cut2
0000000000114ea8	jb	0x114e49
0000000000114eaa	addsd	0x2bfd96(%rip), %xmm0
0000000000114eb2	mulsd	__ZZNK34HGFujifilmFLogLinearizationLUTInfo12colorAtIndexEfffPfS0_S0_S0_E2cc(%rip), %xmm0 ## HGFujifilmFLogLinearizationLUTInfo::colorAtIndex(float, float, float, float*, float*, float*, float*) const::cc
0000000000114eba	callq	0x3c50ea                        ## symbol stub for: _exp
0000000000114ebf	addsd	0x2bfd89(%rip), %xmm0
0000000000114ec7	divsd	0x2bfd89(%rip), %xmm0
0000000000114ecf	divsd	0x2bbf79(%rip), %xmm0
0000000000114ed7	cvtsd2ss	%xmm0, %xmm0
0000000000114edb	movss	%xmm0, (%r12)
0000000000114ee1	movss	%xmm0, (%r15)
0000000000114ee6	movss	%xmm0, (%r14)
0000000000114eeb	movl	$0x3f800000, (%rbx)             ## imm = 0x3F800000
0000000000114ef1	addq	$0x10, %rsp
0000000000114ef5	popq	%rbx
0000000000114ef6	popq	%r12
0000000000114ef8	popq	%r14
0000000000114efa	popq	%r15
0000000000114efc	popq	%rbp
0000000000114efd	retq
0000000000114efe	xorps	%xmm0, %xmm0
0000000000114f01	cvtss2sd	%xmm2, %xmm0
0000000000114f05	ucomisd	__ZZNK34HGFujifilmFLogLinearizationLUTInfo12colorAtIndexEfffPfS0_S0_S0_E4cut2(%rip), %xmm0 ## HGFujifilmFLogLinearizationLUTInfo::colorAtIndex(float, float, float, float*, float*, float*, float*) const::cut2
0000000000114f0d	jb	0x114e49
0000000000114f13	jmp	0x114eaa
0000000000114f15	nopw	%cs:(%rax,%rax)
