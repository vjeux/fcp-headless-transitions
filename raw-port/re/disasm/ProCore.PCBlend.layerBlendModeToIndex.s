__ZN7PCBlend21layerBlendModeToIndexE11PCBlendMode:
0000000000017e63	pushq	%rbp
0000000000017e64	movq	%rsp, %rbp
0000000000017e67	leaq	__ZZN7PCBlend18getLayerBlendModesERjE15layerBlendModes(%rip), %rcx ## PCBlend::getLayerBlendModes(unsigned int&)::layerBlendModes
0000000000017e6e	xorl	%eax, %eax
0000000000017e70	cmpl	%edi, (%rcx)
0000000000017e72	je	0x17e83
0000000000017e74	incq	%rax
0000000000017e77	addq	$0x4, %rcx
0000000000017e7b	cmpq	$0x23, %rax
0000000000017e7f	jne	0x17e70
0000000000017e81	xorl	%eax, %eax
0000000000017e83	popq	%rbp
0000000000017e84	retq
