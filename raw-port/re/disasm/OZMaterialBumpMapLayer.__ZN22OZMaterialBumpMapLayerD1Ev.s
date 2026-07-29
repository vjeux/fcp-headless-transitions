__ZN22OZMaterialBumpMapLayerD1Ev:
0000000000440970	pushq	%rbp
0000000000440971	movq	%rsp, %rbp
0000000000440974	pushq	%rbx
0000000000440975	pushq	%rax
0000000000440976	movq	%rdi, %rbx
0000000000440979	leaq	0x423aa8(%rip), %rax
0000000000440980	movq	%rax, (%rdi)
0000000000440983	leaq	0x423e76(%rip), %rax
000000000044098a	movq	%rax, 0x10(%rdi)
000000000044098e	leaq	0x423ec3(%rip), %rax
0000000000440995	movq	%rax, 0x4c8(%rdi)
000000000044099c	addq	$0x2ea8, %rdi                   ## imm = 0x2EA8
00000000004409a3	callq	0x6dd9d4                        ## symbol stub for: __ZN13OZChannelEnumD1Ev
00000000004409a8	leaq	0x1570(%rbx), %rdi
00000000004409af	callq	__ZN25OZChannelMaterialLayerMapD2Ev ## OZChannelMaterialLayerMap::~OZChannelMaterialLayerMap()
00000000004409b4	leaq	0x568(%rbx), %rdi
00000000004409bb	callq	__ZN27OZChannelImageWithTransformD2Ev ## OZChannelImageWithTransform::~OZChannelImageWithTransform()
00000000004409c0	leaq	0x4d0(%rbx), %rdi
00000000004409c7	callq	0x6de18a                        ## symbol stub for: __ZN16OZChannelPercentD1Ev
00000000004409cc	movq	%rbx, %rdi
00000000004409cf	addq	$0x8, %rsp
00000000004409d3	popq	%rbx
00000000004409d4	popq	%rbp
00000000004409d5	jmp	__ZN19OZMaterialLayerBaseD2Ev   ## OZMaterialLayerBase::~OZMaterialLayerBase()
00000000004409da	nopw	(%rax,%rax)
