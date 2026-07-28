__ZN15ArrowGeneration11addTriangleERNSt3__16vectorI25OZVelocityViewArrowVertexNS0_9allocatorIS2_EEEERNS1_IjNS3_IjEEEES2_S2_S2_:
00000000003fc930	pushq	%rbp
00000000003fc931	movq	%rsp, %rbp
00000000003fc934	pushq	%r15
00000000003fc936	pushq	%r14
00000000003fc938	pushq	%r13
00000000003fc93a	pushq	%r12
00000000003fc93c	pushq	%rbx
00000000003fc93d	subq	$0x48, %rsp
00000000003fc941	movq	%rsi, %r13
00000000003fc944	movq	%rdi, %r8
00000000003fc947	leaq	0x30(%rbp), %r10
00000000003fc94b	leaq	0x10(%rbp), %r11
00000000003fc94f	movaps	0x30(%rbp), %xmm7
00000000003fc953	movaps	0x10(%rbp), %xmm1
00000000003fc957	movaps	0x20(%rbp), %xmm2
00000000003fc95b	movaps	%xmm7, %xmm0
00000000003fc95e	subps	%xmm1, %xmm0
00000000003fc961	movaps	0x50(%rbp), %xmm6
00000000003fc965	movaps	%xmm6, %xmm3
00000000003fc968	subps	%xmm1, %xmm3
00000000003fc96b	movaps	%xmm0, %xmm4
00000000003fc96e	shufps	$0xd2, %xmm0, %xmm4             ## xmm4 = xmm4[2,0],xmm0[1,3]
00000000003fc972	mulps	%xmm3, %xmm4
00000000003fc975	shufps	$0xd2, %xmm3, %xmm3             ## xmm3 = xmm3[2,0,1,3]
00000000003fc979	mulps	%xmm0, %xmm3
00000000003fc97c	subps	%xmm3, %xmm4
00000000003fc97f	movaps	%xmm4, %xmm3
00000000003fc982	shufps	$0xd2, %xmm4, %xmm3             ## xmm3 = xmm3[2,0],xmm4[1,3]
00000000003fc986	mulps	%xmm4, %xmm4
00000000003fc989	movaps	%xmm4, %xmm0
00000000003fc98c	unpckhpd	%xmm4, %xmm0                    ## xmm0 = xmm0[1],xmm4[1]
00000000003fc990	addps	%xmm4, %xmm0
00000000003fc993	movshdup	%xmm4, %xmm4                    ## xmm4 = xmm4[1,1,3,3]
00000000003fc997	addps	%xmm0, %xmm4
00000000003fc99a	movaps	%xmm4, %xmm5
00000000003fc99d	rsqrtss	%xmm4, %xmm5
00000000003fc9a1	mulss	0x30a5ab(%rip), %xmm4
00000000003fc9a9	movss	0x310693(%rip), %xmm0
00000000003fc9b1	cmpless	%xmm5, %xmm0
00000000003fc9b6	blendvps	%xmm0, 0x310611(%rip), %xmm4
00000000003fc9bf	mulss	%xmm5, %xmm4
00000000003fc9c3	mulss	%xmm5, %xmm4
00000000003fc9c7	movss	0x310679(%rip), %xmm0
00000000003fc9cf	subss	%xmm4, %xmm0
00000000003fc9d3	mulss	%xmm5, %xmm0
00000000003fc9d7	shufps	$0x0, %xmm0, %xmm0              ## xmm0 = xmm0[0,0,0,0]
00000000003fc9db	mulps	%xmm3, %xmm0
00000000003fc9de	movaps	%xmm2, %xmm4
00000000003fc9e1	mulps	%xmm2, %xmm4
00000000003fc9e4	movshdup	%xmm4, %xmm3                    ## xmm3 = xmm4[1,1,3,3]
00000000003fc9e8	addss	%xmm4, %xmm3
00000000003fc9ec	movhlps	%xmm4, %xmm4                    ## xmm4 = xmm4[1,1]
00000000003fc9ef	addss	%xmm3, %xmm4
00000000003fc9f3	xorps	%xmm3, %xmm3
00000000003fc9f6	ucomiss	%xmm3, %xmm4
00000000003fc9f9	jne	0x3fca05
00000000003fc9fb	jp	0x3fca05
00000000003fc9fd	movaps	%xmm0, 0x10(%r11)
00000000003fca02	movaps	%xmm0, %xmm2
00000000003fca05	leaq	0x50(%rbp), %rsi
00000000003fca09	movaps	0x10(%r10), %xmm8
00000000003fca0e	movaps	%xmm8, %xmm4
00000000003fca12	mulps	%xmm8, %xmm4
00000000003fca16	movshdup	%xmm4, %xmm5                    ## xmm5 = xmm4[1,1,3,3]
00000000003fca1a	addss	%xmm4, %xmm5
00000000003fca1e	movhlps	%xmm4, %xmm4                    ## xmm4 = xmm4[1,1]
00000000003fca21	addss	%xmm5, %xmm4
00000000003fca25	ucomiss	%xmm3, %xmm4
00000000003fca28	jne	0x3fca35
00000000003fca2a	jp	0x3fca35
00000000003fca2c	movaps	%xmm0, 0x10(%r10)
00000000003fca31	movaps	%xmm0, %xmm8
00000000003fca35	movaps	0x10(%rsi), %xmm3
00000000003fca39	mulps	%xmm3, %xmm3
00000000003fca3c	movshdup	%xmm3, %xmm4                    ## xmm4 = xmm3[1,1,3,3]
00000000003fca40	addss	%xmm3, %xmm4
00000000003fca44	movhlps	%xmm3, %xmm3                    ## xmm3 = xmm3[1,1]
00000000003fca47	addss	%xmm4, %xmm3
00000000003fca4b	xorps	%xmm4, %xmm4
00000000003fca4e	ucomiss	%xmm4, %xmm3
00000000003fca51	jne	0x3fca59
00000000003fca53	jp	0x3fca59
00000000003fca55	movaps	%xmm0, 0x10(%rsi)
00000000003fca59	movq	(%r8), %r12
00000000003fca5c	movq	0x8(%r8), %r15
00000000003fca60	movq	%r15, %rdi
00000000003fca63	subq	%r12, %rdi
00000000003fca66	movq	%rdi, %r9
00000000003fca69	sarq	$0x5, %r9
00000000003fca6d	testl	%r9d, %r9d
00000000003fca70	movq	%r13, -0x38(%rbp)
00000000003fca74	movq	%r8, -0x30(%rbp)
00000000003fca78	jle	0x3fcb11
00000000003fca7e	movl	%r9d, %eax
00000000003fca81	andl	$0x7fffffff, %eax               ## imm = 0x7FFFFFFF
00000000003fca86	leaq	0x10(%r12), %rcx
00000000003fca8b	movss	0x30aac9(%rip), %xmm0
00000000003fca93	movl	$0xffffffff, %r14d              ## imm = 0xFFFFFFFF
00000000003fca99	xorl	%edx, %edx
00000000003fca9b	movss	0x30e4fd(%rip), %xmm3
00000000003fcaa3	jmp	0x3fcabc
00000000003fcaa5	nopw	%cs:(%rax,%rax)
00000000003fcab0	incq	%rdx
00000000003fcab3	addq	$0x20, %rcx
00000000003fcab7	cmpq	%rdx, %rax
00000000003fcaba	je	0x3fcaff
00000000003fcabc	movaps	-0x10(%rcx), %xmm4
00000000003fcac0	subps	%xmm1, %xmm4
00000000003fcac3	mulps	%xmm4, %xmm4
00000000003fcac6	movshdup	%xmm4, %xmm5                    ## xmm5 = xmm4[1,1,3,3]
00000000003fcaca	addss	%xmm4, %xmm5
00000000003fcace	movhlps	%xmm4, %xmm4                    ## xmm4 = xmm4[1,1]
00000000003fcad1	addss	%xmm5, %xmm4
00000000003fcad5	ucomiss	%xmm4, %xmm3
00000000003fcad8	jbe	0x3fcab0
00000000003fcada	movaps	(%rcx), %xmm4
00000000003fcadd	mulps	%xmm2, %xmm4
00000000003fcae0	movshdup	%xmm4, %xmm5                    ## xmm5 = xmm4[1,1,3,3]
00000000003fcae4	addss	%xmm4, %xmm5
00000000003fcae8	movhlps	%xmm4, %xmm4                    ## xmm4 = xmm4[1,1]
00000000003fcaeb	addss	%xmm5, %xmm4
00000000003fcaef	ucomiss	%xmm0, %xmm4
00000000003fcaf2	maxss	%xmm0, %xmm4
00000000003fcaf6	cmoval	%edx, %r14d
00000000003fcafa	movaps	%xmm4, %xmm0
00000000003fcafd	jmp	0x3fcab0
00000000003fcaff	testl	%r14d, %r14d
00000000003fcb02	js	0x3fcb11
00000000003fcb04	ucomiss	0x310535(%rip), %xmm0
00000000003fcb0b	jae	0x3fcc33
00000000003fcb11	movq	0x10(%r8), %rax
00000000003fcb15	cmpq	%rax, %r15
00000000003fcb18	jae	0x3fcb35
00000000003fcb1a	movaps	(%r11), %xmm0
00000000003fcb1e	movaps	0x10(%r11), %xmm1
00000000003fcb23	movaps	%xmm1, 0x10(%r15)
00000000003fcb28	movaps	%xmm0, (%r15)
00000000003fcb2c	addq	$0x20, %r15
00000000003fcb30	jmp	0x3fcc0c
00000000003fcb35	leaq	0x1(%r9), %rcx
00000000003fcb39	movq	%rcx, %rdx
00000000003fcb3c	shrq	$0x3b, %rdx
00000000003fcb40	jne	0x3fd203
00000000003fcb46	movaps	%xmm8, -0x70(%rbp)
00000000003fcb4b	movaps	%xmm7, -0x60(%rbp)
00000000003fcb4f	movaps	%xmm6, -0x50(%rbp)
00000000003fcb53	movabsq	$0x7ffffffffffffff, %rdx        ## imm = 0x7FFFFFFFFFFFFFF
00000000003fcb5d	subq	%r12, %rax
00000000003fcb60	movq	%rax, %r13
00000000003fcb63	sarq	$0x4, %r13
00000000003fcb67	cmpq	%rcx, %r13
00000000003fcb6a	cmovbeq	%rcx, %r13
00000000003fcb6e	movabsq	$0x7fffffffffffffe0, %rcx       ## imm = 0x7FFFFFFFFFFFFFE0
00000000003fcb78	cmpq	%rcx, %rax
00000000003fcb7b	cmovaeq	%rdx, %r13
00000000003fcb7f	cmpq	%rdx, %r13
00000000003fcb82	ja	0x3fd1f9
00000000003fcb88	movq	%r9, %r15
00000000003fcb8b	movq	%rdi, %rbx
00000000003fcb8e	shlq	$0x5, %r13
00000000003fcb92	movq	%r13, %rdi
00000000003fcb95	callq	0x6dfca2                        ## symbol stub for: __Znwm
00000000003fcb9a	movq	%rbx, %rdx
00000000003fcb9d	addq	%rax, %rbx
00000000003fcba0	addq	%rax, %r13
00000000003fcba3	leaq	0x10(%rbp), %rcx
00000000003fcba7	movaps	(%rcx), %xmm0
00000000003fcbaa	movaps	0x10(%rcx), %xmm1
00000000003fcbae	movaps	%xmm0, (%rax,%rdx)
00000000003fcbb2	movaps	%xmm1, 0x10(%rax,%rdx)
00000000003fcbb7	addq	%rdx, %rax
00000000003fcbba	addq	$0x20, %rax
00000000003fcbbe	shlq	$0x5, %r15
00000000003fcbc2	subq	%r15, %rbx
00000000003fcbc5	movq	%rax, %r15
00000000003fcbc8	movq	%rbx, %rdi
00000000003fcbcb	movq	%r12, %rsi
00000000003fcbce	callq	0x6dff8a                        ## symbol stub for: _memcpy
00000000003fcbd3	movq	-0x30(%rbp), %r8
00000000003fcbd7	movq	%rbx, (%r8)
00000000003fcbda	movq	%r15, 0x8(%r8)
00000000003fcbde	movq	%r13, 0x10(%r8)
00000000003fcbe2	testq	%r12, %r12
00000000003fcbe5	je	0x3fcbf3
00000000003fcbe7	movq	%r12, %rdi
00000000003fcbea	callq	0x6dfc36                        ## symbol stub for: __ZdlPv
00000000003fcbef	movq	-0x30(%rbp), %r8
00000000003fcbf3	movq	-0x38(%rbp), %r13
00000000003fcbf7	leaq	0x50(%rbp), %rsi
00000000003fcbfb	movaps	-0x50(%rbp), %xmm6
00000000003fcbff	leaq	0x30(%rbp), %r10
00000000003fcc03	movaps	-0x60(%rbp), %xmm7
00000000003fcc07	movaps	-0x70(%rbp), %xmm8
00000000003fcc0c	movq	%r15, 0x8(%r8)
00000000003fcc10	movq	(%r8), %r12
00000000003fcc13	movq	%r15, %rdi
00000000003fcc16	subq	%r12, %rdi
00000000003fcc19	movq	%rdi, %r14
00000000003fcc1c	shrq	$0x5, %r14
00000000003fcc20	decl	%r14d
00000000003fcc23	movq	%rdi, %r9
00000000003fcc26	sarq	$0x5, %r9
00000000003fcc2a	testl	%r9d, %r9d
00000000003fcc2d	jle	0x3fccc6
00000000003fcc33	movl	%r9d, %eax
00000000003fcc36	andl	$0x7fffffff, %eax               ## imm = 0x7FFFFFFF
00000000003fcc3b	leaq	0x10(%r12), %rcx
00000000003fcc40	movss	0x30a914(%rip), %xmm0
00000000003fcc48	movl	$0xffffffff, %r11d              ## imm = 0xFFFFFFFF
00000000003fcc4e	xorl	%edx, %edx
00000000003fcc50	movss	0x30e348(%rip), %xmm1
00000000003fcc58	jmp	0x3fcc6c
00000000003fcc5a	nopw	(%rax,%rax)
00000000003fcc60	incq	%rdx
00000000003fcc63	addq	$0x20, %rcx
00000000003fcc67	cmpq	%rdx, %rax
00000000003fcc6a	je	0x3fccb0
00000000003fcc6c	movaps	-0x10(%rcx), %xmm2
00000000003fcc70	subps	%xmm7, %xmm2
00000000003fcc73	mulps	%xmm2, %xmm2
00000000003fcc76	movshdup	%xmm2, %xmm3                    ## xmm3 = xmm2[1,1,3,3]
00000000003fcc7a	addss	%xmm2, %xmm3
00000000003fcc7e	movhlps	%xmm2, %xmm2                    ## xmm2 = xmm2[1,1]
00000000003fcc81	addss	%xmm3, %xmm2
00000000003fcc85	ucomiss	%xmm2, %xmm1
00000000003fcc88	jbe	0x3fcc60
00000000003fcc8a	movaps	(%rcx), %xmm2
00000000003fcc8d	mulps	%xmm8, %xmm2
00000000003fcc91	movshdup	%xmm2, %xmm3                    ## xmm3 = xmm2[1,1,3,3]
00000000003fcc95	addss	%xmm2, %xmm3
00000000003fcc99	movhlps	%xmm2, %xmm2                    ## xmm2 = xmm2[1,1]
00000000003fcc9c	addss	%xmm3, %xmm2
00000000003fcca0	ucomiss	%xmm0, %xmm2
00000000003fcca3	maxss	%xmm0, %xmm2
00000000003fcca7	cmoval	%edx, %r11d
00000000003fccab	movaps	%xmm2, %xmm0
00000000003fccae	jmp	0x3fcc60
00000000003fccb0	testl	%r11d, %r11d
00000000003fccb3	js	0x3fccc6
00000000003fccb5	movq	%r11, -0x50(%rbp)
00000000003fccb9	ucomiss	0x310380(%rip), %xmm0
00000000003fccc0	jae	0x3fcde1
00000000003fccc6	movq	0x10(%r8), %rax
00000000003fccca	cmpq	%rax, %r15
00000000003fcccd	jae	0x3fccea
00000000003fcccf	movaps	(%r10), %xmm0
00000000003fccd3	movaps	0x10(%r10), %xmm1
00000000003fccd8	movaps	%xmm1, 0x10(%r15)
00000000003fccdd	movaps	%xmm0, (%r15)
00000000003fcce1	addq	$0x20, %r15
00000000003fcce5	jmp	0x3fcdb7
00000000003fccea	leaq	0x1(%r9), %rcx
00000000003fccee	movq	%rcx, %rdx
00000000003fccf1	shrq	$0x3b, %rdx
00000000003fccf5	jne	0x3fd203
00000000003fccfb	movq	%r9, -0x60(%rbp)
00000000003fccff	movaps	%xmm6, -0x50(%rbp)
00000000003fcd03	movabsq	$0x7ffffffffffffff, %rdx        ## imm = 0x7FFFFFFFFFFFFFF
00000000003fcd0d	subq	%r12, %rax
00000000003fcd10	movq	%rax, %r13
00000000003fcd13	sarq	$0x4, %r13
00000000003fcd17	cmpq	%rcx, %r13
00000000003fcd1a	cmovbeq	%rcx, %r13
00000000003fcd1e	movabsq	$0x7fffffffffffffe0, %rcx       ## imm = 0x7FFFFFFFFFFFFFE0
00000000003fcd28	cmpq	%rcx, %rax
00000000003fcd2b	cmovaeq	%rdx, %r13
00000000003fcd2f	cmpq	%rdx, %r13
00000000003fcd32	ja	0x3fd1f9
00000000003fcd38	movq	%rdi, %rbx
00000000003fcd3b	movq	%r12, %r15
00000000003fcd3e	shlq	$0x5, %r13
00000000003fcd42	movq	%r13, %rdi
00000000003fcd45	callq	0x6dfca2                        ## symbol stub for: __Znwm
00000000003fcd4a	movq	%rbx, %rdx
00000000003fcd4d	addq	%rax, %rbx
00000000003fcd50	addq	%rax, %r13
00000000003fcd53	leaq	0x30(%rbp), %rcx
00000000003fcd57	movaps	(%rcx), %xmm0
00000000003fcd5a	movaps	0x10(%rcx), %xmm1
00000000003fcd5e	movaps	%xmm0, (%rax,%rdx)
00000000003fcd62	movaps	%xmm1, 0x10(%rax,%rdx)
00000000003fcd67	leaq	(%rax,%rdx), %r12
00000000003fcd6b	addq	$0x20, %r12
00000000003fcd6f	movq	-0x60(%rbp), %rax
00000000003fcd73	shlq	$0x5, %rax
00000000003fcd77	subq	%rax, %rbx
00000000003fcd7a	movq	%rbx, %rdi
00000000003fcd7d	movq	%r15, %rsi
00000000003fcd80	callq	0x6dff8a                        ## symbol stub for: _memcpy
00000000003fcd85	movq	-0x30(%rbp), %r8
00000000003fcd89	movq	%rbx, (%r8)
00000000003fcd8c	movq	%r12, %rbx
00000000003fcd8f	movq	%r12, 0x8(%r8)
00000000003fcd93	movq	%r13, 0x10(%r8)
00000000003fcd97	testq	%r15, %r15
00000000003fcd9a	je	0x3fcda8
00000000003fcd9c	movq	%r15, %rdi
00000000003fcd9f	callq	0x6dfc36                        ## symbol stub for: __ZdlPv
00000000003fcda4	movq	-0x30(%rbp), %r8
00000000003fcda8	movq	-0x38(%rbp), %r13
00000000003fcdac	leaq	0x50(%rbp), %rsi
00000000003fcdb0	movaps	-0x50(%rbp), %xmm6
00000000003fcdb4	movq	%rbx, %r15
00000000003fcdb7	movq	%r15, 0x8(%r8)
00000000003fcdbb	movq	(%r8), %r12
00000000003fcdbe	movq	%r15, %rdi
00000000003fcdc1	subq	%r12, %rdi
00000000003fcdc4	movq	%rdi, %rax
00000000003fcdc7	shrq	$0x5, %rax
00000000003fcdcb	decl	%eax
00000000003fcdcd	movq	%rax, -0x50(%rbp)
00000000003fcdd1	movq	%rdi, %r9
00000000003fcdd4	sarq	$0x5, %r9
00000000003fcdd8	testl	%r9d, %r9d
00000000003fcddb	jle	0x3fce6f
00000000003fcde1	movaps	0x10(%rsi), %xmm0
00000000003fcde5	movl	%r9d, %eax
00000000003fcde8	andl	$0x7fffffff, %eax               ## imm = 0x7FFFFFFF
00000000003fcded	leaq	0x10(%r12), %rcx
00000000003fcdf2	movss	0x30a762(%rip), %xmm1
00000000003fcdfa	movl	$0xffffffff, %ebx               ## imm = 0xFFFFFFFF
00000000003fcdff	xorl	%edx, %edx
00000000003fce01	movss	0x30e197(%rip), %xmm2
00000000003fce09	jmp	0x3fce1c
00000000003fce0b	nopl	(%rax,%rax)
00000000003fce10	incq	%rdx
00000000003fce13	addq	$0x20, %rcx
00000000003fce17	cmpq	%rdx, %rax
00000000003fce1a	je	0x3fce5e
00000000003fce1c	movaps	-0x10(%rcx), %xmm3
00000000003fce20	subps	%xmm6, %xmm3
00000000003fce23	mulps	%xmm3, %xmm3
00000000003fce26	movshdup	%xmm3, %xmm4                    ## xmm4 = xmm3[1,1,3,3]
00000000003fce2a	addss	%xmm3, %xmm4
00000000003fce2e	movhlps	%xmm3, %xmm3                    ## xmm3 = xmm3[1,1]
00000000003fce31	addss	%xmm4, %xmm3
00000000003fce35	ucomiss	%xmm3, %xmm2
00000000003fce38	jbe	0x3fce10
00000000003fce3a	movaps	(%rcx), %xmm3
00000000003fce3d	mulps	%xmm0, %xmm3
00000000003fce40	movshdup	%xmm3, %xmm4                    ## xmm4 = xmm3[1,1,3,3]
00000000003fce44	addss	%xmm3, %xmm4
00000000003fce48	movhlps	%xmm3, %xmm3                    ## xmm3 = xmm3[1,1]
00000000003fce4b	addss	%xmm4, %xmm3
00000000003fce4f	ucomiss	%xmm1, %xmm3
00000000003fce52	maxss	%xmm1, %xmm3
00000000003fce56	cmoval	%edx, %ebx
00000000003fce59	movaps	%xmm3, %xmm1
00000000003fce5c	jmp	0x3fce10
00000000003fce5e	testl	%ebx, %ebx
00000000003fce60	js	0x3fce6f
00000000003fce62	ucomiss	0x3101d7(%rip), %xmm1
00000000003fce69	jae	0x3fcf58
00000000003fce6f	movq	0x10(%r8), %rax
00000000003fce73	cmpq	%rax, %r15
00000000003fce76	jae	0x3fce94
00000000003fce78	movaps	(%rsi), %xmm0
00000000003fce7b	movaps	0x10(%rsi), %xmm1
00000000003fce7f	movaps	%xmm1, 0x10(%r15)
00000000003fce84	movaps	%xmm0, (%r15)
00000000003fce88	addq	$0x20, %r15
00000000003fce8c	movq	%r15, %rbx
00000000003fce8f	jmp	0x3fcf4b
00000000003fce94	leaq	0x1(%r9), %rcx
00000000003fce98	movq	%rcx, %rdx
00000000003fce9b	shrq	$0x3b, %rdx
00000000003fce9f	jne	0x3fd203
00000000003fcea5	movq	%r9, -0x60(%rbp)
00000000003fcea9	movabsq	$0x7ffffffffffffff, %rdx        ## imm = 0x7FFFFFFFFFFFFFF
00000000003fceb3	subq	%r12, %rax
00000000003fceb6	movq	%rax, %r13
00000000003fceb9	sarq	$0x4, %r13
00000000003fcebd	cmpq	%rcx, %r13
00000000003fcec0	cmovbeq	%rcx, %r13
00000000003fcec4	movabsq	$0x7fffffffffffffe0, %rcx       ## imm = 0x7FFFFFFFFFFFFFE0
00000000003fcece	cmpq	%rcx, %rax
00000000003fced1	cmovaeq	%rdx, %r13
00000000003fced5	cmpq	%rdx, %r13
00000000003fced8	ja	0x3fd1f9
00000000003fcede	movq	%rdi, %r15
00000000003fcee1	movq	%rsi, %rbx
00000000003fcee4	shlq	$0x5, %r13
00000000003fcee8	movq	%r13, %rdi
00000000003fceeb	callq	0x6dfca2                        ## symbol stub for: __Znwm
00000000003fcef0	movq	%r15, %rdx
00000000003fcef3	addq	%rax, %r15
00000000003fcef6	addq	%rax, %r13
00000000003fcef9	movaps	(%rbx), %xmm0
00000000003fcefc	movaps	0x10(%rbx), %xmm1
00000000003fcf00	movaps	%xmm0, (%rax,%rdx)
00000000003fcf04	movaps	%xmm1, 0x10(%rax,%rdx)
00000000003fcf09	leaq	(%rax,%rdx), %rbx
00000000003fcf0d	addq	$0x20, %rbx
00000000003fcf11	movq	-0x60(%rbp), %rax
00000000003fcf15	shlq	$0x5, %rax
00000000003fcf19	subq	%rax, %r15
00000000003fcf1c	movq	%r15, %rdi
00000000003fcf1f	movq	%r12, %rsi
00000000003fcf22	callq	0x6dff8a                        ## symbol stub for: _memcpy
00000000003fcf27	movq	-0x30(%rbp), %r8
00000000003fcf2b	movq	%r15, (%r8)
00000000003fcf2e	movq	%rbx, 0x8(%r8)
00000000003fcf32	movq	%r13, 0x10(%r8)
00000000003fcf36	testq	%r12, %r12
00000000003fcf39	je	0x3fcf47
00000000003fcf3b	movq	%r12, %rdi
00000000003fcf3e	callq	0x6dfc36                        ## symbol stub for: __ZdlPv
00000000003fcf43	movq	-0x30(%rbp), %r8
00000000003fcf47	movq	-0x38(%rbp), %r13
00000000003fcf4b	movq	%rbx, 0x8(%r8)
00000000003fcf4f	subq	(%r8), %rbx
00000000003fcf52	shrq	$0x5, %rbx
00000000003fcf56	decl	%ebx
00000000003fcf58	movabsq	$0x3fffffffffffffff, %rdx       ## imm = 0x3FFFFFFFFFFFFFFF
00000000003fcf62	movq	0x8(%r13), %r15
00000000003fcf66	movq	0x10(%r13), %r12
00000000003fcf6a	cmpq	%r12, %r15
00000000003fcf6d	jae	0x3fcfb0
00000000003fcf6f	movl	%r14d, (%r15)
00000000003fcf72	addq	$0x4, %r15
00000000003fcf76	movq	%r15, %r14
00000000003fcf79	movq	%r14, 0x8(%r13)
00000000003fcf7d	cmpq	%r12, %r14
00000000003fcf80	jae	0x3fd07c
00000000003fcf86	movq	-0x50(%rbp), %rax
00000000003fcf8a	movl	%eax, (%r14)
00000000003fcf8d	addq	$0x4, %r14
00000000003fcf91	movq	%r14, %r15
00000000003fcf94	movq	%r15, 0x8(%r13)
00000000003fcf98	cmpq	%r12, %r15
00000000003fcf9b	jae	0x3fd144
00000000003fcfa1	movl	%ebx, (%r15)
00000000003fcfa4	addq	$0x4, %r15
00000000003fcfa8	movq	%r15, %rbx
00000000003fcfab	jmp	0x3fd1e6
00000000003fcfb0	movq	(%r13), %rcx
00000000003fcfb4	subq	%rcx, %r15
00000000003fcfb7	movq	%r15, %rsi
00000000003fcfba	sarq	$0x2, %rsi
00000000003fcfbe	leaq	0x1(%rsi), %rax
00000000003fcfc2	cmpq	%rdx, %rax
00000000003fcfc5	ja	0x3fd1fe
00000000003fcfcb	movq	%rsi, -0x60(%rbp)
00000000003fcfcf	movq	%rcx, -0x30(%rbp)
00000000003fcfd3	subq	%rcx, %r12
00000000003fcfd6	movabsq	$0x7fffffffffffffe0, %rcx       ## imm = 0x7FFFFFFFFFFFFFE0
00000000003fcfe0	addq	$0x1c, %rcx
00000000003fcfe4	movq	%r12, %r13
00000000003fcfe7	sarq	%r13
00000000003fcfea	cmpq	%rax, %r13
00000000003fcfed	cmovbeq	%rax, %r13
00000000003fcff1	cmpq	%rcx, %r12
00000000003fcff4	cmovaeq	%rdx, %r13
00000000003fcff8	cmpq	%rdx, %r13
00000000003fcffb	ja	0x3fd1f9
00000000003fd001	leaq	(,%r13,4), %rdi
00000000003fd009	callq	0x6dfca2                        ## symbol stub for: __Znwm
00000000003fd00e	leaq	(%rax,%r15), %rdi
00000000003fd012	leaq	(%rax,%r13,4), %r12
00000000003fd016	movl	%r14d, (%rax,%r15)
00000000003fd01a	leaq	(%rax,%r15), %r14
00000000003fd01e	addq	$0x4, %r14
00000000003fd022	movq	-0x60(%rbp), %rax
00000000003fd026	shlq	$0x2, %rax
00000000003fd02a	subq	%rax, %rdi
00000000003fd02d	movq	%rdi, -0x60(%rbp)
00000000003fd031	movq	-0x30(%rbp), %r13
00000000003fd035	movq	%r13, %rsi
00000000003fd038	movq	%r15, %rdx
00000000003fd03b	callq	0x6dff8a                        ## symbol stub for: _memcpy
00000000003fd040	movq	%r13, %rdi
00000000003fd043	movq	-0x38(%rbp), %r13
00000000003fd047	movq	-0x60(%rbp), %rax
00000000003fd04b	movq	%rax, (%r13)
00000000003fd04f	movq	%r14, 0x8(%r13)
00000000003fd053	movq	%r12, 0x10(%r13)
00000000003fd057	testq	%rdi, %rdi
00000000003fd05a	je	0x3fd065
00000000003fd05c	callq	0x6dfc36                        ## symbol stub for: __ZdlPv
00000000003fd061	movq	0x10(%r13), %r12
00000000003fd065	movabsq	$0x3fffffffffffffff, %rdx       ## imm = 0x3FFFFFFFFFFFFFFF
00000000003fd06f	movq	%r14, 0x8(%r13)
00000000003fd073	cmpq	%r12, %r14
00000000003fd076	jb	0x3fcf86
00000000003fd07c	movq	(%r13), %rcx
00000000003fd080	subq	%rcx, %r14
00000000003fd083	movq	%r14, %r13
00000000003fd086	sarq	$0x2, %r13
00000000003fd08a	leaq	0x1(%r13), %rax
00000000003fd08e	cmpq	%rdx, %rax
00000000003fd091	ja	0x3fd1fe
00000000003fd097	movq	%rcx, -0x30(%rbp)
00000000003fd09b	subq	%rcx, %r12
00000000003fd09e	movabsq	$0x7fffffffffffffe0, %rcx       ## imm = 0x7FFFFFFFFFFFFFE0
00000000003fd0a8	addq	$0x1c, %rcx
00000000003fd0ac	movq	%r12, %r15
00000000003fd0af	sarq	%r15
00000000003fd0b2	cmpq	%rax, %r15
00000000003fd0b5	cmovbeq	%rax, %r15
00000000003fd0b9	cmpq	%rcx, %r12
00000000003fd0bc	cmovaeq	%rdx, %r15
00000000003fd0c0	cmpq	%rdx, %r15
00000000003fd0c3	ja	0x3fd1f9
00000000003fd0c9	leaq	(,%r15,4), %rdi
00000000003fd0d1	callq	0x6dfca2                        ## symbol stub for: __Znwm
00000000003fd0d6	leaq	(%rax,%r14), %rdi
00000000003fd0da	leaq	(%rax,%r15,4), %r12
00000000003fd0de	movq	-0x50(%rbp), %rcx
00000000003fd0e2	movl	%ecx, (%rax,%r14)
00000000003fd0e6	leaq	(%rax,%r14), %r15
00000000003fd0ea	addq	$0x4, %r15
00000000003fd0ee	shlq	$0x2, %r13
00000000003fd0f2	subq	%r13, %rdi
00000000003fd0f5	movq	%rdi, -0x50(%rbp)
00000000003fd0f9	movq	-0x30(%rbp), %r13
00000000003fd0fd	movq	%r13, %rsi
00000000003fd100	movq	%r14, %rdx
00000000003fd103	callq	0x6dff8a                        ## symbol stub for: _memcpy
00000000003fd108	movq	%r13, %rdi
00000000003fd10b	movq	-0x38(%rbp), %r13
00000000003fd10f	movq	-0x50(%rbp), %rax
00000000003fd113	movq	%rax, (%r13)
00000000003fd117	movq	%r15, 0x8(%r13)
00000000003fd11b	movq	%r12, 0x10(%r13)
00000000003fd11f	testq	%rdi, %rdi
00000000003fd122	je	0x3fd12d
00000000003fd124	callq	0x6dfc36                        ## symbol stub for: __ZdlPv
00000000003fd129	movq	0x10(%r13), %r12
00000000003fd12d	movabsq	$0x3fffffffffffffff, %rdx       ## imm = 0x3FFFFFFFFFFFFFFF
00000000003fd137	movq	%r15, 0x8(%r13)
00000000003fd13b	cmpq	%r12, %r15
00000000003fd13e	jb	0x3fcfa1
00000000003fd144	movq	(%r13), %rcx
00000000003fd148	subq	%rcx, %r15
00000000003fd14b	movq	%r15, %r14
00000000003fd14e	sarq	$0x2, %r14
00000000003fd152	leaq	0x1(%r14), %rax
00000000003fd156	cmpq	%rdx, %rax
00000000003fd159	ja	0x3fd1fe
00000000003fd15f	movq	%rcx, -0x30(%rbp)
00000000003fd163	subq	%rcx, %r12
00000000003fd166	movabsq	$0x7fffffffffffffe0, %rcx       ## imm = 0x7FFFFFFFFFFFFFE0
00000000003fd170	addq	$0x1c, %rcx
00000000003fd174	movq	%r12, %r13
00000000003fd177	sarq	%r13
00000000003fd17a	cmpq	%rax, %r13
00000000003fd17d	cmovbeq	%rax, %r13
00000000003fd181	cmpq	%rcx, %r12
00000000003fd184	cmovaeq	%rdx, %r13
00000000003fd188	cmpq	%rdx, %r13
00000000003fd18b	ja	0x3fd1f9
00000000003fd18d	leaq	(,%r13,4), %rdi
00000000003fd195	callq	0x6dfca2                        ## symbol stub for: __Znwm
00000000003fd19a	leaq	(%rax,%r15), %r12
00000000003fd19e	leaq	(%rax,%r13,4), %r13
00000000003fd1a2	movl	%ebx, (%rax,%r15)
00000000003fd1a6	leaq	(%rax,%r15), %rbx
00000000003fd1aa	addq	$0x4, %rbx
00000000003fd1ae	shlq	$0x2, %r14
00000000003fd1b2	subq	%r14, %r12
00000000003fd1b5	movq	%r12, %rdi
00000000003fd1b8	movq	-0x30(%rbp), %r14
00000000003fd1bc	movq	%r14, %rsi
00000000003fd1bf	movq	%r15, %rdx
00000000003fd1c2	callq	0x6dff8a                        ## symbol stub for: _memcpy
00000000003fd1c7	movq	-0x38(%rbp), %rax
00000000003fd1cb	movq	%r12, (%rax)
00000000003fd1ce	movq	%rbx, 0x8(%rax)
00000000003fd1d2	movq	%r13, 0x10(%rax)
00000000003fd1d6	movq	%rax, %r13
00000000003fd1d9	testq	%r14, %r14
00000000003fd1dc	je	0x3fd1e6
00000000003fd1de	movq	%r14, %rdi
00000000003fd1e1	callq	0x6dfc36                        ## symbol stub for: __ZdlPv
00000000003fd1e6	movq	%rbx, 0x8(%r13)
00000000003fd1ea	addq	$0x48, %rsp
00000000003fd1ee	popq	%rbx
00000000003fd1ef	popq	%r12
00000000003fd1f1	popq	%r13
00000000003fd1f3	popq	%r14
00000000003fd1f5	popq	%r15
00000000003fd1f7	popq	%rbp
00000000003fd1f8	retq
00000000003fd1f9	callq	__ZSt28__throw_bad_array_new_lengthB9nqe210106v ## std::__throw_bad_array_new_length[abi:nqe210106]()
00000000003fd1fe	callq	__ZNSt3__16vectorIjNS_9allocatorIjEEE20__throw_length_errorB9nqe210106Ev ## std::__1::vector<unsigned int, std::__1::allocator<unsigned int>>::__throw_length_error[abi:nqe210106]()
00000000003fd203	callq	__ZNSt3__16vectorI25OZVelocityViewArrowVertexNS_9allocatorIS1_EEE20__throw_length_errorB9nqe210106Ev ## std::__1::vector<OZVelocityViewArrowVertex, std::__1::allocator<OZVelocityViewArrowVertex>>::__throw_length_error[abi:nqe210106]()
00000000003fd208	nopl	(%rax,%rax)
