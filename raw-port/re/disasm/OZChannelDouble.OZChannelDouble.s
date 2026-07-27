__ZN15OZChannelDoubleC2EP9OZFactoryRK8PCStringjP13OZChannelImplP13OZChannelInfo:
00000000004ede50	pushq	%rbp
00000000004ede51	movq	%rsp, %rbp
00000000004ede54	pushq	%r15
00000000004ede56	pushq	%r14
00000000004ede58	pushq	%rbx
00000000004ede59	subq	$0x28, %rsp
00000000004ede5d	movq	%r9, %r15
00000000004ede60	movq	%r8, %r14
00000000004ede63	movl	%ecx, %r8d
00000000004ede66	movq	%rdi, %rbx
00000000004ede69	movq	%r9, 0x8(%rsp)
00000000004ede6e	movq	%r14, (%rsp)
00000000004ede72	xorl	%ecx, %ecx
00000000004ede74	xorl	%r9d, %r9d
00000000004ede77	callq	0x6df474                        ## symbol stub for: __ZN9OZChannelC2EP9OZFactoryRK8PCStringP15OZChannelFolderjjP13OZChannelImplP13OZChannelInfo
00000000004ede7c	movq	0x334a3d(%rip), %rax            ## literal pool symbol address: __ZTV15OZChannelDouble
00000000004ede83	leaq	0x10(%rax), %rcx
00000000004ede87	movq	%rcx, (%rbx)
00000000004ede8a	addq	$0x370, %rax                    ## imm = 0x370
00000000004ede90	movq	%rax, 0x10(%rbx)
00000000004ede94	movq	__ZZN15OZChannelDouble25createOZChannelDoubleInfoEvE25_OZChannelDoubleInfo_once(%rip), %rax ## OZChannelDouble::createOZChannelDoubleInfo()::_OZChannelDoubleInfo_once
00000000004ede9b	cmpq	$-0x1, %rax
00000000004ede9f	je	0x4edec8
00000000004edea1	leaq	-0x19(%rbp), %rax
00000000004edea5	movq	%rax, -0x30(%rbp)
00000000004edea9	leaq	-0x30(%rbp), %rax
00000000004edead	movq	%rax, -0x28(%rbp)
00000000004edeb1	leaq	__ZZN15OZChannelDouble25createOZChannelDoubleInfoEvE25_OZChannelDoubleInfo_once(%rip), %rdi ## OZChannelDouble::createOZChannelDoubleInfo()::_OZChannelDoubleInfo_once
00000000004edeb8	leaq	__ZNSt3__117__call_once_proxyB9nqe210106INS_5tupleIJOZN15OZChannelDouble25createOZChannelDoubleInfoEvEUlvE_EEEEEvPv(%rip), %rdx ## void std::__1::__call_once_proxy[abi:nqe210106]<std::__1::tuple<OZChannelDouble::createOZChannelDoubleInfo()::'lambda'()&&>>(void*)
00000000004edebf	leaq	-0x28(%rbp), %rsi
00000000004edec3	callq	0x6dfb2e                        ## symbol stub for: __ZNSt3__111__call_onceERVmPvPFvS2_E
00000000004edec8	testq	%r15, %r15
00000000004edecb	je	0x4edeea
00000000004edecd	movq	0x88(%rbx), %rax
00000000004eded4	movq	%rax, 0x80(%rbx)
00000000004ededb	movq	__ZZN15OZChannelDouble25createOZChannelDoubleImplEvE25_OZChannelDoubleImpl_once(%rip), %rax ## OZChannelDouble::createOZChannelDoubleImpl()::_OZChannelDoubleImpl_once
00000000004edee2	cmpq	$-0x1, %rax
00000000004edee6	jne	0x4edf0f
00000000004edee8	jmp	0x4edf36
00000000004edeea	movq	0x333c6f(%rip), %rax            ## literal pool symbol address: __ZN15OZChannelDouble20_OZChannelDoubleInfoE
00000000004edef1	movq	(%rax), %rax
00000000004edef4	movq	%rax, 0x88(%rbx)
00000000004edefb	movq	%rax, 0x80(%rbx)
00000000004edf02	movq	__ZZN15OZChannelDouble25createOZChannelDoubleImplEvE25_OZChannelDoubleImpl_once(%rip), %rax ## OZChannelDouble::createOZChannelDoubleImpl()::_OZChannelDoubleImpl_once
00000000004edf09	cmpq	$-0x1, %rax
00000000004edf0d	je	0x4edf36
00000000004edf0f	leaq	-0x19(%rbp), %rax
00000000004edf13	movq	%rax, -0x30(%rbp)
00000000004edf17	leaq	-0x30(%rbp), %rax
00000000004edf1b	movq	%rax, -0x28(%rbp)
00000000004edf1f	leaq	__ZZN15OZChannelDouble25createOZChannelDoubleImplEvE25_OZChannelDoubleImpl_once(%rip), %rdi ## OZChannelDouble::createOZChannelDoubleImpl()::_OZChannelDoubleImpl_once
00000000004edf26	leaq	__ZNSt3__117__call_once_proxyB9nqe210106INS_5tupleIJOZN15OZChannelDouble25createOZChannelDoubleImplEvEUlvE_EEEEEvPv(%rip), %rdx ## void std::__1::__call_once_proxy[abi:nqe210106]<std::__1::tuple<OZChannelDouble::createOZChannelDoubleImpl()::'lambda'()&&>>(void*)
00000000004edf2d	leaq	-0x28(%rbp), %rsi
00000000004edf31	callq	0x6dfb2e                        ## symbol stub for: __ZNSt3__111__call_onceERVmPvPFvS2_E
00000000004edf36	testq	%r14, %r14
00000000004edf39	je	0x4edf41
00000000004edf3b	movq	0x78(%rbx), %rax
00000000004edf3f	jmp	0x4edf4f
00000000004edf41	movq	0x333c10(%rip), %rax            ## literal pool symbol address: __ZN15OZChannelDouble20_OZChannelDoubleImplE
00000000004edf48	movq	(%rax), %rax
00000000004edf4b	movq	%rax, 0x78(%rbx)
00000000004edf4f	movq	%rax, 0x70(%rbx)
00000000004edf53	addq	$0x28, %rsp
00000000004edf57	popq	%rbx
00000000004edf58	popq	%r14
00000000004edf5a	popq	%r15
00000000004edf5c	popq	%rbp
00000000004edf5d	retq
00000000004edf5e	movq	%rax, %r14
00000000004edf61	movq	%rbx, %rdi
00000000004edf64	callq	0x6df480                        ## symbol stub for: __ZN9OZChannelD2Ev
00000000004edf69	movq	%r14, %rdi
00000000004edf6c	callq	0x6dd07a                        ## symbol stub for: __Unwind_Resume
00000000004edf71	nopw	%cs:(%rax,%rax)
