__ZN8OZSpline12getUForValueEdRNSt3__16vectorI6CMTimeNS0_9allocatorIS2_EEEER11PCTimeRangeRS2_j:
000000000003d134	pushq	%rbp
000000000003d135	movq	%rsp, %rbp
000000000003d138	pushq	%r15
000000000003d13a	pushq	%r14
000000000003d13c	pushq	%r13
000000000003d13e	pushq	%r12
000000000003d140	pushq	%rbx
000000000003d141	subq	$0x118, %rsp                    ## imm = 0x118
000000000003d148	movl	%r8d, -0x8c(%rbp)
000000000003d14f	movq	%rcx, -0x108(%rbp)
000000000003d156	movq	%rdx, %r12
000000000003d159	movq	%rsi, %r14
000000000003d15c	movsd	%xmm0, -0x110(%rbp)
000000000003d164	movq	%rdi, %rbx
000000000003d167	movq	0xa0(%rdi), %rax
000000000003d16e	testq	%rax, %rax
000000000003d171	je	0x3d17c
000000000003d173	movq	0x30(%rax), %rdi
000000000003d177	testq	%rdi, %rdi
000000000003d17a	jne	0x3d180
000000000003d17c	leaq	0x8(%rbx), %rdi
000000000003d180	callq	0xacb16                         ## symbol stub for: __ZN10PCSpinLock4lockEv
000000000003d185	movq	0x10(%r12), %rax
000000000003d18a	movq	%rax, -0x30(%rbp)
000000000003d18e	movups	(%r12), %xmm0
000000000003d193	movaps	%xmm0, -0x40(%rbp)
000000000003d197	movq	0x10(%r12), %rax
000000000003d19c	leaq	-0x100(%rbp), %r15
000000000003d1a3	movq	%rax, 0x10(%r15)
000000000003d1a7	movups	(%r12), %xmm0
000000000003d1ac	movaps	%xmm0, (%r15)
000000000003d1b0	movq	0x28(%r12), %rax
000000000003d1b5	leaq	-0xb0(%rbp), %r13
000000000003d1bc	movq	%rax, 0x10(%r13)
000000000003d1c0	movups	0x18(%r12), %xmm0
000000000003d1c6	movaps	%xmm0, (%r13)
000000000003d1cb	movq	0x10(%r13), %rax
000000000003d1cf	movq	%rax, 0x28(%rsp)
000000000003d1d4	movaps	(%r13), %xmm0
000000000003d1d9	movups	%xmm0, 0x18(%rsp)
000000000003d1de	movq	0x10(%r15), %rax
000000000003d1e2	movq	%rax, 0x10(%rsp)
000000000003d1e7	movaps	(%r15), %xmm0
000000000003d1eb	movups	%xmm0, (%rsp)
000000000003d1ef	leaq	-0x80(%rbp), %r12
000000000003d1f3	movq	%r12, %rdi
000000000003d1f6	callq	0xacad4                         ## symbol stub for: _PC_CMTimeSaferAdd
000000000003d1fb	movq	-0x108(%rbp), %rcx
000000000003d202	movq	0x10(%rcx), %rax
000000000003d206	movq	%rax, 0x10(%r15)
000000000003d20a	movups	(%rcx), %xmm0
000000000003d20d	movaps	%xmm0, (%r15)
000000000003d211	movq	0x10(%r15), %rax
000000000003d215	movq	%rax, 0x28(%rsp)
000000000003d21a	movaps	(%r15), %xmm0
000000000003d21e	movups	%xmm0, 0x18(%rsp)
000000000003d223	movq	0x10(%r12), %rax
000000000003d228	movq	%rax, 0x10(%rsp)
000000000003d22d	movups	(%r12), %xmm0
000000000003d232	movups	%xmm0, (%rsp)
000000000003d236	leaq	-0x60(%rbp), %rdi
000000000003d23a	callq	0xacada                         ## symbol stub for: _PC_CMTimeSaferSubtract
000000000003d23f	movq	0x8d27a(%rip), %r12             ## literal pool symbol address: _kCMTimeZero
000000000003d246	movq	%r15, %rdi
000000000003d249	movq	%rbx, %rsi
000000000003d24c	movq	%r12, %rdx
000000000003d24f	xorl	%ecx, %ecx
000000000003d251	callq	__ZN8OZSpline12getMinValueUERK6CMTimeb ## OZSpline::getMinValueU(CMTime const&, bool)
000000000003d256	movq	%r13, %rdi
000000000003d259	movq	%rbx, %rsi
000000000003d25c	movq	%r12, %rdx
000000000003d25f	xorl	%ecx, %ecx
000000000003d261	callq	__ZN8OZSpline12getMaxValueUERK6CMTimeb ## OZSpline::getMaxValueU(CMTime const&, bool)
000000000003d266	movq	0x10(%r15), %rax
000000000003d26a	movq	%rax, 0x28(%rsp)
000000000003d26f	movups	(%r15), %xmm0
000000000003d273	movups	%xmm0, 0x18(%rsp)
000000000003d278	movq	-0x30(%rbp), %rax
000000000003d27c	movq	%rax, 0x10(%rsp)
000000000003d281	movaps	-0x40(%rbp), %xmm0
000000000003d285	movups	%xmm0, (%rsp)
000000000003d289	callq	0xaca80                         ## symbol stub for: _CMTimeCompare
000000000003d28e	testl	%eax, %eax
000000000003d290	jns	0x3d2a8
000000000003d292	movq	-0xf0(%rbp), %rax
000000000003d299	movq	%rax, -0x30(%rbp)
000000000003d29d	movups	-0x100(%rbp), %xmm0
000000000003d2a4	movaps	%xmm0, -0x40(%rbp)
000000000003d2a8	movq	-0xa0(%rbp), %rax
000000000003d2af	movq	%rax, 0x28(%rsp)
000000000003d2b4	movups	-0xb0(%rbp), %xmm0
000000000003d2bb	movups	%xmm0, 0x18(%rsp)
000000000003d2c0	movq	-0x30(%rbp), %rax
000000000003d2c4	movq	%rax, 0x10(%rsp)
000000000003d2c9	movaps	-0x40(%rbp), %xmm0
000000000003d2cd	movups	%xmm0, (%rsp)
000000000003d2d1	callq	0xaca80                         ## symbol stub for: _CMTimeCompare
000000000003d2d6	testl	%eax, %eax
000000000003d2d8	jle	0x3d2f0
000000000003d2da	movq	-0xa0(%rbp), %rax
000000000003d2e1	movq	%rax, -0x30(%rbp)
000000000003d2e5	movups	-0xb0(%rbp), %xmm0
000000000003d2ec	movaps	%xmm0, -0x40(%rbp)
000000000003d2f0	movq	-0xa0(%rbp), %rax
000000000003d2f7	movq	%rax, 0x28(%rsp)
000000000003d2fc	movups	-0xb0(%rbp), %xmm0
000000000003d303	movups	%xmm0, 0x18(%rsp)
000000000003d308	movq	-0x50(%rbp), %rax
000000000003d30c	movq	%rax, 0x10(%rsp)
000000000003d311	movups	-0x60(%rbp), %xmm0
000000000003d315	movups	%xmm0, (%rsp)
000000000003d319	callq	0xaca80                         ## symbol stub for: _CMTimeCompare
000000000003d31e	testl	%eax, %eax
000000000003d320	jle	0x3d338
000000000003d322	movq	-0xa0(%rbp), %rax
000000000003d329	movq	%rax, -0x50(%rbp)
000000000003d32d	movups	-0xb0(%rbp), %xmm0
000000000003d334	movaps	%xmm0, -0x60(%rbp)
000000000003d338	movq	-0xf0(%rbp), %rax
000000000003d33f	movq	%rax, 0x28(%rsp)
000000000003d344	movups	-0x100(%rbp), %xmm0
000000000003d34b	movups	%xmm0, 0x18(%rsp)
000000000003d350	movq	-0x50(%rbp), %rax
000000000003d354	movq	%rax, 0x10(%rsp)
000000000003d359	movaps	-0x60(%rbp), %xmm0
000000000003d35d	movups	%xmm0, (%rsp)
000000000003d361	callq	0xaca80                         ## symbol stub for: _CMTimeCompare
000000000003d366	testl	%eax, %eax
000000000003d368	jns	0x3d380
000000000003d36a	movq	-0xf0(%rbp), %rax
000000000003d371	movq	%rax, -0x50(%rbp)
000000000003d375	movups	-0x100(%rbp), %xmm0
000000000003d37c	movaps	%xmm0, -0x60(%rbp)
000000000003d380	xorl	%eax, %eax
000000000003d382	leaq	-0xc0(%rbp), %rdx
000000000003d389	movq	%rax, (%rdx)
000000000003d38c	movq	%rax, -0x88(%rbp)
000000000003d393	leaq	-0x40(%rbp), %rsi
000000000003d397	movq	%rbx, %rdi
000000000003d39a	xorl	%ecx, %ecx
000000000003d39c	callq	__ZN8OZSpline15getVertexHandleERK6CMTimePPvb ## OZSpline::getVertexHandle(CMTime const&, void**, bool)
000000000003d3a1	testb	%al, %al
000000000003d3a3	jne	0x3d3c2
000000000003d3a5	movq	0x8d114(%rip), %rcx             ## literal pool symbol address: _kCMTimeZero
000000000003d3ac	leaq	-0x40(%rbp), %rsi
000000000003d3b0	leaq	-0xc0(%rbp), %rdx
000000000003d3b7	movq	%rbx, %rdi
000000000003d3ba	xorl	%r8d, %r8d
000000000003d3bd	callq	__ZN8OZSpline22getPreviousValidVertexERK6CMTimePPvS2_b ## OZSpline::getPreviousValidVertex(CMTime const&, void**, CMTime const&, bool)
000000000003d3c2	leaq	-0x60(%rbp), %rsi
000000000003d3c6	leaq	-0x88(%rbp), %rdx
000000000003d3cd	movq	%rbx, %rdi
000000000003d3d0	xorl	%ecx, %ecx
000000000003d3d2	callq	__ZN8OZSpline15getVertexHandleERK6CMTimePPvb ## OZSpline::getVertexHandle(CMTime const&, void**, bool)
000000000003d3d7	testb	%al, %al
000000000003d3d9	jne	0x3d3f8
000000000003d3db	movq	0x8d0de(%rip), %rcx             ## literal pool symbol address: _kCMTimeZero
000000000003d3e2	leaq	-0x60(%rbp), %rsi
000000000003d3e6	leaq	-0x88(%rbp), %rdx
000000000003d3ed	movq	%rbx, %rdi
000000000003d3f0	xorl	%r8d, %r8d
000000000003d3f3	callq	__ZN8OZSpline18getNextValidVertexERK6CMTimePPvS2_b ## OZSpline::getNextValidVertex(CMTime const&, void**, CMTime const&, bool)
000000000003d3f8	movq	-0xc0(%rbp), %r13
000000000003d3ff	movq	-0x88(%rbp), %r12
000000000003d406	cmpq	%r12, %r13
000000000003d409	je	0x3d58b
000000000003d40f	movq	%r13, %r15
000000000003d412	movq	$0x0, -0xb8(%rbp)
000000000003d41d	movq	%rbx, %rdi
000000000003d420	movq	%r13, %rsi
000000000003d423	leaq	-0xb8(%rbp), %rdx
000000000003d42a	movq	0x8d08f(%rip), %rcx             ## literal pool symbol address: _kCMTimeZero
000000000003d431	callq	__ZN8OZSpline18getNextValidVertexEPvPS0_RK6CMTime ## OZSpline::getNextValidVertex(void*, void**, CMTime const&)
000000000003d436	movq	0x20(%r13), %rax
000000000003d43a	movq	%rax, -0x70(%rbp)
000000000003d43e	movups	0x10(%r13), %xmm0
000000000003d443	movaps	%xmm0, -0x80(%rbp)
000000000003d447	movq	-0xb8(%rbp), %r13
000000000003d44e	movups	0x10(%r13), %xmm0
000000000003d453	movaps	%xmm0, -0xe0(%rbp)
000000000003d45a	movq	0x20(%r13), %rax
000000000003d45e	movq	%rax, -0xd0(%rbp)
000000000003d465	movq	0x20(%r13), %rax
000000000003d469	movq	%rax, 0x28(%rsp)
000000000003d46e	movups	0x10(%r13), %xmm0
000000000003d473	movups	%xmm0, 0x18(%rsp)
000000000003d478	movq	-0x30(%rbp), %rax
000000000003d47c	movq	%rax, 0x10(%rsp)
000000000003d481	movaps	-0x40(%rbp), %xmm0
000000000003d485	movups	%xmm0, (%rsp)
000000000003d489	callq	0xaca80                         ## symbol stub for: _CMTimeCompare
000000000003d48e	testl	%eax, %eax
000000000003d490	jns	0x3d4ce
000000000003d492	movq	-0x70(%rbp), %rax
000000000003d496	movq	%rax, 0x28(%rsp)
000000000003d49b	movaps	-0x80(%rbp), %xmm0
000000000003d49f	movups	%xmm0, 0x18(%rsp)
000000000003d4a4	movq	-0x30(%rbp), %rax
000000000003d4a8	movq	%rax, 0x10(%rsp)
000000000003d4ad	movaps	-0x40(%rbp), %xmm0
000000000003d4b1	movups	%xmm0, (%rsp)
000000000003d4b5	callq	0xaca80                         ## symbol stub for: _CMTimeCompare
000000000003d4ba	testl	%eax, %eax
000000000003d4bc	jle	0x3d4ce
000000000003d4be	movq	-0x30(%rbp), %rax
000000000003d4c2	movq	%rax, -0x70(%rbp)
000000000003d4c6	movaps	-0x40(%rbp), %xmm0
000000000003d4ca	movaps	%xmm0, -0x80(%rbp)
000000000003d4ce	movq	-0xd0(%rbp), %rax
000000000003d4d5	movq	%rax, 0x28(%rsp)
000000000003d4da	movaps	-0xe0(%rbp), %xmm0
000000000003d4e1	movups	%xmm0, 0x18(%rsp)
000000000003d4e6	movq	-0x50(%rbp), %rax
000000000003d4ea	movq	%rax, 0x10(%rsp)
000000000003d4ef	movaps	-0x60(%rbp), %xmm0
000000000003d4f3	movups	%xmm0, (%rsp)
000000000003d4f7	callq	0xaca80                         ## symbol stub for: _CMTimeCompare
000000000003d4fc	testl	%eax, %eax
000000000003d4fe	jns	0x3d542
000000000003d500	movq	-0x70(%rbp), %rax
000000000003d504	movq	%rax, 0x28(%rsp)
000000000003d509	movaps	-0x80(%rbp), %xmm0
000000000003d50d	movups	%xmm0, 0x18(%rsp)
000000000003d512	movq	-0x50(%rbp), %rax
000000000003d516	movq	%rax, 0x10(%rsp)
000000000003d51b	movaps	-0x60(%rbp), %xmm0
000000000003d51f	movups	%xmm0, (%rsp)
000000000003d523	callq	0xaca80                         ## symbol stub for: _CMTimeCompare
000000000003d528	testl	%eax, %eax
000000000003d52a	jle	0x3d542
000000000003d52c	movq	-0x50(%rbp), %rax
000000000003d530	movq	%rax, -0xd0(%rbp)
000000000003d537	movaps	-0x60(%rbp), %xmm0
000000000003d53b	movaps	%xmm0, -0xe0(%rbp)
000000000003d542	movq	(%r15), %rax
000000000003d545	movq	%r15, %rdi
000000000003d548	callq	*0xd0(%rax)
000000000003d54e	movq	0x98(%rbx), %rdi
000000000003d555	movl	%eax, %esi
000000000003d557	callq	__ZN15OZInterpolators15getInterpolatorEj ## OZInterpolators::getInterpolator(unsigned int)
000000000003d55c	movq	(%rax), %r10
000000000003d55f	movq	%r14, (%rsp)
000000000003d563	movq	%rax, %rdi
000000000003d566	movq	%rbx, %rsi
000000000003d569	movq	%r15, %rdx
000000000003d56c	movq	%r13, %rcx
000000000003d56f	leaq	-0x80(%rbp), %r8
000000000003d573	leaq	-0xe0(%rbp), %r9
000000000003d57a	movsd	-0x110(%rbp), %xmm0
000000000003d582	callq	*0x60(%r10)
000000000003d586	jmp	0x3d406
000000000003d58b	movq	(%r14), %rax
000000000003d58e	cmpl	$0x1, -0x8c(%rbp)
000000000003d595	jne	0x3d62d
000000000003d59b	xorps	%xmm0, %xmm0
000000000003d59e	leaq	-0x80(%rbp), %r15
000000000003d5a2	movaps	%xmm0, (%r15)
000000000003d5a6	movq	$0x0, 0x10(%r15)
000000000003d5ae	movq	0x8(%r14), %rcx
000000000003d5b2	subq	%rax, %rcx
000000000003d5b5	shrq	$0x3, %rcx
000000000003d5b9	imull	$0xaaaaaaab, %ecx, %r12d        ## imm = 0xAAAAAAAB
000000000003d5c0	decq	%r12
000000000003d5c3	testl	%r12d, %r12d
000000000003d5c6	js	0x3d5e8
000000000003d5c8	movl	%r12d, %eax
000000000003d5cb	andl	$0x7fffffff, %eax               ## imm = 0x7FFFFFFF
000000000003d5d0	leaq	(%rax,%rax,2), %rsi
000000000003d5d4	shlq	$0x3, %rsi
000000000003d5d8	addq	(%r14), %rsi
000000000003d5db	decq	%r12
000000000003d5de	movq	%r15, %rdi
000000000003d5e1	callq	__ZNSt3__16vectorI6CMTimeNS_9allocatorIS1_EEE9push_backB9nqe210106ERKS1_ ## std::__1::vector<CMTime, std::__1::allocator<CMTime>>::push_back[abi:nqe210106](CMTime const&)
000000000003d5e6	jmp	0x3d5c3
000000000003d5e8	movq	-0x80(%rbp), %rsi
000000000003d5ec	cmpq	%r15, %r14
000000000003d5ef	je	0x3d619
000000000003d5f1	movq	-0x78(%rbp), %rdx
000000000003d5f5	movq	%rdx, %rax
000000000003d5f8	subq	%rsi, %rax
000000000003d5fb	sarq	$0x3, %rax
000000000003d5ff	movabsq	$-0x5555555555555555, %rcx      ## imm = 0xAAAAAAAAAAAAAAAB
000000000003d609	imulq	%rax, %rcx
000000000003d60d	movq	%r14, %rdi
000000000003d610	callq	__ZNSt3__16vectorI6CMTimeNS_9allocatorIS1_EEE18__assign_with_sizeB9nqe210106IPS1_S6_EEvT_T0_l ## void std::__1::vector<CMTime, std::__1::allocator<CMTime>>::__assign_with_size[abi:nqe210106]<CMTime*, CMTime*>(CMTime*, CMTime*, long)
000000000003d615	movq	-0x80(%rbp), %rsi
000000000003d619	testq	%rsi, %rsi
000000000003d61c	je	0x3d62a
000000000003d61e	movq	%rsi, -0x78(%rbp)
000000000003d622	movq	%rsi, %rdi
000000000003d625	callq	0xace04                         ## symbol stub for: __ZdlPv
000000000003d62a	movq	(%r14), %rax
000000000003d62d	movq	0x8(%r14), %rcx
000000000003d631	movq	0xa0(%rbx), %rdx
000000000003d638	testq	%rdx, %rdx
000000000003d63b	je	0x3d646
000000000003d63d	movq	0x30(%rdx), %rdi
000000000003d641	testq	%rdi, %rdi
000000000003d644	jne	0x3d64d
000000000003d646	addq	$0x8, %rbx
000000000003d64a	movq	%rbx, %rdi
000000000003d64d	cmpq	%rcx, %rax
000000000003d650	setne	%bl
000000000003d653	callq	0xacb1c                         ## symbol stub for: __ZN10PCSpinLock6unlockEv
000000000003d658	movl	%ebx, %eax
000000000003d65a	addq	$0x118, %rsp                    ## imm = 0x118
000000000003d661	popq	%rbx
000000000003d662	popq	%r12
000000000003d664	popq	%r13
000000000003d666	popq	%r14
000000000003d668	popq	%r15
000000000003d66a	popq	%rbp
000000000003d66b	retq
000000000003d66c	jmp	0x3d66e
000000000003d66e	movq	%rax, %rbx
000000000003d671	movq	-0x80(%rbp), %rdi
000000000003d675	testq	%rdi, %rdi
000000000003d678	je	0x3d683
000000000003d67a	movq	%rdi, -0x78(%rbp)
000000000003d67e	callq	0xace04                         ## symbol stub for: __ZdlPv
000000000003d683	movq	%rbx, %rdi
000000000003d686	callq	0xacaf2                         ## symbol stub for: __Unwind_Resume
000000000003d68b	nop
