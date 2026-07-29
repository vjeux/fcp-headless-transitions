__ZNK21OZChannelColorNoAlpha15getColorSpaceIDEv:
0000000000056bf4	pushq	%rbp
0000000000056bf5	movq	%rsp, %rbp
0000000000056bf8	addq	$0x2e8, %rdi                    ## imm = 0x2E8
0000000000056bff	movq	0x738ba(%rip), %rsi             ## literal pool symbol address: _kCMTimeZero
0000000000056c06	xorps	%xmm0, %xmm0
0000000000056c09	callq	__ZNK9OZChannel13getValueAsIntERK6CMTimed ## OZChannel::getValueAsInt(CMTime const&, double) const
0000000000056c0e	movl	%eax, %edi
0000000000056c10	movl	$0x3, %esi
0000000000056c15	popq	%rbp
0000000000056c16	jmp	0xacbd6                         ## symbol stub for: __ZN17PCColorSpaceCache17intToColorSpaceIDEiNS_2IDE
0000000000056c1b	nop
