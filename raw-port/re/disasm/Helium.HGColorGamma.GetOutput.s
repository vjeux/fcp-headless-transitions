__ZN12HGColorGamma9GetOutputEP10HGRenderer:
00000000000f6000	pushq	%rbp
00000000000f6001	movq	%rsp, %rbp
00000000000f6004	pushq	%r15
00000000000f6006	pushq	%r14
00000000000f6008	pushq	%r13
00000000000f600a	pushq	%r12
00000000000f600c	pushq	%rbx
00000000000f600d	subq	$0x68, %rsp
00000000000f6011	movq	%rsi, %r15
00000000000f6014	movq	%rdi, %rbx
00000000000f6017	movq	%rsi, %rdi
00000000000f601a	movq	%rbx, %rsi
00000000000f601d	xorl	%edx, %edx
00000000000f601f	callq	__ZN10HGRenderer8GetInputEP6HGNodei ## HGRenderer::GetInput(HGNode*, int)
00000000000f6024	movq	%rax, -0x48(%rbp)
00000000000f6028	testq	%rax, %rax
00000000000f602b	je	0xf6161
00000000000f6031	cmpl	$0x424d504c, 0xc(%rax)          ## imm = 0x424D504C
00000000000f6038	jne	0xf60fc
00000000000f603e	cmpl	$0x0, 0x404(%rbx)
00000000000f6045	jne	0xf60fc
00000000000f604b	movaps	0x2d496e(%rip), %xmm0
00000000000f6052	movaps	0x300(%rbx), %xmm1
00000000000f6059	mulps	%xmm0, %xmm1
00000000000f605c	cmpneqps	%xmm0, %xmm1
00000000000f6060	movmskps	%xmm1, %ecx
00000000000f6063	testb	%cl, %cl
00000000000f6065	jne	0xf60fc
00000000000f606b	movss	0x2d1c4d(%rip), %xmm1
00000000000f6073	movaps	0x380(%rbx), %xmm2
00000000000f607a	cmpneqps	%xmm1, %xmm2
00000000000f607e	movsd	0x2d1c2a(%rip), %xmm0
00000000000f6086	movaps	0x390(%rbx), %xmm4
00000000000f608d	cmpneqps	%xmm0, %xmm4
00000000000f6091	orps	%xmm2, %xmm4
00000000000f6094	movaps	0x2d49d5(%rip), %xmm2
00000000000f609b	movaps	0x3a0(%rbx), %xmm5
00000000000f60a2	cmpneqps	%xmm2, %xmm5
00000000000f60a6	movaps	0x2d3f33(%rip), %xmm3
00000000000f60ad	movaps	0x3b0(%rbx), %xmm6
00000000000f60b4	cmpneqps	%xmm3, %xmm6
00000000000f60b8	orps	%xmm5, %xmm6
00000000000f60bb	orps	%xmm4, %xmm6
00000000000f60be	movmskps	%xmm6, %ecx
00000000000f60c1	testl	%ecx, %ecx
00000000000f60c3	jne	0xf60fc
00000000000f60c5	cmpneqps	0x3c0(%rbx), %xmm1
00000000000f60cd	cmpneqps	0x3d0(%rbx), %xmm0
00000000000f60d5	orps	%xmm1, %xmm0
00000000000f60d8	cmpneqps	0x3e0(%rbx), %xmm2
00000000000f60e0	cmpneqps	0x3f0(%rbx), %xmm3
00000000000f60e8	orps	%xmm2, %xmm3
00000000000f60eb	orps	%xmm0, %xmm3
00000000000f60ee	movmskps	%xmm3, %ecx
00000000000f60f1	testl	%ecx, %ecx
00000000000f60f3	jne	0xf60fc
00000000000f60f5	movq	%rax, 0x498(%rbx)
00000000000f60fc	leaq	-0x48(%rbp), %rdx
00000000000f6100	movq	%rbx, %rdi
00000000000f6103	movq	%r15, %rsi
00000000000f6106	callq	__ZN12HGColorGamma27ConcatenateWithUpstreamNodeEP10HGRendererPP6HGNode ## HGColorGamma::ConcatenateWithUpstreamNode(HGRenderer*, HGNode**)
00000000000f610b	cmpb	$0x0, 0x2e9(%rbx)
00000000000f6112	je	0xf6168
00000000000f6114	movq	%rbx, %rdi
00000000000f6117	callq	__ZN12HGColorGamma12ReleaseNodesEv ## HGColorGamma::ReleaseNodes()
00000000000f611c	movl	$0x130, %edi                    ## imm = 0x130
00000000000f6121	callq	0x3c4fb2                        ## symbol stub for: __Znwm
00000000000f6126	movq	%rax, %r14
00000000000f6129	movl	$0x130, %esi                    ## imm = 0x130
00000000000f612e	movq	%rax, %rdi
00000000000f6131	callq	0x3c4fca                        ## symbol stub for: ___bzero
00000000000f6136	movq	%r14, 0x198(%rbx)
00000000000f613d	movq	-0x48(%rbp), %rsi
00000000000f6141	movq	%rbx, %rdi
00000000000f6144	movq	%r15, %rdx
00000000000f6147	callq	__ZN12HGColorGamma11ScaleParamsEP6HGNodeP10HGRenderer ## HGColorGamma::ScaleParams(HGNode*, HGRenderer*)
00000000000f614c	movb	%al, 0x2e8(%rbx)
00000000000f6152	movw	$0x100, 0x2e9(%rbx)             ## imm = 0x100
00000000000f615b	testb	%al, %al
00000000000f615d	jne	0xf6171
00000000000f615f	jmp	0xf619f
00000000000f6161	xorl	%ebx, %ebx
00000000000f6163	jmp	0xf735d
00000000000f6168	cmpb	$0x0, 0x2e8(%rbx)
00000000000f616f	je	0xf619f
00000000000f6171	cmpb	$0x0, 0x400(%rbx)
00000000000f6178	jne	0xf619f
00000000000f617a	movq	(%r15), %rax
00000000000f617d	movq	%r15, %rdi
00000000000f6180	callq	*0x130(%rax)
00000000000f6186	testb	%al, %al
00000000000f6188	je	0xf619f
00000000000f618a	movq	-0x48(%rbp), %rdi
00000000000f618e	callq	__ZNK14HGBitmapLoader12GetBitmapPtrEv ## HGBitmapLoader::GetBitmapPtr() const
00000000000f6193	movq	%rax, 0x1a0(%rbx)
00000000000f619a	jmp	0xf735d
00000000000f619f	cmpb	$0x0, 0x2ea(%rbx)
00000000000f61a6	je	0xf627b
00000000000f61ac	movb	$0x0, 0x2ea(%rbx)
00000000000f61b3	movl	0x424(%rbx), %eax
00000000000f61b9	movl	$0x1, %ecx
00000000000f61be	cmpq	$0x1c, %rax
00000000000f61c2	ja	0xf61ce
00000000000f61c4	leaq	0x2daa65(%rip), %rcx
00000000000f61cb	movl	(%rcx,%rax,4), %ecx
00000000000f61ce	movl	%ecx, -0x60(%rbp)
00000000000f61d1	movq	-0x48(%rbp), %rdi
00000000000f61d5	cmpl	$0x424d504c, 0xc(%rdi)          ## imm = 0x424D504C
00000000000f61dc	movq	%rdi, -0x40(%rbp)
00000000000f61e0	jne	0xf62d4
00000000000f61e6	callq	__ZNK14HGBitmapLoader15GetBitmapFormatEv ## HGBitmapLoader::GetBitmapFormat() const
00000000000f61eb	movl	%eax, %r14d
00000000000f61ee	xorl	%r13d, %r13d
00000000000f61f1	xorl	%r12d, %r12d
00000000000f61f4	leal	-0xe(%r14), %eax
00000000000f61f8	cmpl	$0x11, %eax
00000000000f61fb	ja	0xf62da
00000000000f6201	leaq	0x1218(%rip), %rcx
00000000000f6208	movslq	(%rcx,%rax,4), %rax
00000000000f620c	addq	%rcx, %rax
00000000000f620f	jmpq	*%rax
00000000000f6211	cmpl	$0x1, 0x424(%rbx)
00000000000f6218	jne	0xf62d4
00000000000f621e	movq	(%r15), %rax
00000000000f6221	movq	%r15, %rdi
00000000000f6224	callq	*0x130(%rax)
00000000000f622a	testb	%al, %al
00000000000f622c	jne	0xf62b7
00000000000f6232	movq	0x1d8(%rbx), %r13
00000000000f6239	testq	%r13, %r13
00000000000f623c	jne	0xf654d
00000000000f6242	movl	$0x1a0, %edi                    ## imm = 0x1A0
00000000000f6247	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
00000000000f624c	movq	%rax, %r13
00000000000f624f	movl	$0x1a0, %esi                    ## imm = 0x1A0
00000000000f6254	movq	%rax, %rdi
00000000000f6257	callq	0x3c4fca                        ## symbol stub for: ___bzero
00000000000f625c	movq	%r13, %rdi
00000000000f625f	callq	__ZN30HgcColorGamma_2vuy_yxzx_expandC2Ev ## HgcColorGamma_2vuy_yxzx_expand::HgcColorGamma_2vuy_yxzx_expand()
00000000000f6264	leaq	0x91d4e5(%rip), %rax
00000000000f626b	movq	%rax, (%r13)
00000000000f626f	movq	%r13, 0x1d8(%rbx)
00000000000f6276	jmp	0xf654d
00000000000f627b	movq	0x2f0(%rbx), %rdi
00000000000f6282	movq	-0x48(%rbp), %rdx
00000000000f6286	movq	(%rdi), %rax
00000000000f6289	xorl	%esi, %esi
00000000000f628b	callq	*0x78(%rax)
00000000000f628e	movq	0x2f8(%rbx), %rbx
00000000000f6295	jmp	0xf735d
00000000000f629a	cmpl	$0x3, 0x424(%rbx)
00000000000f62a1	jne	0xf62d4
00000000000f62a3	movq	(%r15), %rax
00000000000f62a6	movq	%r15, %rdi
00000000000f62a9	callq	*0x130(%rax)
00000000000f62af	testb	%al, %al
00000000000f62b1	je	0xf6528
00000000000f62b7	movb	$0x1, %r12b
00000000000f62ba	xorl	%r13d, %r13d
00000000000f62bd	movq	0x2f0(%rbx), %rdi
00000000000f62c4	testq	%rdi, %rdi
00000000000f62c7	jne	0xf62e6
00000000000f62c9	jmp	0xf62f7
00000000000f62cb	cmpl	$0x1, 0x424(%rbx)
00000000000f62d2	je	0xf62a3
00000000000f62d4	xorl	%r12d, %r12d
00000000000f62d7	xorl	%r13d, %r13d
00000000000f62da	movq	0x2f0(%rbx), %rdi
00000000000f62e1	testq	%rdi, %rdi
00000000000f62e4	je	0xf62f7
00000000000f62e6	cmpb	$0x1, 0x402(%rbx)
00000000000f62ed	jne	0xf62f7
00000000000f62ef	movl	-0x60(%rbp), %esi
00000000000f62f2	callq	__ZN6HGNode28SetSupportedFormatPrecisionsEj ## HGNode::SetSupportedFormatPrecisions(unsigned int)
00000000000f62f7	movl	0x420(%rbx), %eax
00000000000f62fd	addl	$-0xe, %eax
00000000000f6300	cmpl	$0x11, %eax
00000000000f6303	ja	0xf6325
00000000000f6305	leaq	0x115c(%rip), %rcx
00000000000f630c	movslq	(%rcx,%rax,4), %rax
00000000000f6310	addq	%rcx, %rax
00000000000f6313	jmpq	*%rax
00000000000f6315	cmpl	$0x1, 0x428(%rbx)
00000000000f631c	jne	0xf6325
00000000000f631e	movb	$0x1, 0x495(%rbx)
00000000000f6325	movl	0x404(%rbx), %esi
00000000000f632b	testl	%esi, %esi
00000000000f632d	jne	0xf6365
00000000000f632f	movaps	0x2d468a(%rip), %xmm0
00000000000f6336	movaps	0x300(%rbx), %xmm1
00000000000f633d	mulps	%xmm0, %xmm1
00000000000f6340	cmpneqps	%xmm0, %xmm1
00000000000f6344	movmskps	%xmm1, %eax
00000000000f6347	testb	%al, %al
00000000000f6349	jne	0xf6365
00000000000f634b	cmpb	$0x1, 0x494(%rbx)
00000000000f6352	jne	0xf63a9
00000000000f6354	movl	%r12d, %eax
00000000000f6357	xorb	$0x1, %al
00000000000f6359	andb	0x495(%rbx), %al
00000000000f635f	movq	%rax, -0x30(%rbp)
00000000000f6363	jmp	0xf63b1
00000000000f6365	testl	%esi, %esi
00000000000f6367	je	0xf63dd
00000000000f6369	cmpl	$0x4, %esi
00000000000f636c	jg	0xf647f
00000000000f6372	movl	0x490(%rbx), %eax
00000000000f6378	cmpl	$0x2, %eax
00000000000f637b	jne	0xf6451
00000000000f6381	movq	%rbx, %rdi
00000000000f6384	cmpl	$0x3, %esi
00000000000f6387	je	0xf65c1
00000000000f638d	cmpl	$0x2, %esi
00000000000f6390	je	0xf65b7
00000000000f6396	cmpl	$0x1, %esi
00000000000f6399	jne	0xf65cb
00000000000f639f	callq	__ZN12HGColorGamma20m_GetToneParamCurve1Ev ## HGColorGamma::m_GetToneParamCurve1()
00000000000f63a4	jmp	0xf648c
00000000000f63a9	movq	$0x0, -0x30(%rbp)
00000000000f63b1	xorl	%r14d, %r14d
00000000000f63b4	jmp	0xf65e6
00000000000f63b9	cmpl	$0x3, 0x428(%rbx)
00000000000f63c0	je	0xf631e
00000000000f63c6	jmp	0xf6325
00000000000f63cb	cmpl	$0x2, 0x428(%rbx)
00000000000f63d2	je	0xf631e
00000000000f63d8	jmp	0xf6325
00000000000f63dd	movl	0x490(%rbx), %eax
00000000000f63e3	leal	-0x1(%rax), %ecx
00000000000f63e6	cmpl	$0x1, %ecx
00000000000f63e9	ja	0xf6451
00000000000f63eb	cmpb	$0x1, 0x494(%rbx)
00000000000f63f2	jne	0xf6407
00000000000f63f4	cmpb	$0x0, 0x495(%rbx)
00000000000f63fb	sete	%al
00000000000f63fe	orb	%r12b, %al
00000000000f6401	je	0xf657c
00000000000f6407	movq	0x1c8(%rbx), %r14
00000000000f640e	testq	%r14, %r14
00000000000f6411	jne	0xf64a8
00000000000f6417	movl	$0x1b0, %edi                    ## imm = 0x1B0
00000000000f641c	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
00000000000f6421	movq	%rax, %r14
00000000000f6424	movq	%rax, %rdi
00000000000f6427	callq	__ZN7HGGammaC1Ev                ## HGGamma::HGGamma()
00000000000f642c	movq	%r14, 0x1c8(%rbx)
00000000000f6433	movq	$0x0, -0x30(%rbp)
00000000000f643b	movq	%r14, %rdi
00000000000f643e	xorl	%esi, %esi
00000000000f6440	callq	__ZN7HGGamma19SetPremultiplyStateEb ## HGGamma::SetPremultiplyState(bool)
00000000000f6445	movq	0x1c8(%rbx), %r14
00000000000f644c	jmp	0xf65e6
00000000000f6451	cmpl	$0x3, %eax
00000000000f6454	jl	0xf649c
00000000000f6456	cmpb	$0x1, 0x370(%rbx)
00000000000f645d	jne	0xf649c
00000000000f645f	cmpb	$0x1, 0x494(%rbx)
00000000000f6466	jne	0xf658f
00000000000f646c	movl	%r12d, %r14d
00000000000f646f	xorb	$0x1, %r14b
00000000000f6473	andb	0x495(%rbx), %r14b
00000000000f647a	jmp	0xf6592
00000000000f647f	cmpl	$0xa, %esi
00000000000f6482	jb	0xf649c
00000000000f6484	movq	%rbx, %rdi
00000000000f6487	callq	__ZN12HGColorGamma20m_GetHDRFunctionNodeENS_16hgColorGammaFormE ## HGColorGamma::m_GetHDRFunctionNode(HGColorGamma::hgColorGammaForm)
00000000000f648c	movq	%rax, %r14
00000000000f648f	movq	$0x0, -0x30(%rbp)
00000000000f6497	jmp	0xf65e6
00000000000f649c	movq	0x280(%rbx), %r14
00000000000f64a3	testq	%r14, %r14
00000000000f64a6	je	0xf64c7
00000000000f64a8	movq	$0x0, -0x30(%rbp)
00000000000f64b0	jmp	0xf65e6
00000000000f64b5	cmpl	$0x2, 0x424(%rbx)
00000000000f64bc	je	0xf62a3
00000000000f64c2	jmp	0xf62d4
00000000000f64c7	movl	$0x1d0, %edi                    ## imm = 0x1D0
00000000000f64cc	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
00000000000f64d1	movq	%rax, %r14
00000000000f64d4	movl	0x480(%rbx), %esi
00000000000f64da	movss	0x484(%rbx), %xmm0
00000000000f64e2	movss	0x488(%rbx), %xmm1
00000000000f64ea	movl	$0x1, 0x8(%rsp)
00000000000f64f2	movl	$0x1, (%rsp)
00000000000f64f9	movq	%rax, %rdi
00000000000f64fc	movl	$0x1, %edx
00000000000f6501	movl	$0x1, %ecx
00000000000f6506	movl	$0x1, %r8d
00000000000f650c	xorl	%r9d, %r9d
00000000000f650f	callq	__ZN12HGApply1DLUTC1Ejffbbbbbb  ## HGApply1DLUT::HGApply1DLUT(unsigned int, float, float, bool, bool, bool, bool, bool, bool)
00000000000f6514	movq	%r14, 0x280(%rbx)
00000000000f651b	movq	$0x0, -0x30(%rbp)
00000000000f6523	jmp	0xf65e6
00000000000f6528	movq	%rbx, %rdi
00000000000f652b	cmpl	$0x1f, %r14d
00000000000f652f	je	0xf653e
00000000000f6531	cmpl	$0xf, %r14d
00000000000f6535	jne	0xf6545
00000000000f6537	callq	__ZN12HGColorGamma24m_Get2vuy_XYXZExpandNodeEv ## HGColorGamma::m_Get2vuy_XYXZExpandNode()
00000000000f653c	jmp	0xf654a
00000000000f653e	callq	__ZN12HGColorGamma24m_Getv210_YXZXExpandNodeEP10HGRenderer ## HGColorGamma::m_Getv210_YXZXExpandNode(HGRenderer*)
00000000000f6543	jmp	0xf654a
00000000000f6545	callq	__ZN12HGColorGamma24m_Getv216_YXZXExpandNodeEv ## HGColorGamma::m_Getv216_YXZXExpandNode()
00000000000f654a	movq	%rax, %r13
00000000000f654d	movq	(%r13), %rax
00000000000f6551	movq	%r13, %rdi
00000000000f6554	xorl	%esi, %esi
00000000000f6556	movq	-0x40(%rbp), %rdx
00000000000f655a	callq	*0x78(%rax)
00000000000f655d	movq	%r13, 0x2f0(%rbx)
00000000000f6564	movb	$0x1, %r12b
00000000000f6567	movq	0x2f0(%rbx), %rdi
00000000000f656e	testq	%rdi, %rdi
00000000000f6571	jne	0xf62e6
00000000000f6577	jmp	0xf62f7
00000000000f657c	cmpb	$0x1, 0x370(%rbx)
00000000000f6583	jne	0xf65d5
00000000000f6585	movq	%rbx, %rdi
00000000000f6588	callq	__ZN12HGColorGamma21m_GetGammaUniformNodeEv ## HGColorGamma::m_GetGammaUniformNode()
00000000000f658d	jmp	0xf65dd
00000000000f658f	xorl	%r14d, %r14d
00000000000f6592	movq	%rbx, %rdi
00000000000f6595	callq	__ZN12HGColorGamma20m_GetGammaFittedNodeEv ## HGColorGamma::m_GetGammaFittedNode()
00000000000f659a	movq	%r14, -0x30(%rbp)
00000000000f659e	movzbl	%r14b, %esi
00000000000f65a2	movq	%rax, %rdi
00000000000f65a5	callq	__ZN11HGToneCurve19SetPremultiplyStateEb ## HGToneCurve::SetPremultiplyState(bool)
00000000000f65aa	movq	%rbx, %rdi
00000000000f65ad	callq	__ZN12HGColorGamma20m_GetGammaFittedNodeEv ## HGColorGamma::m_GetGammaFittedNode()
00000000000f65b2	movq	%rax, %r14
00000000000f65b5	jmp	0xf65e6
00000000000f65b7	callq	__ZN12HGColorGamma20m_GetToneParamCurve2Ev ## HGColorGamma::m_GetToneParamCurve2()
00000000000f65bc	jmp	0xf648c
00000000000f65c1	callq	__ZN12HGColorGamma20m_GetToneParamCurve3Ev ## HGColorGamma::m_GetToneParamCurve3()
00000000000f65c6	jmp	0xf648c
00000000000f65cb	callq	__ZN12HGColorGamma20m_GetToneParamCurve4Ev ## HGColorGamma::m_GetToneParamCurve4()
00000000000f65d0	jmp	0xf648c
00000000000f65d5	movq	%rbx, %rdi
00000000000f65d8	callq	__ZN12HGColorGamma16m_GetGammaMCNodeEv ## HGColorGamma::m_GetGammaMCNode()
00000000000f65dd	movq	%rax, %r14
00000000000f65e0	movb	$0x1, %al
00000000000f65e2	movq	%rax, -0x30(%rbp)
00000000000f65e6	testb	%r12b, %r12b
00000000000f65e9	movq	%r15, -0x38(%rbp)
00000000000f65ed	movq	%r12, -0x70(%rbp)
00000000000f65f1	je	0xf6665
00000000000f65f3	cmpb	$0x1, 0x402(%rbx)
00000000000f65fa	jne	0xf6665
00000000000f65fc	cmpl	$0x1, 0x40c(%rbx)
00000000000f6603	jne	0xf6665
00000000000f6605	movq	0x258(%rbx), %r12
00000000000f660c	testq	%r12, %r12
00000000000f660f	jne	0xf6645
00000000000f6611	movl	$0x1a0, %edi                    ## imm = 0x1A0
00000000000f6616	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
00000000000f661b	movq	%rax, %r12
00000000000f661e	movl	$0x1a0, %esi                    ## imm = 0x1A0
00000000000f6623	movq	%rax, %rdi
00000000000f6626	callq	0x3c4fca                        ## symbol stub for: ___bzero
00000000000f662b	movq	%r12, %rdi
00000000000f662e	callq	__ZN32HgcColorGamma_chroma_upsample_f1C2Ev ## HgcColorGamma_chroma_upsample_f1::HgcColorGamma_chroma_upsample_f1()
00000000000f6633	leaq	0x91eb0e(%rip), %rax
00000000000f663a	movq	%rax, (%r12)
00000000000f663e	movq	%r12, 0x258(%rbx)
00000000000f6645	movq	(%r12), %rax
00000000000f6649	movq	0x78(%rax), %rax
00000000000f664d	movq	%r12, %rdi
00000000000f6650	xorl	%esi, %esi
00000000000f6652	testq	%r13, %r13
00000000000f6655	je	0xf69b1
00000000000f665b	movq	%r13, %rdx
00000000000f665e	callq	*%rax
00000000000f6660	jmp	0xf69be
00000000000f6665	movq	%r13, %r12
00000000000f6668	movss	0x2d1650(%rip), %xmm1
00000000000f6670	movaps	0x380(%rbx), %xmm0
00000000000f6677	cmpneqps	%xmm1, %xmm0
00000000000f667b	movaps	0x390(%rbx), %xmm1
00000000000f6682	cmpneqps	0x2d1626(%rip), %xmm1
00000000000f668a	orps	%xmm0, %xmm1
00000000000f668d	movaps	0x3a0(%rbx), %xmm0
00000000000f6694	cmpneqps	0x2d43d4(%rip), %xmm0
00000000000f669c	movaps	0x3b0(%rbx), %xmm2
00000000000f66a3	cmpneqps	0x2d3935(%rip), %xmm2
00000000000f66ab	orps	%xmm0, %xmm2
00000000000f66ae	orps	%xmm1, %xmm2
00000000000f66b1	movmskps	%xmm2, %eax
00000000000f66b4	testl	%eax, %eax
00000000000f66b6	je	0xf66c1
00000000000f66b8	movaps	0x2d1581(%rip), %xmm2
00000000000f66bf	jmp	0xf66c8
00000000000f66c1	movaps	0x430(%rbx), %xmm2
00000000000f66c8	movaps	0x450(%rbx), %xmm3
00000000000f66cf	mulps	%xmm2, %xmm3
00000000000f66d2	xorps	%xmm0, %xmm0
00000000000f66d5	cmpneqps	%xmm3, %xmm0
00000000000f66d9	movaps	0x2d1560(%rip), %xmm1
00000000000f66e0	cmpneqps	%xmm2, %xmm1
00000000000f66e4	orps	%xmm0, %xmm1
00000000000f66e7	movmskps	%xmm1, %eax
00000000000f66ea	testl	%eax, %eax
00000000000f66ec	je	0xf6881
00000000000f66f2	movq	0x210(%rbx), %r15
00000000000f66f9	testq	%r12, %r12
00000000000f66fc	movaps	%xmm2, -0x60(%rbp)
00000000000f6700	movaps	%xmm3, -0x80(%rbp)
00000000000f6704	je	0xf6710
00000000000f6706	testq	%r15, %r15
00000000000f6709	je	0xf6721
00000000000f670b	movq	(%r15), %rax
00000000000f670e	jmp	0xf6754
00000000000f6710	testq	%r15, %r15
00000000000f6713	je	0xf67a8
00000000000f6719	movq	(%r15), %rax
00000000000f671c	jmp	0xf67db
00000000000f6721	movl	$0x1a0, %edi                    ## imm = 0x1A0
00000000000f6726	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
00000000000f672b	movq	%rax, %r15
00000000000f672e	movl	$0x1a0, %esi                    ## imm = 0x1A0
00000000000f6733	movq	%rax, %rdi
00000000000f6736	callq	0x3c4fca                        ## symbol stub for: ___bzero
00000000000f673b	movq	%r15, %rdi
00000000000f673e	callq	__ZN18HgcColorGamma_biasC2Ev    ## HgcColorGamma_bias::HgcColorGamma_bias()
00000000000f6743	leaq	0x91e54e(%rip), %rax
00000000000f674a	movq	%rax, (%r15)
00000000000f674d	movq	%r15, 0x210(%rbx)
00000000000f6754	movq	%r15, %rdi
00000000000f6757	xorl	%esi, %esi
00000000000f6759	movq	%r12, %rdx
00000000000f675c	callq	*0x78(%rax)
00000000000f675f	movq	0x210(%rbx), %r12
00000000000f6766	testq	%r12, %r12
00000000000f6769	jne	0xf682e
00000000000f676f	movl	$0x1a0, %edi                    ## imm = 0x1A0
00000000000f6774	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
00000000000f6779	movq	%rax, %r12
00000000000f677c	movl	$0x1a0, %esi                    ## imm = 0x1A0
00000000000f6781	movq	%rax, %rdi
00000000000f6784	callq	0x3c4fca                        ## symbol stub for: ___bzero
00000000000f6789	movq	%r12, %rdi
00000000000f678c	callq	__ZN18HgcColorGamma_biasC2Ev    ## HgcColorGamma_bias::HgcColorGamma_bias()
00000000000f6791	leaq	0x91e500(%rip), %rax
00000000000f6798	movq	%rax, (%r12)
00000000000f679c	movq	%r12, 0x210(%rbx)
00000000000f67a3	jmp	0xf6832
00000000000f67a8	movl	$0x1a0, %edi                    ## imm = 0x1A0
00000000000f67ad	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
00000000000f67b2	movq	%rax, %r15
00000000000f67b5	movl	$0x1a0, %esi                    ## imm = 0x1A0
00000000000f67ba	movq	%rax, %rdi
00000000000f67bd	callq	0x3c4fca                        ## symbol stub for: ___bzero
00000000000f67c2	movq	%r15, %rdi
00000000000f67c5	callq	__ZN18HgcColorGamma_biasC2Ev    ## HgcColorGamma_bias::HgcColorGamma_bias()
00000000000f67ca	leaq	0x91e4c7(%rip), %rax
00000000000f67d1	movq	%rax, (%r15)
00000000000f67d4	movq	%r15, 0x210(%rbx)
00000000000f67db	movq	%r15, %rdi
00000000000f67de	xorl	%esi, %esi
00000000000f67e0	movq	-0x40(%rbp), %rdx
00000000000f67e4	callq	*0x78(%rax)
00000000000f67e7	movq	0x210(%rbx), %r12
00000000000f67ee	testq	%r12, %r12
00000000000f67f1	jne	0xf6827
00000000000f67f3	movl	$0x1a0, %edi                    ## imm = 0x1A0
00000000000f67f8	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
00000000000f67fd	movq	%rax, %r12
00000000000f6800	movl	$0x1a0, %esi                    ## imm = 0x1A0
00000000000f6805	movq	%rax, %rdi
00000000000f6808	callq	0x3c4fca                        ## symbol stub for: ___bzero
00000000000f680d	movq	%r12, %rdi
00000000000f6810	callq	__ZN18HgcColorGamma_biasC2Ev    ## HgcColorGamma_bias::HgcColorGamma_bias()
00000000000f6815	leaq	0x91e47c(%rip), %rax
00000000000f681c	movq	%rax, (%r12)
00000000000f6820	movq	%r12, 0x210(%rbx)
00000000000f6827	movq	%r12, 0x2f0(%rbx)
00000000000f682e	movq	(%r12), %rax
00000000000f6832	movaps	-0x80(%rbp), %xmm2
00000000000f6836	movaps	0x2d3893(%rip), %xmm3
00000000000f683d	movaps	%xmm2, %xmm0
00000000000f6840	xorps	%xmm3, %xmm0
00000000000f6843	movshdup	%xmm2, %xmm1                    ## xmm1 = xmm2[1,1,3,3]
00000000000f6847	xorps	%xmm3, %xmm1
00000000000f684a	movhlps	%xmm2, %xmm2                    ## xmm2 = xmm2[1,1]
00000000000f684d	xorps	%xmm3, %xmm2
00000000000f6850	xorps	%xmm3, %xmm3
00000000000f6853	movq	%r12, %rdi
00000000000f6856	xorl	%esi, %esi
00000000000f6858	callq	*0x60(%rax)
00000000000f685b	movaps	-0x60(%rbp), %xmm0
00000000000f685f	movshdup	%xmm0, %xmm1                    ## xmm1 = xmm0[1,1,3,3]
00000000000f6863	movaps	%xmm0, %xmm2
00000000000f6866	unpckhpd	%xmm0, %xmm2                    ## xmm2 = xmm2[1],xmm0[1]
00000000000f686a	movq	(%r12), %rax
00000000000f686e	movss	0x2d144a(%rip), %xmm3
00000000000f6876	movq	%r12, %rdi
00000000000f6879	movl	$0x1, %esi
00000000000f687e	callq	*0x60(%rax)
00000000000f6881	movq	%r14, -0x60(%rbp)
00000000000f6885	cmpb	$0x0, -0x70(%rbp)
00000000000f6889	je	0xf6909
00000000000f688b	movb	$0x1, %r14b
00000000000f688e	cmpb	$0x0, 0x402(%rbx)
00000000000f6895	jne	0xf6961
00000000000f689b	cmpl	$0x1, 0x40c(%rbx)
00000000000f68a2	jne	0xf6961
00000000000f68a8	movq	0x258(%rbx), %r15
00000000000f68af	testq	%r15, %r15
00000000000f68b2	jne	0xf68e7
00000000000f68b4	movl	$0x1a0, %edi                    ## imm = 0x1A0
00000000000f68b9	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
00000000000f68be	movq	%rax, %r15
00000000000f68c1	movl	$0x1a0, %esi                    ## imm = 0x1A0
00000000000f68c6	movq	%rax, %rdi
00000000000f68c9	callq	0x3c4fca                        ## symbol stub for: ___bzero
00000000000f68ce	movq	%r15, %rdi
00000000000f68d1	callq	__ZN32HgcColorGamma_chroma_upsample_f1C2Ev ## HgcColorGamma_chroma_upsample_f1::HgcColorGamma_chroma_upsample_f1()
00000000000f68d6	leaq	0x91e86b(%rip), %rax
00000000000f68dd	movq	%rax, (%r15)
00000000000f68e0	movq	%r15, 0x258(%rbx)
00000000000f68e7	movq	(%r15), %rax
00000000000f68ea	movq	0x78(%rax), %rax
00000000000f68ee	xorl	%r13d, %r13d
00000000000f68f1	movq	%r15, %rdi
00000000000f68f4	xorl	%esi, %esi
00000000000f68f6	testq	%r12, %r12
00000000000f68f9	je	0xf69ce
00000000000f68ff	movq	%r12, %rdx
00000000000f6902	callq	*%rax
00000000000f6904	movb	$0x1, %r14b
00000000000f6907	jmp	0xf696c
00000000000f6909	movb	$0x1, %r14b
00000000000f690c	cmpb	$0x1, 0x494(%rbx)
00000000000f6913	jne	0xf6961
00000000000f6915	movq	-0x30(%rbp), %rax
00000000000f6919	testb	%al, 0x495(%rbx)
00000000000f691f	jne	0xf6961
00000000000f6921	movq	%rbx, %rdi
00000000000f6924	callq	__ZN12HGColorGamma22m_GetUnpremultiplyNodeEv ## HGColorGamma::m_GetUnpremultiplyNode()
00000000000f6929	testq	%rax, %rax
00000000000f692c	je	0xf6961
00000000000f692e	movq	%rax, %r13
00000000000f6931	cmpb	$0x1, 0x496(%rbx)
00000000000f6938	jne	0xf69e0
00000000000f693e	movq	(%r13), %rax
00000000000f6942	movq	0x78(%rax), %rax
00000000000f6946	xorl	%r14d, %r14d
00000000000f6949	movq	%r13, %rdi
00000000000f694c	xorl	%esi, %esi
00000000000f694e	testq	%r12, %r12
00000000000f6951	je	0xf736f
00000000000f6957	movq	%r12, %rdx
00000000000f695a	callq	*%rax
00000000000f695c	jmp	0xf737c
00000000000f6961	xorl	%r13d, %r13d
00000000000f6964	testq	%r12, %r12
00000000000f6967	je	0xf69e8
00000000000f6969	movq	%r12, %r15
00000000000f696c	movq	0x1a8(%rbx), %r12
00000000000f6973	testq	%r12, %r12
00000000000f6976	jne	0xf6994
00000000000f6978	movl	$0x1f0, %edi                    ## imm = 0x1F0
00000000000f697d	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
00000000000f6982	movq	%rax, %r12
00000000000f6985	movq	%rax, %rdi
00000000000f6988	callq	__ZN13HGColorMatrixC1Ev         ## HGColorMatrix::HGColorMatrix()
00000000000f698d	movq	%r12, 0x1a8(%rbx)
00000000000f6994	movq	(%r12), %rax
00000000000f6998	movq	%r12, %rdi
00000000000f699b	xorl	%esi, %esi
00000000000f699d	movq	%r15, %rdx
00000000000f69a0	callq	*0x78(%rax)
00000000000f69a3	testb	%r14b, %r14b
00000000000f69a6	je	0xf6a61
00000000000f69ac	jmp	0xf6a6e
00000000000f69b1	movq	-0x40(%rbp), %rdx
00000000000f69b5	callq	*%rax
00000000000f69b7	movq	%r12, 0x2f0(%rbx)
00000000000f69be	movq	%r12, %rdi
00000000000f69c1	movl	-0x60(%rbp), %esi
00000000000f69c4	callq	__ZN6HGNode28SetSupportedFormatPrecisionsEj ## HGNode::SetSupportedFormatPrecisions(unsigned int)
00000000000f69c9	jmp	0xf6668
00000000000f69ce	movq	-0x40(%rbp), %rdx
00000000000f69d2	callq	*%rax
00000000000f69d4	movq	%r15, 0x2f0(%rbx)
00000000000f69db	movb	$0x1, %r14b
00000000000f69de	jmp	0xf696c
00000000000f69e0	xorl	%r14d, %r14d
00000000000f69e3	testq	%r12, %r12
00000000000f69e6	jne	0xf6969
00000000000f69e8	movq	0x1a8(%rbx), %r15
00000000000f69ef	testq	%r15, %r15
00000000000f69f2	jne	0xf6a10
00000000000f69f4	movl	$0x1f0, %edi                    ## imm = 0x1F0
00000000000f69f9	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
00000000000f69fe	movq	%rax, %r15
00000000000f6a01	movq	%rax, %rdi
00000000000f6a04	callq	__ZN13HGColorMatrixC1Ev         ## HGColorMatrix::HGColorMatrix()
00000000000f6a09	movq	%r15, 0x1a8(%rbx)
00000000000f6a10	movq	(%r15), %rax
00000000000f6a13	movq	%r15, %rdi
00000000000f6a16	xorl	%esi, %esi
00000000000f6a18	movq	-0x40(%rbp), %rdx
00000000000f6a1c	callq	*0x78(%rax)
00000000000f6a1f	movq	0x1a8(%rbx), %r15
00000000000f6a26	testq	%r15, %r15
00000000000f6a29	je	0xf6a39
00000000000f6a2b	movq	%r15, 0x2f0(%rbx)
00000000000f6a32	testb	%r14b, %r14b
00000000000f6a35	je	0xf6a61
00000000000f6a37	jmp	0xf6a6e
00000000000f6a39	movl	$0x1f0, %edi                    ## imm = 0x1F0
00000000000f6a3e	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
00000000000f6a43	movq	%rax, %r15
00000000000f6a46	movq	%rax, %rdi
00000000000f6a49	callq	__ZN13HGColorMatrixC1Ev         ## HGColorMatrix::HGColorMatrix()
00000000000f6a4e	movq	%r15, 0x1a8(%rbx)
00000000000f6a55	movq	%r15, 0x2f0(%rbx)
00000000000f6a5c	testb	%r14b, %r14b
00000000000f6a5f	jne	0xf6a6e
00000000000f6a61	cmpb	$0x0, 0x496(%rbx)
00000000000f6a68	je	0xf6c2d
00000000000f6a6e	movq	0x1a8(%rbx), %r13
00000000000f6a75	testq	%r13, %r13
00000000000f6a78	movq	-0x60(%rbp), %r14
00000000000f6a7c	je	0xf6b8b
00000000000f6a82	testq	%r14, %r14
00000000000f6a85	je	0xf6bb0
00000000000f6a8b	movq	(%r14), %rax
00000000000f6a8e	movq	%r14, %rdi
00000000000f6a91	xorl	%esi, %esi
00000000000f6a93	movq	%r13, %rdx
00000000000f6a96	callq	*0x78(%rax)
00000000000f6a99	movq	0x1b0(%rbx), %r15
00000000000f6aa0	testq	%r15, %r15
00000000000f6aa3	jne	0xf6ac1
00000000000f6aa5	movl	$0x1f0, %edi                    ## imm = 0x1F0
00000000000f6aaa	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
00000000000f6aaf	movq	%rax, %r15
00000000000f6ab2	movq	%rax, %rdi
00000000000f6ab5	callq	__ZN13HGColorMatrixC1Ev         ## HGColorMatrix::HGColorMatrix()
00000000000f6aba	movq	%r15, 0x1b0(%rbx)
00000000000f6ac1	movq	(%r15), %rax
00000000000f6ac4	movq	%r15, %rdi
00000000000f6ac7	xorl	%esi, %esi
00000000000f6ac9	movq	%r14, %rdx
00000000000f6acc	callq	*0x78(%rax)
00000000000f6acf	movq	0x1b0(%rbx), %r14
00000000000f6ad6	testq	%r14, %r14
00000000000f6ad9	je	0xf6bf6
00000000000f6adf	movl	0x428(%rbx), %eax
00000000000f6ae5	movl	$0x1, %r12d
00000000000f6aeb	cmpq	$0x1c, %rax
00000000000f6aef	ja	0xf6afc
00000000000f6af1	leaq	0x2da138(%rip), %rcx
00000000000f6af8	movl	(%rcx,%rax,4), %r12d
00000000000f6afc	cmpb	$0x0, -0x70(%rbp)
00000000000f6b00	jne	0xf6cd8
00000000000f6b06	movzbl	0x495(%rbx), %eax
00000000000f6b0d	cmpb	$0x0, 0x494(%rbx)
00000000000f6b14	je	0xf6c76
00000000000f6b1a	testb	%al, %al
00000000000f6b1c	sete	%al
00000000000f6b1f	movq	-0x30(%rbp), %rcx
00000000000f6b23	orb	%al, %cl
00000000000f6b25	jne	0xf6cd8
00000000000f6b2b	movq	0x240(%rbx), %r15
00000000000f6b32	testq	%r15, %r15
00000000000f6b35	jne	0xf6b53
00000000000f6b37	movl	$0x1a0, %edi                    ## imm = 0x1A0
00000000000f6b3c	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
00000000000f6b41	movq	%rax, %r15
00000000000f6b44	movq	%rax, %rdi
00000000000f6b47	callq	__ZN14HgcPremultiplyC1Ev        ## HgcPremultiply::HgcPremultiply()
00000000000f6b4c	movq	%r15, 0x240(%rbx)
00000000000f6b53	movq	(%r15), %rax
00000000000f6b56	movq	%r15, %rdi
00000000000f6b59	xorl	%esi, %esi
00000000000f6b5b	movq	%r14, %rdx
00000000000f6b5e	callq	*0x78(%rax)
00000000000f6b61	movq	0x240(%rbx), %r14
00000000000f6b68	testq	%r14, %r14
00000000000f6b6b	jne	0xf6cd8
00000000000f6b71	movl	$0x1a0, %edi                    ## imm = 0x1A0
00000000000f6b76	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
00000000000f6b7b	movq	%rax, %r14
00000000000f6b7e	movq	%rax, %rdi
00000000000f6b81	callq	__ZN14HgcPremultiplyC1Ev        ## HgcPremultiply::HgcPremultiply()
00000000000f6b86	jmp	0xf6cd1
00000000000f6b8b	movl	$0x1f0, %edi                    ## imm = 0x1F0
00000000000f6b90	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
00000000000f6b95	movq	%rax, %r13
00000000000f6b98	movq	%rax, %rdi
00000000000f6b9b	callq	__ZN13HGColorMatrixC1Ev         ## HGColorMatrix::HGColorMatrix()
00000000000f6ba0	movq	%r13, 0x1a8(%rbx)
00000000000f6ba7	testq	%r14, %r14
00000000000f6baa	jne	0xf6a8b
00000000000f6bb0	movq	0x1b0(%rbx), %r14
00000000000f6bb7	testq	%r14, %r14
00000000000f6bba	jne	0xf6bd8
00000000000f6bbc	movl	$0x1f0, %edi                    ## imm = 0x1F0
00000000000f6bc1	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
00000000000f6bc6	movq	%rax, %r14
00000000000f6bc9	movq	%rax, %rdi
00000000000f6bcc	callq	__ZN13HGColorMatrixC1Ev         ## HGColorMatrix::HGColorMatrix()
00000000000f6bd1	movq	%r14, 0x1b0(%rbx)
00000000000f6bd8	movq	(%r14), %rax
00000000000f6bdb	movq	%r14, %rdi
00000000000f6bde	xorl	%esi, %esi
00000000000f6be0	movq	%r13, %rdx
00000000000f6be3	callq	*0x78(%rax)
00000000000f6be6	movq	0x1b0(%rbx), %r14
00000000000f6bed	testq	%r14, %r14
00000000000f6bf0	jne	0xf6adf
00000000000f6bf6	movl	$0x1f0, %edi                    ## imm = 0x1F0
00000000000f6bfb	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
00000000000f6c00	movq	%rax, %r14
00000000000f6c03	movq	%rax, %rdi
00000000000f6c06	callq	__ZN13HGColorMatrixC1Ev         ## HGColorMatrix::HGColorMatrix()
00000000000f6c0b	movq	%r14, 0x1b0(%rbx)
00000000000f6c12	movl	0x428(%rbx), %eax
00000000000f6c18	movl	$0x1, %r12d
00000000000f6c1e	cmpq	$0x1c, %rax
00000000000f6c22	jbe	0xf6af1
00000000000f6c28	jmp	0xf6afc
00000000000f6c2d	movq	0x1a8(%rbx), %r15
00000000000f6c34	testq	%r15, %r15
00000000000f6c37	movq	-0x60(%rbp), %r14
00000000000f6c3b	jne	0xf6c59
00000000000f6c3d	movl	$0x1f0, %edi                    ## imm = 0x1F0
00000000000f6c42	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
00000000000f6c47	movq	%rax, %r15
00000000000f6c4a	movq	%rax, %rdi
00000000000f6c4d	callq	__ZN13HGColorMatrixC1Ev         ## HGColorMatrix::HGColorMatrix()
00000000000f6c52	movq	%r15, 0x1a8(%rbx)
00000000000f6c59	movq	(%r13), %rax
00000000000f6c5d	movq	%r13, %rdi
00000000000f6c60	xorl	%esi, %esi
00000000000f6c62	movq	%r15, %rdx
00000000000f6c65	callq	*0x78(%rax)
00000000000f6c68	testq	%r14, %r14
00000000000f6c6b	jne	0xf6a8b
00000000000f6c71	jmp	0xf6bb0
00000000000f6c76	testb	%al, %al
00000000000f6c78	je	0xf6cd8
00000000000f6c7a	movq	0x240(%rbx), %r15
00000000000f6c81	testq	%r15, %r15
00000000000f6c84	jne	0xf6ca2
00000000000f6c86	movl	$0x1a0, %edi                    ## imm = 0x1A0
00000000000f6c8b	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
00000000000f6c90	movq	%rax, %r15
00000000000f6c93	movq	%rax, %rdi
00000000000f6c96	callq	__ZN14HgcPremultiplyC1Ev        ## HgcPremultiply::HgcPremultiply()
00000000000f6c9b	movq	%r15, 0x240(%rbx)
00000000000f6ca2	movq	(%r15), %rax
00000000000f6ca5	movq	%r15, %rdi
00000000000f6ca8	xorl	%esi, %esi
00000000000f6caa	movq	%r14, %rdx
00000000000f6cad	callq	*0x78(%rax)
00000000000f6cb0	movq	0x240(%rbx), %r14
00000000000f6cb7	testq	%r14, %r14
00000000000f6cba	jne	0xf6cd8
00000000000f6cbc	movl	$0x1a0, %edi                    ## imm = 0x1A0
00000000000f6cc1	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
00000000000f6cc6	movq	%rax, %r14
00000000000f6cc9	movq	%rax, %rdi
00000000000f6ccc	callq	__ZN14HgcPremultiplyC1Ev        ## HgcPremultiply::HgcPremultiply()
00000000000f6cd1	movq	%r14, 0x240(%rbx)
00000000000f6cd8	movss	0x2d0fe0(%rip), %xmm1
00000000000f6ce0	cmpneqps	0x3c0(%rbx), %xmm1
00000000000f6ce8	movsd	0x2d0fc0(%rip), %xmm0
00000000000f6cf0	cmpneqps	0x3d0(%rbx), %xmm0
00000000000f6cf8	orps	%xmm1, %xmm0
00000000000f6cfb	movaps	0x2d3d6e(%rip), %xmm1
00000000000f6d02	cmpneqps	0x3e0(%rbx), %xmm1
00000000000f6d0a	movaps	0x2d32cf(%rip), %xmm2
00000000000f6d11	cmpneqps	0x3f0(%rbx), %xmm2
00000000000f6d19	orps	%xmm1, %xmm2
00000000000f6d1c	orps	%xmm0, %xmm2
00000000000f6d1f	movmskps	%xmm2, %eax
00000000000f6d22	testl	%eax, %eax
00000000000f6d24	je	0xf6d2f
00000000000f6d26	movaps	0x2d0f13(%rip), %xmm2
00000000000f6d2d	jmp	0xf6d36
00000000000f6d2f	movaps	0x440(%rbx), %xmm2
00000000000f6d36	movaps	0x460(%rbx), %xmm3
00000000000f6d3d	xorps	%xmm0, %xmm0
00000000000f6d40	cmpneqps	%xmm3, %xmm0
00000000000f6d44	movaps	0x2d0ef5(%rip), %xmm1
00000000000f6d4b	cmpneqps	%xmm2, %xmm1
00000000000f6d4f	orps	%xmm0, %xmm1
00000000000f6d52	movmskps	%xmm1, %eax
00000000000f6d55	testl	%eax, %eax
00000000000f6d57	je	0xf6e61
00000000000f6d5d	movaps	%xmm2, -0x70(%rbp)
00000000000f6d61	movq	0x220(%rbx), %r15
00000000000f6d68	testq	%r15, %r15
00000000000f6d6b	movaps	%xmm3, -0x60(%rbp)
00000000000f6d6f	je	0xf6d76
00000000000f6d71	movq	(%r15), %rax
00000000000f6d74	jmp	0xf6da9
00000000000f6d76	movl	$0x1a0, %edi                    ## imm = 0x1A0
00000000000f6d7b	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
00000000000f6d80	movq	%rax, %r15
00000000000f6d83	movl	$0x1a0, %esi                    ## imm = 0x1A0
00000000000f6d88	movq	%rax, %rdi
00000000000f6d8b	callq	0x3c4fca                        ## symbol stub for: ___bzero
00000000000f6d90	movq	%r15, %rdi
00000000000f6d93	callq	__ZN18HgcColorGamma_biasC2Ev    ## HgcColorGamma_bias::HgcColorGamma_bias()
00000000000f6d98	leaq	0x91def9(%rip), %rax
00000000000f6d9f	movq	%rax, (%r15)
00000000000f6da2	movq	%r15, 0x220(%rbx)
00000000000f6da9	movq	%r15, %rdi
00000000000f6dac	xorl	%esi, %esi
00000000000f6dae	movq	%r14, %rdx
00000000000f6db1	callq	*0x78(%rax)
00000000000f6db4	movq	0x220(%rbx), %r14
00000000000f6dbb	testq	%r14, %r14
00000000000f6dbe	je	0xf6dc5
00000000000f6dc0	movq	(%r14), %rax
00000000000f6dc3	jmp	0xf6df8
00000000000f6dc5	movl	$0x1a0, %edi                    ## imm = 0x1A0
00000000000f6dca	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
00000000000f6dcf	movq	%rax, %r14
00000000000f6dd2	movl	$0x1a0, %esi                    ## imm = 0x1A0
00000000000f6dd7	movq	%rax, %rdi
00000000000f6dda	callq	0x3c4fca                        ## symbol stub for: ___bzero
00000000000f6ddf	movq	%r14, %rdi
00000000000f6de2	callq	__ZN18HgcColorGamma_biasC2Ev    ## HgcColorGamma_bias::HgcColorGamma_bias()
00000000000f6de7	leaq	0x91deaa(%rip), %rax
00000000000f6dee	movq	%rax, (%r14)
00000000000f6df1	movq	%r14, 0x220(%rbx)
00000000000f6df8	movaps	-0x60(%rbp), %xmm3
00000000000f6dfc	movaps	0x2d32cd(%rip), %xmm4
00000000000f6e03	movaps	%xmm3, %xmm0
00000000000f6e06	xorps	%xmm4, %xmm0
00000000000f6e09	movshdup	%xmm3, %xmm1                    ## xmm1 = xmm3[1,1,3,3]
00000000000f6e0d	xorps	%xmm4, %xmm1
00000000000f6e10	movaps	%xmm3, %xmm2
00000000000f6e13	unpckhpd	%xmm3, %xmm2                    ## xmm2 = xmm2[1],xmm3[1]
00000000000f6e17	xorps	%xmm4, %xmm2
00000000000f6e1a	shufps	$0xff, %xmm3, %xmm3             ## xmm3 = xmm3[3,3,3,3]
00000000000f6e1e	xorps	%xmm4, %xmm3
00000000000f6e21	movq	%r14, %rdi
00000000000f6e24	xorl	%esi, %esi
00000000000f6e26	callq	*0x60(%rax)
00000000000f6e29	movaps	-0x70(%rbp), %xmm0
00000000000f6e2d	movshdup	%xmm0, %xmm1                    ## xmm1 = xmm0[1,1,3,3]
00000000000f6e31	movaps	%xmm0, %xmm2
00000000000f6e34	unpckhpd	%xmm0, %xmm2                    ## xmm2 = xmm2[1],xmm0[1]
00000000000f6e38	movaps	%xmm0, %xmm3
00000000000f6e3b	shufps	$0xff, %xmm0, %xmm3             ## xmm3 = xmm3[3,3],xmm0[3,3]
00000000000f6e3f	movq	(%r14), %rax
00000000000f6e42	movq	%r14, %rdi
00000000000f6e45	movl	$0x1, %esi
00000000000f6e4a	callq	*0x60(%rax)
00000000000f6e4d	cmpb	$0x1, 0x402(%rbx)
00000000000f6e54	jne	0xf6e61
00000000000f6e56	movq	%r14, %rdi
00000000000f6e59	movl	%r12d, %esi
00000000000f6e5c	callq	__ZN6HGNode28SetSupportedFormatPrecisionsEj ## HGNode::SetSupportedFormatPrecisions(unsigned int)
00000000000f6e61	cmpb	$0x1, 0x401(%rbx)
00000000000f6e68	jne	0xf6f1f
00000000000f6e6e	movq	0x2e0(%rbx), %r15
00000000000f6e75	testq	%r15, %r15
00000000000f6e78	jne	0xf6e96
00000000000f6e7a	movl	$0x1d0, %edi                    ## imm = 0x1D0
00000000000f6e7f	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
00000000000f6e84	movq	%rax, %r15
00000000000f6e87	movq	%rax, %rdi
00000000000f6e8a	callq	__ZN8HGDitherC1Ev               ## HGDither::HGDither()
00000000000f6e8f	movq	%r15, 0x2e0(%rbx)
00000000000f6e96	movq	(%r15), %rax
00000000000f6e99	xorps	%xmm0, %xmm0
00000000000f6e9c	xorps	%xmm1, %xmm1
00000000000f6e9f	xorps	%xmm2, %xmm2
00000000000f6ea2	xorps	%xmm3, %xmm3
00000000000f6ea5	movq	%r15, %rdi
00000000000f6ea8	xorl	%esi, %esi
00000000000f6eaa	callq	*0x60(%rax)
00000000000f6ead	movq	0x2e0(%rbx), %r15
00000000000f6eb4	testq	%r15, %r15
00000000000f6eb7	jne	0xf6ed5
00000000000f6eb9	movl	$0x1d0, %edi                    ## imm = 0x1D0
00000000000f6ebe	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
00000000000f6ec3	movq	%rax, %r15
00000000000f6ec6	movq	%rax, %rdi
00000000000f6ec9	callq	__ZN8HGDitherC1Ev               ## HGDither::HGDither()
00000000000f6ece	movq	%r15, 0x2e0(%rbx)
00000000000f6ed5	movq	(%r15), %rax
00000000000f6ed8	movq	%r15, %rdi
00000000000f6edb	xorl	%esi, %esi
00000000000f6edd	movq	%r14, %rdx
00000000000f6ee0	callq	*0x78(%rax)
00000000000f6ee3	movq	0x2e0(%rbx), %r14
00000000000f6eea	testq	%r14, %r14
00000000000f6eed	jne	0xf6f0b
00000000000f6eef	movl	$0x1d0, %edi                    ## imm = 0x1D0
00000000000f6ef4	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
00000000000f6ef9	movq	%rax, %r14
00000000000f6efc	movq	%rax, %rdi
00000000000f6eff	callq	__ZN8HGDitherC1Ev               ## HGDither::HGDither()
00000000000f6f04	movq	%r14, 0x2e0(%rbx)
00000000000f6f0b	cmpb	$0x1, 0x402(%rbx)
00000000000f6f12	jne	0xf6f1f
00000000000f6f14	movq	%r14, %rdi
00000000000f6f17	movl	%r12d, %esi
00000000000f6f1a	callq	__ZN6HGNode28SetSupportedFormatPrecisionsEj ## HGNode::SetSupportedFormatPrecisions(unsigned int)
00000000000f6f1f	movl	0x420(%rbx), %eax
00000000000f6f25	addl	$-0xe, %eax
00000000000f6f28	cmpl	$0x13, %eax
00000000000f6f2b	ja	0xf7353
00000000000f6f31	leaq	0x578(%rip), %rcx
00000000000f6f38	movslq	(%rcx,%rax,4), %rax
00000000000f6f3c	addq	%rcx, %rax
00000000000f6f3f	jmpq	*%rax
00000000000f6f41	cmpl	$0x1, 0x428(%rbx)
00000000000f6f48	je	0xf6fa2
00000000000f6f4a	jmp	0xf7353
00000000000f6f4f	cmpl	$0x3, 0x428(%rbx)
00000000000f6f56	je	0xf6fa2
00000000000f6f58	jmp	0xf7353
00000000000f6f5d	movq	-0x38(%rbp), %rdi
00000000000f6f61	movq	(%rdi), %rax
00000000000f6f64	callq	*0x130(%rax)
00000000000f6f6a	testb	%al, %al
00000000000f6f6c	jne	0xf7353
00000000000f6f72	movq	%rbx, %rdi
00000000000f6f75	callq	__ZN12HGColorGamma47m_GetPixelFormatConversion_kV4F_WXYZ_OutputNodeEv ## HGColorGamma::m_GetPixelFormatConversion_kV4F_WXYZ_OutputNode()
00000000000f6f7a	movq	(%rax), %rcx
00000000000f6f7d	movq	%rax, %rdi
00000000000f6f80	xorl	%esi, %esi
00000000000f6f82	movq	%r14, %rdx
00000000000f6f85	callq	*0x78(%rcx)
00000000000f6f88	movq	%rbx, %rdi
00000000000f6f8b	callq	__ZN12HGColorGamma47m_GetPixelFormatConversion_kV4F_WXYZ_OutputNodeEv ## HGColorGamma::m_GetPixelFormatConversion_kV4F_WXYZ_OutputNode()
00000000000f6f90	jmp	0xf717b
00000000000f6f95	cmpl	$0x2, 0x428(%rbx)
00000000000f6f9c	jne	0xf7353
00000000000f6fa2	cmpl	$0x1, 0x40c(%rbx)
00000000000f6fa9	jne	0xf7214
00000000000f6faf	movq	0x410(%rbx), %rdi
00000000000f6fb6	movq	0x418(%rbx), %rsi
00000000000f6fbd	callq	_HGRectIsInfinite
00000000000f6fc2	testl	%eax, %eax
00000000000f6fc4	jne	0xf708e
00000000000f6fca	movq	0x2d0(%rbx), %r15
00000000000f6fd1	testq	%r15, %r15
00000000000f6fd4	jne	0xf6ff2
00000000000f6fd6	movl	$0x1a0, %edi                    ## imm = 0x1A0
00000000000f6fdb	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
00000000000f6fe0	movq	%rax, %r15
00000000000f6fe3	movq	%rax, %rdi
00000000000f6fe6	callq	__ZN6HGCropC1Ev                 ## HGCrop::HGCrop()
00000000000f6feb	movq	%r15, 0x2d0(%rbx)
00000000000f6ff2	xorps	%xmm0, %xmm0
00000000000f6ff5	cvtsi2ssl	0x410(%rbx), %xmm0
00000000000f6ffd	xorps	%xmm1, %xmm1
00000000000f7000	cvtsi2ssl	0x414(%rbx), %xmm1
00000000000f7008	xorps	%xmm2, %xmm2
00000000000f700b	cvtsi2ssl	0x418(%rbx), %xmm2
00000000000f7013	xorps	%xmm3, %xmm3
00000000000f7016	cvtsi2ssl	0x41c(%rbx), %xmm3
00000000000f701e	movq	(%r15), %rax
00000000000f7021	movq	%r15, %rdi
00000000000f7024	xorl	%esi, %esi
00000000000f7026	callq	*0x60(%rax)
00000000000f7029	movq	(%r15), %rax
00000000000f702c	movq	%r15, %rdi
00000000000f702f	xorl	%esi, %esi
00000000000f7031	movq	%r14, %rdx
00000000000f7034	callq	*0x78(%rax)
00000000000f7037	movq	0x2d8(%rbx), %r14
00000000000f703e	testq	%r14, %r14
00000000000f7041	jne	0xf705f
00000000000f7043	movl	$0x1d0, %edi                    ## imm = 0x1D0
00000000000f7048	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
00000000000f704d	movq	%rax, %r14
00000000000f7050	movq	%rax, %rdi
00000000000f7053	callq	__ZN13HGTextureWrapC1Ev         ## HGTextureWrap::HGTextureWrap()
00000000000f7058	movq	%r14, 0x2d8(%rbx)
00000000000f705f	movq	%r14, %rdi
00000000000f7062	movl	$0x1, %esi
00000000000f7067	callq	__ZN13HGTextureWrap18SetTextureWrapModeENS_8WrapModeE ## HGTextureWrap::SetTextureWrapMode(HGTextureWrap::WrapMode)
00000000000f706c	movq	(%r14), %rax
00000000000f706f	movq	%r14, %rdi
00000000000f7072	xorl	%esi, %esi
00000000000f7074	movq	%r15, %rdx
00000000000f7077	callq	*0x78(%rax)
00000000000f707a	cmpb	$0x1, 0x402(%rbx)
00000000000f7081	jne	0xf708e
00000000000f7083	movq	%r14, %rdi
00000000000f7086	movl	%r12d, %esi
00000000000f7089	callq	__ZN6HGNode28SetSupportedFormatPrecisionsEj ## HGNode::SetSupportedFormatPrecisions(unsigned int)
00000000000f708e	movq	0x250(%rbx), %r15
00000000000f7095	testq	%r15, %r15
00000000000f7098	je	0xf7183
00000000000f709e	movq	(%r15), %rax
00000000000f70a1	jmp	0xf71b6
00000000000f70a6	movq	-0x38(%rbp), %rdi
00000000000f70aa	movq	(%rdi), %rax
00000000000f70ad	callq	*0x130(%rax)
00000000000f70b3	testb	%al, %al
00000000000f70b5	jne	0xf7353
00000000000f70bb	movq	%rbx, %rdi
00000000000f70be	callq	__ZN12HGColorGamma50m_GetPixelFormatConversion_kV4B10Bit_BE_OutputNodeEv ## HGColorGamma::m_GetPixelFormatConversion_kV4B10Bit_BE_OutputNode()
00000000000f70c3	movq	(%rax), %rcx
00000000000f70c6	movq	%rax, %rdi
00000000000f70c9	xorl	%esi, %esi
00000000000f70cb	movq	%r14, %rdx
00000000000f70ce	callq	*0x78(%rcx)
00000000000f70d1	movq	%rbx, %rdi
00000000000f70d4	callq	__ZN12HGColorGamma50m_GetPixelFormatConversion_kV4B10Bit_BE_OutputNodeEv ## HGColorGamma::m_GetPixelFormatConversion_kV4B10Bit_BE_OutputNode()
00000000000f70d9	jmp	0xf717b
00000000000f70de	movq	-0x38(%rbp), %rdi
00000000000f70e2	movq	(%rdi), %rax
00000000000f70e5	callq	*0x130(%rax)
00000000000f70eb	testb	%al, %al
00000000000f70ed	jne	0xf7353
00000000000f70f3	movq	%rbx, %rdi
00000000000f70f6	callq	__ZN12HGColorGamma47m_GetPixelFormatConversion_kV4B_WXYZ_OutputNodeEv ## HGColorGamma::m_GetPixelFormatConversion_kV4B_WXYZ_OutputNode()
00000000000f70fb	movq	(%rax), %rcx
00000000000f70fe	movq	%rax, %rdi
00000000000f7101	xorl	%esi, %esi
00000000000f7103	movq	%r14, %rdx
00000000000f7106	callq	*0x78(%rcx)
00000000000f7109	movq	%rbx, %rdi
00000000000f710c	callq	__ZN12HGColorGamma47m_GetPixelFormatConversion_kV4B_WXYZ_OutputNodeEv ## HGColorGamma::m_GetPixelFormatConversion_kV4B_WXYZ_OutputNode()
00000000000f7111	jmp	0xf717b
00000000000f7113	movq	-0x38(%rbp), %rdi
00000000000f7117	movq	(%rdi), %rax
00000000000f711a	callq	*0x130(%rax)
00000000000f7120	testb	%al, %al
00000000000f7122	jne	0xf7353
00000000000f7128	movq	%rbx, %rdi
00000000000f712b	callq	__ZN12HGColorGamma47m_GetPixelFormatConversion_kV4S_WXYZ_OutputNodeEv ## HGColorGamma::m_GetPixelFormatConversion_kV4S_WXYZ_OutputNode()
00000000000f7130	movq	(%rax), %rcx
00000000000f7133	movq	%rax, %rdi
00000000000f7136	xorl	%esi, %esi
00000000000f7138	movq	%r14, %rdx
00000000000f713b	callq	*0x78(%rcx)
00000000000f713e	movq	%rbx, %rdi
00000000000f7141	callq	__ZN12HGColorGamma47m_GetPixelFormatConversion_kV4S_WXYZ_OutputNodeEv ## HGColorGamma::m_GetPixelFormatConversion_kV4S_WXYZ_OutputNode()
00000000000f7146	jmp	0xf717b
00000000000f7148	movq	-0x38(%rbp), %rdi
00000000000f714c	movq	(%rdi), %rax
00000000000f714f	callq	*0x130(%rax)
00000000000f7155	testb	%al, %al
00000000000f7157	jne	0xf7353
00000000000f715d	movq	%rbx, %rdi
00000000000f7160	callq	__ZN12HGColorGamma50m_GetPixelFormatConversion_kV4S_BE_WXYZ_OutputNodeEv ## HGColorGamma::m_GetPixelFormatConversion_kV4S_BE_WXYZ_OutputNode()
00000000000f7165	movq	(%rax), %rcx
00000000000f7168	movq	%rax, %rdi
00000000000f716b	xorl	%esi, %esi
00000000000f716d	movq	%r14, %rdx
00000000000f7170	callq	*0x78(%rcx)
00000000000f7173	movq	%rbx, %rdi
00000000000f7176	callq	__ZN12HGColorGamma50m_GetPixelFormatConversion_kV4S_BE_WXYZ_OutputNodeEv ## HGColorGamma::m_GetPixelFormatConversion_kV4S_BE_WXYZ_OutputNode()
00000000000f717b	movq	%rax, %r14
00000000000f717e	jmp	0xf7353
00000000000f7183	movl	$0x1a0, %edi                    ## imm = 0x1A0
00000000000f7188	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
00000000000f718d	movq	%rax, %r15
00000000000f7190	movl	$0x1a0, %esi                    ## imm = 0x1A0
00000000000f7195	movq	%rax, %rdi
00000000000f7198	callq	0x3c4fca                        ## symbol stub for: ___bzero
00000000000f719d	movq	%r15, %rdi
00000000000f71a0	callq	__ZN34HgcColorGamma_chroma_downsample_f1C2Ev ## HgcColorGamma_chroma_downsample_f1::HgcColorGamma_chroma_downsample_f1()
00000000000f71a5	leaq	0x91dd44(%rip), %rax
00000000000f71ac	movq	%rax, (%r15)
00000000000f71af	movq	%r15, 0x250(%rbx)
00000000000f71b6	movq	%r15, %rdi
00000000000f71b9	xorl	%esi, %esi
00000000000f71bb	movq	%r14, %rdx
00000000000f71be	callq	*0x78(%rax)
00000000000f71c1	movq	0x250(%rbx), %r14
00000000000f71c8	testq	%r14, %r14
00000000000f71cb	jne	0xf7200
00000000000f71cd	movl	$0x1a0, %edi                    ## imm = 0x1A0
00000000000f71d2	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
00000000000f71d7	movq	%rax, %r14
00000000000f71da	movl	$0x1a0, %esi                    ## imm = 0x1A0
00000000000f71df	movq	%rax, %rdi
00000000000f71e2	callq	0x3c4fca                        ## symbol stub for: ___bzero
00000000000f71e7	movq	%r14, %rdi
00000000000f71ea	callq	__ZN34HgcColorGamma_chroma_downsample_f1C2Ev ## HgcColorGamma_chroma_downsample_f1::HgcColorGamma_chroma_downsample_f1()
00000000000f71ef	leaq	0x91dcfa(%rip), %rax
00000000000f71f6	movq	%rax, (%r14)
00000000000f71f9	movq	%r14, 0x250(%rbx)
00000000000f7200	cmpb	$0x1, 0x402(%rbx)
00000000000f7207	jne	0xf7214
00000000000f7209	movq	%r14, %rdi
00000000000f720c	movl	%r12d, %esi
00000000000f720f	callq	__ZN6HGNode28SetSupportedFormatPrecisionsEj ## HGNode::SetSupportedFormatPrecisions(unsigned int)
00000000000f7214	movq	-0x38(%rbp), %rdi
00000000000f7218	movq	(%rdi), %rax
00000000000f721b	callq	*0x130(%rax)
00000000000f7221	testb	%al, %al
00000000000f7223	jne	0xf7353
00000000000f7229	movl	0x420(%rbx), %eax
00000000000f722f	addl	$-0xe, %eax
00000000000f7232	leaq	0x2c7(%rip), %rcx
00000000000f7239	movslq	(%rcx,%rax,4), %rax
00000000000f723d	addq	%rcx, %rax
00000000000f7240	jmpq	*%rax
00000000000f7242	movq	0x260(%rbx), %r15
00000000000f7249	testq	%r15, %r15
00000000000f724c	jne	0xf7342
00000000000f7252	movl	$0x1a0, %edi                    ## imm = 0x1A0
00000000000f7257	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
00000000000f725c	movq	%rax, %r15
00000000000f725f	movl	$0x1a0, %esi                    ## imm = 0x1A0
00000000000f7264	movq	%rax, %rdi
00000000000f7267	callq	0x3c4fca                        ## symbol stub for: ___bzero
00000000000f726c	movq	%r15, %rdi
00000000000f726f	callq	__ZN32HgcColorGamma_2vuy_yxzx_collapseC2Ev ## HgcColorGamma_2vuy_yxzx_collapse::HgcColorGamma_2vuy_yxzx_collapse()
00000000000f7274	leaq	0x91e125(%rip), %rax
00000000000f727b	movq	%rax, (%r15)
00000000000f727e	movq	%r15, 0x260(%rbx)
00000000000f7285	jmp	0xf7342
00000000000f728a	movq	0x270(%rbx), %r15
00000000000f7291	testq	%r15, %r15
00000000000f7294	jne	0xf7342
00000000000f729a	movl	$0x1a0, %edi                    ## imm = 0x1A0
00000000000f729f	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
00000000000f72a4	movq	%rax, %r15
00000000000f72a7	movl	$0x1a0, %esi                    ## imm = 0x1A0
00000000000f72ac	movq	%rax, %rdi
00000000000f72af	callq	0x3c4fca                        ## symbol stub for: ___bzero
00000000000f72b4	movq	%r15, %rdi
00000000000f72b7	callq	__ZN32HgcColorGamma_v216_yxzx_collapseC2Ev ## HgcColorGamma_v216_yxzx_collapse::HgcColorGamma_v216_yxzx_collapse()
00000000000f72bc	leaq	0x91e7e5(%rip), %rax
00000000000f72c3	movq	%rax, (%r15)
00000000000f72c6	movq	%r15, 0x270(%rbx)
00000000000f72cd	jmp	0xf7342
00000000000f72cf	movq	0x278(%rbx), %r15
00000000000f72d6	testq	%r15, %r15
00000000000f72d9	jne	0xf7342
00000000000f72db	movl	$0x1a0, %edi                    ## imm = 0x1A0
00000000000f72e0	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
00000000000f72e5	movq	%rax, %r15
00000000000f72e8	movq	%rax, %rdi
00000000000f72eb	callq	__ZN37HgcColorGamma_v210_yxzx_rgba_collapseC2Ev ## HgcColorGamma_v210_yxzx_rgba_collapse::HgcColorGamma_v210_yxzx_rgba_collapse()
00000000000f72f0	leaq	0x91e559(%rip), %rax
00000000000f72f7	movq	%rax, (%r15)
00000000000f72fa	movq	%r15, 0x278(%rbx)
00000000000f7301	jmp	0xf7342
00000000000f7303	movq	0x268(%rbx), %r15
00000000000f730a	testq	%r15, %r15
00000000000f730d	jne	0xf7342
00000000000f730f	movl	$0x1a0, %edi                    ## imm = 0x1A0
00000000000f7314	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
00000000000f7319	movq	%rax, %r15
00000000000f731c	movl	$0x1a0, %esi                    ## imm = 0x1A0
00000000000f7321	movq	%rax, %rdi
00000000000f7324	callq	0x3c4fca                        ## symbol stub for: ___bzero
00000000000f7329	movq	%r15, %rdi
00000000000f732c	callq	__ZN32HgcColorGamma_2vuy_xyxz_collapseC2Ev ## HgcColorGamma_2vuy_xyxz_collapse::HgcColorGamma_2vuy_xyxz_collapse()
00000000000f7331	leaq	0x91e2c0(%rip), %rax
00000000000f7338	movq	%rax, (%r15)
00000000000f733b	movq	%r15, 0x268(%rbx)
00000000000f7342	movq	(%r15), %rax
00000000000f7345	movq	%r15, %rdi
00000000000f7348	xorl	%esi, %esi
00000000000f734a	movq	%r14, %rdx
00000000000f734d	callq	*0x78(%rax)
00000000000f7350	movq	%r15, %r14
00000000000f7353	movq	%r14, 0x2f8(%rbx)
00000000000f735a	movq	%r14, %rbx
00000000000f735d	movq	%rbx, %rax
00000000000f7360	addq	$0x68, %rsp
00000000000f7364	popq	%rbx
00000000000f7365	popq	%r12
00000000000f7367	popq	%r13
00000000000f7369	popq	%r14
00000000000f736b	popq	%r15
00000000000f736d	popq	%rbp
00000000000f736e	retq
00000000000f736f	movq	-0x40(%rbp), %rdx
00000000000f7373	callq	*%rax
00000000000f7375	movq	%r13, 0x2f0(%rbx)
00000000000f737c	movq	%r13, %r15
00000000000f737f	jmp	0xf696c
00000000000f7384	ud2
00000000000f7386	jmp	0xf73d3
00000000000f7388	jmp	0xf73d3
00000000000f738a	jmp	0xf73d3
00000000000f738c	jmp	0xf73d3
00000000000f738e	movq	%r13, %rdi
00000000000f7391	movq	%rax, %rbx
00000000000f7394	callq	__ZN8HGObjectdlEPv              ## HGObject::operator delete(void*)
00000000000f7399	movq	%rbx, %rdi
00000000000f739c	callq	0x3c4e02                        ## symbol stub for: __Unwind_Resume
00000000000f73a1	jmp	0xf740c
00000000000f73a3	jmp	0xf73d3
00000000000f73a5	jmp	0xf740c
00000000000f73a7	jmp	0xf740c
00000000000f73a9	jmp	0xf73d3
00000000000f73ab	jmp	0xf740c
00000000000f73ad	jmp	0xf73d3
00000000000f73af	jmp	0xf73d3
00000000000f73b1	jmp	0xf73e6
00000000000f73b3	jmp	0xf740c
00000000000f73b5	jmp	0xf73d3
00000000000f73b7	jmp	0xf740c
00000000000f73b9	jmp	0xf73e6
00000000000f73bb	jmp	0xf73d3
00000000000f73bd	jmp	0xf73d3
00000000000f73bf	jmp	0xf73d3
00000000000f73c1	jmp	0xf73d3
00000000000f73c3	jmp	0xf740c
00000000000f73c5	jmp	0xf73e6
00000000000f73c7	jmp	0xf73d3
00000000000f73c9	jmp	0xf740c
00000000000f73cb	jmp	0xf73d3
00000000000f73cd	jmp	0xf73d3
00000000000f73cf	jmp	0xf740c
00000000000f73d1	jmp	0xf73d3
00000000000f73d3	movq	%rax, %rbx
00000000000f73d6	movq	%r15, %rdi
00000000000f73d9	callq	__ZN8HGObjectdlEPv              ## HGObject::operator delete(void*)
00000000000f73de	movq	%rbx, %rdi
00000000000f73e1	callq	0x3c4e02                        ## symbol stub for: __Unwind_Resume
00000000000f73e6	movq	%rax, %rbx
00000000000f73e9	movq	%r12, %rdi
00000000000f73ec	callq	__ZN8HGObjectdlEPv              ## HGObject::operator delete(void*)
00000000000f73f1	movq	%rbx, %rdi
00000000000f73f4	callq	0x3c4e02                        ## symbol stub for: __Unwind_Resume
00000000000f73f9	movq	%rax, %rbx
00000000000f73fc	movq	%r13, %rdi
00000000000f73ff	callq	__ZN8HGObjectdlEPv              ## HGObject::operator delete(void*)
00000000000f7404	movq	%rbx, %rdi
00000000000f7407	callq	0x3c4e02                        ## symbol stub for: __Unwind_Resume
00000000000f740c	movq	%r14, %rdi
00000000000f740f	movq	%rax, %rbx
00000000000f7412	callq	__ZN8HGObjectdlEPv              ## HGObject::operator delete(void*)
00000000000f7417	movq	%rbx, %rdi
00000000000f741a	callq	0x3c4e02                        ## symbol stub for: __Unwind_Resume
00000000000f741f	nop
00000000000f7420	.byte 0xf1 #bad opcode
00000000000f7421	inl	%dx, %eax
00000000000f7422	.byte 0xff #bad opcode
00000000000f7423	ljmpl	*0x7affffee(%rbx)
00000000000f7429	outb	%al, %dx
00000000000f742a	.byte 0xff #bad opcode
00000000000f742b	.byte 0xff #bad opcode
00000000000f742c	movl	$0xbaffffee, %edx               ## imm = 0xBAFFFFEE
00000000000f7431	outb	%al, %dx
00000000000f7432	.byte 0xff #bad opcode
00000000000f7433	.byte 0xff #bad opcode
00000000000f7434	movl	$0xbaffffee, %edx               ## imm = 0xBAFFFFEE
00000000000f7439	outb	%al, %dx
00000000000f743a	.byte 0xff #bad opcode
00000000000f743b	.byte 0xff #bad opcode
00000000000f743c	movl	$0xbaffffee, %edx               ## imm = 0xBAFFFFEE
00000000000f7441	outb	%al, %dx
00000000000f7442	.byte 0xff #bad opcode
00000000000f7443	.byte 0xff #bad opcode
00000000000f7444	movl	$0xbaffffee, %edx               ## imm = 0xBAFFFFEE
00000000000f7449	outb	%al, %dx
00000000000f744a	.byte 0xff #bad opcode
00000000000f744b	.byte 0xff #bad opcode
00000000000f744c	movl	$0xbaffffee, %edx               ## imm = 0xBAFFFFEE
00000000000f7451	outb	%al, %dx
00000000000f7452	.byte 0xff #bad opcode
00000000000f7453	.byte 0xff #bad opcode
00000000000f7454	movl	$0xbaffffee, %edx               ## imm = 0xBAFFFFEE
00000000000f7459	outb	%al, %dx
00000000000f745a	.byte 0xff #bad opcode
00000000000f745b	.byte 0xff #bad opcode
00000000000f745c	movl	$0xbaffffee, %edx               ## imm = 0xBAFFFFEE
00000000000f7461	outb	%al, %dx
00000000000f7462	.byte 0xff #bad opcode
00000000000f7463	callq	*-0x52000010(%rbp)
00000000000f7469	outb	%al, %dx
00000000000f746a	.byte 0xff #bad opcode
00000000000f746b	ljmpl	*0x51ffffee(%rbp)
00000000000f7471	outl	%eax, %dx
00000000000f7472	.byte 0xff #bad opcode
00000000000f7473	.byte 0xff #bad opcode
00000000000f7474	movl	$0xbdffffee, %ebp               ## imm = 0xBDFFFFEE
00000000000f7479	outb	%al, %dx
00000000000f747a	.byte 0xff #bad opcode
00000000000f747b	.byte 0xff #bad opcode
00000000000f747c	movl	$0xbdffffee, %ebp               ## imm = 0xBDFFFFEE
00000000000f7481	outb	%al, %dx
00000000000f7482	.byte 0xff #bad opcode
00000000000f7483	.byte 0xff #bad opcode
00000000000f7484	movl	$0xbdffffee, %ebp               ## imm = 0xBDFFFFEE
00000000000f7489	outb	%al, %dx
00000000000f748a	.byte 0xff #bad opcode
00000000000f748b	.byte 0xff #bad opcode
00000000000f748c	movl	$0xbdffffee, %ebp               ## imm = 0xBDFFFFEE
00000000000f7491	outb	%al, %dx
00000000000f7492	.byte 0xff #bad opcode
00000000000f7493	.byte 0xff #bad opcode
00000000000f7494	movl	$0xbdffffee, %ebp               ## imm = 0xBDFFFFEE
00000000000f7499	outb	%al, %dx
00000000000f749a	.byte 0xff #bad opcode
00000000000f749b	.byte 0xff #bad opcode
00000000000f749c	movl	$0xbdffffee, %ebp               ## imm = 0xBDFFFFEE
00000000000f74a1	outb	%al, %dx
00000000000f74a2	.byte 0xff #bad opcode
00000000000f74a3	.byte 0xff #bad opcode
00000000000f74a4	movl	$0xbdffffee, %ebp               ## imm = 0xBDFFFFEE
00000000000f74a9	outb	%al, %dx
00000000000f74aa	.byte 0xff #bad opcode
00000000000f74ab	jmpq	*-0x11(%rbx)
00000000000f74ae	.byte 0xff #bad opcode
00000000000f74af	callq	*-0x6e000006(%rcx)
00000000000f74b5	cli
00000000000f74b6	.byte 0xff #bad opcode
00000000000f74b7	lcalll	*-0x5c000006(%rdi)
00000000000f74bd	.byte 0xfe #bad opcode
00000000000f74be	.byte 0xff #bad opcode
00000000000f74bf	jmpq	*-0x5c000002(%rbx)
00000000000f74c5	.byte 0xfe #bad opcode
00000000000f74c6	.byte 0xff #bad opcode
00000000000f74c7	jmpq	*-0x5c000002(%rbx)
00000000000f74cd	.byte 0xfe #bad opcode
00000000000f74ce	.byte 0xff #bad opcode
00000000000f74cf	ljmpl	*(%rsi)
00000000000f74d1	cld
00000000000f74d2	.byte 0xff #bad opcode
00000000000f74d3	jmpq	*-0x5c000002(%rbx)
00000000000f74d9	.byte 0xfe #bad opcode
00000000000f74da	.byte 0xff #bad opcode
00000000000f74db	jmpq	*0x63fffffe(%rbx)
00000000000f74e1	cld
00000000000f74e2	.byte 0xff #bad opcode
00000000000f74e3	jmpq	*-0x5c000002(%rbx)
00000000000f74e9	.byte 0xfe #bad opcode
00000000000f74ea	.byte 0xff #bad opcode
00000000000f74eb	ljmpl	*-0x5c000006(%rbp)
00000000000f74f1	.byte 0xfe #bad opcode
00000000000f74f2	.byte 0xff #bad opcode
00000000000f74f3	jmpq	*%rbp
00000000000f74f5	cli
00000000000f74f6	.byte 0xff #bad opcode
00000000000f74f7	pushq	%rsi
00000000000f74f9	sti
00000000000f74fa	.byte 0xff #bad opcode
00000000000f74fb	lcalll	*0x42fffffc(%rax)
00000000000f7501	std
00000000000f7502	.byte 0xff #bad opcode
00000000000f7503	incl	(%rbx)
00000000000f7505	.byte 0xfe #bad opcode
00000000000f7506	.byte 0xff #bad opcode
00000000000f7507	decl	-0x7b000003(%rdx)
00000000000f750d	.byte 0xfe #bad opcode
00000000000f750e	.byte 0xff #bad opcode
00000000000f750f	incl	-0x17b0001(%rsi,%rdi,8)
00000000000f7516	.byte 0xff #bad opcode
00000000000f7517	incl	-0x17b0001(%rsi,%rdi,8)
00000000000f751e	.byte 0xff #bad opcode
00000000000f751f	incl	-0x17b0001(%rsi,%rdi,8)
00000000000f7526	.byte 0xff #bad opcode
00000000000f7527	incl	-0x17b0001(%rsi,%rdi,8)
00000000000f752e	.byte 0xff #bad opcode
00000000000f752f	incl	-0x17b0001(%rsi,%rdi,8)
00000000000f7536	.byte 0xff #bad opcode
00000000000f7537	incl	-0x17b0001(%rsi,%rdi,8)
00000000000f753e	.byte 0xff #bad opcode
00000000000f753f	incl	-0x2300001(%rsi,%rdi,8)
00000000000f7546	.byte 0xff #bad opcode
00000000000f7547	decl	(%rdi)
00000000000f7549	.byte 0x1f #bad opcode
00000000000f754a	testb	%al, (%rax)
00000000000f754c	addb	%al, (%rax)
00000000000f754e	addb	%al, (%rax)
