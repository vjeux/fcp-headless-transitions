__ZNK35HGFujifilmFLog2LinearizationLUTInfo12colorAtIndexEfffPfS0_S0_S0_:
0000000000114fa0	pushq	%rbp
0000000000114fa1	movq	%rsp, %rbp
0000000000114fa4	pushq	%r15
0000000000114fa6	pushq	%r14
0000000000114fa8	pushq	%r12
0000000000114faa	pushq	%rbx
0000000000114fab	subq	$0x10, %rsp
0000000000114faf	movq	%r8, %rbx
0000000000114fb2	movq	%rcx, %r14
0000000000114fb5	movq	%rdx, %r15
0000000000114fb8	movq	%rsi, %r12
0000000000114fbb	movaps	%xmm0, %xmm2
0000000000114fbe	movzbl	__ZGVZNK35HGFujifilmFLog2LinearizationLUTInfo12colorAtIndexEfffPfS0_S0_S0_E4cut2(%rip), %eax ## guard variable for HGFujifilmFLog2LinearizationLUTInfo::colorAtIndex(float, float, float, float*, float*, float*, float*) const::cut2
0000000000114fc5	testb	%al, %al
0000000000114fc7	je	0x114ffb
0000000000114fc9	movzbl	__ZGVZNK35HGFujifilmFLog2LinearizationLUTInfo12colorAtIndexEfffPfS0_S0_S0_E2cc(%rip), %eax ## guard variable for HGFujifilmFLog2LinearizationLUTInfo::colorAtIndex(float, float, float, float*, float*, float*, float*) const::cc
0000000000114fd0	testb	%al, %al
0000000000114fd2	je	0x115015
0000000000114fd4	xorps	%xmm0, %xmm0
0000000000114fd7	xorps	%xmm1, %xmm1
0000000000114fda	ucomiss	%xmm2, %xmm1
0000000000114fdd	jbe	0x11502f
0000000000114fdf	ucomisd	__ZZNK35HGFujifilmFLog2LinearizationLUTInfo12colorAtIndexEfffPfS0_S0_S0_E4cut2(%rip), %xmm0 ## HGFujifilmFLog2LinearizationLUTInfo::colorAtIndex(float, float, float, float*, float*, float*, float*) const::cut2
0000000000114fe7	jae	0x11504a
0000000000114fe9	addsd	0x2bfc6f(%rip), %xmm0
0000000000114ff1	divsd	0x2bfc87(%rip), %xmm0
0000000000114ff9	jmp	0x11506f
0000000000114ffb	movss	%xmm2, -0x24(%rbp)
0000000000115000	callq	__ZNK35HGFujifilmFLog2LinearizationLUTInfo12colorAtIndexEfffPfS0_S0_S0_.cold.1 ## HGFujifilmFLog2LinearizationLUTInfo::colorAtIndex(float, float, float, float*, float*, float*, float*) const (.cold.1)
0000000000115005	movss	-0x24(%rbp), %xmm2
000000000011500a	movzbl	__ZGVZNK35HGFujifilmFLog2LinearizationLUTInfo12colorAtIndexEfffPfS0_S0_S0_E2cc(%rip), %eax ## guard variable for HGFujifilmFLog2LinearizationLUTInfo::colorAtIndex(float, float, float, float*, float*, float*, float*) const::cc
0000000000115011	testb	%al, %al
0000000000115013	jne	0x114fd4
0000000000115015	movss	%xmm2, -0x24(%rbp)
000000000011501a	callq	__ZNK35HGFujifilmFLog2LinearizationLUTInfo12colorAtIndexEfffPfS0_S0_S0_.cold.2 ## HGFujifilmFLog2LinearizationLUTInfo::colorAtIndex(float, float, float, float*, float*, float*, float*) const (.cold.2)
000000000011501f	movss	-0x24(%rbp), %xmm2
0000000000115024	xorps	%xmm0, %xmm0
0000000000115027	xorps	%xmm1, %xmm1
000000000011502a	ucomiss	%xmm2, %xmm1
000000000011502d	ja	0x114fdf
000000000011502f	ucomiss	0x2b2c8a(%rip), %xmm2
0000000000115036	jbe	0x11509e
0000000000115038	movsd	0x2b5220(%rip), %xmm0
0000000000115040	ucomisd	__ZZNK35HGFujifilmFLog2LinearizationLUTInfo12colorAtIndexEfffPfS0_S0_S0_E4cut2(%rip), %xmm0 ## HGFujifilmFLog2LinearizationLUTInfo::colorAtIndex(float, float, float, float*, float*, float*, float*) const::cut2
0000000000115048	jb	0x114fe9
000000000011504a	addsd	0x2bfc1e(%rip), %xmm0
0000000000115052	mulsd	__ZZNK35HGFujifilmFLog2LinearizationLUTInfo12colorAtIndexEfffPfS0_S0_S0_E2cc(%rip), %xmm0 ## HGFujifilmFLog2LinearizationLUTInfo::colorAtIndex(float, float, float, float*, float*, float*, float*) const::cc
000000000011505a	callq	0x3c50ea                        ## symbol stub for: _exp
000000000011505f	addsd	0x2bfc11(%rip), %xmm0
0000000000115067	divsd	0x2bbde9(%rip), %xmm0
000000000011506f	divsd	0x2bbdd9(%rip), %xmm0
0000000000115077	cvtsd2ss	%xmm0, %xmm0
000000000011507b	movss	%xmm0, (%r12)
0000000000115081	movss	%xmm0, (%r15)
0000000000115086	movss	%xmm0, (%r14)
000000000011508b	movl	$0x3f800000, (%rbx)             ## imm = 0x3F800000
0000000000115091	addq	$0x10, %rsp
0000000000115095	popq	%rbx
0000000000115096	popq	%r12
0000000000115098	popq	%r14
000000000011509a	popq	%r15
000000000011509c	popq	%rbp
000000000011509d	retq
000000000011509e	xorps	%xmm0, %xmm0
00000000001150a1	cvtss2sd	%xmm2, %xmm0
00000000001150a5	ucomisd	__ZZNK35HGFujifilmFLog2LinearizationLUTInfo12colorAtIndexEfffPfS0_S0_S0_E4cut2(%rip), %xmm0 ## HGFujifilmFLog2LinearizationLUTInfo::colorAtIndex(float, float, float, float*, float*, float*, float*) const::cut2
00000000001150ad	jb	0x114fe9
00000000001150b3	jmp	0x11504a
00000000001150b5	nopw	%cs:(%rax,%rax)
