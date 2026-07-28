__ZNK18HgcBT2100_HLG_OETF17shaderDescriptionEv:
00000000003b0390	pushq	%rbp
00000000003b0391	movq	%rsp, %rbp
00000000003b0394	pushq	%rbx
00000000003b0395	pushq	%rax
00000000003b0396	movq	%rdi, %rbx
00000000003b0399	movl	$0x20, %edi
00000000003b039e	callq	0x3c4fb2                        ## symbol stub for: __Znwm
00000000003b03a3	movq	%rax, 0x10(%rbx)
00000000003b03a7	movq	$0x21, (%rbx)
00000000003b03ae	movq	$0x19, 0x8(%rbx)
00000000003b03b6	movups	0x62da4c(%rip), %xmm0           ## literal pool for: "_HLG_OETF [hgc1]"
00000000003b03bd	movups	%xmm0, 0x9(%rax)
00000000003b03c1	movups	0x62da38(%rip), %xmm0           ## literal pool for: "HgcBT2100_HLG_OETF [hgc1]"
00000000003b03c8	movups	%xmm0, (%rax)
00000000003b03cb	movb	$0x0, 0x19(%rax)
00000000003b03cf	movq	%rbx, %rax
00000000003b03d2	addq	$0x8, %rsp
00000000003b03d6	popq	%rbx
00000000003b03d7	popq	%rbp
00000000003b03d8	retq
00000000003b03d9	nopl	(%rax)
