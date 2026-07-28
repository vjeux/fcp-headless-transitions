__ZNK10PTTriangle4areaEv:
00000000003014c0	pushq	%rbp
00000000003014c1	movq	%rsp, %rbp
00000000003014c4	movsd	(%rdi), %xmm0
00000000003014c8	movsd	0x8(%rdi), %xmm1
00000000003014cd	movsd	0x10(%rdi), %xmm2
00000000003014d2	subps	%xmm0, %xmm1
00000000003014d5	subps	%xmm0, %xmm2
00000000003014d8	shufps	$0xe1, %xmm2, %xmm2             ## xmm2 = xmm2[1,0,2,3]
00000000003014dc	mulps	%xmm1, %xmm2
00000000003014df	movshdup	%xmm2, %xmm0                    ## xmm0 = xmm2[1,1,3,3]
00000000003014e3	subss	%xmm0, %xmm2
00000000003014e7	andps	0x4066d2(%rip), %xmm2
00000000003014ee	xorps	%xmm0, %xmm0
00000000003014f1	cvtss2sd	%xmm2, %xmm0
00000000003014f5	mulsd	0x4059ab(%rip), %xmm0
00000000003014fd	popq	%rbp
00000000003014fe	retq
00000000003014ff	nop
