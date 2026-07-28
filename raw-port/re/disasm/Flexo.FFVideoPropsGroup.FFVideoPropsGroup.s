__ZN17FFVideoPropsGroupC1Ev:
0000000000fd59b0	pushq	%rbp
0000000000fd59b1	movq	%rsp, %rbp
0000000000fd59b4	pushq	%rbx
0000000000fd59b5	pushq	%rax
0000000000fd59b6	movq	%rdi, %rbx
0000000000fd59b9	xorl	%esi, %esi
0000000000fd59bb	callq	0x1497ae8                       ## symbol stub for: _pthread_mutex_init
0000000000fd59c0	movq	0x919ba9(%rip), %rdi            ## literal pool symbol address: _OBJC_CLASS_$_NSMutableArray
0000000000fd59c7	callq	0x1497998                       ## symbol stub for: _objc_opt_new
0000000000fd59cc	movq	%rax, 0x40(%rbx)
0000000000fd59d0	addq	$0x8, %rsp
0000000000fd59d4	popq	%rbx
0000000000fd59d5	popq	%rbp
0000000000fd59d6	retq
0000000000fd59d7	nopw	(%rax,%rax)
