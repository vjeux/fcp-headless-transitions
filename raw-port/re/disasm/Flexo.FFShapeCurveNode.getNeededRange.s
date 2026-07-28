__ZN16FFShapeCurveNode14getNeededRangeEP16OZCurveNodeParam:
000000000065a9a0	pushq	%rbp
000000000065a9a1	movq	%rsp, %rbp
000000000065a9a4	movq	%rsi, %rax
000000000065a9a7	movq	0x70(%rsi), %rcx
000000000065a9ab	movq	%rcx, 0x28(%rsi)
000000000065a9af	movups	0x60(%rsi), %xmm0
000000000065a9b3	movups	%xmm0, 0x18(%rsi)
000000000065a9b7	movups	0x78(%rsi), %xmm0
000000000065a9bb	movups	%xmm0, 0x30(%rsi)
000000000065a9bf	movq	0x88(%rsi), %rcx
000000000065a9c6	movq	%rcx, 0x40(%rsi)
000000000065a9ca	movl	0x90(%rsi), %ecx
000000000065a9d0	movl	%ecx, 0x48(%rsi)
000000000065a9d3	movb	$0x0, 0x58(%rsi)
000000000065a9d7	movq	0x98(%rsi), %rcx
000000000065a9de	movq	%rcx, 0x50(%rsi)
000000000065a9e2	popq	%rbp
000000000065a9e3	retq
000000000065a9e4	nopw	%cs:(%rax,%rax)
