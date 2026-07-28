__ZN21FFLockerWithCallbacks11forceUnlockEv:
00000000012b9ac0	pushq	%rbp
00000000012b9ac1	movq	%rsp, %rbp
00000000012b9ac4	pushq	%r14
00000000012b9ac6	pushq	%rbx
00000000012b9ac7	cmpb	$0x1, 0x10(%rdi)
00000000012b9acb	jne	0x12b9b1e
00000000012b9acd	movq	%rdi, %rbx
00000000012b9ad0	movq	(%rdi), %rdi
00000000012b9ad3	movl	0x10(%rdi), %eax
00000000012b9ad6	testl	%eax, %eax
00000000012b9ad8	je	0x12b9ae1
00000000012b9ada	decl	%eax
00000000012b9adc	movl	%eax, 0x10(%rdi)
00000000012b9adf	jmp	0x12b9af2
00000000012b9ae1	movq	$0x0, 0x8(%rdi)
00000000012b9ae9	movq	(%rdi), %rax
00000000012b9aec	callq	*0x20(%rax)
00000000012b9aef	movq	(%rbx), %rdi
00000000012b9af2	movb	$0x0, 0x10(%rbx)
00000000012b9af6	movq	0x8(%rdi), %r14
00000000012b9afa	callq	0x1497b12                       ## symbol stub for: _pthread_self
00000000012b9aff	cmpq	%rax, %r14
00000000012b9b02	je	0x12b9b1e
00000000012b9b04	movq	0x8(%rbx), %rax
00000000012b9b08	movq	0x80(%rax), %rdi
00000000012b9b0f	testq	%rdi, %rdi
00000000012b9b12	je	0x12b9b1e
00000000012b9b14	movq	(%rdi), %rax
00000000012b9b17	popq	%rbx
00000000012b9b18	popq	%r14
00000000012b9b1a	popq	%rbp
00000000012b9b1b	jmpq	*0x30(%rax)
00000000012b9b1e	popq	%rbx
00000000012b9b1f	popq	%r14
00000000012b9b21	popq	%rbp
00000000012b9b22	retq
00000000012b9b23	nopw	%cs:(%rax,%rax)
