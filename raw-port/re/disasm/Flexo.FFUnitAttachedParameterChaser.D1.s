__ZN29FFUnitAttachedParameterChaserD1Ev:
0000000001236fc0	pushq	%rbp
0000000001236fc1	movq	%rsp, %rbp
0000000001236fc4	pushq	%rbx
0000000001236fc5	pushq	%rax
0000000001236fc6	movq	%rdi, %rbx
0000000001236fc9	leaq	0x6e6ae0(%rip), %rax
0000000001236fd0	movq	%rax, (%rdi)
0000000001236fd3	callq	__ZN31FFMachPortDispatchQueueCallback15DetachFromQueueEv ## FFMachPortDispatchQueueCallback::DetachFromQueue()
0000000001236fd8	leaq	0xd8(%rbx), %rdi
0000000001236fdf	callq	__ZN21STParameterEventQueueD1Ev ## STParameterEventQueue::~STParameterEventQueue()
0000000001236fe4	leaq	0x20(%rbx), %rdi
0000000001236fe8	callq	__ZN22FFMultiParameterChaserD2Ev ## FFMultiParameterChaser::~FFMultiParameterChaser()
0000000001236fed	movq	%rbx, %rdi
0000000001236ff0	addq	$0x8, %rsp
0000000001236ff4	popq	%rbx
0000000001236ff5	popq	%rbp
0000000001236ff6	jmp	__ZN31FFMachPortDispatchQueueCallbackD2Ev ## FFMachPortDispatchQueueCallback::~FFMachPortDispatchQueueCallback()
0000000001236ffb	movq	%rax, %rdi
0000000001236ffe	callq	___clang_call_terminate
