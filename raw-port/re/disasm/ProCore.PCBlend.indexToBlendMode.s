__ZN7PCBlend16indexToBlendModeEjb:
0000000000017e85	pushq	%rbp
0000000000017e86	movq	%rsp, %rbp
0000000000017e89	movl	%edi, %eax
0000000000017e8b	leaq	__ZZN7PCBlend18getLayerBlendModesERjE15layerBlendModes(%rip), %rcx ## PCBlend::getLayerBlendModes(unsigned int&)::layerBlendModes
0000000000017e92	leaq	__ZZN7PCBlend20getElementBlendModesERjE17elementBlendModes(%rip), %rdx ## PCBlend::getElementBlendModes(unsigned int&)::elementBlendModes
0000000000017e99	testl	%esi, %esi
0000000000017e9b	cmovneq	%rcx, %rdx
0000000000017e9f	movl	(%rdx,%rax,4), %eax
0000000000017ea2	popq	%rbp
0000000000017ea3	retq
