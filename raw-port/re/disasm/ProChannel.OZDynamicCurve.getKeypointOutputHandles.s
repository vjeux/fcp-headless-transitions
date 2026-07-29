__ZN14OZDynamicCurve24getKeypointOutputHandlesEPvRK6CMTimePd:
00000000000292b6	pushq	%rbp
00000000000292b7	movq	%rsp, %rbp
00000000000292ba	pushq	%r15
00000000000292bc	pushq	%r14
00000000000292be	pushq	%r12
00000000000292c0	pushq	%rbx
00000000000292c1	movq	%rcx, %r14
00000000000292c4	movq	%rdx, %rbx
00000000000292c7	movq	%rsi, %r15
00000000000292ca	movq	%rdi, %r12
00000000000292cd	addq	$0x8, %r12
00000000000292d1	movq	%r12, %rdi
00000000000292d4	callq	__ZN8OZSpline13isValidHandleEPv ## OZSpline::isValidHandle(void*)
00000000000292d9	testb	%al, %al
00000000000292db	je	0x292fe
00000000000292dd	movq	%r12, %rdi
00000000000292e0	movq	%r15, %rsi
00000000000292e3	xorl	%edx, %edx
00000000000292e5	movq	%r14, %rcx
00000000000292e8	movq	%rbx, %r8
00000000000292eb	movl	$0x1, %r9d
00000000000292f1	popq	%rbx
00000000000292f2	popq	%r12
00000000000292f4	popq	%r14
00000000000292f6	popq	%r15
00000000000292f8	popq	%rbp
00000000000292f9	jmp	__ZN15OZDynamicSpline22getVertexOutputHandlesEPvPdS1_RK6CMTimeb ## OZDynamicSpline::getVertexOutputHandles(void*, double*, double*, CMTime const&, bool)
00000000000292fe	xorl	%eax, %eax
0000000000029300	popq	%rbx
0000000000029301	popq	%r12
0000000000029303	popq	%r14
0000000000029305	popq	%r15
0000000000029307	popq	%rbp
0000000000029308	retq
0000000000029309	nop
