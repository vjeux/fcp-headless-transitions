__ZN4HGPQ4EOTF1CEd:
00000000000fdab0	xorpd	%xmm1, %xmm1
00000000000fdab4	ucomisd	%xmm0, %xmm1
00000000000fdab8	jae	0xfdb1b
00000000000fdaba	pushq	%rbp
00000000000fdabb	movq	%rsp, %rbp
00000000000fdabe	movsd	0x2d322a(%rip), %xmm1
00000000000fdac6	callq	0x3c54ec                        ## symbol stub for: _pow
00000000000fdacb	movsd	0x2d3225(%rip), %xmm1
00000000000fdad3	ucomisd	%xmm0, %xmm1
00000000000fdad7	xorpd	%xmm1, %xmm1
00000000000fdadb	jae	0xfdb1a
00000000000fdadd	movsd	0x2d321b(%rip), %xmm2
00000000000fdae5	addsd	%xmm0, %xmm2
00000000000fdae9	mulsd	0x2d3217(%rip), %xmm0
00000000000fdaf1	addsd	0x2d3217(%rip), %xmm0
00000000000fdaf9	divsd	%xmm0, %xmm2
00000000000fdafd	movsd	0x2d3213(%rip), %xmm1
00000000000fdb05	movapd	%xmm2, %xmm0
00000000000fdb09	callq	0x3c54ec                        ## symbol stub for: _pow
00000000000fdb0e	movapd	%xmm0, %xmm1
00000000000fdb12	mulsd	0x2d3206(%rip), %xmm1
00000000000fdb1a	popq	%rbp
00000000000fdb1b	movapd	%xmm1, %xmm0
00000000000fdb1f	retq
