__ZN14OZChannelAngle25createOZChannelAngleCurveEd:
00000000000ac100	pushq	%rbp
00000000000ac101	movq	%rsp, %rbp
00000000000ac104	pushq	%r14
00000000000ac106	pushq	%rbx
00000000000ac107	subq	$0x20, %rsp
00000000000ac10b	movsd	%xmm0, -0x20(%rbp)
00000000000ac110	movl	$0xb0, %edi
00000000000ac115	callq	0x6dfca2                        ## symbol stub for: __Znwm
00000000000ac11a	movq	%rax, %rbx
00000000000ac11d	movsd	0x65ba13(%rip), %xmm0
00000000000ac125	movsd	0x65ba13(%rip), %xmm1
00000000000ac12d	movsd	0x65ba33(%rip), %xmm2
00000000000ac135	movq	%rax, %rdi
00000000000ac138	movsd	-0x20(%rbp), %xmm3
00000000000ac13d	callq	0x6dec16                        ## symbol stub for: __ZN7OZCurveC2Edddd
00000000000ac142	leaq	__ZTV12OZCurveAngle(%rip), %rax ## vtable for OZCurveAngle
00000000000ac149	addq	$0x10, %rax
00000000000ac14d	movq	%rax, (%rbx)
00000000000ac150	movq	0x775fc1(%rip), %rax            ## literal pool symbol address: __ZN23OZCurveAngleSplineState13_instanceOnceE
00000000000ac157	movq	(%rax), %rax
00000000000ac15a	cmpq	$-0x1, %rax
00000000000ac15e	je	0xac187
00000000000ac160	leaq	-0x11(%rbp), %rax
00000000000ac164	movq	%rax, -0x30(%rbp)
00000000000ac168	leaq	-0x30(%rbp), %rax
00000000000ac16c	movq	%rax, -0x28(%rbp)
00000000000ac170	movq	0x775fa1(%rip), %rdi            ## literal pool symbol address: __ZN23OZCurveAngleSplineState13_instanceOnceE
00000000000ac177	leaq	__ZNSt3__117__call_once_proxyB9nqe210106INS_5tupleIJOZN23OZCurveAngleSplineState11getInstanceEvEUlvE_EEEEEvPv(%rip), %rdx ## void std::__1::__call_once_proxy[abi:nqe210106]<std::__1::tuple<OZCurveAngleSplineState::getInstance()::'lambda'()&&>>(void*)
00000000000ac17e	leaq	-0x28(%rbp), %rsi
00000000000ac182	callq	0x6dfb2e                        ## symbol stub for: __ZNSt3__111__call_onceERVmPvPFvS2_E
00000000000ac187	movq	0x775f92(%rip), %rax            ## literal pool symbol address: __ZN23OZCurveAngleSplineState9_instanceE
00000000000ac18e	movq	(%rax), %rax
00000000000ac191	leaq	0x8(%rax), %rsi
00000000000ac195	testq	%rax, %rax
00000000000ac198	cmoveq	%rax, %rsi
00000000000ac19c	movq	%rbx, %rdi
00000000000ac19f	callq	0x6debfe                        ## symbol stub for: __ZN7OZCurve14setSplineStateEP13OZSplineState
00000000000ac1a4	movq	%rbx, %rax
00000000000ac1a7	addq	$0x20, %rsp
00000000000ac1ab	popq	%rbx
00000000000ac1ac	popq	%r14
00000000000ac1ae	popq	%rbp
00000000000ac1af	retq
00000000000ac1b0	movq	%rax, %r14
00000000000ac1b3	movq	%rbx, %rdi
00000000000ac1b6	callq	0x6dfc36                        ## symbol stub for: __ZdlPv
00000000000ac1bb	movq	%r14, %rdi
00000000000ac1be	callq	0x6dd07a                        ## symbol stub for: __Unwind_Resume
00000000000ac1c3	movq	%rax, %r14
00000000000ac1c6	movq	%rbx, %rdi
00000000000ac1c9	callq	0x6dec1c                        ## symbol stub for: __ZN7OZCurveD2Ev
00000000000ac1ce	movq	%rbx, %rdi
00000000000ac1d1	callq	0x6dfc36                        ## symbol stub for: __ZdlPv
00000000000ac1d6	movq	%r14, %rdi
00000000000ac1d9	callq	0x6dd07a                        ## symbol stub for: __Unwind_Resume
00000000000ac1de	nop
