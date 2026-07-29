__ZN14OZChannelFrame24createOZChannelFrameInfoEv:
0000000000010cca	pushq	%rbp
0000000000010ccb	movq	%rsp, %rbp
0000000000010cce	subq	$0x20, %rsp
0000000000010cd2	movq	__ZZN14OZChannelFrame24createOZChannelFrameInfoEvE24_OZChannelFrameInfo_once(%rip), %rax ## OZChannelFrame::createOZChannelFrameInfo()::_OZChannelFrameInfo_once
0000000000010cd9	cmpq	$-0x1, %rax
0000000000010cdd	je	0x10d04
0000000000010cdf	leaq	-0x1(%rbp), %rax
0000000000010ce3	leaq	-0x18(%rbp), %rcx
0000000000010ce7	movq	%rax, (%rcx)
0000000000010cea	leaq	-0x10(%rbp), %rsi
0000000000010cee	movq	%rcx, (%rsi)
0000000000010cf1	leaq	__ZZN14OZChannelFrame24createOZChannelFrameInfoEvE24_OZChannelFrameInfo_once(%rip), %rdi ## OZChannelFrame::createOZChannelFrameInfo()::_OZChannelFrameInfo_once
0000000000010cf8	leaq	__ZNSt3__117__call_once_proxyB9nqe210106INS_5tupleIJOZN14OZChannelFrame24createOZChannelFrameInfoEvEUlvE_EEEEEvPv(%rip), %rdx ## void std::__1::__call_once_proxy[abi:nqe210106]<std::__1::tuple<OZChannelFrame::createOZChannelFrameInfo()::'lambda'()&&>>(void*)
0000000000010cff	callq	0xacdc8                         ## symbol stub for: __ZNSt3__111__call_onceERVmPvPFvS2_E
0000000000010d04	leaq	__ZN14OZChannelFrame19_OZChannelFrameInfoE(%rip), %rax ## OZChannelFrame::_OZChannelFrameInfo
0000000000010d0b	movq	(%rax), %rax
0000000000010d0e	addq	$0x20, %rsp
0000000000010d12	popq	%rbp
0000000000010d13	retq
