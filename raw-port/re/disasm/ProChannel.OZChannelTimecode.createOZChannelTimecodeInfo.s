__ZN17OZChannelTimecode27createOZChannelTimecodeInfoEv:
00000000000114ba	pushq	%rbp
00000000000114bb	movq	%rsp, %rbp
00000000000114be	subq	$0x20, %rsp
00000000000114c2	movq	__ZZN17OZChannelTimecode27createOZChannelTimecodeInfoEvE27_OZChannelTimecodeInfo_once(%rip), %rax ## OZChannelTimecode::createOZChannelTimecodeInfo()::_OZChannelTimecodeInfo_once
00000000000114c9	cmpq	$-0x1, %rax
00000000000114cd	je	0x114f4
00000000000114cf	leaq	-0x1(%rbp), %rax
00000000000114d3	leaq	-0x18(%rbp), %rcx
00000000000114d7	movq	%rax, (%rcx)
00000000000114da	leaq	-0x10(%rbp), %rsi
00000000000114de	movq	%rcx, (%rsi)
00000000000114e1	leaq	__ZZN17OZChannelTimecode27createOZChannelTimecodeInfoEvE27_OZChannelTimecodeInfo_once(%rip), %rdi ## OZChannelTimecode::createOZChannelTimecodeInfo()::_OZChannelTimecodeInfo_once
00000000000114e8	leaq	__ZNSt3__117__call_once_proxyB9nqe210106INS_5tupleIJOZN17OZChannelTimecode27createOZChannelTimecodeInfoEvEUlvE_EEEEEvPv(%rip), %rdx ## void std::__1::__call_once_proxy[abi:nqe210106]<std::__1::tuple<OZChannelTimecode::createOZChannelTimecodeInfo()::'lambda'()&&>>(void*)
00000000000114ef	callq	0xacdc8                         ## symbol stub for: __ZNSt3__111__call_onceERVmPvPFvS2_E
00000000000114f4	leaq	__ZN17OZChannelTimecode22_OZChannelTimecodeInfoE(%rip), %rax ## OZChannelTimecode::_OZChannelTimecodeInfo
00000000000114fb	movq	(%rax), %rax
00000000000114fe	addq	$0x20, %rsp
0000000000011502	popq	%rbp
0000000000011503	retq
