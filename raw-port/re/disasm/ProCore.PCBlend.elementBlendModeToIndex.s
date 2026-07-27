__ZN7PCBlend23elementBlendModeToIndexE11PCBlendMode:
0000000000017e41	pushq	%rbp
0000000000017e42	movq	%rsp, %rbp
0000000000017e45	leaq	__ZZN7PCBlend20getElementBlendModesERjE17elementBlendModes(%rip), %rcx ## PCBlend::getElementBlendModes(unsigned int&)::elementBlendModes
0000000000017e4c	xorl	%eax, %eax
0000000000017e4e	cmpl	%edi, (%rcx)
0000000000017e50	je	0x17e61
0000000000017e52	incq	%rax
0000000000017e55	addq	$0x4, %rcx
0000000000017e59	cmpq	$0x21, %rax
0000000000017e5d	jne	0x17e4e
0000000000017e5f	xorl	%eax, %eax
0000000000017e61	popq	%rbp
0000000000017e62	retq
