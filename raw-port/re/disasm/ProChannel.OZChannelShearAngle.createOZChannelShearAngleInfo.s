__ZN19OZChannelShearAngle29createOZChannelShearAngleInfoEv:
00000000000056a4	pushq	%rbp
00000000000056a5	movq	%rsp, %rbp
00000000000056a8	subq	$0x20, %rsp
00000000000056ac	movq	__ZZN19OZChannelShearAngle29createOZChannelShearAngleInfoEvE29_OZChannelShearAngleInfo_once(%rip), %rax ## OZChannelShearAngle::createOZChannelShearAngleInfo()::_OZChannelShearAngleInfo_once
00000000000056b3	cmpq	$-0x1, %rax
00000000000056b7	je	0x56de
00000000000056b9	leaq	-0x1(%rbp), %rax
00000000000056bd	leaq	-0x18(%rbp), %rcx
00000000000056c1	movq	%rax, (%rcx)
00000000000056c4	leaq	-0x10(%rbp), %rsi
00000000000056c8	movq	%rcx, (%rsi)
00000000000056cb	leaq	__ZZN19OZChannelShearAngle29createOZChannelShearAngleInfoEvE29_OZChannelShearAngleInfo_once(%rip), %rdi ## OZChannelShearAngle::createOZChannelShearAngleInfo()::_OZChannelShearAngleInfo_once
00000000000056d2	leaq	__ZNSt3__117__call_once_proxyB9nqe210106INS_5tupleIJOZN19OZChannelShearAngle29createOZChannelShearAngleInfoEvEUlvE_EEEEEvPv(%rip), %rdx ## void std::__1::__call_once_proxy[abi:nqe210106]<std::__1::tuple<OZChannelShearAngle::createOZChannelShearAngleInfo()::'lambda'()&&>>(void*)
00000000000056d9	callq	0xacdc8                         ## symbol stub for: __ZNSt3__111__call_onceERVmPvPFvS2_E
00000000000056de	leaq	__ZN19OZChannelShearAngle24_OZChannelShearAngleInfoE(%rip), %rax ## OZChannelShearAngle::_OZChannelShearAngleInfo
00000000000056e5	movq	(%rax), %rax
00000000000056e8	addq	$0x20, %rsp
00000000000056ec	popq	%rbp
00000000000056ed	retq
