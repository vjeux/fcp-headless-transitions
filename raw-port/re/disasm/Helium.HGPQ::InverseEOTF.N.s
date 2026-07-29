__ZN4HGPQ11InverseEOTF1NEd:
00000000000fdda0	divsd	0x2d2f78(%rip), %xmm0
00000000000fdda8	xorpd	%xmm1, %xmm1
00000000000fddac	ucomisd	%xmm0, %xmm1
00000000000fddb0	jae	0xfddf1
00000000000fddb2	pushq	%rbp
00000000000fddb3	movq	%rsp, %rbp
00000000000fddb6	movsd	0x2d2f72(%rip), %xmm1
00000000000fddbe	callq	0x3c54ec                        ## symbol stub for: _pow
00000000000fddc3	movddup	%xmm0, %xmm0                    ## xmm0 = xmm0[0,0]
00000000000fddc7	mulpd	0x2d32b1(%rip), %xmm0
00000000000fddcf	addpd	0x2d32b9(%rip), %xmm0
00000000000fddd7	movapd	%xmm0, %xmm1
00000000000fdddb	unpckhpd	%xmm0, %xmm1                    ## xmm1 = xmm1[1],xmm0[1]
00000000000fdddf	divsd	%xmm1, %xmm0
00000000000fdde3	movsd	0x2d2f4d(%rip), %xmm1
00000000000fddeb	popq	%rbp
00000000000fddec	jmp	0x3c54ec                        ## symbol stub for: _pow
00000000000fddf1	movsd	0x2d2f2f(%rip), %xmm0
00000000000fddf9	retq
00000000000fddfa	nopw	(%rax,%rax)
