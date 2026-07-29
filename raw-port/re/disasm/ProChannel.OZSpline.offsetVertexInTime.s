__ZN8OZSpline18offsetVertexInTimeEPvRK6CMTimeS3_:
000000000003da22	pushq	%rbp
000000000003da23	movq	%rsp, %rbp
000000000003da26	testq	%rsi, %rsi
000000000003da29	je	0x3da3b
000000000003da2b	movq	(%rsi), %rax
000000000003da2e	movq	0x10(%rax), %rax
000000000003da32	movq	%rsi, %rdi
000000000003da35	movq	%rdx, %rsi
000000000003da38	popq	%rbp
000000000003da39	jmpq	*%rax
000000000003da3b	popq	%rbp
000000000003da3c	retq
000000000003da3d	nop
