__ZN16HgcMultiplyAlpha11BindTextureEP9HGHandleri:
0000000001468cc0	pushq	%rbp
0000000001468cc1	movq	%rsp, %rbp
0000000001468cc4	pushq	%r14
0000000001468cc6	pushq	%rbx
0000000001468cc7	movq	%rsi, %rbx
0000000001468cca	cmpl	$0x1, %edx
0000000001468ccd	je	0x1468d01
0000000001468ccf	movl	$0xffffffff, %r14d              ## imm = 0xFFFFFFFF
0000000001468cd5	testl	%edx, %edx
0000000001468cd7	jne	0x1468d5d
0000000001468cdd	movq	(%rbx), %rax
0000000001468ce0	xorl	%r14d, %r14d
0000000001468ce3	movq	%rbx, %rdi
0000000001468ce6	xorl	%esi, %esi
0000000001468ce8	xorl	%edx, %edx
0000000001468cea	callq	*0x48(%rax)
0000000001468ced	movq	(%rbx), %rax
0000000001468cf0	movq	%rbx, %rdi
0000000001468cf3	xorl	%esi, %esi
0000000001468cf5	xorl	%edx, %edx
0000000001468cf7	callq	*0x30(%rax)
0000000001468cfa	movq	%rbx, %rdi
0000000001468cfd	xorl	%esi, %esi
0000000001468cff	jmp	0x1468d29
0000000001468d01	movq	(%rbx), %rax
0000000001468d04	xorl	%r14d, %r14d
0000000001468d07	movq	%rbx, %rdi
0000000001468d0a	movl	$0x1, %esi
0000000001468d0f	xorl	%edx, %edx
0000000001468d11	callq	*0x48(%rax)
0000000001468d14	movq	(%rbx), %rax
0000000001468d17	movq	%rbx, %rdi
0000000001468d1a	xorl	%esi, %esi
0000000001468d1c	xorl	%edx, %edx
0000000001468d1e	callq	*0x30(%rax)
0000000001468d21	movq	%rbx, %rdi
0000000001468d24	movl	$0x1, %esi
0000000001468d29	xorl	%edx, %edx
0000000001468d2b	xorl	%ecx, %ecx
0000000001468d2d	xorl	%r8d, %r8d
0000000001468d30	callq	0x1496df2                       ## symbol stub for: __ZN9HGHandler8TexCoordEiiiPKd
0000000001468d35	movq	0x90(%rbx), %rdi
0000000001468d3c	movq	(%rdi), %rax
0000000001468d3f	movl	$0x2e, %esi
0000000001468d44	callq	*0x80(%rax)
0000000001468d4a	testl	%eax, %eax
0000000001468d4c	jne	0x1468d5d
0000000001468d4e	movq	(%rbx), %rax
0000000001468d51	movq	%rbx, %rdi
0000000001468d54	callq	*0xa8(%rax)
0000000001468d5a	xorl	%r14d, %r14d
0000000001468d5d	movl	%r14d, %eax
0000000001468d60	popq	%rbx
0000000001468d61	popq	%r14
0000000001468d63	popq	%rbp
0000000001468d64	retq
0000000001468d65	nopw	%cs:(%rax,%rax)
