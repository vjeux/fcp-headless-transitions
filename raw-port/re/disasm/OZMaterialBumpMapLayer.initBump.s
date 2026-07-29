__ZN22OZMaterialBumpMapLayer8initBumpEv:
0000000000440110	pushq	%rbp
0000000000440111	movq	%rsp, %rbp
0000000000440114	pushq	%r15
0000000000440116	pushq	%r14
0000000000440118	pushq	%rbx
0000000000440119	pushq	%rax
000000000044011a	movq	%rdi, %rbx
000000000044011d	callq	__ZN19OZMaterialLayerBase8initBaseEv ## OZMaterialLayerBase::initBase()
0000000000440122	leaq	0x4d0(%rbx), %rdi
0000000000440129	movsd	0x2c792f(%rip), %xmm0
0000000000440131	callq	0x6df432                        ## symbol stub for: __ZN9OZChannel6setMaxEd
0000000000440136	leaq	0x1570(%rbx), %r14
000000000044013d	leaq	0x1aa0(%rbx), %r15
0000000000440144	movq	0x3e43c5(%rip), %rsi            ## literal pool symbol address: _kCMTimeZero
000000000044014b	movsd	0x2c528d(%rip), %xmm0
0000000000440153	movq	%r15, %rdi
0000000000440156	xorl	%edx, %edx
0000000000440158	callq	0x6df456                        ## symbol stub for: __ZN9OZChannel8setValueERK6CMTimedb
000000000044015d	movq	%r14, %rdi
0000000000440160	movl	$0xf, %esi
0000000000440165	callq	0x6ddf68                        ## symbol stub for: __ZN15OZChannelFolder13resetFoldFlagEj
000000000044016a	leaq	0x44eb9f(%rip), %rsi            ## Objc cfstring ref: @"bad cfstring ref"
0000000000440171	movq	%r14, %rdi
0000000000440174	callq	0x6dd8de                        ## symbol stub for: __ZN13OZChannelBase25setInspectorCtlrClassNameEPK10__CFString
0000000000440179	movq	%r14, %rdi
000000000044017c	callq	0x6ddf92                        ## symbol stub for: __ZN15OZChannelFolder18saveStateAsDefaultEv
0000000000440181	movq	%r15, %rdi
0000000000440184	movsd	0x2c5254(%rip), %xmm0
000000000044018c	callq	0x6df306                        ## symbol stub for: __ZN9OZChannel15setDefaultValueEd
0000000000440191	addq	$0x2be0, %rbx                   ## imm = 0x2BE0
0000000000440198	movl	$0x2, %esi
000000000044019d	movq	%rbx, %rdi
00000000004401a0	xorl	%edx, %edx
00000000004401a2	callq	0x6dd92c                        ## symbol stub for: __ZN13OZChannelBase9resetFlagEyb
00000000004401a7	movq	%r14, %rdi
00000000004401aa	movl	$0x1, %esi
00000000004401af	addq	$0x8, %rsp
00000000004401b3	popq	%rbx
00000000004401b4	popq	%r14
00000000004401b6	popq	%r15
00000000004401b8	popq	%rbp
00000000004401b9	jmp	__ZN25OZChannelMaterialLayerMap17setEnableBumpTypeEb ## OZChannelMaterialLayerMap::setEnableBumpType(bool)
00000000004401be	nop
