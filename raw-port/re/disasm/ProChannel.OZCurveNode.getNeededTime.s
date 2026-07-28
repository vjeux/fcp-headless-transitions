__ZN11OZCurveNode13getNeededTimeERK6CMTime:
0000000000029bc4	pushq	%rbp
0000000000029bc5	movq	%rsp, %rbp
0000000000029bc8	movq	%rdi, %rax
0000000000029bcb	movq	0x10(%rdx), %rcx
0000000000029bcf	movq	%rcx, 0x10(%rdi)
0000000000029bd3	movups	(%rdx), %xmm0
0000000000029bd6	movups	%xmm0, (%rdi)
0000000000029bd9	popq	%rbp
0000000000029bda	retq
0000000000029bdb	nop
