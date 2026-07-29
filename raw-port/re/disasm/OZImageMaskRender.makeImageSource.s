__ZN17OZImageMaskRender15makeImageSourceER14OZRenderParamsS1_:
000000000046d450	pushq	%rbp
000000000046d451	movq	%rsp, %rbp
000000000046d454	pushq	%r15
000000000046d456	pushq	%r14
000000000046d458	pushq	%r13
000000000046d45a	pushq	%r12
000000000046d45c	pushq	%rbx
000000000046d45d	subq	$0x378, %rsp                    ## imm = 0x378
000000000046d464	movq	%rcx, -0x88(%rbp)
000000000046d46b	movq	%rdx, %r15
000000000046d46e	movq	%rsi, %r13
000000000046d471	movq	%rdi, %r14
000000000046d474	movq	0x5d8(%rsi), %rdi
000000000046d47b	movq	(%rdi), %rax
000000000046d47e	callq	*0x518(%rax)
000000000046d484	movl	%eax, %ebx
000000000046d486	movl	$0x988, %edi                    ## imm = 0x988
000000000046d48b	addq	0x5d8(%r13), %rdi
000000000046d492	movq	0x3b7077(%rip), %rsi            ## literal pool symbol address: _kCMTimeZero
000000000046d499	xorps	%xmm0, %xmm0
000000000046d49c	callq	0x6dfa80                        ## symbol stub for: __ZNK9OZChannel13getValueAsIntERK6CMTimed
000000000046d4a1	movl	%eax, %r12d
000000000046d4a4	movq	%r13, -0x40(%rbp)
000000000046d4a8	movq	0x5d8(%r13), %rdi
000000000046d4af	movl	$0x1, %esi
000000000046d4b4	callq	__ZN11OZImageMask13getMaskSourceEb ## OZImageMask::getMaskSource(bool)
000000000046d4b9	movq	%rax, %r13
000000000046d4bc	movq	$0x0, (%r14)
000000000046d4c3	movq	%r14, -0x30(%rbp)
000000000046d4c7	leaq	0x8(%r14), %rdi
000000000046d4cb	movq	%rdi, -0x38(%rbp)
000000000046d4cf	callq	0x6ddae8                        ## symbol stub for: __ZN13PCSharedCountC1Ev
000000000046d4d4	testq	%r13, %r13
000000000046d4d7	je	0x46df3d
000000000046d4dd	leaq	-0x380(%rbp), %rdi
000000000046d4e4	movq	%r13, %rsi
000000000046d4e7	movq	%r15, -0x58(%rbp)
000000000046d4eb	movq	%r15, %rdx
000000000046d4ee	callq	__ZN30Render360GroupAsEquirectSentryC1EP11OZImageNodeR14OZRenderParams ## Render360GroupAsEquirectSentry::Render360GroupAsEquirectSentry(OZImageNode*, OZRenderParams&)
000000000046d4f3	testl	%r12d, %r12d
000000000046d4f6	sete	%al
000000000046d4f9	andb	%bl, %al
000000000046d4fb	cmpb	$0x1, %al
000000000046d4fd	jne	0x46d63e
000000000046d503	movl	$0x298, %edi                    ## imm = 0x298
000000000046d508	callq	0x6dfca2                        ## symbol stub for: __Znwm
000000000046d50d	movq	%rax, %rbx
000000000046d510	movq	%rax, %rdi
000000000046d513	callq	0x6debe0                        ## symbol stub for: __ZN7LiGroupC1Ev
000000000046d518	movq	%rbx, -0x78(%rbp)
000000000046d51c	movq	(%rbx), %rax
000000000046d51f	addq	-0x18(%rax), %rbx
000000000046d523	leaq	-0x70(%rbp), %rdi
000000000046d527	movq	%rbx, %rsi
000000000046d52a	callq	0x6ddadc                        ## symbol stub for: __ZN13PCSharedCountC1EP13PCShared_base
000000000046d52f	leaq	-0x98(%rbp), %rsi
000000000046d536	movq	-0x58(%rbp), %rdi
000000000046d53a	callq	__ZNK14OZRenderParams15getLiAASettingsEP12LiAASettings ## OZRenderParams::getLiAASettings(LiAASettings*) const
000000000046d53f	leaq	-0x338(%rbp), %rbx
000000000046d546	leaq	-0x78(%rbp), %rsi
000000000046d54a	leaq	-0x98(%rbp), %rdx
000000000046d551	movq	%rbx, %rdi
000000000046d554	callq	0x6ddc08                        ## symbol stub for: __ZN14LiGraphBuilderC1ERK5PCPtrI7LiGroupERK12LiAASettings
000000000046d559	leaq	-0x268(%rbp), %rdi
000000000046d560	callq	__ZN18OZRenderGraphStateC1Ev    ## OZRenderGraphState::OZRenderGraphState()
000000000046d565	movq	%rbx, -0x140(%rbp)
000000000046d56c	leaq	__ZTI11OZImageNode(%rip), %rsi  ## typeinfo for OZImageNode
000000000046d573	leaq	__ZTI9OZElement(%rip), %rdx     ## typeinfo for OZElement
000000000046d57a	movl	$0x1978, %ecx                   ## imm = 0x1978
000000000046d57f	movq	%r13, %rdi
000000000046d582	callq	0x6dfd0e                        ## symbol stub for: ___dynamic_cast
000000000046d587	testq	%rax, %rax
000000000046d58a	movq	%rax, -0x80(%rbp)
000000000046d58e	je	0x46d7e6
000000000046d594	movq	0x3b8(%rax), %rdi
000000000046d59b	testq	%rdi, %rdi
000000000046d59e	movq	-0x58(%rbp), %r15
000000000046d5a2	je	0x46d5d4
000000000046d5a4	leaq	__ZTI11OZSceneNode(%rip), %rsi  ## typeinfo for OZSceneNode
000000000046d5ab	leaq	__ZTI9OZElement(%rip), %rdx     ## typeinfo for OZElement
000000000046d5b2	xorl	%ecx, %ecx
000000000046d5b4	callq	0x6dfd0e                        ## symbol stub for: ___dynamic_cast
000000000046d5b9	testq	%rax, %rax
000000000046d5bc	je	0x46d5d4
000000000046d5be	movq	(%rax), %rcx
000000000046d5c1	leaq	-0x338(%rbp), %rsi
000000000046d5c8	movq	%rax, %rdi
000000000046d5cb	movq	%r15, %rdx
000000000046d5ce	callq	*0x7e8(%rcx)
000000000046d5d4	movq	-0x80(%rbp), %rdi
000000000046d5d8	movq	(%rdi), %rax
000000000046d5db	leaq	-0x338(%rbp), %rdx
000000000046d5e2	leaq	-0x268(%rbp), %rcx
000000000046d5e9	movq	%r15, %rsi
000000000046d5ec	callq	*0x800(%rax)
000000000046d5f2	leaq	-0x50(%rbp), %rdi
000000000046d5f6	leaq	-0x338(%rbp), %rsi
000000000046d5fd	callq	0x6ddbea                        ## symbol stub for: __ZN14LiGraphBuilder6renderEv
000000000046d602	movq	-0x40(%rbp), %r13
000000000046d606	movq	-0x50(%rbp), %rax
000000000046d60a	movq	-0x30(%rbp), %rcx
000000000046d60e	movq	%rax, (%rcx)
000000000046d611	testq	%rax, %rax
000000000046d614	je	0x46d8e5
000000000046d61a	leaq	-0x48(%rbp), %rsi
000000000046d61e	leaq	-0x118(%rbp), %rbx
000000000046d625	movq	%rbx, %rdi
000000000046d628	callq	0x6ddae2                        ## symbol stub for: __ZN13PCSharedCountC1ERKS_
000000000046d62d	movq	-0x38(%rbp), %rdi
000000000046d631	movq	%rbx, %rsi
000000000046d634	callq	0x6ddaf4                        ## symbol stub for: __ZN13PCSharedCountaSES_
000000000046d639	jmp	0x46d900
000000000046d63e	leaq	-0x118(%rbp), %rsi
000000000046d645	movq	-0x58(%rbp), %rdi
000000000046d649	callq	__ZNK14OZRenderParams15getLiAASettingsEP12LiAASettings ## OZRenderParams::getLiAASettings(LiAASettings*) const
000000000046d64e	movl	$0x298, %edi                    ## imm = 0x298
000000000046d653	callq	0x6dfca2                        ## symbol stub for: __Znwm
000000000046d658	movq	%rax, %r12
000000000046d65b	movq	%rax, %rdi
000000000046d65e	callq	0x6debe0                        ## symbol stub for: __ZN7LiGroupC1Ev
000000000046d663	movq	%r12, -0x268(%rbp)
000000000046d66a	movq	(%r12), %rax
000000000046d66e	addq	-0x18(%rax), %r12
000000000046d672	leaq	-0x260(%rbp), %rbx
000000000046d679	movq	%rbx, %rdi
000000000046d67c	movq	%r12, %rsi
000000000046d67f	callq	0x6ddadc                        ## symbol stub for: __ZN13PCSharedCountC1EP13PCShared_base
000000000046d684	leaq	-0x338(%rbp), %r12
000000000046d68b	leaq	-0x268(%rbp), %rsi
000000000046d692	leaq	-0x118(%rbp), %rdx
000000000046d699	movq	%r12, %rdi
000000000046d69c	callq	0x6ddc08                        ## symbol stub for: __ZN14LiGraphBuilderC1ERK5PCPtrI7LiGroupERK12LiAASettings
000000000046d6a1	movq	%rbx, %rdi
000000000046d6a4	callq	0x6ddaee                        ## symbol stub for: __ZN13PCSharedCountD1Ev
000000000046d6a9	leaq	-0x268(%rbp), %rdi
000000000046d6b0	callq	__ZN18OZRenderGraphStateC1Ev    ## OZRenderGraphState::OZRenderGraphState()
000000000046d6b5	movq	%r12, -0x140(%rbp)
000000000046d6bc	movq	(%r13), %rax
000000000046d6c0	leaq	-0x78(%rbp), %rdi
000000000046d6c4	leaq	-0x268(%rbp), %rcx
000000000046d6cb	movq	%r13, %rsi
000000000046d6ce	movq	-0x58(%rbp), %rdx
000000000046d6d2	movl	$0x1, %r8d
000000000046d6d8	callq	*0x98(%rax)
000000000046d6de	movq	-0x78(%rbp), %rax
000000000046d6e2	movq	-0x30(%rbp), %rcx
000000000046d6e6	movq	%rax, (%rcx)
000000000046d6e9	leaq	-0x70(%rbp), %rbx
000000000046d6ed	leaq	-0x98(%rbp), %rdi
000000000046d6f4	movq	%rbx, %rsi
000000000046d6f7	callq	0x6ddae2                        ## symbol stub for: __ZN13PCSharedCountC1ERKS_
000000000046d6fc	movq	-0x40(%rbp), %r13
000000000046d700	leaq	-0x98(%rbp), %rsi
000000000046d707	movq	-0x38(%rbp), %rdi
000000000046d70b	callq	0x6ddaf4                        ## symbol stub for: __ZN13PCSharedCountaSES_
000000000046d710	leaq	-0x98(%rbp), %rdi
000000000046d717	callq	0x6ddaee                        ## symbol stub for: __ZN13PCSharedCountD1Ev
000000000046d71c	movq	%rbx, %rdi
000000000046d71f	callq	0x6ddaee                        ## symbol stub for: __ZN13PCSharedCountD1Ev
000000000046d724	leaq	-0x188(%rbp), %rdi
000000000046d72b	leaq	__ZTV7PCArrayI7LiLight14PCArray_TraitsIS0_EE(%rip), %rax ## vtable for PCArray<LiLight, PCArray_Traits<LiLight>>
000000000046d732	addq	$0x10, %rax
000000000046d736	movq	%rax, -0x188(%rbp)
000000000046d73d	movl	-0x180(%rbp), %eax
000000000046d743	testl	%eax, %eax
000000000046d745	movl	$0x1, %edx
000000000046d74a	cmovnsl	%eax, %edx
000000000046d74d	xorl	%esi, %esi
000000000046d74f	callq	__ZN7PCArrayI7LiLight14PCArray_TraitsIS0_EE6resizeEii ## PCArray<LiLight, PCArray_Traits<LiLight>>::resize(int, int)
000000000046d754	movq	-0x178(%rbp), %rdi
000000000046d75b	testq	%rdi, %rdi
000000000046d75e	je	0x46d765
000000000046d760	callq	0x6dfc30                        ## symbol stub for: __ZdaPv
000000000046d765	movq	$0x0, -0x178(%rbp)
000000000046d770	movl	$0x0, -0x180(%rbp)
000000000046d77a	cmpq	$0x0, -0x218(%rbp)
000000000046d782	je	0x46d7d1
000000000046d784	leaq	-0x228(%rbp), %rbx
000000000046d78b	movq	-0x228(%rbp), %rax
000000000046d792	movq	-0x220(%rbp), %rdi
000000000046d799	movq	0x8(%rax), %rax
000000000046d79d	movq	(%rdi), %rcx
000000000046d7a0	movq	%rax, 0x8(%rcx)
000000000046d7a4	movq	%rcx, (%rax)
000000000046d7a7	movq	$0x0, -0x218(%rbp)
000000000046d7b2	cmpq	%rbx, %rdi
000000000046d7b5	je	0x46d7d1
000000000046d7b7	nopw	(%rax,%rax)
000000000046d7c0	movq	0x8(%rdi), %r14
000000000046d7c4	callq	0x6dfc36                        ## symbol stub for: __ZdlPv
000000000046d7c9	movq	%r14, %rdi
000000000046d7cc	cmpq	%rbx, %r14
000000000046d7cf	jne	0x46d7c0
000000000046d7d1	leaq	-0x338(%rbp), %rdi
000000000046d7d8	callq	0x6ddc14                        ## symbol stub for: __ZN14LiGraphBuilderD1Ev
000000000046d7dd	movq	-0x38(%rbp), %rbx
000000000046d7e1	jmp	0x46dca5
000000000046d7e6	movq	(%r13), %rax
000000000046d7ea	leaq	-0x118(%rbp), %rdi
000000000046d7f1	leaq	-0x268(%rbp), %rcx
000000000046d7f8	movq	%r13, %rsi
000000000046d7fb	movq	-0x58(%rbp), %rdx
000000000046d7ff	movl	$0x1, %r8d
000000000046d805	callq	*0x98(%rax)
000000000046d80b	movq	-0x118(%rbp), %rax
000000000046d812	movq	-0x30(%rbp), %rcx
000000000046d816	movq	%rax, (%rcx)
000000000046d819	leaq	-0x110(%rbp), %rbx
000000000046d820	leaq	-0x50(%rbp), %rdi
000000000046d824	movq	%rbx, %rsi
000000000046d827	callq	0x6ddae2                        ## symbol stub for: __ZN13PCSharedCountC1ERKS_
000000000046d82c	movq	-0x40(%rbp), %r15
000000000046d830	leaq	-0x50(%rbp), %rsi
000000000046d834	movq	-0x38(%rbp), %r14
000000000046d838	movq	%r14, %rdi
000000000046d83b	callq	0x6ddaf4                        ## symbol stub for: __ZN13PCSharedCountaSES_
000000000046d840	leaq	-0x50(%rbp), %rdi
000000000046d844	callq	0x6ddaee                        ## symbol stub for: __ZN13PCSharedCountD1Ev
000000000046d849	movq	%rbx, %rdi
000000000046d84c	callq	0x6ddaee                        ## symbol stub for: __ZN13PCSharedCountD1Ev
000000000046d851	movq	0x5d8(%r15), %r12
000000000046d858	movq	-0x30(%rbp), %rax
000000000046d85c	movq	(%rax), %rax
000000000046d85f	movq	%rax, -0x138(%rbp)
000000000046d866	leaq	-0x130(%rbp), %rbx
000000000046d86d	movq	%rbx, %rdi
000000000046d870	movq	%r14, %rsi
000000000046d873	callq	0x6ddae2                        ## symbol stub for: __ZN13PCSharedCountC1ERKS_
000000000046d878	leaq	-0x118(%rbp), %rdi
000000000046d87f	leaq	-0x138(%rbp), %rdx
000000000046d886	movq	%r12, %rsi
000000000046d889	movq	-0x88(%rbp), %rcx
000000000046d890	callq	__ZN11OZImageMask24applySegmentationFiltersE5PCPtrI13LiImageSourceERK14OZRenderParams ## OZImageMask::applySegmentationFilters(PCPtr<LiImageSource>, OZRenderParams const&)
000000000046d895	movq	-0x118(%rbp), %rax
000000000046d89c	movq	-0x30(%rbp), %rcx
000000000046d8a0	movq	%rax, (%rcx)
000000000046d8a3	leaq	-0x110(%rbp), %r13
000000000046d8aa	leaq	-0x50(%rbp), %rdi
000000000046d8ae	movq	%r13, %rsi
000000000046d8b1	callq	0x6ddae2                        ## symbol stub for: __ZN13PCSharedCountC1ERKS_
000000000046d8b6	leaq	-0x50(%rbp), %rsi
000000000046d8ba	movq	-0x38(%rbp), %rdi
000000000046d8be	callq	0x6ddaf4                        ## symbol stub for: __ZN13PCSharedCountaSES_
000000000046d8c3	leaq	-0x50(%rbp), %rdi
000000000046d8c7	callq	0x6ddaee                        ## symbol stub for: __ZN13PCSharedCountD1Ev
000000000046d8cc	movq	%r13, %rdi
000000000046d8cf	callq	0x6ddaee                        ## symbol stub for: __ZN13PCSharedCountD1Ev
000000000046d8d4	movq	%rbx, %rdi
000000000046d8d7	callq	0x6ddaee                        ## symbol stub for: __ZN13PCSharedCountD1Ev
000000000046d8dc	movq	-0x40(%rbp), %r13
000000000046d8e0	jmp	0x46dbdc
000000000046d8e5	leaq	-0x118(%rbp), %rbx
000000000046d8ec	movq	%rbx, %rdi
000000000046d8ef	callq	0x6ddae8                        ## symbol stub for: __ZN13PCSharedCountC1Ev
000000000046d8f4	movq	-0x38(%rbp), %rdi
000000000046d8f8	movq	%rbx, %rsi
000000000046d8fb	callq	0x6ddaf4                        ## symbol stub for: __ZN13PCSharedCountaSES_
000000000046d900	movq	%rbx, %rdi
000000000046d903	callq	0x6ddaee                        ## symbol stub for: __ZN13PCSharedCountD1Ev
000000000046d908	movl	0x614(%r13), %r12d
000000000046d90f	cmpb	$0x1, 0xef(%r15)
000000000046d917	jne	0x46d9fa
000000000046d91d	movq	-0x50(%rbp), %rax
000000000046d921	movq	%rax, 0x628(%r13)
000000000046d928	leaq	-0x48(%rbp), %rsi
000000000046d92c	leaq	-0x118(%rbp), %rdi
000000000046d933	callq	0x6ddae2                        ## symbol stub for: __ZN13PCSharedCountC1ERKS_
000000000046d938	leaq	0x630(%r13), %rdi
000000000046d93f	leaq	-0x118(%rbp), %rsi
000000000046d946	callq	0x6ddaf4                        ## symbol stub for: __ZN13PCSharedCountaSES_
000000000046d94b	leaq	-0x118(%rbp), %rdi
000000000046d952	callq	0x6ddaee                        ## symbol stub for: __ZN13PCSharedCountD1Ev
000000000046d957	cmpl	$0x1, %r12d
000000000046d95b	jne	0x46dbd3
000000000046d961	movl	$0x170, %edi                    ## imm = 0x170
000000000046d966	callq	0x6dfca2                        ## symbol stub for: __Znwm
000000000046d96b	movq	%rax, %rbx
000000000046d96e	movq	%rax, %rdi
000000000046d971	callq	__ZN16LiImageTransformC1Ev      ## LiImageTransform::LiImageTransform()
000000000046d976	movq	%rbx, -0x118(%rbp)
000000000046d97d	movq	(%rbx), %rax
000000000046d980	addq	-0x18(%rax), %rbx
000000000046d984	leaq	-0x110(%rbp), %r13
000000000046d98b	movq	%r13, %rdi
000000000046d98e	movq	%rbx, %rsi
000000000046d991	callq	0x6ddadc                        ## symbol stub for: __ZN13PCSharedCountC1EP13PCShared_base
000000000046d996	movq	-0x118(%rbp), %rdi
000000000046d99d	testq	%rdi, %rdi
000000000046d9a0	jne	0x46d9b3
000000000046d9a2	movl	$0x1, %edi
000000000046d9a7	callq	0x6dd290                        ## symbol stub for: __Z28throw_PCNullPointerExceptionb
000000000046d9ac	movq	-0x118(%rbp), %rdi
000000000046d9b3	movq	-0x30(%rbp), %rax
000000000046d9b7	movq	(%rax), %rsi
000000000046d9ba	movq	(%rdi), %rax
000000000046d9bd	callq	*0xa8(%rax)
000000000046d9c3	movq	-0x118(%rbp), %rax
000000000046d9ca	movq	-0x30(%rbp), %rcx
000000000046d9ce	movq	%rax, (%rcx)
000000000046d9d1	testq	%rax, %rax
000000000046d9d4	je	0x46db6c
000000000046d9da	leaq	-0x68(%rbp), %rbx
000000000046d9de	movq	%rbx, %rdi
000000000046d9e1	movq	%r13, %rsi
000000000046d9e4	callq	0x6ddae2                        ## symbol stub for: __ZN13PCSharedCountC1ERKS_
000000000046d9e9	movq	-0x38(%rbp), %rdi
000000000046d9ed	movq	%rbx, %rsi
000000000046d9f0	callq	0x6ddaf4                        ## symbol stub for: __ZN13PCSharedCountaSES_
000000000046d9f5	jmp	0x46db84
000000000046d9fa	movq	0x538(%r15), %rbx
000000000046da01	movq	-0x50(%rbp), %rdi
000000000046da05	testq	%rdi, %rdi
000000000046da08	jne	0x46da18
000000000046da0a	movl	$0x1, %edi
000000000046da0f	callq	0x6dd290                        ## symbol stub for: __Z28throw_PCNullPointerExceptionb
000000000046da14	movq	-0x50(%rbp), %rdi
000000000046da18	movq	(%rdi), %rax
000000000046da1b	movq	%rbx, %rsi
000000000046da1e	callq	*0xb8(%rax)
000000000046da24	movq	0x5d8(%r13), %rax
000000000046da2b	movq	0x3b8(%rax), %rdi
000000000046da32	testq	%rdi, %rdi
000000000046da35	je	0x46dbd3
000000000046da3b	cmpl	$0x1, %r12d
000000000046da3f	sete	%r14b
000000000046da43	leaq	__ZTI11OZSceneNode(%rip), %rsi  ## typeinfo for OZSceneNode
000000000046da4a	leaq	__ZTI9OZElement(%rip), %rdx     ## typeinfo for OZElement
000000000046da51	xorl	%ecx, %ecx
000000000046da53	callq	0x6dfd0e                        ## symbol stub for: ___dynamic_cast
000000000046da58	testq	%rax, %rax
000000000046da5b	setne	%al
000000000046da5e	testb	%r14b, %al
000000000046da61	je	0x46dbd3
000000000046da67	movabsq	$0x3ff0000000000000, %rax       ## imm = 0x3FF0000000000000
000000000046da71	movq	%rax, -0xa0(%rbp)
000000000046da78	movq	%rax, -0xc8(%rbp)
000000000046da7f	movq	%rax, -0xf0(%rbp)
000000000046da86	movq	%rax, -0x118(%rbp)
000000000046da8d	xorps	%xmm0, %xmm0
000000000046da90	movups	%xmm0, -0x110(%rbp)
000000000046da97	movups	%xmm0, -0x100(%rbp)
000000000046da9e	movups	%xmm0, -0xe8(%rbp)
000000000046daa5	movups	%xmm0, -0xd8(%rbp)
000000000046daac	movups	%xmm0, -0xc0(%rbp)
000000000046dab3	movups	%xmm0, -0xb0(%rbp)
000000000046daba	leaq	-0x118(%rbp), %rcx
000000000046dac1	movq	%r13, %rdi
000000000046dac4	movq	%rbx, %rsi
000000000046dac7	movq	%r15, %rdx
000000000046daca	callq	__ZN17OZImageMaskRender23calculateBackProjectionEPK8LiCameraRK13OZRenderStateP14PCMatrix44TmplIdE ## OZImageMaskRender::calculateBackProjection(LiCamera const*, OZRenderState const&, PCMatrix44Tmpl<double>*)
000000000046dacf	testb	%al, %al
000000000046dad1	je	0x46dbd3
000000000046dad7	movl	$0x170, %edi                    ## imm = 0x170
000000000046dadc	callq	0x6dfca2                        ## symbol stub for: __Znwm
000000000046dae1	movq	%rax, %r12
000000000046dae4	movq	%rax, %rdi
000000000046dae7	callq	__ZN16LiImageTransformC1Ev      ## LiImageTransform::LiImageTransform()
000000000046daec	movq	%r12, -0x68(%rbp)
000000000046daf0	movq	(%r12), %rax
000000000046daf4	addq	-0x18(%rax), %r12
000000000046daf8	leaq	-0x60(%rbp), %rbx
000000000046dafc	movq	%rbx, %rdi
000000000046daff	movq	%r12, %rsi
000000000046db02	callq	0x6ddadc                        ## symbol stub for: __ZN13PCSharedCountC1EP13PCShared_base
000000000046db07	movq	-0x68(%rbp), %rdi
000000000046db0b	testq	%rdi, %rdi
000000000046db0e	jne	0x46db1e
000000000046db10	movl	$0x1, %edi
000000000046db15	callq	0x6dd290                        ## symbol stub for: __Z28throw_PCNullPointerExceptionb
000000000046db1a	movq	-0x68(%rbp), %rdi
000000000046db1e	movq	-0x30(%rbp), %rax
000000000046db22	movq	(%rax), %rsi
000000000046db25	movq	(%rdi), %rax
000000000046db28	callq	*0xa8(%rax)
000000000046db2e	movq	-0x68(%rbp), %rdi
000000000046db32	testq	%rdi, %rdi
000000000046db35	jne	0x46db45
000000000046db37	movl	$0x1, %edi
000000000046db3c	callq	0x6dd290                        ## symbol stub for: __Z28throw_PCNullPointerExceptionb
000000000046db41	movq	-0x68(%rbp), %rdi
000000000046db45	addq	$0x28, %rdi
000000000046db49	leaq	-0x118(%rbp), %rsi
000000000046db50	callq	__ZN14PCMatrix44TmplIdEaSERKS0_ ## PCMatrix44Tmpl<double>::operator=(PCMatrix44Tmpl<double> const&)
000000000046db55	leaq	-0x68(%rbp), %rsi
000000000046db59	movq	-0x30(%rbp), %rdi
000000000046db5d	callq	__ZN5PCPtrI13LiImageSourceEaSI16LiImageTransformEERS1_RKS_IT_E ## PCPtr<LiImageSource>& PCPtr<LiImageSource>::operator=<LiImageTransform>(PCPtr<LiImageTransform> const&)
000000000046db62	movq	%rbx, %rdi
000000000046db65	callq	0x6ddaee                        ## symbol stub for: __ZN13PCSharedCountD1Ev
000000000046db6a	jmp	0x46dbd3
000000000046db6c	leaq	-0x68(%rbp), %rbx
000000000046db70	movq	%rbx, %rdi
000000000046db73	callq	0x6ddae8                        ## symbol stub for: __ZN13PCSharedCountC1Ev
000000000046db78	movq	-0x38(%rbp), %rdi
000000000046db7c	movq	%rbx, %rsi
000000000046db7f	callq	0x6ddaf4                        ## symbol stub for: __ZN13PCSharedCountaSES_
000000000046db84	movq	%rbx, %rdi
000000000046db87	callq	0x6ddaee                        ## symbol stub for: __ZN13PCSharedCountD1Ev
000000000046db8c	movq	-0x118(%rbp), %rax
000000000046db93	movq	-0x40(%rbp), %rcx
000000000046db97	movq	%rax, 0x618(%rcx)
000000000046db9e	leaq	-0x68(%rbp), %rdi
000000000046dba2	movq	%r13, %rsi
000000000046dba5	callq	0x6ddae2                        ## symbol stub for: __ZN13PCSharedCountC1ERKS_
000000000046dbaa	movq	-0x40(%rbp), %rax
000000000046dbae	leaq	0x620(%rax), %rdi
000000000046dbb5	leaq	-0x68(%rbp), %rsi
000000000046dbb9	callq	0x6ddaf4                        ## symbol stub for: __ZN13PCSharedCountaSES_
000000000046dbbe	leaq	-0x68(%rbp), %rdi
000000000046dbc2	callq	0x6ddaee                        ## symbol stub for: __ZN13PCSharedCountD1Ev
000000000046dbc7	movq	%r13, %rdi
000000000046dbca	callq	0x6ddaee                        ## symbol stub for: __ZN13PCSharedCountD1Ev
000000000046dbcf	movq	-0x40(%rbp), %r13
000000000046dbd3	leaq	-0x48(%rbp), %rdi
000000000046dbd7	callq	0x6ddaee                        ## symbol stub for: __ZN13PCSharedCountD1Ev
000000000046dbdc	leaq	-0x188(%rbp), %rdi
000000000046dbe3	leaq	__ZTV7PCArrayI7LiLight14PCArray_TraitsIS0_EE(%rip), %rax ## vtable for PCArray<LiLight, PCArray_Traits<LiLight>>
000000000046dbea	addq	$0x10, %rax
000000000046dbee	movq	%rax, -0x188(%rbp)
000000000046dbf5	movl	-0x180(%rbp), %eax
000000000046dbfb	testl	%eax, %eax
000000000046dbfd	movl	$0x1, %edx
000000000046dc02	cmovnsl	%eax, %edx
000000000046dc05	xorl	%esi, %esi
000000000046dc07	callq	__ZN7PCArrayI7LiLight14PCArray_TraitsIS0_EE6resizeEii ## PCArray<LiLight, PCArray_Traits<LiLight>>::resize(int, int)
000000000046dc0c	movq	-0x178(%rbp), %rdi
000000000046dc13	testq	%rdi, %rdi
000000000046dc16	je	0x46dc1d
000000000046dc18	callq	0x6dfc30                        ## symbol stub for: __ZdaPv
000000000046dc1d	movq	$0x0, -0x178(%rbp)
000000000046dc28	movl	$0x0, -0x180(%rbp)
000000000046dc32	cmpq	$0x0, -0x218(%rbp)
000000000046dc3a	je	0x46dc81
000000000046dc3c	leaq	-0x228(%rbp), %rbx
000000000046dc43	movq	-0x228(%rbp), %rax
000000000046dc4a	movq	-0x220(%rbp), %rdi
000000000046dc51	movq	0x8(%rax), %rax
000000000046dc55	movq	(%rdi), %rcx
000000000046dc58	movq	%rax, 0x8(%rcx)
000000000046dc5c	movq	%rcx, (%rax)
000000000046dc5f	movq	$0x0, -0x218(%rbp)
000000000046dc6a	cmpq	%rbx, %rdi
000000000046dc6d	je	0x46dc81
000000000046dc6f	nop
000000000046dc70	movq	0x8(%rdi), %r14
000000000046dc74	callq	0x6dfc36                        ## symbol stub for: __ZdlPv
000000000046dc79	movq	%r14, %rdi
000000000046dc7c	cmpq	%rbx, %r14
000000000046dc7f	jne	0x46dc70
000000000046dc81	leaq	-0x338(%rbp), %rdi
000000000046dc88	callq	0x6ddc14                        ## symbol stub for: __ZN14LiGraphBuilderD1Ev
000000000046dc8d	leaq	-0x70(%rbp), %rdi
000000000046dc91	callq	0x6ddaee                        ## symbol stub for: __ZN13PCSharedCountD1Ev
000000000046dc96	cmpq	$0x0, -0x80(%rbp)
000000000046dc9b	movq	-0x38(%rbp), %rbx
000000000046dc9f	je	0x46df31
000000000046dca5	movq	0x5d8(%r13), %r12
000000000046dcac	movq	-0x30(%rbp), %rax
000000000046dcb0	movq	(%rax), %rax
000000000046dcb3	movq	%rax, -0x128(%rbp)
000000000046dcba	leaq	-0x120(%rbp), %r13
000000000046dcc1	movq	%r13, %rdi
000000000046dcc4	movq	%rbx, %rsi
000000000046dcc7	callq	0x6ddae2                        ## symbol stub for: __ZN13PCSharedCountC1ERKS_
000000000046dccc	leaq	-0x268(%rbp), %r15
000000000046dcd3	leaq	-0x128(%rbp), %rdx
000000000046dcda	movq	%r15, %rdi
000000000046dcdd	movq	%r12, %rsi
000000000046dce0	movq	-0x88(%rbp), %rcx
000000000046dce7	callq	__ZN11OZImageMask24applySegmentationFiltersE5PCPtrI13LiImageSourceERK14OZRenderParams ## OZImageMask::applySegmentationFilters(PCPtr<LiImageSource>, OZRenderParams const&)
000000000046dcec	movq	-0x268(%rbp), %rax
000000000046dcf3	movq	-0x30(%rbp), %rcx
000000000046dcf7	movq	%rax, (%rcx)
000000000046dcfa	leaq	-0x260(%rbp), %r12
000000000046dd01	leaq	-0x338(%rbp), %rdi
000000000046dd08	movq	%r12, %rsi
000000000046dd0b	callq	0x6ddae2                        ## symbol stub for: __ZN13PCSharedCountC1ERKS_
000000000046dd10	leaq	-0x338(%rbp), %rsi
000000000046dd17	movq	%rbx, %rdi
000000000046dd1a	callq	0x6ddaf4                        ## symbol stub for: __ZN13PCSharedCountaSES_
000000000046dd1f	leaq	-0x338(%rbp), %rdi
000000000046dd26	callq	0x6ddaee                        ## symbol stub for: __ZN13PCSharedCountD1Ev
000000000046dd2b	movq	%r12, %rdi
000000000046dd2e	callq	0x6ddaee                        ## symbol stub for: __ZN13PCSharedCountD1Ev
000000000046dd33	movq	%r13, %rdi
000000000046dd36	callq	0x6ddaee                        ## symbol stub for: __ZN13PCSharedCountD1Ev
000000000046dd3b	movq	-0x40(%rbp), %rbx
000000000046dd3f	movq	0x5d8(%rbx), %rdi
000000000046dd46	movq	(%rdi), %rax
000000000046dd49	callq	*0x1a0(%rax)
000000000046dd4f	testb	%al, %al
000000000046dd51	je	0x46df31
000000000046dd57	movq	0x5d8(%rbx), %r13
000000000046dd5e	movq	%r15, -0x268(%rbp)
000000000046dd65	movq	%r15, -0x260(%rbp)
000000000046dd6c	movq	$0x0, -0x258(%rbp)
000000000046dd77	movq	0x3d0(%r13), %r14
000000000046dd7e	addq	$0x3c8, %r13                    ## imm = 0x3C8
000000000046dd85	cmpq	%r13, %r14
000000000046dd88	je	0x46df31
000000000046dd8e	xorl	%r12d, %r12d
000000000046dd91	movq	%r15, %rbx
000000000046dd94	nopw	%cs:(%rax,%rax)
000000000046dda0	movl	$0x18, %edi
000000000046dda5	callq	0x6dfca2                        ## symbol stub for: __Znwm
000000000046ddaa	movq	0x10(%r14), %rcx
000000000046ddae	movq	%rcx, 0x10(%rax)
000000000046ddb2	movq	%r15, 0x8(%rax)
000000000046ddb6	movq	%rbx, (%rax)
000000000046ddb9	movq	%rax, 0x8(%rbx)
000000000046ddbd	movq	%rax, -0x268(%rbp)
000000000046ddc4	incq	%r12
000000000046ddc7	movq	%r12, -0x258(%rbp)
000000000046ddce	movq	0x8(%r14), %r14
000000000046ddd2	movq	%rax, %rbx
000000000046ddd5	cmpq	%r13, %r14
000000000046ddd8	jne	0x46dda0
000000000046ddda	movq	-0x260(%rbp), %rdi
000000000046dde1	leaq	-0x268(%rbp), %r13
000000000046dde8	cmpq	%rdi, %r13
000000000046ddeb	je	0x46deef
000000000046ddf1	leaq	-0x330(%rbp), %r12
000000000046ddf8	leaq	-0x338(%rbp), %r14
000000000046ddff	leaq	-0x118(%rbp), %rbx
000000000046de06	jmp	0x46de34
000000000046de08	nopl	(%rax,%rax)
000000000046de10	movq	%rbx, %rdi
000000000046de13	callq	0x6ddaee                        ## symbol stub for: __ZN13PCSharedCountD1Ev
000000000046de18	movq	%r12, %rdi
000000000046de1b	callq	0x6ddaee                        ## symbol stub for: __ZN13PCSharedCountD1Ev
000000000046de20	movq	(%r13), %r13
000000000046de24	movq	-0x260(%rbp), %rdi
000000000046de2b	cmpq	%rdi, %r13
000000000046de2e	je	0x46dee8
000000000046de34	movq	(%r13), %rax
000000000046de38	movq	0x10(%rax), %rdi
000000000046de3c	movq	(%rdi), %rax
000000000046de3f	movq	0x118(%rax), %rax
000000000046de46	movq	-0x58(%rbp), %rdx
000000000046de4a	movq	0x10(%rdx), %rcx
000000000046de4e	movq	%rcx, 0x10(%rsp)
000000000046de53	movups	(%rdx), %xmm0
000000000046de56	movups	%xmm0, (%rsp)
000000000046de5a	xorl	%esi, %esi
000000000046de5c	movl	$0x1, %edx
000000000046de61	movl	$0x1, %ecx
000000000046de66	callq	*%rax
000000000046de68	testb	%al, %al
000000000046de6a	je	0x46de20
000000000046de6c	movq	(%r13), %rax
000000000046de70	movq	0x10(%rax), %rsi
000000000046de74	movq	(%rsi), %rax
000000000046de77	movq	%r14, %rdi
000000000046de7a	movq	-0x58(%rbp), %rdx
000000000046de7e	callq	*0x290(%rax)
000000000046de84	movq	-0x338(%rbp), %rdi
000000000046de8b	testq	%rdi, %rdi
000000000046de8e	je	0x46de18
000000000046de90	movq	-0x30(%rbp), %rax
000000000046de94	movq	(%rax), %rsi
000000000046de97	movq	(%rdi), %rax
000000000046de9a	callq	*0xa8(%rax)
000000000046dea0	movq	-0x338(%rbp), %rax
000000000046dea7	movq	-0x30(%rbp), %rcx
000000000046deab	movq	%rax, (%rcx)
000000000046deae	testq	%rax, %rax
000000000046deb1	je	0x46decf
000000000046deb3	movq	%rbx, %rdi
000000000046deb6	movq	%r12, %rsi
000000000046deb9	callq	0x6ddae2                        ## symbol stub for: __ZN13PCSharedCountC1ERKS_
000000000046debe	movq	-0x38(%rbp), %rdi
000000000046dec2	movq	%rbx, %rsi
000000000046dec5	callq	0x6ddaf4                        ## symbol stub for: __ZN13PCSharedCountaSES_
000000000046deca	jmp	0x46de10
000000000046decf	movq	%rbx, %rdi
000000000046ded2	callq	0x6ddae8                        ## symbol stub for: __ZN13PCSharedCountC1Ev
000000000046ded7	movq	-0x38(%rbp), %rdi
000000000046dedb	movq	%rbx, %rsi
000000000046dede	callq	0x6ddaf4                        ## symbol stub for: __ZN13PCSharedCountaSES_
000000000046dee3	jmp	0x46de10
000000000046dee8	movq	-0x258(%rbp), %r12
000000000046deef	testq	%r12, %r12
000000000046def2	je	0x46df31
000000000046def4	movq	-0x268(%rbp), %rax
000000000046defb	movq	0x8(%rax), %rax
000000000046deff	movq	(%rdi), %rcx
000000000046df02	movq	%rax, 0x8(%rcx)
000000000046df06	movq	%rcx, (%rax)
000000000046df09	movq	$0x0, -0x258(%rbp)
000000000046df14	leaq	-0x268(%rbp), %rbx
000000000046df1b	cmpq	%rbx, %rdi
000000000046df1e	je	0x46df31
000000000046df20	movq	0x8(%rdi), %r14
000000000046df24	callq	0x6dfc36                        ## symbol stub for: __ZdlPv
000000000046df29	movq	%r14, %rdi
000000000046df2c	cmpq	%rbx, %r14
000000000046df2f	jne	0x46df20
000000000046df31	leaq	-0x380(%rbp), %rdi
000000000046df38	callq	__ZN30Render360GroupAsEquirectSentryD1Ev ## Render360GroupAsEquirectSentry::~Render360GroupAsEquirectSentry()
000000000046df3d	movq	-0x30(%rbp), %rax
000000000046df41	addq	$0x378, %rsp                    ## imm = 0x378
000000000046df48	popq	%rbx
000000000046df49	popq	%r12
000000000046df4b	popq	%r13
000000000046df4d	popq	%r14
000000000046df4f	popq	%r15
000000000046df51	popq	%rbp
000000000046df52	retq
000000000046df53	movq	%rax, %r14
000000000046df56	movq	%r12, %rdi
000000000046df59	callq	0x6dfc36                        ## symbol stub for: __ZdlPv
000000000046df5e	jmp	0x46dff6
000000000046df63	jmp	0x46df79
000000000046df65	jmp	0x46df79
000000000046df67	jmp	0x46dff3
000000000046df6c	jmp	0x46dff3
000000000046df71	movq	%rax, %r14
000000000046df74	movq	%rbx, %rdi
000000000046df77	jmp	0x46dfec
000000000046df79	movq	%rax, %r14
000000000046df7c	leaq	-0x68(%rbp), %rdi
000000000046df80	callq	0x6ddaee                        ## symbol stub for: __ZN13PCSharedCountD1Ev
000000000046df85	jmp	0x46dfe9
000000000046df87	movq	%rax, %r14
000000000046df8a	movq	%rbx, %rdi
000000000046df8d	callq	0x6dfc36                        ## symbol stub for: __ZdlPv
000000000046df92	jmp	0x46dff6
000000000046df94	jmp	0x46dfd8
000000000046df96	jmp	0x46dff3
000000000046df98	jmp	0x46dfd8
000000000046df9a	jmp	0x46dff3
000000000046df9c	movq	%rax, %r14
000000000046df9f	leaq	-0x50(%rbp), %rdi
000000000046dfa3	callq	0x6ddaee                        ## symbol stub for: __ZN13PCSharedCountD1Ev
000000000046dfa8	jmp	0x46dfad
000000000046dfaa	movq	%rax, %r14
000000000046dfad	movq	%r13, %rdi
000000000046dfb0	callq	0x6ddaee                        ## symbol stub for: __ZN13PCSharedCountD1Ev
000000000046dfb5	jmp	0x46dfcc
000000000046dfb7	jmp	0x46dfc9
000000000046dfb9	jmp	0x46e003
000000000046dfbb	movq	%rax, %r14
000000000046dfbe	leaq	-0x50(%rbp), %rdi
000000000046dfc2	callq	0x6ddaee                        ## symbol stub for: __ZN13PCSharedCountD1Ev
000000000046dfc7	jmp	0x46dfcc
000000000046dfc9	movq	%rax, %r14
000000000046dfcc	movq	%rbx, %rdi
000000000046dfcf	callq	0x6ddaee                        ## symbol stub for: __ZN13PCSharedCountD1Ev
000000000046dfd4	jmp	0x46e006
000000000046dfd6	jmp	0x46e003
000000000046dfd8	movq	%rax, %r14
000000000046dfdb	leaq	-0x118(%rbp), %rdi
000000000046dfe2	jmp	0x46dfec
000000000046dfe4	jmp	0x46dff3
000000000046dfe6	movq	%rax, %r14
000000000046dfe9	movq	%r13, %rdi
000000000046dfec	callq	0x6ddaee                        ## symbol stub for: __ZN13PCSharedCountD1Ev
000000000046dff1	jmp	0x46dff6
000000000046dff3	movq	%rax, %r14
000000000046dff6	leaq	-0x48(%rbp), %rdi
000000000046dffa	callq	0x6ddaee                        ## symbol stub for: __ZN13PCSharedCountD1Ev
000000000046dfff	jmp	0x46e006
000000000046e001	jmp	0x46e003
000000000046e003	movq	%rax, %r14
000000000046e006	leaq	-0x268(%rbp), %rdi
000000000046e00d	callq	__ZN18OZRenderGraphStateD1Ev    ## OZRenderGraphState::~OZRenderGraphState()
000000000046e012	leaq	-0x338(%rbp), %rdi
000000000046e019	callq	0x6ddc14                        ## symbol stub for: __ZN14LiGraphBuilderD1Ev
000000000046e01e	leaq	-0x70(%rbp), %rdi
000000000046e022	callq	0x6ddaee                        ## symbol stub for: __ZN13PCSharedCountD1Ev
000000000046e027	jmp	0x46e14c
000000000046e02c	movq	%rax, %rdi
000000000046e02f	callq	___clang_call_terminate
000000000046e034	movq	%rax, %rdi
000000000046e037	callq	___clang_call_terminate
000000000046e03c	movq	%rax, %r14
000000000046e03f	leaq	-0x98(%rbp), %rdi
000000000046e046	callq	0x6ddaee                        ## symbol stub for: __ZN13PCSharedCountD1Ev
000000000046e04b	jmp	0x46e050
000000000046e04d	movq	%rax, %r14
000000000046e050	movq	%rbx, %rdi
000000000046e053	callq	0x6ddaee                        ## symbol stub for: __ZN13PCSharedCountD1Ev
000000000046e058	jmp	0x46e05d
000000000046e05a	movq	%rax, %r14
000000000046e05d	leaq	-0x268(%rbp), %rdi
000000000046e064	callq	__ZN18OZRenderGraphStateD1Ev    ## OZRenderGraphState::~OZRenderGraphState()
000000000046e069	jmp	0x46e06e
000000000046e06b	movq	%rax, %r14
000000000046e06e	leaq	-0x338(%rbp), %rdi
000000000046e075	callq	0x6ddc14                        ## symbol stub for: __ZN14LiGraphBuilderD1Ev
000000000046e07a	jmp	0x46e14c
000000000046e07f	movq	%rax, %r14
000000000046e082	jmp	0x46e012
000000000046e084	movq	%rax, %r14
000000000046e087	movq	%rbx, %rdi
000000000046e08a	callq	0x6ddaee                        ## symbol stub for: __ZN13PCSharedCountD1Ev
000000000046e08f	jmp	0x46e14c
000000000046e094	movq	%rax, %r14
000000000046e097	jmp	0x46e01e
000000000046e099	movq	%rax, %r14
000000000046e09c	jmp	0x46e01e
000000000046e09e	movq	%rax, %r14
000000000046e0a1	movq	%r12, %rdi
000000000046e0a4	callq	0x6dfc36                        ## symbol stub for: __ZdlPv
000000000046e0a9	jmp	0x46e14c
000000000046e0ae	movq	%rax, %r14
000000000046e0b1	movq	%rbx, %rdi
000000000046e0b4	callq	0x6dfc36                        ## symbol stub for: __ZdlPv
000000000046e0b9	jmp	0x46e14c
000000000046e0be	jmp	0x46e104
000000000046e0c0	jmp	0x46e0f1
000000000046e0c2	jmp	0x46e104
000000000046e0c4	movq	%rax, %r14
000000000046e0c7	leaq	-0x338(%rbp), %rdi
000000000046e0ce	callq	0x6ddaee                        ## symbol stub for: __ZN13PCSharedCountD1Ev
000000000046e0d3	jmp	0x46e0d8
000000000046e0d5	movq	%rax, %r14
000000000046e0d8	movq	%r12, %rdi
000000000046e0db	callq	0x6ddaee                        ## symbol stub for: __ZN13PCSharedCountD1Ev
000000000046e0e0	jmp	0x46e0e5
000000000046e0e2	movq	%rax, %r14
000000000046e0e5	movq	%r13, %rdi
000000000046e0e8	callq	0x6ddaee                        ## symbol stub for: __ZN13PCSharedCountD1Ev
000000000046e0ed	jmp	0x46e14c
000000000046e0ef	jmp	0x46e104
000000000046e0f1	movq	%rax, %r14
000000000046e0f4	leaq	-0x118(%rbp), %rdi
000000000046e0fb	callq	0x6ddaee                        ## symbol stub for: __ZN13PCSharedCountD1Ev
000000000046e100	jmp	0x46e122
000000000046e102	jmp	0x46e104
000000000046e104	movq	%rax, %r14
000000000046e107	jmp	0x46e14c
000000000046e109	movq	%rax, %r14
000000000046e10c	movq	-0x38(%rbp), %rdi
000000000046e110	callq	0x6ddaee                        ## symbol stub for: __ZN13PCSharedCountD1Ev
000000000046e115	movq	%r14, %rdi
000000000046e118	callq	0x6dd07a                        ## symbol stub for: __Unwind_Resume
000000000046e11d	jmp	0x46e12c
000000000046e11f	movq	%rax, %r14
000000000046e122	movq	%r12, %rdi
000000000046e125	callq	0x6ddaee                        ## symbol stub for: __ZN13PCSharedCountD1Ev
000000000046e12a	jmp	0x46e12f
000000000046e12c	movq	%rax, %r14
000000000046e12f	leaq	-0x268(%rbp), %rdi
000000000046e136	callq	__ZNSt3__14listIP25OZDefaultOverlayComponentNS_9allocatorIS2_EEED1Ev ## std::__1::list<OZDefaultOverlayComponent*, std::__1::allocator<OZDefaultOverlayComponent*>>::~list()
000000000046e13b	jmp	0x46e14c
000000000046e13d	movq	%rax, %r14
000000000046e140	leaq	-0x268(%rbp), %rdi
000000000046e147	callq	__ZNSt3__110__list_impIP10OZBehaviorNS_9allocatorIS2_EEED2Ev ## std::__1::__list_imp<OZBehavior*, std::__1::allocator<OZBehavior*>>::~__list_imp()
000000000046e14c	leaq	-0x380(%rbp), %rdi
000000000046e153	callq	__ZN30Render360GroupAsEquirectSentryD1Ev ## Render360GroupAsEquirectSentry::~Render360GroupAsEquirectSentry()
000000000046e158	movq	-0x38(%rbp), %rdi
000000000046e15c	callq	0x6ddaee                        ## symbol stub for: __ZN13PCSharedCountD1Ev
000000000046e161	movq	%r14, %rdi
000000000046e164	callq	0x6dd07a                        ## symbol stub for: __Unwind_Resume
000000000046e169	nopl	(%rax)
