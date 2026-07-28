__ZNSt3__120__shared_ptr_pointerIP12OZFrameQueueNS_10shared_ptrIS1_E27__shared_ptr_default_deleteIS1_S1_EENS_9allocatorIS1_EEE16__on_zero_sharedEv:
00000000000429e0	pushq	%rbp
00000000000429e1	movq	%rsp, %rbp
00000000000429e4	pushq	%r15
00000000000429e6	pushq	%r14
00000000000429e8	pushq	%r12
00000000000429ea	pushq	%rbx
00000000000429eb	movq	0x18(%rdi), %rbx
00000000000429ef	testq	%rbx, %rbx
00000000000429f2	je	0x42a58
00000000000429f4	leaq	0x18(%rbx), %rdi
00000000000429f8	callq	0x6def04                        ## symbol stub for: __ZN7PCMutexD1Ev
00000000000429fd	movq	(%rbx), %r15
0000000000042a00	testq	%r15, %r15
0000000000042a03	je	0x42a6d
0000000000042a05	movq	0x8(%rbx), %r12
0000000000042a09	movq	%r15, %rdi
0000000000042a0c	cmpq	%r12, %r15
0000000000042a0f	jne	0x42a29
0000000000042a11	jmp	0x42a64
0000000000042a13	nopw	%cs:(%rax,%rax)
0000000000042a20	addq	$-0x30, %r12
0000000000042a24	cmpq	%r15, %r12
0000000000042a27	je	0x42a61
0000000000042a29	movq	-0x10(%r12), %r14
0000000000042a2e	testq	%r14, %r14
0000000000042a31	je	0x42a20
0000000000042a33	movq	$-0x1, %rax
0000000000042a3a	lock
0000000000042a3b	xaddq	%rax, 0x8(%r14)
0000000000042a40	testq	%rax, %rax
0000000000042a43	jne	0x42a20
0000000000042a45	movq	(%r14), %rax
0000000000042a48	movq	%r14, %rdi
0000000000042a4b	callq	*0x10(%rax)
0000000000042a4e	movq	%r14, %rdi
0000000000042a51	callq	0x6dfbbe                        ## symbol stub for: __ZNSt3__119__shared_weak_count14__release_weakEv
0000000000042a56	jmp	0x42a20
0000000000042a58	popq	%rbx
0000000000042a59	popq	%r12
0000000000042a5b	popq	%r14
0000000000042a5d	popq	%r15
0000000000042a5f	popq	%rbp
0000000000042a60	retq
0000000000042a61	movq	(%rbx), %rdi
0000000000042a64	movq	%r15, 0x8(%rbx)
0000000000042a68	callq	0x6dfc36                        ## symbol stub for: __ZdlPv
0000000000042a6d	movq	%rbx, %rdi
0000000000042a70	popq	%rbx
0000000000042a71	popq	%r12
0000000000042a73	popq	%r14
0000000000042a75	popq	%r15
0000000000042a77	popq	%rbp
0000000000042a78	jmp	0x6dfc36                        ## symbol stub for: __ZdlPv
0000000000042a7d	nopl	(%rax)
__ZNKSt3__120__shared_ptr_pointerIP12OZFrameQueueNS_10shared_ptrIS1_E27__shared_ptr_default_deleteIS1_S1_EENS_9allocatorIS1_EEE13__get_deleterERKSt9type_info:
0000000000042a80	pushq	%rbp
0000000000042a81	movq	%rsp, %rbp
0000000000042a84	movq	0x8(%rsi), %rcx
0000000000042a88	xorl	%eax, %eax
0000000000042a8a	cmpq	0x7e4677(%rip), %rcx            ## literal pool symbol address: __ZTSNSt3__110shared_ptrI12OZFrameQueueE27__shared_ptr_default_deleteIS1_S1_EE
0000000000042a91	leaq	0x18(%rdi), %rcx
0000000000042a95	cmoveq	%rcx, %rax
0000000000042a99	popq	%rbp
0000000000042a9a	retq
0000000000042a9b	nopl	(%rax,%rax)
__ZNSt3__120__shared_ptr_pointerIP12OZFrameQueueNS_10shared_ptrIS1_E27__shared_ptr_default_deleteIS1_S1_EENS_9allocatorIS1_EEE21__on_zero_shared_weakEv:
0000000000042aa0	pushq	%rbp
0000000000042aa1	movq	%rsp, %rbp
0000000000042aa4	popq	%rbp
0000000000042aa5	jmp	0x6dfc36                        ## symbol stub for: __ZdlPv
0000000000042aaa	nopw	(%rax,%rax)
__ZNSt3__120__shared_ptr_pointerIP22OZIdentityTimeStrategyNS_10shared_ptrI14OZTimeStrategyE27__shared_ptr_default_deleteIS4_S1_EENS_9allocatorIS1_EEED1Ev:
0000000000042ab0	pushq	%rbp
0000000000042ab1	movq	%rsp, %rbp
0000000000042ab4	popq	%rbp
0000000000042ab5	jmp	0x6dfbca                        ## symbol stub for: __ZNSt3__119__shared_weak_countD2Ev
0000000000042aba	nopw	(%rax,%rax)
__ZNSt3__120__shared_ptr_pointerIP22OZIdentityTimeStrategyNS_10shared_ptrI14OZTimeStrategyE27__shared_ptr_default_deleteIS4_S1_EENS_9allocatorIS1_EEED0Ev:
0000000000042ac0	pushq	%rbp
0000000000042ac1	movq	%rsp, %rbp
0000000000042ac4	pushq	%rbx
0000000000042ac5	pushq	%rax
0000000000042ac6	movq	%rdi, %rbx
0000000000042ac9	callq	0x6dfbca                        ## symbol stub for: __ZNSt3__119__shared_weak_countD2Ev
0000000000042ace	movq	%rbx, %rdi
0000000000042ad1	addq	$0x8, %rsp
