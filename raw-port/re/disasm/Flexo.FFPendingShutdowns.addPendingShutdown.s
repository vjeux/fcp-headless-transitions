__ZN18FFPendingShutdowns18addPendingShutdownEP8NSString:
0000000000d77fb0	pushq	%rbp
0000000000d77fb1	movq	%rsp, %rbp
0000000000d77fb4	pushq	%r15
0000000000d77fb6	pushq	%r14
0000000000d77fb8	pushq	%r12
0000000000d77fba	pushq	%rbx
0000000000d77fbb	movq	%rsi, %r14
0000000000d77fbe	movq	%rdi, %r15
0000000000d77fc1	leaq	_OBJC_CLASS_$_FFPlayer(%rip), %rdi
0000000000d77fc8	callq	0x149798c                       ## symbol stub for: _objc_opt_class
0000000000d77fcd	movq	%rax, %rbx
0000000000d77fd0	movq	%rax, %rdi
0000000000d77fd3	callq	0x14979e6                       ## symbol stub for: _objc_sync_enter
0000000000d77fd8	movq	(%r15), %rdi
0000000000d77fdb	movq	0xe41176(%rip), %rsi
0000000000d77fe2	movq	%r14, %rdx
0000000000d77fe5	callq	*0xb756d5(%rip)                 ## Objc message: -[%rdi _waitForThreadToFinish]
0000000000d77feb	testq	%rax, %rax
0000000000d77fee	jne	0xd78041
0000000000d77ff0	leaq	_OBJC_CLASS_$_FFPendingPlayerShutdownRecord(%rip), %rdi
0000000000d77ff7	callq	0x14978fc                       ## symbol stub for: _objc_alloc
0000000000d77ffc	movq	0xe476c5(%rip), %rsi
0000000000d78003	movq	%rax, %rdi
0000000000d78006	movq	%r14, %rdx
0000000000d78009	callq	*0xb756b1(%rip)                 ## Objc message: -[%rdi _waitForThreadToFinish]
0000000000d7800f	movq	%rax, %r12
0000000000d78012	movq	(%r15), %rdi
0000000000d78015	movq	0xe40814(%rip), %rsi
0000000000d7801c	movq	%rax, %rdx
0000000000d7801f	movq	%r14, %rcx
0000000000d78022	callq	*0xb75698(%rip)                 ## Objc message: -[%rdi _waitForThreadToFinish]
0000000000d78028	movq	%r12, %rdi
0000000000d7802b	callq	*0xb756d7(%rip)                 ## literal pool symbol address: _objc_release
0000000000d78031	movq	%rbx, %rdi
0000000000d78034	popq	%rbx
0000000000d78035	popq	%r12
0000000000d78037	popq	%r14
0000000000d78039	popq	%r15
0000000000d7803b	popq	%rbp
0000000000d7803c	jmp	0x14979ec                       ## symbol stub for: _objc_sync_exit
0000000000d78041	movq	0xb75348(%rip), %rdi            ## literal pool symbol address: _OBJC_CLASS_$_NSAssertionHandler
0000000000d78048	movq	0xe417d9(%rip), %rsi
0000000000d7804f	callq	*0xb7566b(%rip)                 ## Objc message: -[%rdi _waitForThreadToFinish]
0000000000d78055	movq	%rax, %r12
0000000000d78058	movq	0xb75509(%rip), %rdi            ## literal pool symbol address: _OBJC_CLASS_$_NSString
0000000000d7805f	movq	0xe4bd0a(%rip), %rsi
0000000000d78066	leaq	0x8e63cf(%rip), %rdx            ## literal pool for: "void FFPendingShutdowns::addPendingShutdown(NSString *)"
0000000000d7806d	callq	*0xb7564d(%rip)                 ## Objc message: -[%rdi _waitForThreadToFinish]
0000000000d78073	movq	0xe4e766(%rip), %rsi
0000000000d7807a	leaq	0xc35ca7(%rip), %rcx            ## Objc cfstring ref: @"bad cfstring ref"
0000000000d78081	leaq	0xc36860(%rip), %r9             ## Objc cfstring ref: @"bad cfstring ref"
0000000000d78088	movl	$0x598, %r8d                    ## imm = 0x598
0000000000d7808e	movq	%r12, %rdi
0000000000d78091	movq	%rax, %rdx
0000000000d78094	xorl	%eax, %eax
0000000000d78096	callq	*0xb75624(%rip)                 ## Objc message: -[%rdi _waitForThreadToFinish]
0000000000d7809c	jmp	0xd77ff0
0000000000d780a1	jmp	0xd780a3
0000000000d780a3	movq	%rax, %r14
0000000000d780a6	movq	%rbx, %rdi
0000000000d780a9	callq	0x14979ec                       ## symbol stub for: _objc_sync_exit
0000000000d780ae	movq	%r14, %rdi
0000000000d780b1	callq	0x1495d30                       ## symbol stub for: __Unwind_Resume
0000000000d780b6	nopw	%cs:(%rax,%rax)
