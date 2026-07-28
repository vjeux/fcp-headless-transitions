__ZN10HGAnaglyph12GetParameterEiPf:
000000000006f620	pushq	%rbp
000000000006f621	movq	%rsp, %rbp
000000000006f624	cmpl	$0x2, %esi
000000000006f627	je	0x6f680
000000000006f629	cmpl	$0x1, %esi
000000000006f62c	je	0x6f650
000000000006f62e	movl	$0xffffffff, %eax               ## imm = 0xFFFFFFFF
000000000006f633	testl	%esi, %esi
000000000006f635	jne	0x6f6b5
000000000006f637	movss	0x1a0(%rdi), %xmm0
000000000006f63f	movss	%xmm0, (%rdx)
000000000006f643	movq	$0x0, 0x4(%rdx)
000000000006f64b	xorps	%xmm0, %xmm0
000000000006f64e	jmp	0x6f6ae
000000000006f650	movss	0x1a4(%rdi), %xmm0
000000000006f658	movss	%xmm0, (%rdx)
000000000006f65c	movss	0x1a8(%rdi), %xmm0
000000000006f664	movss	%xmm0, 0x4(%rdx)
000000000006f669	movss	0x1ac(%rdi), %xmm0
000000000006f671	movss	%xmm0, 0x8(%rdx)
000000000006f676	movss	0x1b0(%rdi), %xmm0
000000000006f67e	jmp	0x6f6ae
000000000006f680	movss	0x1b4(%rdi), %xmm0
000000000006f688	movss	%xmm0, (%rdx)
000000000006f68c	movss	0x1b8(%rdi), %xmm0
000000000006f694	movss	%xmm0, 0x4(%rdx)
000000000006f699	movss	0x1bc(%rdi), %xmm0
000000000006f6a1	movss	%xmm0, 0x8(%rdx)
000000000006f6a6	movss	0x1c0(%rdi), %xmm0
000000000006f6ae	movss	%xmm0, 0xc(%rdx)
000000000006f6b3	xorl	%eax, %eax
000000000006f6b5	popq	%rbp
000000000006f6b6	retq
000000000006f6b7	nopw	(%rax,%rax)
