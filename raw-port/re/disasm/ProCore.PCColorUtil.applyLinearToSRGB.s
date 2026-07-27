__ZN11PCColorUtil17applyLinearToSRGBEDv3_f:
0000000000004675	pushq	%rbp
0000000000004676	movq	%rsp, %rbp
0000000000004679	subq	$0x30, %rsp
000000000000467d	movaps	%xmm0, %xmm2
0000000000004680	xorps	%xmm0, %xmm0
0000000000004683	movaps	%xmm2, %xmm1
0000000000004686	andps	0xdd523(%rip), %xmm2
000000000000468d	movaps	%xmm2, -0x10(%rbp)
0000000000004691	cmpltps	%xmm0, %xmm1
0000000000004695	movaps	%xmm1, -0x30(%rbp)
0000000000004699	movaps	0xdd670(%rip), %xmm1
00000000000046a0	mulps	%xmm2, %xmm1
00000000000046a3	movaps	%xmm1, -0x20(%rbp)
00000000000046a7	blendps	$0x7, %xmm2, %xmm0              ## xmm0 = xmm2[0,1,2],xmm0[3]
00000000000046ad	movaps	0xdd57c(%rip), %xmm1
00000000000046b4	callq	0xde768                         ## symbol stub for: __simd_pow_f4
00000000000046b9	movaps	%xmm0, %xmm1
00000000000046bc	movaps	-0x10(%rbp), %xmm0
00000000000046c0	cmpleps	0xdd658(%rip), %xmm0
00000000000046c8	mulps	0xdd661(%rip), %xmm1
00000000000046cf	addps	0xdd66a(%rip), %xmm1
00000000000046d6	blendvps	%xmm0, -0x20(%rbp), %xmm1
00000000000046dc	movaps	0xdd4ed(%rip), %xmm2
00000000000046e3	movaps	-0x30(%rbp), %xmm0
00000000000046e7	blendvps	%xmm0, 0xdd4f0(%rip), %xmm2
00000000000046f0	mulps	%xmm1, %xmm2
00000000000046f3	movaps	%xmm2, %xmm0
00000000000046f6	addq	$0x30, %rsp
00000000000046fa	popq	%rbp
00000000000046fb	retq
