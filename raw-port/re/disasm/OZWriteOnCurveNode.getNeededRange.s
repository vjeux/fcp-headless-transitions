__ZN18OZWriteOnCurveNode14getNeededRangeEP16OZCurveNodeParam:
00000000004779f0	pushq	%rbp
00000000004779f1	movq	%rsp, %rbp
00000000004779f4	movq	%rsi, %rax
00000000004779f7	movq	0x70(%rsi), %rcx
00000000004779fb	movq	%rcx, 0x28(%rsi)
00000000004779ff	movups	0x60(%rsi), %xmm0
0000000000477a03	movups	%xmm0, 0x18(%rsi)
0000000000477a07	movups	0x78(%rsi), %xmm0
0000000000477a0b	movups	%xmm0, 0x30(%rsi)
0000000000477a0f	movq	0x88(%rsi), %rcx
0000000000477a16	movq	%rcx, 0x40(%rsi)
0000000000477a1a	movl	0x90(%rsi), %ecx
0000000000477a20	movl	%ecx, 0x48(%rsi)
0000000000477a23	movb	$0x0, 0x58(%rsi)
0000000000477a27	movq	0x98(%rsi), %rcx
0000000000477a2e	movq	%rcx, 0x50(%rsi)
0000000000477a32	popq	%rbp
0000000000477a33	retq
0000000000477a34	nopw	%cs:(%rax,%rax)
