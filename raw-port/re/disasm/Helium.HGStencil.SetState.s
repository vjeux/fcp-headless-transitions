__ZN9HGStencil8SetStateEP10HGRendereri:
00000000002d1f20	pushq	%rbp
00000000002d1f21	movq	%rsp, %rbp
00000000002d1f24	pushq	%r15
00000000002d1f26	pushq	%r14
00000000002d1f28	pushq	%r13
00000000002d1f2a	pushq	%r12
00000000002d1f2c	pushq	%rbx
00000000002d1f2d	subq	$0x38, %rsp
00000000002d1f31	movq	%rsi, -0x30(%rbp)
00000000002d1f35	movq	%rdi, %rbx
00000000002d1f38	movl	%edx, -0x34(%rbp)
00000000002d1f3b	cmpl	$0x1, %edx
00000000002d1f3e	jne	0x2d20e3
00000000002d1f44	movq	-0x30(%rbp), %rdi
00000000002d1f48	movq	(%rdi), %rax
00000000002d1f4b	callq	*0x130(%rax)
00000000002d1f51	movl	$0x1, %r15d
00000000002d1f57	testb	%al, %al
00000000002d1f59	je	0x2d1f70
00000000002d1f5b	movq	-0x30(%rbp), %rdi
00000000002d1f5f	movq	(%rdi), %rax
00000000002d1f62	movl	$0x5, %esi
00000000002d1f67	callq	*0x80(%rax)
00000000002d1f6d	movl	%eax, %r15d
00000000002d1f70	movq	0x1a0(%rbx), %rax
00000000002d1f77	subq	0x198(%rbx), %rax
00000000002d1f7e	sarq	$0x3, %rax
00000000002d1f82	cmpq	%r15, %rax
00000000002d1f85	jae	0x2d20e3
00000000002d1f8b	movabsq	$0x1fffffffffffffff, %r12       ## imm = 0x1FFFFFFFFFFFFFFF
00000000002d1f95	movq	%rbx, -0x48(%rbp)
00000000002d1f99	movq	%r15, -0x40(%rbp)
00000000002d1f9d	jmp	0x2d1fcf
00000000002d1f9f	nop
00000000002d1fa0	movq	%rsi, (%r14)
00000000002d1fa3	addq	$0x8, %r14
00000000002d1fa7	movq	%r14, %r12
00000000002d1faa	movq	%r12, 0x1a0(%rbx)
00000000002d1fb1	subq	0x198(%rbx), %r12
00000000002d1fb8	sarq	$0x3, %r12
00000000002d1fbc	cmpq	%r15, %r12
00000000002d1fbf	movabsq	$0x1fffffffffffffff, %r12       ## imm = 0x1FFFFFFFFFFFFFFF
00000000002d1fc9	jae	0x2d20e3
00000000002d1fcf	movl	$0x67, %edi
00000000002d1fd4	callq	0x3c4fac                        ## symbol stub for: __Znam
00000000002d1fd9	leaq	0x8(%rax), %rcx
00000000002d1fdd	negl	%ecx
00000000002d1fdf	andl	$0x1f, %ecx
00000000002d1fe2	leaq	(%rcx,%rax), %rsi
00000000002d1fe6	addq	$0x8, %rsi
00000000002d1fea	movq	%rax, (%rcx,%rax)
00000000002d1fee	xorps	%xmm0, %xmm0
00000000002d1ff1	movaps	%xmm0, 0x8(%rcx,%rax)
00000000002d1ff6	movaps	%xmm0, 0x18(%rcx,%rax)
00000000002d1ffb	movaps	0x5bcd4e(%rip), %xmm0
00000000002d2002	movaps	%xmm0, 0x38(%rcx,%rax)
00000000002d2007	movaps	%xmm0, 0x28(%rcx,%rax)
00000000002d200c	movq	0x1a0(%rbx), %r14
00000000002d2013	movq	0x1a8(%rbx), %rax
00000000002d201a	cmpq	%rax, %r14
00000000002d201d	jb	0x2d1fa0
00000000002d201f	movq	0x198(%rbx), %r13
00000000002d2026	subq	%r13, %r14
00000000002d2029	movq	%r14, %r15
00000000002d202c	sarq	$0x3, %r15
00000000002d2030	leaq	0x1(%r15), %rcx
00000000002d2034	cmpq	%r12, %rcx
00000000002d2037	ja	0x2d2100
00000000002d203d	movq	%r12, %rdx
00000000002d2040	movq	%rsi, -0x58(%rbp)
00000000002d2044	subq	%r13, %rax
00000000002d2047	movq	%rax, %r12
00000000002d204a	sarq	$0x2, %r12
00000000002d204e	cmpq	%rcx, %r12
00000000002d2051	cmovbeq	%rcx, %r12
00000000002d2055	movabsq	$0x7ffffffffffffff8, %rcx       ## imm = 0x7FFFFFFFFFFFFFF8
00000000002d205f	cmpq	%rcx, %rax
00000000002d2062	cmovaeq	%rdx, %r12
00000000002d2066	cmpq	%rdx, %r12
00000000002d2069	ja	0x2d2105
00000000002d206f	leaq	(,%r12,8), %rdi
00000000002d2077	callq	0x3c4fb2                        ## symbol stub for: __Znwm
00000000002d207c	leaq	(%rax,%r14), %rbx
00000000002d2080	leaq	(%rax,%r12,8), %rcx
00000000002d2084	movq	%rcx, -0x50(%rbp)
00000000002d2088	movq	-0x58(%rbp), %rcx
00000000002d208c	movq	%rcx, (%rax,%r14)
00000000002d2090	leaq	(%rax,%r14), %r12
00000000002d2094	addq	$0x8, %r12
00000000002d2098	shlq	$0x3, %r15
00000000002d209c	subq	%r15, %rbx
00000000002d209f	movq	%rbx, %rdi
00000000002d20a2	movq	%r13, %rsi
00000000002d20a5	movq	%r14, %rdx
00000000002d20a8	callq	0x3c5438                        ## symbol stub for: _memcpy
00000000002d20ad	movq	-0x48(%rbp), %rax
00000000002d20b1	movq	%rbx, 0x198(%rax)
00000000002d20b8	movq	%rax, %rbx
00000000002d20bb	movq	%r12, 0x1a0(%rax)
00000000002d20c2	movq	-0x50(%rbp), %rax
00000000002d20c6	movq	%rax, 0x1a8(%rbx)
00000000002d20cd	testq	%r13, %r13
00000000002d20d0	je	0x2d20da
00000000002d20d2	movq	%r13, %rdi
00000000002d20d5	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
00000000002d20da	movq	-0x40(%rbp), %r15
00000000002d20de	jmp	0x2d1faa
00000000002d20e3	movq	%rbx, %rdi
00000000002d20e6	movq	-0x30(%rbp), %rsi
00000000002d20ea	movl	-0x34(%rbp), %edx
00000000002d20ed	addq	$0x38, %rsp
00000000002d20f1	popq	%rbx
00000000002d20f2	popq	%r12
00000000002d20f4	popq	%r13
00000000002d20f6	popq	%r14
00000000002d20f8	popq	%r15
00000000002d20fa	popq	%rbp
00000000002d20fb	jmp	__ZN6HGNode8SetStateEP10HGRendereri ## HGNode::SetState(HGRenderer*, int)
00000000002d2100	callq	__ZNSt3__16vectorIPN9HGStencil5StateENS_9allocatorIS3_EEE20__throw_length_errorB9nqe210106Ev ## std::__1::vector<HGStencil::State*, std::__1::allocator<HGStencil::State*>>::__throw_length_error[abi:nqe210106]()
00000000002d2105	callq	__ZSt28__throw_bad_array_new_lengthB9nqe210106v ## std::__throw_bad_array_new_length[abi:nqe210106]()
00000000002d210a	nopw	(%rax,%rax)
