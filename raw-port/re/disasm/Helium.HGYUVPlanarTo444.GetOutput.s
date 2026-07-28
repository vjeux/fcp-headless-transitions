__ZN16HGYUVPlanarTo4449GetOutputEP10HGRenderer:
00000000000e54d0	pushq	%rbp
00000000000e54d1	movq	%rsp, %rbp
00000000000e54d4	pushq	%r15
00000000000e54d6	pushq	%r14
00000000000e54d8	pushq	%r13
00000000000e54da	pushq	%r12
00000000000e54dc	pushq	%rbx
00000000000e54dd	subq	$0x38, %rsp
00000000000e54e1	movq	%rsi, %r12
00000000000e54e4	movq	%rdi, %rbx
00000000000e54e7	xorl	%r13d, %r13d
00000000000e54ea	movq	%rsi, %rdi
00000000000e54ed	movq	%rbx, %rsi
00000000000e54f0	xorl	%edx, %edx
00000000000e54f2	callq	__ZN10HGRenderer8GetInputEP6HGNodei ## HGRenderer::GetInput(HGNode*, int)
00000000000e54f7	movq	%rax, %r15
00000000000e54fa	movq	%r12, %rdi
00000000000e54fd	movq	%rbx, %rsi
00000000000e5500	movl	$0x1, %edx
00000000000e5505	callq	__ZN10HGRenderer8GetInputEP6HGNodei ## HGRenderer::GetInput(HGNode*, int)
00000000000e550a	cmpb	$0x1, 0x1ac(%rbx)
00000000000e5511	movq	%rax, -0x38(%rbp)
00000000000e5515	jne	0xe552a
00000000000e5517	movq	%r12, %rdi
00000000000e551a	movq	%rbx, %rsi
00000000000e551d	movl	$0x2, %edx
00000000000e5522	callq	__ZN10HGRenderer8GetInputEP6HGNodei ## HGRenderer::GetInput(HGNode*, int)
00000000000e5527	movq	%rax, %r13
00000000000e552a	movl	0x1a0(%rbx), %eax
00000000000e5530	cmpl	$0x2, %eax
00000000000e5533	je	0xe5576
00000000000e5535	testl	%eax, %eax
00000000000e5537	jne	0xe5592
00000000000e5539	movq	%r15, -0x30(%rbp)
00000000000e553d	movq	%r13, %r15
00000000000e5540	movl	0x1a8(%rbx), %r13d
00000000000e5547	movl	$0x1a0, %edi                    ## imm = 0x1A0
00000000000e554c	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
00000000000e5551	movq	%rax, %r14
00000000000e5554	testl	%r13d, %r13d
00000000000e5557	je	0xe55ae
00000000000e5559	movq	%r15, %r13
00000000000e555c	testq	%r15, %r15
00000000000e555f	je	0xe55f3
00000000000e5565	movq	%r14, %rdi
00000000000e5568	callq	__ZN33HgcYUV420TriPlanar_420To444_Type2C1Ev ## HgcYUV420TriPlanar_420To444_Type2::HgcYUV420TriPlanar_420To444_Type2()
00000000000e556d	movq	-0x30(%rbp), %r15
00000000000e5571	jmp	0xe55ff
00000000000e5576	movl	$0x1a0, %edi                    ## imm = 0x1A0
00000000000e557b	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
00000000000e5580	movq	%rax, %r14
00000000000e5583	testq	%r13, %r13
00000000000e5586	je	0xe55df
00000000000e5588	movq	%r14, %rdi
00000000000e558b	callq	__ZN33HgcYUV444TriPlanar_444To444_Type2C1Ev ## HgcYUV444TriPlanar_444To444_Type2::HgcYUV444TriPlanar_444To444_Type2()
00000000000e5590	jmp	0xe55ff
00000000000e5592	movl	$0x1a0, %edi                    ## imm = 0x1A0
00000000000e5597	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
00000000000e559c	movq	%rax, %r14
00000000000e559f	testq	%r13, %r13
00000000000e55a2	je	0xe55e9
00000000000e55a4	movq	%r14, %rdi
00000000000e55a7	callq	__ZN33HgcYUV422TriPlanar_422To444_Type2C1Ev ## HgcYUV422TriPlanar_422To444_Type2::HgcYUV422TriPlanar_422To444_Type2()
00000000000e55ac	jmp	0xe55ff
00000000000e55ae	movl	$0x1a0, %esi                    ## imm = 0x1A0
00000000000e55b3	movq	%r14, %rdi
00000000000e55b6	callq	0x3c4fca                        ## symbol stub for: ___bzero
00000000000e55bb	movq	%r15, %r13
00000000000e55be	testq	%r15, %r15
00000000000e55c1	je	0xe585e
00000000000e55c7	movq	%r14, %rdi
00000000000e55ca	callq	__ZN33HgcYUV420TriPlanar_420To444_Type0C2Ev ## HgcYUV420TriPlanar_420To444_Type0::HgcYUV420TriPlanar_420To444_Type0()
00000000000e55cf	movq	-0x30(%rbp), %r15
00000000000e55d3	leaq	0x92c1e6(%rip), %rax
00000000000e55da	jmp	0xe5871
00000000000e55df	movq	%r14, %rdi
00000000000e55e2	callq	__ZN32HgcYUV444BiPlanar_444To444_Type2C1Ev ## HgcYUV444BiPlanar_444To444_Type2::HgcYUV444BiPlanar_444To444_Type2()
00000000000e55e7	jmp	0xe55ff
00000000000e55e9	movq	%r14, %rdi
00000000000e55ec	callq	__ZN32HgcYUV422BiPlanar_422To444_Type2C1Ev ## HgcYUV422BiPlanar_422To444_Type2::HgcYUV422BiPlanar_422To444_Type2()
00000000000e55f1	jmp	0xe55ff
00000000000e55f3	movq	%r14, %rdi
00000000000e55f6	callq	__ZN32HgcYUV420BiPlanar_420To444_Type2C1Ev ## HgcYUV420BiPlanar_420To444_Type2::HgcYUV420BiPlanar_420To444_Type2()
00000000000e55fb	movq	-0x30(%rbp), %r15
00000000000e55ff	movq	(%r14), %rax
00000000000e5602	movq	%r14, %rdi
00000000000e5605	xorl	%esi, %esi
00000000000e5607	movq	%r15, %rdx
00000000000e560a	callq	*0x78(%rax)
00000000000e560d	movq	(%r14), %rax
00000000000e5610	movq	%r14, %rdi
00000000000e5613	movl	$0x1, %esi
00000000000e5618	movq	-0x38(%rbp), %rdx
00000000000e561c	callq	*0x78(%rax)
00000000000e561f	testq	%r13, %r13
00000000000e5622	je	0xe5635
00000000000e5624	movq	(%r14), %rax
00000000000e5627	movq	%r14, %rdi
00000000000e562a	movl	$0x2, %esi
00000000000e562f	movq	%r13, %rdx
00000000000e5632	callq	*0x78(%rax)
00000000000e5635	movq	%r12, %rdi
00000000000e5638	movq	%r15, %rsi
00000000000e563b	callq	__ZN10HGRenderer6GetDODEP6HGNode ## HGRenderer::GetDOD(HGNode*)
00000000000e5640	movq	%rax, %r13
00000000000e5643	movq	%rdx, %r12
00000000000e5646	testq	%r15, %r15
00000000000e5649	je	0xe5695
00000000000e564b	leaq	__ZTI6HGNode(%rip), %rsi        ## typeinfo for HGNode
00000000000e5652	leaq	__ZTI14HGBitmapLoader(%rip), %rdx ## typeinfo for HGBitmapLoader
00000000000e5659	movq	%r15, %rdi
00000000000e565c	xorl	%ecx, %ecx
00000000000e565e	callq	0x3c5018                        ## symbol stub for: ___dynamic_cast
00000000000e5663	testq	%rax, %rax
00000000000e5666	je	0xe5695
00000000000e5668	movq	%rax, %rdi
00000000000e566b	callq	__ZNK14HGBitmapLoader15GetBitmapFormatEv ## HGBitmapLoader::GetBitmapFormat() const
00000000000e5670	movl	%eax, %r15d
00000000000e5673	movl	%eax, %edi
00000000000e5675	callq	__ZN13HGFormatUtils9precisionE8HGFormat ## HGFormatUtils::precision(HGFormat)
00000000000e567a	movq	%r14, %rdi
00000000000e567d	movl	%eax, %esi
00000000000e567f	callq	__ZN6HGNode28SetSupportedFormatPrecisionsEj ## HGNode::SetSupportedFormatPrecisions(unsigned int)
00000000000e5684	movl	%r15d, %edi
00000000000e5687	callq	__ZN13HGFormatUtils13bytesPerPixelE8HGFormat ## HGFormatUtils::bytesPerPixel(HGFormat)
00000000000e568c	cmpl	$0x2, %eax
00000000000e568f	sete	%sil
00000000000e5693	jmp	0xe5697
00000000000e5695	xorl	%esi, %esi
00000000000e5697	movl	0x1a4(%rbx), %ecx
00000000000e569d	movl	0x1b0(%rbx), %eax
00000000000e56a3	leal	-0x3(%rcx), %edx
00000000000e56a6	cmpl	$0x3, %edx
00000000000e56a9	movq	%rsi, -0x40(%rbp)
00000000000e56ad	ja	0xe5702
00000000000e56af	cmpl	$0x6, %ecx
00000000000e56b2	sete	%dl
00000000000e56b5	andl	$0x6, %ecx
00000000000e56b8	cmpl	$0x4, %ecx
00000000000e56bb	sete	%cl
00000000000e56be	orb	%sil, %dl
00000000000e56c1	orb	%cl, %dl
00000000000e56c3	movss	0x2e9b09(%rip), %xmm1
00000000000e56cb	movss	0x2e9afd(%rip), %xmm0
00000000000e56d3	cmpb	$0x1, %dl
00000000000e56d6	movss	%xmm0, -0x38(%rbp)
00000000000e56db	movss	%xmm1, -0x30(%rbp)
00000000000e56e0	jne	0xe5735
00000000000e56e2	xorl	%ecx, %ecx
00000000000e56e4	testl	%eax, %eax
00000000000e56e6	sete	%cl
00000000000e56e9	leaq	0x2e9af0(%rip), %rax
00000000000e56f0	movss	(%rax,%rcx,4), %xmm0
00000000000e56f5	movsldup	%xmm0, %xmm0                    ## xmm0 = xmm0[0,0,2,2]
00000000000e56f9	divps	0x2e9ac0(%rip), %xmm0
00000000000e5700	jmp	0xe574b
00000000000e5702	movss	0x2e25c2(%rip), %xmm0
00000000000e570a	cmpl	$0x1, %ecx
00000000000e570d	movss	%xmm0, -0x38(%rbp)
00000000000e5712	xorps	%xmm1, %xmm1
00000000000e5715	jne	0xe573f
00000000000e5717	movss	%xmm1, -0x30(%rbp)
00000000000e571c	xorl	%ecx, %ecx
00000000000e571e	testl	%eax, %eax
00000000000e5720	sete	%cl
00000000000e5723	leaq	0x2e9aae(%rip), %rax
00000000000e572a	movss	(%rax,%rcx,4), %xmm0
00000000000e572f	movsldup	%xmm0, %xmm0                    ## xmm0 = xmm0[0,0,2,2]
00000000000e5733	jmp	0xe574b
00000000000e5735	movsd	0x2e9a73(%rip), %xmm0
00000000000e573d	jmp	0xe574b
00000000000e573f	movss	%xmm1, -0x30(%rbp)
00000000000e5744	movaps	0x2e4965(%rip), %xmm0
00000000000e574b	movaps	%xmm0, -0x50(%rbp)
00000000000e574f	movl	$0x1a0, %edi                    ## imm = 0x1A0
00000000000e5754	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
00000000000e5759	movq	%rax, %r15
00000000000e575c	movq	%rax, %rdi
00000000000e575f	callq	__ZN16HgcScaleBiasCropC1Ev      ## HgcScaleBiasCrop::HgcScaleBiasCrop()
00000000000e5764	movq	(%r15), %rax
00000000000e5767	movq	%r15, %rdi
00000000000e576a	xorl	%esi, %esi
00000000000e576c	movq	%r14, %rdx
00000000000e576f	callq	*0x78(%rax)
00000000000e5772	movq	(%r15), %rax
00000000000e5775	movaps	-0x50(%rbp), %xmm0
00000000000e5779	movshdup	%xmm0, %xmm1                    ## xmm1 = xmm0[1,1,3,3]
00000000000e577d	movss	0x2e253b(%rip), %xmm3
00000000000e5785	movq	%r15, %rdi
00000000000e5788	xorl	%esi, %esi
00000000000e578a	movaps	%xmm1, %xmm2
00000000000e578d	callq	*0x60(%rax)
00000000000e5790	movq	(%r15), %rax
00000000000e5793	xorps	%xmm3, %xmm3
00000000000e5796	movq	%r15, %rdi
00000000000e5799	movl	$0x1, %esi
00000000000e579e	movss	-0x30(%rbp), %xmm0
00000000000e57a3	movss	-0x38(%rbp), %xmm1
00000000000e57a8	movaps	%xmm1, %xmm2
00000000000e57ab	callq	*0x60(%rax)
00000000000e57ae	xorps	%xmm0, %xmm0
00000000000e57b1	cvtsi2ss	%r13d, %xmm0
00000000000e57b6	shrq	$0x20, %r13
00000000000e57ba	xorps	%xmm1, %xmm1
00000000000e57bd	cvtsi2ss	%r13d, %xmm1
00000000000e57c2	xorps	%xmm2, %xmm2
00000000000e57c5	cvtsi2ss	%r12d, %xmm2
00000000000e57ca	shrq	$0x20, %r12
00000000000e57ce	xorps	%xmm3, %xmm3
00000000000e57d1	cvtsi2ss	%r12d, %xmm3
00000000000e57d6	movq	(%r15), %rax
00000000000e57d9	movq	%r15, %rdi
00000000000e57dc	movl	$0x2, %esi
00000000000e57e1	callq	*0x60(%rax)
00000000000e57e4	movq	0x198(%rbx), %rdi
00000000000e57eb	cmpq	%r15, %rdi
00000000000e57ee	je	0xe5804
00000000000e57f0	testq	%rdi, %rdi
00000000000e57f3	je	0xe57fb
00000000000e57f5	movq	(%rdi), %rax
00000000000e57f8	callq	*0x18(%rax)
00000000000e57fb	movq	%r15, 0x198(%rbx)
00000000000e5802	jmp	0xe580d
00000000000e5804	movq	(%r15), %rax
00000000000e5807	movq	%r15, %rdi
00000000000e580a	callq	*0x18(%rax)
00000000000e580d	movq	(%r14), %rax
00000000000e5810	movq	%r14, %rdi
00000000000e5813	callq	*0x18(%rax)
00000000000e5816	movl	$0x8, %esi
00000000000e581b	cmpb	$0x0, -0x40(%rbp)
00000000000e581f	jne	0xe583c
00000000000e5821	movl	0x24(%rbx), %eax
00000000000e5824	movl	0x1a4(%rbx), %ecx
00000000000e582a	decl	%ecx
00000000000e582c	movb	$0x3b, %dl
00000000000e582e	shrb	%cl, %dl
00000000000e5830	testb	$0x1, %dl
00000000000e5833	cmovel	%eax, %esi
00000000000e5836	cmpl	$0x6, %ecx
00000000000e5839	cmovael	%eax, %esi
00000000000e583c	movq	0x198(%rbx), %rdi
00000000000e5843	callq	__ZN6HGNode28SetSupportedFormatPrecisionsEj ## HGNode::SetSupportedFormatPrecisions(unsigned int)
00000000000e5848	movq	0x198(%rbx), %rax
00000000000e584f	addq	$0x38, %rsp
00000000000e5853	popq	%rbx
00000000000e5854	popq	%r12
00000000000e5856	popq	%r13
00000000000e5858	popq	%r14
00000000000e585a	popq	%r15
00000000000e585c	popq	%rbp
00000000000e585d	retq
00000000000e585e	movq	%r14, %rdi
00000000000e5861	callq	__ZN32HgcYUV420BiPlanar_420To444_Type0C2Ev ## HgcYUV420BiPlanar_420To444_Type0::HgcYUV420BiPlanar_420To444_Type0()
00000000000e5866	movq	-0x30(%rbp), %r15
00000000000e586a	leaq	0x92c1a7(%rip), %rax
00000000000e5871	movq	%rax, (%r14)
00000000000e5874	movq	%r12, %rdi
00000000000e5877	movq	-0x38(%rbp), %rsi
00000000000e587b	callq	__ZN10HGRenderer6GetDODEP6HGNode ## HGRenderer::GetDOD(HGNode*)
00000000000e5880	movq	%rax, -0x50(%rbp)
00000000000e5884	movq	%rdx, -0x40(%rbp)
00000000000e5888	movl	$0x1d0, %edi                    ## imm = 0x1D0
00000000000e588d	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
00000000000e5892	movq	%rax, -0x30(%rbp)
00000000000e5896	movq	%rax, %rdi
00000000000e5899	callq	__ZN13HGTextureWrapC1Ev         ## HGTextureWrap::HGTextureWrap()
00000000000e589e	movq	-0x30(%rbp), %rdi
00000000000e58a2	movl	$0x1, %esi
00000000000e58a7	callq	__ZN13HGTextureWrap18SetTextureWrapModeENS_8WrapModeE ## HGTextureWrap::SetTextureWrapMode(HGTextureWrap::WrapMode)
00000000000e58ac	movl	$0xffffffff, %edi               ## imm = 0xFFFFFFFF
00000000000e58b1	movl	$0xffffffff, %esi               ## imm = 0xFFFFFFFF
00000000000e58b6	movl	$0x1, %edx
00000000000e58bb	movl	$0x1, %ecx
00000000000e58c0	callq	_HGRectMake4i
00000000000e58c5	movq	%rdx, %rcx
00000000000e58c8	movq	-0x50(%rbp), %rdi
00000000000e58cc	movq	-0x40(%rbp), %rsi
00000000000e58d0	movq	%rax, %rdx
00000000000e58d3	callq	_HGRectGrow
00000000000e58d8	movq	%rax, -0x60(%rbp)
00000000000e58dc	movq	%rdx, -0x58(%rbp)
00000000000e58e0	leaq	-0x60(%rbp), %rsi
00000000000e58e4	movq	-0x30(%rbp), %rdi
00000000000e58e8	callq	__ZN13HGTextureWrap11SetCropRectERK6HGRect ## HGTextureWrap::SetCropRect(HGRect const&)
00000000000e58ed	movq	-0x30(%rbp), %rdi
00000000000e58f1	movq	(%rdi), %rax
00000000000e58f4	xorl	%esi, %esi
00000000000e58f6	movq	-0x38(%rbp), %rdx
00000000000e58fa	callq	*0x78(%rax)
00000000000e58fd	movq	(%r14), %rax
00000000000e5900	movq	%r14, %rdi
00000000000e5903	xorl	%esi, %esi
00000000000e5905	movq	%r15, %rdx
00000000000e5908	callq	*0x78(%rax)
00000000000e590b	movq	(%r14), %rax
00000000000e590e	movq	%r14, %rdi
00000000000e5911	movl	$0x1, %esi
00000000000e5916	movq	-0x30(%rbp), %rdx
00000000000e591a	callq	*0x78(%rax)
00000000000e591d	movq	-0x30(%rbp), %rdi
00000000000e5921	movq	(%rdi), %rax
00000000000e5924	callq	*0x18(%rax)
00000000000e5927	testq	%r13, %r13
00000000000e592a	jne	0xe5624
00000000000e5930	jmp	0xe5635
00000000000e5935	jmp	0xe594c
00000000000e5937	jmp	0xe594c
00000000000e5939	jmp	0xe594c
00000000000e593b	movq	%rax, %rbx
00000000000e593e	movq	-0x30(%rbp), %rdi
00000000000e5942	jmp	0xe5978
00000000000e5944	jmp	0xe594c
00000000000e5946	jmp	0xe594c
00000000000e5948	jmp	0xe594c
00000000000e594a	jmp	0xe594c
00000000000e594c	movq	%rax, %rbx
00000000000e594f	movq	%r14, %rdi
00000000000e5952	jmp	0xe5978
00000000000e5954	movq	%rax, %rdi
00000000000e5957	callq	___clang_call_terminate
00000000000e595c	movq	%rax, %rbx
00000000000e595f	movq	(%r15), %rax
00000000000e5962	movq	%r15, %rdi
00000000000e5965	callq	*0x18(%rax)
00000000000e5968	jmp	0xe597d
00000000000e596a	movq	%rax, %rdi
00000000000e596d	callq	___clang_call_terminate
00000000000e5972	movq	%rax, %rbx
00000000000e5975	movq	%r15, %rdi
00000000000e5978	callq	__ZN8HGObjectdlEPv              ## HGObject::operator delete(void*)
00000000000e597d	movq	%rbx, %rdi
00000000000e5980	callq	0x3c4e02                        ## symbol stub for: __Unwind_Resume
00000000000e5985	nopw	%cs:(%rax,%rax)
