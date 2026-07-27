__ZN15OZChannelDoubleC2EdRK8PCStringP15OZChannelFolderjjP13OZChannelImplP13OZChannelInfo:
00000000000a99f0	pushq	%rbp
00000000000a99f1	movq	%rsp, %rbp
00000000000a99f4	pushq	%r15
00000000000a99f6	pushq	%r14
00000000000a99f8	pushq	%r13
00000000000a99fa	pushq	%r12
00000000000a99fc	pushq	%rbx
00000000000a99fd	subq	$0x48, %rsp
00000000000a9a01	movq	%r9, %r15
00000000000a9a04	movl	%r8d, -0x48(%rbp)
00000000000a9a08	movl	%ecx, -0x44(%rbp)
00000000000a9a0b	movq	%rdx, %r13
00000000000a9a0e	movq	%rsi, %r14
00000000000a9a11	movsd	%xmm0, -0x50(%rbp)
00000000000a9a16	movq	%rdi, %rbx
00000000000a9a19	movq	0x10(%rbp), %r12
00000000000a9a1d	callq	0x6dd2ae                        ## symbol stub for: __Z30getOZChannelDouble_FactoryBasev
00000000000a9a22	movq	%r12, 0x8(%rsp)
00000000000a9a27	movq	%r15, -0x58(%rbp)
00000000000a9a2b	movq	%r15, (%rsp)
00000000000a9a2f	movq	%rbx, %rdi
00000000000a9a32	movq	%rax, %rsi
00000000000a9a35	movq	%r14, %rdx
00000000000a9a38	movq	%r13, %rcx
00000000000a9a3b	movl	-0x44(%rbp), %r8d
00000000000a9a3f	movl	-0x48(%rbp), %r9d
00000000000a9a43	callq	0x6df474                        ## symbol stub for: __ZN9OZChannelC2EP9OZFactoryRK8PCStringP15OZChannelFolderjjP13OZChannelImplP13OZChannelInfo
00000000000a9a48	movq	0x778e71(%rip), %rax            ## literal pool symbol address: __ZTV15OZChannelDouble
00000000000a9a4f	leaq	0x10(%rax), %rcx
00000000000a9a53	movq	%rcx, (%rbx)
00000000000a9a56	addq	$0x370, %rax                    ## imm = 0x370
00000000000a9a5c	movq	%rax, 0x10(%rbx)
00000000000a9a60	movq	__ZZN15OZChannelDouble25createOZChannelDoubleInfoEvE25_OZChannelDoubleInfo_once(%rip), %rax ## OZChannelDouble::createOZChannelDoubleInfo()::_OZChannelDoubleInfo_once
00000000000a9a67	cmpq	$-0x1, %rax
00000000000a9a6b	je	0xa9a94
00000000000a9a6d	leaq	-0x29(%rbp), %rax
00000000000a9a71	movq	%rax, -0x40(%rbp)
00000000000a9a75	leaq	-0x40(%rbp), %rax
00000000000a9a79	movq	%rax, -0x38(%rbp)
00000000000a9a7d	leaq	__ZZN15OZChannelDouble25createOZChannelDoubleInfoEvE25_OZChannelDoubleInfo_once(%rip), %rdi ## OZChannelDouble::createOZChannelDoubleInfo()::_OZChannelDoubleInfo_once
00000000000a9a84	leaq	__ZNSt3__117__call_once_proxyB9nqe210106INS_5tupleIJOZN15OZChannelDouble25createOZChannelDoubleInfoEvEUlvE_EEEEEvPv(%rip), %rdx ## void std::__1::__call_once_proxy[abi:nqe210106]<std::__1::tuple<OZChannelDouble::createOZChannelDoubleInfo()::'lambda'()&&>>(void*)
00000000000a9a8b	leaq	-0x38(%rbp), %rsi
00000000000a9a8f	callq	0x6dfb2e                        ## symbol stub for: __ZNSt3__111__call_onceERVmPvPFvS2_E
00000000000a9a94	cmpq	$0x0, 0x10(%rbp)
00000000000a9a99	je	0xa9ab8
00000000000a9a9b	movq	0x88(%rbx), %rax
00000000000a9aa2	movq	%rax, 0x80(%rbx)
00000000000a9aa9	movq	__ZZN15OZChannelDouble25createOZChannelDoubleImplEvE25_OZChannelDoubleImpl_once(%rip), %rax ## OZChannelDouble::createOZChannelDoubleImpl()::_OZChannelDoubleImpl_once
00000000000a9ab0	cmpq	$-0x1, %rax
00000000000a9ab4	jne	0xa9add
00000000000a9ab6	jmp	0xa9b04
00000000000a9ab8	movq	0x7780a1(%rip), %rax            ## literal pool symbol address: __ZN15OZChannelDouble20_OZChannelDoubleInfoE
00000000000a9abf	movq	(%rax), %rax
00000000000a9ac2	movq	%rax, 0x88(%rbx)
00000000000a9ac9	movq	%rax, 0x80(%rbx)
00000000000a9ad0	movq	__ZZN15OZChannelDouble25createOZChannelDoubleImplEvE25_OZChannelDoubleImpl_once(%rip), %rax ## OZChannelDouble::createOZChannelDoubleImpl()::_OZChannelDoubleImpl_once
00000000000a9ad7	cmpq	$-0x1, %rax
00000000000a9adb	je	0xa9b04
00000000000a9add	leaq	-0x29(%rbp), %rax
00000000000a9ae1	movq	%rax, -0x40(%rbp)
00000000000a9ae5	leaq	-0x40(%rbp), %rax
00000000000a9ae9	movq	%rax, -0x38(%rbp)
00000000000a9aed	leaq	__ZZN15OZChannelDouble25createOZChannelDoubleImplEvE25_OZChannelDoubleImpl_once(%rip), %rdi ## OZChannelDouble::createOZChannelDoubleImpl()::_OZChannelDoubleImpl_once
00000000000a9af4	leaq	__ZNSt3__117__call_once_proxyB9nqe210106INS_5tupleIJOZN15OZChannelDouble25createOZChannelDoubleImplEvEUlvE_EEEEEvPv(%rip), %rdx ## void std::__1::__call_once_proxy[abi:nqe210106]<std::__1::tuple<OZChannelDouble::createOZChannelDoubleImpl()::'lambda'()&&>>(void*)
00000000000a9afb	leaq	-0x38(%rbp), %rsi
00000000000a9aff	callq	0x6dfb2e                        ## symbol stub for: __ZNSt3__111__call_onceERVmPvPFvS2_E
00000000000a9b04	cmpq	$0x0, -0x58(%rbp)
00000000000a9b09	je	0xa9b11
00000000000a9b0b	movq	0x78(%rbx), %rax
00000000000a9b0f	jmp	0xa9b1f
00000000000a9b11	movq	0x778040(%rip), %rax            ## literal pool symbol address: __ZN15OZChannelDouble20_OZChannelDoubleImplE
00000000000a9b18	movq	(%rax), %rax
00000000000a9b1b	movq	%rax, 0x78(%rbx)
00000000000a9b1f	movq	%rax, 0x70(%rbx)
00000000000a9b23	movq	%rbx, %rdi
00000000000a9b26	movsd	-0x50(%rbp), %xmm0
00000000000a9b2b	callq	0x6df306                        ## symbol stub for: __ZN9OZChannel15setDefaultValueEd
00000000000a9b30	movq	%rbx, %rdi
00000000000a9b33	movsd	-0x50(%rbp), %xmm0
00000000000a9b38	xorl	%esi, %esi
00000000000a9b3a	callq	0x6df30c                        ## symbol stub for: __ZN9OZChannel15setInitialValueEdb
00000000000a9b3f	addq	$0x48, %rsp
00000000000a9b43	popq	%rbx
00000000000a9b44	popq	%r12
00000000000a9b46	popq	%r13
00000000000a9b48	popq	%r14
00000000000a9b4a	popq	%r15
00000000000a9b4c	popq	%rbp
00000000000a9b4d	retq
00000000000a9b4e	movq	%rax, %r14
00000000000a9b51	movq	%rbx, %rdi
00000000000a9b54	callq	0x6df480                        ## symbol stub for: __ZN9OZChannelD2Ev
00000000000a9b59	movq	%r14, %rdi
00000000000a9b5c	callq	0x6dd07a                        ## symbol stub for: __Unwind_Resume
00000000000a9b61	nopw	%cs:(%rax,%rax)
