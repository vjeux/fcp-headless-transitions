__ZN21FFLockerWithCallbacksD1Ev:
00000000012b9b30	pushq	%rbp
00000000012b9b31	movq	%rsp, %rbp
00000000012b9b34	pushq	%r14
00000000012b9b36	pushq	%rbx
00000000012b9b37	cmpb	$0x1, 0x10(%rdi)
00000000012b9b3b	jne	0x12b9b8a
00000000012b9b3d	movq	%rdi, %rbx
00000000012b9b40	movq	(%rdi), %rdi
00000000012b9b43	movl	0x10(%rdi), %eax
00000000012b9b46	testl	%eax, %eax
00000000012b9b48	je	0x12b9b51
00000000012b9b4a	decl	%eax
00000000012b9b4c	movl	%eax, 0x10(%rdi)
00000000012b9b4f	jmp	0x12b9b62
00000000012b9b51	movq	$0x0, 0x8(%rdi)
00000000012b9b59	movq	(%rdi), %rax
00000000012b9b5c	callq	*0x20(%rax)
00000000012b9b5f	movq	(%rbx), %rdi
00000000012b9b62	movb	$0x0, 0x10(%rbx)
00000000012b9b66	movq	0x8(%rdi), %r14
00000000012b9b6a	callq	0x1497b12                       ## symbol stub for: _pthread_self
00000000012b9b6f	cmpq	%rax, %r14
00000000012b9b72	je	0x12b9b8a
00000000012b9b74	movq	0x8(%rbx), %rax
00000000012b9b78	movq	0x80(%rax), %rdi
00000000012b9b7f	testq	%rdi, %rdi
00000000012b9b82	je	0x12b9b8a
00000000012b9b84	movq	(%rdi), %rax
00000000012b9b87	callq	*0x30(%rax)
00000000012b9b8a	popq	%rbx
00000000012b9b8b	popq	%r14
00000000012b9b8d	popq	%rbp
00000000012b9b8e	retq
00000000012b9b8f	movq	%rax, %rdi
00000000012b9b92	callq	___clang_call_terminate
00000000012b9b97	addb	%al, (%rax)
00000000012b9b99	addb	%al, (%rax)
00000000012b9b9b	addb	%al, (%rax)
00000000012b9b9d	addb	%al, (%rax)
00000000012b9b9f	addb	%dl, 0x48(%rbp)
00000000012b9ba2	movl	%esp, %ebp
00000000012b9ba4	leaq	0x66bc8d(%rip), %rax
00000000012b9bab	movq	%rax, (%rdi)
00000000012b9bae	movl	%esi, 0x8(%rdi)
00000000012b9bb1	xorps	%xmm0, %xmm0
00000000012b9bb4	movups	%xmm0, 0x10(%rdi)
00000000012b9bb8	movups	%xmm0, 0x20(%rdi)
00000000012b9bbc	movq	$0x0, 0x30(%rdi)
00000000012b9bc4	popq	%rbp
00000000012b9bc5	retq
00000000012b9bc6	nopw	%cs:(%rax,%rax)
