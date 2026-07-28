__ZNK31HGNikonNLogLinearizationLUTInfo12colorAtIndexEfffPfS0_S0_S0_:
0000000000114560	pushq	%rbp
0000000000114561	movq	%rsp, %rbp
0000000000114564	pushq	%r15
0000000000114566	pushq	%r14
0000000000114568	pushq	%r12
000000000011456a	pushq	%rbx
000000000011456b	subq	$0x10, %rsp
000000000011456f	movq	%r8, %rbx
0000000000114572	movq	%rcx, %r14
0000000000114575	movq	%rdx, %r15
0000000000114578	movq	%rsi, %r12
000000000011457b	movaps	%xmm0, %xmm2
000000000011457e	movzbl	__ZGVZNK31HGNikonNLogLinearizationLUTInfo12colorAtIndexEfffPfS0_S0_S0_E2tl(%rip), %eax ## guard variable for HGNikonNLogLinearizationLUTInfo::colorAtIndex(float, float, float, float*, float*, float*, float*) const::tl
0000000000114585	testb	%al, %al
0000000000114587	je	0x1145c4
0000000000114589	xorps	%xmm0, %xmm0
000000000011458c	xorps	%xmm1, %xmm1
000000000011458f	ucomiss	%xmm2, %xmm1
0000000000114592	jbe	0x1145de
0000000000114594	movsd	__ZZNK31HGNikonNLogLinearizationLUTInfo12colorAtIndexEfffPfS0_S0_S0_E2tl(%rip), %xmm1 ## HGNikonNLogLinearizationLUTInfo::colorAtIndex(float, float, float, float*, float*, float*, float*) const::tl
000000000011459c	ucomisd	%xmm0, %xmm1
00000000001145a0	jbe	0x1145fd
00000000001145a2	divsd	0x2c05e6(%rip), %xmm0
00000000001145aa	movapd	%xmm0, %xmm1
00000000001145ae	mulsd	%xmm0, %xmm1
00000000001145b2	mulsd	%xmm0, %xmm1
00000000001145b6	movapd	%xmm1, %xmm0
00000000001145ba	addsd	0x2c05d6(%rip), %xmm0
00000000001145c2	jmp	0x114612
00000000001145c4	movss	%xmm2, -0x24(%rbp)
00000000001145c9	callq	__ZNK31HGNikonNLogLinearizationLUTInfo12colorAtIndexEfffPfS0_S0_S0_.cold.1 ## HGNikonNLogLinearizationLUTInfo::colorAtIndex(float, float, float, float*, float*, float*, float*) const (.cold.1)
00000000001145ce	movss	-0x24(%rbp), %xmm2
00000000001145d3	xorps	%xmm0, %xmm0
00000000001145d6	xorps	%xmm1, %xmm1
00000000001145d9	ucomiss	%xmm2, %xmm1
00000000001145dc	ja	0x114594
00000000001145de	ucomiss	0x2b36db(%rip), %xmm2
00000000001145e5	jbe	0x114641
00000000001145e7	movsd	0x2b5c71(%rip), %xmm0
00000000001145ef	movsd	__ZZNK31HGNikonNLogLinearizationLUTInfo12colorAtIndexEfffPfS0_S0_S0_E2tl(%rip), %xmm1 ## HGNikonNLogLinearizationLUTInfo::colorAtIndex(float, float, float, float*, float*, float*, float*) const::tl
00000000001145f7	ucomisd	%xmm0, %xmm1
00000000001145fb	ja	0x1145a2
00000000001145fd	addsd	0x2c057b(%rip), %xmm0
0000000000114605	divsd	0x2c057b(%rip), %xmm0
000000000011460d	callq	0x3c50ea                        ## symbol stub for: _exp
0000000000114612	divsd	0x2bc836(%rip), %xmm0
000000000011461a	cvtsd2ss	%xmm0, %xmm0
000000000011461e	movss	%xmm0, (%r12)
0000000000114624	movss	%xmm0, (%r15)
0000000000114629	movss	%xmm0, (%r14)
000000000011462e	movl	$0x3f800000, (%rbx)             ## imm = 0x3F800000
0000000000114634	addq	$0x10, %rsp
0000000000114638	popq	%rbx
0000000000114639	popq	%r12
000000000011463b	popq	%r14
000000000011463d	popq	%r15
000000000011463f	popq	%rbp
0000000000114640	retq
0000000000114641	xorps	%xmm0, %xmm0
0000000000114644	cvtss2sd	%xmm2, %xmm0
0000000000114648	movsd	__ZZNK31HGNikonNLogLinearizationLUTInfo12colorAtIndexEfffPfS0_S0_S0_E2tl(%rip), %xmm1 ## HGNikonNLogLinearizationLUTInfo::colorAtIndex(float, float, float, float*, float*, float*, float*) const::tl
0000000000114650	ucomisd	%xmm0, %xmm1
0000000000114654	ja	0x1145a2
000000000011465a	jmp	0x1145fd
000000000011465c	nopl	(%rax)
