__ZN11OZCurveNode15getCurrentRangeEv:
0000000000029ba6	pushq	%rbp
0000000000029ba7	movq	%rsp, %rbp
0000000000029baa	movq	%rdi, %rax
0000000000029bad	movq	0xa090c(%rip), %rcx             ## literal pool symbol address: _kCMTimeZero
0000000000029bb4	movq	0x10(%rcx), %rdx
0000000000029bb8	movq	%rdx, 0x10(%rdi)
0000000000029bbc	movups	(%rcx), %xmm0
0000000000029bbf	movups	%xmm0, (%rdi)
0000000000029bc2	popq	%rbp
0000000000029bc3	retq
