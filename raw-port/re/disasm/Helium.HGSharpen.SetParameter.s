__ZN9HGSharpen12SetParameterEiffff:
000000000003ff50	pushq	%rbp
000000000003ff51	movq	%rsp, %rbp
000000000003ff54	cmpl	$0x1, %esi
000000000003ff57	je	0x3ff81
000000000003ff59	testl	%esi, %esi
000000000003ff5b	jne	0x3ffaa
000000000003ff5d	movss	%xmm0, 0x1a0(%rdi)
000000000003ff65	movq	0x1b0(%rdi), %rdi
000000000003ff6c	movq	(%rdi), %rax
000000000003ff6f	movq	0x60(%rax), %rax
000000000003ff73	xorps	%xmm3, %xmm3
000000000003ff76	xorl	%esi, %esi
000000000003ff78	movaps	%xmm0, %xmm1
000000000003ff7b	movaps	%xmm0, %xmm2
000000000003ff7e	popq	%rbp
000000000003ff7f	jmpq	*%rax
000000000003ff81	movss	%xmm0, 0x198(%rdi)
000000000003ff89	movss	%xmm1, 0x19c(%rdi)
000000000003ff91	movq	0x1a8(%rdi), %rdi
000000000003ff98	movq	(%rdi), %rax
000000000003ff9b	movq	0x60(%rax), %rax
000000000003ff9f	xorps	%xmm2, %xmm2
000000000003ffa2	xorps	%xmm3, %xmm3
000000000003ffa5	xorl	%esi, %esi
000000000003ffa7	popq	%rbp
000000000003ffa8	jmpq	*%rax
000000000003ffaa	movl	$0xffffffff, %eax               ## imm = 0xFFFFFFFF
000000000003ffaf	popq	%rbp
000000000003ffb0	retq
000000000003ffb1	nopw	%cs:(%rax,%rax)
