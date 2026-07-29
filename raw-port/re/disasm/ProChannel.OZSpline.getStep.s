__ZNK8OZSpline7getStepEv:
000000000002dc7e	pushq	%rbp
000000000002dc7f	movq	%rsp, %rbp
000000000002dc82	pushq	%rbx
000000000002dc83	pushq	%rax
000000000002dc84	movq	%rdi, %rbx
000000000002dc87	movq	0xa8(%rsi), %rax
000000000002dc8e	cmpb	$0x1, (%rax)
000000000002dc91	jne	0x2dca2
000000000002dc93	movl	$0x1, %esi
000000000002dc98	movq	%rbx, %rdi
000000000002dc9b	movl	$0x1, %edx
000000000002dca0	jmp	0x2dccb
000000000002dca2	movq	0xa0(%rsi), %rsi
000000000002dca9	testq	%rsi, %rsi
000000000002dcac	je	0x2dcbe
000000000002dcae	cmpb	$0x1, 0x4(%rax)
000000000002dcb2	jne	0x2dcbe
000000000002dcb4	movq	%rbx, %rdi
000000000002dcb7	callq	__ZNK12OZSplineNode16getFrameDurationEv ## OZSplineNode::getFrameDuration() const
000000000002dcbc	jmp	0x2dcd0
000000000002dcbe	movl	$0x1, %esi
000000000002dcc3	movq	%rbx, %rdi
000000000002dcc6	movl	$0x1e, %edx
000000000002dccb	callq	0xaca92                         ## symbol stub for: _CMTimeMake
000000000002dcd0	movq	%rbx, %rax
000000000002dcd3	addq	$0x8, %rsp
000000000002dcd7	popq	%rbx
000000000002dcd8	popq	%rbp
000000000002dcd9	retq
