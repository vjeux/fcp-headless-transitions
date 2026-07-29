__ZN22OZChannelMoveableImageC2ERK8PCStringP15OZChannelFolderjj:
00000000003395d0	pushq	%rbp
00000000003395d1	movq	%rsp, %rbp
00000000003395d4	pushq	%r15
00000000003395d6	pushq	%r14
00000000003395d8	pushq	%r13
00000000003395da	pushq	%r12
00000000003395dc	pushq	%rbx
00000000003395dd	subq	$0x18, %rsp
00000000003395e1	movl	%r8d, %r14d
00000000003395e4	movl	%ecx, %r15d
00000000003395e7	movq	%rdx, %r12
00000000003395ea	movq	%rsi, %r13
00000000003395ed	movq	%rdi, %rbx
00000000003395f0	movq	__ZN30OZChannelMoveableImage_Factory13_instanceOnceE(%rip), %rax ## OZChannelMoveableImage_Factory::_instanceOnce
00000000003395f7	cmpq	$-0x1, %rax
00000000003395fb	je	0x339624
00000000003395fd	leaq	-0x29(%rbp), %rax
0000000000339601	movq	%rax, -0x40(%rbp)
0000000000339605	leaq	-0x40(%rbp), %rax
0000000000339609	movq	%rax, -0x38(%rbp)
000000000033960d	leaq	__ZN30OZChannelMoveableImage_Factory13_instanceOnceE(%rip), %rdi ## OZChannelMoveableImage_Factory::_instanceOnce
0000000000339614	leaq	__ZNSt3__117__call_once_proxyB9nqe210106INS_5tupleIJOZN30OZChannelMoveableImage_Factory11getInstanceEvEUlvE_EEEEEvPv(%rip), %rdx ## void std::__1::__call_once_proxy[abi:nqe210106]<std::__1::tuple<OZChannelMoveableImage_Factory::getInstance()::'lambda'()&&>>(void*)
000000000033961b	leaq	-0x38(%rbp), %rsi
000000000033961f	callq	0x6dfb2e                        ## symbol stub for: __ZNSt3__111__call_onceERVmPvPFvS2_E
0000000000339624	movq	__ZN30OZChannelMoveableImage_Factory9_instanceE(%rip), %rsi ## OZChannelMoveableImage_Factory::_instance
000000000033962b	movq	%rbx, %rdi
000000000033962e	movq	%r13, %rdx
0000000000339631	movq	%r12, %rcx
0000000000339634	movl	%r15d, %r8d
0000000000339637	movl	%r14d, %r9d
000000000033963a	callq	__ZN25OZChanElementOrFootageRefC2EP9OZFactoryRK8PCStringP15OZChannelFolderjj ## OZChanElementOrFootageRef::OZChanElementOrFootageRef(OZFactory*, PCString const&, OZChannelFolder*, unsigned int, unsigned int)
000000000033963f	leaq	0x5165aa(%rip), %rax
0000000000339646	movq	%rax, (%rbx)
0000000000339649	leaq	0x516920(%rip), %rax
0000000000339650	movq	%rax, 0x10(%rbx)
0000000000339654	movq	$0x0, 0xa0(%rbx)
000000000033965f	movb	$0x0, 0xa8(%rbx)
0000000000339666	addq	$0x18, %rsp
000000000033966a	popq	%rbx
000000000033966b	popq	%r12
000000000033966d	popq	%r13
000000000033966f	popq	%r14
0000000000339671	popq	%r15
0000000000339673	popq	%rbp
0000000000339674	retq
0000000000339675	nopw	%cs:(%rax,%rax)
