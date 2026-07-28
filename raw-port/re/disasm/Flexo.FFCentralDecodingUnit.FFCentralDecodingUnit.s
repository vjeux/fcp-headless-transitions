__ZN21FFCentralDecodingUnitC1Ev:
0000000000dff270	pushq	%rbp
0000000000dff271	movq	%rsp, %rbp
0000000000dff274	pushq	%r14
0000000000dff276	pushq	%rbx
0000000000dff277	movq	%rdi, %rbx
0000000000dff27a	callq	0x1496c3c                       ## symbol stub for: __ZN6PCInfo14getPhysicalCPUEv
0000000000dff27f	cmpl	$0x15, %eax
0000000000dff282	movl	$0x14, %r14d
0000000000dff288	cmovgel	%eax, %r14d
0000000000dff28c	leaq	0xb16f35(%rip), %rax
0000000000dff293	movq	%rax, (%rbx)
0000000000dff296	xorps	%xmm0, %xmm0
0000000000dff299	movups	%xmm0, 0x8(%rbx)
0000000000dff29d	movups	%xmm0, 0x18(%rbx)
0000000000dff2a1	movups	%xmm0, 0x28(%rbx)
0000000000dff2a5	movups	%xmm0, 0x38(%rbx)
0000000000dff2a9	movq	$0x0, 0x48(%rbx)
0000000000dff2b1	movl	$0x1, %esi
0000000000dff2b6	xorl	%edi, %edi
0000000000dff2b8	callq	0x1497680                       ## symbol stub for: _dispatch_queue_attr_make_with_autorelease_frequency
0000000000dff2bd	leaq	0x863823(%rip), %rdi            ## literal pool for: "com.apple.flexo.cdufig"
0000000000dff2c4	movq	%rax, %rsi
0000000000dff2c7	callq	0x149768c                       ## symbol stub for: _dispatch_queue_create
0000000000dff2cc	movq	%rax, 0x50(%rbx)
0000000000dff2d0	movb	$0x0, 0x58(%rbx)
0000000000dff2d4	movl	%r14d, 0x5c(%rbx)
0000000000dff2d8	movl	$0x0, 0x60(%rbx)
0000000000dff2df	movq	%r14, %rdi
0000000000dff2e2	callq	0x14976a4                       ## symbol stub for: _dispatch_semaphore_create
0000000000dff2e7	movq	%rax, 0x68(%rbx)
0000000000dff2eb	leaq	0xb16efe(%rip), %rax
0000000000dff2f2	movq	%rax, (%rbx)
0000000000dff2f5	popq	%rbx
0000000000dff2f6	popq	%r14
0000000000dff2f8	popq	%rbp
0000000000dff2f9	retq
0000000000dff2fa	nopw	(%rax,%rax)
