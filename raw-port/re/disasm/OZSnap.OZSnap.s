__ZN6OZSnapC1ERKS_:
000000000027a690	pushq	%rbp
000000000027a691	movq	%rsp, %rbp
000000000027a694	movl	(%rsi), %eax
000000000027a696	movl	%eax, (%rdi)
000000000027a698	movsd	0x4(%rsi), %xmm0
000000000027a69d	movsd	%xmm0, 0x4(%rdi)
000000000027a6a2	movss	0xc(%rsi), %xmm0
000000000027a6a7	movss	%xmm0, 0xc(%rdi)
000000000027a6ac	popq	%rbp
000000000027a6ad	retq
000000000027a6ae	nop
