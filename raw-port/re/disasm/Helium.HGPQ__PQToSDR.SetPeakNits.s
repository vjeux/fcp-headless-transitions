__ZN4HGPQ7PQToSDR11SetPeakNitsEd:
00000000000feeb0	pushq	%rbp
00000000000feeb1	movq	%rsp, %rbp
00000000000feeb4	pushq	%rbx
00000000000feeb5	pushq	%rax
00000000000feeb6	movq	%rdi, %rbx
00000000000feeb9	movabsq	$0x4069600000000000, %rax       ## imm = 0x4069600000000000
00000000000feec3	movq	%rax, 0x1b8(%rdi)
00000000000feeca	movsd	0x2d1ebe(%rip), %xmm1
00000000000feed2	maxsd	%xmm0, %xmm1
00000000000feed6	movsd	0x2d1e42(%rip), %xmm2
00000000000feede	movapd	%xmm2, %xmm0
00000000000feee2	minsd	%xmm1, %xmm0
00000000000feee6	movsd	%xmm0, 0x1a8(%rdi)
00000000000feeee	divsd	%xmm2, %xmm0
00000000000feef2	xorpd	%xmm1, %xmm1
00000000000feef6	ucomisd	%xmm0, %xmm1
00000000000feefa	jae	0xfef38
00000000000feefc	movsd	0x2d1e2c(%rip), %xmm1
00000000000fef04	callq	0x3c54ec                        ## symbol stub for: _pow
00000000000fef09	movddup	%xmm0, %xmm0                    ## xmm0 = xmm0[0,0]
00000000000fef0d	mulpd	0x2d216b(%rip), %xmm0
00000000000fef15	addpd	0x2d2173(%rip), %xmm0
00000000000fef1d	movapd	%xmm0, %xmm1
00000000000fef21	unpckhpd	%xmm0, %xmm1                    ## xmm1 = xmm1[1],xmm0[1]
00000000000fef25	divsd	%xmm1, %xmm0
00000000000fef29	movsd	0x2d1e07(%rip), %xmm1
00000000000fef31	callq	0x3c54ec                        ## symbol stub for: _pow
00000000000fef36	jmp	0xfef40
00000000000fef38	movsd	0x2d1de8(%rip), %xmm0
00000000000fef40	movsd	0x2d1e50(%rip), %xmm2
00000000000fef48	divsd	%xmm0, %xmm2
00000000000fef4c	movsd	0x2d1e4c(%rip), %xmm1
00000000000fef54	mulsd	%xmm2, %xmm1
00000000000fef58	addsd	0x2cde08(%rip), %xmm1
00000000000fef60	movsd	0x2cb2f8(%rip), %xmm3
00000000000fef68	movddup	%xmm1, %xmm4                    ## xmm4 = xmm1[0,0]
00000000000fef6c	movapd	0x2d218c(%rip), %xmm5
00000000000fef74	subpd	%xmm4, %xmm5
00000000000fef78	movddup	%xmm2, %xmm4                    ## xmm4 = xmm2[0,0]
00000000000fef7c	addsd	%xmm2, %xmm2
00000000000fef80	movapd	%xmm1, %xmm6
00000000000fef84	addpd	%xmm3, %xmm6
00000000000fef88	subpd	%xmm2, %xmm6
00000000000fef8c	movapd	%xmm3, %xmm2
00000000000fef90	subsd	%xmm1, %xmm2
00000000000fef94	mulpd	0x2d2174(%rip), %xmm4
00000000000fef9c	divsd	%xmm2, %xmm3
00000000000fefa0	addpd	%xmm5, %xmm4
00000000000fefa4	blendpd	$0x1, %xmm6, %xmm4              ## xmm4 = xmm6[0],xmm4[1]
00000000000fefaa	unpcklpd	%xmm3, %xmm1                    ## xmm1 = xmm1[0],xmm3[0]
00000000000fefae	cvtpd2ps	%xmm4, %xmm3
00000000000fefb2	cvtpd2ps	%xmm1, %xmm1
00000000000fefb6	movsd	%xmm0, 0x1b0(%rbx)
00000000000fefbe	movapd	%xmm1, %xmm0
00000000000fefc2	unpcklpd	%xmm3, %xmm0                    ## xmm0 = xmm0[0],xmm3[0]
00000000000fefc6	movapd	%xmm0, 0x1d0(%rbx)
00000000000fefce	xorps	%xmm0, %xmm0
00000000000fefd1	cvtsd2ss	%xmm2, %xmm0
00000000000fefd5	movss	%xmm0, 0x1e0(%rbx)
00000000000fefdd	movss	%xmm1, 0x1e4(%rbx)
00000000000fefe5	addq	$0x8, %rsp
00000000000fefe9	popq	%rbx
00000000000fefea	popq	%rbp
00000000000fefeb	retq
00000000000fefec	nopl	(%rax)
