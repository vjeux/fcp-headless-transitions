__ZN17FFVideoPropsGroup12findOrInsertEP12FFVideoProps:
0000000000fd5b50	pushq	%rbp
0000000000fd5b51	movq	%rsp, %rbp
0000000000fd5b54	pushq	%r15
0000000000fd5b56	pushq	%r14
0000000000fd5b58	pushq	%r13
0000000000fd5b5a	pushq	%r12
0000000000fd5b5c	pushq	%rbx
0000000000fd5b5d	subq	$0xe8, %rsp
0000000000fd5b64	movq	%rsi, -0xc0(%rbp)
0000000000fd5b6b	movq	%rdi, %r14
0000000000fd5b6e	movq	0x918053(%rip), %rax            ## literal pool symbol address: ___stack_chk_guard
0000000000fd5b75	movq	(%rax), %rax
0000000000fd5b78	movq	%rax, -0x30(%rbp)
0000000000fd5b7c	callq	0x1497aee                       ## symbol stub for: _pthread_mutex_lock
0000000000fd5b81	xorps	%xmm0, %xmm0
0000000000fd5b84	movaps	%xmm0, -0x110(%rbp)
0000000000fd5b8b	movaps	%xmm0, -0x100(%rbp)
0000000000fd5b92	movaps	%xmm0, -0xf0(%rbp)
0000000000fd5b99	movaps	%xmm0, -0xe0(%rbp)
0000000000fd5ba0	movq	0x40(%r14), %rdi
0000000000fd5ba4	movq	0xbe2945(%rip), %rsi
0000000000fd5bab	leaq	-0x110(%rbp), %rdx
0000000000fd5bb2	leaq	-0xb0(%rbp), %rcx
0000000000fd5bb9	movl	$0x10, %r8d
0000000000fd5bbf	movq	%rdi, -0xb8(%rbp)
0000000000fd5bc6	callq	*0x917af4(%rip)                 ## Objc message: -[%rdi backingRequest]
0000000000fd5bcc	testq	%rax, %rax
0000000000fd5bcf	je	0xfd5c99
0000000000fd5bd5	movq	%rax, %rbx
0000000000fd5bd8	movq	%r14, -0xc8(%rbp)
0000000000fd5bdf	movq	-0x100(%rbp), %rax
0000000000fd5be6	movq	(%rax), %rax
0000000000fd5be9	movq	%rax, -0xd0(%rbp)
0000000000fd5bf0	xorl	%r15d, %r15d
0000000000fd5bf3	jmp	0xfd5c30
0000000000fd5bf5	nopw	%cs:(%rax,%rax)
0000000000fd5c00	movl	$0x10, %r8d
0000000000fd5c06	movq	-0xb8(%rbp), %rdi
0000000000fd5c0d	movq	0xbe28dc(%rip), %rsi
0000000000fd5c14	leaq	-0x110(%rbp), %rdx
0000000000fd5c1b	leaq	-0xb0(%rbp), %rcx
0000000000fd5c22	callq	*0x917a98(%rip)                 ## Objc message: -[%rdi backingRequest]
0000000000fd5c28	movq	%rax, %rbx
0000000000fd5c2b	testq	%rax, %rax
0000000000fd5c2e	je	0xfd5c8d
0000000000fd5c30	movq	0xbf2179(%rip), %r13
0000000000fd5c37	xorl	%r14d, %r14d
0000000000fd5c3a	jmp	0xfd5c6c
0000000000fd5c3c	nopl	(%rax)
0000000000fd5c40	movq	-0x108(%rbp), %rax
0000000000fd5c47	movq	(%rax,%r14,8), %r12
0000000000fd5c4b	movq	%r12, %rdi
0000000000fd5c4e	movq	%r13, %rsi
0000000000fd5c51	movq	-0xc0(%rbp), %rdx
0000000000fd5c58	callq	*0x917a62(%rip)                 ## Objc message: -[%rdi backingRequest]
0000000000fd5c5e	testb	%al, %al
0000000000fd5c60	cmovneq	%r12, %r15
0000000000fd5c64	incq	%r14
0000000000fd5c67	cmpq	%r14, %rbx
0000000000fd5c6a	je	0xfd5c00
0000000000fd5c6c	movq	-0x100(%rbp), %rax
0000000000fd5c73	movq	-0xd0(%rbp), %rcx
0000000000fd5c7a	cmpq	%rcx, (%rax)
0000000000fd5c7d	je	0xfd5c40
0000000000fd5c7f	movq	-0xb8(%rbp), %rdi
0000000000fd5c86	callq	0x149793e                       ## symbol stub for: _objc_enumerationMutation
0000000000fd5c8b	jmp	0xfd5c40
0000000000fd5c8d	testq	%r15, %r15
0000000000fd5c90	movq	-0xc8(%rbp), %r14
0000000000fd5c97	jne	0xfd5cee
0000000000fd5c99	movq	0xc23408(%rip), %rsi
0000000000fd5ca0	movq	0x917a19(%rip), %rbx            ## Objc message: -[%rdi backingRequest]
0000000000fd5ca7	movq	-0xc0(%rbp), %rdi
0000000000fd5cae	callq	*%rbx
0000000000fd5cb0	movq	%rax, %r15
0000000000fd5cb3	movq	0x40(%r14), %rdi
0000000000fd5cb7	movq	0xbe282a(%rip), %rsi
0000000000fd5cbe	movq	%rax, %rdx
0000000000fd5cc1	callq	*%rbx
0000000000fd5cc3	movq	0xc233e6(%rip), %rsi
0000000000fd5cca	movq	%r15, %rdi
0000000000fd5ccd	movl	$0x1, %edx
0000000000fd5cd2	callq	*%rbx
0000000000fd5cd4	movq	0xc233c5(%rip), %rsi
0000000000fd5cdb	movq	%r15, %rdi
0000000000fd5cde	movl	$0x1, %edx
0000000000fd5ce3	callq	*%rbx
0000000000fd5ce5	movq	%r15, %rdi
0000000000fd5ce8	callq	*0x917a1a(%rip)                 ## literal pool symbol address: _objc_release
0000000000fd5cee	movq	%r14, %rdi
0000000000fd5cf1	callq	0x1497afa                       ## symbol stub for: _pthread_mutex_unlock
0000000000fd5cf6	movq	0x917ecb(%rip), %rax            ## literal pool symbol address: ___stack_chk_guard
0000000000fd5cfd	movq	(%rax), %rax
0000000000fd5d00	cmpq	-0x30(%rbp), %rax
0000000000fd5d04	jne	0xfd5d1b
0000000000fd5d06	movq	%r15, %rax
0000000000fd5d09	addq	$0xe8, %rsp
0000000000fd5d10	popq	%rbx
0000000000fd5d11	popq	%r12
0000000000fd5d13	popq	%r13
0000000000fd5d15	popq	%r14
0000000000fd5d17	popq	%r15
0000000000fd5d19	popq	%rbp
0000000000fd5d1a	retq
0000000000fd5d1b	callq	0x14974f4                       ## symbol stub for: ___stack_chk_fail
