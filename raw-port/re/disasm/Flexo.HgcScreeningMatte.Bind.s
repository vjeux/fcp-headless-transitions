__ZN17HgcScreeningMatte4BindEP9HGHandler:
000000000146cc70	pushq	%rbp
000000000146cc71	movq	%rsp, %rbp
000000000146cc74	pushq	%r14
000000000146cc76	pushq	%rbx
000000000146cc77	movq	%rsi, %rbx
000000000146cc7a	movq	%rdi, %r14
000000000146cc7d	movq	0x198(%rdi), %rdx
000000000146cc84	movq	(%rsi), %rax
000000000146cc87	movq	%rsi, %rdi
000000000146cc8a	xorl	%esi, %esi
000000000146cc8c	movl	$0x1, %ecx
000000000146cc91	callq	*0x90(%rax)
000000000146cc97	movq	(%r14), %rax
000000000146cc9a	movq	%r14, %rdi
000000000146cc9d	movq	%rbx, %rsi
000000000146cca0	callq	*0xc0(%rax)
000000000146cca6	xorl	%eax, %eax
000000000146cca8	popq	%rbx
000000000146cca9	popq	%r14
000000000146ccab	popq	%rbp
000000000146ccac	retq
000000000146ccad	nopl	(%rax)
