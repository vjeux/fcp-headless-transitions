__ZN21FFLockerWithCallbacksC2ER6FFLockRNS_9CallbacksE:
00000000012b9970	pushq	%rbp
00000000012b9971	movq	%rsp, %rbp
00000000012b9974	pushq	%r15
00000000012b9976	pushq	%r14
00000000012b9978	pushq	%rbx
00000000012b9979	pushq	%rax
00000000012b997a	movq	%rdi, %rbx
00000000012b997d	movq	%rsi, (%rdi)
00000000012b9980	movq	%rdx, 0x8(%rdi)
00000000012b9984	movb	$0x0, 0x10(%rdi)
00000000012b9988	movq	0x8(%rsi), %r14
00000000012b998c	callq	0x1497b12                       ## symbol stub for: _pthread_self
00000000012b9991	cmpq	%rax, %r14
00000000012b9994	je	0x12b99d6
00000000012b9996	movq	0x8(%rbx), %rax
00000000012b999a	movq	0x20(%rax), %rdi
00000000012b999e	testq	%rdi, %rdi
00000000012b99a1	je	0x12b99a9
00000000012b99a3	movq	(%rdi), %rax
00000000012b99a6	callq	*0x30(%rax)
00000000012b99a9	movq	(%rbx), %r14
00000000012b99ac	movq	0x8(%r14), %r15
00000000012b99b0	callq	0x1497b12                       ## symbol stub for: _pthread_self
00000000012b99b5	cmpq	%rax, %r15
00000000012b99b8	je	0x12b9a03
00000000012b99ba	movq	(%r14), %rax
00000000012b99bd	movq	%r14, %rdi
00000000012b99c0	callq	*0x10(%rax)
00000000012b99c3	movl	$0x0, 0x10(%r14)
00000000012b99cb	callq	0x1497b12                       ## symbol stub for: _pthread_self
00000000012b99d0	movq	%rax, 0x8(%r14)
00000000012b99d4	jmp	0x12b9a07
00000000012b99d6	movq	(%rbx), %r14
00000000012b99d9	movq	0x8(%r14), %r15
00000000012b99dd	callq	0x1497b12                       ## symbol stub for: _pthread_self
00000000012b99e2	cmpq	%rax, %r15
00000000012b99e5	je	0x12b9a28
00000000012b99e7	movq	(%r14), %rax
00000000012b99ea	movq	%r14, %rdi
00000000012b99ed	callq	*0x10(%rax)
00000000012b99f0	movl	$0x0, 0x10(%r14)
00000000012b99f8	callq	0x1497b12                       ## symbol stub for: _pthread_self
00000000012b99fd	movq	%rax, 0x8(%r14)
00000000012b9a01	jmp	0x12b9a2c
00000000012b9a03	incl	0x10(%r14)
00000000012b9a07	movb	$0x1, 0x10(%rbx)
00000000012b9a0b	movq	0x8(%rbx), %rax
00000000012b9a0f	movq	0x50(%rax), %rdi
00000000012b9a13	testq	%rdi, %rdi
00000000012b9a16	je	0x12b9a30
00000000012b9a18	movq	(%rdi), %rax
00000000012b9a1b	addq	$0x8, %rsp
00000000012b9a1f	popq	%rbx
00000000012b9a20	popq	%r14
00000000012b9a22	popq	%r15
00000000012b9a24	popq	%rbp
00000000012b9a25	jmpq	*0x30(%rax)
00000000012b9a28	incl	0x10(%r14)
00000000012b9a2c	movb	$0x1, 0x10(%rbx)
00000000012b9a30	addq	$0x8, %rsp
00000000012b9a34	popq	%rbx
00000000012b9a35	popq	%r14
00000000012b9a37	popq	%r15
00000000012b9a39	popq	%rbp
00000000012b9a3a	retq
00000000012b9a3b	nopl	(%rax,%rax)
