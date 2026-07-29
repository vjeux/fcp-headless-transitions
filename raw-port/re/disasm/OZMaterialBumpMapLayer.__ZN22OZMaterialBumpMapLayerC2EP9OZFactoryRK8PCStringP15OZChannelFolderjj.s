__ZN22OZMaterialBumpMapLayerC2EP9OZFactoryRK8PCStringP15OZChannelFolderjj:
000000000043fe40	pushq	%rbp
000000000043fe41	movq	%rsp, %rbp
000000000043fe44	pushq	%r15
000000000043fe46	pushq	%r14
000000000043fe48	pushq	%r13
000000000043fe4a	pushq	%r12
000000000043fe4c	pushq	%rbx
000000000043fe4d	subq	$0x28, %rsp
000000000043fe51	movq	%rdi, %rbx
000000000043fe54	callq	__ZN19OZMaterialLayerBaseC2EP9OZFactoryRK8PCStringP15OZChannelFolderjj ## OZMaterialLayerBase::OZMaterialLayerBase(OZFactory*, PCString const&, OZChannelFolder*, unsigned int, unsigned int)
000000000043fe59	leaq	0x4245c8(%rip), %rax
000000000043fe60	movq	%rax, (%rbx)
000000000043fe63	leaq	0x424996(%rip), %rax
000000000043fe6a	movq	%rax, 0x10(%rbx)
000000000043fe6e	leaq	0x4249e3(%rip), %rax
000000000043fe75	movq	%rax, 0x4c8(%rbx)
000000000043fe7c	leaq	_theApp(%rip), %r15
000000000043fe83	movq	(%r15), %rax
000000000043fe86	movq	0x48(%rax), %rdx
000000000043fe8a	leaq	0x454b9f(%rip), %rsi            ## Objc cfstring ref: @"bad cfstring ref"
000000000043fe91	leaq	-0x30(%rbp), %rdi
000000000043fe95	xorl	%ecx, %ecx
000000000043fe97	callq	0x6df08a                        ## symbol stub for: __ZN8PCStringC1EPK10__CFStringP10__CFBundleS2_
000000000043fe9c	leaq	0x4d0(%rbx), %r14
000000000043fea3	movq	$0x0, (%rsp)
000000000043feab	movsd	0x2c552d(%rip), %xmm0
000000000043feb3	leaq	-0x30(%rbp), %rsi
000000000043feb7	movq	%r14, %rdi
000000000043feba	movq	%rbx, %rdx
000000000043febd	movl	$0x65, %ecx
000000000043fec2	xorl	%r8d, %r8d
000000000043fec5	xorl	%r9d, %r9d
000000000043fec8	callq	0x6de184                        ## symbol stub for: __ZN16OZChannelPercentC1EdRK8PCStringP15OZChannelFolderjjP13OZChannelImplP13OZChannelInfo
000000000043fecd	leaq	-0x30(%rbp), %rdi
000000000043fed1	callq	0x6df0c6                        ## symbol stub for: __ZN8PCStringD1Ev
000000000043fed6	movq	(%r15), %rax
000000000043fed9	movq	0x48(%rax), %rdx
000000000043fedd	leaq	0x454b6c(%rip), %rsi            ## Objc cfstring ref: @"bad cfstring ref"
000000000043fee4	leaq	-0x30(%rbp), %rdi
000000000043fee8	xorl	%ecx, %ecx
000000000043feea	callq	0x6df08a                        ## symbol stub for: __ZN8PCStringC1EPK10__CFStringP10__CFBundleS2_
000000000043feef	leaq	0x568(%rbx), %rdi
000000000043fef6	leaq	-0x30(%rbp), %rsi
000000000043fefa	movq	%rdi, -0x40(%rbp)
000000000043fefe	movq	%rbx, %rdx
000000000043ff01	movl	$0x64, %ecx
000000000043ff06	movl	$0x2, %r8d
000000000043ff0c	callq	__ZN27OZChannelImageWithTransformC1ERK8PCStringP15OZChannelFolderjj ## OZChannelImageWithTransform::OZChannelImageWithTransform(PCString const&, OZChannelFolder*, unsigned int, unsigned int)
000000000043ff11	leaq	-0x30(%rbp), %rdi
000000000043ff15	callq	0x6df0c6                        ## symbol stub for: __ZN8PCStringD1Ev
000000000043ff1a	movq	(%r15), %rax
000000000043ff1d	movq	0x48(%rax), %rdx
000000000043ff21	leaq	0x454b28(%rip), %rsi            ## Objc cfstring ref: @"bad cfstring ref"
000000000043ff28	leaq	-0x30(%rbp), %rdi
000000000043ff2c	xorl	%ecx, %ecx
000000000043ff2e	callq	0x6df08a                        ## symbol stub for: __ZN8PCStringC1EPK10__CFStringP10__CFBundleS2_
000000000043ff33	leaq	0x1570(%rbx), %r12
000000000043ff3a	leaq	-0x30(%rbp), %rsi
000000000043ff3e	movq	%r12, %rdi
000000000043ff41	movq	%rbx, %rdx
000000000043ff44	movl	$0x67, %ecx
000000000043ff49	xorl	%r8d, %r8d
000000000043ff4c	callq	__ZN25OZChannelMaterialLayerMapC1ERK8PCStringP15OZChannelFolderjj ## OZChannelMaterialLayerMap::OZChannelMaterialLayerMap(PCString const&, OZChannelFolder*, unsigned int, unsigned int)
000000000043ff51	leaq	-0x30(%rbp), %rdi
000000000043ff55	callq	0x6df0c6                        ## symbol stub for: __ZN8PCStringD1Ev
000000000043ff5a	movq	(%r15), %rax
000000000043ff5d	movq	0x48(%rax), %rdx
000000000043ff61	leaq	0x454b08(%rip), %rsi            ## Objc cfstring ref: @"bad cfstring ref"
000000000043ff68	leaq	-0x30(%rbp), %rdi
000000000043ff6c	xorl	%ecx, %ecx
000000000043ff6e	callq	0x6df08a                        ## symbol stub for: __ZN8PCStringC1EPK10__CFStringP10__CFBundleS2_
000000000043ff73	movq	(%r15), %rax
000000000043ff76	movq	0x48(%rax), %rdx
000000000043ff7a	leaq	0x454b0f(%rip), %rsi            ## Objc cfstring ref: @"bad cfstring ref"
000000000043ff81	leaq	-0x38(%rbp), %rdi
000000000043ff85	xorl	%ecx, %ecx
000000000043ff87	callq	0x6df08a                        ## symbol stub for: __ZN8PCStringC1EPK10__CFStringP10__CFBundleS2_
000000000043ff8c	leaq	0x2ea8(%rbx), %r13
000000000043ff93	xorps	%xmm0, %xmm0
000000000043ff96	movups	%xmm0, (%rsp)
000000000043ff9a	leaq	-0x30(%rbp), %rsi
000000000043ff9e	leaq	-0x38(%rbp), %rdx
000000000043ffa2	movq	%r13, %rdi
000000000043ffa5	movq	%rbx, %rcx
000000000043ffa8	movl	$0x66, %r8d
000000000043ffae	xorl	%r9d, %r9d
000000000043ffb1	callq	0x6dd9a4                        ## symbol stub for: __ZN13OZChannelEnumC1ERK8PCStringS2_P15OZChannelFolderjjP13OZChannelImplP13OZChannelInfo
000000000043ffb6	leaq	-0x38(%rbp), %rdi
000000000043ffba	callq	0x6df0c6                        ## symbol stub for: __ZN8PCStringD1Ev
000000000043ffbf	leaq	-0x30(%rbp), %rdi
000000000043ffc3	callq	0x6df0c6                        ## symbol stub for: __ZN8PCStringD1Ev
000000000043ffc8	movq	%rbx, %rdi
000000000043ffcb	callq	__ZN19OZMaterialLayerBase8initBaseEv ## OZMaterialLayerBase::initBase()
000000000043ffd0	movsd	0x2c7a88(%rip), %xmm0
000000000043ffd8	movq	%r14, %rdi
000000000043ffdb	callq	0x6df432                        ## symbol stub for: __ZN9OZChannel6setMaxEd
000000000043ffe0	leaq	0x1aa0(%rbx), %r15
000000000043ffe7	movq	0x3e4522(%rip), %rsi            ## literal pool symbol address: _kCMTimeZero
000000000043ffee	movsd	0x2c53ea(%rip), %xmm0
000000000043fff6	movq	%r15, %rdi
000000000043fff9	xorl	%edx, %edx
000000000043fffb	callq	0x6df456                        ## symbol stub for: __ZN9OZChannel8setValueERK6CMTimedb
0000000000440000	movq	%r12, %rdi
0000000000440003	movl	$0xf, %esi
0000000000440008	callq	0x6ddf68                        ## symbol stub for: __ZN15OZChannelFolder13resetFoldFlagEj
000000000044000d	leaq	0x44ecfc(%rip), %rsi            ## Objc cfstring ref: @"bad cfstring ref"
0000000000440014	movq	%r12, %rdi
0000000000440017	callq	0x6dd8de                        ## symbol stub for: __ZN13OZChannelBase25setInspectorCtlrClassNameEPK10__CFString
000000000044001c	movq	%r12, %rdi
000000000044001f	callq	0x6ddf92                        ## symbol stub for: __ZN15OZChannelFolder18saveStateAsDefaultEv
0000000000440024	movsd	0x2c53b4(%rip), %xmm0
000000000044002c	movq	%r15, %rdi
000000000044002f	callq	0x6df306                        ## symbol stub for: __ZN9OZChannel15setDefaultValueEd
0000000000440034	leaq	0x2be0(%rbx), %rdi
000000000044003b	movl	$0x2, %esi
0000000000440040	xorl	%edx, %edx
0000000000440042	callq	0x6dd92c                        ## symbol stub for: __ZN13OZChannelBase9resetFlagEyb
0000000000440047	movq	%r12, %rdi
000000000044004a	movl	$0x1, %esi
000000000044004f	callq	__ZN25OZChannelMaterialLayerMap17setEnableBumpTypeEb ## OZChannelMaterialLayerMap::setEnableBumpType(bool)
0000000000440054	addq	$0x28, %rsp
0000000000440058	popq	%rbx
0000000000440059	popq	%r12
000000000044005b	popq	%r13
000000000044005d	popq	%r14
000000000044005f	popq	%r15
0000000000440061	popq	%rbp
0000000000440062	retq
0000000000440063	movq	%rax, %r15
0000000000440066	leaq	-0x38(%rbp), %rdi
000000000044006a	callq	0x6df0c6                        ## symbol stub for: __ZN8PCStringD1Ev
000000000044006f	jmp	0x440074
0000000000440071	movq	%rax, %r15
0000000000440074	leaq	-0x30(%rbp), %rdi
0000000000440078	callq	0x6df0c6                        ## symbol stub for: __ZN8PCStringD1Ev
000000000044007d	jmp	0x4400e4
000000000044007f	movq	%rax, %r15
0000000000440082	jmp	0x4400e4
0000000000440084	movq	%rax, %r15
0000000000440087	leaq	-0x30(%rbp), %rdi
000000000044008b	callq	0x6df0c6                        ## symbol stub for: __ZN8PCStringD1Ev
0000000000440090	jmp	0x4400ec
0000000000440092	movq	%rax, %r15
0000000000440095	jmp	0x4400ec
0000000000440097	movq	%rax, %r15
000000000044009a	leaq	-0x30(%rbp), %rdi
000000000044009e	callq	0x6df0c6                        ## symbol stub for: __ZN8PCStringD1Ev
00000000004400a3	jmp	0x4400f5
00000000004400a5	movq	%rax, %r15
00000000004400a8	jmp	0x4400f5
00000000004400aa	movq	%rax, %r15
00000000004400ad	leaq	-0x30(%rbp), %rdi
00000000004400b1	callq	0x6df0c6                        ## symbol stub for: __ZN8PCStringD1Ev
00000000004400b6	movq	%rbx, %rdi
00000000004400b9	callq	__ZN19OZMaterialLayerBaseD2Ev   ## OZMaterialLayerBase::~OZMaterialLayerBase()
00000000004400be	movq	%r15, %rdi
00000000004400c1	callq	0x6dd07a                        ## symbol stub for: __Unwind_Resume
00000000004400c6	movq	%rax, %r15
00000000004400c9	movq	%rbx, %rdi
00000000004400cc	callq	__ZN19OZMaterialLayerBaseD2Ev   ## OZMaterialLayerBase::~OZMaterialLayerBase()
00000000004400d1	movq	%r15, %rdi
00000000004400d4	callq	0x6dd07a                        ## symbol stub for: __Unwind_Resume
00000000004400d9	movq	%rax, %r15
00000000004400dc	movq	%r13, %rdi
00000000004400df	callq	0x6dd9d4                        ## symbol stub for: __ZN13OZChannelEnumD1Ev
00000000004400e4	movq	%r12, %rdi
00000000004400e7	callq	__ZN25OZChannelMaterialLayerMapD2Ev ## OZChannelMaterialLayerMap::~OZChannelMaterialLayerMap()
00000000004400ec	movq	-0x40(%rbp), %rdi
00000000004400f0	callq	__ZN27OZChannelImageWithTransformD2Ev ## OZChannelImageWithTransform::~OZChannelImageWithTransform()
00000000004400f5	movq	%r14, %rdi
00000000004400f8	callq	0x6de18a                        ## symbol stub for: __ZN16OZChannelPercentD1Ev
00000000004400fd	movq	%rbx, %rdi
0000000000440100	callq	__ZN19OZMaterialLayerBaseD2Ev   ## OZMaterialLayerBase::~OZMaterialLayerBase()
0000000000440105	movq	%r15, %rdi
0000000000440108	callq	0x6dd07a                        ## symbol stub for: __Unwind_Resume
000000000044010d	nopl	(%rax)
