__ZN5HGHLG4OETF2EpEd:
00000000000ff9f0	pushq	%rbp
00000000000ff9f1	movq	%rsp, %rbp
00000000000ff9f4	subq	$0x10, %rsp
00000000000ff9f8	movapd	%xmm0, %xmm1
00000000000ff9fc	movzbl	__ZGVZN5HGHLG4OETF2EpEdE1c(%rip), %eax ## guard variable for HGHLG::OETF::Ep(double)::c
00000000000ffa03	testb	%al, %al
00000000000ffa05	je	0xffa17
00000000000ffa07	xorpd	%xmm0, %xmm0
00000000000ffa0b	ucomisd	%xmm1, %xmm0
00000000000ffa0f	jb	0xffa30
00000000000ffa11	addq	$0x10, %rsp
00000000000ffa15	popq	%rbp
00000000000ffa16	retq
00000000000ffa17	movsd	%xmm1, -0x8(%rbp)
00000000000ffa1c	callq	__ZN5HGHLG4OETF2EpEd.cold.1     ## HGHLG::OETF::Ep(double) (.cold.1)
00000000000ffa21	movsd	-0x8(%rbp), %xmm1
00000000000ffa26	xorpd	%xmm0, %xmm0
00000000000ffa2a	ucomisd	%xmm1, %xmm0
00000000000ffa2e	jae	0xffa11
00000000000ffa30	movsd	0x2ca828(%rip), %xmm0
00000000000ffa38	ucomisd	%xmm1, %xmm0
00000000000ffa3c	jae	0xffa65
00000000000ffa3e	addsd	0x2d137a(%rip), %xmm1
00000000000ffa46	movapd	%xmm1, %xmm0
00000000000ffa4a	callq	0x3c53ea                        ## symbol stub for: _log
00000000000ffa4f	mulsd	0x2d1371(%rip), %xmm0
00000000000ffa57	addsd	__ZZN5HGHLG4OETF2EpEdE1c(%rip), %xmm0 ## HGHLG::OETF::Ep(double)::c
00000000000ffa5f	addq	$0x10, %rsp
00000000000ffa63	popq	%rbp
00000000000ffa64	retq
00000000000ffa65	xorps	%xmm0, %xmm0
00000000000ffa68	sqrtsd	%xmm1, %xmm0
00000000000ffa6c	mulsd	0x2cc74c(%rip), %xmm0
00000000000ffa74	addq	$0x10, %rsp
00000000000ffa78	popq	%rbp
00000000000ffa79	retq
00000000000ffa7a	nopw	(%rax,%rax)
