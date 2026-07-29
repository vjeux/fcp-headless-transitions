__ZN14HGColorConform29CreateColorConformHeliumGraphEP10HGRendererNS_30hgColorConformConversionPresetE:
00000000001cd890	pushq	%rbp
00000000001cd891	movq	%rsp, %rbp
00000000001cd894	pushq	%r15
00000000001cd896	pushq	%r14
00000000001cd898	pushq	%r13
00000000001cd89a	pushq	%r12
00000000001cd89c	pushq	%rbx
00000000001cd89d	subq	$0xa8, %rsp
00000000001cd8a4	movl	%edx, %r12d
00000000001cd8a7	movq	%rsi, %r15
00000000001cd8aa	movq	%rdi, %rbx
00000000001cd8ad	movq	0x8349a4(%rip), %rax            ## literal pool symbol address: ___stack_chk_guard
00000000001cd8b4	movq	(%rax), %rax
00000000001cd8b7	movq	%rax, -0x30(%rbp)
00000000001cd8bb	movq	0x1a0(%rdi), %rdi
00000000001cd8c2	testq	%rdi, %rdi
00000000001cd8c5	je	0x1cd8d8
00000000001cd8c7	movq	(%rdi), %rax
00000000001cd8ca	callq	*0x18(%rax)
00000000001cd8cd	movq	$0x0, 0x1a0(%rbx)
00000000001cd8d8	leal	-0x1(%r12), %eax
00000000001cd8dd	cmpl	$0x15, %eax
00000000001cd8e0	ja	0x1cd981
00000000001cd8e6	leaq	0x1913(%rip), %rcx
00000000001cd8ed	movslq	(%rcx,%rax,4), %rax
00000000001cd8f1	addq	%rcx, %rax
00000000001cd8f4	jmpq	*%rax
00000000001cd8f6	movl	$0x4a0, %edi                    ## imm = 0x4A0
00000000001cd8fb	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
00000000001cd900	movq	%rax, %r14
00000000001cd903	movq	%rax, %rdi
00000000001cd906	callq	__ZN12HGColorGammaC1Ev          ## HGColorGamma::HGColorGamma()
00000000001cd90b	movzbl	0x1da(%rbx), %esi
00000000001cd912	movq	%r14, %rdi
00000000001cd915	callq	__ZN12HGColorGamma26SetAntiSymmetricToneCurvesEb ## HGColorGamma::SetAntiSymmetricToneCurves(bool)
00000000001cd91a	movq	%r14, 0x198(%rbx)
00000000001cd921	movss	0x1dc(%rbx), %xmm0
00000000001cd929	movss	0x1e0(%rbx), %xmm1
00000000001cd931	movq	%r14, %rdi
00000000001cd934	callq	__ZN12HGColorGamma22Set1DLutScaleAndOffsetEff ## HGColorGamma::Set1DLutScaleAndOffset(float, float)
00000000001cd939	movl	0x1f0(%rbx), %edx
00000000001cd93f	movl	0x1f8(%rbx), %ecx
00000000001cd945	movl	0x1e8(%rbx), %esi
00000000001cd94b	movl	0x1ec(%rbx), %r8d
00000000001cd952	movl	0x1f4(%rbx), %r9d
00000000001cd959	movl	0x1fc(%rbx), %eax
00000000001cd95f	movl	%eax, (%rsp)
00000000001cd962	movq	%r14, %rdi
00000000001cd965	callq	__ZN12HGColorGamma13SetConversionENS_26hgColorGammaColorPrimariesENS_28hgColorGammaTransferFunctionENS_30hgColorGammaMatrixCoefficientsES0_S1_S2_ ## HGColorGamma::SetConversion(HGColorGamma::hgColorGammaColorPrimaries, HGColorGamma::hgColorGammaTransferFunction, HGColorGamma::hgColorGammaMatrixCoefficients, HGColorGamma::hgColorGammaColorPrimaries, HGColorGamma::hgColorGammaTransferFunction, HGColorGamma::hgColorGammaMatrixCoefficients)
00000000001cd96a	testb	%al, %al
00000000001cd96c	je	0x1cdfd6
00000000001cd972	movq	%r14, 0x1a0(%rbx)
00000000001cd979	xorl	%r12d, %r12d
00000000001cd97c	jmp	0x1ced88
00000000001cd981	leal	-0x17(%r12), %eax
00000000001cd986	cmpl	$0x1, %eax
00000000001cd989	ja	0x1cdd40
00000000001cd98f	movl	$0x1b0, %edi                    ## imm = 0x1B0
00000000001cd994	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
00000000001cd999	movq	%rax, %r14
00000000001cd99c	cmpl	$0x17, %r12d
00000000001cd9a0	jne	0x1ce32c
00000000001cd9a6	movq	0x358(%rbx), %rdi
00000000001cd9ad	testq	%rdi, %rdi
00000000001cd9b0	je	0x1ce6f5
00000000001cd9b6	movq	0x83490b(%rip), %rsi            ## literal pool symbol address: __ZTI17HGRAWRendererBase
00000000001cd9bd	movq	0x83490c(%rip), %rdx            ## literal pool symbol address: __ZTI22HGPRRawSdkRendererBase
00000000001cd9c4	xorl	%ecx, %ecx
00000000001cd9c6	callq	0x3c5018                        ## symbol stub for: ___dynamic_cast
00000000001cd9cb	testq	%rax, %rax
00000000001cd9ce	je	0x1ce6f5
00000000001cd9d4	movq	%rax, -0xb0(%rbp)
00000000001cd9db	movq	0x360(%rbx), %rax
00000000001cd9e2	movq	%rax, -0xa8(%rbp)
00000000001cd9e9	testq	%rax, %rax
00000000001cd9ec	je	0x1ce6ff
00000000001cd9f2	lock
00000000001cd9f3	incq	0x8(%rax)
00000000001cd9f7	jmp	0x1ce6ff
00000000001cd9fc	movl	0x208(%rbx), %r15d
00000000001cda03	movl	%r15d, %eax
00000000001cda06	andl	$-0x2, %eax
00000000001cda09	movl	$0x4a0, %edi                    ## imm = 0x4A0
00000000001cda0e	cmpl	$0x8, %eax
00000000001cda11	jne	0x1cdf5f
00000000001cda17	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
00000000001cda1c	movq	%rax, %r14
00000000001cda1f	cmpl	$0x8, %r15d
00000000001cda23	jne	0x1ce3ee
00000000001cda29	movq	%r14, %rdi
00000000001cda2c	callq	__ZN12HGColorGammaC1Ev          ## HGColorGamma::HGColorGamma()
00000000001cda31	movzbl	0x1da(%rbx), %esi
00000000001cda38	movq	%r14, %rdi
00000000001cda3b	callq	__ZN12HGColorGamma26SetAntiSymmetricToneCurvesEb ## HGColorGamma::SetAntiSymmetricToneCurves(bool)
00000000001cda40	movq	%r14, 0x198(%rbx)
00000000001cda47	movq	%r14, 0x1a0(%rbx)
00000000001cda4e	movq	%r14, %r12
00000000001cda51	xorl	%r14d, %r14d
00000000001cda54	movl	0x208(%rbx), %edx
00000000001cda5a	xorl	%esi, %esi
00000000001cda5c	cmpl	$0x8, %edx
00000000001cda5f	jne	0x1cda67
00000000001cda61	movl	0x200(%rbx), %esi
00000000001cda67	movl	0x20c(%rbx), %ecx
00000000001cda6d	movl	0x210(%rbx), %r8d
00000000001cda74	movq	%r12, %rdi
00000000001cda77	callq	__ZN12HGColorGamma13SetConversionENS_30hgColorGammaMatrixCoefficientsENS_20hgColorGammaLogCurveENS_20hgColorGammaLogGamutENS_26hgColorGammaColorPrimariesE ## HGColorGamma::SetConversion(HGColorGamma::hgColorGammaMatrixCoefficients, HGColorGamma::hgColorGammaLogCurve, HGColorGamma::hgColorGammaLogGamut, HGColorGamma::hgColorGammaColorPrimaries)
00000000001cda7c	movl	0x20c(%rbx), %eax
00000000001cda82	leal	-0x5(%rax), %ecx
00000000001cda85	cmpl	$0x1, %ecx
00000000001cda88	ja	0x1cda94
00000000001cda8a	movzbl	0x350(%rbx), %eax
00000000001cda91	addl	$0x5, %eax
00000000001cda94	movl	%eax, %eax
00000000001cda96	shlq	$0x6, %rax
00000000001cda9a	cmpl	$0x0, 0x210(%rbx)
00000000001cdaa1	jne	0x1ce53c
00000000001cdaa7	leaq	__ZN12HGColorGamma22logGamutRGBToRec709RGBE(%rip), %rcx ## HGColorGamma::logGamutRGBToRec709RGB
00000000001cdaae	jmp	0x1ce543
00000000001cdab3	movl	0x204(%rbx), %eax
00000000001cdab9	decl	%eax
00000000001cdabb	cmpl	$0x8, %eax
00000000001cdabe	ja	0x1ce91c
00000000001cdac4	leaq	0x178d(%rip), %rcx
00000000001cdacb	movslq	(%rcx,%rax,4), %rax
00000000001cdacf	addq	%rcx, %rax
00000000001cdad2	jmpq	*%rax
00000000001cdad4	movl	$0x4a0, %edi                    ## imm = 0x4A0
00000000001cdad9	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
00000000001cdade	movq	%rax, %r15
00000000001cdae1	movq	%rax, %rdi
00000000001cdae4	callq	__ZN12HGColorGammaC1Ev          ## HGColorGamma::HGColorGamma()
00000000001cdae9	movzbl	0x1da(%rbx), %esi
00000000001cdaf0	movq	%r15, %rdi
00000000001cdaf3	callq	__ZN12HGColorGamma26SetAntiSymmetricToneCurvesEb ## HGColorGamma::SetAntiSymmetricToneCurves(bool)
00000000001cdaf8	movl	$0x4a0, %edi                    ## imm = 0x4A0
00000000001cdafd	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
00000000001cdb02	movq	%rax, %r13
00000000001cdb05	movq	%rax, %rdi
00000000001cdb08	callq	__ZN12HGColorGammaC1Ev          ## HGColorGamma::HGColorGamma()
00000000001cdb0d	movzbl	0x1da(%rbx), %esi
00000000001cdb14	movq	%r13, %rdi
00000000001cdb17	callq	__ZN12HGColorGamma26SetAntiSymmetricToneCurvesEb ## HGColorGamma::SetAntiSymmetricToneCurves(bool)
00000000001cdb1c	movl	$0x4a0, %edi                    ## imm = 0x4A0
00000000001cdb21	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
00000000001cdb26	movq	%rax, %r14
00000000001cdb29	movq	%rax, %rdi
00000000001cdb2c	callq	__ZN12HGColorGammaC1Ev          ## HGColorGamma::HGColorGamma()
00000000001cdb31	movzbl	0x1da(%rbx), %esi
00000000001cdb38	movq	%r14, %rdi
00000000001cdb3b	callq	__ZN12HGColorGamma26SetAntiSymmetricToneCurvesEb ## HGColorGamma::SetAntiSymmetricToneCurves(bool)
00000000001cdb40	movl	0x204(%rbx), %eax
00000000001cdb46	cmpl	$0x9, %eax
00000000001cdb49	je	0x1cdb54
00000000001cdb4b	cmpl	$0x7, %eax
00000000001cdb4e	jne	0x1ce7ad
00000000001cdb54	movq	%r14, -0x88(%rbp)
00000000001cdb5b	movl	$0x1a0, %edi                    ## imm = 0x1A0
00000000001cdb60	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
00000000001cdb65	movq	%rax, -0x78(%rbp)
00000000001cdb69	movq	%rax, %rdi
00000000001cdb6c	callq	__ZN24HgcColorGamma_bias_clampC1Ev ## HgcColorGamma_bias_clamp::HgcColorGamma_bias_clamp()
00000000001cdb71	movq	%r15, %r14
00000000001cdb74	movl	$0x4a0, %edi                    ## imm = 0x4A0
00000000001cdb79	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
00000000001cdb7e	movq	%rax, %r12
00000000001cdb81	movq	%rax, %rdi
00000000001cdb84	callq	__ZN12HGColorGammaC1Ev          ## HGColorGamma::HGColorGamma()
00000000001cdb89	movzbl	0x1da(%rbx), %esi
00000000001cdb90	movq	%r12, %rdi
00000000001cdb93	callq	__ZN12HGColorGamma26SetAntiSymmetricToneCurvesEb ## HGColorGamma::SetAntiSymmetricToneCurves(bool)
00000000001cdb98	movq	-0x78(%rbp), %r15
00000000001cdb9c	movq	(%r15), %rax
00000000001cdb9f	movq	%r15, %rdi
00000000001cdba2	xorl	%esi, %esi
00000000001cdba4	movq	%r14, -0xb8(%rbp)
00000000001cdbab	movq	%r14, %rdx
00000000001cdbae	callq	*0x78(%rax)
00000000001cdbb1	movq	(%r12), %rax
00000000001cdbb5	movq	%r12, %rdi
00000000001cdbb8	xorl	%esi, %esi
00000000001cdbba	movq	%r15, %rdx
00000000001cdbbd	callq	*0x78(%rax)
00000000001cdbc0	movq	(%r13), %rax
00000000001cdbc4	movq	%r13, %rdi
00000000001cdbc7	xorl	%esi, %esi
00000000001cdbc9	movq	%r12, %rdx
00000000001cdbcc	callq	*0x78(%rax)
00000000001cdbcf	movq	-0x88(%rbp), %r14
00000000001cdbd6	movq	(%r14), %rax
00000000001cdbd9	movq	%r14, %rdi
00000000001cdbdc	xorl	%esi, %esi
00000000001cdbde	movq	%r13, %rdx
00000000001cdbe1	callq	*0x78(%rax)
00000000001cdbe4	movq	-0xb8(%rbp), %rdi
00000000001cdbeb	movq	(%rdi), %rax
00000000001cdbee	callq	*0x18(%rax)
00000000001cdbf1	movq	(%r15), %rax
00000000001cdbf4	movq	%r15, %rdi
00000000001cdbf7	movq	-0xb8(%rbp), %r15
00000000001cdbfe	callq	*0x18(%rax)
00000000001cdc01	jmp	0x1ce7d5
00000000001cdc06	movl	0x22c(%rbx), %r15d
00000000001cdc0d	movl	$0x1a0, %edi                    ## imm = 0x1A0
00000000001cdc12	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
00000000001cdc17	movq	%rax, %r14
00000000001cdc1a	testl	%r15d, %r15d
00000000001cdc1d	je	0x1ce08f
00000000001cdc23	movl	$0x1a0, %esi                    ## imm = 0x1A0
00000000001cdc28	movq	%r14, %rdi
00000000001cdc2b	callq	0x3c4fca                        ## symbol stub for: ___bzero
00000000001cdc30	movq	%r14, %rdi
00000000001cdc33	callq	__ZN18HgcWhiteBalanceRAWC2Ev    ## HgcWhiteBalanceRAW::HgcWhiteBalanceRAW()
00000000001cdc38	leaq	0x85c439(%rip), %rax
00000000001cdc3f	movq	%rax, (%r14)
00000000001cdc42	movq	%r14, 0x198(%rbx)
00000000001cdc49	movss	0x230(%rbx), %xmm3
00000000001cdc51	movss	0x234(%rbx), %xmm0
00000000001cdc59	movss	0x23c(%rbx), %xmm1
00000000001cdc61	cvtss2sd	%xmm1, %xmm1
00000000001cdc65	movsd	0x691333(%rip), %xmm4
00000000001cdc6d	mulsd	%xmm4, %xmm1
00000000001cdc71	cvtss2sd	%xmm3, %xmm5
00000000001cdc75	divsd	%xmm5, %xmm1
00000000001cdc79	cvtsd2ss	%xmm1, %xmm1
00000000001cdc7d	movss	0x1ff06f(%rip), %xmm2
00000000001cdc85	divss	%xmm3, %xmm2
00000000001cdc89	movss	0x240(%rbx), %xmm3
00000000001cdc91	cvtss2sd	%xmm3, %xmm3
00000000001cdc95	mulsd	%xmm4, %xmm3
00000000001cdc99	divsd	%xmm5, %xmm3
00000000001cdc9d	cvtsd2ss	%xmm3, %xmm3
00000000001cdca1	movq	%r14, %rdi
00000000001cdca4	xorl	%esi, %esi
00000000001cdca6	callq	__ZN18HgcWhiteBalanceRAW12SetParameterEiffff ## HgcWhiteBalanceRAW::SetParameter(int, float, float, float, float)
00000000001cdcab	movss	0x258(%rbx), %xmm0
00000000001cdcb3	movss	0x25c(%rbx), %xmm1
00000000001cdcbb	movss	0x260(%rbx), %xmm2
00000000001cdcc3	movss	0x264(%rbx), %xmm3
00000000001cdccb	movq	(%r14), %rax
00000000001cdcce	movq	%r14, %rdi
00000000001cdcd1	movl	$0x1, %esi
00000000001cdcd6	callq	*0x60(%rax)
00000000001cdcd9	movss	0x268(%rbx), %xmm0
00000000001cdce1	movss	0x26c(%rbx), %xmm1
00000000001cdce9	movss	0x244(%rbx), %xmm2
00000000001cdcf1	movss	0x248(%rbx), %xmm3
00000000001cdcf9	movq	(%r14), %rax
00000000001cdcfc	movq	%r14, %rdi
00000000001cdcff	movl	$0x2, %esi
00000000001cdd04	jmp	0x1ce1c4
00000000001cdd09	movl	$0x1a0, %edi                    ## imm = 0x1A0
00000000001cdd0e	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
00000000001cdd13	movq	%rax, %r15
00000000001cdd16	movq	%rax, %rdi
00000000001cdd19	callq	__ZN12HGREDDebayerC1Ev          ## HGREDDebayer::HGREDDebayer()
00000000001cdd1e	movq	(%r15), %rax
00000000001cdd21	movq	%r15, %rdi
00000000001cdd24	movl	$0xffffffff, %esi               ## imm = 0xFFFFFFFF
00000000001cdd29	movl	$0x1000, %edx                   ## imm = 0x1000
00000000001cdd2e	callq	*0x88(%rax)
00000000001cdd34	movq	%r15, 0x198(%rbx)
00000000001cdd3b	jmp	0x1ce7a1
00000000001cdd40	movl	$0x4a0, %edi                    ## imm = 0x4A0
00000000001cdd45	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
00000000001cdd4a	movq	%rax, %r14
00000000001cdd4d	cmpl	$0x5, %r12d
00000000001cdd51	jne	0x1ce382
00000000001cdd57	movq	%r14, %rdi
00000000001cdd5a	callq	__ZN12HGColorGammaC1Ev          ## HGColorGamma::HGColorGamma()
00000000001cdd5f	movzbl	0x1da(%rbx), %esi
00000000001cdd66	movq	%r14, %rdi
00000000001cdd69	callq	__ZN12HGColorGamma26SetAntiSymmetricToneCurvesEb ## HGColorGamma::SetAntiSymmetricToneCurves(bool)
00000000001cdd6e	movq	0x218(%rbx), %rax
00000000001cdd75	cmpq	$0x0, 0x10(%rax)
00000000001cdd7a	movq	%r14, %r12
00000000001cdd7d	je	0x1cece7
00000000001cdd83	cmpb	$0x0, 0x344(%rbx)
00000000001cdd8a	movq	%r14, %r12
00000000001cdd8d	jne	0x1cde65
00000000001cdd93	movl	$0x1a0, %edi                    ## imm = 0x1A0
00000000001cdd98	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
00000000001cdd9d	movq	%rax, %r12
00000000001cdda0	movq	%rax, %rdi
00000000001cdda3	callq	__ZN10HgcASC_CDLC1Ev            ## HgcASC_CDL::HgcASC_CDL()
00000000001cdda8	movq	(%r12), %rax
00000000001cddac	movq	%r12, %rdi
00000000001cddaf	xorl	%esi, %esi
00000000001cddb1	movq	%r14, %rdx
00000000001cddb4	callq	*0x78(%rax)
00000000001cddb7	movq	(%r14), %rax
00000000001cddba	movq	%r14, %rdi
00000000001cddbd	callq	*0x18(%rax)
00000000001cddc0	movss	0x31c(%rbx), %xmm0
00000000001cddc8	movss	0x320(%rbx), %xmm1
00000000001cddd0	movss	0x324(%rbx), %xmm2
00000000001cddd8	movq	(%r12), %rax
00000000001cdddc	movss	0x1f9edc(%rip), %xmm3
00000000001cdde4	movq	%r12, %rdi
00000000001cdde7	xorl	%esi, %esi
00000000001cdde9	callq	*0x60(%rax)
00000000001cddec	movss	0x328(%rbx), %xmm0
00000000001cddf4	movss	0x32c(%rbx), %xmm1
00000000001cddfc	movss	0x330(%rbx), %xmm2
00000000001cde04	movq	(%r12), %rax
00000000001cde08	xorps	%xmm3, %xmm3
00000000001cde0b	movq	%r12, %rdi
00000000001cde0e	movl	$0x1, %esi
00000000001cde13	callq	*0x60(%rax)
00000000001cde16	movss	0x334(%rbx), %xmm0
00000000001cde1e	movss	0x338(%rbx), %xmm1
00000000001cde26	movss	0x33c(%rbx), %xmm2
00000000001cde2e	movq	(%r12), %rax
00000000001cde32	movq	%r12, %rdi
00000000001cde35	movl	$0x2, %esi
00000000001cde3a	movss	0x1f9e7e(%rip), %xmm3
00000000001cde42	callq	*0x60(%rax)
00000000001cde45	movss	0x340(%rbx), %xmm0
00000000001cde4d	movq	(%r12), %rax
00000000001cde51	xorps	%xmm1, %xmm1
00000000001cde54	xorps	%xmm2, %xmm2
00000000001cde57	xorps	%xmm3, %xmm3
00000000001cde5a	movq	%r12, %rdi
00000000001cde5d	movl	$0x3, %esi
00000000001cde62	callq	*0x60(%rax)
00000000001cde65	movl	$0x210, %edi                    ## imm = 0x210
00000000001cde6a	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
00000000001cde6f	movq	%rax, %r13
00000000001cde72	movq	0x218(%rbx), %rax
00000000001cde79	movq	0x20(%rax), %rsi
00000000001cde7d	movss	0x18(%rax), %xmm0
00000000001cde82	movss	0x1c(%rax), %xmm1
00000000001cde87	movl	$0x0, 0x10(%rsp)
00000000001cde8f	movl	$0x1, 0x8(%rsp)
00000000001cde97	movl	$0x1, (%rsp)
00000000001cde9e	movss	0x1f9e1a(%rip), %xmm3
00000000001cdea6	xorps	%xmm2, %xmm2
00000000001cdea9	xorpd	%xmm4, %xmm4
00000000001cdead	xorps	%xmm5, %xmm5
00000000001cdeb0	movq	%r13, %rdi
00000000001cdeb3	movl	$0x19, %edx
00000000001cdeb8	movl	$0x1, %ecx
00000000001cdebd	movl	$0x1, %r8d
00000000001cdec3	movl	$0x1, %r9d
00000000001cdec9	callq	__ZN12HGApply3DLUTC1Em8HGFormatffffffbNS_29hgApply3DLUTInterpolationTypeEbbbb ## HGApply3DLUT::HGApply3DLUT(unsigned long, HGFormat, float, float, float, float, float, float, bool, HGApply3DLUT::hgApply3DLUTInterpolationType, bool, bool, bool, bool)
00000000001cdece	movq	(%r13), %rax
00000000001cded2	movq	%r13, %rdi
00000000001cded5	xorl	%esi, %esi
00000000001cded7	movq	%r12, %rdx
00000000001cdeda	callq	*0x78(%rax)
00000000001cdedd	movq	(%r12), %rax
00000000001cdee1	movq	%r12, %rdi
00000000001cdee4	callq	*0x18(%rax)
00000000001cdee7	movq	0x218(%rbx), %rax
00000000001cdeee	movq	0x10(%rax), %rdi
00000000001cdef2	callq	0x3c4aba                        ## symbol stub for: _CFDataGetBytePtr
00000000001cdef7	movq	0x218(%rbx), %rdx
00000000001cdefe	movq	0x20(%rdx), %rcx
00000000001cdf02	movq	0x28(%rdx), %r8
00000000001cdf06	movq	0x30(%rdx), %r9
00000000001cdf0a	movzbl	0x38(%rdx), %esi
00000000001cdf0e	movl	0x3c(%rdx), %edx
00000000001cdf11	movl	%edx, 0x8(%rsp)
00000000001cdf15	movl	%esi, (%rsp)
00000000001cdf18	movq	%rbx, %rdi
00000000001cdf1b	movq	%r15, %rsi
00000000001cdf1e	movq	%rax, %rdx
00000000001cdf21	callq	__ZN14HGColorConform15Prep3DLUTBitmapEP10HGRendererPKhmmmbNS_15hgLookLUTEndianE ## HGColorConform::Prep3DLUTBitmap(HGRenderer*, unsigned char const*, unsigned long, unsigned long, unsigned long, bool, HGColorConform::hgLookLUTEndian)
00000000001cdf26	testq	%rax, %rax
00000000001cdf29	je	0x1cebfd
00000000001cdf2f	movq	%r13, %rdi
00000000001cdf32	movq	%rax, %rsi
00000000001cdf35	movq	%rax, %r15
00000000001cdf38	callq	__ZN12HGApply3DLUT12SetLUTBitmapEP8HGBitmap ## HGApply3DLUT::SetLUTBitmap(HGBitmap*)
00000000001cdf3d	movq	(%r15), %rax
00000000001cdf40	movq	%r15, %rdi
00000000001cdf43	callq	*0x18(%rax)
00000000001cdf46	movq	0x218(%rbx), %rax
00000000001cdf4d	cmpb	$0x0, 0x68(%rax)
00000000001cdf51	je	0x1cec0e
00000000001cdf57	movq	%r13, %r12
00000000001cdf5a	jmp	0x1cece7
00000000001cdf5f	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
00000000001cdf64	movq	%rax, %r14
00000000001cdf67	movq	%rax, %rdi
00000000001cdf6a	callq	__ZN12HGColorGammaC1Ev          ## HGColorGamma::HGColorGamma()
00000000001cdf6f	movzbl	0x1da(%rbx), %esi
00000000001cdf76	movq	%r14, %rdi
00000000001cdf79	callq	__ZN12HGColorGamma26SetAntiSymmetricToneCurvesEb ## HGColorGamma::SetAntiSymmetricToneCurves(bool)
00000000001cdf7e	movq	%r14, 0x198(%rbx)
00000000001cdf85	movq	%r14, 0x1a0(%rbx)
00000000001cdf8c	movl	0x208(%rbx), %edx
00000000001cdf92	cmpl	$-0x1, %edx
00000000001cdf95	je	0x1ce6ce
00000000001cdf9b	movl	0x200(%rbx), %esi
00000000001cdfa1	movl	0x20c(%rbx), %ecx
00000000001cdfa7	movl	0x210(%rbx), %r8d
00000000001cdfae	movq	%r14, %rdi
00000000001cdfb1	callq	__ZN12HGColorGamma13SetConversionENS_30hgColorGammaMatrixCoefficientsENS_20hgColorGammaLogCurveENS_20hgColorGammaLogGamutENS_26hgColorGammaColorPrimariesE ## HGColorGamma::SetConversion(HGColorGamma::hgColorGammaMatrixCoefficients, HGColorGamma::hgColorGammaLogCurve, HGColorGamma::hgColorGammaLogGamut, HGColorGamma::hgColorGammaColorPrimaries)
00000000001cdfb6	cmpl	$0x2, 0x208(%rbx)
00000000001cdfbd	jne	0x1cede6
00000000001cdfc3	movl	0x348(%rbx), %esi
00000000001cdfc9	movq	%r14, %rdi
00000000001cdfcc	callq	__ZN12HGColorGamma24SetARRILogCExposureIndexEj ## HGColorGamma::SetARRILogCExposureIndex(unsigned int)
00000000001cdfd1	jmp	0x1cede6
00000000001cdfd6	movl	$0x4a0, %edi                    ## imm = 0x4A0
00000000001cdfdb	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
00000000001cdfe0	movq	%rax, %r12
00000000001cdfe3	movq	%rax, %rdi
00000000001cdfe6	callq	__ZN12HGColorGammaC1Ev          ## HGColorGamma::HGColorGamma()
00000000001cdfeb	movzbl	0x1da(%rbx), %esi
00000000001cdff2	movq	%r12, %rdi
00000000001cdff5	callq	__ZN12HGColorGamma26SetAntiSymmetricToneCurvesEb ## HGColorGamma::SetAntiSymmetricToneCurves(bool)
00000000001cdffa	movq	(%r12), %rax
00000000001cdffe	movq	%r12, %rdi
00000000001ce001	xorl	%esi, %esi
00000000001ce003	movq	%r14, %rdx
00000000001ce006	callq	*0x78(%rax)
00000000001ce009	movq	(%r14), %rax
00000000001ce00c	movq	%r14, %rdi
00000000001ce00f	callq	*0x18(%rax)
00000000001ce012	movl	0x1f0(%rbx), %edx
00000000001ce018	movl	0x1f8(%rbx), %ecx
00000000001ce01e	movl	0x1e8(%rbx), %esi
00000000001ce024	movl	0x1ec(%rbx), %r8d
00000000001ce02b	movl	$0x0, (%rsp)
00000000001ce032	movq	%r14, %rdi
00000000001ce035	movl	$0x8, %r9d
00000000001ce03b	callq	__ZN12HGColorGamma13SetConversionENS_26hgColorGammaColorPrimariesENS_28hgColorGammaTransferFunctionENS_30hgColorGammaMatrixCoefficientsES0_S1_S2_ ## HGColorGamma::SetConversion(HGColorGamma::hgColorGammaColorPrimaries, HGColorGamma::hgColorGammaTransferFunction, HGColorGamma::hgColorGammaMatrixCoefficients, HGColorGamma::hgColorGammaColorPrimaries, HGColorGamma::hgColorGammaTransferFunction, HGColorGamma::hgColorGammaMatrixCoefficients)
00000000001ce040	movss	0x1dc(%rbx), %xmm0
00000000001ce048	movss	0x1e0(%rbx), %xmm1
00000000001ce050	movq	%r12, %rdi
00000000001ce053	callq	__ZN12HGColorGamma22Set1DLutScaleAndOffsetEff ## HGColorGamma::Set1DLutScaleAndOffset(float, float)
00000000001ce058	movl	0x1ec(%rbx), %esi
00000000001ce05e	movl	0x1f4(%rbx), %r9d
00000000001ce065	movl	0x1fc(%rbx), %eax
00000000001ce06b	movl	%eax, (%rsp)
00000000001ce06e	movq	%r12, %rdi
00000000001ce071	movl	$0x8, %edx
00000000001ce076	xorl	%ecx, %ecx
00000000001ce078	movl	%esi, %r8d
00000000001ce07b	callq	__ZN12HGColorGamma13SetConversionENS_26hgColorGammaColorPrimariesENS_28hgColorGammaTransferFunctionENS_30hgColorGammaMatrixCoefficientsES0_S1_S2_ ## HGColorGamma::SetConversion(HGColorGamma::hgColorGammaColorPrimaries, HGColorGamma::hgColorGammaTransferFunction, HGColorGamma::hgColorGammaMatrixCoefficients, HGColorGamma::hgColorGammaColorPrimaries, HGColorGamma::hgColorGammaTransferFunction, HGColorGamma::hgColorGammaMatrixCoefficients)
00000000001ce080	movq	%r12, 0x1a0(%rbx)
00000000001ce087	movq	%r14, %r15
00000000001ce08a	jmp	0x1ced93
00000000001ce08f	movq	%r14, %rdi
00000000001ce092	callq	__ZN10HGDemosaicC1Ev            ## HGDemosaic::HGDemosaic()
00000000001ce097	movq	%r14, 0x198(%rbx)
00000000001ce09e	movl	0x228(%rbx), %eax
00000000001ce0a4	cvtsi2ss	%rax, %xmm0
00000000001ce0a9	movq	(%r14), %rax
00000000001ce0ac	xorps	%xmm1, %xmm1
00000000001ce0af	xorps	%xmm2, %xmm2
00000000001ce0b2	xorps	%xmm3, %xmm3
00000000001ce0b5	movq	%r14, %rdi
00000000001ce0b8	xorl	%esi, %esi
00000000001ce0ba	callq	*0x60(%rax)
00000000001ce0bd	movss	0x234(%rbx), %xmm0
00000000001ce0c5	movq	(%r14), %rax
00000000001ce0c8	xorps	%xmm1, %xmm1
00000000001ce0cb	xorps	%xmm2, %xmm2
00000000001ce0ce	xorps	%xmm3, %xmm3
00000000001ce0d1	movq	%r14, %rdi
00000000001ce0d4	movl	$0x1, %esi
00000000001ce0d9	callq	*0x60(%rax)
00000000001ce0dc	movss	0x1fec10(%rip), %xmm0
00000000001ce0e4	divss	0x230(%rbx), %xmm0
00000000001ce0ec	movq	(%r14), %rax
00000000001ce0ef	xorps	%xmm1, %xmm1
00000000001ce0f2	xorps	%xmm2, %xmm2
00000000001ce0f5	xorps	%xmm3, %xmm3
00000000001ce0f8	movq	%r14, %rdi
00000000001ce0fb	movl	$0x2, %esi
00000000001ce100	callq	*0x60(%rax)
00000000001ce103	movss	0x244(%rbx), %xmm0
00000000001ce10b	movss	0x248(%rbx), %xmm1
00000000001ce113	movq	(%r14), %rax
00000000001ce116	xorps	%xmm2, %xmm2
00000000001ce119	xorps	%xmm3, %xmm3
00000000001ce11c	movq	%r14, %rdi
00000000001ce11f	movl	$0x3, %esi
00000000001ce124	callq	*0x60(%rax)
00000000001ce127	movss	0x238(%rbx), %xmm0
00000000001ce12f	movq	(%r14), %rax
00000000001ce132	xorps	%xmm1, %xmm1
00000000001ce135	xorps	%xmm2, %xmm2
00000000001ce138	xorps	%xmm3, %xmm3
00000000001ce13b	movq	%r14, %rdi
00000000001ce13e	movl	$0x4, %esi
00000000001ce143	callq	*0x60(%rax)
00000000001ce146	movss	0x24c(%rbx), %xmm0
00000000001ce14e	movq	(%r14), %rax
00000000001ce151	xorps	%xmm1, %xmm1
00000000001ce154	xorps	%xmm2, %xmm2
00000000001ce157	xorps	%xmm3, %xmm3
00000000001ce15a	movq	%r14, %rdi
00000000001ce15d	movl	$0x5, %esi
00000000001ce162	callq	*0x60(%rax)
00000000001ce165	movss	0x250(%rbx), %xmm0
00000000001ce16d	movq	(%r14), %rax
00000000001ce170	xorps	%xmm1, %xmm1
00000000001ce173	xorps	%xmm2, %xmm2
00000000001ce176	xorps	%xmm3, %xmm3
00000000001ce179	movq	%r14, %rdi
00000000001ce17c	movl	$0x6, %esi
00000000001ce181	callq	*0x60(%rax)
00000000001ce184	movss	0x254(%rbx), %xmm0
00000000001ce18c	movq	(%r14), %rax
00000000001ce18f	xorps	%xmm1, %xmm1
00000000001ce192	xorps	%xmm2, %xmm2
00000000001ce195	xorps	%xmm3, %xmm3
00000000001ce198	movq	%r14, %rdi
00000000001ce19b	movl	$0x7, %esi
00000000001ce1a0	callq	*0x60(%rax)
00000000001ce1a3	movss	0x23c(%rbx), %xmm0
00000000001ce1ab	movss	0x240(%rbx), %xmm1
00000000001ce1b3	movq	(%r14), %rax
00000000001ce1b6	xorps	%xmm2, %xmm2
00000000001ce1b9	xorps	%xmm3, %xmm3
00000000001ce1bc	movq	%r14, %rdi
00000000001ce1bf	movl	$0x8, %esi
00000000001ce1c4	callq	*0x60(%rax)
00000000001ce1c7	movl	$0x1f0, %edi                    ## imm = 0x1F0
00000000001ce1cc	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
00000000001ce1d1	movq	%rax, %r12
00000000001ce1d4	movq	%rax, %rdi
00000000001ce1d7	callq	__ZN13HGColorMatrixC1Ev         ## HGColorMatrix::HGColorMatrix()
00000000001ce1dc	movq	(%r12), %rax
00000000001ce1e0	movq	%r12, %rdi
00000000001ce1e3	xorl	%esi, %esi
00000000001ce1e5	movq	%r14, %rdx
00000000001ce1e8	callq	*0x78(%rax)
00000000001ce1eb	movq	(%r14), %rax
00000000001ce1ee	movq	%r14, %rdi
00000000001ce1f1	callq	*0x18(%rax)
00000000001ce1f4	leaq	0x280(%rbx), %rsi
00000000001ce1fb	movq	%r12, %rdi
00000000001ce1fe	movl	$0x1, %edx
00000000001ce203	callq	__ZN13HGColorMatrix10LoadMatrixEPKDv4_fb ## HGColorMatrix::LoadMatrix(float vector[4] const*, bool)
00000000001ce208	cmpb	$0x1, 0x30d(%rbx)
00000000001ce20f	jne	0x1ce26f
00000000001ce211	xorl	%r14d, %r14d
00000000001ce214	testl	%r15d, %r15d
00000000001ce217	setne	%r14b
00000000001ce21b	movl	$0x200, %edi                    ## imm = 0x200
00000000001ce220	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
00000000001ce225	movq	%rax, %r15
00000000001ce228	movq	%rax, %rdi
00000000001ce22b	movl	%r14d, %esi
00000000001ce22e	callq	__ZN9HGLensGDCC1ENS_26hgLensGDCInterpolationModeE ## HGLensGDC::HGLensGDC(HGLensGDC::hgLensGDCInterpolationMode)
00000000001ce233	leaq	0x2c0(%rbx), %r14
00000000001ce23a	movq	(%r15), %rax
00000000001ce23d	movq	%r15, %rdi
00000000001ce240	xorl	%esi, %esi
00000000001ce242	movq	%r12, %rdx
00000000001ce245	callq	*0x78(%rax)
00000000001ce248	movq	(%r12), %rax
00000000001ce24c	movq	%r12, %rdi
00000000001ce24f	callq	*0x18(%rax)
00000000001ce252	movss	0x244(%rbx), %xmm0
00000000001ce25a	movss	0x248(%rbx), %xmm1
00000000001ce262	movq	%r15, %rdi
00000000001ce265	movq	%r14, %rsi
00000000001ce268	callq	__ZN9HGLensGDC13SetParametersEffRKN14HGColorConform13GDCParametersE ## HGLensGDC::SetParameters(float, float, HGColorConform::GDCParameters const&)
00000000001ce26d	jmp	0x1ce272
00000000001ce26f	movq	%r12, %r15
00000000001ce272	movl	$0x4a0, %edi                    ## imm = 0x4A0
00000000001ce277	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
00000000001ce27c	movq	%rax, %r14
00000000001ce27f	movq	%rax, %rdi
00000000001ce282	callq	__ZN12HGColorGammaC1Ev          ## HGColorGamma::HGColorGamma()
00000000001ce287	movzbl	0x1da(%rbx), %esi
00000000001ce28e	movq	%r14, %rdi
00000000001ce291	callq	__ZN12HGColorGamma26SetAntiSymmetricToneCurvesEb ## HGColorGamma::SetAntiSymmetricToneCurves(bool)
00000000001ce296	movq	(%r14), %rax
00000000001ce299	movq	%r14, %rdi
00000000001ce29c	xorl	%esi, %esi
00000000001ce29e	movq	%r15, %rdx
00000000001ce2a1	callq	*0x78(%rax)
00000000001ce2a4	movq	(%r15), %rax
00000000001ce2a7	movq	%r15, %rdi
00000000001ce2aa	callq	*0x18(%rax)
00000000001ce2ad	movss	0x1dc(%rbx), %xmm0
00000000001ce2b5	movss	0x1e0(%rbx), %xmm1
00000000001ce2bd	movq	%r14, %rdi
00000000001ce2c0	callq	__ZN12HGColorGamma22Set1DLutScaleAndOffsetEff ## HGColorGamma::Set1DLutScaleAndOffset(float, float)
00000000001ce2c5	movl	0x310(%rbx), %esi
00000000001ce2cb	movl	0x314(%rbx), %r8d
00000000001ce2d2	movl	$0x0, (%rsp)
00000000001ce2d9	movq	%r14, %rdi
00000000001ce2dc	movl	$0x8, %edx
00000000001ce2e1	xorl	%ecx, %ecx
00000000001ce2e3	movl	$0x8, %r9d
00000000001ce2e9	callq	__ZN12HGColorGamma13SetConversionENS_26hgColorGammaColorPrimariesENS_28hgColorGammaTransferFunctionENS_30hgColorGammaMatrixCoefficientsES0_S1_S2_ ## HGColorGamma::SetConversion(HGColorGamma::hgColorGammaColorPrimaries, HGColorGamma::hgColorGammaTransferFunction, HGColorGamma::hgColorGammaMatrixCoefficients, HGColorGamma::hgColorGammaColorPrimaries, HGColorGamma::hgColorGammaTransferFunction, HGColorGamma::hgColorGammaMatrixCoefficients)
00000000001ce2ee	movl	$0x1b0, %edi                    ## imm = 0x1B0
00000000001ce2f3	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
00000000001ce2f8	movq	%rax, %r15
00000000001ce2fb	movl	0x318(%rbx), %esi
00000000001ce301	movq	%rax, %rdi
00000000001ce304	callq	__ZN17HGCameraLogEncodeC1EN14HGColorConform30hgColorConformRAWToLogEncodingE ## HGCameraLogEncode::HGCameraLogEncode(HGColorConform::hgColorConformRAWToLogEncoding)
00000000001ce309	movq	(%r15), %rax
00000000001ce30c	movq	%r15, %rdi
00000000001ce30f	xorl	%esi, %esi
00000000001ce311	movq	%r14, %rdx
00000000001ce314	callq	*0x78(%rax)
00000000001ce317	movq	(%r14), %rax
00000000001ce31a	movq	%r14, %rdi
00000000001ce31d	callq	*0x18(%rax)
00000000001ce320	movq	%r15, 0x1a0(%rbx)
00000000001ce327	jmp	0x1cedeb
00000000001ce32c	movq	0x358(%rbx), %rdi
00000000001ce333	testq	%rdi, %rdi
00000000001ce336	je	0x1ce717
00000000001ce33c	movq	0x833f85(%rip), %rsi            ## literal pool symbol address: __ZTI17HGRAWRendererBase
00000000001ce343	movq	0x833f8e(%rip), %rdx            ## literal pool symbol address: __ZTI28HGVTRAWProcessorRendererBase
00000000001ce34a	xorl	%ecx, %ecx
00000000001ce34c	callq	0x3c5018                        ## symbol stub for: ___dynamic_cast
00000000001ce351	testq	%rax, %rax
00000000001ce354	je	0x1ce717
00000000001ce35a	movq	%rax, -0xa0(%rbp)
00000000001ce361	movq	0x360(%rbx), %rax
00000000001ce368	movq	%rax, -0x98(%rbp)
00000000001ce36f	testq	%rax, %rax
00000000001ce372	je	0x1ce721
00000000001ce378	lock
00000000001ce379	incq	0x8(%rax)
00000000001ce37d	jmp	0x1ce721
00000000001ce382	movq	%r14, %rdi
00000000001ce385	callq	__ZN12HGColorGammaC1Ev          ## HGColorGamma::HGColorGamma()
00000000001ce38a	movzbl	0x1da(%rbx), %esi
00000000001ce391	movq	%r14, %rdi
00000000001ce394	callq	__ZN12HGColorGamma26SetAntiSymmetricToneCurvesEb ## HGColorGamma::SetAntiSymmetricToneCurves(bool)
00000000001ce399	movq	%r14, 0x198(%rbx)
00000000001ce3a0	movq	%r14, 0x1a0(%rbx)
00000000001ce3a7	movss	0x1dc(%rbx), %xmm0
00000000001ce3af	movss	0x1e0(%rbx), %xmm1
00000000001ce3b7	movq	%r14, %rdi
00000000001ce3ba	callq	__ZN12HGColorGamma22Set1DLutScaleAndOffsetEff ## HGColorGamma::Set1DLutScaleAndOffset(float, float)
00000000001ce3bf	cmpl	$0x15, %r12d
00000000001ce3c3	ja	0x1ce94d
00000000001ce3c9	movl	%r12d, %eax
00000000001ce3cc	leaq	0xea9(%rip), %rcx
00000000001ce3d3	movslq	(%rcx,%rax,4), %rax
00000000001ce3d7	addq	%rcx, %rax
00000000001ce3da	jmpq	*%rax
00000000001ce3dc	movq	%r14, %rdi
00000000001ce3df	movl	$0x1, %esi
00000000001ce3e4	callq	__ZN12HGColorGamma19SetConversionPresetENS_28hgColorGammaConversionPresetE ## HGColorGamma::SetConversionPreset(HGColorGamma::hgColorGammaConversionPreset)
00000000001ce3e9	jmp	0x1cede6
00000000001ce3ee	movq	%r14, %rdi
00000000001ce3f1	callq	__ZN12HGColorGammaC1Ev          ## HGColorGamma::HGColorGamma()
00000000001ce3f6	movzbl	0x1da(%rbx), %esi
00000000001ce3fd	movq	%r14, %rdi
00000000001ce400	callq	__ZN12HGColorGamma26SetAntiSymmetricToneCurvesEb ## HGColorGamma::SetAntiSymmetricToneCurves(bool)
00000000001ce405	movl	$0x1a0, %edi                    ## imm = 0x1A0
00000000001ce40a	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
00000000001ce40f	movq	%rax, %r12
00000000001ce412	movq	%rax, %rdi
00000000001ce415	callq	__ZN24HgcColorGamma_bias_clampC1Ev ## HgcColorGamma_bias_clamp::HgcColorGamma_bias_clamp()
00000000001ce41a	movl	$0x4a0, %edi                    ## imm = 0x4A0
00000000001ce41f	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
00000000001ce424	movq	%rax, %r15
00000000001ce427	movq	%rax, %rdi
00000000001ce42a	callq	__ZN12HGColorGammaC1Ev          ## HGColorGamma::HGColorGamma()
00000000001ce42f	movzbl	0x1da(%rbx), %esi
00000000001ce436	movq	%r15, %rdi
00000000001ce439	callq	__ZN12HGColorGamma26SetAntiSymmetricToneCurvesEb ## HGColorGamma::SetAntiSymmetricToneCurves(bool)
00000000001ce43e	movq	(%r12), %rax
00000000001ce442	movq	%r12, %rdi
00000000001ce445	xorl	%esi, %esi
00000000001ce447	movq	%r14, %rdx
00000000001ce44a	callq	*0x78(%rax)
00000000001ce44d	movq	(%r15), %rax
00000000001ce450	movq	%r15, %rdi
00000000001ce453	xorl	%esi, %esi
00000000001ce455	movq	%r12, %rdx
00000000001ce458	callq	*0x78(%rax)
00000000001ce45b	movq	(%r14), %rax
00000000001ce45e	movq	%r14, %rdi
00000000001ce461	callq	*0x18(%rax)
00000000001ce464	movq	(%r12), %rax
00000000001ce468	movq	%r12, %rdi
00000000001ce46b	callq	*0x18(%rax)
00000000001ce46e	movq	%r14, 0x198(%rbx)
00000000001ce475	movq	%r15, 0x1a0(%rbx)
00000000001ce47c	movl	0x200(%rbx), %ecx
00000000001ce482	movl	$0x0, (%rsp)
00000000001ce489	movq	%r14, %rdi
00000000001ce48c	xorl	%esi, %esi
00000000001ce48e	movl	$0x1, %edx
00000000001ce493	xorl	%r8d, %r8d
00000000001ce496	movl	$0x1, %r9d
00000000001ce49c	callq	__ZN12HGColorGamma13SetConversionENS_26hgColorGammaColorPrimariesENS_28hgColorGammaTransferFunctionENS_30hgColorGammaMatrixCoefficientsES0_S1_S2_ ## HGColorGamma::SetConversion(HGColorGamma::hgColorGammaColorPrimaries, HGColorGamma::hgColorGammaTransferFunction, HGColorGamma::hgColorGammaMatrixCoefficients, HGColorGamma::hgColorGammaColorPrimaries, HGColorGamma::hgColorGammaTransferFunction, HGColorGamma::hgColorGammaMatrixCoefficients)
00000000001ce4a1	movq	(%r12), %rax
00000000001ce4a5	movss	0x690ae7(%rip), %xmm0
00000000001ce4ad	xorps	%xmm3, %xmm3
00000000001ce4b0	movq	%r12, %rdi
00000000001ce4b3	xorl	%esi, %esi
00000000001ce4b5	movaps	%xmm0, %xmm1
00000000001ce4b8	movaps	%xmm0, %xmm2
00000000001ce4bb	callq	*0x60(%rax)
00000000001ce4be	movq	(%r12), %rax
00000000001ce4c2	movss	0x690ace(%rip), %xmm0
00000000001ce4ca	movss	0x1f97ee(%rip), %xmm3
00000000001ce4d2	movq	%r12, %rdi
00000000001ce4d5	movl	$0x1, %esi
00000000001ce4da	movaps	%xmm0, %xmm1
00000000001ce4dd	movaps	%xmm0, %xmm2
00000000001ce4e0	callq	*0x60(%rax)
00000000001ce4e3	movq	(%r12), %rax
00000000001ce4e7	movss	0x1fed05(%rip), %xmm0
00000000001ce4ef	movq	%r12, %rdi
00000000001ce4f2	movl	$0x2, %esi
00000000001ce4f7	movaps	%xmm0, %xmm1
00000000001ce4fa	movaps	%xmm0, %xmm2
00000000001ce4fd	movaps	%xmm0, %xmm3
00000000001ce500	callq	*0x60(%rax)
00000000001ce503	movq	(%r12), %rax
00000000001ce507	movss	0x1fd1a1(%rip), %xmm0
00000000001ce50f	movq	%r12, %rdi
00000000001ce512	movl	$0x3, %esi
00000000001ce517	movaps	%xmm0, %xmm1
00000000001ce51a	movaps	%xmm0, %xmm2
00000000001ce51d	movaps	%xmm0, %xmm3
00000000001ce520	callq	*0x60(%rax)
00000000001ce523	movq	%r15, %r12
00000000001ce526	movl	0x208(%rbx), %edx
00000000001ce52c	xorl	%esi, %esi
00000000001ce52e	cmpl	$0x8, %edx
00000000001ce531	je	0x1cda61
00000000001ce537	jmp	0x1cda67
00000000001ce53c	leaq	__ZN12HGColorGamma23logGamutRGBToRec2020RGBE(%rip), %rcx ## HGColorGamma::logGamutRGBToRec2020RGB
00000000001ce543	movss	0x34c(%rbx), %xmm0
00000000001ce54b	shufps	$0xc0, %xmm0, %xmm0             ## xmm0 = xmm0[0,0,0,3]
00000000001ce54f	insertps	$0x30, 0x1f9767(%rip), %xmm0    ## xmm0 = xmm0[0,1,2],mem[0]
00000000001ce559	movaps	(%rcx,%rax), %xmm1
00000000001ce55d	mulps	%xmm0, %xmm1
00000000001ce560	movaps	%xmm1, -0x70(%rbp)
00000000001ce564	movaps	0x10(%rcx,%rax), %xmm1
00000000001ce569	mulps	%xmm0, %xmm1
00000000001ce56c	movaps	%xmm1, -0x60(%rbp)
00000000001ce570	movaps	0x20(%rcx,%rax), %xmm1
00000000001ce575	mulps	%xmm0, %xmm1
00000000001ce578	movaps	%xmm1, -0x50(%rbp)
00000000001ce57c	mulps	0x30(%rcx,%rax), %xmm0
00000000001ce581	movaps	%xmm0, -0x40(%rbp)
00000000001ce585	leaq	-0x70(%rbp), %rsi
00000000001ce589	movq	%r12, %rdi
00000000001ce58c	callq	__ZN12HGColorGamma11LoadMatrix2EPKDv4_f ## HGColorGamma::LoadMatrix2(float vector[4] const*)
00000000001ce591	jmp	0x1ced88
00000000001ce596	movl	$0x4a0, %edi                    ## imm = 0x4A0
00000000001ce59b	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
00000000001ce5a0	movq	%rax, %r14
00000000001ce5a3	movq	%rax, %rdi
00000000001ce5a6	callq	__ZN12HGColorGammaC1Ev          ## HGColorGamma::HGColorGamma()
00000000001ce5ab	movzbl	0x1da(%rbx), %esi
00000000001ce5b2	movq	%r14, %rdi
00000000001ce5b5	callq	__ZN12HGColorGamma26SetAntiSymmetricToneCurvesEb ## HGColorGamma::SetAntiSymmetricToneCurves(bool)
00000000001ce5ba	movq	%r14, 0x198(%rbx)
00000000001ce5c1	movq	%r14, 0x1a0(%rbx)
00000000001ce5c8	movl	0x200(%rbx), %esi
00000000001ce5ce	cmpl	$0x1, 0x204(%rbx)
00000000001ce5d5	movl	0x210(%rbx), %r8d
00000000001ce5dc	movq	%r14, %rdi
00000000001ce5df	jne	0x1ce95c
00000000001ce5e5	movl	$0x1, %edx
00000000001ce5ea	movl	$0x3, %ecx
00000000001ce5ef	callq	__ZN12HGColorGamma13SetConversionENS_30hgColorGammaMatrixCoefficientsENS_20hgColorGammaLogCurveENS_20hgColorGammaLogGamutENS_26hgColorGammaColorPrimariesE ## HGColorGamma::SetConversion(HGColorGamma::hgColorGammaMatrixCoefficients, HGColorGamma::hgColorGammaLogCurve, HGColorGamma::hgColorGammaLogGamut, HGColorGamma::hgColorGammaColorPrimaries)
00000000001ce5f4	jmp	0x1cede6
00000000001ce5f9	movl	$0x4a0, %edi                    ## imm = 0x4A0
00000000001ce5fe	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
00000000001ce603	movq	%rax, %r15
00000000001ce606	movq	%rax, %rdi
00000000001ce609	callq	__ZN12HGColorGammaC1Ev          ## HGColorGamma::HGColorGamma()
00000000001ce60e	movzbl	0x1da(%rbx), %esi
00000000001ce615	movq	%r15, %rdi
00000000001ce618	callq	__ZN12HGColorGamma26SetAntiSymmetricToneCurvesEb ## HGColorGamma::SetAntiSymmetricToneCurves(bool)
00000000001ce61d	movl	$0x4a0, %edi                    ## imm = 0x4A0
00000000001ce622	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
00000000001ce627	movq	%rax, %r14
00000000001ce62a	movq	%rax, %rdi
00000000001ce62d	callq	__ZN12HGColorGammaC1Ev          ## HGColorGamma::HGColorGamma()
00000000001ce632	movzbl	0x1da(%rbx), %esi
00000000001ce639	movq	%r14, %rdi
00000000001ce63c	callq	__ZN12HGColorGamma26SetAntiSymmetricToneCurvesEb ## HGColorGamma::SetAntiSymmetricToneCurves(bool)
00000000001ce641	movl	$0x4a0, %edi                    ## imm = 0x4A0
00000000001ce646	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
00000000001ce64b	movq	%rax, %r12
00000000001ce64e	movq	%rax, %rdi
00000000001ce651	callq	__ZN12HGColorGammaC1Ev          ## HGColorGamma::HGColorGamma()
00000000001ce656	movzbl	0x1da(%rbx), %esi
00000000001ce65d	movq	%r12, %rdi
00000000001ce660	callq	__ZN12HGColorGamma26SetAntiSymmetricToneCurvesEb ## HGColorGamma::SetAntiSymmetricToneCurves(bool)
00000000001ce665	movq	(%r14), %rax
00000000001ce668	movq	%r14, %rdi
00000000001ce66b	xorl	%esi, %esi
00000000001ce66d	movq	%r15, %rdx
00000000001ce670	callq	*0x78(%rax)
00000000001ce673	movq	(%r12), %rax
00000000001ce677	movq	%r12, %rdi
00000000001ce67a	xorl	%esi, %esi
00000000001ce67c	movq	%r14, %rdx
00000000001ce67f	callq	*0x78(%rax)
00000000001ce682	movq	(%r15), %rax
00000000001ce685	movq	%r15, %rdi
00000000001ce688	callq	*0x18(%rax)
00000000001ce68b	movq	(%r14), %rax
00000000001ce68e	movq	%r14, %rdi
00000000001ce691	callq	*0x18(%rax)
00000000001ce694	movq	%r15, 0x198(%rbx)
00000000001ce69b	movq	%r12, 0x1a0(%rbx)
00000000001ce6a2	movl	0x200(%rbx), %esi
00000000001ce6a8	cmpl	$0x4, 0x204(%rbx)
00000000001ce6af	movl	0x210(%rbx), %r8d
00000000001ce6b6	movq	%r15, %rdi
00000000001ce6b9	jne	0x1ce96d
00000000001ce6bf	movl	$0xc, %edx
00000000001ce6c4	movl	$0xb, %ecx
00000000001ce6c9	jmp	0x1ce977
00000000001ce6ce	movq	%r14, %rdi
00000000001ce6d1	xorl	%esi, %esi
00000000001ce6d3	callq	__ZN12HGColorGamma19SetConversionPresetENS_28hgColorGammaConversionPresetE ## HGColorGamma::SetConversionPreset(HGColorGamma::hgColorGammaConversionPreset)
00000000001ce6d8	movss	0x1dc(%rbx), %xmm0
00000000001ce6e0	movss	0x1e0(%rbx), %xmm1
00000000001ce6e8	movq	%r14, %rdi
00000000001ce6eb	callq	__ZN12HGColorGamma22Set1DLutScaleAndOffsetEff ## HGColorGamma::Set1DLutScaleAndOffset(float, float)
00000000001ce6f0	jmp	0x1cede6
00000000001ce6f5	xorps	%xmm0, %xmm0
00000000001ce6f8	movaps	%xmm0, -0xb0(%rbp)
00000000001ce6ff	leaq	-0xb0(%rbp), %rsi
00000000001ce706	movq	%r14, %rdi
00000000001ce709	callq	__ZN21HGProResPluginDebayerC1ENSt3__110shared_ptrI22HGPRRawSdkRendererBaseEE ## HGProResPluginDebayer::HGProResPluginDebayer(std::__1::shared_ptr<HGPRRawSdkRendererBase>)
00000000001ce70e	movq	-0xa8(%rbp), %r15
00000000001ce715	jmp	0x1ce737
00000000001ce717	xorps	%xmm0, %xmm0
00000000001ce71a	movaps	%xmm0, -0xa0(%rbp)
00000000001ce721	leaq	-0xa0(%rbp), %rsi
00000000001ce728	movq	%r14, %rdi
00000000001ce72b	callq	__ZN23HGVTRAWProcessorDebayerC1ENSt3__110shared_ptrI28HGVTRAWProcessorRendererBaseEE ## HGVTRAWProcessorDebayer::HGVTRAWProcessorDebayer(std::__1::shared_ptr<HGVTRAWProcessorRendererBase>)
00000000001ce730	movq	-0x98(%rbp), %r15
00000000001ce737	testq	%r15, %r15
00000000001ce73a	je	0x1ce75f
00000000001ce73c	movq	$-0x1, %rax
00000000001ce743	lock
00000000001ce744	xaddq	%rax, 0x8(%r15)
00000000001ce749	testq	%rax, %rax
00000000001ce74c	jne	0x1ce75f
00000000001ce74e	movq	(%r15), %rax
00000000001ce751	movq	%r15, %rdi
00000000001ce754	callq	*0x10(%rax)
00000000001ce757	movq	%r15, %rdi
00000000001ce75a	callq	0x3c4efe                        ## symbol stub for: __ZNSt3__119__shared_weak_count14__release_weakEv
00000000001ce75f	testq	%r14, %r14
00000000001ce762	je	0x1cee3b
00000000001ce768	movq	%r14, 0x198(%rbx)
00000000001ce76f	movl	$0x1b0, %edi                    ## imm = 0x1B0
00000000001ce774	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
00000000001ce779	movq	%rax, %r15
00000000001ce77c	movl	0x318(%rbx), %esi
00000000001ce782	movq	%rax, %rdi
00000000001ce785	callq	__ZN17HGCameraLogEncodeC1EN14HGColorConform30hgColorConformRAWToLogEncodingE ## HGCameraLogEncode::HGCameraLogEncode(HGColorConform::hgColorConformRAWToLogEncoding)
00000000001ce78a	movq	(%r15), %rax
00000000001ce78d	movq	%r15, %rdi
00000000001ce790	xorl	%esi, %esi
00000000001ce792	movq	%r14, %rdx
00000000001ce795	callq	*0x78(%rax)
00000000001ce798	movq	(%r14), %rax
00000000001ce79b	movq	%r14, %rdi
00000000001ce79e	callq	*0x18(%rax)
00000000001ce7a1	movq	%r15, 0x1a0(%rbx)
00000000001ce7a8	jmp	0x1cee47
00000000001ce7ad	movq	(%r13), %rax
00000000001ce7b1	movq	$0x0, -0x78(%rbp)
00000000001ce7b9	movq	%r13, %rdi
00000000001ce7bc	xorl	%esi, %esi
00000000001ce7be	movq	%r15, %rdx
00000000001ce7c1	callq	*0x78(%rax)
00000000001ce7c4	movq	(%r14), %rax
00000000001ce7c7	movq	%r14, %rdi
00000000001ce7ca	xorl	%esi, %esi
00000000001ce7cc	movq	%r13, %rdx
00000000001ce7cf	callq	*0x78(%rax)
00000000001ce7d2	movq	%r15, %r12
00000000001ce7d5	movq	(%r12), %rax
00000000001ce7d9	movq	%r12, -0x80(%rbp)
00000000001ce7dd	movq	%r12, %rdi
00000000001ce7e0	callq	*0x18(%rax)
00000000001ce7e3	movq	(%r13), %rax
00000000001ce7e7	movq	%r13, -0x88(%rbp)
00000000001ce7ee	movq	%r13, %rdi
00000000001ce7f1	callq	*0x18(%rax)
00000000001ce7f4	movq	%r15, 0x198(%rbx)
00000000001ce7fb	movq	%r14, 0x1a0(%rbx)
00000000001ce802	movl	0x204(%rbx), %eax
00000000001ce808	cmpl	$0x9, %eax
00000000001ce80b	movq	%r14, %r12
00000000001ce80e	je	0x1ce83d
00000000001ce810	cmpl	$0x7, %eax
00000000001ce813	je	0x1ce83d
00000000001ce815	cmpl	$0x6, %eax
00000000001ce818	jne	0x1ce9e7
00000000001ce81e	movl	0x200(%rbx), %esi
00000000001ce824	movl	0x210(%rbx), %r8d
00000000001ce82b	movq	%r15, %rdi
00000000001ce82e	movl	$0x8, %edx
00000000001ce833	movl	$0x5, %ecx
00000000001ce838	jmp	0x1cea01
00000000001ce83d	movl	0x200(%rbx), %ecx
00000000001ce843	movl	$0x0, (%rsp)
00000000001ce84a	movq	%r15, %rdi
00000000001ce84d	xorl	%esi, %esi
00000000001ce84f	movl	$0x1, %edx
00000000001ce854	xorl	%r8d, %r8d
00000000001ce857	movl	$0x1, %r9d
00000000001ce85d	callq	__ZN12HGColorGamma13SetConversionENS_26hgColorGammaColorPrimariesENS_28hgColorGammaTransferFunctionENS_30hgColorGammaMatrixCoefficientsES0_S1_S2_ ## HGColorGamma::SetConversion(HGColorGamma::hgColorGammaColorPrimaries, HGColorGamma::hgColorGammaTransferFunction, HGColorGamma::hgColorGammaMatrixCoefficients, HGColorGamma::hgColorGammaColorPrimaries, HGColorGamma::hgColorGammaTransferFunction, HGColorGamma::hgColorGammaMatrixCoefficients)
00000000001ce862	movq	-0x80(%rbp), %r13
00000000001ce866	movl	0x204(%rbx), %eax
00000000001ce86c	cmpl	$0x9, %eax
00000000001ce86f	jne	0x1cea15
00000000001ce875	jmp	0x1cea1e
00000000001ce87a	movq	%rbx, %rdi
00000000001ce87d	callq	__ZNK14HGColorConform20CreateColorGammaNodeEv ## HGColorConform::CreateColorGammaNode() const
00000000001ce882	movq	%rax, %r15
00000000001ce885	movq	%rbx, %rdi
00000000001ce888	callq	__ZNK14HGColorConform20CreateColorGammaNodeEv ## HGColorConform::CreateColorGammaNode() const
00000000001ce88d	movq	%rax, %r12
00000000001ce890	movq	(%rax), %rax
00000000001ce893	movq	%r12, %rdi
00000000001ce896	xorl	%esi, %esi
00000000001ce898	movq	%r15, %rdx
00000000001ce89b	callq	*0x78(%rax)
00000000001ce89e	movq	(%r15), %rax
00000000001ce8a1	movq	%r15, %rdi
00000000001ce8a4	callq	*0x18(%rax)
00000000001ce8a7	movq	%r15, 0x198(%rbx)
00000000001ce8ae	movq	%r12, 0x1a0(%rbx)
00000000001ce8b5	movl	0x200(%rbx), %esi
00000000001ce8bb	movl	0x210(%rbx), %r8d
00000000001ce8c2	movq	%r15, %rdi
00000000001ce8c5	xorl	%edx, %edx
00000000001ce8c7	movl	$0x3, %ecx
00000000001ce8cc	callq	__ZN12HGColorGamma13SetConversionENS_30hgColorGammaMatrixCoefficientsENS_20hgColorGammaLogCurveENS_20hgColorGammaLogGamutENS_26hgColorGammaColorPrimariesE ## HGColorGamma::SetConversion(HGColorGamma::hgColorGammaMatrixCoefficients, HGColorGamma::hgColorGammaLogCurve, HGColorGamma::hgColorGammaLogGamut, HGColorGamma::hgColorGammaColorPrimaries)
00000000001ce8d1	movq	%r12, %rdi
00000000001ce8d4	xorl	%esi, %esi
00000000001ce8d6	callq	__ZN12HGColorGamma19SetConversionPresetENS_28hgColorGammaConversionPresetE ## HGColorGamma::SetConversionPreset(HGColorGamma::hgColorGammaConversionPreset)
00000000001ce8db	movaps	0x69069e(%rip), %xmm0
00000000001ce8e2	xorps	%xmm1, %xmm1
00000000001ce8e5	xorps	%xmm2, %xmm2
00000000001ce8e8	xorps	%xmm3, %xmm3
00000000001ce8eb	xorpd	%xmm4, %xmm4
00000000001ce8ef	xorps	%xmm5, %xmm5
00000000001ce8f2	xorps	%xmm6, %xmm6
00000000001ce8f5	movq	%r12, %rdi
00000000001ce8f8	xorl	%esi, %esi
00000000001ce8fa	callq	__ZN12HGColorGamma16SetGammaFunctionENS_16hgColorGammaFormEDv4_fS1_S1_S1_S1_S1_S1_ ## HGColorGamma::SetGammaFunction(HGColorGamma::hgColorGammaForm, float vector[4], float vector[4], float vector[4], float vector[4], float vector[4], float vector[4], float vector[4])
00000000001ce8ff	movss	0x1dc(%rbx), %xmm0
00000000001ce907	movss	0x1e0(%rbx), %xmm1
00000000001ce90f	movq	%r12, %rdi
00000000001ce912	callq	__ZN12HGColorGamma22Set1DLutScaleAndOffsetEff ## HGColorGamma::Set1DLutScaleAndOffset(float, float)
00000000001ce917	jmp	0x1ced93
00000000001ce91c	movq	%rbx, %rdi
00000000001ce91f	callq	__ZNK14HGColorConform20CreateColorGammaNodeEv ## HGColorConform::CreateColorGammaNode() const
00000000001ce924	movq	%rax, %r14
00000000001ce927	movq	%rax, 0x198(%rbx)
00000000001ce92e	movq	%rax, 0x1a0(%rbx)
00000000001ce935	movss	0x1dc(%rbx), %xmm0
00000000001ce93d	movss	0x1e0(%rbx), %xmm1
00000000001ce945	movq	%rax, %rdi
00000000001ce948	callq	__ZN12HGColorGamma22Set1DLutScaleAndOffsetEff ## HGColorGamma::Set1DLutScaleAndOffset(float, float)
00000000001ce94d	movq	%r14, %rdi
00000000001ce950	xorl	%esi, %esi
00000000001ce952	callq	__ZN12HGColorGamma19SetConversionPresetENS_28hgColorGammaConversionPresetE ## HGColorGamma::SetConversionPreset(HGColorGamma::hgColorGammaConversionPreset)
00000000001ce957	jmp	0x1cede6
00000000001ce95c	movl	$0x4, %edx
00000000001ce961	xorl	%ecx, %ecx
00000000001ce963	callq	__ZN12HGColorGamma13SetConversionENS_30hgColorGammaMatrixCoefficientsENS_20hgColorGammaLogCurveENS_20hgColorGammaLogGamutENS_26hgColorGammaColorPrimariesE ## HGColorGamma::SetConversion(HGColorGamma::hgColorGammaMatrixCoefficients, HGColorGamma::hgColorGammaLogCurve, HGColorGamma::hgColorGammaLogGamut, HGColorGamma::hgColorGammaColorPrimaries)
00000000001ce968	jmp	0x1cede6
00000000001ce96d	movl	$0xd, %edx
00000000001ce972	movl	$0xc, %ecx
00000000001ce977	callq	__ZN12HGColorGamma13SetConversionENS_30hgColorGammaMatrixCoefficientsENS_20hgColorGammaLogCurveENS_20hgColorGammaLogGamutENS_26hgColorGammaColorPrimariesE ## HGColorGamma::SetConversion(HGColorGamma::hgColorGammaMatrixCoefficients, HGColorGamma::hgColorGammaLogCurve, HGColorGamma::hgColorGammaLogGamut, HGColorGamma::hgColorGammaColorPrimaries)
00000000001ce97c	movaps	0x1f92bd(%rip), %xmm0
00000000001ce983	xorps	%xmm1, %xmm1
00000000001ce986	xorps	%xmm2, %xmm2
00000000001ce989	xorps	%xmm3, %xmm3
00000000001ce98c	xorpd	%xmm4, %xmm4
00000000001ce990	xorps	%xmm5, %xmm5
00000000001ce993	xorps	%xmm6, %xmm6
00000000001ce996	movq	%r14, %rdi
00000000001ce999	movl	$0x12, %esi
00000000001ce99e	callq	__ZN12HGColorGamma16SetGammaFunctionENS_16hgColorGammaFormEDv4_fS1_S1_S1_S1_S1_S1_ ## HGColorGamma::SetGammaFunction(HGColorGamma::hgColorGammaForm, float vector[4], float vector[4], float vector[4], float vector[4], float vector[4], float vector[4], float vector[4])
00000000001ce9a3	movl	0x1b4(%rbx), %esi
00000000001ce9a9	movq	%r14, %rdi
00000000001ce9ac	callq	__ZN12HGColorGamma18SetToneQualityModeENS_23hgColorGammaToneQualityE ## HGColorGamma::SetToneQualityMode(HGColorGamma::hgColorGammaToneQuality)
00000000001ce9b1	movq	%r14, %rdi
00000000001ce9b4	xorl	%esi, %esi
00000000001ce9b6	xorl	%edx, %edx
00000000001ce9b8	callq	__ZN12HGColorGamma19SetPremultiplyStateEbb ## HGColorGamma::SetPremultiplyState(bool, bool)
00000000001ce9bd	movl	0x210(%rbx), %esi
00000000001ce9c3	movl	$0x0, (%rsp)
00000000001ce9ca	movq	%r12, %rdi
00000000001ce9cd	movl	$0x1, %edx
00000000001ce9d2	xorl	%ecx, %ecx
00000000001ce9d4	movl	%esi, %r8d
00000000001ce9d7	movl	$0x8, %r9d
00000000001ce9dd	callq	__ZN12HGColorGamma13SetConversionENS_26hgColorGammaColorPrimariesENS_28hgColorGammaTransferFunctionENS_30hgColorGammaMatrixCoefficientsES0_S1_S2_ ## HGColorGamma::SetConversion(HGColorGamma::hgColorGammaColorPrimaries, HGColorGamma::hgColorGammaTransferFunction, HGColorGamma::hgColorGammaMatrixCoefficients, HGColorGamma::hgColorGammaColorPrimaries, HGColorGamma::hgColorGammaTransferFunction, HGColorGamma::hgColorGammaMatrixCoefficients)
00000000001ce9e2	jmp	0x1ced93
00000000001ce9e7	movl	0x200(%rbx), %esi
00000000001ce9ed	movl	0x210(%rbx), %r8d
00000000001ce9f4	movq	%r15, %rdi
00000000001ce9f7	movl	$0x9, %edx
00000000001ce9fc	movl	$0x8, %ecx
00000000001cea01	callq	__ZN12HGColorGamma13SetConversionENS_30hgColorGammaMatrixCoefficientsENS_20hgColorGammaLogCurveENS_20hgColorGammaLogGamutENS_26hgColorGammaColorPrimariesE ## HGColorGamma::SetConversion(HGColorGamma::hgColorGammaMatrixCoefficients, HGColorGamma::hgColorGammaLogCurve, HGColorGamma::hgColorGammaLogGamut, HGColorGamma::hgColorGammaColorPrimaries)
00000000001cea06	movq	-0x80(%rbp), %r13
00000000001cea0a	movl	0x204(%rbx), %eax
00000000001cea10	cmpl	$0x9, %eax
00000000001cea13	je	0x1cea1e
00000000001cea15	cmpl	$0x7, %eax
00000000001cea18	jne	0x1ceae5
00000000001cea1e	movq	-0x78(%rbp), %r14
00000000001cea22	movq	(%r14), %rax
00000000001cea25	movss	0x690567(%rip), %xmm0
00000000001cea2d	xorps	%xmm3, %xmm3
00000000001cea30	movq	%r14, %rdi
00000000001cea33	xorl	%esi, %esi
00000000001cea35	movaps	%xmm0, %xmm1
00000000001cea38	movaps	%xmm0, %xmm2
00000000001cea3b	callq	*0x60(%rax)
00000000001cea3e	movq	(%r14), %rax
00000000001cea41	movss	0x69054f(%rip), %xmm0
00000000001cea49	movss	0x1f926f(%rip), %xmm3
00000000001cea51	movq	%r14, %rdi
00000000001cea54	movl	$0x1, %esi
00000000001cea59	movaps	%xmm0, %xmm1
00000000001cea5c	movaps	%xmm0, %xmm2
00000000001cea5f	callq	*0x60(%rax)
00000000001cea62	movq	(%r14), %rax
00000000001cea65	movss	0x1fe787(%rip), %xmm0
00000000001cea6d	movq	%r14, %rdi
00000000001cea70	movl	$0x2, %esi
00000000001cea75	movaps	%xmm0, %xmm1
00000000001cea78	movaps	%xmm0, %xmm2
00000000001cea7b	movaps	%xmm0, %xmm3
00000000001cea7e	callq	*0x60(%rax)
00000000001cea81	movq	(%r14), %rax
00000000001cea84	movss	0x1fcc24(%rip), %xmm0
00000000001cea8c	movq	%r14, %rdi
00000000001cea8f	movl	$0x3, %esi
00000000001cea94	movaps	%xmm0, %xmm1
00000000001cea97	movaps	%xmm0, %xmm2
00000000001cea9a	movaps	%xmm0, %xmm3
00000000001cea9d	callq	*0x60(%rax)
00000000001ceaa0	movl	0x210(%rbx), %r8d
00000000001ceaa7	xorl	%ecx, %ecx
00000000001ceaa9	cmpl	$0x7, 0x204(%rbx)
00000000001ceab0	setne	%cl
00000000001ceab3	addl	$0x7, %ecx
00000000001ceab6	movq	%r13, %rdi
00000000001ceab9	xorl	%esi, %esi
00000000001ceabb	movl	$0x9, %edx
00000000001ceac0	callq	__ZN12HGColorGamma13SetConversionENS_30hgColorGammaMatrixCoefficientsENS_20hgColorGammaLogCurveENS_20hgColorGammaLogGamutENS_26hgColorGammaColorPrimariesE ## HGColorGamma::SetConversion(HGColorGamma::hgColorGammaMatrixCoefficients, HGColorGamma::hgColorGammaLogCurve, HGColorGamma::hgColorGammaLogGamut, HGColorGamma::hgColorGammaColorPrimaries)
00000000001ceac5	movl	0x1b4(%rbx), %esi
00000000001ceacb	movq	%r13, %rdi
00000000001ceace	callq	__ZN12HGColorGamma18SetToneQualityModeENS_23hgColorGammaToneQualityE ## HGColorGamma::SetToneQualityMode(HGColorGamma::hgColorGammaToneQuality)
00000000001cead3	movq	%r13, %rdi
00000000001cead6	xorl	%esi, %esi
00000000001cead8	xorl	%edx, %edx
00000000001ceada	callq	__ZN12HGColorGamma19SetPremultiplyStateEbb ## HGColorGamma::SetPremultiplyState(bool, bool)
00000000001ceadf	movl	0x204(%rbx), %eax
00000000001ceae5	cmpl	$0x7, %eax
00000000001ceae8	je	0x1ceb09
00000000001ceaea	cmpl	$0x6, %eax
00000000001ceaed	jne	0x1ceb21
00000000001ceaef	movzbl	0x350(%rbx), %eax
00000000001ceaf6	addq	$0x5, %rax
00000000001ceafa	shlq	$0x6, %rax
00000000001ceafe	cmpl	$0x3, 0x210(%rbx)
00000000001ceb05	je	0x1ceb18
00000000001ceb07	jmp	0x1ceb33
00000000001ceb09	movl	%eax, %eax
00000000001ceb0b	shlq	$0x6, %rax
00000000001ceb0f	cmpl	$0x3, 0x210(%rbx)
00000000001ceb16	jne	0x1ceb33
00000000001ceb18	leaq	__ZN12HGColorGamma23logGamutRGBToRec2020RGBE(%rip), %rcx ## HGColorGamma::logGamutRGBToRec2020RGB
00000000001ceb1f	jmp	0x1ceb3a
00000000001ceb21	movl	$0x8, %eax
00000000001ceb26	shlq	$0x6, %rax
00000000001ceb2a	cmpl	$0x3, 0x210(%rbx)
00000000001ceb31	je	0x1ceb18
00000000001ceb33	leaq	__ZN12HGColorGamma22logGamutRGBToRec709RGBE(%rip), %rcx ## HGColorGamma::logGamutRGBToRec709RGB
00000000001ceb3a	movss	0x34c(%rbx), %xmm0
00000000001ceb42	shufps	$0xc0, %xmm0, %xmm0             ## xmm0 = xmm0[0,0,0,3]
00000000001ceb46	insertps	$0x30, 0x1f9170(%rip), %xmm0    ## xmm0 = xmm0[0,1,2],mem[0]
00000000001ceb50	movaps	(%rcx,%rax), %xmm1
00000000001ceb54	mulps	%xmm0, %xmm1
00000000001ceb57	movaps	%xmm1, -0x70(%rbp)
00000000001ceb5b	movaps	0x10(%rcx,%rax), %xmm1
00000000001ceb60	mulps	%xmm0, %xmm1
00000000001ceb63	movaps	%xmm1, -0x60(%rbp)
00000000001ceb67	movaps	0x20(%rcx,%rax), %xmm1
00000000001ceb6c	mulps	%xmm0, %xmm1
00000000001ceb6f	movaps	%xmm1, -0x50(%rbp)
00000000001ceb73	mulps	0x30(%rcx,%rax), %xmm0
00000000001ceb78	movaps	%xmm0, -0x40(%rbp)
00000000001ceb7c	leaq	-0x70(%rbp), %rsi
00000000001ceb80	movq	%r13, %rdi
00000000001ceb83	callq	__ZN12HGColorGamma11LoadMatrix2EPKDv4_f ## HGColorGamma::LoadMatrix2(float vector[4] const*)
00000000001ceb88	movq	-0x88(%rbp), %r14
00000000001ceb8f	movaps	0x1f90aa(%rip), %xmm0
00000000001ceb96	xorps	%xmm1, %xmm1
00000000001ceb99	xorps	%xmm2, %xmm2
00000000001ceb9c	xorps	%xmm3, %xmm3
00000000001ceb9f	xorpd	%xmm4, %xmm4
00000000001ceba3	xorps	%xmm5, %xmm5
00000000001ceba6	xorps	%xmm6, %xmm6
00000000001ceba9	movq	%r14, %rdi
00000000001cebac	movl	$0x12, %esi
00000000001cebb1	callq	__ZN12HGColorGamma16SetGammaFunctionENS_16hgColorGammaFormEDv4_fS1_S1_S1_S1_S1_S1_ ## HGColorGamma::SetGammaFunction(HGColorGamma::hgColorGammaForm, float vector[4], float vector[4], float vector[4], float vector[4], float vector[4], float vector[4], float vector[4])
00000000001cebb6	movl	0x1b4(%rbx), %esi
00000000001cebbc	movq	%r14, %rdi
00000000001cebbf	callq	__ZN12HGColorGamma18SetToneQualityModeENS_23hgColorGammaToneQualityE ## HGColorGamma::SetToneQualityMode(HGColorGamma::hgColorGammaToneQuality)
00000000001cebc4	movq	%r14, %rdi
00000000001cebc7	xorl	%esi, %esi
00000000001cebc9	xorl	%edx, %edx
00000000001cebcb	callq	__ZN12HGColorGamma19SetPremultiplyStateEbb ## HGColorGamma::SetPremultiplyState(bool, bool)
00000000001cebd0	leaq	0x210(%rbx), %rax
00000000001cebd7	movl	(%rax), %esi
00000000001cebd9	movl	$0x0, (%rsp)
00000000001cebe0	movq	%r12, %rdi
00000000001cebe3	movl	$0x1, %edx
00000000001cebe8	xorl	%ecx, %ecx
00000000001cebea	movl	%esi, %r8d
00000000001cebed	movl	$0x8, %r9d
00000000001cebf3	callq	__ZN12HGColorGamma13SetConversionENS_26hgColorGammaColorPrimariesENS_28hgColorGammaTransferFunctionENS_30hgColorGammaMatrixCoefficientsES0_S1_S2_ ## HGColorGamma::SetConversion(HGColorGamma::hgColorGammaColorPrimaries, HGColorGamma::hgColorGammaTransferFunction, HGColorGamma::hgColorGammaMatrixCoefficients, HGColorGamma::hgColorGammaColorPrimaries, HGColorGamma::hgColorGammaTransferFunction, HGColorGamma::hgColorGammaMatrixCoefficients)
00000000001cebf8	jmp	0x1ced93
00000000001cebfd	movq	(%r13), %rax
00000000001cec01	movq	%r13, %rdi
00000000001cec04	callq	*0x18(%rax)
00000000001cec07	xorl	%eax, %eax
00000000001cec09	jmp	0x1cef7f
00000000001cec0e	movl	$0x1a0, %edi                    ## imm = 0x1A0
00000000001cec13	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
00000000001cec18	movq	%rax, %r12
00000000001cec1b	movq	%rax, %rdi
00000000001cec1e	callq	__ZN24HgcColorGamma_bias_clampC1Ev ## HgcColorGamma_bias_clamp::HgcColorGamma_bias_clamp()
00000000001cec23	movq	(%r12), %rax
00000000001cec27	movq	%r12, %rdi
00000000001cec2a	xorl	%esi, %esi
00000000001cec2c	movq	%r13, %rdx
00000000001cec2f	callq	*0x78(%rax)
00000000001cec32	movq	(%r13), %rax
00000000001cec36	movq	%r13, %rdi
00000000001cec39	callq	*0x18(%rax)
00000000001cec3c	movq	0x218(%rbx), %rax
00000000001cec43	movss	0x58(%rax), %xmm0
00000000001cec48	movss	%xmm0, -0x80(%rbp)
00000000001cec4d	movss	0x5c(%rax), %xmm0
00000000001cec52	movss	0x60(%rax), %xmm1
00000000001cec57	movss	%xmm1, -0x88(%rbp)
00000000001cec5f	movss	0x64(%rax), %xmm1
00000000001cec64	movss	%xmm1, -0x78(%rbp)
00000000001cec69	movq	(%r12), %rax
00000000001cec6d	xorps	%xmm3, %xmm3
00000000001cec70	movq	%r12, %rdi
00000000001cec73	xorl	%esi, %esi
00000000001cec75	movaps	%xmm0, %xmm1
00000000001cec78	movaps	%xmm0, %xmm2
00000000001cec7b	callq	*0x60(%rax)
00000000001cec7e	movq	(%r12), %rax
00000000001cec82	movss	0x1f9036(%rip), %xmm3
00000000001cec8a	movq	%r12, %rdi
00000000001cec8d	movl	$0x1, %esi
00000000001cec92	movss	-0x80(%rbp), %xmm0
00000000001cec97	movaps	%xmm0, %xmm1
00000000001cec9a	movaps	%xmm0, %xmm2
00000000001cec9d	callq	*0x60(%rax)
00000000001ceca0	movq	(%r12), %rax
00000000001ceca4	movss	0x1fe548(%rip), %xmm3
00000000001cecac	movq	%r12, %rdi
00000000001cecaf	movl	$0x2, %esi
00000000001cecb4	movss	-0x88(%rbp), %xmm0
00000000001cecbc	movaps	%xmm0, %xmm1
00000000001cecbf	movaps	%xmm0, %xmm2
00000000001cecc2	callq	*0x60(%rax)
00000000001cecc5	movq	(%r12), %rax
00000000001cecc9	movss	0x1fc9df(%rip), %xmm3
00000000001cecd1	movq	%r12, %rdi
00000000001cecd4	movl	$0x3, %esi
00000000001cecd9	movss	-0x78(%rbp), %xmm0
00000000001cecde	movaps	%xmm0, %xmm1
00000000001cece1	movaps	%xmm0, %xmm2
00000000001cece4	callq	*0x60(%rax)
00000000001cece7	movl	$0x4a0, %edi                    ## imm = 0x4A0
00000000001cecec	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
00000000001cecf1	movq	%rax, %r15
00000000001cecf4	movq	%rax, %rdi
00000000001cecf7	callq	__ZN12HGColorGammaC1Ev          ## HGColorGamma::HGColorGamma()
00000000001cecfc	movzbl	0x1da(%rbx), %esi
00000000001ced03	movq	%r15, %rdi
00000000001ced06	callq	__ZN12HGColorGamma26SetAntiSymmetricToneCurvesEb ## HGColorGamma::SetAntiSymmetricToneCurves(bool)
00000000001ced0b	movq	(%r15), %rax
00000000001ced0e	movq	%r15, %rdi
00000000001ced11	xorl	%esi, %esi
00000000001ced13	movq	%r12, %rdx
00000000001ced16	callq	*0x78(%rax)
00000000001ced19	movq	(%r12), %rax
00000000001ced1d	movq	%r12, %rdi
00000000001ced20	callq	*0x18(%rax)
00000000001ced23	movq	%r14, 0x198(%rbx)
00000000001ced2a	movq	%r15, 0x1a0(%rbx)
00000000001ced31	movl	0x220(%rbx), %ecx
00000000001ced37	testl	%ecx, %ecx
00000000001ced39	movq	%r15, %r12
00000000001ced3c	je	0x1ced5d
00000000001ced3e	movl	$0x0, (%rsp)
00000000001ced45	movq	%r14, %rdi
00000000001ced48	xorl	%esi, %esi
00000000001ced4a	movl	$0x1, %edx
00000000001ced4f	xorl	%r8d, %r8d
00000000001ced52	movl	$0x1, %r9d
00000000001ced58	callq	__ZN12HGColorGamma13SetConversionENS_26hgColorGammaColorPrimariesENS_28hgColorGammaTransferFunctionENS_30hgColorGammaMatrixCoefficientsES0_S1_S2_ ## HGColorGamma::SetConversion(HGColorGamma::hgColorGammaColorPrimaries, HGColorGamma::hgColorGammaTransferFunction, HGColorGamma::hgColorGammaMatrixCoefficients, HGColorGamma::hgColorGammaColorPrimaries, HGColorGamma::hgColorGammaTransferFunction, HGColorGamma::hgColorGammaMatrixCoefficients)
00000000001ced5d	movq	0x218(%rbx), %rax
00000000001ced64	movl	0x6c(%rax), %esi
00000000001ced67	movl	0x70(%rax), %edx
00000000001ced6a	movl	0x224(%rbx), %r8d
00000000001ced71	movl	$0x0, (%rsp)
00000000001ced78	movq	%r12, %rdi
00000000001ced7b	xorl	%ecx, %ecx
00000000001ced7d	movl	$0x8, %r9d
00000000001ced83	callq	__ZN12HGColorGamma13SetConversionENS_26hgColorGammaColorPrimariesENS_28hgColorGammaTransferFunctionENS_30hgColorGammaMatrixCoefficientsES0_S1_S2_ ## HGColorGamma::SetConversion(HGColorGamma::hgColorGammaColorPrimaries, HGColorGamma::hgColorGammaTransferFunction, HGColorGamma::hgColorGammaMatrixCoefficients, HGColorGamma::hgColorGammaColorPrimaries, HGColorGamma::hgColorGammaTransferFunction, HGColorGamma::hgColorGammaMatrixCoefficients)
00000000001ced88	testq	%r14, %r14
00000000001ced8b	movq	%r14, %r15
00000000001ced8e	movq	%r12, %r14
00000000001ced91	je	0x1cede6
00000000001ced93	movl	0x1b4(%rbx), %esi
00000000001ced99	movq	%r15, %rdi
00000000001ced9c	callq	__ZN12HGColorGamma18SetToneQualityModeENS_23hgColorGammaToneQualityE ## HGColorGamma::SetToneQualityMode(HGColorGamma::hgColorGammaToneQuality)
00000000001ceda1	movzbl	0x1b0(%rbx), %esi
00000000001ceda8	movq	%r15, %rdi
00000000001cedab	callq	__ZN12HGColorGamma15SetFallbackModeEb ## HGColorGamma::SetFallbackMode(bool)
00000000001cedb0	movl	0x1c4(%rbx), %esi
00000000001cedb6	movq	%r15, %rdi
00000000001cedb9	callq	__ZN12HGColorGamma21SetInOut422FilterModeENS_30hgColorGammaInOut422FilterModeE ## HGColorGamma::SetInOut422FilterMode(HGColorGamma::hgColorGammaInOut422FilterMode)
00000000001cedbe	movq	0x1c8(%rbx), %rsi
00000000001cedc5	movq	0x1d0(%rbx), %rdx
00000000001cedcc	movq	%r15, %rdi
00000000001cedcf	callq	__ZN12HGColorGamma21SetInOut422FilterRectE6HGRect ## HGColorGamma::SetInOut422FilterRect(HGRect)
00000000001cedd4	movzbl	0x1b2(%rbx), %esi
00000000001ceddb	movq	%r15, %rdi
00000000001cedde	callq	__ZN12HGColorGamma26SetFixedPointPrecisionModeEb ## HGColorGamma::SetFixedPointPrecisionMode(bool)
00000000001cede3	movq	%r12, %r14
00000000001cede6	testq	%r14, %r14
00000000001cede9	je	0x1cee3b
00000000001cedeb	movl	0x1b4(%rbx), %esi
00000000001cedf1	movq	%r14, %rdi
00000000001cedf4	callq	__ZN12HGColorGamma18SetToneQualityModeENS_23hgColorGammaToneQualityE ## HGColorGamma::SetToneQualityMode(HGColorGamma::hgColorGammaToneQuality)
00000000001cedf9	movzbl	0x1b0(%rbx), %esi
00000000001cee00	movq	%r14, %rdi
00000000001cee03	callq	__ZN12HGColorGamma15SetFallbackModeEb ## HGColorGamma::SetFallbackMode(bool)
00000000001cee08	movl	0x1c4(%rbx), %esi
00000000001cee0e	movq	%r14, %rdi
00000000001cee11	callq	__ZN12HGColorGamma21SetInOut422FilterModeENS_30hgColorGammaInOut422FilterModeE ## HGColorGamma::SetInOut422FilterMode(HGColorGamma::hgColorGammaInOut422FilterMode)
00000000001cee16	movq	0x1c8(%rbx), %rsi
00000000001cee1d	movq	0x1d0(%rbx), %rdx
00000000001cee24	movq	%r14, %rdi
00000000001cee27	callq	__ZN12HGColorGamma21SetInOut422FilterRectE6HGRect ## HGColorGamma::SetInOut422FilterRect(HGRect)
00000000001cee2c	movzbl	0x1b2(%rbx), %esi
00000000001cee33	movq	%r14, %rdi
00000000001cee36	callq	__ZN12HGColorGamma26SetFixedPointPrecisionModeEb ## HGColorGamma::SetFixedPointPrecisionMode(bool)
00000000001cee3b	movq	0x1a0(%rbx), %r15
00000000001cee42	testq	%r15, %r15
00000000001cee45	je	0x1cee6d
00000000001cee47	movq	0x198(%rbx), %rdi
00000000001cee4e	testq	%rdi, %rdi
00000000001cee51	je	0x1cee74
00000000001cee53	leaq	__ZTI6HGNode(%rip), %rsi        ## typeinfo for HGNode
00000000001cee5a	leaq	__ZTI12HGColorGamma(%rip), %rdx ## typeinfo for HGColorGamma
00000000001cee61	xorl	%ecx, %ecx
00000000001cee63	callq	0x3c5018                        ## symbol stub for: ___dynamic_cast
00000000001cee68	movq	%rax, %r14
00000000001cee6b	jmp	0x1cee77
00000000001cee6d	xorl	%eax, %eax
00000000001cee6f	jmp	0x1cef7f
00000000001cee74	xorl	%r14d, %r14d
00000000001cee77	leaq	__ZTI6HGNode(%rip), %rsi        ## typeinfo for HGNode
00000000001cee7e	leaq	__ZTI12HGColorGamma(%rip), %rdx ## typeinfo for HGColorGamma
00000000001cee85	movq	%r15, %rdi
00000000001cee88	xorl	%ecx, %ecx
00000000001cee8a	callq	0x3c5018                        ## symbol stub for: ___dynamic_cast
00000000001cee8f	movq	%rax, %r15
00000000001cee92	testq	%rax, %rax
00000000001cee95	je	0x1cee9e
00000000001cee97	testq	%r14, %r14
00000000001cee9a	jne	0x1ceeee
00000000001cee9c	jmp	0x1ceefc
00000000001cee9e	movl	$0x4a0, %edi                    ## imm = 0x4A0
00000000001ceea3	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
00000000001ceea8	movq	%rax, %r15
00000000001ceeab	movq	%rax, %rdi
00000000001ceeae	callq	__ZN12HGColorGammaC1Ev          ## HGColorGamma::HGColorGamma()
00000000001ceeb3	movzbl	0x1da(%rbx), %esi
00000000001ceeba	movq	%r15, %rdi
00000000001ceebd	callq	__ZN12HGColorGamma26SetAntiSymmetricToneCurvesEb ## HGColorGamma::SetAntiSymmetricToneCurves(bool)
00000000001ceec2	movq	0x1a0(%rbx), %rdx
00000000001ceec9	movq	(%r15), %rax
00000000001ceecc	movq	%r15, %rdi
00000000001ceecf	xorl	%esi, %esi
00000000001ceed1	callq	*0x78(%rax)
00000000001ceed4	leaq	0x1a0(%rbx), %r12
00000000001ceedb	movq	(%r12), %rdi
00000000001ceedf	movq	(%rdi), %rax
00000000001ceee2	callq	*0x18(%rax)
00000000001ceee5	movq	%r15, (%r12)
00000000001ceee9	testq	%r14, %r14
00000000001ceeec	je	0x1ceefc
00000000001ceeee	movl	0x1bc(%rbx), %esi
00000000001ceef4	movq	%r14, %rdi
00000000001ceef7	callq	__ZN12HGColorGamma19SetInputPixelFormatE13HGYCbCrFormat ## HGColorGamma::SetInputPixelFormat(HGYCbCrFormat)
00000000001ceefc	movl	0x1b8(%rbx), %esi
00000000001cef02	movl	0x1c0(%rbx), %edx
00000000001cef08	movq	%r15, %rdi
00000000001cef0b	callq	__ZN12HGColorGamma20SetOutputPixelFormatE8HGFormat13HGYCbCrFormat ## HGColorGamma::SetOutputPixelFormat(HGFormat, HGYCbCrFormat)
00000000001cef10	movzbl	0x1b1(%rbx), %esi
00000000001cef17	movq	%r15, %rdi
00000000001cef1a	callq	__ZN12HGColorGamma13SetDitherModeEb ## HGColorGamma::SetDitherMode(bool)
00000000001cef1f	movzbl	0x1b2(%rbx), %esi
00000000001cef26	movq	%r15, %rdi
00000000001cef29	callq	__ZN12HGColorGamma26SetFixedPointPrecisionModeEb ## HGColorGamma::SetFixedPointPrecisionMode(bool)
00000000001cef2e	movq	0x198(%rbx), %rax
00000000001cef35	cmpq	0x1a0(%rbx), %rax
00000000001cef3c	je	0x1cef67
00000000001cef3e	testq	%r14, %r14
00000000001cef41	je	0x1cef54
00000000001cef43	movzbl	0x1d8(%rbx), %esi
00000000001cef4a	movq	%r14, %rdi
00000000001cef4d	xorl	%edx, %edx
00000000001cef4f	callq	__ZN12HGColorGamma19SetPremultiplyStateEbb ## HGColorGamma::SetPremultiplyState(bool, bool)
00000000001cef54	movzbl	0x1d9(%rbx), %edx
00000000001cef5b	movq	%r15, %rdi
00000000001cef5e	xorl	%esi, %esi
00000000001cef60	callq	__ZN12HGColorGamma19SetPremultiplyStateEbb ## HGColorGamma::SetPremultiplyState(bool, bool)
00000000001cef65	jmp	0x1cef7d
00000000001cef67	movzbl	0x1d8(%rbx), %esi
00000000001cef6e	movzbl	0x1d9(%rbx), %edx
00000000001cef75	movq	%r15, %rdi
00000000001cef78	callq	__ZN12HGColorGamma19SetPremultiplyStateEbb ## HGColorGamma::SetPremultiplyState(bool, bool)
00000000001cef7d	movb	$0x1, %al
00000000001cef7f	movq	0x8332d2(%rip), %rcx            ## literal pool symbol address: ___stack_chk_guard
00000000001cef86	movq	(%rcx), %rcx
00000000001cef89	cmpq	-0x30(%rbp), %rcx
00000000001cef8d	jne	0x1cf100
00000000001cef93	addq	$0xa8, %rsp
00000000001cef9a	popq	%rbx
00000000001cef9b	popq	%r12
00000000001cef9d	popq	%r13
00000000001cef9f	popq	%r14
00000000001cefa1	popq	%r15
00000000001cefa3	popq	%rbp
00000000001cefa4	retq
00000000001cefa5	movl	$0x2, (%rsp)
00000000001cefac	movq	%r14, %rdi
00000000001cefaf	xorl	%esi, %esi
00000000001cefb1	movl	$0x8, %edx
00000000001cefb6	xorl	%ecx, %ecx
00000000001cefb8	movl	$0x2, %r8d
00000000001cefbe	jmp	0x1cf0f0
00000000001cefc3	movl	$0x0, (%rsp)
00000000001cefca	movq	%r14, %rdi
00000000001cefcd	xorl	%esi, %esi
00000000001cefcf	jmp	0x1cf010
00000000001cefd1	movq	%r14, %rdi
00000000001cefd4	movl	$0x4, %esi
00000000001cefd9	callq	__ZN12HGColorGamma19SetConversionPresetENS_28hgColorGammaConversionPresetE ## HGColorGamma::SetConversionPreset(HGColorGamma::hgColorGammaConversionPreset)
00000000001cefde	jmp	0x1cede6
00000000001cefe3	movl	$0x1, (%rsp)
00000000001cefea	jmp	0x1cf08c
00000000001cefef	movq	%r14, %rdi
00000000001ceff2	movl	$0x5, %esi
00000000001ceff7	callq	__ZN12HGColorGamma19SetConversionPresetENS_28hgColorGammaConversionPresetE ## HGColorGamma::SetConversionPreset(HGColorGamma::hgColorGammaConversionPreset)
00000000001ceffc	jmp	0x1cede6
00000000001cf001	movl	$0x0, (%rsp)
00000000001cf008	movq	%r14, %rdi
00000000001cf00b	movl	$0x2, %esi
00000000001cf010	movl	$0x1, %edx
00000000001cf015	xorl	%ecx, %ecx
00000000001cf017	jmp	0x1cf0c4
00000000001cf01c	movq	%r14, %rdi
00000000001cf01f	movl	$0x3, %esi
00000000001cf024	callq	__ZN12HGColorGamma19SetConversionPresetENS_28hgColorGammaConversionPresetE ## HGColorGamma::SetConversionPreset(HGColorGamma::hgColorGammaConversionPreset)
00000000001cf029	jmp	0x1cede6
00000000001cf02e	movq	%r14, %rdi
00000000001cf031	movl	$0x2, %esi
00000000001cf036	callq	__ZN12HGColorGamma19SetConversionPresetENS_28hgColorGammaConversionPresetE ## HGColorGamma::SetConversionPreset(HGColorGamma::hgColorGammaConversionPreset)
00000000001cf03b	jmp	0x1cede6
00000000001cf040	movq	%r14, %rdi
00000000001cf043	movl	$0x6, %esi
00000000001cf048	callq	__ZN12HGColorGamma19SetConversionPresetENS_28hgColorGammaConversionPresetE ## HGColorGamma::SetConversionPreset(HGColorGamma::hgColorGammaConversionPreset)
00000000001cf04d	jmp	0x1cede6
00000000001cf052	movl	$0x0, (%rsp)
00000000001cf059	movq	%r14, %rdi
00000000001cf05c	xorl	%esi, %esi
00000000001cf05e	movl	$0x1, %edx
00000000001cf063	movl	$0x1, %ecx
00000000001cf068	jmp	0x1cf0c4
00000000001cf06a	movl	$0x2, (%rsp)
00000000001cf071	movq	%r14, %rdi
00000000001cf074	xorl	%esi, %esi
00000000001cf076	movl	$0x8, %edx
00000000001cf07b	xorl	%ecx, %ecx
00000000001cf07d	movl	$0x1, %r8d
00000000001cf083	jmp	0x1cf0f0
00000000001cf085	movl	$0x0, (%rsp)
00000000001cf08c	movq	%r14, %rdi
00000000001cf08f	xorl	%esi, %esi
00000000001cf091	movl	$0x8, %edx
00000000001cf096	xorl	%ecx, %ecx
00000000001cf098	jmp	0x1cf0ed
00000000001cf09a	movl	$0x0, (%rsp)
00000000001cf0a1	movq	%r14, %rdi
00000000001cf0a4	movl	$0x1, %esi
00000000001cf0a9	jmp	0x1cf0ba
00000000001cf0ab	movl	$0x0, (%rsp)
00000000001cf0b2	movq	%r14, %rdi
00000000001cf0b5	movl	$0x2, %esi
00000000001cf0ba	movl	$0x1, %edx
00000000001cf0bf	movl	$0x2, %ecx
00000000001cf0c4	xorl	%r8d, %r8d
00000000001cf0c7	movl	$0x8, %r9d
00000000001cf0cd	callq	__ZN12HGColorGamma13SetConversionENS_26hgColorGammaColorPrimariesENS_28hgColorGammaTransferFunctionENS_30hgColorGammaMatrixCoefficientsES0_S1_S2_ ## HGColorGamma::SetConversion(HGColorGamma::hgColorGammaColorPrimaries, HGColorGamma::hgColorGammaTransferFunction, HGColorGamma::hgColorGammaMatrixCoefficients, HGColorGamma::hgColorGammaColorPrimaries, HGColorGamma::hgColorGammaTransferFunction, HGColorGamma::hgColorGammaMatrixCoefficients)
00000000001cf0d2	jmp	0x1cede6
00000000001cf0d7	movl	$0x0, (%rsp)
00000000001cf0de	movq	%r14, %rdi
00000000001cf0e1	xorl	%esi, %esi
00000000001cf0e3	movl	$0x1, %edx
00000000001cf0e8	movl	$0x1, %ecx
00000000001cf0ed	xorl	%r8d, %r8d
00000000001cf0f0	movl	$0x1, %r9d
00000000001cf0f6	callq	__ZN12HGColorGamma13SetConversionENS_26hgColorGammaColorPrimariesENS_28hgColorGammaTransferFunctionENS_30hgColorGammaMatrixCoefficientsES0_S1_S2_ ## HGColorGamma::SetConversion(HGColorGamma::hgColorGammaColorPrimaries, HGColorGamma::hgColorGammaTransferFunction, HGColorGamma::hgColorGammaMatrixCoefficients, HGColorGamma::hgColorGammaColorPrimaries, HGColorGamma::hgColorGammaTransferFunction, HGColorGamma::hgColorGammaMatrixCoefficients)
00000000001cf0fb	jmp	0x1cede6
00000000001cf100	callq	0x3c5030                        ## symbol stub for: ___stack_chk_fail
00000000001cf105	jmp	0x1cf1ba
00000000001cf10a	jmp	0x1cf1ba
00000000001cf10f	jmp	0x1cf199
00000000001cf114	jmp	0x1cf1e2
00000000001cf119	jmp	0x1cf1ba
00000000001cf11e	jmp	0x1cf1cf
00000000001cf123	jmp	0x1cf1e2
00000000001cf128	jmp	0x1cf1cf
00000000001cf12d	jmp	0x1cf1e2
00000000001cf132	jmp	0x1cf1ba
00000000001cf137	movq	%rax, %rbx
00000000001cf13a	leaq	-0xa0(%rbp), %rdi
00000000001cf141	callq	__ZNSt3__110shared_ptrIN6HGPool9AllocatorIPU21objcproto10MTLTexture11objc_objectN18HGMetalTexturePool10DescriptorEEEED1B9nqe210106Ev ## std::__1::shared_ptr<HGPool::Allocator<id<MTLTexture>, HGMetalTexturePool::Descriptor>>::~shared_ptr[abi:nqe210106]()
00000000001cf146	movq	%r14, %rdi
00000000001cf149	callq	__ZN8HGObjectdlEPv              ## HGObject::operator delete(void*)
00000000001cf14e	movq	%rbx, %rdi
00000000001cf151	callq	0x3c4e02                        ## symbol stub for: __Unwind_Resume
00000000001cf156	movq	%rax, %rbx
00000000001cf159	leaq	-0xb0(%rbp), %rdi
00000000001cf160	callq	__ZNSt3__110shared_ptrIN6HGPool9AllocatorIPU21objcproto10MTLTexture11objc_objectN18HGMetalTexturePool10DescriptorEEEED1B9nqe210106Ev ## std::__1::shared_ptr<HGPool::Allocator<id<MTLTexture>, HGMetalTexturePool::Descriptor>>::~shared_ptr[abi:nqe210106]()
00000000001cf165	movq	%r14, %rdi
00000000001cf168	callq	__ZN8HGObjectdlEPv              ## HGObject::operator delete(void*)
00000000001cf16d	movq	%rbx, %rdi
00000000001cf170	callq	0x3c4e02                        ## symbol stub for: __Unwind_Resume
00000000001cf175	jmp	0x1cf1cf
00000000001cf177	jmp	0x1cf1cf
00000000001cf179	jmp	0x1cf1cf
00000000001cf17b	jmp	0x1cf1cf
00000000001cf17d	jmp	0x1cf1ba
00000000001cf17f	movq	%rax, %rbx
00000000001cf182	movq	-0x78(%rbp), %rdi
00000000001cf186	callq	__ZN8HGObjectdlEPv              ## HGObject::operator delete(void*)
00000000001cf18b	movq	%rbx, %rdi
00000000001cf18e	callq	0x3c4e02                        ## symbol stub for: __Unwind_Resume
00000000001cf193	jmp	0x1cf1e2
00000000001cf195	jmp	0x1cf1cf
00000000001cf197	jmp	0x1cf1cf
00000000001cf199	movq	%rax, %rbx
00000000001cf19c	movq	%r13, %rdi
00000000001cf19f	callq	__ZN8HGObjectdlEPv              ## HGObject::operator delete(void*)
00000000001cf1a4	movq	%rbx, %rdi
00000000001cf1a7	callq	0x3c4e02                        ## symbol stub for: __Unwind_Resume
00000000001cf1ac	jmp	0x1cf1e2
00000000001cf1ae	jmp	0x1cf1e2
00000000001cf1b0	jmp	0x1cf1ba
00000000001cf1b2	jmp	0x1cf1cf
00000000001cf1b4	jmp	0x1cf1cf
00000000001cf1b6	jmp	0x1cf1e2
00000000001cf1b8	jmp	0x1cf1cf
00000000001cf1ba	movq	%rax, %rbx
00000000001cf1bd	movq	%r12, %rdi
00000000001cf1c0	callq	__ZN8HGObjectdlEPv              ## HGObject::operator delete(void*)
00000000001cf1c5	movq	%rbx, %rdi
00000000001cf1c8	callq	0x3c4e02                        ## symbol stub for: __Unwind_Resume
00000000001cf1cd	jmp	0x1cf1e2
00000000001cf1cf	movq	%rax, %rbx
00000000001cf1d2	movq	%r14, %rdi
00000000001cf1d5	callq	__ZN8HGObjectdlEPv              ## HGObject::operator delete(void*)
00000000001cf1da	movq	%rbx, %rdi
00000000001cf1dd	callq	0x3c4e02                        ## symbol stub for: __Unwind_Resume
00000000001cf1e2	movq	%rax, %rbx
00000000001cf1e5	movq	%r15, %rdi
00000000001cf1e8	callq	__ZN8HGObjectdlEPv              ## HGObject::operator delete(void*)
00000000001cf1ed	movq	%rbx, %rdi
00000000001cf1f0	callq	0x3c4e02                        ## symbol stub for: __Unwind_Resume
00000000001cf1f5	movq	%rax, %rdi
00000000001cf1f8	callq	0x3c4e02                        ## symbol stub for: __Unwind_Resume
00000000001cf1fd	nopl	(%rax)
00000000001cf200	mulb	%dh
00000000001cf202	.byte 0xff #bad opcode
00000000001cf203	pushq	-0x3000018(%rbx)
00000000001cf209	outl	%eax, $0xff
00000000001cf20b	incl	(%rsi)
00000000001cf20d	.byte 0xea #bad opcode
00000000001cf20e	.byte 0xff #bad opcode
00000000001cf20f	incl	-0x7e000019(%rcx)
00000000001cf215	outl	%eax, $0xff
00000000001cf217	incl	-0x7e000019(%rcx)
00000000001cf21d	outl	%eax, $0xff
00000000001cf21f	incl	-0x7e000019(%rcx)
00000000001cf225	outl	%eax, $0xff
00000000001cf227	incl	-0x7e000019(%rcx)
00000000001cf22d	outl	%eax, $0xff
00000000001cf22f	incl	-0x7e000019(%rcx)
00000000001cf235	outl	%eax, $0xff
00000000001cf237	incl	-0x7e000019(%rcx)
00000000001cf23d	outl	%eax, $0xff
00000000001cf23f	incl	-0x7e000019(%rcx)
00000000001cf245	outl	%eax, $0xff
00000000001cf247	incl	-0x7e000019(%rcx)
00000000001cf24d	outl	%eax, $0xff
00000000001cf24f	incl	0x9ffffe7(%rcx)
00000000001cf255	jmp	0x1cf256
00000000001cf257	.byte 0xff #bad opcode
00000000001cf258	.byte 0x3e #bad opcode
00000000001cf259	.byte 0xf3 #bad opcode
00000000001cf25a	.byte 0xff #bad opcode
00000000001cf25b	.byte 0xff #bad opcode
00000000001cf25c	.byte 0x3e #bad opcode
00000000001cf25d	.byte 0xf3 #bad opcode
00000000001cf25e	.byte 0xff #bad opcode
00000000001cf25f	jmpq	*(%rdx)
00000000001cf261	idivb	%bh
00000000001cf263	jmpq	*-0x5e00000d(%rcx)
00000000001cf269	.byte 0xf3 #bad opcode
00000000001cf26a	.byte 0xff #bad opcode
00000000001cf26b	.byte 0xff #bad opcode
00000000001cf26c	jl	0x1cf256
00000000001cf26e	.byte 0xff #bad opcode
00000000001cf26f	.byte 0xff #bad opcode
00000000001cf270	jl	0x1cf25a
00000000001cf272	.byte 0xff #bad opcode
00000000001cf273	.byte 0xff #bad opcode
00000000001cf274	jl	0x1cf25e
00000000001cf276	.byte 0xff #bad opcode
00000000001cf277	.byte 0xff #bad opcode
00000000001cf278	jl	0x1cf262
00000000001cf27a	.byte 0xff #bad opcode
00000000001cf27b	callq	*%rcx
00000000001cf27d	idivb	%bh
00000000001cf27f	callq	*%rcx
00000000001cf281	idivb	%bh
00000000001cf283	callq	*%rcx
00000000001cf285	idivb	%bh
00000000001cf287	callq	*%rcx
00000000001cf289	idivb	%bh
00000000001cf28b	callq	*%rcx
00000000001cf28d	idivb	%bh
00000000001cf28f	callq	*%rcx
00000000001cf291	idivb	%bh
00000000001cf293	jmpq	*-0xf(%rax)
00000000001cf296	.byte 0xff #bad opcode
00000000001cf297	pushq	-0x5f000003(%rdx)
00000000001cf29d	std
00000000001cf29e	.byte 0xff #bad opcode
00000000001cf29f	callq	*-0x3(%rbp)
00000000001cf2a2	.byte 0xff #bad opcode
00000000001cf2a3	pushq	-0x3(%rbx)
00000000001cf2a6	.byte 0xff #bad opcode
00000000001cf2a7	incl	%esp
00000000001cf2a9	std
00000000001cf2aa	.byte 0xff #bad opcode
00000000001cf2ab	callq	*%rsi
00000000001cf2ad	std
00000000001cf2ae	.byte 0xff #bad opcode
00000000001cf2af	ljmpl	*(%rdi)
00000000001cf2b1	.byte 0xfe #bad opcode
00000000001cf2b2	.byte 0xff #bad opcode
00000000001cf2b3	lcalll	*(%rsi)
00000000001cf2b5	.byte 0xfe #bad opcode
00000000001cf2b6	.byte 0xff #bad opcode
00000000001cf2b7	incl	-0x3(%rdi)
00000000001cf2ba	.byte 0xff #bad opcode
00000000001cf2bb	incl	0x67fffffd(%rbp)
00000000001cf2c1	std
00000000001cf2c2	.byte 0xff #bad opcode
00000000001cf2c3	ljmpl	*(%rcx)
00000000001cf2c5	std
00000000001cf2c6	.byte 0xff #bad opcode
00000000001cf2c7	.byte 0xff #bad opcode
00000000001cf2c8	outb	%al, %dx
00000000001cf2c9	std
00000000001cf2ca	.byte 0xff #bad opcode
00000000001cf2cb	decl	(%rcx)
00000000001cf2cd	.byte 0xfe #bad opcode
00000000001cf2ce	.byte 0xff #bad opcode
00000000001cf2cf	lcalll	*-0x2(%rbx)
00000000001cf2d2	.byte 0xff #bad opcode
00000000001cf2d3	jmpq	*0x66(%rsi)
00000000001cf2d6	nopw	%cs:(%rax,%rax)
