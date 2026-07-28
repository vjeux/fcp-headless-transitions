__ZN13OZChannelEnum24createOZChannelEnumCurveEd:
00000000000ab460	pushq	%rbp
00000000000ab461	movq	%rsp, %rbp
00000000000ab464	pushq	%r14
00000000000ab466	pushq	%rbx
00000000000ab467	subq	$0x20, %rsp
00000000000ab46b	movsd	%xmm0, -0x20(%rbp)
00000000000ab470	movl	$0xb0, %edi
00000000000ab475	callq	0x6dfca2                        ## symbol stub for: __Znwm
00000000000ab47a	movq	%rax, %rbx
00000000000ab47d	movsd	0x65a7fb(%rip), %xmm1
00000000000ab485	movsd	0x659f53(%rip), %xmm2
00000000000ab48d	xorps	%xmm0, %xmm0
00000000000ab490	movq	%rax, %rdi
00000000000ab493	movsd	-0x20(%rbp), %xmm3
00000000000ab498	callq	0x6dec16                        ## symbol stub for: __ZN7OZCurveC2Edddd
00000000000ab49d	leaq	__ZTV11OZCurveEnum(%rip), %rax  ## vtable for OZCurveEnum
00000000000ab4a4	addq	$0x10, %rax
00000000000ab4a8	movq	%rax, (%rbx)
00000000000ab4ab	movq	0x776bae(%rip), %rax            ## literal pool symbol address: __ZN22OZCurveEnumSplineState13_instanceOnceE
00000000000ab4b2	movq	(%rax), %rax
00000000000ab4b5	cmpq	$-0x1, %rax
00000000000ab4b9	je	0xab4e2
00000000000ab4bb	leaq	-0x11(%rbp), %rax
00000000000ab4bf	movq	%rax, -0x30(%rbp)
00000000000ab4c3	leaq	-0x30(%rbp), %rax
00000000000ab4c7	movq	%rax, -0x28(%rbp)
00000000000ab4cb	movq	0x776b8e(%rip), %rdi            ## literal pool symbol address: __ZN22OZCurveEnumSplineState13_instanceOnceE
00000000000ab4d2	leaq	__ZNSt3__117__call_once_proxyB9nqe210106INS_5tupleIJOZN22OZCurveEnumSplineState11getInstanceEvEUlvE_EEEEEvPv(%rip), %rdx ## void std::__1::__call_once_proxy[abi:nqe210106]<std::__1::tuple<OZCurveEnumSplineState::getInstance()::'lambda'()&&>>(void*)
00000000000ab4d9	leaq	-0x28(%rbp), %rsi
00000000000ab4dd	callq	0x6dfb2e                        ## symbol stub for: __ZNSt3__111__call_onceERVmPvPFvS2_E
00000000000ab4e2	movq	0x776b7f(%rip), %rax            ## literal pool symbol address: __ZN22OZCurveEnumSplineState9_instanceE
00000000000ab4e9	movq	(%rax), %rax
00000000000ab4ec	leaq	0x8(%rax), %rsi
00000000000ab4f0	testq	%rax, %rax
00000000000ab4f3	cmoveq	%rax, %rsi
00000000000ab4f7	movq	%rbx, %rdi
00000000000ab4fa	callq	0x6debfe                        ## symbol stub for: __ZN7OZCurve14setSplineStateEP13OZSplineState
00000000000ab4ff	movq	0xa0(%rbx), %rax
00000000000ab506	movl	$0x0, 0x20(%rax)
00000000000ab50d	movb	$0x0, 0x2(%rax)
00000000000ab511	movq	(%rbx), %rax
00000000000ab514	movq	%rbx, %rdi
00000000000ab517	xorl	%esi, %esi
00000000000ab519	callq	*0x50(%rax)
00000000000ab51c	movq	%rbx, %rax
00000000000ab51f	addq	$0x20, %rsp
00000000000ab523	popq	%rbx
00000000000ab524	popq	%r14
00000000000ab526	popq	%rbp
00000000000ab527	retq
00000000000ab528	movq	%rax, %r14
00000000000ab52b	movq	%rbx, %rdi
00000000000ab52e	callq	0x6dfc36                        ## symbol stub for: __ZdlPv
00000000000ab533	movq	%r14, %rdi
00000000000ab536	callq	0x6dd07a                        ## symbol stub for: __Unwind_Resume
00000000000ab53b	movq	%rax, %r14
00000000000ab53e	movq	%rbx, %rdi
00000000000ab541	callq	0x6dec1c                        ## symbol stub for: __ZN7OZCurveD2Ev
00000000000ab546	movq	%rbx, %rdi
00000000000ab549	callq	0x6dfc36                        ## symbol stub for: __ZdlPv
00000000000ab54e	movq	%r14, %rdi
00000000000ab551	callq	0x6dd07a                        ## symbol stub for: __Unwind_Resume
00000000000ab556	nopw	%cs:(%rax,%rax)
