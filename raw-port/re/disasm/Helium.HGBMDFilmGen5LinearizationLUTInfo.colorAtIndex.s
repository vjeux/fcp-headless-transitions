__ZNK33HGBMDFilmGen5LinearizationLUTInfo12colorAtIndexEfffPfS0_S0_S0_:
0000000000114940	pushq	%rbp
0000000000114941	movq	%rsp, %rbp
0000000000114944	pushq	%r15
0000000000114946	pushq	%r14
0000000000114948	pushq	%r12
000000000011494a	pushq	%rbx
000000000011494b	subq	$0x10, %rsp
000000000011494f	movq	%r8, %rbx
0000000000114952	movq	%rcx, %r14
0000000000114955	movq	%rdx, %r15
0000000000114958	movq	%rsi, %r12
000000000011495b	movzbl	__ZGVZNK33HGBMDFilmGen5LinearizationLUTInfo12colorAtIndexEfffPfS0_S0_S0_E2tl(%rip), %eax ## guard variable for HGBMDFilmGen5LinearizationLUTInfo::colorAtIndex(float, float, float, float*, float*, float*, float*) const::tl
0000000000114962	testb	%al, %al
0000000000114964	je	0x1149fa
000000000011496a	cvtss2sd	%xmm0, %xmm1
000000000011496e	movsd	0x2c0132(%rip), %xmm0
0000000000114976	ucomisd	%xmm1, %xmm0
000000000011497a	ja	0x114992
000000000011497c	ucomisd	0x2c0114(%rip), %xmm1
0000000000114984	movapd	%xmm1, %xmm0
0000000000114988	jbe	0x114992
000000000011498a	movsd	0x2c0106(%rip), %xmm0
0000000000114992	ucomisd	__ZZNK33HGBMDFilmGen5LinearizationLUTInfo12colorAtIndexEfffPfS0_S0_S0_E2tl(%rip), %xmm0 ## HGBMDFilmGen5LinearizationLUTInfo::colorAtIndex(float, float, float, float*, float*, float*, float*) const::tl
000000000011499a	jae	0x1149ae
000000000011499c	addsd	0x2c024c(%rip), %xmm0
00000000001149a4	divsd	0x2c024c(%rip), %xmm0
00000000001149ac	jmp	0x1149cb
00000000001149ae	addsd	0x2c0222(%rip), %xmm0
00000000001149b6	divsd	0x2c0222(%rip), %xmm0
00000000001149be	callq	0x3c50ea                        ## symbol stub for: _exp
00000000001149c3	addsd	0x2c021d(%rip), %xmm0
00000000001149cb	divsd	0x2bc47d(%rip), %xmm0
00000000001149d3	cvtsd2ss	%xmm0, %xmm0
00000000001149d7	movss	%xmm0, (%r12)
00000000001149dd	movss	%xmm0, (%r15)
00000000001149e2	movss	%xmm0, (%r14)
00000000001149e7	movl	$0x3f800000, (%rbx)             ## imm = 0x3F800000
00000000001149ed	addq	$0x10, %rsp
00000000001149f1	popq	%rbx
00000000001149f2	popq	%r12
00000000001149f4	popq	%r14
00000000001149f6	popq	%r15
00000000001149f8	popq	%rbp
00000000001149f9	retq
00000000001149fa	movss	%xmm0, -0x24(%rbp)
00000000001149ff	callq	__ZNK33HGBMDFilmGen5LinearizationLUTInfo12colorAtIndexEfffPfS0_S0_S0_.cold.1 ## HGBMDFilmGen5LinearizationLUTInfo::colorAtIndex(float, float, float, float*, float*, float*, float*) const (.cold.1)
0000000000114a04	movss	-0x24(%rbp), %xmm0
0000000000114a09	cvtss2sd	%xmm0, %xmm1
0000000000114a0d	movsd	0x2c0093(%rip), %xmm0
0000000000114a15	ucomisd	%xmm1, %xmm0
0000000000114a19	jbe	0x11497c
0000000000114a1f	jmp	0x114992
0000000000114a24	nopw	%cs:(%rax,%rax)
