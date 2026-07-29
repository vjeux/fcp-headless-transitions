__ZN4HGPQ4OOTF1CEdbd:
00000000000fe0c0	xorpd	%xmm2, %xmm2
00000000000fe0c4	ucomisd	%xmm0, %xmm2
00000000000fe0c8	jae	0xfe132
00000000000fe0ca	pushq	%rbp
00000000000fe0cb	movq	%rsp, %rbp
00000000000fe0ce	subq	$0x10, %rsp
00000000000fe0d2	testb	%dil, %dil
00000000000fe0d5	movsd	%xmm1, -0x8(%rbp)
00000000000fe0da	je	0xfe0e6
00000000000fe0dc	movsd	0x2d2c8c(%rip), %xmm1
00000000000fe0e4	jmp	0xfe11f
00000000000fe0e6	ucomisd	0x2d2c52(%rip), %xmm0
00000000000fe0ee	jbe	0xfe10f
00000000000fe0f0	movsd	0x2d2c58(%rip), %xmm1
00000000000fe0f8	callq	0x3c54ec                        ## symbol stub for: _pow
00000000000fe0fd	mulsd	0x2d2c53(%rip), %xmm0
00000000000fe105	addsd	0x2d2c53(%rip), %xmm0
00000000000fe10d	jmp	0xfe117
00000000000fe10f	mulsd	0x2d2c31(%rip), %xmm0
00000000000fe117	movsd	0x2d2c49(%rip), %xmm1
00000000000fe11f	callq	0x3c54ec                        ## symbol stub for: _pow
00000000000fe124	movsd	-0x8(%rbp), %xmm2
00000000000fe129	mulsd	%xmm0, %xmm2
00000000000fe12d	addq	$0x10, %rsp
00000000000fe131	popq	%rbp
00000000000fe132	movapd	%xmm2, %xmm0
00000000000fe136	retq
00000000000fe137	nopw	(%rax,%rax)
