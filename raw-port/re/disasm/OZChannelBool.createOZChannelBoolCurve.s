__ZN13OZChannelBool24createOZChannelBoolCurveEd:
00000000000e0c60	pushq	%rbp
00000000000e0c61	movq	%rsp, %rbp
00000000000e0c64	pushq	%r14
00000000000e0c66	pushq	%rbx
00000000000e0c67	subq	$0x20, %rsp
00000000000e0c6b	movsd	%xmm0, -0x20(%rbp)
00000000000e0c70	movl	$0xb0, %edi
00000000000e0c75	callq	0x6dfca2                        ## symbol stub for: __Znwm
00000000000e0c7a	movq	%rax, %rbx
00000000000e0c7d	movsd	0x62475b(%rip), %xmm1
00000000000e0c85	xorps	%xmm0, %xmm0
00000000000e0c88	movq	%rax, %rdi
00000000000e0c8b	movaps	%xmm1, %xmm2
00000000000e0c8e	movsd	-0x20(%rbp), %xmm3
00000000000e0c93	callq	0x6dec16                        ## symbol stub for: __ZN7OZCurveC2Edddd
00000000000e0c98	leaq	__ZTV11OZCurveBool(%rip), %rax  ## vtable for OZCurveBool
00000000000e0c9f	addq	$0x10, %rax
00000000000e0ca3	movq	%rax, (%rbx)
00000000000e0ca6	movq	0x7413a3(%rip), %rax            ## literal pool symbol address: __ZN22OZCurveBoolSplineState13_instanceOnceE
00000000000e0cad	movq	(%rax), %rax
00000000000e0cb0	cmpq	$-0x1, %rax
00000000000e0cb4	je	0xe0cdd
00000000000e0cb6	leaq	-0x11(%rbp), %rax
00000000000e0cba	movq	%rax, -0x30(%rbp)
00000000000e0cbe	leaq	-0x30(%rbp), %rax
00000000000e0cc2	movq	%rax, -0x28(%rbp)
00000000000e0cc6	movq	0x741383(%rip), %rdi            ## literal pool symbol address: __ZN22OZCurveBoolSplineState13_instanceOnceE
00000000000e0ccd	leaq	__ZNSt3__117__call_once_proxyB9nqe210106INS_5tupleIJOZN22OZCurveBoolSplineState11getInstanceEvEUlvE_EEEEEvPv(%rip), %rdx ## void std::__1::__call_once_proxy[abi:nqe210106]<std::__1::tuple<OZCurveBoolSplineState::getInstance()::'lambda'()&&>>(void*)
00000000000e0cd4	leaq	-0x28(%rbp), %rsi
00000000000e0cd8	callq	0x6dfb2e                        ## symbol stub for: __ZNSt3__111__call_onceERVmPvPFvS2_E
00000000000e0cdd	movq	0x741374(%rip), %rax            ## literal pool symbol address: __ZN22OZCurveBoolSplineState9_instanceE
00000000000e0ce4	movq	(%rax), %rax
00000000000e0ce7	leaq	0x8(%rax), %rsi
00000000000e0ceb	testq	%rax, %rax
00000000000e0cee	cmoveq	%rax, %rsi
00000000000e0cf2	movq	%rbx, %rdi
00000000000e0cf5	callq	0x6debfe                        ## symbol stub for: __ZN7OZCurve14setSplineStateEP13OZSplineState
00000000000e0cfa	movq	0xa0(%rbx), %rax
00000000000e0d01	movl	$0x0, 0x20(%rax)
00000000000e0d08	movb	$0x0, 0x2(%rax)
00000000000e0d0c	movq	%rbx, %rax
00000000000e0d0f	addq	$0x20, %rsp
00000000000e0d13	popq	%rbx
00000000000e0d14	popq	%r14
00000000000e0d16	popq	%rbp
00000000000e0d17	retq
00000000000e0d18	movq	%rax, %r14
00000000000e0d1b	movq	%rbx, %rdi
00000000000e0d1e	callq	0x6dfc36                        ## symbol stub for: __ZdlPv
00000000000e0d23	movq	%r14, %rdi
00000000000e0d26	callq	0x6dd07a                        ## symbol stub for: __Unwind_Resume
00000000000e0d2b	movq	%rax, %r14
00000000000e0d2e	movq	%rbx, %rdi
00000000000e0d31	callq	0x6dec1c                        ## symbol stub for: __ZN7OZCurveD2Ev
00000000000e0d36	movq	%rbx, %rdi
00000000000e0d39	callq	0x6dfc36                        ## symbol stub for: __ZdlPv
00000000000e0d3e	movq	%r14, %rdi
00000000000e0d41	callq	0x6dd07a                        ## symbol stub for: __Unwind_Resume
00000000000e0d46	nopw	%cs:(%rax,%rax)
