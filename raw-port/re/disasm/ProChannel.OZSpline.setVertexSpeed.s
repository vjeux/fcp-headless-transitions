__ZN8OZSpline14setVertexSpeedEPvj:
000000000002f364	testq	%rsi, %rsi
000000000002f367	je	0x2f39c
000000000002f369	cmpl	$0x3, %edx
000000000002f36c	ja	0x2f39c
000000000002f36e	pushq	%rbp
000000000002f36f	movq	%rsp, %rbp
000000000002f372	pushq	%rbx
000000000002f373	pushq	%rax
000000000002f374	movq	%rsi, %rbx
000000000002f377	movl	%edx, %eax
000000000002f379	leaq	0x6c(%rip), %rcx
000000000002f380	movslq	(%rcx,%rax,4), %rax
000000000002f384	addq	%rcx, %rax
000000000002f387	jmpq	*%rax
000000000002f389	movq	(%rbx), %rax
000000000002f38c	movq	%rbx, %rdi
000000000002f38f	movl	$0x1, %esi
000000000002f394	callq	*0xc8(%rax)
000000000002f39a	jmp	0x2f3e2
000000000002f39c	xorl	%eax, %eax
000000000002f39e	retq
000000000002f39f	movq	(%rbx), %rax
000000000002f3a2	movq	%rbx, %rdi
000000000002f3a5	movl	$0x10, %esi
000000000002f3aa	jmp	0x2f3c4
000000000002f3ac	movq	(%rbx), %rax
000000000002f3af	movq	%rbx, %rdi
000000000002f3b2	movl	$0xf, %esi
000000000002f3b7	jmp	0x2f3c4
000000000002f3b9	movq	(%rbx), %rax
000000000002f3bc	movq	%rbx, %rdi
000000000002f3bf	movl	$0x11, %esi
000000000002f3c4	callq	*0xc8(%rax)
000000000002f3ca	movq	(%rbx), %rax
000000000002f3cd	movq	0x9b0ec(%rip), %rsi             ## literal pool symbol address: _kCMTimeZero
000000000002f3d4	movsd	0x8014c(%rip), %xmm0
000000000002f3dc	movq	%rbx, %rdi
000000000002f3df	callq	*0x30(%rax)
000000000002f3e2	movb	$0x1, %al
000000000002f3e4	addq	$0x8, %rsp
000000000002f3e8	popq	%rbx
000000000002f3e9	popq	%rbp
000000000002f3ea	retq
000000000002f3eb	nop
000000000002f3ec	popfq
000000000002f3ed	.byte 0xff #bad opcode
000000000002f3ee	.byte 0xff #bad opcode
000000000002f3ef	decl	%ebp
000000000002f3f1	.byte 0xff #bad opcode
000000000002f3f2	.byte 0xff #bad opcode
000000000002f3f3	pushq	-0x3f000001(%rbx)
000000000002f3f9	.byte 0xff #bad opcode
000000000002f3fa	.byte 0xff #bad opcode
000000000002f3fb	callq	*0x48(%rbp)
000000000002f3fe	movl	%esp, %ebp
000000000002f400	pushq	%r15
000000000002f402	pushq	%r14
000000000002f404	pushq	%r13
000000000002f406	pushq	%r12
000000000002f408	pushq	%rbx
000000000002f409	subq	$0x28, %rsp
000000000002f40d	movq	%rdx, %r15
000000000002f410	movl	%esi, -0x2c(%rbp)
000000000002f413	movq	%rdi, %rbx
000000000002f416	movq	0xa0(%rdi), %rax
000000000002f41d	testq	%rax, %rax
000000000002f420	je	0x2f42b
000000000002f422	movq	0x30(%rax), %rdi
000000000002f426	testq	%rdi, %rdi
000000000002f429	jne	0x2f42f
000000000002f42b	leaq	0x8(%rbx), %rdi
000000000002f42f	callq	0xacb16                         ## symbol stub for: __ZN10PCSpinLock4lockEv
000000000002f434	movl	-0x2c(%rbp), %eax
000000000002f437	testb	%al, %al
000000000002f439	jne	0x2f4fc
000000000002f43f	testq	%r15, %r15
000000000002f442	je	0x2f4fc
000000000002f448	cmpb	$0x0, 0x90(%rbx)
000000000002f44f	je	0x2f4fc
000000000002f455	xorps	%xmm0, %xmm0
000000000002f458	movaps	%xmm0, -0x50(%rbp)
000000000002f45c	movq	$0x0, -0x40(%rbp)
000000000002f464	movq	%rbx, %rdi
000000000002f467	movq	%r15, %rsi
000000000002f46a	callq	__ZN8OZSpline13getVertexIterEPv ## OZSpline::getVertexIter(void*)
000000000002f46f	movq	%rax, %r14
000000000002f472	movq	0x10(%rbx), %r12
000000000002f476	movq	0x18(%rbx), %r13
000000000002f47a	cmpq	%r13, %rax
000000000002f47d	je	0x2f497
000000000002f47f	movq	%r14, %r15
000000000002f482	leaq	-0x50(%rbp), %rdi
000000000002f486	movq	%r15, %rsi
000000000002f489	callq	__ZNSt3__16vectorIP8OZVertexNS_9allocatorIS2_EEE9push_backB9nqe210106ERKS2_ ## std::__1::vector<OZVertex*, std::__1::allocator<OZVertex*>>::push_back[abi:nqe210106](OZVertex* const&)
000000000002f48e	addq	$0x8, %r15
000000000002f492	cmpq	%r13, %r15
000000000002f495	jne	0x2f482
000000000002f497	cmpq	%r14, %r12
000000000002f49a	je	0x2f4b4
000000000002f49c	leaq	-0x50(%rbp), %r13
000000000002f4a0	movq	%r13, %rdi
000000000002f4a3	movq	%r12, %rsi
000000000002f4a6	callq	__ZNSt3__16vectorIP8OZVertexNS_9allocatorIS2_EEE9push_backB9nqe210106ERKS2_ ## std::__1::vector<OZVertex*, std::__1::allocator<OZVertex*>>::push_back[abi:nqe210106](OZVertex* const&)
000000000002f4ab	addq	$0x8, %r12
000000000002f4af	cmpq	%r14, %r12
000000000002f4b2	jne	0x2f4a0
000000000002f4b4	movq	-0x50(%rbp), %r15
000000000002f4b8	movq	0x10(%rbx), %rax
000000000002f4bc	movq	%rax, 0x18(%rbx)
000000000002f4c0	cmpq	-0x48(%rbp), %r15
000000000002f4c4	je	0x2f4df
000000000002f4c6	leaq	0x10(%rbx), %r12
000000000002f4ca	movq	%r12, %rdi
000000000002f4cd	movq	%r15, %rsi
000000000002f4d0	callq	__ZNSt3__16vectorIP8OZVertexNS_9allocatorIS2_EEE9push_backB9nqe210106ERKS2_ ## std::__1::vector<OZVertex*, std::__1::allocator<OZVertex*>>::push_back[abi:nqe210106](OZVertex* const&)
000000000002f4d5	addq	$0x8, %r15
000000000002f4d9	cmpq	-0x48(%rbp), %r15
000000000002f4dd	jne	0x2f4ca
000000000002f4df	movq	%rbx, %rdi
000000000002f4e2	callq	__ZN8OZSpline13reparametrizeEv  ## OZSpline::reparametrize()
000000000002f4e7	movq	-0x50(%rbp), %rdi
000000000002f4eb	testq	%rdi, %rdi
000000000002f4ee	je	0x2f4f9
000000000002f4f0	movq	%rdi, -0x48(%rbp)
000000000002f4f4	callq	0xace04                         ## symbol stub for: __ZdlPv
000000000002f4f9	movl	-0x2c(%rbp), %eax
000000000002f4fc	movb	%al, 0x90(%rbx)
000000000002f502	movb	$0x1, 0x91(%rbx)
000000000002f509	movups	0x10(%rbx), %xmm0
000000000002f50d	movups	%xmm0, 0x28(%rbx)
000000000002f511	xorps	%xmm0, %xmm0
000000000002f514	movups	%xmm0, 0x78(%rbx)
000000000002f518	movq	$0x0, 0x88(%rbx)
000000000002f523	movq	%rbx, %rdi
000000000002f526	callq	__ZN8OZSpline24refreshValidVerticesListEv ## OZSpline::refreshValidVerticesList()
000000000002f52b	movq	0xa0(%rbx), %rax
000000000002f532	testq	%rax, %rax
000000000002f535	je	0x2f540
000000000002f537	movq	0x30(%rax), %rdi
000000000002f53b	testq	%rdi, %rdi
000000000002f53e	jne	0x2f547
000000000002f540	addq	$0x8, %rbx
000000000002f544	movq	%rbx, %rdi
000000000002f547	callq	0xacb1c                         ## symbol stub for: __ZN10PCSpinLock6unlockEv
000000000002f54c	addq	$0x28, %rsp
000000000002f550	popq	%rbx
000000000002f551	popq	%r12
000000000002f553	popq	%r13
000000000002f555	popq	%r14
000000000002f557	popq	%r15
000000000002f559	popq	%rbp
000000000002f55a	retq
000000000002f55b	jmp	0x2f561
000000000002f55d	jmp	0x2f561
000000000002f55f	jmp	0x2f561
000000000002f561	movq	%rax, %rbx
000000000002f564	movq	-0x50(%rbp), %rdi
000000000002f568	testq	%rdi, %rdi
000000000002f56b	je	0x2f576
000000000002f56d	movq	%rdi, -0x48(%rbp)
000000000002f571	callq	0xace04                         ## symbol stub for: __ZdlPv
000000000002f576	movq	%rbx, %rdi
000000000002f579	callq	0xacaf2                         ## symbol stub for: __Unwind_Resume
