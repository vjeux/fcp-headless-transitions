__ZN47PainterPipelineStatesForDeviceAndMTLPixelFormatC2EPU19objcproto9MTLDevice11objc_object14MTLPixelFormatPU21objcproto10MTLLibrary11objc_object:
0000000000d67400	pushq	%rbp
0000000000d67401	movq	%rsp, %rbp
0000000000d67404	pushq	%r15
0000000000d67406	pushq	%r14
0000000000d67408	pushq	%r13
0000000000d6740a	pushq	%r12
0000000000d6740c	pushq	%rbx
0000000000d6740d	subq	$0x18, %rsp
0000000000d67411	movq	%rcx, %r14
0000000000d67414	movq	%rsi, %r15
0000000000d67417	movq	%rdi, %rbx
0000000000d6741a	movq	$0x0, (%rdi)
0000000000d67421	movq	%rdx, 0x8(%rdi)
0000000000d67425	movb	$0x0, 0x10(%rdi)
0000000000d67429	xorps	%xmm0, %xmm0
0000000000d6742c	movups	%xmm0, 0x18(%rdi)
0000000000d67430	movq	$0x0, 0x28(%rdi)
0000000000d67438	movups	%xmm0, 0x50(%rdi)
0000000000d6743c	movups	%xmm0, 0x60(%rdi)
0000000000d67440	movups	%xmm0, 0x70(%rdi)
0000000000d67444	movq	$0x0, -0x30(%rbp)
0000000000d6744c	movq	%rsi, %rdi
0000000000d6744f	callq	*0xb862bb(%rip)                 ## literal pool symbol address: _objc_retain
0000000000d67455	movq	%rax, (%rbx)
0000000000d67458	xorps	%xmm0, %xmm0
0000000000d6745b	movups	%xmm0, 0x30(%rbx)
0000000000d6745f	movups	%xmm0, 0x40(%rbx)
0000000000d67463	cmpb	$0x0, 0x10(%rbx)
0000000000d67467	jne	0xd67490
0000000000d67469	movq	0x8(%rbx), %rdx
0000000000d6746d	leaq	-0x30(%rbp), %rax
0000000000d67471	movq	%rax, (%rsp)
0000000000d67475	movq	%r15, %rdi
0000000000d67478	xorl	%esi, %esi
0000000000d6747a	xorl	%ecx, %ecx
0000000000d6747c	xorl	%r8d, %r8d
0000000000d6747f	xorl	%r9d, %r9d
0000000000d67482	callq	__ZL34createPipelineStateForVideoDrawingPU19objcproto9MTLDevice11objc_objectb14MTLPixelFormatbbiPP7NSError ## createPipelineStateForVideoDrawing(id<MTLDevice>, bool, MTLPixelFormat, bool, bool, int, NSError**)
0000000000d67487	movq	%rax, 0x20(%rbx)
0000000000d6748b	testq	%rax, %rax
0000000000d6748e	je	0xd674d6
0000000000d67490	cmpb	$0x0, 0x10(%rbx)
0000000000d67494	jne	0xd674ee
0000000000d67496	movq	0x8(%rbx), %rdx
0000000000d6749a	leaq	-0x30(%rbp), %rax
0000000000d6749e	movq	%rax, (%rsp)
0000000000d674a2	movq	%r15, %rdi
0000000000d674a5	xorl	%esi, %esi
0000000000d674a7	movl	$0x1, %ecx
0000000000d674ac	xorl	%r8d, %r8d
0000000000d674af	xorl	%r9d, %r9d
0000000000d674b2	callq	__ZL34createPipelineStateForVideoDrawingPU19objcproto9MTLDevice11objc_objectb14MTLPixelFormatbbiPP7NSError ## createPipelineStateForVideoDrawing(id<MTLDevice>, bool, MTLPixelFormat, bool, bool, int, NSError**)
0000000000d674b7	movq	%rax, 0x28(%rbx)
0000000000d674bb	cmpq	$0x0, 0x20(%rbx)
0000000000d674c0	jne	0xd674ee
0000000000d674c2	movb	$0x1, 0x10(%rbx)
0000000000d674c6	movq	-0x30(%rbp), %rdi
0000000000d674ca	callq	*0xb86240(%rip)                 ## literal pool symbol address: _objc_retain
0000000000d674d0	movq	%rax, 0x18(%rbx)
0000000000d674d4	jmp	0xd674ee
0000000000d674d6	movb	$0x1, 0x10(%rbx)
0000000000d674da	movq	-0x30(%rbp), %rdi
0000000000d674de	callq	*0xb8622c(%rip)                 ## literal pool symbol address: _objc_retain
0000000000d674e4	movq	%rax, 0x18(%rbx)
0000000000d674e8	cmpb	$0x0, 0x10(%rbx)
0000000000d674ec	je	0xd67496
0000000000d674ee	cmpb	$0x0, 0x10(%rbx)
0000000000d674f2	jne	0xd675af
0000000000d674f8	movq	0x8(%rbx), %rdx
0000000000d674fc	leaq	-0x30(%rbp), %r12
0000000000d67500	movq	%r12, (%rsp)
0000000000d67504	movq	%r15, %rdi
0000000000d67507	xorl	%esi, %esi
0000000000d67509	xorl	%ecx, %ecx
0000000000d6750b	movl	$0x1, %r8d
0000000000d67511	xorl	%r9d, %r9d
0000000000d67514	callq	__ZL34createPipelineStateForVideoDrawingPU19objcproto9MTLDevice11objc_objectb14MTLPixelFormatbbiPP7NSError ## createPipelineStateForVideoDrawing(id<MTLDevice>, bool, MTLPixelFormat, bool, bool, int, NSError**)
0000000000d67519	movq	%rax, 0x30(%rbx)
0000000000d6751d	testq	%rax, %rax
0000000000d67520	je	0xd6759d
0000000000d67522	movq	0x8(%rbx), %rdx
0000000000d67526	movq	%r12, (%rsp)
0000000000d6752a	movq	%r15, %rdi
0000000000d6752d	xorl	%esi, %esi
0000000000d6752f	xorl	%ecx, %ecx
0000000000d67531	movl	$0x1, %r8d
0000000000d67537	movl	$0x1, %r9d
0000000000d6753d	callq	__ZL34createPipelineStateForVideoDrawingPU19objcproto9MTLDevice11objc_objectb14MTLPixelFormatbbiPP7NSError ## createPipelineStateForVideoDrawing(id<MTLDevice>, bool, MTLPixelFormat, bool, bool, int, NSError**)
0000000000d67542	movq	%rax, 0x38(%rbx)
0000000000d67546	testq	%rax, %rax
0000000000d67549	je	0xd6759d
0000000000d6754b	movq	0x8(%rbx), %rdx
0000000000d6754f	movq	%r12, (%rsp)
0000000000d67553	movq	%r15, %rdi
0000000000d67556	xorl	%esi, %esi
0000000000d67558	xorl	%ecx, %ecx
0000000000d6755a	movl	$0x1, %r8d
0000000000d67560	movl	$0x2, %r9d
0000000000d67566	callq	__ZL34createPipelineStateForVideoDrawingPU19objcproto9MTLDevice11objc_objectb14MTLPixelFormatbbiPP7NSError ## createPipelineStateForVideoDrawing(id<MTLDevice>, bool, MTLPixelFormat, bool, bool, int, NSError**)
0000000000d6756b	movq	%rax, 0x40(%rbx)
0000000000d6756f	testq	%rax, %rax
0000000000d67572	je	0xd6759d
0000000000d67574	movq	0x8(%rbx), %rdx
0000000000d67578	movq	%r12, (%rsp)
0000000000d6757c	movq	%r15, %rdi
0000000000d6757f	xorl	%esi, %esi
0000000000d67581	xorl	%ecx, %ecx
0000000000d67583	movl	$0x1, %r8d
0000000000d67589	movl	$0x3, %r9d
0000000000d6758f	callq	__ZL34createPipelineStateForVideoDrawingPU19objcproto9MTLDevice11objc_objectb14MTLPixelFormatbbiPP7NSError ## createPipelineStateForVideoDrawing(id<MTLDevice>, bool, MTLPixelFormat, bool, bool, int, NSError**)
0000000000d67594	movq	%rax, 0x48(%rbx)
0000000000d67598	testq	%rax, %rax
0000000000d6759b	jne	0xd675af
0000000000d6759d	movb	$0x1, 0x10(%rbx)
0000000000d675a1	movq	-0x30(%rbp), %rdi
0000000000d675a5	callq	*0xb86165(%rip)                 ## literal pool symbol address: _objc_retain
0000000000d675ab	movq	%rax, 0x18(%rbx)
0000000000d675af	cmpb	$0x0, 0x10(%rbx)
0000000000d675b3	jne	0xd67c7c
0000000000d675b9	movq	0xb858a8(%rip), %rdi            ## literal pool symbol address: _OBJC_CLASS_$_MTLRenderPipelineDescriptor
0000000000d675c0	callq	0x1497908                       ## symbol stub for: _objc_alloc_init
0000000000d675c5	movq	%rax, %r12
0000000000d675c8	movq	0xe85369(%rip), %r13
0000000000d675cf	leaq	0xc45552(%rip), %rdx            ## Objc cfstring ref: @"bad cfstring ref"
0000000000d675d6	movq	0xb860e3(%rip), %r15            ## Objc message: -[%rdi requestedSizeForAssetSize:scaleDownFactor:codec:outProxySizeAdjustedForCodec:]
0000000000d675dd	movq	%r14, %rdi
0000000000d675e0	movq	%r13, %rsi
0000000000d675e3	callq	*%r15
0000000000d675e6	movq	%rax, %rdi
0000000000d675e9	callq	0x149790e                       ## symbol stub for: _objc_autorelease
0000000000d675ee	movq	0xe8a743(%rip), %rsi
0000000000d675f5	movq	%r12, %rdi
0000000000d675f8	movq	%rax, %rdx
0000000000d675fb	callq	*%r15
0000000000d675fe	leaq	0xc45543(%rip), %rdx            ## Objc cfstring ref: @"bad cfstring ref"
0000000000d67605	movq	%r14, %rdi
0000000000d67608	movq	%r13, %rsi
0000000000d6760b	callq	*%r15
0000000000d6760e	movq	%rax, %rdi
0000000000d67611	callq	0x149790e                       ## symbol stub for: _objc_autorelease
0000000000d67616	movq	0xe8a723(%rip), %rsi
0000000000d6761d	movq	%r12, %rdi
0000000000d67620	movq	%rax, %rdx
0000000000d67623	callq	*%r15
0000000000d67626	movq	0xe52e4b(%rip), %rsi
0000000000d6762d	leaq	0xc45534(%rip), %rdx            ## Objc cfstring ref: @"bad cfstring ref"
0000000000d67634	movq	%r12, %rdi
0000000000d67637	callq	*%r15
0000000000d6763a	movq	0x8(%rbx), %r13
0000000000d6763e	movq	0xe6ee4b(%rip), %rsi
0000000000d67645	movq	%r12, %rdi
0000000000d67648	callq	*%r15
0000000000d6764b	movq	0xe5129e(%rip), %rsi
0000000000d67652	movq	%rax, %rdi
0000000000d67655	xorl	%edx, %edx
0000000000d67657	callq	*%r15
0000000000d6765a	movq	0xe714df(%rip), %rsi
0000000000d67661	movq	%rax, %rdi
0000000000d67664	movq	%r13, %rdx
0000000000d67667	callq	*%r15
0000000000d6766a	movq	(%rbx), %rdi
0000000000d6766d	movq	0xe8a6d4(%rip), %rsi
0000000000d67674	leaq	-0x30(%rbp), %rcx
0000000000d67678	movq	%r12, %rdx
0000000000d6767b	callq	*%r15
0000000000d6767e	movq	%rax, 0x50(%rbx)
0000000000d67682	testq	%rax, %rax
0000000000d67685	je	0xd6769b
0000000000d67687	movq	%r12, %rdi
0000000000d6768a	callq	*0xb86078(%rip)                 ## literal pool symbol address: _objc_release
0000000000d67690	cmpb	$0x0, 0x10(%rbx)
0000000000d67694	je	0xd676c0
0000000000d67696	jmp	0xd67c7c
0000000000d6769b	movb	$0x1, 0x10(%rbx)
0000000000d6769f	movq	-0x30(%rbp), %rdi
0000000000d676a3	callq	*0xb86067(%rip)                 ## literal pool symbol address: _objc_retain
0000000000d676a9	movq	%rax, 0x18(%rbx)
0000000000d676ad	movq	%r12, %rdi
0000000000d676b0	callq	*0xb86052(%rip)                 ## literal pool symbol address: _objc_release
0000000000d676b6	cmpb	$0x0, 0x10(%rbx)
0000000000d676ba	jne	0xd67c7c
0000000000d676c0	movq	0xb857a1(%rip), %rdi            ## literal pool symbol address: _OBJC_CLASS_$_MTLRenderPipelineDescriptor
0000000000d676c7	callq	0x1497908                       ## symbol stub for: _objc_alloc_init
0000000000d676cc	movq	%rax, %r12
0000000000d676cf	leaq	0xc45452(%rip), %rdx            ## Objc cfstring ref: @"bad cfstring ref"
0000000000d676d6	movq	%r14, %rdi
0000000000d676d9	movq	0xe85258(%rip), %r13
0000000000d676e0	movq	%r13, %rsi
0000000000d676e3	callq	*%r15
0000000000d676e6	movq	%rax, %rdi
0000000000d676e9	callq	0x149790e                       ## symbol stub for: _objc_autorelease
0000000000d676ee	movq	%r12, %rdi
0000000000d676f1	movq	0xe8a640(%rip), %rsi
0000000000d676f8	movq	%rax, %rdx
0000000000d676fb	callq	*%r15
0000000000d676fe	leaq	0xc45483(%rip), %rdx            ## Objc cfstring ref: @"bad cfstring ref"
0000000000d67705	movq	%r14, -0x38(%rbp)
0000000000d67709	movq	%r14, %rdi
0000000000d6770c	movq	%r13, %rsi
0000000000d6770f	callq	*%r15
0000000000d67712	movq	%rax, %rdi
0000000000d67715	callq	0x149790e                       ## symbol stub for: _objc_autorelease
0000000000d6771a	movq	%r12, %rdi
0000000000d6771d	movq	0xe8a61c(%rip), %rsi
0000000000d67724	movq	%rax, %rdx
0000000000d67727	callq	*%r15
0000000000d6772a	leaq	0xc45477(%rip), %rdx            ## Objc cfstring ref: @"bad cfstring ref"
0000000000d67731	movq	%r12, %rdi
0000000000d67734	movq	0xe52d3d(%rip), %rsi
0000000000d6773b	callq	*%r15
0000000000d6773e	movq	0x8(%rbx), %r13
0000000000d67742	movq	%r12, %rdi
0000000000d67745	movq	0xe6ed44(%rip), %rsi
0000000000d6774c	callq	*%r15
0000000000d6774f	movq	%rax, %rdi
0000000000d67752	movq	0xe51197(%rip), %r14
0000000000d67759	movq	%r14, %rsi
0000000000d6775c	xorl	%edx, %edx
0000000000d6775e	callq	*%r15
0000000000d67761	movq	%rax, %rdi
0000000000d67764	movq	0xe713d5(%rip), %rsi
0000000000d6776b	movq	%r13, %rdx
0000000000d6776e	callq	*%r15
0000000000d67771	movq	%r12, %rdi
0000000000d67774	movq	0xe6ed15(%rip), %rsi
0000000000d6777b	callq	*%r15
0000000000d6777e	movq	%rax, %rdi
0000000000d67781	movq	%r14, %rsi
0000000000d67784	xorl	%edx, %edx
0000000000d67786	callq	*%r15
0000000000d67789	movq	%rax, %r13
0000000000d6778c	movq	0xe6e535(%rip), %rsi
0000000000d67793	movq	%rax, %rdi
0000000000d67796	movl	$0x1, %edx
0000000000d6779b	callq	*%r15
0000000000d6779e	movq	0xe8a70b(%rip), %rsi
0000000000d677a5	movq	%r13, %rdi
0000000000d677a8	xorl	%edx, %edx
0000000000d677aa	callq	*%r15
0000000000d677ad	movq	0xe8a704(%rip), %rsi
0000000000d677b4	movq	%r13, %rdi
0000000000d677b7	xorl	%edx, %edx
0000000000d677b9	callq	*%r15
0000000000d677bc	movq	0xe8a6fd(%rip), %rsi
0000000000d677c3	movl	$0x5, %edx
0000000000d677c8	movq	%r13, %rdi
0000000000d677cb	callq	*%r15
0000000000d677ce	movq	0xe8a6f3(%rip), %rsi
0000000000d677d5	movl	$0x5, %edx
0000000000d677da	movq	%r13, %rdi
0000000000d677dd	callq	*%r15
0000000000d677e0	movq	0xe8a6e9(%rip), %rsi
0000000000d677e7	movl	$0x1, %edx
0000000000d677ec	movq	%r13, %rdi
0000000000d677ef	callq	*%r15
0000000000d677f2	movq	0xe8a6df(%rip), %rsi
0000000000d677f9	movl	$0x1, %edx
0000000000d677fe	movq	%r13, %rdi
0000000000d67801	callq	*%r15
0000000000d67804	movq	(%rbx), %rdi
0000000000d67807	leaq	-0x30(%rbp), %rcx
0000000000d6780b	movq	0xe8a536(%rip), %rsi
0000000000d67812	movq	%r12, %rdx
0000000000d67815	callq	*%r15
0000000000d67818	movq	%rax, 0x58(%rbx)
0000000000d6781c	testq	%rax, %rax
0000000000d6781f	jne	0xd67833
0000000000d67821	movb	$0x1, 0x10(%rbx)
0000000000d67825	movq	-0x30(%rbp), %rdi
0000000000d67829	callq	*0xb85ee1(%rip)                 ## literal pool symbol address: _objc_retain
0000000000d6782f	movq	%rax, 0x18(%rbx)
0000000000d67833	movq	%r12, %rdi
0000000000d67836	callq	*0xb85ecc(%rip)                 ## literal pool symbol address: _objc_release
0000000000d6783c	cmpb	$0x0, 0x10(%rbx)
0000000000d67840	movq	-0x38(%rbp), %r14
0000000000d67844	jne	0xd67c7c
0000000000d6784a	movq	0xb85617(%rip), %rdi            ## literal pool symbol address: _OBJC_CLASS_$_MTLRenderPipelineDescriptor
0000000000d67851	callq	0x1497908                       ## symbol stub for: _objc_alloc_init
0000000000d67856	movq	%rax, %r12
0000000000d67859	leaq	0xc452c8(%rip), %rdx            ## Objc cfstring ref: @"bad cfstring ref"
0000000000d67860	movq	%r14, %rdi
0000000000d67863	movq	0xe850ce(%rip), %r13
0000000000d6786a	movq	%r13, %rsi
0000000000d6786d	callq	*%r15
0000000000d67870	movq	%rax, %rdi
0000000000d67873	callq	0x149790e                       ## symbol stub for: _objc_autorelease
0000000000d67878	movq	%r12, %rdi
0000000000d6787b	movq	0xe8a4b6(%rip), %rsi
0000000000d67882	movq	%rax, %rdx
0000000000d67885	callq	*%r15
0000000000d67888	leaq	0xc45339(%rip), %rdx            ## Objc cfstring ref: @"bad cfstring ref"
0000000000d6788f	movq	%r14, %rdi
0000000000d67892	movq	%r13, %rsi
0000000000d67895	callq	*%r15
0000000000d67898	movq	%rax, %rdi
0000000000d6789b	callq	0x149790e                       ## symbol stub for: _objc_autorelease
0000000000d678a0	movq	%r12, %rdi
0000000000d678a3	movq	0xe8a496(%rip), %rsi
0000000000d678aa	movq	%rax, %rdx
0000000000d678ad	callq	*%r15
0000000000d678b0	leaq	0xc45331(%rip), %rdx            ## Objc cfstring ref: @"bad cfstring ref"
0000000000d678b7	movq	%r12, %rdi
0000000000d678ba	movq	0xe52bb7(%rip), %rsi
0000000000d678c1	callq	*%r15
0000000000d678c4	movq	0x8(%rbx), %r13
0000000000d678c8	movq	%r12, %rdi
0000000000d678cb	movq	0xe6ebbe(%rip), %rsi
0000000000d678d2	callq	*%r15
0000000000d678d5	movq	%rax, %rdi
0000000000d678d8	movq	0xe51011(%rip), %r14
0000000000d678df	movq	%r14, %rsi
0000000000d678e2	xorl	%edx, %edx
0000000000d678e4	callq	*%r15
0000000000d678e7	movq	%rax, %rdi
0000000000d678ea	movq	0xe7124f(%rip), %rsi
0000000000d678f1	movq	%r13, %rdx
0000000000d678f4	callq	*%r15
0000000000d678f7	movq	%r12, %rdi
0000000000d678fa	movq	0xe6eb8f(%rip), %rsi
0000000000d67901	callq	*%r15
0000000000d67904	movq	%rax, %rdi
0000000000d67907	movq	%r14, %rsi
0000000000d6790a	xorl	%edx, %edx
0000000000d6790c	callq	*%r15
0000000000d6790f	movq	%rax, %r13
0000000000d67912	movq	%rax, %rdi
0000000000d67915	movq	0xe6e3ac(%rip), %rsi
0000000000d6791c	movl	$0x1, %edx
0000000000d67921	callq	*%r15
0000000000d67924	movq	%r13, %rdi
0000000000d67927	movq	0xe8a582(%rip), %rsi
0000000000d6792e	xorl	%edx, %edx
0000000000d67930	callq	*%r15
0000000000d67933	movq	%r13, %rdi
0000000000d67936	movq	0xe8a57b(%rip), %rsi
0000000000d6793d	xorl	%edx, %edx
0000000000d6793f	callq	*%r15
0000000000d67942	movl	$0x5, %edx
0000000000d67947	movq	%r13, %rdi
0000000000d6794a	movq	0xe8a56f(%rip), %rsi
0000000000d67951	callq	*%r15
0000000000d67954	movl	$0x5, %edx
0000000000d67959	movq	%r13, %rdi
0000000000d6795c	movq	0xe8a565(%rip), %rsi
0000000000d67963	callq	*%r15
0000000000d67966	movl	$0x1, %edx
0000000000d6796b	movq	%r13, %rdi
0000000000d6796e	movq	0xe8a55b(%rip), %rsi
0000000000d67975	callq	*%r15
0000000000d67978	movl	$0x1, %edx
0000000000d6797d	movq	%r13, %rdi
0000000000d67980	movq	0xe8a551(%rip), %rsi
0000000000d67987	callq	*%r15
0000000000d6798a	movq	(%rbx), %rdi
0000000000d6798d	leaq	-0x30(%rbp), %rcx
0000000000d67991	movq	0xe8a3b0(%rip), %rsi
0000000000d67998	movq	%r12, %rdx
0000000000d6799b	callq	*%r15
0000000000d6799e	movq	%rax, 0x60(%rbx)
0000000000d679a2	testq	%rax, %rax
0000000000d679a5	jne	0xd679b9
0000000000d679a7	movb	$0x1, 0x10(%rbx)
0000000000d679ab	movq	-0x30(%rbp), %rdi
0000000000d679af	callq	*0xb85d5b(%rip)                 ## literal pool symbol address: _objc_retain
0000000000d679b5	movq	%rax, 0x18(%rbx)
0000000000d679b9	movq	%r12, %rdi
0000000000d679bc	callq	*0xb85d46(%rip)                 ## literal pool symbol address: _objc_release
0000000000d679c2	cmpb	$0x0, 0x10(%rbx)
0000000000d679c6	movq	-0x38(%rbp), %r14
0000000000d679ca	jne	0xd67c7c
0000000000d679d0	movq	0xb85491(%rip), %rdi            ## literal pool symbol address: _OBJC_CLASS_$_MTLRenderPipelineDescriptor
0000000000d679d7	callq	0x1497908                       ## symbol stub for: _objc_alloc_init
0000000000d679dc	movq	%rax, %r12
0000000000d679df	leaq	0xc45142(%rip), %rdx            ## Objc cfstring ref: @"bad cfstring ref"
0000000000d679e6	movq	%r14, %rdi
0000000000d679e9	movq	0xe84f48(%rip), %r13
0000000000d679f0	movq	%r13, %rsi
0000000000d679f3	callq	*%r15
0000000000d679f6	movq	%rax, %rdi
0000000000d679f9	callq	0x149790e                       ## symbol stub for: _objc_autorelease
0000000000d679fe	movq	%r12, %rdi
0000000000d67a01	movq	0xe8a330(%rip), %rsi
0000000000d67a08	movq	%rax, %rdx
0000000000d67a0b	callq	*%r15
0000000000d67a0e	leaq	0xc451f3(%rip), %rdx            ## Objc cfstring ref: @"bad cfstring ref"
0000000000d67a15	movq	%r14, %rdi
0000000000d67a18	movq	%r13, %rsi
0000000000d67a1b	callq	*%r15
0000000000d67a1e	movq	%rax, %rdi
0000000000d67a21	callq	0x149790e                       ## symbol stub for: _objc_autorelease
0000000000d67a26	movq	%r12, %rdi
0000000000d67a29	movq	0xe8a310(%rip), %rsi
0000000000d67a30	movq	%rax, %rdx
0000000000d67a33	callq	*%r15
0000000000d67a36	leaq	0xc451eb(%rip), %rdx            ## Objc cfstring ref: @"bad cfstring ref"
0000000000d67a3d	movq	%r12, %rdi
0000000000d67a40	movq	0xe52a31(%rip), %rsi
0000000000d67a47	callq	*%r15
0000000000d67a4a	movq	0x8(%rbx), %r13
0000000000d67a4e	movq	%r12, %rdi
0000000000d67a51	movq	0xe6ea38(%rip), %rsi
0000000000d67a58	callq	*%r15
0000000000d67a5b	movq	%rax, %rdi
0000000000d67a5e	movq	0xe50e8b(%rip), %r14
0000000000d67a65	movq	%r14, %rsi
0000000000d67a68	xorl	%edx, %edx
0000000000d67a6a	callq	*%r15
0000000000d67a6d	movq	%rax, %rdi
0000000000d67a70	movq	0xe710c9(%rip), %rsi
0000000000d67a77	movq	%r13, %rdx
0000000000d67a7a	callq	*%r15
0000000000d67a7d	movq	%r12, %rdi
0000000000d67a80	movq	0xe6ea09(%rip), %rsi
0000000000d67a87	callq	*%r15
0000000000d67a8a	movq	%rax, %rdi
0000000000d67a8d	movq	%r14, %rsi
0000000000d67a90	xorl	%edx, %edx
0000000000d67a92	callq	*%r15
0000000000d67a95	movq	%rax, %r13
0000000000d67a98	movq	%rax, %rdi
0000000000d67a9b	movq	0xe6e226(%rip), %rsi
0000000000d67aa2	movl	$0x1, %edx
0000000000d67aa7	callq	*%r15
0000000000d67aaa	movq	%r13, %rdi
0000000000d67aad	movq	0xe8a3fc(%rip), %rsi
0000000000d67ab4	xorl	%edx, %edx
0000000000d67ab6	callq	*%r15
0000000000d67ab9	movq	%r13, %rdi
0000000000d67abc	movq	0xe8a3f5(%rip), %rsi
0000000000d67ac3	xorl	%edx, %edx
0000000000d67ac5	callq	*%r15
0000000000d67ac8	movl	$0x5, %edx
0000000000d67acd	movq	%r13, %rdi
0000000000d67ad0	movq	0xe8a3e9(%rip), %rsi
0000000000d67ad7	callq	*%r15
0000000000d67ada	movl	$0x5, %edx
0000000000d67adf	movq	%r13, %rdi
0000000000d67ae2	movq	0xe8a3df(%rip), %rsi
0000000000d67ae9	callq	*%r15
0000000000d67aec	movl	$0x1, %edx
0000000000d67af1	movq	%r13, %rdi
0000000000d67af4	movq	0xe8a3d5(%rip), %rsi
0000000000d67afb	callq	*%r15
0000000000d67afe	movl	$0x1, %edx
0000000000d67b03	movq	%r13, %rdi
0000000000d67b06	movq	0xe8a23b(%rip), %r14
0000000000d67b0d	movq	0xe8a3c4(%rip), %rsi
0000000000d67b14	callq	*%r15
0000000000d67b17	movq	(%rbx), %rdi
0000000000d67b1a	leaq	-0x30(%rbp), %rcx
0000000000d67b1e	movq	%r14, %rsi
0000000000d67b21	movq	%r12, %rdx
0000000000d67b24	callq	*%r15
0000000000d67b27	movq	%rax, 0x68(%rbx)
0000000000d67b2b	testq	%rax, %rax
0000000000d67b2e	jne	0xd67b42
0000000000d67b30	movb	$0x1, 0x10(%rbx)
0000000000d67b34	movq	-0x30(%rbp), %rdi
0000000000d67b38	callq	*0xb85bd2(%rip)                 ## literal pool symbol address: _objc_retain
0000000000d67b3e	movq	%rax, 0x18(%rbx)
0000000000d67b42	movq	%r12, %rdi
0000000000d67b45	callq	*0xb85bbd(%rip)                 ## literal pool symbol address: _objc_release
0000000000d67b4b	cmpb	$0x0, 0x10(%rbx)
0000000000d67b4f	movq	-0x38(%rbp), %r14
0000000000d67b53	jne	0xd67c7c
0000000000d67b59	movq	0xb85308(%rip), %rdi            ## literal pool symbol address: _OBJC_CLASS_$_MTLRenderPipelineDescriptor
0000000000d67b60	callq	0x1497908                       ## symbol stub for: _objc_alloc_init
0000000000d67b65	movq	%rax, %r12
0000000000d67b68	leaq	0xc450d9(%rip), %rdx            ## Objc cfstring ref: @"bad cfstring ref"
0000000000d67b6f	movq	%rax, %rdi
0000000000d67b72	movq	0xe528ff(%rip), %rsi
0000000000d67b79	callq	*%r15
0000000000d67b7c	leaq	0xc450e5(%rip), %rdx            ## Objc cfstring ref: @"bad cfstring ref"
0000000000d67b83	movq	%r14, %rdi
0000000000d67b86	movq	0xe84dab(%rip), %r13
0000000000d67b8d	movq	%r13, %rsi
0000000000d67b90	callq	*%r15
0000000000d67b93	movq	%rax, %rdi
0000000000d67b96	callq	0x149790e                       ## symbol stub for: _objc_autorelease
0000000000d67b9b	movq	%r12, %rdi
0000000000d67b9e	movq	0xe8a193(%rip), %rsi
0000000000d67ba5	movq	%rax, %rdx
0000000000d67ba8	callq	*%r15
0000000000d67bab	leaq	0xc450d6(%rip), %rdx            ## Objc cfstring ref: @"bad cfstring ref"
0000000000d67bb2	movq	%r14, %rdi
0000000000d67bb5	movq	%r13, %rsi
0000000000d67bb8	callq	*%r15
0000000000d67bbb	movq	%rax, %rdi
0000000000d67bbe	callq	0x149790e                       ## symbol stub for: _objc_autorelease
0000000000d67bc3	movq	%r12, %rdi
0000000000d67bc6	movq	0xe8a173(%rip), %rsi
0000000000d67bcd	movq	%rax, %rdx
0000000000d67bd0	callq	*%r15
0000000000d67bd3	movq	0x8(%rbx), %r14
0000000000d67bd7	movq	%r12, %rdi
0000000000d67bda	movq	0xe6e8af(%rip), %rsi
0000000000d67be1	callq	*%r15
0000000000d67be4	movq	%rax, %rdi
0000000000d67be7	movq	0xe50d02(%rip), %rsi
0000000000d67bee	xorl	%edx, %edx
0000000000d67bf0	callq	*%r15
0000000000d67bf3	movq	%rax, %rdi
0000000000d67bf6	movq	0xe70f43(%rip), %rsi
0000000000d67bfd	movq	%r14, %rdx
0000000000d67c00	callq	*%r15
0000000000d67c03	movq	(%rbx), %rdi
0000000000d67c06	leaq	-0x30(%rbp), %r14
0000000000d67c0a	movq	0xe8a137(%rip), %rsi
0000000000d67c11	movq	%r12, %rdx
0000000000d67c14	movq	%r14, %rcx
0000000000d67c17	callq	*%r15
0000000000d67c1a	movq	%rax, 0x70(%rbx)
0000000000d67c1e	testq	%rax, %rax
0000000000d67c21	jne	0xd67c35
0000000000d67c23	movb	$0x1, 0x10(%rbx)
0000000000d67c27	movq	-0x30(%rbp), %rdi
0000000000d67c2b	callq	*0xb85adf(%rip)                 ## literal pool symbol address: _objc_retain
0000000000d67c31	movq	%rax, 0x18(%rbx)
0000000000d67c35	movq	%r12, %rdi
0000000000d67c38	callq	*0xb85aca(%rip)                 ## literal pool symbol address: _objc_release
0000000000d67c3e	cmpb	$0x0, 0x10(%rbx)
0000000000d67c42	jne	0xd67c7c
0000000000d67c44	movq	(%rbx), %rdi
0000000000d67c47	movq	0x8(%rbx), %rdx
0000000000d67c4b	movq	%r14, (%rsp)
0000000000d67c4f	movl	$0x1, %esi
0000000000d67c54	xorl	%ecx, %ecx
0000000000d67c56	xorl	%r8d, %r8d
0000000000d67c59	xorl	%r9d, %r9d
0000000000d67c5c	callq	__ZL34createPipelineStateForVideoDrawingPU19objcproto9MTLDevice11objc_objectb14MTLPixelFormatbbiPP7NSError ## createPipelineStateForVideoDrawing(id<MTLDevice>, bool, MTLPixelFormat, bool, bool, int, NSError**)
0000000000d67c61	movq	%rax, 0x78(%rbx)
0000000000d67c65	testq	%rax, %rax
0000000000d67c68	jne	0xd67c7c
0000000000d67c6a	movb	$0x1, 0x10(%rbx)
0000000000d67c6e	movq	-0x30(%rbp), %rdi
0000000000d67c72	callq	*0xb85a98(%rip)                 ## literal pool symbol address: _objc_retain
0000000000d67c78	movq	%rax, 0x18(%rbx)
0000000000d67c7c	addq	$0x18, %rsp
0000000000d67c80	popq	%rbx
0000000000d67c81	popq	%r12
0000000000d67c83	popq	%r13
0000000000d67c85	popq	%r14
0000000000d67c87	popq	%r15
0000000000d67c89	popq	%rbp
0000000000d67c8a	retq
0000000000d67c8b	nopl	(%rax,%rax)
