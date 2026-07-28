__ZN26OZChannelAffectedNodesImplC2Ev:
000000000001d890	pushq	%rbp
000000000001d891	movq	%rsp, %rbp
000000000001d894	pushq	%r15
000000000001d896	pushq	%r14
000000000001d898	pushq	%rbx
000000000001d899	subq	$0x18, %rsp
000000000001d89d	movq	%rdi, %rbx
000000000001d8a0	movl	$0xb0, %edi
000000000001d8a5	callq	0x6dfca2                        ## symbol stub for: __Znwm
000000000001d8aa	movq	%rax, %r14
000000000001d8ad	movsd	0x6e83cb(%rip), %xmm1
000000000001d8b5	movsd	0x6e7b23(%rip), %xmm2
000000000001d8bd	xorps	%xmm0, %xmm0
000000000001d8c0	xorps	%xmm3, %xmm3
000000000001d8c3	movq	%rax, %rdi
000000000001d8c6	callq	0x6dec16                        ## symbol stub for: __ZN7OZCurveC2Edddd
000000000001d8cb	leaq	__ZTV11OZCurveEnum(%rip), %rax  ## vtable for OZCurveEnum
000000000001d8d2	addq	$0x10, %rax
000000000001d8d6	movq	%rax, (%r14)
000000000001d8d9	movq	0x804780(%rip), %rax            ## literal pool symbol address: __ZN22OZCurveEnumSplineState13_instanceOnceE
000000000001d8e0	movq	(%rax), %rax
000000000001d8e3	cmpq	$-0x1, %rax
000000000001d8e7	je	0x1d910
000000000001d8e9	leaq	-0x19(%rbp), %rax
000000000001d8ed	movq	%rax, -0x30(%rbp)
000000000001d8f1	leaq	-0x30(%rbp), %rax
000000000001d8f5	movq	%rax, -0x28(%rbp)
000000000001d8f9	movq	0x804760(%rip), %rdi            ## literal pool symbol address: __ZN22OZCurveEnumSplineState13_instanceOnceE
000000000001d900	leaq	__ZNSt3__117__call_once_proxyB9nqe210106INS_5tupleIJOZN22OZCurveEnumSplineState11getInstanceEvEUlvE_EEEEEvPv(%rip), %rdx ## void std::__1::__call_once_proxy[abi:nqe210106]<std::__1::tuple<OZCurveEnumSplineState::getInstance()::'lambda'()&&>>(void*)
000000000001d907	leaq	-0x28(%rbp), %rsi
000000000001d90b	callq	0x6dfb2e                        ## symbol stub for: __ZNSt3__111__call_onceERVmPvPFvS2_E
000000000001d910	movq	0x804751(%rip), %rax            ## literal pool symbol address: __ZN22OZCurveEnumSplineState9_instanceE
000000000001d917	movq	(%rax), %rax
000000000001d91a	leaq	0x8(%rax), %rsi
000000000001d91e	testq	%rax, %rax
000000000001d921	cmoveq	%rax, %rsi
000000000001d925	movq	%r14, %rdi
000000000001d928	callq	0x6debfe                        ## symbol stub for: __ZN7OZCurve14setSplineStateEP13OZSplineState
000000000001d92d	movq	0xa0(%r14), %rax
000000000001d934	movl	$0x0, 0x20(%rax)
000000000001d93b	movb	$0x0, 0x2(%rax)
000000000001d93f	movq	(%r14), %rax
000000000001d942	movq	%r14, %rdi
000000000001d945	xorl	%esi, %esi
000000000001d947	callq	*0x50(%rax)
000000000001d94a	xorps	%xmm0, %xmm0
000000000001d94d	movq	%rbx, %rdi
000000000001d950	movq	%r14, %rsi
000000000001d953	xorl	%edx, %edx
000000000001d955	movl	$0x1, %ecx
000000000001d95a	callq	0x6dd9f8                        ## symbol stub for: __ZN13OZChannelImplC2EP7OZCurvedjb
000000000001d95f	leaq	0x28(%rbx), %rdi
000000000001d963	movl	$0x64, %esi
000000000001d968	callq	0x6dd638                        ## symbol stub for: __ZN11PCSingletonC2Ej
000000000001d96d	leaq	__ZTV26OZChannelAffectedNodesImpl(%rip), %rax ## vtable for OZChannelAffectedNodesImpl
000000000001d974	leaq	0x10(%rax), %rcx
000000000001d978	movq	%rcx, (%rbx)
000000000001d97b	addq	$0x30, %rax
000000000001d97f	movq	%rax, 0x28(%rbx)
000000000001d983	addq	$0x18, %rsp
000000000001d987	popq	%rbx
000000000001d988	popq	%r14
000000000001d98a	popq	%r15
000000000001d98c	popq	%rbp
000000000001d98d	retq
000000000001d98e	movq	%rax, %r15
000000000001d991	movq	%rbx, %rdi
000000000001d994	callq	0x6dd9fe                        ## symbol stub for: __ZN13OZChannelImplD2Ev
000000000001d999	movq	%r15, %rdi
000000000001d99c	callq	0x6dd07a                        ## symbol stub for: __Unwind_Resume
000000000001d9a1	movq	%rax, %r15
000000000001d9a4	movq	%r14, %rdi
000000000001d9a7	callq	0x6dfc36                        ## symbol stub for: __ZdlPv
000000000001d9ac	movq	%r15, %rdi
000000000001d9af	callq	0x6dd07a                        ## symbol stub for: __Unwind_Resume
000000000001d9b4	movq	%rax, %r15
000000000001d9b7	movq	%r14, %rdi
000000000001d9ba	callq	0x6dec1c                        ## symbol stub for: __ZN7OZCurveD2Ev
000000000001d9bf	movq	%r14, %rdi
000000000001d9c2	callq	0x6dfc36                        ## symbol stub for: __ZdlPv
000000000001d9c7	movq	%r15, %rdi
000000000001d9ca	callq	0x6dd07a                        ## symbol stub for: __Unwind_Resume
000000000001d9cf	nop
