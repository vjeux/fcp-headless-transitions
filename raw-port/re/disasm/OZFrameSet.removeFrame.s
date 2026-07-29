__ZN10OZFrameSet11removeFrameE6CMTimeS0_:
0000000000376a90	pushq	%rbp
0000000000376a91	movq	%rsp, %rbp
0000000000376a94	subq	$0x50, %rsp
0000000000376a98	movq	0x20(%rbp), %rax
0000000000376a9c	movq	%rax, -0x20(%rbp)
0000000000376aa0	movaps	0x10(%rbp), %xmm0
0000000000376aa4	movaps	%xmm0, -0x30(%rbp)
0000000000376aa8	movups	0x28(%rbp), %xmm0
0000000000376aac	movups	%xmm0, -0x18(%rbp)
0000000000376ab0	movq	0x38(%rbp), %rax
0000000000376ab4	movq	%rax, -0x8(%rbp)
0000000000376ab8	movq	0x38(%rbp), %rax
0000000000376abc	movq	%rax, 0x10(%rsp)
0000000000376ac1	movups	0x28(%rbp), %xmm0
0000000000376ac5	movups	%xmm0, (%rsp)
0000000000376ac9	leaq	-0x30(%rbp), %rsi
0000000000376acd	callq	__ZN10OZFrameSet11removeRangeERK11PCTimeRange6CMTime ## OZFrameSet::removeRange(PCTimeRange const&, CMTime)
0000000000376ad2	addq	$0x50, %rsp
0000000000376ad6	popq	%rbp
0000000000376ad7	retq
0000000000376ad8	nopl	(%rax,%rax)
