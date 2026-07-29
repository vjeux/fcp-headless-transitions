__ZN12SynchronizerD1Ev:
000000000036e630	pushq	%rbp
000000000036e631	movq	%rsp, %rbp
000000000036e634	cmpb	$0x0, 0x8(%rdi)
000000000036e638	jne	0x36e642
000000000036e63a	movq	(%rdi), %rdi
000000000036e63d	callq	__ZN14Synchronizable6UnlockEv   ## Synchronizable::Unlock()
000000000036e642	popq	%rbp
000000000036e643	retq
000000000036e644	movq	%rax, %rdi
000000000036e647	callq	___clang_call_terminate
000000000036e64c	nopl	(%rax)
