__ZN17OZChannelPositionC1ERKS_P15OZChannelFolder:
0000000000073cfc	pushq	%rbp
0000000000073cfd	movq	%rsp, %rbp
0000000000073d00	pushq	%r14
0000000000073d02	pushq	%rbx
0000000000073d03	movq	%rsi, %r14
0000000000073d06	movq	%rdi, %rbx
0000000000073d09	callq	__ZN11OZChannel2DC2ERKS_P15OZChannelFolder ## OZChannel2D::OZChannel2D(OZChannel2D const&, OZChannelFolder*)
0000000000073d0e	leaq	0x69313(%rip), %rax
0000000000073d15	movq	%rax, (%rbx)
0000000000073d18	leaq	0x69651(%rip), %rax
0000000000073d1f	movq	%rax, 0x10(%rbx)
0000000000073d23	movabsq	$0x3ff0000000000000, %rax       ## imm = 0x3FF0000000000000
0000000000073d2d	movq	%rax, 0x238(%rbx)
0000000000073d34	movq	%rax, 0x210(%rbx)
0000000000073d3b	movq	%rax, 0x1e8(%rbx)
0000000000073d42	movq	%rax, 0x1c0(%rbx)
0000000000073d49	xorps	%xmm0, %xmm0
0000000000073d4c	movups	%xmm0, 0x1c8(%rbx)
0000000000073d53	movups	%xmm0, 0x1d8(%rbx)
0000000000073d5a	movups	%xmm0, 0x1f0(%rbx)
0000000000073d61	movups	%xmm0, 0x200(%rbx)
0000000000073d68	movups	%xmm0, 0x218(%rbx)
0000000000073d6f	movups	%xmm0, 0x228(%rbx)
0000000000073d76	movups	%xmm0, 0x240(%rbx)
0000000000073d7d	movups	%xmm0, 0x250(%rbx)
0000000000073d84	movups	%xmm0, 0x260(%rbx)
0000000000073d8b	movups	%xmm0, 0x270(%rbx)
0000000000073d92	movups	%xmm0, 0x280(%rbx)
0000000000073d99	movups	%xmm0, 0x290(%rbx)
0000000000073da0	movups	%xmm0, 0x2a0(%rbx)
0000000000073da7	movups	%xmm0, 0x2b0(%rbx)
0000000000073dae	movb	0x1b8(%r14), %al
0000000000073db5	movb	%al, 0x1b8(%rbx)
0000000000073dbb	popq	%rbx
0000000000073dbc	popq	%r14
0000000000073dbe	popq	%rbp
0000000000073dbf	retq
