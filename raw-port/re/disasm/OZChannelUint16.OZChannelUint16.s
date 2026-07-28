__ZN15OZChannelUint16C2EiRK8PCStringP15OZChannelFolderjjP13OZChannelImplP13OZChannelInfo:
00000000005ae620	pushq	%rbp
00000000005ae621	movq	%rsp, %rbp
00000000005ae624	pushq	%r15
00000000005ae626	pushq	%r14
00000000005ae628	pushq	%r13
00000000005ae62a	pushq	%r12
00000000005ae62c	pushq	%rbx
00000000005ae62d	subq	$0x38, %rsp
00000000005ae631	movl	%r9d, -0x38(%rbp)
00000000005ae635	movl	%r8d, %r12d
00000000005ae638	movq	%rcx, %r13
00000000005ae63b	movq	%rdx, %r14
00000000005ae63e	movl	%esi, -0x4c(%rbp)
00000000005ae641	movq	%rdi, %rbx
00000000005ae644	movq	0x10(%rbp), %r15
00000000005ae648	callq	0x6dd2b4                        ## symbol stub for: __Z30getOZChannelUint16_FactoryBasev
00000000005ae64d	movq	0x18(%rbp), %rcx
00000000005ae651	movq	%rcx, 0x8(%rsp)
00000000005ae656	movq	%r15, (%rsp)
00000000005ae65a	movq	%rbx, %rdi
00000000005ae65d	movq	%rax, %rsi
00000000005ae660	movq	%r14, %rdx
00000000005ae663	movq	%r13, %rcx
00000000005ae666	movl	%r12d, %r8d
00000000005ae669	movl	-0x38(%rbp), %r9d
00000000005ae66d	callq	0x6df474                        ## symbol stub for: __ZN9OZChannelC2EP9OZFactoryRK8PCStringP15OZChannelFolderjjP13OZChannelImplP13OZChannelInfo
00000000005ae672	movq	0x27424f(%rip), %rax            ## literal pool symbol address: __ZTV15OZChannelUint16
00000000005ae679	leaq	0x10(%rax), %rcx
00000000005ae67d	movq	%rcx, (%rbx)
00000000005ae680	addq	$0x370, %rax                    ## imm = 0x370
00000000005ae686	movq	%rax, 0x10(%rbx)
00000000005ae68a	movq	__ZZN15OZChannelUint1625createOZChannelUint16InfoEvE25_OZChannelUint16Info_once(%rip), %rax ## OZChannelUint16::createOZChannelUint16Info()::_OZChannelUint16Info_once
00000000005ae691	cmpq	$-0x1, %rax
00000000005ae695	je	0x5ae6be
00000000005ae697	leaq	-0x29(%rbp), %rax
00000000005ae69b	movq	%rax, -0x48(%rbp)
00000000005ae69f	leaq	-0x48(%rbp), %rax
00000000005ae6a3	movq	%rax, -0x40(%rbp)
00000000005ae6a7	leaq	__ZZN15OZChannelUint1625createOZChannelUint16InfoEvE25_OZChannelUint16Info_once(%rip), %rdi ## OZChannelUint16::createOZChannelUint16Info()::_OZChannelUint16Info_once
00000000005ae6ae	leaq	__ZNSt3__117__call_once_proxyB9nqe210106INS_5tupleIJOZN15OZChannelUint1625createOZChannelUint16InfoEvEUlvE_EEEEEvPv(%rip), %rdx ## void std::__1::__call_once_proxy[abi:nqe210106]<std::__1::tuple<OZChannelUint16::createOZChannelUint16Info()::'lambda'()&&>>(void*)
00000000005ae6b5	leaq	-0x40(%rbp), %rsi
00000000005ae6b9	callq	0x6dfb2e                        ## symbol stub for: __ZNSt3__111__call_onceERVmPvPFvS2_E
00000000005ae6be	cmpq	$0x0, 0x18(%rbp)
00000000005ae6c3	je	0x5ae6e2
00000000005ae6c5	movq	0x88(%rbx), %rax
00000000005ae6cc	movq	%rax, 0x80(%rbx)
00000000005ae6d3	movq	__ZZN15OZChannelUint1625createOZChannelUint16ImplEvE25_OZChannelUint16Impl_once(%rip), %rax ## OZChannelUint16::createOZChannelUint16Impl()::_OZChannelUint16Impl_once
00000000005ae6da	cmpq	$-0x1, %rax
00000000005ae6de	jne	0x5ae707
00000000005ae6e0	jmp	0x5ae72e
00000000005ae6e2	movq	0x273617(%rip), %rax            ## literal pool symbol address: __ZN15OZChannelUint1620_OZChannelUint16InfoE
00000000005ae6e9	movq	(%rax), %rax
00000000005ae6ec	movq	%rax, 0x88(%rbx)
00000000005ae6f3	movq	%rax, 0x80(%rbx)
00000000005ae6fa	movq	__ZZN15OZChannelUint1625createOZChannelUint16ImplEvE25_OZChannelUint16Impl_once(%rip), %rax ## OZChannelUint16::createOZChannelUint16Impl()::_OZChannelUint16Impl_once
00000000005ae701	cmpq	$-0x1, %rax
00000000005ae705	je	0x5ae72e
00000000005ae707	leaq	-0x29(%rbp), %rax
00000000005ae70b	movq	%rax, -0x48(%rbp)
00000000005ae70f	leaq	-0x48(%rbp), %rax
00000000005ae713	movq	%rax, -0x40(%rbp)
00000000005ae717	leaq	__ZZN15OZChannelUint1625createOZChannelUint16ImplEvE25_OZChannelUint16Impl_once(%rip), %rdi ## OZChannelUint16::createOZChannelUint16Impl()::_OZChannelUint16Impl_once
00000000005ae71e	leaq	__ZNSt3__117__call_once_proxyB9nqe210106INS_5tupleIJOZN15OZChannelUint1625createOZChannelUint16ImplEvEUlvE_EEEEEvPv(%rip), %rdx ## void std::__1::__call_once_proxy[abi:nqe210106]<std::__1::tuple<OZChannelUint16::createOZChannelUint16Impl()::'lambda'()&&>>(void*)
00000000005ae725	leaq	-0x40(%rbp), %rsi
00000000005ae729	callq	0x6dfb2e                        ## symbol stub for: __ZNSt3__111__call_onceERVmPvPFvS2_E
00000000005ae72e	cmpq	$0x0, 0x10(%rbp)
00000000005ae733	je	0x5ae73b
00000000005ae735	movq	0x78(%rbx), %rax
00000000005ae739	jmp	0x5ae749
00000000005ae73b	movq	0x2735b6(%rip), %rax            ## literal pool symbol address: __ZN15OZChannelUint1620_OZChannelUint16ImplE
00000000005ae742	movq	(%rax), %rax
00000000005ae745	movq	%rax, 0x78(%rbx)
00000000005ae749	movq	%rax, 0x70(%rbx)
00000000005ae74d	cvtsi2sdl	-0x4c(%rbp), %xmm0
00000000005ae752	movq	%rbx, %rdi
00000000005ae755	movsd	%xmm0, -0x38(%rbp)
00000000005ae75a	callq	0x6df306                        ## symbol stub for: __ZN9OZChannel15setDefaultValueEd
00000000005ae75f	movq	%rbx, %rdi
00000000005ae762	movsd	-0x38(%rbp), %xmm0
00000000005ae767	xorl	%esi, %esi
00000000005ae769	callq	0x6df30c                        ## symbol stub for: __ZN9OZChannel15setInitialValueEdb
00000000005ae76e	addq	$0x38, %rsp
00000000005ae772	popq	%rbx
00000000005ae773	popq	%r12
00000000005ae775	popq	%r13
00000000005ae777	popq	%r14
00000000005ae779	popq	%r15
00000000005ae77b	popq	%rbp
00000000005ae77c	retq
00000000005ae77d	movq	%rax, %r14
00000000005ae780	movq	%rbx, %rdi
00000000005ae783	callq	0x6df480                        ## symbol stub for: __ZN9OZChannelD2Ev
00000000005ae788	movq	%r14, %rdi
00000000005ae78b	callq	0x6dd07a                        ## symbol stub for: __Unwind_Resume
