__ZN13OZChannelSeed23createOZChannelSeedImplEv:
000000000000fd18	pushq	%rbp
000000000000fd19	movq	%rsp, %rbp
000000000000fd1c	subq	$0x20, %rsp
000000000000fd20	movq	__ZZN13OZChannelSeed23createOZChannelSeedImplEvE23_OZChannelSeedImpl_once(%rip), %rax ## OZChannelSeed::createOZChannelSeedImpl()::_OZChannelSeedImpl_once
000000000000fd27	cmpq	$-0x1, %rax
000000000000fd2b	je	0xfd52
000000000000fd2d	leaq	-0x1(%rbp), %rax
000000000000fd31	leaq	-0x18(%rbp), %rcx
000000000000fd35	movq	%rax, (%rcx)
000000000000fd38	leaq	-0x10(%rbp), %rsi
000000000000fd3c	movq	%rcx, (%rsi)
000000000000fd3f	leaq	__ZZN13OZChannelSeed23createOZChannelSeedImplEvE23_OZChannelSeedImpl_once(%rip), %rdi ## OZChannelSeed::createOZChannelSeedImpl()::_OZChannelSeedImpl_once
000000000000fd46	leaq	__ZNSt3__117__call_once_proxyB9nqe210106INS_5tupleIJOZN13OZChannelSeed23createOZChannelSeedImplEvEUlvE_EEEEEvPv(%rip), %rdx ## void std::__1::__call_once_proxy[abi:nqe210106]<std::__1::tuple<OZChannelSeed::createOZChannelSeedImpl()::'lambda'()&&>>(void*)
000000000000fd4d	callq	0xacdc8                         ## symbol stub for: __ZNSt3__111__call_onceERVmPvPFvS2_E
000000000000fd52	leaq	__ZN13OZChannelSeed18_OZChannelSeedImplE(%rip), %rax ## OZChannelSeed::_OZChannelSeedImpl
000000000000fd59	movq	(%rax), %rax
000000000000fd5c	addq	$0x20, %rsp
000000000000fd60	popq	%rbp
000000000000fd61	retq
