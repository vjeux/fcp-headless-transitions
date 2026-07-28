__ZN17HGYUVPlanarToRGBA18GetOutputForXRsRGBEP10HGRendererP6HGNode:
00000000000e4b80	pushq	%rbp
00000000000e4b81	movq	%rsp, %rbp
00000000000e4b84	pushq	%r15
00000000000e4b86	pushq	%r14
00000000000e4b88	pushq	%r13
00000000000e4b8a	pushq	%r12
00000000000e4b8c	pushq	%rbx
00000000000e4b8d	pushq	%rax
00000000000e4b8e	movq	%rdx, %rbx
00000000000e4b91	movq	%rdi, %r15
00000000000e4b94	movl	0x1b8(%rdi), %eax
00000000000e4b9a	testl	%eax, %eax
00000000000e4b9c	je	0xe4c13
00000000000e4b9e	cmpl	$0x2, %eax
00000000000e4ba1	je	0xe4bb0
00000000000e4ba3	cmpl	$0x3, %eax
00000000000e4ba6	jne	0xe4c1b
00000000000e4ba8	movl	$0x3, %r12d
00000000000e4bae	jmp	0xe4c1e
00000000000e4bb0	leaq	0x1ac(%r15), %r13
00000000000e4bb7	movl	$0x5, %r12d
00000000000e4bbd	cmpl	$0x2, 0x1ac(%r15)
00000000000e4bc5	jne	0xe4c25
00000000000e4bc7	movl	$0x1e0, %edi                    ## imm = 0x1E0
00000000000e4bcc	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
00000000000e4bd1	movq	%rax, %r14
00000000000e4bd4	movq	%rax, %rdi
00000000000e4bd7	callq	__ZN10HGGamutMapC1Ev            ## HGGamutMap::HGGamutMap()
00000000000e4bdc	movl	$0x0, (%rsp)
00000000000e4be3	movq	%r14, %rdi
00000000000e4be6	movl	$0x5, %esi
00000000000e4beb	movl	$0x1, %edx
00000000000e4bf0	xorl	%ecx, %ecx
00000000000e4bf2	xorl	%r8d, %r8d
00000000000e4bf5	movl	$0x8, %r9d
00000000000e4bfb	callq	__ZN10HGGamutMap13SetConversionEN12HGColorGamma26hgColorGammaColorPrimariesENS0_28hgColorGammaTransferFunctionENS0_30hgColorGammaMatrixCoefficientsES1_S2_S3_ ## HGGamutMap::SetConversion(HGColorGamma::hgColorGammaColorPrimaries, HGColorGamma::hgColorGammaTransferFunction, HGColorGamma::hgColorGammaMatrixCoefficients, HGColorGamma::hgColorGammaColorPrimaries, HGColorGamma::hgColorGammaTransferFunction, HGColorGamma::hgColorGammaMatrixCoefficients)
00000000000e4c00	movq	(%r14), %rax
00000000000e4c03	movq	%r14, %rdi
00000000000e4c06	xorl	%esi, %esi
00000000000e4c08	movq	%rbx, %rdx
00000000000e4c0b	callq	*0x78(%rax)
00000000000e4c0e	movq	%r14, %rbx
00000000000e4c11	jmp	0xe4c2e
00000000000e4c13	movl	$0x2, %r12d
00000000000e4c19	jmp	0xe4c1e
00000000000e4c1b	xorl	%r12d, %r12d
00000000000e4c1e	leaq	0x1ac(%r15), %r13
00000000000e4c25	movq	(%rbx), %rax
00000000000e4c28	movq	%rbx, %rdi
00000000000e4c2b	callq	*0x10(%rax)
00000000000e4c2e	movl	$0x370, %edi                    ## imm = 0x370
00000000000e4c33	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
00000000000e4c38	movq	%rax, %r14
00000000000e4c3b	movq	%rax, %rdi
00000000000e4c3e	callq	__ZN14HGColorConformC1Ev        ## HGColorConform::HGColorConform()
00000000000e4c43	movl	$0x0, (%rsp)
00000000000e4c4a	movq	%r14, %rdi
00000000000e4c4d	movl	%r12d, %esi
00000000000e4c50	movl	$0x1, %edx
00000000000e4c55	xorl	%ecx, %ecx
00000000000e4c57	xorl	%r8d, %r8d
00000000000e4c5a	movl	$0x8, %r9d
00000000000e4c60	callq	__ZN14HGColorConform13SetConversionEN12HGColorGamma26hgColorGammaColorPrimariesENS0_28hgColorGammaTransferFunctionENS0_30hgColorGammaMatrixCoefficientsES1_S2_S3_ ## HGColorConform::SetConversion(HGColorGamma::hgColorGammaColorPrimaries, HGColorGamma::hgColorGammaTransferFunction, HGColorGamma::hgColorGammaMatrixCoefficients, HGColorGamma::hgColorGammaColorPrimaries, HGColorGamma::hgColorGammaTransferFunction, HGColorGamma::hgColorGammaMatrixCoefficients)
00000000000e4c65	movq	(%r14), %rax
00000000000e4c68	movq	%r14, %rdi
00000000000e4c6b	xorl	%esi, %esi
00000000000e4c6d	movq	%rbx, %rdx
00000000000e4c70	callq	*0x78(%rax)
00000000000e4c73	cmpl	$0x1, (%r13)
00000000000e4c78	jne	0xe4ca9
00000000000e4c7a	cmpl	$0x2, 0x1b8(%r15)
00000000000e4c82	jne	0xe4ca9
00000000000e4c84	movl	$0x1c0, %edi                    ## imm = 0x1C0
00000000000e4c89	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
00000000000e4c8e	movq	%rax, %r15
00000000000e4c91	movq	%rax, %rdi
00000000000e4c94	callq	__ZN12HGColorClampC1Ev          ## HGColorClamp::HGColorClamp()
00000000000e4c99	movq	(%r15), %rax
00000000000e4c9c	movq	%r15, %rdi
00000000000e4c9f	xorl	%esi, %esi
00000000000e4ca1	movq	%r14, %rdx
00000000000e4ca4	callq	*0x78(%rax)
00000000000e4ca7	jmp	0xe4cb5
00000000000e4ca9	movq	(%r14), %rax
00000000000e4cac	movq	%r14, %rdi
00000000000e4caf	callq	*0x10(%rax)
00000000000e4cb2	movq	%r14, %r15
00000000000e4cb5	movl	$0x370, %edi                    ## imm = 0x370
00000000000e4cba	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
00000000000e4cbf	movq	%rax, %r12
00000000000e4cc2	movq	%rax, %rdi
00000000000e4cc5	callq	__ZN14HGColorConformC1Ev        ## HGColorConform::HGColorConform()
00000000000e4cca	movq	%r12, %rdi
00000000000e4ccd	movl	$0xb, %esi
00000000000e4cd2	callq	__ZN14HGColorConform13SetConversionENS_30hgColorConformConversionPresetE ## HGColorConform::SetConversion(HGColorConform::hgColorConformConversionPreset)
00000000000e4cd7	movq	(%r12), %rax
00000000000e4cdb	movq	%r12, %rdi
00000000000e4cde	xorl	%esi, %esi
00000000000e4ce0	movq	%r15, %rdx
00000000000e4ce3	callq	*0x78(%rax)
00000000000e4ce6	movq	(%rbx), %rax
00000000000e4ce9	movq	%rbx, %rdi
00000000000e4cec	callq	*0x18(%rax)
00000000000e4cef	movq	(%r14), %rax
00000000000e4cf2	movq	%r14, %rdi
00000000000e4cf5	callq	*0x18(%rax)
00000000000e4cf8	movq	(%r15), %rax
00000000000e4cfb	movq	%r15, %rdi
00000000000e4cfe	callq	*0x18(%rax)
00000000000e4d01	movq	%r12, %rax
00000000000e4d04	addq	$0x8, %rsp
00000000000e4d08	popq	%rbx
00000000000e4d09	popq	%r12
00000000000e4d0b	popq	%r13
00000000000e4d0d	popq	%r14
00000000000e4d0f	popq	%r15
00000000000e4d11	popq	%rbp
00000000000e4d12	retq
00000000000e4d13	jmp	0xe4d41
00000000000e4d15	movq	%rax, %rbx
00000000000e4d18	movq	%r15, %r14
00000000000e4d1b	movq	%r14, %rdi
00000000000e4d1e	callq	__ZN8HGObjectdlEPv              ## HGObject::operator delete(void*)
00000000000e4d23	movq	%rbx, %rdi
00000000000e4d26	callq	0x3c4e02                        ## symbol stub for: __Unwind_Resume
00000000000e4d2b	movq	%rax, %rbx
00000000000e4d2e	movq	%r12, %r14
00000000000e4d31	movq	%r14, %rdi
00000000000e4d34	callq	__ZN8HGObjectdlEPv              ## HGObject::operator delete(void*)
00000000000e4d39	movq	%rbx, %rdi
00000000000e4d3c	callq	0x3c4e02                        ## symbol stub for: __Unwind_Resume
00000000000e4d41	movq	%rax, %rbx
00000000000e4d44	movq	%r14, %rdi
00000000000e4d47	callq	__ZN8HGObjectdlEPv              ## HGObject::operator delete(void*)
00000000000e4d4c	movq	%rbx, %rdi
00000000000e4d4f	callq	0x3c4e02                        ## symbol stub for: __Unwind_Resume
00000000000e4d54	nopw	%cs:(%rax,%rax)
