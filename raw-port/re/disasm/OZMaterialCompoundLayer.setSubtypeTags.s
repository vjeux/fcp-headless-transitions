__ZN23OZMaterialCompoundLayer14setSubtypeTagsEv:
00000000001fa0b0	pushq	%rbp
00000000001fa0b1	movq	%rsp, %rbp
00000000001fa0b4	pushq	%r15
00000000001fa0b6	pushq	%r14
00000000001fa0b8	pushq	%r13
00000000001fa0ba	pushq	%r12
00000000001fa0bc	pushq	%rbx
00000000001fa0bd	subq	$0x118, %rsp                    ## imm = 0x118
00000000001fa0c4	movq	%rdi, %rbx
00000000001fa0c7	movq	0x62c36a(%rip), %rax            ## literal pool symbol address: ___stack_chk_guard
00000000001fa0ce	movq	(%rax), %rax
00000000001fa0d1	movq	%rax, -0x30(%rbp)
00000000001fa0d5	movq	(%rdi), %rax
00000000001fa0d8	xorl	%r14d, %r14d
00000000001fa0db	movq	0x62a42e(%rip), %rsi            ## literal pool symbol address: _kCMTimeZero
00000000001fa0e2	callq	*0x3b8(%rax)
00000000001fa0e8	movq	%rax, %r15
00000000001fa0eb	xorps	%xmm0, %xmm0
00000000001fa0ee	movaps	%xmm0, -0x110(%rbp)
00000000001fa0f5	movaps	%xmm0, -0x120(%rbp)
00000000001fa0fc	movaps	%xmm0, -0x130(%rbp)
00000000001fa103	movaps	%xmm0, -0x140(%rbp)
00000000001fa10a	movq	0x70f0b7(%rip), %rsi
00000000001fa111	leaq	-0x140(%rbp), %rdx
00000000001fa118	leaq	-0xb0(%rbp), %rcx
00000000001fa11f	movl	$0x10, %r8d
00000000001fa125	movq	%rax, %rdi
00000000001fa128	callq	*0x62befa(%rip)                 ## Objc message: -[%rdi getInitialValue:]
00000000001fa12e	movq	%rax, %r13
00000000001fa131	testq	%rax, %rax
00000000001fa134	je	0x1fa368
00000000001fa13a	movq	%r15, -0xd0(%rbp)
00000000001fa141	movq	%rbx, -0xe0(%rbp)
00000000001fa148	movq	-0x130(%rbp), %rax
00000000001fa14f	movq	(%rax), %rax
00000000001fa152	movq	%rax, -0xf0(%rbp)
00000000001fa159	xorl	%r12d, %r12d
00000000001fa15c	movq	0x62bec5(%rip), %rbx            ## Objc message: -[%rdi getInitialValue:]
00000000001fa163	xorl	%r15d, %r15d
00000000001fa166	xorl	%r14d, %r14d
00000000001fa169	movq	0x70ed50(%rip), %rax
00000000001fa170	movq	%rax, -0xf8(%rbp)
00000000001fa177	movq	0x711c4a(%rip), %rax
00000000001fa17e	movq	%rax, -0xe8(%rbp)
00000000001fa185	movq	$0x0, -0xc8(%rbp)
00000000001fa190	movq	%r13, -0xc0(%rbp)
00000000001fa197	jmp	0x1fa1d7
00000000001fa199	nopl	(%rax)
00000000001fa1a0	movl	%r14d, (%r12)
00000000001fa1a4	movq	-0xb8(%rbp), %r14
00000000001fa1ab	movq	-0xc0(%rbp), %r13
00000000001fa1b2	movq	0x62be6f(%rip), %rbx            ## Objc message: -[%rdi getInitialValue:]
00000000001fa1b9	addq	$0x4, %r12
00000000001fa1bd	movq	-0xc8(%rbp), %rcx
00000000001fa1c4	incq	%rcx
00000000001fa1c7	movq	%rcx, -0xc8(%rbp)
00000000001fa1ce	cmpq	%rcx, %r13
00000000001fa1d1	je	0x1fa300
00000000001fa1d7	movq	%r14, -0xb8(%rbp)
00000000001fa1de	movq	-0x130(%rbp), %rax
00000000001fa1e5	movq	-0xf0(%rbp), %rcx
00000000001fa1ec	cmpq	%rcx, (%rax)
00000000001fa1ef	je	0x1fa1fd
00000000001fa1f1	movq	-0xd0(%rbp), %rdi
00000000001fa1f8	callq	0x6dffe4                        ## symbol stub for: _objc_enumerationMutation
00000000001fa1fd	movq	-0x138(%rbp), %rax
00000000001fa204	movq	-0xc8(%rbp), %rcx
00000000001fa20b	movq	(%rax,%rcx,8), %rdi
00000000001fa20f	movq	-0xf8(%rbp), %rsi
00000000001fa216	leaq	0x69cb93(%rip), %rdx            ## Objc cfstring ref: @"bad cfstring ref"
00000000001fa21d	callq	*%rbx
00000000001fa21f	testq	%rax, %rax
00000000001fa222	je	0x1fa354
00000000001fa228	movq	%rax, %rdi
00000000001fa22b	movq	-0xe8(%rbp), %rsi
00000000001fa232	callq	*%rbx
00000000001fa234	movl	%eax, %r14d
00000000001fa237	cmpq	%r15, %r12
00000000001fa23a	jb	0x1fa1a0
00000000001fa240	movq	%r15, %rsi
00000000001fa243	movq	-0xb8(%rbp), %rcx
00000000001fa24a	subq	%rcx, %r12
00000000001fa24d	movq	%r12, %r15
00000000001fa250	sarq	$0x2, %r15
00000000001fa254	leaq	0x1(%r15), %rax
00000000001fa258	movabsq	$0x3fffffffffffffff, %rdx       ## imm = 0x3FFFFFFFFFFFFFFF
00000000001fa262	cmpq	%rdx, %rax
00000000001fa265	ja	0x1fa38a
00000000001fa26b	subq	%rcx, %rsi
00000000001fa26e	movq	%rsi, %rbx
00000000001fa271	sarq	%rbx
00000000001fa274	cmpq	%rax, %rbx
00000000001fa277	cmovbeq	%rax, %rbx
00000000001fa27b	movabsq	$0x7ffffffffffffffc, %rax       ## imm = 0x7FFFFFFFFFFFFFFC
00000000001fa285	cmpq	%rax, %rsi
00000000001fa288	cmovaeq	%rdx, %rbx
00000000001fa28c	cmpq	%rdx, %rbx
00000000001fa28f	ja	0x1fa391
00000000001fa295	leaq	(,%rbx,4), %rdi
00000000001fa29d	callq	0x6dfca2                        ## symbol stub for: __Znwm
00000000001fa2a2	movq	%rax, %r13
00000000001fa2a5	leaq	(%rax,%rbx,4), %rcx
00000000001fa2a9	movq	%rcx, -0xd8(%rbp)
00000000001fa2b0	addq	%r12, %r13
00000000001fa2b3	movl	%r14d, (%rax,%r12)
00000000001fa2b7	shlq	$0x2, %r15
00000000001fa2bb	movq	%r13, %r14
00000000001fa2be	subq	%r15, %r14
00000000001fa2c1	movq	%r14, %rdi
00000000001fa2c4	movq	-0xb8(%rbp), %rbx
00000000001fa2cb	movq	%rbx, %rsi
00000000001fa2ce	movq	%r12, %rdx
00000000001fa2d1	callq	0x6dff8a                        ## symbol stub for: _memcpy
00000000001fa2d6	testq	%rbx, %rbx
00000000001fa2d9	je	0x1fa2e3
00000000001fa2db	movq	%rbx, %rdi
00000000001fa2de	callq	0x6dfc36                        ## symbol stub for: __ZdlPv
00000000001fa2e3	movq	%r13, %r12
00000000001fa2e6	movq	-0xc0(%rbp), %r13
00000000001fa2ed	movq	0x62bd34(%rip), %rbx            ## Objc message: -[%rdi getInitialValue:]
00000000001fa2f4	movq	-0xd8(%rbp), %r15
00000000001fa2fb	jmp	0x1fa1b9
00000000001fa300	movl	$0x10, %r8d
00000000001fa306	movq	-0xd0(%rbp), %rdi
00000000001fa30d	movq	0x70eeb4(%rip), %rsi
00000000001fa314	leaq	-0x140(%rbp), %rdx
00000000001fa31b	leaq	-0xb0(%rbp), %rcx
00000000001fa322	callq	*%rbx
00000000001fa324	movq	%rax, %r13
00000000001fa327	testq	%rax, %rax
00000000001fa32a	jne	0x1fa169
00000000001fa330	subq	%r14, %r12
00000000001fa333	je	0x1fa35b
00000000001fa335	shrq	$0x2, %r12
00000000001fa339	movq	-0xe0(%rbp), %rdi
00000000001fa340	addq	$0x3a8, %rdi                    ## imm = 0x3A8
00000000001fa347	movq	%r14, %rsi
00000000001fa34a	movl	%r12d, %edx
00000000001fa34d	callq	0x6dd986                        ## symbol stub for: __ZN13OZChannelEnum7setTagsEPKii
00000000001fa352	jmp	0x1fa35b
00000000001fa354	movq	-0xb8(%rbp), %r14
00000000001fa35b	testq	%r14, %r14
00000000001fa35e	je	0x1fa368
00000000001fa360	movq	%r14, %rdi
00000000001fa363	callq	0x6dfc36                        ## symbol stub for: __ZdlPv
00000000001fa368	movq	0x62c0c9(%rip), %rax            ## literal pool symbol address: ___stack_chk_guard
00000000001fa36f	movq	(%rax), %rax
00000000001fa372	cmpq	-0x30(%rbp), %rax
00000000001fa376	jne	0x1fa398
00000000001fa378	addq	$0x118, %rsp                    ## imm = 0x118
00000000001fa37f	popq	%rbx
00000000001fa380	popq	%r12
00000000001fa382	popq	%r13
00000000001fa384	popq	%r14
00000000001fa386	popq	%r15
00000000001fa388	popq	%rbp
00000000001fa389	retq
00000000001fa38a	callq	__ZNSt3__16vectorIiNS_9allocatorIiEEE20__throw_length_errorB9nqe210106Ev ## std::__1::vector<int, std::__1::allocator<int>>::__throw_length_error[abi:nqe210106]()
00000000001fa38f	jmp	0x1fa396
00000000001fa391	callq	__ZSt28__throw_bad_array_new_lengthB9nqe210106v ## std::__throw_bad_array_new_length[abi:nqe210106]()
00000000001fa396	ud2
00000000001fa398	callq	0x6dfd38                        ## symbol stub for: ___stack_chk_fail
00000000001fa39d	movq	%r14, -0xb8(%rbp)
00000000001fa3a4	jmp	0x1fa3c0
00000000001fa3a6	movq	%rax, %r14
00000000001fa3a9	movq	%r14, %rdi
00000000001fa3ac	callq	0x6dd07a                        ## symbol stub for: __Unwind_Resume
00000000001fa3b1	movq	%r14, -0xb8(%rbp)
00000000001fa3b8	jmp	0x1fa3c0
00000000001fa3ba	jmp	0x1fa3c0
00000000001fa3bc	jmp	0x1fa3c0
00000000001fa3be	jmp	0x1fa3c0
00000000001fa3c0	movq	%rax, %r14
00000000001fa3c3	cmpq	$0x0, -0xb8(%rbp)
00000000001fa3cb	jne	0x1fa3d5
00000000001fa3cd	movq	%r14, %rdi
00000000001fa3d0	callq	0x6dd07a                        ## symbol stub for: __Unwind_Resume
00000000001fa3d5	movq	-0xb8(%rbp), %rdi
00000000001fa3dc	callq	0x6dfc36                        ## symbol stub for: __ZdlPv
00000000001fa3e1	movq	%r14, %rdi
00000000001fa3e4	callq	0x6dd07a                        ## symbol stub for: __Unwind_Resume
00000000001fa3e9	nopl	(%rax)
