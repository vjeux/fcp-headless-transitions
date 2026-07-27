__ZN15OZChannelDoubleC2ERK8PCStringP15OZChannelFolderjjP13OZChannelImplP13OZChannelInfo:
00000000000c01a0	pushq	%rbp
00000000000c01a1	movq	%rsp, %rbp
00000000000c01a4	pushq	%r15
00000000000c01a6	pushq	%r14
00000000000c01a8	pushq	%r13
00000000000c01aa	pushq	%r12
00000000000c01ac	pushq	%rbx
00000000000c01ad	subq	$0x38, %rsp
00000000000c01b1	movq	%r9, %r15
00000000000c01b4	movl	%r8d, -0x44(%rbp)
00000000000c01b8	movl	%ecx, %r12d
00000000000c01bb	movq	%rdx, %r13
00000000000c01be	movq	%rsi, %r14
00000000000c01c1	movq	%rdi, %rbx
00000000000c01c4	callq	0x6dd2ae                        ## symbol stub for: __Z30getOZChannelDouble_FactoryBasev
00000000000c01c9	movq	0x10(%rbp), %rcx
00000000000c01cd	movq	%rcx, 0x8(%rsp)
00000000000c01d2	movq	%r15, -0x50(%rbp)
00000000000c01d6	movq	%r15, (%rsp)
00000000000c01da	movq	%rbx, %rdi
00000000000c01dd	movq	%rax, %rsi
00000000000c01e0	movq	%r14, %rdx
00000000000c01e3	movq	%r13, %rcx
00000000000c01e6	movl	%r12d, %r8d
00000000000c01e9	movl	-0x44(%rbp), %r9d
00000000000c01ed	callq	0x6df474                        ## symbol stub for: __ZN9OZChannelC2EP9OZFactoryRK8PCStringP15OZChannelFolderjjP13OZChannelImplP13OZChannelInfo
00000000000c01f2	movq	0x7626c7(%rip), %rax            ## literal pool symbol address: __ZTV15OZChannelDouble
00000000000c01f9	leaq	0x10(%rax), %rcx
00000000000c01fd	movq	%rcx, (%rbx)
00000000000c0200	addq	$0x370, %rax                    ## imm = 0x370
00000000000c0206	movq	%rax, 0x10(%rbx)
00000000000c020a	movq	__ZZN15OZChannelDouble25createOZChannelDoubleInfoEvE25_OZChannelDoubleInfo_once(%rip), %rax ## OZChannelDouble::createOZChannelDoubleInfo()::_OZChannelDoubleInfo_once
00000000000c0211	cmpq	$-0x1, %rax
00000000000c0215	je	0xc023e
00000000000c0217	leaq	-0x29(%rbp), %rax
00000000000c021b	movq	%rax, -0x40(%rbp)
00000000000c021f	leaq	-0x40(%rbp), %rax
00000000000c0223	movq	%rax, -0x38(%rbp)
00000000000c0227	leaq	__ZZN15OZChannelDouble25createOZChannelDoubleInfoEvE25_OZChannelDoubleInfo_once(%rip), %rdi ## OZChannelDouble::createOZChannelDoubleInfo()::_OZChannelDoubleInfo_once
00000000000c022e	leaq	__ZNSt3__117__call_once_proxyB9nqe210106INS_5tupleIJOZN15OZChannelDouble25createOZChannelDoubleInfoEvEUlvE_EEEEEvPv(%rip), %rdx ## void std::__1::__call_once_proxy[abi:nqe210106]<std::__1::tuple<OZChannelDouble::createOZChannelDoubleInfo()::'lambda'()&&>>(void*)
00000000000c0235	leaq	-0x38(%rbp), %rsi
00000000000c0239	callq	0x6dfb2e                        ## symbol stub for: __ZNSt3__111__call_onceERVmPvPFvS2_E
00000000000c023e	cmpq	$0x0, 0x10(%rbp)
00000000000c0243	je	0xc0262
00000000000c0245	movq	0x88(%rbx), %rax
00000000000c024c	movq	%rax, 0x80(%rbx)
00000000000c0253	movq	__ZZN15OZChannelDouble25createOZChannelDoubleImplEvE25_OZChannelDoubleImpl_once(%rip), %rax ## OZChannelDouble::createOZChannelDoubleImpl()::_OZChannelDoubleImpl_once
00000000000c025a	cmpq	$-0x1, %rax
00000000000c025e	jne	0xc0287
00000000000c0260	jmp	0xc02ae
00000000000c0262	movq	0x7618f7(%rip), %rax            ## literal pool symbol address: __ZN15OZChannelDouble20_OZChannelDoubleInfoE
00000000000c0269	movq	(%rax), %rax
00000000000c026c	movq	%rax, 0x88(%rbx)
00000000000c0273	movq	%rax, 0x80(%rbx)
00000000000c027a	movq	__ZZN15OZChannelDouble25createOZChannelDoubleImplEvE25_OZChannelDoubleImpl_once(%rip), %rax ## OZChannelDouble::createOZChannelDoubleImpl()::_OZChannelDoubleImpl_once
00000000000c0281	cmpq	$-0x1, %rax
00000000000c0285	je	0xc02ae
00000000000c0287	leaq	-0x29(%rbp), %rax
00000000000c028b	movq	%rax, -0x40(%rbp)
00000000000c028f	leaq	-0x40(%rbp), %rax
00000000000c0293	movq	%rax, -0x38(%rbp)
00000000000c0297	leaq	__ZZN15OZChannelDouble25createOZChannelDoubleImplEvE25_OZChannelDoubleImpl_once(%rip), %rdi ## OZChannelDouble::createOZChannelDoubleImpl()::_OZChannelDoubleImpl_once
00000000000c029e	leaq	__ZNSt3__117__call_once_proxyB9nqe210106INS_5tupleIJOZN15OZChannelDouble25createOZChannelDoubleImplEvEUlvE_EEEEEvPv(%rip), %rdx ## void std::__1::__call_once_proxy[abi:nqe210106]<std::__1::tuple<OZChannelDouble::createOZChannelDoubleImpl()::'lambda'()&&>>(void*)
00000000000c02a5	leaq	-0x38(%rbp), %rsi
00000000000c02a9	callq	0x6dfb2e                        ## symbol stub for: __ZNSt3__111__call_onceERVmPvPFvS2_E
00000000000c02ae	cmpq	$0x0, -0x50(%rbp)
00000000000c02b3	je	0xc02bb
00000000000c02b5	movq	0x78(%rbx), %rax
00000000000c02b9	jmp	0xc02c9
00000000000c02bb	movq	0x761896(%rip), %rax            ## literal pool symbol address: __ZN15OZChannelDouble20_OZChannelDoubleImplE
00000000000c02c2	movq	(%rax), %rax
00000000000c02c5	movq	%rax, 0x78(%rbx)
00000000000c02c9	movq	%rax, 0x70(%rbx)
00000000000c02cd	addq	$0x38, %rsp
00000000000c02d1	popq	%rbx
00000000000c02d2	popq	%r12
00000000000c02d4	popq	%r13
00000000000c02d6	popq	%r14
00000000000c02d8	popq	%r15
00000000000c02da	popq	%rbp
00000000000c02db	retq
00000000000c02dc	movq	%rax, %r14
00000000000c02df	movq	%rbx, %rdi
00000000000c02e2	callq	0x6df480                        ## symbol stub for: __ZN9OZChannelD2Ev
00000000000c02e7	movq	%r14, %rdi
00000000000c02ea	callq	0x6dd07a                        ## symbol stub for: __Unwind_Resume
00000000000c02ef	nop
