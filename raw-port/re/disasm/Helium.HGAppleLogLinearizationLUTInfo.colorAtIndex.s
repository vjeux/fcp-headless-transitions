__ZNK30HGAppleLogLinearizationLUTInfo12colorAtIndexEfffPfS0_S0_S0_:
0000000000114ab0	pushq	%rbp
0000000000114ab1	movq	%rsp, %rbp
0000000000114ab4	pushq	%r15
0000000000114ab6	pushq	%r14
0000000000114ab8	pushq	%r12
0000000000114aba	pushq	%rbx
0000000000114abb	subq	$0x10, %rsp
0000000000114abf	movq	%r8, %rbx
0000000000114ac2	movq	%rcx, %r14
0000000000114ac5	movq	%rdx, %r15
0000000000114ac8	movq	%rsi, %r12
0000000000114acb	movaps	%xmm0, %xmm2
0000000000114ace	movzbl	__ZGVZNK30HGAppleLogLinearizationLUTInfo12colorAtIndexEfffPfS0_S0_S0_E2tl(%rip), %eax ## guard variable for HGAppleLogLinearizationLUTInfo::colorAtIndex(float, float, float, float*, float*, float*, float*) const::tl
0000000000114ad5	testb	%al, %al
0000000000114ad7	je	0x114b25
0000000000114ad9	movzbl	__ZGVZNK30HGAppleLogLinearizationLUTInfo12colorAtIndexEfffPfS0_S0_S0_E2gg(%rip), %eax ## guard variable for HGAppleLogLinearizationLUTInfo::colorAtIndex(float, float, float, float*, float*, float*, float*) const::gg
0000000000114ae0	testb	%al, %al
0000000000114ae2	je	0x114b3f
0000000000114ae4	xorps	%xmm0, %xmm0
0000000000114ae7	xorps	%xmm1, %xmm1
0000000000114aea	ucomiss	%xmm2, %xmm1
0000000000114aed	jbe	0x114b59
0000000000114aef	ucomisd	__ZZNK30HGAppleLogLinearizationLUTInfo12colorAtIndexEfffPfS0_S0_S0_E2tl(%rip), %xmm0 ## HGAppleLogLinearizationLUTInfo::colorAtIndex(float, float, float, float*, float*, float*, float*) const::tl
0000000000114af7	jae	0x114b74
0000000000114af9	xorps	%xmm1, %xmm1
0000000000114afc	ucomisd	%xmm1, %xmm0
0000000000114b00	jae	0x114b0f
0000000000114b02	movsd	0x2c0106(%rip), %xmm0
0000000000114b0a	jmp	0x114b91
0000000000114b0f	divsd	0x2c0101(%rip), %xmm0
0000000000114b17	sqrtsd	%xmm0, %xmm0
0000000000114b1b	addsd	0x2c00ed(%rip), %xmm0
0000000000114b23	jmp	0x114b91
0000000000114b25	movss	%xmm2, -0x24(%rbp)
0000000000114b2a	callq	__ZNK30HGAppleLogLinearizationLUTInfo12colorAtIndexEfffPfS0_S0_S0_.cold.1 ## HGAppleLogLinearizationLUTInfo::colorAtIndex(float, float, float, float*, float*, float*, float*) const (.cold.1)
0000000000114b2f	movss	-0x24(%rbp), %xmm2
0000000000114b34	movzbl	__ZGVZNK30HGAppleLogLinearizationLUTInfo12colorAtIndexEfffPfS0_S0_S0_E2gg(%rip), %eax ## guard variable for HGAppleLogLinearizationLUTInfo::colorAtIndex(float, float, float, float*, float*, float*, float*) const::gg
0000000000114b3b	testb	%al, %al
0000000000114b3d	jne	0x114ae4
0000000000114b3f	movss	%xmm2, -0x24(%rbp)
0000000000114b44	callq	__ZNK30HGAppleLogLinearizationLUTInfo12colorAtIndexEfffPfS0_S0_S0_.cold.2 ## HGAppleLogLinearizationLUTInfo::colorAtIndex(float, float, float, float*, float*, float*, float*) const (.cold.2)
0000000000114b49	movss	-0x24(%rbp), %xmm2
0000000000114b4e	xorps	%xmm0, %xmm0
0000000000114b51	xorps	%xmm1, %xmm1
0000000000114b54	ucomiss	%xmm2, %xmm1
0000000000114b57	ja	0x114aef
0000000000114b59	ucomiss	0x2b3160(%rip), %xmm2
0000000000114b60	jbe	0x114bc0
0000000000114b62	movsd	0x2b56f6(%rip), %xmm0
0000000000114b6a	ucomisd	__ZZNK30HGAppleLogLinearizationLUTInfo12colorAtIndexEfffPfS0_S0_S0_E2tl(%rip), %xmm0 ## HGAppleLogLinearizationLUTInfo::colorAtIndex(float, float, float, float*, float*, float*, float*) const::tl
0000000000114b72	jb	0x114af9
0000000000114b74	addsd	0x2c0084(%rip), %xmm0
0000000000114b7c	mulsd	__ZZNK30HGAppleLogLinearizationLUTInfo12colorAtIndexEfffPfS0_S0_S0_E2gg(%rip), %xmm0 ## HGAppleLogLinearizationLUTInfo::colorAtIndex(float, float, float, float*, float*, float*, float*) const::gg
0000000000114b84	callq	0x3c50ea                        ## symbol stub for: _exp
0000000000114b89	addsd	0x2c0077(%rip), %xmm0
0000000000114b91	divsd	0x2bc2b7(%rip), %xmm0
0000000000114b99	cvtsd2ss	%xmm0, %xmm0
0000000000114b9d	movss	%xmm0, (%r12)
0000000000114ba3	movss	%xmm0, (%r15)
0000000000114ba8	movss	%xmm0, (%r14)
0000000000114bad	movl	$0x3f800000, (%rbx)             ## imm = 0x3F800000
0000000000114bb3	addq	$0x10, %rsp
0000000000114bb7	popq	%rbx
0000000000114bb8	popq	%r12
0000000000114bba	popq	%r14
0000000000114bbc	popq	%r15
0000000000114bbe	popq	%rbp
0000000000114bbf	retq
0000000000114bc0	xorps	%xmm0, %xmm0
0000000000114bc3	cvtss2sd	%xmm2, %xmm0
0000000000114bc7	ucomisd	__ZZNK30HGAppleLogLinearizationLUTInfo12colorAtIndexEfffPfS0_S0_S0_E2tl(%rip), %xmm0 ## HGAppleLogLinearizationLUTInfo::colorAtIndex(float, float, float, float*, float*, float*, float*) const::tl
0000000000114bcf	jb	0x114af9
0000000000114bd5	jmp	0x114b74
0000000000114bd7	nopw	(%rax,%rax)
