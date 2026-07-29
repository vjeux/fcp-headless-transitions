__ZN22OZMaterialBumpMapLayerC2ERKS_P15OZChannelFolder:
00000000004407f0	pushq	%rbp
00000000004407f1	movq	%rsp, %rbp
00000000004407f4	pushq	%r15
00000000004407f6	pushq	%r14
00000000004407f8	pushq	%r13
00000000004407fa	pushq	%r12
00000000004407fc	pushq	%rbx
00000000004407fd	pushq	%rax
00000000004407fe	movq	%rsi, %r15
0000000000440801	movq	%rdi, %rbx
0000000000440804	callq	__ZN19OZMaterialLayerBaseC2ERKS_P15OZChannelFolder ## OZMaterialLayerBase::OZMaterialLayerBase(OZMaterialLayerBase const&, OZChannelFolder*)
0000000000440809	leaq	0x423c18(%rip), %rax
0000000000440810	movq	%rax, (%rbx)
0000000000440813	leaq	0x423fe6(%rip), %rax
000000000044081a	movq	%rax, 0x10(%rbx)
000000000044081e	leaq	0x424033(%rip), %rax
0000000000440825	movq	%rax, 0x4c8(%rbx)
000000000044082c	leaq	0x4d0(%rbx), %r14
0000000000440833	leaq	0x4d0(%r15), %rsi
000000000044083a	movq	%r14, %rdi
000000000044083d	movq	%rbx, %rdx
0000000000440840	callq	0x6de17e                        ## symbol stub for: __ZN16OZChannelPercentC1ERKS_P15OZChannelFolder
0000000000440845	leaq	0x568(%rbx), %r12
000000000044084c	leaq	0x568(%r15), %rsi
0000000000440853	movq	%r12, %rdi
0000000000440856	movq	%rbx, %rdx
0000000000440859	callq	__ZN27OZChannelImageWithTransformC1ERKS_P15OZChannelFolder ## OZChannelImageWithTransform::OZChannelImageWithTransform(OZChannelImageWithTransform const&, OZChannelFolder*)
000000000044085e	leaq	0x1570(%rbx), %r13
0000000000440865	leaq	0x1570(%r15), %rsi
000000000044086c	movq	%r13, %rdi
000000000044086f	movq	%rbx, %rdx
0000000000440872	callq	__ZN25OZChannelMaterialLayerMapC1ERKS_P15OZChannelFolder ## OZChannelMaterialLayerMap::OZChannelMaterialLayerMap(OZChannelMaterialLayerMap const&, OZChannelFolder*)
0000000000440877	leaq	0x2ea8(%rbx), %rdi
000000000044087e	addq	$0x2ea8, %r15                   ## imm = 0x2EA8
0000000000440885	movq	%r15, %rsi
0000000000440888	movq	%rbx, %rdx
000000000044088b	callq	0x6dd9aa                        ## symbol stub for: __ZN13OZChannelEnumC1ERKS_P15OZChannelFolder
0000000000440890	addq	$0x8, %rsp
0000000000440894	popq	%rbx
0000000000440895	popq	%r12
0000000000440897	popq	%r13
0000000000440899	popq	%r14
000000000044089b	popq	%r15
000000000044089d	popq	%rbp
000000000044089e	retq
000000000044089f	movq	%rax, %r15
00000000004408a2	movq	%r13, %rdi
00000000004408a5	callq	__ZN25OZChannelMaterialLayerMapD2Ev ## OZChannelMaterialLayerMap::~OZChannelMaterialLayerMap()
00000000004408aa	jmp	0x4408af
00000000004408ac	movq	%rax, %r15
00000000004408af	movq	%r12, %rdi
00000000004408b2	callq	__ZN27OZChannelImageWithTransformD2Ev ## OZChannelImageWithTransform::~OZChannelImageWithTransform()
00000000004408b7	jmp	0x4408bc
00000000004408b9	movq	%rax, %r15
00000000004408bc	movq	%r14, %rdi
00000000004408bf	callq	0x6de18a                        ## symbol stub for: __ZN16OZChannelPercentD1Ev
00000000004408c4	movq	%rbx, %rdi
00000000004408c7	callq	__ZN19OZMaterialLayerBaseD2Ev   ## OZMaterialLayerBase::~OZMaterialLayerBase()
00000000004408cc	movq	%r15, %rdi
00000000004408cf	callq	0x6dd07a                        ## symbol stub for: __Unwind_Resume
00000000004408d4	movq	%rax, %r15
00000000004408d7	movq	%rbx, %rdi
00000000004408da	callq	__ZN19OZMaterialLayerBaseD2Ev   ## OZMaterialLayerBase::~OZMaterialLayerBase()
00000000004408df	movq	%r15, %rdi
00000000004408e2	callq	0x6dd07a                        ## symbol stub for: __Unwind_Resume
00000000004408e7	nopw	(%rax,%rax)
