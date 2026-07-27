__ZN7PCBlend21indexToLayerBlendModeEj:
0000000000017e1c	pushq	%rbp
0000000000017e1d	movq	%rsp, %rbp
0000000000017e20	movl	%edi, %eax
0000000000017e22	leaq	__ZZN7PCBlend18getLayerBlendModesERjE15layerBlendModes(%rip), %rcx ## PCBlend::getLayerBlendModes(unsigned int&)::layerBlendModes
0000000000017e29	movl	(%rcx,%rax,4), %eax
0000000000017e2c	popq	%rbp
0000000000017e2d	retq
