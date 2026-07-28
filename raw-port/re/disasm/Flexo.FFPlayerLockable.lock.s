__ZN16FFPlayerLockable4lockEv:
0000000000da7b20	pushq	%rbp
0000000000da7b21	movq	%rsp, %rbp
0000000000da7b24	pushq	%rbx
0000000000da7b25	pushq	%rax
0000000000da7b26	movq	%rdi, %rbx
0000000000da7b29	callq	0x14972b4                       ## symbol stub for: __ZNSt3__111timed_mutex4lockEv
0000000000da7b2e	movq	0xb45a43(%rip), %rdi            ## literal pool symbol address: _OBJC_CLASS_$_NSThread
0000000000da7b35	movq	0xe1e0b4(%rip), %rsi
0000000000da7b3c	callq	*0xb45b7e(%rip)                 ## Objc message: -[%rdi _waitForThreadToFinish]
0000000000da7b42	movq	%rax, 0x78(%rbx)
0000000000da7b46	addq	$0x8, %rsp
0000000000da7b4a	popq	%rbx
0000000000da7b4b	popq	%rbp
0000000000da7b4c	retq
0000000000da7b4d	nopl	(%rax)
