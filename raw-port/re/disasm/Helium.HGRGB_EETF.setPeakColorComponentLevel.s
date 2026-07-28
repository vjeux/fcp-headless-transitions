__ZN10HGRGB_EETF26setPeakColorComponentLevelEd:
0000000000105a80	pushq	%rbp
0000000000105a81	movq	%rsp, %rbp
0000000000105a84	pushq	%rbx
0000000000105a85	pushq	%rax
0000000000105a86	movq	%rdi, %rbx
0000000000105a89	ucomisd	0x2cb47f(%rip), %xmm0
0000000000105a91	jae	0x105aaf
0000000000105a93	movsd	0x2cb485(%rip), %xmm0
0000000000105a9b	xorpd	%xmm1, %xmm1
0000000000105a9f	ucomisd	%xmm0, %xmm1
0000000000105aa3	jb	0x105ac9
0000000000105aa5	movsd	0x2cb27b(%rip), %xmm0
0000000000105aad	jmp	0x105b03
0000000000105aaf	minsd	0x2cb461(%rip), %xmm0
0000000000105ab7	divsd	0x2cb261(%rip), %xmm0
0000000000105abf	xorpd	%xmm1, %xmm1
0000000000105ac3	ucomisd	%xmm0, %xmm1
0000000000105ac7	jae	0x105aa5
0000000000105ac9	movsd	0x2cb25f(%rip), %xmm1
0000000000105ad1	callq	0x3c54ec                        ## symbol stub for: _pow
0000000000105ad6	movddup	%xmm0, %xmm0                    ## xmm0 = xmm0[0,0]
0000000000105ada	mulpd	0x2cb59e(%rip), %xmm0
0000000000105ae2	addpd	0x2cb5a6(%rip), %xmm0
0000000000105aea	movapd	%xmm0, %xmm1
0000000000105aee	unpckhpd	%xmm0, %xmm1                    ## xmm1 = xmm1[1],xmm0[1]
0000000000105af2	divsd	%xmm1, %xmm0
0000000000105af6	movsd	0x2cb23a(%rip), %xmm1
0000000000105afe	callq	0x3c54ec                        ## symbol stub for: _pow
0000000000105b03	movsd	0x2cb295(%rip), %xmm1
0000000000105b0b	mulsd	%xmm0, %xmm1
0000000000105b0f	addsd	0x2c7251(%rip), %xmm1
0000000000105b17	movsd	0x2c4741(%rip), %xmm2
0000000000105b1f	movapd	%xmm2, %xmm3
0000000000105b23	subsd	%xmm1, %xmm3
0000000000105b27	movsd	0x2cb3f9(%rip), %xmm4
0000000000105b2f	subsd	%xmm1, %xmm4
0000000000105b33	movddup	%xmm0, %xmm5                    ## xmm5 = xmm0[0,0]
0000000000105b37	addsd	%xmm0, %xmm0
0000000000105b3b	movapd	%xmm1, %xmm6
0000000000105b3f	addsd	%xmm2, %xmm6
0000000000105b43	divsd	%xmm3, %xmm2
0000000000105b47	mulpd	0x2cb5c1(%rip), %xmm5
0000000000105b4f	movddup	%xmm4, %xmm4                    ## xmm4 = xmm4[0,0]
0000000000105b53	addpd	%xmm5, %xmm4
0000000000105b57	subsd	%xmm0, %xmm6
0000000000105b5b	blendpd	$0x2, %xmm4, %xmm6              ## xmm6 = xmm6[0],xmm4[1]
0000000000105b61	unpcklpd	%xmm2, %xmm1                    ## xmm1 = xmm1[0],xmm2[0]
0000000000105b65	cvtpd2ps	%xmm6, %xmm0
0000000000105b69	cvtpd2ps	%xmm1, %xmm1
0000000000105b6d	movapd	%xmm1, %xmm2
0000000000105b71	unpcklpd	%xmm0, %xmm2                    ## xmm2 = xmm2[0],xmm0[0]
0000000000105b75	movapd	%xmm2, 0x1b0(%rbx)
0000000000105b7d	xorps	%xmm0, %xmm0
0000000000105b80	cvtsd2ss	%xmm3, %xmm0
0000000000105b84	movss	%xmm0, 0x1c0(%rbx)
0000000000105b8c	movss	%xmm1, 0x1c4(%rbx)
0000000000105b94	addq	$0x8, %rsp
0000000000105b98	popq	%rbx
0000000000105b99	popq	%rbp
0000000000105b9a	retq
0000000000105b9b	nopl	(%rax,%rax)
