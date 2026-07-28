__ZN11PCEvaluatorC1ERKS_:
000000000000d27c	pushq	%rbp
000000000000d27d	movq	%rsp, %rbp
000000000000d280	xorl	%eax, %eax
000000000000d282	movl	%eax, 0x30(%rdi)
000000000000d285	xorps	%xmm0, %xmm0
000000000000d288	movups	%xmm0, 0x20(%rdi)
000000000000d28c	movups	%xmm0, 0x10(%rdi)
000000000000d290	movups	%xmm0, (%rdi)
000000000000d293	movups	%xmm0, 0x38(%rdi)
000000000000d297	movups	%xmm0, 0x48(%rdi)
000000000000d29b	movl	%eax, 0x58(%rdi)
000000000000d29e	popq	%rbp
000000000000d29f	retq
