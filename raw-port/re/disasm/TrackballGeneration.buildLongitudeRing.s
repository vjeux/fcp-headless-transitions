__ZN19TrackballGeneration18buildLongitudeRingEDv3_ffifRNSt3__16vectorI29OZVelocityViewTrackballVertexNS1_9allocatorIS3_EEEE:
00000000003fbf50	pushq	%rbp
00000000003fbf51	movq	%rsp, %rbp
00000000003fbf54	pushq	%r15
00000000003fbf56	pushq	%r14
00000000003fbf58	pushq	%r13
00000000003fbf5a	pushq	%r12
00000000003fbf5c	pushq	%rbx
00000000003fbf5d	subq	$0xc8, %rsp
00000000003fbf64	movq	%rsi, %rbx
00000000003fbf67	movl	%edi, %r14d
00000000003fbf6a	movaps	%xmm1, -0x40(%rbp)
00000000003fbf6e	movaps	%xmm0, -0xb0(%rbp)
00000000003fbf75	mulss	0x30afd7(%rip), %xmm2
00000000003fbf7d	movaps	%xmm2, %xmm0
00000000003fbf80	callq	0x6dfd32                        ## symbol stub for: ___sincosf_stret
00000000003fbf85	testl	%r14d, %r14d
00000000003fbf88	jle	0x3fc522
00000000003fbf8e	xorps	%xmm2, %xmm2
00000000003fbf91	cvtsi2sd	%r14d, %xmm2
00000000003fbf96	movsd	0x30ce22(%rip), %xmm1
00000000003fbf9e	divsd	%xmm2, %xmm1
00000000003fbfa2	cvtsd2ss	%xmm1, %xmm4
00000000003fbfa6	movaps	%xmm0, %xmm3
00000000003fbfa9	movaps	%xmm0, %xmm5
00000000003fbfac	shufps	$0x0, %xmm0, %xmm5              ## xmm5 = xmm5[0,0],xmm0[0,0]
00000000003fbfb0	mulps	0x30fb29(%rip), %xmm5
00000000003fbfb7	movaps	-0xb0(%rbp), %xmm0
00000000003fbfbe	movaps	-0x40(%rbp), %xmm8
00000000003fbfc3	addss	%xmm8, %xmm0
00000000003fbfc8	movaps	%xmm5, %xmm6
00000000003fbfcb	shufps	$0xd2, %xmm5, %xmm6             ## xmm6 = xmm6[2,0],xmm5[1,3]
00000000003fbfcf	movaps	%xmm0, %xmm1
00000000003fbfd2	mulps	%xmm6, %xmm1
00000000003fbfd5	movaps	%xmm0, %xmm2
00000000003fbfd8	shufps	$0xd2, %xmm0, %xmm2             ## xmm2 = xmm2[2,0],xmm0[1,3]
00000000003fbfdc	mulps	%xmm5, %xmm2
00000000003fbfdf	subps	%xmm2, %xmm1
00000000003fbfe2	addps	%xmm1, %xmm1
00000000003fbfe5	movaps	%xmm1, %xmm7
00000000003fbfe8	shufps	$0xd2, %xmm1, %xmm7             ## xmm7 = xmm7[2,0],xmm1[1,3]
00000000003fbfec	shufps	$0x55, %xmm3, %xmm3             ## xmm3 = xmm3[1,1,1,1]
00000000003fbff0	movaps	%xmm3, -0xf0(%rbp)
00000000003fbff7	movaps	%xmm3, %xmm2
00000000003fbffa	mulps	%xmm7, %xmm2
00000000003fbffd	addps	%xmm0, %xmm2
00000000003fc000	movaps	%xmm6, -0xd0(%rbp)
00000000003fc007	mulps	%xmm6, %xmm7
00000000003fc00a	shufps	$0xc9, %xmm1, %xmm1             ## xmm1 = xmm1[1,2,0,3]
00000000003fc00e	movaps	%xmm5, -0xe0(%rbp)
00000000003fc015	mulps	%xmm5, %xmm1
00000000003fc018	subps	%xmm1, %xmm7
00000000003fc01b	shufps	$0xd2, %xmm7, %xmm7             ## xmm7 = xmm7[2,0,1,3]
00000000003fc01f	addps	%xmm2, %xmm7
00000000003fc022	movl	%r14d, %eax
00000000003fc025	addl	%r14d, %eax
00000000003fc028	leal	-0x1(,%r14,2), %ecx
00000000003fc030	movl	%ecx, -0x54(%rbp)
00000000003fc033	cmpl	$0x2, %eax
00000000003fc036	movl	$0x1, %ecx
00000000003fc03b	cmovgel	%eax, %ecx
00000000003fc03e	movl	%ecx, -0x50(%rbp)
00000000003fc041	movsldup	%xmm8, %xmm0                    ## xmm0 = xmm8[0,0,2,2]
00000000003fc046	movaps	%xmm0, -0xc0(%rbp)
00000000003fc04d	xorl	%r12d, %r12d
00000000003fc050	movss	%xmm4, -0x4c(%rbp)
00000000003fc055	movss	%xmm4, -0x30(%rbp)
00000000003fc05a	movaps	%xmm7, -0xa0(%rbp)
00000000003fc061	movq	%rbx, -0x48(%rbp)
00000000003fc065	jmp	0x3fc09c
00000000003fc067	nopw	(%rax,%rax)
00000000003fc070	movaps	-0xa0(%rbp), %xmm0
00000000003fc077	movaps	%xmm0, (%r14)
00000000003fc07b	movaps	0x30ad6e(%rip), %xmm0
00000000003fc082	movaps	%xmm0, 0x10(%r14)
00000000003fc087	addq	$0x20, %r14
00000000003fc08b	movq	%r14, 0x8(%rbx)
00000000003fc08f	incl	%r12d
00000000003fc092	cmpl	%r12d, -0x50(%rbp)
00000000003fc096	je	0x3fc522
00000000003fc09c	cmpl	%r12d, -0x54(%rbp)
00000000003fc0a0	movl	%r12d, -0x2c(%rbp)
00000000003fc0a4	movaps	%xmm7, -0x40(%rbp)
00000000003fc0a8	jne	0x3fc0e0
00000000003fc0aa	movq	0x8(%rbx), %r15
00000000003fc0ae	movq	0x10(%rbx), %rax
00000000003fc0b2	cmpq	%rax, %r15
00000000003fc0b5	jae	0x3fc130
00000000003fc0b7	movaps	%xmm7, (%r15)
00000000003fc0bb	movaps	0x30ad2e(%rip), %xmm0
00000000003fc0c2	movaps	%xmm0, 0x10(%r15)
00000000003fc0c7	addq	$0x20, %r15
00000000003fc0cb	movq	%r15, %r14
00000000003fc0ce	movq	%r14, 0x8(%rbx)
00000000003fc0d2	movq	0x10(%rbx), %rax
00000000003fc0d6	cmpq	%rax, %r14
00000000003fc0d9	jb	0x3fc070
00000000003fc0db	jmp	0x3fc206
00000000003fc0e0	movss	-0x30(%rbp), %xmm0
00000000003fc0e5	cvtss2sd	%xmm0, %xmm0
00000000003fc0e9	callq	0x6dfd2c                        ## symbol stub for: ___sincos_stret
00000000003fc0ee	movaps	%xmm0, %xmm2
00000000003fc0f1	movq	0x8(%rbx), %r15
00000000003fc0f5	movq	0x10(%rbx), %rax
00000000003fc0f9	cmpq	%rax, %r15
00000000003fc0fc	jae	0x3fc2d0
00000000003fc102	movaps	-0x40(%rbp), %xmm0
00000000003fc106	movaps	%xmm0, (%r15)
00000000003fc10a	movaps	0x30acdf(%rip), %xmm0
00000000003fc111	movaps	%xmm0, 0x10(%r15)
00000000003fc116	addq	$0x20, %r15
00000000003fc11a	movq	%r15, %r14
00000000003fc11d	jmp	0x3fc3a7
00000000003fc122	nopw	%cs:(%rax,%rax)
00000000003fc130	movq	(%rbx), %rsi
00000000003fc133	subq	%rsi, %r15
00000000003fc136	movq	%r15, %r12
00000000003fc139	sarq	$0x5, %r12
00000000003fc13d	leaq	0x1(%r12), %rcx
00000000003fc142	movabsq	$0x7ffffffffffffff, %rdx        ## imm = 0x7FFFFFFFFFFFFFF
00000000003fc14c	cmpq	%rdx, %rcx
00000000003fc14f	ja	0x3fc534
00000000003fc155	movq	%rsi, -0x70(%rbp)
00000000003fc159	subq	%rsi, %rax
00000000003fc15c	movq	%rax, %r13
00000000003fc15f	sarq	$0x4, %r13
00000000003fc163	cmpq	%rcx, %r13
00000000003fc166	cmovbeq	%rcx, %r13
00000000003fc16a	movabsq	$0x7fffffffffffffe0, %rcx       ## imm = 0x7FFFFFFFFFFFFFE0
00000000003fc174	cmpq	%rcx, %rax
00000000003fc177	cmovaeq	%rdx, %r13
00000000003fc17b	cmpq	%rdx, %r13
00000000003fc17e	ja	0x3fc539
00000000003fc184	shlq	$0x5, %r13
00000000003fc188	movq	%r13, %rdi
00000000003fc18b	callq	0x6dfca2                        ## symbol stub for: __Znwm
00000000003fc190	leaq	(%rax,%r15), %rbx
00000000003fc194	addq	%rax, %r13
00000000003fc197	movaps	-0x40(%rbp), %xmm0
00000000003fc19b	movaps	%xmm0, (%rax,%r15)
00000000003fc1a0	movaps	0x30ac49(%rip), %xmm0
00000000003fc1a7	movaps	%xmm0, 0x10(%rax,%r15)
00000000003fc1ad	leaq	(%rax,%r15), %r14
00000000003fc1b1	addq	$0x20, %r14
00000000003fc1b5	shlq	$0x5, %r12
00000000003fc1b9	subq	%r12, %rbx
00000000003fc1bc	movq	%rbx, %rdi
00000000003fc1bf	movq	-0x70(%rbp), %r12
00000000003fc1c3	movq	%r12, %rsi
00000000003fc1c6	movq	%r15, %rdx
00000000003fc1c9	callq	0x6dff8a                        ## symbol stub for: _memcpy
00000000003fc1ce	movq	-0x48(%rbp), %rax
00000000003fc1d2	movq	%rbx, (%rax)
00000000003fc1d5	movq	%rax, %rbx
00000000003fc1d8	movq	%r14, 0x8(%rax)
00000000003fc1dc	movq	%r13, 0x10(%rax)
00000000003fc1e0	testq	%r12, %r12
00000000003fc1e3	je	0x3fc1ed
00000000003fc1e5	movq	%r12, %rdi
00000000003fc1e8	callq	0x6dfc36                        ## symbol stub for: __ZdlPv
00000000003fc1ed	movl	-0x2c(%rbp), %r12d
00000000003fc1f1	movaps	-0x40(%rbp), %xmm7
00000000003fc1f5	movq	%r14, 0x8(%rbx)
00000000003fc1f9	movq	0x10(%rbx), %rax
00000000003fc1fd	cmpq	%rax, %r14
00000000003fc200	jb	0x3fc070
00000000003fc206	movq	(%rbx), %r15
00000000003fc209	subq	%r15, %r14
00000000003fc20c	movq	%r14, %r13
00000000003fc20f	sarq	$0x5, %r13
00000000003fc213	leaq	0x1(%r13), %rcx
00000000003fc217	movabsq	$0x7ffffffffffffff, %rdx        ## imm = 0x7FFFFFFFFFFFFFF
00000000003fc221	cmpq	%rdx, %rcx
00000000003fc224	ja	0x3fc534
00000000003fc22a	subq	%r15, %rax
00000000003fc22d	movq	%rax, %r12
00000000003fc230	sarq	$0x4, %r12
00000000003fc234	cmpq	%rcx, %r12
00000000003fc237	cmovbeq	%rcx, %r12
00000000003fc23b	movabsq	$0x7fffffffffffffe0, %rcx       ## imm = 0x7FFFFFFFFFFFFFE0
00000000003fc245	cmpq	%rcx, %rax
00000000003fc248	cmovaeq	%rdx, %r12
00000000003fc24c	cmpq	%rdx, %r12
00000000003fc24f	ja	0x3fc539
00000000003fc255	shlq	$0x5, %r12
00000000003fc259	movq	%r12, %rdi
00000000003fc25c	callq	0x6dfca2                        ## symbol stub for: __Znwm
00000000003fc261	leaq	(%rax,%r14), %rbx
00000000003fc265	addq	%rax, %r12
00000000003fc268	movaps	-0xa0(%rbp), %xmm0
00000000003fc26f	movaps	%xmm0, (%rax,%r14)
00000000003fc274	movaps	0x30ab75(%rip), %xmm0
00000000003fc27b	movaps	%xmm0, 0x10(%rax,%r14)
00000000003fc281	addq	%r14, %rax
00000000003fc284	addq	$0x20, %rax
00000000003fc288	shlq	$0x5, %r13
00000000003fc28c	subq	%r13, %rbx
00000000003fc28f	movq	%rbx, %rdi
00000000003fc292	movq	%r15, %rsi
00000000003fc295	movq	%r14, %rdx
00000000003fc298	movq	%rax, %r14
00000000003fc29b	callq	0x6dff8a                        ## symbol stub for: _memcpy
00000000003fc2a0	movq	-0x48(%rbp), %rax
00000000003fc2a4	movq	%rbx, (%rax)
00000000003fc2a7	movq	%rax, %rbx
00000000003fc2aa	movq	%r14, 0x8(%rax)
00000000003fc2ae	movq	%r12, 0x10(%rax)
00000000003fc2b2	testq	%r15, %r15
00000000003fc2b5	je	0x3fc2bf
00000000003fc2b7	movq	%r15, %rdi
00000000003fc2ba	callq	0x6dfc36                        ## symbol stub for: __ZdlPv
00000000003fc2bf	movl	-0x2c(%rbp), %r12d
00000000003fc2c3	movaps	-0x40(%rbp), %xmm7
00000000003fc2c7	jmp	0x3fc08b
00000000003fc2cc	nopl	(%rax)
00000000003fc2d0	movq	(%rbx), %rsi
00000000003fc2d3	subq	%rsi, %r15
00000000003fc2d6	movq	%r15, %r12
00000000003fc2d9	sarq	$0x5, %r12
00000000003fc2dd	leaq	0x1(%r12), %rcx
00000000003fc2e2	movabsq	$0x7ffffffffffffff, %rdx        ## imm = 0x7FFFFFFFFFFFFFF
00000000003fc2ec	cmpq	%rdx, %rcx
00000000003fc2ef	ja	0x3fc534
00000000003fc2f5	movaps	%xmm1, -0x90(%rbp)
00000000003fc2fc	movaps	%xmm2, -0x70(%rbp)
00000000003fc300	movq	%rsi, -0x78(%rbp)
00000000003fc304	subq	%rsi, %rax
00000000003fc307	movq	%rax, %r13
00000000003fc30a	sarq	$0x4, %r13
00000000003fc30e	cmpq	%rcx, %r13
00000000003fc311	cmovbeq	%rcx, %r13
00000000003fc315	movabsq	$0x7fffffffffffffe0, %rcx       ## imm = 0x7FFFFFFFFFFFFFE0
00000000003fc31f	cmpq	%rcx, %rax
00000000003fc322	cmovaeq	%rdx, %r13
00000000003fc326	cmpq	%rdx, %r13
00000000003fc329	ja	0x3fc539
00000000003fc32f	shlq	$0x5, %r13
00000000003fc333	movq	%r13, %rdi
00000000003fc336	callq	0x6dfca2                        ## symbol stub for: __Znwm
00000000003fc33b	leaq	(%rax,%r15), %rbx
00000000003fc33f	addq	%rax, %r13
00000000003fc342	movaps	-0x40(%rbp), %xmm0
00000000003fc346	movaps	%xmm0, (%rax,%r15)
00000000003fc34b	movaps	0x30aa9e(%rip), %xmm0
00000000003fc352	movaps	%xmm0, 0x10(%rax,%r15)
00000000003fc358	leaq	(%rax,%r15), %r14
00000000003fc35c	addq	$0x20, %r14
00000000003fc360	shlq	$0x5, %r12
00000000003fc364	subq	%r12, %rbx
00000000003fc367	movq	%rbx, %rdi
00000000003fc36a	movq	-0x78(%rbp), %r12
00000000003fc36e	movq	%r12, %rsi
00000000003fc371	movq	%r15, %rdx
00000000003fc374	callq	0x6dff8a                        ## symbol stub for: _memcpy
00000000003fc379	movq	-0x48(%rbp), %rax
00000000003fc37d	movq	%rbx, (%rax)
00000000003fc380	movq	%rax, %rbx
00000000003fc383	movq	%r14, 0x8(%rax)
00000000003fc387	movq	%r13, 0x10(%rax)
00000000003fc38b	testq	%r12, %r12
00000000003fc38e	je	0x3fc398
00000000003fc390	movq	%r12, %rdi
00000000003fc393	callq	0x6dfc36                        ## symbol stub for: __ZdlPv
00000000003fc398	movl	-0x2c(%rbp), %r12d
00000000003fc39c	movaps	-0x70(%rbp), %xmm2
00000000003fc3a0	movaps	-0x90(%rbp), %xmm1
00000000003fc3a7	movlhps	%xmm2, %xmm1                    ## xmm1 = xmm1[0],xmm2[0]
00000000003fc3aa	cvtpd2ps	%xmm1, %xmm0
00000000003fc3ae	mulps	-0xc0(%rbp), %xmm0
00000000003fc3b5	movaps	-0xb0(%rbp), %xmm1
00000000003fc3bc	addps	%xmm1, %xmm0
00000000003fc3bf	blendps	$0xc, %xmm1, %xmm0              ## xmm0 = xmm0[0,1],xmm1[2,3]
00000000003fc3c5	movaps	-0xd0(%rbp), %xmm4
00000000003fc3cc	movaps	%xmm4, %xmm1
00000000003fc3cf	mulps	%xmm0, %xmm1
00000000003fc3d2	movaps	%xmm0, %xmm2
00000000003fc3d5	shufps	$0xd2, %xmm0, %xmm2             ## xmm2 = xmm2[2,0],xmm0[1,3]
00000000003fc3d9	movaps	-0xe0(%rbp), %xmm3
00000000003fc3e0	mulps	%xmm3, %xmm2
00000000003fc3e3	subps	%xmm2, %xmm1
00000000003fc3e6	addps	%xmm1, %xmm1
00000000003fc3e9	movaps	%xmm1, %xmm7
00000000003fc3ec	shufps	$0xd2, %xmm1, %xmm7             ## xmm7 = xmm7[2,0],xmm1[1,3]
00000000003fc3f0	movaps	-0xf0(%rbp), %xmm2
00000000003fc3f7	mulps	%xmm7, %xmm2
00000000003fc3fa	addps	%xmm0, %xmm2
00000000003fc3fd	mulps	%xmm4, %xmm7
00000000003fc400	shufps	$0xc9, %xmm1, %xmm1             ## xmm1 = xmm1[1,2,0,3]
00000000003fc404	mulps	%xmm3, %xmm1
00000000003fc407	subps	%xmm1, %xmm7
00000000003fc40a	shufps	$0xd2, %xmm7, %xmm7             ## xmm7 = xmm7[2,0,1,3]
00000000003fc40e	addps	%xmm2, %xmm7
00000000003fc411	movq	%r14, 0x8(%rbx)
00000000003fc415	movq	0x10(%rbx), %rax
00000000003fc419	cmpq	%rax, %r14
00000000003fc41c	jae	0x3fc440
00000000003fc41e	movaps	%xmm7, (%r14)
00000000003fc422	movaps	0x30a9c7(%rip), %xmm0
00000000003fc429	movaps	%xmm0, 0x10(%r14)
00000000003fc42e	addq	$0x20, %r14
00000000003fc432	jmp	0x3fc502
00000000003fc437	nopw	(%rax,%rax)
00000000003fc440	movq	(%rbx), %r15
00000000003fc443	subq	%r15, %r14
00000000003fc446	movq	%r14, %r13
00000000003fc449	sarq	$0x5, %r13
00000000003fc44d	leaq	0x1(%r13), %rcx
00000000003fc451	movabsq	$0x7ffffffffffffff, %rdx        ## imm = 0x7FFFFFFFFFFFFFF
00000000003fc45b	cmpq	%rdx, %rcx
00000000003fc45e	ja	0x3fc534
00000000003fc464	movaps	%xmm7, -0x40(%rbp)
00000000003fc468	subq	%r15, %rax
00000000003fc46b	movq	%rax, %r12
00000000003fc46e	sarq	$0x4, %r12
00000000003fc472	cmpq	%rcx, %r12
00000000003fc475	cmovbeq	%rcx, %r12
00000000003fc479	movabsq	$0x7fffffffffffffe0, %rcx       ## imm = 0x7FFFFFFFFFFFFFE0
00000000003fc483	cmpq	%rcx, %rax
00000000003fc486	cmovaeq	%rdx, %r12
00000000003fc48a	cmpq	%rdx, %r12
00000000003fc48d	ja	0x3fc539
00000000003fc493	shlq	$0x5, %r12
00000000003fc497	movq	%r12, %rdi
00000000003fc49a	callq	0x6dfca2                        ## symbol stub for: __Znwm
00000000003fc49f	leaq	(%rax,%r14), %rbx
00000000003fc4a3	addq	%rax, %r12
00000000003fc4a6	movaps	-0x40(%rbp), %xmm0
00000000003fc4aa	movaps	%xmm0, (%rax,%r14)
00000000003fc4af	movaps	0x30a93a(%rip), %xmm0
00000000003fc4b6	movaps	%xmm0, 0x10(%rax,%r14)
00000000003fc4bc	addq	%r14, %rax
00000000003fc4bf	addq	$0x20, %rax
00000000003fc4c3	shlq	$0x5, %r13
00000000003fc4c7	subq	%r13, %rbx
00000000003fc4ca	movq	%rbx, %rdi
00000000003fc4cd	movq	%r15, %rsi
00000000003fc4d0	movq	%r14, %rdx
00000000003fc4d3	movq	%rax, %r14
00000000003fc4d6	callq	0x6dff8a                        ## symbol stub for: _memcpy
00000000003fc4db	movq	-0x48(%rbp), %rax
00000000003fc4df	movq	%rbx, (%rax)
00000000003fc4e2	movq	%rax, %rbx
00000000003fc4e5	movq	%r14, 0x8(%rax)
00000000003fc4e9	movq	%r12, 0x10(%rax)
00000000003fc4ed	testq	%r15, %r15
00000000003fc4f0	je	0x3fc4fa
00000000003fc4f2	movq	%r15, %rdi
00000000003fc4f5	callq	0x6dfc36                        ## symbol stub for: __ZdlPv
00000000003fc4fa	movl	-0x2c(%rbp), %r12d
00000000003fc4fe	movaps	-0x40(%rbp), %xmm7
00000000003fc502	movq	%r14, 0x8(%rbx)
00000000003fc506	movss	-0x30(%rbp), %xmm0
00000000003fc50b	addss	-0x4c(%rbp), %xmm0
00000000003fc510	movss	%xmm0, -0x30(%rbp)
00000000003fc515	incl	%r12d
00000000003fc518	cmpl	%r12d, -0x50(%rbp)
00000000003fc51c	jne	0x3fc09c
00000000003fc522	addq	$0xc8, %rsp
00000000003fc529	popq	%rbx
00000000003fc52a	popq	%r12
00000000003fc52c	popq	%r13
00000000003fc52e	popq	%r14
00000000003fc530	popq	%r15
00000000003fc532	popq	%rbp
00000000003fc533	retq
00000000003fc534	callq	__ZNSt3__16vectorI29OZVelocityViewTrackballVertexNS_9allocatorIS1_EEE20__throw_length_errorB9nqe210106Ev ## std::__1::vector<OZVelocityViewTrackballVertex, std::__1::allocator<OZVelocityViewTrackballVertex>>::__throw_length_error[abi:nqe210106]()
00000000003fc539	callq	__ZSt28__throw_bad_array_new_lengthB9nqe210106v ## std::__throw_bad_array_new_length[abi:nqe210106]()
00000000003fc53e	nop
