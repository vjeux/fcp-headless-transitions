__ZN14HGColorConform9GetOutputEP10HGRenderer:
00000000001cd710	pushq	%rbp
00000000001cd711	movq	%rsp, %rbp
00000000001cd714	pushq	%r15
00000000001cd716	pushq	%r14
00000000001cd718	pushq	%rbx
00000000001cd719	pushq	%rax
00000000001cd71a	movq	%rsi, %r15
00000000001cd71d	movq	%rdi, %rbx
00000000001cd720	movl	0x1e4(%rdi), %edx
00000000001cd726	cmpl	$-0x1, %edx
00000000001cd729	je	0x1cd762
00000000001cd72b	callq	__ZN14HGColorConform29CreateColorConformHeliumGraphEP10HGRendererNS_30hgColorConformConversionPresetE ## HGColorConform::CreateColorConformHeliumGraph(HGRenderer*, HGColorConform::hgColorConformConversionPreset)
00000000001cd730	testb	%al, %al
00000000001cd732	je	0x1cd76b
00000000001cd734	movq	0x198(%rbx), %r14
00000000001cd73b	movq	%r15, %rdi
00000000001cd73e	movq	%rbx, %rsi
00000000001cd741	xorl	%edx, %edx
00000000001cd743	callq	__ZN10HGRenderer8GetInputEP6HGNodei ## HGRenderer::GetInput(HGNode*, int)
00000000001cd748	movq	(%r14), %rcx
00000000001cd74b	movq	%r14, %rdi
00000000001cd74e	xorl	%esi, %esi
00000000001cd750	movq	%rax, %rdx
00000000001cd753	callq	*0x78(%rcx)
00000000001cd756	movq	0x1a0(%rbx), %r14
00000000001cd75d	jmp	0x1cd863
00000000001cd762	callq	__ZN14HGColorConform29CreateColorConformHeliumGraphEP10HGRenderer ## HGColorConform::CreateColorConformHeliumGraph(HGRenderer*)
00000000001cd767	testb	%al, %al
00000000001cd769	jne	0x1cd734
00000000001cd76b	movl	$0x4a0, %edi                    ## imm = 0x4A0
00000000001cd770	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
00000000001cd775	movq	%rax, %r14
00000000001cd778	movq	%rax, %rdi
00000000001cd77b	callq	__ZN12HGColorGammaC1Ev          ## HGColorGamma::HGColorGamma()
00000000001cd780	movzbl	0x1da(%rbx), %esi
00000000001cd787	movq	%r14, %rdi
00000000001cd78a	callq	__ZN12HGColorGamma26SetAntiSymmetricToneCurvesEb ## HGColorGamma::SetAntiSymmetricToneCurves(bool)
00000000001cd78f	movq	%r15, %rdi
00000000001cd792	movq	%rbx, %rsi
00000000001cd795	xorl	%edx, %edx
00000000001cd797	callq	__ZN10HGRenderer8GetInputEP6HGNodei ## HGRenderer::GetInput(HGNode*, int)
00000000001cd79c	movq	(%r14), %rcx
00000000001cd79f	movq	%r14, %rdi
00000000001cd7a2	xorl	%esi, %esi
00000000001cd7a4	movq	%rax, %rdx
00000000001cd7a7	callq	*0x78(%rcx)
00000000001cd7aa	movq	%r14, %rdi
00000000001cd7ad	xorl	%esi, %esi
00000000001cd7af	callq	__ZN12HGColorGamma19SetConversionPresetENS_28hgColorGammaConversionPresetE ## HGColorGamma::SetConversionPreset(HGColorGamma::hgColorGammaConversionPreset)
00000000001cd7b4	movzbl	0x1b0(%rbx), %esi
00000000001cd7bb	movq	%r14, %rdi
00000000001cd7be	callq	__ZN12HGColorGamma15SetFallbackModeEb ## HGColorGamma::SetFallbackMode(bool)
00000000001cd7c3	movzbl	0x1b1(%rbx), %esi
00000000001cd7ca	movq	%r14, %rdi
00000000001cd7cd	callq	__ZN12HGColorGamma13SetDitherModeEb ## HGColorGamma::SetDitherMode(bool)
00000000001cd7d2	movl	0x1bc(%rbx), %esi
00000000001cd7d8	movq	%r14, %rdi
00000000001cd7db	callq	__ZN12HGColorGamma19SetInputPixelFormatE13HGYCbCrFormat ## HGColorGamma::SetInputPixelFormat(HGYCbCrFormat)
00000000001cd7e0	movl	0x1b8(%rbx), %esi
00000000001cd7e6	movl	0x1c0(%rbx), %edx
00000000001cd7ec	movq	%r14, %rdi
00000000001cd7ef	callq	__ZN12HGColorGamma20SetOutputPixelFormatE8HGFormat13HGYCbCrFormat ## HGColorGamma::SetOutputPixelFormat(HGFormat, HGYCbCrFormat)
00000000001cd7f4	movl	0x1c4(%rbx), %esi
00000000001cd7fa	movq	%r14, %rdi
00000000001cd7fd	callq	__ZN12HGColorGamma21SetInOut422FilterModeENS_30hgColorGammaInOut422FilterModeE ## HGColorGamma::SetInOut422FilterMode(HGColorGamma::hgColorGammaInOut422FilterMode)
00000000001cd802	movq	0x1c8(%rbx), %rsi
00000000001cd809	movq	0x1d0(%rbx), %rdx
00000000001cd810	movq	%r14, %rdi
00000000001cd813	callq	__ZN12HGColorGamma21SetInOut422FilterRectE6HGRect ## HGColorGamma::SetInOut422FilterRect(HGRect)
00000000001cd818	movzbl	0x1b2(%rbx), %esi
00000000001cd81f	movq	%r14, %rdi
00000000001cd822	callq	__ZN12HGColorGamma26SetFixedPointPrecisionModeEb ## HGColorGamma::SetFixedPointPrecisionMode(bool)
00000000001cd827	movzbl	0x1d8(%rbx), %esi
00000000001cd82e	movzbl	0x1d9(%rbx), %edx
00000000001cd835	movq	%r14, %rdi
00000000001cd838	callq	__ZN12HGColorGamma19SetPremultiplyStateEbb ## HGColorGamma::SetPremultiplyState(bool, bool)
00000000001cd83d	movss	0x1dc(%rbx), %xmm0
00000000001cd845	movss	0x1e0(%rbx), %xmm1
00000000001cd84d	movq	%r14, %rdi
00000000001cd850	callq	__ZN12HGColorGamma22Set1DLutScaleAndOffsetEff ## HGColorGamma::Set1DLutScaleAndOffset(float, float)
00000000001cd855	movq	%r14, 0x198(%rbx)
00000000001cd85c	movq	%r14, 0x1a0(%rbx)
00000000001cd863	movq	%r14, %rax
00000000001cd866	addq	$0x8, %rsp
00000000001cd86a	popq	%rbx
00000000001cd86b	popq	%r14
00000000001cd86d	popq	%r15
00000000001cd86f	popq	%rbp
00000000001cd870	retq
00000000001cd871	movq	%rax, %rbx
00000000001cd874	movq	%r14, %rdi
00000000001cd877	callq	__ZN8HGObjectdlEPv              ## HGObject::operator delete(void*)
00000000001cd87c	movq	%rbx, %rdi
00000000001cd87f	callq	0x3c4e02                        ## symbol stub for: __Unwind_Resume
00000000001cd884	nopw	%cs:(%rax,%rax)
