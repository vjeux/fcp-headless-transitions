__ZN15ArrowGeneration10createRingEff:
00000000003fc540	pushq	%rbp
00000000003fc541	movq	%rsp, %rbp
00000000003fc544	pushq	%r15
00000000003fc546	pushq	%r14
00000000003fc548	pushq	%r13
00000000003fc54a	pushq	%r12
00000000003fc54c	pushq	%rbx
00000000003fc54d	subq	$0x58, %rsp
00000000003fc551	movaps	%xmm1, -0x80(%rbp)
00000000003fc555	xorps	%xmm1, %xmm1
00000000003fc558	movups	%xmm1, (%rdi)
00000000003fc55b	movq	%rdi, -0x38(%rbp)
00000000003fc55f	movq	$0x0, 0x10(%rdi)
00000000003fc567	movsldup	%xmm0, %xmm0                    ## xmm0 = xmm0[0,0,2,2]
00000000003fc56b	movaps	%xmm0, -0x70(%rbp)
00000000003fc56f	xorl	%ebx, %ebx
00000000003fc571	xorl	%r12d, %r12d
00000000003fc574	xorl	%r15d, %r15d
00000000003fc577	xorl	%r13d, %r13d
00000000003fc57a	jmp	0x3fc59b
00000000003fc57c	nopl	(%rax)
00000000003fc580	movaps	%xmm2, (%r12)
00000000003fc585	movaps	%xmm1, 0x10(%r12)
00000000003fc58b	addq	$0x20, %r12
00000000003fc58f	addl	$0x2, %ebx
00000000003fc592	cmpl	$0x40, %ebx
00000000003fc595	je	0x3fc6a8
00000000003fc59b	xorps	%xmm0, %xmm0
00000000003fc59e	cvtsi2sd	%ebx, %xmm0
00000000003fc5a2	mulsd	0x30c816(%rip), %xmm0
00000000003fc5aa	mulsd	0x3109de(%rip), %xmm0
00000000003fc5b2	cvtsd2ss	%xmm0, %xmm0
00000000003fc5b6	callq	0x6dfd32                        ## symbol stub for: ___sincosf_stret
00000000003fc5bb	movaps	%xmm0, %xmm1
00000000003fc5be	movaps	%xmm0, %xmm2
00000000003fc5c1	shufps	$0xe1, %xmm0, %xmm2             ## xmm2 = xmm2[1,0],xmm0[2,3]
00000000003fc5c5	mulps	-0x70(%rbp), %xmm2
00000000003fc5c9	insertps	$0x20, -0x80(%rbp), %xmm2       ## xmm2 = xmm2[0,1],mem[0],xmm2[3]
00000000003fc5d0	xorps	%xmm0, %xmm0
00000000003fc5d3	shufps	$0x41, %xmm0, %xmm1             ## xmm1 = xmm1[1,0],xmm0[0,1]
00000000003fc5d7	cmpq	%r15, %r12
00000000003fc5da	jb	0x3fc580
00000000003fc5dc	movq	%r12, -0x30(%rbp)
00000000003fc5e0	subq	%r13, %r12
00000000003fc5e3	movq	%r13, %rdx
00000000003fc5e6	movq	%r12, %r14
00000000003fc5e9	sarq	$0x5, %r14
00000000003fc5ed	leaq	0x1(%r14), %rax
00000000003fc5f1	movabsq	$0x7ffffffffffffff, %rsi        ## imm = 0x7FFFFFFFFFFFFFF
00000000003fc5fb	cmpq	%rsi, %rax
00000000003fc5fe	movq	%r13, -0x40(%rbp)
00000000003fc602	ja	0x3fc6c6
00000000003fc608	movaps	%xmm2, -0x50(%rbp)
00000000003fc60c	movaps	%xmm1, -0x60(%rbp)
00000000003fc610	movq	%r15, %r13
00000000003fc613	movq	%r15, %rcx
00000000003fc616	subq	%rdx, %rcx
00000000003fc619	movq	%rcx, %r15
00000000003fc61c	sarq	$0x4, %r15
00000000003fc620	cmpq	%rax, %r15
00000000003fc623	cmovbeq	%rax, %r15
00000000003fc627	movabsq	$0x7fffffffffffffe0, %rax       ## imm = 0x7FFFFFFFFFFFFFE0
00000000003fc631	cmpq	%rax, %rcx
00000000003fc634	cmovaeq	%rsi, %r15
00000000003fc638	cmpq	%rsi, %r15
00000000003fc63b	ja	0x3fc6e0
00000000003fc641	shlq	$0x5, %r15
00000000003fc645	movq	%r15, %rdi
00000000003fc648	callq	0x6dfca2                        ## symbol stub for: __Znwm
00000000003fc64d	leaq	(%rax,%r12), %r13
00000000003fc651	addq	%rax, %r15
00000000003fc654	movaps	-0x50(%rbp), %xmm0
00000000003fc658	movaps	%xmm0, (%rax,%r12)
00000000003fc65d	movaps	-0x60(%rbp), %xmm0
00000000003fc661	movaps	%xmm0, 0x10(%rax,%r12)
00000000003fc667	addq	%r12, %rax
00000000003fc66a	addq	$0x20, %rax
00000000003fc66e	movq	%rax, -0x30(%rbp)
00000000003fc672	shlq	$0x5, %r14
00000000003fc676	subq	%r14, %r13
00000000003fc679	movq	%r13, %rdi
00000000003fc67c	movq	-0x40(%rbp), %r14
00000000003fc680	movq	%r14, %rsi
00000000003fc683	movq	%r12, %rdx
00000000003fc686	callq	0x6dff8a                        ## symbol stub for: _memcpy
00000000003fc68b	testq	%r14, %r14
00000000003fc68e	je	0x3fc698
00000000003fc690	movq	%r14, %rdi
00000000003fc693	callq	0x6dfc36                        ## symbol stub for: __ZdlPv
00000000003fc698	movq	-0x30(%rbp), %r12
00000000003fc69c	addl	$0x2, %ebx
00000000003fc69f	cmpl	$0x40, %ebx
00000000003fc6a2	jne	0x3fc59b
00000000003fc6a8	movq	-0x38(%rbp), %rax
00000000003fc6ac	movq	%r12, 0x8(%rax)
00000000003fc6b0	movq	%r15, 0x10(%rax)
00000000003fc6b4	movq	%r13, (%rax)
00000000003fc6b7	addq	$0x58, %rsp
00000000003fc6bb	popq	%rbx
00000000003fc6bc	popq	%r12
00000000003fc6be	popq	%r13
00000000003fc6c0	popq	%r14
00000000003fc6c2	popq	%r15
00000000003fc6c4	popq	%rbp
00000000003fc6c5	retq
00000000003fc6c6	movq	-0x38(%rbp), %rax
00000000003fc6ca	movq	-0x30(%rbp), %rcx
00000000003fc6ce	movq	%rcx, 0x8(%rax)
00000000003fc6d2	movq	%r15, 0x10(%rax)
00000000003fc6d6	movq	%rdx, (%rax)
00000000003fc6d9	callq	__ZNSt3__16vectorI25OZVelocityViewArrowVertexNS_9allocatorIS1_EEE20__throw_length_errorB9nqe210106Ev ## std::__1::vector<OZVelocityViewArrowVertex, std::__1::allocator<OZVelocityViewArrowVertex>>::__throw_length_error[abi:nqe210106]()
00000000003fc6de	jmp	0x3fc6fc
00000000003fc6e0	movq	-0x38(%rbp), %rax
00000000003fc6e4	movq	-0x30(%rbp), %rcx
00000000003fc6e8	movq	%rcx, 0x8(%rax)
00000000003fc6ec	movq	%r13, 0x10(%rax)
00000000003fc6f0	movq	-0x40(%rbp), %rcx
00000000003fc6f4	movq	%rcx, (%rax)
00000000003fc6f7	callq	__ZSt28__throw_bad_array_new_lengthB9nqe210106v ## std::__throw_bad_array_new_length[abi:nqe210106]()
00000000003fc6fc	ud2
00000000003fc6fe	movq	%rax, %r15
00000000003fc701	movq	-0x38(%rbp), %rax
00000000003fc705	movq	-0x30(%rbp), %rcx
00000000003fc709	movq	%rcx, 0x8(%rax)
00000000003fc70d	movq	%r13, 0x10(%rax)
00000000003fc711	movq	-0x40(%rbp), %rcx
00000000003fc715	movq	%rcx, (%rax)
00000000003fc718	jmp	0x3fc71d
00000000003fc71a	movq	%rax, %r15
00000000003fc71d	cmpq	$0x0, -0x40(%rbp)
00000000003fc722	je	0x3fc735
00000000003fc724	movq	-0x38(%rbp), %rax
00000000003fc728	movq	-0x40(%rbp), %rdi
00000000003fc72c	movq	%rdi, 0x8(%rax)
00000000003fc730	callq	0x6dfc36                        ## symbol stub for: __ZdlPv
00000000003fc735	movq	%r15, %rdi
00000000003fc738	callq	0x6dd07a                        ## symbol stub for: __Unwind_Resume
00000000003fc73d	nopl	(%rax)
