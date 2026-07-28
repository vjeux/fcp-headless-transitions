__ZN16FFPlayerLockable8try_lockEv:
0000000000da7b80	pushq	%rbp
0000000000da7b81	movq	%rsp, %rbp
0000000000da7b84	pushq	%r14
0000000000da7b86	pushq	%rbx
0000000000da7b87	movq	%rdi, %rbx
0000000000da7b8a	callq	0x14972c0                       ## symbol stub for: __ZNSt3__111timed_mutex8try_lockEv
0000000000da7b8f	testb	%al, %al
0000000000da7b91	je	0xda7bb4
0000000000da7b93	movq	0xb459de(%rip), %rdi            ## literal pool symbol address: _OBJC_CLASS_$_NSThread
0000000000da7b9a	movq	0xe1e04f(%rip), %rsi
0000000000da7ba1	movl	%eax, %r14d
0000000000da7ba4	callq	*0xb45b16(%rip)                 ## Objc message: -[%rdi _waitForThreadToFinish]
0000000000da7baa	movq	%rax, %rcx
0000000000da7bad	movl	%r14d, %eax
0000000000da7bb0	movq	%rcx, 0x78(%rbx)
0000000000da7bb4	popq	%rbx
0000000000da7bb5	popq	%r14
0000000000da7bb7	popq	%rbp
0000000000da7bb8	retq
0000000000da7bb9	nopl	(%rax)
