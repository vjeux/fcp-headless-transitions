__ZN23OZChannelGradientSample41OZChannelGradientSample_interpolationImpl11getInstanceEv:
000000000006edbc	movq	__ZZN23OZChannelGradientSample41OZChannelGradientSample_interpolationImpl11getInstanceEvE46OZChannelGradientSample_interpolationImpl_once(%rip), %rax ## OZChannelGradientSample::OZChannelGradientSample_interpolationImpl::getInstance()::OZChannelGradientSample_interpolationImpl_once
000000000006edc3	cmpq	$-0x1, %rax
000000000006edc7	je	0x6edfb
000000000006edc9	pushq	%rbp
000000000006edca	movq	%rsp, %rbp
000000000006edcd	subq	$0x20, %rsp
000000000006edd1	leaq	-0x1(%rbp), %rax
000000000006edd5	leaq	-0x18(%rbp), %rcx
000000000006edd9	movq	%rax, (%rcx)
000000000006eddc	leaq	-0x10(%rbp), %rsi
000000000006ede0	movq	%rcx, (%rsi)
000000000006ede3	leaq	__ZZN23OZChannelGradientSample41OZChannelGradientSample_interpolationImpl11getInstanceEvE46OZChannelGradientSample_interpolationImpl_once(%rip), %rdi ## OZChannelGradientSample::OZChannelGradientSample_interpolationImpl::getInstance()::OZChannelGradientSample_interpolationImpl_once
000000000006edea	leaq	__ZNSt3__117__call_once_proxyB9nqe210106INS_5tupleIJOZN23OZChannelGradientSample41OZChannelGradientSample_interpolationImpl11getInstanceEvEUlvE_EEEEEvPv(%rip), %rdx ## void std::__1::__call_once_proxy[abi:nqe210106]<std::__1::tuple<OZChannelGradientSample::OZChannelGradientSample_interpolationImpl::getInstance()::'lambda'()&&>>(void*)
000000000006edf1	callq	0xacdc8                         ## symbol stub for: __ZNSt3__111__call_onceERVmPvPFvS2_E
000000000006edf6	addq	$0x20, %rsp
000000000006edfa	popq	%rbp
000000000006edfb	movq	__ZN23OZChannelGradientSample41OZChannelGradientSample_interpolationImpl38_OZChannelGradientSample_interpolationE(%rip), %rax ## OZChannelGradientSample::OZChannelGradientSample_interpolationImpl::_OZChannelGradientSample_interpolation
000000000006ee02	retq
