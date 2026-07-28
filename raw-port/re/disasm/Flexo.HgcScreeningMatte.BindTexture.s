__ZN17HgcScreeningMatte11BindTextureEP9HGHandleri:
000000000146cbc0	pushq	%rbp
000000000146cbc1	movq	%rsp, %rbp
000000000146cbc4	pushq	%r14
000000000146cbc6	pushq	%rbx
000000000146cbc7	movq	%rsi, %rbx
000000000146cbca	cmpl	$0x1, %edx
000000000146cbcd	je	0x146cc01
000000000146cbcf	movl	$0xffffffff, %r14d              ## imm = 0xFFFFFFFF
000000000146cbd5	testl	%edx, %edx
000000000146cbd7	jne	0x146cc5d
000000000146cbdd	movq	(%rbx), %rax
000000000146cbe0	xorl	%r14d, %r14d
000000000146cbe3	movq	%rbx, %rdi
000000000146cbe6	xorl	%esi, %esi
000000000146cbe8	xorl	%edx, %edx
000000000146cbea	callq	*0x48(%rax)
000000000146cbed	movq	(%rbx), %rax
000000000146cbf0	movq	%rbx, %rdi
000000000146cbf3	xorl	%esi, %esi
000000000146cbf5	xorl	%edx, %edx
000000000146cbf7	callq	*0x30(%rax)
000000000146cbfa	movq	%rbx, %rdi
000000000146cbfd	xorl	%esi, %esi
000000000146cbff	jmp	0x146cc29
000000000146cc01	movq	(%rbx), %rax
000000000146cc04	xorl	%r14d, %r14d
000000000146cc07	movq	%rbx, %rdi
000000000146cc0a	movl	$0x1, %esi
000000000146cc0f	xorl	%edx, %edx
000000000146cc11	callq	*0x48(%rax)
000000000146cc14	movq	(%rbx), %rax
000000000146cc17	movq	%rbx, %rdi
000000000146cc1a	xorl	%esi, %esi
000000000146cc1c	xorl	%edx, %edx
000000000146cc1e	callq	*0x30(%rax)
000000000146cc21	movq	%rbx, %rdi
000000000146cc24	movl	$0x1, %esi
000000000146cc29	xorl	%edx, %edx
000000000146cc2b	xorl	%ecx, %ecx
000000000146cc2d	xorl	%r8d, %r8d
000000000146cc30	callq	0x1496df2                       ## symbol stub for: __ZN9HGHandler8TexCoordEiiiPKd
000000000146cc35	movq	0x90(%rbx), %rdi
000000000146cc3c	movq	(%rdi), %rax
000000000146cc3f	movl	$0x2e, %esi
000000000146cc44	callq	*0x80(%rax)
000000000146cc4a	testl	%eax, %eax
000000000146cc4c	jne	0x146cc5d
000000000146cc4e	movq	(%rbx), %rax
000000000146cc51	movq	%rbx, %rdi
000000000146cc54	callq	*0xa8(%rax)
000000000146cc5a	xorl	%r14d, %r14d
000000000146cc5d	movl	%r14d, %eax
000000000146cc60	popq	%rbx
000000000146cc61	popq	%r14
000000000146cc63	popq	%rbp
000000000146cc64	retq
000000000146cc65	nopw	%cs:(%rax,%rax)
