__ZN25CustomPixelFormatRegistry4findEj:
00000000012e2c70	pushq	%rbp
00000000012e2c71	movq	%rsp, %rbp
00000000012e2c74	pushq	%r15
00000000012e2c76	pushq	%r14
00000000012e2c78	pushq	%rbx
00000000012e2c79	subq	$0x18, %rsp
00000000012e2c7d	movl	%esi, %r14d
00000000012e2c80	movq	%rdi, %r15
00000000012e2c83	movq	(%rdi), %rbx
00000000012e2c86	movq	%rbx, -0x28(%rbp)
00000000012e2c8a	movb	$0x0, -0x20(%rbp)
00000000012e2c8e	movq	%rbx, %rdi
00000000012e2c91	callq	__ZN16FFSynchronizable4LockEv   ## FFSynchronizable::Lock()
00000000012e2c96	movq	0x10(%r15), %rcx
00000000012e2c9a	testq	%rcx, %rcx
00000000012e2c9d	je	0x12e2cd1
00000000012e2c9f	addq	$0x10, %r15
00000000012e2ca3	movq	%r15, %rax
00000000012e2ca6	nopw	%cs:(%rax,%rax)
00000000012e2cb0	xorl	%edx, %edx
00000000012e2cb2	cmpl	%r14d, 0x20(%rcx)
00000000012e2cb6	setb	%dl
00000000012e2cb9	cmovaeq	%rcx, %rax
00000000012e2cbd	movq	(%rcx,%rdx,8), %rcx
00000000012e2cc1	testq	%rcx, %rcx
00000000012e2cc4	jne	0x12e2cb0
00000000012e2cc6	cmpq	%r15, %rax
00000000012e2cc9	je	0x12e2cd1
00000000012e2ccb	cmpl	0x20(%rax), %r14d
00000000012e2ccf	jae	0x12e2cfa
00000000012e2cd1	xorl	%edi, %edi
00000000012e2cd3	callq	*0x60aa37(%rip)                 ## literal pool symbol address: _objc_retain
00000000012e2cd9	movq	%rax, %rdi
00000000012e2cdc	callq	0x149790e                       ## symbol stub for: _objc_autorelease
00000000012e2ce1	movq	%rax, %r14
00000000012e2ce4	movq	%rbx, %rdi
00000000012e2ce7	callq	__ZN16FFSynchronizable6UnlockEv ## FFSynchronizable::Unlock()
00000000012e2cec	movq	%r14, %rax
00000000012e2cef	addq	$0x18, %rsp
00000000012e2cf3	popq	%rbx
00000000012e2cf4	popq	%r14
00000000012e2cf6	popq	%r15
00000000012e2cf8	popq	%rbp
00000000012e2cf9	retq
00000000012e2cfa	movq	0x28(%rax), %rdi
00000000012e2cfe	jmp	0x12e2cd3
00000000012e2d00	movq	%rax, %rdi
00000000012e2d03	callq	___clang_call_terminate
00000000012e2d08	movq	%rax, %rbx
00000000012e2d0b	leaq	-0x28(%rbp), %rdi
00000000012e2d0f	callq	__ZN14FFSynchronizerD1Ev        ## FFSynchronizer::~FFSynchronizer()
00000000012e2d14	movq	%rbx, %rdi
00000000012e2d17	callq	0x1495d30                       ## symbol stub for: __Unwind_Resume
00000000012e2d1c	nopl	(%rax)
