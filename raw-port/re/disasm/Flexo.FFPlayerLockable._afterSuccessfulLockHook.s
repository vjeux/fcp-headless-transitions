__ZN16FFPlayerLockable24_afterSuccessfulLockHookEv:
0000000000da7b50	pushq	%rbp
0000000000da7b51	movq	%rsp, %rbp
0000000000da7b54	pushq	%rbx
0000000000da7b55	pushq	%rax
0000000000da7b56	movq	%rdi, %rbx
0000000000da7b59	movq	0xb45a18(%rip), %rdi            ## literal pool symbol address: _OBJC_CLASS_$_NSThread
0000000000da7b60	movq	0xe1e089(%rip), %rsi
0000000000da7b67	callq	*0xb45b53(%rip)                 ## Objc message: -[%rdi _waitForThreadToFinish]
0000000000da7b6d	movq	%rax, 0x78(%rbx)
0000000000da7b71	addq	$0x8, %rsp
0000000000da7b75	popq	%rbx
0000000000da7b76	popq	%rbp
0000000000da7b77	retq
0000000000da7b78	nopl	(%rax,%rax)
