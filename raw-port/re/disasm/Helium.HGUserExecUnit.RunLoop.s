__ZN14HGUserExecUnit7RunLoopEv:
0000000000095e10	pushq	%rbp
0000000000095e11	movq	%rsp, %rbp
0000000000095e14	pushq	%r15
0000000000095e16	pushq	%r14
0000000000095e18	pushq	%r12
0000000000095e1a	pushq	%rbx
0000000000095e1b	subq	$0x20, %rsp
0000000000095e1f	movq	%rdi, %rbx
0000000000095e22	leaq	0x845dbd(%rip), %rdi            ## literal pool for: "com.apple.helium-render-queue-exec-unit-user"
0000000000095e29	callq	0x3c55a0                        ## symbol stub for: _pthread_setname_np
0000000000095e2e	movq	0x10(%rbx), %rdi
0000000000095e32	callq	__ZN13HGRenderQueue14IsShuttingDownEv ## HGRenderQueue::IsShuttingDown()
0000000000095e37	testb	%al, %al
0000000000095e39	je	0x95e6b
0000000000095e3b	movq	0x10(%rbx), %rax
0000000000095e3f	movq	0x1d0(%rax), %r14
0000000000095e46	movq	%r14, %rdi
0000000000095e49	callq	__ZN16HGSynchronizable4LockEv   ## HGSynchronizable::Lock()
0000000000095e4e	movl	$0x3, %eax
0000000000095e53	xchgl	%eax, 0x8(%rbx)
0000000000095e56	movq	%r14, %rdi
0000000000095e59	callq	__ZN16HGSynchronizable6UnlockEv ## HGSynchronizable::Unlock()
0000000000095e5e	addq	$0x20, %rsp
0000000000095e62	popq	%rbx
0000000000095e63	popq	%r12
0000000000095e65	popq	%r14
0000000000095e67	popq	%r15
0000000000095e69	popq	%rbp
0000000000095e6a	retq
0000000000095e6b	leaq	-0x28(%rbp), %r14
0000000000095e6f	movl	$0x188, %r12d                   ## imm = 0x188
0000000000095e75	jmp	0x95e8d
0000000000095e77	nopw	(%rax,%rax)
0000000000095e80	movq	0x10(%rbx), %rdi
0000000000095e84	callq	__ZN13HGRenderQueue14IsShuttingDownEv ## HGRenderQueue::IsShuttingDown()
0000000000095e89	testb	%al, %al
0000000000095e8b	jne	0x95e3b
0000000000095e8d	movq	$0x0, -0x28(%rbp)
0000000000095e95	movq	0x10(%rbx), %rdi
0000000000095e99	movq	%rbx, %rsi
0000000000095e9c	movq	%r14, %rdx
0000000000095e9f	callq	__ZN13HGRenderQueue10GetUserJobEP14HGUserExecUnitPP9HGUserJob ## HGRenderQueue::GetUserJob(HGUserExecUnit*, HGUserJob**)
0000000000095ea4	testl	%eax, %eax
0000000000095ea6	je	0x95e80
0000000000095ea8	movl	$0x2, %eax
0000000000095ead	xchgl	%eax, 0x8(%rbx)
0000000000095eb0	movq	-0x28(%rbp), %rdi
0000000000095eb4	movl	$0x3, %esi
0000000000095eb9	callq	__ZN9HGUserJob8SetStateENS_5StateE ## HGUserJob::SetState(HGUserJob::State)
0000000000095ebe	movq	-0x28(%rbp), %rdi
0000000000095ec2	callq	__ZN9HGUserJob14CallNotifyFuncEv ## HGUserJob::CallNotifyFunc()
0000000000095ec7	movq	0x10(%rbx), %rax
0000000000095ecb	movq	0x1d0(%rax), %r15
0000000000095ed2	movq	%r15, -0x38(%rbp)
0000000000095ed6	movb	$0x0, -0x30(%rbp)
0000000000095eda	movq	%r15, %rdi
0000000000095edd	callq	__ZN16HGSynchronizable4LockEv   ## HGSynchronizable::Lock()
0000000000095ee2	movq	0x10(%rbx), %rdi
0000000000095ee6	addq	%r12, %rdi
0000000000095ee9	movq	%r14, %rsi
0000000000095eec	callq	__ZNSt3__14listIP16HGGPUReadbackJobNS_9allocatorIS2_EEE6removeERKS2_ ## std::__1::list<HGGPUReadbackJob*, std::__1::allocator<HGGPUReadbackJob*>>::remove(HGGPUReadbackJob* const&)
0000000000095ef1	movq	%r15, %rdi
0000000000095ef4	callq	__ZN16HGSynchronizable6UnlockEv ## HGSynchronizable::Unlock()
0000000000095ef9	movq	-0x28(%rbp), %rdi
0000000000095efd	movq	(%rdi), %rax
0000000000095f00	callq	*0x18(%rax)
0000000000095f03	movl	$0x1, %eax
0000000000095f08	xchgl	%eax, 0x8(%rbx)
0000000000095f0b	jmp	0x95e80
0000000000095f10	movq	%rax, %rdi
0000000000095f13	callq	___clang_call_terminate
0000000000095f18	movq	%rax, %rbx
0000000000095f1b	leaq	-0x38(%rbp), %rdi
0000000000095f1f	callq	__ZN14HGSynchronizerD1Ev        ## HGSynchronizer::~HGSynchronizer()
0000000000095f24	movq	%rbx, %rdi
0000000000095f27	callq	0x3c4e02                        ## symbol stub for: __Unwind_Resume
0000000000095f2c	movq	%rax, %rdi
0000000000095f2f	callq	___clang_call_terminate
0000000000095f34	nopw	%cs:(%rax,%rax)
