__ZN11PCColorUtil17applySRGBToLinearEDv3_f:
00000000000046fc	pushq	%rbp
00000000000046fd	movq	%rsp, %rbp
0000000000004700	subq	$0x30, %rsp
0000000000004704	movaps	%xmm0, %xmm2
0000000000004707	xorps	%xmm1, %xmm1
000000000000470a	cmpltps	%xmm1, %xmm0
000000000000470e	movaps	%xmm0, -0x30(%rbp)
0000000000004712	andps	0xdd497(%rip), %xmm2
0000000000004719	movaps	%xmm2, -0x10(%rbp)
000000000000471d	movaps	%xmm2, %xmm0
0000000000004720	divps	0xdd5e9(%rip), %xmm0
0000000000004727	movaps	%xmm0, -0x20(%rbp)
000000000000472b	movaps	0xdd66e(%rip), %xmm0
0000000000004732	addps	%xmm2, %xmm0
0000000000004735	divps	0xdd5f4(%rip), %xmm0
000000000000473c	blendps	$0x8, %xmm1, %xmm0              ## xmm0 = xmm0[0,1,2],xmm1[3]
0000000000004742	movaps	0xdd587(%rip), %xmm1
0000000000004749	callq	0xde768                         ## symbol stub for: __simd_pow_f4
000000000000474e	movaps	%xmm0, %xmm1
0000000000004751	movaps	-0x10(%rbp), %xmm0
0000000000004755	cmpleps	0xdd653(%rip), %xmm0
000000000000475d	blendvps	%xmm0, -0x20(%rbp), %xmm1
0000000000004763	movaps	0xdd466(%rip), %xmm2
000000000000476a	movaps	-0x30(%rbp), %xmm0
000000000000476e	blendvps	%xmm0, 0xdd469(%rip), %xmm2
0000000000004777	mulps	%xmm1, %xmm2
000000000000477a	movaps	%xmm2, %xmm0
000000000000477d	addq	$0x30, %rsp
0000000000004781	popq	%rbp
0000000000004782	retq
0000000000004783	nop
