-[FFSonySLog2SGamutProcessingInfo setColorConformPresetAndParameters:toConvertToColorSpace:forInputWithYCbCrMatrix:]:
000000000075c8a0	pushq	%rbp
000000000075c8a1	movq	%rsp, %rbp
000000000075c8a4	pushq	%r15
000000000075c8a6	pushq	%r14
000000000075c8a8	pushq	%r12
000000000075c8aa	pushq	%rbx
000000000075c8ab	movl	%r8d, %esi
000000000075c8ae	movl	%ecx, %r15d
000000000075c8b1	movq	%rdx, %rbx
000000000075c8b4	movq	%rdi, %r14
000000000075c8b7	cmpl	$0x81, %ecx
000000000075c8bd	jne	0x75c8e8
000000000075c8bf	movq	_OBJC_IVAR_$_FFSonySLog2SGamutProcessingInfo._useTungstenMatrix(%rip), %r12
000000000075c8c6	cmpb	$0x1, (%r14,%r12)
000000000075c8cb	movl	$0x6, %ecx
000000000075c8d0	sbbl	$0x0, %ecx
000000000075c8d3	movq	%rbx, %rdi
000000000075c8d6	movl	$0x8, %edx
000000000075c8db	movl	$0x3, %r8d
000000000075c8e1	callq	0x1496366                       ## symbol stub for: __ZN14HGColorConform13SetConversionEN12HGColorGamma30hgColorGammaMatrixCoefficientsENS_30hgColorConformLogLinearizationENS0_20hgColorGammaLogGamutENS0_26hgColorGammaColorPrimariesE
000000000075c8e6	jmp	0x75c908
000000000075c8e8	xorl	%eax, %eax
000000000075c8ea	cmpl	$0x1, %r15d
000000000075c8ee	sete	%al
000000000075c8f1	leal	(%rax,%rax,2), %ecx
000000000075c8f4	movq	%rbx, %rdi
000000000075c8f7	movl	$0x6, %edx
000000000075c8fc	callq	0x1496360                       ## symbol stub for: __ZN14HGColorConform13SetConversionEN12HGColorGamma30hgColorGammaMatrixCoefficientsENS_27hgColorConformLogConversionENS0_26hgColorGammaColorPrimariesE
000000000075c901	movq	_OBJC_IVAR_$_FFSonySLog2SGamutProcessingInfo._useTungstenMatrix(%rip), %r12
000000000075c908	cmpb	$0x0, (%r14,%r12)
000000000075c90d	setne	%al
000000000075c910	testl	%r15d, %r15d
000000000075c913	setne	%cl
000000000075c916	jne	0x75c922
000000000075c918	movss	0xe103b0(%rip), %xmm0
000000000075c920	jmp	0x75c92f
000000000075c922	movq	_OBJC_IVAR_$_FFSonySLog2SGamutProcessingInfo._exposureGain(%rip), %rdx
000000000075c929	movss	(%r14,%rdx), %xmm0
000000000075c92f	andb	%al, %cl
000000000075c931	movzbl	%cl, %esi
000000000075c934	movq	%rbx, %rdi
000000000075c937	popq	%rbx
000000000075c938	popq	%r12
000000000075c93a	popq	%r14
000000000075c93c	popq	%r15
000000000075c93e	popq	%rbp
000000000075c93f	jmp	0x14963de                       ## symbol stub for: __ZN14HGColorConform26SetSonySGamutGainAndMatrixEfb
000000000075c944	nopw	%cs:(%rax,%rax)
