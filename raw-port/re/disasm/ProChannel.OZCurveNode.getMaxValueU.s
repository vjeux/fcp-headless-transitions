__ZN11OZCurveNode12getMaxValueUEv:
0000000000029bdc	pushq	%rbp
0000000000029bdd	movq	%rsp, %rbp
0000000000029be0	movq	%rdi, %rax
0000000000029be3	movq	0xa08d6(%rip), %rcx             ## literal pool symbol address: _kCMTimeZero
0000000000029bea	movq	0x10(%rcx), %rdx
0000000000029bee	movq	%rdx, 0x10(%rdi)
0000000000029bf2	movups	(%rcx), %xmm0
0000000000029bf5	movups	%xmm0, (%rdi)
0000000000029bf8	popq	%rbp
0000000000029bf9	retq
