__ZN15OZChannelDouble26createOZChannelDoubleCurveEd:
00000000000a9570	pushq	%rbp
00000000000a9571	movq	%rsp, %rbp
00000000000a9574	pushq	%r14
00000000000a9576	pushq	%rbx
00000000000a9577	subq	$0x20, %rsp
00000000000a957b	movsd	%xmm0, -0x20(%rbp)
00000000000a9580	movl	$0xb0, %edi
00000000000a9585	callq	0x6dfca2                        ## symbol stub for: __Znwm
00000000000a958a	movq	%rax, %rbx
00000000000a958d	movsd	0x65e5a3(%rip), %xmm0
00000000000a9595	movsd	0x65e5a3(%rip), %xmm1
00000000000a959d	movsd	0x65be7b(%rip), %xmm2
00000000000a95a5	movq	%rax, %rdi
00000000000a95a8	movsd	-0x20(%rbp), %xmm3
00000000000a95ad	callq	0x6dec16                        ## symbol stub for: __ZN7OZCurveC2Edddd
00000000000a95b2	leaq	__ZTV13OZCurveDouble(%rip), %rax ## vtable for OZCurveDouble
00000000000a95b9	addq	$0x10, %rax
00000000000a95bd	movq	%rax, (%rbx)
00000000000a95c0	movq	0x778b71(%rip), %rax            ## literal pool symbol address: __ZN24OZCurveDoubleSplineState13_instanceOnceE
00000000000a95c7	movq	(%rax), %rax
00000000000a95ca	cmpq	$-0x1, %rax
00000000000a95ce	je	0xa95f7
00000000000a95d0	leaq	-0x11(%rbp), %rax
00000000000a95d4	movq	%rax, -0x30(%rbp)
00000000000a95d8	leaq	-0x30(%rbp), %rax
00000000000a95dc	movq	%rax, -0x28(%rbp)
00000000000a95e0	movq	0x778b51(%rip), %rdi            ## literal pool symbol address: __ZN24OZCurveDoubleSplineState13_instanceOnceE
00000000000a95e7	leaq	__ZNSt3__117__call_once_proxyB9nqe210106INS_5tupleIJOZN24OZCurveDoubleSplineState11getInstanceEvEUlvE_EEEEEvPv(%rip), %rdx ## void std::__1::__call_once_proxy[abi:nqe210106]<std::__1::tuple<OZCurveDoubleSplineState::getInstance()::'lambda'()&&>>(void*)
00000000000a95ee	leaq	-0x28(%rbp), %rsi
00000000000a95f2	callq	0x6dfb2e                        ## symbol stub for: __ZNSt3__111__call_onceERVmPvPFvS2_E
00000000000a95f7	movq	0x778b42(%rip), %rax            ## literal pool symbol address: __ZN24OZCurveDoubleSplineState9_instanceE
00000000000a95fe	movq	(%rax), %rax
00000000000a9601	leaq	0x8(%rax), %rsi
00000000000a9605	testq	%rax, %rax
00000000000a9608	cmoveq	%rax, %rsi
00000000000a960c	movq	%rbx, %rdi
00000000000a960f	callq	0x6debfe                        ## symbol stub for: __ZN7OZCurve14setSplineStateEP13OZSplineState
00000000000a9614	movq	%rbx, %rax
00000000000a9617	addq	$0x20, %rsp
00000000000a961b	popq	%rbx
00000000000a961c	popq	%r14
00000000000a961e	popq	%rbp
00000000000a961f	retq
00000000000a9620	movq	%rax, %r14
00000000000a9623	movq	%rbx, %rdi
00000000000a9626	callq	0x6dfc36                        ## symbol stub for: __ZdlPv
00000000000a962b	movq	%r14, %rdi
00000000000a962e	callq	0x6dd07a                        ## symbol stub for: __Unwind_Resume
00000000000a9633	movq	%rax, %r14
00000000000a9636	movq	%rbx, %rdi
00000000000a9639	callq	0x6dec1c                        ## symbol stub for: __ZN7OZCurveD2Ev
00000000000a963e	movq	%rbx, %rdi
00000000000a9641	callq	0x6dfc36                        ## symbol stub for: __ZdlPv
00000000000a9646	movq	%r14, %rdi
00000000000a9649	callq	0x6dd07a                        ## symbol stub for: __Unwind_Resume
00000000000a964e	nop
