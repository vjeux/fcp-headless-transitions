__ZN15OZChannelDoubleC2EiRK8PCStringP15OZChannelFolderjjP13OZChannelImplP13OZChannelInfo:
00000000000f5cb0	pushq	%rbp
00000000000f5cb1	movq	%rsp, %rbp
00000000000f5cb4	pushq	%r15
00000000000f5cb6	pushq	%r14
00000000000f5cb8	pushq	%r13
00000000000f5cba	pushq	%r12
00000000000f5cbc	pushq	%rbx
00000000000f5cbd	subq	$0x38, %rsp
00000000000f5cc1	movl	%r9d, -0x38(%rbp)
00000000000f5cc5	movl	%r8d, %r12d
00000000000f5cc8	movq	%rcx, %r13
00000000000f5ccb	movq	%rdx, %r14
00000000000f5cce	movl	%esi, -0x4c(%rbp)
00000000000f5cd1	movq	%rdi, %rbx
00000000000f5cd4	movq	0x10(%rbp), %r15
00000000000f5cd8	callq	0x6dd2ae                        ## symbol stub for: __Z30getOZChannelDouble_FactoryBasev
00000000000f5cdd	movq	0x18(%rbp), %rcx
00000000000f5ce1	movq	%rcx, 0x8(%rsp)
00000000000f5ce6	movq	%r15, (%rsp)
00000000000f5cea	movq	%rbx, %rdi
00000000000f5ced	movq	%rax, %rsi
00000000000f5cf0	movq	%r14, %rdx
00000000000f5cf3	movq	%r13, %rcx
00000000000f5cf6	movl	%r12d, %r8d
00000000000f5cf9	movl	-0x38(%rbp), %r9d
00000000000f5cfd	callq	0x6df474                        ## symbol stub for: __ZN9OZChannelC2EP9OZFactoryRK8PCStringP15OZChannelFolderjjP13OZChannelImplP13OZChannelInfo
00000000000f5d02	movq	0x72cbb7(%rip), %rax            ## literal pool symbol address: __ZTV15OZChannelDouble
00000000000f5d09	leaq	0x10(%rax), %rcx
00000000000f5d0d	movq	%rcx, (%rbx)
00000000000f5d10	addq	$0x370, %rax                    ## imm = 0x370
00000000000f5d16	movq	%rax, 0x10(%rbx)
00000000000f5d1a	movq	__ZZN15OZChannelDouble25createOZChannelDoubleInfoEvE25_OZChannelDoubleInfo_once(%rip), %rax ## OZChannelDouble::createOZChannelDoubleInfo()::_OZChannelDoubleInfo_once
00000000000f5d21	cmpq	$-0x1, %rax
00000000000f5d25	je	0xf5d4e
00000000000f5d27	leaq	-0x29(%rbp), %rax
00000000000f5d2b	movq	%rax, -0x48(%rbp)
00000000000f5d2f	leaq	-0x48(%rbp), %rax
00000000000f5d33	movq	%rax, -0x40(%rbp)
00000000000f5d37	leaq	__ZZN15OZChannelDouble25createOZChannelDoubleInfoEvE25_OZChannelDoubleInfo_once(%rip), %rdi ## OZChannelDouble::createOZChannelDoubleInfo()::_OZChannelDoubleInfo_once
00000000000f5d3e	leaq	__ZNSt3__117__call_once_proxyB9nqe210106INS_5tupleIJOZN15OZChannelDouble25createOZChannelDoubleInfoEvEUlvE_EEEEEvPv(%rip), %rdx ## void std::__1::__call_once_proxy[abi:nqe210106]<std::__1::tuple<OZChannelDouble::createOZChannelDoubleInfo()::'lambda'()&&>>(void*)
00000000000f5d45	leaq	-0x40(%rbp), %rsi
00000000000f5d49	callq	0x6dfb2e                        ## symbol stub for: __ZNSt3__111__call_onceERVmPvPFvS2_E
00000000000f5d4e	cmpq	$0x0, 0x18(%rbp)
00000000000f5d53	je	0xf5d72
00000000000f5d55	movq	0x88(%rbx), %rax
00000000000f5d5c	movq	%rax, 0x80(%rbx)
00000000000f5d63	movq	__ZZN15OZChannelDouble25createOZChannelDoubleImplEvE25_OZChannelDoubleImpl_once(%rip), %rax ## OZChannelDouble::createOZChannelDoubleImpl()::_OZChannelDoubleImpl_once
00000000000f5d6a	cmpq	$-0x1, %rax
00000000000f5d6e	jne	0xf5d97
00000000000f5d70	jmp	0xf5dbe
00000000000f5d72	movq	0x72bde7(%rip), %rax            ## literal pool symbol address: __ZN15OZChannelDouble20_OZChannelDoubleInfoE
00000000000f5d79	movq	(%rax), %rax
00000000000f5d7c	movq	%rax, 0x88(%rbx)
00000000000f5d83	movq	%rax, 0x80(%rbx)
00000000000f5d8a	movq	__ZZN15OZChannelDouble25createOZChannelDoubleImplEvE25_OZChannelDoubleImpl_once(%rip), %rax ## OZChannelDouble::createOZChannelDoubleImpl()::_OZChannelDoubleImpl_once
00000000000f5d91	cmpq	$-0x1, %rax
00000000000f5d95	je	0xf5dbe
00000000000f5d97	leaq	-0x29(%rbp), %rax
00000000000f5d9b	movq	%rax, -0x48(%rbp)
00000000000f5d9f	leaq	-0x48(%rbp), %rax
00000000000f5da3	movq	%rax, -0x40(%rbp)
00000000000f5da7	leaq	__ZZN15OZChannelDouble25createOZChannelDoubleImplEvE25_OZChannelDoubleImpl_once(%rip), %rdi ## OZChannelDouble::createOZChannelDoubleImpl()::_OZChannelDoubleImpl_once
00000000000f5dae	leaq	__ZNSt3__117__call_once_proxyB9nqe210106INS_5tupleIJOZN15OZChannelDouble25createOZChannelDoubleImplEvEUlvE_EEEEEvPv(%rip), %rdx ## void std::__1::__call_once_proxy[abi:nqe210106]<std::__1::tuple<OZChannelDouble::createOZChannelDoubleImpl()::'lambda'()&&>>(void*)
00000000000f5db5	leaq	-0x40(%rbp), %rsi
00000000000f5db9	callq	0x6dfb2e                        ## symbol stub for: __ZNSt3__111__call_onceERVmPvPFvS2_E
00000000000f5dbe	cmpq	$0x0, 0x10(%rbp)
00000000000f5dc3	je	0xf5dcb
00000000000f5dc5	movq	0x78(%rbx), %rax
00000000000f5dc9	jmp	0xf5dd9
00000000000f5dcb	movq	0x72bd86(%rip), %rax            ## literal pool symbol address: __ZN15OZChannelDouble20_OZChannelDoubleImplE
00000000000f5dd2	movq	(%rax), %rax
00000000000f5dd5	movq	%rax, 0x78(%rbx)
00000000000f5dd9	movq	%rax, 0x70(%rbx)
00000000000f5ddd	cvtsi2sdl	-0x4c(%rbp), %xmm0
00000000000f5de2	movq	%rbx, %rdi
00000000000f5de5	movsd	%xmm0, -0x38(%rbp)
00000000000f5dea	callq	0x6df306                        ## symbol stub for: __ZN9OZChannel15setDefaultValueEd
00000000000f5def	movq	%rbx, %rdi
00000000000f5df2	movsd	-0x38(%rbp), %xmm0
00000000000f5df7	xorl	%esi, %esi
00000000000f5df9	callq	0x6df30c                        ## symbol stub for: __ZN9OZChannel15setInitialValueEdb
00000000000f5dfe	addq	$0x38, %rsp
00000000000f5e02	popq	%rbx
00000000000f5e03	popq	%r12
00000000000f5e05	popq	%r13
00000000000f5e07	popq	%r14
00000000000f5e09	popq	%r15
00000000000f5e0b	popq	%rbp
00000000000f5e0c	retq
00000000000f5e0d	movq	%rax, %r14
00000000000f5e10	movq	%rbx, %rdi
00000000000f5e13	callq	0x6df480                        ## symbol stub for: __ZN9OZChannelD2Ev
00000000000f5e18	movq	%r14, %rdi
00000000000f5e1b	callq	0x6dd07a                        ## symbol stub for: __Unwind_Resume
