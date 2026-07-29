__ZN19OZMaterialLayerBase19getSequenceChannelsEv:
00000000004ac740	pushq	%rbp
00000000004ac741	movq	%rsp, %rbp
00000000004ac744	pushq	%rbx
00000000004ac745	pushq	%rax
00000000004ac746	movq	%rdi, %rbx
00000000004ac749	callq	0x6df55e                        ## symbol stub for: __ZNK13OZChannelBase20getObjectManipulatorEv
00000000004ac74e	leaq	-0x10(%rax), %rdi
00000000004ac752	testq	%rax, %rax
00000000004ac755	cmoveq	%rax, %rdi
00000000004ac759	movq	%rbx, %rsi
00000000004ac75c	addq	$0x8, %rsp
00000000004ac760	popq	%rbx
00000000004ac761	popq	%rbp
00000000004ac762	jmp	__ZN17OZLayeredMaterial35getSequenceChannelsForMaterialLayerEP19OZMaterialLayerBase ## OZLayeredMaterial::getSequenceChannelsForMaterialLayer(OZMaterialLayerBase*)
00000000004ac767	nopw	(%rax,%rax)
