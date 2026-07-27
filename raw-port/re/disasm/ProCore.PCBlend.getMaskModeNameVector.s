__ZN7PCBlendL21getMaskModeNameVectorEv:
0000000000017c8a	movb	__ZGVZN7PCBlendL21getMaskModeNameVectorEvE18maskModeNameVector(%rip), %al ## guard variable for PCBlend::getMaskModeNameVector()::maskModeNameVector
0000000000017c90	testb	%al, %al
0000000000017c92	je	0x17c95
0000000000017c94	retq
0000000000017c95	pushq	%rbp
0000000000017c96	movq	%rsp, %rbp
0000000000017c99	callq	__ZN7PCBlendL21getMaskModeNameVectorEv.cold.1 ## PCBlend::getMaskModeNameVector() (.cold.1)
0000000000017c9e	popq	%rbp
0000000000017c9f	retq
