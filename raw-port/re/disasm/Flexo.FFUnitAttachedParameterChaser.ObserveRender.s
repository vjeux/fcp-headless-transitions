__ZN29FFUnitAttachedParameterChaser13ObserveRenderEjRK14AudioTimeStampjjR15AudioBufferList:
0000000001236d60	pushq	%rbp
0000000001236d61	movq	%rsp, %rbp
0000000001236d64	pushq	%r14
0000000001236d66	pushq	%rbx
0000000001236d67	movq	%rdi, %rbx
0000000001236d6a	addq	$0xd8, %rdi
0000000001236d71	testb	$0x4, %sil
0000000001236d75	jne	0x1236d95
0000000001236d77	movq	%rdx, %r14
0000000001236d7a	callq	__ZN21STParameterEventQueue10PostRenderEjRK14AudioTimeStampjjRK15AudioBufferList ## STParameterEventQueue::PostRender(unsigned int, AudioTimeStamp const&, unsigned int, unsigned int, AudioBufferList const&)
0000000001236d7f	cvttsd2si	(%r14), %rax
0000000001236d84	movq	0xc0(%rbx), %rcx
0000000001236d8b	cmpq	%rax, %rcx
0000000001236d8e	jle	0x1236d9e
0000000001236d90	popq	%rbx
0000000001236d91	popq	%r14
0000000001236d93	popq	%rbp
0000000001236d94	retq
0000000001236d95	popq	%rbx
0000000001236d96	popq	%r14
0000000001236d98	popq	%rbp
0000000001236d99	jmp	__ZN21STParameterEventQueue9PreRenderEjRK14AudioTimeStampjjRK15AudioBufferList ## STParameterEventQueue::PreRender(unsigned int, AudioTimeStamp const&, unsigned int, unsigned int, AudioBufferList const&)
0000000001236d9e	addq	0xc8(%rbx), %rax
0000000001236da5	xchgq	%rax, 0xc0(%rbx)
0000000001236dac	cmpb	$0x1, 0xd0(%rbx)
0000000001236db3	jne	0x1236dc1
0000000001236db5	movq	(%rbx), %rax
0000000001236db8	movq	%rbx, %rdi
0000000001236dbb	popq	%rbx
0000000001236dbc	popq	%r14
0000000001236dbe	popq	%rbp
0000000001236dbf	jmpq	*(%rax)
0000000001236dc1	movq	%rbx, %rdi
0000000001236dc4	movl	$0x1, %esi
0000000001236dc9	popq	%rbx
0000000001236dca	popq	%r14
0000000001236dcc	popq	%rbp
0000000001236dcd	jmp	__ZN18FFMachPortCallback22SendEmptyMessageToPortEb ## FFMachPortCallback::SendEmptyMessageToPort(bool)
0000000001236dd2	nopw	%cs:(%rax,%rax)
__ZN30FFGraphAttachedParameterChaserD1Ev:
0000000001236de0	pushq	%rbp
0000000001236de1	movq	%rsp, %rbp
0000000001236de4	pushq	%rbx
0000000001236de5	pushq	%rax
0000000001236de6	movq	%rdi, %rbx
0000000001236de9	leaq	0x6e6cc0(%rip), %rax
0000000001236df0	movq	%rax, (%rdi)
0000000001236df3	callq	__ZN31FFMachPortDispatchQueueCallback15DetachFromQueueEv ## FFMachPortDispatchQueueCallback::DetachFromQueue()
0000000001236df8	leaq	0xd8(%rbx), %rdi
0000000001236dff	callq	__ZN21STParameterEventQueueD1Ev ## STParameterEventQueue::~STParameterEventQueue()
0000000001236e04	leaq	0x20(%rbx), %rdi
0000000001236e08	callq	__ZN22FFMultiParameterChaserD2Ev ## FFMultiParameterChaser::~FFMultiParameterChaser()
0000000001236e0d	movq	%rbx, %rdi
