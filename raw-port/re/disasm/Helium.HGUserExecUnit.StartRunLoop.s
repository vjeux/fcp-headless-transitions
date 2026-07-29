__ZN14HGUserExecUnit12StartRunLoopEv:
0000000000095f40	pushq	%rbp
0000000000095f41	movq	%rsp, %rbp
0000000000095f44	pushq	%r15
0000000000095f46	pushq	%r14
0000000000095f48	pushq	%rbx
0000000000095f49	subq	$0x48, %rsp
0000000000095f4d	movq	0x96c304(%rip), %rax            ## literal pool symbol address: ___stack_chk_guard
0000000000095f54	movq	(%rax), %rax
0000000000095f57	movq	%rax, -0x20(%rbp)
0000000000095f5b	xorl	%eax, %eax
0000000000095f5d	cmpq	$0x0, 0x20(%rdi)
0000000000095f62	jne	0x95fa5
0000000000095f64	leaq	0x20(%rdi), %rbx
0000000000095f68	leaq	-0x60(%rbp), %r14
0000000000095f6c	movq	%rdi, %r15
0000000000095f6f	movq	%r14, %rdi
0000000000095f72	callq	0x3c550a                        ## symbol stub for: _pthread_attr_init
0000000000095f77	movq	%r14, %rdi
0000000000095f7a	movl	$0x2, %esi
0000000000095f7f	callq	0x3c5510                        ## symbol stub for: _pthread_attr_setdetachstate
0000000000095f84	leaq	__Z21StartUserExecUnitFuncPv(%rip), %rdx ## StartUserExecUnitFunc(void*)
0000000000095f8b	movq	%rbx, %rdi
0000000000095f8e	movq	%r14, %rsi
0000000000095f91	movq	%r15, %rcx
0000000000095f94	callq	0x3c554c                        ## symbol stub for: _pthread_create
0000000000095f99	movl	%eax, %ebx
0000000000095f9b	movq	%r14, %rdi
0000000000095f9e	callq	0x3c54fe                        ## symbol stub for: _pthread_attr_destroy
0000000000095fa3	movl	%ebx, %eax
0000000000095fa5	movq	0x96c2ac(%rip), %rcx            ## literal pool symbol address: ___stack_chk_guard
0000000000095fac	movq	(%rcx), %rcx
0000000000095faf	cmpq	-0x20(%rbp), %rcx
0000000000095fb3	jne	0x95fc0
0000000000095fb5	addq	$0x48, %rsp
0000000000095fb9	popq	%rbx
0000000000095fba	popq	%r14
0000000000095fbc	popq	%r15
0000000000095fbe	popq	%rbp
0000000000095fbf	retq
0000000000095fc0	callq	0x3c5030                        ## symbol stub for: ___stack_chk_fail
0000000000095fc5	nopw	%cs:(%rax,%rax)
