__ZNK21OZChannelColorNoAlpha13getColorSpaceEv:
000000000005717a	pushq	%rbp
000000000005717b	movq	%rsp, %rbp
000000000005717e	pushq	%rbx
000000000005717f	pushq	%rax
0000000000057180	movq	%rdi, %rbx
0000000000057183	addq	$0x2e8, %rbx                    ## imm = 0x2E8
000000000005718a	movq	0x7332f(%rip), %rsi             ## literal pool symbol address: _kCMTimeZero
0000000000057191	xorps	%xmm0, %xmm0
0000000000057194	movq	%rbx, %rdi
0000000000057197	callq	__ZNK9OZChannel13getValueAsIntERK6CMTimed ## OZChannel::getValueAsInt(CMTime const&, double) const
000000000005719c	movl	%eax, %edi
000000000005719e	movl	$0x3, %esi
00000000000571a3	callq	0xacbd6                         ## symbol stub for: __ZN17PCColorSpaceCache17intToColorSpaceIDEiNS_2IDE
00000000000571a8	cmpl	$-0x1, %eax
00000000000571ab	je	0x571d8
00000000000571ad	movq	0x7330c(%rip), %rsi             ## literal pool symbol address: _kCMTimeZero
00000000000571b4	xorps	%xmm0, %xmm0
00000000000571b7	movq	%rbx, %rdi
00000000000571ba	callq	__ZNK9OZChannel13getValueAsIntERK6CMTimed ## OZChannel::getValueAsInt(CMTime const&, double) const
00000000000571bf	movl	%eax, %edi
00000000000571c1	movl	$0x3, %esi
00000000000571c6	callq	0xacbd6                         ## symbol stub for: __ZN17PCColorSpaceCache17intToColorSpaceIDEiNS_2IDE
00000000000571cb	movl	%eax, %edi
00000000000571cd	addq	$0x8, %rsp
00000000000571d1	popq	%rbx
00000000000571d2	popq	%rbp
00000000000571d3	jmp	0xacbe8                         ## symbol stub for: __ZN17PCColorSpaceCache19getNSColorSpaceByIDENS_2IDE
00000000000571d8	addq	$0x8, %rsp
00000000000571dc	popq	%rbx
00000000000571dd	popq	%rbp
00000000000571de	jmp	0xacbc4                         ## symbol stub for: __ZN17PCColorSpaceCache14nsDefaultSpaceEv
00000000000571e3	nop
