__ZN22OZChannelMoveableImageC1ERK8PCStringP15OZChannelFolderjj:
0000000000339680	pushq	%rbp
0000000000339681	movq	%rsp, %rbp
0000000000339684	pushq	%r15
0000000000339686	pushq	%r14
0000000000339688	pushq	%r13
000000000033968a	pushq	%r12
000000000033968c	pushq	%rbx
000000000033968d	subq	$0x18, %rsp
0000000000339691	movl	%r8d, %r14d
0000000000339694	movl	%ecx, %r15d
0000000000339697	movq	%rdx, %r12
000000000033969a	movq	%rsi, %r13
000000000033969d	movq	%rdi, %rbx
00000000003396a0	movq	__ZN30OZChannelMoveableImage_Factory13_instanceOnceE(%rip), %rax ## OZChannelMoveableImage_Factory::_instanceOnce
00000000003396a7	cmpq	$-0x1, %rax
00000000003396ab	je	0x3396d4
00000000003396ad	leaq	-0x29(%rbp), %rax
00000000003396b1	movq	%rax, -0x40(%rbp)
00000000003396b5	leaq	-0x40(%rbp), %rax
00000000003396b9	movq	%rax, -0x38(%rbp)
00000000003396bd	leaq	__ZN30OZChannelMoveableImage_Factory13_instanceOnceE(%rip), %rdi ## OZChannelMoveableImage_Factory::_instanceOnce
00000000003396c4	leaq	__ZNSt3__117__call_once_proxyB9nqe210106INS_5tupleIJOZN30OZChannelMoveableImage_Factory11getInstanceEvEUlvE_EEEEEvPv(%rip), %rdx ## void std::__1::__call_once_proxy[abi:nqe210106]<std::__1::tuple<OZChannelMoveableImage_Factory::getInstance()::'lambda'()&&>>(void*)
00000000003396cb	leaq	-0x38(%rbp), %rsi
00000000003396cf	callq	0x6dfb2e                        ## symbol stub for: __ZNSt3__111__call_onceERVmPvPFvS2_E
00000000003396d4	movq	__ZN30OZChannelMoveableImage_Factory9_instanceE(%rip), %rsi ## OZChannelMoveableImage_Factory::_instance
00000000003396db	movq	%rbx, %rdi
00000000003396de	movq	%r13, %rdx
00000000003396e1	movq	%r12, %rcx
00000000003396e4	movl	%r15d, %r8d
00000000003396e7	movl	%r14d, %r9d
00000000003396ea	callq	__ZN25OZChanElementOrFootageRefC2EP9OZFactoryRK8PCStringP15OZChannelFolderjj ## OZChanElementOrFootageRef::OZChanElementOrFootageRef(OZFactory*, PCString const&, OZChannelFolder*, unsigned int, unsigned int)
00000000003396ef	leaq	0x5164fa(%rip), %rax
00000000003396f6	movq	%rax, (%rbx)
00000000003396f9	leaq	0x516870(%rip), %rax
0000000000339700	movq	%rax, 0x10(%rbx)
0000000000339704	movq	$0x0, 0xa0(%rbx)
000000000033970f	movb	$0x0, 0xa8(%rbx)
0000000000339716	addq	$0x18, %rsp
000000000033971a	popq	%rbx
000000000033971b	popq	%r12
000000000033971d	popq	%r13
000000000033971f	popq	%r14
0000000000339721	popq	%r15
0000000000339723	popq	%rbp
0000000000339724	retq
0000000000339725	nopw	%cs:(%rax,%rax)
