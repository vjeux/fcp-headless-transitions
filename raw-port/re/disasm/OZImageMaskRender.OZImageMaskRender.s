__ZN17OZImageMaskRenderC1EP11OZImageNodeRK14OZRenderParamsN13LiImageSource10ImageSpaceE:
000000000046e170	pushq	%rbp
000000000046e171	movq	%rsp, %rbp
000000000046e174	pushq	%r15
000000000046e176	pushq	%r14
000000000046e178	pushq	%r13
000000000046e17a	pushq	%r12
000000000046e17c	pushq	%rbx
000000000046e17d	subq	$0xd08, %rsp                    ## imm = 0xD08
000000000046e184	movl	%ecx, %r13d
000000000046e187	movq	%rdx, %r14
000000000046e18a	movq	%rsi, %r12
000000000046e18d	movq	%rdi, %rbx
000000000046e190	leaq	__ZTV13PCShared_base(%rip), %rax ## vtable for PCShared_base
000000000046e197	addq	$0x10, %rax
000000000046e19b	movq	%rax, 0x648(%rdi)
000000000046e1a2	movq	$0x0, 0x650(%rdi)
000000000046e1ad	leaq	0x638(%rdi), %r15
000000000046e1b4	leaq	0x3f9cd5(%rip), %rsi
000000000046e1bb	movq	%r15, %rdi
000000000046e1be	callq	0x6dd83c                        ## symbol stub for: __ZN13LiImageSourceC2Ev
000000000046e1c3	movq	%r15, -0x50(%rbp)
000000000046e1c7	leaq	0x3f9c9a(%rip), %rsi
000000000046e1ce	movq	%rbx, %rdi
000000000046e1d1	movq	%r12, %rdx
000000000046e1d4	movq	%r14, %rcx
000000000046e1d7	callq	__ZN17OZImageNodeRenderC2EP11OZImageNodeRK14OZRenderParams ## OZImageNodeRender::OZImageNodeRender(OZImageNode*, OZRenderParams const&)
000000000046e1dc	leaq	0x3f9aa5(%rip), %rax
000000000046e1e3	movq	%rax, (%rbx)
000000000046e1e6	leaq	0x3f9b93(%rip), %rax
000000000046e1ed	movq	%rax, 0x638(%rbx)
000000000046e1f4	leaq	0x3f9c4d(%rip), %rax
000000000046e1fb	movq	%rax, 0x648(%rbx)
000000000046e202	movq	$0x0, 0x5d0(%rbx)
000000000046e20d	movq	$0x0, 0x5e0(%rbx)
000000000046e218	leaq	0x5e8(%rbx), %r15
000000000046e21f	movq	%r15, %rdi
000000000046e222	callq	0x6ddae8                        ## symbol stub for: __ZN13PCSharedCountC1Ev
000000000046e227	xorps	%xmm0, %xmm0
000000000046e22a	movups	%xmm0, 0x5f0(%rbx)
000000000046e231	movaps	0x297188(%rip), %xmm0
000000000046e238	movups	%xmm0, 0x600(%rbx)
000000000046e23f	movl	%r13d, 0x614(%rbx)
000000000046e246	movq	$0x0, 0x618(%rbx)
000000000046e251	leaq	0x620(%rbx), %rdi
000000000046e258	movq	%rdi, -0x48(%rbp)
000000000046e25c	callq	0x6ddae8                        ## symbol stub for: __ZN13PCSharedCountC1Ev
000000000046e261	movq	$0x0, 0x628(%rbx)
000000000046e26c	leaq	0x630(%rbx), %rdi
000000000046e273	movq	%rdi, -0x40(%rbp)
000000000046e277	callq	0x6ddae8                        ## symbol stub for: __ZN13PCSharedCountC1Ev
000000000046e27c	movaps	0x29fedd(%rip), %xmm0
000000000046e283	movups	%xmm0, 0x5f0(%rbx)
000000000046e28a	movaps	0x29fedf(%rip), %xmm0
000000000046e291	movups	%xmm0, 0x600(%rbx)
000000000046e298	testq	%r12, %r12
000000000046e29b	je	0x46e2ba
000000000046e29d	leaq	__ZTI11OZImageNode(%rip), %rsi  ## typeinfo for OZImageNode
000000000046e2a4	leaq	__ZTI11OZImageMask(%rip), %rdx  ## typeinfo for OZImageMask
000000000046e2ab	movl	$0x438, %ecx                    ## imm = 0x438
000000000046e2b0	movq	%r12, %rdi
000000000046e2b3	callq	0x6dfd0e                        ## symbol stub for: ___dynamic_cast
000000000046e2b8	jmp	0x46e2bc
000000000046e2ba	xorl	%eax, %eax
000000000046e2bc	movq	%rax, 0x5d8(%rbx)
000000000046e2c3	leaq	-0xd10(%rbp), %rdi
000000000046e2ca	movq	%r14, %rsi
000000000046e2cd	callq	__ZN14OZRenderParamsC1ERKS_     ## OZRenderParams::OZRenderParams(OZRenderParams const&)
000000000046e2d2	movq	0x5d8(%rbx), %rsi
000000000046e2d9	movq	0x10(%r14), %rax
000000000046e2dd	movq	%rax, 0x10(%rsp)
000000000046e2e2	movups	(%r14), %xmm0
000000000046e2e6	movups	%xmm0, (%rsp)
000000000046e2ea	leaq	-0x748(%rbp), %rdi
000000000046e2f1	callq	__ZN11OZImageMask17getMaskSourceTimeE6CMTime ## OZImageMask::getMaskSourceTime(CMTime)
000000000046e2f6	movq	-0x738(%rbp), %rax
000000000046e2fd	movq	%rax, -0xd00(%rbp)
000000000046e304	movups	-0x748(%rbp), %xmm0
000000000046e30b	movaps	%xmm0, -0xd10(%rbp)
000000000046e312	xorps	%xmm0, %xmm0
000000000046e315	movups	%xmm0, -0xb88(%rbp)
000000000046e31c	movq	0x5d8(%rbx), %rdi
000000000046e323	movl	$0x1, %esi
000000000046e328	callq	__ZN11OZImageMask13getMaskSourceEb ## OZImageMask::getMaskSource(bool)
000000000046e32d	movq	%rax, %r12
000000000046e330	movq	0x5d8(%rbx), %rax
000000000046e337	movq	0x3b8(%rax), %rdi
000000000046e33e	testq	%rdi, %rdi
000000000046e341	je	0x46e3f5
000000000046e347	leaq	__ZTI11OZSceneNode(%rip), %rsi  ## typeinfo for OZSceneNode
000000000046e34e	leaq	__ZTI11OZImageNode(%rip), %rdx  ## typeinfo for OZImageNode
000000000046e355	movq	$-0x2, %rcx
000000000046e35c	callq	0x6dfd0e                        ## symbol stub for: ___dynamic_cast
000000000046e361	cmpq	%rax, %r12
000000000046e364	je	0x46e400
000000000046e36a	leaq	-0x748(%rbp), %rdi
000000000046e371	movq	%r14, %rsi
000000000046e374	callq	__ZN14OZRenderParamsC1ERKS_     ## OZRenderParams::OZRenderParams(OZRenderParams const&)
000000000046e379	leaq	-0x188(%rbp), %rdi
000000000046e380	leaq	-0xd10(%rbp), %rdx
000000000046e387	leaq	-0x748(%rbp), %rcx
000000000046e38e	movq	%rbx, %rsi
000000000046e391	callq	__ZN17OZImageMaskRender15makeImageSourceER14OZRenderParamsS1_ ## OZImageMaskRender::makeImageSource(OZRenderParams&, OZRenderParams&)
000000000046e396	movq	-0x188(%rbp), %rax
000000000046e39d	movq	%rax, 0x5e0(%rbx)
000000000046e3a4	leaq	-0x180(%rbp), %r12
000000000046e3ab	leaq	-0xb8(%rbp), %rdi
000000000046e3b2	movq	%r12, %rsi
000000000046e3b5	callq	0x6ddae2                        ## symbol stub for: __ZN13PCSharedCountC1ERKS_
000000000046e3ba	leaq	-0xb8(%rbp), %rsi
000000000046e3c1	movq	%r15, %rdi
000000000046e3c4	callq	0x6ddaf4                        ## symbol stub for: __ZN13PCSharedCountaSES_
000000000046e3c9	leaq	-0xb8(%rbp), %rdi
000000000046e3d0	callq	0x6ddaee                        ## symbol stub for: __ZN13PCSharedCountD1Ev
000000000046e3d5	movq	%r12, %rdi
000000000046e3d8	callq	0x6ddaee                        ## symbol stub for: __ZN13PCSharedCountD1Ev
000000000046e3dd	movb	$0x1, 0x610(%rbx)
000000000046e3e4	leaq	-0x748(%rbp), %rdi
000000000046e3eb	callq	__ZN14OZRenderParamsD1Ev        ## OZRenderParams::~OZRenderParams()
000000000046e3f0	jmp	0x46e5d9
000000000046e3f5	xorl	%eax, %eax
000000000046e3f7	cmpq	%rax, %r12
000000000046e3fa	jne	0x46e36a
000000000046e400	leaq	-0xb8(%rbp), %rdi
000000000046e407	leaq	-0xd10(%rbp), %rdx
000000000046e40e	movq	%r12, %rsi
000000000046e411	callq	__ZN30Render360GroupAsEquirectSentryC1EP11OZImageNodeR14OZRenderParams ## Render360GroupAsEquirectSentry::Render360GroupAsEquirectSentry(OZImageNode*, OZRenderParams&)
000000000046e416	testq	%r12, %r12
000000000046e419	je	0x46e43b
000000000046e41b	leaq	__ZTI11OZImageNode(%rip), %rsi  ## typeinfo for OZImageNode
000000000046e422	leaq	__ZTI9OZElement(%rip), %rdx     ## typeinfo for OZElement
000000000046e429	movl	$0x1978, %ecx                   ## imm = 0x1978
000000000046e42e	movq	%r12, %rdi
000000000046e431	callq	0x6dfd0e                        ## symbol stub for: ___dynamic_cast
000000000046e436	movq	%rax, %r12
000000000046e439	jmp	0x46e43e
000000000046e43b	xorl	%r12d, %r12d
000000000046e43e	leaq	-0x70(%rbp), %rsi
000000000046e442	movq	%r14, %rdi
000000000046e445	callq	__ZNK14OZRenderParams15getLiAASettingsEP12LiAASettings ## OZRenderParams::getLiAASettings(LiAASettings*) const
000000000046e44a	movl	$0x298, %edi                    ## imm = 0x298
000000000046e44f	callq	0x6dfca2                        ## symbol stub for: __Znwm
000000000046e454	movq	%rax, %r13
000000000046e457	movq	%rax, %rdi
000000000046e45a	callq	0x6debe0                        ## symbol stub for: __ZN7LiGroupC1Ev
000000000046e45f	movq	%r13, -0x748(%rbp)
000000000046e466	movq	(%r13), %rax
000000000046e46a	addq	-0x18(%rax), %r13
000000000046e46e	leaq	-0x740(%rbp), %r14
000000000046e475	movq	%r14, %rdi
000000000046e478	movq	%r13, %rsi
000000000046e47b	callq	0x6ddadc                        ## symbol stub for: __ZN13PCSharedCountC1EP13PCShared_base
000000000046e480	leaq	-0x188(%rbp), %r13
000000000046e487	leaq	-0x748(%rbp), %rsi
000000000046e48e	leaq	-0x70(%rbp), %rdx
000000000046e492	movq	%r13, %rdi
000000000046e495	callq	0x6ddc08                        ## symbol stub for: __ZN14LiGraphBuilderC1ERK5PCPtrI7LiGroupERK12LiAASettings
000000000046e49a	movq	%r14, %rdi
000000000046e49d	callq	0x6ddaee                        ## symbol stub for: __ZN13PCSharedCountD1Ev
000000000046e4a2	leaq	-0x748(%rbp), %rdi
000000000046e4a9	callq	__ZN18OZRenderGraphStateC1Ev    ## OZRenderGraphState::OZRenderGraphState()
000000000046e4ae	movq	%r13, -0x620(%rbp)
000000000046e4b5	movq	(%r12), %rax
000000000046e4b9	leaq	-0x60(%rbp), %rdi
000000000046e4bd	leaq	-0xd10(%rbp), %rdx
000000000046e4c4	leaq	-0x748(%rbp), %rcx
000000000046e4cb	movq	%r12, %rsi
000000000046e4ce	xorl	%r8d, %r8d
000000000046e4d1	callq	*0x7a8(%rax)
000000000046e4d7	movq	-0x60(%rbp), %rax
000000000046e4db	movq	%rax, 0x5e0(%rbx)
000000000046e4e2	leaq	-0x58(%rbp), %r12
000000000046e4e6	leaq	-0x38(%rbp), %rdi
000000000046e4ea	movq	%r12, %rsi
000000000046e4ed	callq	0x6ddae2                        ## symbol stub for: __ZN13PCSharedCountC1ERKS_
000000000046e4f2	leaq	-0x38(%rbp), %rsi
000000000046e4f6	movq	%r15, %rdi
000000000046e4f9	callq	0x6ddaf4                        ## symbol stub for: __ZN13PCSharedCountaSES_
000000000046e4fe	leaq	-0x38(%rbp), %rdi
000000000046e502	callq	0x6ddaee                        ## symbol stub for: __ZN13PCSharedCountD1Ev
000000000046e507	movq	%r12, %rdi
000000000046e50a	callq	0x6ddaee                        ## symbol stub for: __ZN13PCSharedCountD1Ev
000000000046e50f	movb	$0x0, 0x610(%rbx)
000000000046e516	leaq	-0x668(%rbp), %rdi
000000000046e51d	leaq	__ZTV7PCArrayI7LiLight14PCArray_TraitsIS0_EE(%rip), %rax ## vtable for PCArray<LiLight, PCArray_Traits<LiLight>>
000000000046e524	addq	$0x10, %rax
000000000046e528	movq	%rax, -0x668(%rbp)
000000000046e52f	movl	-0x660(%rbp), %eax
000000000046e535	testl	%eax, %eax
000000000046e537	movl	$0x1, %edx
000000000046e53c	cmovnsl	%eax, %edx
000000000046e53f	xorl	%esi, %esi
000000000046e541	callq	__ZN7PCArrayI7LiLight14PCArray_TraitsIS0_EE6resizeEii ## PCArray<LiLight, PCArray_Traits<LiLight>>::resize(int, int)
000000000046e546	movq	-0x658(%rbp), %rdi
000000000046e54d	testq	%rdi, %rdi
000000000046e550	je	0x46e557
000000000046e552	callq	0x6dfc30                        ## symbol stub for: __ZdaPv
000000000046e557	movq	$0x0, -0x658(%rbp)
000000000046e562	movl	$0x0, -0x660(%rbp)
000000000046e56c	cmpq	$0x0, -0x6f8(%rbp)
000000000046e574	je	0x46e5c1
000000000046e576	leaq	-0x708(%rbp), %rbx
000000000046e57d	movq	-0x708(%rbp), %rax
000000000046e584	movq	-0x700(%rbp), %rdi
000000000046e58b	movq	0x8(%rax), %rax
000000000046e58f	movq	(%rdi), %rcx
000000000046e592	movq	%rax, 0x8(%rcx)
000000000046e596	movq	%rcx, (%rax)
000000000046e599	movq	$0x0, -0x6f8(%rbp)
000000000046e5a4	cmpq	%rbx, %rdi
000000000046e5a7	je	0x46e5c1
000000000046e5a9	nopl	(%rax)
000000000046e5b0	movq	0x8(%rdi), %r14
000000000046e5b4	callq	0x6dfc36                        ## symbol stub for: __ZdlPv
000000000046e5b9	movq	%r14, %rdi
000000000046e5bc	cmpq	%rbx, %r14
000000000046e5bf	jne	0x46e5b0
000000000046e5c1	leaq	-0x188(%rbp), %rdi
000000000046e5c8	callq	0x6ddc14                        ## symbol stub for: __ZN14LiGraphBuilderD1Ev
000000000046e5cd	leaq	-0xb8(%rbp), %rdi
000000000046e5d4	callq	__ZN30Render360GroupAsEquirectSentryD1Ev ## Render360GroupAsEquirectSentry::~Render360GroupAsEquirectSentry()
000000000046e5d9	leaq	-0xd10(%rbp), %rdi
000000000046e5e0	callq	__ZN14OZRenderParamsD1Ev        ## OZRenderParams::~OZRenderParams()
000000000046e5e5	addq	$0xd08, %rsp                    ## imm = 0xD08
000000000046e5ec	popq	%rbx
000000000046e5ed	popq	%r12
000000000046e5ef	popq	%r13
000000000046e5f1	popq	%r14
000000000046e5f3	popq	%r15
000000000046e5f5	popq	%rbp
000000000046e5f6	retq
000000000046e5f7	movq	%rax, %rdi
000000000046e5fa	callq	___clang_call_terminate
000000000046e5ff	movq	%rax, -0x30(%rbp)
000000000046e603	leaq	-0x38(%rbp), %rdi
000000000046e607	callq	0x6ddaee                        ## symbol stub for: __ZN13PCSharedCountD1Ev
000000000046e60c	jmp	0x46e612
000000000046e60e	movq	%rax, -0x30(%rbp)
000000000046e612	movq	%r12, %rdi
000000000046e615	callq	0x6ddaee                        ## symbol stub for: __ZN13PCSharedCountD1Ev
000000000046e61a	jmp	0x46e620
000000000046e61c	movq	%rax, -0x30(%rbp)
000000000046e620	leaq	-0x748(%rbp), %rdi
000000000046e627	callq	__ZN18OZRenderGraphStateD1Ev    ## OZRenderGraphState::~OZRenderGraphState()
000000000046e62c	jmp	0x46e632
000000000046e62e	movq	%rax, -0x30(%rbp)
000000000046e632	leaq	-0x188(%rbp), %rdi
000000000046e639	callq	0x6ddc14                        ## symbol stub for: __ZN14LiGraphBuilderD1Ev
000000000046e63e	jmp	0x46e698
000000000046e640	movq	%rax, -0x30(%rbp)
000000000046e644	movq	%r14, %rdi
000000000046e647	callq	0x6ddaee                        ## symbol stub for: __ZN13PCSharedCountD1Ev
000000000046e64c	jmp	0x46e698
000000000046e64e	movq	%rax, -0x30(%rbp)
000000000046e652	movq	%r13, %rdi
000000000046e655	callq	0x6dfc36                        ## symbol stub for: __ZdlPv
000000000046e65a	jmp	0x46e698
000000000046e65c	jmp	0x46e694
000000000046e65e	jmp	0x46e6a8
000000000046e660	movq	%rax, -0x30(%rbp)
000000000046e664	leaq	-0xb8(%rbp), %rdi
000000000046e66b	callq	0x6ddaee                        ## symbol stub for: __ZN13PCSharedCountD1Ev
000000000046e670	jmp	0x46e676
000000000046e672	movq	%rax, -0x30(%rbp)
000000000046e676	movq	%r12, %rdi
000000000046e679	callq	0x6ddaee                        ## symbol stub for: __ZN13PCSharedCountD1Ev
000000000046e67e	jmp	0x46e684
000000000046e680	movq	%rax, -0x30(%rbp)
000000000046e684	leaq	-0x748(%rbp), %rdi
000000000046e68b	callq	__ZN14OZRenderParamsD1Ev        ## OZRenderParams::~OZRenderParams()
000000000046e690	jmp	0x46e6ac
000000000046e692	jmp	0x46e6a8
000000000046e694	movq	%rax, -0x30(%rbp)
000000000046e698	leaq	-0xb8(%rbp), %rdi
000000000046e69f	callq	__ZN30Render360GroupAsEquirectSentryD1Ev ## Render360GroupAsEquirectSentry::~Render360GroupAsEquirectSentry()
000000000046e6a4	jmp	0x46e6ac
000000000046e6a6	jmp	0x46e6a8
000000000046e6a8	movq	%rax, -0x30(%rbp)
000000000046e6ac	leaq	-0xd10(%rbp), %rdi
000000000046e6b3	callq	__ZN14OZRenderParamsD1Ev        ## OZRenderParams::~OZRenderParams()
000000000046e6b8	movq	-0x40(%rbp), %rdi
000000000046e6bc	callq	0x6ddaee                        ## symbol stub for: __ZN13PCSharedCountD1Ev
000000000046e6c1	movq	-0x48(%rbp), %rdi
000000000046e6c5	callq	0x6ddaee                        ## symbol stub for: __ZN13PCSharedCountD1Ev
000000000046e6ca	movq	%r15, %rdi
000000000046e6cd	callq	0x6ddaee                        ## symbol stub for: __ZN13PCSharedCountD1Ev
000000000046e6d2	leaq	0x3f97f7(%rip), %rax
000000000046e6d9	movq	%rax, (%rbx)
000000000046e6dc	leaq	0x3f98e5(%rip), %rax
000000000046e6e3	movq	%rax, 0x638(%rbx)
000000000046e6ea	leaq	0x3f999f(%rip), %rax
000000000046e6f1	movq	%rax, 0x648(%rbx)
000000000046e6f8	leaq	0x10(%rbx), %rdi
000000000046e6fc	callq	__ZN14OZRenderParamsD1Ev        ## OZRenderParams::~OZRenderParams()
000000000046e701	leaq	0x3f9788(%rip), %rsi
000000000046e708	movq	-0x50(%rbp), %rdi
000000000046e70c	callq	0x6dd842                        ## symbol stub for: __ZN13LiImageSourceD2Ev
000000000046e711	addq	$0x648, %rbx                    ## imm = 0x648
000000000046e718	movq	%rbx, %rdi
000000000046e71b	callq	__ZN13PCShared_baseD2Ev         ## PCShared_base::~PCShared_base()
000000000046e720	movq	-0x30(%rbp), %rdi
000000000046e724	callq	0x6dd07a                        ## symbol stub for: __Unwind_Resume
000000000046e729	movq	%rax, -0x30(%rbp)
000000000046e72d	jmp	0x46e6b8
000000000046e72f	movq	%rax, -0x30(%rbp)
000000000046e733	jmp	0x46e6c1
000000000046e735	movq	%rax, -0x30(%rbp)
000000000046e739	jmp	0x46e6ca
000000000046e73b	movq	%rax, -0x30(%rbp)
000000000046e73f	jmp	0x46e6d2
000000000046e741	movq	%rax, -0x30(%rbp)
000000000046e745	jmp	0x46e701
000000000046e747	movq	%rax, -0x30(%rbp)
000000000046e74b	jmp	0x46e711
000000000046e74d	nopl	(%rax)
