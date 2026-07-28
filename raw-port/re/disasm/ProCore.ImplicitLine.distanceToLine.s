__ZNK12ImplicitLine14distanceToLineERK9PCVector2IdE:
000000000006c760	pushq	%rbp
000000000006c761	movq	%rsp, %rbp
000000000006c764	movupd	(%rdi), %xmm1
000000000006c768	movupd	(%rsi), %xmm0
000000000006c76c	mulpd	%xmm1, %xmm0
000000000006c770	haddpd	%xmm0, %xmm0
000000000006c774	addsd	0x10(%rdi), %xmm0
000000000006c779	popq	%rbp
000000000006c77a	retq
000000000006c77b	nop
