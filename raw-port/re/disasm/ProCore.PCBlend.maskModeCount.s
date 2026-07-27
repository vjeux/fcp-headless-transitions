__ZN7PCBlend13maskModeCountEv:
0000000000017c52	pushq	%rbp
0000000000017c53	movq	%rsp, %rbp
0000000000017c56	callq	__ZN7PCBlendL21getMaskModeNameVectorEv ## PCBlend::getMaskModeNameVector()
0000000000017c5b	movq	0x1436b6(%rip), %rax
0000000000017c62	movq	__ZZN7PCBlendL21getMaskModeNameVectorEvE18maskModeNameVector(%rip), %rcx ## PCBlend::getMaskModeNameVector()::maskModeNameVector
0000000000017c69	cmpq	%rcx, %rax
0000000000017c6c	jne	0x17c81
0000000000017c6e	callq	__ZN7PCBlendL28initializeMaskModeNameVectorEv ## PCBlend::initializeMaskModeNameVector()
0000000000017c73	movq	0x14369e(%rip), %rax
0000000000017c7a	movq	__ZZN7PCBlendL21getMaskModeNameVectorEvE18maskModeNameVector(%rip), %rcx ## PCBlend::getMaskModeNameVector()::maskModeNameVector
0000000000017c81	subq	%rcx, %rax
0000000000017c84	sarq	$0x3, %rax
0000000000017c88	popq	%rbp
0000000000017c89	retq
