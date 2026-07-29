__ZN4HGPQ7PQToSDR9GetOutputEP10HGRenderer:
00000000000ff130	pushq	%rbp
00000000000ff131	movq	%rsp, %rbp
00000000000ff134	pushq	%r15
00000000000ff136	pushq	%r14
00000000000ff138	pushq	%r13
00000000000ff13a	pushq	%r12
00000000000ff13c	pushq	%rbx
00000000000ff13d	subq	$0x18, %rsp
00000000000ff141	movq	%rdi, %r15
00000000000ff144	movq	%rsi, %rdi
00000000000ff147	movq	%r15, %rsi
00000000000ff14a	xorl	%edx, %edx
00000000000ff14c	callq	__ZN10HGRenderer8GetInputEP6HGNodei ## HGRenderer::GetInput(HGNode*, int)
00000000000ff151	movq	%rax, %r14
00000000000ff154	movl	$0x1b0, %edi                    ## imm = 0x1B0
00000000000ff159	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
00000000000ff15e	movq	%rax, %rbx
00000000000ff161	movq	%rax, %rdi
00000000000ff164	callq	__ZN6HGNodeC2Ev                 ## HGNode::HGNode()
00000000000ff169	leaq	0x917010(%rip), %rax
00000000000ff170	movq	%rax, (%rbx)
00000000000ff173	movl	$0x1a0, %edi                    ## imm = 0x1A0
00000000000ff178	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
00000000000ff17d	movq	%rax, %r12
00000000000ff180	movq	%rax, %rdi
00000000000ff183	callq	__ZN26HgcBT2100_PQ_OOTF_qtApproxC1Ev ## HgcBT2100_PQ_OOTF_qtApprox::HgcBT2100_PQ_OOTF_qtApprox()
00000000000ff188	movq	%r12, 0x198(%rbx)
00000000000ff18f	movaps	0x2d1f8a(%rip), %xmm0
00000000000ff196	movaps	%xmm0, 0x1a0(%rbx)
00000000000ff19d	movq	(%rbx), %rax
00000000000ff1a0	movq	%rbx, %rdi
00000000000ff1a3	xorl	%esi, %esi
00000000000ff1a5	movq	%r14, %rdx
00000000000ff1a8	callq	*0x78(%rax)
00000000000ff1ab	movl	$0x1a0, %edi                    ## imm = 0x1A0
00000000000ff1b0	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
00000000000ff1b5	movq	%rax, %r14
00000000000ff1b8	movq	%rax, %rdi
00000000000ff1bb	callq	__ZN19HgcBT2390_EETF_YRGBC1Ev   ## HgcBT2390_EETF_YRGB::HgcBT2390_EETF_YRGB()
00000000000ff1c0	movq	(%r14), %rax
00000000000ff1c3	movq	%r14, %rdi
00000000000ff1c6	xorl	%esi, %esi
00000000000ff1c8	movq	%rbx, %rdx
00000000000ff1cb	callq	*0x78(%rax)
00000000000ff1ce	movsd	0x1b0(%r15), %xmm0
00000000000ff1d7	cvtsd2ss	%xmm0, %xmm2
00000000000ff1db	movss	0x1d0(%r15), %xmm0
00000000000ff1e4	movsd	0x2ce08c(%rip), %xmm3
00000000000ff1ec	divsd	0x1b8(%r15), %xmm3
00000000000ff1f5	movss	0x1d4(%r15), %xmm1
00000000000ff1fe	cvtsd2ss	%xmm3, %xmm3
00000000000ff202	movq	(%r14), %rax
00000000000ff205	movq	%r14, %rdi
00000000000ff208	xorl	%esi, %esi
00000000000ff20a	callq	*0x60(%rax)
00000000000ff20d	movss	0x1d8(%r15), %xmm0
00000000000ff216	movss	0x1dc(%r15), %xmm1
00000000000ff21f	movss	0x1e0(%r15), %xmm2
00000000000ff228	movss	0x1e4(%r15), %xmm3
00000000000ff231	movq	(%r14), %rax
00000000000ff234	movq	%r14, %rdi
00000000000ff237	movl	$0x1, %esi
00000000000ff23c	callq	*0x60(%rax)
00000000000ff23f	movq	(%r14), %rax
00000000000ff242	movss	0x2d1d1a(%rip), %xmm0
00000000000ff24a	movss	0x2d1d16(%rip), %xmm1
00000000000ff252	xorps	%xmm2, %xmm2
00000000000ff255	xorps	%xmm3, %xmm3
00000000000ff258	movq	%r14, %rdi
00000000000ff25b	movl	$0x2, %esi
00000000000ff260	callq	*0x60(%rax)
00000000000ff263	movq	0x1c0(%r15), %rax
00000000000ff26a	movss	0x1a0(%rax), %xmm1
00000000000ff272	movss	0x1a4(%rax), %xmm2
00000000000ff27a	movq	(%r14), %rax
00000000000ff27d	movss	0x2d1cd3(%rip), %xmm0
00000000000ff285	xorps	%xmm3, %xmm3
00000000000ff288	movq	%r14, %rdi
00000000000ff28b	movl	$0x3, %esi
00000000000ff290	callq	*0x60(%rax)
00000000000ff293	movq	(%r14), %rax
00000000000ff296	movss	0x2d1cb2(%rip), %xmm0
00000000000ff29e	movss	0x2d1cae(%rip), %xmm1
00000000000ff2a6	xorps	%xmm2, %xmm2
00000000000ff2a9	xorps	%xmm3, %xmm3
00000000000ff2ac	movq	%r14, %rdi
00000000000ff2af	movl	$0x4, %esi
00000000000ff2b4	callq	*0x60(%rax)
00000000000ff2b7	movq	0x1c8(%r15), %rax
00000000000ff2be	movss	0x1a0(%rax), %xmm3
00000000000ff2c6	movq	(%r14), %rax
00000000000ff2c9	movss	0x2d1c87(%rip), %xmm0
00000000000ff2d1	movss	0x2d1c83(%rip), %xmm1
00000000000ff2d9	movss	0x2d1c7f(%rip), %xmm2
00000000000ff2e1	movq	%r14, %rdi
00000000000ff2e4	movl	$0x5, %esi
00000000000ff2e9	callq	*0x60(%rax)
00000000000ff2ec	cmpl	$0x2, 0x1a0(%r15)
00000000000ff2f4	jne	0xff30e
00000000000ff2f6	movq	(%r14), %rax
00000000000ff2f9	movq	%r14, %rdi
00000000000ff2fc	callq	*0x10(%rax)
00000000000ff2ff	movq	%r14, 0x198(%r15)
00000000000ff306	movq	%r14, %r15
00000000000ff309	jmp	0xff47f
00000000000ff30e	movl	$0x1f0, %edi                    ## imm = 0x1F0
00000000000ff313	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
00000000000ff318	movq	%rax, %r12
00000000000ff31b	movq	%rax, %rdi
00000000000ff31e	callq	__ZN13HGColorMatrixC1Ev         ## HGColorMatrix::HGColorMatrix()
00000000000ff323	movq	(%r12), %rax
00000000000ff327	movq	%r12, %rdi
00000000000ff32a	xorl	%esi, %esi
00000000000ff32c	movq	%r14, %rdx
00000000000ff32f	movq	%r12, -0x38(%rbp)
00000000000ff333	callq	*0x78(%rax)
00000000000ff336	leaq	__ZN12HGColorGamma21rec2020RGBToRec709RGBE(%rip), %rsi ## HGColorGamma::rec2020RGBToRec709RGB
00000000000ff33d	movq	%r12, %rdi
00000000000ff340	movl	$0x1, %edx
00000000000ff345	callq	__ZN13HGColorMatrix10LoadMatrixEPKDv4_fb ## HGColorMatrix::LoadMatrix(float vector[4] const*, bool)
00000000000ff34a	movl	$0x1c0, %edi                    ## imm = 0x1C0
00000000000ff34f	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
00000000000ff354	movq	%rax, %r12
00000000000ff357	movq	%rax, %rdi
00000000000ff35a	callq	__ZN12HGColorClampC1Ev          ## HGColorClamp::HGColorClamp()
00000000000ff35f	movq	(%r12), %rax
00000000000ff363	movq	%r12, %rdi
00000000000ff366	xorl	%esi, %esi
00000000000ff368	movq	-0x38(%rbp), %rdx
00000000000ff36c	movq	%r12, -0x30(%rbp)
00000000000ff370	callq	*0x78(%rax)
00000000000ff373	xorps	%xmm0, %xmm0
00000000000ff376	xorps	%xmm1, %xmm1
00000000000ff379	xorps	%xmm2, %xmm2
00000000000ff37c	xorps	%xmm3, %xmm3
00000000000ff37f	movq	%r12, %rdi
00000000000ff382	callq	__ZN12HGColorClamp17SetClampMinValuesEffff ## HGColorClamp::SetClampMinValues(float, float, float, float)
00000000000ff387	movl	$0x1b0, %edi                    ## imm = 0x1B0
00000000000ff38c	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
00000000000ff391	movq	%rax, %r12
00000000000ff394	movq	%rax, %rdi
00000000000ff397	callq	__ZN7HGGammaC1Ev                ## HGGamma::HGGamma()
00000000000ff39c	movq	(%r12), %rax
00000000000ff3a0	movq	%r12, %rdi
00000000000ff3a3	xorl	%esi, %esi
00000000000ff3a5	movq	-0x30(%rbp), %rdx
00000000000ff3a9	callq	*0x78(%rax)
00000000000ff3ac	movq	(%r12), %rax
00000000000ff3b0	movss	0x2caefc(%rip), %xmm0
00000000000ff3b8	movss	0x2c8900(%rip), %xmm3
00000000000ff3c0	movq	%r12, %rdi
00000000000ff3c3	xorl	%esi, %esi
00000000000ff3c5	movaps	%xmm0, %xmm1
00000000000ff3c8	movaps	%xmm0, %xmm2
00000000000ff3cb	callq	*0x60(%rax)
00000000000ff3ce	cmpl	$0x0, 0x1a0(%r15)
00000000000ff3d6	je	0xff449
00000000000ff3d8	movl	$0x4a0, %edi                    ## imm = 0x4A0
00000000000ff3dd	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
00000000000ff3e2	movq	%rax, %r13
00000000000ff3e5	movq	%rax, %rdi
00000000000ff3e8	callq	__ZN12HGColorGammaC1Ev          ## HGColorGamma::HGColorGamma()
00000000000ff3ed	movq	(%r13), %rax
00000000000ff3f1	movq	%r13, %rdi
00000000000ff3f4	xorl	%esi, %esi
00000000000ff3f6	movq	%r12, %rdx
00000000000ff3f9	callq	*0x78(%rax)
00000000000ff3fc	movl	$0x0, (%rsp)
00000000000ff403	movq	%r13, %rdi
00000000000ff406	xorl	%esi, %esi
00000000000ff408	movl	$0x1, %edx
00000000000ff40d	xorl	%ecx, %ecx
00000000000ff40f	movl	$0x3, %r8d
00000000000ff415	movl	$0x8, %r9d
00000000000ff41b	callq	__ZN12HGColorGamma13SetConversionENS_26hgColorGammaColorPrimariesENS_28hgColorGammaTransferFunctionENS_30hgColorGammaMatrixCoefficientsES0_S1_S2_ ## HGColorGamma::SetConversion(HGColorGamma::hgColorGammaColorPrimaries, HGColorGamma::hgColorGammaTransferFunction, HGColorGamma::hgColorGammaMatrixCoefficients, HGColorGamma::hgColorGammaColorPrimaries, HGColorGamma::hgColorGammaTransferFunction, HGColorGamma::hgColorGammaMatrixCoefficients)
00000000000ff420	movq	%r13, %rdi
00000000000ff423	xorl	%esi, %esi
00000000000ff425	xorl	%edx, %edx
00000000000ff427	callq	__ZN12HGColorGamma19SetPremultiplyStateEbb ## HGColorGamma::SetPremultiplyState(bool, bool)
00000000000ff42c	movq	(%r13), %rax
00000000000ff430	movq	%r13, %rdi
00000000000ff433	callq	*0x10(%rax)
00000000000ff436	movq	%r13, 0x198(%r15)
00000000000ff43d	movq	(%r13), %rax
00000000000ff441	movq	%r13, %rdi
00000000000ff444	callq	*0x18(%rax)
00000000000ff447	jmp	0xff45a
00000000000ff449	movq	(%r12), %rax
00000000000ff44d	movq	%r12, %rdi
00000000000ff450	callq	*0x10(%rax)
00000000000ff453	movq	%r12, 0x198(%r15)
00000000000ff45a	movq	(%r12), %rax
00000000000ff45e	movq	%r12, %rdi
00000000000ff461	callq	*0x18(%rax)
00000000000ff464	movq	-0x30(%rbp), %rdi
00000000000ff468	movq	(%rdi), %rax
00000000000ff46b	callq	*0x18(%rax)
00000000000ff46e	movq	-0x38(%rbp), %rdi
00000000000ff472	movq	(%rdi), %rax
00000000000ff475	callq	*0x18(%rax)
00000000000ff478	movq	0x198(%r15), %r15
00000000000ff47f	movq	(%r14), %rax
00000000000ff482	movq	%r14, %rdi
00000000000ff485	callq	*0x18(%rax)
00000000000ff488	movq	(%rbx), %rax
00000000000ff48b	movq	%rbx, %rdi
00000000000ff48e	callq	*0x18(%rax)
00000000000ff491	movq	%r15, %rax
00000000000ff494	addq	$0x18, %rsp
00000000000ff498	popq	%rbx
00000000000ff499	popq	%r12
00000000000ff49b	popq	%r13
00000000000ff49d	popq	%r14
00000000000ff49f	popq	%r15
00000000000ff4a1	popq	%rbp
00000000000ff4a2	retq
00000000000ff4a3	movq	%rax, %rdi
00000000000ff4a6	callq	___clang_call_terminate
00000000000ff4ab	movq	%rax, %r15
00000000000ff4ae	movq	%r13, %rdi
00000000000ff4b1	callq	__ZN8HGObjectdlEPv              ## HGObject::operator delete(void*)
00000000000ff4b6	jmp	0xff597
00000000000ff4bb	jmp	0xff594
00000000000ff4c0	movq	%rax, %rdi
00000000000ff4c3	callq	___clang_call_terminate
00000000000ff4c8	movq	%rax, %rdi
00000000000ff4cb	callq	___clang_call_terminate
00000000000ff4d0	movq	%rax, %rdi
00000000000ff4d3	callq	___clang_call_terminate
00000000000ff4d8	movq	%rax, %r15
00000000000ff4db	movq	%r12, %rdi
00000000000ff4de	callq	__ZN8HGObjectdlEPv              ## HGObject::operator delete(void*)
00000000000ff4e3	jmp	0xff5a1
00000000000ff4e8	movq	%rax, %r15
00000000000ff4eb	jmp	0xff5a1
00000000000ff4f0	movq	%rax, %r15
00000000000ff4f3	movq	%r12, %rdi
00000000000ff4f6	callq	__ZN8HGObjectdlEPv              ## HGObject::operator delete(void*)
00000000000ff4fb	jmp	0xff5ab
00000000000ff500	movq	%rax, %r15
00000000000ff503	jmp	0xff5ab
00000000000ff508	movq	%rax, %r15
00000000000ff50b	movq	%r12, %rdi
00000000000ff50e	callq	__ZN8HGObjectdlEPv              ## HGObject::operator delete(void*)
00000000000ff513	jmp	0xff5d2
00000000000ff518	jmp	0xff5cf
00000000000ff51d	jmp	0xff51f
00000000000ff51f	movq	%rax, %r15
00000000000ff522	movq	(%r13), %rax
00000000000ff526	movq	%r13, %rdi
00000000000ff529	callq	*0x18(%rax)
00000000000ff52c	jmp	0xff597
00000000000ff52e	movq	%rax, %rdi
00000000000ff531	callq	___clang_call_terminate
00000000000ff536	movq	%rax, %rdi
00000000000ff539	callq	___clang_call_terminate
00000000000ff53e	movq	%rax, %rdi
00000000000ff541	callq	___clang_call_terminate
00000000000ff546	movq	%rax, %r15
00000000000ff549	jmp	0xff5a1
00000000000ff54b	movq	%rax, %r15
00000000000ff54e	jmp	0xff5ab
00000000000ff550	movq	%rax, %r15
00000000000ff553	movq	%r14, %rdi
00000000000ff556	callq	__ZN8HGObjectdlEPv              ## HGObject::operator delete(void*)
00000000000ff55b	jmp	0xff5db
00000000000ff55d	movq	%rax, %r15
00000000000ff560	jmp	0xff5db
00000000000ff562	movq	%rax, %r15
00000000000ff565	jmp	0xff5db
00000000000ff567	movq	%rax, %r15
00000000000ff56a	movq	%r12, %rdi
00000000000ff56d	callq	__ZN8HGObjectdlEPv              ## HGObject::operator delete(void*)
00000000000ff572	jmp	0xff577
00000000000ff574	movq	%rax, %r15
00000000000ff577	movq	%rbx, %rdi
00000000000ff57a	callq	__ZN6HGNodeD2Ev                 ## HGNode::~HGNode()
00000000000ff57f	jmp	0xff584
00000000000ff581	movq	%rax, %r15
00000000000ff584	movq	%rbx, %rdi
00000000000ff587	callq	__ZN8HGObjectdlEPv              ## HGObject::operator delete(void*)
00000000000ff58c	movq	%r15, %rdi
00000000000ff58f	callq	0x3c4e02                        ## symbol stub for: __Unwind_Resume
00000000000ff594	movq	%rax, %r15
00000000000ff597	movq	(%r12), %rax
00000000000ff59b	movq	%r12, %rdi
00000000000ff59e	callq	*0x18(%rax)
00000000000ff5a1	movq	-0x30(%rbp), %rdi
00000000000ff5a5	movq	(%rdi), %rax
00000000000ff5a8	callq	*0x18(%rax)
00000000000ff5ab	movq	-0x38(%rbp), %rdi
00000000000ff5af	movq	(%rdi), %rax
00000000000ff5b2	callq	*0x18(%rax)
00000000000ff5b5	jmp	0xff5d2
00000000000ff5b7	movq	%rax, %rdi
00000000000ff5ba	callq	___clang_call_terminate
00000000000ff5bf	movq	%rax, %rdi
00000000000ff5c2	callq	___clang_call_terminate
00000000000ff5c7	movq	%rax, %rdi
00000000000ff5ca	callq	___clang_call_terminate
00000000000ff5cf	movq	%rax, %r15
00000000000ff5d2	movq	(%r14), %rax
00000000000ff5d5	movq	%r14, %rdi
00000000000ff5d8	callq	*0x18(%rax)
00000000000ff5db	movq	(%rbx), %rax
00000000000ff5de	movq	%rbx, %rdi
00000000000ff5e1	callq	*0x18(%rax)
00000000000ff5e4	movq	%r15, %rdi
00000000000ff5e7	callq	0x3c4e02                        ## symbol stub for: __Unwind_Resume
00000000000ff5ec	movq	%rax, %rdi
00000000000ff5ef	callq	___clang_call_terminate
00000000000ff5f4	movq	%rax, %rdi
00000000000ff5f7	callq	___clang_call_terminate
00000000000ff5fc	nopl	(%rax)
