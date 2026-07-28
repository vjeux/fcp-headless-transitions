__ZN29FFUnitAttachedParameterChaserD0Ev:
0000000001237010	pushq	%rbp
0000000001237011	movq	%rsp, %rbp
0000000001237014	pushq	%rbx
0000000001237015	pushq	%rax
0000000001237016	movq	%rdi, %rbx
0000000001237019	leaq	0x6e6a90(%rip), %rax
0000000001237020	movq	%rax, (%rdi)
0000000001237023	callq	__ZN31FFMachPortDispatchQueueCallback15DetachFromQueueEv ## FFMachPortDispatchQueueCallback::DetachFromQueue()
0000000001237028	leaq	0xd8(%rbx), %rdi
000000000123702f	callq	__ZN21STParameterEventQueueD1Ev ## STParameterEventQueue::~STParameterEventQueue()
0000000001237034	leaq	0x20(%rbx), %rdi
0000000001237038	callq	__ZN22FFMultiParameterChaserD2Ev ## FFMultiParameterChaser::~FFMultiParameterChaser()
000000000123703d	movq	%rbx, %rdi
0000000001237040	callq	__ZN31FFMachPortDispatchQueueCallbackD2Ev ## FFMachPortDispatchQueueCallback::~FFMachPortDispatchQueueCallback()
0000000001237045	movq	%rbx, %rdi
0000000001237048	addq	$0x8, %rsp
000000000123704c	popq	%rbx
000000000123704d	popq	%rbp
000000000123704e	jmp	0x1497404                       ## symbol stub for: __ZdlPv
0000000001237053	movq	%rax, %rdi
0000000001237056	callq	___clang_call_terminate
000000000123705b	addb	%al, (%rax)
000000000123705d	addb	%al, (%rax)
000000000123705f	addb	%dl, 0x48(%rbp)
0000000001237062	movl	%esp, %ebp
0000000001237064	pushq	%r15
0000000001237066	pushq	%r14
0000000001237068	pushq	%r12
000000000123706a	pushq	%rbx
