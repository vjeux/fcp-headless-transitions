__ZN14OZChannelFrame24createOZChannelFrameImplEv:
0000000000010d14	pushq	%rbp
0000000000010d15	movq	%rsp, %rbp
0000000000010d18	subq	$0x20, %rsp
0000000000010d1c	movq	__ZZN14OZChannelFrame24createOZChannelFrameImplEvE24_OZChannelFrameImpl_once(%rip), %rax ## OZChannelFrame::createOZChannelFrameImpl()::_OZChannelFrameImpl_once
0000000000010d23	cmpq	$-0x1, %rax
0000000000010d27	je	0x10d4e
0000000000010d29	leaq	-0x1(%rbp), %rax
0000000000010d2d	leaq	-0x18(%rbp), %rcx
0000000000010d31	movq	%rax, (%rcx)
0000000000010d34	leaq	-0x10(%rbp), %rsi
0000000000010d38	movq	%rcx, (%rsi)
0000000000010d3b	leaq	__ZZN14OZChannelFrame24createOZChannelFrameImplEvE24_OZChannelFrameImpl_once(%rip), %rdi ## OZChannelFrame::createOZChannelFrameImpl()::_OZChannelFrameImpl_once
0000000000010d42	leaq	__ZNSt3__117__call_once_proxyB9nqe210106INS_5tupleIJOZN14OZChannelFrame24createOZChannelFrameImplEvEUlvE_EEEEEvPv(%rip), %rdx ## void std::__1::__call_once_proxy[abi:nqe210106]<std::__1::tuple<OZChannelFrame::createOZChannelFrameImpl()::'lambda'()&&>>(void*)
0000000000010d49	callq	0xacdc8                         ## symbol stub for: __ZNSt3__111__call_onceERVmPvPFvS2_E
0000000000010d4e	leaq	__ZN14OZChannelFrame19_OZChannelFrameImplE(%rip), %rax ## OZChannelFrame::_OZChannelFrameImpl
0000000000010d55	movq	(%rax), %rax
0000000000010d58	addq	$0x20, %rsp
0000000000010d5c	popq	%rbp
0000000000010d5d	retq
