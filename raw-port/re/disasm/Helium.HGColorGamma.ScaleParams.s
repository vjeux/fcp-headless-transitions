__ZN12HGColorGamma11ScaleParamsEP6HGNodeP10HGRenderer:
00000000000f77c0	pushq	%rbp
00000000000f77c1	movq	%rsp, %rbp
00000000000f77c4	pushq	%r15
00000000000f77c6	pushq	%r14
00000000000f77c8	pushq	%r13
00000000000f77ca	pushq	%r12
00000000000f77cc	pushq	%rbx
00000000000f77cd	subq	$0x18, %rsp
00000000000f77d1	movq	%rdx, %r15
00000000000f77d4	movq	%rdi, %r14
00000000000f77d7	cmpl	$0x424d504c, 0xc(%rsi)          ## imm = 0x424D504C
00000000000f77de	jne	0xf77f9
00000000000f77e0	movq	%rsi, %rdi
00000000000f77e3	callq	__ZNK14HGBitmapLoader15GetBitmapFormatEv ## HGBitmapLoader::GetBitmapFormat() const
00000000000f77e8	movl	%eax, %r12d
00000000000f77eb	movq	%r14, %rdi
00000000000f77ee	movl	%eax, %esi
00000000000f77f0	callq	__ZN12HGColorGamma11CanLoadDataE8HGFormat ## HGColorGamma::CanLoadData(HGFormat)
00000000000f77f5	movl	%eax, %ebx
00000000000f77f7	jmp	0xf7801
00000000000f77f9	movl	$0x1c, %r12d
00000000000f77ff	xorl	%ebx, %ebx
00000000000f7801	movaps	0x300(%r14), %xmm0
00000000000f7809	movq	0x198(%r14), %rax
00000000000f7810	movaps	%xmm0, 0x80(%rax)
00000000000f7817	movaps	0x310(%r14), %xmm0
00000000000f781f	movq	0x198(%r14), %rax
00000000000f7826	movaps	%xmm0, 0x90(%rax)
00000000000f782d	movaps	0x320(%r14), %xmm0
00000000000f7835	movq	0x198(%r14), %rax
00000000000f783c	movaps	%xmm0, 0xa0(%rax)
00000000000f7843	movaps	0x330(%r14), %xmm0
00000000000f784b	movq	0x198(%r14), %rax
00000000000f7852	movaps	%xmm0, 0xb0(%rax)
00000000000f7859	movaps	0x340(%r14), %xmm0
00000000000f7861	movq	0x198(%r14), %rax
00000000000f7868	movaps	%xmm0, 0xc0(%rax)
00000000000f786f	movaps	0x350(%r14), %xmm0
00000000000f7877	movq	0x198(%r14), %rax
00000000000f787e	movaps	%xmm0, 0xd0(%rax)
00000000000f7885	movaps	0x360(%r14), %xmm0
00000000000f788d	movq	0x198(%r14), %rax
00000000000f7894	movaps	%xmm0, 0xe0(%rax)
00000000000f789b	movl	0x404(%r14), %ecx
00000000000f78a2	movq	0x198(%r14), %rax
00000000000f78a9	movl	%ecx, 0xf0(%rax)
00000000000f78af	testb	%bl, %bl
00000000000f78b1	je	0xf7bdc
00000000000f78b7	cmpb	$0x0, 0x400(%r14)
00000000000f78bf	jne	0xf7bdc
00000000000f78c5	movaps	0x380(%r14), %xmm4
00000000000f78cd	movaps	0x390(%r14), %xmm3
00000000000f78d5	movaps	0x3a0(%r14), %xmm2
00000000000f78dd	movss	0x2d03db(%rip), %xmm0
00000000000f78e5	movaps	%xmm4, %xmm1
00000000000f78e8	cmpneqps	%xmm0, %xmm1
00000000000f78ec	movsd	0x2d03bc(%rip), %xmm5
00000000000f78f4	cmpneqps	%xmm3, %xmm5
00000000000f78f8	orps	%xmm1, %xmm5
00000000000f78fb	movaps	0x2d316e(%rip), %xmm6
00000000000f7902	cmpneqps	%xmm2, %xmm6
00000000000f7906	movaps	0x2d26d3(%rip), %xmm1
00000000000f790d	movaps	0x3b0(%r14), %xmm7
00000000000f7915	cmpneqps	%xmm1, %xmm7
00000000000f7919	orps	%xmm6, %xmm7
00000000000f791c	orps	%xmm5, %xmm7
00000000000f791f	movmskps	%xmm7, %edx
00000000000f7922	movl	%r12d, %ecx
00000000000f7925	andl	$-0x2, %ecx
00000000000f7928	testl	%edx, %edx
00000000000f792a	je	0xf79a7
00000000000f792c	cmpl	$0xe, %ecx
00000000000f792f	jne	0xf79b8
00000000000f7935	movaps	0x430(%r14), %xmm5
00000000000f793d	movaps	0x2d55bc(%rip), %xmm6
00000000000f7944	mulps	%xmm6, %xmm4
00000000000f7947	mulps	%xmm5, %xmm4
00000000000f794a	mulps	%xmm6, %xmm3
00000000000f794d	mulps	%xmm5, %xmm3
00000000000f7950	mulps	%xmm6, %xmm2
00000000000f7953	mulps	%xmm5, %xmm2
00000000000f7956	cmpl	$0x0, 0x40c(%r14)
00000000000f795e	je	0xf7a13
00000000000f7964	movaps	%xmm4, %xmm5
00000000000f7967	insertps	$0x1c, %xmm3, %xmm5             ## xmm5 = xmm5[0],xmm3[0],zero,zero
00000000000f796d	insertps	$0x20, %xmm2, %xmm5             ## xmm5 = xmm5[0,1],xmm2[0],xmm5[3]
00000000000f7973	movaps	%xmm5, (%rax)
00000000000f7976	xorps	%xmm5, %xmm5
00000000000f7979	movaps	%xmm3, %xmm6
00000000000f797c	insertps	$0x4c, %xmm4, %xmm6             ## xmm6 = xmm4[1],xmm6[1],zero,zero
00000000000f7982	insertps	$0x60, %xmm2, %xmm6             ## xmm6 = xmm6[0,1],xmm2[1],xmm6[3]
00000000000f7988	movq	0x198(%r14), %rax
00000000000f798f	movaps	%xmm6, 0x10(%rax)
00000000000f7993	movhlps	%xmm4, %xmm5                    ## xmm5 = xmm4[1],xmm5[1]
00000000000f7996	insertps	$0x94, %xmm3, %xmm5             ## xmm5 = xmm5[0],xmm3[2],zero,xmm5[3]
00000000000f799c	blendps	$0x4, %xmm2, %xmm5              ## xmm5 = xmm5[0,1],xmm2[2],xmm5[3]
00000000000f79a2	jmp	0xf7a5a
00000000000f79a7	cmpl	$0xe, %ecx
00000000000f79aa	jne	0xf79e2
00000000000f79ac	movaps	0x2d554d(%rip), %xmm2
00000000000f79b3	jmp	0xf7acc
00000000000f79b8	cmpl	$0x18, %r12d
00000000000f79bc	je	0xf7a02
00000000000f79be	cmpl	$0x16, %r12d
00000000000f79c2	je	0xf7a02
00000000000f79c4	cmpl	$0x10, %r12d
00000000000f79c8	jne	0xf7a69
00000000000f79ce	movaps	0x430(%r14), %xmm5
00000000000f79d6	movaps	0x2d5593(%rip), %xmm6
00000000000f79dd	jmp	0xf7944
00000000000f79e2	cmpl	$0x10, %r12d
00000000000f79e6	je	0xf7ac5
00000000000f79ec	cmpl	$0x1f, %r12d
00000000000f79f0	jne	0xf7adb
00000000000f79f6	movaps	0x2d5553(%rip), %xmm2
00000000000f79fd	jmp	0xf7acc
00000000000f7a02	movaps	0x430(%r14), %xmm5
00000000000f7a0a	movaps	0x2d54ef(%rip), %xmm6
00000000000f7a11	jmp	0xf7a86
00000000000f7a13	movaps	%xmm3, %xmm5
00000000000f7a16	blendps	$0x2, %xmm4, %xmm5              ## xmm5 = xmm5[0],xmm4[1],xmm5[2,3]
00000000000f7a1c	shufps	$0xe1, %xmm2, %xmm5             ## xmm5 = xmm5[1,0],xmm2[2,3]
00000000000f7a20	insertps	$0x30, %xmm3, %xmm5             ## xmm5 = xmm5[0,1,2],xmm3[0]
00000000000f7a26	movaps	%xmm5, (%rax)
00000000000f7a29	movaps	%xmm2, %xmm5
00000000000f7a2c	blendps	$0x2, %xmm3, %xmm5              ## xmm5 = xmm5[0],xmm3[1],xmm5[2,3]
00000000000f7a32	shufps	$0xe1, %xmm4, %xmm5             ## xmm5 = xmm5[1,0],xmm4[2,3]
00000000000f7a36	insertps	$0x30, %xmm2, %xmm5             ## xmm5 = xmm5[0,1,2],xmm2[0]
00000000000f7a3c	movq	0x198(%r14), %rax
00000000000f7a43	movaps	%xmm5, 0x10(%rax)
00000000000f7a47	blendps	$0xd, %xmm4, %xmm2              ## xmm2 = xmm4[0],xmm2[1],xmm4[2,3]
00000000000f7a4d	shufps	$0xe1, %xmm3, %xmm2             ## xmm2 = xmm2[1,0],xmm3[2,3]
00000000000f7a51	insertps	$0x30, %xmm4, %xmm2             ## xmm2 = xmm2[0,1,2],xmm4[0]
00000000000f7a57	movaps	%xmm2, %xmm5
00000000000f7a5a	movq	0x198(%r14), %rax
00000000000f7a61	movaps	%xmm5, 0x20(%rax)
00000000000f7a65	movb	$0x1, %cl
00000000000f7a67	jmp	0xf7add
00000000000f7a69	leal	-0x19(%r12), %ecx
00000000000f7a6e	cmpl	$0x1, %ecx
00000000000f7a71	ja	0xf8e9f
00000000000f7a77	movaps	0x430(%r14), %xmm5
00000000000f7a7f	movaps	0x2d54ea(%rip), %xmm6
00000000000f7a86	mulps	%xmm6, %xmm4
00000000000f7a89	mulps	%xmm5, %xmm4
00000000000f7a8c	mulps	%xmm6, %xmm3
00000000000f7a8f	mulps	%xmm5, %xmm3
00000000000f7a92	mulps	%xmm6, %xmm2
00000000000f7a95	mulps	%xmm5, %xmm2
00000000000f7a98	movaps	0x2d2f21(%rip), %xmm5
00000000000f7a9f	mulps	%xmm5, %xmm4
00000000000f7aa2	movaps	%xmm4, (%rax)
00000000000f7aa5	mulps	%xmm5, %xmm3
00000000000f7aa8	movq	0x198(%r14), %rax
00000000000f7aaf	movaps	%xmm3, 0x10(%rax)
00000000000f7ab3	mulps	%xmm5, %xmm2
00000000000f7ab6	movq	0x198(%r14), %rax
00000000000f7abd	movaps	%xmm2, 0x20(%rax)
00000000000f7ac1	movb	$0x1, %cl
00000000000f7ac3	jmp	0xf7add
00000000000f7ac5	movaps	0x2d54a4(%rip), %xmm2
00000000000f7acc	mulps	0x430(%r14), %xmm2
00000000000f7ad4	movaps	%xmm2, 0x110(%rax)
00000000000f7adb	xorl	%ecx, %ecx
00000000000f7add	movq	0x198(%r14), %rax
00000000000f7ae4	movb	%cl, 0xf8(%rax)
00000000000f7aea	movaps	0x3c0(%r14), %xmm4
00000000000f7af2	movaps	0x3d0(%r14), %xmm3
00000000000f7afa	movaps	0x3e0(%r14), %xmm2
00000000000f7b02	cmpneqps	%xmm4, %xmm0
00000000000f7b06	movsd	0x2d01a2(%rip), %xmm5
00000000000f7b0e	cmpneqps	%xmm3, %xmm5
00000000000f7b12	orps	%xmm0, %xmm5
00000000000f7b15	movaps	0x2d2f54(%rip), %xmm0
00000000000f7b1c	cmpneqps	%xmm2, %xmm0
00000000000f7b20	cmpneqps	0x3f0(%r14), %xmm1
00000000000f7b29	orps	%xmm0, %xmm1
00000000000f7b2c	orps	%xmm5, %xmm1
00000000000f7b2f	movmskps	%xmm1, %ecx
00000000000f7b32	testl	%ecx, %ecx
00000000000f7b34	je	0xf7b7c
00000000000f7b36	movaps	0x440(%r14), %xmm0
00000000000f7b3e	mulps	%xmm0, %xmm4
00000000000f7b41	mulps	%xmm0, %xmm3
00000000000f7b44	mulps	%xmm0, %xmm2
00000000000f7b47	movaps	0x2d2e72(%rip), %xmm0
00000000000f7b4e	mulps	%xmm0, %xmm4
00000000000f7b51	movaps	%xmm4, 0x40(%rax)
00000000000f7b55	mulps	%xmm0, %xmm3
00000000000f7b58	movq	0x198(%r14), %rax
00000000000f7b5f	movaps	%xmm3, 0x50(%rax)
00000000000f7b63	mulps	%xmm0, %xmm2
00000000000f7b66	movq	0x198(%r14), %rax
00000000000f7b6d	movaps	%xmm2, 0x60(%rax)
00000000000f7b71	movq	0x198(%r14), %rax
00000000000f7b78	movb	$0x1, %cl
00000000000f7b7a	jmp	0xf7b7e
00000000000f7b7c	xorl	%ecx, %ecx
00000000000f7b7e	movb	%cl, 0xf9(%rax)
00000000000f7b84	movl	0x40c(%r14), %ecx
00000000000f7b8b	movl	%ecx, 0xf4(%rax)
00000000000f7b91	cmpl	$0x21, %r12d
00000000000f7b95	ja	0xf7ff6
00000000000f7b9b	movl	%r12d, %ecx
00000000000f7b9e	movl	$0x140c000, %edx                ## imm = 0x140C000
00000000000f7ba3	btq	%rcx, %rdx
00000000000f7ba7	jb	0xf7bc6
00000000000f7ba9	movabsq	$0x206010000, %rdx              ## imm = 0x206010000
00000000000f7bb3	btq	%rcx, %rdx
00000000000f7bb7	jae	0xf7ff6
00000000000f7bbd	movaps	0x2d368c(%rip), %xmm0
00000000000f7bc4	jmp	0xf7bcd
00000000000f7bc6	movaps	0x2d7543(%rip), %xmm0
00000000000f7bcd	mulps	0x450(%r14), %xmm0
00000000000f7bd5	movaps	%xmm0, 0x100(%rax)
00000000000f7bdc	movq	%r14, %rdi
00000000000f7bdf	callq	__ZN12HGColorGamma19LoadMacroNodeParamsEv ## HGColorGamma::LoadMacroNodeParams()
00000000000f7be4	movl	0x404(%r14), %esi
00000000000f7beb	testl	%esi, %esi
00000000000f7bed	jne	0xf7c10
00000000000f7bef	movaps	0x2d2dca(%rip), %xmm0
00000000000f7bf6	movaps	0x300(%r14), %xmm1
00000000000f7bfe	mulps	%xmm0, %xmm1
00000000000f7c01	cmpneqps	%xmm0, %xmm1
00000000000f7c05	movmskps	%xmm1, %eax
00000000000f7c08	testb	%al, %al
00000000000f7c0a	je	0xf8e8e
00000000000f7c10	testl	%esi, %esi
00000000000f7c12	je	0xf7c89
00000000000f7c14	cmpl	$0x4, %esi
00000000000f7c17	jg	0xf7da6
00000000000f7c1d	movl	0x490(%r14), %eax
00000000000f7c24	cmpl	$0x2, %eax
00000000000f7c27	jne	0xf7cda
00000000000f7c2d	movzbl	0x497(%r14), %eax
00000000000f7c35	cmpl	$0x3, %esi
00000000000f7c38	je	0xf8054
00000000000f7c3e	cmpl	$0x2, %esi
00000000000f7c41	je	0xf8018
00000000000f7c47	cmpl	$0x1, %esi
00000000000f7c4a	jne	0xf8090
00000000000f7c50	testb	%al, %al
00000000000f7c52	je	0xf833c
00000000000f7c58	movq	0x2b0(%r14), %r15
00000000000f7c5f	testq	%r15, %r15
00000000000f7c62	jne	0xf8364
00000000000f7c68	movl	$0x1a0, %edi                    ## imm = 0x1A0
00000000000f7c6d	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
00000000000f7c72	movq	%rax, %r15
00000000000f7c75	movq	%rax, %rdi
00000000000f7c78	callq	__ZN31HgcToneParamCurve1AntiSymmetricC1Ev ## HgcToneParamCurve1AntiSymmetric::HgcToneParamCurve1AntiSymmetric()
00000000000f7c7d	movq	%r15, 0x2b0(%r14)
00000000000f7c84	jmp	0xf8364
00000000000f7c89	movl	0x490(%r14), %eax
00000000000f7c90	leal	-0x1(%rax), %ecx
00000000000f7c93	cmpl	$0x1, %ecx
00000000000f7c96	ja	0xf7cda
00000000000f7c98	cmpb	$0x1, 0x370(%r14)
00000000000f7ca0	jne	0xf7f32
00000000000f7ca6	movq	0x1b8(%r14), %rdi
00000000000f7cad	testq	%rdi, %rdi
00000000000f7cb0	jne	0xf7f5d
00000000000f7cb6	movl	$0x1b0, %edi                    ## imm = 0x1B0
00000000000f7cbb	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
00000000000f7cc0	movq	%rax, %r15
00000000000f7cc3	movq	%rax, %rdi
00000000000f7cc6	callq	__ZN7HGGammaC1Ev                ## HGGamma::HGGamma()
00000000000f7ccb	movq	%r15, %rdi
00000000000f7cce	movq	%r15, 0x1b8(%r14)
00000000000f7cd5	jmp	0xf7f5d
00000000000f7cda	cmpl	$0x3, %eax
00000000000f7cdd	jl	0xf7daf
00000000000f7ce3	cmpb	$0x1, 0x370(%r14)
00000000000f7ceb	jne	0xf7daf
00000000000f7cf1	movq	0x1d0(%r14), %r15
00000000000f7cf8	testq	%r15, %r15
00000000000f7cfb	jne	0xf7d20
00000000000f7cfd	movl	$0x1e0, %edi                    ## imm = 0x1E0
00000000000f7d02	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
00000000000f7d07	movq	%rax, %r15
00000000000f7d0a	movq	%rax, %rdi
00000000000f7d0d	callq	__ZN11HGToneCurveC1Ev           ## HGToneCurve::HGToneCurve()
00000000000f7d12	movq	%r15, 0x1d0(%r14)
00000000000f7d19	movl	0x404(%r14), %esi
00000000000f7d20	movq	0x198(%r14), %rax
00000000000f7d27	movss	0x80(%rax), %xmm0
00000000000f7d2f	movss	0x90(%rax), %xmm1
00000000000f7d37	movss	0xa0(%rax), %xmm2
00000000000f7d3f	movss	0xb0(%rax), %xmm3
00000000000f7d47	movss	0xc0(%rax), %xmm4
00000000000f7d4f	movss	0xd0(%rax), %xmm5
00000000000f7d57	movss	0xe0(%rax), %xmm6
00000000000f7d5f	movq	%r15, %rdi
00000000000f7d62	callq	__ZN11HGToneCurve18SetToneCurveParamsENS_15hgToneCurveFormEfffffff ## HGToneCurve::SetToneCurveParams(HGToneCurve::hgToneCurveForm, float, float, float, float, float, float, float)
00000000000f7d67	movq	0x1d0(%r14), %rdi
00000000000f7d6e	testq	%rdi, %rdi
00000000000f7d71	jne	0xf7d92
00000000000f7d73	movl	$0x1e0, %edi                    ## imm = 0x1E0
00000000000f7d78	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
00000000000f7d7d	movq	%rax, %r15
00000000000f7d80	movq	%rax, %rdi
00000000000f7d83	callq	__ZN11HGToneCurveC1Ev           ## HGToneCurve::HGToneCurve()
00000000000f7d88	movq	%r15, %rdi
00000000000f7d8b	movq	%r15, 0x1d0(%r14)
00000000000f7d92	movl	0x490(%r14), %esi
00000000000f7d99	addl	$-0x3, %esi
00000000000f7d9c	callq	__ZN11HGToneCurve19SetToneCurveQualityENS_18hgToneCurveQualityE ## HGToneCurve::SetToneCurveQuality(HGToneCurve::hgToneCurveQuality)
00000000000f7da1	jmp	0xf8e8e
00000000000f7da6	cmpl	$0x9, %esi
00000000000f7da9	ja	0xf8e8e
00000000000f7daf	movzbl	__ZGVZN12HGColorGamma11ScaleParamsEP6HGNodeP10HGRendererE10lutFactory(%rip), %eax ## guard variable for HGColorGamma::ScaleParams(HGNode*, HGRenderer*)::lutFactory
00000000000f7db6	testb	%al, %al
00000000000f7db8	je	0xf92fb
00000000000f7dbe	movl	0x404(%r14), %eax
00000000000f7dc5	cmpq	$0x12, %rax
00000000000f7dc9	ja	0xf9311
00000000000f7dcf	leaq	0x1652(%rip), %rcx
00000000000f7dd6	movslq	(%rcx,%rax,4), %rax
00000000000f7dda	addq	%rcx, %rax
00000000000f7ddd	jmpq	*%rax
00000000000f7ddf	movl	$0x28, %edi
00000000000f7de4	callq	0x3c4fb2                        ## symbol stub for: __Znwm
00000000000f7de9	movq	%rax, %r12
00000000000f7dec	movss	0x2cfecc(%rip), %xmm0
00000000000f7df4	movl	$0x10, %esi
00000000000f7df9	xorps	%xmm1, %xmm1
00000000000f7dfc	movq	%rax, %rdi
00000000000f7dff	movl	$0x1, %edx
00000000000f7e04	callq	__ZN30HGAYCCToneCurveToLinearLUTInfoC1EmffN16HGApplyNDLUTInfo16LUTStorageFormatE ## HGAYCCToneCurveToLinearLUTInfo::HGAYCCToneCurveToLinearLUTInfo(unsigned long, float, float, HGApplyNDLUTInfo::LUTStorageFormat)
00000000000f7e09	jmp	0xf7e82
00000000000f7e0b	movl	$0x80, %edi
00000000000f7e10	callq	0x3c4fb2                        ## symbol stub for: __Znwm
00000000000f7e15	movq	%rax, %r12
00000000000f7e18	movl	0x480(%r14), %esi
00000000000f7e1f	movss	0x484(%r14), %xmm0
00000000000f7e28	movss	0x488(%r14), %xmm1
00000000000f7e31	movq	0x198(%r14), %rax
00000000000f7e38	movl	0xf0(%rax), %edx
00000000000f7e3e	movaps	0x80(%rax), %xmm2
00000000000f7e45	movaps	0x90(%rax), %xmm3
00000000000f7e4c	movaps	0xa0(%rax), %xmm4
00000000000f7e53	movaps	0xb0(%rax), %xmm5
00000000000f7e5a	movaps	0xc0(%rax), %xmm6
00000000000f7e61	movaps	0xd0(%rax), %xmm7
00000000000f7e68	movaps	0xe0(%rax), %xmm8
00000000000f7e70	movaps	%xmm8, (%rsp)
00000000000f7e75	movq	%r12, %rdi
00000000000f7e78	movl	$0x1, %ecx
00000000000f7e7d	callq	__ZN19HGColorGammaLUTInfoC1EmffN12HGColorGamma16hgColorGammaFormEDv4_fS2_S2_S2_S2_S2_S2_N16HGApplyNDLUTInfo16LUTStorageFormatE ## HGColorGammaLUTInfo::HGColorGammaLUTInfo(unsigned long, float, float, HGColorGamma::hgColorGammaForm, float vector[4], float vector[4], float vector[4], float vector[4], float vector[4], float vector[4], float vector[4], HGApplyNDLUTInfo::LUTStorageFormat)
00000000000f7e82	movq	0x228(%r15), %rdi
00000000000f7e89	leaq	__ZZN12HGColorGamma11ScaleParamsEP6HGNodeP10HGRendererE10lutFactory(%rip), %rsi ## HGColorGamma::ScaleParams(HGNode*, HGRenderer*)::lutFactory
00000000000f7e90	callq	__ZN17HGLUTCacheManager11getLUTCacheEPN10HGLUTCache15LUTEntryFactoryE ## HGLUTCacheManager::getLUTCache(HGLUTCache::LUTEntryFactory*)
00000000000f7e95	movq	%rax, %rdi
00000000000f7e98	movq	%r12, %rsi
00000000000f7e9b	callq	__ZN10HGLUTCache9getNewLUTEPNS_7LUTInfoE ## HGLUTCache::getNewLUT(HGLUTCache::LUTInfo*)
00000000000f7ea0	movq	%rax, %r15
00000000000f7ea3	movq	0x280(%r14), %rdi
00000000000f7eaa	testq	%rdi, %rdi
00000000000f7ead	jne	0xf7f09
00000000000f7eaf	movl	$0x1d0, %edi                    ## imm = 0x1D0
00000000000f7eb4	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
00000000000f7eb9	movl	0x480(%r14), %esi
00000000000f7ec0	movss	0x484(%r14), %xmm0
00000000000f7ec9	movss	0x488(%r14), %xmm1
00000000000f7ed2	movl	$0x1, 0x8(%rsp)
00000000000f7eda	movl	$0x1, (%rsp)
00000000000f7ee1	movq	%rax, %r13
00000000000f7ee4	movq	%rax, %rdi
00000000000f7ee7	movl	$0x1, %edx
00000000000f7eec	movl	$0x1, %ecx
00000000000f7ef1	movl	$0x1, %r8d
00000000000f7ef7	xorl	%r9d, %r9d
00000000000f7efa	callq	__ZN12HGApply1DLUTC1Ejffbbbbbb  ## HGApply1DLUT::HGApply1DLUT(unsigned int, float, float, bool, bool, bool, bool, bool, bool)
00000000000f7eff	movq	%r13, %rdi
00000000000f7f02	movq	%r13, 0x280(%r14)
00000000000f7f09	movq	%r15, %rsi
00000000000f7f0c	callq	__ZN12HGApply1DLUT12SetLUTBitmapEP8HGBitmap ## HGApply1DLUT::SetLUTBitmap(HGBitmap*)
00000000000f7f11	movq	(%r15), %rax
00000000000f7f14	movq	%r15, %rdi
00000000000f7f17	callq	*0x18(%rax)
00000000000f7f1a	testq	%r12, %r12
00000000000f7f1d	je	0xf8e8e
00000000000f7f23	movq	(%r12), %rax
00000000000f7f27	movq	%r12, %rdi
00000000000f7f2a	callq	*0x8(%rax)
00000000000f7f2d	jmp	0xf8e8e
00000000000f7f32	movq	0x1c0(%r14), %rdi
00000000000f7f39	testq	%rdi, %rdi
00000000000f7f3c	jne	0xf7f5d
00000000000f7f3e	movl	$0x1c0, %edi                    ## imm = 0x1C0
00000000000f7f43	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
00000000000f7f48	movq	%rax, %r15
00000000000f7f4b	movq	%rax, %rdi
00000000000f7f4e	callq	__ZN9HGGammaMCC1Ev              ## HGGammaMC::HGGammaMC()
00000000000f7f53	movq	%r15, %rdi
00000000000f7f56	movq	%r15, 0x1c0(%r14)
00000000000f7f5d	movq	0x198(%r14), %rax
00000000000f7f64	movss	0x80(%rax), %xmm0
00000000000f7f6c	movss	0x84(%rax), %xmm1
00000000000f7f74	movss	0x88(%rax), %xmm2
00000000000f7f7c	movq	(%rdi), %rax
00000000000f7f7f	movss	0x2cfd39(%rip), %xmm3
00000000000f7f87	xorl	%esi, %esi
00000000000f7f89	callq	*0x60(%rax)
00000000000f7f8c	movq	0x1c8(%r14), %rdi
00000000000f7f93	testq	%rdi, %rdi
00000000000f7f96	jne	0xf7fc5
00000000000f7f98	movl	$0x1b0, %edi                    ## imm = 0x1B0
00000000000f7f9d	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
00000000000f7fa2	movq	%rax, %r15
00000000000f7fa5	movq	%rax, %rdi
00000000000f7fa8	callq	__ZN7HGGammaC1Ev                ## HGGamma::HGGamma()
00000000000f7fad	movq	%r15, 0x1c8(%r14)
00000000000f7fb4	movq	%r15, %rdi
00000000000f7fb7	xorl	%esi, %esi
00000000000f7fb9	callq	__ZN7HGGamma19SetPremultiplyStateEb ## HGGamma::SetPremultiplyState(bool)
00000000000f7fbe	movq	0x1c8(%r14), %rdi
00000000000f7fc5	movq	0x198(%r14), %rax
00000000000f7fcc	movss	0x80(%rax), %xmm0
00000000000f7fd4	movss	0x84(%rax), %xmm1
00000000000f7fdc	movss	0x88(%rax), %xmm2
00000000000f7fe4	movq	(%rdi), %rax
00000000000f7fe7	movss	0x2cfcd1(%rip), %xmm3
00000000000f7fef	xorl	%esi, %esi
00000000000f7ff1	jmp	0xf8e8b
00000000000f7ff6	addl	$-0x1f, %r12d
00000000000f7ffa	movaps	0x450(%r14), %xmm0
00000000000f8002	cmpl	$0x2, %r12d
00000000000f8006	jae	0xf7bd5
00000000000f800c	mulps	0x2d712d(%rip), %xmm0
00000000000f8013	jmp	0xf7bd5
00000000000f8018	testb	%al, %al
00000000000f801a	je	0xf8204
00000000000f8020	movq	0x2b8(%r14), %rdi
00000000000f8027	testq	%rdi, %rdi
00000000000f802a	jne	0xf822f
00000000000f8030	movl	$0x1a0, %edi                    ## imm = 0x1A0
00000000000f8035	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
00000000000f803a	movq	%rax, %r15
00000000000f803d	movq	%rax, %rdi
00000000000f8040	callq	__ZN31HgcToneParamCurve2AntiSymmetricC1Ev ## HgcToneParamCurve2AntiSymmetric::HgcToneParamCurve2AntiSymmetric()
00000000000f8045	movq	%r15, %rdi
00000000000f8048	movq	%r15, 0x2b8(%r14)
00000000000f804f	jmp	0xf822f
00000000000f8054	testb	%al, %al
00000000000f8056	je	0xf82a0
00000000000f805c	movq	0x2c0(%r14), %rdi
00000000000f8063	testq	%rdi, %rdi
00000000000f8066	jne	0xf82cb
00000000000f806c	movl	$0x1a0, %edi                    ## imm = 0x1A0
00000000000f8071	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
00000000000f8076	movq	%rax, %r15
00000000000f8079	movq	%rax, %rdi
00000000000f807c	callq	__ZN31HgcToneParamCurve3AntiSymmetricC1Ev ## HgcToneParamCurve3AntiSymmetric::HgcToneParamCurve3AntiSymmetric()
00000000000f8081	movq	%r15, %rdi
00000000000f8084	movq	%r15, 0x2c0(%r14)
00000000000f808b	jmp	0xf82cb
00000000000f8090	testb	%al, %al
00000000000f8092	je	0xf83d8
00000000000f8098	movq	0x2c8(%r14), %r15
00000000000f809f	testq	%r15, %r15
00000000000f80a2	jne	0xf8400
00000000000f80a8	movl	$0x1a0, %edi                    ## imm = 0x1A0
00000000000f80ad	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
00000000000f80b2	movq	%rax, %r15
00000000000f80b5	movq	%rax, %rdi
00000000000f80b8	callq	__ZN31HgcToneParamCurve4AntiSymmetricC1Ev ## HgcToneParamCurve4AntiSymmetric::HgcToneParamCurve4AntiSymmetric()
00000000000f80bd	movq	%r15, 0x2c8(%r14)
00000000000f80c4	jmp	0xf8400
00000000000f80c9	movl	$0x28, %edi
00000000000f80ce	callq	0x3c4fb2                        ## symbol stub for: __Znwm
00000000000f80d3	movq	%rax, %r12
00000000000f80d6	movl	0x480(%r14), %esi
00000000000f80dd	movss	0x484(%r14), %xmm0
00000000000f80e6	movss	0x488(%r14), %xmm1
00000000000f80ef	movq	%rax, %rdi
00000000000f80f2	movl	$0x1, %edx
00000000000f80f7	callq	__ZN32HGLinearToERsRGBToneCurveLUTInfoC1EmffN16HGApplyNDLUTInfo16LUTStorageFormatE ## HGLinearToERsRGBToneCurveLUTInfo::HGLinearToERsRGBToneCurveLUTInfo(unsigned long, float, float, HGApplyNDLUTInfo::LUTStorageFormat)
00000000000f80fc	jmp	0xf7e82
00000000000f8101	movl	$0x28, %edi
00000000000f8106	callq	0x3c4fb2                        ## symbol stub for: __Znwm
00000000000f810b	movq	%rax, %r12
00000000000f810e	movl	0x480(%r14), %esi
00000000000f8115	movss	0x484(%r14), %xmm0
00000000000f811e	movss	0x488(%r14), %xmm1
00000000000f8127	movq	%rax, %rdi
00000000000f812a	movl	$0x1, %edx
00000000000f812f	callq	__ZN30HGLinearToAYCCToneCurveLUTInfoC2EmffN16HGApplyNDLUTInfo16LUTStorageFormatE ## HGLinearToAYCCToneCurveLUTInfo::HGLinearToAYCCToneCurveLUTInfo(unsigned long, float, float, HGApplyNDLUTInfo::LUTStorageFormat)
00000000000f8134	jmp	0xf7e82
00000000000f8139	movl	0x408(%r14), %eax
00000000000f8140	cmpq	$0x12, %rax
00000000000f8144	ja	0xf9311
00000000000f814a	leaq	0x1323(%rip), %rcx
00000000000f8151	movslq	(%rcx,%rax,4), %rax
00000000000f8155	addq	%rcx, %rax
00000000000f8158	jmpq	*%rax
00000000000f815a	movl	$0x80, %edi
00000000000f815f	callq	0x3c4fb2                        ## symbol stub for: __Znwm
00000000000f8164	movq	%rax, %r12
00000000000f8167	movl	0x480(%r14), %esi
00000000000f816e	movss	0x484(%r14), %xmm0
00000000000f8177	movss	0x488(%r14), %xmm1
00000000000f8180	movq	%rax, %rdi
00000000000f8183	xorl	%edx, %edx
00000000000f8185	movl	$0x1, %ecx
00000000000f818a	callq	__ZN33HGArriLogCDefaultToneCurveLUTInfoC1EmffbN16HGApplyNDLUTInfo16LUTStorageFormatE ## HGArriLogCDefaultToneCurveLUTInfo::HGArriLogCDefaultToneCurveLUTInfo(unsigned long, float, float, bool, HGApplyNDLUTInfo::LUTStorageFormat)
00000000000f818f	jmp	0xf7e82
00000000000f8194	movl	$0x28, %edi
00000000000f8199	callq	0x3c4fb2                        ## symbol stub for: __Znwm
00000000000f819e	movq	%rax, %r12
00000000000f81a1	movl	0x480(%r14), %esi
00000000000f81a8	movss	0x484(%r14), %xmm0
00000000000f81b1	movss	0x488(%r14), %xmm1
00000000000f81ba	movq	%rax, %rdi
00000000000f81bd	movl	$0x1, %edx
00000000000f81c2	callq	__ZN30HGAYCCToneCurveToLinearLUTInfoC1EmffN16HGApplyNDLUTInfo16LUTStorageFormatE ## HGAYCCToneCurveToLinearLUTInfo::HGAYCCToneCurveToLinearLUTInfo(unsigned long, float, float, HGApplyNDLUTInfo::LUTStorageFormat)
00000000000f81c7	jmp	0xf7e82
00000000000f81cc	movl	$0x28, %edi
00000000000f81d1	callq	0x3c4fb2                        ## symbol stub for: __Znwm
00000000000f81d6	movq	%rax, %r12
00000000000f81d9	movl	0x480(%r14), %esi
00000000000f81e0	movss	0x484(%r14), %xmm0
00000000000f81e9	movss	0x488(%r14), %xmm1
00000000000f81f2	movq	%rax, %rdi
00000000000f81f5	movl	$0x1, %edx
00000000000f81fa	callq	__ZN33HG_ERsRGBToneCurveToLinearLUTInfoC2EmffN16HGApplyNDLUTInfo16LUTStorageFormatE ## HG_ERsRGBToneCurveToLinearLUTInfo::HG_ERsRGBToneCurveToLinearLUTInfo(unsigned long, float, float, HGApplyNDLUTInfo::LUTStorageFormat)
00000000000f81ff	jmp	0xf7e82
00000000000f8204	movq	0x298(%r14), %rdi
00000000000f820b	testq	%rdi, %rdi
00000000000f820e	jne	0xf822f
00000000000f8210	movl	$0x1a0, %edi                    ## imm = 0x1A0
00000000000f8215	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
00000000000f821a	movq	%rax, %r15
00000000000f821d	movq	%rax, %rdi
00000000000f8220	callq	__ZN18HgcToneParamCurve2C1Ev    ## HgcToneParamCurve2::HgcToneParamCurve2()
00000000000f8225	movq	%r15, %rdi
00000000000f8228	movq	%r15, 0x298(%r14)
00000000000f822f	movq	0x198(%r14), %rax
00000000000f8236	movss	0x80(%rax), %xmm0
00000000000f823e	movss	0x84(%rax), %xmm1
00000000000f8246	movss	0x88(%rax), %xmm2
00000000000f824e	movq	(%rdi), %rax
00000000000f8251	movss	0x2cfa67(%rip), %xmm3
00000000000f8259	xorl	%esi, %esi
00000000000f825b	callq	*0x60(%rax)
00000000000f825e	cmpb	$0x1, 0x497(%r14)
00000000000f8266	jne	0xf8474
00000000000f826c	movq	0x2b8(%r14), %rdi
00000000000f8273	testq	%rdi, %rdi
00000000000f8276	jne	0xf849f
00000000000f827c	movl	$0x1a0, %edi                    ## imm = 0x1A0
00000000000f8281	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
00000000000f8286	movq	%rax, %r15
00000000000f8289	movq	%rax, %rdi
00000000000f828c	callq	__ZN31HgcToneParamCurve2AntiSymmetricC1Ev ## HgcToneParamCurve2AntiSymmetric::HgcToneParamCurve2AntiSymmetric()
00000000000f8291	movq	%r15, %rdi
00000000000f8294	movq	%r15, 0x2b8(%r14)
00000000000f829b	jmp	0xf849f
00000000000f82a0	movq	0x2a0(%r14), %rdi
00000000000f82a7	testq	%rdi, %rdi
00000000000f82aa	jne	0xf82cb
00000000000f82ac	movl	$0x1a0, %edi                    ## imm = 0x1A0
00000000000f82b1	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
00000000000f82b6	movq	%rax, %r15
00000000000f82b9	movq	%rax, %rdi
00000000000f82bc	callq	__ZN18HgcToneParamCurve3C1Ev    ## HgcToneParamCurve3::HgcToneParamCurve3()
00000000000f82c1	movq	%r15, %rdi
00000000000f82c4	movq	%r15, 0x2a0(%r14)
00000000000f82cb	movq	0x198(%r14), %rax
00000000000f82d2	movss	0x80(%rax), %xmm0
00000000000f82da	movss	0x84(%rax), %xmm1
00000000000f82e2	movss	0x88(%rax), %xmm2
00000000000f82ea	movq	(%rdi), %rax
00000000000f82ed	movss	0x2cf9cb(%rip), %xmm3
00000000000f82f5	xorl	%esi, %esi
00000000000f82f7	callq	*0x60(%rax)
00000000000f82fa	cmpb	$0x1, 0x497(%r14)
00000000000f8302	jne	0xf8513
00000000000f8308	movq	0x2c0(%r14), %rdi
00000000000f830f	testq	%rdi, %rdi
00000000000f8312	jne	0xf853e
00000000000f8318	movl	$0x1a0, %edi                    ## imm = 0x1A0
00000000000f831d	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
00000000000f8322	movq	%rax, %r15
00000000000f8325	movq	%rax, %rdi
00000000000f8328	callq	__ZN31HgcToneParamCurve3AntiSymmetricC1Ev ## HgcToneParamCurve3AntiSymmetric::HgcToneParamCurve3AntiSymmetric()
00000000000f832d	movq	%r15, %rdi
00000000000f8330	movq	%r15, 0x2c0(%r14)
00000000000f8337	jmp	0xf853e
00000000000f833c	movq	0x290(%r14), %r15
00000000000f8343	testq	%r15, %r15
00000000000f8346	jne	0xf8364
00000000000f8348	movl	$0x1a0, %edi                    ## imm = 0x1A0
00000000000f834d	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
00000000000f8352	movq	%rax, %r15
00000000000f8355	movq	%rax, %rdi
00000000000f8358	callq	__ZN18HgcToneParamCurve1C1Ev    ## HgcToneParamCurve1::HgcToneParamCurve1()
00000000000f835d	movq	%r15, 0x290(%r14)
00000000000f8364	movq	0x198(%r14), %rax
00000000000f836b	movss	0x80(%rax), %xmm0
00000000000f8373	movss	0x84(%rax), %xmm1
00000000000f837b	movss	0x88(%rax), %xmm2
00000000000f8383	movq	(%r15), %rax
00000000000f8386	movss	0x2cf932(%rip), %xmm3
00000000000f838e	movq	%r15, %rdi
00000000000f8391	xorl	%esi, %esi
00000000000f8393	callq	*0x60(%rax)
00000000000f8396	cmpb	$0x1, 0x497(%r14)
00000000000f839e	jne	0xf85b2
00000000000f83a4	movq	0x2b0(%r14), %rdi
00000000000f83ab	testq	%rdi, %rdi
00000000000f83ae	jne	0xf85dd
00000000000f83b4	movl	$0x1a0, %edi                    ## imm = 0x1A0
00000000000f83b9	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
00000000000f83be	movq	%rax, %r15
00000000000f83c1	movq	%rax, %rdi
00000000000f83c4	callq	__ZN31HgcToneParamCurve1AntiSymmetricC1Ev ## HgcToneParamCurve1AntiSymmetric::HgcToneParamCurve1AntiSymmetric()
00000000000f83c9	movq	%r15, %rdi
00000000000f83cc	movq	%r15, 0x2b0(%r14)
00000000000f83d3	jmp	0xf85dd
00000000000f83d8	movq	0x2a8(%r14), %r15
00000000000f83df	testq	%r15, %r15
00000000000f83e2	jne	0xf8400
00000000000f83e4	movl	$0x1a0, %edi                    ## imm = 0x1A0
00000000000f83e9	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
00000000000f83ee	movq	%rax, %r15
00000000000f83f1	movq	%rax, %rdi
00000000000f83f4	callq	__ZN18HgcToneParamCurve4C1Ev    ## HgcToneParamCurve4::HgcToneParamCurve4()
00000000000f83f9	movq	%r15, 0x2a8(%r14)
00000000000f8400	movq	0x198(%r14), %rax
00000000000f8407	movss	0x80(%rax), %xmm0
00000000000f840f	movss	0x84(%rax), %xmm1
00000000000f8417	movss	0x88(%rax), %xmm2
00000000000f841f	movq	(%r15), %rax
00000000000f8422	movss	0x2cf896(%rip), %xmm3
00000000000f842a	movq	%r15, %rdi
00000000000f842d	xorl	%esi, %esi
00000000000f842f	callq	*0x60(%rax)
00000000000f8432	cmpb	$0x1, 0x497(%r14)
00000000000f843a	jne	0xf8651
00000000000f8440	movq	0x2c8(%r14), %rdi
00000000000f8447	testq	%rdi, %rdi
00000000000f844a	jne	0xf867c
00000000000f8450	movl	$0x1a0, %edi                    ## imm = 0x1A0
00000000000f8455	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
00000000000f845a	movq	%rax, %r15
00000000000f845d	movq	%rax, %rdi
00000000000f8460	callq	__ZN31HgcToneParamCurve4AntiSymmetricC1Ev ## HgcToneParamCurve4AntiSymmetric::HgcToneParamCurve4AntiSymmetric()
00000000000f8465	movq	%r15, %rdi
00000000000f8468	movq	%r15, 0x2c8(%r14)
00000000000f846f	jmp	0xf867c
00000000000f8474	movq	0x298(%r14), %rdi
00000000000f847b	testq	%rdi, %rdi
00000000000f847e	jne	0xf849f
00000000000f8480	movl	$0x1a0, %edi                    ## imm = 0x1A0
00000000000f8485	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
00000000000f848a	movq	%rax, %r15
00000000000f848d	movq	%rax, %rdi
00000000000f8490	callq	__ZN18HgcToneParamCurve2C1Ev    ## HgcToneParamCurve2::HgcToneParamCurve2()
00000000000f8495	movq	%r15, %rdi
00000000000f8498	movq	%r15, 0x298(%r14)
00000000000f849f	movq	0x198(%r14), %rax
00000000000f84a6	movss	0x90(%rax), %xmm0
00000000000f84ae	movss	0x94(%rax), %xmm1
00000000000f84b6	movss	0x98(%rax), %xmm2
00000000000f84be	movq	(%rdi), %rax
00000000000f84c1	movss	0x2cf7f7(%rip), %xmm3
00000000000f84c9	movl	$0x1, %esi
00000000000f84ce	callq	*0x60(%rax)
00000000000f84d1	cmpb	$0x1, 0x497(%r14)
00000000000f84d9	jne	0xf86f0
00000000000f84df	movq	0x2b8(%r14), %rdi
00000000000f84e6	testq	%rdi, %rdi
00000000000f84e9	jne	0xf871b
00000000000f84ef	movl	$0x1a0, %edi                    ## imm = 0x1A0
00000000000f84f4	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
00000000000f84f9	movq	%rax, %r15
00000000000f84fc	movq	%rax, %rdi
00000000000f84ff	callq	__ZN31HgcToneParamCurve2AntiSymmetricC1Ev ## HgcToneParamCurve2AntiSymmetric::HgcToneParamCurve2AntiSymmetric()
00000000000f8504	movq	%r15, %rdi
00000000000f8507	movq	%r15, 0x2b8(%r14)
00000000000f850e	jmp	0xf871b
00000000000f8513	movq	0x2a0(%r14), %rdi
00000000000f851a	testq	%rdi, %rdi
00000000000f851d	jne	0xf853e
00000000000f851f	movl	$0x1a0, %edi                    ## imm = 0x1A0
00000000000f8524	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
00000000000f8529	movq	%rax, %r15
00000000000f852c	movq	%rax, %rdi
00000000000f852f	callq	__ZN18HgcToneParamCurve3C1Ev    ## HgcToneParamCurve3::HgcToneParamCurve3()
00000000000f8534	movq	%r15, %rdi
00000000000f8537	movq	%r15, 0x2a0(%r14)
00000000000f853e	movq	0x198(%r14), %rax
00000000000f8545	movss	0x90(%rax), %xmm0
00000000000f854d	movss	0x94(%rax), %xmm1
00000000000f8555	movss	0x98(%rax), %xmm2
00000000000f855d	movq	(%rdi), %rax
00000000000f8560	movss	0x2cf758(%rip), %xmm3
00000000000f8568	movl	$0x1, %esi
00000000000f856d	callq	*0x60(%rax)
00000000000f8570	cmpb	$0x1, 0x497(%r14)
00000000000f8578	jne	0xf878f
00000000000f857e	movq	0x2c0(%r14), %rdi
00000000000f8585	testq	%rdi, %rdi
00000000000f8588	jne	0xf87ba
00000000000f858e	movl	$0x1a0, %edi                    ## imm = 0x1A0
00000000000f8593	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
00000000000f8598	movq	%rax, %r15
00000000000f859b	movq	%rax, %rdi
00000000000f859e	callq	__ZN31HgcToneParamCurve3AntiSymmetricC1Ev ## HgcToneParamCurve3AntiSymmetric::HgcToneParamCurve3AntiSymmetric()
00000000000f85a3	movq	%r15, %rdi
00000000000f85a6	movq	%r15, 0x2c0(%r14)
00000000000f85ad	jmp	0xf87ba
00000000000f85b2	movq	0x290(%r14), %rdi
00000000000f85b9	testq	%rdi, %rdi
00000000000f85bc	jne	0xf85dd
00000000000f85be	movl	$0x1a0, %edi                    ## imm = 0x1A0
00000000000f85c3	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
00000000000f85c8	movq	%rax, %r15
00000000000f85cb	movq	%rax, %rdi
00000000000f85ce	callq	__ZN18HgcToneParamCurve1C1Ev    ## HgcToneParamCurve1::HgcToneParamCurve1()
00000000000f85d3	movq	%r15, %rdi
00000000000f85d6	movq	%r15, 0x290(%r14)
00000000000f85dd	movq	0x198(%r14), %rax
00000000000f85e4	movss	0x90(%rax), %xmm0
00000000000f85ec	movss	0x94(%rax), %xmm1
00000000000f85f4	movss	0x98(%rax), %xmm2
00000000000f85fc	movq	(%rdi), %rax
00000000000f85ff	movss	0x2cf6b9(%rip), %xmm3
00000000000f8607	movl	$0x1, %esi
00000000000f860c	callq	*0x60(%rax)
00000000000f860f	cmpb	$0x1, 0x497(%r14)
00000000000f8617	jne	0xf882e
00000000000f861d	movq	0x2b0(%r14), %rdi
00000000000f8624	testq	%rdi, %rdi
00000000000f8627	jne	0xf8859
00000000000f862d	movl	$0x1a0, %edi                    ## imm = 0x1A0
00000000000f8632	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
00000000000f8637	movq	%rax, %r15
00000000000f863a	movq	%rax, %rdi
00000000000f863d	callq	__ZN31HgcToneParamCurve1AntiSymmetricC1Ev ## HgcToneParamCurve1AntiSymmetric::HgcToneParamCurve1AntiSymmetric()
00000000000f8642	movq	%r15, %rdi
00000000000f8645	movq	%r15, 0x2b0(%r14)
00000000000f864c	jmp	0xf8859
00000000000f8651	movq	0x2a8(%r14), %rdi
00000000000f8658	testq	%rdi, %rdi
00000000000f865b	jne	0xf867c
00000000000f865d	movl	$0x1a0, %edi                    ## imm = 0x1A0
00000000000f8662	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
00000000000f8667	movq	%rax, %r15
00000000000f866a	movq	%rax, %rdi
00000000000f866d	callq	__ZN18HgcToneParamCurve4C1Ev    ## HgcToneParamCurve4::HgcToneParamCurve4()
00000000000f8672	movq	%r15, %rdi
00000000000f8675	movq	%r15, 0x2a8(%r14)
00000000000f867c	movq	0x198(%r14), %rax
00000000000f8683	movss	0x90(%rax), %xmm0
00000000000f868b	movss	0x94(%rax), %xmm1
00000000000f8693	movss	0x98(%rax), %xmm2
00000000000f869b	movq	(%rdi), %rax
00000000000f869e	movss	0x2cf61a(%rip), %xmm3
00000000000f86a6	movl	$0x1, %esi
00000000000f86ab	callq	*0x60(%rax)
00000000000f86ae	cmpb	$0x1, 0x497(%r14)
00000000000f86b6	jne	0xf88cd
00000000000f86bc	movq	0x2c8(%r14), %rdi
00000000000f86c3	testq	%rdi, %rdi
00000000000f86c6	jne	0xf88f8
00000000000f86cc	movl	$0x1a0, %edi                    ## imm = 0x1A0
00000000000f86d1	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
00000000000f86d6	movq	%rax, %r15
00000000000f86d9	movq	%rax, %rdi
00000000000f86dc	callq	__ZN31HgcToneParamCurve4AntiSymmetricC1Ev ## HgcToneParamCurve4AntiSymmetric::HgcToneParamCurve4AntiSymmetric()
00000000000f86e1	movq	%r15, %rdi
00000000000f86e4	movq	%r15, 0x2c8(%r14)
00000000000f86eb	jmp	0xf88f8
00000000000f86f0	movq	0x298(%r14), %rdi
00000000000f86f7	testq	%rdi, %rdi
00000000000f86fa	jne	0xf871b
00000000000f86fc	movl	$0x1a0, %edi                    ## imm = 0x1A0
00000000000f8701	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
00000000000f8706	movq	%rax, %r15
00000000000f8709	movq	%rax, %rdi
00000000000f870c	callq	__ZN18HgcToneParamCurve2C1Ev    ## HgcToneParamCurve2::HgcToneParamCurve2()
00000000000f8711	movq	%r15, %rdi
00000000000f8714	movq	%r15, 0x298(%r14)
00000000000f871b	movq	0x198(%r14), %rax
00000000000f8722	movss	0xa0(%rax), %xmm0
00000000000f872a	movss	0xa4(%rax), %xmm1
00000000000f8732	movss	0xa8(%rax), %xmm2
00000000000f873a	movq	(%rdi), %rax
00000000000f873d	movss	0x2cf57b(%rip), %xmm3
00000000000f8745	movl	$0x2, %esi
00000000000f874a	callq	*0x60(%rax)
00000000000f874d	cmpb	$0x1, 0x497(%r14)
00000000000f8755	jne	0xf896c
00000000000f875b	movq	0x2b8(%r14), %rdi
00000000000f8762	testq	%rdi, %rdi
00000000000f8765	jne	0xf8997
00000000000f876b	movl	$0x1a0, %edi                    ## imm = 0x1A0
00000000000f8770	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
00000000000f8775	movq	%rax, %r15
00000000000f8778	movq	%rax, %rdi
00000000000f877b	callq	__ZN31HgcToneParamCurve2AntiSymmetricC1Ev ## HgcToneParamCurve2AntiSymmetric::HgcToneParamCurve2AntiSymmetric()
00000000000f8780	movq	%r15, %rdi
00000000000f8783	movq	%r15, 0x2b8(%r14)
00000000000f878a	jmp	0xf8997
00000000000f878f	movq	0x2a0(%r14), %rdi
00000000000f8796	testq	%rdi, %rdi
00000000000f8799	jne	0xf87ba
00000000000f879b	movl	$0x1a0, %edi                    ## imm = 0x1A0
00000000000f87a0	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
00000000000f87a5	movq	%rax, %r15
00000000000f87a8	movq	%rax, %rdi
00000000000f87ab	callq	__ZN18HgcToneParamCurve3C1Ev    ## HgcToneParamCurve3::HgcToneParamCurve3()
00000000000f87b0	movq	%r15, %rdi
00000000000f87b3	movq	%r15, 0x2a0(%r14)
00000000000f87ba	movq	0x198(%r14), %rax
00000000000f87c1	movss	0xa0(%rax), %xmm0
00000000000f87c9	movss	0xa4(%rax), %xmm1
00000000000f87d1	movss	0xa8(%rax), %xmm2
00000000000f87d9	movq	(%rdi), %rax
00000000000f87dc	movss	0x2cf4dc(%rip), %xmm3
00000000000f87e4	movl	$0x2, %esi
00000000000f87e9	callq	*0x60(%rax)
00000000000f87ec	cmpb	$0x1, 0x497(%r14)
00000000000f87f4	jne	0xf8a0b
00000000000f87fa	movq	0x2c0(%r14), %rdi
00000000000f8801	testq	%rdi, %rdi
00000000000f8804	jne	0xf8a36
00000000000f880a	movl	$0x1a0, %edi                    ## imm = 0x1A0
00000000000f880f	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
00000000000f8814	movq	%rax, %r15
00000000000f8817	movq	%rax, %rdi
00000000000f881a	callq	__ZN31HgcToneParamCurve3AntiSymmetricC1Ev ## HgcToneParamCurve3AntiSymmetric::HgcToneParamCurve3AntiSymmetric()
00000000000f881f	movq	%r15, %rdi
00000000000f8822	movq	%r15, 0x2c0(%r14)
00000000000f8829	jmp	0xf8a36
00000000000f882e	movq	0x290(%r14), %rdi
00000000000f8835	testq	%rdi, %rdi
00000000000f8838	jne	0xf8859
00000000000f883a	movl	$0x1a0, %edi                    ## imm = 0x1A0
00000000000f883f	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
00000000000f8844	movq	%rax, %r15
00000000000f8847	movq	%rax, %rdi
00000000000f884a	callq	__ZN18HgcToneParamCurve1C1Ev    ## HgcToneParamCurve1::HgcToneParamCurve1()
00000000000f884f	movq	%r15, %rdi
00000000000f8852	movq	%r15, 0x290(%r14)
00000000000f8859	movq	0x198(%r14), %rax
00000000000f8860	movss	0xa0(%rax), %xmm0
00000000000f8868	movss	0xa4(%rax), %xmm1
00000000000f8870	movss	0xa8(%rax), %xmm2
00000000000f8878	movq	(%rdi), %rax
00000000000f887b	movss	0x2cf43d(%rip), %xmm3
00000000000f8883	movl	$0x2, %esi
00000000000f8888	callq	*0x60(%rax)
00000000000f888b	cmpb	$0x1, 0x497(%r14)
00000000000f8893	jne	0xf8aaa
00000000000f8899	movq	0x2b0(%r14), %rdi
00000000000f88a0	testq	%rdi, %rdi
00000000000f88a3	jne	0xf8ad5
00000000000f88a9	movl	$0x1a0, %edi                    ## imm = 0x1A0
00000000000f88ae	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
00000000000f88b3	movq	%rax, %r15
00000000000f88b6	movq	%rax, %rdi
00000000000f88b9	callq	__ZN31HgcToneParamCurve1AntiSymmetricC1Ev ## HgcToneParamCurve1AntiSymmetric::HgcToneParamCurve1AntiSymmetric()
00000000000f88be	movq	%r15, %rdi
00000000000f88c1	movq	%r15, 0x2b0(%r14)
00000000000f88c8	jmp	0xf8ad5
00000000000f88cd	movq	0x2a8(%r14), %rdi
00000000000f88d4	testq	%rdi, %rdi
00000000000f88d7	jne	0xf88f8
00000000000f88d9	movl	$0x1a0, %edi                    ## imm = 0x1A0
00000000000f88de	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
00000000000f88e3	movq	%rax, %r15
00000000000f88e6	movq	%rax, %rdi
00000000000f88e9	callq	__ZN18HgcToneParamCurve4C1Ev    ## HgcToneParamCurve4::HgcToneParamCurve4()
00000000000f88ee	movq	%r15, %rdi
00000000000f88f1	movq	%r15, 0x2a8(%r14)
00000000000f88f8	movq	0x198(%r14), %rax
00000000000f88ff	movss	0xa0(%rax), %xmm0
00000000000f8907	movss	0xa4(%rax), %xmm1
00000000000f890f	movss	0xa8(%rax), %xmm2
00000000000f8917	movq	(%rdi), %rax
00000000000f891a	movss	0x2cf39e(%rip), %xmm3
00000000000f8922	movl	$0x2, %esi
00000000000f8927	callq	*0x60(%rax)
00000000000f892a	cmpb	$0x1, 0x497(%r14)
00000000000f8932	jne	0xf8b64
00000000000f8938	movq	0x2c8(%r14), %rdi
00000000000f893f	testq	%rdi, %rdi
00000000000f8942	jne	0xf8b8f
00000000000f8948	movl	$0x1a0, %edi                    ## imm = 0x1A0
00000000000f894d	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
00000000000f8952	movq	%rax, %r15
00000000000f8955	movq	%rax, %rdi
00000000000f8958	callq	__ZN31HgcToneParamCurve4AntiSymmetricC1Ev ## HgcToneParamCurve4AntiSymmetric::HgcToneParamCurve4AntiSymmetric()
00000000000f895d	movq	%r15, %rdi
00000000000f8960	movq	%r15, 0x2c8(%r14)
00000000000f8967	jmp	0xf8b8f
00000000000f896c	movq	0x298(%r14), %rdi
00000000000f8973	testq	%rdi, %rdi
00000000000f8976	jne	0xf8997
00000000000f8978	movl	$0x1a0, %edi                    ## imm = 0x1A0
00000000000f897d	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
00000000000f8982	movq	%rax, %r15
00000000000f8985	movq	%rax, %rdi
00000000000f8988	callq	__ZN18HgcToneParamCurve2C1Ev    ## HgcToneParamCurve2::HgcToneParamCurve2()
00000000000f898d	movq	%r15, %rdi
00000000000f8990	movq	%r15, 0x298(%r14)
00000000000f8997	movq	0x198(%r14), %rax
00000000000f899e	movss	0xb0(%rax), %xmm0
00000000000f89a6	movss	0xb4(%rax), %xmm1
00000000000f89ae	movss	0xb8(%rax), %xmm2
00000000000f89b6	movq	(%rdi), %rax
00000000000f89b9	movss	0x2cf2ff(%rip), %xmm3
00000000000f89c1	movl	$0x3, %esi
00000000000f89c6	callq	*0x60(%rax)
00000000000f89c9	cmpb	$0x1, 0x497(%r14)
00000000000f89d1	jne	0xf8c03
00000000000f89d7	movq	0x2b8(%r14), %rdi
00000000000f89de	testq	%rdi, %rdi
00000000000f89e1	jne	0xf8c2e
00000000000f89e7	movl	$0x1a0, %edi                    ## imm = 0x1A0
00000000000f89ec	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
00000000000f89f1	movq	%rax, %r15
00000000000f89f4	movq	%rax, %rdi
00000000000f89f7	callq	__ZN31HgcToneParamCurve2AntiSymmetricC1Ev ## HgcToneParamCurve2AntiSymmetric::HgcToneParamCurve2AntiSymmetric()
00000000000f89fc	movq	%r15, %rdi
00000000000f89ff	movq	%r15, 0x2b8(%r14)
00000000000f8a06	jmp	0xf8c2e
00000000000f8a0b	movq	0x2a0(%r14), %rdi
00000000000f8a12	testq	%rdi, %rdi
00000000000f8a15	jne	0xf8a36
00000000000f8a17	movl	$0x1a0, %edi                    ## imm = 0x1A0
00000000000f8a1c	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
00000000000f8a21	movq	%rax, %r15
00000000000f8a24	movq	%rax, %rdi
00000000000f8a27	callq	__ZN18HgcToneParamCurve3C1Ev    ## HgcToneParamCurve3::HgcToneParamCurve3()
00000000000f8a2c	movq	%r15, %rdi
00000000000f8a2f	movq	%r15, 0x2a0(%r14)
00000000000f8a36	movq	0x198(%r14), %rax
00000000000f8a3d	movss	0xb0(%rax), %xmm0
00000000000f8a45	movss	0xb4(%rax), %xmm1
00000000000f8a4d	movss	0xb8(%rax), %xmm2
00000000000f8a55	movq	(%rdi), %rax
00000000000f8a58	movss	0x2cf260(%rip), %xmm3
00000000000f8a60	movl	$0x3, %esi
00000000000f8a65	callq	*0x60(%rax)
00000000000f8a68	cmpb	$0x1, 0x497(%r14)
00000000000f8a70	jne	0xf8caa
00000000000f8a76	movq	0x2c0(%r14), %rdi
00000000000f8a7d	testq	%rdi, %rdi
00000000000f8a80	jne	0xf8cd5
00000000000f8a86	movl	$0x1a0, %edi                    ## imm = 0x1A0
00000000000f8a8b	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
00000000000f8a90	movq	%rax, %r15
00000000000f8a93	movq	%rax, %rdi
00000000000f8a96	callq	__ZN31HgcToneParamCurve3AntiSymmetricC1Ev ## HgcToneParamCurve3AntiSymmetric::HgcToneParamCurve3AntiSymmetric()
00000000000f8a9b	movq	%r15, %rdi
00000000000f8a9e	movq	%r15, 0x2c0(%r14)
00000000000f8aa5	jmp	0xf8cd5
00000000000f8aaa	movq	0x290(%r14), %rdi
00000000000f8ab1	testq	%rdi, %rdi
00000000000f8ab4	jne	0xf8ad5
00000000000f8ab6	movl	$0x1a0, %edi                    ## imm = 0x1A0
00000000000f8abb	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
00000000000f8ac0	movq	%rax, %r15
00000000000f8ac3	movq	%rax, %rdi
00000000000f8ac6	callq	__ZN18HgcToneParamCurve1C1Ev    ## HgcToneParamCurve1::HgcToneParamCurve1()
00000000000f8acb	movq	%r15, %rdi
00000000000f8ace	movq	%r15, 0x290(%r14)
00000000000f8ad5	movq	0x198(%r14), %rax
00000000000f8adc	movss	0xa0(%rax), %xmm0
00000000000f8ae4	cvtss2sd	%xmm0, %xmm0
00000000000f8ae8	movaps	0x2d1ff1(%rip), %xmm2
00000000000f8aef	xorps	%xmm2, %xmm0
00000000000f8af2	movss	0x90(%rax), %xmm1
00000000000f8afa	movss	0x94(%rax), %xmm3
00000000000f8b02	cvtss2sd	%xmm1, %xmm1
00000000000f8b06	divsd	%xmm1, %xmm0
00000000000f8b0a	cvtsd2ss	%xmm0, %xmm0
00000000000f8b0e	movss	0xa4(%rax), %xmm1
00000000000f8b16	cvtss2sd	%xmm1, %xmm1
00000000000f8b1a	cvtss2sd	%xmm3, %xmm3
00000000000f8b1e	xorps	%xmm2, %xmm1
00000000000f8b21	divsd	%xmm3, %xmm1
00000000000f8b25	cvtsd2ss	%xmm1, %xmm1
00000000000f8b29	movss	0xa8(%rax), %xmm3
00000000000f8b31	cvtss2sd	%xmm3, %xmm3
00000000000f8b35	xorps	%xmm2, %xmm3
00000000000f8b38	movss	0x98(%rax), %xmm2
00000000000f8b40	cvtss2sd	%xmm2, %xmm2
00000000000f8b44	divsd	%xmm2, %xmm3
00000000000f8b48	xorps	%xmm2, %xmm2
00000000000f8b4b	cvtsd2ss	%xmm3, %xmm2
00000000000f8b4f	movq	(%rdi), %rax
00000000000f8b52	movss	0x2cf166(%rip), %xmm3
00000000000f8b5a	movl	$0x3, %esi
00000000000f8b5f	jmp	0xf8e8b
00000000000f8b64	movq	0x2a8(%r14), %rdi
00000000000f8b6b	testq	%rdi, %rdi
00000000000f8b6e	jne	0xf8b8f
00000000000f8b70	movl	$0x1a0, %edi                    ## imm = 0x1A0
00000000000f8b75	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
00000000000f8b7a	movq	%rax, %r15
00000000000f8b7d	movq	%rax, %rdi
00000000000f8b80	callq	__ZN18HgcToneParamCurve4C1Ev    ## HgcToneParamCurve4::HgcToneParamCurve4()
00000000000f8b85	movq	%r15, %rdi
00000000000f8b88	movq	%r15, 0x2a8(%r14)
00000000000f8b8f	movq	0x198(%r14), %rax
00000000000f8b96	movss	0xb0(%rax), %xmm0
00000000000f8b9e	movss	0xb4(%rax), %xmm1
00000000000f8ba6	movss	0xb8(%rax), %xmm2
00000000000f8bae	movq	(%rdi), %rax
00000000000f8bb1	movss	0x2cf107(%rip), %xmm3
00000000000f8bb9	movl	$0x3, %esi
00000000000f8bbe	callq	*0x60(%rax)
00000000000f8bc1	cmpb	$0x1, 0x497(%r14)
00000000000f8bc9	jne	0xf8d09
00000000000f8bcf	movq	0x2c8(%r14), %rdi
00000000000f8bd6	testq	%rdi, %rdi
00000000000f8bd9	jne	0xf8d34
00000000000f8bdf	movl	$0x1a0, %edi                    ## imm = 0x1A0
00000000000f8be4	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
00000000000f8be9	movq	%rax, %r15
00000000000f8bec	movq	%rax, %rdi
00000000000f8bef	callq	__ZN31HgcToneParamCurve4AntiSymmetricC1Ev ## HgcToneParamCurve4AntiSymmetric::HgcToneParamCurve4AntiSymmetric()
00000000000f8bf4	movq	%r15, %rdi
00000000000f8bf7	movq	%r15, 0x2c8(%r14)
00000000000f8bfe	jmp	0xf8d34
00000000000f8c03	movq	0x298(%r14), %rdi
00000000000f8c0a	testq	%rdi, %rdi
00000000000f8c0d	jne	0xf8c2e
00000000000f8c0f	movl	$0x1a0, %edi                    ## imm = 0x1A0
00000000000f8c14	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
00000000000f8c19	movq	%rax, %r15
00000000000f8c1c	movq	%rax, %rdi
00000000000f8c1f	callq	__ZN18HgcToneParamCurve2C1Ev    ## HgcToneParamCurve2::HgcToneParamCurve2()
00000000000f8c24	movq	%r15, %rdi
00000000000f8c27	movq	%r15, 0x298(%r14)
00000000000f8c2e	movq	0x198(%r14), %rax
00000000000f8c35	movss	0xa0(%rax), %xmm0
00000000000f8c3d	cvtss2sd	%xmm0, %xmm0
00000000000f8c41	movaps	0x2d1e98(%rip), %xmm2
00000000000f8c48	xorps	%xmm2, %xmm0
00000000000f8c4b	movss	0x90(%rax), %xmm1
00000000000f8c53	movss	0x94(%rax), %xmm3
00000000000f8c5b	cvtss2sd	%xmm1, %xmm1
00000000000f8c5f	divsd	%xmm1, %xmm0
00000000000f8c63	cvtsd2ss	%xmm0, %xmm0
00000000000f8c67	movss	0xa4(%rax), %xmm1
00000000000f8c6f	cvtss2sd	%xmm1, %xmm1
00000000000f8c73	cvtss2sd	%xmm3, %xmm3
00000000000f8c77	xorps	%xmm2, %xmm1
00000000000f8c7a	divsd	%xmm3, %xmm1
00000000000f8c7e	cvtsd2ss	%xmm1, %xmm1
00000000000f8c82	movss	0xa8(%rax), %xmm3
00000000000f8c8a	cvtss2sd	%xmm3, %xmm3
00000000000f8c8e	xorps	%xmm2, %xmm3
00000000000f8c91	movss	0x98(%rax), %xmm2
00000000000f8c99	cvtss2sd	%xmm2, %xmm2
00000000000f8c9d	divsd	%xmm2, %xmm3
00000000000f8ca1	xorps	%xmm2, %xmm2
00000000000f8ca4	cvtsd2ss	%xmm3, %xmm2
00000000000f8ca8	jmp	0xf8cf4
00000000000f8caa	movq	0x2a0(%r14), %rdi
00000000000f8cb1	testq	%rdi, %rdi
00000000000f8cb4	jne	0xf8cd5
00000000000f8cb6	movl	$0x1a0, %edi                    ## imm = 0x1A0
00000000000f8cbb	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
00000000000f8cc0	movq	%rax, %r15
00000000000f8cc3	movq	%rax, %rdi
00000000000f8cc6	callq	__ZN18HgcToneParamCurve3C1Ev    ## HgcToneParamCurve3::HgcToneParamCurve3()
00000000000f8ccb	movq	%r15, %rdi
00000000000f8cce	movq	%r15, 0x2a0(%r14)
00000000000f8cd5	movq	0x198(%r14), %rax
00000000000f8cdc	movss	0xc0(%rax), %xmm0
00000000000f8ce4	movss	0xc4(%rax), %xmm1
00000000000f8cec	movss	0xc8(%rax), %xmm2
00000000000f8cf4	movq	(%rdi), %rax
00000000000f8cf7	movss	0x2cefc1(%rip), %xmm3
00000000000f8cff	movl	$0x4, %esi
00000000000f8d04	jmp	0xf8e8b
00000000000f8d09	movq	0x2a8(%r14), %rdi
00000000000f8d10	testq	%rdi, %rdi
00000000000f8d13	jne	0xf8d34
00000000000f8d15	movl	$0x1a0, %edi                    ## imm = 0x1A0
00000000000f8d1a	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
00000000000f8d1f	movq	%rax, %r15
00000000000f8d22	movq	%rax, %rdi
00000000000f8d25	callq	__ZN18HgcToneParamCurve4C1Ev    ## HgcToneParamCurve4::HgcToneParamCurve4()
00000000000f8d2a	movq	%r15, %rdi
00000000000f8d2d	movq	%r15, 0x2a8(%r14)
00000000000f8d34	movq	0x198(%r14), %rax
00000000000f8d3b	movss	0xc0(%rax), %xmm0
00000000000f8d43	movss	0xc4(%rax), %xmm1
00000000000f8d4b	movss	0xc8(%rax), %xmm2
00000000000f8d53	movq	(%rdi), %rax
00000000000f8d56	movss	0x2cef62(%rip), %xmm3
00000000000f8d5e	movl	$0x4, %esi
00000000000f8d63	callq	*0x60(%rax)
00000000000f8d66	cmpb	$0x1, 0x497(%r14)
00000000000f8d6e	jne	0xf8d9d
00000000000f8d70	movq	0x2c8(%r14), %rdi
00000000000f8d77	testq	%rdi, %rdi
00000000000f8d7a	jne	0xf8dc8
00000000000f8d7c	movl	$0x1a0, %edi                    ## imm = 0x1A0
00000000000f8d81	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
00000000000f8d86	movq	%rax, %r15
00000000000f8d89	movq	%rax, %rdi
00000000000f8d8c	callq	__ZN31HgcToneParamCurve4AntiSymmetricC1Ev ## HgcToneParamCurve4AntiSymmetric::HgcToneParamCurve4AntiSymmetric()
00000000000f8d91	movq	%r15, %rdi
00000000000f8d94	movq	%r15, 0x2c8(%r14)
00000000000f8d9b	jmp	0xf8dc8
00000000000f8d9d	movq	0x2a8(%r14), %rdi
00000000000f8da4	testq	%rdi, %rdi
00000000000f8da7	jne	0xf8dc8
00000000000f8da9	movl	$0x1a0, %edi                    ## imm = 0x1A0
00000000000f8dae	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
00000000000f8db3	movq	%rax, %r15
00000000000f8db6	movq	%rax, %rdi
00000000000f8db9	callq	__ZN18HgcToneParamCurve4C1Ev    ## HgcToneParamCurve4::HgcToneParamCurve4()
00000000000f8dbe	movq	%r15, %rdi
00000000000f8dc1	movq	%r15, 0x2a8(%r14)
00000000000f8dc8	movq	0x198(%r14), %rax
00000000000f8dcf	movss	0xd0(%rax), %xmm0
00000000000f8dd7	movss	0xd4(%rax), %xmm1
00000000000f8ddf	movss	0xd8(%rax), %xmm2
00000000000f8de7	movq	(%rdi), %rax
00000000000f8dea	movss	0x2ceece(%rip), %xmm3
00000000000f8df2	movl	$0x5, %esi
00000000000f8df7	callq	*0x60(%rax)
00000000000f8dfa	cmpb	$0x1, 0x497(%r14)
00000000000f8e02	jne	0xf8e31
00000000000f8e04	movq	0x2c8(%r14), %rdi
00000000000f8e0b	testq	%rdi, %rdi
00000000000f8e0e	jne	0xf8e5c
00000000000f8e10	movl	$0x1a0, %edi                    ## imm = 0x1A0
00000000000f8e15	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
00000000000f8e1a	movq	%rax, %r15
00000000000f8e1d	movq	%rax, %rdi
00000000000f8e20	callq	__ZN31HgcToneParamCurve4AntiSymmetricC1Ev ## HgcToneParamCurve4AntiSymmetric::HgcToneParamCurve4AntiSymmetric()
00000000000f8e25	movq	%r15, %rdi
00000000000f8e28	movq	%r15, 0x2c8(%r14)
00000000000f8e2f	jmp	0xf8e5c
00000000000f8e31	movq	0x2a8(%r14), %rdi
00000000000f8e38	testq	%rdi, %rdi
00000000000f8e3b	jne	0xf8e5c
00000000000f8e3d	movl	$0x1a0, %edi                    ## imm = 0x1A0
00000000000f8e42	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
00000000000f8e47	movq	%rax, %r15
00000000000f8e4a	movq	%rax, %rdi
00000000000f8e4d	callq	__ZN18HgcToneParamCurve4C1Ev    ## HgcToneParamCurve4::HgcToneParamCurve4()
00000000000f8e52	movq	%r15, %rdi
00000000000f8e55	movq	%r15, 0x2a8(%r14)
00000000000f8e5c	movq	0x198(%r14), %rax
00000000000f8e63	movss	0xe0(%rax), %xmm0
00000000000f8e6b	movss	0xe4(%rax), %xmm1
00000000000f8e73	movss	0xe8(%rax), %xmm2
00000000000f8e7b	movq	(%rdi), %rax
00000000000f8e7e	movss	0x2cee3a(%rip), %xmm3
00000000000f8e86	movl	$0x6, %esi
00000000000f8e8b	callq	*0x60(%rax)
00000000000f8e8e	movl	%ebx, %eax
00000000000f8e90	addq	$0x18, %rsp
00000000000f8e94	popq	%rbx
00000000000f8e95	popq	%r12
00000000000f8e97	popq	%r13
00000000000f8e99	popq	%r14
00000000000f8e9b	popq	%r15
00000000000f8e9d	popq	%rbp
00000000000f8e9e	retq
00000000000f8e9f	leal	-0x1d(%r12), %ecx
00000000000f8ea4	cmpl	$0x4, %ecx
00000000000f8ea7	ja	0xf7aea
00000000000f8ead	leaq	0x560(%rip), %rdx
00000000000f8eb4	movslq	(%rdx,%rcx,4), %rcx
00000000000f8eb8	addq	%rdx, %rcx
00000000000f8ebb	jmpq	*%rcx
00000000000f8ebd	movaps	0x430(%r14), %xmm5
00000000000f8ec5	mulps	%xmm5, %xmm4
00000000000f8ec8	mulps	%xmm5, %xmm3
00000000000f8ecb	jmp	0xf7a95
00000000000f8ed0	movaps	0x430(%r14), %xmm5
00000000000f8ed8	movaps	0x2d4071(%rip), %xmm6
00000000000f8edf	jmp	0xf7944
00000000000f8ee4	movaps	0x430(%r14), %xmm5
00000000000f8eec	movaps	0x2d405d(%rip), %xmm6
00000000000f8ef3	jmp	0xf7a86
00000000000f8ef8	movl	$0x28, %edi
00000000000f8efd	callq	0x3c4fb2                        ## symbol stub for: __Znwm
00000000000f8f02	movq	%rax, %r12
00000000000f8f05	movl	0x480(%r14), %esi
00000000000f8f0c	movss	0x484(%r14), %xmm0
00000000000f8f15	movss	0x488(%r14), %xmm1
00000000000f8f1e	movq	%rax, %rdi
00000000000f8f21	movl	$0x1, %edx
00000000000f8f26	callq	__ZN29HGDJIDLogLinearizationLUTInfoC1EmffN16HGApplyNDLUTInfo16LUTStorageFormatE ## HGDJIDLogLinearizationLUTInfo::HGDJIDLogLinearizationLUTInfo(unsigned long, float, float, HGApplyNDLUTInfo::LUTStorageFormat)
00000000000f8f2b	jmp	0xf7e82
00000000000f8f30	movl	$0x28, %edi
00000000000f8f35	callq	0x3c4fb2                        ## symbol stub for: __Znwm
00000000000f8f3a	movq	%rax, %r12
00000000000f8f3d	movl	0x480(%r14), %esi
00000000000f8f44	movss	0x484(%r14), %xmm0
00000000000f8f4d	movss	0x488(%r14), %xmm1
00000000000f8f56	movq	%rax, %rdi
00000000000f8f59	movl	$0x1, %edx
00000000000f8f5e	callq	__ZN33HGBMDFilmGen5LinearizationLUTInfoC2EmffN16HGApplyNDLUTInfo16LUTStorageFormatE ## HGBMDFilmGen5LinearizationLUTInfo::HGBMDFilmGen5LinearizationLUTInfo(unsigned long, float, float, HGApplyNDLUTInfo::LUTStorageFormat)
00000000000f8f63	jmp	0xf7e82
00000000000f8f68	movl	$0x28, %edi
00000000000f8f6d	callq	0x3c4fb2                        ## symbol stub for: __Znwm
00000000000f8f72	movq	%rax, %r12
00000000000f8f75	movl	0x480(%r14), %esi
00000000000f8f7c	movss	0x484(%r14), %xmm0
00000000000f8f85	movss	0x488(%r14), %xmm1
00000000000f8f8e	movq	%rax, %rdi
00000000000f8f91	movl	$0x1, %edx
00000000000f8f96	callq	__ZN31HGNikonNLogLinearizationLUTInfoC2EmffN16HGApplyNDLUTInfo16LUTStorageFormatE ## HGNikonNLogLinearizationLUTInfo::HGNikonNLogLinearizationLUTInfo(unsigned long, float, float, HGApplyNDLUTInfo::LUTStorageFormat)
00000000000f8f9b	jmp	0xf7e82
00000000000f8fa0	movl	$0x28, %edi
00000000000f8fa5	callq	0x3c4fb2                        ## symbol stub for: __Znwm
00000000000f8faa	movq	%rax, %r12
00000000000f8fad	movl	0x480(%r14), %esi
00000000000f8fb4	movss	0x484(%r14), %xmm0
00000000000f8fbd	movss	0x488(%r14), %xmm1
00000000000f8fc6	movq	%rax, %rdi
00000000000f8fc9	movl	$0x1, %edx
00000000000f8fce	callq	__ZN26HGCanonLogToneCurveLUTInfoC2EmffN16HGApplyNDLUTInfo16LUTStorageFormatE ## HGCanonLogToneCurveLUTInfo::HGCanonLogToneCurveLUTInfo(unsigned long, float, float, HGApplyNDLUTInfo::LUTStorageFormat)
00000000000f8fd3	jmp	0xf7e82
00000000000f8fd8	movl	$0x28, %edi
00000000000f8fdd	callq	0x3c4fb2                        ## symbol stub for: __Znwm
00000000000f8fe2	movq	%rax, %r12
00000000000f8fe5	movl	0x480(%r14), %esi
00000000000f8fec	movss	0x484(%r14), %xmm0
00000000000f8ff5	movss	0x488(%r14), %xmm1
00000000000f8ffe	movq	%rax, %rdi
00000000000f9001	xorl	%edx, %edx
00000000000f9003	movl	$0x1, %ecx
00000000000f9008	callq	__ZN29HGBMDFilmLinearizationLUTInfoC1EmffbN16HGApplyNDLUTInfo16LUTStorageFormatE ## HGBMDFilmLinearizationLUTInfo::HGBMDFilmLinearizationLUTInfo(unsigned long, float, float, bool, HGApplyNDLUTInfo::LUTStorageFormat)
00000000000f900d	jmp	0xf7e82
00000000000f9012	movl	$0x28, %edi
00000000000f9017	callq	0x3c4fb2                        ## symbol stub for: __Znwm
00000000000f901c	movq	%rax, %r12
00000000000f901f	movl	0x480(%r14), %esi
00000000000f9026	movss	0x484(%r14), %xmm0
00000000000f902f	movss	0x488(%r14), %xmm1
00000000000f9038	movq	%rax, %rdi
00000000000f903b	movl	$0x1, %edx
00000000000f9040	callq	__ZN31HGSonySLog3LinearizationLUTInfoC2EmffN16HGApplyNDLUTInfo16LUTStorageFormatE ## HGSonySLog3LinearizationLUTInfo::HGSonySLog3LinearizationLUTInfo(unsigned long, float, float, HGApplyNDLUTInfo::LUTStorageFormat)
00000000000f9045	jmp	0xf7e82
00000000000f904a	movl	$0x38, %edi
00000000000f904f	callq	0x3c4fb2                        ## symbol stub for: __Znwm
00000000000f9054	movq	%rax, %r12
00000000000f9057	movl	0x480(%r14), %esi
00000000000f905e	movss	0x484(%r14), %xmm0
00000000000f9067	movss	0x488(%r14), %xmm1
00000000000f9070	movl	0x48c(%r14), %edx
00000000000f9077	movq	%rax, %rdi
00000000000f907a	movl	$0x1, %ecx
00000000000f907f	callq	__ZN30HGArriLogCLinearizationLUTInfoC1EmffjN16HGApplyNDLUTInfo16LUTStorageFormatE ## HGArriLogCLinearizationLUTInfo::HGArriLogCLinearizationLUTInfo(unsigned long, float, float, unsigned int, HGApplyNDLUTInfo::LUTStorageFormat)
00000000000f9084	jmp	0xf7e82
00000000000f9089	movl	$0x28, %edi
00000000000f908e	callq	0x3c4fb2                        ## symbol stub for: __Znwm
00000000000f9093	movq	%rax, %r12
00000000000f9096	movl	0x480(%r14), %esi
00000000000f909d	movss	0x484(%r14), %xmm0
00000000000f90a6	movss	0x488(%r14), %xmm1
00000000000f90af	movq	%rax, %rdi
00000000000f90b2	movl	$0x1, %edx
00000000000f90b7	callq	__ZN30HGAppleLogLinearizationLUTInfoC2EmffN16HGApplyNDLUTInfo16LUTStorageFormatE ## HGAppleLogLinearizationLUTInfo::HGAppleLogLinearizationLUTInfo(unsigned long, float, float, HGApplyNDLUTInfo::LUTStorageFormat)
00000000000f90bc	jmp	0xf7e82
00000000000f90c1	movl	$0x28, %edi
00000000000f90c6	callq	0x3c4fb2                        ## symbol stub for: __Znwm
00000000000f90cb	movq	%rax, %r12
00000000000f90ce	movl	0x480(%r14), %esi
00000000000f90d5	movss	0x484(%r14), %xmm0
00000000000f90de	movss	0x488(%r14), %xmm1
00000000000f90e7	movq	%rax, %rdi
00000000000f90ea	movl	$0x1, %edx
00000000000f90ef	callq	__ZN31HGArriLogC4LinearizationLUTInfoC1EmffN16HGApplyNDLUTInfo16LUTStorageFormatE ## HGArriLogC4LinearizationLUTInfo::HGArriLogC4LinearizationLUTInfo(unsigned long, float, float, HGApplyNDLUTInfo::LUTStorageFormat)
00000000000f90f4	jmp	0xf7e82
00000000000f90f9	movl	$0x28, %edi
00000000000f90fe	callq	0x3c4fb2                        ## symbol stub for: __Znwm
00000000000f9103	movq	%rax, %r12
00000000000f9106	movl	0x480(%r14), %esi
00000000000f910d	movss	0x484(%r14), %xmm0
00000000000f9116	movss	0x488(%r14), %xmm1
00000000000f911f	movq	%rax, %rdi
00000000000f9122	movl	$0x1, %edx
00000000000f9127	callq	__ZN31HGCanonLog3LinearizationLUTInfoC2EmffN16HGApplyNDLUTInfo16LUTStorageFormatE ## HGCanonLog3LinearizationLUTInfo::HGCanonLog3LinearizationLUTInfo(unsigned long, float, float, HGApplyNDLUTInfo::LUTStorageFormat)
00000000000f912c	jmp	0xf7e82
00000000000f9131	movl	$0x80, %edi
00000000000f9136	callq	0x3c4fb2                        ## symbol stub for: __Znwm
00000000000f913b	movq	%rax, %r12
00000000000f913e	movl	0x480(%r14), %esi
00000000000f9145	movss	0x484(%r14), %xmm0
00000000000f914e	movss	0x488(%r14), %xmm1
00000000000f9157	movq	%rax, %rdi
00000000000f915a	movl	$0x1, %edx
00000000000f915f	movl	$0x1, %ecx
00000000000f9164	callq	__ZN33HGArriLogCDefaultToneCurveLUTInfoC1EmffbN16HGApplyNDLUTInfo16LUTStorageFormatE ## HGArriLogCDefaultToneCurveLUTInfo::HGArriLogCDefaultToneCurveLUTInfo(unsigned long, float, float, bool, HGApplyNDLUTInfo::LUTStorageFormat)
00000000000f9169	jmp	0xf7e82
00000000000f916e	movl	$0x28, %edi
00000000000f9173	callq	0x3c4fb2                        ## symbol stub for: __Znwm
00000000000f9178	movq	%rax, %r12
00000000000f917b	movl	0x480(%r14), %esi
00000000000f9182	movss	0x484(%r14), %xmm0
00000000000f918b	movss	0x488(%r14), %xmm1
00000000000f9194	movq	%rax, %rdi
00000000000f9197	movl	$0x1, %edx
00000000000f919c	callq	__ZN34HGFujifilmFLogLinearizationLUTInfoC1EmffN16HGApplyNDLUTInfo16LUTStorageFormatE ## HGFujifilmFLogLinearizationLUTInfo::HGFujifilmFLogLinearizationLUTInfo(unsigned long, float, float, HGApplyNDLUTInfo::LUTStorageFormat)
00000000000f91a1	jmp	0xf7e82
00000000000f91a6	movl	$0x28, %edi
00000000000f91ab	callq	0x3c4fb2                        ## symbol stub for: __Znwm
00000000000f91b0	movq	%rax, %r12
00000000000f91b3	movl	0x480(%r14), %esi
00000000000f91ba	movss	0x484(%r14), %xmm0
00000000000f91c3	movss	0x488(%r14), %xmm1
00000000000f91cc	movq	%rax, %rdi
00000000000f91cf	movl	$0x1, %edx
00000000000f91d4	callq	__ZN30HGCanonLogLinearizationLUTInfoC1EmffN16HGApplyNDLUTInfo16LUTStorageFormatE ## HGCanonLogLinearizationLUTInfo::HGCanonLogLinearizationLUTInfo(unsigned long, float, float, HGApplyNDLUTInfo::LUTStorageFormat)
00000000000f91d9	jmp	0xf7e82
00000000000f91de	movl	$0x28, %edi
00000000000f91e3	callq	0x3c4fb2                        ## symbol stub for: __Znwm
00000000000f91e8	movq	%rax, %r12
00000000000f91eb	movl	0x480(%r14), %esi
00000000000f91f2	movss	0x484(%r14), %xmm0
00000000000f91fb	movss	0x488(%r14), %xmm1
00000000000f9204	movq	%rax, %rdi
00000000000f9207	movl	$0x1, %edx
00000000000f920c	movl	$0x1, %ecx
00000000000f9211	callq	__ZN29HGBMDFilmLinearizationLUTInfoC1EmffbN16HGApplyNDLUTInfo16LUTStorageFormatE ## HGBMDFilmLinearizationLUTInfo::HGBMDFilmLinearizationLUTInfo(unsigned long, float, float, bool, HGApplyNDLUTInfo::LUTStorageFormat)
00000000000f9216	jmp	0xf7e82
00000000000f921b	movl	$0x28, %edi
00000000000f9220	callq	0x3c4fb2                        ## symbol stub for: __Znwm
00000000000f9225	movq	%rax, %r12
00000000000f9228	movl	0x480(%r14), %esi
00000000000f922f	movss	0x484(%r14), %xmm0
00000000000f9238	movss	0x488(%r14), %xmm1
00000000000f9241	movq	%rax, %rdi
00000000000f9244	movl	$0x1, %edx
00000000000f9249	callq	__ZN31HGCanonLog2LinearizationLUTInfoC1EmffN16HGApplyNDLUTInfo16LUTStorageFormatE ## HGCanonLog2LinearizationLUTInfo::HGCanonLog2LinearizationLUTInfo(unsigned long, float, float, HGApplyNDLUTInfo::LUTStorageFormat)
00000000000f924e	jmp	0xf7e82
00000000000f9253	movl	$0x28, %edi
00000000000f9258	callq	0x3c4fb2                        ## symbol stub for: __Znwm
00000000000f925d	movq	%rax, %r12
00000000000f9260	movl	0x480(%r14), %esi
00000000000f9267	movss	0x484(%r14), %xmm0
00000000000f9270	movss	0x488(%r14), %xmm1
00000000000f9279	movq	%rax, %rdi
00000000000f927c	movl	$0x1, %edx
00000000000f9281	callq	__ZN35HGFujifilmFLog2LinearizationLUTInfoC2EmffN16HGApplyNDLUTInfo16LUTStorageFormatE ## HGFujifilmFLog2LinearizationLUTInfo::HGFujifilmFLog2LinearizationLUTInfo(unsigned long, float, float, HGApplyNDLUTInfo::LUTStorageFormat)
00000000000f9286	jmp	0xf7e82
00000000000f928b	movl	$0x28, %edi
00000000000f9290	callq	0x3c4fb2                        ## symbol stub for: __Znwm
00000000000f9295	movq	%rax, %r12
00000000000f9298	movl	0x480(%r14), %esi
00000000000f929f	movss	0x484(%r14), %xmm0
00000000000f92a8	movss	0x488(%r14), %xmm1
00000000000f92b1	movq	%rax, %rdi
00000000000f92b4	movl	$0x1, %edx
00000000000f92b9	callq	__ZN35HGPanasonicVLogLinearizationLUTInfoC2EmffN16HGApplyNDLUTInfo16LUTStorageFormatE ## HGPanasonicVLogLinearizationLUTInfo::HGPanasonicVLogLinearizationLUTInfo(unsigned long, float, float, HGApplyNDLUTInfo::LUTStorageFormat)
00000000000f92be	jmp	0xf7e82
00000000000f92c3	movl	$0x28, %edi
00000000000f92c8	callq	0x3c4fb2                        ## symbol stub for: __Znwm
00000000000f92cd	movq	%rax, %r12
00000000000f92d0	movl	0x480(%r14), %esi
00000000000f92d7	movss	0x484(%r14), %xmm0
00000000000f92e0	movss	0x488(%r14), %xmm1
00000000000f92e9	movq	%rax, %rdi
00000000000f92ec	movl	$0x1, %edx
00000000000f92f1	callq	__ZN31HGSonySLog2LinearizationLUTInfoC2EmffN16HGApplyNDLUTInfo16LUTStorageFormatE ## HGSonySLog2LinearizationLUTInfo::HGSonySLog2LinearizationLUTInfo(unsigned long, float, float, HGApplyNDLUTInfo::LUTStorageFormat)
00000000000f92f6	jmp	0xf7e82
00000000000f92fb	callq	__ZN12HGColorGamma11ScaleParamsEP6HGNodeP10HGRenderer.cold.1 ## HGColorGamma::ScaleParams(HGNode*, HGRenderer*) (.cold.1)
00000000000f9300	movl	0x404(%r14), %eax
00000000000f9307	cmpq	$0x12, %rax
00000000000f930b	jbe	0xf7dcf
00000000000f9311	jmp	0xf7e82
00000000000f9316	jmp	0xf9401
00000000000f931b	jmp	0xf9401
00000000000f9320	jmp	0xf9401
00000000000f9325	jmp	0xf9401
00000000000f932a	jmp	0xf9401
00000000000f932f	jmp	0xf9401
00000000000f9334	jmp	0xf9401
00000000000f9339	jmp	0xf9401
00000000000f933e	jmp	0xf9401
00000000000f9343	jmp	0xf9401
00000000000f9348	jmp	0xf9401
00000000000f934d	jmp	0xf9401
00000000000f9352	jmp	0xf9401
00000000000f9357	jmp	0xf9401
00000000000f935c	jmp	0xf9401
00000000000f9361	jmp	0xf9401
00000000000f9366	jmp	0xf9401
00000000000f936b	jmp	0xf9401
00000000000f9370	jmp	0xf9401
00000000000f9375	jmp	0xf93d9
00000000000f9377	jmp	0xf93d9
00000000000f9379	jmp	0xf93d9
00000000000f937b	jmp	0xf93d9
00000000000f937d	jmp	0xf93d9
00000000000f937f	jmp	0xf93d9
00000000000f9381	jmp	0xf93d9
00000000000f9383	jmp	0xf93d9
00000000000f9385	jmp	0xf93d9
00000000000f9387	jmp	0xf93d9
00000000000f9389	jmp	0xf93d9
00000000000f938b	jmp	0xf93d9
00000000000f938d	jmp	0xf93d9
00000000000f938f	jmp	0xf93d9
00000000000f9391	jmp	0xf93d9
00000000000f9393	jmp	0xf93d9
00000000000f9395	jmp	0xf93d9
00000000000f9397	jmp	0xf93d9
00000000000f9399	jmp	0xf93d9
00000000000f939b	jmp	0xf93d9
00000000000f939d	jmp	0xf93d9
00000000000f939f	jmp	0xf93d9
00000000000f93a1	jmp	0xf93d9
00000000000f93a3	jmp	0xf93d9
00000000000f93a5	jmp	0xf93d9
00000000000f93a7	jmp	0xf93d9
00000000000f93a9	jmp	0xf93d9
00000000000f93ab	jmp	0xf93d9
00000000000f93ad	jmp	0xf93d9
00000000000f93af	jmp	0xf93d9
00000000000f93b1	jmp	0xf93d9
00000000000f93b3	jmp	0xf93d9
00000000000f93b5	jmp	0xf93d9
00000000000f93b7	jmp	0xf93d9
00000000000f93b9	jmp	0xf93d9
00000000000f93bb	jmp	0xf93d9
00000000000f93bd	jmp	0xf93d9
00000000000f93bf	jmp	0xf93d9
00000000000f93c1	jmp	0xf93d9
00000000000f93c3	jmp	0xf93d9
00000000000f93c5	jmp	0xf93d9
00000000000f93c7	jmp	0xf93d9
00000000000f93c9	jmp	0xf9401
00000000000f93cb	jmp	0xf9401
00000000000f93cd	jmp	0xf9401
00000000000f93cf	jmp	0xf9401
00000000000f93d1	jmp	0xf93d9
00000000000f93d3	jmp	0xf93d9
00000000000f93d5	jmp	0xf93d9
00000000000f93d7	jmp	0xf93d9
00000000000f93d9	movq	%rax, %rbx
00000000000f93dc	movq	%r15, %rdi
00000000000f93df	callq	__ZN8HGObjectdlEPv              ## HGObject::operator delete(void*)
00000000000f93e4	movq	%rbx, %rdi
00000000000f93e7	callq	0x3c4e02                        ## symbol stub for: __Unwind_Resume
00000000000f93ec	jmp	0xf9401
00000000000f93ee	movq	%rax, %rbx
00000000000f93f1	movq	%r13, %rdi
00000000000f93f4	callq	__ZN8HGObjectdlEPv              ## HGObject::operator delete(void*)
00000000000f93f9	movq	%rbx, %rdi
00000000000f93fc	callq	0x3c4e02                        ## symbol stub for: __Unwind_Resume
00000000000f9401	movq	%rax, %rbx
00000000000f9404	movq	%r12, %rdi
00000000000f9407	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
00000000000f940c	movq	%rbx, %rdi
00000000000f940f	callq	0x3c4e02                        ## symbol stub for: __Unwind_Resume
00000000000f9414	testl	$0xd6fffffa, %eax               ## imm = 0xD6FFFFFA
00000000000f9419	outb	%al, $0xff
00000000000f941b	.byte 0xff #bad opcode
00000000000f941c	movl	$0xd0fffffa, %esp               ## imm = 0xD0FFFFFA
00000000000f9421	cli
00000000000f9422	.byte 0xff #bad opcode
00000000000f9423	jmpq	*-0x1a(%rbx)
00000000000f9426	.byte 0xff #bad opcode
00000000000f9427	jmpq	*%rbx
00000000000f9429	jmp	0xffffffffe9f3942d
00000000000f942e	.byte 0xff #bad opcode
00000000000f942f	jmpq	*%rbx
00000000000f9431	jmp	0xffffffffe9f39435
00000000000f9436	.byte 0xff #bad opcode
00000000000f9437	jmpq	*%rbx
00000000000f9439	jmp	0xffffffffed21943d
00000000000f943e	.byte 0xff #bad opcode
00000000000f943f	ljmpl	*-0x1(%rbp,%rbp,8)
00000000000f9443	.byte 0xff #bad opcode
00000000000f9444	fldlg2
00000000000f9446	.byte 0xff #bad opcode
00000000000f9447	jmpq	*-0x135e0001(%rbp,%rbp,8)
00000000000f944e	.byte 0xff #bad opcode
00000000000f944f	pushq	-0x48000017(%rdi)
00000000000f9455	jmp	0xffffffffe9c79459
00000000000f945a	.byte 0xff #bad opcode
00000000000f945b	pushq	-0x48000017(%rdi)
00000000000f9461	jmp	0xffffffffe9c79465
00000000000f9466	.byte 0xff #bad opcode
00000000000f9467	pushq	-0x48000017(%rdi)
00000000000f946d	jmp	0xffffffffe9c79471
00000000000f9472	.byte 0xff #bad opcode
00000000000f9473	jmpq	*%rsi
00000000000f9475	inb	%dx, %al
00000000000f9476	.byte 0xff #bad opcode
00000000000f9477	.byte 0xff #bad opcode
00000000000f9478	movl	$0xd6fffffc, %ebp               ## imm = 0xD6FFFFFC
00000000000f947d	sti
00000000000f947e	.byte 0xff #bad opcode
00000000000f947f	decl	-0x4(%rbp)
00000000000f9482	.byte 0xff #bad opcode
00000000000f9483	ljmpl	*(%rbx,%rdi,8)
00000000000f9486	.byte 0xff #bad opcode
00000000000f9487	pushq	(%rdx)
00000000000f9489	std
00000000000f948a	.byte 0xff #bad opcode
00000000000f948b	jmpq	*-0x7a000003(%rdi)
00000000000f9491	cld
00000000000f9492	.byte 0xff #bad opcode
00000000000f9493	decl	-0x2(%rdi)
00000000000f9496	.byte 0xff #bad opcode
00000000000f9497	lcalll	*0x17fffffb(%rsi)
00000000000f949d	.byte 0xfe #bad opcode
00000000000f949e	.byte 0xff #bad opcode
00000000000f949f	pushq	%rsp
00000000000f94a1	cli
00000000000f94a2	.byte 0xff #bad opcode
00000000000f94a3	jmpq	*-0x1(%rbx,%rdi,8)
00000000000f94a7	ljmpl	*-0x3(%rdx)
00000000000f94aa	.byte 0xff #bad opcode
00000000000f94ab	.byte 0xff #bad opcode
00000000000f94ac	movl	$0x15fffffa, %esp               ## imm = 0x15FFFFFA
00000000000f94b1	cld
00000000000f94b2	.byte 0xff #bad opcode
00000000000f94b3	incl	-0x3050001(%rdx,%rdi,8)
00000000000f94ba	.byte 0xff #bad opcode
00000000000f94bb	.byte 0xff #bad opcode
00000000000f94bc	.byte 0xdf #bad opcode
00000000000f94bd	std
00000000000f94be	.byte 0xff #bad opcode
00000000000f94bf	callq	*0x48(%rbp)
00000000000f94c2	movl	%esp, %ebp
00000000000f94c4	pushq	%r15
00000000000f94c6	pushq	%r14
00000000000f94c8	pushq	%rbx
00000000000f94c9	pushq	%rax
00000000000f94ca	movq	0x1d8(%rdi), %rax
00000000000f94d1	testq	%rax, %rax
00000000000f94d4	jne	0xf9512
00000000000f94d6	movq	%rdi, %r15
00000000000f94d9	movl	$0x1a0, %edi                    ## imm = 0x1A0
00000000000f94de	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
00000000000f94e3	movq	%rax, %r14
00000000000f94e6	movl	$0x1a0, %esi                    ## imm = 0x1A0
00000000000f94eb	movq	%rax, %rdi
00000000000f94ee	callq	0x3c4fca                        ## symbol stub for: ___bzero
00000000000f94f3	movq	%r14, %rbx
00000000000f94f6	movq	%r14, %rdi
00000000000f94f9	callq	__ZN30HgcColorGamma_2vuy_yxzx_expandC2Ev ## HgcColorGamma_2vuy_yxzx_expand::HgcColorGamma_2vuy_yxzx_expand()
00000000000f94fe	leaq	0x91a24b(%rip), %rcx
00000000000f9505	movq	%rbx, %rax
00000000000f9508	movq	%rcx, (%rbx)
00000000000f950b	movq	%rbx, 0x1d8(%r15)
00000000000f9512	addq	$0x8, %rsp
00000000000f9516	popq	%rbx
00000000000f9517	popq	%r14
00000000000f9519	popq	%r15
00000000000f951b	popq	%rbp
00000000000f951c	retq
00000000000f951d	movq	%rax, %r14
00000000000f9520	movq	%rbx, %rdi
00000000000f9523	callq	__ZN8HGObjectdlEPv              ## HGObject::operator delete(void*)
00000000000f9528	movq	%r14, %rdi
00000000000f952b	callq	0x3c4e02                        ## symbol stub for: __Unwind_Resume
