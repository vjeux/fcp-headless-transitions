__ZN20OZFxPlugLockSentinelD1Ev:
0000000000109c00	pushq	%rbp
0000000000109c01	movq	%rsp, %rbp
0000000000109c04	pushq	%rbx
0000000000109c05	pushq	%rax
0000000000109c06	movq	%rdi, %rbx
0000000000109c09	movq	(%rdi), %rdi
0000000000109c0c	callq	__ZN18OZFxPlugSharedLock13unlockForReadEv ## OZFxPlugSharedLock::unlockForRead()
0000000000109c11	movq	0x8(%rbx), %rbx
0000000000109c15	testq	%rbx, %rbx
0000000000109c18	je	0x109c2c
0000000000109c1a	movq	$-0x1, %rax
0000000000109c21	lock
0000000000109c22	xaddq	%rax, 0x8(%rbx)
0000000000109c27	testq	%rax, %rax
0000000000109c2a	je	0x109c33
0000000000109c2c	addq	$0x8, %rsp
0000000000109c30	popq	%rbx
0000000000109c31	popq	%rbp
0000000000109c32	retq
0000000000109c33	movq	(%rbx), %rax
0000000000109c36	movq	%rbx, %rdi
0000000000109c39	callq	*0x10(%rax)
0000000000109c3c	movq	%rbx, %rdi
0000000000109c3f	addq	$0x8, %rsp
0000000000109c43	popq	%rbx
0000000000109c44	popq	%rbp
0000000000109c45	jmp	0x6dfbbe                        ## symbol stub for: __ZNSt3__119__shared_weak_count14__release_weakEv
0000000000109c4a	movq	%rax, %rdi
0000000000109c4d	callq	___clang_call_terminate
0000000000109c52	nopw	%cs:(%rax,%rax)
