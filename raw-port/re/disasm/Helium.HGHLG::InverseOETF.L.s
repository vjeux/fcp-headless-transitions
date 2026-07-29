__ZN5HGHLG11InverseOETF1LEd:
00000000000ffd00	pushq	%rbp
00000000000ffd01	movq	%rsp, %rbp
00000000000ffd04	subq	$0x10, %rsp
00000000000ffd08	movapd	%xmm0, %xmm1
00000000000ffd0c	movzbl	__ZGVZN5HGHLG11InverseOETF1LEdE1c(%rip), %eax ## guard variable for HGHLG::InverseOETF::L(double)::c
00000000000ffd13	testb	%al, %al
00000000000ffd15	je	0xffd27
00000000000ffd17	xorpd	%xmm0, %xmm0
00000000000ffd1b	ucomisd	%xmm1, %xmm0
00000000000ffd1f	jb	0xffd40
00000000000ffd21	addq	$0x10, %rsp
00000000000ffd25	popq	%rbp
00000000000ffd26	retq
00000000000ffd27	movsd	%xmm1, -0x8(%rbp)
00000000000ffd2c	callq	__ZN5HGHLG11InverseOETF1LEd.cold.1 ## HGHLG::InverseOETF::L(double) (.cold.1)
00000000000ffd31	movsd	-0x8(%rbp), %xmm1
00000000000ffd36	xorpd	%xmm0, %xmm0
00000000000ffd3a	ucomisd	%xmm1, %xmm0
00000000000ffd3e	jae	0xffd21
00000000000ffd40	movsd	0x2cc478(%rip), %xmm0
00000000000ffd48	ucomisd	%xmm1, %xmm0
00000000000ffd4c	jae	0xffd75
00000000000ffd4e	subsd	__ZZN5HGHLG11InverseOETF1LEdE1c(%rip), %xmm1 ## HGHLG::InverseOETF::L(double)::c
00000000000ffd56	divsd	0x2d106a(%rip), %xmm1
00000000000ffd5e	movapd	%xmm1, %xmm0
00000000000ffd62	callq	0x3c50ea                        ## symbol stub for: _exp
00000000000ffd67	addsd	0x2d1069(%rip), %xmm0
00000000000ffd6f	addq	$0x10, %rsp
00000000000ffd73	popq	%rbp
00000000000ffd74	retq
00000000000ffd75	mulsd	%xmm1, %xmm1
00000000000ffd79	mulsd	0x2d104f(%rip), %xmm1
00000000000ffd81	movapd	%xmm1, %xmm0
00000000000ffd85	addq	$0x10, %rsp
00000000000ffd89	popq	%rbp
00000000000ffd8a	retq
00000000000ffd8b	nopl	(%rax,%rax)
