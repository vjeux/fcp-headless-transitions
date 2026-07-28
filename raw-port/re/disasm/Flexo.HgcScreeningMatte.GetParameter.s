__ZN17HgcScreeningMatte12GetParameterEiPf:
000000000146d460	movl	$0xffffffff, %eax               ## imm = 0xFFFFFFFF
000000000146d465	testl	%esi, %esi
000000000146d467	je	0x146d46a
000000000146d469	retq
000000000146d46a	pushq	%rbp
000000000146d46b	movq	%rsp, %rbp
000000000146d46e	movq	0x198(%rdi), %rax
000000000146d475	movss	0xe0(%rax), %xmm0
000000000146d47d	movss	%xmm0, (%rdx)
000000000146d481	movss	0xe4(%rax), %xmm0
000000000146d489	movss	%xmm0, 0x4(%rdx)
000000000146d48e	movss	0xe8(%rax), %xmm0
000000000146d496	movss	%xmm0, 0x8(%rdx)
000000000146d49b	movss	0xec(%rax), %xmm0
000000000146d4a3	movss	%xmm0, 0xc(%rdx)
000000000146d4a8	xorl	%eax, %eax
000000000146d4aa	popq	%rbp
000000000146d4ab	retq
000000000146d4ac	nopl	(%rax)
