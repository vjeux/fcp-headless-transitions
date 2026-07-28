__ZN30FFAudioBufferListLocklessQueueD0Ev:
0000000001257480	pushq	%rbp
0000000001257481	movq	%rsp, %rbp
0000000001257484	pushq	%r15
0000000001257486	pushq	%r14
0000000001257488	pushq	%rbx
0000000001257489	pushq	%rax
000000000125748a	movq	%rdi, %rbx
000000000125748d	leaq	0x6ba6d4(%rip), %rax
0000000001257494	movq	%rax, (%rdi)
0000000001257497	callq	__ZN19FFLocklessQueueBase5clearEv ## FFLocklessQueueBase::clear()
000000000125749c	leaq	0x20(%rbx), %r14
00000000012574a0	movq	%r14, %rdi
00000000012574a3	callq	__ZN19FFLocklessQueueBase9popAtomicERNSt3__16atomicIPNS_11ElementBaseEEE ## FFLocklessQueueBase::popAtomic(std::__1::atomic<FFLocklessQueueBase::ElementBase*>&)
00000000012574a8	movq	%rax, %r15
00000000012574ab	jmp	0x12574c4
00000000012574ad	nopl	(%rax)
00000000012574b0	movq	(%r15), %rax
00000000012574b3	movq	%r15, %rdi
00000000012574b6	callq	*0x8(%rax)
00000000012574b9	movq	%r14, %rdi
00000000012574bc	callq	__ZN19FFLocklessQueueBase9popAtomicERNSt3__16atomicIPNS_11ElementBaseEEE ## FFLocklessQueueBase::popAtomic(std::__1::atomic<FFLocklessQueueBase::ElementBase*>&)
00000000012574c1	movq	%rax, %r15
00000000012574c4	testq	%r15, %r15
00000000012574c7	je	0x12574dd
00000000012574c9	cmpb	$0x1, 0x10(%r15)
00000000012574ce	jne	0x12574b0
00000000012574d0	movq	%rbx, %rdi
00000000012574d3	movq	%r15, %rsi
00000000012574d6	callq	__ZN19FFLocklessQueueBase11freeElementEPNS_11ElementBaseE ## FFLocklessQueueBase::freeElement(FFLocklessQueueBase::ElementBase*)
00000000012574db	jmp	0x12574b0
00000000012574dd	movq	%rbx, %rdi
00000000012574e0	callq	__ZN19FFLocklessQueueBaseD2Ev   ## FFLocklessQueueBase::~FFLocklessQueueBase()
00000000012574e5	movq	%rbx, %rdi
00000000012574e8	addq	$0x8, %rsp
00000000012574ec	popq	%rbx
00000000012574ed	popq	%r14
00000000012574ef	popq	%r15
00000000012574f1	popq	%rbp
00000000012574f2	jmp	0x1497404                       ## symbol stub for: __ZdlPv
00000000012574f7	movq	%rax, %rdi
00000000012574fa	callq	___clang_call_terminate
00000000012574ff	movq	%rax, %rdi
0000000001257502	callq	___clang_call_terminate
0000000001257507	nopw	(%rax,%rax)
