__ZN28FFCentralDecodingUnitManager7lockCDUEv:
0000000000dff150	pushq	%rbp
0000000000dff151	movq	%rsp, %rbp
0000000000dff154	cmpq	$-0x1, __ZZN28FFCentralDecodingUnitManager7lockCDUEvE11s_predicate(%rip) ## FFCentralDecodingUnitManager::lockCDU()::s_predicate
0000000000dff15c	jne	0xdff17f
0000000000dff15e	movq	__ZN28FFCentralDecodingUnitManager11s_semaphoreE(%rip), %rdi ## FFCentralDecodingUnitManager::s_semaphore
0000000000dff165	testq	%rdi, %rdi
0000000000dff168	je	0xdff176
0000000000dff16a	movq	$-0x1, %rsi
0000000000dff171	callq	0x14976b0                       ## symbol stub for: _dispatch_semaphore_wait
0000000000dff176	movq	__ZN28FFCentralDecodingUnitManager5s_cduE(%rip), %rax ## FFCentralDecodingUnitManager::s_cdu
0000000000dff17d	popq	%rbp
0000000000dff17e	retq
0000000000dff17f	callq	_CDU_processToken.cold.1
0000000000dff184	movq	__ZN28FFCentralDecodingUnitManager11s_semaphoreE(%rip), %rdi ## FFCentralDecodingUnitManager::s_semaphore
0000000000dff18b	testq	%rdi, %rdi
0000000000dff18e	jne	0xdff16a
0000000000dff190	jmp	0xdff176
0000000000dff192	nopw	%cs:(%rax,%rax)
____ZN28FFCentralDecodingUnitManager7lockCDUEv_block_invoke:
0000000000dff1a0	pushq	%rbp
0000000000dff1a1	movq	%rsp, %rbp
0000000000dff1a4	pushq	%r14
0000000000dff1a6	pushq	%rbx
0000000000dff1a7	movl	$0x1, %edi
0000000000dff1ac	callq	0x14976a4                       ## symbol stub for: _dispatch_semaphore_create
0000000000dff1b1	movq	%rax, __ZN28FFCentralDecodingUnitManager11s_semaphoreE(%rip) ## FFCentralDecodingUnitManager::s_semaphore
0000000000dff1b8	movl	$0x70, %edi
0000000000dff1bd	callq	0x1497452                       ## symbol stub for: __Znwm
0000000000dff1c2	movq	%rax, %rbx
0000000000dff1c5	callq	0x1496c3c                       ## symbol stub for: __ZN6PCInfo14getPhysicalCPUEv
0000000000dff1ca	cmpl	$0x15, %eax
0000000000dff1cd	movl	$0x14, %r14d
0000000000dff1d3	cmovgel	%eax, %r14d
0000000000dff1d7	leaq	0xb16fea(%rip), %rax
0000000000dff1de	movq	%rax, (%rbx)
0000000000dff1e1	xorps	%xmm0, %xmm0
0000000000dff1e4	movups	%xmm0, 0x8(%rbx)
0000000000dff1e8	movups	%xmm0, 0x18(%rbx)
0000000000dff1ec	movups	%xmm0, 0x28(%rbx)
0000000000dff1f0	movups	%xmm0, 0x38(%rbx)
0000000000dff1f4	movq	$0x0, 0x48(%rbx)
0000000000dff1fc	movl	$0x1, %esi
0000000000dff201	xorl	%edi, %edi
0000000000dff203	callq	0x1497680                       ## symbol stub for: _dispatch_queue_attr_make_with_autorelease_frequency
0000000000dff208	leaq	0x8638d8(%rip), %rdi            ## literal pool for: "com.apple.flexo.cdufig"
0000000000dff20f	movq	%rax, %rsi
0000000000dff212	callq	0x149768c                       ## symbol stub for: _dispatch_queue_create
0000000000dff217	movq	%rax, 0x50(%rbx)
0000000000dff21b	movb	$0x0, 0x58(%rbx)
0000000000dff21f	movl	%r14d, 0x5c(%rbx)
0000000000dff223	movl	$0x0, 0x60(%rbx)
0000000000dff22a	movq	%r14, %rdi
0000000000dff22d	callq	0x14976a4                       ## symbol stub for: _dispatch_semaphore_create
0000000000dff232	movq	%rax, 0x68(%rbx)
0000000000dff236	leaq	0xb16fb3(%rip), %rax
0000000000dff23d	movq	%rax, (%rbx)
0000000000dff240	movq	%rbx, __ZN28FFCentralDecodingUnitManager5s_cduE(%rip) ## FFCentralDecodingUnitManager::s_cdu
0000000000dff247	leaq	__ZN28FFCentralDecodingUnitManager8shutdownEv(%rip), %rdi ## FFCentralDecodingUnitManager::shutdown()
0000000000dff24e	popq	%rbx
0000000000dff24f	popq	%r14
0000000000dff251	popq	%rbp
0000000000dff252	jmp	0x149756c                       ## symbol stub for: _atexit
0000000000dff257	movq	%rax, %r14
0000000000dff25a	movq	%rbx, %rdi
0000000000dff25d	callq	0x1497404                       ## symbol stub for: __ZdlPv
0000000000dff262	movq	%r14, %rdi
0000000000dff265	callq	0x1495d30                       ## symbol stub for: __Unwind_Resume
0000000000dff26a	nopw	(%rax,%rax)
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
__ZN28FFCentralDecodingUnitManager8shutdownEv:
0000000000dff300	movq	__ZN28FFCentralDecodingUnitManager11s_semaphoreE(%rip), %rdi ## FFCentralDecodingUnitManager::s_semaphore
0000000000dff307	testq	%rdi, %rdi
0000000000dff30a	je	0xdff346
0000000000dff30c	pushq	%rbp
0000000000dff30d	movq	%rsp, %rbp
0000000000dff310	movq	$-0x1, %rsi
0000000000dff317	callq	0x14976b0                       ## symbol stub for: _dispatch_semaphore_wait
0000000000dff31c	movq	__ZN28FFCentralDecodingUnitManager5s_cduE(%rip), %rdi ## FFCentralDecodingUnitManager::s_cdu
0000000000dff323	testq	%rdi, %rdi
0000000000dff326	je	0xdff32e
0000000000dff328	movq	(%rdi), %rax
0000000000dff32b	callq	*0x8(%rax)
0000000000dff32e	movq	$0x0, __ZN28FFCentralDecodingUnitManager5s_cduE(%rip) ## FFCentralDecodingUnitManager::s_cdu
0000000000dff339	movq	__ZN28FFCentralDecodingUnitManager11s_semaphoreE(%rip), %rdi ## FFCentralDecodingUnitManager::s_semaphore
0000000000dff340	popq	%rbp
0000000000dff341	jmp	0x14976aa                       ## symbol stub for: _dispatch_semaphore_signal
0000000000dff346	retq
0000000000dff347	nopw	(%rax,%rax)
__ZN28FFCentralDecodingUnitManager6getCDUEv:
