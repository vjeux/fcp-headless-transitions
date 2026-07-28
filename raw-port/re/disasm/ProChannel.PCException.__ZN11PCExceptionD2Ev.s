__ZN11PCExceptionD2Ev:
0000000000027a66	pushq	%rbp
0000000000027a67	movq	%rsp, %rbp
0000000000027a6a	pushq	%rbx
0000000000027a6b	pushq	%rax
0000000000027a6c	movq	%rdi, %rbx
0000000000027a6f	movq	0xa297a(%rip), %rax             ## literal pool symbol address: __ZTV11PCException
0000000000027a76	addq	$0x10, %rax
0000000000027a7a	movq	%rax, (%rdi)
0000000000027a7d	testb	$0x1, 0x28(%rdi)
0000000000027a81	je	0x27a8c
0000000000027a83	movq	0x38(%rbx), %rdi
0000000000027a87	callq	0xace04                         ## symbol stub for: __ZdlPv
0000000000027a8c	leaq	0x18(%rbx), %rdi
0000000000027a90	callq	0xacd20                         ## symbol stub for: __ZN8PCStringD1Ev
0000000000027a95	leaq	0x10(%rbx), %rdi
0000000000027a99	callq	0xacd20                         ## symbol stub for: __ZN8PCStringD1Ev
0000000000027a9e	leaq	0x8(%rbx), %rdi
0000000000027aa2	callq	__ZN7PCCFRefIPK9__CFArrayED2Ev  ## PCCFRef<__CFArray const*>::~PCCFRef()
0000000000027aa7	movq	%rbx, %rdi
0000000000027aaa	addq	$0x8, %rsp
0000000000027aae	popq	%rbx
0000000000027aaf	popq	%rbp
0000000000027ab0	jmp	0xacdf2                         ## symbol stub for: __ZNSt9exceptionD2Ev
0000000000027ab5	nop
