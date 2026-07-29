__ZN14OZChannelColor24OZChannelColor_alphaInfo11getInstanceEv:
0000000000054aca	movq	__ZZN14OZChannelColor24OZChannelColor_alphaInfo11getInstanceEvE29OZChannelColor_alphaInfo_once(%rip), %rax ## OZChannelColor::OZChannelColor_alphaInfo::getInstance()::OZChannelColor_alphaInfo_once
0000000000054ad1	cmpq	$-0x1, %rax
0000000000054ad5	je	0x54b09
0000000000054ad7	pushq	%rbp
0000000000054ad8	movq	%rsp, %rbp
0000000000054adb	subq	$0x20, %rsp
0000000000054adf	leaq	-0x1(%rbp), %rax
0000000000054ae3	leaq	-0x18(%rbp), %rcx
0000000000054ae7	movq	%rax, (%rcx)
0000000000054aea	leaq	-0x10(%rbp), %rsi
0000000000054aee	movq	%rcx, (%rsi)
0000000000054af1	leaq	__ZZN14OZChannelColor24OZChannelColor_alphaInfo11getInstanceEvE29OZChannelColor_alphaInfo_once(%rip), %rdi ## OZChannelColor::OZChannelColor_alphaInfo::getInstance()::OZChannelColor_alphaInfo_once
0000000000054af8	leaq	__ZNSt3__117__call_once_proxyB9nqe210106INS_5tupleIJOZN14OZChannelColor24OZChannelColor_alphaInfo11getInstanceEvEUlvE_EEEEEvPv(%rip), %rdx ## void std::__1::__call_once_proxy[abi:nqe210106]<std::__1::tuple<OZChannelColor::OZChannelColor_alphaInfo::getInstance()::'lambda'()&&>>(void*)
0000000000054aff	callq	0xacdc8                         ## symbol stub for: __ZNSt3__111__call_onceERVmPvPFvS2_E
0000000000054b04	addq	$0x20, %rsp
0000000000054b08	popq	%rbp
0000000000054b09	movq	__ZN14OZChannelColor24OZChannelColor_alphaInfo25_OZChannelColor_alphaInfoE(%rip), %rax ## OZChannelColor::OZChannelColor_alphaInfo::_OZChannelColor_alphaInfo
0000000000054b10	retq
