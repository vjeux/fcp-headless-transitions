__ZN19OZChannelShearAngle29createOZChannelShearAngleImplEv:
00000000000056ee	pushq	%rbp
00000000000056ef	movq	%rsp, %rbp
00000000000056f2	subq	$0x20, %rsp
00000000000056f6	movq	__ZZN19OZChannelShearAngle29createOZChannelShearAngleImplEvE29_OZChannelShearAngleImpl_once(%rip), %rax ## OZChannelShearAngle::createOZChannelShearAngleImpl()::_OZChannelShearAngleImpl_once
00000000000056fd	cmpq	$-0x1, %rax
0000000000005701	je	0x5728
0000000000005703	leaq	-0x1(%rbp), %rax
0000000000005707	leaq	-0x18(%rbp), %rcx
000000000000570b	movq	%rax, (%rcx)
000000000000570e	leaq	-0x10(%rbp), %rsi
0000000000005712	movq	%rcx, (%rsi)
0000000000005715	leaq	__ZZN19OZChannelShearAngle29createOZChannelShearAngleImplEvE29_OZChannelShearAngleImpl_once(%rip), %rdi ## OZChannelShearAngle::createOZChannelShearAngleImpl()::_OZChannelShearAngleImpl_once
000000000000571c	leaq	__ZNSt3__117__call_once_proxyB9nqe210106INS_5tupleIJOZN19OZChannelShearAngle29createOZChannelShearAngleImplEvEUlvE_EEEEEvPv(%rip), %rdx ## void std::__1::__call_once_proxy[abi:nqe210106]<std::__1::tuple<OZChannelShearAngle::createOZChannelShearAngleImpl()::'lambda'()&&>>(void*)
0000000000005723	callq	0xacdc8                         ## symbol stub for: __ZNSt3__111__call_onceERVmPvPFvS2_E
0000000000005728	leaq	__ZN19OZChannelShearAngle24_OZChannelShearAngleImplE(%rip), %rax ## OZChannelShearAngle::_OZChannelShearAngleImpl
000000000000572f	movq	(%rax), %rax
0000000000005732	addq	$0x20, %rsp
0000000000005736	popq	%rbp
0000000000005737	retq
