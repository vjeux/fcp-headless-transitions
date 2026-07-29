__ZN8OZSpline19getVertexBiasLinearEPvPdRK6CMTime:
000000000003c88a	testq	%rdx, %rdx
000000000003c88d	je	0x3c8ae
000000000003c88f	pushq	%rbp
000000000003c890	movq	%rsp, %rbp
000000000003c893	pushq	%rbx
000000000003c894	pushq	%rax
000000000003c895	movq	%rdx, %rbx
000000000003c898	movq	(%rsi), %rax
000000000003c89b	movq	%rsi, %rdi
000000000003c89e	movq	%rcx, %rsi
000000000003c8a1	callq	*0x28(%rax)
000000000003c8a4	movsd	%xmm0, (%rbx)
000000000003c8a8	addq	$0x8, %rsp
000000000003c8ac	popq	%rbx
000000000003c8ad	popq	%rbp
000000000003c8ae	movb	$0x1, %al
000000000003c8b0	retq
000000000003c8b1	nop
