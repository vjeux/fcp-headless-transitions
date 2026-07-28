__ZN19TrackballGeneration17buildLatitudeRingEDv3_ffiRNSt3__16vectorI29OZVelocityViewTrackballVertexNS1_9allocatorIS3_EEEE:
00000000003fba20	pushq	%rbp
00000000003fba21	movq	%rsp, %rbp
00000000003fba24	pushq	%r15
00000000003fba26	pushq	%r14
00000000003fba28	pushq	%r13
00000000003fba2a	pushq	%r12
00000000003fba2c	pushq	%rbx
00000000003fba2d	subq	$0x88, %rsp
00000000003fba34	movaps	%xmm1, -0xa0(%rbp)
00000000003fba3b	movaps	%xmm0, -0x90(%rbp)
00000000003fba42	testl	%edi, %edi
00000000003fba44	jle	0x3fbf31
00000000003fba4a	movq	%rsi, %rbx
00000000003fba4d	movl	%edi, %r14d
00000000003fba50	movaps	-0x90(%rbp), %xmm2
00000000003fba57	movaps	%xmm2, %xmm3
00000000003fba5a	xorps	%xmm0, %xmm0
00000000003fba5d	cvtsi2sd	%edi, %xmm0
00000000003fba61	movsd	0x30bce7(%rip), %xmm1
00000000003fba69	divsd	%xmm0, %xmm1
00000000003fba6d	xorps	%xmm0, %xmm0
00000000003fba70	cvtsd2ss	%xmm1, %xmm0
00000000003fba74	unpckhpd	%xmm2, %xmm3                    ## xmm3 = xmm3[1],xmm2[1]
00000000003fba78	movaps	%xmm3, -0xb0(%rbp)
00000000003fba7f	addss	-0xa0(%rbp), %xmm2
00000000003fba87	movss	%xmm0, -0x5c(%rbp)
00000000003fba8c	movss	%xmm0, -0x3c(%rbp)
00000000003fba91	movaps	%xmm2, -0x80(%rbp)
00000000003fba95	movaps	%xmm2, %xmm3
00000000003fba98	movq	%rsi, -0x58(%rbp)
00000000003fba9c	jmp	0x3fbac5
00000000003fba9e	nop
00000000003fbaa0	movaps	-0x80(%rbp), %xmm0
00000000003fbaa4	movaps	%xmm0, (%r15)
00000000003fbaa8	movaps	0x30b341(%rip), %xmm0
00000000003fbaaf	movaps	%xmm0, 0x10(%r15)
00000000003fbab4	addq	$0x20, %r15
00000000003fbab8	movq	%r15, 0x8(%rbx)
00000000003fbabc	decl	%r14d
00000000003fbabf	je	0x3fbf31
00000000003fbac5	cmpl	$0x1, %r14d
00000000003fbac9	movl	%r14d, -0x2c(%rbp)
00000000003fbacd	movaps	%xmm3, -0x50(%rbp)
00000000003fbad1	jne	0x3fbb10
00000000003fbad3	movq	0x8(%rbx), %r12
00000000003fbad7	movq	0x10(%rbx), %rax
00000000003fbadb	cmpq	%rax, %r12
00000000003fbade	jae	0x3fbb60
00000000003fbae4	movaps	%xmm3, (%r12)
00000000003fbae9	movaps	0x30b300(%rip), %xmm0
00000000003fbaf0	movaps	%xmm0, 0x10(%r12)
00000000003fbaf6	addq	$0x20, %r12
00000000003fbafa	movq	%r12, %r15
00000000003fbafd	movq	%r15, 0x8(%rbx)
00000000003fbb01	movq	0x10(%rbx), %rax
00000000003fbb05	cmpq	%rax, %r15
00000000003fbb08	jb	0x3fbaa0
00000000003fbb0a	jmp	0x3fbc35
00000000003fbb0f	nop
00000000003fbb10	movss	-0x3c(%rbp), %xmm0
00000000003fbb15	cvtss2sd	%xmm0, %xmm0
00000000003fbb19	callq	0x6dfd2c                        ## symbol stub for: ___sincos_stret
00000000003fbb1e	movaps	%xmm0, %xmm2
00000000003fbb21	movq	0x8(%rbx), %r12
00000000003fbb25	movq	0x10(%rbx), %rax
00000000003fbb29	cmpq	%rax, %r12
00000000003fbb2c	jae	0x3fbd10
00000000003fbb32	movaps	-0x50(%rbp), %xmm0
00000000003fbb36	movaps	%xmm0, (%r12)
00000000003fbb3b	movaps	0x30b2ae(%rip), %xmm0
00000000003fbb42	movaps	%xmm0, 0x10(%r12)
00000000003fbb48	addq	$0x20, %r12
00000000003fbb4c	movq	%r12, %r15
00000000003fbb4f	jmp	0x3fbde4
00000000003fbb54	nopw	%cs:(%rax,%rax)
00000000003fbb60	movq	(%rbx), %rsi
00000000003fbb63	subq	%rsi, %r12
00000000003fbb66	movq	%r12, %r13
00000000003fbb69	sarq	$0x5, %r13
00000000003fbb6d	leaq	0x1(%r13), %rcx
00000000003fbb71	movabsq	$0x7ffffffffffffff, %rdx        ## imm = 0x7FFFFFFFFFFFFFF
00000000003fbb7b	cmpq	%rdx, %rcx
00000000003fbb7e	ja	0x3fbf43
00000000003fbb84	movq	%rsi, -0x38(%rbp)
00000000003fbb88	subq	%rsi, %rax
00000000003fbb8b	movq	%rax, %r14
00000000003fbb8e	sarq	$0x4, %r14
00000000003fbb92	cmpq	%rcx, %r14
00000000003fbb95	cmovbeq	%rcx, %r14
00000000003fbb99	movabsq	$0x7fffffffffffffe0, %rcx       ## imm = 0x7FFFFFFFFFFFFFE0
00000000003fbba3	cmpq	%rcx, %rax
00000000003fbba6	cmovaeq	%rdx, %r14
00000000003fbbaa	cmpq	%rdx, %r14
00000000003fbbad	ja	0x3fbf48
00000000003fbbb3	shlq	$0x5, %r14
00000000003fbbb7	movq	%r14, %rdi
00000000003fbbba	callq	0x6dfca2                        ## symbol stub for: __Znwm
00000000003fbbbf	leaq	(%rax,%r12), %rbx
00000000003fbbc3	addq	%rax, %r14
00000000003fbbc6	movaps	-0x50(%rbp), %xmm0
00000000003fbbca	movaps	%xmm0, (%rax,%r12)
00000000003fbbcf	movaps	0x30b21a(%rip), %xmm0
00000000003fbbd6	movaps	%xmm0, 0x10(%rax,%r12)
00000000003fbbdc	leaq	(%rax,%r12), %r15
00000000003fbbe0	addq	$0x20, %r15
00000000003fbbe4	shlq	$0x5, %r13
00000000003fbbe8	subq	%r13, %rbx
00000000003fbbeb	movq	%rbx, %rdi
00000000003fbbee	movq	-0x38(%rbp), %r13
00000000003fbbf2	movq	%r13, %rsi
00000000003fbbf5	movq	%r12, %rdx
00000000003fbbf8	callq	0x6dff8a                        ## symbol stub for: _memcpy
00000000003fbbfd	movq	-0x58(%rbp), %rax
00000000003fbc01	movq	%rbx, (%rax)
00000000003fbc04	movq	%rax, %rbx
00000000003fbc07	movq	%r15, 0x8(%rax)
00000000003fbc0b	movq	%r14, 0x10(%rax)
00000000003fbc0f	testq	%r13, %r13
00000000003fbc12	je	0x3fbc1c
00000000003fbc14	movq	%r13, %rdi
00000000003fbc17	callq	0x6dfc36                        ## symbol stub for: __ZdlPv
00000000003fbc1c	movl	-0x2c(%rbp), %r14d
00000000003fbc20	movaps	-0x50(%rbp), %xmm3
00000000003fbc24	movq	%r15, 0x8(%rbx)
00000000003fbc28	movq	0x10(%rbx), %rax
00000000003fbc2c	cmpq	%rax, %r15
00000000003fbc2f	jb	0x3fbaa0
00000000003fbc35	movq	(%rbx), %rsi
00000000003fbc38	subq	%rsi, %r15
00000000003fbc3b	movq	%r15, %r14
00000000003fbc3e	sarq	$0x5, %r14
00000000003fbc42	leaq	0x1(%r14), %rcx
00000000003fbc46	movabsq	$0x7ffffffffffffff, %rdx        ## imm = 0x7FFFFFFFFFFFFFF
00000000003fbc50	cmpq	%rdx, %rcx
00000000003fbc53	ja	0x3fbf43
00000000003fbc59	subq	%rsi, %rax
00000000003fbc5c	movq	%rax, %r13
00000000003fbc5f	sarq	$0x4, %r13
00000000003fbc63	cmpq	%rcx, %r13
00000000003fbc66	ja	0x3fbc6b
00000000003fbc68	movq	%rcx, %r13
00000000003fbc6b	movq	%rsi, -0x38(%rbp)
00000000003fbc6f	movabsq	$0x7fffffffffffffe0, %rcx       ## imm = 0x7FFFFFFFFFFFFFE0
00000000003fbc79	cmpq	%rcx, %rax
00000000003fbc7c	cmovaeq	%rdx, %r13
00000000003fbc80	cmpq	%rdx, %r13
00000000003fbc83	ja	0x3fbf48
00000000003fbc89	shlq	$0x5, %r13
00000000003fbc8d	movq	%r13, %rdi
00000000003fbc90	callq	0x6dfca2                        ## symbol stub for: __Znwm
00000000003fbc95	leaq	(%rax,%r15), %rbx
00000000003fbc99	addq	%rax, %r13
00000000003fbc9c	movaps	-0x80(%rbp), %xmm0
00000000003fbca0	movaps	%xmm0, (%rax,%r15)
00000000003fbca5	movaps	0x30b144(%rip), %xmm0
00000000003fbcac	movaps	%xmm0, 0x10(%rax,%r15)
00000000003fbcb2	leaq	(%rax,%r15), %r12
00000000003fbcb6	addq	$0x20, %r12
00000000003fbcba	shlq	$0x5, %r14
00000000003fbcbe	subq	%r14, %rbx
00000000003fbcc1	movq	%rbx, %rdi
00000000003fbcc4	movq	-0x38(%rbp), %r14
00000000003fbcc8	movq	%r14, %rsi
00000000003fbccb	movq	%r15, %rdx
00000000003fbcce	callq	0x6dff8a                        ## symbol stub for: _memcpy
00000000003fbcd3	movq	-0x58(%rbp), %rax
00000000003fbcd7	movq	%rbx, (%rax)
00000000003fbcda	movq	%rax, %rbx
00000000003fbcdd	movq	%r12, 0x8(%rax)
00000000003fbce1	movq	%r13, 0x10(%rax)
00000000003fbce5	testq	%r14, %r14
00000000003fbce8	je	0x3fbcf2
00000000003fbcea	movq	%r14, %rdi
00000000003fbced	callq	0x6dfc36                        ## symbol stub for: __ZdlPv
00000000003fbcf2	movl	-0x2c(%rbp), %r14d
00000000003fbcf6	movaps	-0x50(%rbp), %xmm3
00000000003fbcfa	movq	%r12, 0x8(%rbx)
00000000003fbcfe	jmp	0x3fbabc
00000000003fbd03	nopw	%cs:(%rax,%rax)
00000000003fbd10	movq	(%rbx), %rsi
00000000003fbd13	subq	%rsi, %r12
00000000003fbd16	movq	%r12, %r13
00000000003fbd19	sarq	$0x5, %r13
00000000003fbd1d	leaq	0x1(%r13), %rcx
00000000003fbd21	movabsq	$0x7ffffffffffffff, %rdx        ## imm = 0x7FFFFFFFFFFFFFF
00000000003fbd2b	cmpq	%rdx, %rcx
00000000003fbd2e	ja	0x3fbf43
00000000003fbd34	movsd	%xmm1, -0x68(%rbp)
00000000003fbd39	movsd	%xmm2, -0x38(%rbp)
00000000003fbd3e	movq	%rsi, -0x70(%rbp)
00000000003fbd42	subq	%rsi, %rax
00000000003fbd45	movq	%rax, %r14
00000000003fbd48	sarq	$0x4, %r14
00000000003fbd4c	cmpq	%rcx, %r14
00000000003fbd4f	cmovbeq	%rcx, %r14
00000000003fbd53	movabsq	$0x7fffffffffffffe0, %rcx       ## imm = 0x7FFFFFFFFFFFFFE0
00000000003fbd5d	cmpq	%rcx, %rax
00000000003fbd60	cmovaeq	%rdx, %r14
00000000003fbd64	cmpq	%rdx, %r14
00000000003fbd67	ja	0x3fbf48
00000000003fbd6d	shlq	$0x5, %r14
00000000003fbd71	movq	%r14, %rdi
00000000003fbd74	callq	0x6dfca2                        ## symbol stub for: __Znwm
00000000003fbd79	leaq	(%rax,%r12), %rbx
00000000003fbd7d	addq	%rax, %r14
00000000003fbd80	movaps	-0x50(%rbp), %xmm0
00000000003fbd84	movaps	%xmm0, (%rax,%r12)
00000000003fbd89	movaps	0x30b060(%rip), %xmm0
00000000003fbd90	movaps	%xmm0, 0x10(%rax,%r12)
00000000003fbd96	leaq	(%rax,%r12), %r15
00000000003fbd9a	addq	$0x20, %r15
00000000003fbd9e	shlq	$0x5, %r13
00000000003fbda2	subq	%r13, %rbx
00000000003fbda5	movq	%rbx, %rdi
00000000003fbda8	movq	-0x70(%rbp), %r13
00000000003fbdac	movq	%r13, %rsi
00000000003fbdaf	movq	%r12, %rdx
00000000003fbdb2	callq	0x6dff8a                        ## symbol stub for: _memcpy
00000000003fbdb7	movq	-0x58(%rbp), %rax
00000000003fbdbb	movq	%rbx, (%rax)
00000000003fbdbe	movq	%rax, %rbx
00000000003fbdc1	movq	%r15, 0x8(%rax)
00000000003fbdc5	movq	%r14, 0x10(%rax)
00000000003fbdc9	testq	%r13, %r13
00000000003fbdcc	je	0x3fbdd6
00000000003fbdce	movq	%r13, %rdi
00000000003fbdd1	callq	0x6dfc36                        ## symbol stub for: __ZdlPv
00000000003fbdd6	movl	-0x2c(%rbp), %r14d
00000000003fbdda	movsd	-0x38(%rbp), %xmm2
00000000003fbddf	movsd	-0x68(%rbp), %xmm1
00000000003fbde4	xorps	%xmm3, %xmm3
00000000003fbde7	cvtsd2ss	%xmm1, %xmm3
00000000003fbdeb	movaps	-0xa0(%rbp), %xmm1
00000000003fbdf2	mulss	%xmm1, %xmm3
00000000003fbdf6	xorps	%xmm0, %xmm0
00000000003fbdf9	cvtsd2ss	%xmm2, %xmm0
00000000003fbdfd	movaps	-0x90(%rbp), %xmm2
00000000003fbe04	addss	%xmm2, %xmm3
00000000003fbe08	mulss	%xmm1, %xmm0
00000000003fbe0c	addss	-0xb0(%rbp), %xmm0
00000000003fbe14	blendps	$0xe, %xmm2, %xmm3              ## xmm3 = xmm3[0],xmm2[1,2,3]
00000000003fbe1a	insertps	$0x20, %xmm0, %xmm3             ## xmm3 = xmm3[0,1],xmm0[0],xmm3[3]
00000000003fbe20	movq	%r15, 0x8(%rbx)
00000000003fbe24	movq	0x10(%rbx), %rax
00000000003fbe28	cmpq	%rax, %r15
00000000003fbe2b	jae	0x3fbe50
00000000003fbe2d	movaps	%xmm3, (%r15)
00000000003fbe31	movaps	0x30afb8(%rip), %xmm0
00000000003fbe38	movaps	%xmm0, 0x10(%r15)
00000000003fbe3d	addq	$0x20, %r15
00000000003fbe41	movq	%r15, %r12
00000000003fbe44	jmp	0x3fbf19
00000000003fbe49	nopl	(%rax)
00000000003fbe50	movq	(%rbx), %rsi
00000000003fbe53	subq	%rsi, %r15
00000000003fbe56	movq	%r15, %r14
00000000003fbe59	sarq	$0x5, %r14
00000000003fbe5d	leaq	0x1(%r14), %rcx
00000000003fbe61	movabsq	$0x7ffffffffffffff, %rdx        ## imm = 0x7FFFFFFFFFFFFFF
00000000003fbe6b	cmpq	%rdx, %rcx
00000000003fbe6e	ja	0x3fbf43
00000000003fbe74	subq	%rsi, %rax
00000000003fbe77	movq	%rax, %r13
00000000003fbe7a	sarq	$0x4, %r13
00000000003fbe7e	cmpq	%rcx, %r13
00000000003fbe81	ja	0x3fbe86
00000000003fbe83	movq	%rcx, %r13
00000000003fbe86	movq	%rsi, -0x38(%rbp)
00000000003fbe8a	movaps	%xmm3, -0x50(%rbp)
00000000003fbe8e	movabsq	$0x7fffffffffffffe0, %rcx       ## imm = 0x7FFFFFFFFFFFFFE0
00000000003fbe98	cmpq	%rcx, %rax
00000000003fbe9b	cmovaeq	%rdx, %r13
00000000003fbe9f	cmpq	%rdx, %r13
00000000003fbea2	ja	0x3fbf48
00000000003fbea8	shlq	$0x5, %r13
00000000003fbeac	movq	%r13, %rdi
00000000003fbeaf	callq	0x6dfca2                        ## symbol stub for: __Znwm
00000000003fbeb4	leaq	(%rax,%r15), %rbx
00000000003fbeb8	addq	%rax, %r13
00000000003fbebb	movaps	-0x50(%rbp), %xmm0
00000000003fbebf	movaps	%xmm0, (%rax,%r15)
00000000003fbec4	movaps	0x30af25(%rip), %xmm0
00000000003fbecb	movaps	%xmm0, 0x10(%rax,%r15)
00000000003fbed1	leaq	(%rax,%r15), %r12
00000000003fbed5	addq	$0x20, %r12
00000000003fbed9	shlq	$0x5, %r14
00000000003fbedd	subq	%r14, %rbx
00000000003fbee0	movq	%rbx, %rdi
00000000003fbee3	movq	-0x38(%rbp), %r14
00000000003fbee7	movq	%r14, %rsi
00000000003fbeea	movq	%r15, %rdx
00000000003fbeed	callq	0x6dff8a                        ## symbol stub for: _memcpy
00000000003fbef2	movq	-0x58(%rbp), %rax
00000000003fbef6	movq	%rbx, (%rax)
00000000003fbef9	movq	%rax, %rbx
00000000003fbefc	movq	%r12, 0x8(%rax)
00000000003fbf00	movq	%r13, 0x10(%rax)
00000000003fbf04	testq	%r14, %r14
00000000003fbf07	je	0x3fbf11
00000000003fbf09	movq	%r14, %rdi
00000000003fbf0c	callq	0x6dfc36                        ## symbol stub for: __ZdlPv
00000000003fbf11	movl	-0x2c(%rbp), %r14d
00000000003fbf15	movaps	-0x50(%rbp), %xmm3
00000000003fbf19	movq	%r12, 0x8(%rbx)
00000000003fbf1d	movss	-0x3c(%rbp), %xmm0
00000000003fbf22	addss	-0x5c(%rbp), %xmm0
00000000003fbf27	movss	%xmm0, -0x3c(%rbp)
00000000003fbf2c	jmp	0x3fbabc
00000000003fbf31	addq	$0x88, %rsp
00000000003fbf38	popq	%rbx
00000000003fbf39	popq	%r12
00000000003fbf3b	popq	%r13
00000000003fbf3d	popq	%r14
00000000003fbf3f	popq	%r15
00000000003fbf41	popq	%rbp
00000000003fbf42	retq
00000000003fbf43	callq	__ZNSt3__16vectorI29OZVelocityViewTrackballVertexNS_9allocatorIS1_EEE20__throw_length_errorB9nqe210106Ev ## std::__1::vector<OZVelocityViewTrackballVertex, std::__1::allocator<OZVelocityViewTrackballVertex>>::__throw_length_error[abi:nqe210106]()
00000000003fbf48	callq	__ZSt28__throw_bad_array_new_lengthB9nqe210106v ## std::__throw_bad_array_new_length[abi:nqe210106]()
00000000003fbf4d	nopl	(%rax)
