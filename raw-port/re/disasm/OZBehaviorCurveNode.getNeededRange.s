__ZN19OZBehaviorCurveNode14getNeededRangeEP16OZCurveNodeParam:
000000000020b9e0	pushq	%rbp
000000000020b9e1	movq	%rsp, %rbp
000000000020b9e4	movq	%rsi, %rax
000000000020b9e7	movq	0x70(%rsi), %rcx
000000000020b9eb	movq	%rcx, 0x28(%rsi)
000000000020b9ef	movups	0x60(%rsi), %xmm0
000000000020b9f3	movups	%xmm0, 0x18(%rsi)
000000000020b9f7	movups	0x78(%rsi), %xmm0
000000000020b9fb	movups	%xmm0, 0x30(%rsi)
000000000020b9ff	movq	0x88(%rsi), %rcx
000000000020ba06	movq	%rcx, 0x40(%rsi)
000000000020ba0a	movl	0x90(%rsi), %ecx
000000000020ba10	movl	%ecx, 0x48(%rsi)
000000000020ba13	movb	$0x0, 0x58(%rsi)
000000000020ba17	movq	0x98(%rsi), %rcx
000000000020ba1e	movq	%rcx, 0x50(%rsi)
000000000020ba22	popq	%rbp
000000000020ba23	retq
000000000020ba24	nopw	%cs:(%rax,%rax)
