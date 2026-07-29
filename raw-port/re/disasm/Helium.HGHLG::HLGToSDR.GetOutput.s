__ZN5HGHLG8HLGToSDR9GetOutputEP10HGRenderer:
0000000000100940	pushq	%rbp
0000000000100941	movq	%rsp, %rbp
0000000000100944	pushq	%r15
0000000000100946	pushq	%r14
0000000000100948	pushq	%r13
000000000010094a	pushq	%r12
000000000010094c	pushq	%rbx
000000000010094d	subq	$0x18, %rsp
0000000000100951	movq	%rdi, %r14
0000000000100954	movq	%rsi, %rdi
0000000000100957	movq	%r14, %rsi
000000000010095a	xorl	%edx, %edx
000000000010095c	callq	__ZN10HGRenderer8GetInputEP6HGNodei ## HGRenderer::GetInput(HGNode*, int)
0000000000100961	movq	%rax, %r15
0000000000100964	cmpl	$0x2, 0x1a4(%r14)
000000000010096c	jae	0x100aee
0000000000100972	movl	$0x1c0, %edi                    ## imm = 0x1C0
0000000000100977	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
000000000010097c	movq	%rax, %rbx
000000000010097f	movq	%rax, %rdi
0000000000100982	callq	__ZN6HGNodeC2Ev                 ## HGNode::HGNode()
0000000000100987	leaq	0x9169f2(%rip), %rax
000000000010098e	movq	%rax, (%rbx)
0000000000100991	movl	$0x1a0, %edi                    ## imm = 0x1A0
0000000000100996	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
000000000010099b	movq	%rax, %r12
000000000010099e	movq	%rax, %rdi
00000000001009a1	callq	__ZN30HgcBT2100_HLG_OOTF_InverseOOTFC1Ev ## HgcBT2100_HLG_OOTF_InverseOOTF::HgcBT2100_HLG_OOTF_InverseOOTF()
00000000001009a6	movq	%r12, 0x198(%rbx)
00000000001009ad	leaq	0x2d0928(%rip), %rax
00000000001009b4	movq	%rax, 0x1a0(%rbx)
00000000001009bb	movabsq	$0x4059000000000000, %rax       ## imm = 0x4059000000000000
00000000001009c5	movq	%rax, 0x1a8(%rbx)
00000000001009cc	movsd	0x2d07ac(%rip), %xmm0
00000000001009d4	movsd	%xmm0, 0x1b0(%rbx)
00000000001009dc	movq	(%rbx), %rax
00000000001009df	movq	%rbx, %rdi
00000000001009e2	xorl	%esi, %esi
00000000001009e4	movq	%r15, %rdx
00000000001009e7	callq	*0x78(%rax)
00000000001009ea	movl	$0xbe1dcaa7, 0x1b0(%rbx)        ## imm = 0xBE1DCAA7
00000000001009f4	movsd	0x2d042c(%rip), %xmm0
00000000001009fc	divsd	0x1a8(%rbx), %xmm0
0000000000100a04	cvtsd2ss	%xmm0, %xmm0
0000000000100a08	movss	%xmm0, 0x1b4(%rbx)
0000000000100a10	movl	$0x1f0, %edi                    ## imm = 0x1F0
0000000000100a15	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
0000000000100a1a	movq	%rax, %r15
0000000000100a1d	movq	%rax, %rdi
0000000000100a20	callq	__ZN13HGColorMatrixC1Ev         ## HGColorMatrix::HGColorMatrix()
0000000000100a25	movq	(%r15), %rax
0000000000100a28	movq	%r15, %rdi
0000000000100a2b	xorl	%esi, %esi
0000000000100a2d	movq	%rbx, %rdx
0000000000100a30	callq	*0x78(%rax)
0000000000100a33	leaq	__ZN12HGColorGamma21rec2020RGBToRec709RGBE(%rip), %rsi ## HGColorGamma::rec2020RGBToRec709RGB
0000000000100a3a	movq	%r15, %rdi
0000000000100a3d	movl	$0x1, %edx
0000000000100a42	callq	__ZN13HGColorMatrix10LoadMatrixEPKDv4_fb ## HGColorMatrix::LoadMatrix(float vector[4] const*, bool)
0000000000100a47	cmpl	$0x0, 0x1a4(%r14)
0000000000100a4f	je	0x100bba
0000000000100a55	movl	$0x4a0, %edi                    ## imm = 0x4A0
0000000000100a5a	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
0000000000100a5f	movq	%rax, %r12
0000000000100a62	movq	%rax, %rdi
0000000000100a65	callq	__ZN12HGColorGammaC1Ev          ## HGColorGamma::HGColorGamma()
0000000000100a6a	movq	(%r12), %rax
0000000000100a6e	movq	%r12, %rdi
0000000000100a71	xorl	%esi, %esi
0000000000100a73	movq	%r15, %rdx
0000000000100a76	callq	*0x78(%rax)
0000000000100a79	movl	0x1a8(%r14), %esi
0000000000100a80	movq	%r12, %rdi
0000000000100a83	callq	__ZN12HGColorGamma18SetToneQualityModeENS_23hgColorGammaToneQualityE ## HGColorGamma::SetToneQualityMode(HGColorGamma::hgColorGammaToneQuality)
0000000000100a88	movl	$0x0, (%rsp)
0000000000100a8f	movq	%r12, %rdi
0000000000100a92	xorl	%esi, %esi
0000000000100a94	movl	$0x8, %edx
0000000000100a99	xorl	%ecx, %ecx
0000000000100a9b	xorl	%r8d, %r8d
0000000000100a9e	movl	$0xd, %r9d
0000000000100aa4	callq	__ZN12HGColorGamma13SetConversionENS_26hgColorGammaColorPrimariesENS_28hgColorGammaTransferFunctionENS_30hgColorGammaMatrixCoefficientsES0_S1_S2_ ## HGColorGamma::SetConversion(HGColorGamma::hgColorGammaColorPrimaries, HGColorGamma::hgColorGammaTransferFunction, HGColorGamma::hgColorGammaMatrixCoefficients, HGColorGamma::hgColorGammaColorPrimaries, HGColorGamma::hgColorGammaTransferFunction, HGColorGamma::hgColorGammaMatrixCoefficients)
0000000000100aa9	movq	%r12, %rdi
0000000000100aac	movl	$0x1, %esi
0000000000100ab1	callq	__ZN12HGColorGamma26SetAntiSymmetricToneCurvesEb ## HGColorGamma::SetAntiSymmetricToneCurves(bool)
0000000000100ab6	movq	%r12, %rdi
0000000000100ab9	movl	$0x2, %esi
0000000000100abe	callq	__ZN12HGColorGamma18SetToneQualityModeENS_23hgColorGammaToneQualityE ## HGColorGamma::SetToneQualityMode(HGColorGamma::hgColorGammaToneQuality)
0000000000100ac3	xorl	%r13d, %r13d
0000000000100ac6	movq	%r12, %rdi
0000000000100ac9	xorl	%esi, %esi
0000000000100acb	xorl	%edx, %edx
0000000000100acd	callq	__ZN12HGColorGamma19SetPremultiplyStateEbb ## HGColorGamma::SetPremultiplyState(bool, bool)
0000000000100ad2	movq	(%r12), %rax
0000000000100ad6	movq	%r12, %r13
0000000000100ad9	movq	%r12, %rdi
0000000000100adc	callq	*0x10(%rax)
0000000000100adf	movq	(%r12), %rax
0000000000100ae3	movq	%r12, %rdi
0000000000100ae6	callq	*0x18(%rax)
0000000000100ae9	jmp	0x100c18
0000000000100aee	jne	0x100dc9
0000000000100af4	movl	$0x1c0, %edi                    ## imm = 0x1C0
0000000000100af9	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
0000000000100afe	movq	%rax, %rbx
0000000000100b01	movq	%rax, %rdi
0000000000100b04	callq	__ZN6HGNodeC2Ev                 ## HGNode::HGNode()
0000000000100b09	leaq	0x916870(%rip), %rax
0000000000100b10	movq	%rax, (%rbx)
0000000000100b13	movl	$0x1a0, %edi                    ## imm = 0x1A0
0000000000100b18	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
0000000000100b1d	movq	%rax, %r12
0000000000100b20	movq	%rax, %rdi
0000000000100b23	callq	__ZN30HgcBT2100_HLG_OOTF_InverseOOTFC1Ev ## HgcBT2100_HLG_OOTF_InverseOOTF::HgcBT2100_HLG_OOTF_InverseOOTF()
0000000000100b28	movq	%r12, 0x198(%rbx)
0000000000100b2f	leaq	0x2d07a6(%rip), %rax
0000000000100b36	movq	%rax, 0x1a0(%rbx)
0000000000100b3d	movabsq	$0x408f400000000000, %rax       ## imm = 0x408F400000000000
0000000000100b47	movq	%rax, 0x1a8(%rbx)
0000000000100b4e	movsd	0x2d061a(%rip), %xmm0
0000000000100b56	movsd	%xmm0, 0x1b0(%rbx)
0000000000100b5e	movq	(%rbx), %rax
0000000000100b61	movq	%rbx, %rdi
0000000000100b64	xorl	%esi, %esi
0000000000100b66	movq	%r15, %rdx
0000000000100b69	callq	*0x78(%rax)
0000000000100b6c	movl	$0x3e4ccccd, 0x1b0(%rbx)        ## imm = 0x3E4CCCCD
0000000000100b76	movsd	0x2d0262(%rip), %xmm0
0000000000100b7e	divsd	0x1a8(%rbx), %xmm0
0000000000100b86	cvtsd2ss	%xmm0, %xmm0
0000000000100b8a	movss	%xmm0, 0x1b4(%rbx)
0000000000100b92	cmpb	$0x1, 0x1a1(%r14)
0000000000100b9a	jne	0x100cf1
0000000000100ba0	movl	$0x1a0, %edi                    ## imm = 0x1A0
0000000000100ba5	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
0000000000100baa	movq	%rax, %r15
0000000000100bad	movq	%rax, %rdi
0000000000100bb0	callq	__ZN36HgcBT2446_Method_A_TMO_Input_ClampedC1Ev ## HgcBT2446_Method_A_TMO_Input_Clamped::HgcBT2446_Method_A_TMO_Input_Clamped()
0000000000100bb5	jmp	0x100d06
0000000000100bba	movl	$0x1b0, %edi                    ## imm = 0x1B0
0000000000100bbf	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
0000000000100bc4	movq	%rax, %r12
0000000000100bc7	movq	%rax, %rdi
0000000000100bca	callq	__ZN7HGGammaC1Ev                ## HGGamma::HGGamma()
0000000000100bcf	movq	(%r12), %rax
0000000000100bd3	xorl	%r13d, %r13d
0000000000100bd6	movq	%r12, %rdi
0000000000100bd9	xorl	%esi, %esi
0000000000100bdb	movq	%r15, %rdx
0000000000100bde	callq	*0x78(%rax)
0000000000100be1	movq	(%r12), %rax
0000000000100be5	xorl	%r13d, %r13d
0000000000100be8	movss	0x2d03b4(%rip), %xmm0
0000000000100bf0	xorps	%xmm1, %xmm1
0000000000100bf3	xorps	%xmm2, %xmm2
0000000000100bf6	xorps	%xmm3, %xmm3
0000000000100bf9	movq	%r12, %rdi
0000000000100bfc	xorl	%esi, %esi
0000000000100bfe	callq	*0x60(%rax)
0000000000100c01	movq	(%r12), %rax
0000000000100c05	movq	%r12, %r13
0000000000100c08	movq	%r12, %rdi
0000000000100c0b	callq	*0x10(%rax)
0000000000100c0e	movq	(%r12), %rax
0000000000100c12	movq	%r12, %rdi
0000000000100c15	callq	*0x18(%rax)
0000000000100c18	cmpb	$0x1, 0x1a0(%r14)
0000000000100c20	jne	0x100c38
0000000000100c22	movq	(%r12), %rax
0000000000100c26	movq	%r12, %rdi
0000000000100c29	callq	*0x10(%rax)
0000000000100c2c	movq	%r12, 0x198(%r14)
0000000000100c33	jmp	0x100cd0
0000000000100c38	movl	$0x4a0, %edi                    ## imm = 0x4A0
0000000000100c3d	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
0000000000100c42	movq	%rax, %r13
0000000000100c45	movq	%rax, %rdi
0000000000100c48	callq	__ZN12HGColorGammaC1Ev          ## HGColorGamma::HGColorGamma()
0000000000100c4d	movq	(%r13), %rax
0000000000100c51	movq	%r13, %rdi
0000000000100c54	xorl	%esi, %esi
0000000000100c56	movq	%r12, %rdx
0000000000100c59	callq	*0x78(%rax)
0000000000100c5c	movl	0x1a8(%r14), %esi
0000000000100c63	movq	%r13, %rdi
0000000000100c66	callq	__ZN12HGColorGamma18SetToneQualityModeENS_23hgColorGammaToneQualityE ## HGColorGamma::SetToneQualityMode(HGColorGamma::hgColorGammaToneQuality)
0000000000100c6b	movl	$0x0, (%rsp)
0000000000100c72	movq	%r13, %rdi
0000000000100c75	xorl	%esi, %esi
0000000000100c77	movl	$0x1, %edx
0000000000100c7c	xorl	%ecx, %ecx
0000000000100c7e	movl	$0x3, %r8d
0000000000100c84	movl	$0x8, %r9d
0000000000100c8a	callq	__ZN12HGColorGamma13SetConversionENS_26hgColorGammaColorPrimariesENS_28hgColorGammaTransferFunctionENS_30hgColorGammaMatrixCoefficientsES0_S1_S2_ ## HGColorGamma::SetConversion(HGColorGamma::hgColorGammaColorPrimaries, HGColorGamma::hgColorGammaTransferFunction, HGColorGamma::hgColorGammaMatrixCoefficients, HGColorGamma::hgColorGammaColorPrimaries, HGColorGamma::hgColorGammaTransferFunction, HGColorGamma::hgColorGammaMatrixCoefficients)
0000000000100c8f	movq	%r13, %rdi
0000000000100c92	movl	$0x2, %esi
0000000000100c97	callq	__ZN12HGColorGamma18SetToneQualityModeENS_23hgColorGammaToneQualityE ## HGColorGamma::SetToneQualityMode(HGColorGamma::hgColorGammaToneQuality)
0000000000100c9c	movq	%r13, %rdi
0000000000100c9f	movl	$0x1, %esi
0000000000100ca4	callq	__ZN12HGColorGamma26SetAntiSymmetricToneCurvesEb ## HGColorGamma::SetAntiSymmetricToneCurves(bool)
0000000000100ca9	movq	%r13, %rdi
0000000000100cac	xorl	%esi, %esi
0000000000100cae	xorl	%edx, %edx
0000000000100cb0	callq	__ZN12HGColorGamma19SetPremultiplyStateEbb ## HGColorGamma::SetPremultiplyState(bool, bool)
0000000000100cb5	movq	(%r13), %rax
0000000000100cb9	movq	%r13, %rdi
0000000000100cbc	callq	*0x10(%rax)
0000000000100cbf	movq	%r13, 0x198(%r14)
0000000000100cc6	movq	(%r13), %rax
0000000000100cca	movq	%r13, %rdi
0000000000100ccd	callq	*0x18(%rax)
0000000000100cd0	movq	(%r12), %rax
0000000000100cd4	movq	%r12, %rdi
0000000000100cd7	callq	*0x18(%rax)
0000000000100cda	movq	(%r15), %rax
0000000000100cdd	movq	%r15, %rdi
0000000000100ce0	callq	*0x18(%rax)
0000000000100ce3	movq	(%rbx), %rax
0000000000100ce6	movq	%rbx, %rdi
0000000000100ce9	callq	*0x18(%rax)
0000000000100cec	jmp	0x100dc9
0000000000100cf1	movl	$0x1a0, %edi                    ## imm = 0x1A0
0000000000100cf6	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
0000000000100cfb	movq	%rax, %r15
0000000000100cfe	movq	%rax, %rdi
0000000000100d01	callq	__ZN22HgcBT2446_Method_A_TMOC1Ev ## HgcBT2446_Method_A_TMO::HgcBT2446_Method_A_TMO()
0000000000100d06	movq	(%r15), %rax
0000000000100d09	movq	%r15, -0x30(%rbp)
0000000000100d0d	movq	%r15, %rdi
0000000000100d10	xorl	%esi, %esi
0000000000100d12	movq	%rbx, %rdx
0000000000100d15	callq	*0x78(%rax)
0000000000100d18	movzbl	0x1a0(%r14), %r15d
0000000000100d20	testl	%r15d, %r15d
0000000000100d23	movl	$0x1, %eax
0000000000100d28	movl	$0x8, %r13d
0000000000100d2e	cmovnel	%eax, %r13d
0000000000100d32	movl	$0x370, %edi                    ## imm = 0x370
0000000000100d37	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
0000000000100d3c	movq	%rax, %r12
0000000000100d3f	movq	%rax, %rdi
0000000000100d42	callq	__ZN14HGColorConformC1Ev        ## HGColorConform::HGColorConform()
0000000000100d47	movq	(%r12), %rax
0000000000100d4b	movq	%r12, %rdi
0000000000100d4e	xorl	%esi, %esi
0000000000100d50	movq	-0x30(%rbp), %rdx
0000000000100d54	callq	*0x78(%rax)
0000000000100d57	movl	0x1a8(%r14), %esi
0000000000100d5e	movq	%r12, %rdi
0000000000100d61	callq	__ZN14HGColorConform18SetToneQualityModeENS_25hgColorConformToneQualityE ## HGColorConform::SetToneQualityMode(HGColorConform::hgColorConformToneQuality)
0000000000100d66	xorl	$0x1, %r15d
0000000000100d6a	leal	(%r15,%r15,2), %r8d
0000000000100d6e	movl	$0x0, (%rsp)
0000000000100d75	movq	%r12, %rdi
0000000000100d78	movl	$0x3, %esi
0000000000100d7d	movl	$0x1, %edx
0000000000100d82	movl	$0x3, %ecx
0000000000100d87	movl	%r13d, %r9d
0000000000100d8a	callq	__ZN14HGColorConform13SetConversionEN12HGColorGamma26hgColorGammaColorPrimariesENS0_28hgColorGammaTransferFunctionENS0_30hgColorGammaMatrixCoefficientsES1_S2_S3_ ## HGColorConform::SetConversion(HGColorGamma::hgColorGammaColorPrimaries, HGColorGamma::hgColorGammaTransferFunction, HGColorGamma::hgColorGammaMatrixCoefficients, HGColorGamma::hgColorGammaColorPrimaries, HGColorGamma::hgColorGammaTransferFunction, HGColorGamma::hgColorGammaMatrixCoefficients)
0000000000100d8f	movq	%r12, %rdi
0000000000100d92	xorl	%esi, %esi
0000000000100d94	xorl	%edx, %edx
0000000000100d96	callq	__ZN14HGColorConform19SetPremultiplyStateEbb ## HGColorConform::SetPremultiplyState(bool, bool)
0000000000100d9b	movq	(%r12), %rax
0000000000100d9f	movq	%r12, %rdi
0000000000100da2	callq	*0x10(%rax)
0000000000100da5	movq	%r12, 0x198(%r14)
0000000000100dac	movq	(%r12), %rax
0000000000100db0	movq	%r12, %rdi
0000000000100db3	callq	*0x18(%rax)
0000000000100db6	movq	-0x30(%rbp), %rdi
0000000000100dba	movq	(%rdi), %rax
0000000000100dbd	callq	*0x18(%rax)
0000000000100dc0	movq	(%rbx), %rax
0000000000100dc3	movq	%rbx, %rdi
0000000000100dc6	callq	*0x18(%rax)
0000000000100dc9	movq	0x198(%r14), %rax
0000000000100dd0	addq	$0x18, %rsp
0000000000100dd4	popq	%rbx
0000000000100dd5	popq	%r12
0000000000100dd7	popq	%r13
0000000000100dd9	popq	%r14
0000000000100ddb	popq	%r15
0000000000100ddd	popq	%rbp
0000000000100dde	retq
0000000000100ddf	jmp	0x100de1
0000000000100de1	movq	%rax, %r14
0000000000100de4	movq	%r15, %rdi
0000000000100de7	callq	__ZN8HGObjectdlEPv              ## HGObject::operator delete(void*)
0000000000100dec	jmp	0x100ec4
0000000000100df1	jmp	0x100e5d
0000000000100df3	jmp	0x100e5d
0000000000100df5	movq	%rax, %rdi
0000000000100df8	callq	___clang_call_terminate
0000000000100dfd	jmp	0x100e79
0000000000100dff	jmp	0x100f61
0000000000100e04	movq	%rax, %rdi
0000000000100e07	callq	___clang_call_terminate
0000000000100e0c	movq	%rax, %r14
0000000000100e0f	movq	%r13, %rdi
0000000000100e12	callq	__ZN8HGObjectdlEPv              ## HGObject::operator delete(void*)
0000000000100e17	jmp	0x100f95
0000000000100e1c	movq	%rax, %r14
0000000000100e1f	jmp	0x100f95
0000000000100e24	movq	%rax, %r14
0000000000100e27	jmp	0x100f95
0000000000100e2c	movq	%rax, %rdi
0000000000100e2f	callq	___clang_call_terminate
0000000000100e34	movq	%rax, %rdi
0000000000100e37	callq	___clang_call_terminate
0000000000100e3c	movq	%rax, %rdi
0000000000100e3f	callq	___clang_call_terminate
0000000000100e44	jmp	0x100ead
0000000000100e46	movq	%rax, %r14
0000000000100e49	movq	%r12, %rdi
0000000000100e4c	callq	__ZN8HGObjectdlEPv              ## HGObject::operator delete(void*)
0000000000100e51	jmp	0x100eba
0000000000100e53	movq	%rax, %r14
0000000000100e56	jmp	0x100eba
0000000000100e58	movq	%rax, %r14
0000000000100e5b	jmp	0x100eba
0000000000100e5d	movq	%rax, %r14
0000000000100e60	jmp	0x100ec4
0000000000100e62	jmp	0x100ef2
0000000000100e67	jmp	0x100eff
0000000000100e6c	jmp	0x100f1a
0000000000100e71	movq	%rax, %rdi
0000000000100e74	callq	___clang_call_terminate
0000000000100e79	movq	%rax, %r14
0000000000100e7c	movq	%r12, %rdi
0000000000100e7f	callq	__ZN8HGObjectdlEPv              ## HGObject::operator delete(void*)
0000000000100e84	jmp	0x100f9f
0000000000100e89	jmp	0x100f61
0000000000100e8e	movq	%rax, %rdi
0000000000100e91	callq	___clang_call_terminate
0000000000100e96	jmp	0x100f66
0000000000100e9b	movq	%rax, %rdi
0000000000100e9e	callq	___clang_call_terminate
0000000000100ea3	movq	%rax, %rdi
0000000000100ea6	callq	___clang_call_terminate
0000000000100eab	jmp	0x100ead
0000000000100ead	movq	%rax, %r14
0000000000100eb0	movq	(%r12), %rax
0000000000100eb4	movq	%r12, %rdi
0000000000100eb7	callq	*0x18(%rax)
0000000000100eba	movq	-0x30(%rbp), %rdi
0000000000100ebe	movq	(%rdi), %rax
0000000000100ec1	callq	*0x18(%rax)
0000000000100ec4	movq	(%rbx), %rax
0000000000100ec7	movq	%rbx, %rdi
0000000000100eca	callq	*0x18(%rax)
0000000000100ecd	jmp	0x100fb1
0000000000100ed2	movq	%rax, %r14
0000000000100ed5	movq	%r15, %rdi
0000000000100ed8	callq	__ZN8HGObjectdlEPv              ## HGObject::operator delete(void*)
0000000000100edd	jmp	0x100fa8
0000000000100ee2	movq	%rax, %r14
0000000000100ee5	jmp	0x100fa8
0000000000100eea	movq	%rax, %r14
0000000000100eed	jmp	0x100fa8
0000000000100ef2	movq	%rax, %r14
0000000000100ef5	movq	%r12, %rdi
0000000000100ef8	callq	__ZN8HGObjectdlEPv              ## HGObject::operator delete(void*)
0000000000100efd	jmp	0x100f02
0000000000100eff	movq	%rax, %r14
0000000000100f02	movq	%rbx, %rdi
0000000000100f05	callq	__ZN6HGNodeD2Ev                 ## HGNode::~HGNode()
0000000000100f0a	movq	%rbx, %rdi
0000000000100f0d	callq	__ZN8HGObjectdlEPv              ## HGObject::operator delete(void*)
0000000000100f12	movq	%r14, %rdi
0000000000100f15	callq	0x3c4e02                        ## symbol stub for: __Unwind_Resume
0000000000100f1a	movq	%rax, %r14
0000000000100f1d	movq	%rbx, %rdi
0000000000100f20	callq	__ZN8HGObjectdlEPv              ## HGObject::operator delete(void*)
0000000000100f25	movq	%r14, %rdi
0000000000100f28	callq	0x3c4e02                        ## symbol stub for: __Unwind_Resume
0000000000100f2d	movq	%rax, %r14
0000000000100f30	movq	(%r12), %rax
0000000000100f34	movq	%r12, %rdi
0000000000100f37	callq	*0x18(%rax)
0000000000100f3a	jmp	0x100f8d
0000000000100f3c	movq	%rax, %rdi
0000000000100f3f	callq	___clang_call_terminate
0000000000100f44	movq	%rax, %r14
0000000000100f47	jmp	0x100f83
0000000000100f49	movq	%rax, %rdi
0000000000100f4c	callq	___clang_call_terminate
0000000000100f51	movq	%rax, %rdi
0000000000100f54	callq	___clang_call_terminate
0000000000100f59	movq	%rax, %rdi
0000000000100f5c	callq	___clang_call_terminate
0000000000100f61	movq	%rax, %r14
0000000000100f64	jmp	0x100f9f
0000000000100f66	movq	%rax, %r14
0000000000100f69	movq	(%r13), %rax
0000000000100f6d	movq	%r13, %rdi
0000000000100f70	callq	*0x18(%rax)
0000000000100f73	jmp	0x100f95
0000000000100f75	movq	%rax, %rdi
0000000000100f78	callq	___clang_call_terminate
0000000000100f7d	movq	%rax, %r14
0000000000100f80	xorl	%r13d, %r13d
0000000000100f83	movq	(%r12), %rax
0000000000100f87	movq	%r12, %rdi
0000000000100f8a	callq	*0x18(%rax)
0000000000100f8d	movq	%r13, %r12
0000000000100f90	testq	%r13, %r13
0000000000100f93	je	0x100f9f
0000000000100f95	movq	(%r12), %rax
0000000000100f99	movq	%r12, %rdi
0000000000100f9c	callq	*0x18(%rax)
0000000000100f9f	movq	(%r15), %rax
0000000000100fa2	movq	%r15, %rdi
0000000000100fa5	callq	*0x18(%rax)
0000000000100fa8	movq	(%rbx), %rax
0000000000100fab	movq	%rbx, %rdi
0000000000100fae	callq	*0x18(%rax)
0000000000100fb1	movq	%r14, %rdi
0000000000100fb4	callq	0x3c4e02                        ## symbol stub for: __Unwind_Resume
0000000000100fb9	movq	%rax, %rdi
0000000000100fbc	callq	___clang_call_terminate
0000000000100fc1	movq	%rax, %rdi
0000000000100fc4	callq	___clang_call_terminate
0000000000100fc9	movq	%rax, %rdi
0000000000100fcc	callq	___clang_call_terminate
0000000000100fd1	movq	%rax, %rdi
0000000000100fd4	callq	___clang_call_terminate
0000000000100fd9	nopl	(%rax)
