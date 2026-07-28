__ZN12DspLibBiquad21calculateCoefficientsEj:
0000000001228ed0	pushq	%rbp
0000000001228ed1	movq	%rsp, %rbp
0000000001228ed4	pushq	%r15
0000000001228ed6	pushq	%r14
0000000001228ed8	pushq	%rbx
0000000001228ed9	subq	$0x38, %rsp
0000000001228edd	movq	(%rdi), %r14
0000000001228ee0	movl	%esi, %eax
0000000001228ee2	imulq	$0x38, %rax, %r15
0000000001228ee6	movss	0x2c(%r14,%r15), %xmm0
0000000001228eed	cvtss2sd	%xmm0, %xmm0
0000000001228ef1	mulsd	0x34965f(%rip), %xmm0
0000000001228ef9	movl	0x18(%rdi), %eax
0000000001228efc	cvtsi2sd	%rax, %xmm1
0000000001228f01	divsd	%xmm1, %xmm0
0000000001228f05	movsd	%xmm0, -0x20(%rbp)
0000000001228f0a	callq	0x14974e8                       ## symbol stub for: ___sincos_stret
0000000001228f0f	movapd	%xmm0, -0x40(%rbp)
0000000001228f14	movapd	%xmm1, -0x30(%rbp)
0000000001228f19	movss	0x30(%r14,%r15), %xmm0
0000000001228f20	xorps	%xmm1, %xmm1
0000000001228f23	cvtss2sd	%xmm0, %xmm1
0000000001228f27	movsd	%xmm1, -0x48(%rbp)
0000000001228f2c	addsd	%xmm1, %xmm1
0000000001228f30	movsd	0x343ac8(%rip), %xmm0
0000000001228f38	divsd	%xmm1, %xmm0
0000000001228f3c	callq	0x1497bba                       ## symbol stub for: _sinh
0000000001228f41	movl	0x28(%r14,%r15), %eax
0000000001228f46	cmpq	$0x12, %rax
0000000001228f4a	ja	0x122990b
0000000001228f50	movapd	%xmm0, %xmm5
0000000001228f54	leaq	(%r14,%r15), %rbx
0000000001228f58	mulsd	-0x40(%rbp), %xmm5
0000000001228f5d	leaq	0x9b4(%rip), %rcx
0000000001228f64	movslq	(%rcx,%rax,4), %rax
0000000001228f68	addq	%rcx, %rax
0000000001228f6b	jmpq	*%rax
0000000001228f6d	movsd	0x343a8b(%rip), %xmm3
0000000001228f75	movapd	%xmm3, %xmm0
0000000001228f79	subsd	%xmm5, %xmm0
0000000001228f7d	addsd	%xmm3, %xmm5
0000000001228f81	movapd	%xmm3, %xmm1
0000000001228f85	divsd	%xmm5, %xmm1
0000000001228f89	mulsd	%xmm1, %xmm0
0000000001228f8d	cvtsd2ss	%xmm0, %xmm0
0000000001228f91	movss	%xmm0, 0x10(%r14,%r15)
0000000001228f98	movapd	-0x30(%rbp), %xmm4
0000000001228f9d	subsd	%xmm4, %xmm3
0000000001228fa1	mulsd	0x3454a7(%rip), %xmm4
0000000001228fa9	movsd	0x343a87(%rip), %xmm0
0000000001228fb1	mulsd	%xmm3, %xmm0
0000000001228fb5	movapd	%xmm0, %xmm2
0000000001228fb9	unpcklpd	%xmm3, %xmm2                    ## xmm2 = xmm2[0],xmm3[0]
0000000001228fbd	unpcklpd	%xmm4, %xmm0                    ## xmm0 = xmm0[0],xmm4[0]
0000000001228fc1	movddup	%xmm1, %xmm1                    ## xmm1 = xmm1[0,0]
0000000001228fc5	mulpd	%xmm1, %xmm2
0000000001228fc9	mulpd	%xmm1, %xmm0
0000000001228fcd	cvtpd2ps	%xmm0, %xmm0
0000000001228fd1	cvtpd2ps	%xmm2, %xmm1
0000000001228fd5	jmp	0x12298b3
0000000001228fda	movsd	-0x20(%rbp), %xmm0
0000000001228fdf	mulsd	0x343a51(%rip), %xmm0
0000000001228fe7	callq	0x1497d52                       ## symbol stub for: _tan
0000000001228fec	movapd	%xmm0, %xmm1
0000000001228ff0	movsd	0x343a08(%rip), %xmm2
0000000001228ff8	addsd	%xmm2, %xmm1
0000000001228ffc	divsd	%xmm1, %xmm2
0000000001229000	addsd	0x343a28(%rip), %xmm0
0000000001229008	mulsd	%xmm2, %xmm0
000000000122900c	cvtsd2ss	%xmm0, %xmm0
0000000001229010	jmp	0x1229125
0000000001229015	movsd	-0x20(%rbp), %xmm0
000000000122901a	mulsd	0x343a16(%rip), %xmm0
0000000001229022	callq	0x1497d52                       ## symbol stub for: _tan
0000000001229027	movsd	0x3439d1(%rip), %xmm4
000000000122902f	movapd	%xmm4, %xmm1
0000000001229033	divsd	%xmm0, %xmm1
0000000001229037	movapd	%xmm1, %xmm0
000000000122903b	mulsd	%xmm1, %xmm0
000000000122903f	mulsd	0x358a09(%rip), %xmm1
0000000001229047	movapd	%xmm0, %xmm2
000000000122904b	addsd	%xmm1, %xmm2
000000000122904f	addsd	%xmm4, %xmm2
0000000001229053	movapd	%xmm4, %xmm3
0000000001229057	divsd	%xmm2, %xmm3
000000000122905b	movapd	%xmm4, %xmm2
000000000122905f	subsd	%xmm0, %xmm2
0000000001229063	addsd	%xmm2, %xmm2
0000000001229067	mulsd	%xmm3, %xmm2
000000000122906b	subsd	%xmm1, %xmm4
000000000122906f	addsd	%xmm0, %xmm4
0000000001229073	mulsd	%xmm3, %xmm4
0000000001229077	unpcklpd	%xmm2, %xmm3                    ## xmm3 = xmm3[0],xmm2[0]
000000000122907b	cvtpd2ps	%xmm3, %xmm0
000000000122907f	movss	%xmm0, (%rbx)
0000000001229083	movapd	%xmm0, %xmm1
0000000001229087	addss	%xmm0, %xmm1
000000000122908b	jmp	0x12292d5
0000000001229090	movapd	%xmm5, %xmm0
0000000001229094	movsd	0x343964(%rip), %xmm2
000000000122909c	addsd	%xmm2, %xmm0
00000000012290a0	movapd	%xmm2, %xmm1
00000000012290a4	movapd	-0x30(%rbp), %xmm3
00000000012290a9	mulsd	0x34539f(%rip), %xmm3
00000000012290b1	divsd	%xmm0, %xmm1
00000000012290b5	mulsd	%xmm1, %xmm3
00000000012290b9	subsd	%xmm5, %xmm2
00000000012290bd	mulsd	%xmm1, %xmm2
00000000012290c1	xorps	%xmm0, %xmm0
00000000012290c4	cvtsd2ss	%xmm2, %xmm0
00000000012290c8	movss	%xmm0, 0x10(%r14,%r15)
00000000012290cf	unpcklpd	%xmm3, %xmm1                    ## xmm1 = xmm1[0],xmm3[0]
00000000012290d3	cvtpd2ps	%xmm1, %xmm0
00000000012290d7	movddup	%xmm0, %xmm0                    ## xmm0 = xmm0[0,0]
00000000012290db	movupd	%xmm0, (%rbx)
00000000012290df	jmp	0x122990b
00000000012290e4	movsd	-0x20(%rbp), %xmm0
00000000012290e9	mulsd	0x343947(%rip), %xmm0
00000000012290f1	callq	0x1497d52                       ## symbol stub for: _tan
00000000012290f6	movsd	0x343902(%rip), %xmm3
00000000012290fe	movapd	%xmm3, %xmm1
0000000001229102	divsd	%xmm0, %xmm1
0000000001229106	movapd	%xmm1, %xmm0
000000000122910a	addsd	%xmm3, %xmm0
000000000122910e	movapd	%xmm3, %xmm2
0000000001229112	divsd	%xmm0, %xmm2
0000000001229116	subsd	%xmm1, %xmm3
000000000122911a	mulsd	%xmm2, %xmm3
000000000122911e	xorps	%xmm0, %xmm0
0000000001229121	cvtsd2ss	%xmm3, %xmm0
0000000001229125	movss	%xmm0, (%rbx)
0000000001229129	movss	0x343b9f(%rip), %xmm1
0000000001229131	movlps	%xmm1, 0x4(%r14,%r15)
0000000001229137	jmp	0x12297bc
000000000122913c	movddup	%xmm5, %xmm0                    ## xmm0 = xmm5[0,0]
0000000001229140	movsd	0x3438b8(%rip), %xmm3
0000000001229148	addsd	%xmm3, %xmm5
000000000122914c	movapd	-0x30(%rbp), %xmm4
0000000001229151	movapd	%xmm4, %xmm1
0000000001229155	addsd	%xmm3, %xmm1
0000000001229159	divsd	%xmm5, %xmm3
000000000122915d	movddup	%xmm1, %xmm1                    ## xmm1 = xmm1[0,0]
0000000001229161	movapd	0x3450d7(%rip), %xmm2
0000000001229169	subpd	%xmm0, %xmm2
000000000122916d	movsd	0x3438bb(%rip), %xmm0
0000000001229175	subpd	%xmm4, %xmm0
0000000001229179	mulpd	0x34973f(%rip), %xmm1
0000000001229181	blendpd	$0x1, %xmm0, %xmm1              ## xmm1 = xmm0[0],xmm1[1]
0000000001229187	mulsd	0x3452c1(%rip), %xmm4
000000000122918f	blendpd	$0x2, %xmm2, %xmm4              ## xmm4 = xmm4[0],xmm2[1]
0000000001229195	movddup	%xmm3, %xmm0                    ## xmm0 = xmm3[0,0]
0000000001229199	mulpd	%xmm0, %xmm1
000000000122919d	cvtpd2ps	%xmm1, %xmm1
00000000012291a1	mulpd	%xmm0, %xmm4
00000000012291a5	extractps	$0x1, %xmm1, (%rbx)
00000000012291ab	cvtpd2ps	%xmm4, %xmm0
00000000012291af	unpcklpd	%xmm0, %xmm1                    ## xmm1 = xmm1[0],xmm0[0]
00000000012291b3	movupd	%xmm1, 0x4(%r14,%r15)
00000000012291ba	jmp	0x122990b
00000000012291bf	movss	0x34(%rbx), %xmm0
00000000012291c4	cvtss2sd	%xmm0, %xmm0
00000000012291c8	mulsd	0x349c68(%rip), %xmm0
00000000012291d0	movapd	%xmm5, -0x40(%rbp)
00000000012291d5	callq	0x14974c4                       ## symbol stub for: ___exp10
00000000012291da	movapd	-0x40(%rbp), %xmm6
00000000012291df	movapd	%xmm6, %xmm1
00000000012291e3	divsd	%xmm0, %xmm1
00000000012291e7	movsd	0x343811(%rip), %xmm4
00000000012291ef	movapd	%xmm4, %xmm2
00000000012291f3	subsd	%xmm1, %xmm2
00000000012291f7	addsd	%xmm4, %xmm1
00000000012291fb	movapd	%xmm4, %xmm3
00000000012291ff	movapd	-0x30(%rbp), %xmm5
0000000001229204	mulsd	0x345244(%rip), %xmm5
000000000122920c	divsd	%xmm1, %xmm3
0000000001229210	mulsd	%xmm3, %xmm2
0000000001229214	xorps	%xmm1, %xmm1
0000000001229217	cvtsd2ss	%xmm2, %xmm1
000000000122921b	movss	%xmm1, 0x10(%r14,%r15)
0000000001229222	movapd	%xmm6, %xmm1
0000000001229226	mulsd	%xmm0, %xmm1
000000000122922a	movapd	%xmm1, %xmm0
000000000122922e	addsd	%xmm4, %xmm0
0000000001229232	subsd	%xmm1, %xmm4
0000000001229236	unpcklpd	%xmm5, %xmm0                    ## xmm0 = xmm0[0],xmm5[0]
000000000122923a	unpcklpd	%xmm5, %xmm4                    ## xmm4 = xmm4[0],xmm5[0]
000000000122923e	movddup	%xmm3, %xmm1                    ## xmm1 = xmm3[0,0]
0000000001229242	mulpd	%xmm1, %xmm0
0000000001229246	mulpd	%xmm1, %xmm4
000000000122924a	cvtpd2ps	%xmm4, %xmm1
000000000122924e	cvtpd2ps	%xmm0, %xmm0
0000000001229252	unpcklpd	%xmm1, %xmm0                    ## xmm0 = xmm0[0],xmm1[0]
0000000001229256	movupd	%xmm0, (%rbx)
000000000122925a	jmp	0x122990b
000000000122925f	movsd	-0x20(%rbp), %xmm0
0000000001229264	mulsd	0x3437cc(%rip), %xmm0
000000000122926c	callq	0x1497d52                       ## symbol stub for: _tan
0000000001229271	movapd	%xmm0, %xmm1
0000000001229275	mulsd	%xmm0, %xmm1
0000000001229279	mulsd	0x3587cf(%rip), %xmm0
0000000001229281	movapd	%xmm1, %xmm2
0000000001229285	addsd	%xmm0, %xmm2
0000000001229289	movsd	0x34376f(%rip), %xmm4
0000000001229291	addsd	%xmm4, %xmm2
0000000001229295	movapd	%xmm4, %xmm3
0000000001229299	divsd	%xmm2, %xmm3
000000000122929d	movsd	0x34378b(%rip), %xmm2
00000000012292a5	addsd	%xmm1, %xmm2
00000000012292a9	addsd	%xmm2, %xmm2
00000000012292ad	mulsd	%xmm3, %xmm2
00000000012292b1	subsd	%xmm0, %xmm4
00000000012292b5	addsd	%xmm1, %xmm4
00000000012292b9	mulsd	%xmm3, %xmm4
00000000012292bd	unpcklpd	%xmm2, %xmm3                    ## xmm3 = xmm3[0],xmm2[0]
00000000012292c1	cvtpd2ps	%xmm3, %xmm0
00000000012292c5	movss	%xmm0, (%rbx)
00000000012292c9	movss	0x345e77(%rip), %xmm1
00000000012292d1	mulss	%xmm0, %xmm1
00000000012292d5	movss	%xmm1, 0x4(%rbx)
00000000012292da	movlpd	%xmm0, 0x8(%r14,%r15)
00000000012292e1	xorps	%xmm0, %xmm0
00000000012292e4	cvtsd2ss	%xmm4, %xmm0
00000000012292e8	movss	%xmm0, 0x10(%r14,%r15)
00000000012292ef	jmp	0x122990b
00000000012292f4	movapd	%xmm5, %xmm0
00000000012292f8	movsd	0x343700(%rip), %xmm2
0000000001229300	addsd	%xmm2, %xmm0
0000000001229304	divsd	%xmm0, %xmm2
0000000001229308	movl	$0x0, 0xc(%rbx)
000000000122930f	movapd	0x343959(%rip), %xmm0
0000000001229317	xorpd	%xmm5, %xmm0
000000000122931b	mulsd	%xmm2, %xmm0
000000000122931f	cvtsd2ss	%xmm0, %xmm0
0000000001229323	movss	%xmm0, 0x10(%r14,%r15)
000000000122932a	movddup	%xmm5, %xmm0                    ## xmm0 = xmm5[0,0]
000000000122932e	movapd	-0x30(%rbp), %xmm3
0000000001229333	mulsd	0x345115(%rip), %xmm3
000000000122933b	movapd	0x344efd(%rip), %xmm1
0000000001229343	subpd	%xmm0, %xmm1
0000000001229347	blendpd	$0x1, %xmm3, %xmm1              ## xmm1 = xmm3[0],xmm1[1]
000000000122934d	movddup	%xmm2, %xmm0                    ## xmm0 = xmm2[0,0]
0000000001229351	mulpd	%xmm1, %xmm0
0000000001229355	cvtpd2ps	%xmm0, %xmm0
0000000001229359	movlpd	%xmm0, (%rbx)
000000000122935d	mulsd	%xmm5, %xmm2
0000000001229361	xorps	%xmm0, %xmm0
0000000001229364	cvtsd2ss	%xmm2, %xmm0
0000000001229368	movss	%xmm0, 0x8(%r14,%r15)
000000000122936f	jmp	0x122990b
0000000001229374	movsd	0x343684(%rip), %xmm2
000000000122937c	movapd	%xmm2, %xmm0
0000000001229380	divsd	-0x48(%rbp), %xmm0
0000000001229385	mulsd	0x3436ab(%rip), %xmm0
000000000122938d	movapd	-0x40(%rbp), %xmm1
0000000001229392	mulsd	%xmm0, %xmm1
0000000001229396	movapd	%xmm2, %xmm0
000000000122939a	subsd	%xmm1, %xmm0
000000000122939e	addsd	%xmm2, %xmm1
00000000012293a2	divsd	%xmm1, %xmm0
00000000012293a6	addsd	%xmm0, %xmm2
00000000012293aa	movapd	-0x30(%rbp), %xmm3
00000000012293af	mulsd	%xmm2, %xmm3
00000000012293b3	xorps	%xmm1, %xmm1
00000000012293b6	cvtsd2ss	%xmm3, %xmm1
00000000012293ba	addsd	%xmm3, %xmm2
00000000012293be	xorps	0x34392b(%rip), %xmm1
00000000012293c5	movss	%xmm1, 0xc(%rbx)
00000000012293ca	cvtsd2ss	%xmm0, %xmm0
00000000012293ce	mulsd	0x343702(%rip), %xmm2
00000000012293d6	movss	%xmm0, 0x10(%r14,%r15)
00000000012293dd	movsd	0x34506b(%rip), %xmm0
00000000012293e5	mulsd	%xmm2, %xmm0
00000000012293e9	unpcklpd	%xmm0, %xmm2                    ## xmm2 = xmm2[0],xmm0[0]
00000000012293ed	cvtpd2ps	%xmm2, %xmm0
00000000012293f1	movlpd	%xmm0, (%rbx)
00000000012293f5	movss	%xmm0, 0x8(%r14,%r15)
00000000012293fc	jmp	0x122990b
0000000001229401	movss	0x34(%rbx), %xmm0
0000000001229406	cvtss2sd	%xmm0, %xmm0
000000000122940a	mulsd	0x349a26(%rip), %xmm0
0000000001229412	callq	0x14974c4                       ## symbol stub for: ___exp10
0000000001229417	movapd	%xmm0, %xmm1
000000000122941b	mulsd	%xmm0, %xmm1
000000000122941f	movsd	0x3435d8(%rip), %xmm8
0000000001229428	addsd	%xmm8, %xmm1
000000000122942d	divsd	0x358623(%rip), %xmm1
0000000001229435	movsd	0x3435f3(%rip), %xmm2
000000000122943d	addsd	%xmm0, %xmm2
0000000001229441	movapd	%xmm2, %xmm3
0000000001229445	mulsd	%xmm2, %xmm3
0000000001229449	subsd	%xmm3, %xmm1
000000000122944d	sqrtsd	%xmm1, %xmm4
0000000001229451	movapd	%xmm0, %xmm1
0000000001229455	addsd	%xmm8, %xmm1
000000000122945a	movapd	-0x30(%rbp), %xmm6
000000000122945f	movapd	%xmm6, %xmm5
0000000001229463	mulsd	%xmm2, %xmm5
0000000001229467	movapd	%xmm1, %xmm3
000000000122946b	addsd	%xmm5, %xmm3
000000000122946f	movapd	-0x40(%rbp), %xmm7
0000000001229474	unpcklpd	%xmm6, %xmm7                    ## xmm7 = xmm7[0],xmm6[0]
0000000001229478	unpcklpd	%xmm1, %xmm4                    ## xmm4 = xmm4[0],xmm1[0]
000000000122947c	subsd	%xmm5, %xmm1
0000000001229480	mulpd	%xmm7, %xmm4
0000000001229484	movapd	%xmm1, %xmm5
0000000001229488	movapd	%xmm0, %xmm6
000000000122948c	subsd	%xmm4, %xmm1
0000000001229490	mulsd	%xmm0, %xmm1
0000000001229494	addsd	%xmm0, %xmm0
0000000001229498	movapd	%xmm3, %xmm7
000000000122949c	addsd	%xmm4, %xmm7
00000000012294a0	divsd	%xmm7, %xmm8
00000000012294a5	subsd	%xmm4, %xmm3
00000000012294a9	movddup	%xmm2, %xmm7                    ## xmm7 = xmm2[0,0]
00000000012294ad	addpd	%xmm4, %xmm5
00000000012294b1	subpd	%xmm4, %xmm7
00000000012294b5	unpckhpd	%xmm4, %xmm4                    ## xmm4 = xmm4[1,1]
00000000012294b9	addsd	%xmm2, %xmm4
00000000012294bd	mulsd	0x344f8b(%rip), %xmm4
00000000012294c5	mulsd	%xmm8, %xmm4
00000000012294ca	xorps	%xmm2, %xmm2
00000000012294cd	cvtsd2ss	%xmm4, %xmm2
00000000012294d1	movss	%xmm2, 0xc(%rbx)
00000000012294d6	mulsd	%xmm8, %xmm3
00000000012294db	xorps	%xmm2, %xmm2
00000000012294de	cvtsd2ss	%xmm3, %xmm2
00000000012294e2	movss	%xmm2, 0x10(%r14,%r15)
00000000012294e9	blendpd	$0x1, %xmm5, %xmm7              ## xmm7 = xmm5[0],xmm7[1]
00000000012294ef	unpcklpd	%xmm0, %xmm6                    ## xmm6 = xmm6[0],xmm0[0]
00000000012294f3	mulpd	%xmm7, %xmm6
00000000012294f7	movddup	%xmm8, %xmm0                    ## xmm0 = xmm8[0,0]
00000000012294fc	mulpd	%xmm6, %xmm0
0000000001229500	cvtpd2ps	%xmm0, %xmm0
0000000001229504	movlpd	%xmm0, (%rbx)
0000000001229508	mulsd	%xmm8, %xmm1
000000000122950d	xorps	%xmm0, %xmm0
0000000001229510	cvtsd2ss	%xmm1, %xmm0
0000000001229514	movss	%xmm0, 0x8(%r14,%r15)
000000000122951b	jmp	0x122990b
0000000001229520	movss	0x34(%rbx), %xmm0
0000000001229525	cvtss2sd	%xmm0, %xmm0
0000000001229529	mulsd	0x349907(%rip), %xmm0
0000000001229531	callq	0x14974c4                       ## symbol stub for: ___exp10
0000000001229536	movapd	%xmm0, %xmm3
000000000122953a	mulsd	%xmm0, %xmm3
000000000122953e	movsd	0x3434ba(%rip), %xmm7
0000000001229546	addsd	%xmm7, %xmm3
000000000122954a	divsd	0x358506(%rip), %xmm3
0000000001229552	movapd	%xmm0, %xmm4
0000000001229556	addsd	%xmm7, %xmm4
000000000122955a	movsd	0x344eee(%rip), %xmm1
0000000001229562	movsd	0x3434c6(%rip), %xmm6
000000000122956a	addsd	%xmm0, %xmm6
000000000122956e	movapd	-0x30(%rbp), %xmm8
0000000001229574	movapd	%xmm8, %xmm2
0000000001229579	mulsd	%xmm6, %xmm2
000000000122957d	movapd	%xmm4, %xmm5
0000000001229581	subsd	%xmm2, %xmm5
0000000001229585	addsd	%xmm4, %xmm2
0000000001229589	unpcklpd	%xmm6, %xmm2                    ## xmm2 = xmm2[0],xmm6[0]
000000000122958d	mulsd	%xmm6, %xmm6
0000000001229591	subsd	%xmm6, %xmm3
0000000001229595	sqrtsd	%xmm3, %xmm3
0000000001229599	movapd	-0x40(%rbp), %xmm6
000000000122959e	unpcklpd	%xmm8, %xmm6                    ## xmm6 = xmm6[0],xmm8[0]
00000000012295a3	unpcklpd	%xmm4, %xmm3                    ## xmm3 = xmm3[0],xmm4[0]
00000000012295a7	mulpd	%xmm6, %xmm3
00000000012295ab	movapd	%xmm5, %xmm4
00000000012295af	addsd	%xmm3, %xmm4
00000000012295b3	divsd	%xmm4, %xmm7
00000000012295b7	subsd	%xmm3, %xmm5
00000000012295bb	mulsd	%xmm7, %xmm5
00000000012295bf	xorps	%xmm4, %xmm4
00000000012295c2	cvtsd2ss	%xmm5, %xmm4
00000000012295c6	mulsd	%xmm0, %xmm1
00000000012295ca	movss	%xmm4, 0x10(%r14,%r15)
00000000012295d1	movapd	%xmm2, %xmm4
00000000012295d5	addpd	%xmm3, %xmm4
00000000012295d9	subpd	%xmm3, %xmm2
00000000012295dd	movapd	%xmm0, %xmm3
00000000012295e1	unpcklpd	%xmm1, %xmm3                    ## xmm3 = xmm3[0],xmm1[0]
00000000012295e5	mulpd	%xmm4, %xmm3
00000000012295e9	blendpd	$0x2, 0x34937d(%rip), %xmm0     ## xmm0 = xmm0[0],mem[1]
00000000012295f3	mulpd	%xmm2, %xmm0
00000000012295f7	movddup	%xmm7, %xmm1                    ## xmm1 = xmm7[0,0]
00000000012295fb	mulpd	%xmm1, %xmm3
00000000012295ff	mulpd	%xmm1, %xmm0
0000000001229603	jmp	0x12298ab
0000000001229608	movsd	-0x20(%rbp), %xmm0
000000000122960d	mulsd	0x343423(%rip), %xmm0
0000000001229615	callq	0x1497d52                       ## symbol stub for: _tan
000000000122961a	movsd	0x3433de(%rip), %xmm3
0000000001229622	movapd	%xmm3, %xmm1
0000000001229626	divsd	%xmm0, %xmm1
000000000122962a	movddup	%xmm1, %xmm0                    ## xmm0 = xmm1[0,0]
000000000122962e	movapd	0x35840a(%rip), %xmm2
0000000001229636	unpcklpd	%xmm1, %xmm2                    ## xmm2 = xmm2[0],xmm1[0]
000000000122963a	mulpd	%xmm0, %xmm2
000000000122963e	movapd	%xmm2, %xmm0
0000000001229642	unpckhpd	%xmm2, %xmm0                    ## xmm0 = xmm0[1],xmm2[1]
0000000001229646	movapd	%xmm0, %xmm1
000000000122964a	addsd	%xmm2, %xmm1
000000000122964e	addsd	%xmm3, %xmm1
0000000001229652	divsd	%xmm1, %xmm3
0000000001229656	movapd	0x343952(%rip), %xmm1
000000000122965e	subpd	%xmm2, %xmm1
0000000001229662	addpd	%xmm1, %xmm0
0000000001229666	addpd	%xmm1, %xmm1
000000000122966a	blendpd	$0x1, %xmm0, %xmm1              ## xmm1 = xmm0[0],xmm1[1]
0000000001229670	movddup	%xmm3, %xmm0                    ## xmm0 = xmm3[0,0]
0000000001229674	mulpd	%xmm1, %xmm0
0000000001229678	jmp	0x12296e6
000000000122967a	movsd	-0x20(%rbp), %xmm0
000000000122967f	mulsd	0x3433b1(%rip), %xmm0
0000000001229687	callq	0x1497d52                       ## symbol stub for: _tan
000000000122968c	movddup	%xmm0, %xmm1                    ## xmm1 = xmm0[0,0]
0000000001229690	movapd	0x3583a8(%rip), %xmm2
0000000001229698	unpcklpd	%xmm0, %xmm2                    ## xmm2 = xmm2[0],xmm0[0]
000000000122969c	mulpd	%xmm1, %xmm2
00000000012296a0	movapd	%xmm2, %xmm0
00000000012296a4	unpckhpd	%xmm2, %xmm0                    ## xmm0 = xmm0[1],xmm2[1]
00000000012296a8	movapd	%xmm0, %xmm1
00000000012296ac	addsd	%xmm2, %xmm1
00000000012296b0	movsd	0x343348(%rip), %xmm4
00000000012296b8	addsd	%xmm4, %xmm1
00000000012296bc	movapd	%xmm4, %xmm3
00000000012296c0	subpd	%xmm2, %xmm4
00000000012296c4	addpd	0x349254(%rip), %xmm2
00000000012296cc	divsd	%xmm1, %xmm3
00000000012296d0	addpd	%xmm0, %xmm4
00000000012296d4	addpd	%xmm2, %xmm2
00000000012296d8	blendpd	$0x1, %xmm4, %xmm2              ## xmm2 = xmm4[0],xmm2[1]
00000000012296de	movddup	%xmm3, %xmm0                    ## xmm0 = xmm3[0,0]
00000000012296e2	mulpd	%xmm2, %xmm0
00000000012296e6	cvtpd2ps	%xmm0, %xmm0
00000000012296ea	movlpd	%xmm0, (%rbx)
00000000012296ee	movl	$0x3f800000, 0x8(%r14,%r15)     ## imm = 0x3F800000
00000000012296f7	shufps	$0xe1, %xmm0, %xmm0             ## xmm0 = xmm0[1,0,2,3]
00000000012296fb	movlps	%xmm0, 0xc(%r14,%r15)
0000000001229701	jmp	0x122990b
0000000001229706	movsd	-0x20(%rbp), %xmm0
000000000122970b	mulsd	0x343325(%rip), %xmm0
0000000001229713	callq	0x1497d52                       ## symbol stub for: _tan
0000000001229718	movapd	%xmm0, %xmm1
000000000122971c	movsd	0x3432dc(%rip), %xmm2
0000000001229724	addsd	%xmm2, %xmm1
0000000001229728	divsd	%xmm1, %xmm2
000000000122972c	xorps	%xmm1, %xmm1
000000000122972f	cvtsd2ss	%xmm2, %xmm1
0000000001229733	movss	%xmm1, (%rbx)
0000000001229737	xorps	0x3435b2(%rip), %xmm1
000000000122973e	movss	%xmm1, 0x4(%r14,%r15)
0000000001229745	movl	$0x0, 0x8(%r14,%r15)
000000000122974e	addsd	0x3432da(%rip), %xmm0
0000000001229756	mulsd	%xmm2, %xmm0
000000000122975a	cvtsd2ss	%xmm0, %xmm0
000000000122975e	jmp	0x12297bc
0000000001229760	movsd	-0x20(%rbp), %xmm0
0000000001229765	mulsd	0x3432cb(%rip), %xmm0
000000000122976d	callq	0x1497d52                       ## symbol stub for: _tan
0000000001229772	movsd	0x343286(%rip), %xmm3
000000000122977a	movapd	%xmm3, %xmm1
000000000122977e	divsd	%xmm0, %xmm1
0000000001229782	movapd	%xmm1, %xmm0
0000000001229786	addsd	%xmm3, %xmm0
000000000122978a	movapd	%xmm3, %xmm2
000000000122978e	divsd	%xmm0, %xmm2
0000000001229792	xorps	%xmm0, %xmm0
0000000001229795	cvtsd2ss	%xmm2, %xmm0
0000000001229799	movss	%xmm0, (%rbx)
000000000122979d	movss	%xmm0, 0x4(%r14,%r15)
00000000012297a4	movl	$0x0, 0x8(%r14,%r15)
00000000012297ad	subsd	%xmm1, %xmm3
00000000012297b1	mulsd	%xmm2, %xmm3
00000000012297b5	xorps	%xmm0, %xmm0
00000000012297b8	cvtsd2ss	%xmm3, %xmm0
00000000012297bc	movss	%xmm0, 0xc(%r14,%r15)
00000000012297c3	movl	$0x0, 0x10(%r14,%r15)
00000000012297cc	jmp	0x122990b
00000000012297d1	movsd	-0x20(%rbp), %xmm0
00000000012297d6	mulsd	0x34325a(%rip), %xmm0
00000000012297de	callq	0x1497d52                       ## symbol stub for: _tan
00000000012297e3	movsd	%xmm0, -0x40(%rbp)
00000000012297e8	movss	0x34(%rbx), %xmm0
00000000012297ed	cvtss2sd	%xmm0, %xmm0
00000000012297f1	mulsd	0x344a6f(%rip), %xmm0
00000000012297f9	callq	0x14974c4                       ## symbol stub for: ___exp10
00000000012297fe	movsd	0x35824a(%rip), %xmm3
0000000001229806	movsd	-0x40(%rbp), %xmm5
000000000122980b	mulsd	%xmm5, %xmm3
000000000122980f	movapd	%xmm3, %xmm1
0000000001229813	movsd	0x3431e5(%rip), %xmm4
000000000122981b	addsd	%xmm4, %xmm1
000000000122981f	movapd	%xmm5, %xmm2
0000000001229823	mulsd	%xmm5, %xmm2
0000000001229827	addsd	%xmm2, %xmm1
000000000122982b	subsd	%xmm3, %xmm4
000000000122982f	addsd	%xmm2, %xmm4
0000000001229833	divsd	%xmm1, %xmm4
0000000001229837	xorps	%xmm3, %xmm3
000000000122983a	cvtsd2ss	%xmm4, %xmm3
000000000122983e	movss	%xmm3, 0x10(%r14,%r15)
0000000001229845	movapd	%xmm0, %xmm3
0000000001229849	addsd	%xmm0, %xmm3
000000000122984d	sqrtsd	%xmm3, %xmm3
0000000001229851	mulsd	%xmm5, %xmm3
0000000001229855	movapd	%xmm0, %xmm4
0000000001229859	unpcklpd	%xmm3, %xmm4                    ## xmm4 = xmm4[0],xmm3[0]
000000000122985d	unpcklpd	%xmm2, %xmm3                    ## xmm3 = xmm3[0],xmm2[0]
0000000001229861	movddup	%xmm2, %xmm5                    ## xmm5 = xmm2[0,0]
0000000001229865	unpcklpd	%xmm0, %xmm2                    ## xmm2 = xmm2[0],xmm0[0]
0000000001229869	subpd	%xmm4, %xmm2
000000000122986d	movhpd	0x3431bb(%rip), %xmm0           ## xmm0 = xmm0[0],mem[0]
0000000001229875	addpd	%xmm3, %xmm0
0000000001229879	movapd	%xmm0, %xmm3
000000000122987d	shufpd	$0x1, %xmm2, %xmm3              ## xmm3 = xmm3[1],xmm2[0]
0000000001229882	blendpd	$0x2, %xmm2, %xmm0              ## xmm0 = xmm0[0],xmm2[1]
0000000001229888	addpd	%xmm0, %xmm5
000000000122988c	addpd	%xmm3, %xmm3
0000000001229890	movapd	%xmm5, %xmm0
0000000001229894	shufpd	$0x1, %xmm3, %xmm0              ## xmm0 = xmm0[1],xmm3[0]
0000000001229899	blendpd	$0x1, %xmm5, %xmm3              ## xmm3 = xmm5[0],xmm3[1]
000000000122989f	movddup	%xmm1, %xmm1                    ## xmm1 = xmm1[0,0]
00000000012298a3	divpd	%xmm1, %xmm3
00000000012298a7	divpd	%xmm1, %xmm0
00000000012298ab	cvtpd2ps	%xmm0, %xmm0
00000000012298af	cvtpd2ps	%xmm3, %xmm1
00000000012298b3	unpcklpd	%xmm0, %xmm1                    ## xmm1 = xmm1[0],xmm0[0]
00000000012298b7	movupd	%xmm1, (%rbx)
00000000012298bb	jmp	0x122990b
00000000012298bd	movddup	%xmm5, %xmm0                    ## xmm0 = xmm5[0,0]
00000000012298c1	movsd	0x343137(%rip), %xmm2
00000000012298c9	addsd	%xmm2, %xmm5
00000000012298cd	divsd	%xmm5, %xmm2
00000000012298d1	movapd	-0x30(%rbp), %xmm3
00000000012298d6	mulsd	0x344b72(%rip), %xmm3
00000000012298de	movapd	0x34495a(%rip), %xmm1
00000000012298e6	subpd	%xmm0, %xmm1
00000000012298ea	blendpd	$0x1, %xmm3, %xmm1              ## xmm1 = xmm3[0],xmm1[1]
00000000012298f0	movl	$0x3f800000, (%rbx)             ## imm = 0x3F800000
00000000012298f6	movddup	%xmm2, %xmm0                    ## xmm0 = xmm2[0,0]
00000000012298fa	mulpd	%xmm1, %xmm0
00000000012298fe	cvtpd2ps	%xmm0, %xmm0
0000000001229902	movddup	%xmm0, %xmm0                    ## xmm0 = xmm0[0,0]
0000000001229906	movupd	%xmm0, 0x4(%rbx)
000000000122990b	addq	$0x38, %rsp
000000000122990f	popq	%rbx
0000000001229910	popq	%r14
0000000001229912	popq	%r15
0000000001229914	popq	%rbp
0000000001229915	retq
0000000001229916	nop
0000000001229918	pushq	%rbp
0000000001229919	idivb	%bh
000000000122991b	jmpq	*(%rax,%rdi,8)
000000000122991e	.byte 0xff #bad opcode
000000000122991f	lcalll	*-0x1(%rdx,%rdi,8)
0000000001229923	.byte 0xff #bad opcode
0000000001229924	fdivr	%st, %st(1)
0000000001229926	.byte 0xff #bad opcode
0000000001229927	.byte 0xff #bad opcode
0000000001229928	js	0x1229921
000000000122992a	.byte 0xff #bad opcode
000000000122992b	jmpq	*-0x16000008(%rdi)
0000000001229931	cli
0000000001229932	.byte 0xff #bad opcode
0000000001229933	decl	(%rax)
0000000001229935	cld
0000000001229936	.byte 0xff #bad opcode
0000000001229937	pushq	%rbx
0000000001229939	.byte 0xff #bad opcode
000000000122993a	.byte 0xff #bad opcode
000000000122993b	decl	-0x2(%rax)
000000000122993e	.byte 0xff #bad opcode
000000000122993f	.byte 0xff #bad opcode
0000000001229940	outb	%al, %dx
0000000001229941	std
0000000001229942	.byte 0xff #bad opcode
0000000001229943	.byte 0xff #bad opcode
0000000001229944	std
0000000001229945	idivb	%bh
0000000001229947	incl	-0x7(%rdi)
000000000122994a	.byte 0xff #bad opcode
000000000122994b	decl	%esp
000000000122994d	idivl	%edi
000000000122994f	incl	%edx
0000000001229951	idivb	%bh
0000000001229953	pushq	%rax
0000000001229955	cld
0000000001229956	.byte 0xff #bad opcode
0000000001229957	jmpq	*-0x3(%rdx)
000000000122995a	.byte 0xff #bad opcode
000000000122995b	jmpq	*-0x46000001(%rbp)
0000000001229961	.byte 0xfe #bad opcode
0000000001229962	.byte 0xff #bad opcode
0000000001229963	jmpq	*0x66(%rsi)
0000000001229966	nopw	%cs:(%rax,%rax)
