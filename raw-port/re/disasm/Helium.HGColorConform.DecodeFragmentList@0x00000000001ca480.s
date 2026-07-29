__ZN14HGColorConform18DecodeFragmentListEPK16ColorSyncProfileS2_PP31HGColorConformNodeListCacheItemb:
00000000001ca480	pushq	%rbp
00000000001ca481	movq	%rsp, %rbp
00000000001ca484	pushq	%r15
00000000001ca486	pushq	%r14
00000000001ca488	pushq	%r13
00000000001ca48a	pushq	%r12
00000000001ca48c	pushq	%rbx
00000000001ca48d	subq	$0x188, %rsp                    ## imm = 0x188
00000000001ca494	movl	%ecx, %r14d
00000000001ca497	movq	0x837dba(%rip), %rax            ## literal pool symbol address: ___stack_chk_guard
00000000001ca49e	movq	(%rax), %rax
00000000001ca4a1	movq	%rax, -0x30(%rbp)
00000000001ca4a5	movq	%rdi, -0x170(%rbp)
00000000001ca4ac	movq	%rsi, -0x168(%rbp)
00000000001ca4b3	movq	%rdx, -0x178(%rbp)
00000000001ca4ba	callq	__ZN14HGColorConform20GetNodeListFromCacheEPK16ColorSyncProfileS2_PP31HGColorConformNodeListCacheItem ## HGColorConform::GetNodeListFromCache(ColorSyncProfile const*, ColorSyncProfile const*, HGColorConformNodeListCacheItem**)
00000000001ca4bf	movb	$0x1, %bl
00000000001ca4c1	testb	%al, %al
00000000001ca4c3	jne	0x1cc409
00000000001ca4c9	movl	%r14d, -0x130(%rbp)
00000000001ca4d0	movq	$0x0, -0xe8(%rbp)
00000000001ca4db	leaq	__ZN8HGLogger8_enabledE(%rip), %rax ## HGLogger::_enabled
00000000001ca4e2	movzbl	(%rax), %eax
00000000001ca4e5	cmpb	$0x1, %al
00000000001ca4e7	jne	0x1ca503
00000000001ca4e9	leaq	0x71c459(%rip), %rdi            ## literal pool for: "colorConform"
00000000001ca4f0	leaq	0x72bd7d(%rip), %rdx            ## literal pool for: "HGColorConform processing ColorSync fragment list.\n"
00000000001ca4f7	movl	$0x1, %esi
00000000001ca4fc	xorl	%eax, %eax
00000000001ca4fe	callq	__ZN8HGLogger3logEPKciS1_z      ## HGLogger::log(char const*, int, char const*, ...)
00000000001ca503	movq	0x837b5e(%rip), %rbx            ## literal pool symbol address: _kColorSyncProfile
00000000001ca50a	movq	(%rbx), %rax
00000000001ca50d	movq	%rax, -0x60(%rbp)
00000000001ca511	movq	0x837b58(%rip), %r14            ## literal pool symbol address: _kColorSyncRenderingIntent
00000000001ca518	movq	(%r14), %rax
00000000001ca51b	movq	%rax, -0x58(%rbp)
00000000001ca51f	movq	0x837b7a(%rip), %r15            ## literal pool symbol address: _kColorSyncTransformTag
00000000001ca526	movq	(%r15), %rax
00000000001ca529	movq	%rax, -0x50(%rbp)
00000000001ca52d	movq	-0x170(%rbp), %rax
00000000001ca534	movq	%rax, -0x80(%rbp)
00000000001ca538	movq	0x837b39(%rip), %r12            ## literal pool symbol address: _kColorSyncRenderingIntentUseProfileHeader
00000000001ca53f	movq	(%r12), %rax
00000000001ca543	movq	%rax, -0x78(%rbp)
00000000001ca547	movq	0x837b32(%rip), %rax            ## literal pool symbol address: _kColorSyncTransformDeviceToPCS
00000000001ca54e	movq	(%rax), %rax
00000000001ca551	movq	%rax, -0x70(%rbp)
00000000001ca555	leaq	-0x60(%rbp), %rsi
00000000001ca559	leaq	-0x80(%rbp), %rdx
00000000001ca55d	movl	$0x3, %ecx
00000000001ca562	xorl	%edi, %edi
00000000001ca564	xorl	%r8d, %r8d
00000000001ca567	xorl	%r9d, %r9d
00000000001ca56a	callq	0x3c4ad2                        ## symbol stub for: _CFDictionaryCreate
00000000001ca56f	movq	%rax, -0x40(%rbp)
00000000001ca573	movq	(%rbx), %rax
00000000001ca576	movq	%rax, -0xa0(%rbp)
00000000001ca57d	movq	(%r14), %rax
00000000001ca580	movq	%rax, -0x98(%rbp)
00000000001ca587	movq	(%r15), %rax
00000000001ca58a	movq	%rax, -0x90(%rbp)
00000000001ca591	movq	-0x168(%rbp), %rax
00000000001ca598	movq	%rax, -0xc0(%rbp)
00000000001ca59f	movq	(%r12), %rax
00000000001ca5a3	movq	%rax, -0xb8(%rbp)
00000000001ca5aa	movq	0x837adf(%rip), %rax            ## literal pool symbol address: _kColorSyncTransformPCSToDevice
00000000001ca5b1	movq	(%rax), %rax
00000000001ca5b4	movq	%rax, -0xb0(%rbp)
00000000001ca5bb	leaq	-0xa0(%rbp), %rsi
00000000001ca5c2	leaq	-0xc0(%rbp), %rdx
00000000001ca5c9	movl	$0x3, %ecx
00000000001ca5ce	xorl	%edi, %edi
00000000001ca5d0	xorl	%r8d, %r8d
00000000001ca5d3	xorl	%r9d, %r9d
00000000001ca5d6	callq	0x3c4ad2                        ## symbol stub for: _CFDictionaryCreate
00000000001ca5db	movq	%rax, -0x38(%rbp)
00000000001ca5df	leaq	-0x40(%rbp), %rsi
00000000001ca5e3	movl	$0x2, %edx
00000000001ca5e8	xorl	%edi, %edi
00000000001ca5ea	xorl	%ecx, %ecx
00000000001ca5ec	callq	0x3c4a9c                        ## symbol stub for: _CFArrayCreate
00000000001ca5f1	movq	%rax, %r14
00000000001ca5f4	xorl	%r15d, %r15d
00000000001ca5f7	movl	$0x1, %edi
00000000001ca5fc	movl	$0xf, %esi
00000000001ca601	xorl	%edx, %edx
00000000001ca603	xorl	%ecx, %ecx
00000000001ca605	callq	___isPlatformVersionAtLeast
00000000001ca60a	testl	%eax, %eax
00000000001ca60c	je	0x1ca653
00000000001ca60e	movq	0x837a93(%rip), %rax            ## literal pool symbol address: _kColorSyncTransformUseITU709OETF
00000000001ca615	movq	(%rax), %rax
00000000001ca618	movq	%rax, -0xd0(%rbp)
00000000001ca61f	movq	0x837ab2(%rip), %rax            ## literal pool symbol address: _kCFBooleanTrue
00000000001ca626	movq	(%rax), %rax
00000000001ca629	movq	%rax, -0xe0(%rbp)
00000000001ca630	leaq	-0xd0(%rbp), %rsi
00000000001ca637	leaq	-0xe0(%rbp), %rdx
00000000001ca63e	movl	$0x1, %ecx
00000000001ca643	xorl	%edi, %edi
00000000001ca645	xorl	%r8d, %r8d
00000000001ca648	xorl	%r9d, %r9d
00000000001ca64b	callq	0x3c4ad2                        ## symbol stub for: _CFDictionaryCreate
00000000001ca650	movq	%rax, %r15
00000000001ca653	movq	%r14, %rdi
00000000001ca656	movq	%r15, %rsi
00000000001ca659	callq	0x3c4da8                        ## symbol stub for: _ColorSyncTransformCreate
00000000001ca65e	movq	%rax, %rbx
00000000001ca661	movq	-0x40(%rbp), %rdi
00000000001ca665	callq	0x3c4b1a                        ## symbol stub for: _CFRelease
00000000001ca66a	movq	-0x38(%rbp), %rdi
00000000001ca66e	callq	0x3c4b1a                        ## symbol stub for: _CFRelease
00000000001ca673	movq	%r14, %rdi
00000000001ca676	callq	0x3c4b1a                        ## symbol stub for: _CFRelease
00000000001ca67b	testq	%r15, %r15
00000000001ca67e	je	0x1ca688
00000000001ca680	movq	%r15, %rdi
00000000001ca683	callq	0x3c4b1a                        ## symbol stub for: _CFRelease
00000000001ca688	testq	%rbx, %rbx
00000000001ca68b	je	0x1ca69f
00000000001ca68d	cmpb	$0x0, -0x130(%rbp)
00000000001ca694	je	0x1ca6d0
00000000001ca696	movq	0x8379fb(%rip), %rax            ## literal pool symbol address: _kColorSyncTransformSimplifiedConversionData
00000000001ca69d	jmp	0x1ca6d7
00000000001ca69f	leaq	__ZN8HGLogger8_enabledE(%rip), %rax ## HGLogger::_enabled
00000000001ca6a6	movzbl	(%rax), %eax
00000000001ca6a9	cmpb	$0x1, %al
00000000001ca6ab	jne	0x1cc407
00000000001ca6b1	leaq	0x71c291(%rip), %rdi            ## literal pool for: "colorConform"
00000000001ca6b8	leaq	0x72bbe9(%rip), %rdx            ## literal pool for: "HGColorConform finished processing ColorSync fragment list: FAILURE (ColorSyncTransformCreate).\n"
00000000001ca6bf	movl	$0x1, %esi
00000000001ca6c4	xorl	%eax, %eax
00000000001ca6c6	callq	__ZN8HGLogger3logEPKciS1_z      ## HGLogger::log(char const*, int, char const*, ...)
00000000001ca6cb	jmp	0x1cc407
00000000001ca6d0	movq	0x8379b1(%rip), %rax            ## literal pool symbol address: _kColorSyncTransformFullConversionData
00000000001ca6d7	movq	(%rax), %r14
00000000001ca6da	leaq	__ZN8HGLogger8_enabledE(%rip), %rax ## HGLogger::_enabled
00000000001ca6e1	movzbl	(%rax), %eax
00000000001ca6e4	cmpb	$0x1, %al
00000000001ca6e6	jne	0x1ca71b
00000000001ca6e8	leaq	0x72bc4e(%rip), %rax            ## literal pool for: "true"
00000000001ca6ef	leaq	0x72bc4c(%rip), %rcx            ## literal pool for: "false"
00000000001ca6f6	cmpb	$0x0, -0x130(%rbp)
00000000001ca6fd	cmovneq	%rax, %rcx
00000000001ca701	leaq	0x71c241(%rip), %rdi            ## literal pool for: "colorConform"
00000000001ca708	leaq	0x72bbfa(%rip), %rdx            ## literal pool for: "HGColorConform using simplified conversion data? %s"
00000000001ca70f	movl	$0x1, %esi
00000000001ca714	xorl	%eax, %eax
00000000001ca716	callq	__ZN8HGLogger3logEPKciS1_z      ## HGLogger::log(char const*, int, char const*, ...)
00000000001ca71b	movq	%rbx, %rdi
00000000001ca71e	movq	%r14, %rsi
00000000001ca721	xorl	%edx, %edx
00000000001ca723	callq	0x3c4da2                        ## symbol stub for: _ColorSyncTransformCopyProperty
00000000001ca728	movq	%rax, -0x120(%rbp)
00000000001ca72f	movq	%rbx, %rdi
00000000001ca732	callq	0x3c4b1a                        ## symbol stub for: _CFRelease
00000000001ca737	movq	-0x120(%rbp), %rdi
00000000001ca73e	testq	%rdi, %rdi
00000000001ca741	je	0x1cc3a9
00000000001ca747	callq	0x3c4aa2                        ## symbol stub for: _CFArrayGetCount
00000000001ca74c	movq	%rax, -0x160(%rbp)
00000000001ca753	cmpq	$0x0, -0x160(%rbp)
00000000001ca75b	je	0x1cc3d3
00000000001ca761	leaq	__ZN8HGLogger8_enabledE(%rip), %rax ## HGLogger::_enabled
00000000001ca768	movzbl	(%rax), %eax
00000000001ca76b	cmpb	$0x1, %al
00000000001ca76d	jne	0x1ca790
00000000001ca76f	leaq	0x71c1d3(%rip), %rdi            ## literal pool for: "colorConform"
00000000001ca776	leaq	0x72bc86(%rip), %rdx            ## literal pool for: "\tRetrieved %i fragments\n"
00000000001ca77d	movl	$0x1, %esi
00000000001ca782	movq	-0x160(%rbp), %rcx
00000000001ca789	xorl	%eax, %eax
00000000001ca78b	callq	__ZN8HGLogger3logEPKciS1_z      ## HGLogger::log(char const*, int, char const*, ...)
00000000001ca790	movl	$0x18, %edi
00000000001ca795	callq	0x3c4fb2                        ## symbol stub for: __Znwm
00000000001ca79a	pxor	%xmm0, %xmm0
00000000001ca79e	movdqu	%xmm0, (%rax)
00000000001ca7a2	movq	$0x0, 0x10(%rax)
00000000001ca7aa	movq	%rax, -0x148(%rbp)
00000000001ca7b1	cmpq	$0x0, -0x160(%rbp)
00000000001ca7b9	jle	0x1cc4b2
00000000001ca7bf	movl	$0x1c, %eax
00000000001ca7c4	movd	%eax, %xmm0
00000000001ca7c8	movdqa	%xmm0, -0x1b0(%rbp)
00000000001ca7d0	xorl	%esi, %esi
00000000001ca7d2	movl	$0xfffffffe, -0xf0(%rbp)        ## imm = 0xFFFFFFFE
00000000001ca7dc	xorl	%r14d, %r14d
00000000001ca7df	movq	-0x120(%rbp), %rdi
00000000001ca7e6	movq	%rsi, -0x110(%rbp)
00000000001ca7ed	callq	0x3c4aa8                        ## symbol stub for: _CFArrayGetValueAtIndex
00000000001ca7f2	movq	%rax, %r12
00000000001ca7f5	movq	0x837834(%rip), %rax            ## literal pool symbol address: _kColorSyncConversionMatrix
00000000001ca7fc	movq	(%rax), %rsi
00000000001ca7ff	movq	%r12, %rdi
00000000001ca802	leaq	-0x128(%rbp), %rdx
00000000001ca809	callq	0x3c4af0                        ## symbol stub for: _CFDictionaryGetValueIfPresent
00000000001ca80e	testb	%al, %al
00000000001ca810	je	0x1cad19
00000000001ca816	leaq	__ZN8HGLogger8_enabledE(%rip), %rax ## HGLogger::_enabled
00000000001ca81d	movzbl	(%rax), %eax
00000000001ca820	cmpb	$0x1, %al
00000000001ca822	jne	0x1ca845
00000000001ca824	leaq	0x71c11e(%rip), %rdi            ## literal pool for: "colorConform"
00000000001ca82b	movl	$0x1, %esi
00000000001ca830	leaq	0x72bbe5(%rip), %rdx            ## literal pool for: "\tfragment %i, kCMMConversionMatrix\n"
00000000001ca837	movq	-0x110(%rbp), %rcx
00000000001ca83e	xorl	%eax, %eax
00000000001ca840	callq	__ZN8HGLogger3logEPKciS1_z      ## HGLogger::log(char const*, int, char const*, ...)
00000000001ca845	testl	%r14d, %r14d
00000000001ca848	jne	0x1cc431
00000000001ca84e	movq	-0x128(%rbp), %rbx
00000000001ca855	movq	%rbx, %rdi
00000000001ca858	xorl	%esi, %esi
00000000001ca85a	callq	0x3c4aa8                        ## symbol stub for: _CFArrayGetValueAtIndex
00000000001ca85f	movq	%rax, %r15
00000000001ca862	movl	$0x1, %esi
00000000001ca867	movq	%rbx, %rdi
00000000001ca86a	callq	0x3c4aa8                        ## symbol stub for: _CFArrayGetValueAtIndex
00000000001ca86f	movq	%rax, %r14
00000000001ca872	movl	$0x2, %esi
00000000001ca877	movq	%rbx, %rdi
00000000001ca87a	callq	0x3c4aa8                        ## symbol stub for: _CFArrayGetValueAtIndex
00000000001ca87f	movq	%rax, %rbx
00000000001ca882	movq	%r15, %rdi
00000000001ca885	xorl	%esi, %esi
00000000001ca887	callq	0x3c4aa8                        ## symbol stub for: _CFArrayGetValueAtIndex
00000000001ca88c	movq	%rax, %r13
00000000001ca88f	movl	$0x1, %esi
00000000001ca894	movq	%r15, %rdi
00000000001ca897	callq	0x3c4aa8                        ## symbol stub for: _CFArrayGetValueAtIndex
00000000001ca89c	movq	%rax, %r12
00000000001ca89f	movl	$0x2, %esi
00000000001ca8a4	movq	%r15, %rdi
00000000001ca8a7	callq	0x3c4aa8                        ## symbol stub for: _CFArrayGetValueAtIndex
00000000001ca8ac	movq	%rax, -0xf8(%rbp)
00000000001ca8b3	movl	$0x3, %esi
00000000001ca8b8	movq	%r15, %rdi
00000000001ca8bb	callq	0x3c4aa8                        ## symbol stub for: _CFArrayGetValueAtIndex
00000000001ca8c0	movq	%rax, -0x108(%rbp)
00000000001ca8c7	movq	%r14, %rdi
00000000001ca8ca	xorl	%esi, %esi
00000000001ca8cc	callq	0x3c4aa8                        ## symbol stub for: _CFArrayGetValueAtIndex
00000000001ca8d1	movq	%rax, -0x1a0(%rbp)
00000000001ca8d8	movl	$0x1, %esi
00000000001ca8dd	movq	%r14, %rdi
00000000001ca8e0	callq	0x3c4aa8                        ## symbol stub for: _CFArrayGetValueAtIndex
00000000001ca8e5	movq	%rax, -0x198(%rbp)
00000000001ca8ec	movl	$0x2, %esi
00000000001ca8f1	movq	%r14, %rdi
00000000001ca8f4	callq	0x3c4aa8                        ## symbol stub for: _CFArrayGetValueAtIndex
00000000001ca8f9	movq	%rax, -0x190(%rbp)
00000000001ca900	movl	$0x3, %esi
00000000001ca905	movq	%r14, %rdi
00000000001ca908	callq	0x3c4aa8                        ## symbol stub for: _CFArrayGetValueAtIndex
00000000001ca90d	movq	%rax, -0x188(%rbp)
00000000001ca914	movq	%rbx, %rdi
00000000001ca917	xorl	%esi, %esi
00000000001ca919	callq	0x3c4aa8                        ## symbol stub for: _CFArrayGetValueAtIndex
00000000001ca91e	movq	%rax, -0x180(%rbp)
00000000001ca925	movl	$0x1, %esi
00000000001ca92a	movq	%rbx, %rdi
00000000001ca92d	callq	0x3c4aa8                        ## symbol stub for: _CFArrayGetValueAtIndex
00000000001ca932	movq	%rax, %r15
00000000001ca935	movl	$0x2, %esi
00000000001ca93a	movq	%rbx, %rdi
00000000001ca93d	callq	0x3c4aa8                        ## symbol stub for: _CFArrayGetValueAtIndex
00000000001ca942	movq	%rax, %r14
00000000001ca945	movl	$0x3, %esi
00000000001ca94a	movq	%rbx, %rdi
00000000001ca94d	callq	0x3c4aa8                        ## symbol stub for: _CFArrayGetValueAtIndex
00000000001ca952	movq	%rax, %rbx
00000000001ca955	movl	$0x100, %edi                    ## imm = 0x100
00000000001ca95a	callq	0x3c4fb2                        ## symbol stub for: __Znwm
00000000001ca95f	pxor	%xmm0, %xmm0
00000000001ca963	movdqu	%xmm0, 0xe0(%rax)
00000000001ca96b	movq	$0x0, 0xf0(%rax)
00000000001ca976	movdqa	%xmm0, 0x10(%rax)
00000000001ca97b	movdqa	%xmm0, 0x20(%rax)
00000000001ca980	movdqa	%xmm0, 0x30(%rax)
00000000001ca985	movdqa	%xmm0, 0x50(%rax)
00000000001ca98a	movdqa	%xmm0, 0x60(%rax)
00000000001ca98f	movdqa	%xmm0, 0x70(%rax)
00000000001ca994	movdqa	%xmm0, 0x80(%rax)
00000000001ca99c	movdqa	%xmm0, 0x90(%rax)
00000000001ca9a4	movdqa	%xmm0, 0xa0(%rax)
00000000001ca9ac	movdqa	%xmm0, 0xb0(%rax)
00000000001ca9b4	movdqa	%xmm0, 0xc0(%rax)
00000000001ca9bc	movdqu	%xmm0, 0xc9(%rax)
00000000001ca9c4	movq	%rax, -0xe8(%rbp)
00000000001ca9cb	movl	$0x1, (%rax)
00000000001ca9d1	movl	$0x5, %esi
00000000001ca9d6	movq	%r13, %rdi
00000000001ca9d9	leaq	-0xd0(%rbp), %rdx
00000000001ca9e0	callq	0x3c4b08                        ## symbol stub for: _CFNumberGetValue
00000000001ca9e5	testb	%al, %al
00000000001ca9e7	je	0x1cc431
00000000001ca9ed	movl	$0x5, %esi
00000000001ca9f2	movq	%r12, %rdi
00000000001ca9f5	leaq	-0xe0(%rbp), %rdx
00000000001ca9fc	callq	0x3c4b08                        ## symbol stub for: _CFNumberGetValue
00000000001caa01	testb	%al, %al
00000000001caa03	je	0x1cc431
00000000001caa09	movl	$0x5, %esi
00000000001caa0e	movq	-0xf8(%rbp), %rdi
00000000001caa15	leaq	-0x140(%rbp), %rdx
00000000001caa1c	callq	0x3c4b08                        ## symbol stub for: _CFNumberGetValue
00000000001caa21	testb	%al, %al
00000000001caa23	je	0x1cc431
00000000001caa29	movl	$0x5, %esi
00000000001caa2e	movq	-0x108(%rbp), %rdi
00000000001caa35	leaq	-0x118(%rbp), %rdx
00000000001caa3c	callq	0x3c4b08                        ## symbol stub for: _CFNumberGetValue
00000000001caa41	testb	%al, %al
00000000001caa43	je	0x1cc431
00000000001caa49	movl	$0x5, %esi
00000000001caa4e	movq	-0x1a0(%rbp), %rdi
00000000001caa55	leaq	-0x138(%rbp), %rdx
00000000001caa5c	callq	0x3c4b08                        ## symbol stub for: _CFNumberGetValue
00000000001caa61	testb	%al, %al
00000000001caa63	je	0x1cc431
00000000001caa69	movl	$0x5, %esi
00000000001caa6e	movq	-0x198(%rbp), %rdi
00000000001caa75	leaq	-0xec(%rbp), %rdx
00000000001caa7c	callq	0x3c4b08                        ## symbol stub for: _CFNumberGetValue
00000000001caa81	testb	%al, %al
00000000001caa83	je	0x1cc431
00000000001caa89	movl	$0x5, %esi
00000000001caa8e	movq	-0x190(%rbp), %rdi
00000000001caa95	leaq	-0x100(%rbp), %rdx
00000000001caa9c	callq	0x3c4b08                        ## symbol stub for: _CFNumberGetValue
00000000001caaa1	testb	%al, %al
00000000001caaa3	je	0x1cc431
00000000001caaa9	movl	$0x5, %esi
00000000001caaae	movq	-0x188(%rbp), %rdi
00000000001caab5	leaq	-0xfc(%rbp), %rdx
00000000001caabc	callq	0x3c4b08                        ## symbol stub for: _CFNumberGetValue
00000000001caac1	testb	%al, %al
00000000001caac3	je	0x1cc431
00000000001caac9	movl	$0x5, %esi
00000000001caace	movq	-0x180(%rbp), %rdi
00000000001caad5	leaq	-0x12c(%rbp), %rdx
00000000001caadc	callq	0x3c4b08                        ## symbol stub for: _CFNumberGetValue
00000000001caae1	testb	%al, %al
00000000001caae3	je	0x1cc431
00000000001caae9	movl	$0x5, %esi
00000000001caaee	movq	%r15, %rdi
00000000001caaf1	leaq	-0x154(%rbp), %rdx
00000000001caaf8	callq	0x3c4b08                        ## symbol stub for: _CFNumberGetValue
00000000001caafd	testb	%al, %al
00000000001caaff	je	0x1cc431
00000000001cab05	movl	$0x5, %esi
00000000001cab0a	movq	%r14, %rdi
00000000001cab0d	leaq	-0x150(%rbp), %rdx
00000000001cab14	callq	0x3c4b08                        ## symbol stub for: _CFNumberGetValue
00000000001cab19	testb	%al, %al
00000000001cab1b	je	0x1cc431
00000000001cab21	movl	$0x5, %esi
00000000001cab26	movq	%rbx, %rdi
00000000001cab29	leaq	-0x14c(%rbp), %rdx
00000000001cab30	callq	0x3c4b08                        ## symbol stub for: _CFNumberGetValue
00000000001cab35	testb	%al, %al
00000000001cab37	je	0x1cc431
00000000001cab3d	movss	-0xd0(%rbp), %xmm0
00000000001cab45	insertps	$0x10, -0xe0(%rbp), %xmm0       ## xmm0 = xmm0[0],mem[0],xmm0[2,3]
00000000001cab4f	insertps	$0x20, -0x140(%rbp), %xmm0      ## xmm0 = xmm0[0,1],mem[0],xmm0[3]
00000000001cab59	insertps	$0x30, -0x118(%rbp), %xmm0      ## xmm0 = xmm0[0,1,2],mem[0]
00000000001cab63	movq	-0xe8(%rbp), %rax
00000000001cab6a	movaps	%xmm0, 0x10(%rax)
00000000001cab6e	movss	-0x138(%rbp), %xmm0
00000000001cab76	insertps	$0x10, -0xec(%rbp), %xmm0       ## xmm0 = xmm0[0],mem[0],xmm0[2,3]
00000000001cab80	insertps	$0x20, -0x100(%rbp), %xmm0      ## xmm0 = xmm0[0,1],mem[0],xmm0[3]
00000000001cab8a	insertps	$0x30, -0xfc(%rbp), %xmm0       ## xmm0 = xmm0[0,1,2],mem[0]
00000000001cab94	movaps	%xmm0, 0x20(%rax)
00000000001cab98	movss	-0x12c(%rbp), %xmm0
00000000001caba0	insertps	$0x10, -0x154(%rbp), %xmm0      ## xmm0 = xmm0[0],mem[0],xmm0[2,3]
00000000001cabaa	insertps	$0x20, -0x150(%rbp), %xmm0      ## xmm0 = xmm0[0,1],mem[0],xmm0[3]
00000000001cabb4	insertps	$0x30, -0x14c(%rbp), %xmm0      ## xmm0 = xmm0[0,1,2],mem[0]
00000000001cabbe	movaps	%xmm0, 0x30(%rax)
00000000001cabc2	movaps	0x1ff417(%rip), %xmm0
00000000001cabc9	movaps	%xmm0, 0x40(%rax)
00000000001cabcd	leaq	__ZN8HGLogger8_enabledE(%rip), %rax ## HGLogger::_enabled
00000000001cabd4	movzbl	(%rax), %eax
00000000001cabd7	cmpb	$0x1, %al
00000000001cabd9	jne	0x1cac25
00000000001cabdb	movss	-0xd0(%rbp), %xmm0
00000000001cabe3	cvtss2sd	%xmm0, %xmm0
00000000001cabe7	movss	-0xe0(%rbp), %xmm1
00000000001cabef	cvtss2sd	%xmm1, %xmm1
00000000001cabf3	movss	-0x140(%rbp), %xmm2
00000000001cabfb	cvtss2sd	%xmm2, %xmm2
00000000001cabff	movss	-0x118(%rbp), %xmm3
00000000001cac07	cvtss2sd	%xmm3, %xmm3
00000000001cac0b	leaq	0x71bd37(%rip), %rdi            ## literal pool for: "colorConform"
00000000001cac12	movl	$0x1, %esi
00000000001cac17	leaq	0x72b822(%rip), %rdx            ## literal pool for: "\t\tmatrix row 0: %f, %f, %f, %f\n"
00000000001cac1e	movb	$0x4, %al
00000000001cac20	callq	__ZN8HGLogger3logEPKciS1_z      ## HGLogger::log(char const*, int, char const*, ...)
00000000001cac25	leaq	__ZN8HGLogger8_enabledE(%rip), %rax ## HGLogger::_enabled
00000000001cac2c	movzbl	(%rax), %eax
00000000001cac2f	cmpb	$0x1, %al
00000000001cac31	jne	0x1cac7d
00000000001cac33	movss	-0x138(%rbp), %xmm0
00000000001cac3b	cvtss2sd	%xmm0, %xmm0
00000000001cac3f	movss	-0xec(%rbp), %xmm1
00000000001cac47	cvtss2sd	%xmm1, %xmm1
00000000001cac4b	movss	-0x100(%rbp), %xmm2
00000000001cac53	cvtss2sd	%xmm2, %xmm2
00000000001cac57	movss	-0xfc(%rbp), %xmm3
00000000001cac5f	cvtss2sd	%xmm3, %xmm3
00000000001cac63	leaq	0x71bcdf(%rip), %rdi            ## literal pool for: "colorConform"
00000000001cac6a	movl	$0x1, %esi
00000000001cac6f	leaq	0x72b7ea(%rip), %rdx            ## literal pool for: "\t\tmatrix row 1: %f, %f, %f, %f\n"
00000000001cac76	movb	$0x4, %al
00000000001cac78	callq	__ZN8HGLogger3logEPKciS1_z      ## HGLogger::log(char const*, int, char const*, ...)
00000000001cac7d	leaq	__ZN8HGLogger8_enabledE(%rip), %rax ## HGLogger::_enabled
00000000001cac84	movzbl	(%rax), %eax
00000000001cac87	cmpb	$0x1, %al
00000000001cac89	jne	0x1cacd5
00000000001cac8b	movss	-0x12c(%rbp), %xmm0
00000000001cac93	cvtss2sd	%xmm0, %xmm0
00000000001cac97	movss	-0x154(%rbp), %xmm1
00000000001cac9f	cvtss2sd	%xmm1, %xmm1
00000000001caca3	movss	-0x150(%rbp), %xmm2
00000000001cacab	cvtss2sd	%xmm2, %xmm2
00000000001cacaf	movss	-0x14c(%rbp), %xmm3
00000000001cacb7	cvtss2sd	%xmm3, %xmm3
00000000001cacbb	leaq	0x71bc87(%rip), %rdi            ## literal pool for: "colorConform"
00000000001cacc2	movl	$0x1, %esi
00000000001cacc7	leaq	0x72b7b2(%rip), %rdx            ## literal pool for: "\t\tmatrix row 2: %f, %f, %f, %f\n"
00000000001cacce	movb	$0x4, %al
00000000001cacd0	callq	__ZN8HGLogger3logEPKciS1_z      ## HGLogger::log(char const*, int, char const*, ...)
00000000001cacd5	movq	-0x148(%rbp), %rdi
00000000001cacdc	leaq	-0xe8(%rbp), %rsi
00000000001cace3	callq	__ZNSt3__16vectorIP26HGColorConformNodeListItemNS_9allocatorIS2_EEE9push_backB9nqe210106ERKS2_ ## std::__1::vector<HGColorConformNodeListItem*, std::__1::allocator<HGColorConformNodeListItem*>>::push_back[abi:nqe210106](HGColorConformNodeListItem* const&)
00000000001cace8	movq	$0x0, -0xe8(%rbp)
00000000001cacf3	xorl	%r14d, %r14d
00000000001cacf6	movq	-0x120(%rbp), %rdi
00000000001cacfd	movq	-0x110(%rbp), %rsi
00000000001cad04	incq	%rsi
00000000001cad07	cmpq	-0x160(%rbp), %rsi
00000000001cad0e	jne	0x1ca7e6
00000000001cad14	jmp	0x1cc515
00000000001cad19	movq	0x837320(%rip), %rax            ## literal pool symbol address: _kColorSyncConversionParamCurve0
00000000001cad20	movq	(%rax), %rsi
00000000001cad23	movq	%r12, %rdi
00000000001cad26	callq	0x3c4acc                        ## symbol stub for: _CFDictionaryContainsKey
00000000001cad2b	testb	%al, %al
00000000001cad2d	jne	0x1cada1
00000000001cad2f	movq	0x837312(%rip), %rax            ## literal pool symbol address: _kColorSyncConversionParamCurve1
00000000001cad36	movq	(%rax), %rsi
00000000001cad39	movq	%r12, %rdi
00000000001cad3c	callq	0x3c4acc                        ## symbol stub for: _CFDictionaryContainsKey
00000000001cad41	testb	%al, %al
00000000001cad43	jne	0x1cada1
00000000001cad45	movq	0x837304(%rip), %rax            ## literal pool symbol address: _kColorSyncConversionParamCurve2
00000000001cad4c	movq	(%rax), %rsi
00000000001cad4f	movq	%r12, %rdi
00000000001cad52	callq	0x3c4acc                        ## symbol stub for: _CFDictionaryContainsKey
00000000001cad57	testb	%al, %al
00000000001cad59	jne	0x1cada1
00000000001cad5b	movq	0x8372f6(%rip), %rax            ## literal pool symbol address: _kColorSyncConversionParamCurve3
00000000001cad62	movq	(%rax), %rsi
00000000001cad65	movq	%r12, %rdi
00000000001cad68	callq	0x3c4acc                        ## symbol stub for: _CFDictionaryContainsKey
00000000001cad6d	testb	%al, %al
00000000001cad6f	jne	0x1cada1
00000000001cad71	movq	0x8372e8(%rip), %rax            ## literal pool symbol address: _kColorSyncConversionParamCurve4
00000000001cad78	movq	(%rax), %rsi
00000000001cad7b	movq	%r12, %rdi
00000000001cad7e	callq	0x3c4acc                        ## symbol stub for: _CFDictionaryContainsKey
00000000001cad83	testb	%al, %al
00000000001cad85	jne	0x1cada1
00000000001cad87	movq	0x83727a(%rip), %rax            ## literal pool symbol address: _kColorSyncConversion1DLut
00000000001cad8e	movq	(%rax), %rsi
00000000001cad91	movq	%r12, %rdi
00000000001cad94	callq	0x3c4acc                        ## symbol stub for: _CFDictionaryContainsKey
00000000001cad99	testb	%al, %al
00000000001cad9b	je	0x1cb90c
00000000001cada1	movq	0x837298(%rip), %rax            ## literal pool symbol address: _kColorSyncConversionParamCurve0
00000000001cada8	movq	(%rax), %rsi
00000000001cadab	movq	%r12, %rdi
00000000001cadae	leaq	-0x128(%rbp), %rdx
00000000001cadb5	callq	0x3c4af0                        ## symbol stub for: _CFDictionaryGetValueIfPresent
00000000001cadba	xorl	%ebx, %ebx
00000000001cadbc	testb	%al, %al
00000000001cadbe	jne	0x1cae4f
00000000001cadc4	movq	0x83727d(%rip), %rax            ## literal pool symbol address: _kColorSyncConversionParamCurve1
00000000001cadcb	movq	(%rax), %rsi
00000000001cadce	movq	%r12, %rdi
00000000001cadd1	leaq	-0x128(%rbp), %rdx
00000000001cadd8	callq	0x3c4af0                        ## symbol stub for: _CFDictionaryGetValueIfPresent
00000000001caddd	movl	$0x1, %ebx
00000000001cade2	testb	%al, %al
00000000001cade4	jne	0x1cae4f
00000000001cade6	movq	0x837263(%rip), %rax            ## literal pool symbol address: _kColorSyncConversionParamCurve2
00000000001caded	movq	(%rax), %rsi
00000000001cadf0	movq	%r12, %rdi
00000000001cadf3	leaq	-0x128(%rbp), %rdx
00000000001cadfa	callq	0x3c4af0                        ## symbol stub for: _CFDictionaryGetValueIfPresent
00000000001cadff	movl	$0x2, %ebx
00000000001cae04	testb	%al, %al
00000000001cae06	jne	0x1cae4f
00000000001cae08	movq	0x837249(%rip), %rax            ## literal pool symbol address: _kColorSyncConversionParamCurve3
00000000001cae0f	movq	(%rax), %rsi
00000000001cae12	movq	%r12, %rdi
00000000001cae15	leaq	-0x128(%rbp), %rdx
00000000001cae1c	callq	0x3c4af0                        ## symbol stub for: _CFDictionaryGetValueIfPresent
00000000001cae21	movl	$0x3, %ebx
00000000001cae26	testb	%al, %al
00000000001cae28	jne	0x1cae4f
00000000001cae2a	movq	0x83722f(%rip), %rax            ## literal pool symbol address: _kColorSyncConversionParamCurve4
00000000001cae31	movq	(%rax), %rsi
00000000001cae34	movq	%r12, %rdi
00000000001cae37	leaq	-0x128(%rbp), %rdx
00000000001cae3e	callq	0x3c4af0                        ## symbol stub for: _CFDictionaryGetValueIfPresent
00000000001cae43	xorl	%ecx, %ecx
00000000001cae45	cmpb	$0x1, %al
00000000001cae47	setae	%cl
00000000001cae4a	leal	(%rcx,%rcx,4), %ebx
00000000001cae4d	decl	%ebx
00000000001cae4f	leaq	__ZN8HGLogger8_enabledE(%rip), %rax ## HGLogger::_enabled
00000000001cae56	movzbl	(%rax), %eax
00000000001cae59	cmpb	$0x1, %al
00000000001cae5b	jne	0x1cae81
00000000001cae5d	leaq	0x71bae5(%rip), %rdi            ## literal pool for: "colorConform"
00000000001cae64	movl	$0x1, %esi
00000000001cae69	leaq	0x72b630(%rip), %rdx            ## literal pool for: "\tfragment %i, kColorSyncConversionParamCurve%i\n"
00000000001cae70	movq	-0x110(%rbp), %rcx
00000000001cae77	movl	%ebx, %r8d
00000000001cae7a	xorl	%eax, %eax
00000000001cae7c	callq	__ZN8HGLogger3logEPKciS1_z      ## HGLogger::log(char const*, int, char const*, ...)
00000000001cae81	testl	%r14d, %r14d
00000000001cae84	je	0x1cae97
00000000001cae86	cmpl	%ebx, -0xf0(%rbp)
00000000001cae8c	je	0x1caf19
00000000001cae92	jmp	0x1cc431
00000000001cae97	movl	$0x100, %edi                    ## imm = 0x100
00000000001cae9c	callq	0x3c4fb2                        ## symbol stub for: __Znwm
00000000001caea1	pxor	%xmm0, %xmm0
00000000001caea5	movdqu	%xmm0, 0xe0(%rax)
00000000001caead	movq	$0x0, 0xf0(%rax)
00000000001caeb8	movl	$0x0, (%rax)
00000000001caebe	movdqa	%xmm0, 0x10(%rax)
00000000001caec3	movdqa	%xmm0, 0x20(%rax)
00000000001caec8	movdqa	%xmm0, 0x30(%rax)
00000000001caecd	movdqa	%xmm0, 0x50(%rax)
00000000001caed2	movdqa	%xmm0, 0x60(%rax)
00000000001caed7	movdqa	%xmm0, 0x70(%rax)
00000000001caedc	movdqa	%xmm0, 0x80(%rax)
00000000001caee4	movdqa	%xmm0, 0x90(%rax)
00000000001caeec	movdqa	%xmm0, 0xa0(%rax)
00000000001caef4	movdqa	%xmm0, 0xb0(%rax)
00000000001caefc	movdqa	%xmm0, 0xc0(%rax)
00000000001caf04	movdqu	%xmm0, 0xc9(%rax)
00000000001caf0c	movq	%rax, -0xe8(%rbp)
00000000001caf13	movl	%ebx, -0xf0(%rbp)
00000000001caf19	movq	0x8370f8(%rip), %rax            ## literal pool symbol address: _kColorSyncConversionChannelID
00000000001caf20	movq	(%rax), %rsi
00000000001caf23	movq	%r12, %rdi
00000000001caf26	leaq	-0x140(%rbp), %rdx
00000000001caf2d	callq	0x3c4af0                        ## symbol stub for: _CFDictionaryGetValueIfPresent
00000000001caf32	testb	%al, %al
00000000001caf34	je	0x1cc431
00000000001caf3a	movq	-0x140(%rbp), %rdi
00000000001caf41	movl	$0x3, %esi
00000000001caf46	leaq	-0xec(%rbp), %rdx
00000000001caf4d	callq	0x3c4b08                        ## symbol stub for: _CFNumberGetValue
00000000001caf52	testb	%al, %al
00000000001caf54	je	0x1cc431
00000000001caf5a	cmpl	$0x6, %r14d
00000000001caf5e	ja	0x1cb006
00000000001caf64	movl	-0xec(%rbp), %eax
00000000001caf6a	movl	%r14d, %ecx
00000000001caf6d	leaq	0x1638(%rip), %rdx
00000000001caf74	movslq	(%rdx,%rcx,4), %rcx
00000000001caf78	addq	%rdx, %rcx
00000000001caf7b	jmpq	*%rcx
00000000001caf7d	cmpl	$0x3, %eax
00000000001caf80	jae	0x1cc431
00000000001caf86	incl	%eax
00000000001caf88	movl	%eax, %r14d
00000000001caf8b	jmp	0x1cb006
00000000001caf8d	movl	$0x7, %r14d
00000000001caf93	cmpl	$0x2, %eax
00000000001caf96	je	0x1cb006
00000000001caf98	jmp	0x1cc431
00000000001caf9d	movl	$0x4, %r14d
00000000001cafa3	testl	%eax, %eax
00000000001cafa5	je	0x1cb006
00000000001cafa7	cmpl	$0x2, %eax
00000000001cafaa	je	0x1cafc4
00000000001cafac	jmp	0x1cc431
00000000001cafb1	movl	$0x5, %r14d
00000000001cafb7	testl	%eax, %eax
00000000001cafb9	je	0x1cb006
00000000001cafbb	cmpl	$0x1, %eax
00000000001cafbe	jne	0x1cc431
00000000001cafc4	movl	$0x6, %r14d
00000000001cafca	jmp	0x1cb006
00000000001cafcc	movl	$0x4, %r14d
00000000001cafd2	cmpl	$0x1, %eax
00000000001cafd5	je	0x1cb006
00000000001cafd7	cmpl	$0x2, %eax
00000000001cafda	jne	0x1cc431
00000000001cafe0	movl	$0x5, %r14d
00000000001cafe6	jmp	0x1cb006
00000000001cafe8	movl	$0x7, %r14d
00000000001cafee	cmpl	$0x1, %eax
00000000001caff1	je	0x1cb006
00000000001caff3	jmp	0x1cc431
00000000001caff8	movl	$0x7, %r14d
00000000001caffe	testl	%eax, %eax
00000000001cb000	jne	0x1cc431
00000000001cb006	movl	%r14d, -0x108(%rbp)
00000000001cb00d	cmpl	$0x0, -0xf0(%rbp)
00000000001cb014	js	0x1cb434
00000000001cb01a	movq	-0x128(%rbp), %r12
00000000001cb021	movq	%r12, %rdi
00000000001cb024	xorl	%esi, %esi
00000000001cb026	callq	0x3c4aa8                        ## symbol stub for: _CFArrayGetValueAtIndex
00000000001cb02b	movl	$0x5, %esi
00000000001cb030	movq	%rax, %rdi
00000000001cb033	leaq	-0xd0(%rbp), %rdx
00000000001cb03a	callq	0x3c4b08                        ## symbol stub for: _CFNumberGetValue
00000000001cb03f	testb	%al, %al
00000000001cb041	je	0x1cc431
00000000001cb047	movss	-0xd0(%rbp), %xmm0
00000000001cb04f	movq	-0xe8(%rbp), %rax
00000000001cb056	movslq	-0xec(%rbp), %rcx
00000000001cb05d	movss	%xmm0, 0x50(%rax,%rcx,4)
00000000001cb063	leaq	__ZN8HGLogger8_enabledE(%rip), %rax ## HGLogger::_enabled
00000000001cb06a	movzbl	(%rax), %eax
00000000001cb06d	cmpb	$0x1, %al
00000000001cb06f	jne	0x1cb09d
00000000001cb071	movl	-0xec(%rbp), %ecx
00000000001cb077	movss	-0xd0(%rbp), %xmm0
00000000001cb07f	cvtss2sd	%xmm0, %xmm0
00000000001cb083	leaq	0x71b8bf(%rip), %rdi            ## literal pool for: "colorConform"
00000000001cb08a	movl	$0x1, %esi
00000000001cb08f	leaq	0x72b43a(%rip), %rdx            ## literal pool for: "\t\tgamma(%i) = %f\n"
00000000001cb096	movb	$0x1, %al
00000000001cb098	callq	__ZN8HGLogger3logEPKciS1_z      ## HGLogger::log(char const*, int, char const*, ...)
00000000001cb09d	cmpl	$0x0, -0xf0(%rbp)
00000000001cb0a4	je	0x1cb3e3
00000000001cb0aa	movl	$0x1, %esi
00000000001cb0af	movq	%r12, %rdi
00000000001cb0b2	callq	0x3c4aa8                        ## symbol stub for: _CFArrayGetValueAtIndex
00000000001cb0b7	movq	%rax, %r14
00000000001cb0ba	movl	$0x2, %esi
00000000001cb0bf	movq	%r12, %rdi
00000000001cb0c2	callq	0x3c4aa8                        ## symbol stub for: _CFArrayGetValueAtIndex
00000000001cb0c7	movq	%rax, %rbx
00000000001cb0ca	movl	$0x5, %esi
00000000001cb0cf	movq	%r14, %rdi
00000000001cb0d2	leaq	-0xe0(%rbp), %rdx
00000000001cb0d9	callq	0x3c4b08                        ## symbol stub for: _CFNumberGetValue
00000000001cb0de	testb	%al, %al
00000000001cb0e0	je	0x1cc431
00000000001cb0e6	movl	$0x5, %esi
00000000001cb0eb	movq	%rbx, %rdi
00000000001cb0ee	leaq	-0x118(%rbp), %rdx
00000000001cb0f5	callq	0x3c4b08                        ## symbol stub for: _CFNumberGetValue
00000000001cb0fa	testb	%al, %al
00000000001cb0fc	je	0x1cc431
00000000001cb102	movss	-0xe0(%rbp), %xmm0
00000000001cb10a	movq	-0xe8(%rbp), %rax
00000000001cb111	movslq	-0xec(%rbp), %rcx
00000000001cb118	movss	%xmm0, 0x60(%rax,%rcx,4)
00000000001cb11e	movss	-0x118(%rbp), %xmm0
00000000001cb126	movq	-0xe8(%rbp), %rax
00000000001cb12d	movslq	-0xec(%rbp), %rcx
00000000001cb134	movss	%xmm0, 0x70(%rax,%rcx,4)
00000000001cb13a	leaq	__ZN8HGLogger8_enabledE(%rip), %rax ## HGLogger::_enabled
00000000001cb141	movzbl	(%rax), %eax
00000000001cb144	cmpb	$0x1, %al
00000000001cb146	jne	0x1cb174
00000000001cb148	movl	-0xec(%rbp), %ecx
00000000001cb14e	movss	-0xe0(%rbp), %xmm0
00000000001cb156	cvtss2sd	%xmm0, %xmm0
00000000001cb15a	leaq	0x71b7e8(%rip), %rdi            ## literal pool for: "colorConform"
00000000001cb161	movl	$0x1, %esi
00000000001cb166	leaq	0x72b375(%rip), %rdx            ## literal pool for: "\t\tA(%i) = %f\n"
00000000001cb16d	movb	$0x1, %al
00000000001cb16f	callq	__ZN8HGLogger3logEPKciS1_z      ## HGLogger::log(char const*, int, char const*, ...)
00000000001cb174	leaq	__ZN8HGLogger8_enabledE(%rip), %rax ## HGLogger::_enabled
00000000001cb17b	movzbl	(%rax), %eax
00000000001cb17e	cmpb	$0x1, %al
00000000001cb180	jne	0x1cb1ae
00000000001cb182	movl	-0xec(%rbp), %ecx
00000000001cb188	movss	-0x118(%rbp), %xmm0
00000000001cb190	cvtss2sd	%xmm0, %xmm0
00000000001cb194	leaq	0x71b7ae(%rip), %rdi            ## literal pool for: "colorConform"
00000000001cb19b	movl	$0x1, %esi
00000000001cb1a0	leaq	0x72b349(%rip), %rdx            ## literal pool for: "\t\tB(%i) = %f\n"
00000000001cb1a7	movb	$0x1, %al
00000000001cb1a9	callq	__ZN8HGLogger3logEPKciS1_z      ## HGLogger::log(char const*, int, char const*, ...)
00000000001cb1ae	cmpl	$0x1, -0xf0(%rbp)
00000000001cb1b5	je	0x1cb3e3
00000000001cb1bb	movl	$0x3, %esi
00000000001cb1c0	movq	%r12, %rdi
00000000001cb1c3	callq	0x3c4aa8                        ## symbol stub for: _CFArrayGetValueAtIndex
00000000001cb1c8	movl	$0x5, %esi
00000000001cb1cd	movq	%rax, %rdi
00000000001cb1d0	leaq	-0xe0(%rbp), %rdx
00000000001cb1d7	callq	0x3c4b08                        ## symbol stub for: _CFNumberGetValue
00000000001cb1dc	testb	%al, %al
00000000001cb1de	je	0x1cc431
00000000001cb1e4	movss	-0xe0(%rbp), %xmm0
00000000001cb1ec	movq	-0xe8(%rbp), %rax
00000000001cb1f3	movslq	-0xec(%rbp), %rcx
00000000001cb1fa	movss	%xmm0, 0x80(%rax,%rcx,4)
00000000001cb203	leaq	__ZN8HGLogger8_enabledE(%rip), %rax ## HGLogger::_enabled
00000000001cb20a	movzbl	(%rax), %eax
00000000001cb20d	cmpb	$0x1, %al
00000000001cb20f	jne	0x1cb23d
00000000001cb211	movl	-0xec(%rbp), %ecx
00000000001cb217	movss	-0xe0(%rbp), %xmm0
00000000001cb21f	cvtss2sd	%xmm0, %xmm0
00000000001cb223	leaq	0x71b71f(%rip), %rdi            ## literal pool for: "colorConform"
00000000001cb22a	movl	$0x1, %esi
00000000001cb22f	leaq	0x72b2c8(%rip), %rdx            ## literal pool for: "\t\tC(%i) = %f\n"
00000000001cb236	movb	$0x1, %al
00000000001cb238	callq	__ZN8HGLogger3logEPKciS1_z      ## HGLogger::log(char const*, int, char const*, ...)
00000000001cb23d	cmpl	$0x3, -0xf0(%rbp)
00000000001cb244	jb	0x1cb3e3
00000000001cb24a	movl	$0x4, %esi
00000000001cb24f	movq	%r12, %rdi
00000000001cb252	callq	0x3c4aa8                        ## symbol stub for: _CFArrayGetValueAtIndex
00000000001cb257	movl	$0x5, %esi
00000000001cb25c	movq	%rax, %rdi
00000000001cb25f	leaq	-0xe0(%rbp), %rdx
00000000001cb266	callq	0x3c4b08                        ## symbol stub for: _CFNumberGetValue
00000000001cb26b	testb	%al, %al
00000000001cb26d	je	0x1cc431
00000000001cb273	movss	-0xe0(%rbp), %xmm0
00000000001cb27b	movq	-0xe8(%rbp), %rax
00000000001cb282	movslq	-0xec(%rbp), %rcx
00000000001cb289	movss	%xmm0, 0x90(%rax,%rcx,4)
00000000001cb292	leaq	__ZN8HGLogger8_enabledE(%rip), %rax ## HGLogger::_enabled
00000000001cb299	movzbl	(%rax), %eax
00000000001cb29c	cmpb	$0x1, %al
00000000001cb29e	jne	0x1cb2cc
00000000001cb2a0	movl	-0xec(%rbp), %ecx
00000000001cb2a6	movss	-0xe0(%rbp), %xmm0
00000000001cb2ae	cvtss2sd	%xmm0, %xmm0
00000000001cb2b2	leaq	0x71b690(%rip), %rdi            ## literal pool for: "colorConform"
00000000001cb2b9	movl	$0x1, %esi
00000000001cb2be	leaq	0x72b247(%rip), %rdx            ## literal pool for: "\t\tD(%i) = %f\n"
00000000001cb2c5	movb	$0x1, %al
00000000001cb2c7	callq	__ZN8HGLogger3logEPKciS1_z      ## HGLogger::log(char const*, int, char const*, ...)
00000000001cb2cc	cmpl	$0x3, -0xf0(%rbp)
00000000001cb2d3	je	0x1cb3e3
00000000001cb2d9	movl	$0x5, %esi
00000000001cb2de	movq	%r12, %rdi
00000000001cb2e1	callq	0x3c4aa8                        ## symbol stub for: _CFArrayGetValueAtIndex
00000000001cb2e6	movq	%rax, %r14
00000000001cb2e9	movl	$0x6, %esi
00000000001cb2ee	movq	%r12, %rdi
00000000001cb2f1	callq	0x3c4aa8                        ## symbol stub for: _CFArrayGetValueAtIndex
00000000001cb2f6	movq	%rax, %rbx
00000000001cb2f9	movl	$0x5, %esi
00000000001cb2fe	movq	%r14, %rdi
00000000001cb301	leaq	-0xe0(%rbp), %rdx
00000000001cb308	callq	0x3c4b08                        ## symbol stub for: _CFNumberGetValue
00000000001cb30d	testb	%al, %al
00000000001cb30f	je	0x1cc431
00000000001cb315	movl	$0x5, %esi
00000000001cb31a	movq	%rbx, %rdi
00000000001cb31d	leaq	-0x118(%rbp), %rdx
00000000001cb324	callq	0x3c4b08                        ## symbol stub for: _CFNumberGetValue
00000000001cb329	testb	%al, %al
00000000001cb32b	je	0x1cc431
00000000001cb331	movss	-0xe0(%rbp), %xmm0
00000000001cb339	movq	-0xe8(%rbp), %rax
00000000001cb340	movslq	-0xec(%rbp), %rcx
00000000001cb347	movss	%xmm0, 0xa0(%rax,%rcx,4)
00000000001cb350	movss	-0x118(%rbp), %xmm0
00000000001cb358	movq	-0xe8(%rbp), %rax
00000000001cb35f	movslq	-0xec(%rbp), %rcx
00000000001cb366	movss	%xmm0, 0xb0(%rax,%rcx,4)
00000000001cb36f	leaq	__ZN8HGLogger8_enabledE(%rip), %rax ## HGLogger::_enabled
00000000001cb376	movzbl	(%rax), %eax
00000000001cb379	cmpb	$0x1, %al
00000000001cb37b	jne	0x1cb3a9
00000000001cb37d	movl	-0xec(%rbp), %ecx
00000000001cb383	movss	-0xe0(%rbp), %xmm0
00000000001cb38b	cvtss2sd	%xmm0, %xmm0
00000000001cb38f	leaq	0x71b5b3(%rip), %rdi            ## literal pool for: "colorConform"
00000000001cb396	movl	$0x1, %esi
00000000001cb39b	leaq	0x72b178(%rip), %rdx            ## literal pool for: "\t\tE(%i) = %f\n"
00000000001cb3a2	movb	$0x1, %al
00000000001cb3a4	callq	__ZN8HGLogger3logEPKciS1_z      ## HGLogger::log(char const*, int, char const*, ...)
00000000001cb3a9	leaq	__ZN8HGLogger8_enabledE(%rip), %rax ## HGLogger::_enabled
00000000001cb3b0	movzbl	(%rax), %eax
00000000001cb3b3	cmpb	$0x1, %al
00000000001cb3b5	jne	0x1cb3e3
00000000001cb3b7	movl	-0xec(%rbp), %ecx
00000000001cb3bd	movss	-0x118(%rbp), %xmm0
00000000001cb3c5	cvtss2sd	%xmm0, %xmm0
00000000001cb3c9	leaq	0x71b579(%rip), %rdi            ## literal pool for: "colorConform"
00000000001cb3d0	movl	$0x1, %esi
00000000001cb3d5	leaq	0x72b14c(%rip), %rdx            ## literal pool for: "\t\tF(%i) = %f\n"
00000000001cb3dc	movb	$0x1, %al
00000000001cb3de	callq	__ZN8HGLogger3logEPKciS1_z      ## HGLogger::log(char const*, int, char const*, ...)
00000000001cb3e3	movl	-0x108(%rbp), %r14d
00000000001cb3ea	cmpl	$0x7, %r14d
00000000001cb3ee	jne	0x1cb8c8
00000000001cb3f4	movl	-0xf0(%rbp), %ecx
00000000001cb3fa	cmpl	$0x4, %ecx
00000000001cb3fd	movl	$0x4, %eax
00000000001cb402	cmovbl	%ecx, %eax
00000000001cb405	movq	-0xe8(%rbp), %rcx
00000000001cb40c	addl	$0x2, %eax
00000000001cb40f	movl	%eax, (%rcx)
00000000001cb411	movq	-0x148(%rbp), %rdi
00000000001cb418	leaq	-0xe8(%rbp), %rsi
00000000001cb41f	callq	__ZNSt3__16vectorIP26HGColorConformNodeListItemNS_9allocatorIS2_EEE9push_backB9nqe210106ERKS2_ ## std::__1::vector<HGColorConformNodeListItem*, std::__1::allocator<HGColorConformNodeListItem*>>::push_back[abi:nqe210106](HGColorConformNodeListItem* const&)
00000000001cb424	movq	$0x0, -0xe8(%rbp)
00000000001cb42f	jmp	0x1cb8c1
00000000001cb434	leaq	__ZN8HGLogger8_enabledE(%rip), %rax ## HGLogger::_enabled
00000000001cb43b	movzbl	(%rax), %eax
00000000001cb43e	cmpb	$0x1, %al
00000000001cb440	jne	0x1cb463
00000000001cb442	leaq	0x71b500(%rip), %rdi            ## literal pool for: "colorConform"
00000000001cb449	movl	$0x1, %esi
00000000001cb44e	leaq	0x72b0e1(%rip), %rdx            ## literal pool for: "\tfragment %i, kColorSyncConversion1DLut\n"
00000000001cb455	movq	-0x110(%rbp), %rcx
00000000001cb45c	xorl	%eax, %eax
00000000001cb45e	callq	__ZN8HGLogger3logEPKciS1_z      ## HGLogger::log(char const*, int, char const*, ...)
00000000001cb463	movq	0x836b9e(%rip), %rax            ## literal pool symbol address: _kColorSyncConversion1DLut
00000000001cb46a	movq	(%rax), %rsi
00000000001cb46d	movq	%r12, %rdi
00000000001cb470	leaq	-0x118(%rbp), %rdx
00000000001cb477	callq	0x3c4af0                        ## symbol stub for: _CFDictionaryGetValueIfPresent
00000000001cb47c	testb	%al, %al
00000000001cb47e	je	0x1cc431
00000000001cb484	movq	0x836b95(%rip), %rax            ## literal pool symbol address: _kColorSyncConversionGridPoints
00000000001cb48b	movq	(%rax), %rsi
00000000001cb48e	movq	%r12, %rdi
00000000001cb491	leaq	-0x138(%rbp), %rdx
00000000001cb498	callq	0x3c4af0                        ## symbol stub for: _CFDictionaryGetValueIfPresent
00000000001cb49d	testb	%al, %al
00000000001cb49f	je	0x1cc431
00000000001cb4a5	movq	-0x138(%rbp), %rdi
00000000001cb4ac	movl	$0x3, %esi
00000000001cb4b1	leaq	-0x100(%rbp), %rdx
00000000001cb4b8	callq	0x3c4b08                        ## symbol stub for: _CFNumberGetValue
00000000001cb4bd	testb	%al, %al
00000000001cb4bf	je	0x1cc431
00000000001cb4c5	movq	-0x118(%rbp), %rdi
00000000001cb4cc	callq	0x3c4ac0                        ## symbol stub for: _CFDataGetLength
00000000001cb4d1	movl	%eax, %ecx
00000000001cb4d3	movl	-0x100(%rbp), %ebx
00000000001cb4d9	leaq	(,%rbx,4), %rdx
00000000001cb4e1	cmpq	%rdx, %rcx
00000000001cb4e4	jne	0x1cc431
00000000001cb4ea	movq	-0xe8(%rbp), %rcx
00000000001cb4f1	movd	%ebx, %xmm0
00000000001cb4f5	punpckldq	-0x1b0(%rbp), %xmm0     ## xmm0 = xmm0[0],mem[0],xmm0[1],mem[1]
00000000001cb4fd	movd	%eax, %xmm1
00000000001cb501	punpcklqdq	%xmm0, %xmm1            ## xmm1 = xmm1[0],xmm0[0]
00000000001cb505	movdqa	%xmm1, 0xc0(%rcx)
00000000001cb50d	cmpq	$0x0, 0xd0(%rcx)
00000000001cb515	jne	0x1cb571
00000000001cb517	movl	$0x28, %edi
00000000001cb51c	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
00000000001cb521	movq	%rax, %r14
00000000001cb524	shlq	$0x22, %rbx
00000000001cb528	sarq	$0x1e, %rbx
00000000001cb52c	movq	%rax, %rdi
00000000001cb52f	movq	%rbx, %rsi
00000000001cb532	movl	$0x1c, %edx
00000000001cb537	callq	__ZN21HGColorConformLUTDataC1Em8HGFormat ## HGColorConformLUTData::HGColorConformLUTData(unsigned long, HGFormat)
00000000001cb53c	movq	-0xe8(%rbp), %rbx
00000000001cb543	movq	0xd0(%rbx), %rdi
00000000001cb54a	cmpq	%r14, %rdi
00000000001cb54d	je	0x1cb563
00000000001cb54f	testq	%rdi, %rdi
00000000001cb552	je	0x1cb55a
00000000001cb554	movq	(%rdi), %rax
00000000001cb557	callq	*0x18(%rax)
00000000001cb55a	movq	%r14, 0xd0(%rbx)
00000000001cb561	jmp	0x1cb571
00000000001cb563	testq	%r14, %r14
00000000001cb566	je	0x1cb571
00000000001cb568	movq	(%r14), %rax
00000000001cb56b	movq	%r14, %rdi
00000000001cb56e	callq	*0x18(%rax)
00000000001cb571	movq	-0xe8(%rbp), %rax
00000000001cb578	movq	0xd0(%rax), %r12
00000000001cb57f	movq	-0x118(%rbp), %rdi
00000000001cb586	callq	0x3c4aba                        ## symbol stub for: _CFDataGetBytePtr
00000000001cb58b	movq	%rax, %rbx
00000000001cb58e	movslq	-0xec(%rbp), %r14
00000000001cb595	movq	0x18(%r12), %r15
00000000001cb59a	movl	$0x1c, %edi
00000000001cb59f	callq	__ZN13HGFormatUtils13bytesPerPixelE8HGFormat ## HGFormatUtils::bytesPerPixel(HGFormat)
00000000001cb5a4	shlq	$0x2, %r14
00000000001cb5a8	movq	0x10(%r12), %rcx
00000000001cb5ad	cmpq	%rcx, %r14
00000000001cb5b0	jae	0x1cb5d7
00000000001cb5b2	movl	%eax, %eax
00000000001cb5b4	addq	%r14, %r15
00000000001cb5b7	xorl	%edx, %edx
00000000001cb5b9	nopl	(%rax)
00000000001cb5c0	addq	%rax, %r14
00000000001cb5c3	movd	(%rbx,%rdx), %xmm0
00000000001cb5c8	movd	%xmm0, (%r15,%rdx,4)
00000000001cb5ce	addq	$0x4, %rdx
00000000001cb5d2	cmpq	%rcx, %r14
00000000001cb5d5	jb	0x1cb5c0
00000000001cb5d7	cmpl	$0x3, -0xec(%rbp)
00000000001cb5de	jne	0x1cb5ee
00000000001cb5e0	movq	-0xe8(%rbp), %rax
00000000001cb5e7	movb	$0x1, 0xd8(%rax)
00000000001cb5ee	movl	-0x108(%rbp), %r14d
00000000001cb5f5	cmpl	$0x7, %r14d
00000000001cb5f9	jne	0x1cb88c
00000000001cb5ff	movq	-0x170(%rbp), %rdi
00000000001cb606	callq	0x3c4d9c                        ## symbol stub for: _ColorSyncProfileGetMD5
00000000001cb60b	movq	%rax, -0xd0(%rbp)
00000000001cb612	movq	%rdx, -0xc8(%rbp)
00000000001cb619	movq	-0x168(%rbp), %rdi
00000000001cb620	callq	0x3c4d9c                        ## symbol stub for: _ColorSyncProfileGetMD5
00000000001cb625	movq	%rax, -0xe0(%rbp)
00000000001cb62c	movq	%rdx, -0xd8(%rbp)
00000000001cb633	xorl	%r13d, %r13d
00000000001cb636	jmp	0x1cb662
00000000001cb638	nopl	(%rax,%rax)
00000000001cb640	movzbl	-0xd0(%rbp,%r13), %eax
00000000001cb649	movb	%al, (%rbx)
00000000001cb64b	incq	%rbx
00000000001cb64e	movq	%rbx, 0xe8(%r14)
00000000001cb655	incq	%r13
00000000001cb658	cmpq	$0x10, %r13
00000000001cb65c	je	0x1cb732
00000000001cb662	movq	-0xe8(%rbp), %r14
00000000001cb669	movq	0xe8(%r14), %rbx
00000000001cb670	movq	0xf0(%r14), %rax
00000000001cb677	cmpq	%rax, %rbx
00000000001cb67a	jb	0x1cb640
00000000001cb67c	movq	0xe0(%r14), %rcx
00000000001cb683	subq	%rcx, %rbx
00000000001cb686	movq	%rbx, %r15
00000000001cb689	incq	%r15
00000000001cb68c	js	0x1cc52f
00000000001cb692	movq	%rcx, -0xf8(%rbp)
00000000001cb699	subq	%rcx, %rax
00000000001cb69c	leaq	(%rax,%rax), %rcx
00000000001cb6a0	cmpq	%r15, %rcx
00000000001cb6a3	cmovaq	%rcx, %r15
00000000001cb6a7	movabsq	$0x3fffffffffffffff, %rcx       ## imm = 0x3FFFFFFFFFFFFFFF
00000000001cb6b1	cmpq	%rcx, %rax
00000000001cb6b4	movabsq	$0x7fffffffffffffff, %rax       ## imm = 0x7FFFFFFFFFFFFFFF
00000000001cb6be	cmovaeq	%rax, %r15
00000000001cb6c2	testq	%r15, %r15
00000000001cb6c5	je	0x1cb6d4
00000000001cb6c7	movq	%r15, %rdi
00000000001cb6ca	callq	0x3c4fb2                        ## symbol stub for: __Znwm
00000000001cb6cf	movq	%rax, %r12
00000000001cb6d2	jmp	0x1cb6d7
00000000001cb6d4	xorl	%r12d, %r12d
00000000001cb6d7	addq	%r12, %r15
00000000001cb6da	movzbl	-0xd0(%rbp,%r13), %eax
00000000001cb6e3	movb	%al, (%r12,%rbx)
00000000001cb6e7	leaq	(%r12,%rbx), %rax
00000000001cb6eb	incq	%rax
00000000001cb6ee	movq	%r12, %rdi
00000000001cb6f1	movq	-0xf8(%rbp), %rsi
00000000001cb6f8	movq	%rbx, %rdx
00000000001cb6fb	movq	%rax, %rbx
00000000001cb6fe	callq	0x3c5438                        ## symbol stub for: _memcpy
00000000001cb703	movq	-0xf8(%rbp), %rdi
00000000001cb70a	movq	%r12, 0xe0(%r14)
00000000001cb711	movq	%rbx, 0xe8(%r14)
00000000001cb718	movq	%r15, 0xf0(%r14)
00000000001cb71f	testq	%rdi, %rdi
00000000001cb722	je	0x1cb64e
00000000001cb728	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
00000000001cb72d	jmp	0x1cb64e
00000000001cb732	xorl	%r13d, %r13d
00000000001cb735	jmp	0x1cb769
00000000001cb737	nopw	(%rax,%rax)
00000000001cb740	movzbl	-0xe0(%rbp,%r13), %eax
00000000001cb749	movb	%al, (%rbx)
00000000001cb74b	incq	%rbx
00000000001cb74e	movq	-0x110(%rbp), %rcx
00000000001cb755	movq	%rbx, 0xe8(%r14)
00000000001cb75c	incq	%r13
00000000001cb75f	cmpq	$0x10, %r13
00000000001cb763	je	0x1cb839
00000000001cb769	movq	-0xe8(%rbp), %r14
00000000001cb770	movq	0xe8(%r14), %rbx
00000000001cb777	movq	0xf0(%r14), %rax
00000000001cb77e	cmpq	%rax, %rbx
00000000001cb781	jb	0x1cb740
00000000001cb783	movq	0xe0(%r14), %rcx
00000000001cb78a	subq	%rcx, %rbx
00000000001cb78d	movq	%rbx, %r15
00000000001cb790	incq	%r15
00000000001cb793	js	0x1cc536
00000000001cb799	movq	%rcx, -0xf8(%rbp)
00000000001cb7a0	subq	%rcx, %rax
00000000001cb7a3	leaq	(%rax,%rax), %rcx
00000000001cb7a7	cmpq	%r15, %rcx
00000000001cb7aa	cmovaq	%rcx, %r15
00000000001cb7ae	movabsq	$0x3fffffffffffffff, %rcx       ## imm = 0x3FFFFFFFFFFFFFFF
00000000001cb7b8	cmpq	%rcx, %rax
00000000001cb7bb	movabsq	$0x7fffffffffffffff, %rax       ## imm = 0x7FFFFFFFFFFFFFFF
00000000001cb7c5	cmovaeq	%rax, %r15
00000000001cb7c9	testq	%r15, %r15
00000000001cb7cc	je	0x1cb7db
00000000001cb7ce	movq	%r15, %rdi
00000000001cb7d1	callq	0x3c4fb2                        ## symbol stub for: __Znwm
00000000001cb7d6	movq	%rax, %r12
00000000001cb7d9	jmp	0x1cb7de
00000000001cb7db	xorl	%r12d, %r12d
00000000001cb7de	addq	%r12, %r15
00000000001cb7e1	movzbl	-0xe0(%rbp,%r13), %eax
00000000001cb7ea	movb	%al, (%r12,%rbx)
00000000001cb7ee	leaq	(%r12,%rbx), %rax
00000000001cb7f2	incq	%rax
00000000001cb7f5	movq	%r12, %rdi
00000000001cb7f8	movq	-0xf8(%rbp), %rsi
00000000001cb7ff	movq	%rbx, %rdx
00000000001cb802	movq	%rax, %rbx
00000000001cb805	callq	0x3c5438                        ## symbol stub for: _memcpy
00000000001cb80a	movq	-0xf8(%rbp), %rdi
00000000001cb811	movq	%r12, 0xe0(%r14)
00000000001cb818	movq	%rbx, 0xe8(%r14)
00000000001cb81f	movq	%r15, 0xf0(%r14)
00000000001cb826	testq	%rdi, %rdi
00000000001cb829	je	0x1cb74e
00000000001cb82f	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
00000000001cb834	jmp	0x1cb74e
00000000001cb839	movq	-0xe8(%rbp), %rdi
00000000001cb840	movl	$0xe0, %eax
00000000001cb845	addq	%rax, %rdi
00000000001cb848	movb	%cl, -0xfc(%rbp)
00000000001cb84e	leaq	-0xfc(%rbp), %rsi
00000000001cb855	callq	__ZNSt3__16vectorIhNS_9allocatorIhEEE9push_backB9nqe210106ERKh ## std::__1::vector<unsigned char, std::__1::allocator<unsigned char>>::push_back[abi:nqe210106](unsigned char const&)
00000000001cb85a	movq	-0xe8(%rbp), %rax
00000000001cb861	movl	$0x7, (%rax)
00000000001cb867	movq	-0x148(%rbp), %rdi
00000000001cb86e	leaq	-0xe8(%rbp), %rsi
00000000001cb875	callq	__ZNSt3__16vectorIP26HGColorConformNodeListItemNS_9allocatorIS2_EEE9push_backB9nqe210106ERKS2_ ## std::__1::vector<HGColorConformNodeListItem*, std::__1::allocator<HGColorConformNodeListItem*>>::push_back[abi:nqe210106](HGColorConformNodeListItem* const&)
00000000001cb87a	movq	$0x0, -0xe8(%rbp)
00000000001cb885	movl	-0x108(%rbp), %r14d
00000000001cb88c	leaq	__ZN8HGLogger8_enabledE(%rip), %rax ## HGLogger::_enabled
00000000001cb893	movzbl	(%rax), %eax
00000000001cb896	cmpb	$0x1, %al
00000000001cb898	jne	0x1cb8c8
00000000001cb89a	movl	-0x100(%rbp), %ecx
00000000001cb8a0	movl	-0xec(%rbp), %r8d
00000000001cb8a7	leaq	0x71b09b(%rip), %rdi            ## literal pool for: "colorConform"
00000000001cb8ae	movl	$0x1, %esi
00000000001cb8b3	leaq	0x72aca5(%rip), %rdx            ## literal pool for: "\t\tnumGridPoints = %i\tchannel = %i\n"
00000000001cb8ba	xorl	%eax, %eax
00000000001cb8bc	callq	__ZN8HGLogger3logEPKciS1_z      ## HGLogger::log(char const*, int, char const*, ...)
00000000001cb8c1	movl	-0x108(%rbp), %r14d
00000000001cb8c8	movq	-0x120(%rbp), %rdi
00000000001cb8cf	movq	-0x110(%rbp), %rsi
00000000001cb8d6	cmpl	$0x7, %r14d
00000000001cb8da	movl	$0x0, %eax
00000000001cb8df	cmovel	%eax, %r14d
00000000001cb8e3	movl	$0xfffffffe, %eax               ## imm = 0xFFFFFFFE
00000000001cb8e8	movl	-0xf0(%rbp), %ecx
00000000001cb8ee	cmovel	%eax, %ecx
00000000001cb8f1	movl	%ecx, -0xf0(%rbp)
00000000001cb8f7	incq	%rsi
00000000001cb8fa	cmpq	-0x160(%rbp), %rsi
00000000001cb901	jne	0x1ca7e6
00000000001cb907	jmp	0x1cc515
00000000001cb90c	movq	0x8366fd(%rip), %rax            ## literal pool symbol address: _kColorSyncConversion3DLut
00000000001cb913	movq	(%rax), %rsi
00000000001cb916	movq	%r12, %rdi
00000000001cb919	leaq	-0x128(%rbp), %rdx
00000000001cb920	callq	0x3c4af0                        ## symbol stub for: _CFDictionaryGetValueIfPresent
00000000001cb925	testb	%al, %al
00000000001cb927	je	0x1cb8c8
00000000001cb929	leaq	__ZN8HGLogger8_enabledE(%rip), %rax ## HGLogger::_enabled
00000000001cb930	movzbl	(%rax), %eax
00000000001cb933	cmpb	$0x1, %al
00000000001cb935	jne	0x1cb958
00000000001cb937	leaq	0x71b00b(%rip), %rdi            ## literal pool for: "colorConform"
00000000001cb93e	movl	$0x1, %esi
00000000001cb943	leaq	0x72ac38(%rip), %rdx            ## literal pool for: "\tfragment %i, kCMMConversion3DLut\n"
00000000001cb94a	movq	-0x110(%rbp), %rcx
00000000001cb951	xorl	%eax, %eax
00000000001cb953	callq	__ZN8HGLogger3logEPKciS1_z      ## HGLogger::log(char const*, int, char const*, ...)
00000000001cb958	cmpb	$0x0, -0x130(%rbp)
00000000001cb95f	je	0x1cc431
00000000001cb965	testl	%r14d, %r14d
00000000001cb968	jne	0x1cc431
00000000001cb96e	movq	-0x128(%rbp), %r13
00000000001cb975	movq	0x8366ac(%rip), %rax            ## literal pool symbol address: _kColorSyncConversionInpChan
00000000001cb97c	movq	(%rax), %rsi
00000000001cb97f	movq	%r12, %rdi
00000000001cb982	leaq	-0x118(%rbp), %rdx
00000000001cb989	callq	0x3c4af0                        ## symbol stub for: _CFDictionaryGetValueIfPresent
00000000001cb98e	testb	%al, %al
00000000001cb990	je	0x1cc431
00000000001cb996	movq	-0x118(%rbp), %rdi
00000000001cb99d	movl	$0x3, %esi
00000000001cb9a2	leaq	-0x100(%rbp), %rdx
00000000001cb9a9	callq	0x3c4b08                        ## symbol stub for: _CFNumberGetValue
00000000001cb9ae	testb	%al, %al
00000000001cb9b0	je	0x1cc431
00000000001cb9b6	movq	0x83667b(%rip), %rax            ## literal pool symbol address: _kColorSyncConversionOutChan
00000000001cb9bd	movq	(%rax), %rsi
00000000001cb9c0	movq	%r12, %rdi
00000000001cb9c3	leaq	-0x138(%rbp), %rdx
00000000001cb9ca	callq	0x3c4af0                        ## symbol stub for: _CFDictionaryGetValueIfPresent
00000000001cb9cf	testb	%al, %al
00000000001cb9d1	je	0x1cc431
00000000001cb9d7	movq	-0x138(%rbp), %rdi
00000000001cb9de	movl	$0x3, %esi
00000000001cb9e3	leaq	-0xfc(%rbp), %rdx
00000000001cb9ea	callq	0x3c4b08                        ## symbol stub for: _CFNumberGetValue
00000000001cb9ef	testb	%al, %al
00000000001cb9f1	je	0x1cc431
00000000001cb9f7	cmpl	$0x3, -0x100(%rbp)
00000000001cb9fe	jne	0x1cc431
00000000001cba04	movl	$0x13, %r14d
00000000001cba0a	movl	-0xfc(%rbp), %eax
00000000001cba10	cmpl	$0x3, %eax
00000000001cba13	je	0x1cba24
00000000001cba15	cmpl	$0x4, %eax
00000000001cba18	jne	0x1cc431
00000000001cba1e	movl	$0x19, %r14d
00000000001cba24	movq	0x8365f5(%rip), %rax            ## literal pool symbol address: _kColorSyncConversionGridPoints
00000000001cba2b	movq	(%rax), %rsi
00000000001cba2e	movq	%r12, %rdi
00000000001cba31	leaq	-0x140(%rbp), %rdx
00000000001cba38	callq	0x3c4af0                        ## symbol stub for: _CFDictionaryGetValueIfPresent
00000000001cba3d	testb	%al, %al
00000000001cba3f	je	0x1cc431
00000000001cba45	movq	-0x140(%rbp), %rdi
00000000001cba4c	movl	$0x3, %esi
00000000001cba51	leaq	-0xec(%rbp), %rdx
00000000001cba58	callq	0x3c4b08                        ## symbol stub for: _CFNumberGetValue
00000000001cba5d	testb	%al, %al
00000000001cba5f	je	0x1cc431
00000000001cba65	movq	%r13, %rdi
00000000001cba68	callq	0x3c4ac0                        ## symbol stub for: _CFDataGetLength
00000000001cba6d	movq	%rax, %rbx
00000000001cba70	movl	-0xec(%rbp), %r15d
00000000001cba77	movl	%r15d, %eax
00000000001cba7a	imull	%eax, %eax
00000000001cba7d	movl	-0xfc(%rbp), %r12d
00000000001cba84	imull	%r15d, %r12d
00000000001cba88	imull	%r12d, %eax
00000000001cba8c	addq	%rax, %rax
00000000001cba8f	cmpq	%rax, %rbx
00000000001cba92	jne	0x1cc431
00000000001cba98	movl	$0x100, %edi                    ## imm = 0x100
00000000001cba9d	callq	0x3c4fb2                        ## symbol stub for: __Znwm
00000000001cbaa2	pxor	%xmm0, %xmm0
00000000001cbaa6	movdqu	%xmm0, 0xe0(%rax)
00000000001cbaae	movq	$0x0, 0xf0(%rax)
00000000001cbab9	movdqa	%xmm0, 0x10(%rax)
00000000001cbabe	movdqa	%xmm0, 0x20(%rax)
00000000001cbac3	movdqa	%xmm0, 0x30(%rax)
00000000001cbac8	movdqa	%xmm0, 0x50(%rax)
00000000001cbacd	movdqa	%xmm0, 0x60(%rax)
00000000001cbad2	movdqa	%xmm0, 0x70(%rax)
00000000001cbad7	movdqa	%xmm0, 0x80(%rax)
00000000001cbadf	movdqa	%xmm0, 0x90(%rax)
00000000001cbae7	movdqa	%xmm0, 0xa0(%rax)
00000000001cbaef	movdqa	%xmm0, 0xb0(%rax)
00000000001cbaf7	movdqa	%xmm0, 0xc0(%rax)
00000000001cbaff	movdqu	%xmm0, 0xc9(%rax)
00000000001cbb07	movq	%rax, -0xe8(%rbp)
00000000001cbb0e	movl	$0x8, (%rax)
00000000001cbb14	movl	%r14d, 0xcc(%rax)
00000000001cbb1b	addl	%r12d, %r12d
00000000001cbb1e	movl	%r12d, 0xc0(%rax)
00000000001cbb25	imull	%r15d, %r12d
00000000001cbb29	movl	%r12d, 0xc4(%rax)
00000000001cbb30	movl	%r15d, 0xc8(%rax)
00000000001cbb37	movl	$0x28, %edi
00000000001cbb3c	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
00000000001cbb41	movq	%rax, %r15
00000000001cbb44	movq	%rax, %rdi
00000000001cbb47	movq	%rbx, %rsi
00000000001cbb4a	movl	%r14d, %edx
00000000001cbb4d	callq	__ZN21HGColorConformLUTDataC1Em8HGFormat ## HGColorConformLUTData::HGColorConformLUTData(unsigned long, HGFormat)
00000000001cbb52	movq	-0xe8(%rbp), %r14
00000000001cbb59	movq	0xd0(%r14), %rdi
00000000001cbb60	cmpq	%r15, %rdi
00000000001cbb63	je	0x1cbb79
00000000001cbb65	testq	%rdi, %rdi
00000000001cbb68	je	0x1cbb70
00000000001cbb6a	movq	(%rdi), %rax
00000000001cbb6d	callq	*0x18(%rax)
00000000001cbb70	movq	%r15, 0xd0(%r14)
00000000001cbb77	jmp	0x1cbb87
00000000001cbb79	testq	%r15, %r15
00000000001cbb7c	je	0x1cbb87
00000000001cbb7e	movq	(%r15), %rax
00000000001cbb81	movq	%r15, %rdi
00000000001cbb84	callq	*0x18(%rax)
00000000001cbb87	movq	-0xe8(%rbp), %rax
00000000001cbb8e	movq	0xd0(%rax), %r14
00000000001cbb95	movq	%r13, %rdi
00000000001cbb98	callq	0x3c4aba                        ## symbol stub for: _CFDataGetBytePtr
00000000001cbb9d	cmpq	0x10(%r14), %rbx
00000000001cbba1	ja	0x1cbbb2
00000000001cbba3	movq	0x18(%r14), %rdi
00000000001cbba7	movq	%rax, %rsi
00000000001cbbaa	movq	%rbx, %rdx
00000000001cbbad	callq	0x3c5438                        ## symbol stub for: _memcpy
00000000001cbbb2	movl	-0xec(%rbp), %eax
00000000001cbbb8	movq	%rax, -0xf8(%rbp)
00000000001cbbbf	testq	%rax, %rax
00000000001cbbc2	je	0x1cbf64
00000000001cbbc8	movl	-0xfc(%rbp), %esi
00000000001cbbce	movl	%esi, %edi
00000000001cbbd0	imull	-0xf8(%rbp), %edi
00000000001cbbd7	testl	%edi, %edi
00000000001cbbd9	je	0x1cbf64
00000000001cbbdf	movq	-0xe8(%rbp), %rax
00000000001cbbe6	movq	0xd0(%rax), %rdx
00000000001cbbed	cmpq	%rdi, %rsi
00000000001cbbf0	movq	%rdi, %rax
00000000001cbbf3	cmovaq	%rsi, %rax
00000000001cbbf7	movq	0x18(%rdx), %r8
00000000001cbbfb	decq	%rax
00000000001cbbfe	movq	%rax, %rdx
00000000001cbc01	shrq	$0x20, %rdx
00000000001cbc05	je	0x1cbc0e
00000000001cbc07	xorl	%edx, %edx
00000000001cbc09	divq	%rsi
00000000001cbc0c	jmp	0x1cbc12
00000000001cbc0e	xorl	%edx, %edx
00000000001cbc10	divl	%esi
00000000001cbc12	leaq	0x1(%rax), %rdx
00000000001cbc16	cmpq	$0x1, %rdx
00000000001cbc1a	ja	0x1cbd1f
00000000001cbc20	addq	%rsi, %rsi
00000000001cbc23	leaq	(%rsi,%rsi), %r9
00000000001cbc27	addq	%rdi, %rdi
00000000001cbc2a	movq	$0x0, -0x108(%rbp)
00000000001cbc35	jmp	0x1cbc55
00000000001cbc37	movq	-0x108(%rbp), %r10
00000000001cbc3e	incq	%r10
00000000001cbc41	movq	%r10, -0x108(%rbp)
00000000001cbc48	cmpq	-0xf8(%rbp), %r10
00000000001cbc4f	je	0x1cbf64
00000000001cbc55	leaq	0x4(%r8), %r11
00000000001cbc59	xorl	%ebx, %ebx
00000000001cbc5b	jmp	0x1cbc6f
00000000001cbc5d	addq	%rdi, %r8
00000000001cbc60	incq	%rbx
00000000001cbc63	addq	%rdi, %r11
00000000001cbc66	cmpq	-0xf8(%rbp), %rbx
00000000001cbc6d	je	0x1cbc37
00000000001cbc6f	cmpq	$0x3, %rax
00000000001cbc73	jb	0x1cbced
00000000001cbc75	xorl	%r14d, %r14d
00000000001cbc78	xorl	%r15d, %r15d
00000000001cbc7b	nopl	(%rax,%rax)
00000000001cbc80	leaq	(%r8,%r15,2), %r12
00000000001cbc84	movzwl	(%r8,%r15,2), %r13d
00000000001cbc89	movzwl	0x4(%r8,%r15,2), %r10d
00000000001cbc8f	movw	%r10w, (%r8,%r15,2)
00000000001cbc94	movw	%r13w, 0x4(%r8,%r15,2)
00000000001cbc9a	leaq	(%r12,%rsi), %r10
00000000001cbc9e	movzwl	(%rsi,%r12), %r13d
00000000001cbca3	movzwl	0x4(%rsi,%r12), %ecx
00000000001cbca9	movw	%cx, (%rsi,%r12)
00000000001cbcae	movw	%r13w, 0x4(%rsi,%r12)
00000000001cbcb4	leaq	(%r10,%rsi), %rcx
00000000001cbcb8	movzwl	(%rsi,%r10), %r12d
00000000001cbcbd	movzwl	0x4(%rsi,%r10), %r13d
00000000001cbcc3	movw	%r13w, (%rsi,%r10)
00000000001cbcc8	movw	%r12w, 0x4(%rsi,%r10)
00000000001cbcce	movzwl	(%rsi,%rcx), %r10d
00000000001cbcd3	movzwl	0x4(%rsi,%rcx), %r12d
00000000001cbcd9	movw	%r12w, (%rsi,%rcx)
00000000001cbcde	movw	%r10w, 0x4(%rsi,%rcx)
00000000001cbce4	addq	%r9, %r15
00000000001cbce7	addq	$-0x4, %r14
00000000001cbceb	jne	0x1cbc80
00000000001cbced	testq	%rdx, %rdx
00000000001cbcf0	je	0x1cbc5d
00000000001cbcf6	movq	%rdx, %r14
00000000001cbcf9	movq	%r11, %r15
00000000001cbcfc	nopl	(%rax)
00000000001cbd00	movzwl	-0x4(%r15), %ecx
00000000001cbd05	movzwl	(%r15), %r10d
00000000001cbd09	movw	%r10w, -0x4(%r15)
00000000001cbd0e	movw	%cx, (%r15)
00000000001cbd12	addq	%rsi, %r15
00000000001cbd15	decq	%r14
00000000001cbd18	jne	0x1cbd00
00000000001cbd1a	jmp	0x1cbc5d
00000000001cbd1f	cmpl	$0x1, %esi
00000000001cbd22	jne	0x1cbde7
00000000001cbd28	movq	%rdx, %rax
00000000001cbd2b	andq	$-0x2, %rax
00000000001cbd2f	cmpq	%rax, %rdx
00000000001cbd32	jne	0x1cbef3
00000000001cbd38	movq	-0xf8(%rbp), %rdx
00000000001cbd3f	andl	$-0x2, %edx
00000000001cbd42	leaq	(,%rdi,4), %r9
00000000001cbd4a	shlq	$0x2, %rsi
00000000001cbd4e	leaq	(%rdi,%rdi), %r10
00000000001cbd52	xorl	%r11d, %r11d
00000000001cbd55	jmp	0x1cbd67
00000000001cbd57	incq	%r11
00000000001cbd5a	cmpq	-0xf8(%rbp), %r11
00000000001cbd61	je	0x1cbf64
00000000001cbd67	cmpl	$0x1, -0xf8(%rbp)
00000000001cbd6e	je	0x1cbdc0
00000000001cbd70	leaq	0x4(%r8), %rbx
00000000001cbd74	leaq	(%r8,%r10), %r14
00000000001cbd78	addq	$0x4, %r14
00000000001cbd7c	xorl	%r15d, %r15d
00000000001cbd7f	movq	%rbx, %r12
00000000001cbd82	movq	%rax, %r13
00000000001cbd85	rolq	$0x20, -0x4(%r12)
00000000001cbd8b	addq	%rsi, %r12
00000000001cbd8e	addq	$-0x2, %r13
00000000001cbd92	jne	0x1cbd85
00000000001cbd94	leaq	(%r8,%rdi,2), %r8
00000000001cbd98	movq	%r14, %r12
00000000001cbd9b	movq	%rax, %r13
00000000001cbd9e	rolq	$0x20, -0x4(%r12)
00000000001cbda4	addq	%rsi, %r12
00000000001cbda7	addq	$-0x2, %r13
00000000001cbdab	jne	0x1cbd9e
00000000001cbdad	leaq	(%r8,%rdi,2), %r8
00000000001cbdb1	addq	$0x2, %r15
00000000001cbdb5	addq	%r9, %rbx
00000000001cbdb8	addq	%r9, %r14
00000000001cbdbb	cmpq	%rdx, %r15
00000000001cbdbe	jne	0x1cbd7f
00000000001cbdc0	testb	$0x1, -0xf8(%rbp)
00000000001cbdc7	je	0x1cbd57
00000000001cbdc9	leaq	0x4(%r8), %rbx
00000000001cbdcd	movq	%rax, %r14
00000000001cbdd0	rolq	$0x20, -0x4(%rbx)
00000000001cbdd5	addq	%rsi, %rbx
00000000001cbdd8	addq	$-0x2, %r14
00000000001cbddc	jne	0x1cbdd0
00000000001cbdde	leaq	(%r8,%rdi,2), %r8
00000000001cbde2	jmp	0x1cbd57
00000000001cbde7	movl	%edx, %r9d
00000000001cbdea	andl	$0x3, %r9d
00000000001cbdee	andq	$-0x4, %rdx
00000000001cbdf2	addq	%rsi, %rsi
00000000001cbdf5	leaq	(%rsi,%rsi), %r10
00000000001cbdf9	addq	%rdi, %rdi
00000000001cbdfc	movq	$0x0, -0x108(%rbp)
00000000001cbe07	jmp	0x1cbe27
00000000001cbe09	movq	-0x108(%rbp), %r11
00000000001cbe10	incq	%r11
00000000001cbe13	movq	%r11, -0x108(%rbp)
00000000001cbe1a	cmpq	-0xf8(%rbp), %r11
00000000001cbe21	je	0x1cbf64
00000000001cbe27	xorl	%ebx, %ebx
00000000001cbe29	jmp	0x1cbe3a
00000000001cbe2b	addq	%rdi, %r8
00000000001cbe2e	incq	%rbx
00000000001cbe31	cmpq	-0xf8(%rbp), %rbx
00000000001cbe38	je	0x1cbe09
00000000001cbe3a	cmpq	$0x3, %rax
00000000001cbe3e	jae	0x1cbe45
00000000001cbe40	xorl	%r14d, %r14d
00000000001cbe43	jmp	0x1cbeb8
00000000001cbe45	movq	%rdx, %r15
00000000001cbe48	xorl	%r14d, %r14d
00000000001cbe4b	leaq	(%r8,%r14,2), %rcx
00000000001cbe4f	movzwl	(%r8,%r14,2), %r12d
00000000001cbe54	movzwl	0x4(%r8,%r14,2), %r13d
00000000001cbe5a	movw	%r13w, (%r8,%r14,2)
00000000001cbe5f	movw	%r12w, 0x4(%r8,%r14,2)
00000000001cbe65	leaq	(%rcx,%rsi), %r12
00000000001cbe69	movzwl	(%rsi,%rcx), %r13d
00000000001cbe6e	movzwl	0x4(%rsi,%rcx), %r11d
00000000001cbe74	movw	%r11w, (%rsi,%rcx)
00000000001cbe79	movw	%r13w, 0x4(%rsi,%rcx)
00000000001cbe7f	leaq	(%r12,%rsi), %rcx
00000000001cbe83	movzwl	(%rsi,%r12), %r11d
00000000001cbe88	movzwl	0x4(%rsi,%r12), %r13d
00000000001cbe8e	movw	%r13w, (%rsi,%r12)
00000000001cbe93	movw	%r11w, 0x4(%rsi,%r12)
00000000001cbe99	movzwl	(%rsi,%rcx), %r11d
00000000001cbe9e	movzwl	0x4(%rsi,%rcx), %r12d
00000000001cbea4	movw	%r12w, (%rsi,%rcx)
00000000001cbea9	movw	%r11w, 0x4(%rsi,%rcx)
00000000001cbeaf	addq	%r10, %r14
00000000001cbeb2	addq	$-0x4, %r15
00000000001cbeb6	jne	0x1cbe4b
00000000001cbeb8	testq	%r9, %r9
00000000001cbebb	je	0x1cbe2b
00000000001cbec1	addq	%r14, %r14
00000000001cbec4	movq	%r9, %r15
00000000001cbec7	nopw	(%rax,%rax)
00000000001cbed0	movzwl	(%r8,%r14), %ecx
00000000001cbed5	movzwl	0x4(%r8,%r14), %r11d
00000000001cbedb	movw	%r11w, (%r8,%r14)
00000000001cbee0	movw	%cx, 0x4(%r8,%r14)
00000000001cbee6	addq	%rsi, %r14
00000000001cbee9	decq	%r15
00000000001cbeec	jne	0x1cbed0
00000000001cbeee	jmp	0x1cbe2b
00000000001cbef3	movq	%rax, %rdx
00000000001cbef6	imulq	%rsi, %rdx
00000000001cbefa	leaq	(%rdi,%rdi), %r9
00000000001cbefe	leaq	(,%rsi,4), %r10
00000000001cbf06	xorl	%r11d, %r11d
00000000001cbf09	leaq	0x4(%r8), %rbx
00000000001cbf0d	xorl	%r14d, %r14d
00000000001cbf10	movq	%rbx, %r15
00000000001cbf13	movq	%rax, %r12
00000000001cbf16	rolq	$0x20, -0x4(%r15)
00000000001cbf1b	addq	%r10, %r15
00000000001cbf1e	addq	$-0x2, %r12
00000000001cbf22	jne	0x1cbf16
00000000001cbf24	movq	%rdx, %r15
00000000001cbf27	movzwl	(%r8,%r15,2), %ecx
00000000001cbf2c	movzwl	0x4(%r8,%r15,2), %r12d
00000000001cbf32	movw	%r12w, (%r8,%r15,2)
00000000001cbf37	movw	%cx, 0x4(%r8,%r15,2)
00000000001cbf3d	addq	%rsi, %r15
00000000001cbf40	cmpq	%rdi, %r15
00000000001cbf43	jb	0x1cbf27
00000000001cbf45	leaq	(%r8,%rdi,2), %r8
00000000001cbf49	incq	%r14
00000000001cbf4c	addq	%r9, %rbx
00000000001cbf4f	cmpq	-0xf8(%rbp), %r14
00000000001cbf56	jne	0x1cbf10
00000000001cbf58	incq	%r11
00000000001cbf5b	cmpq	-0xf8(%rbp), %r11
00000000001cbf62	jne	0x1cbf09
00000000001cbf64	movq	-0x170(%rbp), %rdi
00000000001cbf6b	callq	0x3c4d9c                        ## symbol stub for: _ColorSyncProfileGetMD5
00000000001cbf70	movq	%rax, -0xd0(%rbp)
00000000001cbf77	movq	%rdx, -0xc8(%rbp)
00000000001cbf7e	movq	-0x168(%rbp), %rdi
00000000001cbf85	callq	0x3c4d9c                        ## symbol stub for: _ColorSyncProfileGetMD5
00000000001cbf8a	movq	%rax, -0xe0(%rbp)
00000000001cbf91	movq	%rdx, -0xd8(%rbp)
00000000001cbf98	movq	-0xe8(%rbp), %rdi
00000000001cbf9f	movl	$0xe0, %eax
00000000001cbfa4	addq	%rax, %rdi
00000000001cbfa7	leaq	-0xd0(%rbp), %rsi
00000000001cbfae	callq	__ZNSt3__16vectorIhNS_9allocatorIhEEE9push_backB9nqe210106ERKh ## std::__1::vector<unsigned char, std::__1::allocator<unsigned char>>::push_back[abi:nqe210106](unsigned char const&)
00000000001cbfb3	movq	-0xe8(%rbp), %rdi
00000000001cbfba	movl	$0xe0, %eax
00000000001cbfbf	addq	%rax, %rdi
00000000001cbfc2	leaq	-0xcf(%rbp), %rsi
00000000001cbfc9	callq	__ZNSt3__16vectorIhNS_9allocatorIhEEE9push_backB9nqe210106ERKh ## std::__1::vector<unsigned char, std::__1::allocator<unsigned char>>::push_back[abi:nqe210106](unsigned char const&)
00000000001cbfce	movq	-0xe8(%rbp), %rdi
00000000001cbfd5	movl	$0xe0, %eax
00000000001cbfda	addq	%rax, %rdi
00000000001cbfdd	leaq	-0xce(%rbp), %rsi
00000000001cbfe4	callq	__ZNSt3__16vectorIhNS_9allocatorIhEEE9push_backB9nqe210106ERKh ## std::__1::vector<unsigned char, std::__1::allocator<unsigned char>>::push_back[abi:nqe210106](unsigned char const&)
00000000001cbfe9	movq	-0xe8(%rbp), %rdi
00000000001cbff0	movl	$0xe0, %eax
00000000001cbff5	addq	%rax, %rdi
00000000001cbff8	leaq	-0xcd(%rbp), %rsi
00000000001cbfff	callq	__ZNSt3__16vectorIhNS_9allocatorIhEEE9push_backB9nqe210106ERKh ## std::__1::vector<unsigned char, std::__1::allocator<unsigned char>>::push_back[abi:nqe210106](unsigned char const&)
00000000001cc004	movq	-0xe8(%rbp), %rdi
00000000001cc00b	movl	$0xe0, %eax
00000000001cc010	addq	%rax, %rdi
00000000001cc013	leaq	-0xcc(%rbp), %rsi
00000000001cc01a	callq	__ZNSt3__16vectorIhNS_9allocatorIhEEE9push_backB9nqe210106ERKh ## std::__1::vector<unsigned char, std::__1::allocator<unsigned char>>::push_back[abi:nqe210106](unsigned char const&)
00000000001cc01f	movq	-0xe8(%rbp), %rdi
00000000001cc026	movl	$0xe0, %eax
00000000001cc02b	addq	%rax, %rdi
00000000001cc02e	leaq	-0xcb(%rbp), %rsi
00000000001cc035	callq	__ZNSt3__16vectorIhNS_9allocatorIhEEE9push_backB9nqe210106ERKh ## std::__1::vector<unsigned char, std::__1::allocator<unsigned char>>::push_back[abi:nqe210106](unsigned char const&)
00000000001cc03a	movq	-0xe8(%rbp), %rdi
00000000001cc041	movl	$0xe0, %eax
00000000001cc046	addq	%rax, %rdi
00000000001cc049	leaq	-0xca(%rbp), %rsi
00000000001cc050	callq	__ZNSt3__16vectorIhNS_9allocatorIhEEE9push_backB9nqe210106ERKh ## std::__1::vector<unsigned char, std::__1::allocator<unsigned char>>::push_back[abi:nqe210106](unsigned char const&)
00000000001cc055	movq	-0xe8(%rbp), %rdi
00000000001cc05c	movl	$0xe0, %eax
00000000001cc061	addq	%rax, %rdi
00000000001cc064	leaq	-0xc9(%rbp), %rsi
00000000001cc06b	callq	__ZNSt3__16vectorIhNS_9allocatorIhEEE9push_backB9nqe210106ERKh ## std::__1::vector<unsigned char, std::__1::allocator<unsigned char>>::push_back[abi:nqe210106](unsigned char const&)
00000000001cc070	movq	-0xe8(%rbp), %rdi
00000000001cc077	movl	$0xe0, %eax
00000000001cc07c	addq	%rax, %rdi
00000000001cc07f	leaq	-0xc8(%rbp), %rsi
00000000001cc086	callq	__ZNSt3__16vectorIhNS_9allocatorIhEEE9push_backB9nqe210106ERKh ## std::__1::vector<unsigned char, std::__1::allocator<unsigned char>>::push_back[abi:nqe210106](unsigned char const&)
00000000001cc08b	movq	-0xe8(%rbp), %rdi
00000000001cc092	movl	$0xe0, %eax
00000000001cc097	addq	%rax, %rdi
00000000001cc09a	leaq	-0xc7(%rbp), %rsi
00000000001cc0a1	callq	__ZNSt3__16vectorIhNS_9allocatorIhEEE9push_backB9nqe210106ERKh ## std::__1::vector<unsigned char, std::__1::allocator<unsigned char>>::push_back[abi:nqe210106](unsigned char const&)
00000000001cc0a6	movq	-0xe8(%rbp), %rdi
00000000001cc0ad	movl	$0xe0, %eax
00000000001cc0b2	addq	%rax, %rdi
00000000001cc0b5	leaq	-0xc6(%rbp), %rsi
00000000001cc0bc	callq	__ZNSt3__16vectorIhNS_9allocatorIhEEE9push_backB9nqe210106ERKh ## std::__1::vector<unsigned char, std::__1::allocator<unsigned char>>::push_back[abi:nqe210106](unsigned char const&)
00000000001cc0c1	movq	-0xe8(%rbp), %rdi
00000000001cc0c8	movl	$0xe0, %eax
00000000001cc0cd	addq	%rax, %rdi
00000000001cc0d0	leaq	-0xc5(%rbp), %rsi
00000000001cc0d7	callq	__ZNSt3__16vectorIhNS_9allocatorIhEEE9push_backB9nqe210106ERKh ## std::__1::vector<unsigned char, std::__1::allocator<unsigned char>>::push_back[abi:nqe210106](unsigned char const&)
00000000001cc0dc	movq	-0xe8(%rbp), %rdi
00000000001cc0e3	movl	$0xe0, %eax
00000000001cc0e8	addq	%rax, %rdi
00000000001cc0eb	leaq	-0xc4(%rbp), %rsi
00000000001cc0f2	callq	__ZNSt3__16vectorIhNS_9allocatorIhEEE9push_backB9nqe210106ERKh ## std::__1::vector<unsigned char, std::__1::allocator<unsigned char>>::push_back[abi:nqe210106](unsigned char const&)
00000000001cc0f7	movq	-0xe8(%rbp), %rdi
00000000001cc0fe	movl	$0xe0, %eax
00000000001cc103	addq	%rax, %rdi
00000000001cc106	leaq	-0xc3(%rbp), %rsi
00000000001cc10d	callq	__ZNSt3__16vectorIhNS_9allocatorIhEEE9push_backB9nqe210106ERKh ## std::__1::vector<unsigned char, std::__1::allocator<unsigned char>>::push_back[abi:nqe210106](unsigned char const&)
00000000001cc112	movq	-0xe8(%rbp), %rdi
00000000001cc119	movl	$0xe0, %eax
00000000001cc11e	addq	%rax, %rdi
00000000001cc121	leaq	-0xc2(%rbp), %rsi
00000000001cc128	callq	__ZNSt3__16vectorIhNS_9allocatorIhEEE9push_backB9nqe210106ERKh ## std::__1::vector<unsigned char, std::__1::allocator<unsigned char>>::push_back[abi:nqe210106](unsigned char const&)
00000000001cc12d	movq	-0xe8(%rbp), %rdi
00000000001cc134	movl	$0xe0, %eax
00000000001cc139	addq	%rax, %rdi
00000000001cc13c	leaq	-0xc1(%rbp), %rsi
00000000001cc143	callq	__ZNSt3__16vectorIhNS_9allocatorIhEEE9push_backB9nqe210106ERKh ## std::__1::vector<unsigned char, std::__1::allocator<unsigned char>>::push_back[abi:nqe210106](unsigned char const&)
00000000001cc148	movq	-0xe8(%rbp), %rdi
00000000001cc14f	movl	$0xe0, %eax
00000000001cc154	addq	%rax, %rdi
00000000001cc157	leaq	-0xe0(%rbp), %rsi
00000000001cc15e	callq	__ZNSt3__16vectorIhNS_9allocatorIhEEE9push_backB9nqe210106ERKh ## std::__1::vector<unsigned char, std::__1::allocator<unsigned char>>::push_back[abi:nqe210106](unsigned char const&)
00000000001cc163	movq	-0xe8(%rbp), %rdi
00000000001cc16a	movl	$0xe0, %eax
00000000001cc16f	addq	%rax, %rdi
00000000001cc172	leaq	-0xdf(%rbp), %rsi
00000000001cc179	callq	__ZNSt3__16vectorIhNS_9allocatorIhEEE9push_backB9nqe210106ERKh ## std::__1::vector<unsigned char, std::__1::allocator<unsigned char>>::push_back[abi:nqe210106](unsigned char const&)
00000000001cc17e	movq	-0xe8(%rbp), %rdi
00000000001cc185	movl	$0xe0, %eax
00000000001cc18a	addq	%rax, %rdi
00000000001cc18d	leaq	-0xde(%rbp), %rsi
00000000001cc194	callq	__ZNSt3__16vectorIhNS_9allocatorIhEEE9push_backB9nqe210106ERKh ## std::__1::vector<unsigned char, std::__1::allocator<unsigned char>>::push_back[abi:nqe210106](unsigned char const&)
00000000001cc199	movq	-0xe8(%rbp), %rdi
00000000001cc1a0	movl	$0xe0, %eax
00000000001cc1a5	addq	%rax, %rdi
00000000001cc1a8	leaq	-0xdd(%rbp), %rsi
00000000001cc1af	callq	__ZNSt3__16vectorIhNS_9allocatorIhEEE9push_backB9nqe210106ERKh ## std::__1::vector<unsigned char, std::__1::allocator<unsigned char>>::push_back[abi:nqe210106](unsigned char const&)
00000000001cc1b4	movq	-0xe8(%rbp), %rdi
00000000001cc1bb	movl	$0xe0, %eax
00000000001cc1c0	addq	%rax, %rdi
00000000001cc1c3	leaq	-0xdc(%rbp), %rsi
00000000001cc1ca	callq	__ZNSt3__16vectorIhNS_9allocatorIhEEE9push_backB9nqe210106ERKh ## std::__1::vector<unsigned char, std::__1::allocator<unsigned char>>::push_back[abi:nqe210106](unsigned char const&)
00000000001cc1cf	movq	-0xe8(%rbp), %rdi
00000000001cc1d6	movl	$0xe0, %eax
00000000001cc1db	addq	%rax, %rdi
00000000001cc1de	leaq	-0xdb(%rbp), %rsi
00000000001cc1e5	callq	__ZNSt3__16vectorIhNS_9allocatorIhEEE9push_backB9nqe210106ERKh ## std::__1::vector<unsigned char, std::__1::allocator<unsigned char>>::push_back[abi:nqe210106](unsigned char const&)
00000000001cc1ea	movq	-0xe8(%rbp), %rdi
00000000001cc1f1	movl	$0xe0, %eax
00000000001cc1f6	addq	%rax, %rdi
00000000001cc1f9	leaq	-0xda(%rbp), %rsi
00000000001cc200	callq	__ZNSt3__16vectorIhNS_9allocatorIhEEE9push_backB9nqe210106ERKh ## std::__1::vector<unsigned char, std::__1::allocator<unsigned char>>::push_back[abi:nqe210106](unsigned char const&)
00000000001cc205	movq	-0xe8(%rbp), %rdi
00000000001cc20c	movl	$0xe0, %eax
00000000001cc211	addq	%rax, %rdi
00000000001cc214	leaq	-0xd9(%rbp), %rsi
00000000001cc21b	callq	__ZNSt3__16vectorIhNS_9allocatorIhEEE9push_backB9nqe210106ERKh ## std::__1::vector<unsigned char, std::__1::allocator<unsigned char>>::push_back[abi:nqe210106](unsigned char const&)
00000000001cc220	movq	-0xe8(%rbp), %rdi
00000000001cc227	movl	$0xe0, %eax
00000000001cc22c	addq	%rax, %rdi
00000000001cc22f	leaq	-0xd8(%rbp), %rsi
00000000001cc236	callq	__ZNSt3__16vectorIhNS_9allocatorIhEEE9push_backB9nqe210106ERKh ## std::__1::vector<unsigned char, std::__1::allocator<unsigned char>>::push_back[abi:nqe210106](unsigned char const&)
00000000001cc23b	movq	-0xe8(%rbp), %rdi
00000000001cc242	movl	$0xe0, %eax
00000000001cc247	addq	%rax, %rdi
00000000001cc24a	leaq	-0xd7(%rbp), %rsi
00000000001cc251	callq	__ZNSt3__16vectorIhNS_9allocatorIhEEE9push_backB9nqe210106ERKh ## std::__1::vector<unsigned char, std::__1::allocator<unsigned char>>::push_back[abi:nqe210106](unsigned char const&)
00000000001cc256	movq	-0xe8(%rbp), %rdi
00000000001cc25d	movl	$0xe0, %eax
00000000001cc262	addq	%rax, %rdi
00000000001cc265	leaq	-0xd6(%rbp), %rsi
00000000001cc26c	callq	__ZNSt3__16vectorIhNS_9allocatorIhEEE9push_backB9nqe210106ERKh ## std::__1::vector<unsigned char, std::__1::allocator<unsigned char>>::push_back[abi:nqe210106](unsigned char const&)
00000000001cc271	movq	-0xe8(%rbp), %rdi
00000000001cc278	movl	$0xe0, %eax
00000000001cc27d	addq	%rax, %rdi
00000000001cc280	leaq	-0xd5(%rbp), %rsi
00000000001cc287	callq	__ZNSt3__16vectorIhNS_9allocatorIhEEE9push_backB9nqe210106ERKh ## std::__1::vector<unsigned char, std::__1::allocator<unsigned char>>::push_back[abi:nqe210106](unsigned char const&)
00000000001cc28c	movq	-0xe8(%rbp), %rdi
00000000001cc293	movl	$0xe0, %eax
00000000001cc298	addq	%rax, %rdi
00000000001cc29b	leaq	-0xd4(%rbp), %rsi
00000000001cc2a2	callq	__ZNSt3__16vectorIhNS_9allocatorIhEEE9push_backB9nqe210106ERKh ## std::__1::vector<unsigned char, std::__1::allocator<unsigned char>>::push_back[abi:nqe210106](unsigned char const&)
00000000001cc2a7	movq	-0xe8(%rbp), %rdi
00000000001cc2ae	movl	$0xe0, %eax
00000000001cc2b3	addq	%rax, %rdi
00000000001cc2b6	leaq	-0xd3(%rbp), %rsi
00000000001cc2bd	callq	__ZNSt3__16vectorIhNS_9allocatorIhEEE9push_backB9nqe210106ERKh ## std::__1::vector<unsigned char, std::__1::allocator<unsigned char>>::push_back[abi:nqe210106](unsigned char const&)
00000000001cc2c2	movq	-0xe8(%rbp), %rdi
00000000001cc2c9	movl	$0xe0, %eax
00000000001cc2ce	addq	%rax, %rdi
00000000001cc2d1	leaq	-0xd2(%rbp), %rsi
00000000001cc2d8	callq	__ZNSt3__16vectorIhNS_9allocatorIhEEE9push_backB9nqe210106ERKh ## std::__1::vector<unsigned char, std::__1::allocator<unsigned char>>::push_back[abi:nqe210106](unsigned char const&)
00000000001cc2dd	movq	-0xe8(%rbp), %rdi
00000000001cc2e4	movl	$0xe0, %eax
00000000001cc2e9	addq	%rax, %rdi
00000000001cc2ec	leaq	-0xd1(%rbp), %rsi
00000000001cc2f3	callq	__ZNSt3__16vectorIhNS_9allocatorIhEEE9push_backB9nqe210106ERKh ## std::__1::vector<unsigned char, std::__1::allocator<unsigned char>>::push_back[abi:nqe210106](unsigned char const&)
00000000001cc2f8	movq	-0xe8(%rbp), %rdi
00000000001cc2ff	movl	$0xe0, %eax
00000000001cc304	addq	%rax, %rdi
00000000001cc307	movq	-0x110(%rbp), %rax
00000000001cc30e	movb	%al, -0x12c(%rbp)
00000000001cc314	leaq	-0x12c(%rbp), %rsi
00000000001cc31b	callq	__ZNSt3__16vectorIhNS_9allocatorIhEEE9push_backB9nqe210106ERKh ## std::__1::vector<unsigned char, std::__1::allocator<unsigned char>>::push_back[abi:nqe210106](unsigned char const&)
00000000001cc320	movq	-0x148(%rbp), %rdi
00000000001cc327	leaq	-0xe8(%rbp), %rsi
00000000001cc32e	callq	__ZNSt3__16vectorIP26HGColorConformNodeListItemNS_9allocatorIS2_EEE9push_backB9nqe210106ERKS2_ ## std::__1::vector<HGColorConformNodeListItem*, std::__1::allocator<HGColorConformNodeListItem*>>::push_back[abi:nqe210106](HGColorConformNodeListItem* const&)
00000000001cc333	movq	$0x0, -0xe8(%rbp)
00000000001cc33e	leaq	__ZN8HGLogger8_enabledE(%rip), %rax ## HGLogger::_enabled
00000000001cc345	movzbl	(%rax), %eax
00000000001cc348	cmpb	$0x1, %al
00000000001cc34a	jne	0x1cc373
00000000001cc34c	movl	-0x100(%rbp), %ecx
00000000001cc352	movl	-0xfc(%rbp), %r8d
00000000001cc359	leaq	0x71a5e9(%rip), %rdi            ## literal pool for: "colorConform"
00000000001cc360	movl	$0x1, %esi
00000000001cc365	leaq	0x72a239(%rip), %rdx            ## literal pool for: "\t\tnumChannelsIn = %i, numChannelsOut = %i"
00000000001cc36c	xorl	%eax, %eax
00000000001cc36e	callq	__ZN8HGLogger3logEPKciS1_z      ## HGLogger::log(char const*, int, char const*, ...)
00000000001cc373	leaq	__ZN8HGLogger8_enabledE(%rip), %rax ## HGLogger::_enabled
00000000001cc37a	movzbl	(%rax), %eax
00000000001cc37d	cmpb	$0x1, %al
00000000001cc37f	jne	0x1cc3a1
00000000001cc381	movl	-0xec(%rbp), %ecx
00000000001cc387	leaq	0x71a5bb(%rip), %rdi            ## literal pool for: "colorConform"
00000000001cc38e	movl	$0x1, %esi
00000000001cc393	leaq	0x72a235(%rip), %rdx            ## literal pool for: "\t\tnumGridPoints = %i\n"
00000000001cc39a	xorl	%eax, %eax
00000000001cc39c	callq	__ZN8HGLogger3logEPKciS1_z      ## HGLogger::log(char const*, int, char const*, ...)
00000000001cc3a1	xorl	%r14d, %r14d
00000000001cc3a4	jmp	0x1cb8c8
00000000001cc3a9	leaq	__ZN8HGLogger8_enabledE(%rip), %rax ## HGLogger::_enabled
00000000001cc3b0	movzbl	(%rax), %eax
00000000001cc3b3	cmpb	$0x1, %al
00000000001cc3b5	jne	0x1cc407
00000000001cc3b7	leaq	0x71a58b(%rip), %rdi            ## literal pool for: "colorConform"
00000000001cc3be	leaq	0x729f83(%rip), %rdx            ## literal pool for: "HGColorConform finished processing ColorSync fragment list: FAILURE (ColorSyncTransformCopyProperty).\n"
00000000001cc3c5	movl	$0x1, %esi
00000000001cc3ca	xorl	%eax, %eax
00000000001cc3cc	callq	__ZN8HGLogger3logEPKciS1_z      ## HGLogger::log(char const*, int, char const*, ...)
00000000001cc3d1	jmp	0x1cc407
00000000001cc3d3	movq	-0x120(%rbp), %rdi
00000000001cc3da	callq	0x3c4b1a                        ## symbol stub for: _CFRelease
00000000001cc3df	leaq	__ZN8HGLogger8_enabledE(%rip), %rax ## HGLogger::_enabled
00000000001cc3e6	movzbl	(%rax), %eax
00000000001cc3e9	cmpb	$0x1, %al
00000000001cc3eb	jne	0x1cc407
00000000001cc3ed	leaq	0x71a555(%rip), %rdi            ## literal pool for: "colorConform"
00000000001cc3f4	leaq	0x729fb4(%rip), %rdx            ## literal pool for: "HGColorConform finished processing ColorSync fragment list: FAILURE (0 fragments).\n"
00000000001cc3fb	movl	$0x1, %esi
00000000001cc400	xorl	%eax, %eax
00000000001cc402	callq	__ZN8HGLogger3logEPKciS1_z      ## HGLogger::log(char const*, int, char const*, ...)
00000000001cc407	xorl	%ebx, %ebx
00000000001cc409	movq	0x835e48(%rip), %rax            ## literal pool symbol address: ___stack_chk_guard
00000000001cc410	movq	(%rax), %rax
00000000001cc413	cmpq	-0x30(%rbp), %rax
00000000001cc417	jne	0x1cc52a
00000000001cc41d	movl	%ebx, %eax
00000000001cc41f	addq	$0x188, %rsp                    ## imm = 0x188
00000000001cc426	popq	%rbx
00000000001cc427	popq	%r12
00000000001cc429	popq	%r13
00000000001cc42b	popq	%r14
00000000001cc42d	popq	%r15
00000000001cc42f	popq	%rbp
00000000001cc430	retq
00000000001cc431	movq	-0x120(%rbp), %rdi
00000000001cc438	callq	0x3c4b1a                        ## symbol stub for: _CFRelease
00000000001cc43d	movq	-0xe8(%rbp), %rbx
00000000001cc444	testq	%rbx, %rbx
00000000001cc447	je	0x1cc47b
00000000001cc449	movq	0xe0(%rbx), %rdi
00000000001cc450	testq	%rdi, %rdi
00000000001cc453	je	0x1cc461
00000000001cc455	movq	%rdi, 0xe8(%rbx)
00000000001cc45c	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
00000000001cc461	movq	0xd0(%rbx), %rdi
00000000001cc468	testq	%rdi, %rdi
00000000001cc46b	je	0x1cc473
00000000001cc46d	movq	(%rdi), %rax
00000000001cc470	callq	*0x18(%rax)
00000000001cc473	movq	%rbx, %rdi
00000000001cc476	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
00000000001cc47b	leaq	-0x148(%rbp), %rdi
00000000001cc482	callq	__ZN14HGColorConform14DeleteNodeListEPPNSt3__16vectorIP26HGColorConformNodeListItemNS0_9allocatorIS3_EEEE ## HGColorConform::DeleteNodeList(std::__1::vector<HGColorConformNodeListItem*, std::__1::allocator<HGColorConformNodeListItem*>>**)
00000000001cc487	movq	-0x178(%rbp), %rax
00000000001cc48e	movq	$0x0, (%rax)
00000000001cc495	leaq	__ZN8HGLogger8_enabledE(%rip), %rax ## HGLogger::_enabled
00000000001cc49c	movzbl	(%rax), %eax
00000000001cc49f	xorl	%ebx, %ebx
00000000001cc4a1	cmpb	$0x1, %al
00000000001cc4a3	jne	0x1cc409
00000000001cc4a9	leaq	0x72a17b(%rip), %rdx            ## literal pool for: "HGColorConform finished processing ColorSync fragment list: FAILURE.\n"
00000000001cc4b0	jmp	0x1cc4fd
00000000001cc4b2	movq	-0x120(%rbp), %rdi
00000000001cc4b9	callq	0x3c4b1a                        ## symbol stub for: _CFRelease
00000000001cc4be	movq	-0x148(%rbp), %rdx
00000000001cc4c5	movq	-0x170(%rbp), %rdi
00000000001cc4cc	movq	-0x168(%rbp), %rsi
00000000001cc4d3	callq	__ZN14HGColorConform18AddNodeListToCacheEPK16ColorSyncProfileS2_PNSt3__16vectorIP26HGColorConformNodeListItemNS3_9allocatorIS6_EEEE ## HGColorConform::AddNodeListToCache(ColorSyncProfile const*, ColorSyncProfile const*, std::__1::vector<HGColorConformNodeListItem*, std::__1::allocator<HGColorConformNodeListItem*>>*)
00000000001cc4d8	movq	-0x178(%rbp), %rcx
00000000001cc4df	movq	%rax, (%rcx)
00000000001cc4e2	leaq	__ZN8HGLogger8_enabledE(%rip), %rax ## HGLogger::_enabled
00000000001cc4e9	movzbl	(%rax), %eax
00000000001cc4ec	movb	$0x1, %bl
00000000001cc4ee	testb	%al, %al
00000000001cc4f0	je	0x1cc409
00000000001cc4f6	leaq	0x72a0e8(%rip), %rdx            ## literal pool for: "HGColorConform finished processing ColorSync fragment list: SUCCESS.\n"
00000000001cc4fd	leaq	0x71a445(%rip), %rdi            ## literal pool for: "colorConform"
00000000001cc504	movl	$0x1, %esi
00000000001cc509	xorl	%eax, %eax
00000000001cc50b	callq	__ZN8HGLogger3logEPKciS1_z      ## HGLogger::log(char const*, int, char const*, ...)
00000000001cc510	jmp	0x1cc409
00000000001cc515	testl	%r14d, %r14d
00000000001cc518	sete	%bl
00000000001cc51b	callq	0x3c4b1a                        ## symbol stub for: _CFRelease
00000000001cc520	testb	%bl, %bl
00000000001cc522	je	0x1cc43d
00000000001cc528	jmp	0x1cc4be
00000000001cc52a	callq	0x3c5030                        ## symbol stub for: ___stack_chk_fail
00000000001cc52f	callq	__ZNSt3__16vectorIhNS_9allocatorIhEEE20__throw_length_errorB9nqe210106Ev ## std::__1::vector<unsigned char, std::__1::allocator<unsigned char>>::__throw_length_error[abi:nqe210106]()
00000000001cc534	jmp	0x1cc53b
00000000001cc536	callq	__ZNSt3__16vectorIhNS_9allocatorIhEEE20__throw_length_errorB9nqe210106Ev ## std::__1::vector<unsigned char, std::__1::allocator<unsigned char>>::__throw_length_error[abi:nqe210106]()
00000000001cc53b	ud2
00000000001cc53d	movq	%rax, %rbx
00000000001cc540	testq	%r15, %r15
00000000001cc543	je	0x1cc5a3
00000000001cc545	movq	(%r15), %rax
00000000001cc548	movq	%r15, %rdi
00000000001cc54b	callq	*0x18(%rax)
00000000001cc54e	jmp	0x1cc5a3
00000000001cc550	jmp	0x1cc591
00000000001cc552	jmp	0x1cc591
00000000001cc554	movq	%rax, %rbx
00000000001cc557	movq	%r15, %rdi
00000000001cc55a	callq	__ZN8HGObjectdlEPv              ## HGObject::operator delete(void*)
00000000001cc55f	movq	%rbx, %rdi
00000000001cc562	callq	0x3c4e02                        ## symbol stub for: __Unwind_Resume
00000000001cc567	jmp	0x1cc591
00000000001cc569	movq	%rax, %rbx
00000000001cc56c	testq	%r14, %r14
00000000001cc56f	je	0x1cc5a3
00000000001cc571	movq	(%r14), %rax
00000000001cc574	movq	%r14, %rdi
00000000001cc577	callq	*0x18(%rax)
00000000001cc57a	jmp	0x1cc5a3
00000000001cc57c	jmp	0x1cc591
00000000001cc57e	movq	%rax, %rbx
00000000001cc581	movq	%r14, %rdi
00000000001cc584	callq	__ZN8HGObjectdlEPv              ## HGObject::operator delete(void*)
00000000001cc589	movq	%rbx, %rdi
00000000001cc58c	callq	0x3c4e02                        ## symbol stub for: __Unwind_Resume
00000000001cc591	movq	%rax, %rbx
00000000001cc594	testl	%edx, %edx
00000000001cc596	je	0x1cc5a3
00000000001cc598	movq	%rbx, %rdi
00000000001cc59b	callq	___clang_call_terminate
00000000001cc5a0	movq	%rax, %rbx
00000000001cc5a3	movq	%rbx, %rdi
00000000001cc5a6	callq	0x3c4e02                        ## symbol stub for: __Unwind_Resume
00000000001cc5ab	nop
00000000001cc5ac	shrl	%ecx
00000000001cc5ae	.byte 0xff #bad opcode
00000000001cc5af	jmpq	*(%rax)
00000000001cc5b1	.byte 0xea #bad opcode
00000000001cc5b2	.byte 0xff #bad opcode
00000000001cc5b3	pushq	%rcx
00000000001cc5b5	jmp	0xffffffffea22c5b9
00000000001cc5ba	.byte 0xff #bad opcode
00000000001cc5bb	jmpq	*%rcx
00000000001cc5bd	jmp	0xffffffffea59c5c1
00000000001cc5c2	.byte 0xff #bad opcode
00000000001cc5c3	decl	-0x1(%rdx,%rbp,8)
00000000001cc5c7	decl	(%rdi)
00000000001cc5c9	.byte 0x1f #bad opcode
00000000001cc5ca	testb	%al, (%rax)
00000000001cc5cc	addb	%al, (%rax)
00000000001cc5ce	addb	%al, (%rax)
