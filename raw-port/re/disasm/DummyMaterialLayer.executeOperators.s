__ZN18DummyMaterialLayer16executeOperatorsERK12LayerContextR17SurfaceProperties:
00000000001e1d60	pushq	%rbp
00000000001e1d61	movq	%rsp, %rbp
00000000001e1d64	pushq	%r15
00000000001e1d66	pushq	%r14
00000000001e1d68	pushq	%r12
00000000001e1d6a	pushq	%rbx
00000000001e1d6b	movq	0x20(%rdi), %r15
00000000001e1d6f	movq	0x28(%rdi), %r12
00000000001e1d73	cmpq	%r12, %r15
00000000001e1d76	je	0x1e1dac
00000000001e1d78	movq	%rdx, %rbx
00000000001e1d7b	movq	%rsi, %r14
00000000001e1d7e	jmp	0x1e1d95
00000000001e1d80	movq	(%rdi), %rax
00000000001e1d83	movq	%r14, %rsi
00000000001e1d86	movq	%rbx, %rdx
00000000001e1d89	callq	*0x10(%rax)
00000000001e1d8c	addq	$0x10, %r15
00000000001e1d90	cmpq	%r12, %r15
00000000001e1d93	je	0x1e1dac
00000000001e1d95	movq	(%r15), %rdi
00000000001e1d98	testq	%rdi, %rdi
00000000001e1d9b	jne	0x1e1d80
00000000001e1d9d	movl	$0x1, %edi
00000000001e1da2	callq	0x6dd290                        ## symbol stub for: __Z28throw_PCNullPointerExceptionb
00000000001e1da7	movq	(%r15), %rdi
00000000001e1daa	jmp	0x1e1d80
00000000001e1dac	popq	%rbx
00000000001e1dad	popq	%r12
00000000001e1daf	popq	%r14
00000000001e1db1	popq	%r15
00000000001e1db3	popq	%rbp
00000000001e1db4	retq
00000000001e1db5	nopw	%cs:(%rax,%rax)
