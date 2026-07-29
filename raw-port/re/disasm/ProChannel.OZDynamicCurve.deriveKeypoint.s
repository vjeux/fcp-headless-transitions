__ZN14OZDynamicCurve14deriveKeypointEPv:
00000000000296ca	testq	%rsi, %rsi
00000000000296cd	je	0x29702
00000000000296cf	pushq	%rbp
00000000000296d0	movq	%rsp, %rbp
00000000000296d3	pushq	%r14
00000000000296d5	pushq	%rbx
00000000000296d6	movq	%rsi, %rbx
00000000000296d9	movq	%rdi, %r14
00000000000296dc	addq	$0x8, %r14
00000000000296e0	movq	%r14, %rdi
00000000000296e3	callq	__ZN8OZSpline13isValidHandleEPv ## OZSpline::isValidHandle(void*)
00000000000296e8	testb	%al, %al
00000000000296ea	je	0x29705
00000000000296ec	movq	0xa0dcd(%rip), %rdx             ## literal pool symbol address: _kCMTimeZero
00000000000296f3	movq	%r14, %rdi
00000000000296f6	movq	%rbx, %rsi
00000000000296f9	callq	__ZN8OZSpline12deriveVertexEPvRK6CMTime ## OZSpline::deriveVertex(void*, CMTime const&)
00000000000296fe	movb	$0x1, %al
0000000000029700	jmp	0x29707
0000000000029702	xorl	%eax, %eax
0000000000029704	retq
0000000000029705	xorl	%eax, %eax
0000000000029707	popq	%rbx
0000000000029708	popq	%r14
000000000002970a	popq	%rbp
000000000002970b	retq
