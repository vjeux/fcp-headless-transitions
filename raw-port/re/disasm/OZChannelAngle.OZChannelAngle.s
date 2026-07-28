__ZN14OZChannelAngleC2ERK8PCStringP15OZChannelFolderjjP13OZChannelImplP13OZChannelInfo:
00000000001d5340	pushq	%rbp
00000000001d5341	movq	%rsp, %rbp
00000000001d5344	pushq	%r15
00000000001d5346	pushq	%r14
00000000001d5348	pushq	%r13
00000000001d534a	pushq	%r12
00000000001d534c	pushq	%rbx
00000000001d534d	subq	$0x38, %rsp
00000000001d5351	movq	%r9, %r15
00000000001d5354	movl	%r8d, -0x44(%rbp)
00000000001d5358	movl	%ecx, %r12d
00000000001d535b	movq	%rdx, %r13
00000000001d535e	movq	%rsi, %r14
00000000001d5361	movq	%rdi, %rbx
00000000001d5364	callq	0x6dd2a8                        ## symbol stub for: __Z29getOZChannelAngle_FactoryBasev
00000000001d5369	movq	0x10(%rbp), %rcx
00000000001d536d	movq	%rcx, 0x8(%rsp)
00000000001d5372	movq	%r15, -0x50(%rbp)
00000000001d5376	movq	%r15, (%rsp)
00000000001d537a	movq	%rbx, %rdi
00000000001d537d	movq	%rax, %rsi
00000000001d5380	movq	%r14, %rdx
00000000001d5383	movq	%r13, %rcx
00000000001d5386	movl	%r12d, %r8d
00000000001d5389	movl	-0x44(%rbp), %r9d
00000000001d538d	callq	0x6df474                        ## symbol stub for: __ZN9OZChannelC2EP9OZFactoryRK8PCStringP15OZChannelFolderjjP13OZChannelImplP13OZChannelInfo
00000000001d5392	movq	0x64d50f(%rip), %rax            ## literal pool symbol address: __ZTV14OZChannelAngle
00000000001d5399	leaq	0x10(%rax), %rcx
00000000001d539d	movq	%rcx, (%rbx)
00000000001d53a0	addq	$0x370, %rax                    ## imm = 0x370
00000000001d53a6	movq	%rax, 0x10(%rbx)
00000000001d53aa	movq	__ZZN14OZChannelAngle24createOZChannelAngleInfoEvE24_OZChannelAngleInfo_once(%rip), %rax ## OZChannelAngle::createOZChannelAngleInfo()::_OZChannelAngleInfo_once
00000000001d53b1	cmpq	$-0x1, %rax
00000000001d53b5	je	0x1d53de
00000000001d53b7	leaq	-0x29(%rbp), %rax
00000000001d53bb	movq	%rax, -0x40(%rbp)
00000000001d53bf	leaq	-0x40(%rbp), %rax
00000000001d53c3	movq	%rax, -0x38(%rbp)
00000000001d53c7	leaq	__ZZN14OZChannelAngle24createOZChannelAngleInfoEvE24_OZChannelAngleInfo_once(%rip), %rdi ## OZChannelAngle::createOZChannelAngleInfo()::_OZChannelAngleInfo_once
00000000001d53ce	leaq	__ZNSt3__117__call_once_proxyB9nqe210106INS_5tupleIJOZN14OZChannelAngle24createOZChannelAngleInfoEvEUlvE_EEEEEvPv(%rip), %rdx ## void std::__1::__call_once_proxy[abi:nqe210106]<std::__1::tuple<OZChannelAngle::createOZChannelAngleInfo()::'lambda'()&&>>(void*)
00000000001d53d5	leaq	-0x38(%rbp), %rsi
00000000001d53d9	callq	0x6dfb2e                        ## symbol stub for: __ZNSt3__111__call_onceERVmPvPFvS2_E
00000000001d53de	cmpq	$0x0, 0x10(%rbp)
00000000001d53e3	je	0x1d5402
00000000001d53e5	movq	0x88(%rbx), %rax
00000000001d53ec	movq	%rax, 0x80(%rbx)
00000000001d53f3	movq	__ZZN14OZChannelAngle24createOZChannelAngleImplEvE24_OZChannelAngleImpl_once(%rip), %rax ## OZChannelAngle::createOZChannelAngleImpl()::_OZChannelAngleImpl_once
00000000001d53fa	cmpq	$-0x1, %rax
00000000001d53fe	jne	0x1d5427
00000000001d5400	jmp	0x1d544e
00000000001d5402	movq	0x64c56f(%rip), %rax            ## literal pool symbol address: __ZN14OZChannelAngle19_OZChannelAngleInfoE
00000000001d5409	movq	(%rax), %rax
00000000001d540c	movq	%rax, 0x88(%rbx)
00000000001d5413	movq	%rax, 0x80(%rbx)
00000000001d541a	movq	__ZZN14OZChannelAngle24createOZChannelAngleImplEvE24_OZChannelAngleImpl_once(%rip), %rax ## OZChannelAngle::createOZChannelAngleImpl()::_OZChannelAngleImpl_once
00000000001d5421	cmpq	$-0x1, %rax
00000000001d5425	je	0x1d544e
00000000001d5427	leaq	-0x29(%rbp), %rax
00000000001d542b	movq	%rax, -0x40(%rbp)
00000000001d542f	leaq	-0x40(%rbp), %rax
00000000001d5433	movq	%rax, -0x38(%rbp)
00000000001d5437	leaq	__ZZN14OZChannelAngle24createOZChannelAngleImplEvE24_OZChannelAngleImpl_once(%rip), %rdi ## OZChannelAngle::createOZChannelAngleImpl()::_OZChannelAngleImpl_once
00000000001d543e	leaq	__ZNSt3__117__call_once_proxyB9nqe210106INS_5tupleIJOZN14OZChannelAngle24createOZChannelAngleImplEvEUlvE_EEEEEvPv(%rip), %rdx ## void std::__1::__call_once_proxy[abi:nqe210106]<std::__1::tuple<OZChannelAngle::createOZChannelAngleImpl()::'lambda'()&&>>(void*)
00000000001d5445	leaq	-0x38(%rbp), %rsi
00000000001d5449	callq	0x6dfb2e                        ## symbol stub for: __ZNSt3__111__call_onceERVmPvPFvS2_E
00000000001d544e	cmpq	$0x0, -0x50(%rbp)
00000000001d5453	je	0x1d545b
00000000001d5455	movq	0x78(%rbx), %rax
00000000001d5459	jmp	0x1d5469
00000000001d545b	movq	0x64c50e(%rip), %rax            ## literal pool symbol address: __ZN14OZChannelAngle19_OZChannelAngleImplE
00000000001d5462	movq	(%rax), %rax
00000000001d5465	movq	%rax, 0x78(%rbx)
00000000001d5469	movq	%rax, 0x70(%rbx)
00000000001d546d	addq	$0x38, %rsp
00000000001d5471	popq	%rbx
00000000001d5472	popq	%r12
00000000001d5474	popq	%r13
00000000001d5476	popq	%r14
00000000001d5478	popq	%r15
00000000001d547a	popq	%rbp
00000000001d547b	retq
00000000001d547c	movq	%rax, %r14
00000000001d547f	movq	%rbx, %rdi
00000000001d5482	callq	0x6df480                        ## symbol stub for: __ZN9OZChannelD2Ev
00000000001d5487	movq	%r14, %rdi
00000000001d548a	callq	0x6dd07a                        ## symbol stub for: __Unwind_Resume
00000000001d548f	nop
