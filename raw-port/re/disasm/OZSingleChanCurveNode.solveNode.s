__ZN21OZSingleChanCurveNode9solveNodeER16OZCurveNodeParam:
00000000003ebcb0	pushq	%rbp
00000000003ebcb1	movq	%rsp, %rbp
00000000003ebcb4	pushq	%r14
00000000003ebcb6	pushq	%rbx
00000000003ebcb7	movq	%rsi, %rbx
00000000003ebcba	movq	%rdi, %r14
00000000003ebcbd	movq	0x20(%rdi), %rdi
00000000003ebcc1	movq	(%rdi), %rax
00000000003ebcc4	callq	*0x40(%rax)
00000000003ebcc7	testb	%al, %al
00000000003ebcc9	je	0x3ebcd0
00000000003ebccb	popq	%rbx
00000000003ebccc	popq	%r14
00000000003ebcce	popq	%rbp
00000000003ebccf	retq
00000000003ebcd0	movq	0x20(%r14), %rdi
00000000003ebcd4	movl	0x28(%r14), %esi
00000000003ebcd8	movq	(%rdi), %rax
00000000003ebcdb	movq	0x18(%rax), %rax
00000000003ebcdf	movq	%rbx, %rdx
00000000003ebce2	popq	%rbx
00000000003ebce3	popq	%r14
00000000003ebce5	popq	%rbp
00000000003ebce6	jmpq	*%rax
00000000003ebce8	nopl	(%rax,%rax)
