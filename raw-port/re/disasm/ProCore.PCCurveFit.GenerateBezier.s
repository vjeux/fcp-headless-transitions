__ZN10PCCurveFit14GenerateBezierERNSt3__16vectorI9PCVector2IdENS0_9allocatorIS3_EEEEmmPdRS3_S9_:
000000000000bbf8	pushq	%rbp
000000000000bbf9	movq	%rsp, %rbp
000000000000bbfc	pushq	%r15
000000000000bbfe	pushq	%r14
000000000000bc00	pushq	%r13
000000000000bc02	pushq	%r12
000000000000bc04	pushq	%rbx
000000000000bc05	subq	$0x78, %rsp
000000000000bc09	movq	%r9, %r15
000000000000bc0c	movq	%rcx, %r12
000000000000bc0f	movq	%rdx, -0x30(%rbp)
000000000000bc13	movq	%rdi, %rbx
000000000000bc16	movq	%r8, -0x40(%rbp)
000000000000bc1a	movq	%r8, %rax
000000000000bc1d	subq	%rcx, %rax
000000000000bc20	leaq	0x1(%rax), %r14
000000000000bc24	xorpd	%xmm0, %xmm0
000000000000bc28	movupd	%xmm0, (%rdi)
000000000000bc2c	movq	$0x0, 0x10(%rdi)
000000000000bc34	movq	%r14, %rcx
000000000000bc37	shrq	$0x3d, %rcx
000000000000bc3b	leaq	0x8(,%rax,8), %rax
000000000000bc43	xorl	%edi, %edi
000000000000bc45	negq	%rcx
000000000000bc48	sbbq	%rdi, %rdi
000000000000bc4b	orq	%rax, %rdi
000000000000bc4e	movq	%rbx, -0x38(%rbp)
000000000000bc52	callq	0xde6c6                         ## symbol stub for: __Znam
000000000000bc57	movq	%rax, %r13
000000000000bc5a	xorpd	%xmm0, %xmm0
000000000000bc5e	xorpd	%xmm1, %xmm1
000000000000bc62	testq	%r14, %r14
000000000000bc65	xorpd	%xmm14, %xmm14
000000000000bc6a	je	0xbeb9
000000000000bc70	movq	0x10(%rbp), %rax
000000000000bc74	movupd	(%rax), %xmm0
000000000000bc78	movq	0x18(%rbp), %rax
000000000000bc7c	movupd	(%rax), %xmm1
000000000000bc80	movapd	%xmm0, -0x50(%rbp)
000000000000bc85	mulpd	%xmm0, %xmm0
000000000000bc89	movapd	%xmm1, -0x70(%rbp)
000000000000bc8e	mulpd	%xmm1, %xmm1
000000000000bc92	haddpd	%xmm0, %xmm1
000000000000bc96	haddpd	%xmm0, %xmm0
000000000000bc9a	sqrtsd	%xmm0, %xmm0
000000000000bc9e	movsd	%xmm0, -0x60(%rbp)
000000000000bca3	xorpd	%xmm0, %xmm0
000000000000bca7	cmpneqpd	%xmm1, %xmm0
000000000000bcac	sqrtsd	%xmm1, %xmm1
000000000000bcb0	movsd	%xmm1, -0x78(%rbp)
000000000000bcb5	movddup	%xmm0, %xmm1                    ## xmm1 = xmm0[0,0]
000000000000bcb9	movapd	%xmm1, -0x90(%rbp)
000000000000bcc1	unpckhpd	%xmm0, %xmm0                    ## xmm0 = xmm0[1,1]
000000000000bcc5	movapd	%xmm0, -0xa0(%rbp)
000000000000bccd	xorl	%ebx, %ebx
000000000000bccf	movl	$0x20, %edi
000000000000bcd4	callq	0xde6c6                         ## symbol stub for: __Znam
000000000000bcd9	movq	%rax, (%r13,%rbx,8)
000000000000bcde	movsd	(%r15,%rbx,8), %xmm0
000000000000bce4	movsd	0x116844(%rip), %xmm1
000000000000bcec	subsd	%xmm0, %xmm1
000000000000bcf0	movapd	%xmm0, %xmm2
000000000000bcf4	mulsd	0x11692c(%rip), %xmm2
000000000000bcfc	movapd	%xmm1, %xmm3
000000000000bd00	mulsd	%xmm1, %xmm3
000000000000bd04	mulsd	%xmm2, %xmm3
000000000000bd08	divsd	-0x60(%rbp), %xmm3
000000000000bd0d	mulsd	%xmm0, %xmm2
000000000000bd11	mulsd	%xmm1, %xmm2
000000000000bd15	divsd	-0x78(%rbp), %xmm2
000000000000bd1a	movddup	%xmm3, %xmm1                    ## xmm1 = xmm3[0,0]
000000000000bd1e	movapd	-0x50(%rbp), %xmm3
000000000000bd23	mulpd	%xmm3, %xmm1
000000000000bd27	movaps	-0xa0(%rbp), %xmm0
000000000000bd2e	blendvpd	%xmm0, %xmm1, %xmm3
000000000000bd33	movddup	%xmm2, %xmm1                    ## xmm1 = xmm2[0,0]
000000000000bd37	movapd	-0x70(%rbp), %xmm2
000000000000bd3c	mulpd	%xmm2, %xmm1
000000000000bd40	movapd	-0x90(%rbp), %xmm0
000000000000bd48	blendvpd	%xmm0, %xmm1, %xmm2
000000000000bd4d	movupd	%xmm3, (%rax)
000000000000bd51	movupd	%xmm2, 0x10(%rax)
000000000000bd56	incq	%rbx
000000000000bd59	cmpq	%rbx, %r14
000000000000bd5c	jne	0xbccf
000000000000bd62	movq	-0x30(%rbp), %rax
000000000000bd66	movq	(%rax), %rcx
000000000000bd69	movq	%r12, %rdx
000000000000bd6c	shlq	$0x4, %rdx
000000000000bd70	leaq	(%rcx,%rdx), %rax
000000000000bd74	movq	-0x40(%rbp), %rsi
000000000000bd78	shlq	$0x4, %rsi
000000000000bd7c	movupd	(%rcx,%rdx), %xmm2
000000000000bd81	movupd	(%rcx,%rsi), %xmm3
000000000000bd86	shufpd	$0x1, %xmm3, %xmm3              ## xmm3 = xmm3[1,0]
000000000000bd8b	movapd	%xmm2, %xmm4
000000000000bd8f	shufpd	$0x1, %xmm2, %xmm4              ## xmm4 = xmm4[1],xmm2[0]
000000000000bd94	xorpd	%xmm14, %xmm14
000000000000bd99	xorpd	%xmm0, %xmm0
000000000000bd9d	xorl	%ecx, %ecx
000000000000bd9f	xorpd	%xmm1, %xmm1
000000000000bda3	movsd	0x11687c(%rip), %xmm15
000000000000bdac	movsd	(%r15,%rcx,8), %xmm11
000000000000bdb2	movq	(%r13,%rcx,8), %rdx
000000000000bdb7	movsd	0x116771(%rip), %xmm7
000000000000bdbf	subsd	%xmm11, %xmm7
000000000000bdc4	movapd	%xmm7, %xmm8
000000000000bdc9	mulsd	%xmm7, %xmm8
000000000000bdce	movapd	%xmm7, %xmm5
000000000000bdd2	movapd	%xmm11, %xmm6
000000000000bdd7	mulsd	%xmm15, %xmm6
000000000000bddc	mulsd	%xmm8, %xmm5
000000000000bde1	mulsd	%xmm6, %xmm8
000000000000bde6	mulsd	%xmm11, %xmm6
000000000000bdeb	movapd	%xmm11, %xmm10
000000000000bdf0	mulsd	%xmm7, %xmm6
000000000000bdf4	mulsd	%xmm11, %xmm10
000000000000bdf9	movupd	0x8(%rdx), %xmm7
000000000000bdfe	movsd	(%rdx), %xmm9
000000000000be03	mulsd	%xmm11, %xmm10
000000000000be08	movapd	%xmm7, %xmm12
000000000000be0d	movsd	0x18(%rdx), %xmm13
000000000000be13	movapd	%xmm13, %xmm11
000000000000be18	shufpd	$0x1, %xmm9, %xmm12             ## xmm12 = xmm12[1],xmm9[0]
000000000000be1e	unpcklpd	%xmm9, %xmm11                   ## xmm11 = xmm11[0],xmm9[0]
000000000000be23	unpcklpd	%xmm13, %xmm9                   ## xmm9 = xmm9[0],xmm13[0]
000000000000be28	mulpd	%xmm12, %xmm12
000000000000be2d	unpcklpd	%xmm7, %xmm13                   ## xmm13 = xmm13[0],xmm7[0]
000000000000be32	mulpd	%xmm13, %xmm13
000000000000be37	mulpd	%xmm7, %xmm11
000000000000be3c	addpd	%xmm12, %xmm13
000000000000be41	haddpd	%xmm11, %xmm11
000000000000be46	unpcklpd	%xmm8, %xmm5                    ## xmm5 = xmm5[0],xmm8[0]
000000000000be4b	movapd	%xmm4, %xmm8
000000000000be50	mulpd	%xmm5, %xmm8
000000000000be55	mulpd	%xmm2, %xmm5
000000000000be59	addpd	%xmm13, %xmm14
000000000000be5e	shufpd	$0x1, %xmm5, %xmm5              ## xmm5 = xmm5[1,0]
000000000000be63	movddup	%xmm6, %xmm6                    ## xmm6 = xmm6[0,0]
000000000000be67	mulpd	%xmm3, %xmm6
000000000000be6b	addpd	%xmm8, %xmm5
000000000000be70	addpd	%xmm5, %xmm6
000000000000be74	movddup	%xmm10, %xmm5                   ## xmm5 = xmm10[0,0]
000000000000be79	mulpd	%xmm3, %xmm5
000000000000be7d	addpd	%xmm6, %xmm5
000000000000be81	movupd	(%rax), %xmm6
000000000000be85	shufpd	$0x1, %xmm6, %xmm6              ## xmm6 = xmm6[1,0]
000000000000be8a	subpd	%xmm5, %xmm6
000000000000be8e	mulpd	%xmm6, %xmm7
000000000000be92	shufpd	$0x1, %xmm6, %xmm6              ## xmm6 = xmm6[1,0]
000000000000be97	mulpd	%xmm9, %xmm6
000000000000be9c	addpd	%xmm7, %xmm6
000000000000bea0	addsd	%xmm11, %xmm0
000000000000bea5	addpd	%xmm6, %xmm1
000000000000bea9	incq	%rcx
000000000000beac	addq	$0x10, %rax
000000000000beb0	cmpq	%rcx, %r14
000000000000beb3	jne	0xbdac
000000000000beb9	movapd	%xmm14, %xmm2
000000000000bebe	unpckhpd	%xmm14, %xmm2                   ## xmm2 = xmm2[1],xmm14[1]
000000000000bec3	mulsd	%xmm14, %xmm2
000000000000bec8	movddup	%xmm0, %xmm3                    ## xmm3 = xmm0[0,0]
000000000000becc	mulsd	%xmm0, %xmm0
000000000000bed0	movapd	%xmm2, %xmm4
000000000000bed4	subsd	%xmm0, %xmm4
000000000000bed8	mulpd	%xmm1, %xmm14
000000000000bedd	shufpd	$0x1, %xmm1, %xmm1              ## xmm1 = xmm1[1,0]
000000000000bee2	mulpd	%xmm3, %xmm1
000000000000bee6	mulsd	0x11697a(%rip), %xmm2
000000000000beee	xorpd	%xmm0, %xmm0
000000000000bef2	cmpeqsd	%xmm4, %xmm0
000000000000bef7	blendvpd	%xmm0, %xmm2, %xmm4
000000000000befc	subpd	%xmm1, %xmm14
000000000000bf01	movddup	%xmm4, %xmm0                    ## xmm0 = xmm4[0,0]
000000000000bf05	divpd	%xmm0, %xmm14
000000000000bf0a	movapd	%xmm14, -0x50(%rbp)
000000000000bf10	testq	%r14, %r14
000000000000bf13	je	0xbf37
000000000000bf15	xorl	%ebx, %ebx
000000000000bf17	movq	(%r13,%rbx,8), %rdi
000000000000bf1c	testq	%rdi, %rdi
000000000000bf1f	je	0xbf26
000000000000bf21	callq	0xde6ba                         ## symbol stub for: __ZdaPv
000000000000bf26	movq	$0x0, (%r13,%rbx,8)
000000000000bf2f	incq	%rbx
000000000000bf32	cmpq	%rbx, %r14
000000000000bf35	jne	0xbf17
000000000000bf37	movq	%r13, %rdi
000000000000bf3a	callq	0xde6ba                         ## symbol stub for: __ZdaPv
000000000000bf3f	xorpd	%xmm0, %xmm0
000000000000bf43	movapd	-0x50(%rbp), %xmm1
000000000000bf48	cmpunordpd	%xmm1, %xmm0
000000000000bf4d	cmpltpd	0x1168ea(%rip), %xmm1
000000000000bf56	shufps	$0x88, %xmm1, %xmm0             ## xmm0 = xmm0[0,2],xmm1[0,2]
000000000000bf5a	movmskps	%xmm0, %eax
000000000000bf5d	movq	-0x30(%rbp), %rcx
000000000000bf61	movq	(%rcx), %rsi
000000000000bf64	testl	%eax, %eax
000000000000bf66	je	0xbfbc
000000000000bf68	movq	-0x40(%rbp), %r15
000000000000bf6c	shlq	$0x4, %r15
000000000000bf70	shlq	$0x4, %r12
000000000000bf74	movsd	(%rsi,%r15), %xmm0
000000000000bf7a	movsd	%xmm0, -0x50(%rbp)
000000000000bf7f	movsd	0x8(%rsi,%r15), %xmm0
000000000000bf86	subsd	0x8(%rsi,%r12), %xmm0
000000000000bf8d	movsd	%xmm0, -0x70(%rbp)
000000000000bf92	movupd	(%rsi,%r12), %xmm0
000000000000bf98	movq	-0x38(%rbp), %rbx
000000000000bf9c	movq	0x8(%rbx), %rax
000000000000bfa0	movq	0x10(%rbx), %rdx
000000000000bfa4	cmpq	%rdx, %rax
000000000000bfa7	movq	0x18(%rbp), %r14
000000000000bfab	movapd	%xmm0, -0x60(%rbp)
000000000000bfb0	jae	0xbfec
000000000000bfb2	movupd	%xmm0, (%rax)
000000000000bfb6	addq	$0x10, %rax
000000000000bfba	jmp	0xc002
000000000000bfbc	shlq	$0x4, %r12
000000000000bfc0	leaq	(%rsi,%r12), %rcx
000000000000bfc4	movq	-0x38(%rbp), %rbx
000000000000bfc8	movq	0x8(%rbx), %rax
000000000000bfcc	movq	0x10(%rbx), %rdx
000000000000bfd0	cmpq	%rdx, %rax
000000000000bfd3	movq	0x18(%rbp), %r14
000000000000bfd7	jae	0xc145
000000000000bfdd	movups	(%rcx), %xmm0
000000000000bfe0	movups	%xmm0, (%rax)
000000000000bfe3	addq	$0x10, %rax
000000000000bfe7	jmp	0xc15b
000000000000bfec	addq	%r12, %rsi
000000000000bfef	movq	%rbx, %rdi
000000000000bff2	callq	__ZNSt3__16vectorI9PCVector2IdENS_9allocatorIS2_EEE24__emplace_back_slow_pathIJRKS2_EEEPS2_DpOT_ ## PCVector2<double>* std::__1::vector<PCVector2<double>, std::__1::allocator<PCVector2<double>>>::__emplace_back_slow_path<PCVector2<double> const&>(PCVector2<double> const&)
000000000000bff7	movq	-0x30(%rbp), %rcx
000000000000bffb	movq	(%rcx), %rsi
000000000000bffe	movq	0x10(%rbx), %rdx
000000000000c002	movq	%rax, 0x8(%rbx)
000000000000c006	leaq	(%rsi,%r12), %rcx
000000000000c00a	cmpq	%rdx, %rax
000000000000c00d	jae	0xc01d
000000000000c00f	movupd	(%rcx), %xmm0
000000000000c013	movupd	%xmm0, (%rax)
000000000000c017	addq	$0x10, %rax
000000000000c01b	jmp	0xc033
000000000000c01d	movq	%rbx, %rdi
000000000000c020	movq	%rcx, %rsi
000000000000c023	callq	__ZNSt3__16vectorI9PCVector2IdENS_9allocatorIS2_EEE24__emplace_back_slow_pathIJRKS2_EEEPS2_DpOT_ ## PCVector2<double>* std::__1::vector<PCVector2<double>, std::__1::allocator<PCVector2<double>>>::__emplace_back_slow_path<PCVector2<double> const&>(PCVector2<double> const&)
000000000000c028	movq	-0x30(%rbp), %rcx
000000000000c02c	movq	(%rcx), %rsi
000000000000c02f	movq	0x10(%rbx), %rdx
000000000000c033	movq	%rax, 0x8(%rbx)
000000000000c037	addq	%rsi, %r12
000000000000c03a	cmpq	%rdx, %rax
000000000000c03d	jae	0xc04f
000000000000c03f	movupd	(%r12), %xmm0
000000000000c045	movupd	%xmm0, (%rax)
000000000000c049	addq	$0x10, %rax
000000000000c04d	jmp	0xc065
000000000000c04f	movq	%rbx, %rdi
000000000000c052	movq	%r12, %rsi
000000000000c055	callq	__ZNSt3__16vectorI9PCVector2IdENS_9allocatorIS2_EEE24__emplace_back_slow_pathIJRKS2_EEEPS2_DpOT_ ## PCVector2<double>* std::__1::vector<PCVector2<double>, std::__1::allocator<PCVector2<double>>>::__emplace_back_slow_path<PCVector2<double> const&>(PCVector2<double> const&)
000000000000c05a	movq	-0x30(%rbp), %rcx
000000000000c05e	movq	(%rcx), %rsi
000000000000c061	movq	0x10(%rbx), %rdx
000000000000c065	movq	%rax, 0x8(%rbx)
000000000000c069	addq	%r15, %rsi
000000000000c06c	cmpq	%rdx, %rax
000000000000c06f	jae	0xc07f
000000000000c071	movupd	(%rsi), %xmm0
000000000000c075	movupd	%xmm0, (%rax)
000000000000c079	addq	$0x10, %rax
000000000000c07d	jmp	0xc087
000000000000c07f	movq	%rbx, %rdi
000000000000c082	callq	__ZNSt3__16vectorI9PCVector2IdENS_9allocatorIS2_EEE24__emplace_back_slow_pathIJRKS2_EEEPS2_DpOT_ ## PCVector2<double>* std::__1::vector<PCVector2<double>, std::__1::allocator<PCVector2<double>>>::__emplace_back_slow_path<PCVector2<double> const&>(PCVector2<double> const&)
000000000000c087	movsd	-0x50(%rbp), %xmm0
000000000000c08c	subsd	-0x60(%rbp), %xmm0
000000000000c091	mulsd	%xmm0, %xmm0
000000000000c095	movsd	-0x70(%rbp), %xmm1
000000000000c09a	mulsd	%xmm1, %xmm1
000000000000c09e	addsd	%xmm0, %xmm1
000000000000c0a2	xorps	%xmm0, %xmm0
000000000000c0a5	sqrtsd	%xmm1, %xmm0
000000000000c0a9	divsd	0x116577(%rip), %xmm0
000000000000c0b1	movq	%rax, 0x8(%rbx)
000000000000c0b5	movq	0x10(%rbp), %rax
000000000000c0b9	movupd	(%rax), %xmm1
000000000000c0bd	movapd	%xmm1, %xmm3
000000000000c0c1	mulpd	%xmm1, %xmm3
000000000000c0c5	haddpd	%xmm3, %xmm3
000000000000c0c9	xorpd	%xmm2, %xmm2
000000000000c0cd	ucomisd	%xmm2, %xmm3
000000000000c0d1	jne	0xc0d5
000000000000c0d3	jnp	0xc0ed
000000000000c0d5	sqrtsd	%xmm3, %xmm3
000000000000c0d9	movapd	%xmm0, %xmm4
000000000000c0dd	divsd	%xmm3, %xmm4
000000000000c0e1	movddup	%xmm4, %xmm3                    ## xmm3 = xmm4[0,0]
000000000000c0e5	mulpd	%xmm3, %xmm1
000000000000c0e9	movupd	%xmm1, (%rax)
000000000000c0ed	movupd	(%r14), %xmm3
000000000000c0f2	movapd	%xmm3, %xmm4
000000000000c0f6	mulpd	%xmm3, %xmm4
000000000000c0fa	haddpd	%xmm4, %xmm4
000000000000c0fe	ucomisd	%xmm2, %xmm4
000000000000c102	jne	0xc106
000000000000c104	jnp	0xc122
000000000000c106	xorps	%xmm1, %xmm1
000000000000c109	sqrtsd	%xmm4, %xmm1
000000000000c10d	divsd	%xmm1, %xmm0
000000000000c111	movddup	%xmm0, %xmm0                    ## xmm0 = xmm0[0,0]
000000000000c115	mulpd	%xmm0, %xmm3
000000000000c119	movupd	%xmm3, (%r14)
000000000000c11e	movupd	(%rax), %xmm1
000000000000c122	movq	(%rbx), %rax
000000000000c125	movupd	(%rax), %xmm0
000000000000c129	addpd	%xmm1, %xmm0
000000000000c12d	movupd	0x30(%rax), %xmm1
000000000000c132	movupd	%xmm0, 0x10(%rax)
000000000000c137	movupd	(%r14), %xmm0
000000000000c13c	addpd	%xmm1, %xmm0
000000000000c140	jmp	0xc27e
000000000000c145	movq	%rbx, %rdi
000000000000c148	movq	%rcx, %rsi
000000000000c14b	callq	__ZNSt3__16vectorI9PCVector2IdENS_9allocatorIS2_EEE24__emplace_back_slow_pathIJRKS2_EEEPS2_DpOT_ ## PCVector2<double>* std::__1::vector<PCVector2<double>, std::__1::allocator<PCVector2<double>>>::__emplace_back_slow_path<PCVector2<double> const&>(PCVector2<double> const&)
000000000000c150	movq	-0x30(%rbp), %rcx
000000000000c154	movq	(%rcx), %rsi
000000000000c157	movq	0x10(%rbx), %rdx
000000000000c15b	movq	%rax, 0x8(%rbx)
000000000000c15f	leaq	(%rsi,%r12), %rcx
000000000000c163	cmpq	%rdx, %rax
000000000000c166	jae	0xc174
000000000000c168	movups	(%rcx), %xmm0
000000000000c16b	movups	%xmm0, (%rax)
000000000000c16e	addq	$0x10, %rax
000000000000c172	jmp	0xc18a
000000000000c174	movq	%rbx, %rdi
000000000000c177	movq	%rcx, %rsi
000000000000c17a	callq	__ZNSt3__16vectorI9PCVector2IdENS_9allocatorIS2_EEE24__emplace_back_slow_pathIJRKS2_EEEPS2_DpOT_ ## PCVector2<double>* std::__1::vector<PCVector2<double>, std::__1::allocator<PCVector2<double>>>::__emplace_back_slow_path<PCVector2<double> const&>(PCVector2<double> const&)
000000000000c17f	movq	-0x30(%rbp), %rcx
000000000000c183	movq	(%rcx), %rsi
000000000000c186	movq	0x10(%rbx), %rdx
000000000000c18a	movq	%rax, 0x8(%rbx)
000000000000c18e	addq	%rsi, %r12
000000000000c191	cmpq	%rdx, %rax
000000000000c194	jae	0xc1a4
000000000000c196	movups	(%r12), %xmm0
000000000000c19b	movups	%xmm0, (%rax)
000000000000c19e	addq	$0x10, %rax
000000000000c1a2	jmp	0xc1ba
000000000000c1a4	movq	%rbx, %rdi
000000000000c1a7	movq	%r12, %rsi
000000000000c1aa	callq	__ZNSt3__16vectorI9PCVector2IdENS_9allocatorIS2_EEE24__emplace_back_slow_pathIJRKS2_EEEPS2_DpOT_ ## PCVector2<double>* std::__1::vector<PCVector2<double>, std::__1::allocator<PCVector2<double>>>::__emplace_back_slow_path<PCVector2<double> const&>(PCVector2<double> const&)
000000000000c1af	movq	-0x30(%rbp), %rcx
000000000000c1b3	movq	(%rcx), %rsi
000000000000c1b6	movq	0x10(%rbx), %rdx
000000000000c1ba	movq	-0x40(%rbp), %rcx
000000000000c1be	movq	%rax, 0x8(%rbx)
000000000000c1c2	shlq	$0x4, %rcx
000000000000c1c6	addq	%rsi, %rcx
000000000000c1c9	cmpq	%rdx, %rax
000000000000c1cc	jae	0xc1da
000000000000c1ce	movups	(%rcx), %xmm0
000000000000c1d1	movups	%xmm0, (%rax)
000000000000c1d4	addq	$0x10, %rax
000000000000c1d8	jmp	0xc1e5
000000000000c1da	movq	%rbx, %rdi
000000000000c1dd	movq	%rcx, %rsi
000000000000c1e0	callq	__ZNSt3__16vectorI9PCVector2IdENS_9allocatorIS2_EEE24__emplace_back_slow_pathIJRKS2_EEEPS2_DpOT_ ## PCVector2<double>* std::__1::vector<PCVector2<double>, std::__1::allocator<PCVector2<double>>>::__emplace_back_slow_path<PCVector2<double> const&>(PCVector2<double> const&)
000000000000c1e5	movq	%rax, 0x8(%rbx)
000000000000c1e9	movq	0x10(%rbp), %rax
000000000000c1ed	movupd	(%rax), %xmm0
000000000000c1f1	movapd	%xmm0, %xmm2
000000000000c1f5	mulpd	%xmm0, %xmm2
000000000000c1f9	haddpd	%xmm2, %xmm2
000000000000c1fd	xorpd	%xmm1, %xmm1
000000000000c201	ucomisd	%xmm1, %xmm2
000000000000c205	jne	0xc209
000000000000c207	jnp	0xc222
000000000000c209	sqrtsd	%xmm2, %xmm2
000000000000c20d	movapd	-0x50(%rbp), %xmm3
000000000000c212	divsd	%xmm2, %xmm3
000000000000c216	movddup	%xmm3, %xmm2                    ## xmm2 = xmm3[0,0]
000000000000c21a	mulpd	%xmm2, %xmm0
000000000000c21e	movupd	%xmm0, (%rax)
000000000000c222	movupd	(%r14), %xmm2
000000000000c227	movapd	%xmm2, %xmm3
000000000000c22b	mulpd	%xmm2, %xmm3
000000000000c22f	haddpd	%xmm3, %xmm3
000000000000c233	ucomisd	%xmm1, %xmm3
000000000000c237	jne	0xc23b
000000000000c239	jnp	0xc260
000000000000c23b	xorps	%xmm0, %xmm0
000000000000c23e	sqrtsd	%xmm3, %xmm0
000000000000c242	movapd	-0x50(%rbp), %xmm1
000000000000c247	unpckhpd	%xmm1, %xmm1                    ## xmm1 = xmm1[1,1]
000000000000c24b	divsd	%xmm0, %xmm1
000000000000c24f	movddup	%xmm1, %xmm0                    ## xmm0 = xmm1[0,0]
000000000000c253	mulpd	%xmm0, %xmm2
000000000000c257	movupd	%xmm2, (%r14)
000000000000c25c	movupd	(%rax), %xmm0
000000000000c260	movq	(%rbx), %rax
000000000000c263	movupd	(%rax), %xmm1
000000000000c267	addpd	%xmm0, %xmm1
000000000000c26b	movupd	0x30(%rax), %xmm2
000000000000c270	movupd	%xmm1, 0x10(%rax)
000000000000c275	movupd	(%r14), %xmm0
000000000000c27a	addpd	%xmm2, %xmm0
000000000000c27e	movupd	%xmm0, 0x20(%rax)
000000000000c283	movq	%rbx, %rax
000000000000c286	addq	$0x78, %rsp
000000000000c28a	popq	%rbx
000000000000c28b	popq	%r12
000000000000c28d	popq	%r13
000000000000c28f	popq	%r14
000000000000c291	popq	%r15
000000000000c293	popq	%rbp
000000000000c294	retq
000000000000c295	jmp	0xc299
000000000000c297	jmp	0xc299
000000000000c299	movq	%rax, %r14
000000000000c29c	movq	-0x38(%rbp), %rax
000000000000c2a0	movq	(%rax), %rdi
000000000000c2a3	testq	%rdi, %rdi
000000000000c2a6	je	0xc2b5
000000000000c2a8	movq	-0x38(%rbp), %rax
000000000000c2ac	movq	%rdi, 0x8(%rax)
000000000000c2b0	callq	0xde6c0                         ## symbol stub for: __ZdlPv
000000000000c2b5	movq	%r14, %rdi
000000000000c2b8	callq	0xde50a                         ## symbol stub for: __Unwind_Resume
000000000000c2bd	nop
