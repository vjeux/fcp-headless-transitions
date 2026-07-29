__ZN8OZSpline15getVertexNormalEPvPdRK6CMTime:
000000000003c6a6	testq	%rdx, %rdx
000000000003c6a9	je	0x3c6ca
000000000003c6ab	pushq	%rbp
000000000003c6ac	movq	%rsp, %rbp
000000000003c6af	pushq	%rbx
000000000003c6b0	pushq	%rax
000000000003c6b1	movq	%rdx, %rbx
000000000003c6b4	movq	(%rsi), %rax
000000000003c6b7	movq	%rsi, %rdi
000000000003c6ba	movq	%rcx, %rsi
000000000003c6bd	callq	*0x70(%rax)
000000000003c6c0	movsd	%xmm0, (%rbx)
000000000003c6c4	addq	$0x8, %rsp
000000000003c6c8	popq	%rbx
000000000003c6c9	popq	%rbp
000000000003c6ca	movb	$0x1, %al
000000000003c6cc	retq
000000000003c6cd	nop
