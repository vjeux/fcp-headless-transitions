__ZN23FFPlaybackMemoryMonitorC2Ev:
0000000000da5910	pushq	%rbp
0000000000da5911	movq	%rsp, %rbp
0000000000da5914	pushq	%r15
0000000000da5916	pushq	%r14
0000000000da5918	pushq	%rbx
0000000000da5919	subq	$0x38, %rsp
0000000000da591d	movq	%rdi, %rbx
0000000000da5920	xorps	%xmm0, %xmm0
0000000000da5923	movups	%xmm0, (%rdi)
0000000000da5926	movl	$0x1, %edi
0000000000da592b	callq	__ZN23FFMemoryPressureTracker24getCurrentRawMemoryStateEm ## FFMemoryPressureTracker::getCurrentRawMemoryState(unsigned long)
0000000000da5930	leaq	-0x28(%rbp), %rdi
0000000000da5934	movq	%rax, %rsi
0000000000da5937	callq	__ZN25FFMemoryPressureStateInfoC2Em ## FFMemoryPressureStateInfo::FFMemoryPressureStateInfo(unsigned long)
0000000000da593c	movq	-0x28(%rbp), %rax
0000000000da5940	movsd	-0x20(%rbp), %xmm0
0000000000da5945	movq	%rax, 0x10(%rbx)
0000000000da5949	movsd	%xmm0, 0x18(%rbx)
0000000000da594e	movq	0x10(%rbx), %rax
0000000000da5952	movq	%rax, 0x20(%rbx)
0000000000da5956	movq	0x18(%rbx), %rax
0000000000da595a	movq	%rax, 0x28(%rbx)
0000000000da595e	movl	$0xe, 0x30(%rbx)
0000000000da5965	movl	$0x1, %esi
0000000000da596a	xorl	%edi, %edi
0000000000da596c	callq	0x1497680                       ## symbol stub for: _dispatch_queue_attr_make_with_autorelease_frequency
0000000000da5971	movq	%rax, %rdi
0000000000da5974	movl	$0x21, %esi
0000000000da5979	xorl	%edx, %edx
0000000000da597b	callq	0x1497686                       ## symbol stub for: _dispatch_queue_attr_make_with_qos_class
0000000000da5980	leaq	0x8b9b6f(%rip), %rdi            ## literal pool for: "com.apple.flexo.ffplayHM.cb"
0000000000da5987	movq	%rax, %rsi
0000000000da598a	callq	0x149768c                       ## symbol stub for: _dispatch_queue_create
0000000000da598f	movq	%rax, %r15
0000000000da5992	movq	%rax, (%rbx)
0000000000da5995	movq	0xb4819c(%rip), %rax            ## literal pool symbol address: __NSConcreteStackBlock
0000000000da599c	movq	%rax, -0x50(%rbp)
0000000000da59a0	movl	$0xc0000000, %eax               ## imm = 0xC0000000
0000000000da59a5	movq	%rax, -0x48(%rbp)
0000000000da59a9	leaq	____ZN23FFPlaybackMemoryMonitorC2Ev_block_invoke(%rip), %rax
0000000000da59b0	movq	%rax, -0x40(%rbp)
0000000000da59b4	leaq	"___block_descriptor_40_e39_v16?0r^{FFMemoryPressureStateInfo=Qd}8l"(%rip), %rax
0000000000da59bb	movq	%rax, -0x38(%rbp)
0000000000da59bf	movq	%rbx, -0x30(%rbp)
0000000000da59c3	movl	$0xc0, %edi
0000000000da59c8	callq	0x1497452                       ## symbol stub for: __Znwm
0000000000da59cd	movq	%rax, %r14
0000000000da59d0	leaq	-0x50(%rbp), %rsi
0000000000da59d4	movsd	0x7c95fc(%rip), %xmm0
0000000000da59dc	movq	%rax, %rdi
0000000000da59df	movq	%r15, %rdx
0000000000da59e2	callq	__ZN23FFMemoryPressureTrackerC1EU13block_pointerFvRK25FFMemoryPressureStateInfoEPU28objcproto17OS_dispatch_queue8NSObjectd ## FFMemoryPressureTracker::FFMemoryPressureTracker(void (FFMemoryPressureStateInfo const&) block_pointer, NSObject<OS_dispatch_queue>*, double)
0000000000da59e7	movq	%r14, 0x8(%rbx)
0000000000da59eb	addq	$0x38, %rsp
0000000000da59ef	popq	%rbx
0000000000da59f0	popq	%r14
0000000000da59f2	popq	%r15
0000000000da59f4	popq	%rbp
0000000000da59f5	retq
0000000000da59f6	movq	%rax, %rbx
0000000000da59f9	movq	%r14, %rdi
0000000000da59fc	callq	0x1497404                       ## symbol stub for: __ZdlPv
0000000000da5a01	movq	%rbx, %rdi
0000000000da5a04	callq	0x1495d30                       ## symbol stub for: __Unwind_Resume
0000000000da5a09	nopl	(%rax)
____ZN23FFPlaybackMemoryMonitorC2Ev_block_invoke:
0000000000da5a10	pushq	%rbp
0000000000da5a11	movq	%rsp, %rbp
0000000000da5a14	movq	0x20(%rdi), %rax
0000000000da5a18	movups	0x10(%rax), %xmm0
0000000000da5a1c	movups	%xmm0, 0x20(%rax)
0000000000da5a20	movups	(%rsi), %xmm0
0000000000da5a23	movups	%xmm0, 0x10(%rax)
0000000000da5a27	popq	%rbp
0000000000da5a28	retq
0000000000da5a29	nopl	(%rax)
__ZN23FFPlaybackMemoryMonitorC1Ev:
0000000000da5a30	pushq	%rbp
0000000000da5a31	movq	%rsp, %rbp
0000000000da5a34	popq	%rbp
0000000000da5a35	jmp	__ZN23FFPlaybackMemoryMonitorC2Ev ## FFPlaybackMemoryMonitor::FFPlaybackMemoryMonitor()
0000000000da5a3a	nopw	(%rax,%rax)
__ZN23FFPlaybackMemoryMonitorD1Ev:
0000000000da5a40	pushq	%rbp
0000000000da5a41	movq	%rsp, %rbp
0000000000da5a44	pushq	%rbx
0000000000da5a45	pushq	%rax
0000000000da5a46	movq	%rdi, %rbx
0000000000da5a49	movq	0x8(%rdi), %rdi
0000000000da5a4d	testq	%rdi, %rdi
0000000000da5a50	je	0xda5a58
0000000000da5a52	movq	(%rdi), %rax
0000000000da5a55	callq	*0x8(%rax)
0000000000da5a58	movq	(%rbx), %rdi
0000000000da5a5b	addq	$0x8, %rsp
0000000000da5a5f	popq	%rbx
0000000000da5a60	popq	%rbp
0000000000da5a61	jmp	0x1497692                       ## symbol stub for: _dispatch_release
0000000000da5a66	nopw	%cs:(%rax,%rax)
__ZN23FFPlaybackMemoryMonitor18getMaxSizeForStateEm:
0000000000da5a70	pushq	%rbp
0000000000da5a71	movq	%rsp, %rbp
0000000000da5a74	cmpq	$0x2, %rsi
0000000000da5a78	movl	$0x8, %ecx
0000000000da5a7d	movl	$0xe, %edx
0000000000da5a82	cmovnel	%edx, %ecx
0000000000da5a85	cmpq	$0x4, %rsi
0000000000da5a89	movl	$0x6, %eax
0000000000da5a8e	cmovnel	%ecx, %eax
0000000000da5a91	cmpq	$0x2, %rsi
0000000000da5a95	cmovbl	%edx, %eax
0000000000da5a98	popq	%rbp
0000000000da5a99	retq
0000000000da5a9a	nopw	(%rax,%rax)
__ZN23FFPlaybackMemoryMonitor39calculatePreImageFromMemoryPressureDataERb:
0000000000da5aa0	pushq	%rbp
0000000000da5aa1	movq	%rsp, %rbp
0000000000da5aa4	pushq	%r15
0000000000da5aa6	pushq	%r14
0000000000da5aa8	pushq	%r12
0000000000da5aaa	pushq	%rbx
0000000000da5aab	movq	%rsi, %r14
0000000000da5aae	movq	%rdi, %rbx
0000000000da5ab1	movq	(%rdi), %rdi
0000000000da5ab4	callq	0x149760e                       ## symbol stub for: _dispatch_assert_queue$V2
0000000000da5ab9	movq	0x20(%rbx), %rax
0000000000da5abd	cmpq	$0x2, %rax
0000000000da5ac1	movl	$0x8, %r15d
0000000000da5ac7	movl	$0xe, %r12d
0000000000da5acd	cmovel	%r15d, %r12d
0000000000da5ad1	cmpq	$0x4, %rax
0000000000da5ad5	movl	$0x6, %ecx
0000000000da5ada	cmovel	%ecx, %r12d
0000000000da5ade	movl	$0xe, %edx
0000000000da5ae3	cmpq	$0x2, %rax
0000000000da5ae7	cmovbl	%edx, %r12d
0000000000da5aeb	movq	0x10(%rbx), %rax
0000000000da5aef	cmpq	$0x2, %rax
0000000000da5af3	cmovnel	%edx, %r15d
0000000000da5af7	cmpq	$0x4, %rax
0000000000da5afb	cmovel	%ecx, %r15d
0000000000da5aff	cmpq	$0x2, %rax
0000000000da5b03	cmovbl	%edx, %r15d
0000000000da5b07	cmpl	%r12d, %r15d
0000000000da5b0a	jbe	0xda5b2c
0000000000da5b0c	callq	_FFGetHostTimeSeconds
0000000000da5b11	subsd	0x18(%rbx), %xmm0
0000000000da5b16	divsd	0x7c9e82(%rip), %xmm0
0000000000da5b1e	cvttsd2si	%xmm0, %eax
0000000000da5b22	addl	%eax, %r12d
0000000000da5b25	cmpl	%r15d, %r12d
0000000000da5b28	cmovll	%r12d, %r15d
0000000000da5b2c	cmpl	0x30(%rbx), %r15d
0000000000da5b30	je	0xda5b3a
0000000000da5b32	movb	$0x1, (%r14)
0000000000da5b36	movl	%r15d, 0x30(%rbx)
0000000000da5b3a	movl	%r15d, %eax
0000000000da5b3d	popq	%rbx
0000000000da5b3e	popq	%r12
0000000000da5b40	popq	%r14
0000000000da5b42	popq	%r15
0000000000da5b44	popq	%rbp
0000000000da5b45	retq
0000000000da5b46	nopw	%cs:(%rax,%rax)
__ZN23FFPlaybackMemoryMonitor31adjustPreImageForMemoryPressureEi:
0000000000da5b50	pushq	%rbp
0000000000da5b51	movq	%rsp, %rbp
0000000000da5b54	pushq	%r15
0000000000da5b56	pushq	%r14
0000000000da5b58	pushq	%r12
0000000000da5b5a	pushq	%rbx
0000000000da5b5b	subq	$0x80, %rsp
0000000000da5b62	movl	%esi, %r14d
0000000000da5b65	movq	$0x0, -0x60(%rbp)
0000000000da5b6d	leaq	-0x60(%rbp), %rbx
0000000000da5b71	movq	%rbx, -0x58(%rbp)
0000000000da5b75	movabsq	$0x2020000000, %rax             ## imm = 0x2020000000
0000000000da5b7f	movq	%rax, -0x50(%rbp)
0000000000da5b83	movq	$0x0, -0x40(%rbp)
0000000000da5b8b	leaq	-0x40(%rbp), %r15
0000000000da5b8f	movq	%r15, -0x38(%rbp)
0000000000da5b93	movq	%rax, -0x30(%rbp)
0000000000da5b97	movb	$0x0, -0x28(%rbp)
0000000000da5b9b	movq	(%rdi), %rax
0000000000da5b9e	movq	0xb47f93(%rip), %rcx            ## literal pool symbol address: __NSConcreteStackBlock
0000000000da5ba5	movq	%rcx, -0x98(%rbp)
0000000000da5bac	movl	$0xc2000000, %ecx               ## imm = 0xC2000000
0000000000da5bb1	movq	%rcx, -0x90(%rbp)
0000000000da5bb8	leaq	____ZN23FFPlaybackMemoryMonitor31adjustPreImageForMemoryPressureEi_block_invoke(%rip), %rcx
0000000000da5bbf	movq	%rcx, -0x88(%rbp)
0000000000da5bc6	leaq	"___block_descriptor_56_e8_32r40r_e5_v8?0l"(%rip), %rcx
0000000000da5bcd	movq	%rcx, -0x80(%rbp)
0000000000da5bd1	movq	%rdi, -0x68(%rbp)
0000000000da5bd5	movq	%rbx, -0x78(%rbp)
0000000000da5bd9	movq	%r15, -0x70(%rbp)
0000000000da5bdd	leaq	-0x98(%rbp), %rsi
0000000000da5be4	movq	%rax, %rdi
0000000000da5be7	callq	0x14976fe                       ## symbol stub for: _dispatch_sync
0000000000da5bec	movq	-0x58(%rbp), %rax
0000000000da5bf0	movl	0x18(%rax), %r12d
0000000000da5bf4	cmpl	%r12d, %r14d
0000000000da5bf7	cmovll	%r14d, %r12d
0000000000da5bfb	movq	%r15, %rdi
0000000000da5bfe	movl	$0x8, %esi
0000000000da5c03	callq	0x1495cee                       ## symbol stub for: __Block_object_dispose
0000000000da5c08	movq	%rbx, %rdi
0000000000da5c0b	movl	$0x8, %esi
0000000000da5c10	callq	0x1495cee                       ## symbol stub for: __Block_object_dispose
0000000000da5c15	movl	%r12d, %eax
0000000000da5c18	addq	$0x80, %rsp
0000000000da5c1f	popq	%rbx
0000000000da5c20	popq	%r12
0000000000da5c22	popq	%r14
0000000000da5c24	popq	%r15
0000000000da5c26	popq	%rbp
0000000000da5c27	retq
0000000000da5c28	nopl	(%rax,%rax)
____ZN23FFPlaybackMemoryMonitor31adjustPreImageForMemoryPressureEi_block_invoke:
0000000000da5c30	pushq	%rbp
0000000000da5c31	movq	%rsp, %rbp
0000000000da5c34	pushq	%r15
0000000000da5c36	pushq	%r14
0000000000da5c38	pushq	%r13
0000000000da5c3a	pushq	%r12
0000000000da5c3c	pushq	%rbx
0000000000da5c3d	pushq	%rax
0000000000da5c3e	movq	%rdi, %rbx
0000000000da5c41	movq	0x28(%rdi), %rax
0000000000da5c45	movq	0x30(%rdi), %r14
0000000000da5c49	movq	0x8(%rax), %r15
0000000000da5c4d	movq	(%r14), %rdi
0000000000da5c50	callq	0x149760e                       ## symbol stub for: _dispatch_assert_queue$V2
0000000000da5c55	movq	0x20(%r14), %rax
0000000000da5c59	cmpq	$0x2, %rax
0000000000da5c5d	movl	$0x8, %r12d
0000000000da5c63	movl	$0xe, %r13d
0000000000da5c69	cmovel	%r12d, %r13d
0000000000da5c6d	cmpq	$0x4, %rax
0000000000da5c71	movl	$0x6, %ecx
0000000000da5c76	cmovel	%ecx, %r13d
0000000000da5c7a	movl	$0xe, %edx
0000000000da5c7f	cmpq	$0x2, %rax
0000000000da5c83	cmovbl	%edx, %r13d
0000000000da5c87	movq	0x10(%r14), %rax
0000000000da5c8b	cmpq	$0x2, %rax
0000000000da5c8f	cmovnel	%edx, %r12d
0000000000da5c93	cmpq	$0x4, %rax
0000000000da5c97	cmovel	%ecx, %r12d
0000000000da5c9b	cmpq	$0x2, %rax
0000000000da5c9f	cmovbl	%edx, %r12d
0000000000da5ca3	cmpl	%r13d, %r12d
0000000000da5ca6	jbe	0xda5cc9
0000000000da5ca8	callq	_FFGetHostTimeSeconds
0000000000da5cad	subsd	0x18(%r14), %xmm0
0000000000da5cb3	divsd	0x7c9ce5(%rip), %xmm0
0000000000da5cbb	cvttsd2si	%xmm0, %eax
0000000000da5cbf	addl	%eax, %r13d
0000000000da5cc2	cmpl	%r12d, %r13d
0000000000da5cc5	cmovll	%r13d, %r12d
0000000000da5cc9	cmpl	0x30(%r14), %r12d
0000000000da5ccd	je	0xda5cd8
0000000000da5ccf	movb	$0x1, 0x18(%r15)
0000000000da5cd4	movl	%r12d, 0x30(%r14)
0000000000da5cd8	movq	0x20(%rbx), %rax
0000000000da5cdc	movq	0x8(%rax), %rax
0000000000da5ce0	movl	%r12d, 0x18(%rax)
0000000000da5ce4	addq	$0x8, %rsp
0000000000da5ce8	popq	%rbx
0000000000da5ce9	popq	%r12
0000000000da5ceb	popq	%r13
0000000000da5ced	popq	%r14
0000000000da5cef	popq	%r15
0000000000da5cf1	popq	%rbp
0000000000da5cf2	retq
0000000000da5cf3	nopw	%cs:(%rax,%rax)
____ZL25UpdatePreemptiveDropPrefsv_block_invoke:
0000000000da5d00	pushq	%rbp
0000000000da5d01	movq	%rsp, %rbp
0000000000da5d04	pushq	%r15
0000000000da5d06	pushq	%r14
0000000000da5d08	pushq	%rbx
0000000000da5d09	pushq	%rax
0000000000da5d0a	movq	0xb498c7(%rip), %rdi            ## literal pool symbol address: _OBJC_CLASS_$_NSUserDefaults
0000000000da5d11	movq	0xe13b20(%rip), %rbx
0000000000da5d18	movq	0xb479a1(%rip), %r15            ## Objc message: -[%rdi _waitForThreadToFinish]
0000000000da5d1f	movq	%rbx, %rsi
0000000000da5d22	callq	*%r15
0000000000da5d25	movq	0xe15174(%rip), %r14
0000000000da5d2c	leaq	0xc097f5(%rip), %rdx            ## Objc cfstring ref: @"bad cfstring ref"
0000000000da5d33	movq	%rax, %rdi
0000000000da5d36	movq	%r14, %rsi
0000000000da5d39	callq	*%r15
0000000000da5d3c	movq	0xb49895(%rip), %rdi            ## literal pool symbol address: _OBJC_CLASS_$_NSUserDefaults
0000000000da5d43	movq	%rbx, %rsi
0000000000da5d46	callq	*%r15
0000000000da5d49	movq	0xe13408(%rip), %rsi
0000000000da5d50	leaq	0xc097f1(%rip), %rdx            ## Objc cfstring ref: @"bad cfstring ref"
0000000000da5d57	movq	%rax, %rdi
0000000000da5d5a	callq	*%r15
0000000000da5d5d	testq	%rax, %rax
0000000000da5d60	je	0xda5d81
0000000000da5d62	movq	0xb4986f(%rip), %rdi            ## literal pool symbol address: _OBJC_CLASS_$_NSUserDefaults
0000000000da5d69	movq	%rbx, %rsi
0000000000da5d6c	callq	*%r15
0000000000da5d6f	leaq	0xc097d2(%rip), %rdx            ## Objc cfstring ref: @"bad cfstring ref"
0000000000da5d76	movq	%rax, %rdi
0000000000da5d79	movq	%r14, %rsi
0000000000da5d7c	callq	*%r15
0000000000da5d7f	jmp	0xda5d86
0000000000da5d81	movl	$0x1, %eax
0000000000da5d86	movl	%eax, __ZL24sEnableHMDHealthFeedback(%rip) ## sEnableHMDHealthFeedback
0000000000da5d8c	movq	0xb49845(%rip), %rdi            ## literal pool symbol address: _OBJC_CLASS_$_NSUserDefaults
0000000000da5d93	movq	%rbx, %rsi
0000000000da5d96	callq	*%r15
0000000000da5d99	leaq	0xc097c8(%rip), %rdx            ## Objc cfstring ref: @"bad cfstring ref"
0000000000da5da0	movq	%rax, %rdi
0000000000da5da3	movq	%r14, %rsi
0000000000da5da6	callq	*%r15
0000000000da5da9	testq	%rax, %rax
0000000000da5dac	je	0xda5db5
0000000000da5dae	movb	$0x1, __ZL23sLogSkipLevelsToConsole(%rip) ## sLogSkipLevelsToConsole
0000000000da5db5	addq	$0x8, %rsp
0000000000da5db9	popq	%rbx
0000000000da5dba	popq	%r14
0000000000da5dbc	popq	%r15
0000000000da5dbe	popq	%rbp
0000000000da5dbf	retq
____ZL38installPostNotificationHandlerOnSourcePU29objcproto18OS_dispatch_source8NSObject_block_invoke:
0000000000da5dc0	pushq	%rbp
0000000000da5dc1	movq	%rsp, %rbp
0000000000da5dc4	pushq	%rbx
0000000000da5dc5	pushq	%rax
0000000000da5dc6	leaq	-0x10(%rbp), %rdi
0000000000da5dca	callq	0x14965f4                       ## symbol stub for: __ZN17PCAutoreleasePoolC1Ev
0000000000da5dcf	leaq	_OBJC_CLASS_$_FFNotificationCenter(%rip), %rdi
0000000000da5dd6	leaq	_FFPlayerHMDDroppedAboveThreshold(%rip), %rax
0000000000da5ddd	movq	(%rax), %rdx
