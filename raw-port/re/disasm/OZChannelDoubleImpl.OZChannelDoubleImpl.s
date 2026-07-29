__ZN19OZChannelDoubleImplC2Ev:
00000000000a9d10	pushq	%rbp
00000000000a9d11	movq	%rsp, %rbp
00000000000a9d14	pushq	%r15
00000000000a9d16	pushq	%r14
00000000000a9d18	pushq	%rbx
00000000000a9d19	subq	$0x18, %rsp
00000000000a9d1d	movq	%rdi, %rbx
00000000000a9d20	movl	$0xb0, %edi
00000000000a9d25	callq	0x6dfca2                        ## symbol stub for: __Znwm
00000000000a9d2a	movq	%rax, %r14
00000000000a9d2d	movsd	0x65de03(%rip), %xmm0
00000000000a9d35	movsd	0x65de03(%rip), %xmm1
00000000000a9d3d	movsd	0x65b6db(%rip), %xmm2
00000000000a9d45	xorps	%xmm3, %xmm3
00000000000a9d48	movq	%rax, %rdi
00000000000a9d4b	callq	0x6dec16                        ## symbol stub for: __ZN7OZCurveC2Edddd
00000000000a9d50	leaq	__ZTV13OZCurveDouble(%rip), %rax ## vtable for OZCurveDouble
00000000000a9d57	addq	$0x10, %rax
00000000000a9d5b	movq	%rax, (%r14)
00000000000a9d5e	movq	0x7783d3(%rip), %rax            ## literal pool symbol address: __ZN24OZCurveDoubleSplineState13_instanceOnceE
00000000000a9d65	movq	(%rax), %rax
00000000000a9d68	cmpq	$-0x1, %rax
00000000000a9d6c	je	0xa9d95
00000000000a9d6e	leaq	-0x19(%rbp), %rax
00000000000a9d72	movq	%rax, -0x30(%rbp)
00000000000a9d76	leaq	-0x30(%rbp), %rax
00000000000a9d7a	movq	%rax, -0x28(%rbp)
00000000000a9d7e	movq	0x7783b3(%rip), %rdi            ## literal pool symbol address: __ZN24OZCurveDoubleSplineState13_instanceOnceE
00000000000a9d85	leaq	__ZNSt3__117__call_once_proxyB9nqe210106INS_5tupleIJOZN24OZCurveDoubleSplineState11getInstanceEvEUlvE_EEEEEvPv(%rip), %rdx ## void std::__1::__call_once_proxy[abi:nqe210106]<std::__1::tuple<OZCurveDoubleSplineState::getInstance()::'lambda'()&&>>(void*)
00000000000a9d8c	leaq	-0x28(%rbp), %rsi
00000000000a9d90	callq	0x6dfb2e                        ## symbol stub for: __ZNSt3__111__call_onceERVmPvPFvS2_E
00000000000a9d95	movq	0x7783a4(%rip), %rax            ## literal pool symbol address: __ZN24OZCurveDoubleSplineState9_instanceE
00000000000a9d9c	movq	(%rax), %rax
00000000000a9d9f	leaq	0x8(%rax), %rsi
00000000000a9da3	testq	%rax, %rax
00000000000a9da6	cmoveq	%rax, %rsi
00000000000a9daa	movq	%r14, %rdi
00000000000a9dad	callq	0x6debfe                        ## symbol stub for: __ZN7OZCurve14setSplineStateEP13OZSplineState
00000000000a9db2	xorps	%xmm0, %xmm0
00000000000a9db5	movq	%rbx, %rdi
00000000000a9db8	movq	%r14, %rsi
00000000000a9dbb	movl	$0x1, %edx
00000000000a9dc0	movl	$0x1, %ecx
00000000000a9dc5	callq	0x6dd9f8                        ## symbol stub for: __ZN13OZChannelImplC2EP7OZCurvedjb
00000000000a9dca	leaq	0x28(%rbx), %rdi
00000000000a9dce	movl	$0x64, %esi
00000000000a9dd3	callq	0x6dd638                        ## symbol stub for: __ZN11PCSingletonC2Ej
00000000000a9dd8	leaq	__ZTV19OZChannelDoubleImpl(%rip), %rax ## vtable for OZChannelDoubleImpl
00000000000a9ddf	leaq	0x10(%rax), %rcx
00000000000a9de3	movq	%rcx, (%rbx)
00000000000a9de6	addq	$0x30, %rax
00000000000a9dea	movq	%rax, 0x28(%rbx)
00000000000a9dee	addq	$0x18, %rsp
00000000000a9df2	popq	%rbx
00000000000a9df3	popq	%r14
00000000000a9df5	popq	%r15
00000000000a9df7	popq	%rbp
00000000000a9df8	retq
00000000000a9df9	movq	%rax, %r15
00000000000a9dfc	movq	%rbx, %rdi
00000000000a9dff	callq	0x6dd9fe                        ## symbol stub for: __ZN13OZChannelImplD2Ev
00000000000a9e04	movq	%r15, %rdi
00000000000a9e07	callq	0x6dd07a                        ## symbol stub for: __Unwind_Resume
00000000000a9e0c	movq	%rax, %r15
00000000000a9e0f	movq	%r14, %rdi
00000000000a9e12	callq	0x6dfc36                        ## symbol stub for: __ZdlPv
00000000000a9e17	movq	%r15, %rdi
00000000000a9e1a	callq	0x6dd07a                        ## symbol stub for: __Unwind_Resume
00000000000a9e1f	movq	%rax, %r15
00000000000a9e22	movq	%r14, %rdi
00000000000a9e25	callq	0x6dec1c                        ## symbol stub for: __ZN7OZCurveD2Ev
00000000000a9e2a	movq	%r14, %rdi
00000000000a9e2d	callq	0x6dfc36                        ## symbol stub for: __ZdlPv
00000000000a9e32	movq	%r15, %rdi
00000000000a9e35	callq	0x6dd07a                        ## symbol stub for: __Unwind_Resume
00000000000a9e3a	nopw	(%rax,%rax)
