__ZN24FFPlayerLockDeferredWork15addDeferredWorkEU13block_pointerFvvE:
0000000000da7f90	pushq	%rbp
0000000000da7f91	movq	%rsp, %rbp
0000000000da7f94	pushq	%r14
0000000000da7f96	pushq	%rbx
0000000000da7f97	movq	%rsi, %rbx
0000000000da7f9a	movq	%rdi, %r14
0000000000da7f9d	movq	0x8(%rdi), %rdi
0000000000da7fa1	testq	%rdi, %rdi
0000000000da7fa4	jne	0xda7fb9
0000000000da7fa6	movq	0xb475c3(%rip), %rdi            ## literal pool symbol address: _OBJC_CLASS_$_NSMutableArray
0000000000da7fad	callq	0x1497998                       ## symbol stub for: _objc_opt_new
0000000000da7fb2	movq	%rax, %rdi
0000000000da7fb5	movq	%rax, 0x8(%r14)
0000000000da7fb9	movq	0xe10528(%rip), %rsi
0000000000da7fc0	movq	%rbx, %rdx
0000000000da7fc3	popq	%rbx
0000000000da7fc4	popq	%r14
0000000000da7fc6	popq	%rbp
0000000000da7fc7	jmpq	*0xb456f3(%rip)                 ## Objc message: -[%rdi _waitForThreadToFinish]
0000000000da7fcd	nopl	(%rax)
