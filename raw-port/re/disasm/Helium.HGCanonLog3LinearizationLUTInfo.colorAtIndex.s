__ZNK31HGCanonLog3LinearizationLUTInfo12colorAtIndexEfffPfS0_S0_S0_:
0000000000113e60	pushq	%rbp
0000000000113e61	movq	%rsp, %rbp
0000000000113e64	pushq	%r15
0000000000113e66	pushq	%r14
0000000000113e68	pushq	%r12
0000000000113e6a	pushq	%rbx
0000000000113e6b	subq	$0x10, %rsp
0000000000113e6f	movq	%r8, %rbx
0000000000113e72	movq	%rcx, %r14
0000000000113e75	movq	%rdx, %r15
0000000000113e78	movq	%rsi, %r12
0000000000113e7b	movzbl	__ZGVZNK31HGCanonLog3LinearizationLUTInfo12colorAtIndexEfffPfS0_S0_S0_E2t1(%rip), %eax ## guard variable for HGCanonLog3LinearizationLUTInfo::colorAtIndex(float, float, float, float*, float*, float*, float*) const::t1
0000000000113e82	testb	%al, %al
0000000000113e84	je	0x113f79
0000000000113e8a	movzbl	__ZGVZNK31HGCanonLog3LinearizationLUTInfo12colorAtIndexEfffPfS0_S0_S0_E2t2(%rip), %eax ## guard variable for HGCanonLog3LinearizationLUTInfo::colorAtIndex(float, float, float, float*, float*, float*, float*) const::t2
0000000000113e91	testb	%al, %al
0000000000113e93	je	0x113f97
0000000000113e99	movzbl	__ZGVZNK31HGCanonLog3LinearizationLUTInfo12colorAtIndexEfffPfS0_S0_S0_E2aa(%rip), %eax ## guard variable for HGCanonLog3LinearizationLUTInfo::colorAtIndex(float, float, float, float*, float*, float*, float*) const::aa
0000000000113ea0	testb	%al, %al
0000000000113ea2	je	0x113fb5
0000000000113ea8	cvtss2sd	%xmm0, %xmm1
0000000000113eac	movsd	0x2c0bf4(%rip), %xmm0
0000000000113eb4	ucomisd	%xmm1, %xmm0
0000000000113eb8	ja	0x113ed0
0000000000113eba	ucomisd	0x2c0bd6(%rip), %xmm1
0000000000113ec2	movapd	%xmm1, %xmm0
0000000000113ec6	jbe	0x113ed0
0000000000113ec8	movsd	0x2c0bc8(%rip), %xmm0
0000000000113ed0	movsd	__ZZNK31HGCanonLog3LinearizationLUTInfo12colorAtIndexEfffPfS0_S0_S0_E2t1(%rip), %xmm1 ## HGCanonLog3LinearizationLUTInfo::colorAtIndex(float, float, float, float*, float*, float*, float*) const::t1
0000000000113ed8	ucomisd	%xmm0, %xmm1
0000000000113edc	jbe	0x113f0d
0000000000113ede	movsd	0x2c0c1a(%rip), %xmm1
0000000000113ee6	subsd	%xmm0, %xmm1
0000000000113eea	mulsd	__ZZNK31HGCanonLog3LinearizationLUTInfo12colorAtIndexEfffPfS0_S0_S0_E2aa(%rip), %xmm1 ## HGCanonLog3LinearizationLUTInfo::colorAtIndex(float, float, float, float*, float*, float*, float*) const::aa
0000000000113ef2	movapd	%xmm1, %xmm0
0000000000113ef6	callq	0x3c50ea                        ## symbol stub for: _exp
0000000000113efb	addsd	0x2b63fd(%rip), %xmm0
0000000000113f03	divsd	0x2c0bfd(%rip), %xmm0
0000000000113f0b	jmp	0x113f52
0000000000113f0d	movsd	__ZZNK31HGCanonLog3LinearizationLUTInfo12colorAtIndexEfffPfS0_S0_S0_E2t2(%rip), %xmm1 ## HGCanonLog3LinearizationLUTInfo::colorAtIndex(float, float, float, float*, float*, float*, float*) const::t2
0000000000113f15	ucomisd	%xmm0, %xmm1
0000000000113f19	jae	0x113f42
0000000000113f1b	addsd	0x2c0bcd(%rip), %xmm0
0000000000113f23	mulsd	__ZZNK31HGCanonLog3LinearizationLUTInfo12colorAtIndexEfffPfS0_S0_S0_E2aa(%rip), %xmm0 ## HGCanonLog3LinearizationLUTInfo::colorAtIndex(float, float, float, float*, float*, float*, float*) const::aa
0000000000113f2b	callq	0x3c50ea                        ## symbol stub for: _exp
0000000000113f30	addsd	0x2b63c8(%rip), %xmm0
0000000000113f38	divsd	0x2c0bb8(%rip), %xmm0
0000000000113f40	jmp	0x113f52
0000000000113f42	addsd	0x2c0b96(%rip), %xmm0
0000000000113f4a	divsd	0x2c0b96(%rip), %xmm0
0000000000113f52	cvtsd2ss	%xmm0, %xmm0
0000000000113f56	movss	%xmm0, (%r12)
0000000000113f5c	movss	%xmm0, (%r15)
0000000000113f61	movss	%xmm0, (%r14)
0000000000113f66	movl	$0x3f800000, (%rbx)             ## imm = 0x3F800000
0000000000113f6c	addq	$0x10, %rsp
0000000000113f70	popq	%rbx
0000000000113f71	popq	%r12
0000000000113f73	popq	%r14
0000000000113f75	popq	%r15
0000000000113f77	popq	%rbp
0000000000113f78	retq
0000000000113f79	movss	%xmm0, -0x24(%rbp)
0000000000113f7e	callq	__ZNK31HGCanonLog3LinearizationLUTInfo12colorAtIndexEfffPfS0_S0_S0_.cold.1 ## HGCanonLog3LinearizationLUTInfo::colorAtIndex(float, float, float, float*, float*, float*, float*) const (.cold.1)
0000000000113f83	movss	-0x24(%rbp), %xmm0
0000000000113f88	movzbl	__ZGVZNK31HGCanonLog3LinearizationLUTInfo12colorAtIndexEfffPfS0_S0_S0_E2t2(%rip), %eax ## guard variable for HGCanonLog3LinearizationLUTInfo::colorAtIndex(float, float, float, float*, float*, float*, float*) const::t2
0000000000113f8f	testb	%al, %al
0000000000113f91	jne	0x113e99
0000000000113f97	movss	%xmm0, -0x24(%rbp)
0000000000113f9c	callq	__ZNK31HGCanonLog3LinearizationLUTInfo12colorAtIndexEfffPfS0_S0_S0_.cold.2 ## HGCanonLog3LinearizationLUTInfo::colorAtIndex(float, float, float, float*, float*, float*, float*) const (.cold.2)
0000000000113fa1	movss	-0x24(%rbp), %xmm0
0000000000113fa6	movzbl	__ZGVZNK31HGCanonLog3LinearizationLUTInfo12colorAtIndexEfffPfS0_S0_S0_E2aa(%rip), %eax ## guard variable for HGCanonLog3LinearizationLUTInfo::colorAtIndex(float, float, float, float*, float*, float*, float*) const::aa
0000000000113fad	testb	%al, %al
0000000000113faf	jne	0x113ea8
0000000000113fb5	movss	%xmm0, -0x24(%rbp)
0000000000113fba	callq	__ZNK31HGCanonLog3LinearizationLUTInfo12colorAtIndexEfffPfS0_S0_S0_.cold.3 ## HGCanonLog3LinearizationLUTInfo::colorAtIndex(float, float, float, float*, float*, float*, float*) const (.cold.3)
0000000000113fbf	movss	-0x24(%rbp), %xmm0
0000000000113fc4	cvtss2sd	%xmm0, %xmm1
0000000000113fc8	movsd	0x2c0ad8(%rip), %xmm0
0000000000113fd0	ucomisd	%xmm1, %xmm0
0000000000113fd4	jbe	0x113eba
0000000000113fda	jmp	0x113ed0
0000000000113fdf	nop
