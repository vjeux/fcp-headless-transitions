__ZN14OZDynamicCurve16setVertexChannelEPvP21OZChannelVertexFolder:
0000000000029458	pushq	%rbp
0000000000029459	movq	%rsp, %rbp
000000000002945c	pushq	%r15
000000000002945e	pushq	%r14
0000000000029460	pushq	%r12
0000000000029462	pushq	%rbx
0000000000029463	movq	%rdx, %rbx
0000000000029466	movq	%rsi, %r14
0000000000029469	movq	%rdi, %r15
000000000002946c	addq	$0x8, %r15
0000000000029470	movq	%r15, %rdi
0000000000029473	callq	__ZN8OZSpline13isValidHandleEPv ## OZSpline::isValidHandle(void*)
0000000000029478	testq	%rbx, %rbx
000000000002947b	setne	%r12b
000000000002947f	andb	%al, %r12b
0000000000029482	cmpb	$0x1, %r12b
0000000000029486	jne	0x29496
0000000000029488	movq	%r15, %rdi
000000000002948b	movq	%r14, %rsi
000000000002948e	movq	%rbx, %rdx
0000000000029491	callq	__ZN15OZDynamicSpline16setVertexChannelEPvP21OZChannelVertexFolder ## OZDynamicSpline::setVertexChannel(void*, OZChannelVertexFolder*)
0000000000029496	movl	%r12d, %eax
0000000000029499	popq	%rbx
000000000002949a	popq	%r12
000000000002949c	popq	%r14
000000000002949e	popq	%r15
00000000000294a0	popq	%rbp
00000000000294a1	retq
