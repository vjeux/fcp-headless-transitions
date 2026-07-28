__ZN21OZMotionPathCurveNode14getNeededRangeEP16OZCurveNodeParam:
000000000040d700	pushq	%rbp
000000000040d701	movq	%rsp, %rbp
000000000040d704	movq	%rsi, %rax
000000000040d707	movq	0x70(%rsi), %rcx
000000000040d70b	movq	%rcx, 0x28(%rsi)
000000000040d70f	movups	0x60(%rsi), %xmm0
000000000040d713	movups	%xmm0, 0x18(%rsi)
000000000040d717	movups	0x78(%rsi), %xmm0
000000000040d71b	movups	%xmm0, 0x30(%rsi)
000000000040d71f	movq	0x88(%rsi), %rcx
000000000040d726	movq	%rcx, 0x40(%rsi)
000000000040d72a	movl	0x90(%rsi), %ecx
000000000040d730	movl	%ecx, 0x48(%rsi)
000000000040d733	movb	$0x0, 0x58(%rsi)
000000000040d737	movq	0x98(%rsi), %rcx
000000000040d73e	movq	%rcx, 0x50(%rsi)
000000000040d742	popq	%rbp
000000000040d743	retq
000000000040d744	nopw	%cs:(%rax,%rax)
