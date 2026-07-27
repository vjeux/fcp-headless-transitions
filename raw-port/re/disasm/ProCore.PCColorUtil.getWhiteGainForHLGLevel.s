__ZN11PCColorUtil23getWhiteGainForHLGLevelEf:
000000000000456f	pushq	%rbp
0000000000004570	movq	%rsp, %rbp
0000000000004573	subq	$0x10, %rsp
0000000000004577	movaps	%xmm0, -0x10(%rbp)
000000000000457b	callq	__ZN12_GLOBAL__N_13HLG19getTransferFunctionEv ## (anonymous namespace)::HLG::getTransferFunction()
0000000000004580	movaps	-0x10(%rbp), %xmm2
0000000000004584	shufps	$0x0, %xmm2, %xmm2              ## xmm2 = xmm2[0,0,0,0]
0000000000004588	xorps	%xmm1, %xmm1
000000000000458b	maxps	%xmm1, %xmm2
000000000000458e	movaps	%xmm2, -0x10(%rbp)
0000000000004592	movaps	0x156c27(%rip), %xmm0
0000000000004599	mulps	%xmm2, %xmm0
000000000000459c	addps	0x156c2d(%rip), %xmm0
00000000000045a3	blendps	$0x8, %xmm1, %xmm0              ## xmm0 = xmm0[0,1,2],xmm1[3]
00000000000045a9	callq	0xde756                         ## symbol stub for: __simd_exp2_f4
00000000000045ae	movaps	%xmm0, %xmm1
00000000000045b1	movaps	-0x10(%rbp), %xmm2
00000000000045b5	movaps	%xmm2, %xmm0
00000000000045b8	cmpless	0xdd9c7(%rip), %xmm0
00000000000045c1	mulss	%xmm2, %xmm2
00000000000045c5	mulss	0xdda37(%rip), %xmm2
00000000000045cd	addss	0xdda33(%rip), %xmm1
00000000000045d5	blendvps	%xmm0, %xmm2, %xmm1
00000000000045da	movaps	%xmm1, %xmm0
00000000000045dd	addq	$0x10, %rsp
00000000000045e1	popq	%rbp
00000000000045e2	retq
