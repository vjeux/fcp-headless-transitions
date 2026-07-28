__ZN11PCSemaphoreC1Ej:
00000000000348bc	pushq	%rbp
00000000000348bd	movq	%rsp, %rbp
00000000000348c0	pushq	%rbx
00000000000348c1	pushq	%rax
00000000000348c2	movq	%rdi, %rbx
00000000000348c5	movl	%esi, %eax
00000000000348c7	movq	%rax, (%rdi)
00000000000348ca	addq	$0x8, %rdi
00000000000348ce	xorl	%esi, %esi
00000000000348d0	callq	0xdea80                         ## symbol stub for: _pthread_cond_init
00000000000348d5	addq	$0x38, %rbx
00000000000348d9	movq	%rbx, %rdi
00000000000348dc	xorl	%esi, %esi
00000000000348de	addq	$0x8, %rsp
00000000000348e2	popq	%rbx
00000000000348e3	popq	%rbp
00000000000348e4	jmp	0xdeab6                         ## symbol stub for: _pthread_mutex_init
00000000000348e9	nop
