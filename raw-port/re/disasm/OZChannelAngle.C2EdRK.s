__ZN14OZChannelAngleC2EdRK8PCStringP15OZChannelFolderjjP13OZChannelImplP13OZChannelInfo:
00000000000ac3e0	pushq	%rbp
00000000000ac3e1	movq	%rsp, %rbp
00000000000ac3e4	pushq	%r15
00000000000ac3e6	pushq	%r14
00000000000ac3e8	pushq	%r13
00000000000ac3ea	pushq	%r12
00000000000ac3ec	pushq	%rbx
00000000000ac3ed	subq	$0x48, %rsp
00000000000ac3f1	movq	%r9, %r15
00000000000ac3f4	movl	%r8d, -0x48(%rbp)
00000000000ac3f8	movl	%ecx, -0x44(%rbp)
00000000000ac3fb	movq	%rdx, %r13
00000000000ac3fe	movq	%rsi, %r14
00000000000ac401	movsd	%xmm0, -0x50(%rbp)
00000000000ac406	movq	%rdi, %rbx
00000000000ac409	movq	0x10(%rbp), %r12
00000000000ac40d	callq	0x6dd2a8                        ## symbol stub for: __Z29getOZChannelAngle_FactoryBasev
00000000000ac412	movq	%r12, 0x8(%rsp)
00000000000ac417	movq	%r15, -0x58(%rbp)
00000000000ac41b	movq	%r15, (%rsp)
00000000000ac41f	movq	%rbx, %rdi
00000000000ac422	movq	%rax, %rsi
00000000000ac425	movq	%r14, %rdx
00000000000ac428	movq	%r13, %rcx
00000000000ac42b	movl	-0x44(%rbp), %r8d
00000000000ac42f	movl	-0x48(%rbp), %r9d
00000000000ac433	callq	0x6df474                        ## symbol stub for: __ZN9OZChannelC2EP9OZFactoryRK8PCStringP15OZChannelFolderjjP13OZChannelImplP13OZChannelInfo
00000000000ac438	movq	0x776469(%rip), %rax            ## literal pool symbol address: __ZTV14OZChannelAngle
00000000000ac43f	leaq	0x10(%rax), %rcx
00000000000ac443	movq	%rcx, (%rbx)
00000000000ac446	addq	$0x370, %rax                    ## imm = 0x370
00000000000ac44c	movq	%rax, 0x10(%rbx)
00000000000ac450	movq	__ZZN14OZChannelAngle24createOZChannelAngleInfoEvE24_OZChannelAngleInfo_once(%rip), %rax ## OZChannelAngle::createOZChannelAngleInfo()::_OZChannelAngleInfo_once
00000000000ac457	cmpq	$-0x1, %rax
00000000000ac45b	je	0xac484
00000000000ac45d	leaq	-0x29(%rbp), %rax
00000000000ac461	movq	%rax, -0x40(%rbp)
00000000000ac465	leaq	-0x40(%rbp), %rax
00000000000ac469	movq	%rax, -0x38(%rbp)
00000000000ac46d	leaq	__ZZN14OZChannelAngle24createOZChannelAngleInfoEvE24_OZChannelAngleInfo_once(%rip), %rdi ## OZChannelAngle::createOZChannelAngleInfo()::_OZChannelAngleInfo_once
00000000000ac474	leaq	__ZNSt3__117__call_once_proxyB9nqe210106INS_5tupleIJOZN14OZChannelAngle24createOZChannelAngleInfoEvEUlvE_EEEEEvPv(%rip), %rdx ## void std::__1::__call_once_proxy[abi:nqe210106]<std::__1::tuple<OZChannelAngle::createOZChannelAngleInfo()::'lambda'()&&>>(void*)
00000000000ac47b	leaq	-0x38(%rbp), %rsi
00000000000ac47f	callq	0x6dfb2e                        ## symbol stub for: __ZNSt3__111__call_onceERVmPvPFvS2_E
00000000000ac484	cmpq	$0x0, 0x10(%rbp)
00000000000ac489	je	0xac4a8
00000000000ac48b	movq	0x88(%rbx), %rax
00000000000ac492	movq	%rax, 0x80(%rbx)
00000000000ac499	movq	__ZZN14OZChannelAngle24createOZChannelAngleImplEvE24_OZChannelAngleImpl_once(%rip), %rax ## OZChannelAngle::createOZChannelAngleImpl()::_OZChannelAngleImpl_once
00000000000ac4a0	cmpq	$-0x1, %rax
00000000000ac4a4	jne	0xac4cd
00000000000ac4a6	jmp	0xac4f4
00000000000ac4a8	movq	0x7754c9(%rip), %rax            ## literal pool symbol address: __ZN14OZChannelAngle19_OZChannelAngleInfoE
00000000000ac4af	movq	(%rax), %rax
00000000000ac4b2	movq	%rax, 0x88(%rbx)
00000000000ac4b9	movq	%rax, 0x80(%rbx)
00000000000ac4c0	movq	__ZZN14OZChannelAngle24createOZChannelAngleImplEvE24_OZChannelAngleImpl_once(%rip), %rax ## OZChannelAngle::createOZChannelAngleImpl()::_OZChannelAngleImpl_once
00000000000ac4c7	cmpq	$-0x1, %rax
00000000000ac4cb	je	0xac4f4
00000000000ac4cd	leaq	-0x29(%rbp), %rax
00000000000ac4d1	movq	%rax, -0x40(%rbp)
00000000000ac4d5	leaq	-0x40(%rbp), %rax
00000000000ac4d9	movq	%rax, -0x38(%rbp)
00000000000ac4dd	leaq	__ZZN14OZChannelAngle24createOZChannelAngleImplEvE24_OZChannelAngleImpl_once(%rip), %rdi ## OZChannelAngle::createOZChannelAngleImpl()::_OZChannelAngleImpl_once
00000000000ac4e4	leaq	__ZNSt3__117__call_once_proxyB9nqe210106INS_5tupleIJOZN14OZChannelAngle24createOZChannelAngleImplEvEUlvE_EEEEEvPv(%rip), %rdx ## void std::__1::__call_once_proxy[abi:nqe210106]<std::__1::tuple<OZChannelAngle::createOZChannelAngleImpl()::'lambda'()&&>>(void*)
00000000000ac4eb	leaq	-0x38(%rbp), %rsi
00000000000ac4ef	callq	0x6dfb2e                        ## symbol stub for: __ZNSt3__111__call_onceERVmPvPFvS2_E
00000000000ac4f4	cmpq	$0x0, -0x58(%rbp)
00000000000ac4f9	je	0xac501
00000000000ac4fb	movq	0x78(%rbx), %rax
00000000000ac4ff	jmp	0xac50f
00000000000ac501	movq	0x775468(%rip), %rax            ## literal pool symbol address: __ZN14OZChannelAngle19_OZChannelAngleImplE
00000000000ac508	movq	(%rax), %rax
00000000000ac50b	movq	%rax, 0x78(%rbx)
00000000000ac50f	movq	%rax, 0x70(%rbx)
00000000000ac513	movq	%rbx, %rdi
00000000000ac516	movsd	-0x50(%rbp), %xmm0
00000000000ac51b	callq	0x6df306                        ## symbol stub for: __ZN9OZChannel15setDefaultValueEd
00000000000ac520	movq	%rbx, %rdi
00000000000ac523	movsd	-0x50(%rbp), %xmm0
00000000000ac528	xorl	%esi, %esi
00000000000ac52a	callq	0x6df30c                        ## symbol stub for: __ZN9OZChannel15setInitialValueEdb
00000000000ac52f	addq	$0x48, %rsp
00000000000ac533	popq	%rbx
00000000000ac534	popq	%r12
00000000000ac536	popq	%r13
00000000000ac538	popq	%r14
00000000000ac53a	popq	%r15
00000000000ac53c	popq	%rbp
00000000000ac53d	retq
00000000000ac53e	movq	%rax, %r14
00000000000ac541	movq	%rbx, %rdi
00000000000ac544	callq	0x6df480                        ## symbol stub for: __ZN9OZChannelD2Ev
00000000000ac549	movq	%r14, %rdi
00000000000ac54c	callq	0x6dd07a                        ## symbol stub for: __Unwind_Resume
00000000000ac551	nopw	%cs:(%rax,%rax)
