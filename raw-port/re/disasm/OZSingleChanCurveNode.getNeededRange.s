__ZN21OZSingleChanCurveNode14getNeededRangeEP16OZCurveNodeParam:
00000000003ebcf0	pushq	%rbp
00000000003ebcf1	movq	%rsp, %rbp
00000000003ebcf4	movq	%rsi, %rdx
00000000003ebcf7	movq	0x20(%rdi), %rax
00000000003ebcfb	movl	0x28(%rdi), %esi
00000000003ebcfe	movq	(%rax), %rcx
00000000003ebd01	movq	0x20(%rcx), %rcx
00000000003ebd05	movq	%rax, %rdi
00000000003ebd08	popq	%rbp
00000000003ebd09	jmpq	*%rcx
00000000003ebd0b	nopl	(%rax,%rax)
