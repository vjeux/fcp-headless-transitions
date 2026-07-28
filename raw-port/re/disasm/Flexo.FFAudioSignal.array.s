__ZN13FFAudioSignal5arrayEPS_z:
0000000001257a90	pushq	%rbp
0000000001257a91	movq	%rsp, %rbp
0000000001257a94	pushq	%r15
0000000001257a96	pushq	%r14
0000000001257a98	pushq	%r13
0000000001257a9a	pushq	%r12
0000000001257a9c	pushq	%rbx
0000000001257a9d	subq	$0xf8, %rsp
0000000001257aa4	movq	%rdx, -0x110(%rbp)
0000000001257aab	movq	%rcx, -0x108(%rbp)
0000000001257ab2	movq	%r8, -0x100(%rbp)
0000000001257ab9	movq	%r9, -0xf8(%rbp)
0000000001257ac0	testb	%al, %al
0000000001257ac2	je	0x1257af9
0000000001257ac4	movaps	%xmm0, -0xf0(%rbp)
0000000001257acb	movaps	%xmm1, -0xe0(%rbp)
0000000001257ad2	movaps	%xmm2, -0xd0(%rbp)
0000000001257ad9	movaps	%xmm3, -0xc0(%rbp)
0000000001257ae0	movaps	%xmm4, -0xb0(%rbp)
0000000001257ae7	movaps	%xmm5, -0xa0(%rbp)
0000000001257aee	movaps	%xmm6, -0x90(%rbp)
0000000001257af5	movaps	%xmm7, -0x80(%rbp)
0000000001257af9	movq	0x6960c8(%rip), %rax            ## literal pool symbol address: ___stack_chk_guard
0000000001257b00	movq	(%rax), %rax
0000000001257b03	movq	%rax, -0x30(%rbp)
0000000001257b07	xorps	%xmm0, %xmm0
0000000001257b0a	movups	%xmm0, (%rdi)
0000000001257b0d	movq	%rdi, -0x58(%rbp)
0000000001257b11	movq	$0x0, 0x10(%rdi)
0000000001257b19	testq	%rsi, %rsi
0000000001257b1c	je	0x1257c85
0000000001257b22	movq	%rsi, %r15
0000000001257b25	movabsq	$0x1fffffffffffffff, %rdx       ## imm = 0x1FFFFFFFFFFFFFFF
0000000001257b2f	leaq	-0x120(%rbp), %rax
0000000001257b36	movq	%rax, -0x40(%rbp)
0000000001257b3a	leaq	0x10(%rbp), %rax
0000000001257b3e	movq	%rax, -0x48(%rbp)
0000000001257b42	movabsq	$0x3000000010, %rax             ## imm = 0x3000000010
0000000001257b4c	movq	%rax, -0x50(%rbp)
0000000001257b50	xorl	%r13d, %r13d
0000000001257b53	xorl	%esi, %esi
0000000001257b55	xorl	%edi, %edi
0000000001257b57	jmp	0x1257b78
0000000001257b59	nopl	(%rax)
0000000001257b60	movq	-0x48(%rbp), %rax
0000000001257b64	leaq	0x8(%rax), %rcx
0000000001257b68	movq	%rcx, -0x48(%rbp)
0000000001257b6c	movq	(%rax), %r15
0000000001257b6f	testq	%r15, %r15
0000000001257b72	je	0x1257c76
0000000001257b78	cmpq	%rsi, %r13
0000000001257b7b	jae	0x1257ba0
0000000001257b7d	movq	%r15, (%r13)
0000000001257b81	addq	$0x8, %r13
0000000001257b85	movl	-0x50(%rbp), %ecx
0000000001257b88	cmpq	$0x28, %rcx
0000000001257b8c	ja	0x1257b60
0000000001257b8e	jmp	0x1257c5d
0000000001257b93	nopw	%cs:(%rax,%rax)
0000000001257ba0	movq	%r13, %rbx
0000000001257ba3	subq	%rdi, %rbx
0000000001257ba6	movq	%rbx, %r12
0000000001257ba9	sarq	$0x3, %r12
0000000001257bad	leaq	0x1(%r12), %rax
0000000001257bb2	cmpq	%rdx, %rax
0000000001257bb5	movq	%rdi, -0x60(%rbp)
0000000001257bb9	ja	0x1257cab
0000000001257bbf	movq	%rsi, -0x68(%rbp)
0000000001257bc3	movq	%rsi, %rcx
0000000001257bc6	subq	%rdi, %rcx
0000000001257bc9	movq	%rcx, %r14
0000000001257bcc	sarq	$0x2, %r14
0000000001257bd0	cmpq	%rax, %r14
0000000001257bd3	cmovbeq	%rax, %r14
0000000001257bd7	movabsq	$0x7ffffffffffffff8, %rax       ## imm = 0x7FFFFFFFFFFFFFF8
0000000001257be1	cmpq	%rax, %rcx
0000000001257be4	cmovaeq	%rdx, %r14
0000000001257be8	cmpq	%rdx, %r14
0000000001257beb	ja	0x1257cc1
0000000001257bf1	leaq	(,%r14,8), %rdi
0000000001257bf9	callq	0x1497452                       ## symbol stub for: __Znwm
0000000001257bfe	leaq	(%rax,%rbx), %r13
0000000001257c02	leaq	(%rax,%r14,8), %rcx
0000000001257c06	movq	%rcx, -0x68(%rbp)
0000000001257c0a	movq	%r15, (%rax,%rbx)
0000000001257c0e	leaq	(%rax,%rbx), %r15
0000000001257c12	addq	$0x8, %r15
0000000001257c16	shlq	$0x3, %r12
0000000001257c1a	subq	%r12, %r13
0000000001257c1d	movq	%r13, %rdi
0000000001257c20	movq	-0x60(%rbp), %r14
0000000001257c24	movq	%r14, %rsi
0000000001257c27	movq	%rbx, %rdx
0000000001257c2a	callq	0x14978ba                       ## symbol stub for: _memcpy
0000000001257c2f	testq	%r14, %r14
0000000001257c32	je	0x1257c3c
0000000001257c34	movq	%r14, %rdi
0000000001257c37	callq	0x1497404                       ## symbol stub for: __ZdlPv
0000000001257c3c	movq	%r13, %rdi
0000000001257c3f	movabsq	$0x1fffffffffffffff, %rdx       ## imm = 0x1FFFFFFFFFFFFFFF
0000000001257c49	movq	-0x68(%rbp), %rsi
0000000001257c4d	movq	%r15, %r13
0000000001257c50	movl	-0x50(%rbp), %ecx
0000000001257c53	cmpq	$0x28, %rcx
0000000001257c57	ja	0x1257b60
0000000001257c5d	movq	%rcx, %rax
0000000001257c60	addq	-0x40(%rbp), %rax
0000000001257c64	addl	$0x8, %ecx
0000000001257c67	movl	%ecx, -0x50(%rbp)
0000000001257c6a	movq	(%rax), %r15
0000000001257c6d	testq	%r15, %r15
0000000001257c70	jne	0x1257b78
0000000001257c76	movq	-0x58(%rbp), %rax
0000000001257c7a	movq	%r13, 0x8(%rax)
0000000001257c7e	movq	%rsi, 0x10(%rax)
0000000001257c82	movq	%rdi, (%rax)
0000000001257c85	movq	0x695f3c(%rip), %rax            ## literal pool symbol address: ___stack_chk_guard
0000000001257c8c	movq	(%rax), %rax
0000000001257c8f	cmpq	-0x30(%rbp), %rax
0000000001257c93	jne	0x1257cdf
0000000001257c95	movq	-0x58(%rbp), %rax
0000000001257c99	addq	$0xf8, %rsp
0000000001257ca0	popq	%rbx
0000000001257ca1	popq	%r12
0000000001257ca3	popq	%r13
0000000001257ca5	popq	%r14
0000000001257ca7	popq	%r15
0000000001257ca9	popq	%rbp
0000000001257caa	retq
0000000001257cab	movq	-0x58(%rbp), %rax
0000000001257caf	movq	%r13, 0x8(%rax)
0000000001257cb3	movq	%rsi, 0x10(%rax)
0000000001257cb7	movq	%rdi, (%rax)
0000000001257cba	callq	__ZNSt3__16vectorIP13FFAudioSignalNS_9allocatorIS2_EEE20__throw_length_errorB9nqe210106Ev ## std::__1::vector<FFAudioSignal*, std::__1::allocator<FFAudioSignal*>>::__throw_length_error[abi:nqe210106]()
0000000001257cbf	jmp	0x1257cdd
0000000001257cc1	movq	-0x58(%rbp), %rax
0000000001257cc5	movq	%r13, 0x8(%rax)
0000000001257cc9	movq	-0x68(%rbp), %rcx
0000000001257ccd	movq	%rcx, 0x10(%rax)
0000000001257cd1	movq	-0x60(%rbp), %rcx
0000000001257cd5	movq	%rcx, (%rax)
0000000001257cd8	callq	__ZSt28__throw_bad_array_new_lengthB9nqe210106v ## std::__throw_bad_array_new_length[abi:nqe210106]()
0000000001257cdd	ud2
0000000001257cdf	callq	0x14974f4                       ## symbol stub for: ___stack_chk_fail
0000000001257ce4	movq	%rax, %r15
0000000001257ce7	movq	-0x58(%rbp), %rax
0000000001257ceb	movq	%r13, 0x8(%rax)
0000000001257cef	movq	-0x68(%rbp), %rcx
0000000001257cf3	movq	%rcx, 0x10(%rax)
0000000001257cf7	movq	-0x60(%rbp), %rcx
0000000001257cfb	movq	%rcx, (%rax)
0000000001257cfe	jmp	0x1257d03
0000000001257d00	movq	%rax, %r15
0000000001257d03	cmpq	$0x0, -0x60(%rbp)
0000000001257d08	je	0x1257d1b
0000000001257d0a	movq	-0x58(%rbp), %rax
0000000001257d0e	movq	-0x60(%rbp), %rdi
0000000001257d12	movq	%rdi, 0x8(%rax)
0000000001257d16	callq	0x1497404                       ## symbol stub for: __ZdlPv
0000000001257d1b	movq	%r15, %rdi
0000000001257d1e	callq	0x1495d30                       ## symbol stub for: __Unwind_Resume
0000000001257d23	nopw	%cs:(%rax,%rax)
