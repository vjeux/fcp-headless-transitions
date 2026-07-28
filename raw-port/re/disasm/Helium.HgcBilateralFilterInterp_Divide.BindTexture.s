__ZN31HgcBilateralFilterInterp_Divide11BindTextureEP9HGHandleri:
000000000031a660	pushq	%rbp
000000000031a661	movq	%rsp, %rbp
000000000031a664	pushq	%r14
000000000031a666	pushq	%rbx
000000000031a667	movq	%rsi, %rbx
000000000031a66a	cmpl	$0x1, %edx
000000000031a66d	je	0x31a6a1
000000000031a66f	movl	$0xffffffff, %r14d              ## imm = 0xFFFFFFFF
000000000031a675	testl	%edx, %edx
000000000031a677	jne	0x31a6fd
000000000031a67d	movq	(%rbx), %rax
000000000031a680	xorl	%r14d, %r14d
000000000031a683	movq	%rbx, %rdi
000000000031a686	xorl	%esi, %esi
000000000031a688	xorl	%edx, %edx
000000000031a68a	callq	*0x48(%rax)
000000000031a68d	movq	(%rbx), %rax
000000000031a690	movq	%rbx, %rdi
000000000031a693	xorl	%esi, %esi
000000000031a695	xorl	%edx, %edx
000000000031a697	callq	*0x30(%rax)
000000000031a69a	movq	%rbx, %rdi
000000000031a69d	xorl	%esi, %esi
000000000031a69f	jmp	0x31a6c9
000000000031a6a1	movq	(%rbx), %rax
000000000031a6a4	xorl	%r14d, %r14d
000000000031a6a7	movq	%rbx, %rdi
000000000031a6aa	movl	$0x1, %esi
000000000031a6af	xorl	%edx, %edx
000000000031a6b1	callq	*0x48(%rax)
000000000031a6b4	movq	(%rbx), %rax
000000000031a6b7	movq	%rbx, %rdi
000000000031a6ba	xorl	%esi, %esi
000000000031a6bc	xorl	%edx, %edx
000000000031a6be	callq	*0x30(%rax)
000000000031a6c1	movq	%rbx, %rdi
000000000031a6c4	movl	$0x1, %esi
000000000031a6c9	xorl	%edx, %edx
000000000031a6cb	xorl	%ecx, %ecx
000000000031a6cd	xorl	%r8d, %r8d
000000000031a6d0	callq	__ZN9HGHandler8TexCoordEiiiPKd  ## HGHandler::TexCoord(int, int, int, double const*)
000000000031a6d5	movq	0x90(%rbx), %rdi
000000000031a6dc	movq	(%rdi), %rax
000000000031a6df	movl	$0x2e, %esi
000000000031a6e4	callq	*0x80(%rax)
000000000031a6ea	testl	%eax, %eax
000000000031a6ec	jne	0x31a6fd
000000000031a6ee	movq	(%rbx), %rax
000000000031a6f1	movq	%rbx, %rdi
000000000031a6f4	callq	*0xa8(%rax)
000000000031a6fa	xorl	%r14d, %r14d
000000000031a6fd	movl	%r14d, %eax
000000000031a700	popq	%rbx
000000000031a701	popq	%r14
000000000031a703	popq	%rbp
000000000031a704	retq
000000000031a705	nopw	%cs:(%rax,%rax)
