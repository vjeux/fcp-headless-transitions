__ZNK25HgcBT2100_HLG_InverseOETF17shaderDescriptionEv:
00000000003b1540	pushq	%rbp
00000000003b1541	movq	%rsp, %rbp
00000000003b1544	pushq	%rbx
00000000003b1545	pushq	%rax
00000000003b1546	movq	%rdi, %rbx
00000000003b1549	movl	$0x28, %edi
00000000003b154e	callq	0x3c4fb2                        ## symbol stub for: __Znwm
00000000003b1553	movq	%rax, 0x10(%rbx)
00000000003b1557	movq	$0x29, (%rbx)
00000000003b155e	movq	$0x20, 0x8(%rbx)
00000000003b1566	movups	0x62d006(%rip), %xmm0           ## literal pool for: "verseOETF [hgc1]"
00000000003b156d	movups	%xmm0, 0x10(%rax)
00000000003b1571	movups	0x62cfeb(%rip), %xmm0           ## literal pool for: "HgcBT2100_HLG_InverseOETF [hgc1]"
00000000003b1578	movups	%xmm0, (%rax)
00000000003b157b	movb	$0x0, 0x20(%rax)
00000000003b157f	movq	%rbx, %rax
00000000003b1582	addq	$0x8, %rsp
00000000003b1586	popq	%rbx
00000000003b1587	popq	%rbp
00000000003b1588	retq
00000000003b1589	nopl	(%rax)
