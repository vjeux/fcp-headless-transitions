__ZN17OZChannelPositionC2ERKS_P15OZChannelFolder:
0000000000073c38	pushq	%rbp
0000000000073c39	movq	%rsp, %rbp
0000000000073c3c	pushq	%r14
0000000000073c3e	pushq	%rbx
0000000000073c3f	movq	%rsi, %r14
0000000000073c42	movq	%rdi, %rbx
0000000000073c45	callq	__ZN11OZChannel2DC2ERKS_P15OZChannelFolder ## OZChannel2D::OZChannel2D(OZChannel2D const&, OZChannelFolder*)
0000000000073c4a	leaq	0x693d7(%rip), %rax
0000000000073c51	movq	%rax, (%rbx)
0000000000073c54	leaq	0x69715(%rip), %rax
0000000000073c5b	movq	%rax, 0x10(%rbx)
0000000000073c5f	movabsq	$0x3ff0000000000000, %rax       ## imm = 0x3FF0000000000000
0000000000073c69	movq	%rax, 0x238(%rbx)
0000000000073c70	movq	%rax, 0x210(%rbx)
0000000000073c77	movq	%rax, 0x1e8(%rbx)
0000000000073c7e	movq	%rax, 0x1c0(%rbx)
0000000000073c85	xorps	%xmm0, %xmm0
0000000000073c88	movups	%xmm0, 0x1c8(%rbx)
0000000000073c8f	movups	%xmm0, 0x1d8(%rbx)
0000000000073c96	movups	%xmm0, 0x1f0(%rbx)
0000000000073c9d	movups	%xmm0, 0x200(%rbx)
0000000000073ca4	movups	%xmm0, 0x218(%rbx)
0000000000073cab	movups	%xmm0, 0x228(%rbx)
0000000000073cb2	movups	%xmm0, 0x240(%rbx)
0000000000073cb9	movups	%xmm0, 0x250(%rbx)
0000000000073cc0	movups	%xmm0, 0x260(%rbx)
0000000000073cc7	movups	%xmm0, 0x270(%rbx)
0000000000073cce	movups	%xmm0, 0x280(%rbx)
0000000000073cd5	movups	%xmm0, 0x290(%rbx)
0000000000073cdc	movups	%xmm0, 0x2a0(%rbx)
0000000000073ce3	movups	%xmm0, 0x2b0(%rbx)
0000000000073cea	movb	0x1b8(%r14), %al
0000000000073cf1	movb	%al, 0x1b8(%rbx)
0000000000073cf7	popq	%rbx
0000000000073cf8	popq	%r14
0000000000073cfa	popq	%rbp
0000000000073cfb	retq
