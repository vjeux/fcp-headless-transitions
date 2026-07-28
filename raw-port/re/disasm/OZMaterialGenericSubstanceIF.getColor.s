__ZN28OZMaterialGenericSubstanceIF8getColorERK6CMTimeP7PCColor:
000000000008ecb0	pushq	%rbp
000000000008ecb1	movq	%rsp, %rbp
000000000008ecb4	pushq	%r14
000000000008ecb6	pushq	%rbx
000000000008ecb7	movq	%rdx, %rbx
000000000008ecba	movq	%rsi, %r14
000000000008ecbd	movq	(%rdi), %rax
000000000008ecc0	callq	*0x20(%rax)
000000000008ecc3	movq	(%rax), %rcx
000000000008ecc6	movq	0x328(%rcx), %rcx
000000000008eccd	xorps	%xmm0, %xmm0
000000000008ecd0	movq	%rax, %rdi
000000000008ecd3	movq	%r14, %rsi
000000000008ecd6	movq	%rbx, %rdx
000000000008ecd9	popq	%rbx
000000000008ecda	popq	%r14
000000000008ecdc	popq	%rbp
000000000008ecdd	jmpq	*%rcx
000000000008ecdf	nop
