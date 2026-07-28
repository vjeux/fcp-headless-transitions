__ZNK15PCSimplePolygon26signedPointToLineDistance2ERK9PCVector2IdES3_S3_:
00000000000c4196	pushq	%rbp
00000000000c4197	movq	%rsp, %rbp
00000000000c419a	movupd	(%rdx), %xmm0
00000000000c419e	movupd	(%rsi), %xmm1
00000000000c41a2	subpd	%xmm1, %xmm0
00000000000c41a6	movapd	%xmm0, %xmm2
00000000000c41aa	mulpd	%xmm0, %xmm2
00000000000c41ae	haddpd	%xmm2, %xmm2
00000000000c41b2	shufpd	$0x1, %xmm0, %xmm0              ## xmm0 = xmm0[1,0]
00000000000c41b7	movupd	(%rcx), %xmm3
00000000000c41bb	subpd	%xmm1, %xmm3
00000000000c41bf	mulpd	%xmm0, %xmm3
00000000000c41c3	movapd	%xmm3, %xmm0
00000000000c41c7	unpckhpd	%xmm3, %xmm0                    ## xmm0 = xmm0[1],xmm3[1]
00000000000c41cb	subsd	%xmm3, %xmm0
00000000000c41cf	movapd	%xmm0, %xmm1
00000000000c41d3	mulsd	%xmm0, %xmm1
00000000000c41d7	divsd	%xmm2, %xmm1
00000000000c41db	movapd	0x1de8d(%rip), %xmm2
00000000000c41e3	xorpd	%xmm1, %xmm2
00000000000c41e7	xorpd	%xmm3, %xmm3
00000000000c41eb	cmpltsd	%xmm3, %xmm0
00000000000c41f0	blendvpd	%xmm0, %xmm2, %xmm1
00000000000c41f5	movapd	%xmm1, %xmm0
00000000000c41f9	popq	%rbp
00000000000c41fa	retq
00000000000c41fb	nop
