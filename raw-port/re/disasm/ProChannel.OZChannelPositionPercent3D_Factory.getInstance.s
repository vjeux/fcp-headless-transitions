__ZN34OZChannelPositionPercent3D_Factory11getInstanceEv:
00000000000a6186	movq	__ZN34OZChannelPositionPercent3D_Factory13_instanceOnceE(%rip), %rax ## OZChannelPositionPercent3D_Factory::_instanceOnce
00000000000a618d	cmpq	$-0x1, %rax
00000000000a6191	je	0xa61c5
00000000000a6193	pushq	%rbp
00000000000a6194	movq	%rsp, %rbp
00000000000a6197	subq	$0x20, %rsp
00000000000a619b	leaq	-0x1(%rbp), %rax
00000000000a619f	leaq	-0x18(%rbp), %rcx
00000000000a61a3	movq	%rax, (%rcx)
00000000000a61a6	leaq	-0x10(%rbp), %rsi
00000000000a61aa	movq	%rcx, (%rsi)
00000000000a61ad	leaq	__ZN34OZChannelPositionPercent3D_Factory13_instanceOnceE(%rip), %rdi ## OZChannelPositionPercent3D_Factory::_instanceOnce
00000000000a61b4	leaq	__ZNSt3__117__call_once_proxyB9nqe210106INS_5tupleIJOZN34OZChannelPositionPercent3D_Factory11getInstanceEvEUlvE_EEEEEvPv(%rip), %rdx ## void std::__1::__call_once_proxy[abi:nqe210106]<std::__1::tuple<OZChannelPositionPercent3D_Factory::getInstance()::'lambda'()&&>>(void*)
00000000000a61bb	callq	0xacdc8                         ## symbol stub for: __ZNSt3__111__call_onceERVmPvPFvS2_E
00000000000a61c0	addq	$0x20, %rsp
00000000000a61c4	popq	%rbp
00000000000a61c5	movq	__ZN34OZChannelPositionPercent3D_Factory9_instanceE(%rip), %rax ## OZChannelPositionPercent3D_Factory::_instance
00000000000a61cc	retq
00000000000a61cd	nop
