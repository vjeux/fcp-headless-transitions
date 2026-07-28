__ZNK24HgcBT2100_PQ_InverseOETF17shaderDescriptionEv:
00000000003aca20	pushq	%rbp
00000000003aca21	movq	%rsp, %rbp
00000000003aca24	pushq	%rbx
00000000003aca25	pushq	%rax
00000000003aca26	movq	%rdi, %rbx
00000000003aca29	movl	$0x20, %edi
00000000003aca2e	callq	0x3c4fb2                        ## symbol stub for: __Znwm
00000000003aca33	movq	%rax, 0x10(%rbx)
00000000003aca37	movq	$0x21, (%rbx)
00000000003aca3e	movq	$0x1f, 0x8(%rbx)
00000000003aca46	movups	0x6304c6(%rip), %xmm0           ## literal pool for: "verseOETF [hgc1]"
00000000003aca4d	movups	%xmm0, 0xf(%rax)
00000000003aca51	movups	0x6304ac(%rip), %xmm0           ## literal pool for: "HgcBT2100_PQ_InverseOETF [hgc1]"
00000000003aca58	movups	%xmm0, (%rax)
00000000003aca5b	movb	$0x0, 0x1f(%rax)
00000000003aca5f	movq	%rbx, %rax
00000000003aca62	addq	$0x8, %rsp
00000000003aca66	popq	%rbx
00000000003aca67	popq	%rbp
00000000003aca68	retq
00000000003aca69	nopl	(%rax)
