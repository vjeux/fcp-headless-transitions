__ZN24FFPlayerLockDeferredWork19processDeferredWorkEv:
0000000000da7fd0	pushq	%rbp
0000000000da7fd1	movq	%rsp, %rbp
0000000000da7fd4	pushq	%r15
0000000000da7fd6	pushq	%r14
0000000000da7fd8	pushq	%r13
0000000000da7fda	pushq	%r12
0000000000da7fdc	pushq	%rbx
0000000000da7fdd	subq	$0xd8, %rsp
0000000000da7fe4	movq	0xb45bdd(%rip), %rax            ## literal pool symbol address: ___stack_chk_guard
0000000000da7feb	movq	(%rax), %rax
0000000000da7fee	movq	%rax, -0x30(%rbp)
0000000000da7ff2	xorps	%xmm0, %xmm0
0000000000da7ff5	movaps	%xmm0, -0x100(%rbp)
0000000000da7ffc	movaps	%xmm0, -0xf0(%rbp)
0000000000da8003	movaps	%xmm0, -0xe0(%rbp)
0000000000da800a	movaps	%xmm0, -0xd0(%rbp)
0000000000da8011	movq	%rdi, -0xb8(%rbp)
0000000000da8018	movq	0x8(%rdi), %r14
0000000000da801c	movq	0xe104cd(%rip), %rsi
0000000000da8023	leaq	-0x100(%rbp), %rdx
0000000000da802a	leaq	-0xb0(%rbp), %rcx
0000000000da8031	movl	$0x10, %r8d
0000000000da8037	movq	%r14, %rdi
0000000000da803a	callq	*0xb45680(%rip)                 ## Objc message: -[%rdi _waitForThreadToFinish]
0000000000da8040	testq	%rax, %rax
0000000000da8043	je	0xda80bc
0000000000da8045	movq	%rax, %rbx
0000000000da8048	movq	-0xf0(%rbp), %rax
0000000000da804f	movq	(%rax), %r15
0000000000da8052	movq	0xb45667(%rip), %r12            ## Objc message: -[%rdi _waitForThreadToFinish]
0000000000da8059	jmp	0xda8089
0000000000da805b	nopl	(%rax,%rax)
0000000000da8060	movl	$0x10, %r8d
0000000000da8066	movq	%r14, %rdi
0000000000da8069	movq	0xe10480(%rip), %rsi
0000000000da8070	leaq	-0x100(%rbp), %rdx
0000000000da8077	leaq	-0xb0(%rbp), %rcx
0000000000da807e	callq	*%r12
0000000000da8081	movq	%rax, %rbx
0000000000da8084	testq	%rax, %rax
0000000000da8087	je	0xda80bc
0000000000da8089	xorl	%r13d, %r13d
0000000000da808c	jmp	0xda80a6
0000000000da808e	nop
0000000000da8090	movq	-0xf8(%rbp), %rax
0000000000da8097	movq	(%rax,%r13,8), %rdi
0000000000da809b	callq	*0x10(%rdi)
0000000000da809e	incq	%r13
0000000000da80a1	cmpq	%r13, %rbx
0000000000da80a4	je	0xda8060
0000000000da80a6	movq	-0xf0(%rbp), %rax
0000000000da80ad	cmpq	%r15, (%rax)
0000000000da80b0	je	0xda8090
0000000000da80b2	movq	%r14, %rdi
0000000000da80b5	callq	0x149793e                       ## symbol stub for: _objc_enumerationMutation
0000000000da80ba	jmp	0xda8090
0000000000da80bc	movq	-0xb8(%rbp), %rax
0000000000da80c3	movq	0x8(%rax), %rdi
0000000000da80c7	movq	0xe1051a(%rip), %rsi
0000000000da80ce	callq	*0xb455ec(%rip)                 ## Objc message: -[%rdi _waitForThreadToFinish]
0000000000da80d4	movq	0xb45aed(%rip), %rax            ## literal pool symbol address: ___stack_chk_guard
0000000000da80db	movq	(%rax), %rax
0000000000da80de	cmpq	-0x30(%rbp), %rax
0000000000da80e2	jne	0xda80f6
0000000000da80e4	addq	$0xd8, %rsp
0000000000da80eb	popq	%rbx
0000000000da80ec	popq	%r12
0000000000da80ee	popq	%r13
0000000000da80f0	popq	%r14
0000000000da80f2	popq	%r15
0000000000da80f4	popq	%rbp
0000000000da80f5	retq
0000000000da80f6	callq	0x14974f4                       ## symbol stub for: ___stack_chk_fail
0000000000da80fb	nopl	(%rax,%rax)
