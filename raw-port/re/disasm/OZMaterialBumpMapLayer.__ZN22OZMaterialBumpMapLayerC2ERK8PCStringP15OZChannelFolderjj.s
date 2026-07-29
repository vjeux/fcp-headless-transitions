__ZN22OZMaterialBumpMapLayerC2ERK8PCStringP15OZChannelFolderjj:
00000000004401d0	pushq	%rbp
00000000004401d1	movq	%rsp, %rbp
00000000004401d4	pushq	%r15
00000000004401d6	pushq	%r14
00000000004401d8	pushq	%r13
00000000004401da	pushq	%r12
00000000004401dc	pushq	%rbx
00000000004401dd	subq	$0x38, %rsp
00000000004401e1	movl	%r8d, %r14d
00000000004401e4	movl	%ecx, %r15d
00000000004401e7	movq	%rdx, %r12
00000000004401ea	movq	%rsi, %r13
00000000004401ed	movq	%rdi, %rbx
00000000004401f0	movq	__ZN30OZMaterialBumpMapLayer_Factory13_instanceOnceE(%rip), %rax ## OZMaterialBumpMapLayer_Factory::_instanceOnce
00000000004401f7	cmpq	$-0x1, %rax
00000000004401fb	je	0x440224
00000000004401fd	leaq	-0x31(%rbp), %rax
0000000000440201	movq	%rax, -0x30(%rbp)
0000000000440205	leaq	-0x30(%rbp), %rax
0000000000440209	movq	%rax, -0x40(%rbp)
000000000044020d	leaq	__ZN30OZMaterialBumpMapLayer_Factory13_instanceOnceE(%rip), %rdi ## OZMaterialBumpMapLayer_Factory::_instanceOnce
0000000000440214	leaq	__ZNSt3__117__call_once_proxyB9nqe210106INS_5tupleIJOZN30OZMaterialBumpMapLayer_Factory11getInstanceEvEUlvE_EEEEEvPv(%rip), %rdx ## void std::__1::__call_once_proxy[abi:nqe210106]<std::__1::tuple<OZMaterialBumpMapLayer_Factory::getInstance()::'lambda'()&&>>(void*)
000000000044021b	leaq	-0x40(%rbp), %rsi
000000000044021f	callq	0x6dfb2e                        ## symbol stub for: __ZNSt3__111__call_onceERVmPvPFvS2_E
0000000000440224	movq	__ZN30OZMaterialBumpMapLayer_Factory9_instanceE(%rip), %rsi ## OZMaterialBumpMapLayer_Factory::_instance
000000000044022b	movq	%rbx, %rdi
000000000044022e	movq	%r13, %rdx
0000000000440231	movq	%r12, %rcx
0000000000440234	movl	%r15d, %r8d
0000000000440237	movl	%r14d, %r9d
000000000044023a	callq	__ZN19OZMaterialLayerBaseC2EP9OZFactoryRK8PCStringP15OZChannelFolderjj ## OZMaterialLayerBase::OZMaterialLayerBase(OZFactory*, PCString const&, OZChannelFolder*, unsigned int, unsigned int)
000000000044023f	leaq	0x4241e2(%rip), %rax
0000000000440246	movq	%rax, (%rbx)
0000000000440249	leaq	0x4245b0(%rip), %rax
0000000000440250	movq	%rax, 0x10(%rbx)
0000000000440254	leaq	0x4245fd(%rip), %rax
000000000044025b	movq	%rax, 0x4c8(%rbx)
0000000000440262	leaq	_theApp(%rip), %r15
0000000000440269	movq	(%r15), %rax
000000000044026c	movq	0x48(%rax), %rdx
0000000000440270	leaq	0x4547b9(%rip), %rsi            ## Objc cfstring ref: @"bad cfstring ref"
0000000000440277	leaq	-0x30(%rbp), %rdi
000000000044027b	xorl	%ecx, %ecx
000000000044027d	callq	0x6df08a                        ## symbol stub for: __ZN8PCStringC1EPK10__CFStringP10__CFBundleS2_
0000000000440282	leaq	0x4d0(%rbx), %r14
0000000000440289	movq	$0x0, (%rsp)
0000000000440291	movsd	0x2c5147(%rip), %xmm0
0000000000440299	leaq	-0x30(%rbp), %rsi
000000000044029d	movq	%r14, %rdi
00000000004402a0	movq	%rbx, %rdx
00000000004402a3	movl	$0x65, %ecx
00000000004402a8	xorl	%r8d, %r8d
00000000004402ab	xorl	%r9d, %r9d
00000000004402ae	callq	0x6de184                        ## symbol stub for: __ZN16OZChannelPercentC1EdRK8PCStringP15OZChannelFolderjjP13OZChannelImplP13OZChannelInfo
00000000004402b3	leaq	-0x30(%rbp), %rdi
00000000004402b7	callq	0x6df0c6                        ## symbol stub for: __ZN8PCStringD1Ev
00000000004402bc	movq	(%r15), %rax
00000000004402bf	movq	0x48(%rax), %rdx
00000000004402c3	leaq	0x454786(%rip), %rsi            ## Objc cfstring ref: @"bad cfstring ref"
00000000004402ca	leaq	-0x30(%rbp), %rdi
00000000004402ce	xorl	%ecx, %ecx
00000000004402d0	callq	0x6df08a                        ## symbol stub for: __ZN8PCStringC1EPK10__CFStringP10__CFBundleS2_
00000000004402d5	leaq	0x568(%rbx), %rdi
00000000004402dc	leaq	-0x30(%rbp), %rsi
00000000004402e0	movq	%rdi, -0x48(%rbp)
00000000004402e4	movq	%rbx, %rdx
00000000004402e7	movl	$0x64, %ecx
00000000004402ec	movl	$0x2, %r8d
00000000004402f2	callq	__ZN27OZChannelImageWithTransformC1ERK8PCStringP15OZChannelFolderjj ## OZChannelImageWithTransform::OZChannelImageWithTransform(PCString const&, OZChannelFolder*, unsigned int, unsigned int)
00000000004402f7	leaq	-0x30(%rbp), %rdi
00000000004402fb	callq	0x6df0c6                        ## symbol stub for: __ZN8PCStringD1Ev
0000000000440300	movq	(%r15), %rax
0000000000440303	movq	0x48(%rax), %rdx
0000000000440307	leaq	0x454742(%rip), %rsi            ## Objc cfstring ref: @"bad cfstring ref"
000000000044030e	leaq	-0x30(%rbp), %rdi
0000000000440312	xorl	%ecx, %ecx
0000000000440314	callq	0x6df08a                        ## symbol stub for: __ZN8PCStringC1EPK10__CFStringP10__CFBundleS2_
0000000000440319	leaq	0x1570(%rbx), %r12
0000000000440320	leaq	-0x30(%rbp), %rsi
0000000000440324	movq	%r12, %rdi
0000000000440327	movq	%rbx, %rdx
000000000044032a	movl	$0x67, %ecx
000000000044032f	xorl	%r8d, %r8d
0000000000440332	callq	__ZN25OZChannelMaterialLayerMapC1ERK8PCStringP15OZChannelFolderjj ## OZChannelMaterialLayerMap::OZChannelMaterialLayerMap(PCString const&, OZChannelFolder*, unsigned int, unsigned int)
0000000000440337	leaq	-0x30(%rbp), %rdi
000000000044033b	callq	0x6df0c6                        ## symbol stub for: __ZN8PCStringD1Ev
0000000000440340	movq	(%r15), %rax
0000000000440343	movq	0x48(%rax), %rdx
0000000000440347	leaq	0x454722(%rip), %rsi            ## Objc cfstring ref: @"bad cfstring ref"
000000000044034e	leaq	-0x30(%rbp), %rdi
0000000000440352	xorl	%ecx, %ecx
0000000000440354	callq	0x6df08a                        ## symbol stub for: __ZN8PCStringC1EPK10__CFStringP10__CFBundleS2_
0000000000440359	movq	(%r15), %rax
000000000044035c	movq	0x48(%rax), %rdx
0000000000440360	leaq	0x454729(%rip), %rsi            ## Objc cfstring ref: @"bad cfstring ref"
0000000000440367	leaq	-0x40(%rbp), %rdi
000000000044036b	xorl	%ecx, %ecx
000000000044036d	callq	0x6df08a                        ## symbol stub for: __ZN8PCStringC1EPK10__CFStringP10__CFBundleS2_
0000000000440372	leaq	0x2ea8(%rbx), %r13
0000000000440379	xorps	%xmm0, %xmm0
000000000044037c	movups	%xmm0, (%rsp)
0000000000440380	leaq	-0x30(%rbp), %rsi
0000000000440384	leaq	-0x40(%rbp), %rdx
0000000000440388	movq	%r13, %rdi
000000000044038b	movq	%rbx, %rcx
000000000044038e	movl	$0x66, %r8d
0000000000440394	xorl	%r9d, %r9d
0000000000440397	callq	0x6dd9a4                        ## symbol stub for: __ZN13OZChannelEnumC1ERK8PCStringS2_P15OZChannelFolderjjP13OZChannelImplP13OZChannelInfo
000000000044039c	leaq	-0x40(%rbp), %rdi
00000000004403a0	callq	0x6df0c6                        ## symbol stub for: __ZN8PCStringD1Ev
00000000004403a5	leaq	-0x30(%rbp), %rdi
00000000004403a9	callq	0x6df0c6                        ## symbol stub for: __ZN8PCStringD1Ev
00000000004403ae	movq	%rbx, %rdi
00000000004403b1	callq	__ZN19OZMaterialLayerBase8initBaseEv ## OZMaterialLayerBase::initBase()
00000000004403b6	movsd	0x2c76a2(%rip), %xmm0
00000000004403be	movq	%r14, %rdi
00000000004403c1	callq	0x6df432                        ## symbol stub for: __ZN9OZChannel6setMaxEd
00000000004403c6	leaq	0x1aa0(%rbx), %r15
00000000004403cd	movq	0x3e413c(%rip), %rsi            ## literal pool symbol address: _kCMTimeZero
00000000004403d4	movsd	0x2c5004(%rip), %xmm0
00000000004403dc	movq	%r15, %rdi
00000000004403df	xorl	%edx, %edx
00000000004403e1	callq	0x6df456                        ## symbol stub for: __ZN9OZChannel8setValueERK6CMTimedb
00000000004403e6	movq	%r12, %rdi
00000000004403e9	movl	$0xf, %esi
00000000004403ee	callq	0x6ddf68                        ## symbol stub for: __ZN15OZChannelFolder13resetFoldFlagEj
00000000004403f3	leaq	0x44e916(%rip), %rsi            ## Objc cfstring ref: @"bad cfstring ref"
00000000004403fa	movq	%r12, %rdi
00000000004403fd	callq	0x6dd8de                        ## symbol stub for: __ZN13OZChannelBase25setInspectorCtlrClassNameEPK10__CFString
0000000000440402	movq	%r12, %rdi
0000000000440405	callq	0x6ddf92                        ## symbol stub for: __ZN15OZChannelFolder18saveStateAsDefaultEv
000000000044040a	movsd	0x2c4fce(%rip), %xmm0
0000000000440412	movq	%r15, %rdi
0000000000440415	callq	0x6df306                        ## symbol stub for: __ZN9OZChannel15setDefaultValueEd
000000000044041a	leaq	0x2be0(%rbx), %rdi
0000000000440421	movl	$0x2, %esi
0000000000440426	xorl	%edx, %edx
0000000000440428	callq	0x6dd92c                        ## symbol stub for: __ZN13OZChannelBase9resetFlagEyb
000000000044042d	movq	%r12, %rdi
0000000000440430	movl	$0x1, %esi
0000000000440435	callq	__ZN25OZChannelMaterialLayerMap17setEnableBumpTypeEb ## OZChannelMaterialLayerMap::setEnableBumpType(bool)
000000000044043a	addq	$0x38, %rsp
000000000044043e	popq	%rbx
000000000044043f	popq	%r12
0000000000440441	popq	%r13
0000000000440443	popq	%r14
0000000000440445	popq	%r15
0000000000440447	popq	%rbp
0000000000440448	retq
0000000000440449	movq	%rax, %r15
000000000044044c	leaq	-0x40(%rbp), %rdi
0000000000440450	callq	0x6df0c6                        ## symbol stub for: __ZN8PCStringD1Ev
0000000000440455	jmp	0x44045a
0000000000440457	movq	%rax, %r15
000000000044045a	leaq	-0x30(%rbp), %rdi
000000000044045e	callq	0x6df0c6                        ## symbol stub for: __ZN8PCStringD1Ev
0000000000440463	jmp	0x4404ca
0000000000440465	movq	%rax, %r15
0000000000440468	jmp	0x4404ca
000000000044046a	movq	%rax, %r15
000000000044046d	leaq	-0x30(%rbp), %rdi
0000000000440471	callq	0x6df0c6                        ## symbol stub for: __ZN8PCStringD1Ev
0000000000440476	jmp	0x4404d2
0000000000440478	movq	%rax, %r15
000000000044047b	jmp	0x4404d2
000000000044047d	movq	%rax, %r15
0000000000440480	leaq	-0x30(%rbp), %rdi
0000000000440484	callq	0x6df0c6                        ## symbol stub for: __ZN8PCStringD1Ev
0000000000440489	jmp	0x4404db
000000000044048b	movq	%rax, %r15
000000000044048e	jmp	0x4404db
0000000000440490	movq	%rax, %r15
0000000000440493	leaq	-0x30(%rbp), %rdi
0000000000440497	callq	0x6df0c6                        ## symbol stub for: __ZN8PCStringD1Ev
000000000044049c	movq	%rbx, %rdi
000000000044049f	callq	__ZN19OZMaterialLayerBaseD2Ev   ## OZMaterialLayerBase::~OZMaterialLayerBase()
00000000004404a4	movq	%r15, %rdi
00000000004404a7	callq	0x6dd07a                        ## symbol stub for: __Unwind_Resume
00000000004404ac	movq	%rax, %r15
00000000004404af	movq	%rbx, %rdi
00000000004404b2	callq	__ZN19OZMaterialLayerBaseD2Ev   ## OZMaterialLayerBase::~OZMaterialLayerBase()
00000000004404b7	movq	%r15, %rdi
00000000004404ba	callq	0x6dd07a                        ## symbol stub for: __Unwind_Resume
00000000004404bf	movq	%rax, %r15
00000000004404c2	movq	%r13, %rdi
00000000004404c5	callq	0x6dd9d4                        ## symbol stub for: __ZN13OZChannelEnumD1Ev
00000000004404ca	movq	%r12, %rdi
00000000004404cd	callq	__ZN25OZChannelMaterialLayerMapD2Ev ## OZChannelMaterialLayerMap::~OZChannelMaterialLayerMap()
00000000004404d2	movq	-0x48(%rbp), %rdi
00000000004404d6	callq	__ZN27OZChannelImageWithTransformD2Ev ## OZChannelImageWithTransform::~OZChannelImageWithTransform()
00000000004404db	movq	%r14, %rdi
00000000004404de	callq	0x6de18a                        ## symbol stub for: __ZN16OZChannelPercentD1Ev
00000000004404e3	movq	%rbx, %rdi
00000000004404e6	callq	__ZN19OZMaterialLayerBaseD2Ev   ## OZMaterialLayerBase::~OZMaterialLayerBase()
00000000004404eb	movq	%r15, %rdi
00000000004404ee	callq	0x6dd07a                        ## symbol stub for: __Unwind_Resume
00000000004404f3	nopw	%cs:(%rax,%rax)
