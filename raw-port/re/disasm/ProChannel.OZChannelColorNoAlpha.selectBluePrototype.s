__ZN21OZChannelColorNoAlpha19selectBluePrototypeEd:
0000000000054fa8	pushq	%rbp
0000000000054fa9	movq	%rsp, %rbp
0000000000054fac	movapd	0x5b3dc(%rip), %xmm2
0000000000054fb4	andpd	%xmm0, %xmm2
0000000000054fb8	movsd	0x5b3f0(%rip), %xmm1
0000000000054fc0	ucomisd	%xmm2, %xmm1
0000000000054fc4	jbe	0x54fcc
0000000000054fc6	popq	%rbp
0000000000054fc7	jmp	__ZN21OZChannelColorNoAlpha31OZChannelColorNoAlpha_blackImpl11getInstanceEv ## OZChannelColorNoAlpha::OZChannelColorNoAlpha_blackImpl::getInstance()
0000000000054fcc	movsd	0x5b3f4(%rip), %xmm2
0000000000054fd4	addsd	%xmm0, %xmm2
0000000000054fd8	andpd	0x5b3b0(%rip), %xmm2
0000000000054fe0	ucomisd	%xmm2, %xmm1
0000000000054fe4	jbe	0x54fec
0000000000054fe6	popq	%rbp
0000000000054fe7	jmp	__ZN21OZChannelColorNoAlpha31OZChannelColorNoAlpha_whiteImpl11getInstanceEv ## OZChannelColorNoAlpha::OZChannelColorNoAlpha_whiteImpl::getInstance()
0000000000054fec	movsd	0x5bd64(%rip), %xmm2
0000000000054ff4	addsd	%xmm0, %xmm2
0000000000054ff8	andpd	0x5b390(%rip), %xmm2
0000000000055000	ucomisd	%xmm2, %xmm1
0000000000055004	jbe	0x5500c
0000000000055006	popq	%rbp
0000000000055007	jmp	__ZN21OZChannelColorNoAlpha37OZChannelColorNoAlpha_blueSample1Impl11getInstanceEv ## OZChannelColorNoAlpha::OZChannelColorNoAlpha_blueSample1Impl::getInstance()
000000000005500c	movsd	0x5bd4c(%rip), %xmm2
0000000000055014	addsd	%xmm0, %xmm2
0000000000055018	andpd	0x5b370(%rip), %xmm2
0000000000055020	ucomisd	%xmm2, %xmm1
0000000000055024	jbe	0x5502c
0000000000055026	popq	%rbp
0000000000055027	jmp	__ZN21OZChannelColorNoAlpha37OZChannelColorNoAlpha_blueSample2Impl11getInstanceEv ## OZChannelColorNoAlpha::OZChannelColorNoAlpha_blueSample2Impl::getInstance()
000000000005502c	addsd	0x5bd0c(%rip), %xmm0
0000000000055034	andpd	0x5b354(%rip), %xmm0
000000000005503c	ucomisd	%xmm0, %xmm1
0000000000055040	jbe	0x55048
0000000000055042	popq	%rbp
0000000000055043	jmp	__ZN21OZChannelColorNoAlpha30OZChannelColorNoAlpha_greyImpl11getInstanceEv ## OZChannelColorNoAlpha::OZChannelColorNoAlpha_greyImpl::getInstance()
0000000000055048	xorl	%eax, %eax
000000000005504a	popq	%rbp
000000000005504b	retq
