__ZN13PCSharedMutex4lockEv:
00000000000acfea	pushq	%rbp
00000000000acfeb	movq	%rsp, %rbp
00000000000acfee	pushq	%r15
00000000000acff0	pushq	%r14
00000000000acff2	pushq	%rbx
00000000000acff3	pushq	%rax
00000000000acff4	movq	%rdi, %rbx
00000000000acff7	callq	0xdeada                         ## symbol stub for: _pthread_self
00000000000acffc	movq	%rax, %r14
00000000000acfff	movq	%rbx, %rdi
00000000000ad002	callq	0xde654                         ## symbol stub for: __ZNSt3__15mutex4lockEv
00000000000ad007	movq	0x40(%rbx), %rax
00000000000ad00b	cmpq	%rax, %r14
00000000000ad00e	je	0xad068
00000000000ad010	movq	%rbx, %rdi
00000000000ad013	callq	0xde65a                         ## symbol stub for: __ZNSt3__15mutex6unlockEv
00000000000ad018	xorl	%eax, %eax
00000000000ad01a	lock
00000000000ad01b	cmpxchgq	%r14, 0x40(%rbx)
00000000000ad020	je	0xad040
00000000000ad022	leaq	-0x20(%rbp), %r15
00000000000ad026	movq	$0x186a0, -0x20(%rbp)           ## imm = 0x186A0
00000000000ad02e	movq	%r15, %rdi
00000000000ad031	callq	0xde54c                         ## symbol stub for: __ZNSt3__111this_thread9sleep_forERKNS_6chrono8durationIxNS_5ratioILl1ELl1000000000EEEEE
00000000000ad036	xorl	%eax, %eax
00000000000ad038	lock
00000000000ad039	cmpxchgq	%r14, 0x40(%rbx)
00000000000ad03e	jne	0xad026
00000000000ad040	movq	%rbx, %rdi
00000000000ad043	callq	0xde654                         ## symbol stub for: __ZNSt3__15mutex4lockEv
00000000000ad048	movq	0x58(%rbx), %r14
00000000000ad04c	movq	0x50(%rbx), %r15
00000000000ad050	movq	%rbx, %rdi
00000000000ad053	callq	0xde65a                         ## symbol stub for: __ZNSt3__15mutex6unlockEv
00000000000ad058	cmpq	%r15, %r14
00000000000ad05b	jne	0xad040
00000000000ad05d	addq	$0x8, %rsp
00000000000ad061	popq	%rbx
00000000000ad062	popq	%r14
00000000000ad064	popq	%r15
00000000000ad066	popq	%rbp
00000000000ad067	retq
00000000000ad068	incl	0x48(%rbx)
00000000000ad06b	movq	%rbx, %rdi
00000000000ad06e	addq	$0x8, %rsp
00000000000ad072	popq	%rbx
00000000000ad073	popq	%r14
00000000000ad075	popq	%r15
00000000000ad077	popq	%rbp
00000000000ad078	jmp	0xde65a                         ## symbol stub for: __ZNSt3__15mutex6unlockEv
00000000000ad07d	movq	%rax, %rdi
00000000000ad080	callq	___clang_call_terminate
00000000000ad085	nop
