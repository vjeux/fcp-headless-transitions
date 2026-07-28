__ZN18FFPendingShutdowns39createShutdownSyncerForCurrentlyPendingEv:
0000000000d78820	pushq	%rbp
0000000000d78821	movq	%rsp, %rbp
0000000000d78824	pushq	%r15
0000000000d78826	pushq	%r14
0000000000d78828	pushq	%r13
0000000000d7882a	pushq	%r12
0000000000d7882c	pushq	%rbx
0000000000d7882d	subq	$0xf8, %rsp
0000000000d78834	movq	%rdi, %rbx
0000000000d78837	movq	0xb7538a(%rip), %rax            ## literal pool symbol address: ___stack_chk_guard
0000000000d7883e	movq	(%rax), %rax
0000000000d78841	movq	%rax, -0x30(%rbp)
0000000000d78845	leaq	_OBJC_CLASS_$_FFWaitSync(%rip), %rdi
0000000000d7884c	callq	0x14978fc                       ## symbol stub for: _objc_alloc
0000000000d78851	movq	0xe4acc8(%rip), %rsi
0000000000d78858	leaq	0xc360a9(%rip), %rdx            ## Objc cfstring ref: @"bad cfstring ref"
0000000000d7885f	movq	0xb74e5a(%rip), %r14            ## Objc message: -[%rdi _waitForThreadToFinish]
0000000000d78866	movq	%rax, %rdi
0000000000d78869	callq	*%r14
0000000000d7886c	movq	%rax, -0xc8(%rbp)
0000000000d78873	leaq	_OBJC_CLASS_$_FFPlayer(%rip), %rdi
0000000000d7887a	callq	0x149798c                       ## symbol stub for: _objc_opt_class
0000000000d7887f	movq	%rax, -0xb8(%rbp)
0000000000d78886	movq	%rax, %rdi
0000000000d78889	callq	0x14979e6                       ## symbol stub for: _objc_sync_enter
0000000000d7888e	xorps	%xmm0, %xmm0
0000000000d78891	movaps	%xmm0, -0x120(%rbp)
0000000000d78898	movaps	%xmm0, -0x110(%rbp)
0000000000d7889f	movaps	%xmm0, -0x100(%rbp)
0000000000d788a6	movaps	%xmm0, -0xf0(%rbp)
0000000000d788ad	movq	%rbx, -0xd8(%rbp)
0000000000d788b4	movq	(%rbx), %rdi
0000000000d788b7	movq	0xe3fc32(%rip), %rsi
0000000000d788be	leaq	-0x120(%rbp), %rdx
0000000000d788c5	leaq	-0xb0(%rbp), %rcx
0000000000d788cc	movl	$0x10, %r8d
0000000000d788d2	movq	%rdi, -0xc0(%rbp)
0000000000d788d9	callq	*%r14
0000000000d788dc	testq	%rax, %rax
0000000000d788df	je	0xd789b0
0000000000d788e5	movq	%rax, %rbx
0000000000d788e8	movq	-0x110(%rbp), %rax
0000000000d788ef	movq	(%rax), %rax
0000000000d788f2	movq	%rax, -0xd0(%rbp)
0000000000d788f9	nopl	(%rax)
0000000000d78900	movq	0xe40851(%rip), %r13
0000000000d78907	movq	0xe79d62(%rip), %r12
0000000000d7890e	xorl	%r14d, %r14d
0000000000d78911	nopw	%cs:(%rax,%rax)
0000000000d78920	movq	-0x110(%rbp), %rax
0000000000d78927	movq	-0xd0(%rbp), %rcx
0000000000d7892e	cmpq	%rcx, (%rax)
0000000000d78931	je	0xd7893f
0000000000d78933	movq	-0xc0(%rbp), %rdi
0000000000d7893a	callq	0x149793e                       ## symbol stub for: _objc_enumerationMutation
0000000000d7893f	movq	-0x118(%rbp), %rax
0000000000d78946	movq	(%rax,%r14,8), %rdx
0000000000d7894a	movq	-0xd8(%rbp), %rax
0000000000d78951	movq	(%rax), %rdi
0000000000d78954	movq	%r13, %rsi
0000000000d78957	movq	0xb74d62(%rip), %r15            ## Objc message: -[%rdi _waitForThreadToFinish]
0000000000d7895e	callq	*%r15
0000000000d78961	movq	%rax, %rdi
0000000000d78964	movq	%r12, %rsi
0000000000d78967	movq	-0xc8(%rbp), %rdx
0000000000d7896e	callq	*%r15
0000000000d78971	incq	%r14
0000000000d78974	cmpq	%r14, %rbx
0000000000d78977	jne	0xd78920
0000000000d78979	movl	$0x10, %r8d
0000000000d7897f	movq	-0xc0(%rbp), %rdi
0000000000d78986	movq	0xe3fb63(%rip), %rsi
0000000000d7898d	leaq	-0x120(%rbp), %rdx
0000000000d78994	leaq	-0xb0(%rbp), %rcx
0000000000d7899b	movq	0xb74d1e(%rip), %rax            ## Objc message: -[%rdi _waitForThreadToFinish]
0000000000d789a2	callq	*%rax
0000000000d789a4	movq	%rax, %rbx
0000000000d789a7	testq	%rax, %rax
0000000000d789aa	jne	0xd78900
0000000000d789b0	movq	-0xb8(%rbp), %rdi
0000000000d789b7	callq	0x14979ec                       ## symbol stub for: _objc_sync_exit
0000000000d789bc	movq	0xb75205(%rip), %rax            ## literal pool symbol address: ___stack_chk_guard
0000000000d789c3	movq	(%rax), %rax
0000000000d789c6	cmpq	-0x30(%rbp), %rax
0000000000d789ca	jne	0xd789e5
0000000000d789cc	movq	-0xc8(%rbp), %rax
0000000000d789d3	addq	$0xf8, %rsp
0000000000d789da	popq	%rbx
0000000000d789db	popq	%r12
0000000000d789dd	popq	%r13
0000000000d789df	popq	%r14
0000000000d789e1	popq	%r15
0000000000d789e3	popq	%rbp
0000000000d789e4	retq
0000000000d789e5	callq	0x14974f4                       ## symbol stub for: ___stack_chk_fail
0000000000d789ea	jmp	0xd789f0
0000000000d789ec	jmp	0xd789f0
0000000000d789ee	jmp	0xd789f0
0000000000d789f0	movq	%rax, %rbx
0000000000d789f3	movq	-0xb8(%rbp), %rdi
0000000000d789fa	callq	0x14979ec                       ## symbol stub for: _objc_sync_exit
0000000000d789ff	movq	%rbx, %rdi
0000000000d78a02	callq	0x1495d30                       ## symbol stub for: __Unwind_Resume
0000000000d78a07	nopw	(%rax,%rax)
