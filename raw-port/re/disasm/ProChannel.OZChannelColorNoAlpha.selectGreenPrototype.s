__ZN21OZChannelColorNoAlpha20selectGreenPrototypeEd:
0000000000054f04	pushq	%rbp
0000000000054f05	movq	%rsp, %rbp
0000000000054f08	movapd	0x5b480(%rip), %xmm2
0000000000054f10	andpd	%xmm0, %xmm2
0000000000054f14	movsd	0x5b494(%rip), %xmm1
0000000000054f1c	ucomisd	%xmm2, %xmm1
0000000000054f20	jbe	0x54f28
0000000000054f22	popq	%rbp
0000000000054f23	jmp	__ZN21OZChannelColorNoAlpha31OZChannelColorNoAlpha_blackImpl11getInstanceEv ## OZChannelColorNoAlpha::OZChannelColorNoAlpha_blackImpl::getInstance()
0000000000054f28	movsd	0x5b498(%rip), %xmm2
0000000000054f30	addsd	%xmm0, %xmm2
0000000000054f34	andpd	0x5b454(%rip), %xmm2
0000000000054f3c	ucomisd	%xmm2, %xmm1
0000000000054f40	jbe	0x54f48
0000000000054f42	popq	%rbp
0000000000054f43	jmp	__ZN21OZChannelColorNoAlpha31OZChannelColorNoAlpha_whiteImpl11getInstanceEv ## OZChannelColorNoAlpha::OZChannelColorNoAlpha_whiteImpl::getInstance()
0000000000054f48	movsd	0x5bdf8(%rip), %xmm2
0000000000054f50	addsd	%xmm0, %xmm2
0000000000054f54	andpd	0x5b434(%rip), %xmm2
0000000000054f5c	ucomisd	%xmm2, %xmm1
0000000000054f60	jbe	0x54f68
0000000000054f62	popq	%rbp
0000000000054f63	jmp	__ZN21OZChannelColorNoAlpha38OZChannelColorNoAlpha_greenSample1Impl11getInstanceEv ## OZChannelColorNoAlpha::OZChannelColorNoAlpha_greenSample1Impl::getInstance()
0000000000054f68	movsd	0x5bde0(%rip), %xmm2
0000000000054f70	addsd	%xmm0, %xmm2
0000000000054f74	andpd	0x5b414(%rip), %xmm2
0000000000054f7c	ucomisd	%xmm2, %xmm1
0000000000054f80	jbe	0x54f88
0000000000054f82	popq	%rbp
0000000000054f83	jmp	__ZN21OZChannelColorNoAlpha38OZChannelColorNoAlpha_greenSample2Impl11getInstanceEv ## OZChannelColorNoAlpha::OZChannelColorNoAlpha_greenSample2Impl::getInstance()
0000000000054f88	addsd	0x5bdb0(%rip), %xmm0
0000000000054f90	andpd	0x5b3f8(%rip), %xmm0
0000000000054f98	ucomisd	%xmm0, %xmm1
0000000000054f9c	jbe	0x54fa4
0000000000054f9e	popq	%rbp
0000000000054f9f	jmp	__ZN21OZChannelColorNoAlpha30OZChannelColorNoAlpha_greyImpl11getInstanceEv ## OZChannelColorNoAlpha::OZChannelColorNoAlpha_greyImpl::getInstance()
0000000000054fa4	xorl	%eax, %eax
0000000000054fa6	popq	%rbp
0000000000054fa7	retq
