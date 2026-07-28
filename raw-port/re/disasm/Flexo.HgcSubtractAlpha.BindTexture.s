__ZN16HgcSubtractAlpha11BindTextureEP9HGHandleri:
000000000146e280	pushq	%rbp
000000000146e281	movq	%rsp, %rbp
000000000146e284	pushq	%r14
000000000146e286	pushq	%rbx
000000000146e287	movq	%rsi, %rbx
000000000146e28a	cmpl	$0x1, %edx
000000000146e28d	je	0x146e2c1
000000000146e28f	movl	$0xffffffff, %r14d              ## imm = 0xFFFFFFFF
000000000146e295	testl	%edx, %edx
000000000146e297	jne	0x146e31d
000000000146e29d	movq	(%rbx), %rax
000000000146e2a0	xorl	%r14d, %r14d
000000000146e2a3	movq	%rbx, %rdi
000000000146e2a6	xorl	%esi, %esi
000000000146e2a8	xorl	%edx, %edx
000000000146e2aa	callq	*0x48(%rax)
000000000146e2ad	movq	(%rbx), %rax
000000000146e2b0	movq	%rbx, %rdi
000000000146e2b3	xorl	%esi, %esi
000000000146e2b5	xorl	%edx, %edx
000000000146e2b7	callq	*0x30(%rax)
000000000146e2ba	movq	%rbx, %rdi
000000000146e2bd	xorl	%esi, %esi
000000000146e2bf	jmp	0x146e2e9
000000000146e2c1	movq	(%rbx), %rax
000000000146e2c4	xorl	%r14d, %r14d
000000000146e2c7	movq	%rbx, %rdi
000000000146e2ca	movl	$0x1, %esi
000000000146e2cf	xorl	%edx, %edx
000000000146e2d1	callq	*0x48(%rax)
000000000146e2d4	movq	(%rbx), %rax
000000000146e2d7	movq	%rbx, %rdi
000000000146e2da	xorl	%esi, %esi
000000000146e2dc	xorl	%edx, %edx
000000000146e2de	callq	*0x30(%rax)
000000000146e2e1	movq	%rbx, %rdi
000000000146e2e4	movl	$0x1, %esi
000000000146e2e9	xorl	%edx, %edx
000000000146e2eb	xorl	%ecx, %ecx
000000000146e2ed	xorl	%r8d, %r8d
000000000146e2f0	callq	0x1496df2                       ## symbol stub for: __ZN9HGHandler8TexCoordEiiiPKd
000000000146e2f5	movq	0x90(%rbx), %rdi
000000000146e2fc	movq	(%rdi), %rax
000000000146e2ff	movl	$0x2e, %esi
000000000146e304	callq	*0x80(%rax)
000000000146e30a	testl	%eax, %eax
000000000146e30c	jne	0x146e31d
000000000146e30e	movq	(%rbx), %rax
000000000146e311	movq	%rbx, %rdi
000000000146e314	callq	*0xa8(%rax)
000000000146e31a	xorl	%r14d, %r14d
000000000146e31d	movl	%r14d, %eax
000000000146e320	popq	%rbx
000000000146e321	popq	%r14
000000000146e323	popq	%rbp
000000000146e324	retq
000000000146e325	nopw	%cs:(%rax,%rax)
