__ZN17OZChannelTimecode27createOZChannelTimecodeImplEv:
0000000000011504	pushq	%rbp
0000000000011505	movq	%rsp, %rbp
0000000000011508	subq	$0x20, %rsp
000000000001150c	movq	__ZZN17OZChannelTimecode27createOZChannelTimecodeImplEvE27_OZChannelTimecodeImpl_once(%rip), %rax ## OZChannelTimecode::createOZChannelTimecodeImpl()::_OZChannelTimecodeImpl_once
0000000000011513	cmpq	$-0x1, %rax
0000000000011517	je	0x1153e
0000000000011519	leaq	-0x1(%rbp), %rax
000000000001151d	leaq	-0x18(%rbp), %rcx
0000000000011521	movq	%rax, (%rcx)
0000000000011524	leaq	-0x10(%rbp), %rsi
0000000000011528	movq	%rcx, (%rsi)
000000000001152b	leaq	__ZZN17OZChannelTimecode27createOZChannelTimecodeImplEvE27_OZChannelTimecodeImpl_once(%rip), %rdi ## OZChannelTimecode::createOZChannelTimecodeImpl()::_OZChannelTimecodeImpl_once
0000000000011532	leaq	__ZNSt3__117__call_once_proxyB9nqe210106INS_5tupleIJOZN17OZChannelTimecode27createOZChannelTimecodeImplEvEUlvE_EEEEEvPv(%rip), %rdx ## void std::__1::__call_once_proxy[abi:nqe210106]<std::__1::tuple<OZChannelTimecode::createOZChannelTimecodeImpl()::'lambda'()&&>>(void*)
0000000000011539	callq	0xacdc8                         ## symbol stub for: __ZNSt3__111__call_onceERVmPvPFvS2_E
000000000001153e	leaq	__ZN17OZChannelTimecode22_OZChannelTimecodeImplE(%rip), %rax ## OZChannelTimecode::_OZChannelTimecodeImpl
0000000000011545	movq	(%rax), %rax
0000000000011548	addq	$0x20, %rsp
000000000001154c	popq	%rbp
000000000001154d	retq
