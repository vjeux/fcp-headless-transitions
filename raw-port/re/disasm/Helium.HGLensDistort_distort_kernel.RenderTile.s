__ZN28HGLensDistort_distort_kernel10RenderTileEP6HGTile:
000000000022ab90	pushq	%rbp
000000000022ab91	movq	%rsp, %rbp
000000000022ab94	pushq	%r15
000000000022ab96	pushq	%r14
000000000022ab98	pushq	%r13
000000000022ab9a	pushq	%r12
000000000022ab9c	pushq	%rbx
000000000022ab9d	subq	$0x88, %rsp
000000000022aba4	movq	%rdi, %rbx
000000000022aba7	movslq	0xc(%rsi), %rdi
000000000022abab	movslq	0x4(%rsi), %r8
000000000022abaf	movl	0x8(%rsi), %eax
000000000022abb2	cmpl	%r8d, %edi
000000000022abb5	sete	%cl
000000000022abb8	movq	%rsi, -0x88(%rbp)
000000000022abbf	subl	(%rsi), %eax
000000000022abc1	sete	%dl
000000000022abc4	orb	%cl, %dl
000000000022abc6	jne	0x22acd6
000000000022abcc	movq	-0x88(%rbp), %rcx
000000000022abd3	movslq	0x18(%rcx), %r13
000000000022abd7	movslq	%eax, %r15
000000000022abda	movq	0x10(%rcx), %r12
000000000022abde	movl	%edi, %eax
000000000022abe0	subl	%r8d, %eax
000000000022abe3	movq	%rax, -0x40(%rbp)
000000000022abe7	movslq	%eax, %r14
000000000022abea	shlq	$0x4, %r15
000000000022abee	testb	$0x7, %r14b
000000000022abf2	je	0x22ac47
000000000022abf4	movq	%r8, -0x50(%rbp)
000000000022abf8	movq	%rdi, -0x60(%rbp)
000000000022abfc	movq	%rbx, -0x70(%rbp)
000000000022ac00	movq	-0x40(%rbp), %rax
000000000022ac04	andl	$0x7, %eax
000000000022ac07	movq	%rax, -0x40(%rbp)
000000000022ac0b	movq	%r13, %rax
000000000022ac0e	shlq	$0x4, %rax
000000000022ac12	movq	%rax, -0x80(%rbp)
000000000022ac16	xorl	%ebx, %ebx
000000000022ac18	nopl	(%rax,%rax)
000000000022ac20	movq	%r12, %rdi
000000000022ac23	movq	%r15, %rsi
000000000022ac26	callq	0x3c4fca                        ## symbol stub for: ___bzero
000000000022ac2b	incq	%rbx
000000000022ac2e	addq	-0x80(%rbp), %r12
000000000022ac32	cmpq	%rbx, -0x40(%rbp)
000000000022ac36	jne	0x22ac20
000000000022ac38	subq	%rbx, %r14
000000000022ac3b	movq	-0x70(%rbp), %rbx
000000000022ac3f	movq	-0x60(%rbp), %rdi
000000000022ac43	movq	-0x50(%rbp), %r8
000000000022ac47	subq	%rdi, %r8
000000000022ac4a	cmpq	$-0x8, %r8
000000000022ac4e	ja	0x22acd6
000000000022ac54	shlq	$0x4, %r13
000000000022ac58	nopl	(%rax,%rax)
000000000022ac60	movq	%r12, %rdi
000000000022ac63	movq	%r15, %rsi
000000000022ac66	callq	0x3c4fca                        ## symbol stub for: ___bzero
000000000022ac6b	addq	%r13, %r12
000000000022ac6e	movq	%r12, %rdi
000000000022ac71	movq	%r15, %rsi
000000000022ac74	callq	0x3c4fca                        ## symbol stub for: ___bzero
000000000022ac79	addq	%r13, %r12
000000000022ac7c	movq	%r12, %rdi
000000000022ac7f	movq	%r15, %rsi
000000000022ac82	callq	0x3c4fca                        ## symbol stub for: ___bzero
000000000022ac87	addq	%r13, %r12
000000000022ac8a	movq	%r12, %rdi
000000000022ac8d	movq	%r15, %rsi
000000000022ac90	callq	0x3c4fca                        ## symbol stub for: ___bzero
000000000022ac95	addq	%r13, %r12
000000000022ac98	movq	%r12, %rdi
000000000022ac9b	movq	%r15, %rsi
000000000022ac9e	callq	0x3c4fca                        ## symbol stub for: ___bzero
000000000022aca3	addq	%r13, %r12
000000000022aca6	movq	%r12, %rdi
000000000022aca9	movq	%r15, %rsi
000000000022acac	callq	0x3c4fca                        ## symbol stub for: ___bzero
000000000022acb1	addq	%r13, %r12
000000000022acb4	movq	%r12, %rdi
000000000022acb7	movq	%r15, %rsi
000000000022acba	callq	0x3c4fca                        ## symbol stub for: ___bzero
000000000022acbf	addq	%r13, %r12
000000000022acc2	movq	%r12, %rdi
000000000022acc5	movq	%r15, %rsi
000000000022acc8	callq	0x3c4fca                        ## symbol stub for: ___bzero
000000000022accd	addq	%r13, %r12
000000000022acd0	addq	$-0x8, %r14
000000000022acd4	jne	0x22ac60
000000000022acd6	movq	0x1f0(%rbx), %r14
000000000022acdd	movq	-0x88(%rbp), %r15
000000000022ace4	movq	%r15, %rdi
000000000022ace7	callq	__ZNK6HGTile8RendererEv         ## HGTile::Renderer() const
000000000022acec	movq	%rax, %rdi
000000000022acef	xorl	%esi, %esi
000000000022acf1	callq	__ZN10HGRenderer9GetTargetEj    ## HGRenderer::GetTarget(unsigned int)
000000000022acf6	cmpl	$0x4700000, %eax                ## imm = 0x4700000
000000000022acfb	jb	0x22ad1c
000000000022acfd	movq	%r15, %rdi
000000000022ad00	movq	%r14, %rsi
000000000022ad03	callq	__ZL18GetDistortTile_AVXP6HGTilePN13HGLensDistort5StateEP6HGNode ## GetDistortTile_AVX(HGTile*, HGLensDistort::State*, HGNode*)
000000000022ad08	xorl	%eax, %eax
000000000022ad0a	addq	$0x88, %rsp
000000000022ad11	popq	%rbx
000000000022ad12	popq	%r12
000000000022ad14	popq	%r13
000000000022ad16	popq	%r14
000000000022ad18	popq	%r15
000000000022ad1a	popq	%rbp
000000000022ad1b	retq
000000000022ad1c	movaps	(%r15), %xmm0
000000000022ad20	cvtdq2ps	%xmm0, %xmm1
000000000022ad23	mulps	0x19f386(%rip), %xmm1
000000000022ad2a	addps	0x19f38f(%rip), %xmm1
000000000022ad31	movaps	%xmm1, -0xa0(%rbp)
000000000022ad38	pshufd	$0xee, %xmm0, %xmm1             ## xmm1 = xmm0[2,3,2,3]
000000000022ad3d	psubd	%xmm0, %xmm1
000000000022ad41	pextrd	$0x1, %xmm1, %ecx
000000000022ad47	movd	%xmm1, %edi
000000000022ad4b	movq	0x10(%r15), %rdx
000000000022ad4f	movslq	0x18(%r15), %rsi
000000000022ad53	cmpl	$0x44fffff, %eax                ## imm = 0x44FFFFF
000000000022ad58	jbe	0x22b083
000000000022ad5e	testl	%ecx, %ecx
000000000022ad60	jle	0x22ad08
000000000022ad62	testl	%edi, %edi
000000000022ad64	jle	0x22ad08
000000000022ad66	movl	%edi, %eax
000000000022ad68	shlq	$0x4, %rsi
000000000022ad6c	shlq	$0x4, %rax
000000000022ad70	xorl	%edi, %edi
000000000022ad72	movaps	-0xa0(%rbp), %xmm0
000000000022ad79	jmp	0x22ad98
000000000022ad7b	nopl	(%rax,%rax)
000000000022ad80	movaps	-0x50(%rbp), %xmm0
000000000022ad84	addps	0x19cf25(%rip), %xmm0
000000000022ad8b	incl	%edi
000000000022ad8d	addq	%rsi, %rdx
000000000022ad90	cmpl	%ecx, %edi
000000000022ad92	je	0x22ad08
000000000022ad98	xorl	%r8d, %r8d
000000000022ad9b	movaps	%xmm0, -0x50(%rbp)
000000000022ad9f	jmp	0x22adcb
000000000022ada1	nopw	%cs:(%rax,%rax)
000000000022adb0	movss	0x19cf08(%rip), %xmm0
000000000022adb8	movaps	-0x40(%rbp), %xmm1
000000000022adbc	addps	%xmm0, %xmm1
000000000022adbf	addq	$0x10, %r8
000000000022adc3	cmpq	%r8, %rax
000000000022adc6	movaps	%xmm1, %xmm0
000000000022adc9	je	0x22ad80
000000000022adcb	movaps	(%r14), %xmm9
000000000022adcf	movaps	%xmm9, -0x70(%rbp)
000000000022add4	movaps	0x20(%r14), %xmm1
000000000022add9	movaps	%xmm1, -0x80(%rbp)
000000000022addd	movaps	%xmm0, -0x40(%rbp)
000000000022ade1	subps	%xmm1, %xmm0
000000000022ade4	xorps	%xmm1, %xmm1
000000000022ade7	unpckhpd	%xmm1, %xmm9                    ## xmm9 = xmm9[1],xmm1[1]
000000000022adec	mulps	%xmm0, %xmm9
000000000022adf0	movaps	%xmm9, %xmm0
000000000022adf4	dpps	$0x3f, %xmm9, %xmm0
000000000022adfb	movaps	0x80(%r14), %xmm13
000000000022ae03	movaps	%xmm0, %xmm11
000000000022ae07	rsqrtss	%xmm0, %xmm11
000000000022ae0c	mulss	%xmm13, %xmm11
000000000022ae11	movaps	0xa0(%r14), %xmm14
000000000022ae19	minps	%xmm14, %xmm11
000000000022ae1d	mulss	%xmm11, %xmm0
000000000022ae22	mulss	%xmm11, %xmm0
000000000022ae27	movss	0xe4(%r14), %xmm1
000000000022ae30	mulss	%xmm11, %xmm1
000000000022ae35	movss	0xe0(%r14), %xmm2
000000000022ae3e	subss	%xmm0, %xmm2
000000000022ae42	mulss	%xmm1, %xmm2
000000000022ae46	blendps	$0x1, %xmm2, %xmm11             ## xmm11 = xmm2[0],xmm11[1,2,3]
000000000022ae4d	movaps	%xmm11, %xmm4
000000000022ae51	rcpss	%xmm11, %xmm4
000000000022ae56	mulss	%xmm13, %xmm4
000000000022ae5b	minss	%xmm14, %xmm4
000000000022ae60	maxss	0x1e4(%r14), %xmm4
000000000022ae69	movaps	0x40(%r14), %xmm7
000000000022ae6e	mulss	%xmm4, %xmm2
000000000022ae72	movss	0x204(%r14), %xmm15
000000000022ae7b	movaps	%xmm15, %xmm1
000000000022ae7f	subss	%xmm2, %xmm1
000000000022ae83	movaps	%xmm4, %xmm0
000000000022ae86	movaps	%xmm1, -0x60(%rbp)
000000000022ae8a	mulss	%xmm1, %xmm0
000000000022ae8e	mulss	%xmm7, %xmm0
000000000022ae92	shufps	$0xa0, %xmm4, %xmm0             ## xmm0 = xmm0[0,0],xmm4[2,2]
000000000022ae96	mulps	0x120(%r14), %xmm0
000000000022ae9e	movaps	0x100(%r14), %xmm1
000000000022aea6	movaps	%xmm1, %xmm2
000000000022aea9	addps	%xmm0, %xmm2
000000000022aeac	roundps	$0x9, %xmm2, %xmm5
000000000022aeb2	subps	%xmm5, %xmm2
000000000022aeb5	movaps	0xe0(%r14), %xmm3
000000000022aebd	subps	%xmm3, %xmm2
000000000022aec0	movaps	0x140(%r14), %xmm10
000000000022aec8	andps	%xmm10, %xmm2
000000000022aecc	addps	%xmm1, %xmm2
000000000022aecf	movaps	%xmm2, %xmm8
000000000022aed3	mulps	%xmm2, %xmm8
000000000022aed7	movaps	0xc0(%r14), %xmm1
000000000022aedf	movaps	%xmm1, %xmm5
000000000022aee2	mulps	%xmm8, %xmm5
000000000022aee6	movaps	0x160(%r14), %xmm6
000000000022aeee	addps	%xmm6, %xmm5
000000000022aef1	mulps	%xmm8, %xmm5
000000000022aef5	movaps	0x180(%r14), %xmm12
000000000022aefd	addps	%xmm12, %xmm5
000000000022af01	mulps	%xmm8, %xmm5
000000000022af05	roundps	$0x9, %xmm0, %xmm8
000000000022af0c	subps	%xmm8, %xmm0
000000000022af10	subps	%xmm3, %xmm0
000000000022af13	andps	%xmm10, %xmm0
000000000022af17	movaps	0x1a0(%r14), %xmm3
000000000022af1f	addps	%xmm3, %xmm5
000000000022af22	subps	0x1c0(%r14), %xmm0
000000000022af2a	mulps	%xmm2, %xmm5
000000000022af2d	movaps	%xmm0, %xmm2
000000000022af30	mulps	%xmm0, %xmm2
000000000022af33	mulps	%xmm2, %xmm1
000000000022af36	addps	%xmm6, %xmm1
000000000022af39	mulps	%xmm2, %xmm1
000000000022af3c	addps	%xmm12, %xmm1
000000000022af40	mulps	%xmm2, %xmm1
000000000022af43	movaps	%xmm7, %xmm2
000000000022af46	addps	%xmm3, %xmm1
000000000022af49	mulps	%xmm0, %xmm1
000000000022af4c	rcpps	%xmm1, %xmm0
000000000022af4f	mulps	%xmm13, %xmm0
000000000022af53	minps	%xmm14, %xmm0
000000000022af57	maxps	0x1e0(%r14), %xmm0
000000000022af5f	mulps	%xmm0, %xmm1
000000000022af62	movshdup	%xmm1, %xmm1                    ## xmm1 = xmm1[1,1,3,3]
000000000022af66	subss	%xmm1, %xmm15
000000000022af6b	movshdup	%xmm0, %xmm0                    ## xmm0 = xmm0[1,1,3,3]
000000000022af6f	mulss	%xmm0, %xmm15
000000000022af74	movddup	%xmm11, %xmm0                   ## xmm0 = xmm11[0,0]
000000000022af79	mulps	%xmm7, %xmm0
000000000022af7c	movshdup	%xmm5, %xmm11                   ## xmm11 = xmm5[1,1,3,3]
000000000022af81	mulss	%xmm15, %xmm11
000000000022af86	movaps	%xmm0, %xmm1
000000000022af89	unpckhpd	%xmm0, %xmm1                    ## xmm1 = xmm1[1],xmm0[1]
000000000022af8d	mulss	%xmm1, %xmm11
000000000022af92	shufps	$0xf0, %xmm0, %xmm11            ## xmm11 = xmm11[0,0],xmm0[3,3]
000000000022af97	mulps	%xmm9, %xmm11
000000000022af9b	mulps	-0x70(%rbp), %xmm11
000000000022afa0	addps	-0x80(%rbp), %xmm11
000000000022afa5	movddup	%xmm11, %xmm0                   ## xmm0 = xmm11[0,0]
000000000022afaa	subps	0x60(%r14), %xmm0
000000000022afaf	xorps	0x220(%r14), %xmm0
000000000022afb7	movaps	0x260(%r14), %xmm7
000000000022afbf	cmpltps	%xmm7, %xmm0
000000000022afc3	andps	0x240(%r14), %xmm0
000000000022afcb	xorps	%xmm7, %xmm0
000000000022afce	movmskps	%xmm0, %r9d
000000000022afd2	testl	%r9d, %r9d
000000000022afd5	jne	0x22adb0
000000000022afdb	mulss	-0x60(%rbp), %xmm4
000000000022afe0	shufps	$0x0, %xmm4, %xmm4              ## xmm4 = xmm4[0,0,0,0]
000000000022afe4	shufps	$0x55, %xmm2, %xmm2             ## xmm2 = xmm2[1,1,1,1]
000000000022afe8	subps	%xmm2, %xmm4
000000000022afeb	movslq	0x58(%r15), %r9
000000000022afef	subps	-0xa0(%rbp), %xmm11
000000000022aff7	roundps	$0x1, %xmm11, %xmm0
000000000022affe	cvtps2dq	%xmm0, %xmm1
000000000022b002	subps	%xmm0, %xmm11
000000000022b006	movq	0x50(%r15), %r10
000000000022b00a	extractps	$0x1, %xmm1, %r11d
000000000022b011	movd	%xmm1, %ebx
000000000022b015	imull	%r9d, %r11d
000000000022b019	addl	%ebx, %r11d
000000000022b01c	movslq	%r11d, %r11
000000000022b01f	shlq	$0x4, %r11
000000000022b023	leaq	(%r10,%r11), %rbx
000000000022b027	movaps	%xmm11, %xmm0
000000000022b02b	shufps	$0x0, %xmm11, %xmm0             ## xmm0 = xmm0[0,0],xmm11[0,0]
000000000022b030	movaps	(%r10,%r11), %xmm1
000000000022b035	movaps	0x10(%r10,%r11), %xmm2
000000000022b03b	subps	%xmm1, %xmm2
000000000022b03e	mulps	%xmm0, %xmm2
000000000022b041	addps	%xmm1, %xmm2
000000000022b044	shlq	$0x4, %r9
000000000022b048	movaps	(%r9,%rbx), %xmm1
000000000022b04d	movaps	0x10(%r9,%rbx), %xmm3
000000000022b053	subps	%xmm1, %xmm3
000000000022b056	mulps	%xmm0, %xmm3
000000000022b059	addps	%xmm1, %xmm3
000000000022b05c	subps	%xmm2, %xmm3
000000000022b05f	shufps	$0x55, %xmm11, %xmm11           ## xmm11 = xmm11[1,1,1,1]
000000000022b064	mulps	%xmm3, %xmm11
000000000022b068	addps	%xmm2, %xmm11
000000000022b06c	cmpltps	%xmm7, %xmm4
000000000022b070	movaps	%xmm4, %xmm0
000000000022b073	blendvps	%xmm0, %xmm11, %xmm7
000000000022b079	movaps	%xmm7, (%rdx,%r8)
000000000022b07e	jmp	0x22adb0
000000000022b083	testl	%ecx, %ecx
000000000022b085	jle	0x22ad08
000000000022b08b	testl	%edi, %edi
000000000022b08d	jle	0x22ad08
000000000022b093	movl	%edi, %eax
000000000022b095	shlq	$0x4, %rsi
000000000022b099	shlq	$0x4, %rax
000000000022b09d	xorl	%edi, %edi
000000000022b09f	movaps	-0xa0(%rbp), %xmm0
000000000022b0a6	jmp	0x22b0cb
000000000022b0a8	nopl	(%rax,%rax)
000000000022b0b0	movaps	-0xb0(%rbp), %xmm0
000000000022b0b7	addps	0x19cbf2(%rip), %xmm0
000000000022b0be	incl	%edi
000000000022b0c0	addq	%rsi, %rdx
000000000022b0c3	cmpl	%ecx, %edi
000000000022b0c5	je	0x22ad08
000000000022b0cb	xorl	%r8d, %r8d
000000000022b0ce	movaps	%xmm0, -0xb0(%rbp)
000000000022b0d5	jmp	0x22b0fb
000000000022b0d7	nopw	(%rax,%rax)
000000000022b0e0	movss	0x19cbd8(%rip), %xmm0
000000000022b0e8	movaps	-0x40(%rbp), %xmm1
000000000022b0ec	addps	%xmm0, %xmm1
000000000022b0ef	addq	$0x10, %r8
000000000022b0f3	cmpq	%r8, %rax
000000000022b0f6	movaps	%xmm1, %xmm0
000000000022b0f9	je	0x22b0b0
000000000022b0fb	movaps	(%r14), %xmm10
000000000022b0ff	movaps	%xmm10, -0x70(%rbp)
000000000022b104	movaps	0x20(%r14), %xmm1
000000000022b109	movaps	%xmm1, -0x80(%rbp)
000000000022b10d	movaps	0x40(%r14), %xmm3
000000000022b112	movaps	%xmm3, -0x60(%rbp)
000000000022b116	movaps	0x80(%r14), %xmm8
000000000022b11e	movaps	%xmm0, -0x40(%rbp)
000000000022b122	subps	%xmm1, %xmm0
000000000022b125	xorps	%xmm1, %xmm1
000000000022b128	unpckhpd	%xmm1, %xmm10                   ## xmm10 = xmm10[1],xmm1[1]
000000000022b12d	mulps	%xmm0, %xmm10
000000000022b131	movaps	%xmm10, %xmm11
000000000022b135	mulps	%xmm10, %xmm11
000000000022b139	movshdup	%xmm11, %xmm0                   ## xmm0 = xmm11[1,1,3,3]
000000000022b13e	movaps	%xmm0, %xmm1
000000000022b141	addss	%xmm11, %xmm1
000000000022b146	addss	%xmm0, %xmm11
000000000022b14b	rsqrtss	%xmm11, %xmm11
000000000022b150	mulss	%xmm8, %xmm11
000000000022b155	movaps	0xa0(%r14), %xmm14
000000000022b15d	minps	%xmm14, %xmm11
000000000022b161	mulss	%xmm11, %xmm1
000000000022b166	mulss	%xmm11, %xmm1
000000000022b16b	movss	0xe4(%r14), %xmm0
000000000022b174	mulss	%xmm11, %xmm0
000000000022b179	movss	0xe0(%r14), %xmm2
000000000022b182	subss	%xmm1, %xmm2
000000000022b186	mulss	%xmm0, %xmm2
000000000022b18a	blendps	$0x1, %xmm2, %xmm11             ## xmm11 = xmm2[0],xmm11[1,2,3]
000000000022b191	movaps	%xmm11, %xmm13
000000000022b195	rcpss	%xmm11, %xmm13
000000000022b19a	mulss	%xmm8, %xmm13
000000000022b19f	minss	%xmm14, %xmm13
000000000022b1a4	maxss	0x1e4(%r14), %xmm13
000000000022b1ad	mulss	%xmm13, %xmm2
000000000022b1b2	movss	0x204(%r14), %xmm15
000000000022b1bb	movaps	%xmm15, %xmm0
000000000022b1bf	subss	%xmm2, %xmm0
000000000022b1c3	movaps	%xmm13, %xmm4
000000000022b1c7	movaps	%xmm0, -0x50(%rbp)
000000000022b1cb	mulss	%xmm0, %xmm4
000000000022b1cf	mulss	%xmm3, %xmm4
000000000022b1d3	shufps	$0xa0, %xmm13, %xmm4            ## xmm4 = xmm4[0,0],xmm13[2,2]
000000000022b1d8	mulps	0x120(%r14), %xmm4
000000000022b1e0	movaps	0x100(%r14), %xmm1
000000000022b1e8	movaps	%xmm1, %xmm3
000000000022b1eb	addps	%xmm4, %xmm3
000000000022b1ee	cvtps2dq	%xmm3, %xmm2
000000000022b1f2	cvtdq2ps	%xmm2, %xmm2
000000000022b1f5	movaps	%xmm3, %xmm5
000000000022b1f8	cmpltps	%xmm2, %xmm5
000000000022b1fc	cvtdq2ps	%xmm5, %xmm5
000000000022b1ff	addps	%xmm2, %xmm5
000000000022b202	subps	%xmm5, %xmm3
000000000022b205	movaps	0xe0(%r14), %xmm2
000000000022b20d	subps	%xmm2, %xmm3
000000000022b210	movaps	0x140(%r14), %xmm9
000000000022b218	andps	%xmm9, %xmm3
000000000022b21c	addps	%xmm1, %xmm3
000000000022b21f	movaps	%xmm3, %xmm12
000000000022b223	mulps	%xmm3, %xmm12
000000000022b227	movaps	0xc0(%r14), %xmm5
000000000022b22f	movaps	%xmm5, %xmm1
000000000022b232	mulps	%xmm12, %xmm1
000000000022b236	movaps	0x160(%r14), %xmm7
000000000022b23e	addps	%xmm7, %xmm1
000000000022b241	mulps	%xmm12, %xmm1
000000000022b245	movaps	0x180(%r14), %xmm6
000000000022b24d	addps	%xmm6, %xmm1
000000000022b250	mulps	%xmm12, %xmm1
000000000022b254	cvtps2dq	%xmm4, %xmm12
000000000022b259	cvtdq2ps	%xmm12, %xmm12
000000000022b25d	movaps	%xmm4, %xmm0
000000000022b260	cmpltps	%xmm12, %xmm0
000000000022b265	cvtdq2ps	%xmm0, %xmm0
000000000022b268	addps	%xmm12, %xmm0
000000000022b26c	subps	%xmm0, %xmm4
000000000022b26f	subps	%xmm2, %xmm4
000000000022b272	andps	%xmm9, %xmm4
000000000022b276	movaps	0x1a0(%r14), %xmm0
000000000022b27e	addps	%xmm0, %xmm1
000000000022b281	subps	0x1c0(%r14), %xmm4
000000000022b289	mulps	%xmm3, %xmm1
000000000022b28c	movaps	%xmm4, %xmm2
000000000022b28f	mulps	%xmm4, %xmm2
000000000022b292	mulps	%xmm2, %xmm5
000000000022b295	addps	%xmm7, %xmm5
000000000022b298	mulps	%xmm2, %xmm5
000000000022b29b	addps	%xmm6, %xmm5
000000000022b29e	mulps	%xmm2, %xmm5
000000000022b2a1	addps	%xmm0, %xmm5
000000000022b2a4	mulps	%xmm4, %xmm5
000000000022b2a7	rcpps	%xmm5, %xmm0
000000000022b2aa	mulps	%xmm8, %xmm0
000000000022b2ae	minps	%xmm14, %xmm0
000000000022b2b2	maxps	0x1e0(%r14), %xmm0
000000000022b2ba	mulps	%xmm0, %xmm5
000000000022b2bd	movshdup	%xmm5, %xmm2                    ## xmm2 = xmm5[1,1,3,3]
000000000022b2c1	subss	%xmm2, %xmm15
000000000022b2c6	movaps	-0x60(%rbp), %xmm2
000000000022b2ca	movshdup	%xmm0, %xmm0                    ## xmm0 = xmm0[1,1,3,3]
000000000022b2ce	mulss	%xmm0, %xmm15
000000000022b2d3	movddup	%xmm11, %xmm0                   ## xmm0 = xmm11[0,0]
000000000022b2d8	mulps	%xmm2, %xmm0
000000000022b2db	movshdup	%xmm1, %xmm11                   ## xmm11 = xmm1[1,1,3,3]
000000000022b2e0	mulss	%xmm15, %xmm11
000000000022b2e5	movaps	%xmm0, %xmm1
000000000022b2e8	unpckhpd	%xmm0, %xmm1                    ## xmm1 = xmm1[1],xmm0[1]
000000000022b2ec	mulss	%xmm1, %xmm11
000000000022b2f1	shufps	$0xf0, %xmm0, %xmm11            ## xmm11 = xmm11[0,0],xmm0[3,3]
000000000022b2f6	mulps	%xmm10, %xmm11
000000000022b2fa	mulps	-0x70(%rbp), %xmm11
000000000022b2ff	addps	-0x80(%rbp), %xmm11
000000000022b304	movddup	%xmm11, %xmm0                   ## xmm0 = xmm11[0,0]
000000000022b309	subps	0x60(%r14), %xmm0
000000000022b30e	xorps	0x220(%r14), %xmm0
000000000022b316	movaps	0x260(%r14), %xmm8
000000000022b31e	cmpltps	%xmm8, %xmm0
000000000022b323	andps	0x240(%r14), %xmm0
000000000022b32b	xorps	%xmm8, %xmm0
000000000022b32f	movmskps	%xmm0, %r9d
000000000022b333	testl	%r9d, %r9d
000000000022b336	jne	0x22b0e0
000000000022b33c	mulss	-0x50(%rbp), %xmm13
000000000022b342	shufps	$0x0, %xmm13, %xmm13            ## xmm13 = xmm13[0,0,0,0]
000000000022b347	shufps	$0x55, %xmm2, %xmm2             ## xmm2 = xmm2[1,1,1,1]
000000000022b34b	subps	%xmm2, %xmm13
000000000022b34f	movq	0x50(%r15), %r10
000000000022b353	movslq	0x58(%r15), %r9
000000000022b357	subps	-0xa0(%rbp), %xmm11
000000000022b35f	cvttps2dq	%xmm11, %xmm0
000000000022b364	movaps	%xmm11, %xmm1
000000000022b368	xorps	%xmm2, %xmm2
000000000022b36b	cmpltps	%xmm2, %xmm1
000000000022b36f	paddd	%xmm0, %xmm1
000000000022b373	cvtdq2ps	%xmm1, %xmm0
000000000022b376	subps	%xmm0, %xmm11
000000000022b37a	pextrd	$0x1, %xmm1, %r11d
000000000022b381	movd	%xmm1, %ebx
000000000022b385	imull	%r9d, %r11d
000000000022b389	addl	%ebx, %r11d
000000000022b38c	movslq	%r11d, %r11
000000000022b38f	shlq	$0x4, %r11
000000000022b393	leaq	(%r10,%r11), %rbx
000000000022b397	movaps	%xmm11, %xmm0
000000000022b39b	shufps	$0x0, %xmm11, %xmm0             ## xmm0 = xmm0[0,0],xmm11[0,0]
000000000022b3a0	movaps	(%r10,%r11), %xmm1
000000000022b3a5	movaps	0x10(%r10,%r11), %xmm2
000000000022b3ab	subps	%xmm1, %xmm2
000000000022b3ae	mulps	%xmm0, %xmm2
000000000022b3b1	addps	%xmm1, %xmm2
000000000022b3b4	shlq	$0x4, %r9
000000000022b3b8	movaps	(%r9,%rbx), %xmm1
000000000022b3bd	movaps	0x10(%r9,%rbx), %xmm3
000000000022b3c3	subps	%xmm1, %xmm3
000000000022b3c6	mulps	%xmm0, %xmm3
000000000022b3c9	addps	%xmm1, %xmm3
000000000022b3cc	subps	%xmm2, %xmm3
000000000022b3cf	shufps	$0x55, %xmm11, %xmm11           ## xmm11 = xmm11[1,1,1,1]
000000000022b3d4	mulps	%xmm3, %xmm11
000000000022b3d8	addps	%xmm2, %xmm11
000000000022b3dc	cmpnltps	%xmm8, %xmm13
000000000022b3e1	movaps	%xmm13, %xmm0
000000000022b3e5	blendvps	%xmm0, %xmm8, %xmm11
000000000022b3eb	movaps	%xmm11, (%rdx,%r8)
000000000022b3f0	jmp	0x22b0e0
000000000022b3f5	nopw	%cs:(%rax,%rax)
