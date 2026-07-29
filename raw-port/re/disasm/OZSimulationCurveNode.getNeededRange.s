__ZN21OZSimulationCurveNode14getNeededRangeEP16OZCurveNodeParam:
0000000000208f40	pushq	%rbp
0000000000208f41	movq	%rsp, %rbp
0000000000208f44	movq	%rsi, %rax
0000000000208f47	movq	0x70(%rsi), %rcx
0000000000208f4b	movq	%rcx, 0x28(%rsi)
0000000000208f4f	movups	0x60(%rsi), %xmm0
0000000000208f53	movups	%xmm0, 0x18(%rsi)
0000000000208f57	movups	0x78(%rsi), %xmm0
0000000000208f5b	movups	%xmm0, 0x30(%rsi)
0000000000208f5f	movq	0x88(%rsi), %rcx
0000000000208f66	movq	%rcx, 0x40(%rsi)
0000000000208f6a	movl	0x90(%rsi), %ecx
0000000000208f70	movl	%ecx, 0x48(%rsi)
0000000000208f73	movb	$0x0, 0x58(%rsi)
0000000000208f77	movq	0x98(%rsi), %rcx
0000000000208f7e	movq	%rcx, 0x50(%rsi)
0000000000208f82	popq	%rbp
0000000000208f83	retq
0000000000208f84	nopw	%cs:(%rax,%rax)
