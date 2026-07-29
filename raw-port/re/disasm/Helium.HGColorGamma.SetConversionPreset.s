__ZN12HGColorGamma19SetConversionPresetENS_28hgColorGammaConversionPresetE:
00000000000f5340	pushq	%rbp
00000000000f5341	movq	%rsp, %rbp
00000000000f5344	pushq	%r14
00000000000f5346	pushq	%rbx
00000000000f5347	subq	$0x20, %rsp
00000000000f534b	movl	%esi, %r14d
00000000000f534e	movq	%rdi, %rbx
00000000000f5351	callq	__ZN6HGNode9ClearBitsEv         ## HGNode::ClearBits()
00000000000f5356	movb	$0x1, 0x2e9(%rbx)
00000000000f535d	cmpl	$0x6, %r14d
00000000000f5361	ja	0xf5a49
00000000000f5367	movl	%r14d, %eax
00000000000f536a	leaq	0x6eb(%rip), %rcx
00000000000f5371	movslq	(%rcx,%rax,4), %rax
00000000000f5375	addq	%rcx, %rax
00000000000f5378	jmpq	*%rax
00000000000f537a	movq	%rbx, %rdi
00000000000f537d	callq	__ZN6HGNode9ClearBitsEv         ## HGNode::ClearBits()
00000000000f5382	movb	$0x1, 0x2e9(%rbx)
00000000000f5389	movss	0x2d292f(%rip), %xmm0
00000000000f5391	movaps	%xmm0, 0x380(%rbx)
00000000000f5398	movsd	0x2d2910(%rip), %xmm0
00000000000f53a0	movaps	%xmm0, 0x390(%rbx)
00000000000f53a7	movaps	0x2d56c2(%rip), %xmm0
00000000000f53ae	movaps	%xmm0, 0x3a0(%rbx)
00000000000f53b5	movaps	0x2d4c24(%rip), %xmm0
00000000000f53bc	movaps	%xmm0, 0x3b0(%rbx)
00000000000f53c3	movq	%rbx, %rdi
00000000000f53c6	callq	__ZN6HGNode9ClearBitsEv         ## HGNode::ClearBits()
00000000000f53cb	movb	$0x1, 0x2e9(%rbx)
00000000000f53d2	movss	0x2d28e6(%rip), %xmm0
00000000000f53da	movaps	%xmm0, 0x3c0(%rbx)
00000000000f53e1	movsd	0x2d28c7(%rip), %xmm0
00000000000f53e9	movaps	%xmm0, 0x3d0(%rbx)
00000000000f53f0	movaps	0x2d5679(%rip), %xmm0
00000000000f53f7	movaps	%xmm0, 0x3e0(%rbx)
00000000000f53fe	movaps	0x2d4bdb(%rip), %xmm0
00000000000f5405	movaps	%xmm0, 0x3f0(%rbx)
00000000000f540c	movq	%rbx, %rdi
00000000000f540f	callq	__ZN6HGNode9ClearBitsEv         ## HGNode::ClearBits()
00000000000f5414	movb	$0x1, 0x2e9(%rbx)
00000000000f541b	movq	$0x0, 0x404(%rbx)
00000000000f5426	movapd	0x2d2812(%rip), %xmm0
00000000000f542e	movapd	%xmm0, 0x300(%rbx)
00000000000f5436	xorpd	%xmm0, %xmm0
00000000000f543a	movapd	%xmm0, 0x310(%rbx)
00000000000f5442	movapd	%xmm0, 0x320(%rbx)
00000000000f544a	movapd	%xmm0, 0x330(%rbx)
00000000000f5452	movapd	%xmm0, 0x340(%rbx)
00000000000f545a	movapd	%xmm0, 0x350(%rbx)
00000000000f5462	movapd	%xmm0, 0x360(%rbx)
00000000000f546a	movb	$0x1, 0x370(%rbx)
00000000000f5471	jmp	0xf5a49
00000000000f5476	movq	%rbx, %rdi
00000000000f5479	callq	__ZN6HGNode9ClearBitsEv         ## HGNode::ClearBits()
00000000000f547e	movb	$0x1, 0x2e9(%rbx)
00000000000f5485	movaps	0x2da394(%rip), %xmm0
00000000000f548c	movaps	%xmm0, 0x380(%rbx)
00000000000f5493	movaps	0x2da396(%rip), %xmm0
00000000000f549a	movaps	%xmm0, 0x390(%rbx)
00000000000f54a1	movaps	0x2da398(%rip), %xmm0
00000000000f54a8	jmp	0xf5560
00000000000f54ad	movq	%rbx, %rdi
00000000000f54b0	callq	__ZN6HGNode9ClearBitsEv         ## HGNode::ClearBits()
00000000000f54b5	movb	$0x1, 0x2e9(%rbx)
00000000000f54bc	movaps	0x2da3ad(%rip), %xmm0
00000000000f54c3	movaps	%xmm0, 0x380(%rbx)
00000000000f54ca	movaps	0x2da3af(%rip), %xmm0
00000000000f54d1	movaps	%xmm0, 0x390(%rbx)
00000000000f54d8	movsd	0x2da3b0(%rip), %xmm0
00000000000f54e0	movaps	%xmm0, 0x3a0(%rbx)
00000000000f54e7	movaps	0x2d4af2(%rip), %xmm0
00000000000f54ee	movaps	%xmm0, 0x3b0(%rbx)
00000000000f54f5	movq	%rbx, %rdi
00000000000f54f8	callq	__ZN6HGNode9ClearBitsEv         ## HGNode::ClearBits()
00000000000f54fd	movb	$0x1, 0x2e9(%rbx)
00000000000f5504	movaps	0x2da395(%rip), %xmm0
00000000000f550b	movaps	%xmm0, 0x3c0(%rbx)
00000000000f5512	movaps	0x2da397(%rip), %xmm0
00000000000f5519	movaps	%xmm0, 0x3d0(%rbx)
00000000000f5520	movaps	0x2da399(%rip), %xmm0
00000000000f5527	jmp	0xf56e9
00000000000f552c	movq	%rbx, %rdi
00000000000f552f	callq	__ZN6HGNode9ClearBitsEv         ## HGNode::ClearBits()
00000000000f5534	movb	$0x1, 0x2e9(%rbx)
00000000000f553b	movss	0x2d277d(%rip), %xmm0
00000000000f5543	movaps	%xmm0, 0x380(%rbx)
00000000000f554a	movsd	0x2d275e(%rip), %xmm0
00000000000f5552	movaps	%xmm0, 0x390(%rbx)
00000000000f5559	movaps	0x2d5510(%rip), %xmm0
00000000000f5560	movaps	%xmm0, 0x3a0(%rbx)
00000000000f5567	movaps	0x2d4a72(%rip), %xmm0
00000000000f556e	movaps	%xmm0, 0x3b0(%rbx)
00000000000f5575	movq	%rbx, %rdi
00000000000f5578	callq	__ZN6HGNode9ClearBitsEv         ## HGNode::ClearBits()
00000000000f557d	movb	$0x1, 0x2e9(%rbx)
00000000000f5584	movaps	0x2d4b55(%rip), %xmm0
00000000000f558b	movaps	%xmm0, 0x3c0(%rbx)
00000000000f5592	movaps	0x2da2b7(%rip), %xmm0
00000000000f5599	movaps	%xmm0, 0x3d0(%rbx)
00000000000f55a0	movaps	0x2da2b9(%rip), %xmm0
00000000000f55a7	movaps	%xmm0, 0x3e0(%rbx)
00000000000f55ae	movaps	0x2d4a2b(%rip), %xmm0
00000000000f55b5	movaps	%xmm0, 0x3f0(%rbx)
00000000000f55bc	movq	%rbx, %rdi
00000000000f55bf	callq	__ZN6HGNode9ClearBitsEv         ## HGNode::ClearBits()
00000000000f55c4	movb	$0x1, 0x2e9(%rbx)
00000000000f55cb	xorps	%xmm0, %xmm0
00000000000f55ce	movaps	%xmm0, 0x310(%rbx)
00000000000f55d5	movaps	%xmm0, 0x320(%rbx)
00000000000f55dc	movaps	%xmm0, 0x330(%rbx)
00000000000f55e3	movaps	%xmm0, 0x340(%rbx)
00000000000f55ea	movaps	%xmm0, 0x350(%rbx)
00000000000f55f1	movaps	%xmm0, 0x360(%rbx)
00000000000f55f8	movq	$0x7, 0x404(%rbx)
00000000000f5603	movaps	0x2d2636(%rip), %xmm0
00000000000f560a	movaps	%xmm0, 0x300(%rbx)
00000000000f5611	movb	$0x1, 0x370(%rbx)
00000000000f5618	leaq	__ZN30HGLinearToAYCCToneCurveLUTInfo6s_kMinE(%rip), %rax ## HGLinearToAYCCToneCurveLUTInfo::s_kMin
00000000000f561f	movsd	(%rax), %xmm0
00000000000f5623	movapd	%xmm0, -0x30(%rbp)
00000000000f5628	leaq	__ZN30HGLinearToAYCCToneCurveLUTInfo6s_kMaxE(%rip), %rax ## HGLinearToAYCCToneCurveLUTInfo::s_kMax
00000000000f562f	movsd	(%rax), %xmm1
00000000000f5633	subsd	%xmm0, %xmm1
00000000000f5637	movapd	%xmm1, -0x20(%rbp)
00000000000f563c	movq	%rbx, %rdi
00000000000f563f	callq	__ZN6HGNode9ClearBitsEv         ## HGNode::ClearBits()
00000000000f5644	movapd	-0x20(%rbp), %xmm0
00000000000f5649	unpcklpd	-0x30(%rbp), %xmm0              ## xmm0 = xmm0[0],mem[0]
00000000000f564e	cvtpd2ps	%xmm0, %xmm0
00000000000f5652	movb	$0x1, 0x2e9(%rbx)
00000000000f5659	movlpd	%xmm0, 0x484(%rbx)
00000000000f5661	leaq	__ZN30HGLinearToAYCCToneCurveLUTInfo14s_1DLUTnumBinsE(%rip), %rax ## HGLinearToAYCCToneCurveLUTInfo::s_1DLUTnumBins
00000000000f5668	jmp	0xf5a30
00000000000f566d	movq	%rbx, %rdi
00000000000f5670	callq	__ZN6HGNode9ClearBitsEv         ## HGNode::ClearBits()
00000000000f5675	movb	$0x1, 0x2e9(%rbx)
00000000000f567c	movaps	0x2da1ed(%rip), %xmm0
00000000000f5683	movaps	%xmm0, 0x380(%rbx)
00000000000f568a	movaps	0x2da1ef(%rip), %xmm0
00000000000f5691	movaps	%xmm0, 0x390(%rbx)
00000000000f5698	movsd	0x2da1f0(%rip), %xmm0
00000000000f56a0	movaps	%xmm0, 0x3a0(%rbx)
00000000000f56a7	movaps	0x2d4932(%rip), %xmm0
00000000000f56ae	movaps	%xmm0, 0x3b0(%rbx)
00000000000f56b5	movq	%rbx, %rdi
00000000000f56b8	callq	__ZN6HGNode9ClearBitsEv         ## HGNode::ClearBits()
00000000000f56bd	movb	$0x1, 0x2e9(%rbx)
00000000000f56c4	movss	0x2d25f4(%rip), %xmm0
00000000000f56cc	movaps	%xmm0, 0x3c0(%rbx)
00000000000f56d3	movsd	0x2d25d5(%rip), %xmm0
00000000000f56db	movaps	%xmm0, 0x3d0(%rbx)
00000000000f56e2	movaps	0x2d5387(%rip), %xmm0
00000000000f56e9	movaps	%xmm0, 0x3e0(%rbx)
00000000000f56f0	movaps	0x2d48e9(%rip), %xmm0
00000000000f56f7	movaps	%xmm0, 0x3f0(%rbx)
00000000000f56fe	movq	%rbx, %rdi
00000000000f5701	callq	__ZN6HGNode9ClearBitsEv         ## HGNode::ClearBits()
00000000000f5706	movb	$0x1, 0x2e9(%rbx)
00000000000f570d	xorps	%xmm0, %xmm0
00000000000f5710	movaps	%xmm0, 0x310(%rbx)
00000000000f5717	movaps	%xmm0, 0x320(%rbx)
00000000000f571e	movaps	%xmm0, 0x330(%rbx)
00000000000f5725	movaps	%xmm0, 0x340(%rbx)
00000000000f572c	movaps	%xmm0, 0x350(%rbx)
00000000000f5733	movaps	%xmm0, 0x360(%rbx)
00000000000f573a	movq	$0x6, 0x404(%rbx)
00000000000f5745	movaps	0x2d24f4(%rip), %xmm0
00000000000f574c	movaps	%xmm0, 0x300(%rbx)
00000000000f5753	movb	$0x1, 0x370(%rbx)
00000000000f575a	leaq	__ZN30HGAYCCToneCurveToLinearLUTInfo6s_kMinE(%rip), %rax ## HGAYCCToneCurveToLinearLUTInfo::s_kMin
00000000000f5761	movsd	(%rax), %xmm0
00000000000f5765	movapd	%xmm0, -0x30(%rbp)
00000000000f576a	leaq	__ZN30HGAYCCToneCurveToLinearLUTInfo6s_kMaxE(%rip), %rax ## HGAYCCToneCurveToLinearLUTInfo::s_kMax
00000000000f5771	movsd	(%rax), %xmm1
00000000000f5775	subsd	%xmm0, %xmm1
00000000000f5779	movapd	%xmm1, -0x20(%rbp)
00000000000f577e	movq	%rbx, %rdi
00000000000f5781	callq	__ZN6HGNode9ClearBitsEv         ## HGNode::ClearBits()
00000000000f5786	movapd	-0x20(%rbp), %xmm0
00000000000f578b	unpcklpd	-0x30(%rbp), %xmm0              ## xmm0 = xmm0[0],mem[0]
00000000000f5790	cvtpd2ps	%xmm0, %xmm0
00000000000f5794	movb	$0x1, 0x2e9(%rbx)
00000000000f579b	movlpd	%xmm0, 0x484(%rbx)
00000000000f57a3	leaq	__ZN30HGAYCCToneCurveToLinearLUTInfo14s_1DLUTnumBinsE(%rip), %rax ## HGAYCCToneCurveToLinearLUTInfo::s_1DLUTnumBins
00000000000f57aa	jmp	0xf5a30
00000000000f57af	movq	%rbx, %rdi
00000000000f57b2	callq	__ZN6HGNode9ClearBitsEv         ## HGNode::ClearBits()
00000000000f57b7	movb	$0x1, 0x2e9(%rbx)
00000000000f57be	movss	0x2d24fa(%rip), %xmm0
00000000000f57c6	movaps	%xmm0, 0x380(%rbx)
00000000000f57cd	movsd	0x2d24db(%rip), %xmm0
00000000000f57d5	movaps	%xmm0, 0x390(%rbx)
00000000000f57dc	movaps	0x2d528d(%rip), %xmm0
00000000000f57e3	movaps	%xmm0, 0x3a0(%rbx)
00000000000f57ea	movaps	0x2d47ef(%rip), %xmm0
00000000000f57f1	movaps	%xmm0, 0x3b0(%rbx)
00000000000f57f8	movq	%rbx, %rdi
00000000000f57fb	callq	__ZN6HGNode9ClearBitsEv         ## HGNode::ClearBits()
00000000000f5800	movb	$0x1, 0x2e9(%rbx)
00000000000f5807	movss	0x2d24b1(%rip), %xmm0
00000000000f580f	movaps	%xmm0, 0x3c0(%rbx)
00000000000f5816	movsd	0x2d2492(%rip), %xmm0
00000000000f581e	movaps	%xmm0, 0x3d0(%rbx)
00000000000f5825	movaps	0x2d5244(%rip), %xmm0
00000000000f582c	movaps	%xmm0, 0x3e0(%rbx)
00000000000f5833	movaps	0x2d47a6(%rip), %xmm0
00000000000f583a	movaps	%xmm0, 0x3f0(%rbx)
00000000000f5841	movq	%rbx, %rdi
00000000000f5844	callq	__ZN6HGNode9ClearBitsEv         ## HGNode::ClearBits()
00000000000f5849	movb	$0x1, 0x2e9(%rbx)
00000000000f5850	xorps	%xmm0, %xmm0
00000000000f5853	movaps	%xmm0, 0x310(%rbx)
00000000000f585a	movaps	%xmm0, 0x320(%rbx)
00000000000f5861	movaps	%xmm0, 0x330(%rbx)
00000000000f5868	movaps	%xmm0, 0x340(%rbx)
00000000000f586f	movaps	%xmm0, 0x350(%rbx)
00000000000f5876	movaps	%xmm0, 0x360(%rbx)
00000000000f587d	movq	$0x8, 0x404(%rbx)
00000000000f5888	movaps	0x2d23b1(%rip), %xmm0
00000000000f588f	movaps	%xmm0, 0x300(%rbx)
00000000000f5896	movb	$0x1, 0x370(%rbx)
00000000000f589d	leaq	__ZN33HG_ERsRGBToneCurveToLinearLUTInfo6s_kMinE(%rip), %rax ## HG_ERsRGBToneCurveToLinearLUTInfo::s_kMin
00000000000f58a4	movsd	(%rax), %xmm0
00000000000f58a8	movapd	%xmm0, -0x30(%rbp)
00000000000f58ad	leaq	__ZN33HG_ERsRGBToneCurveToLinearLUTInfo6s_kMaxE(%rip), %rax ## HG_ERsRGBToneCurveToLinearLUTInfo::s_kMax
00000000000f58b4	movsd	(%rax), %xmm1
00000000000f58b8	subsd	%xmm0, %xmm1
00000000000f58bc	movapd	%xmm1, -0x20(%rbp)
00000000000f58c1	movq	%rbx, %rdi
00000000000f58c4	callq	__ZN6HGNode9ClearBitsEv         ## HGNode::ClearBits()
00000000000f58c9	movapd	-0x20(%rbp), %xmm0
00000000000f58ce	unpcklpd	-0x30(%rbp), %xmm0              ## xmm0 = xmm0[0],mem[0]
00000000000f58d3	cvtpd2ps	%xmm0, %xmm0
00000000000f58d7	movb	$0x1, 0x2e9(%rbx)
00000000000f58de	movlpd	%xmm0, 0x484(%rbx)
00000000000f58e6	leaq	__ZN33HG_ERsRGBToneCurveToLinearLUTInfo14s_1DLUTnumBinsE(%rip), %rax ## HG_ERsRGBToneCurveToLinearLUTInfo::s_1DLUTnumBins
00000000000f58ed	jmp	0xf5a30
00000000000f58f2	movq	%rbx, %rdi
00000000000f58f5	callq	__ZN6HGNode9ClearBitsEv         ## HGNode::ClearBits()
00000000000f58fa	movb	$0x1, 0x2e9(%rbx)
00000000000f5901	movss	0x2d23b7(%rip), %xmm0
00000000000f5909	movaps	%xmm0, 0x380(%rbx)
00000000000f5910	movsd	0x2d2398(%rip), %xmm0
00000000000f5918	movaps	%xmm0, 0x390(%rbx)
00000000000f591f	movaps	0x2d514a(%rip), %xmm0
00000000000f5926	movaps	%xmm0, 0x3a0(%rbx)
00000000000f592d	movaps	0x2d46ac(%rip), %xmm0
00000000000f5934	movaps	%xmm0, 0x3b0(%rbx)
00000000000f593b	movq	%rbx, %rdi
00000000000f593e	callq	__ZN6HGNode9ClearBitsEv         ## HGNode::ClearBits()
00000000000f5943	movb	$0x1, 0x2e9(%rbx)
00000000000f594a	movss	0x2d236e(%rip), %xmm0
00000000000f5952	movaps	%xmm0, 0x3c0(%rbx)
00000000000f5959	movsd	0x2d234f(%rip), %xmm0
00000000000f5961	movaps	%xmm0, 0x3d0(%rbx)
00000000000f5968	movaps	0x2d5101(%rip), %xmm0
00000000000f596f	movaps	%xmm0, 0x3e0(%rbx)
00000000000f5976	movaps	0x2d4663(%rip), %xmm0
00000000000f597d	movaps	%xmm0, 0x3f0(%rbx)
00000000000f5984	movq	%rbx, %rdi
00000000000f5987	callq	__ZN6HGNode9ClearBitsEv         ## HGNode::ClearBits()
00000000000f598c	movb	$0x1, 0x2e9(%rbx)
00000000000f5993	xorps	%xmm0, %xmm0
00000000000f5996	movaps	%xmm0, 0x310(%rbx)
00000000000f599d	movaps	%xmm0, 0x320(%rbx)
00000000000f59a4	movaps	%xmm0, 0x330(%rbx)
00000000000f59ab	movaps	%xmm0, 0x340(%rbx)
00000000000f59b2	movaps	%xmm0, 0x350(%rbx)
00000000000f59b9	movaps	%xmm0, 0x360(%rbx)
00000000000f59c0	movq	$0x9, 0x404(%rbx)
00000000000f59cb	movaps	0x2d226e(%rip), %xmm0
00000000000f59d2	movaps	%xmm0, 0x300(%rbx)
00000000000f59d9	movb	$0x1, 0x370(%rbx)
00000000000f59e0	leaq	__ZN32HGLinearToERsRGBToneCurveLUTInfo6s_kMinE(%rip), %rax ## HGLinearToERsRGBToneCurveLUTInfo::s_kMin
00000000000f59e7	movsd	(%rax), %xmm0
00000000000f59eb	movapd	%xmm0, -0x30(%rbp)
00000000000f59f0	leaq	__ZN32HGLinearToERsRGBToneCurveLUTInfo6s_kMaxE(%rip), %rax ## HGLinearToERsRGBToneCurveLUTInfo::s_kMax
00000000000f59f7	movsd	(%rax), %xmm1
00000000000f59fb	subsd	%xmm0, %xmm1
00000000000f59ff	movapd	%xmm1, -0x20(%rbp)
00000000000f5a04	movq	%rbx, %rdi
00000000000f5a07	callq	__ZN6HGNode9ClearBitsEv         ## HGNode::ClearBits()
00000000000f5a0c	movapd	-0x20(%rbp), %xmm0
00000000000f5a11	unpcklpd	-0x30(%rbp), %xmm0              ## xmm0 = xmm0[0],mem[0]
00000000000f5a16	cvtpd2ps	%xmm0, %xmm0
00000000000f5a1a	movb	$0x1, 0x2e9(%rbx)
00000000000f5a21	movlpd	%xmm0, 0x484(%rbx)
00000000000f5a29	leaq	__ZN32HGLinearToERsRGBToneCurveLUTInfo14s_1DLUTnumBinsE(%rip), %rax ## HGLinearToERsRGBToneCurveLUTInfo::s_1DLUTnumBins
00000000000f5a30	movl	(%rax), %r14d
00000000000f5a33	movq	%rbx, %rdi
00000000000f5a36	callq	__ZN6HGNode9ClearBitsEv         ## HGNode::ClearBits()
00000000000f5a3b	movb	$0x1, 0x2e9(%rbx)
00000000000f5a42	movl	%r14d, 0x480(%rbx)
00000000000f5a49	movq	%rbx, %rdi
00000000000f5a4c	addq	$0x20, %rsp
00000000000f5a50	popq	%rbx
00000000000f5a51	popq	%r14
00000000000f5a53	popq	%rbp
00000000000f5a54	jmp	__ZN12HGColorGamma20SetYCbCrBiasAndScaleEv ## HGColorGamma::SetYCbCrBiasAndScale()
00000000000f5a59	nopl	(%rax)
00000000000f5a5c	.byte 0x1e #bad opcode
00000000000f5a5d	stc
00000000000f5a5e	.byte 0xff #bad opcode
00000000000f5a5f	callq	*(%rcx)
00000000000f5a61	cld
00000000000f5a62	.byte 0xff #bad opcode
00000000000f5a63	callq	*-0x6(%rcx)
00000000000f5a66	.byte 0xff #bad opcode
00000000000f5a67	callq	*%rax
00000000000f5a69	cli
00000000000f5a6a	.byte 0xff #bad opcode
00000000000f5a6b	lcalll	*(%rdx)
00000000000f5a6d	cli
00000000000f5a6e	.byte 0xff #bad opcode
00000000000f5a6f	callq	*-0x3(%rbx)
00000000000f5a72	.byte 0xff #bad opcode
00000000000f5a73	callq	*0xffffffe(%rsi)
00000000000f5a79	.byte 0x1f #bad opcode
00000000000f5a7a	testb	%al, (%rax)
00000000000f5a7c	addb	%al, (%rax)
00000000000f5a7e	addb	%al, (%rax)
