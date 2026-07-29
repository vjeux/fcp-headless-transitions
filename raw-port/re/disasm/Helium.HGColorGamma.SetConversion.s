__ZN12HGColorGamma13SetConversionENS_26hgColorGammaColorPrimariesENS_28hgColorGammaTransferFunctionENS_30hgColorGammaMatrixCoefficientsES0_S1_S2_:
00000000000fc0a0	pushq	%rbp
00000000000fc0a1	movq	%rsp, %rbp
00000000000fc0a4	pushq	%r15
00000000000fc0a6	pushq	%r14
00000000000fc0a8	pushq	%r13
00000000000fc0aa	pushq	%r12
00000000000fc0ac	pushq	%rbx
00000000000fc0ad	subq	$0x38, %rsp
00000000000fc0b1	movl	%r9d, %r14d
00000000000fc0b4	movl	%r8d, -0x40(%rbp)
00000000000fc0b8	movl	%ecx, %r13d
00000000000fc0bb	movl	%edx, %r12d
00000000000fc0be	movl	%esi, %r15d
00000000000fc0c1	movq	%rdi, %rbx
00000000000fc0c4	callq	__ZN6HGNode9ClearBitsEv         ## HGNode::ClearBits()
00000000000fc0c9	movb	$0x1, 0x2e9(%rbx)
00000000000fc0d0	cmpl	$0x8, %r14d
00000000000fc0d4	jne	0xfc191
00000000000fc0da	cmpl	$0x0, 0x10(%rbp)
00000000000fc0de	jne	0xfc2c8
00000000000fc0e4	cmpl	$0x8, %r12d
00000000000fc0e8	sete	%al
00000000000fc0eb	testl	%r13d, %r13d
00000000000fc0ee	setne	%cl
00000000000fc0f1	testb	%cl, %al
00000000000fc0f3	jne	0xfc2c8
00000000000fc0f9	movl	%r13d, %r14d
00000000000fc0fc	shlq	$0x6, %r14
00000000000fc100	leaq	__ZN12HGColorGamma10YCbCrToRGBE(%rip), %r13 ## HGColorGamma::YCbCrToRGB
00000000000fc107	movq	%rbx, %rdi
00000000000fc10a	callq	__ZN6HGNode9ClearBitsEv         ## HGNode::ClearBits()
00000000000fc10f	movb	$0x1, 0x2e9(%rbx)
00000000000fc116	movaps	(%r14,%r13), %xmm0
00000000000fc11b	movapd	0x10(%r14,%r13), %xmm1
00000000000fc122	movapd	0x20(%r14,%r13), %xmm2
00000000000fc129	movaps	%xmm0, 0x380(%rbx)
00000000000fc130	movapd	%xmm1, 0x390(%rbx)
00000000000fc138	movapd	%xmm2, 0x3a0(%rbx)
00000000000fc140	movaps	0x2cde99(%rip), %xmm0
00000000000fc147	movaps	%xmm0, 0x3b0(%rbx)
00000000000fc14e	decl	%r12d
00000000000fc151	cmpl	$0x11, %r12d
00000000000fc155	ja	0xfc99e
00000000000fc15b	leaq	0xada(%rip), %rax
00000000000fc162	movslq	(%rax,%r12,4), %rcx
00000000000fc166	addq	%rax, %rcx
00000000000fc169	jmpq	*%rcx
00000000000fc16b	movq	%rbx, %rdi
00000000000fc16e	callq	__ZN6HGNode9ClearBitsEv         ## HGNode::ClearBits()
00000000000fc173	movb	$0x1, 0x2e9(%rbx)
00000000000fc17a	movq	$0x0, 0x404(%rbx)
00000000000fc185	movaps	0x2d3894(%rip), %xmm0
00000000000fc18c	jmp	0xfca04
00000000000fc191	cmpl	$0x8, %r12d
00000000000fc195	jne	0xfc1d4
00000000000fc197	testl	%r13d, %r13d
00000000000fc19a	jne	0xfc2c8
00000000000fc1a0	movl	-0x40(%rbp), %eax
00000000000fc1a3	cmpl	%eax, %r15d
00000000000fc1a6	jne	0xfc4ef
00000000000fc1ac	movaps	0x2ce8bd(%rip), %xmm0
00000000000fc1b3	movaps	%xmm0, -0x50(%rbp)
00000000000fc1b7	movsd	0x2cbaf1(%rip), %xmm0
00000000000fc1bf	movaps	%xmm0, -0x60(%rbp)
00000000000fc1c3	movss	0x2cbaf5(%rip), %xmm0
00000000000fc1cb	movaps	%xmm0, -0x40(%rbp)
00000000000fc1cf	jmp	0xfc63e
00000000000fc1d4	xorl	-0x40(%rbp), %r15d
00000000000fc1d8	xorl	%r14d, %r12d
00000000000fc1db	orl	%r15d, %r12d
00000000000fc1de	jne	0xfc2c8
00000000000fc1e4	movq	%rbx, %rdi
00000000000fc1e7	callq	__ZN6HGNode9ClearBitsEv         ## HGNode::ClearBits()
00000000000fc1ec	movb	$0x1, 0x2e9(%rbx)
00000000000fc1f3	movq	$0x0, 0x404(%rbx)
00000000000fc1fe	movaps	0x2cba3b(%rip), %xmm0
00000000000fc205	movaps	%xmm0, 0x300(%rbx)
00000000000fc20c	xorps	%xmm0, %xmm0
00000000000fc20f	movaps	%xmm0, 0x310(%rbx)
00000000000fc216	movaps	%xmm0, 0x320(%rbx)
00000000000fc21d	movaps	%xmm0, 0x330(%rbx)
00000000000fc224	movaps	%xmm0, 0x340(%rbx)
00000000000fc22b	movaps	%xmm0, 0x350(%rbx)
00000000000fc232	movaps	%xmm0, 0x360(%rbx)
00000000000fc239	movb	$0x1, 0x370(%rbx)
00000000000fc240	movl	0x10(%rbp), %r14d
00000000000fc244	cmpl	%r14d, %r13d
00000000000fc247	jne	0xfc2cf
00000000000fc24d	movq	%rbx, %rdi
00000000000fc250	callq	__ZN6HGNode9ClearBitsEv         ## HGNode::ClearBits()
00000000000fc255	movb	$0x1, 0x2e9(%rbx)
00000000000fc25c	movss	0x2cba5c(%rip), %xmm0
00000000000fc264	movaps	%xmm0, 0x380(%rbx)
00000000000fc26b	movsd	0x2cba3d(%rip), %xmm0
00000000000fc273	movaps	%xmm0, 0x390(%rbx)
00000000000fc27a	movaps	0x2ce7ef(%rip), %xmm0
00000000000fc281	movaps	%xmm0, 0x3a0(%rbx)
00000000000fc288	movaps	0x2cdd51(%rip), %xmm0
00000000000fc28f	movaps	%xmm0, 0x3b0(%rbx)
00000000000fc296	movq	%rbx, %rdi
00000000000fc299	callq	__ZN6HGNode9ClearBitsEv         ## HGNode::ClearBits()
00000000000fc29e	movaps	0x2ce7cb(%rip), %xmm2
00000000000fc2a5	movb	$0x1, 0x2e9(%rbx)
00000000000fc2ac	movss	0x2cba0c(%rip), %xmm0
00000000000fc2b4	movaps	%xmm0, 0x3c0(%rbx)
00000000000fc2bb	movsd	0x2cb9ed(%rip), %xmm0
00000000000fc2c3	jmp	0xfcbbc
00000000000fc2c8	xorl	%eax, %eax
00000000000fc2ca	jmp	0xfcbe2
00000000000fc2cf	testl	%r13d, %r13d
00000000000fc2d2	je	0xfc6bf
00000000000fc2d8	testl	%r14d, %r14d
00000000000fc2db	je	0xfc860
00000000000fc2e1	movl	%r14d, %eax
00000000000fc2e4	shlq	$0x6, %rax
00000000000fc2e8	leaq	__ZN12HGColorGamma10RGBToYCbCrE(%rip), %rcx ## HGColorGamma::RGBToYCbCr
00000000000fc2ef	movl	%r13d, %edx
00000000000fc2f2	shlq	$0x6, %rdx
00000000000fc2f6	leaq	__ZN12HGColorGamma10YCbCrToRGBE(%rip), %rsi ## HGColorGamma::YCbCrToRGB
00000000000fc2fd	movaps	(%rax,%rcx), %xmm6
00000000000fc301	movaps	0x10(%rax,%rcx), %xmm5
00000000000fc306	movaps	0x20(%rax,%rcx), %xmm8
00000000000fc30c	movaps	(%rdx,%rsi), %xmm4
00000000000fc310	movaps	0x10(%rdx,%rsi), %xmm3
00000000000fc315	movaps	0x20(%rdx,%rsi), %xmm2
00000000000fc31a	movshdup	%xmm6, %xmm0                    ## xmm0 = xmm6[1,1,3,3]
00000000000fc31e	cvtss2sd	%xmm0, %xmm1
00000000000fc322	movshdup	%xmm5, %xmm0                    ## xmm0 = xmm5[1,1,3,3]
00000000000fc326	cvtss2sd	%xmm0, %xmm0
00000000000fc32a	movaps	%xmm3, %xmm7
00000000000fc32d	blendps	$0x2, %xmm8, %xmm7              ## xmm7 = xmm7[0],xmm8[1],xmm7[2,3]
00000000000fc334	shufps	$0xe1, %xmm7, %xmm7             ## xmm7 = xmm7[1,0,2,3]
00000000000fc338	cvtps2pd	%xmm7, %xmm10
00000000000fc33c	movapd	%xmm10, %xmm7
00000000000fc341	movddup	%xmm10, %xmm9                   ## xmm9 = xmm10[0,0]
00000000000fc346	movapd	%xmm10, %xmm11
00000000000fc34b	unpckhpd	%xmm10, %xmm11                  ## xmm11 = xmm11[1],xmm10[1]
00000000000fc350	movapd	%xmm11, %xmm12
00000000000fc355	mulsd	%xmm1, %xmm12
00000000000fc35a	shufps	$0xe8, %xmm8, %xmm8             ## xmm8 = xmm8[0,2,2,3]
00000000000fc35f	cvtps2pd	%xmm8, %xmm8
00000000000fc363	movaps	%xmm4, %xmm10
00000000000fc367	insertps	$0x1c, %xmm2, %xmm10            ## xmm10 = xmm10[0],xmm2[0],zero,zero
00000000000fc36e	cvtps2pd	%xmm10, %xmm13
00000000000fc372	mulsd	%xmm11, %xmm7
00000000000fc377	shufps	$0xe8, %xmm6, %xmm6             ## xmm6 = xmm6[0,2,2,3]
00000000000fc37b	cvtps2pd	%xmm6, %xmm10
00000000000fc37f	mulsd	%xmm0, %xmm11
00000000000fc384	movapd	%xmm10, %xmm6
00000000000fc389	mulpd	%xmm13, %xmm6
00000000000fc38e	addsd	%xmm6, %xmm12
00000000000fc393	unpckhpd	%xmm6, %xmm6                    ## xmm6 = xmm6[1,1]
00000000000fc397	shufps	$0xe8, %xmm5, %xmm5             ## xmm5 = xmm5[0,2,2,3]
00000000000fc39b	cvtps2pd	%xmm5, %xmm5
00000000000fc39e	addsd	%xmm12, %xmm6
00000000000fc3a3	movapd	%xmm5, %xmm12
00000000000fc3a8	mulpd	%xmm13, %xmm12
00000000000fc3ad	addsd	%xmm12, %xmm11
00000000000fc3b2	unpckhpd	%xmm12, %xmm12                  ## xmm12 = xmm12[1,1]
00000000000fc3b7	addsd	%xmm11, %xmm12
00000000000fc3bc	mulpd	%xmm8, %xmm13
00000000000fc3c1	addsd	%xmm13, %xmm7
00000000000fc3c6	unpckhpd	%xmm13, %xmm13                  ## xmm13 = xmm13[1,1]
00000000000fc3cb	addsd	%xmm7, %xmm13
00000000000fc3d0	xorps	%xmm7, %xmm7
00000000000fc3d3	cvtsd2ss	%xmm6, %xmm7
00000000000fc3d7	xorps	%xmm11, %xmm11
00000000000fc3db	cvtsd2ss	%xmm12, %xmm11
00000000000fc3e0	xorps	%xmm12, %xmm12
00000000000fc3e4	cvtsd2ss	%xmm13, %xmm12
00000000000fc3e9	xorps	%xmm6, %xmm6
00000000000fc3ec	shufps	$0xe9, %xmm4, %xmm4             ## xmm4 = xmm4[1,2,2,3]
00000000000fc3f0	cvtps2pd	%xmm4, %xmm4
00000000000fc3f3	blendps	$0xe, %xmm6, %xmm7              ## xmm7 = xmm7[0],xmm6[1,2,3]
00000000000fc3f9	movaps	%xmm7, %xmm13
00000000000fc3fd	shufps	$0xe9, %xmm3, %xmm3             ## xmm3 = xmm3[1,2,2,3]
00000000000fc401	cvtps2pd	%xmm3, %xmm3
00000000000fc404	blendps	$0xe, %xmm6, %xmm11             ## xmm11 = xmm11[0],xmm6[1,2,3]
00000000000fc40b	shufps	$0xe9, %xmm2, %xmm2             ## xmm2 = xmm2[1,2,2,3]
00000000000fc40f	cvtps2pd	%xmm2, %xmm2
00000000000fc412	movddup	%xmm8, %xmm7                    ## xmm7 = xmm8[0,0]
00000000000fc417	mulpd	%xmm4, %xmm7
00000000000fc41b	mulpd	%xmm3, %xmm9
00000000000fc420	addpd	%xmm7, %xmm9
00000000000fc425	unpckhpd	%xmm8, %xmm8                    ## xmm8 = xmm8[1,1]
00000000000fc42a	mulpd	%xmm2, %xmm8
00000000000fc42f	movddup	%xmm10, %xmm7                   ## xmm7 = xmm10[0,0]
00000000000fc434	mulpd	%xmm4, %xmm7
00000000000fc438	movddup	%xmm1, %xmm1                    ## xmm1 = xmm1[0,0]
00000000000fc43c	mulpd	%xmm3, %xmm1
00000000000fc440	addpd	%xmm7, %xmm1
00000000000fc444	unpckhpd	%xmm10, %xmm10                  ## xmm10 = xmm10[1,1]
00000000000fc449	mulpd	%xmm2, %xmm10
00000000000fc44e	addpd	%xmm1, %xmm10
00000000000fc453	cvtpd2ps	%xmm10, %xmm1
00000000000fc458	addpd	%xmm9, %xmm8
00000000000fc45d	shufps	$0x4c, %xmm1, %xmm13            ## xmm13 = xmm13[0,3],xmm1[0,1]
00000000000fc462	movddup	%xmm5, %xmm1                    ## xmm1 = xmm5[0,0]
00000000000fc466	mulpd	%xmm4, %xmm1
00000000000fc46a	movddup	%xmm0, %xmm0                    ## xmm0 = xmm0[0,0]
00000000000fc46e	mulpd	%xmm3, %xmm0
00000000000fc472	addpd	%xmm1, %xmm0
00000000000fc476	unpckhpd	%xmm5, %xmm5                    ## xmm5 = xmm5[1,1]
00000000000fc47a	mulpd	%xmm2, %xmm5
00000000000fc47e	addpd	%xmm0, %xmm5
00000000000fc482	cvtpd2ps	%xmm5, %xmm0
00000000000fc486	shufps	$0x78, %xmm13, %xmm13           ## xmm13 = xmm13[0,2,3,1]
00000000000fc48b	movaps	%xmm13, -0x40(%rbp)
00000000000fc490	shufps	$0x4c, %xmm0, %xmm11            ## xmm11 = xmm11[0,3],xmm0[0,1]
00000000000fc495	cvtpd2ps	%xmm8, %xmm0
00000000000fc49a	shufps	$0x78, %xmm11, %xmm11           ## xmm11 = xmm11[0,2,3,1]
00000000000fc49f	movaps	%xmm11, -0x60(%rbp)
00000000000fc4a4	blendps	$0xe, %xmm6, %xmm12             ## xmm12 = xmm12[0],xmm6[1,2,3]
00000000000fc4ab	shufps	$0x4c, %xmm0, %xmm12            ## xmm12 = xmm12[0,3],xmm0[0,1]
00000000000fc4b0	shufps	$0x78, %xmm12, %xmm12           ## xmm12 = xmm12[0,2,3,1]
00000000000fc4b5	movaps	%xmm12, -0x50(%rbp)
00000000000fc4ba	movq	%rbx, %rdi
00000000000fc4bd	callq	__ZN6HGNode9ClearBitsEv         ## HGNode::ClearBits()
00000000000fc4c2	movb	$0x1, 0x2e9(%rbx)
00000000000fc4c9	movaps	-0x40(%rbp), %xmm0
00000000000fc4cd	movaps	%xmm0, 0x380(%rbx)
00000000000fc4d4	movaps	-0x60(%rbp), %xmm0
00000000000fc4d8	movaps	%xmm0, 0x390(%rbx)
00000000000fc4df	movaps	-0x50(%rbp), %xmm0
00000000000fc4e3	movaps	%xmm0, 0x3a0(%rbx)
00000000000fc4ea	jmp	0xfc8a7
00000000000fc4ef	movl	%eax, %eax
00000000000fc4f1	leaq	(%rax,%rax,8), %rax
00000000000fc4f5	leaq	__ZN12HGColorGamma8XYZToRGBE(%rip), %rcx ## HGColorGamma::XYZToRGB
00000000000fc4fc	movl	%r15d, %edx
00000000000fc4ff	leaq	(%rdx,%rdx,8), %rdx
00000000000fc503	leaq	__ZN12HGColorGamma8RGBToXYZE(%rip), %rsi ## HGColorGamma::RGBToXYZ
00000000000fc50a	movsd	(%rcx,%rax,8), %xmm1
00000000000fc50f	movsd	0x10(%rsi,%rdx,8), %xmm0
00000000000fc515	movddup	%xmm1, %xmm2                    ## xmm2 = xmm1[0,0]
00000000000fc519	mulsd	%xmm0, %xmm1
00000000000fc51d	movupd	0x8(%rcx,%rax,8), %xmm4
00000000000fc523	movsd	0x28(%rsi,%rdx,8), %xmm5
00000000000fc529	movhpd	0x40(%rsi,%rdx,8), %xmm5        ## xmm5 = xmm5[0],mem[0]
00000000000fc52f	mulpd	%xmm5, %xmm4
00000000000fc533	addsd	%xmm4, %xmm1
00000000000fc537	unpckhpd	%xmm4, %xmm4                    ## xmm4 = xmm4[1,1]
00000000000fc53b	addsd	%xmm1, %xmm4
00000000000fc53f	movsd	0x18(%rcx,%rax,8), %xmm3
00000000000fc545	movapd	%xmm0, %xmm1
00000000000fc549	mulsd	%xmm3, %xmm1
00000000000fc54d	movupd	0x20(%rcx,%rax,8), %xmm6
00000000000fc553	mulpd	%xmm5, %xmm6
00000000000fc557	addsd	%xmm6, %xmm1
00000000000fc55b	unpckhpd	%xmm6, %xmm6                    ## xmm6 = xmm6[1,1]
00000000000fc55f	addsd	%xmm1, %xmm6
00000000000fc563	movsd	0x30(%rcx,%rax,8), %xmm7
00000000000fc569	mulsd	%xmm7, %xmm0
00000000000fc56d	movupd	0x38(%rcx,%rax,8), %xmm1
00000000000fc573	mulpd	%xmm5, %xmm1
00000000000fc577	addsd	%xmm1, %xmm0
00000000000fc57b	unpckhpd	%xmm1, %xmm1                    ## xmm1 = xmm1[1,1]
00000000000fc57f	cvtsd2ss	%xmm4, %xmm8
00000000000fc584	addsd	%xmm0, %xmm1
00000000000fc588	xorps	%xmm0, %xmm0
00000000000fc58b	cvtsd2ss	%xmm6, %xmm0
00000000000fc58f	movupd	(%rsi,%rdx,8), %xmm6
00000000000fc594	movupd	0x18(%rsi,%rdx,8), %xmm9
00000000000fc59b	movupd	0x30(%rsi,%rdx,8), %xmm4
00000000000fc5a1	movddup	%xmm7, %xmm5                    ## xmm5 = xmm7[0,0]
00000000000fc5a5	mulpd	%xmm6, %xmm5
00000000000fc5a9	movddup	0x38(%rcx,%rax,8), %xmm7        ## xmm7 = mem[0,0]
00000000000fc5af	mulpd	%xmm9, %xmm7
00000000000fc5b4	addpd	%xmm5, %xmm7
00000000000fc5b8	movddup	0x40(%rcx,%rax,8), %xmm5        ## xmm5 = mem[0,0]
00000000000fc5be	mulpd	%xmm4, %xmm5
00000000000fc5c2	addpd	%xmm7, %xmm5
00000000000fc5c6	mulpd	%xmm6, %xmm2
00000000000fc5ca	movddup	0x8(%rcx,%rax,8), %xmm7         ## xmm7 = mem[0,0]
00000000000fc5d0	mulpd	%xmm9, %xmm7
00000000000fc5d5	addpd	%xmm2, %xmm7
00000000000fc5d9	movddup	0x10(%rcx,%rax,8), %xmm2        ## xmm2 = mem[0,0]
00000000000fc5df	mulpd	%xmm4, %xmm2
00000000000fc5e3	addpd	%xmm7, %xmm2
00000000000fc5e7	cvtpd2ps	%xmm2, %xmm2
00000000000fc5eb	insertps	$0x28, %xmm8, %xmm2             ## xmm2 = xmm2[0,1],xmm8[0],zero
00000000000fc5f2	movaps	%xmm2, -0x40(%rbp)
00000000000fc5f6	movddup	%xmm3, %xmm2                    ## xmm2 = xmm3[0,0]
00000000000fc5fa	mulpd	%xmm6, %xmm2
00000000000fc5fe	movddup	0x20(%rcx,%rax,8), %xmm3        ## xmm3 = mem[0,0]
00000000000fc604	mulpd	%xmm9, %xmm3
00000000000fc609	addpd	%xmm2, %xmm3
00000000000fc60d	movddup	0x28(%rcx,%rax,8), %xmm2        ## xmm2 = mem[0,0]
00000000000fc613	mulpd	%xmm4, %xmm2
00000000000fc617	addpd	%xmm3, %xmm2
00000000000fc61b	cvtpd2ps	%xmm2, %xmm2
00000000000fc61f	cvtpd2ps	%xmm5, %xmm3
00000000000fc623	insertps	$0x28, %xmm0, %xmm2             ## xmm2 = xmm2[0,1],xmm0[0],zero
00000000000fc629	movaps	%xmm2, -0x60(%rbp)
00000000000fc62d	xorps	%xmm0, %xmm0
00000000000fc630	cvtsd2ss	%xmm1, %xmm0
00000000000fc634	insertps	$0x28, %xmm0, %xmm3             ## xmm3 = xmm3[0,1],xmm0[0],zero
00000000000fc63a	movaps	%xmm3, -0x50(%rbp)
00000000000fc63e	movq	%rbx, %rdi
00000000000fc641	callq	__ZN6HGNode9ClearBitsEv         ## HGNode::ClearBits()
00000000000fc646	movb	$0x1, 0x2e9(%rbx)
00000000000fc64d	movaps	-0x40(%rbp), %xmm0
00000000000fc651	movaps	%xmm0, 0x380(%rbx)
00000000000fc658	movaps	-0x60(%rbp), %xmm0
00000000000fc65c	movaps	%xmm0, 0x390(%rbx)
00000000000fc663	movaps	-0x50(%rbp), %xmm0
00000000000fc667	movaps	%xmm0, 0x3a0(%rbx)
00000000000fc66e	movaps	0x2cd96b(%rip), %xmm0
00000000000fc675	movaps	%xmm0, 0x3b0(%rbx)
00000000000fc67c	decl	%r14d
00000000000fc67f	cmpl	$0x11, %r14d
00000000000fc683	ja	0xfc81c
00000000000fc689	leaq	0x564(%rip), %rax
00000000000fc690	movslq	(%rax,%r14,4), %rcx
00000000000fc694	addq	%rax, %rcx
00000000000fc697	jmpq	*%rcx
00000000000fc699	movq	%rbx, %rdi
00000000000fc69c	callq	__ZN6HGNode9ClearBitsEv         ## HGNode::ClearBits()
00000000000fc6a1	movb	$0x1, 0x2e9(%rbx)
00000000000fc6a8	movq	$0x0, 0x404(%rbx)
00000000000fc6b3	movaps	0x2d3346(%rip), %xmm0
00000000000fc6ba	jmp	0xfc78a
00000000000fc6bf	movq	%rbx, %rdi
00000000000fc6c2	callq	__ZN6HGNode9ClearBitsEv         ## HGNode::ClearBits()
00000000000fc6c7	movb	$0x1, 0x2e9(%rbx)
00000000000fc6ce	movss	0x2cb5ea(%rip), %xmm0
00000000000fc6d6	movaps	%xmm0, 0x380(%rbx)
00000000000fc6dd	movsd	0x2cb5cb(%rip), %xmm0
00000000000fc6e5	movaps	%xmm0, 0x390(%rbx)
00000000000fc6ec	movaps	0x2ce37d(%rip), %xmm0
00000000000fc6f3	movaps	%xmm0, 0x3a0(%rbx)
00000000000fc6fa	movaps	0x2cd8df(%rip), %xmm0
00000000000fc701	movaps	%xmm0, 0x3b0(%rbx)
00000000000fc708	movl	%r14d, %r14d
00000000000fc70b	jmp	0xfc820
00000000000fc710	movq	%rbx, %rdi
00000000000fc713	callq	__ZN6HGNode9ClearBitsEv         ## HGNode::ClearBits()
00000000000fc718	movb	$0x1, 0x2e9(%rbx)
00000000000fc71f	xorps	%xmm0, %xmm0
00000000000fc722	movaps	%xmm0, 0x310(%rbx)
00000000000fc729	movaps	%xmm0, 0x320(%rbx)
00000000000fc730	movaps	%xmm0, 0x330(%rbx)
00000000000fc737	movaps	%xmm0, 0x340(%rbx)
00000000000fc73e	movaps	%xmm0, 0x350(%rbx)
00000000000fc745	movaps	%xmm0, 0x360(%rbx)
00000000000fc74c	movq	$0xc, 0x404(%rbx)
00000000000fc757	jmp	0xfc807
00000000000fc75c	movq	%rbx, %rdi
00000000000fc75f	callq	__ZN12HGColorGamma25SetGammaFunctionSRGBGammaEv ## HGColorGamma::SetGammaFunctionSRGBGamma()
00000000000fc764	jmp	0xfc81c
00000000000fc769	movq	%rbx, %rdi
00000000000fc76c	callq	__ZN6HGNode9ClearBitsEv         ## HGNode::ClearBits()
00000000000fc771	movb	$0x1, 0x2e9(%rbx)
00000000000fc778	movq	$0x0, 0x404(%rbx)
00000000000fc783	movaps	0x2d3266(%rip), %xmm0
00000000000fc78a	movaps	%xmm0, 0x300(%rbx)
00000000000fc791	xorps	%xmm0, %xmm0
00000000000fc794	movaps	%xmm0, 0x310(%rbx)
00000000000fc79b	movaps	%xmm0, 0x320(%rbx)
00000000000fc7a2	movaps	%xmm0, 0x330(%rbx)
00000000000fc7a9	movaps	%xmm0, 0x340(%rbx)
00000000000fc7b0	movaps	%xmm0, 0x350(%rbx)
00000000000fc7b7	movaps	%xmm0, 0x360(%rbx)
00000000000fc7be	jmp	0xfc815
00000000000fc7c0	movq	%rbx, %rdi
00000000000fc7c3	callq	__ZN6HGNode9ClearBitsEv         ## HGNode::ClearBits()
00000000000fc7c8	movb	$0x1, 0x2e9(%rbx)
00000000000fc7cf	xorps	%xmm0, %xmm0
00000000000fc7d2	movaps	%xmm0, 0x310(%rbx)
00000000000fc7d9	movaps	%xmm0, 0x320(%rbx)
00000000000fc7e0	movaps	%xmm0, 0x330(%rbx)
00000000000fc7e7	movaps	%xmm0, 0x340(%rbx)
00000000000fc7ee	movaps	%xmm0, 0x350(%rbx)
00000000000fc7f5	movaps	%xmm0, 0x360(%rbx)
00000000000fc7fc	movq	$0xa, 0x404(%rbx)
00000000000fc807	movaps	0x2cb432(%rip), %xmm0
00000000000fc80e	movaps	%xmm0, 0x300(%rbx)
00000000000fc815	movb	$0x1, 0x370(%rbx)
00000000000fc81c	movl	0x10(%rbp), %r14d
00000000000fc820	shlq	$0x6, %r14
00000000000fc824	leaq	__ZN12HGColorGamma10RGBToYCbCrE(%rip), %r15 ## HGColorGamma::RGBToYCbCr
00000000000fc82b	movq	%rbx, %rdi
00000000000fc82e	callq	__ZN6HGNode9ClearBitsEv         ## HGNode::ClearBits()
00000000000fc833	movb	$0x1, 0x2e9(%rbx)
00000000000fc83a	movaps	(%r14,%r15), %xmm0
00000000000fc83f	movapd	0x10(%r14,%r15), %xmm1
00000000000fc846	movaps	0x20(%r14,%r15), %xmm2
00000000000fc84c	movaps	%xmm0, 0x3c0(%rbx)
00000000000fc853	movapd	%xmm1, 0x3d0(%rbx)
00000000000fc85b	jmp	0xfcbc3
00000000000fc860	movl	%r13d, %r14d
00000000000fc863	shlq	$0x6, %r14
00000000000fc867	leaq	__ZN12HGColorGamma10YCbCrToRGBE(%rip), %r15 ## HGColorGamma::YCbCrToRGB
00000000000fc86e	movq	%rbx, %rdi
00000000000fc871	callq	__ZN6HGNode9ClearBitsEv         ## HGNode::ClearBits()
00000000000fc876	movb	$0x1, 0x2e9(%rbx)
00000000000fc87d	movaps	(%r14,%r15), %xmm0
00000000000fc882	movapd	0x10(%r14,%r15), %xmm1
00000000000fc889	movapd	0x20(%r14,%r15), %xmm2
00000000000fc890	movaps	%xmm0, 0x380(%rbx)
00000000000fc897	movapd	%xmm1, 0x390(%rbx)
00000000000fc89f	movapd	%xmm2, 0x3a0(%rbx)
00000000000fc8a7	movaps	0x2cd732(%rip), %xmm0
00000000000fc8ae	movaps	%xmm0, 0x3b0(%rbx)
00000000000fc8b5	jmp	0xfc9aa
00000000000fc8ba	movq	%rbx, %rdi
00000000000fc8bd	callq	__ZN12HGColorGamma29SetGammaFunctionSRGBLinearizeEv ## HGColorGamma::SetGammaFunctionSRGBLinearize()
00000000000fc8c2	movl	-0x40(%rbp), %eax
00000000000fc8c5	cmpl	%eax, %r15d
00000000000fc8c8	je	0xfc9aa
00000000000fc8ce	jmp	0xfca4b
00000000000fc8d3	movq	%rbx, %rdi
00000000000fc8d6	callq	__ZN6HGNode9ClearBitsEv         ## HGNode::ClearBits()
00000000000fc8db	movb	$0x1, 0x2e9(%rbx)
00000000000fc8e2	xorps	%xmm0, %xmm0
00000000000fc8e5	movaps	%xmm0, 0x310(%rbx)
00000000000fc8ec	movaps	%xmm0, 0x320(%rbx)
00000000000fc8f3	movaps	%xmm0, 0x330(%rbx)
00000000000fc8fa	movaps	%xmm0, 0x340(%rbx)
00000000000fc901	movaps	%xmm0, 0x350(%rbx)
00000000000fc908	movaps	%xmm0, 0x360(%rbx)
00000000000fc90f	movq	$0xb, 0x404(%rbx)
00000000000fc91a	jmp	0xfc989
00000000000fc91c	movq	%rbx, %rdi
00000000000fc91f	callq	__ZN6HGNode9ClearBitsEv         ## HGNode::ClearBits()
00000000000fc924	movb	$0x1, 0x2e9(%rbx)
00000000000fc92b	movq	$0x0, 0x404(%rbx)
00000000000fc936	movaps	0x2cb303(%rip), %xmm0
00000000000fc93d	jmp	0xfca04
00000000000fc942	movq	%rbx, %rdi
00000000000fc945	callq	__ZN6HGNode9ClearBitsEv         ## HGNode::ClearBits()
00000000000fc94a	movb	$0x1, 0x2e9(%rbx)
00000000000fc951	xorps	%xmm0, %xmm0
00000000000fc954	movaps	%xmm0, 0x310(%rbx)
00000000000fc95b	movaps	%xmm0, 0x320(%rbx)
00000000000fc962	movaps	%xmm0, 0x330(%rbx)
00000000000fc969	movaps	%xmm0, 0x340(%rbx)
00000000000fc970	movaps	%xmm0, 0x350(%rbx)
00000000000fc977	movaps	%xmm0, 0x360(%rbx)
00000000000fc97e	movq	$0xd, 0x404(%rbx)
00000000000fc989	movaps	0x2cb2b0(%rip), %xmm0
00000000000fc990	movaps	%xmm0, 0x300(%rbx)
00000000000fc997	movb	$0x1, 0x370(%rbx)
00000000000fc99e	movl	-0x40(%rbp), %eax
00000000000fc9a1	cmpl	%eax, %r15d
00000000000fc9a4	jne	0xfca4b
00000000000fc9aa	movq	%rbx, %rdi
00000000000fc9ad	callq	__ZN6HGNode9ClearBitsEv         ## HGNode::ClearBits()
00000000000fc9b2	movb	$0x1, 0x2e9(%rbx)
00000000000fc9b9	movss	0x2cb2ff(%rip), %xmm0
00000000000fc9c1	movaps	%xmm0, 0x3c0(%rbx)
00000000000fc9c8	movsd	0x2cb2e0(%rip), %xmm0
00000000000fc9d0	movaps	%xmm0, 0x3d0(%rbx)
00000000000fc9d7	movaps	0x2ce092(%rip), %xmm2
00000000000fc9de	jmp	0xfcbc3
00000000000fc9e3	movq	%rbx, %rdi
00000000000fc9e6	callq	__ZN6HGNode9ClearBitsEv         ## HGNode::ClearBits()
00000000000fc9eb	movb	$0x1, 0x2e9(%rbx)
00000000000fc9f2	movq	$0x0, 0x404(%rbx)
00000000000fc9fd	movaps	0x2d300c(%rip), %xmm0
00000000000fca04	movaps	%xmm0, 0x300(%rbx)
00000000000fca0b	xorps	%xmm0, %xmm0
00000000000fca0e	movaps	%xmm0, 0x310(%rbx)
00000000000fca15	movaps	%xmm0, 0x320(%rbx)
00000000000fca1c	movaps	%xmm0, 0x330(%rbx)
00000000000fca23	movaps	%xmm0, 0x340(%rbx)
00000000000fca2a	movaps	%xmm0, 0x350(%rbx)
00000000000fca31	movaps	%xmm0, 0x360(%rbx)
00000000000fca38	movb	$0x1, 0x370(%rbx)
00000000000fca3f	movl	-0x40(%rbp), %eax
00000000000fca42	cmpl	%eax, %r15d
00000000000fca45	je	0xfc9aa
00000000000fca4b	movl	%eax, %eax
00000000000fca4d	leaq	(%rax,%rax,8), %rax
00000000000fca51	leaq	__ZN12HGColorGamma8XYZToRGBE(%rip), %rcx ## HGColorGamma::XYZToRGB
00000000000fca58	movl	%r15d, %edx
00000000000fca5b	leaq	(%rdx,%rdx,8), %rdx
00000000000fca5f	leaq	__ZN12HGColorGamma8RGBToXYZE(%rip), %rsi ## HGColorGamma::RGBToXYZ
00000000000fca66	movsd	(%rcx,%rax,8), %xmm1
00000000000fca6b	movsd	0x10(%rsi,%rdx,8), %xmm0
00000000000fca71	movddup	%xmm1, %xmm2                    ## xmm2 = xmm1[0,0]
00000000000fca75	mulsd	%xmm0, %xmm1
00000000000fca79	movupd	0x8(%rcx,%rax,8), %xmm4
00000000000fca7f	movsd	0x28(%rsi,%rdx,8), %xmm5
00000000000fca85	movhpd	0x40(%rsi,%rdx,8), %xmm5        ## xmm5 = xmm5[0],mem[0]
00000000000fca8b	mulpd	%xmm5, %xmm4
00000000000fca8f	addsd	%xmm4, %xmm1
00000000000fca93	unpckhpd	%xmm4, %xmm4                    ## xmm4 = xmm4[1,1]
00000000000fca97	addsd	%xmm1, %xmm4
00000000000fca9b	movsd	0x18(%rcx,%rax,8), %xmm3
00000000000fcaa1	movapd	%xmm0, %xmm1
00000000000fcaa5	mulsd	%xmm3, %xmm1
00000000000fcaa9	movupd	0x20(%rcx,%rax,8), %xmm6
00000000000fcaaf	mulpd	%xmm5, %xmm6
00000000000fcab3	addsd	%xmm6, %xmm1
00000000000fcab7	unpckhpd	%xmm6, %xmm6                    ## xmm6 = xmm6[1,1]
00000000000fcabb	addsd	%xmm1, %xmm6
00000000000fcabf	movsd	0x30(%rcx,%rax,8), %xmm7
00000000000fcac5	mulsd	%xmm7, %xmm0
00000000000fcac9	movupd	0x38(%rcx,%rax,8), %xmm1
00000000000fcacf	mulpd	%xmm5, %xmm1
00000000000fcad3	addsd	%xmm1, %xmm0
00000000000fcad7	unpckhpd	%xmm1, %xmm1                    ## xmm1 = xmm1[1,1]
00000000000fcadb	cvtsd2ss	%xmm4, %xmm8
00000000000fcae0	addsd	%xmm0, %xmm1
00000000000fcae4	xorps	%xmm0, %xmm0
00000000000fcae7	cvtsd2ss	%xmm6, %xmm0
00000000000fcaeb	movupd	(%rsi,%rdx,8), %xmm6
00000000000fcaf0	movupd	0x18(%rsi,%rdx,8), %xmm9
00000000000fcaf7	movupd	0x30(%rsi,%rdx,8), %xmm4
00000000000fcafd	movddup	%xmm7, %xmm5                    ## xmm5 = xmm7[0,0]
00000000000fcb01	mulpd	%xmm6, %xmm5
00000000000fcb05	movddup	0x38(%rcx,%rax,8), %xmm7        ## xmm7 = mem[0,0]
00000000000fcb0b	mulpd	%xmm9, %xmm7
00000000000fcb10	addpd	%xmm5, %xmm7
00000000000fcb14	movddup	0x40(%rcx,%rax,8), %xmm5        ## xmm5 = mem[0,0]
00000000000fcb1a	mulpd	%xmm4, %xmm5
00000000000fcb1e	addpd	%xmm7, %xmm5
00000000000fcb22	mulpd	%xmm6, %xmm2
00000000000fcb26	movddup	0x8(%rcx,%rax,8), %xmm7         ## xmm7 = mem[0,0]
00000000000fcb2c	mulpd	%xmm9, %xmm7
00000000000fcb31	addpd	%xmm2, %xmm7
00000000000fcb35	movddup	0x10(%rcx,%rax,8), %xmm2        ## xmm2 = mem[0,0]
00000000000fcb3b	mulpd	%xmm4, %xmm2
00000000000fcb3f	addpd	%xmm7, %xmm2
00000000000fcb43	cvtpd2ps	%xmm2, %xmm2
00000000000fcb47	insertps	$0x28, %xmm8, %xmm2             ## xmm2 = xmm2[0,1],xmm8[0],zero
00000000000fcb4e	movaps	%xmm2, -0x40(%rbp)
00000000000fcb52	movddup	%xmm3, %xmm2                    ## xmm2 = xmm3[0,0]
00000000000fcb56	mulpd	%xmm6, %xmm2
00000000000fcb5a	movddup	0x20(%rcx,%rax,8), %xmm3        ## xmm3 = mem[0,0]
00000000000fcb60	mulpd	%xmm9, %xmm3
00000000000fcb65	addpd	%xmm2, %xmm3
00000000000fcb69	movddup	0x28(%rcx,%rax,8), %xmm2        ## xmm2 = mem[0,0]
00000000000fcb6f	mulpd	%xmm4, %xmm2
00000000000fcb73	addpd	%xmm3, %xmm2
00000000000fcb77	cvtpd2ps	%xmm2, %xmm2
00000000000fcb7b	cvtpd2ps	%xmm5, %xmm3
00000000000fcb7f	insertps	$0x28, %xmm0, %xmm2             ## xmm2 = xmm2[0,1],xmm0[0],zero
00000000000fcb85	movaps	%xmm2, -0x60(%rbp)
00000000000fcb89	xorps	%xmm0, %xmm0
00000000000fcb8c	cvtsd2ss	%xmm1, %xmm0
00000000000fcb90	insertps	$0x28, %xmm0, %xmm3             ## xmm3 = xmm3[0,1],xmm0[0],zero
00000000000fcb96	movaps	%xmm3, -0x50(%rbp)
00000000000fcb9a	movq	%rbx, %rdi
00000000000fcb9d	callq	__ZN6HGNode9ClearBitsEv         ## HGNode::ClearBits()
00000000000fcba2	movaps	-0x50(%rbp), %xmm2
00000000000fcba6	movb	$0x1, 0x2e9(%rbx)
00000000000fcbad	movaps	-0x40(%rbp), %xmm0
00000000000fcbb1	movaps	%xmm0, 0x3c0(%rbx)
00000000000fcbb8	movaps	-0x60(%rbp), %xmm0
00000000000fcbbc	movaps	%xmm0, 0x3d0(%rbx)
00000000000fcbc3	movaps	%xmm2, 0x3e0(%rbx)
00000000000fcbca	movaps	0x2cd40f(%rip), %xmm0
00000000000fcbd1	movaps	%xmm0, 0x3f0(%rbx)
00000000000fcbd8	movq	%rbx, %rdi
00000000000fcbdb	callq	__ZN12HGColorGamma20SetYCbCrBiasAndScaleEv ## HGColorGamma::SetYCbCrBiasAndScale()
00000000000fcbe0	movb	$0x1, %al
00000000000fcbe2	addq	$0x38, %rsp
00000000000fcbe6	popq	%rbx
00000000000fcbe7	popq	%r12
00000000000fcbe9	popq	%r13
00000000000fcbeb	popq	%r14
00000000000fcbed	popq	%r15
00000000000fcbef	popq	%rbp
00000000000fcbf0	retq
00000000000fcbf1	nopl	(%rax)
00000000000fcbf4	movsl	(%rsi), %es:(%rdi)
00000000000fcbf5	cli
00000000000fcbf6	.byte 0xff #bad opcode
00000000000fcbf7	ljmpl	*(%rax)
00000000000fcbf9	cld
00000000000fcbfa	.byte 0xff #bad opcode
00000000000fcbfb	ljmpl	*(%rax)
00000000000fcbfd	cld
00000000000fcbfe	.byte 0xff #bad opcode
00000000000fcbff	ljmpl	*(%rax)
00000000000fcc01	cld
00000000000fcc02	.byte 0xff #bad opcode
00000000000fcc03	ljmpl	*(%rax)
00000000000fcc05	cld
00000000000fcc06	.byte 0xff #bad opcode
00000000000fcc07	ljmpl	*(%rax)
00000000000fcc09	cld
00000000000fcc0a	.byte 0xff #bad opcode
00000000000fcc0b	ljmpl	*(%rax)
00000000000fcc0d	cld
00000000000fcc0e	.byte 0xff #bad opcode
00000000000fcc0f	ljmpl	*(%rax)
00000000000fcc11	cld
00000000000fcc12	.byte 0xff #bad opcode
00000000000fcc13	ljmpl	*(%rax)
00000000000fcc15	cld
00000000000fcc16	.byte 0xff #bad opcode
00000000000fcc17	ljmpl	*(%rax)
00000000000fcc19	cld
00000000000fcc1a	.byte 0xff #bad opcode
00000000000fcc1b	ljmpl	*(%rax)
00000000000fcc1d	cld
00000000000fcc1e	.byte 0xff #bad opcode
00000000000fcc1f	ljmpl	*(%rax)
00000000000fcc21	cld
00000000000fcc22	.byte 0xff #bad opcode
00000000000fcc23	ljmpl	*-0x5(%rax)
00000000000fcc26	.byte 0xff #bad opcode
00000000000fcc27	ljmpl	*(%rax)
00000000000fcc29	cld
00000000000fcc2a	.byte 0xff #bad opcode
00000000000fcc2b	ljmpl	*(%rax)
00000000000fcc2d	cld
00000000000fcc2e	.byte 0xff #bad opcode
00000000000fcc2f	lcalll	*(%rbx,%rdi,8)
00000000000fcc32	.byte 0xff #bad opcode
00000000000fcc33	pushq	-0x5(%rbp)
00000000000fcc36	.byte 0xff #bad opcode
00000000000fcc37	decl	%esp
00000000000fcc39	sti
00000000000fcc3a	.byte 0xff #bad opcode
00000000000fcc3b	ljmpl	*(%rdi)
00000000000fcc3d	cmc
00000000000fcc3e	.byte 0xff #bad opcode
00000000000fcc3f	jmpq	*-0x3(%rdx)
00000000000fcc42	.byte 0xff #bad opcode
00000000000fcc43	jmpq	*-0x3(%rdx)
00000000000fcc46	.byte 0xff #bad opcode
00000000000fcc47	jmpq	*-0x3(%rdx)
00000000000fcc4a	.byte 0xff #bad opcode
00000000000fcc4b	jmpq	*-0x3(%rdx)
00000000000fcc4e	.byte 0xff #bad opcode
00000000000fcc4f	jmpq	*-0x3(%rdx)
00000000000fcc52	.byte 0xff #bad opcode
00000000000fcc53	jmpq	*-0x3(%rdx)
00000000000fcc56	.byte 0xff #bad opcode
00000000000fcc57	jmpq	*%rax
00000000000fcc59	cld
00000000000fcc5a	.byte 0xff #bad opcode
00000000000fcc5b	jmpq	*-0x3(%rdx)
00000000000fcc5e	.byte 0xff #bad opcode
00000000000fcc5f	jmpq	*-0x3(%rdx)
00000000000fcc62	.byte 0xff #bad opcode
00000000000fcc63	jmpq	*-0x3(%rdx)
00000000000fcc66	.byte 0xff #bad opcode
00000000000fcc67	jmpq	*-0x3(%rdx)
00000000000fcc6a	.byte 0xff #bad opcode
00000000000fcc6b	.byte 0xff #bad opcode
00000000000fcc6c	jle	0xfcc6a
00000000000fcc6e	.byte 0xff #bad opcode
00000000000fcc6f	jmpq	*-0x3(%rdx)
00000000000fcc72	.byte 0xff #bad opcode
00000000000fcc73	jmpq	*-0x3(%rdx)
00000000000fcc76	.byte 0xff #bad opcode
00000000000fcc77	incl	(%rsi)
00000000000fcc79	std
00000000000fcc7a	.byte 0xff #bad opcode
00000000000fcc7b	jmpq	*-0x68000003(%rdi)
00000000000fcc81	cld
00000000000fcc82	.byte 0xff #bad opcode
00000000000fcc83	jmpq	*0x66(%rsi)
00000000000fcc86	nopw	%cs:(%rax,%rax)
