__ZN17OZImageMaskRender11getWrapNodeER7LiAgent:
000000000046f8f0	pushq	%rbp
000000000046f8f1	movq	%rsp, %rbp
000000000046f8f4	pushq	%r15
000000000046f8f6	pushq	%r14
000000000046f8f8	pushq	%r13
000000000046f8fa	pushq	%r12
000000000046f8fc	pushq	%rbx
000000000046f8fd	subq	$0x398, %rsp                    ## imm = 0x398
000000000046f904	movq	%rdx, %r12
000000000046f907	movq	%rsi, %r15
000000000046f90a	movq	%rdi, %r14
000000000046f90d	movq	0x3b6b24(%rip), %rax            ## literal pool symbol address: ___stack_chk_guard
000000000046f914	movq	(%rax), %rax
000000000046f917	movq	%rax, -0x30(%rbp)
000000000046f91b	movl	$0x988, %edi                    ## imm = 0x988
000000000046f920	addq	0x5d8(%rsi), %rdi
000000000046f927	movq	0x3b4be2(%rip), %rsi            ## literal pool symbol address: _kCMTimeZero
000000000046f92e	xorpd	%xmm0, %xmm0
000000000046f932	callq	0x6dfa80                        ## symbol stub for: __ZNK9OZChannel13getValueAsIntERK6CMTimed
000000000046f937	movl	%eax, -0x54(%rbp)
000000000046f93a	movq	0x5d8(%r15), %rdi
000000000046f941	movq	(%rdi), %rax
000000000046f944	callq	*0x518(%rax)
000000000046f94a	xorpd	%xmm0, %xmm0
000000000046f94e	movapd	%xmm0, -0x40(%rbp)
000000000046f953	movapd	%xmm0, -0x50(%rbp)
000000000046f958	movabsq	$0x3ff0000000000000, %rbx       ## imm = 0x3FF0000000000000
000000000046f962	movq	%rbx, -0xc8(%rbp)
000000000046f969	movq	%rbx, -0xf0(%rbp)
000000000046f970	movq	%rbx, -0x118(%rbp)
000000000046f977	movq	%rbx, -0x140(%rbp)
000000000046f97e	movupd	%xmm0, -0x138(%rbp)
000000000046f986	movupd	%xmm0, -0x128(%rbp)
000000000046f98e	movapd	%xmm0, -0x110(%rbp)
000000000046f996	movapd	%xmm0, -0x100(%rbp)
000000000046f99e	movupd	%xmm0, -0xe8(%rbp)
000000000046f9a6	movupd	%xmm0, -0xd8(%rbp)
000000000046f9ae	testb	%al, %al
000000000046f9b0	je	0x46fa21
000000000046f9b2	leaq	-0x3c0(%rbp), %rdi
000000000046f9b9	movq	%r15, %rsi
000000000046f9bc	movq	%r12, %rdx
000000000046f9bf	callq	__ZN17OZImageMaskRender24getStencilWrapPixelXFormER7LiAgent ## OZImageMaskRender::getStencilWrapPixelXForm(LiAgent&)
000000000046f9c4	movaps	-0x3c0(%rbp), %xmm0
000000000046f9cb	movaps	%xmm0, -0x90(%rbp)
000000000046f9d2	movaps	-0x3b0(%rbp), %xmm0
000000000046f9d9	movaps	%xmm0, -0xc0(%rbp)
000000000046f9e0	movaps	-0x3a0(%rbp), %xmm0
000000000046f9e7	movaps	%xmm0, -0x80(%rbp)
000000000046f9eb	movaps	-0x390(%rbp), %xmm0
000000000046f9f2	movaps	%xmm0, -0x50(%rbp)
000000000046f9f6	movaps	-0x380(%rbp), %xmm0
000000000046f9fd	movaps	%xmm0, -0x40(%rbp)
000000000046fa01	movaps	-0x360(%rbp), %xmm0
000000000046fa08	movaps	%xmm0, -0x70(%rbp)
000000000046fa0c	movapd	-0x350(%rbp), %xmm0
000000000046fa14	movapd	%xmm0, -0xb0(%rbp)
000000000046fa1c	jmp	0x46fb2f
000000000046fa21	movq	0xa0(%r12), %rax
000000000046fa29	movups	(%rax), %xmm0
000000000046fa2c	movaps	%xmm0, -0x90(%rbp)
000000000046fa33	movups	0x10(%rax), %xmm0
000000000046fa37	movaps	%xmm0, -0xc0(%rbp)
000000000046fa3e	movups	0x20(%rax), %xmm0
000000000046fa42	movaps	%xmm0, -0x80(%rbp)
000000000046fa46	movups	0x30(%rax), %xmm0
000000000046fa4a	movaps	%xmm0, -0x50(%rbp)
000000000046fa4e	movups	0x40(%rax), %xmm0
000000000046fa52	movaps	%xmm0, -0x40(%rbp)
000000000046fa56	movups	0x60(%rax), %xmm0
000000000046fa5a	movaps	%xmm0, -0x70(%rbp)
000000000046fa5e	movups	0x70(%rax), %xmm0
000000000046fa62	movaps	%xmm0, -0xb0(%rbp)
000000000046fa69	movq	0x5d8(%r15), %rdi
000000000046fa70	callq	__ZN11OZImageMask29getMaskSourcePixelAspectRatioEv ## OZImageMask::getMaskSourcePixelAspectRatio()
000000000046fa75	movaps	%xmm0, -0xa0(%rbp)
000000000046fa7c	movq	0x5d8(%r15), %rax
000000000046fa83	movq	0x3b8(%rax), %rdi
000000000046fa8a	movsd	0x29594e(%rip), %xmm0
000000000046fa92	testq	%rdi, %rdi
000000000046fa95	je	0x46fac5
000000000046fa97	leaq	__ZTI11OZSceneNode(%rip), %rsi  ## typeinfo for OZSceneNode
000000000046fa9e	leaq	__ZTI15OZTransformNode(%rip), %rdx ## typeinfo for OZTransformNode
000000000046faa5	xorl	%ecx, %ecx
000000000046faa7	callq	0x6dfd0e                        ## symbol stub for: ___dynamic_cast
000000000046faac	movsd	0x29592c(%rip), %xmm0
000000000046fab4	testq	%rax, %rax
000000000046fab7	je	0x46fac5
000000000046fab9	movq	(%rax), %rcx
000000000046fabc	movq	%rax, %rdi
000000000046fabf	callq	*0x548(%rcx)
000000000046fac5	ucomisd	0x295913(%rip), %xmm0
000000000046facd	movapd	-0xa0(%rbp), %xmm1
000000000046fad5	jne	0x46fae5
000000000046fad7	jp	0x46fae5
000000000046fad9	ucomisd	0x2958ff(%rip), %xmm1
000000000046fae1	jne	0x46fae5
000000000046fae3	jnp	0x46fb2f
000000000046fae5	divsd	%xmm0, %xmm1
000000000046fae9	ucomisd	0x2958ef(%rip), %xmm1
000000000046faf1	jne	0x46faf5
000000000046faf3	jnp	0x46fb2f
000000000046faf5	movapd	-0x90(%rbp), %xmm0
000000000046fafd	mulsd	%xmm1, %xmm0
000000000046fb01	movapd	%xmm0, -0x90(%rbp)
000000000046fb09	movapd	-0x80(%rbp), %xmm0
000000000046fb0e	mulsd	%xmm1, %xmm0
000000000046fb12	movapd	%xmm0, -0x80(%rbp)
000000000046fb17	movapd	-0x70(%rbp), %xmm0
000000000046fb1c	mulsd	%xmm1, %xmm0
000000000046fb20	movapd	%xmm0, -0x70(%rbp)
000000000046fb25	mulsd	-0x40(%rbp), %xmm1
000000000046fb2a	movsd	%xmm1, -0x40(%rbp)
000000000046fb2f	movq	0x5d8(%r15), %r13
000000000046fb36	movq	0x20(%r15), %rax
000000000046fb3a	movq	%rax, -0x3b0(%rbp)
000000000046fb41	movupd	0x10(%r15), %xmm0
000000000046fb47	movapd	%xmm0, -0x3c0(%rbp)
000000000046fb4f	leaq	0x750(%r13), %rdi
000000000046fb56	leaq	-0x3c0(%rbp), %rsi
000000000046fb5d	xorpd	%xmm0, %xmm0
000000000046fb61	callq	0x6dfa9e                        ## symbol stub for: __ZNK9OZChannel16getValueAsDoubleERK6CMTimed
000000000046fb66	movsd	%xmm0, -0xa0(%rbp)
000000000046fb6e	addq	$0x7e8, %r13                    ## imm = 0x7E8
000000000046fb75	leaq	-0x3c0(%rbp), %rsi
000000000046fb7c	xorpd	%xmm0, %xmm0
000000000046fb80	movq	%r13, %rdi
000000000046fb83	callq	0x6dfa9e                        ## symbol stub for: __ZNK9OZChannel16getValueAsDoubleERK6CMTimed
000000000046fb88	movsd	-0xa0(%rbp), %xmm3
000000000046fb90	xorpd	%xmm1, %xmm1
000000000046fb94	ucomisd	%xmm1, %xmm3
000000000046fb98	movapd	-0xb0(%rbp), %xmm13
000000000046fba1	unpckhpd	%xmm13, %xmm13                  ## xmm13 = xmm13[1,1]
000000000046fba6	movapd	-0x90(%rbp), %xmm10
000000000046fbaf	movapd	-0x80(%rbp), %xmm11
000000000046fbb5	movapd	-0xc0(%rbp), %xmm12
000000000046fbbe	movapd	-0x70(%rbp), %xmm14
000000000046fbc4	jne	0x46fbc8
000000000046fbc6	jnp	0x46fc01
000000000046fbc8	movapd	%xmm3, %xmm1
000000000046fbcc	mulsd	%xmm10, %xmm1
000000000046fbd1	movapd	%xmm12, %xmm2
000000000046fbd6	unpckhpd	%xmm12, %xmm2                   ## xmm2 = xmm2[1],xmm12[1]
000000000046fbdb	addsd	%xmm1, %xmm2
000000000046fbdf	movapd	%xmm3, %xmm1
000000000046fbe3	mulsd	%xmm11, %xmm1
000000000046fbe8	addsd	-0x48(%rbp), %xmm1
000000000046fbed	unpcklpd	%xmm2, %xmm12                   ## xmm12 = xmm12[0],xmm2[0]
000000000046fbf2	movsd	%xmm1, -0x48(%rbp)
000000000046fbf7	mulsd	%xmm14, %xmm3
000000000046fbfc	addsd	%xmm3, %xmm13
000000000046fc01	xorpd	%xmm1, %xmm1
000000000046fc05	ucomisd	%xmm1, %xmm0
000000000046fc09	movapd	%xmm11, %xmm1
000000000046fc0e	unpckhpd	%xmm11, %xmm1                   ## xmm1 = xmm1[1],xmm11[1]
000000000046fc13	jne	0x46fc17
000000000046fc15	jnp	0x46fc72
000000000046fc17	movapd	%xmm10, %xmm4
000000000046fc1c	unpckhpd	%xmm10, %xmm4                   ## xmm4 = xmm4[1],xmm10[1]
000000000046fc21	movapd	%xmm4, %xmm2
000000000046fc25	mulsd	%xmm0, %xmm2
000000000046fc29	unpckhpd	%xmm12, %xmm12                  ## xmm12 = xmm12[1,1]
000000000046fc2e	addsd	%xmm2, %xmm12
000000000046fc33	movupd	-0x48(%rbp), %xmm2
000000000046fc38	movapd	%xmm14, %xmm3
000000000046fc3d	unpckhpd	%xmm14, %xmm3                   ## xmm3 = xmm3[1],xmm14[1]
000000000046fc42	movddup	%xmm0, %xmm0                    ## xmm0 = xmm0[0,0]
000000000046fc46	movapd	%xmm11, %xmm5
000000000046fc4b	unpckhpd	%xmm14, %xmm5                   ## xmm5 = xmm5[1],xmm14[1]
000000000046fc50	mulpd	%xmm0, %xmm5
000000000046fc54	unpcklpd	%xmm13, %xmm2                   ## xmm2 = xmm2[0],xmm13[0]
000000000046fc59	addpd	%xmm5, %xmm2
000000000046fc5d	movapd	%xmm2, %xmm13
000000000046fc62	unpckhpd	%xmm2, %xmm13                   ## xmm13 = xmm13[1],xmm2[1]
000000000046fc67	movlpd	%xmm2, -0x48(%rbp)
000000000046fc6c	movapd	%xmm2, %xmm6
000000000046fc70	jmp	0x46fc99
000000000046fc72	movapd	%xmm14, %xmm3
000000000046fc77	unpckhpd	%xmm14, %xmm3                   ## xmm3 = xmm3[1],xmm14[1]
000000000046fc7c	movsd	-0x48(%rbp), %xmm2
000000000046fc81	unpckhpd	%xmm12, %xmm12                  ## xmm12 = xmm12[1,1]
000000000046fc86	movapd	%xmm10, %xmm4
000000000046fc8b	unpckhpd	%xmm10, %xmm4                   ## xmm4 = xmm4[1],xmm10[1]
000000000046fc90	movapd	%xmm2, %xmm6
000000000046fc94	unpcklpd	%xmm13, %xmm6                   ## xmm6 = xmm6[0],xmm13[0]
000000000046fc99	movapd	%xmm3, %xmm0
000000000046fc9d	mulsd	%xmm11, %xmm0
000000000046fca2	movapd	%xmm1, %xmm5
000000000046fca6	mulsd	%xmm14, %xmm5
000000000046fcab	subsd	%xmm5, %xmm0
000000000046fcaf	movapd	%xmm11, %xmm5
000000000046fcb4	blendpd	$0x1, %xmm14, %xmm5             ## xmm5 = xmm14[0],xmm5[1]
000000000046fcbb	mulpd	%xmm6, %xmm5
000000000046fcbf	movapd	%xmm11, %xmm7
000000000046fcc4	unpcklpd	%xmm3, %xmm7                    ## xmm7 = xmm7[0],xmm3[0]
000000000046fcc8	shufpd	$0x1, %xmm6, %xmm6              ## xmm6 = xmm6[1,0]
000000000046fccd	mulpd	%xmm7, %xmm6
000000000046fcd1	subpd	%xmm6, %xmm5
000000000046fcd5	movapd	%xmm4, %xmm6
000000000046fcd9	unpcklpd	%xmm10, %xmm6                   ## xmm6 = xmm6[0],xmm10[0]
000000000046fcde	mulpd	%xmm5, %xmm6
000000000046fce2	movapd	%xmm6, %xmm7
000000000046fce6	unpckhpd	%xmm6, %xmm7                    ## xmm7 = xmm7[1],xmm6[1]
000000000046fcea	addsd	%xmm6, %xmm7
000000000046fcee	movapd	%xmm12, %xmm8
000000000046fcf3	mulsd	%xmm0, %xmm8
000000000046fcf8	addsd	%xmm7, %xmm8
000000000046fcfd	xorpd	%xmm6, %xmm6
000000000046fd01	ucomisd	%xmm6, %xmm8
000000000046fd06	jne	0x46fd0e
000000000046fd08	jnp	0x46fe1a
000000000046fd0e	movapd	%xmm1, %xmm6
000000000046fd12	mulsd	%xmm10, %xmm6
000000000046fd17	movapd	%xmm4, %xmm7
000000000046fd1b	mulsd	%xmm11, %xmm7
000000000046fd20	subsd	%xmm7, %xmm6
000000000046fd24	movapd	%xmm4, %xmm7
000000000046fd28	mulsd	%xmm14, %xmm7
000000000046fd2d	movapd	%xmm3, %xmm9
000000000046fd32	mulsd	%xmm10, %xmm9
000000000046fd37	subsd	%xmm9, %xmm7
000000000046fd3c	mulsd	%xmm12, %xmm11
000000000046fd41	movapd	%xmm2, %xmm9
000000000046fd46	mulsd	%xmm10, %xmm9
000000000046fd4b	subsd	%xmm9, %xmm11
000000000046fd50	mulsd	%xmm13, %xmm10
000000000046fd55	mulsd	%xmm12, %xmm14
000000000046fd5a	subsd	%xmm14, %xmm10
000000000046fd5f	mulsd	%xmm4, %xmm2
000000000046fd63	mulsd	%xmm12, %xmm1
000000000046fd68	subsd	%xmm1, %xmm2
000000000046fd6c	mulsd	%xmm12, %xmm3
000000000046fd71	mulsd	%xmm4, %xmm13
000000000046fd76	subsd	%xmm13, %xmm3
000000000046fd7b	movsd	0x29565d(%rip), %xmm1
000000000046fd83	divsd	%xmm8, %xmm1
000000000046fd88	unpcklpd	%xmm5, %xmm2                    ## xmm2 = xmm2[0],xmm5[0]
000000000046fd8c	shufpd	$0x1, %xmm3, %xmm5              ## xmm5 = xmm5[1],xmm3[0]
000000000046fd91	movddup	%xmm1, %xmm3                    ## xmm3 = xmm1[0,0]
000000000046fd95	mulpd	%xmm3, %xmm5
000000000046fd99	movapd	%xmm5, -0x140(%rbp)
000000000046fda1	mulpd	%xmm3, %xmm2
000000000046fda5	movupd	%xmm2, -0x128(%rbp)
000000000046fdad	mulsd	%xmm1, %xmm10
000000000046fdb2	movsd	%xmm10, -0x118(%rbp)
000000000046fdbb	mulsd	%xmm1, %xmm11
000000000046fdc0	movsd	%xmm11, -0x108(%rbp)
000000000046fdc9	unpcklpd	%xmm7, %xmm0                    ## xmm0 = xmm0[0],xmm7[0]
000000000046fdcd	mulpd	%xmm3, %xmm0
000000000046fdd1	movapd	%xmm0, -0xe0(%rbp)
000000000046fdd9	mulsd	%xmm6, %xmm1
000000000046fddd	movsd	%xmm1, -0xc8(%rbp)
000000000046fde5	movq	$0x0, -0xd0(%rbp)
000000000046fdf0	movq	$0x0, -0x110(%rbp)
000000000046fdfb	movq	$0x0, -0x130(%rbp)
000000000046fe06	xorpd	%xmm0, %xmm0
000000000046fe0a	movapd	%xmm0, -0x100(%rbp)
000000000046fe12	movapd	%xmm0, -0xf0(%rbp)
000000000046fe1a	movq	%rbx, -0x168(%rbp)
000000000046fe21	movq	%rbx, -0x190(%rbp)
000000000046fe28	movq	%rbx, -0x1b8(%rbp)
000000000046fe2f	movq	%rbx, -0x1e0(%rbp)
000000000046fe36	xorpd	%xmm0, %xmm0
000000000046fe3a	movupd	%xmm0, -0x1d8(%rbp)
000000000046fe42	movupd	%xmm0, -0x1c8(%rbp)
000000000046fe4a	movupd	%xmm0, -0x1b0(%rbp)
000000000046fe52	movupd	%xmm0, -0x1a0(%rbp)
000000000046fe5a	movupd	%xmm0, -0x188(%rbp)
000000000046fe62	movupd	%xmm0, -0x178(%rbp)
000000000046fe6a	leaq	-0x3c0(%rbp), %rdi
000000000046fe71	movq	%r12, %rsi
000000000046fe74	callq	0x6debc8                        ## symbol stub for: __ZN7LiAgentC1ERKS_
000000000046fe79	leaq	-0x3c0(%rbp), %rdi
000000000046fe80	leaq	-0x1e0(%rbp), %rsi
000000000046fe87	callq	0x6deb7a                        ## symbol stub for: __ZN7LiAgent17setPixelTransformERK14PCMatrix44TmplIdE
000000000046fe8c	movq	%r14, %r12
000000000046fe8f	leaq	-0x3c0(%rbp), %rdi
000000000046fe96	movl	$0x1, %esi
000000000046fe9b	callq	0x6deb6e                        ## symbol stub for: __ZN7LiAgent13setImageSpaceEN13LiImageSource10ImageSpaceE
000000000046fea0	leaq	-0x3c0(%rbp), %rdi
000000000046fea7	movl	$0x1, %esi
000000000046feac	callq	0x6deb8c                        ## symbol stub for: __ZN7LiAgent22setUseSourcePixelSpaceEb
000000000046feb1	movq	0x5e0(%r15), %rdx
000000000046feb8	leaq	-0x3c0(%rbp), %rsi
000000000046febf	movq	%r12, %rdi
000000000046fec2	callq	0x6debb0                        ## symbol stub for: __ZN7LiAgent9getHeliumEP13LiImageSource
000000000046fec7	cmpq	$0x0, (%r12)
000000000046fecc	je	0x4701cf
000000000046fed2	leaq	-0x160(%rbp), %rdi
000000000046fed9	leaq	-0x3c0(%rbp), %rsi
000000000046fee0	callq	0x6deb5c                        ## symbol stub for: __ZN7LiAgent11getBoundaryEv
000000000046fee5	movl	-0x54(%rbp), %eax
000000000046fee8	cmpl	$0x2, %eax
000000000046feeb	je	0x470048
000000000046fef1	cmpl	$0x1, %eax
000000000046fef4	jne	0x470193
000000000046fefa	movl	$0x2c0, %edi                    ## imm = 0x2C0
000000000046feff	callq	0x6def70                        ## symbol stub for: __ZN8HGObjectnwEm
000000000046ff04	movq	%rax, %r14
000000000046ff07	movq	%rax, %rdi
000000000046ff0a	callq	__ZN13HgcWrapRepeatC2Ev         ## HgcWrapRepeat::HgcWrapRepeat()
000000000046ff0f	leaq	__ZTV11HWrapRepeat(%rip), %rax  ## vtable for HWrapRepeat
000000000046ff16	addq	$0x10, %rax
000000000046ff1a	movq	%rax, (%r14)
000000000046ff1d	xorpd	%xmm0, %xmm0
000000000046ff21	movupd	%xmm0, 0x1a0(%r14)
000000000046ff2a	movaps	0x29548f(%rip), %xmm1
000000000046ff31	movups	%xmm1, 0x1b0(%r14)
000000000046ff39	movq	%rbx, 0x210(%r14)
000000000046ff40	movq	%rbx, 0x1e8(%r14)
000000000046ff47	movq	%rbx, 0x1c0(%r14)
000000000046ff4e	movupd	%xmm0, 0x1c8(%r14)
000000000046ff57	movupd	%xmm0, 0x1d8(%r14)
000000000046ff60	movupd	%xmm0, 0x1f0(%r14)
000000000046ff69	movupd	%xmm0, 0x200(%r14)
000000000046ff72	movupd	%xmm0, 0x218(%r14)
000000000046ff7b	movupd	%xmm0, 0x228(%r14)
000000000046ff84	movq	%rbx, 0x2b8(%r14)
000000000046ff8b	movq	%rbx, 0x290(%r14)
000000000046ff92	movq	%rbx, 0x268(%r14)
000000000046ff99	movapd	0x296e3f(%rip), %xmm1
000000000046ffa1	movupd	%xmm1, 0x238(%r14)
000000000046ffaa	movupd	%xmm0, 0x258(%r14)
000000000046ffb3	movupd	%xmm0, 0x248(%r14)
000000000046ffbc	movupd	%xmm0, 0x280(%r14)
000000000046ffc5	movupd	%xmm0, 0x270(%r14)
000000000046ffce	movupd	%xmm0, 0x2a8(%r14)
000000000046ffd7	movupd	%xmm0, 0x298(%r14)
000000000046ffe0	movq	%r14, %rdi
000000000046ffe3	xorl	%esi, %esi
000000000046ffe5	movl	$0x2, %edx
000000000046ffea	callq	0x6de9ee                        ## symbol stub for: __ZN6HGNode8SetFlagsEii
000000000046ffef	movq	(%r14), %rax
000000000046fff2	xorl	%ebx, %ebx
000000000046fff4	leaq	-0x160(%rbp), %rsi
000000000046fffb	movq	%r14, %rdi
000000000046fffe	callq	*0x230(%rax)
0000000000470004	movq	(%r14), %rax
0000000000470007	xorl	%ebx, %ebx
0000000000470009	leaq	-0x140(%rbp), %rsi
0000000000470010	movq	%r14, %rdi
0000000000470013	callq	*0x238(%rax)
0000000000470019	movq	-0x320(%rbp), %rsi
0000000000470020	movq	(%r14), %rax
0000000000470023	xorl	%ebx, %ebx
0000000000470025	movq	%r14, %rdi
0000000000470028	callq	*0x240(%rax)
000000000047002e	movq	(%r14), %rax
0000000000470031	movq	%r14, %rbx
0000000000470034	movq	%r14, %rdi
0000000000470037	callq	*0x10(%rax)
000000000047003a	movq	(%r14), %rax
000000000047003d	movq	%r14, %rdi
0000000000470040	callq	*0x18(%rax)
0000000000470043	jmp	0x470196
0000000000470048	movl	$0x2c0, %edi                    ## imm = 0x2C0
000000000047004d	callq	0x6def70                        ## symbol stub for: __ZN8HGObjectnwEm
0000000000470052	movq	%rax, %r14
0000000000470055	movq	%rax, %rdi
0000000000470058	callq	__ZN13HgcWrapMirrorC2Ev         ## HgcWrapMirror::HgcWrapMirror()
000000000047005d	leaq	__ZTV11HWrapMirror(%rip), %rax  ## vtable for HWrapMirror
0000000000470064	addq	$0x10, %rax
0000000000470068	movq	%rax, (%r14)
000000000047006b	xorpd	%xmm0, %xmm0
000000000047006f	movupd	%xmm0, 0x1a0(%r14)
0000000000470078	movaps	0x295341(%rip), %xmm1
000000000047007f	movups	%xmm1, 0x1b0(%r14)
0000000000470087	movq	%rbx, 0x210(%r14)
000000000047008e	movq	%rbx, 0x1e8(%r14)
0000000000470095	movq	%rbx, 0x1c0(%r14)
000000000047009c	movupd	%xmm0, 0x1c8(%r14)
00000000004700a5	movupd	%xmm0, 0x1d8(%r14)
00000000004700ae	movupd	%xmm0, 0x1f0(%r14)
00000000004700b7	movupd	%xmm0, 0x200(%r14)
00000000004700c0	movupd	%xmm0, 0x218(%r14)
00000000004700c9	movupd	%xmm0, 0x228(%r14)
00000000004700d2	movq	%rbx, 0x2b8(%r14)
00000000004700d9	movq	%rbx, 0x290(%r14)
00000000004700e0	movq	%rbx, 0x268(%r14)
00000000004700e7	movapd	0x296cf1(%rip), %xmm1
00000000004700ef	movupd	%xmm1, 0x238(%r14)
00000000004700f8	movupd	%xmm0, 0x258(%r14)
0000000000470101	movupd	%xmm0, 0x248(%r14)
000000000047010a	movupd	%xmm0, 0x280(%r14)
0000000000470113	movupd	%xmm0, 0x270(%r14)
000000000047011c	movupd	%xmm0, 0x2a8(%r14)
0000000000470125	movupd	%xmm0, 0x298(%r14)
000000000047012e	movq	%r14, %rdi
0000000000470131	xorl	%esi, %esi
0000000000470133	movl	$0x2, %edx
0000000000470138	callq	0x6de9ee                        ## symbol stub for: __ZN6HGNode8SetFlagsEii
000000000047013d	movq	(%r14), %rax
0000000000470140	xorl	%ebx, %ebx
0000000000470142	leaq	-0x160(%rbp), %rsi
0000000000470149	movq	%r14, %rdi
000000000047014c	callq	*0x230(%rax)
0000000000470152	movq	(%r14), %rax
0000000000470155	xorl	%ebx, %ebx
0000000000470157	leaq	-0x140(%rbp), %rsi
000000000047015e	movq	%r14, %rdi
0000000000470161	callq	*0x238(%rax)
0000000000470167	movq	-0x320(%rbp), %rsi
000000000047016e	movq	(%r14), %rax
0000000000470171	xorl	%ebx, %ebx
0000000000470173	movq	%r14, %rdi
0000000000470176	callq	*0x240(%rax)
000000000047017c	movq	(%r14), %rax
000000000047017f	movq	%r14, %rbx
0000000000470182	movq	%r14, %rdi
0000000000470185	callq	*0x10(%rax)
0000000000470188	movq	(%r14), %rax
000000000047018b	movq	%r14, %rdi
000000000047018e	callq	*0x18(%rax)
0000000000470191	jmp	0x470196
0000000000470193	xorl	%r14d, %r14d
0000000000470196	movq	(%r12), %rdx
000000000047019a	movq	(%r14), %rax
000000000047019d	movq	%r14, %rdi
00000000004701a0	xorl	%esi, %esi
00000000004701a2	callq	*0x78(%rax)
00000000004701a5	movq	(%r12), %rdi
00000000004701a9	cmpq	%r14, %rdi
00000000004701ac	je	0x4701c6
00000000004701ae	testq	%rdi, %rdi
00000000004701b1	je	0x4701b9
00000000004701b3	movq	(%rdi), %rax
00000000004701b6	callq	*0x18(%rax)
00000000004701b9	movq	%r14, (%r12)
00000000004701bd	movq	(%r14), %rax
00000000004701c0	movq	%r14, %rdi
00000000004701c3	callq	*0x10(%rax)
00000000004701c6	movq	(%r14), %rax
00000000004701c9	movq	%r14, %rdi
00000000004701cc	callq	*0x18(%rax)
00000000004701cf	leaq	-0x3c0(%rbp), %rdi
00000000004701d6	callq	__ZN7LiAgentD2Ev                ## LiAgent::~LiAgent()
00000000004701db	movq	0x3b6256(%rip), %rax            ## literal pool symbol address: ___stack_chk_guard
00000000004701e2	movq	(%rax), %rax
00000000004701e5	cmpq	-0x30(%rbp), %rax
00000000004701e9	jne	0x470200
00000000004701eb	movq	%r12, %rax
00000000004701ee	addq	$0x398, %rsp                    ## imm = 0x398
00000000004701f5	popq	%rbx
00000000004701f6	popq	%r12
00000000004701f8	popq	%r13
00000000004701fa	popq	%r14
00000000004701fc	popq	%r15
00000000004701fe	popq	%rbp
00000000004701ff	retq
0000000000470200	callq	0x6dfd38                        ## symbol stub for: ___stack_chk_fail
0000000000470205	jmp	0x470284
0000000000470207	jmp	0x470284
0000000000470209	movq	%rax, %r15
000000000047020c	movq	%r14, %rdi
000000000047020f	callq	__ZN13HgcWrapMirrorD2Ev         ## HgcWrapMirror::~HgcWrapMirror()
0000000000470214	jmp	0x470228
0000000000470216	movq	%rax, %r15
0000000000470219	movq	%r14, %rdi
000000000047021c	callq	__ZN13HgcWrapRepeatD2Ev         ## HgcWrapRepeat::~HgcWrapRepeat()
0000000000470221	jmp	0x470228
0000000000470223	jmp	0x470225
0000000000470225	movq	%rax, %r15
0000000000470228	movq	%r14, %rdi
000000000047022b	callq	0x6def6a                        ## symbol stub for: __ZN8HGObjectdlEPv
0000000000470230	jmp	0x470271
0000000000470232	jmp	0x470238
0000000000470234	jmp	0x470238
0000000000470236	jmp	0x470284
0000000000470238	movq	%rax, %r15
000000000047023b	jmp	0x470271
000000000047023d	movq	%rax, %r15
0000000000470240	movq	(%r14), %rax
0000000000470243	movq	%r14, %rdi
0000000000470246	callq	*0x18(%rax)
0000000000470249	jmp	0x470259
000000000047024b	jmp	0x470284
000000000047024d	movq	%rax, %r15
0000000000470250	movq	(%r14), %rax
0000000000470253	movq	%r14, %rdi
0000000000470256	callq	*0x18(%rax)
0000000000470259	movq	%rbx, %r14
000000000047025c	testq	%rbx, %rbx
000000000047025f	jne	0x470268
0000000000470261	jmp	0x470271
0000000000470263	jmp	0x470284
0000000000470265	movq	%rax, %r15
0000000000470268	movq	(%r14), %rax
000000000047026b	movq	%r14, %rdi
000000000047026e	callq	*0x18(%rax)
0000000000470271	movq	(%r12), %rdi
0000000000470275	testq	%rdi, %rdi
0000000000470278	je	0x4702a1
000000000047027a	movq	(%rdi), %rax
000000000047027d	callq	*0x18(%rax)
0000000000470280	jmp	0x4702a1
0000000000470282	jmp	0x470284
0000000000470284	movq	%rax, %r15
0000000000470287	testl	%edx, %edx
0000000000470289	je	0x470296
000000000047028b	movq	%r15, %rdi
000000000047028e	callq	___clang_call_terminate
0000000000470293	movq	%rax, %r15
0000000000470296	movq	%r15, %rdi
0000000000470299	callq	0x6dd07a                        ## symbol stub for: __Unwind_Resume
000000000047029e	movq	%rax, %r15
00000000004702a1	leaq	-0x3c0(%rbp), %rdi
00000000004702a8	callq	__ZN7LiAgentD2Ev                ## LiAgent::~LiAgent()
00000000004702ad	movq	%r15, %rdi
00000000004702b0	callq	0x6dd07a                        ## symbol stub for: __Unwind_Resume
00000000004702b5	nopw	%cs:(%rax,%rax)
