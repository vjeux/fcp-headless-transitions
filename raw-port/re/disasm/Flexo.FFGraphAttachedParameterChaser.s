__ZN30FFGraphAttachedParameterChaserC2EdP12FFAudioGraphP11FFAudioNoded:
0000000001236ac0	pushq	%rbp
0000000001236ac1	movq	%rsp, %rbp
0000000001236ac4	pushq	%r15
0000000001236ac6	pushq	%r14
0000000001236ac8	pushq	%rbx
0000000001236ac9	pushq	%rax
0000000001236aca	movq	%rdx, %r14
0000000001236acd	movq	%rsi, %r15
0000000001236ad0	movq	%rdi, %rbx
0000000001236ad3	callq	__ZN30FFSelfAdvancingParameterChaserC2Edd ## FFSelfAdvancingParameterChaser::FFSelfAdvancingParameterChaser(double, double)
0000000001236ad8	leaq	0x128(%rbx), %rsi
0000000001236adf	leaq	0x6e700a(%rip), %rax
0000000001236ae6	movq	%rax, (%rbx)
0000000001236ae9	leaq	0x6e7048(%rip), %rax
0000000001236af0	movq	%rax, 0x128(%rbx)
0000000001236af7	movq	%r15, 0x130(%rbx)
0000000001236afe	movq	%r14, 0x138(%rbx)
0000000001236b05	movq	%r15, %rdi
0000000001236b08	movq	%r14, %rdx
0000000001236b0b	callq	__ZN12FFAudioGraph13AddRenderHookEP17FFAudioRenderHookP11FFAudioNode ## FFAudioGraph::AddRenderHook(FFAudioRenderHook*, FFAudioNode*)
0000000001236b10	leaq	0xd8(%rbx), %rsi
0000000001236b17	movq	0x130(%rbx), %rdi
0000000001236b1e	movq	0x138(%rbx), %rdx
0000000001236b25	callq	__ZN12FFAudioGraph13AddRenderHookEP17FFAudioRenderHookP11FFAudioNode ## FFAudioGraph::AddRenderHook(FFAudioRenderHook*, FFAudioNode*)
0000000001236b2a	addq	$0x8, %rsp
0000000001236b2e	popq	%rbx
0000000001236b2f	popq	%r14
0000000001236b31	popq	%r15
0000000001236b33	popq	%rbp
0000000001236b34	retq
0000000001236b35	movq	%rax, %r14
0000000001236b38	movq	%rbx, %rdi
0000000001236b3b	callq	__ZN30FFSelfAdvancingParameterChaserD2Ev ## FFSelfAdvancingParameterChaser::~FFSelfAdvancingParameterChaser()
0000000001236b40	movq	%r14, %rdi
0000000001236b43	callq	0x1495d30                       ## symbol stub for: __Unwind_Resume
0000000001236b48	nopl	(%rax,%rax)
__ZN30FFGraphAttachedParameterChaserC1EdP12FFAudioGraphP11FFAudioNoded:
0000000001236b50	pushq	%rbp
0000000001236b51	movq	%rsp, %rbp
0000000001236b54	pushq	%r15
0000000001236b56	pushq	%r14
0000000001236b58	pushq	%rbx
0000000001236b59	pushq	%rax
0000000001236b5a	movq	%rdx, %r14
0000000001236b5d	movq	%rsi, %r15
0000000001236b60	movq	%rdi, %rbx
0000000001236b63	callq	__ZN30FFSelfAdvancingParameterChaserC2Edd ## FFSelfAdvancingParameterChaser::FFSelfAdvancingParameterChaser(double, double)
0000000001236b68	leaq	0x128(%rbx), %rsi
0000000001236b6f	leaq	0x6e6f7a(%rip), %rax
0000000001236b76	movq	%rax, (%rbx)
0000000001236b79	leaq	0x6e6fb8(%rip), %rax
0000000001236b80	movq	%rax, 0x128(%rbx)
0000000001236b87	movq	%r15, 0x130(%rbx)
0000000001236b8e	movq	%r14, 0x138(%rbx)
0000000001236b95	movq	%r15, %rdi
0000000001236b98	movq	%r14, %rdx
0000000001236b9b	callq	__ZN12FFAudioGraph13AddRenderHookEP17FFAudioRenderHookP11FFAudioNode ## FFAudioGraph::AddRenderHook(FFAudioRenderHook*, FFAudioNode*)
0000000001236ba0	leaq	0xd8(%rbx), %rsi
0000000001236ba7	movq	0x130(%rbx), %rdi
0000000001236bae	movq	0x138(%rbx), %rdx
0000000001236bb5	callq	__ZN12FFAudioGraph13AddRenderHookEP17FFAudioRenderHookP11FFAudioNode ## FFAudioGraph::AddRenderHook(FFAudioRenderHook*, FFAudioNode*)
0000000001236bba	addq	$0x8, %rsp
0000000001236bbe	popq	%rbx
0000000001236bbf	popq	%r14
0000000001236bc1	popq	%r15
0000000001236bc3	popq	%rbp
0000000001236bc4	retq
0000000001236bc5	movq	%rax, %r14
0000000001236bc8	movq	%rbx, %rdi
0000000001236bcb	callq	__ZN30FFSelfAdvancingParameterChaserD2Ev ## FFSelfAdvancingParameterChaser::~FFSelfAdvancingParameterChaser()
0000000001236bd0	movq	%r14, %rdi
0000000001236bd3	callq	0x1495d30                       ## symbol stub for: __Unwind_Resume
0000000001236bd8	nopl	(%rax,%rax)
__ZN30FFGraphAttachedParameterChaser17CleanupForDestroyEv:
0000000001236be0	pushq	%rbp
0000000001236be1	movq	%rsp, %rbp
0000000001236be4	pushq	%rbx
0000000001236be5	pushq	%rax
0000000001236be6	movq	%rdi, %rbx
0000000001236be9	leaq	0xd8(%rdi), %rsi
0000000001236bf0	movq	0x130(%rdi), %rdi
0000000001236bf7	movq	0x138(%rbx), %rdx
0000000001236bfe	callq	__ZN12FFAudioGraph16RemoveRenderHookEP17FFAudioRenderHookP11FFAudioNode ## FFAudioGraph::RemoveRenderHook(FFAudioRenderHook*, FFAudioNode*)
0000000001236c03	leaq	0x128(%rbx), %rsi
0000000001236c0a	movq	0x130(%rbx), %rdi
0000000001236c11	movq	0x138(%rbx), %rdx
0000000001236c18	addq	$0x8, %rsp
0000000001236c1c	popq	%rbx
0000000001236c1d	popq	%rbp
0000000001236c1e	jmp	__ZN12FFAudioGraph16RemoveRenderHookEP17FFAudioRenderHookP11FFAudioNode ## FFAudioGraph::RemoveRenderHook(FFAudioRenderHook*, FFAudioNode*)
0000000001236c23	nopw	%cs:(%rax,%rax)
__ZN29FFUnitAttachedParameterChaserC2EdP23ComponentInstanceRecordd:
0000000001236c30	pushq	%rbp
0000000001236c31	movq	%rsp, %rbp
0000000001236c34	pushq	%r14
0000000001236c36	pushq	%rbx
0000000001236c37	movq	%rsi, %r14
0000000001236c3a	movq	%rdi, %rbx
0000000001236c3d	callq	__ZN30FFSelfAdvancingParameterChaserC2Edd ## FFSelfAdvancingParameterChaser::FFSelfAdvancingParameterChaser(double, double)
0000000001236c42	leaq	0x6e6f1f(%rip), %rax
0000000001236c49	movq	%rax, (%rbx)
0000000001236c4c	movq	%r14, 0x128(%rbx)
0000000001236c53	leaq	__ZN29FFUnitAttachedParameterChaser19ObserveRenderHelperEPvPjPK14AudioTimeStampjjP15AudioBufferList(%rip), %rsi ## FFUnitAttachedParameterChaser::ObserveRenderHelper(void*, unsigned int*, AudioTimeStamp const*, unsigned int, unsigned int, AudioBufferList*)
0000000001236c5a	movq	%r14, %rdi
0000000001236c5d	movq	%rbx, %rdx
0000000001236c60	callq	0x1494608                       ## symbol stub for: _AudioUnitAddRenderNotify
0000000001236c65	popq	%rbx
0000000001236c66	popq	%r14
0000000001236c68	popq	%rbp
0000000001236c69	retq
0000000001236c6a	movq	%rax, %r14
0000000001236c6d	movq	%rbx, %rdi
0000000001236c70	callq	__ZN30FFSelfAdvancingParameterChaserD2Ev ## FFSelfAdvancingParameterChaser::~FFSelfAdvancingParameterChaser()
0000000001236c75	movq	%r14, %rdi
0000000001236c78	callq	0x1495d30                       ## symbol stub for: __Unwind_Resume
0000000001236c7d	nopl	(%rax)
__ZN29FFUnitAttachedParameterChaser19ObserveRenderHelperEPvPjPK14AudioTimeStampjjP15AudioBufferList:
0000000001236c80	pushq	%rbp
0000000001236c81	movq	%rsp, %rbp
0000000001236c84	pushq	%r14
0000000001236c86	pushq	%rbx
0000000001236c87	movq	%rdi, %rbx
0000000001236c8a	movl	(%rsi), %esi
0000000001236c8c	addq	$0xd8, %rdi
0000000001236c93	testb	$0x4, %sil
0000000001236c97	jne	0x1236cd3
0000000001236c99	movq	%rdx, %r14
0000000001236c9c	callq	__ZN21STParameterEventQueue10PostRenderEjRK14AudioTimeStampjjRK15AudioBufferList ## STParameterEventQueue::PostRender(unsigned int, AudioTimeStamp const&, unsigned int, unsigned int, AudioBufferList const&)
0000000001236ca1	cvttsd2si	(%r14), %rax
0000000001236ca6	movq	0xc0(%rbx), %rcx
0000000001236cad	cmpq	%rax, %rcx
0000000001236cb0	jg	0x1236cd8
0000000001236cb2	addq	0xc8(%rbx), %rax
0000000001236cb9	xchgq	%rax, 0xc0(%rbx)
0000000001236cc0	cmpb	$0x1, 0xd0(%rbx)
0000000001236cc7	jne	0x1236cdf
0000000001236cc9	movq	(%rbx), %rax
0000000001236ccc	movq	%rbx, %rdi
0000000001236ccf	callq	*(%rax)
0000000001236cd1	jmp	0x1236cd8
0000000001236cd3	callq	__ZN21STParameterEventQueue9PreRenderEjRK14AudioTimeStampjjRK15AudioBufferList ## STParameterEventQueue::PreRender(unsigned int, AudioTimeStamp const&, unsigned int, unsigned int, AudioBufferList const&)
0000000001236cd8	xorl	%eax, %eax
0000000001236cda	popq	%rbx
0000000001236cdb	popq	%r14
0000000001236cdd	popq	%rbp
0000000001236cde	retq
0000000001236cdf	movq	%rbx, %rdi
0000000001236ce2	movl	$0x1, %esi
0000000001236ce7	callq	__ZN18FFMachPortCallback22SendEmptyMessageToPortEb ## FFMachPortCallback::SendEmptyMessageToPort(bool)
0000000001236cec	jmp	0x1236cd8
0000000001236cee	nop
__ZN29FFUnitAttachedParameterChaserC1EdP23ComponentInstanceRecordd:
0000000001236cf0	pushq	%rbp
0000000001236cf1	movq	%rsp, %rbp
0000000001236cf4	pushq	%r14
0000000001236cf6	pushq	%rbx
0000000001236cf7	movq	%rsi, %r14
0000000001236cfa	movq	%rdi, %rbx
0000000001236cfd	callq	__ZN30FFSelfAdvancingParameterChaserC2Edd ## FFSelfAdvancingParameterChaser::FFSelfAdvancingParameterChaser(double, double)
0000000001236d02	leaq	0x6e6e5f(%rip), %rax
0000000001236d09	movq	%rax, (%rbx)
0000000001236d0c	movq	%r14, 0x128(%rbx)
0000000001236d13	leaq	__ZN29FFUnitAttachedParameterChaser19ObserveRenderHelperEPvPjPK14AudioTimeStampjjP15AudioBufferList(%rip), %rsi ## FFUnitAttachedParameterChaser::ObserveRenderHelper(void*, unsigned int*, AudioTimeStamp const*, unsigned int, unsigned int, AudioBufferList*)
0000000001236d1a	movq	%r14, %rdi
0000000001236d1d	movq	%rbx, %rdx
0000000001236d20	callq	0x1494608                       ## symbol stub for: _AudioUnitAddRenderNotify
0000000001236d25	popq	%rbx
0000000001236d26	popq	%r14
0000000001236d28	popq	%rbp
0000000001236d29	retq
0000000001236d2a	movq	%rax, %r14
0000000001236d2d	movq	%rbx, %rdi
0000000001236d30	callq	__ZN30FFSelfAdvancingParameterChaserD2Ev ## FFSelfAdvancingParameterChaser::~FFSelfAdvancingParameterChaser()
0000000001236d35	movq	%r14, %rdi
0000000001236d38	callq	0x1495d30                       ## symbol stub for: __Unwind_Resume
0000000001236d3d	nopl	(%rax)
__ZN29FFUnitAttachedParameterChaser17CleanupForDestroyEv:
0000000001236d40	pushq	%rbp
0000000001236d41	movq	%rsp, %rbp
0000000001236d44	movq	%rdi, %rdx
0000000001236d47	movq	0x128(%rdi), %rdi
0000000001236d4e	leaq	__ZN29FFUnitAttachedParameterChaser19ObserveRenderHelperEPvPjPK14AudioTimeStampjjP15AudioBufferList(%rip), %rsi ## FFUnitAttachedParameterChaser::ObserveRenderHelper(void*, unsigned int*, AudioTimeStamp const*, unsigned int, unsigned int, AudioBufferList*)
0000000001236d55	popq	%rbp
0000000001236d56	jmp	0x149462c                       ## symbol stub for: _AudioUnitRemoveRenderNotify
0000000001236d5b	nopl	(%rax,%rax)
__ZN29FFUnitAttachedParameterChaser13ObserveRenderEjRK14AudioTimeStampjjR15AudioBufferList:
0000000001236d60	pushq	%rbp
0000000001236d61	movq	%rsp, %rbp
0000000001236d64	pushq	%r14
0000000001236d66	pushq	%rbx
0000000001236d67	movq	%rdi, %rbx
0000000001236d6a	addq	$0xd8, %rdi
0000000001236d71	testb	$0x4, %sil
0000000001236d75	jne	0x1236d95
0000000001236d77	movq	%rdx, %r14
0000000001236d7a	callq	__ZN21STParameterEventQueue10PostRenderEjRK14AudioTimeStampjjRK15AudioBufferList ## STParameterEventQueue::PostRender(unsigned int, AudioTimeStamp const&, unsigned int, unsigned int, AudioBufferList const&)
0000000001236d7f	cvttsd2si	(%r14), %rax
0000000001236d84	movq	0xc0(%rbx), %rcx
0000000001236d8b	cmpq	%rax, %rcx
0000000001236d8e	jle	0x1236d9e
0000000001236d90	popq	%rbx
0000000001236d91	popq	%r14
0000000001236d93	popq	%rbp
0000000001236d94	retq
0000000001236d95	popq	%rbx
0000000001236d96	popq	%r14
0000000001236d98	popq	%rbp
0000000001236d99	jmp	__ZN21STParameterEventQueue9PreRenderEjRK14AudioTimeStampjjRK15AudioBufferList ## STParameterEventQueue::PreRender(unsigned int, AudioTimeStamp const&, unsigned int, unsigned int, AudioBufferList const&)
0000000001236d9e	addq	0xc8(%rbx), %rax
0000000001236da5	xchgq	%rax, 0xc0(%rbx)
0000000001236dac	cmpb	$0x1, 0xd0(%rbx)
0000000001236db3	jne	0x1236dc1
0000000001236db5	movq	(%rbx), %rax
0000000001236db8	movq	%rbx, %rdi
0000000001236dbb	popq	%rbx
0000000001236dbc	popq	%r14
0000000001236dbe	popq	%rbp
0000000001236dbf	jmpq	*(%rax)
0000000001236dc1	movq	%rbx, %rdi
0000000001236dc4	movl	$0x1, %esi
0000000001236dc9	popq	%rbx
0000000001236dca	popq	%r14
0000000001236dcc	popq	%rbp
0000000001236dcd	jmp	__ZN18FFMachPortCallback22SendEmptyMessageToPortEb ## FFMachPortCallback::SendEmptyMessageToPort(bool)
0000000001236dd2	nopw	%cs:(%rax,%rax)
__ZN30FFGraphAttachedParameterChaserD1Ev:
0000000001236de0	pushq	%rbp
0000000001236de1	movq	%rsp, %rbp
0000000001236de4	pushq	%rbx
0000000001236de5	pushq	%rax
0000000001236de6	movq	%rdi, %rbx
0000000001236de9	leaq	0x6e6cc0(%rip), %rax
0000000001236df0	movq	%rax, (%rdi)
0000000001236df3	callq	__ZN31FFMachPortDispatchQueueCallback15DetachFromQueueEv ## FFMachPortDispatchQueueCallback::DetachFromQueue()
0000000001236df8	leaq	0xd8(%rbx), %rdi
0000000001236dff	callq	__ZN21STParameterEventQueueD1Ev ## STParameterEventQueue::~STParameterEventQueue()
0000000001236e04	leaq	0x20(%rbx), %rdi
0000000001236e08	callq	__ZN22FFMultiParameterChaserD2Ev ## FFMultiParameterChaser::~FFMultiParameterChaser()
0000000001236e0d	movq	%rbx, %rdi
0000000001236e10	addq	$0x8, %rsp
0000000001236e14	popq	%rbx
0000000001236e15	popq	%rbp
0000000001236e16	jmp	__ZN31FFMachPortDispatchQueueCallbackD2Ev ## FFMachPortDispatchQueueCallback::~FFMachPortDispatchQueueCallback()
0000000001236e1b	movq	%rax, %rdi
0000000001236e1e	callq	___clang_call_terminate
0000000001236e23	nopw	%cs:(%rax,%rax)
__ZN30FFGraphAttachedParameterChaserD0Ev:
0000000001236e30	pushq	%rbp
0000000001236e31	movq	%rsp, %rbp
0000000001236e34	pushq	%rbx
0000000001236e35	pushq	%rax
0000000001236e36	movq	%rdi, %rbx
0000000001236e39	leaq	0x6e6c70(%rip), %rax
0000000001236e40	movq	%rax, (%rdi)
0000000001236e43	callq	__ZN31FFMachPortDispatchQueueCallback15DetachFromQueueEv ## FFMachPortDispatchQueueCallback::DetachFromQueue()
0000000001236e48	leaq	0xd8(%rbx), %rdi
0000000001236e4f	callq	__ZN21STParameterEventQueueD1Ev ## STParameterEventQueue::~STParameterEventQueue()
0000000001236e54	leaq	0x20(%rbx), %rdi
0000000001236e58	callq	__ZN22FFMultiParameterChaserD2Ev ## FFMultiParameterChaser::~FFMultiParameterChaser()
0000000001236e5d	movq	%rbx, %rdi
0000000001236e60	callq	__ZN31FFMachPortDispatchQueueCallbackD2Ev ## FFMachPortDispatchQueueCallback::~FFMachPortDispatchQueueCallback()
0000000001236e65	movq	%rbx, %rdi
0000000001236e68	addq	$0x8, %rsp
0000000001236e6c	popq	%rbx
0000000001236e6d	popq	%rbp
0000000001236e6e	jmp	0x1497404                       ## symbol stub for: __ZdlPv
0000000001236e73	movq	%rax, %rdi
0000000001236e76	callq	___clang_call_terminate
0000000001236e7b	nopl	(%rax,%rax)
__ZN30FFGraphAttachedParameterChaser10PostRenderEjRK14AudioTimeStampjjRK15AudioBufferList:
0000000001236e80	pushq	%rbp
0000000001236e81	movq	%rsp, %rbp
0000000001236e84	cvttsd2si	(%rdx), %rax
0000000001236e89	movq	0xc0(%rdi), %rcx
0000000001236e90	cmpq	%rax, %rcx
0000000001236e93	jle	0x1236e97
0000000001236e95	popq	%rbp
0000000001236e96	retq
0000000001236e97	addq	0xc8(%rdi), %rax
__ZN30FFGraphAttachedParameterChaser10PostRenderEjRK14AudioTimeStampjjRK15AudioBufferList:
0000000001236e80	pushq	%rbp
0000000001236e81	movq	%rsp, %rbp
0000000001236e84	cvttsd2si	(%rdx), %rax
0000000001236e89	movq	0xc0(%rdi), %rcx
0000000001236e90	cmpq	%rax, %rcx
0000000001236e93	jle	0x1236e97
0000000001236e95	popq	%rbp
0000000001236e96	retq
0000000001236e97	addq	0xc8(%rdi), %rax
0000000001236e9e	xchgq	%rax, 0xc0(%rdi)
0000000001236ea5	cmpb	$0x1, 0xd0(%rdi)
0000000001236eac	jne	0x1236eb4
0000000001236eae	movq	(%rdi), %rax
0000000001236eb1	popq	%rbp
0000000001236eb2	jmpq	*(%rax)
0000000001236eb4	movl	$0x1, %esi
0000000001236eb9	popq	%rbp
0000000001236eba	jmp	__ZN18FFMachPortCallback22SendEmptyMessageToPortEb ## FFMachPortCallback::SendEmptyMessageToPort(bool)
0000000001236ebf	nop
__ZThn296_N30FFGraphAttachedParameterChaserD1Ev:
0000000001236ec0	pushq	%rbp
0000000001236ec1	movq	%rsp, %rbp
0000000001236ec4	pushq	%r14
0000000001236ec6	pushq	%rbx
0000000001236ec7	movq	%rdi, %r14
0000000001236eca	leaq	-0x128(%rdi), %rbx
0000000001236ed1	leaq	0x6e6bd8(%rip), %rax
0000000001236ed8	movq	%rax, -0x128(%rdi)
0000000001236edf	movq	%rbx, %rdi
0000000001236ee2	callq	__ZN31FFMachPortDispatchQueueCallback15DetachFromQueueEv ## FFMachPortDispatchQueueCallback::DetachFromQueue()
0000000001236ee7	leaq	-0x50(%r14), %rdi
0000000001236eeb	callq	__ZN21STParameterEventQueueD1Ev ## STParameterEventQueue::~STParameterEventQueue()
0000000001236ef0	addq	$-0x108, %r14                   ## imm = 0xFEF8
0000000001236ef7	movq	%r14, %rdi
0000000001236efa	callq	__ZN22FFMultiParameterChaserD2Ev ## FFMultiParameterChaser::~FFMultiParameterChaser()
0000000001236eff	movq	%rbx, %rdi
0000000001236f02	popq	%rbx
0000000001236f03	popq	%r14
0000000001236f05	popq	%rbp
0000000001236f06	jmp	__ZN31FFMachPortDispatchQueueCallbackD2Ev ## FFMachPortDispatchQueueCallback::~FFMachPortDispatchQueueCallback()
0000000001236f0b	movq	%rax, %rdi
0000000001236f0e	callq	___clang_call_terminate
0000000001236f13	nopw	%cs:(%rax,%rax)
__ZThn296_N30FFGraphAttachedParameterChaserD0Ev:
0000000001236f20	pushq	%rbp
0000000001236f21	movq	%rsp, %rbp
0000000001236f24	pushq	%r14
0000000001236f26	pushq	%rbx
0000000001236f27	movq	%rdi, %r14
0000000001236f2a	leaq	-0x128(%rdi), %rbx
0000000001236f31	leaq	0x6e6b78(%rip), %rax
0000000001236f38	movq	%rax, -0x128(%rdi)
0000000001236f3f	movq	%rbx, %rdi
0000000001236f42	callq	__ZN31FFMachPortDispatchQueueCallback15DetachFromQueueEv ## FFMachPortDispatchQueueCallback::DetachFromQueue()
0000000001236f47	leaq	-0x50(%r14), %rdi
0000000001236f4b	callq	__ZN21STParameterEventQueueD1Ev ## STParameterEventQueue::~STParameterEventQueue()
0000000001236f50	addq	$-0x108, %r14                   ## imm = 0xFEF8
0000000001236f57	movq	%r14, %rdi
0000000001236f5a	callq	__ZN22FFMultiParameterChaserD2Ev ## FFMultiParameterChaser::~FFMultiParameterChaser()
0000000001236f5f	movq	%rbx, %rdi
0000000001236f62	callq	__ZN31FFMachPortDispatchQueueCallbackD2Ev ## FFMachPortDispatchQueueCallback::~FFMachPortDispatchQueueCallback()
0000000001236f67	movq	%rbx, %rdi
0000000001236f6a	popq	%rbx
0000000001236f6b	popq	%r14
0000000001236f6d	popq	%rbp
0000000001236f6e	jmp	0x1497404                       ## symbol stub for: __ZdlPv
0000000001236f73	movq	%rax, %rdi
0000000001236f76	callq	___clang_call_terminate
0000000001236f7b	nopl	(%rax,%rax)
