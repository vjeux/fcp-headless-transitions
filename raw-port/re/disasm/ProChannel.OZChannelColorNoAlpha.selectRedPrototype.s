__ZN21OZChannelColorNoAlpha18selectRedPrototypeEd:
0000000000054e60	pushq	%rbp
0000000000054e61	movq	%rsp, %rbp
0000000000054e64	movapd	0x5b524(%rip), %xmm2
0000000000054e6c	andpd	%xmm0, %xmm2
0000000000054e70	movsd	0x5b538(%rip), %xmm1
0000000000054e78	ucomisd	%xmm2, %xmm1
0000000000054e7c	jbe	0x54e84
0000000000054e7e	popq	%rbp
0000000000054e7f	jmp	__ZN21OZChannelColorNoAlpha31OZChannelColorNoAlpha_blackImpl11getInstanceEv ## OZChannelColorNoAlpha::OZChannelColorNoAlpha_blackImpl::getInstance()
0000000000054e84	movsd	0x5b53c(%rip), %xmm2
0000000000054e8c	addsd	%xmm0, %xmm2
0000000000054e90	andpd	0x5b4f8(%rip), %xmm2
0000000000054e98	ucomisd	%xmm2, %xmm1
0000000000054e9c	jbe	0x54ea4
0000000000054e9e	popq	%rbp
0000000000054e9f	jmp	__ZN21OZChannelColorNoAlpha31OZChannelColorNoAlpha_whiteImpl11getInstanceEv ## OZChannelColorNoAlpha::OZChannelColorNoAlpha_whiteImpl::getInstance()
0000000000054ea4	movsd	0x5be84(%rip), %xmm2
0000000000054eac	addsd	%xmm0, %xmm2
0000000000054eb0	andpd	0x5b4d8(%rip), %xmm2
0000000000054eb8	ucomisd	%xmm2, %xmm1
0000000000054ebc	jbe	0x54ec4
0000000000054ebe	popq	%rbp
0000000000054ebf	jmp	__ZN21OZChannelColorNoAlpha36OZChannelColorNoAlpha_redSample1Impl11getInstanceEv ## OZChannelColorNoAlpha::OZChannelColorNoAlpha_redSample1Impl::getInstance()
0000000000054ec4	movsd	0x5be6c(%rip), %xmm2
0000000000054ecc	addsd	%xmm0, %xmm2
0000000000054ed0	andpd	0x5b4b8(%rip), %xmm2
0000000000054ed8	ucomisd	%xmm2, %xmm1
0000000000054edc	jbe	0x54ee4
0000000000054ede	popq	%rbp
0000000000054edf	jmp	__ZN21OZChannelColorNoAlpha36OZChannelColorNoAlpha_redSample2Impl11getInstanceEv ## OZChannelColorNoAlpha::OZChannelColorNoAlpha_redSample2Impl::getInstance()
0000000000054ee4	addsd	0x5be54(%rip), %xmm0
0000000000054eec	andpd	0x5b49c(%rip), %xmm0
0000000000054ef4	ucomisd	%xmm0, %xmm1
0000000000054ef8	jbe	0x54f00
0000000000054efa	popq	%rbp
0000000000054efb	jmp	__ZN21OZChannelColorNoAlpha30OZChannelColorNoAlpha_greyImpl11getInstanceEv ## OZChannelColorNoAlpha::OZChannelColorNoAlpha_greyImpl::getInstance()
0000000000054f00	xorl	%eax, %eax
0000000000054f02	popq	%rbp
0000000000054f03	retq
