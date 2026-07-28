__ZN11OZCurveNode12getMinValueUEv:
0000000000029bfa	pushq	%rbp
0000000000029bfb	movq	%rsp, %rbp
0000000000029bfe	movq	%rdi, %rax
0000000000029c01	movq	0xa08b8(%rip), %rcx             ## literal pool symbol address: _kCMTimeZero
0000000000029c08	movq	0x10(%rcx), %rdx
0000000000029c0c	movq	%rdx, 0x10(%rdi)
0000000000029c10	movups	(%rcx), %xmm0
0000000000029c13	movups	%xmm0, (%rdi)
0000000000029c16	popq	%rbp
0000000000029c17	retq
