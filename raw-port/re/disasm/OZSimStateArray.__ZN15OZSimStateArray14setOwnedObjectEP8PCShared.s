__ZN15OZSimStateArray14setOwnedObjectEP8PCShared:
0000000000283f20	pushq	%rbp
0000000000283f21	movq	%rsp, %rbp
0000000000283f24	pushq	%r14
0000000000283f26	pushq	%rbx
0000000000283f27	subq	$0x10, %rsp
0000000000283f2b	cmpq	0x38(%rdi), %rsi
0000000000283f2f	je	0x283f7b
0000000000283f31	movq	%rdi, %rbx
0000000000283f34	movq	%rsi, -0x20(%rbp)
0000000000283f38	testq	%rsi, %rsi
0000000000283f3b	je	0x283f46
0000000000283f3d	movq	(%rsi), %rax
0000000000283f40	addq	-0x18(%rax), %rsi
0000000000283f44	jmp	0x283f48
0000000000283f46	xorl	%esi, %esi
0000000000283f48	leaq	-0x18(%rbp), %r14
0000000000283f4c	movq	%r14, %rdi
0000000000283f4f	callq	0x6ddadc                        ## symbol stub for: __ZN13PCSharedCountC1EP13PCShared_base
0000000000283f54	movq	-0x20(%rbp), %rax
0000000000283f58	movq	0x38(%rbx), %rcx
0000000000283f5c	movq	%rcx, -0x20(%rbp)
0000000000283f60	movq	%rax, 0x38(%rbx)
0000000000283f64	addq	$0x40, %rbx
0000000000283f68	movq	%r14, %rdi
0000000000283f6b	movq	%rbx, %rsi
0000000000283f6e	callq	0x6ddad6                        ## symbol stub for: __ZN13PCSharedCount4swapERS_
0000000000283f73	movq	%r14, %rdi
0000000000283f76	callq	0x6ddaee                        ## symbol stub for: __ZN13PCSharedCountD1Ev
0000000000283f7b	addq	$0x10, %rsp
0000000000283f7f	popq	%rbx
0000000000283f80	popq	%r14
0000000000283f82	popq	%rbp
0000000000283f83	retq
0000000000283f84	movq	%rax, %rbx
0000000000283f87	movq	%r14, %rdi
0000000000283f8a	callq	0x6ddaee                        ## symbol stub for: __ZN13PCSharedCountD1Ev
0000000000283f8f	movq	%rbx, %rdi
0000000000283f92	callq	0x6dd07a                        ## symbol stub for: __Unwind_Resume
0000000000283f97	nopw	(%rax,%rax)
