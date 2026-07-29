__ZN13OZChannelSeed23createOZChannelSeedInfoEv:
000000000000fcce	pushq	%rbp
000000000000fccf	movq	%rsp, %rbp
000000000000fcd2	subq	$0x20, %rsp
000000000000fcd6	movq	__ZZN13OZChannelSeed23createOZChannelSeedInfoEvE23_OZChannelSeedInfo_once(%rip), %rax ## OZChannelSeed::createOZChannelSeedInfo()::_OZChannelSeedInfo_once
000000000000fcdd	cmpq	$-0x1, %rax
000000000000fce1	je	0xfd08
000000000000fce3	leaq	-0x1(%rbp), %rax
000000000000fce7	leaq	-0x18(%rbp), %rcx
000000000000fceb	movq	%rax, (%rcx)
000000000000fcee	leaq	-0x10(%rbp), %rsi
000000000000fcf2	movq	%rcx, (%rsi)
000000000000fcf5	leaq	__ZZN13OZChannelSeed23createOZChannelSeedInfoEvE23_OZChannelSeedInfo_once(%rip), %rdi ## OZChannelSeed::createOZChannelSeedInfo()::_OZChannelSeedInfo_once
000000000000fcfc	leaq	__ZNSt3__117__call_once_proxyB9nqe210106INS_5tupleIJOZN13OZChannelSeed23createOZChannelSeedInfoEvEUlvE_EEEEEvPv(%rip), %rdx ## void std::__1::__call_once_proxy[abi:nqe210106]<std::__1::tuple<OZChannelSeed::createOZChannelSeedInfo()::'lambda'()&&>>(void*)
000000000000fd03	callq	0xacdc8                         ## symbol stub for: __ZNSt3__111__call_onceERVmPvPFvS2_E
000000000000fd08	leaq	__ZN13OZChannelSeed18_OZChannelSeedInfoE(%rip), %rax ## OZChannelSeed::_OZChannelSeedInfo
000000000000fd0f	movq	(%rax), %rax
000000000000fd12	addq	$0x20, %rsp
000000000000fd16	popq	%rbp
000000000000fd17	retq
