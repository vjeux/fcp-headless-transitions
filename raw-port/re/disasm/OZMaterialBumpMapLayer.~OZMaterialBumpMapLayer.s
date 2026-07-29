__ZN22OZMaterialBumpMapLayerD0Ev:
0000000000440a50	pushq	%rbp
0000000000440a51	movq	%rsp, %rbp
0000000000440a54	pushq	%rbx
0000000000440a55	pushq	%rax
0000000000440a56	movq	%rdi, %rbx
0000000000440a59	leaq	0x4239c8(%rip), %rax
0000000000440a60	movq	%rax, (%rdi)
0000000000440a63	leaq	0x423d96(%rip), %rax
0000000000440a6a	movq	%rax, 0x10(%rdi)
0000000000440a6e	leaq	0x423de3(%rip), %rax
0000000000440a75	movq	%rax, 0x4c8(%rdi)
0000000000440a7c	addq	$0x2ea8, %rdi                   ## imm = 0x2EA8
0000000000440a83	callq	0x6dd9d4                        ## symbol stub for: __ZN13OZChannelEnumD1Ev
0000000000440a88	leaq	0x1570(%rbx), %rdi
0000000000440a8f	callq	__ZN25OZChannelMaterialLayerMapD2Ev ## OZChannelMaterialLayerMap::~OZChannelMaterialLayerMap()
0000000000440a94	leaq	0x568(%rbx), %rdi
0000000000440a9b	callq	__ZN27OZChannelImageWithTransformD2Ev ## OZChannelImageWithTransform::~OZChannelImageWithTransform()
0000000000440aa0	leaq	0x4d0(%rbx), %rdi
0000000000440aa7	callq	0x6de18a                        ## symbol stub for: __ZN16OZChannelPercentD1Ev
0000000000440aac	movq	%rbx, %rdi
0000000000440aaf	callq	__ZN19OZMaterialLayerBaseD2Ev   ## OZMaterialLayerBase::~OZMaterialLayerBase()
0000000000440ab4	movq	%rbx, %rdi
0000000000440ab7	addq	$0x8, %rsp
0000000000440abb	popq	%rbx
0000000000440abc	popq	%rbp
0000000000440abd	jmp	0x6dfc36                        ## symbol stub for: __ZdlPv
0000000000440ac2	nopw	%cs:(%rax,%rax)
