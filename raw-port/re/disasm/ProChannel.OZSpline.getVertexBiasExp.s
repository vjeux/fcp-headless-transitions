__ZN8OZSpline16getVertexBiasExpEPvPdRK6CMTime:
000000000003c94c	testq	%rdx, %rdx
000000000003c94f	je	0x3c975
000000000003c951	pushq	%rbp
000000000003c952	movq	%rsp, %rbp
000000000003c955	pushq	%rbx
000000000003c956	pushq	%rax
000000000003c957	movq	%rdx, %rbx
000000000003c95a	movq	(%rsi), %rax
000000000003c95d	movq	%rsi, %rdi
000000000003c960	movq	%rcx, %rsi
000000000003c963	callq	*0x28(%rax)
000000000003c966	callq	0xaceee                         ## symbol stub for: _log
000000000003c96b	movsd	%xmm0, (%rbx)
000000000003c96f	addq	$0x8, %rsp
000000000003c973	popq	%rbx
000000000003c974	popq	%rbp
000000000003c975	movb	$0x1, %al
000000000003c977	retq
