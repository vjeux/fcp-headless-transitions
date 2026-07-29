__ZN14OZDynamicCurve19reverseWindingOrderEv:
00000000000293f6	pushq	%rbp
00000000000293f7	movq	%rsp, %rbp
00000000000293fa	addq	$0x8, %rdi
00000000000293fe	movq	0xa10bb(%rip), %rsi             ## literal pool symbol address: _kCMTimeZero
0000000000029405	callq	__ZN15OZDynamicSpline19reverseWindingOrderERK6CMTime ## OZDynamicSpline::reverseWindingOrder(CMTime const&)
000000000002940a	movb	$0x1, %al
000000000002940c	popq	%rbp
000000000002940d	retq
