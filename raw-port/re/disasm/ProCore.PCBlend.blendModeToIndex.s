__ZN7PCBlend16blendModeToIndexE11PCBlendModeb:
0000000000017ea4	pushq	%rbp
0000000000017ea5	movq	%rsp, %rbp
0000000000017ea8	testl	%esi, %esi
0000000000017eaa	je	0x17ec8
0000000000017eac	leaq	__ZZN7PCBlend18getLayerBlendModesERjE15layerBlendModes(%rip), %rcx ## PCBlend::getLayerBlendModes(unsigned int&)::layerBlendModes
0000000000017eb3	xorl	%eax, %eax
0000000000017eb5	cmpl	%edi, (%rcx)
0000000000017eb7	je	0x17ee4
0000000000017eb9	incq	%rax
0000000000017ebc	addq	$0x4, %rcx
0000000000017ec0	cmpq	$0x23, %rax
0000000000017ec4	jne	0x17eb5
0000000000017ec6	jmp	0x17ee2
0000000000017ec8	leaq	__ZZN7PCBlend20getElementBlendModesERjE17elementBlendModes(%rip), %rcx ## PCBlend::getElementBlendModes(unsigned int&)::elementBlendModes
0000000000017ecf	xorl	%eax, %eax
0000000000017ed1	cmpl	%edi, (%rcx)
0000000000017ed3	je	0x17ee4
0000000000017ed5	incq	%rax
0000000000017ed8	addq	$0x4, %rcx
0000000000017edc	cmpq	$0x21, %rax
0000000000017ee0	jne	0x17ed1
0000000000017ee2	xorl	%eax, %eax
0000000000017ee4	popq	%rbp
0000000000017ee5	retq
