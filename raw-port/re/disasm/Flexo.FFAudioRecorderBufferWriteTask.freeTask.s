__ZN30FFAudioRecorderBufferWriteTask8freeTaskEv:
0000000000d34580	pushq	%rbp
0000000000d34581	movq	%rsp, %rbp
0000000000d34584	pushq	%r15
0000000000d34586	pushq	%r14
0000000000d34588	pushq	%rbx
0000000000d34589	pushq	%rax
0000000000d3458a	movq	%rdi, %r14
0000000000d3458d	movq	0x10(%rdi), %rax
0000000000d34591	movq	0x70(%rax), %rbx
0000000000d34595	leaq	0x20(%rbx), %rdi
0000000000d34599	callq	__ZN19FFLocklessQueueBase9popAtomicERNSt3__16atomicIPNS_11ElementBaseEEE ## FFLocklessQueueBase::popAtomic(std::__1::atomic<FFLocklessQueueBase::ElementBase*>&)
0000000000d3459e	testq	%rax, %rax
0000000000d345a1	je	0xd345bc
0000000000d345a3	cmpb	$0x1, 0x10(%rax)
0000000000d345a7	jne	0xd345dc
0000000000d345a9	movq	%rbx, %rdi
0000000000d345ac	movq	%rax, %rsi
0000000000d345af	movq	%rax, %r15
0000000000d345b2	callq	__ZN19FFLocklessQueueBase11freeElementEPNS_11ElementBaseE ## FFLocklessQueueBase::freeElement(FFLocklessQueueBase::ElementBase*)
0000000000d345b7	movq	%r15, %rax
0000000000d345ba	jmp	0xd345dc
0000000000d345bc	movl	$0x20, %edi
0000000000d345c1	callq	0x1497452                       ## symbol stub for: __Znwm
0000000000d345c6	movq	$0x0, 0x8(%rax)
0000000000d345ce	leaq	0xbde603(%rip), %rcx
0000000000d345d5	movq	%rcx, (%rax)
0000000000d345d8	movb	$0x0, 0x10(%rax)
0000000000d345dc	movb	$0x0, 0x10(%rax)
0000000000d345e0	movq	%r14, 0x18(%rax)
0000000000d345e4	addq	$0x10, %rbx
0000000000d345e8	movq	%rax, %rdi
0000000000d345eb	movq	%rbx, %rsi
0000000000d345ee	addq	$0x8, %rsp
0000000000d345f2	popq	%rbx
0000000000d345f3	popq	%r14
0000000000d345f5	popq	%r15
0000000000d345f7	popq	%rbp
0000000000d345f8	jmp	__ZN19FFLocklessQueueBase10pushAtomicEPNS_11ElementBaseERNSt3__16atomicIS1_EE ## FFLocklessQueueBase::pushAtomic(FFLocklessQueueBase::ElementBase*, std::__1::atomic<FFLocklessQueueBase::ElementBase*>&)
0000000000d345fd	nopl	(%rax)
