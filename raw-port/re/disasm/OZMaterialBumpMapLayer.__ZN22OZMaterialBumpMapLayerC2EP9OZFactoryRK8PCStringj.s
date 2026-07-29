__ZN22OZMaterialBumpMapLayerC2EP9OZFactoryRK8PCStringj:
0000000000440510	pushq	%rbp
0000000000440511	movq	%rsp, %rbp
0000000000440514	pushq	%r15
0000000000440516	pushq	%r14
0000000000440518	pushq	%r13
000000000044051a	pushq	%r12
000000000044051c	pushq	%rbx
000000000044051d	subq	$0x28, %rsp
0000000000440521	movq	%rdi, %rbx
0000000000440524	callq	__ZN19OZMaterialLayerBaseC2EP9OZFactoryRK8PCStringj ## OZMaterialLayerBase::OZMaterialLayerBase(OZFactory*, PCString const&, unsigned int)
0000000000440529	leaq	0x423ef8(%rip), %rax
0000000000440530	movq	%rax, (%rbx)
0000000000440533	leaq	0x4242c6(%rip), %rax
000000000044053a	movq	%rax, 0x10(%rbx)
000000000044053e	leaq	0x424313(%rip), %rax
0000000000440545	movq	%rax, 0x4c8(%rbx)
000000000044054c	leaq	_theApp(%rip), %r15
0000000000440553	movq	(%r15), %rax
0000000000440556	movq	0x48(%rax), %rdx
000000000044055a	leaq	0x4544cf(%rip), %rsi            ## Objc cfstring ref: @"bad cfstring ref"
0000000000440561	leaq	-0x30(%rbp), %rdi
0000000000440565	xorl	%ecx, %ecx
0000000000440567	callq	0x6df08a                        ## symbol stub for: __ZN8PCStringC1EPK10__CFStringP10__CFBundleS2_
000000000044056c	leaq	0x4d0(%rbx), %r14
0000000000440573	movq	$0x0, (%rsp)
000000000044057b	movsd	0x2c4e5d(%rip), %xmm0
0000000000440583	leaq	-0x30(%rbp), %rsi
0000000000440587	movq	%r14, %rdi
000000000044058a	movq	%rbx, %rdx
000000000044058d	movl	$0x65, %ecx
0000000000440592	xorl	%r8d, %r8d
0000000000440595	xorl	%r9d, %r9d
0000000000440598	callq	0x6de184                        ## symbol stub for: __ZN16OZChannelPercentC1EdRK8PCStringP15OZChannelFolderjjP13OZChannelImplP13OZChannelInfo
000000000044059d	leaq	-0x30(%rbp), %rdi
00000000004405a1	callq	0x6df0c6                        ## symbol stub for: __ZN8PCStringD1Ev
00000000004405a6	movq	(%r15), %rax
00000000004405a9	movq	0x48(%rax), %rdx
00000000004405ad	leaq	0x45449c(%rip), %rsi            ## Objc cfstring ref: @"bad cfstring ref"
00000000004405b4	leaq	-0x30(%rbp), %rdi
00000000004405b8	xorl	%ecx, %ecx
00000000004405ba	callq	0x6df08a                        ## symbol stub for: __ZN8PCStringC1EPK10__CFStringP10__CFBundleS2_
00000000004405bf	leaq	0x568(%rbx), %rdi
00000000004405c6	leaq	-0x30(%rbp), %rsi
00000000004405ca	movq	%rdi, -0x40(%rbp)
00000000004405ce	movq	%rbx, %rdx
00000000004405d1	movl	$0x64, %ecx
00000000004405d6	movl	$0x2, %r8d
00000000004405dc	callq	__ZN27OZChannelImageWithTransformC1ERK8PCStringP15OZChannelFolderjj ## OZChannelImageWithTransform::OZChannelImageWithTransform(PCString const&, OZChannelFolder*, unsigned int, unsigned int)
00000000004405e1	leaq	-0x30(%rbp), %rdi
00000000004405e5	callq	0x6df0c6                        ## symbol stub for: __ZN8PCStringD1Ev
00000000004405ea	movq	(%r15), %rax
00000000004405ed	movq	0x48(%rax), %rdx
00000000004405f1	leaq	0x454458(%rip), %rsi            ## Objc cfstring ref: @"bad cfstring ref"
00000000004405f8	leaq	-0x30(%rbp), %rdi
00000000004405fc	xorl	%ecx, %ecx
00000000004405fe	callq	0x6df08a                        ## symbol stub for: __ZN8PCStringC1EPK10__CFStringP10__CFBundleS2_
0000000000440603	leaq	0x1570(%rbx), %r12
000000000044060a	leaq	-0x30(%rbp), %rsi
000000000044060e	movq	%r12, %rdi
0000000000440611	movq	%rbx, %rdx
0000000000440614	movl	$0x67, %ecx
0000000000440619	xorl	%r8d, %r8d
000000000044061c	callq	__ZN25OZChannelMaterialLayerMapC1ERK8PCStringP15OZChannelFolderjj ## OZChannelMaterialLayerMap::OZChannelMaterialLayerMap(PCString const&, OZChannelFolder*, unsigned int, unsigned int)
0000000000440621	leaq	-0x30(%rbp), %rdi
0000000000440625	callq	0x6df0c6                        ## symbol stub for: __ZN8PCStringD1Ev
000000000044062a	movq	(%r15), %rax
000000000044062d	movq	0x48(%rax), %rdx
0000000000440631	leaq	0x454438(%rip), %rsi            ## Objc cfstring ref: @"bad cfstring ref"
0000000000440638	leaq	-0x30(%rbp), %rdi
000000000044063c	xorl	%ecx, %ecx
000000000044063e	callq	0x6df08a                        ## symbol stub for: __ZN8PCStringC1EPK10__CFStringP10__CFBundleS2_
0000000000440643	movq	(%r15), %rax
0000000000440646	movq	0x48(%rax), %rdx
000000000044064a	leaq	0x45443f(%rip), %rsi            ## Objc cfstring ref: @"bad cfstring ref"
0000000000440651	leaq	-0x38(%rbp), %rdi
0000000000440655	xorl	%ecx, %ecx
0000000000440657	callq	0x6df08a                        ## symbol stub for: __ZN8PCStringC1EPK10__CFStringP10__CFBundleS2_
000000000044065c	leaq	0x2ea8(%rbx), %r13
0000000000440663	xorps	%xmm0, %xmm0
0000000000440666	movups	%xmm0, (%rsp)
000000000044066a	leaq	-0x30(%rbp), %rsi
000000000044066e	leaq	-0x38(%rbp), %rdx
0000000000440672	movq	%r13, %rdi
0000000000440675	movq	%rbx, %rcx
0000000000440678	movl	$0x66, %r8d
000000000044067e	xorl	%r9d, %r9d
0000000000440681	callq	0x6dd9a4                        ## symbol stub for: __ZN13OZChannelEnumC1ERK8PCStringS2_P15OZChannelFolderjjP13OZChannelImplP13OZChannelInfo
0000000000440686	leaq	-0x38(%rbp), %rdi
000000000044068a	callq	0x6df0c6                        ## symbol stub for: __ZN8PCStringD1Ev
000000000044068f	leaq	-0x30(%rbp), %rdi
0000000000440693	callq	0x6df0c6                        ## symbol stub for: __ZN8PCStringD1Ev
0000000000440698	movq	%rbx, %rdi
000000000044069b	callq	__ZN19OZMaterialLayerBase8initBaseEv ## OZMaterialLayerBase::initBase()
00000000004406a0	movsd	0x2c73b8(%rip), %xmm0
00000000004406a8	movq	%r14, %rdi
00000000004406ab	callq	0x6df432                        ## symbol stub for: __ZN9OZChannel6setMaxEd
00000000004406b0	leaq	0x1aa0(%rbx), %r15
00000000004406b7	movq	0x3e3e52(%rip), %rsi            ## literal pool symbol address: _kCMTimeZero
00000000004406be	movsd	0x2c4d1a(%rip), %xmm0
00000000004406c6	movq	%r15, %rdi
00000000004406c9	xorl	%edx, %edx
00000000004406cb	callq	0x6df456                        ## symbol stub for: __ZN9OZChannel8setValueERK6CMTimedb
00000000004406d0	movq	%r12, %rdi
00000000004406d3	movl	$0xf, %esi
00000000004406d8	callq	0x6ddf68                        ## symbol stub for: __ZN15OZChannelFolder13resetFoldFlagEj
00000000004406dd	leaq	0x44e62c(%rip), %rsi            ## Objc cfstring ref: @"bad cfstring ref"
00000000004406e4	movq	%r12, %rdi
00000000004406e7	callq	0x6dd8de                        ## symbol stub for: __ZN13OZChannelBase25setInspectorCtlrClassNameEPK10__CFString
00000000004406ec	movq	%r12, %rdi
00000000004406ef	callq	0x6ddf92                        ## symbol stub for: __ZN15OZChannelFolder18saveStateAsDefaultEv
00000000004406f4	movsd	0x2c4ce4(%rip), %xmm0
00000000004406fc	movq	%r15, %rdi
00000000004406ff	callq	0x6df306                        ## symbol stub for: __ZN9OZChannel15setDefaultValueEd
0000000000440704	leaq	0x2be0(%rbx), %rdi
000000000044070b	movl	$0x2, %esi
0000000000440710	xorl	%edx, %edx
0000000000440712	callq	0x6dd92c                        ## symbol stub for: __ZN13OZChannelBase9resetFlagEyb
0000000000440717	movq	%r12, %rdi
000000000044071a	movl	$0x1, %esi
000000000044071f	callq	__ZN25OZChannelMaterialLayerMap17setEnableBumpTypeEb ## OZChannelMaterialLayerMap::setEnableBumpType(bool)
0000000000440724	addq	$0x28, %rsp
0000000000440728	popq	%rbx
0000000000440729	popq	%r12
000000000044072b	popq	%r13
000000000044072d	popq	%r14
000000000044072f	popq	%r15
0000000000440731	popq	%rbp
0000000000440732	retq
0000000000440733	movq	%rax, %r15
0000000000440736	leaq	-0x38(%rbp), %rdi
000000000044073a	callq	0x6df0c6                        ## symbol stub for: __ZN8PCStringD1Ev
000000000044073f	jmp	0x440744
0000000000440741	movq	%rax, %r15
0000000000440744	leaq	-0x30(%rbp), %rdi
0000000000440748	callq	0x6df0c6                        ## symbol stub for: __ZN8PCStringD1Ev
000000000044074d	jmp	0x4407b4
000000000044074f	movq	%rax, %r15
0000000000440752	jmp	0x4407b4
0000000000440754	movq	%rax, %r15
0000000000440757	leaq	-0x30(%rbp), %rdi
000000000044075b	callq	0x6df0c6                        ## symbol stub for: __ZN8PCStringD1Ev
0000000000440760	jmp	0x4407bc
0000000000440762	movq	%rax, %r15
0000000000440765	jmp	0x4407bc
0000000000440767	movq	%rax, %r15
000000000044076a	leaq	-0x30(%rbp), %rdi
000000000044076e	callq	0x6df0c6                        ## symbol stub for: __ZN8PCStringD1Ev
0000000000440773	jmp	0x4407c5
0000000000440775	movq	%rax, %r15
0000000000440778	jmp	0x4407c5
000000000044077a	movq	%rax, %r15
000000000044077d	leaq	-0x30(%rbp), %rdi
0000000000440781	callq	0x6df0c6                        ## symbol stub for: __ZN8PCStringD1Ev
0000000000440786	movq	%rbx, %rdi
0000000000440789	callq	__ZN19OZMaterialLayerBaseD2Ev   ## OZMaterialLayerBase::~OZMaterialLayerBase()
000000000044078e	movq	%r15, %rdi
0000000000440791	callq	0x6dd07a                        ## symbol stub for: __Unwind_Resume
0000000000440796	movq	%rax, %r15
0000000000440799	movq	%rbx, %rdi
000000000044079c	callq	__ZN19OZMaterialLayerBaseD2Ev   ## OZMaterialLayerBase::~OZMaterialLayerBase()
00000000004407a1	movq	%r15, %rdi
00000000004407a4	callq	0x6dd07a                        ## symbol stub for: __Unwind_Resume
00000000004407a9	movq	%rax, %r15
00000000004407ac	movq	%r13, %rdi
00000000004407af	callq	0x6dd9d4                        ## symbol stub for: __ZN13OZChannelEnumD1Ev
00000000004407b4	movq	%r12, %rdi
00000000004407b7	callq	__ZN25OZChannelMaterialLayerMapD2Ev ## OZChannelMaterialLayerMap::~OZChannelMaterialLayerMap()
00000000004407bc	movq	-0x40(%rbp), %rdi
00000000004407c0	callq	__ZN27OZChannelImageWithTransformD2Ev ## OZChannelImageWithTransform::~OZChannelImageWithTransform()
00000000004407c5	movq	%r14, %rdi
00000000004407c8	callq	0x6de18a                        ## symbol stub for: __ZN16OZChannelPercentD1Ev
00000000004407cd	movq	%rbx, %rdi
00000000004407d0	callq	__ZN19OZMaterialLayerBaseD2Ev   ## OZMaterialLayerBase::~OZMaterialLayerBase()
00000000004407d5	movq	%r15, %rdi
00000000004407d8	callq	0x6dd07a                        ## symbol stub for: __Unwind_Resume
00000000004407dd	nopl	(%rax)
