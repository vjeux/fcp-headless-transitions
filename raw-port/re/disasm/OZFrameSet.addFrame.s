__ZN10OZFrameSet8addFrameE6CMTimeS0_:
0000000000376250	pushq	%rbp
0000000000376251	movq	%rsp, %rbp
0000000000376254	subq	$0x50, %rsp
0000000000376258	movq	0x20(%rbp), %rax
000000000037625c	movq	%rax, -0x20(%rbp)
0000000000376260	movaps	0x10(%rbp), %xmm0
0000000000376264	movaps	%xmm0, -0x30(%rbp)
0000000000376268	movups	0x28(%rbp), %xmm0
000000000037626c	movups	%xmm0, -0x18(%rbp)
0000000000376270	movq	0x38(%rbp), %rax
0000000000376274	movq	%rax, -0x8(%rbp)
0000000000376278	movq	0x38(%rbp), %rax
000000000037627c	movq	%rax, 0x10(%rsp)
0000000000376281	movups	0x28(%rbp), %xmm0
0000000000376285	movups	%xmm0, (%rsp)
0000000000376289	leaq	-0x30(%rbp), %rsi
000000000037628d	callq	__ZN10OZFrameSet8addRangeERK11PCTimeRange6CMTime ## OZFrameSet::addRange(PCTimeRange const&, CMTime)
0000000000376292	addq	$0x50, %rsp
0000000000376296	popq	%rbp
0000000000376297	retq
0000000000376298	nopl	(%rax,%rax)
