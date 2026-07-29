__ZN22OZMaterialBumpMapLayerD2Ev:
0000000000440900	pushq	%rbp
0000000000440901	movq	%rsp, %rbp
0000000000440904	pushq	%rbx
0000000000440905	pushq	%rax
0000000000440906	movq	%rdi, %rbx
0000000000440909	leaq	0x423b18(%rip), %rax
0000000000440910	movq	%rax, (%rdi)
0000000000440913	leaq	0x423ee6(%rip), %rax
000000000044091a	movq	%rax, 0x10(%rdi)
000000000044091e	leaq	0x423f33(%rip), %rax
0000000000440925	movq	%rax, 0x4c8(%rdi)
000000000044092c	addq	$0x2ea8, %rdi                   ## imm = 0x2EA8
0000000000440933	callq	0x6dd9d4                        ## symbol stub for: __ZN13OZChannelEnumD1Ev
0000000000440938	leaq	0x1570(%rbx), %rdi
000000000044093f	callq	__ZN25OZChannelMaterialLayerMapD2Ev ## OZChannelMaterialLayerMap::~OZChannelMaterialLayerMap()
0000000000440944	leaq	0x568(%rbx), %rdi
000000000044094b	callq	__ZN27OZChannelImageWithTransformD2Ev ## OZChannelImageWithTransform::~OZChannelImageWithTransform()
0000000000440950	leaq	0x4d0(%rbx), %rdi
0000000000440957	callq	0x6de18a                        ## symbol stub for: __ZN16OZChannelPercentD1Ev
000000000044095c	movq	%rbx, %rdi
000000000044095f	addq	$0x8, %rsp
0000000000440963	popq	%rbx
0000000000440964	popq	%rbp
0000000000440965	jmp	__ZN19OZMaterialLayerBaseD2Ev   ## OZMaterialLayerBase::~OZMaterialLayerBase()
000000000044096a	nopw	(%rax,%rax)
