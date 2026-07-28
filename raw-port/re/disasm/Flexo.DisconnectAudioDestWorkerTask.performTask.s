__ZN29DisconnectAudioDestWorkerTask11performTaskEv:
0000000000d11ec0	pushq	%rbp
0000000000d11ec1	movq	%rsp, %rbp
0000000000d11ec4	pushq	%rbx
0000000000d11ec5	pushq	%rax
0000000000d11ec6	movq	%rdi, %rbx
0000000000d11ec9	leaq	-0x10(%rbp), %rdi
0000000000d11ecd	callq	0x14965f4                       ## symbol stub for: __ZN17PCAutoreleasePoolC1Ev
0000000000d11ed2	movq	0x8(%rbx), %rdi
0000000000d11ed6	movq	$0x0, 0x8(%rbx)
0000000000d11ede	testq	%rdi, %rdi
0000000000d11ee1	je	0xd11ee9
0000000000d11ee3	movq	(%rdi), %rax
0000000000d11ee6	callq	*0x8(%rax)
0000000000d11ee9	movq	0x18(%rbx), %rdi
0000000000d11eed	movq	0xedf244(%rip), %rsi
0000000000d11ef4	callq	*0xbdb7c6(%rip)                 ## Objc message: -[%rdi _notifyOfFirstDrawing:]
0000000000d11efa	testq	%rax, %rax
0000000000d11efd	je	0xd11f07
0000000000d11eff	movq	%rax, %rdi
0000000000d11f02	callq	__ZN23FFAudioPlaybackMediator23disableLiveUpdateThreadEv ## FFAudioPlaybackMediator::disableLiveUpdateThread()
0000000000d11f07	movq	0x10(%rbx), %rdi
0000000000d11f0b	callq	*0xbdb7f7(%rip)                 ## literal pool symbol address: _objc_release
0000000000d11f11	leaq	-0x10(%rbp), %rdi
0000000000d11f15	callq	0x14965fa                       ## symbol stub for: __ZN17PCAutoreleasePoolD1Ev
0000000000d11f1a	movq	0x18(%rbx), %rdi
0000000000d11f1e	movq	0xedf21b(%rip), %rsi
0000000000d11f25	callq	*0xbdb795(%rip)                 ## Objc message: -[%rdi _notifyOfFirstDrawing:]
0000000000d11f2b	movq	0x18(%rbx), %rdi
0000000000d11f2f	callq	*0xbdb7d3(%rip)                 ## literal pool symbol address: _objc_release
0000000000d11f35	addq	$0x8, %rsp
0000000000d11f39	popq	%rbx
0000000000d11f3a	popq	%rbp
0000000000d11f3b	retq
0000000000d11f3c	movq	%rax, %rbx
0000000000d11f3f	leaq	-0x10(%rbp), %rdi
0000000000d11f43	callq	0x14965fa                       ## symbol stub for: __ZN17PCAutoreleasePoolD1Ev
0000000000d11f48	movq	%rbx, %rdi
0000000000d11f4b	callq	0x1495d30                       ## symbol stub for: __Unwind_Resume
__ZN25FFAudioPlayerMeteringHook12AttachToNodeEP12FFAudioGraphP11FFAudioNodej:
0000000000d11f50	pushq	%rbp
0000000000d11f51	movq	%rsp, %rbp
0000000000d11f54	pushq	%r15
0000000000d11f56	pushq	%r14
0000000000d11f58	pushq	%r12
0000000000d11f5a	pushq	%rbx
