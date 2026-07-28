__ZN9cc_matrix6invertEv:
0000000000004a2a	pushq	%rbp
0000000000004a2b	movq	%rsp, %rbp
0000000000004a2e	movss	(%rdi), %xmm4
0000000000004a32	movss	0x8(%rdi), %xmm8
0000000000004a38	movss	0xc(%rdi), %xmm0
0000000000004a3d	movaps	%xmm0, -0x20(%rbp)
0000000000004a41	movss	0x10(%rdi), %xmm6
0000000000004a46	movss	0x1c(%rdi), %xmm0
0000000000004a4b	movss	%xmm0, -0x4(%rbp)
0000000000004a50	movss	0x20(%rdi), %xmm2
0000000000004a55	movaps	%xmm4, %xmm1
0000000000004a58	mulss	%xmm6, %xmm1
0000000000004a5c	movaps	%xmm1, %xmm0
0000000000004a5f	mulss	%xmm2, %xmm0
0000000000004a63	xorps	%xmm13, %xmm13
0000000000004a67	ucomiss	%xmm13, %xmm0
0000000000004a6b	xorps	%xmm3, %xmm3
0000000000004a6e	jb	0x4a78
0000000000004a70	movaps	%xmm0, %xmm3
0000000000004a73	addss	%xmm13, %xmm3
0000000000004a78	movss	0x4(%rdi), %xmm7
0000000000004a7d	movss	0x14(%rdi), %xmm11
0000000000004a83	movss	0x18(%rdi), %xmm9
0000000000004a89	xorps	%xmm15, %xmm15
0000000000004a8d	cmpnless	%xmm0, %xmm15
0000000000004a93	andps	%xmm0, %xmm15
0000000000004a97	movaps	-0x20(%rbp), %xmm10
0000000000004a9c	mulss	-0x4(%rbp), %xmm10
0000000000004aa2	movaps	%xmm8, %xmm5
0000000000004aa6	mulss	%xmm10, %xmm5
0000000000004aab	ucomiss	%xmm13, %xmm5
0000000000004aaf	movaps	%xmm15, %xmm12
0000000000004ab3	addss	%xmm5, %xmm12
0000000000004ab8	jb	0x4abe
0000000000004aba	addss	%xmm5, %xmm3
0000000000004abe	xorps	%xmm0, %xmm0
0000000000004ac1	cmpnless	%xmm5, %xmm0
0000000000004ac6	blendvps	%xmm0, %xmm12, %xmm15
0000000000004acc	movaps	%xmm7, %xmm12
0000000000004ad0	mulss	%xmm9, %xmm12
0000000000004ad5	movaps	%xmm11, %xmm5
0000000000004ad9	mulss	%xmm12, %xmm5
0000000000004ade	ucomiss	%xmm13, %xmm5
0000000000004ae2	movaps	%xmm5, %xmm14
0000000000004ae6	addss	%xmm15, %xmm14
0000000000004aeb	jb	0x4af1
0000000000004aed	addss	%xmm5, %xmm3
0000000000004af1	xorps	%xmm0, %xmm0
0000000000004af4	cmpnless	%xmm5, %xmm0
0000000000004af9	blendvps	%xmm0, %xmm14, %xmm15
0000000000004aff	movaps	%xmm9, %xmm14
0000000000004b03	xorps	0xdd555(%rip), %xmm14
0000000000004b0b	mulss	%xmm6, %xmm14
0000000000004b10	mulss	%xmm8, %xmm14
0000000000004b15	ucomiss	%xmm13, %xmm14
0000000000004b19	movaps	%xmm14, %xmm5
0000000000004b1d	addss	%xmm15, %xmm5
0000000000004b22	jb	0x4b29
0000000000004b24	addss	%xmm14, %xmm3
0000000000004b29	xorps	%xmm0, %xmm0
0000000000004b2c	cmpnless	%xmm14, %xmm0
0000000000004b32	blendvps	%xmm0, %xmm5, %xmm15
0000000000004b38	movaps	-0x20(%rbp), %xmm14
0000000000004b3d	xorps	0xdd51b(%rip), %xmm14
0000000000004b45	mulss	%xmm7, %xmm14
0000000000004b4a	mulss	%xmm2, %xmm14
0000000000004b4f	ucomiss	%xmm13, %xmm14
0000000000004b53	movaps	%xmm14, %xmm5
0000000000004b57	addss	%xmm15, %xmm5
0000000000004b5c	jb	0x4b63
0000000000004b5e	addss	%xmm14, %xmm3
0000000000004b63	xorps	%xmm0, %xmm0
0000000000004b66	cmpnless	%xmm14, %xmm0
0000000000004b6c	blendvps	%xmm0, %xmm5, %xmm15
0000000000004b72	movaps	%xmm4, %xmm14
0000000000004b76	xorps	0xdd4e2(%rip), %xmm14
0000000000004b7e	mulss	-0x4(%rbp), %xmm14
0000000000004b84	mulss	%xmm11, %xmm14
0000000000004b89	ucomiss	%xmm13, %xmm14
0000000000004b8d	movaps	%xmm14, %xmm5
0000000000004b91	addss	%xmm15, %xmm5
0000000000004b96	jb	0x4b9d
0000000000004b98	addss	%xmm14, %xmm3
0000000000004b9d	xorps	%xmm0, %xmm0
0000000000004ba0	cmpnless	%xmm14, %xmm0
0000000000004ba6	blendvps	%xmm0, %xmm5, %xmm15
0000000000004bac	movaps	%xmm3, %xmm14
0000000000004bb0	addss	%xmm15, %xmm14
0000000000004bb5	xorps	%xmm0, %xmm0
0000000000004bb8	cvtss2sd	%xmm14, %xmm0
0000000000004bbd	ucomiss	%xmm14, %xmm13
0000000000004bc1	jbe	0x4bca
0000000000004bc3	xorps	0xdd4a6(%rip), %xmm0
0000000000004bca	movsd	0xdd4ae(%rip), %xmm5
0000000000004bd2	ucomisd	%xmm0, %xmm5
0000000000004bd6	ja	0x4d15
0000000000004bdc	subss	%xmm15, %xmm3
0000000000004be1	movaps	%xmm14, %xmm0
0000000000004be5	divss	%xmm3, %xmm0
0000000000004be9	movaps	0xdd470(%rip), %xmm3
0000000000004bf0	xorps	%xmm0, %xmm3
0000000000004bf3	maxss	%xmm0, %xmm3
0000000000004bf7	xorps	%xmm0, %xmm0
0000000000004bfa	cvtss2sd	%xmm3, %xmm0
0000000000004bfe	movsd	0xdd482(%rip), %xmm3
0000000000004c06	ucomisd	%xmm0, %xmm3
0000000000004c0a	ja	0x4d15
0000000000004c10	movss	0xdd358(%rip), %xmm0
0000000000004c18	divss	%xmm14, %xmm0
0000000000004c1d	movaps	%xmm6, %xmm13
0000000000004c21	mulss	%xmm2, %xmm13
0000000000004c26	movaps	%xmm11, %xmm3
0000000000004c2a	movss	-0x4(%rbp), %xmm15
0000000000004c30	mulss	%xmm15, %xmm3
0000000000004c35	subss	%xmm3, %xmm13
0000000000004c3a	movaps	%xmm7, %xmm3
0000000000004c3d	mulss	%xmm2, %xmm3
0000000000004c41	movaps	%xmm8, %xmm5
0000000000004c45	mulss	%xmm15, %xmm5
0000000000004c4a	subss	%xmm5, %xmm3
0000000000004c4e	movaps	0xdd40b(%rip), %xmm5
0000000000004c55	xorps	%xmm5, %xmm3
0000000000004c58	unpcklps	%xmm3, %xmm13                   ## xmm13 = xmm13[0],xmm3[0],xmm13[1],xmm3[1]
0000000000004c5c	movaps	%xmm7, %xmm3
0000000000004c5f	mulss	%xmm11, %xmm3
0000000000004c64	movaps	%xmm8, %xmm5
0000000000004c68	mulss	%xmm6, %xmm5
0000000000004c6c	subss	%xmm5, %xmm3
0000000000004c70	insertps	$0x20, %xmm3, %xmm13            ## xmm13 = xmm13[0,1],xmm3[0],xmm13[3]
0000000000004c77	movaps	-0x20(%rbp), %xmm14
0000000000004c7c	movaps	%xmm14, %xmm3
0000000000004c80	mulss	%xmm2, %xmm3
0000000000004c84	movaps	%xmm4, %xmm5
0000000000004c87	mulss	%xmm11, %xmm5
0000000000004c8c	mulss	%xmm9, %xmm11
0000000000004c91	subss	%xmm11, %xmm3
0000000000004c96	movaps	0xdd3c2(%rip), %xmm11
0000000000004c9e	xorps	%xmm11, %xmm3
0000000000004ca2	insertps	$0x30, %xmm3, %xmm13            ## xmm13 = xmm13[0,1,2],xmm3[0]
0000000000004ca9	mulss	%xmm4, %xmm2
0000000000004cad	movaps	%xmm8, %xmm3
0000000000004cb1	mulss	%xmm9, %xmm3
0000000000004cb6	subss	%xmm3, %xmm2
0000000000004cba	mulss	%xmm14, %xmm8
0000000000004cbf	subss	%xmm8, %xmm5
0000000000004cc4	xorps	%xmm11, %xmm5
0000000000004cc8	unpcklps	%xmm5, %xmm2                    ## xmm2 = xmm2[0],xmm5[0],xmm2[1],xmm5[1]
0000000000004ccb	mulss	%xmm9, %xmm6
0000000000004cd0	subss	%xmm6, %xmm10
0000000000004cd5	insertps	$0x20, %xmm10, %xmm2            ## xmm2 = xmm2[0,1],xmm10[0],xmm2[3]
0000000000004cdc	mulss	%xmm15, %xmm4
0000000000004ce1	subss	%xmm12, %xmm4
0000000000004ce6	xorps	%xmm11, %xmm4
0000000000004cea	insertps	$0x30, %xmm4, %xmm2             ## xmm2 = xmm2[0,1,2],xmm4[0]
0000000000004cf0	mulss	%xmm14, %xmm7
0000000000004cf5	subss	%xmm7, %xmm1
0000000000004cf9	mulss	%xmm0, %xmm1
0000000000004cfd	shufps	$0x0, %xmm0, %xmm0              ## xmm0 = xmm0[0,0,0,0]
0000000000004d01	mulps	%xmm0, %xmm13
0000000000004d05	movups	%xmm13, (%rdi)
0000000000004d09	mulps	%xmm2, %xmm0
0000000000004d0c	movups	%xmm0, 0x10(%rdi)
0000000000004d10	movss	%xmm1, 0x20(%rdi)
0000000000004d15	popq	%rbp
0000000000004d16	retq
0000000000004d17	nop
