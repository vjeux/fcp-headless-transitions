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
