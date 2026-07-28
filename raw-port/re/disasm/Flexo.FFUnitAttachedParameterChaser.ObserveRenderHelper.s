__ZN29FFUnitAttachedParameterChaser19ObserveRenderHelperEPvPjPK14AudioTimeStampjjP15AudioBufferList:
0000000001236c80	pushq	%rbp
0000000001236c81	movq	%rsp, %rbp
0000000001236c84	pushq	%r14
0000000001236c86	pushq	%rbx
0000000001236c87	movq	%rdi, %rbx
0000000001236c8a	movl	(%rsi), %esi
0000000001236c8c	addq	$0xd8, %rdi
0000000001236c93	testb	$0x4, %sil
0000000001236c97	jne	0x1236cd3
0000000001236c99	movq	%rdx, %r14
0000000001236c9c	callq	__ZN21STParameterEventQueue10PostRenderEjRK14AudioTimeStampjjRK15AudioBufferList ## STParameterEventQueue::PostRender(unsigned int, AudioTimeStamp const&, unsigned int, unsigned int, AudioBufferList const&)
0000000001236ca1	cvttsd2si	(%r14), %rax
0000000001236ca6	movq	0xc0(%rbx), %rcx
0000000001236cad	cmpq	%rax, %rcx
0000000001236cb0	jg	0x1236cd8
0000000001236cb2	addq	0xc8(%rbx), %rax
0000000001236cb9	xchgq	%rax, 0xc0(%rbx)
0000000001236cc0	cmpb	$0x1, 0xd0(%rbx)
0000000001236cc7	jne	0x1236cdf
0000000001236cc9	movq	(%rbx), %rax
0000000001236ccc	movq	%rbx, %rdi
0000000001236ccf	callq	*(%rax)
0000000001236cd1	jmp	0x1236cd8
0000000001236cd3	callq	__ZN21STParameterEventQueue9PreRenderEjRK14AudioTimeStampjjRK15AudioBufferList ## STParameterEventQueue::PreRender(unsigned int, AudioTimeStamp const&, unsigned int, unsigned int, AudioBufferList const&)
0000000001236cd8	xorl	%eax, %eax
0000000001236cda	popq	%rbx
0000000001236cdb	popq	%r14
0000000001236cdd	popq	%rbp
0000000001236cde	retq
0000000001236cdf	movq	%rbx, %rdi
0000000001236ce2	movl	$0x1, %esi
0000000001236ce7	callq	__ZN18FFMachPortCallback22SendEmptyMessageToPortEb ## FFMachPortCallback::SendEmptyMessageToPort(bool)
0000000001236cec	jmp	0x1236cd8
0000000001236cee	nop
