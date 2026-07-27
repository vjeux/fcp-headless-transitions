__ZN7PCBlendL17getModeNameVectorEv:
0000000000017a7a	movb	__ZGVZN7PCBlendL17getModeNameVectorEvE14modeNameVector(%rip), %al ## guard variable for PCBlend::getModeNameVector()::modeNameVector
0000000000017a80	testb	%al, %al
0000000000017a82	je	0x17a85
0000000000017a84	retq
0000000000017a85	pushq	%rbp
0000000000017a86	movq	%rsp, %rbp
0000000000017a89	callq	__ZN7PCBlendL17getModeNameVectorEv.cold.1 ## PCBlend::getModeNameVector() (.cold.1)
0000000000017a8e	popq	%rbp
0000000000017a8f	retq
