__ZN35FFAudioRecorderBufferWriteTaskQueueD0Ev:
0000000000d34680	pushq	%rbp
0000000000d34681	movq	%rsp, %rbp
0000000000d34684	pushq	%r15
0000000000d34686	pushq	%r14
0000000000d34688	pushq	%rbx
0000000000d34689	pushq	%rax
0000000000d3468a	movq	%rdi, %rbx
0000000000d3468d	leaq	0xbde494(%rip), %rax
0000000000d34694	movq	%rax, (%rdi)
0000000000d34697	callq	__ZN19FFLocklessQueueBase5clearEv ## FFLocklessQueueBase::clear()
0000000000d3469c	leaq	0x20(%rbx), %r14
0000000000d346a0	movq	%r14, %rdi
0000000000d346a3	callq	__ZN19FFLocklessQueueBase9popAtomicERNSt3__16atomicIPNS_11ElementBaseEEE ## FFLocklessQueueBase::popAtomic(std::__1::atomic<FFLocklessQueueBase::ElementBase*>&)
0000000000d346a8	movq	%rax, %r15
0000000000d346ab	jmp	0xd346c4
0000000000d346ad	nopl	(%rax)
0000000000d346b0	movq	(%r15), %rax
0000000000d346b3	movq	%r15, %rdi
0000000000d346b6	callq	*0x8(%rax)
0000000000d346b9	movq	%r14, %rdi
0000000000d346bc	callq	__ZN19FFLocklessQueueBase9popAtomicERNSt3__16atomicIPNS_11ElementBaseEEE ## FFLocklessQueueBase::popAtomic(std::__1::atomic<FFLocklessQueueBase::ElementBase*>&)
0000000000d346c1	movq	%rax, %r15
0000000000d346c4	testq	%r15, %r15
0000000000d346c7	je	0xd346dd
0000000000d346c9	cmpb	$0x1, 0x10(%r15)
0000000000d346ce	jne	0xd346b0
0000000000d346d0	movq	%rbx, %rdi
0000000000d346d3	movq	%r15, %rsi
0000000000d346d6	callq	__ZN19FFLocklessQueueBase11freeElementEPNS_11ElementBaseE ## FFLocklessQueueBase::freeElement(FFLocklessQueueBase::ElementBase*)
0000000000d346db	jmp	0xd346b0
0000000000d346dd	movq	%rbx, %rdi
0000000000d346e0	callq	__ZN19FFLocklessQueueBaseD2Ev   ## FFLocklessQueueBase::~FFLocklessQueueBase()
0000000000d346e5	movq	%rbx, %rdi
0000000000d346e8	addq	$0x8, %rsp
0000000000d346ec	popq	%rbx
0000000000d346ed	popq	%r14
0000000000d346ef	popq	%r15
0000000000d346f1	popq	%rbp
0000000000d346f2	jmp	0x1497404                       ## symbol stub for: __ZdlPv
0000000000d346f7	movq	%rax, %rdi
0000000000d346fa	callq	___clang_call_terminate
0000000000d346ff	movq	%rax, %rdi
0000000000d34702	callq	___clang_call_terminate
0000000000d34707	nopw	(%rax,%rax)
