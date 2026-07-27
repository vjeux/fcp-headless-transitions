__ZN29FFWithDisableUndoRegistrationC2EP13NSUndoManager:
0000000000485ff0	pushq	%rbp
0000000000485ff1	movq	%rsp, %rbp
0000000000485ff4	pushq	%rbx
0000000000485ff5	pushq	%rax
0000000000485ff6	movq	%rdi, %rbx
0000000000485ff9	movq	%rsi, %rdi
0000000000485ffc	callq	*0x146770e(%rip)                ## literal pool symbol address: _objc_retain
0000000000486002	movq	%rax, (%rbx)
0000000000486005	movq	%rax, %rdi
0000000000486008	xorl	%esi, %esi
000000000048600a	addq	$0x8, %rsp
000000000048600e	popq	%rbx
000000000048600f	popq	%rbp
0000000000486010	jmp	_FFWithEnableUndoRegistrationPush
0000000000486015	nopw	%cs:(%rax,%rax)
__ZN29FFWithDisableUndoRegistrationD2Ev:
0000000000486020	pushq	%rbp
0000000000486021	movq	%rsp, %rbp
0000000000486024	pushq	%rbx
0000000000486025	pushq	%rax
0000000000486026	movq	%rdi, %rbx
0000000000486029	movq	(%rdi), %rdi
000000000048602c	callq	*0x14676d6(%rip)                ## literal pool symbol address: _objc_release
0000000000486032	movq	(%rbx), %rdi
0000000000486035	xorl	%esi, %esi
0000000000486037	callq	_FFWithEnableUndoRegistrationPop
000000000048603c	addq	$0x8, %rsp
0000000000486040	popq	%rbx
0000000000486041	popq	%rbp
0000000000486042	retq
0000000000486043	movq	%rax, %rdi
0000000000486046	callq	___clang_call_terminate
000000000048604b	nopl	(%rax,%rax)
__ZN29FFWithDisableUndoRegistrationD1Ev:
0000000000486050	pushq	%rbp
0000000000486051	movq	%rsp, %rbp
0000000000486054	pushq	%rbx
0000000000486055	pushq	%rax
0000000000486056	movq	%rdi, %rbx
0000000000486059	movq	(%rdi), %rdi
000000000048605c	callq	*0x14676a6(%rip)                ## literal pool symbol address: _objc_release
0000000000486062	movq	(%rbx), %rdi
0000000000486065	xorl	%esi, %esi
0000000000486067	callq	_FFWithEnableUndoRegistrationPop
000000000048606c	addq	$0x8, %rsp
0000000000486070	popq	%rbx
0000000000486071	popq	%rbp
0000000000486072	retq
0000000000486073	movq	%rax, %rdi
0000000000486076	callq	___clang_call_terminate
000000000048607b	nopl	(%rax,%rax)
